'use client';

import { useState, useEffect, useCallback } from 'react';
import { HeaderBar } from '@/components/HeaderBar';
import { WardMapView } from '@/components/WardMapView';
import { TelemetryDrawer } from '@/components/TelemetryDrawer';
import { LiveTelemetryView } from '@/components/LiveTelemetryView';
import { InspectionModal } from '@/components/InspectionModal';
import { CitizenReportModal } from '@/components/CitizenReportModal';
import { CitizenReportsView } from '@/components/CitizenReportsView';
import { SensorLogsView } from '@/components/SensorLogsView';
import { BottomNav, ActiveTab } from '@/components/BottomNav';
import { MobileFrameWrapper } from '@/components/MobileFrameWrapper';
import { useTelemetrySocket } from '@/lib/use-telemetry';
import { StreetAssetNode, UserRole, CitizenReport, SensorLogEntry, FieldInspectionCheck, CivicCategory } from '@/types/civic';
import { INITIAL_CITIZEN_REPORTS, INITIAL_SENSOR_LOGS } from '@/lib/mock-data';

export default function Home() {
  const [role, setRole] = useState<UserRole>('inspector');
  const [activeTab, setActiveTab] = useState<ActiveTab>('map');
  const [selectedNode, setSelectedNode] = useState<StreetAssetNode | null>(null);
  const [inspectingNode, setInspectingNode] = useState<StreetAssetNode | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [presetReportNode, setPresetReportNode] = useState<StreetAssetNode | null>(null);
  const [isMobileDeviceFrame, setIsMobileDeviceFrame] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persistent citizen reports state
  const [reports, setReports] = useState<CitizenReport[]>(INITIAL_CITIZEN_REPORTS);

  // Persistent sensor logs state
  const [logs, setLogs] = useState<SensorLogEntry[]>(INITIAL_SENSOR_LOGS);

  // Client-side synchronization after hydration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedReports = localStorage.getItem('sentinel_citizen_reports');
      if (savedReports) {
        try {
          const parsed = JSON.parse(savedReports);
          setTimeout(() => {
            setReports(parsed);
          }, 0);
        } catch (e) {}
      }
      const savedLogs = localStorage.getItem('sentinel_sensor_logs');
      if (savedLogs) {
        try {
          const parsed = JSON.parse(savedLogs);
          setTimeout(() => {
            setLogs(parsed);
          }, 0);
        } catch (e) {}
      }
    }
  }, []);

  // Telemetry socket hook
  const {
    nodes,
    connectionState,
    activeAlerts,
    soundEnabled,
    setSoundEnabled,
    injectFault,
    resolveNode,
    resetAllNodes,
    toggleConnection,
    setSampleRate,
  } = useTelemetrySocket();

  // Save reports & logs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sentinel_citizen_reports', JSON.stringify(reports));
      } catch (e) {}
    }
  }, [reports]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sentinel_sensor_logs', JSON.stringify(logs));
      } catch (e) {}
    }
  }, [logs]);

  // Show transient toast
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 3500);
  }, []);

  // When a fault is injected, auto-append a critical sensor log
  const handleInjectFault = useCallback(
    (faultKey: 'drainage_flood' | 'electrical_surge' | 'water_main_burst' | 'streetlight_blackout' | 'pothole_axle_strike') => {
      injectFault(faultKey);

      let targetId = 'DR-205';
      let targetName = 'Culvert Outfall 205';
      let category: CivicCategory = 'drainage';
      let metric = 'waterLevelCm';
      let val = '91.2 cm';
      let msg = 'Catastrophic stormwater overflow triggered in drainage culvert.';

      if (faultKey === 'electrical_surge') {
        targetId = 'EL-508';
        targetName = 'Feeder Pillar Junction EL-508';
        category = 'electrical';
        metric = 'transformerTempC';
        val = '98.4°C';
        msg = 'High voltage core temperature thermal runaway breach.';
      } else if (faultKey === 'water_main_burst') {
        targetId = 'WL-307';
        targetName = 'District Hydrant Monitor 307';
        category = 'water_leak';
        metric = 'acousticLeakDb';
        val = '84.0 dB';
        msg = 'Sudden high-velocity acoustic vibration indicating main fracture.';
      } else if (faultKey === 'streetlight_blackout') {
        targetId = 'SL-108';
        targetName = 'High-Mast Luminaire 108';
        category = 'streetlight';
        metric = 'voltage';
        val = '0.0 V';
        msg = 'Luminaire blackout failure on Grand Avenue overpass.';
      } else if (faultKey === 'pothole_axle_strike') {
        targetId = 'PH-406';
        targetName = 'Roughness Profiler PH-406';
        category = 'pothole';
        metric = 'vibrationRmsG';
        val = '5.60 G';
        msg = 'Severe vehicle suspension strike shock on Broadway crosswalk.';
      }

      const newLog: SensorLogEntry = {
        id: `LOG-${Math.floor(6000 + Math.random() * 4000)}`,
        timestamp: new Date().toISOString(),
        nodeId: targetId,
        nodeName: targetName,
        category,
        severity: 'critical',
        metricName: metric,
        metricValue: val,
        threshold: 'Threshold Breached',
        message: msg,
      };

      setLogs((prev) => [newLog, ...prev]);
      showToast(`⚠️ Simulated Alert: ${msg}`);
    },
    [injectFault, showToast]
  );

  // Field inspection submission handler
  const handleCompleteInspection = useCallback(
    (audit: {
      nodeId: string;
      nodeName: string;
      category: CivicCategory;
      inspectorName: string;
      inspectorBadge: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      checklist: FieldInspectionCheck[];
      findingsNotes: string;
      photoUrl?: string;
      digitalSignature: string;
      workOrderAction: string;
    }) => {
      // 1. Resolve node status
      resolveNode(audit.nodeId, 'resolved');

      // 2. Post to API route
      fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(audit),
      }).catch(() => {});

      // 3. Append to sensor audit log
      const newLog: SensorLogEntry = {
        id: `LOG-${Math.floor(7000 + Math.random() * 3000)}`,
        timestamp: new Date().toISOString(),
        nodeId: audit.nodeId,
        nodeName: audit.nodeName,
        category: audit.category,
        severity: 'info',
        metricName: 'Inspection Signed',
        metricValue: 'PASSED',
        threshold: 'Nominal Remediation',
        message: `Field audit certified by ${audit.inspectorName} (${audit.inspectorBadge}). ${audit.workOrderAction}`,
      };

      setLogs((prev) => [newLog, ...prev]);
      showToast(`✓ Field Audit for ${audit.nodeId} submitted & hazard status cleared!`);
    },
    [resolveNode, showToast]
  );

  // Citizen report submission handler
  const handleSubmitCitizenReport = useCallback(
    (reportData: {
      category: CivicCategory;
      title: string;
      address: string;
      ward: string;
      description: string;
      severity: 'minor' | 'moderate' | 'hazard';
      photoUrl: string;
      reporterName: string;
      associatedNodeId?: string;
    }) => {
      const newReport: CitizenReport = {
        id: `CIT-${Math.floor(2000 + Math.random() * 8000)}`,
        ...reportData,
        status: 'reported',
        reportedAt: new Date().toISOString(),
        upvotes: 1,
      };

      setReports((prev) => [newReport, ...prev]);

      // Post to API
      fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      }).catch(() => {});

      showToast(`✓ Issue ticket ${newReport.id} dispatched to municipal dispatch.`);
    },
    [showToast]
  );

  // Upvote report handler
  const handleUpvoteReport = useCallback((id: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r))
    );
    fetch('/api/issues', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action: 'upvote' }),
    }).catch(() => {});
  }, []);

  // Update report status handler
  const handleUpdateReportStatus = useCallback((id: string, status: CitizenReport['status']) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    fetch('/api/issues', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    }).catch(() => {});
    showToast(`Status updated to ${status.toUpperCase()}`);
  }, [showToast]);

  const criticalCount = nodes.filter((n) => n.status === 'critical').length;

  return (
    <MobileFrameWrapper isMobileDeviceFrame={isMobileDeviceFrame}>
      {/* Top Header Bar */}
      <HeaderBar
        role={role}
        onRoleChange={setRole}
        connectionState={connectionState}
        onToggleConnection={toggleConnection}
        isMobileDeviceFrame={isMobileDeviceFrame}
        onToggleDeviceFrame={() => setIsMobileDeviceFrame((prev) => !prev)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden pb-16 relative">
        {activeTab === 'map' && (
          <WardMapView
            nodes={nodes}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
            onOpenReportModal={() => {
              setPresetReportNode(null);
              setIsReportModalOpen(true);
            }}
          />
        )}

        {activeTab === 'telemetry' && (
          <LiveTelemetryView
            nodes={nodes}
            connectionState={connectionState}
            activeAlerts={activeAlerts}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled((prev) => !prev)}
            onInjectFault={handleInjectFault}
            onResetAll={resetAllNodes}
            onToggleConnection={toggleConnection}
            onSetSampleRate={setSampleRate}
            onSelectNode={(node) => {
              setSelectedNode(node);
              setActiveTab('map');
            }}
          />
        )}

        {activeTab === 'issues' && (
          <CitizenReportsView
            reports={reports}
            role={role}
            onUpvote={handleUpvoteReport}
            onUpdateStatus={handleUpdateReportStatus}
            onOpenReportModal={() => {
              setPresetReportNode(null);
              setIsReportModalOpen(true);
            }}
          />
        )}

        {activeTab === 'logs' && <SensorLogsView logs={logs} />}

        {/* Transient Notification Toast */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-slate-900/95 border border-cyan-500/50 text-white text-xs font-medium shadow-xl shadow-cyan-950/50 animate-in fade-in slide-in-from-top duration-200 text-center max-w-[90%]">
            {toastMessage}
          </div>
        )}
      </main>

      {/* Slide-Up Telemetry Drawer */}
      <TelemetryDrawer
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        role={role}
        onStartInspection={(node) => setInspectingNode(node)}
        onReportIssue={(node) => {
          setPresetReportNode(node);
          setIsReportModalOpen(true);
        }}
      />

      {/* Field Inspection Modal */}
      {inspectingNode && (
        <InspectionModal
          node={inspectingNode}
          onClose={() => setInspectingNode(null)}
          onSubmitInspection={handleCompleteInspection}
        />
      )}

      {/* Citizen Report Modal */}
      {isReportModalOpen && (
        <CitizenReportModal
          presetNode={presetReportNode}
          onClose={() => {
            setIsReportModalOpen(false);
            setPresetReportNode(null);
          }}
          onSubmitReport={handleSubmitCitizenReport}
        />
      )}

      {/* Mobile Fixed Thumb-Zone Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        role={role}
        criticalCount={criticalCount}
      />
    </MobileFrameWrapper>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { StreetAssetNode, FieldInspectionCheck, CivicCategory } from '@/types/civic';
import {
  X,
  ClipboardCheck,
  Check,
  Camera,
  PenTool,
  ShieldAlert,
  Save,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

interface InspectionModalProps {
  node: StreetAssetNode;
  onClose: () => void;
  onSubmitInspection: (inspectionData: {
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
  }) => void;
}

export function InspectionModal({
  node,
  onClose,
  onSubmitInspection,
}: InspectionModalProps) {
  const [inspectorName, setInspectorName] = useState('Marcus Vance');
  const [inspectorBadge, setInspectorBadge] = useState('INSP-409');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>(
    node.status === 'critical' ? 'critical' : node.status === 'warning' ? 'high' : 'low'
  );
  const [findingsNotes, setFindingsNotes] = useState(
    node.activeAlertDescription
      ? `Investigated alert: ${node.activeAlertDescription}. Physical inspection conducted on site.`
      : 'On-site physical diagnostics conducted.'
  );
  const [workOrderAction, setWorkOrderAction] = useState('Work order dispatched for final repair.');
  const [photoUrl, setPhotoUrl] = useState<string>('https://picsum.photos/seed/street_inspection/600/400');
  const [signatureText, setSignatureText] = useState('Marcus Vance, Senior Municipal Inspector');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default checklist based on category
  const getInitialChecklist = (): FieldInspectionCheck[] => {
    switch (node.category) {
      case 'streetlight':
        return [
          { id: 'c1', label: 'Photocell sensor optical clarity & wiring', passed: true },
          { id: 'c2', label: 'Grounding rod impedance (< 5 Ohms)', passed: true, measurement: '2.4 Ohms' },
          { id: 'c3', label: 'Luminaire bracket & arm physical stability', passed: true },
          { id: 'c4', label: 'Line voltage stability check', passed: node.status !== 'critical', measurement: `${node.metrics.voltage || 230}V AC` },
        ];
      case 'drainage':
        return [
          { id: 'd1', label: 'Grate debris intake clearance', passed: node.status !== 'critical' },
          { id: 'd2', label: 'Ultrasonic depth gauge calibration', passed: true, measurement: `${node.metrics.waterLevelCm || 20}cm` },
          { id: 'd3', label: 'Downstream flap valve free movement', passed: true },
          { id: 'd4', label: 'Structural concrete erosion inspection', passed: true },
        ];
      case 'water_leak':
        return [
          { id: 'w1', label: 'Acoustic leak probe listening check', passed: node.status !== 'critical', measurement: `${node.metrics.acousticLeakDb || 22} dB` },
          { id: 'w2', label: 'Hydrant coupling seal & pressure test', passed: true, measurement: `${node.metrics.waterPressurePsi || 60} PSI` },
          { id: 'w3', label: 'Pavement sinkhole ground integrity', passed: true },
          { id: 'w4', label: 'Curb valve isolation readiness', passed: true },
        ];
      case 'pothole':
        return [
          { id: 'p1', label: 'Cavity depth measurement', passed: node.status !== 'critical', measurement: `${node.metrics.potholeDepthMm || 25} mm` },
          { id: 'p2', label: 'Edge crumble & asphalt binder degradation', passed: node.status !== 'critical' },
          { id: 'p3', label: 'Sub-base soil compaction stability', passed: true },
          { id: 'p4', label: 'Safety barrier & cone placement', passed: true },
        ];
      case 'electrical':
        return [
          { id: 'e1', label: 'Transformer core temperature verification', passed: node.status !== 'critical', measurement: `${node.metrics.transformerTempC || 50}°C` },
          { id: 'e2', label: 'Thermal IR inspection of bushings & taps', passed: true },
          { id: 'e3', label: 'Lightning arrester integrity check', passed: true },
          { id: 'e4', label: 'Enclosure lock & safety grounding braid', passed: true },
        ];
    }
  };

  const [checklist, setChecklist] = useState<FieldInspectionCheck[]>(getInitialChecklist);

  const toggleCheck = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, passed: !item.passed } : item))
    );
  };

  const updateMeasurement = (id: string, val: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, measurement: val } : item))
    );
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitInspection({
        nodeId: node.id,
        nodeName: node.name,
        category: node.category,
        inspectorName,
        inspectorBadge,
        severity,
        checklist,
        findingsNotes,
        photoUrl,
        digitalSignature: signatureText,
        workOrderAction,
      });
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/70 backdrop-blur-xs" />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-[#111726] border border-slate-800 rounded-3xl shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="text-cyan-400 font-bold">{node.id}</span>
                <span>·</span>
                <span className="capitalize">{node.category.replace('_', ' ')}</span>
              </div>
              <h2 className="text-base font-bold text-white">{node.name} Field Audit</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Inspector Credentials */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Inspector Name</label>
              <input
                type="text"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                className="w-full min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Badge ID</label>
              <input
                type="text"
                value={inspectorBadge}
                onChange={(e) => setInspectorBadge(e.target.value)}
                className="w-full min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* Severity Classification */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Field Hazard Severity Rating
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['low', 'medium', 'high', 'critical'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSeverity(lvl)}
                  className={`min-h-[40px] py-1.5 px-2 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all ${
                    severity === lvl
                      ? lvl === 'critical'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                        : lvl === 'high'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                        : lvl === 'medium'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Multi-point Verification Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Multi-Point Safety Checklist
              </label>
              <span className="text-[11px] font-mono text-cyan-400">
                {checklist.filter((c) => c.passed).length}/{checklist.length} Passed
              </span>
            </div>

            <div className="space-y-2">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-start justify-between gap-3"
                >
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => toggleCheck(item.id)}
                      className="text-left flex items-start gap-2.5 group"
                    >
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center border mt-0.5 transition-colors ${
                          item.passed
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                            : 'bg-rose-500/20 border-rose-500 text-rose-400'
                        }`}
                      >
                        {item.passed ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-xs font-medium text-slate-200 group-hover:text-white transition-colors">
                        {item.label}
                      </span>
                    </button>

                    {item.measurement !== undefined && (
                      <div className="mt-2 pl-7.5">
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider mr-2">
                          Measured Reading:
                        </label>
                        <input
                          type="text"
                          value={item.measurement}
                          onChange={(e) => updateMeasurement(item.id, e.target.value)}
                          className="px-2 py-0.5 text-xs font-mono bg-slate-950 border border-slate-800 rounded text-cyan-300 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Findings Scratchpad */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Field Findings & Diagnosis Notes
            </label>
            <textarea
              rows={3}
              value={findingsNotes}
              onChange={(e) => setFindingsNotes(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 leading-relaxed"
              placeholder="Detail observations, root cause, and immediate actions taken..."
            />
          </div>

          {/* Work Order Dispatch */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Follow-Up Remediation Work Order
            </label>
            <input
              type="text"
              value={workOrderAction}
              onChange={(e) => setWorkOrderAction(e.target.value)}
              className="w-full min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
              placeholder="e.g. Dispatched asphalt patching unit within 2 hours..."
            />
          </div>

          {/* Photo Evidence & Camera Snapshot */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center justify-between">
              <span>Photo Evidence Verification</span>
              <span className="text-[11px] text-emerald-400">Timestamped GPS Exif</span>
            </label>
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 h-32 flex items-center justify-center group">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt="Inspection site proof"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-slate-500 text-xs flex flex-col items-center gap-1">
                  <Camera className="w-6 h-6 text-slate-400" />
                  <span>Attach Field Camera Shot</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <button
                  type="button"
                  onClick={() => setPhotoUrl(`https://picsum.photos/seed/inspection_${Date.now()}/600/400`)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900/90 text-white text-xs border border-slate-700 flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Capture New Snapshot</span>
                </button>
              </div>
            </div>
          </div>

          {/* Digital Signature */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5 text-cyan-400" />
              <span>Certified Digital Inspector Sign-Off</span>
            </label>
            <input
              type="text"
              value={signatureText}
              onChange={(e) => setSignatureText(e.target.value)}
              className="w-full min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 rounded-xl bg-slate-900 text-slate-300 text-xs font-medium hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="min-h-[44px] px-5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/20 flex items-center gap-2 active:scale-98 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Recording Audit...' : 'Submit & Clear Hazard Status'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

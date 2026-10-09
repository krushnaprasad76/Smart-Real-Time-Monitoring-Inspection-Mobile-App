'use client';

import { StreetAssetNode, UserRole } from '@/types/civic';
import {
  X,
  ClipboardCheck,
  AlertTriangle,
  Lightbulb,
  Droplets,
  Gauge,
  Zap,
  Activity,
  MapPin,
  Clock,
  ShieldCheck,
  Flame,
  ArrowUpRight,
} from 'lucide-react';

interface TelemetryDrawerProps {
  node: StreetAssetNode | null;
  onClose: () => void;
  role: UserRole;
  onStartInspection: (node: StreetAssetNode) => void;
  onReportIssue: (node: StreetAssetNode) => void;
}

export function TelemetryDrawer({
  node,
  onClose,
  role,
  onStartInspection,
  onReportIssue,
}: TelemetryDrawerProps) {
  if (!node) return null;

  const isCritical = node.status === 'critical';
  const isWarning = node.status === 'warning';

  // Format category name
  const getCategoryTitle = (cat: string) => {
    switch (cat) {
      case 'streetlight':
        return 'Smart Streetlight Luminaire';
      case 'drainage':
        return 'Storm Drainage & Basin Monitor';
      case 'water_leak':
        return 'Acoustic Water Main Sentry';
      case 'pothole':
        return 'Road Surface & Pothole Profiler';
      case 'electrical':
        return 'Distribution Substation Transformer';
      default:
        return 'Civic Sensor Node';
    }
  };

  // Sparkline data calculation
  const historyPoints = node.recentHistory || [];
  const minVal = historyPoints.length > 0 ? Math.min(...historyPoints.map((p) => p.primaryValue)) : 0;
  const maxVal = historyPoints.length > 0 ? Math.max(...historyPoints.map((p) => p.primaryValue)) : 100;
  const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

  const sparklinePolyline = historyPoints
    .map((p, idx) => {
      const x = (idx / (Math.max(1, historyPoints.length - 1))) * 100;
      const y = 40 - ((p.primaryValue - minVal) / range) * 32;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
      {/* Semi-transparent backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs pointer-events-auto transition-opacity"
      />

      {/* Slide-Up Sheet Container */}
      <div className="relative w-full max-w-2xl bg-[#111726] border-t border-slate-800 rounded-t-3xl shadow-2xl pointer-events-auto max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Grab Handle */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 bg-slate-700/80 rounded-full" />
        </div>

        {/* Header Strip */}
        <div className="px-5 py-3 border-b border-slate-800/80 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-1">
              <span className="font-semibold text-cyan-400">{node.id}</span>
              <span>·</span>
              <span>{node.ward}</span>
              <span>·</span>
              <span className="capitalize">{node.status}</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">{node.name}</h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{node.address}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Close telemetry drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Sheet Body */}
        <div className="px-5 py-4 overflow-y-auto space-y-4">
          {/* Active Alert Banner if Critical or Warning */}
          {(isCritical || isWarning) && node.activeAlertDescription && (
            <div
              className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                isCritical
                  ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                  : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
              }`}
            >
              <AlertTriangle
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  isCritical ? 'text-rose-400' : 'text-amber-400'
                }`}
              />
              <div className="text-xs">
                <div className="font-semibold tracking-wide uppercase text-[11px] mb-0.5">
                  {isCritical ? 'Emergency Telemetry Anomaly' : 'Cautionary Threshold Warning'}
                </div>
                <div className="leading-relaxed">{node.activeAlertDescription}</div>
              </div>
            </div>
          )}

          {/* Live Streaming Sparkline */}
          <div className="bg-[#162035]/80 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-slate-200">
                  Real-Time Socket Stream (1Hz)
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                STREAMING
              </span>
            </div>

            {/* SVG Sparkline Graph */}
            <div className="h-16 w-full relative">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 45">
                {/* Baseline Guide Grid Lines */}
                <line x1="0" y1="8" x2="100" y2="8" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,2" />
                <line x1="0" y1="24" x2="100" y2="24" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,2" />
                <line x1="0" y1="40" x2="100" y2="40" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,2" />

                {/* Polyline */}
                {historyPoints.length > 1 && (
                  <polyline
                    fill="none"
                    stroke={isCritical ? '#f43f5e' : isWarning ? '#f59e0b' : '#06b6d4'}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={sparklinePolyline}
                  />
                )}
              </svg>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-1">
              <span>-15s window</span>
              <span>
                Current:{' '}
                <strong className="text-white">
                  {historyPoints.length > 0
                    ? historyPoints[historyPoints.length - 1].primaryValue
                    : 'Syncing...'}
                </strong>
              </span>
            </div>
          </div>

          {/* Metric Telemetry Cards */}
          <div>
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              Diagnostic Sensor Readings
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {node.category === 'streetlight' && (
                <>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Line Voltage</span>
                    <span className="text-xl font-bold font-mono tabular-nums text-white">
                      {node.metrics.voltage ?? 230}
                      <span className="text-xs text-slate-400 ml-1">V AC</span>
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Nominal: 220-240V</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Photocell Lux</span>
                    <span className="text-xl font-bold font-mono tabular-nums text-white">
                      {node.metrics.lux ?? 0}
                      <span className="text-xs text-slate-400 ml-1">lx</span>
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Threshold: &lt; 20 lx</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Current Draw</span>
                    <span className="text-xl font-bold font-mono tabular-nums text-white">
                      {node.metrics.currentDrawAmps ?? 1.8}
                      <span className="text-xs text-slate-400 ml-1">A</span>
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Runtime Hours</span>
                    <span className="text-xl font-bold font-mono tabular-nums text-white">
                      {node.metrics.lampHours ? String(node.metrics.lampHours) : '8400'}
                      <span className="text-xs text-slate-400 ml-1">hrs</span>
                    </span>
                  </div>
                </>
              )}

              {node.category === 'drainage' && (
                <>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Water Level</span>
                    <span className={`text-xl font-bold font-mono tabular-nums ${
                      (node.metrics.waterLevelCm ?? 0) > 80 ? 'text-rose-400' : 'text-cyan-400'
                    }`}>
                      {node.metrics.waterLevelCm ?? 22}
                      <span className="text-xs text-slate-400 ml-1">cm</span>
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Max Safe: 90 cm</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Flow Discharge</span>
                    <span className="text-xl font-bold font-mono tabular-nums text-white">
                      {node.metrics.flowRateLpm ?? 45}
                      <span className="text-xs text-slate-400 ml-1">L/min</span>
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Silt Sediment Depth</span>
                    <span className="text-xl font-bold font-mono tabular-nums text-white">
                      {node.metrics.siltLevelPct ?? 15}%
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Flap blockage risk</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Capacity Saturation</span>
                    <span className="text-xl font-bold font-mono tabular-nums text-white">
                      {Math.round(((node.metrics.waterLevelCm || 20) / (node.metrics.waterThresholdMaxCm || 90)) * 100)}%
                    </span>
                  </div>
                </>
              )}

              {node.category === 'water_leak' && (
                <>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Acoustic Leak Intensity</span>
                    <span className={`text-xl font-bold font-mono tabular-nums ${
                      (node.metrics.acousticLeakDb ?? 0) > 60 ? 'text-rose-400' : 'text-blue-400'
                    }`}>
                      {node.metrics.acousticLeakDb ?? 22}
                      <span className="text-xs text-slate-400 ml-1">dB</span>
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Threshold: 45 dB</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Line Pressure</span>
                    <span className="text-xl font-bold font-mono tabular-nums text-white">
                      {node.metrics.waterPressurePsi ?? 58}
                      <span className="text-xs text-slate-400 ml-1">PSI</span>
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Standard: 50-70 PSI</span>
                  </div>
                </>
              )}

              {node.category === 'pothole' && (
                <>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Vibration Shock RMS</span>
                    <span className={`text-xl font-bold font-mono tabular-nums ${
                      (node.metrics.vibrationRmsG ?? 0) > 3 ? 'text-rose-400' : 'text-orange-400'
                    }`}>
                      {node.metrics.vibrationRmsG ?? 1.2}
                      <span className="text-xs text-slate-400 ml-1">G</span>
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Safe: &lt; 2.0 G</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Cavity Depth</span>
                    <span className="text-xl font-bold font-mono tabular-nums text-white">
                      {node.metrics.potholeDepthMm ?? 25}
                      <span className="text-xs text-slate-400 ml-1">mm</span>
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Hazards: &gt; 50mm</span>
                  </div>
                </>
              )}

              {node.category === 'electrical' && (
                <>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Transformer Temp</span>
                    <span className={`text-xl font-bold font-mono tabular-nums ${
                      (node.metrics.transformerTempC ?? 0) > 80 ? 'text-rose-400' : 'text-purple-400'
                    }`}>
                      {node.metrics.transformerTempC ?? 52}
                      <span className="text-xs text-slate-400 ml-1">°C</span>
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Max: 80.0°C</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[11px] text-slate-400 block">Grid Phase Load</span>
                    <span className="text-xl font-bold font-mono tabular-nums text-white">
                      {node.metrics.gridLoadPct ?? 65}%
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Trip limit: 95%</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Operational Metadata */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1.5 text-slate-400">
            <div className="flex justify-between">
              <span>Assigned Field Crew:</span>
              <strong className="text-slate-200">{node.assignedCrew}</strong>
            </div>
            <div className="flex justify-between">
              <span>Last Certified Audit:</span>
              <strong className="text-slate-200">{node.lastInspected}</strong>
            </div>
            <div className="flex justify-between">
              <span>GPS Coordinates:</span>
              <strong className="text-slate-200 font-mono">
                {node.coordinates.lat.toFixed(4)}, {node.coordinates.lng.toFixed(4)}
              </strong>
            </div>
          </div>
        </div>

        {/* Bottom Action Footer with 44px+ Hitbox Touch Buttons */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
          {role === 'inspector' ? (
            <button
              onClick={() => {
                onStartInspection(node);
                onClose();
              }}
              className="flex-1 min-h-[48px] rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 active:scale-[0.98] transition-all"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Conduct Field Inspection</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onReportIssue(node);
                onClose();
              }}
              className="flex-1 min-h-[48px] rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Report Issue with this Node</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="min-h-[48px] px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-medium text-xs hover:bg-slate-800 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

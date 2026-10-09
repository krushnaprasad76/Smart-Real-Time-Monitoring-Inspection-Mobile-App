'use client';

import { useState } from 'react';
import { StreetAssetNode, SocketConnectionState, CivicCategory } from '@/types/civic';
import {
  Radio,
  Zap,
  Droplets,
  Lightbulb,
  AlertTriangle,
  Gauge,
  Flame,
  RotateCcw,
  Volume2,
  VolumeX,
  Activity,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface LiveTelemetryViewProps {
  nodes: StreetAssetNode[];
  connectionState: SocketConnectionState;
  activeAlerts: string[];
  soundEnabled: boolean;
  onToggleSound: () => void;
  onInjectFault: (faultKey: 'drainage_flood' | 'electrical_surge' | 'water_main_burst' | 'streetlight_blackout' | 'pothole_axle_strike') => void;
  onResetAll: () => void;
  onToggleConnection: () => void;
  onSetSampleRate: (hz: number) => void;
  onSelectNode: (node: StreetAssetNode) => void;
}

export function LiveTelemetryView({
  nodes,
  connectionState,
  activeAlerts,
  soundEnabled,
  onToggleSound,
  onInjectFault,
  onResetAll,
  onToggleConnection,
  onSetSampleRate,
  onSelectNode,
}: LiveTelemetryViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<CivicCategory | 'all'>('all');

  const filteredNodes = selectedCategory === 'all'
    ? nodes
    : nodes.filter((n) => n.category === selectedCategory);

  const criticalCount = nodes.filter((n) => n.status === 'critical').length;
  const warningCount = nodes.filter((n) => n.status === 'warning').length;

  return (
    <div className="flex flex-col h-full bg-[#0B0F19] text-slate-100 overflow-y-auto p-4 space-y-4">
      {/* Real-time Socket Diagnostic Bar */}
      <div className="p-4 rounded-2xl bg-[#131B2E] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${
              connectionState.status === 'connected' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
            }`}>
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                Simulated IoT Telemetry Socket
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                  connectionState.status === 'connected'
                    ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-400'
                    : 'bg-rose-950/60 border-rose-700/60 text-rose-400'
                }`}>
                  {connectionState.status.toUpperCase()}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono" suppressHydrationWarning>
                Latency: {connectionState.latencyMs}ms · Packets: {String(connectionState.packetCount)} · Heartbeat: active
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleConnection}
              className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                connectionState.status === 'connected'
                  ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                  : 'bg-emerald-600 border-emerald-500 text-white font-semibold'
              }`}
            >
              {connectionState.status === 'connected' ? 'Simulate Disconnect' : 'Reconnect Socket'}
            </button>
          </div>
        </div>

        {/* Sampling Frequency Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
          <span className="text-slate-400">Stream Sample Rate:</span>
          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            {[0.5, 1, 2].map((hz) => (
              <button
                key={hz}
                onClick={() => onSetSampleRate(hz)}
                className={`min-h-[32px] px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                  connectionState.sampleRateHz === hz
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {hz} Hz
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fault Injection Studio (Interactive Anomaly Generator) */}
      <div className="p-4 rounded-2xl bg-gradient-to-b from-[#161f33] to-[#121929] border border-cyan-900/40 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Interactive Civic Fault Injection Studio
            </h3>
          </div>
          <button
            onClick={onResetAll}
            className="text-xs font-medium text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Baseline</span>
          </button>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Trigger real-time municipal crises to verify telemetry anomaly detection, tripwires, and alert triggers across city infrastructure:
        </p>

        {/* 1-Tap Trigger Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => onInjectFault('drainage_flood')}
            className="min-h-[42px] px-3 py-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/50 text-cyan-200 text-xs font-medium flex items-center gap-2.5 text-left transition-colors active:scale-98"
          >
            <Droplets className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <div className="font-semibold text-white">Drainage Flash Flood</div>
              <div className="text-[10px] text-cyan-400/80">Retention Sump &gt; 90cm overflow</div>
            </div>
          </button>

          <button
            onClick={() => onInjectFault('electrical_surge')}
            className="min-h-[42px] px-3 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/50 text-purple-200 text-xs font-medium flex items-center gap-2.5 text-left transition-colors active:scale-98"
          >
            <Zap className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <div className="font-semibold text-white">Transformer Surge</div>
              <div className="text-[10px] text-purple-400/80">Core thermal runaway &gt; 96°C</div>
            </div>
          </button>

          <button
            onClick={() => onInjectFault('water_main_burst')}
            className="min-h-[42px] px-3 py-2 rounded-xl bg-blue-950/40 hover:bg-blue-900/50 border border-blue-800/50 text-blue-200 text-xs font-medium flex items-center gap-2.5 text-left transition-colors active:scale-98"
          >
            <Gauge className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <div className="font-semibold text-white">Water Main Rupture</div>
              <div className="text-[10px] text-blue-400/80">Acoustic leak signature 82dB spike</div>
            </div>
          </button>

          <button
            onClick={() => onInjectFault('pothole_axle_strike')}
            className="min-h-[42px] px-3 py-2 rounded-xl bg-orange-950/40 hover:bg-orange-900/50 border border-orange-800/50 text-orange-200 text-xs font-medium flex items-center gap-2.5 text-left transition-colors active:scale-98"
          >
            <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />
            <div>
              <div className="font-semibold text-white">Road Axle Impact</div>
              <div className="text-[10px] text-orange-400/80">5.2G vehicle vertical shock</div>
            </div>
          </button>
        </div>
      </div>

      {/* Live Alarm Feed Banner */}
      {activeAlerts.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-rose-950/50 border border-rose-800/60 space-y-2">
          <div className="flex items-center gap-2 text-rose-300 text-xs font-bold uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Active Incident Tripwires ({activeAlerts.length})</span>
          </div>
          <div className="space-y-1.5">
            {activeAlerts.map((alert, idx) => (
              <div key={idx} className="text-xs text-rose-200/90 pl-3 border-l-2 border-rose-500 py-0.5">
                {alert}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Node Feeds & Real-Time Telemetry Cards */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Live Asset Node Telemetry Stream ({filteredNodes.length})
          </h3>
          <div className="text-xs text-slate-400 font-mono">
            Critical: <span className="text-rose-400 font-bold">{criticalCount}</span> · Warning: <span className="text-amber-400 font-bold">{warningCount}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredNodes.map((node) => {
            const isCrit = node.status === 'critical';
            const isWarn = node.status === 'warning';

            return (
              <div
                key={node.id}
                onClick={() => onSelectNode(node)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer group hover:border-slate-700 ${
                  isCrit
                    ? 'bg-[#1a121d] border-rose-800/50 shadow-sm shadow-rose-950/50'
                    : isWarn
                    ? 'bg-[#1a1914] border-amber-800/50'
                    : 'bg-[#131B2E] border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-0.5">
                      <span className="font-bold text-cyan-400">{node.id}</span>
                      <span>·</span>
                      <span className="capitalize">{node.category.replace('_', ' ')}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {node.name}
                    </h4>
                    <span className="text-xs text-slate-400 block truncate">{node.address}</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${
                      isCrit
                        ? 'bg-rose-950/70 border-rose-700/60 text-rose-300'
                        : isWarn
                        ? 'bg-amber-950/70 border-amber-700/60 text-amber-300'
                        : 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300'
                    }`}
                  >
                    {node.status.toUpperCase()}
                  </span>
                </div>

                {/* Live Values Readout */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  {node.category === 'streetlight' && (
                    <>
                      <span className="text-slate-400">
                        Voltage: <strong className="text-white tabular-nums">{node.metrics.voltage}V</strong>
                      </span>
                      <span className="text-slate-400">
                        Lux: <strong className="text-white tabular-nums">{node.metrics.lux} lx</strong>
                      </span>
                    </>
                  )}
                  {node.category === 'drainage' && (
                    <>
                      <span className="text-slate-400">
                        Water Level: <strong className={`tabular-nums ${isCrit ? 'text-rose-400' : 'text-cyan-400'}`}>{node.metrics.waterLevelCm} cm</strong>
                      </span>
                      <span className="text-slate-400">
                        Flow: <strong className="text-white tabular-nums">{node.metrics.flowRateLpm} L/m</strong>
                      </span>
                    </>
                  )}
                  {node.category === 'water_leak' && (
                    <>
                      <span className="text-slate-400">
                        Acoustic dB: <strong className={`tabular-nums ${isCrit ? 'text-rose-400' : 'text-blue-400'}`}>{node.metrics.acousticLeakDb} dB</strong>
                      </span>
                      <span className="text-slate-400">
                        Pressure: <strong className="text-white tabular-nums">{node.metrics.waterPressurePsi} PSI</strong>
                      </span>
                    </>
                  )}
                  {node.category === 'pothole' && (
                    <>
                      <span className="text-slate-400">
                        Vibration: <strong className={`tabular-nums ${isCrit ? 'text-rose-400' : 'text-orange-400'}`}>{node.metrics.vibrationRmsG} G</strong>
                      </span>
                      <span className="text-slate-400">
                        Depth: <strong className="text-white tabular-nums">{node.metrics.potholeDepthMm} mm</strong>
                      </span>
                    </>
                  )}
                  {node.category === 'electrical' && (
                    <>
                      <span className="text-slate-400">
                        Core Temp: <strong className={`tabular-nums ${isCrit ? 'text-rose-400' : 'text-purple-400'}`}>{node.metrics.transformerTempC}°C</strong>
                      </span>
                      <span className="text-slate-400">
                        Load: <strong className="text-white tabular-nums">{node.metrics.gridLoadPct}%</strong>
                      </span>
                    </>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-end text-[11px] text-cyan-400 font-medium group-hover:translate-x-0.5 transition-transform">
                  <span>View Telemetry & Audit</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

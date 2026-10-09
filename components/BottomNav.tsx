'use client';

import { MapPin, Activity, ClipboardCheck, FileText, AlertTriangle } from 'lucide-react';
import { UserRole } from '@/types/civic';

export type ActiveTab = 'map' | 'telemetry' | 'issues' | 'logs';

interface BottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  role: UserRole;
  criticalCount: number;
}

export function BottomNav({
  activeTab,
  onSelectTab,
  role,
  criticalCount,
}: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B0F19]/95 backdrop-blur-md border-t border-slate-800/80 px-2 pb-safe">
      <div className="grid grid-cols-4 items-center h-16 max-w-lg mx-auto">
        {/* Tab 1: Map */}
        <button
          onClick={() => onSelectTab('map')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-colors relative ${
            activeTab === 'map' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Ward Map"
        >
          <MapPin className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] tracking-tight">Ward Map</span>
          {activeTab === 'map' && (
            <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-cyan-400" />
          )}
        </button>

        {/* Tab 2: Live Telemetry */}
        <button
          onClick={() => onSelectTab('telemetry')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-colors relative ${
            activeTab === 'telemetry' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Live Telemetry"
        >
          <div className="relative">
            <Activity className="w-5 h-5 mb-0.5" />
            {criticalCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 text-[9px] font-bold bg-rose-500 text-white rounded-full">
                {criticalCount}
              </span>
            )}
          </div>
          <span className="text-[11px] tracking-tight">Telemetry</span>
          {activeTab === 'telemetry' && (
            <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-cyan-400" />
          )}
        </button>

        {/* Tab 3: Inspect / Citizen Issues */}
        <button
          onClick={() => onSelectTab('issues')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-colors relative ${
            activeTab === 'issues'
              ? role === 'inspector'
                ? 'text-cyan-400 font-semibold'
                : 'text-amber-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label={role === 'inspector' ? 'Field Audits' : 'Community Tickets'}
        >
          {role === 'inspector' ? (
            <ClipboardCheck className="w-5 h-5 mb-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 mb-0.5" />
          )}
          <span className="text-[11px] tracking-tight truncate max-w-[80px]">
            {role === 'inspector' ? 'Audits' : 'Issues'}
          </span>
          {activeTab === 'issues' && (
            <span
              className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                role === 'inspector' ? 'bg-cyan-400' : 'bg-amber-400'
              }`}
            />
          )}
        </button>

        {/* Tab 4: Logs */}
        <button
          onClick={() => onSelectTab('logs')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-colors relative ${
            activeTab === 'logs' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-label="Sensor Logs"
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] tracking-tight">Sensor Logs</span>
          {activeTab === 'logs' && (
            <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-cyan-400" />
          )}
        </button>
      </div>
    </nav>
  );
}

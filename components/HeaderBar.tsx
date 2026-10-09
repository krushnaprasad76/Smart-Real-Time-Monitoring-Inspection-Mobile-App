'use client';

import { Shield, Radio, Smartphone, Monitor, UserCheck, Users, Volume2, VolumeX } from 'lucide-react';
import { UserRole, SocketConnectionState } from '@/types/civic';

interface HeaderBarProps {
  role: UserRole;
  onRoleChange: (newRole: UserRole) => void;
  connectionState: SocketConnectionState;
  onToggleConnection: () => void;
  isMobileDeviceFrame: boolean;
  onToggleDeviceFrame: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export function HeaderBar({
  role,
  onRoleChange,
  connectionState,
  onToggleConnection,
  isMobileDeviceFrame,
  onToggleDeviceFrame,
  soundEnabled,
  onToggleSound,
}: HeaderBarProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#0B0F19]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between gap-4">
      {/* Zone 1: Single Element Brand Wordmark */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-sm shadow-cyan-500/20">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
            StreetSentinel
          </span>
          <span className="hidden sm:inline-block ml-2 text-xs text-slate-400 font-mono">
            IoT Inspection OS
          </span>
        </div>
      </div>

      {/* Zone 2: Role Switcher & Viewport Mode */}
      <div className="flex items-center gap-2">
        {/* Role Toggle */}
        <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => onRoleChange('inspector')}
            className={`min-h-[36px] px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
              role === 'inspector'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Switch to Municipal Field Inspector mode"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Field Crew</span>
          </button>
          <button
            onClick={() => onRoleChange('citizen')}
            className={`min-h-[36px] px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
              role === 'citizen'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Switch to Citizen Reporter mode"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Citizen</span>
          </button>
        </div>

        {/* Audio Mute/Unmute */}
        <button
          onClick={onToggleSound}
          className={`min-h-[36px] min-w-[36px] p-2 rounded-lg border transition-colors flex items-center justify-center ${
            soundEnabled
              ? 'bg-cyan-950/40 border-cyan-700/60 text-cyan-400'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-300'
          }`}
          title={soundEnabled ? 'Mute alert audio' : 'Enable alert sound'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Device Frame Toggle (Hidden on small viewports) */}
        <button
          onClick={onToggleDeviceFrame}
          className="hidden md:flex min-h-[36px] items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg transition-colors"
          title="Toggle Mobile Simulator vs Fluid Screen"
        >
          {isMobileDeviceFrame ? (
            <>
              <Monitor className="w-3.5 h-3.5 text-cyan-400" />
              <span>Fluid Layout</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mobile Phone Frame</span>
            </>
          )}
        </button>
      </div>

      {/* Zone 3: Connection State Action */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleConnection}
          className={`min-h-[36px] px-2.5 py-1 text-xs font-mono font-medium rounded-lg border flex items-center gap-2 transition-all ${
            connectionState.status === 'connected'
              ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/50'
              : 'bg-rose-950/40 border-rose-700/60 text-rose-300 hover:bg-rose-900/50'
          }`}
          title={connectionState.status === 'connected' ? 'Click to simulate field offline mode' : 'Click to reconnect live socket'}
        >
          <Radio
            className={`w-3.5 h-3.5 ${
              connectionState.status === 'connected' ? 'text-emerald-400 animate-pulse' : 'text-rose-400'
            }`}
          />
          <span className="hidden sm:inline">
            {connectionState.status === 'connected' ? 'LIVE 1Hz' : 'OFFLINE'}
          </span>
          <span className="sm:hidden">
            {connectionState.status === 'connected' ? 'LIVE' : 'OFF'}
          </span>
        </button>
      </div>
    </header>
  );
}

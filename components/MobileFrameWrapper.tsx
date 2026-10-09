'use client';

import { ReactNode } from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface MobileFrameWrapperProps {
  isMobileDeviceFrame: boolean;
  children: ReactNode;
}

export function MobileFrameWrapper({
  isMobileDeviceFrame,
  children,
}: MobileFrameWrapperProps) {
  if (!isMobileDeviceFrame) {
    // Fluid responsive layout on full screen
    return <div className="min-h-screen flex flex-col bg-[#0B0F19]">{children}</div>;
  }

  // Device Frame View on larger screens
  return (
    <div className="min-h-screen bg-slate-950 py-4 sm:py-8 px-2 flex items-center justify-center">
      {/* Phone chassis */}
      <div className="relative w-full max-w-[430px] h-[890px] max-h-[96vh] bg-[#0B0F19] rounded-[48px] border-[10px] border-slate-800/90 shadow-2xl shadow-cyan-950/40 flex flex-col overflow-hidden ring-1 ring-slate-700/50">
        {/* Dynamic Island / Speaker Pill */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 w-24 h-5 bg-black rounded-full flex items-center justify-end pr-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700/60" />
        </div>

        {/* Mobile Status Bar */}
        <div className="pt-2 px-6 pb-1 flex items-center justify-between text-[11px] text-slate-400 font-mono select-none z-40 bg-[#0B0F19]">
          <span>09:41</span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Inner Content Area */}
        <div className="relative flex-1 flex flex-col overflow-hidden">
          {children}
        </div>

        {/* Home Indicator Bar */}
        <div className="py-1.5 flex justify-center bg-[#0B0F19] z-40">
          <div className="w-32 h-1 bg-slate-600/60 rounded-full" />
        </div>
      </div>
    </div>
  );
}

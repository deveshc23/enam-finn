"use client";

import React, { useState } from "react";
import { Smartphone, Monitor } from "lucide-react";

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-start antialiased selection:bg-emerald-500 selection:text-zinc-950">
      {/* Desktop Mode Toggle Bar (hidden on small screens) */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-5xl px-6 py-2.5 text-xs text-zinc-400 border-b border-zinc-800/80 bg-zinc-950/80 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-semibold text-zinc-200">FINN: Financial Investment Agent</span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-500 font-mono">ENAM AI Engineer Assessment Prototype</span>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
          <button
            onClick={() => setIsPhoneFrame(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              isPhoneFrame
                ? "bg-emerald-500 text-zinc-950 font-bold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Device (Recommended)</span>
          </button>
          <button
            onClick={() => setIsPhoneFrame(false)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              !isPhoneFrame
                ? "bg-emerald-500 text-zinc-950 font-bold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Wide Responsive</span>
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div
        className={`w-full transition-all duration-300 ${
          isPhoneFrame
            ? "max-w-[430px] my-0 sm:my-6 sm:border sm:border-zinc-800 sm:rounded-[36px] sm:shadow-2xl sm:shadow-black sm:overflow-hidden bg-zinc-950"
            : "max-w-3xl my-0 sm:my-4 bg-zinc-950"
        }`}
      >
        {/* Subtle iPhone Dynamic Island Notch on Desktop Phone Mode */}
        {isPhoneFrame && (
          <div className="hidden sm:flex justify-center pt-2.5 bg-zinc-950">
            <div className="w-24 h-4 bg-zinc-900 rounded-full border border-zinc-800/80 flex items-center justify-end px-2">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-800"></span>
            </div>
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

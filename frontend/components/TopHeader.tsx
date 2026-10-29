"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";

interface TopHeaderProps {
  windowDays: number;
  onWindowChange: (days: number) => void;
  activeModeLabel: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  windowDays,
  onWindowChange,
  activeModeLabel,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-white font-black text-sm tracking-tighter">FN</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold text-white tracking-tight">FINN</h1>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-semibold px-1.5 py-0.5 rounded capitalize">
                {activeModeLabel}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              High-Conviction Intelligence
            </p>
          </div>
        </div>

        {/* Window Selector for Push Digest */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 p-0.5 rounded-lg text-[11px]">
          {[1, 3, 7].map((days) => (
            <button
              key={days}
              onClick={() => onWindowChange(days)}
              className={`px-2 py-1 rounded-md transition-all ${
                windowDays === days
                  ? "bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {days === 1 ? "24h" : `${days}D`}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

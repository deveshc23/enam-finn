"use client";

import React from "react";
import { Newspaper, BellRing, Compass, Briefcase } from "lucide-react";

export type NavTab = "digest" | "alerts" | "research" | "portfolio";

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  alertCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  alertCount = 0,
}) => {
  const tabs = [
    { id: "digest" as NavTab, label: "Digest", icon: Newspaper, tag: "Push" },
    { id: "alerts" as NavTab, label: "Alerts", icon: BellRing, tag: "Push", badge: alertCount },
    { id: "research" as NavTab, label: "Research", icon: Compass, tag: "Pull" },
    { id: "portfolio" as NavTab, label: "Portfolio", icon: Briefcase, tag: "16 Stocks" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/80 px-2 py-1 max-w-md mx-auto sm:rounded-t-2xl">
      <div className="flex justify-around items-center h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 ${
                isActive ? "text-emerald-400 font-semibold scale-105" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.4px]" : "stroke-[1.8px]"}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center shadow-sm">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{tab.label}</span>
              <span className={`text-[8px] uppercase tracking-wider ${isActive ? "text-emerald-500/80" : "text-zinc-500"}`}>
                {tab.tag}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

"use client";

import React, { useState } from "react";
import { StockSnapshot } from "@/lib/api";
import {
  TrendingUp,
  TrendingDown,
  Briefcase,
  Layers,
  ArrowUpRight,
} from "lucide-react";

interface PortfolioViewProps {
  portfolio: StockSnapshot[];
  adhocSamples: StockSnapshot[];
  onSelectStockPull: (symbol: string) => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  portfolio,
  adhocSamples,
  onSelectStockPull,
}) => {
  const [selectedSector, setSelectedSector] = useState<string>("ALL");
  const [filterText, setFilterText] = useState<string>("");

  const sectors = ["ALL", ...Array.from(new Set(portfolio.map((s) => s.sector.split("&")[0].trim())))];

  const filteredPortfolio = portfolio.filter((s) => {
    const matchesSector =
      selectedSector === "ALL" || s.sector.toLowerCase().includes(selectedSector.toLowerCase());
    const matchesText =
      !filterText ||
      s.symbol.toLowerCase().includes(filterText.toLowerCase()) ||
      s.name.toLowerCase().includes(filterText.toLowerCase());
    return matchesSector && matchesText;
  });

  return (
    <div className="space-y-3 pb-24">
      {/* Portfolio Header */}
      <div className="sticky top-[57px] z-30 bg-zinc-950/95 backdrop-blur-md pt-1 pb-2 border-b border-zinc-800/80 px-4 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-zinc-100 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-emerald-400" />
            Mock Portfolio (16 Holdings)
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">NSE / BSE Universe</span>
        </div>

        <input
          type="text"
          placeholder="Search portfolio stocks..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
        />

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`px-2.5 py-0.5 rounded-full text-[10px] whitespace-nowrap transition-all ${
                selectedSector === sec
                  ? "bg-emerald-500 text-zinc-950 font-bold"
                  : "bg-zinc-900 text-zinc-400 border border-zinc-800"
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Cards Grid */}
      <div className="px-4 space-y-2.5">
        {filteredPortfolio.map((stock) => {
          const change = stock.day_change_pct ?? 0;
          return (
            <div
              key={stock.symbol}
              onClick={() => onSelectStockPull(stock.symbol)}
              className="bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 rounded-xl p-3 cursor-pointer transition-all flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-zinc-100 font-mono">
                    {stock.symbol}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-normal">
                    {stock.mcap_category}
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 truncate max-w-[200px]">
                  {stock.name}
                </div>
                <span className="text-[9px] text-zinc-500">{stock.sector}</span>
              </div>

              <div className="text-right space-y-1">
                <div className="font-bold text-xs text-zinc-100 font-mono">
                  {stock.current_price ? `₹${stock.current_price.toLocaleString("en-IN")}` : "—"}
                </div>
                <div
                  className={`text-[10px] font-bold font-mono inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded ${
                    change >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                  }`}
                >
                  {change >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                  {change > 0 ? "+" : ""}{change}%
                </div>
                {stock.volume_ratio && (
                  <div className="text-[9px] text-zinc-500 font-mono">
                    Vol: {stock.volume_ratio}x 20D
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Ad-Hoc Generalization Universe Callout */}
        <div className="pt-4 space-y-2">
          <div className="text-[11px] font-bold text-zinc-400 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-zinc-500" />
            <span>Ad-Hoc Research Generalization Universe</span>
          </div>
          <p className="text-[10px] text-zinc-500 leading-relaxed">
            The research engine generalises across <strong>any</strong> NSE ticker. Try these non-portfolio test tickers:
          </p>
          <div className="flex gap-2">
            {adhocSamples.map((adhoc) => (
              <button
                key={adhoc.symbol}
                onClick={() => onSelectStockPull(adhoc.symbol)}
                className="flex-1 bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 p-2 rounded-lg text-left transition-all"
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-xs text-zinc-200">{adhoc.symbol}</span>
                  <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                </div>
                <div className="text-[10px] text-zinc-500">{adhoc.sector}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

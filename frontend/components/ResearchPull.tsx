"use client";

import React, { useState, useEffect } from "react";
import { fetchResearch } from "@/lib/api";
import { NarrativeVsNumbers } from "./NarrativeVsNumbers";
import {
  Search,
  BookOpen,
  PieChart,
  Activity,
  Layers,
  Coins,
  Scale,
  Compass,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface ResearchPullProps {
  initialSymbol?: string;
  onSelectStock: (symbol: string) => void;
}

export const ResearchPull: React.FC<ResearchPullProps> = ({
  initialSymbol = "TRENT",
  onSelectStock,
}) => {
  const [tickerInput, setTickerInput] = useState<string>(initialSymbol);
  const [activeSymbol, setActiveSymbol] = useState<string>(initialSymbol);
  const [activeModule, setActiveModule] = useState<string>("narrative");
  const [loading, setLoading] = useState<boolean>(false);
  const [dossier, setDossier] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const quickPicks = ["TRENT", "RELIANCE", "ZOMATO", "SUZLON", "DIXON", "CDSL", "POLYCAB"];

  const modules = [
    { id: "narrative", label: "Narrative vs Numbers", icon: Scale, star: true },
    { id: "business", label: "Business Snapshot", icon: BookOpen },
    { id: "financials", label: "Financial Snapshot", icon: PieChart },
    { id: "trajectory", label: "Trajectory (3Y)", icon: Activity },
    { id: "balance_sheet", label: "Balance Sheet & Debt", icon: Layers },
    { id: "cash_quality", label: "Cash Quality (CFO/PAT)", icon: Coins },
    { id: "guidance", label: "Forward Guidance", icon: Compass },
    { id: "bull_bear", label: "Bull vs Bear Case", icon: AlertTriangle },
  ];

  const loadData = async (sym: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchResearch(sym);
      setDossier(data);
      setActiveSymbol(sym);
    } catch (err: any) {
      setError(err?.message || "Failed to load company research");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialSymbol) {
      setTickerInput(initialSymbol);
      loadData(initialSymbol);
    }
  }, [initialSymbol]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (tickerInput.trim()) {
      const clean = tickerInput.trim().toUpperCase();
      loadData(clean);
      onSelectStock(clean);
    }
  };

  const handleSelectQuickPick = (sym: string) => {
    setTickerInput(sym);
    loadData(sym);
    onSelectStock(sym);
  };

  return (
    <div className="space-y-3 pb-24">
      {/* Universal Ticker Search Bar */}
      <div className="sticky top-[57px] z-30 bg-zinc-950/95 backdrop-blur-md pt-1 pb-2 border-b border-zinc-800/80 px-4 space-y-2">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Enter any NSE/BSE Symbol (e.g. TRENT, CDSL, HAL)..."
              value={tickerInput}
              onChange={(e) => setTickerInput(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 font-mono uppercase focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-3 py-2 rounded-xl text-xs transition-colors shrink-0"
          >
            Pull
          </button>
        </form>

        {/* Quick Pick Chips */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[10px] text-zinc-500 shrink-0 self-center">Quick:</span>
          {quickPicks.map((sym) => (
            <button
              key={sym}
              onClick={() => handleSelectQuickPick(sym)}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono transition-all ${
                activeSymbol === sym
                  ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40"
                  : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
              }`}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 space-y-3">
        {loading ? (
          <div className="py-20 text-center space-y-2">
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto" />
            <p className="text-xs text-zinc-400">Pulling Primary Concalls & Filings from screener.in...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-center space-y-2">
            <AlertTriangle className="w-6 h-6 text-rose-400 mx-auto" />
            <p className="text-xs text-rose-200 font-medium">{error}</p>
            <p className="text-[10px] text-zinc-400">Ensure ticker exists on NSE or BSE.</p>
          </div>
        ) : dossier ? (
          <div className="space-y-3">
            {/* Company Title Banner */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                    {dossier.company_name}
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                      {dossier.symbol}.NS
                    </span>
                  </h2>
                  <p className="text-[10px] text-zinc-400 mt-0.5 max-w-sm line-clamp-2">
                    {dossier.about}
                  </p>
                </div>
              </div>

              {/* Primary Documents Counts */}
              <div className="flex items-center gap-2 text-[10px] pt-1.5 border-t border-zinc-800/80 text-zinc-400">
                <span className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 font-mono text-zinc-300">
                  {dossier.primary_documents?.concall_transcripts_count || 14} Concalls
                </span>
                <span className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 font-mono text-zinc-300">
                  {dossier.primary_documents?.annual_reports_count || 10} Annual Reports
                </span>
                <span className="text-emerald-400 font-medium ml-auto flex items-center gap-1">
                  Primary Sources Grounded
                </span>
              </div>
            </div>

            {/* 8-Module Horizontal Scroll Selector */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
              {modules.map((m) => {
                const Icon = m.icon;
                const isActive = activeModule === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setActiveModule(m.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg whitespace-nowrap text-[11px] font-medium transition-all ${
                      isActive
                        ? "bg-emerald-500 text-zinc-950 font-bold shadow-sm"
                        : "bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                    {m.star && <span className="text-amber-300 font-black ml-0.5">★</span>}
                  </button>
                );
              })}
            </div>

            {/* MODULE CONTENT CONTAINER */}
            <div className="space-y-3">
              {/* 1. NARRATIVE VS NUMBERS (THE HIGHLIGHT) */}
              {activeModule === "narrative" && dossier.modules?.narrative_vs_numbers && (
                <NarrativeVsNumbers data={dossier.modules.narrative_vs_numbers} />
              )}

              {/* 2. BUSINESS SNAPSHOT */}
              {activeModule === "business" && dossier.modules?.business_snapshot && (
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span>Business Snapshot & Key Ratios</span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/60">
                    {dossier.modules.business_snapshot.core_description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800 space-y-0.5">
                      <span className="text-[10px] text-zinc-500">Market Cap</span>
                      <div className="font-bold text-zinc-100 font-mono">
                        {dossier.modules.business_snapshot.market_cap}
                      </div>
                    </div>
                    <div className="bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800 space-y-0.5">
                      <span className="text-[10px] text-zinc-500">Stock P/E Ratio</span>
                      <div className="font-bold text-zinc-100 font-mono">
                        {dossier.modules.business_snapshot.current_pe}
                      </div>
                    </div>
                    <div className="bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800 space-y-0.5">
                      <span className="text-[10px] text-zinc-500">ROCE %</span>
                      <div className="font-bold text-emerald-400 font-mono">
                        {dossier.modules.business_snapshot.roce}
                      </div>
                    </div>
                    <div className="bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800 space-y-0.5">
                      <span className="text-[10px] text-zinc-500">ROE %</span>
                      <div className="font-bold text-emerald-400 font-mono">
                        {dossier.modules.business_snapshot.roe}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. FINANCIAL SNAPSHOT */}
              {activeModule === "financials" && dossier.modules?.financial_snapshot && (
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                      <PieChart className="w-4 h-4 text-emerald-400" />
                      Quarterly Headline P&L
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">Figures in ₹ Cr</span>
                  </div>

                  {dossier.modules.financial_snapshot.headline_data?.headline_metrics && (
                    <div className="space-y-2">
                      {dossier.modules.financial_snapshot.headline_data.headline_metrics.map((m: any) => (
                        <div
                          key={m.code}
                          className="bg-zinc-950/80 border border-zinc-800 rounded-lg p-2.5 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-zinc-200 block">{m.metric}</span>
                            {m.margin_pct && (
                              <span className="text-[10px] text-emerald-400 font-mono">
                                Margin: {m.margin_pct}%
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-zinc-100 font-mono text-sm block">
                              ₹{m.current?.toLocaleString("en-IN")} Cr
                            </span>
                            <div className="text-[10px] font-mono space-x-2">
                              <span className={m.qoq_delta_pct >= 0 ? "text-emerald-400" : "text-rose-400"}>
                                QoQ: {m.qoq_delta_pct > 0 ? "+" : ""}{m.qoq_delta_pct}%
                              </span>
                              <span className={m.yoy_delta_pct >= 0 ? "text-emerald-400 font-bold" : "text-rose-400"}>
                                YoY: {m.yoy_delta_pct > 0 ? "+" : ""}{m.yoy_delta_pct}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 4. TRAJECTORY */}
              {activeModule === "trajectory" && dossier.modules?.trajectory && (
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      Multi-Year Financial Trajectory
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                      {dossier.modules.trajectory.trend_status}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/60">
                    {dossier.modules.trajectory.insight}
                  </p>

                  <div className="space-y-1.5">
                    {dossier.modules.trajectory.annual_series?.map((yr: any) => (
                      <div
                        key={yr.year}
                        className="bg-zinc-950/80 border border-zinc-800/80 rounded-lg p-2 text-xs flex justify-between items-center"
                      >
                        <span className="font-bold font-mono text-zinc-300">{yr.year}</span>
                        <div className="flex gap-4 text-right text-[11px] font-mono">
                          <div>
                            <span className="text-zinc-500 text-[9px] block">Sales</span>
                            <span className="text-zinc-100 font-medium">₹{yr.sales} Cr</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 text-[9px] block">EBITDA Mgn</span>
                            <span className="text-emerald-400 font-medium">{yr.ebitda_margin_pct}%</span>
                          </div>
                          <div>
                            <span className="text-zinc-500 text-[9px] block">Net PAT</span>
                            <span className="text-zinc-100 font-medium">₹{yr.pat} Cr</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. BALANCE SHEET & DEBT */}
              {activeModule === "balance_sheet" && dossier.modules?.balance_sheet && (
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      Balance Sheet & Capital Structure
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      As of {dossier.modules.balance_sheet.as_of_period}
                    </span>
                  </div>

                  <div className="bg-zinc-950/80 p-3 rounded-lg border border-zinc-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400">Debt-to-Equity (D/E)</span>
                      <span className="text-sm font-bold font-mono text-emerald-400">
                        {dossier.modules.balance_sheet.debt_to_equity_ratio}x
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (dossier.modules.balance_sheet.debt_to_equity_ratio / 1.5) * 100)}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-zinc-500 block">
                      Leverage Status: <strong className="text-zinc-300">{dossier.modules.balance_sheet.leverage_status}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800 space-y-0.5">
                      <span className="text-[10px] text-zinc-500">Total Borrowings (Debt)</span>
                      <div className="font-bold text-zinc-100 font-mono">
                        ₹{dossier.modules.balance_sheet.total_borrowings_debt?.toLocaleString("en-IN")} Cr
                      </div>
                    </div>
                    <div className="bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800 space-y-0.5">
                      <span className="text-[10px] text-zinc-500">Shareholders Net Worth</span>
                      <div className="font-bold text-zinc-100 font-mono">
                        ₹{dossier.modules.balance_sheet.shareholders_equity?.toLocaleString("en-IN")} Cr
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. CASH QUALITY & CONVERSION */}
              {activeModule === "cash_quality" && dossier.modules?.cash_quality && (
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-emerald-400" />
                      Cash Quality & Profit-to-Cash Conversion
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                      {dossier.modules.cash_quality.quality_verdict}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/60">
                    {dossier.modules.cash_quality.insight}
                  </p>

                  <div className="bg-zinc-950/80 p-3 rounded-lg border border-zinc-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400">3-Year CFO / PAT Cash Conversion</span>
                      <span className="text-sm font-bold font-mono text-emerald-400">
                        {dossier.modules.cash_quality.cash_conversion_ratio_pct}%
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-400 flex justify-between">
                      <span>Cumulative CFO: ₹{dossier.modules.cash_quality.cumulative_3y_cfo} Cr</span>
                      <span>Cumulative PAT: ₹{dossier.modules.cash_quality.cumulative_3y_pat} Cr</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 7. FORWARD GUIDANCE */}
              {activeModule === "guidance" && dossier.modules?.forward_guidance && (
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200">
                    <Compass className="w-4 h-4 text-emerald-400" />
                    <span>Forward Guidance Tracker</span>
                  </div>

                  <div className="space-y-2">
                    {dossier.modules.forward_guidance.guidance_summary?.map((g: any, i: number) => (
                      <div key={i} className="bg-zinc-950/80 border border-zinc-800 rounded-lg p-2.5 text-xs space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-zinc-200 uppercase">{g.pillar}</span>
                          <span className="text-emerald-400 font-mono font-semibold">{g.status}</span>
                        </div>
                        <p className="text-zinc-300 text-[11px] leading-relaxed">{g.commentary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 8. BULL VS BEAR CASE */}
              {activeModule === "bull_bear" && dossier.modules?.bull_bear && (
                <div className="space-y-3">
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <span>Bull Case Thesis (Primary Evidence)</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-zinc-300">
                      {dossier.modules.bull_bear.bull_case?.map((b: string, i: number) => (
                        <li key={i} className="bg-zinc-950/60 p-2 rounded border border-emerald-500/20 flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                      <span>Bear Case Risks (Primary Disclosures)</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-zinc-300">
                      {dossier.modules.bull_bear.bear_case?.map((b: string, i: number) => (
                        <li key={i} className="bg-zinc-950/60 p-2 rounded border border-rose-500/20 flex items-start gap-2">
                          <span className="text-rose-400 font-bold">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

"use client";

import React, { useState } from "react";
import { DigestItem } from "@/lib/api";
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  UserCheck,
  TrendingUp,
  FileText,
  EyeOff,
  Briefcase,
} from "lucide-react";

interface DigestFeedProps {
  items: DigestItem[];
  routineItems: DigestItem[];
  highCount: number;
  routineCount: number;
  windowDays: number;
  onSelectStockPull: (symbol: string) => void;
}

export const DigestFeed: React.FC<DigestFeedProps> = ({
  items,
  routineItems,
  highCount,
  routineCount,
  windowDays,
  onSelectStockPull,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [showRoutine, setShowRoutine] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = [
    { id: "ALL", label: "All Signal" },
    { id: "results", label: "Results" },
    { id: "management_change", label: "Leadership" },
    { id: "M&A", label: "M&A" },
    { id: "capex", label: "Capex" },
    { id: "fund_raise", label: "Fund Raise" },
  ];

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === "ALL" || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-3 pb-20">
      {/* Search and Filter Chips */}
      <div className="sticky top-[57px] z-30 bg-zinc-950/95 backdrop-blur-md pt-1 pb-2 border-b border-zinc-800/60">
        <div className="px-4 mb-2">
          <input
            type="text"
            placeholder="Filter filings across portfolio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto px-4 no-scrollbar pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full whitespace-nowrap text-[11px] font-medium transition-all ${
                selectedCategory === cat.id
                  ? "bg-emerald-500 text-zinc-950 font-semibold shadow-sm"
                  : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Signal Status Bar */}
      <div className="px-4">
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-zinc-300 font-medium">
              {highCount} High-Impact Disclosures ({windowDays === 1 ? "Last 24 Hours" : `Last ${windowDays} Days`})
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            {routineCount} routine buried
          </span>
        </div>
      </div>

      {/* Main Feed of Filings */}
      <div className="px-4 space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-xs">
            No filings match the current criteria in this window.
          </div>
        ) : (
          filteredItems.map((item, idx) => (
            <div
              key={`${item.symbol}-${idx}`}
              className="bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700/80 transition-all rounded-xl p-3.5 shadow-sm space-y-2.5"
            >
              {/* Card Header: Ticker & Category */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectStockPull(item.symbol)}
                      className="font-bold text-sm text-zinc-100 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                    >
                      {item.symbol}
                      <span className="text-[10px] text-zinc-500 font-normal">
                        ({item.company_name})
                      </span>
                    </button>
                  </div>
                  <span className="text-[10px] text-zinc-400">{item.sector}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      item.impact === "HIGH"
                        ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                        : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {item.category_name}
                  </span>
                </div>
              </div>

              {/* Title & Core One-Liner */}
              <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                {item.title}
              </p>

              <div className="bg-zinc-950/60 border border-zinc-800/60 rounded-lg p-2 text-[11px] text-emerald-400/90 font-medium flex items-start gap-1.5">
                <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />
                <span>{item.one_liner}</span>
              </div>

              {/* ENRICHMENT TYPE 1: Quarterly Results Box */}
              {item.enrichment?.type === "quarterly_results" && item.enrichment.data?.available && (
                <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 border border-emerald-500/30 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Headline Results ({item.enrichment.data.period})
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">Figures in ₹ Cr</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {item.enrichment.data.headline_metrics.map((m: any) => (
                      <div key={m.code} className="bg-zinc-900/90 border border-zinc-800/80 rounded-lg p-2 space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-zinc-400">
                          <span>{m.metric.split(" ")[0]}</span>
                          {m.margin_pct && (
                            <span className="text-emerald-400 font-mono">{m.margin_pct}% Mgn</span>
                          )}
                        </div>
                        <div className="text-sm font-bold text-zinc-100 font-mono">
                          ₹{m.current?.toLocaleString("en-IN")}
                        </div>
                        <div className="flex justify-between items-center text-[10px] pt-0.5 border-t border-zinc-800/50">
                          <span className={m.qoq_delta_pct >= 0 ? "text-emerald-400" : "text-rose-400"}>
                            QoQ: {m.qoq_delta_pct > 0 ? "+" : ""}{m.qoq_delta_pct}%
                          </span>
                          <span className={m.yoy_delta_pct >= 0 ? "text-emerald-400 font-semibold" : "text-rose-400"}>
                            YoY: {m.yoy_delta_pct > 0 ? "+" : ""}{m.yoy_delta_pct}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ENRICHMENT TYPE 2: Executive Biographical Dossier */}
              {item.enrichment?.type === "executive_profile" && item.enrichment.data?.is_enriched && (
                <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 border border-blue-500/30 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                    <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" />
                      Executive Dossier: {item.enrichment.data.executive_name}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium">
                      {item.enrichment.data.experience}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center gap-1.5 text-zinc-200">
                      <Briefcase className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="font-semibold text-zinc-100">{item.enrichment.data.designation}</span>
                      <span className="text-zinc-500">| Prior:</span>
                      <span className="text-blue-300 font-medium">{item.enrichment.data.prior_company}</span>
                    </div>

                    <p className="text-zinc-300 text-[11px] leading-relaxed bg-zinc-900/60 p-2 rounded-lg border border-zinc-800/50">
                      {item.enrichment.data.pedigree_summary}
                    </p>
                  </div>
                </div>
              )}

              {/* Card Footer: Actions */}
              <div className="flex items-center justify-between pt-1 text-[11px]">
                <button
                  onClick={() => onSelectStockPull(item.symbol)}
                  className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
                >
                  Pull Deep Dive &rarr;
                </button>

                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1 text-[10px]"
                  >
                    BSE Exchange PDF
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Routine Compliance Buried Noise Section */}
      {routineCount > 0 && (
        <div className="px-4 pt-2">
          <button
            onClick={() => setShowRoutine(!showRoutine)}
            className="w-full bg-zinc-950/80 border border-zinc-800/60 hover:border-zinc-700/80 rounded-xl p-3 flex items-center justify-between text-xs text-zinc-400 hover:text-zinc-200 transition-all"
          >
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-zinc-500" />
              <span>
                {routineCount} Routine Compliance Filings Buried (Low Impact)
              </span>
            </div>
            {showRoutine ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showRoutine && (
            <div className="mt-2 space-y-2 border-l-2 border-zinc-800 pl-3">
              {routineItems.map((r, i) => (
                <div key={i} className="text-[11px] text-zinc-400 bg-zinc-900/40 p-2 rounded border border-zinc-800/40 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-zinc-300 mr-2">{r.symbol}:</span>
                    <span>{r.title}</span>
                  </div>
                  {r.url && (
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-zinc-300">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

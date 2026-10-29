"use client";

import React from "react";
import {
  Quote,
  Scale,
  FileCheck2,
} from "lucide-react";

interface ScorecardItem {
  theme: string;
  guided_promise: string;
  concall_quote: string;
  metric_tracked: string;
  guided_target: string;
  delivered_actual: string;
  status: "EXCEEDED" | "DELIVERED" | "PARTIAL" | "MISSED";
  variance: string;
  investor_takeaway: string;
}

interface NarrativeData {
  symbol: string;
  benchmark_period: string;
  primary_source: string;
  executive_speaker: string;
  scorecard: ScorecardItem[];
  overall_credibility_score: {
    score_percentage: number;
    rating: string;
    deliveries?: number;
    misses?: number;
    total_commitments?: number;
  };
}

interface NarrativeVsNumbersProps {
  data: NarrativeData;
}

export const NarrativeVsNumbers: React.FC<NarrativeVsNumbersProps> = ({ data }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "EXCEEDED":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "DELIVERED":
        return "bg-teal-500/20 text-teal-300 border-teal-500/40";
      case "PARTIAL":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "MISSED":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      default:
        return "bg-zinc-800 text-zinc-300 border-zinc-700";
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Header Banner: Credibility Audit */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>Concall Guidance vs. Delivered Financials</span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              Auditing 4-Quarter Concall Promises against Subsequent Exchange Filings
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block">
              Management Credibility
            </span>
            <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full inline-block mt-0.5">
              {data.overall_credibility_score?.rating || "Verified"} ({data.overall_credibility_score?.score_percentage}%)
            </span>
          </div>
        </div>

        {/* Primary Source Metadata */}
        <div className="bg-zinc-950/80 border border-zinc-800/60 rounded-lg p-2 text-[10px] text-zinc-400 space-y-1">
          <div className="flex justify-between">
            <span className="text-zinc-500">Benchmark Window:</span>
            <span className="text-zinc-300 font-medium">{data.benchmark_period}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Key Concall Speaker:</span>
            <span className="text-zinc-300 font-medium">{data.executive_speaker}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Primary Disclosure:</span>
            <span className="text-zinc-400 truncate max-w-[210px]">{data.primary_source}</span>
          </div>
        </div>
      </div>

      {/* Scorecard Items */}
      <div className="space-y-3">
        {data.scorecard.map((item, idx) => (
          <div
            key={idx}
            className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 space-y-2.5 shadow-sm"
          >
            {/* Theme and Status Badge */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-100">{item.theme}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getStatusBadge(
                  item.status
                )}`}
              >
                {item.status} ({item.variance})
              </span>
            </div>

            {/* Promise vs Quote */}
            <div className="space-y-1.5 text-xs">
              <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-lg p-2.5 space-y-1">
                <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">
                  Management Promise / Guidance
                </span>
                <p className="text-zinc-200 text-xs font-medium">{item.guided_promise}</p>

                {item.concall_quote && (
                  <div className="mt-1.5 pt-1.5 border-t border-zinc-800/60 flex items-start gap-1.5 text-[11px] text-zinc-400 italic">
                    <Quote className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                    <span>&ldquo;{item.concall_quote}&rdquo;</span>
                  </div>
                )}
              </div>

              {/* Delivery Reality Box */}
              <div className="bg-zinc-950/90 border border-emerald-500/20 rounded-lg p-2.5 space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-zinc-400 font-semibold uppercase">Audited Delivery (Primary Filing)</span>
                  <span className="text-emerald-400 font-mono font-bold">{item.metric_tracked}</span>
                </div>
                <div className="text-xs font-bold text-emerald-300 font-mono">
                  {item.delivered_actual}
                </div>
                <div className="text-[10px] text-zinc-400">
                  Target: <strong className="text-zinc-200">{item.guided_target}</strong>
                </div>
              </div>

              {/* Analytical Investor Takeaway */}
              <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800/50 text-[11px] text-zinc-300 flex items-start gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-zinc-200">Analytical Verdict: </strong>
                  {item.investor_takeaway}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

"use client";

import React, { useState } from "react";
import { AlertItem } from "@/lib/api";
import {
  Sliders,
  TrendingUp,
  TrendingDown,
  Volume2,
  AlertTriangle,
  Flame,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

interface AlertCenterProps {
  alerts: AlertItem[];
  volumeFactor: number;
  priceThreshold: number;
  onUpdateThresholds: (volume: number, price: number) => void;
  onSelectStockPull: (symbol: string) => void;
  isLoading?: boolean;
}

export const AlertCenter: React.FC<AlertCenterProps> = ({
  alerts,
  volumeFactor,
  priceThreshold,
  onUpdateThresholds,
  onSelectStockPull,
  isLoading = false,
}) => {
  const [volInput, setVolInput] = useState<number>(volumeFactor);
  const [priceInput, setPriceInput] = useState<number>(priceThreshold);
  const [showConfig, setShowConfig] = useState<boolean>(false);

  const handleApply = () => {
    onUpdateThresholds(volInput, priceInput);
  };

  return (
    <div className="space-y-3 pb-20">
      {/* Configuration Header & Sliders Drawer */}
      <div className="px-4 pt-2">
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5 space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-zinc-100">
                Trigger Threshold Rules
              </span>
            </div>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium"
            >
              {showConfig ? "Hide Sliders" : "Configure Rules"}
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 bg-zinc-950/70 p-2 rounded-lg border border-zinc-800/60">
            <span>
              Volume: <strong className="text-emerald-400 font-mono">{volInput.toFixed(1)}x</strong> 20D SMA
            </span>
            <span>
              Price: <strong className="text-rose-400 font-mono">±{priceInput.toFixed(1)}%</strong>
            </span>
            <span className="text-zinc-500 font-mono">{alerts.length} triggered</span>
          </div>

          {showConfig && (
            <div className="space-y-3 pt-2 border-t border-zinc-800 text-xs">
              <div>
                <div className="flex justify-between text-[11px] text-zinc-300 mb-1">
                  <span>Volume Anomaly Multiplier</span>
                  <span className="text-emerald-400 font-bold font-mono">{volInput.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="1.2"
                  max="4.0"
                  step="0.1"
                  value={volInput}
                  onChange={(e) => setVolInput(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <span className="text-[10px] text-zinc-500">
                  Flags any stock where session volume exceeds {volInput.toFixed(1)}x its 20-day average.
                </span>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-zinc-300 mb-1">
                  <span>Single-Session Price Move</span>
                  <span className="text-rose-400 font-bold font-mono">±{priceInput.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="8.0"
                  step="0.5"
                  value={priceInput}
                  onChange={(e) => setPriceInput(parseFloat(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <span className="text-[10px] text-zinc-500">
                  Flags rapid price expansion or contraction beyond ±{priceInput.toFixed(1)}%.
                </span>
              </div>

              <button
                onClick={handleApply}
                disabled={isLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-1.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                {isLoading ? "Re-evaluating..." : "Apply & Scan Universe"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Alerts Feed */}
      <div className="px-4 space-y-3">
        <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
          <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-rose-400" />
            Active Anomalies ({alerts.length})
          </span>
          <span className="text-[10px] text-zinc-500">Scanned across 16 mock holdings</span>
        </div>

        {alerts.length === 0 ? (
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-8 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-xs text-zinc-300 font-medium">All Portfolio Holdings Within Normal Bounds</p>
            <p className="text-[11px] text-zinc-500">
              No stock has crossed the {volInput}x volume or ±{priceInput}% price threshold.
            </p>
          </div>
        ) : (
          alerts.map((alert, idx) => {
            const isMarket = alert.alert_type === "MARKET_ANOMALY";
            const changePct = alert.market_data?.change_pct ?? 0;

            return (
              <div
                key={`${alert.symbol}-${idx}`}
                className="bg-zinc-900/80 border border-zinc-800/90 rounded-xl p-3.5 space-y-2.5 shadow-sm hover:border-zinc-700 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectStockPull(alert.symbol)}
                        className="font-bold text-sm text-zinc-100 hover:text-emerald-400 transition-colors"
                      >
                        {alert.symbol}
                      </button>
                      <span className="text-[10px] text-zinc-400 font-medium">{alert.sector}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      alert.severity === "HIGH"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    }`}
                  >
                    {isMarket ? "Market Spike" : alert.category_name || "Material Filing"}
                  </span>
                </div>

                {/* Quantitative Market Snapshot */}
                {isMarket && alert.market_data && (
                  <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-lg p-2.5 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <div className="text-[9px] text-zinc-500 uppercase">CMP</div>
                      <div className="font-bold text-zinc-100 font-mono">
                        ₹{alert.market_data.price?.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-zinc-500 uppercase">Change</div>
                      <div
                        className={`font-bold font-mono flex items-center justify-center gap-0.5 ${
                          changePct >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {changePct >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {changePct > 0 ? "+" : ""}{changePct}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-zinc-500 uppercase">Vol vs 20D</div>
                      <div className="font-bold text-amber-400 font-mono flex items-center justify-center gap-0.5">
                        <Volume2 className="w-3 h-3" />
                        {alert.market_data.volume_ratio}x
                      </div>
                    </div>
                  </div>
                )}

                {/* Alert Details */}
                <div className="space-y-1">
                  {alert.details.map((detail, dIdx) => (
                    <div
                      key={dIdx}
                      className="text-[11px] text-zinc-300 flex items-start gap-1.5 bg-zinc-950/40 p-2 rounded border border-zinc-800/40"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>

                {/* Footer Action */}
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => onSelectStockPull(alert.symbol)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    Investigate Ticker Pull View
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

"use client";

import React, { useState, useEffect } from "react";
import { MobileFrame } from "@/components/MobileFrame";
import { TopHeader } from "@/components/TopHeader";
import { BottomNav, NavTab } from "@/components/BottomNav";
import { DigestFeed } from "@/components/DigestFeed";
import { AlertCenter } from "@/components/AlertCenter";
import { ResearchPull } from "@/components/ResearchPull";
import { PortfolioView } from "@/components/PortfolioView";
import {
  fetchPortfolio,
  fetchDigest,
  fetchAlerts,
  DigestResponse,
  StockSnapshot,
  AlertItem,
} from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavTab>("digest");
  const [windowDays, setWindowDays] = useState<number>(1);
  const [selectedStockPull, setSelectedStockPull] = useState<string>("TRENT");

  // Threshold States
  const [volumeFactor, setVolumeFactor] = useState<number>(2.0);
  const [priceThreshold, setPriceThreshold] = useState<number>(3.0);

  // Data States
  const [digestData, setDigestData] = useState<DigestResponse | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [portfolio, setPortfolio] = useState<StockSnapshot[]>([]);
  const [adhocSamples, setAdhocSamples] = useState<StockSnapshot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [alertsLoading, setAlertsLoading] = useState<boolean>(false);

  // Initial Data Load
  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const [portRes, digRes, altRes] = await Promise.all([
          fetchPortfolio(),
          fetchDigest(windowDays, false),
          fetchAlerts(volumeFactor, priceThreshold),
        ]);
        setPortfolio(portRes.portfolio || []);
        setAdhocSamples(portRes.adhoc_samples || []);
        setDigestData(digRes);
        setAlerts(altRes.alerts || []);
      } catch (e) {
        console.error("Initialization error:", e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [windowDays, volumeFactor, priceThreshold]);

  // Window Change Handler
  const handleWindowChange = async (days: number) => {
    setWindowDays(days);
    try {
      const digRes = await fetchDigest(days, false);
      setDigestData(digRes);
    } catch (e) {
      console.error(e);
    }
  };

  // Threshold Update Handler
  const handleUpdateThresholds = async (vol: number, price: number) => {
    setVolumeFactor(vol);
    setPriceThreshold(price);
    setAlertsLoading(true);
    try {
      const altRes = await fetchAlerts(vol, price);
      setAlerts(altRes.alerts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setAlertsLoading(false);
    }
  };

  // Jump from Digest or Alerts to Pull Deep Dive
  const handleSelectStockPull = (symbol: string) => {
    setSelectedStockPull(symbol);
    setActiveTab("research");
  };

  return (
    <MobileFrame>
      <div className="flex flex-col min-h-screen bg-zinc-950 relative">
        {/* Top Header */}
        <TopHeader
          windowDays={windowDays}
          onWindowChange={handleWindowChange}
          activeModeLabel={activeTab}
        />

        {/* Tab Viewport */}
        <main className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-3">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-xs text-zinc-400 font-medium">
                Syncing NSE Filings & EOD Market Data...
              </p>
            </div>
          ) : (
            <>
              {activeTab === "digest" && digestData && (
                <DigestFeed
                  items={digestData.items}
                  routineItems={digestData.routine_items}
                  highCount={digestData.high_impact_count}
                  routineCount={digestData.routine_collapsed_count}
                  windowDays={windowDays}
                  onSelectStockPull={handleSelectStockPull}
                />
              )}

              {activeTab === "alerts" && (
                <AlertCenter
                  alerts={alerts}
                  volumeFactor={volumeFactor}
                  priceThreshold={priceThreshold}
                  onUpdateThresholds={handleUpdateThresholds}
                  onSelectStockPull={handleSelectStockPull}
                  isLoading={alertsLoading}
                />
              )}

              {activeTab === "research" && (
                <ResearchPull
                  initialSymbol={selectedStockPull}
                  onSelectStock={(sym) => setSelectedStockPull(sym)}
                />
              )}

              {activeTab === "portfolio" && (
                <PortfolioView
                  portfolio={portfolio}
                  adhocSamples={adhocSamples}
                  onSelectStockPull={handleSelectStockPull}
                />
              )}
            </>
          )}
        </main>

        {/* Bottom Mobile Navigation */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          alertCount={alerts.length}
        />
      </div>
    </MobileFrame>
  );
}

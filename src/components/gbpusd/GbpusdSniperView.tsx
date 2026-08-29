import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  GbpusdSniperEngine,
  GbpusdCandle,
  GbpusdSniperSetup,
  GbpusdMacroNewsEvent,
  SystemHealthStatus,
} from "../../services/gbpusdSniperEngine";
import { Gbpusd3DMarketUniverse } from "./Gbpusd3DMarketUniverse";
import { GbpusdTopHud } from "./GbpusdTopHud";
import { GbpusdMarketDnaPanel } from "./GbpusdMarketDnaPanel";
import { GbpusdOpportunityRadar } from "./GbpusdOpportunityRadar";
import { GbpusdActiveSetupCard } from "./GbpusdActiveSetupCard";
import { GbpusdNewsRadar } from "./GbpusdNewsRadar";
import { GbpusdMemoryReplayLab } from "./GbpusdMemoryReplayLab";
import { GbpusdAdminPanel } from "./GbpusdAdminPanel";
import { GbpusdDecisionAuditLab } from "./GbpusdDecisionAuditLab";
import { GbpusdDiagnosticsPanel } from "./GbpusdDiagnosticsPanel";
import {
  Layers,
  Sparkles,
  Sliders,
  Activity,
  History,
  Shield,
  Clock,
  Radio,
  RefreshCw,
  FileText,
  Wrench,
} from "lucide-react";

export const GbpusdSniperView: React.FC = () => {
  // State: Timeframe & Live Data
  const [selectedTimeframe, setSelectedTimeframe] = useState<"1M" | "3M" | "5M" | "15M" | "30M" | "1H" | "4H">("15M");
  const [isLive, setIsLive] = useState<boolean>(true);
  const [isFeedConnected, setIsFeedConnected] = useState<boolean>(true);
  const [dataAgeMs, setDataAgeMs] = useState<number>(0);
  const [livePrice, setLivePrice] = useState<number>(1.34685);
  const [bid, setBid] = useState<number>(1.34680);
  const [ask, setAsk] = useState<number>(1.34690);
  const [change24h, setChange24h] = useState<number>(0.0035);
  const [changePercent24h, setChangePercent24h] = useState<number>(0.26);
  const [latencyMs, setLatencyMs] = useState<number>(28);

  // Active Tab Filter for secondary views
  const [activeSubTab, setActiveSubTab] = useState<"OVERVIEW" | "SCENARIOS" | "AUDIT" | "MEMORY" | "NEWS" | "DIAGNOSTICS" | "ADMIN">("OVERVIEW");

  // System Health
  const [health, setHealth] = useState<SystemHealthStatus>({
    liveData: true,
    database: true,
    aiEngine: true,
    newsData: true,
    threeEngine: true,
    scanner: true,
    provider: "Twelve Data Spot FX Feed",
    lastUpdate: Date.now(),
    latencyMs: 28,
    connection: "CONNECTED",
  });

  // Daily Lock
  const [dailyLockActive, setDailyLockActive] = useState<boolean>(() => GbpusdSniperEngine.isDailySignalLocked());

  // Macro News Data
  const [macroNews] = useState<GbpusdMacroNewsEvent[]>([
    {
      id: "news_boe_mpc",
      title: "Bank of England MPC Member Speech & Policy Guidance",
      currency: "GBP",
      impact: "HIGH",
      timeUtc: "14:30",
      minutesUntil: 95,
      isRiskActive: false,
    },
    {
      id: "news_usd_pmi",
      title: "US S&P Global Services PMI Final",
      currency: "USD",
      impact: "HIGH",
      timeUtc: "15:45",
      minutesUntil: 170,
      forecast: "52.8",
      previous: "52.4",
      isRiskActive: false,
    },
    {
      id: "news_gbp_retail",
      title: "UK Retail Sales MoM",
      currency: "GBP",
      impact: "MEDIUM",
      timeUtc: "07:00",
      minutesUntil: 420,
      forecast: "0.3%",
      previous: "0.2%",
      isRiskActive: false,
    },
  ]);

  // Real-time Tick Polling & Stream Integration
  useEffect(() => {
    let intervalId: any;

    const fetchLiveQuote = async () => {
      try {
        const start = performance.now();
        // Check our dedicated backend GBPUSD endpoints
        const res = await fetch("/api/gbpusd/quote").catch(() => null);
        const end = performance.now();
        const latency = Math.round(end - start) || 28;
        setLatencyMs(latency);

        if (res && res.ok) {
          const data = await res.json();
          if (data && data.price) {
            setLivePrice(data.price);
            setBid(data.bid || data.price - 0.00005);
            setAsk(data.ask || data.price + 0.00005);
            if (data.change24h !== undefined) setChange24h(data.change24h);
            if (data.changePercent24h !== undefined) setChangePercent24h(data.changePercent24h);
            
            const age = data.timestamp ? Date.now() - data.timestamp : 0;
            setDataAgeMs(age);
            setIsFeedConnected(age <= 30000);
            
            setHealth((prev) => ({
              ...prev,
              lastUpdate: data.timestamp || Date.now(),
              latencyMs: latency,
              connection: age <= 30000 ? "CONNECTED" : "DATA_OFFLINE",
            }));
            return;
          }
        }
      } catch (e) {
        setIsFeedConnected(false);
      }
    };

    fetchLiveQuote();
    intervalId = setInterval(fetchLiveQuote, 1500);

    return () => clearInterval(intervalId);
  }, []);

  // Multi-Timeframe Candles Generation
  const candles = useMemo(() => {
    return GbpusdSniperEngine.generateMultiTfCandles(livePrice, selectedTimeframe, 36);
  }, [livePrice, selectedTimeframe]);

  // Spread Calculation
  const spreadPips = useMemo(() => {
    return Number(((ask - bid) * 10000).toFixed(1));
  }, [bid, ask]);

  // Quantitative Market Evaluation & A+ Sniper Engine Output
  const marketAnalysis = useMemo(() => {
    return GbpusdSniperEngine.evaluateMarketState({
      candles,
      currentPrice: livePrice,
      bid,
      ask,
      spread: ask - bid,
      macroNews,
      dataLatencyMs: latencyMs,
    });
  }, [candles, livePrice, bid, ask, macroNews, latencyMs]);

  // Reset Daily Signal Lock
  const handleResetLock = useCallback(async () => {
    try {
      await fetch("/api/gbpusd/daily-lock/reset", { method: "POST" });
    } catch (e) {
      console.warn("Failed to reset daily lock on server:", e);
    }
    GbpusdSniperEngine.resetDailySignalLock();
    setDailyLockActive(false);
  }, []);

  // Lock Trade on Trigger
  const handleLockTrade = useCallback(async (setupId: string) => {
    try {
      await fetch("/api/gbpusd/daily-lock/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setupId }),
      });
    } catch (e) {
      console.warn("Failed to lock trade on server:", e);
    }
    GbpusdSniperEngine.lockDailySignal(setupId);
    setDailyLockActive(true);
  }, []);

  // Dispatch Signal to Telegram
  const handleDispatchTelegram = useCallback(async (setup: GbpusdSniperSetup) => {
    try {
      const text = `
<b>🎯 GMC 3D AI SNIPER • GBPUSD HIGH-CONVICTION SIGNAL</b>
━━━━━━━━━━━━━━━━━━━━
<b>ASSET:</b> <code>GBP/USD (Spot Forex)</code>
<b>DIRECTION:</b> <b>${setup.direction} (GRADE ${setup.grade})</b>
<b>BEST ENTRY:</b> <code>${setup.bestEntry.toFixed(5)}</code>
<b>ENTRY ZONE:</b> <code>${setup.entryLow.toFixed(5)} - ${setup.entryHigh.toFixed(5)}</code>
<b>STOP LOSS:</b> <code>${setup.stopLoss.toFixed(5)}</code>
<b>TAKE PROFIT 1:</b> <code>${setup.tp1.toFixed(5)}</code>
<b>TAKE PROFIT 2:</b> <code>${setup.tp2.toFixed(5)}</code>
<b>TAKE PROFIT 3:</b> <code>${setup.tp3.toFixed(5)}</code>
<b>RISK:REWARD:</b> <code>${setup.riskToReward}</code>
<b>QUANT SCORE:</b> <code>${setup.score}/100</code>

<b>INSTITUTIONAL CONFLUENCES:</b>
• Session: ${setup.session.replace(/_/g, " ")}
• Market Regime: ${setup.marketRegime.replace(/_/g, " ")}
• Invalidation: ${setup.invalidationCriteria}

<i>⚡ 1 GBPUSD Trade/Day Policy Enforced. Autonomous AI Sniper Dispatch.</i>
      `.trim();

      await fetch("/api/telegram/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          alertId: `GBPUSD_${setup.id}`,
        }),
      });
    } catch (e) {
      console.warn("[GBPUSD TELEGRAM BROADCAST ERROR]:", e);
    }
  }, []);

  // Dispatch Test Ping
  const handleTestTelegramPing = useCallback(async () => {
    const res = await fetch("/api/telegram/test-ping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to deliver ping");
    }
  }, []);

  const shadowTrades = useMemo(() => GbpusdSniperEngine.getShadowTrades(), []);

  return (
    <div className="w-full min-h-screen bg-[#040609] text-slate-100 p-3.5 sm:p-5 lg:p-6 flex flex-col gap-5">
      {/* Top Holographic HUD */}
      <GbpusdTopHud
        currentPrice={livePrice}
        bid={bid}
        ask={ask}
        spreadPips={spreadPips}
        change24h={change24h}
        changePercent24h={changePercent24h}
        session={marketAnalysis.session}
        volatility={marketAnalysis.volatility}
        dailyLockActive={dailyLockActive}
        health={health}
        isLive={isLive}
        isFeedConnected={isFeedConnected}
        dataAgeMs={dataAgeMs}
        onToggleMode={() => setIsLive(!isLive)}
        onResetLock={handleResetLock}
      />

      {/* Timeframe & Sub-Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d17]/80 border border-slate-800 p-2.5 rounded-xl">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono font-bold text-slate-400 mr-2">TIMEFRAME:</span>
          {(["1M", "3M", "5M", "15M", "30M", "1H", "4H"] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setSelectedTimeframe(tf)}
              className={`px-3 py-1 text-xs font-mono font-bold rounded-lg cursor-pointer transition-all ${
                selectedTimeframe === tf
                  ? "bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.6)] font-black"
                  : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Sub-Tabs Switcher */}
        <div className="flex flex-wrap rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs font-bold font-mono">
          {(
            [
              { id: "OVERVIEW", label: "OVERVIEW", icon: Layers },
              { id: "SCENARIOS", label: "SCENARIOS", icon: Sparkles },
              { id: "AUDIT", label: "AUDIT LOGS", icon: FileText },
              { id: "MEMORY", label: "MEMORY LAB", icon: History },
              { id: "NEWS", label: "NEWS RADAR", icon: Activity },
              { id: "DIAGNOSTICS", label: "DIAGNOSTICS", icon: Wrench },
              { id: "ADMIN", label: "ADMIN CALIBRATION", icon: Sliders },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded cursor-pointer transition-all ${
                  activeSubTab === tab.id
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Flagship 3D Market Universe Canvas */}
      <Gbpusd3DMarketUniverse
        candles={candles}
        currentPrice={livePrice}
        bid={bid}
        ask={ask}
        spreadPips={spreadPips}
        timeframe={selectedTimeframe}
        setup={marketAnalysis.setup}
        liquidityZones={marketAnalysis.derivedLiquidity}
        scenarios={marketAnalysis.scenarios}
        session={marketAnalysis.session}
        volatility={marketAnalysis.volatility}
        isLive={isLive && isFeedConnected}
      />

      {/* Active Sniper Setup / No-Trade Observatory Card */}
      <GbpusdActiveSetupCard
        setup={marketAnalysis.setup}
        currentPrice={livePrice}
        dailyLockActive={dailyLockActive}
        whyNoTrade={marketAnalysis.whyNoTrade}
        onDispatchTelegram={handleDispatchTelegram}
        onLockTrade={handleLockTrade}
      />

      {/* Dynamic Sub-Views */}
      {activeSubTab === "OVERVIEW" && (
        <div className="flex flex-col gap-5">
          <GbpusdMarketDnaPanel
            marketRegime={marketAnalysis.marketRegime}
            marketStateText={marketAnalysis.marketStateText}
            session={marketAnalysis.session}
            volatility={marketAnalysis.volatility}
            momentum={marketAnalysis.momentum}
            scenarios={marketAnalysis.scenarios}
            liquidityZones={marketAnalysis.derivedLiquidity}
            currentPrice={livePrice}
          />
          <GbpusdOpportunityRadar
            scoreBreakdown={
              marketAnalysis.setup
                ? marketAnalysis.setup.scoreBreakdown
                : GbpusdSniperEngine.calculateAplusScore({
                    candles,
                    currentPrice: livePrice,
                    spreadPips,
                    session: marketAnalysis.session,
                    volatility: marketAnalysis.volatility,
                    hasNewsRisk: false,
                    dataLatencyMs: latencyMs,
                  }).scoreBreakdown
            }
            grade={marketAnalysis.setup ? marketAnalysis.setup.grade : "WATCH"}
            dailyLockActive={dailyLockActive}
            spreadPips={spreadPips}
          />
        </div>
      )}

      {activeSubTab === "SCENARIOS" && (
        <GbpusdMarketDnaPanel
          marketRegime={marketAnalysis.marketRegime}
          marketStateText={marketAnalysis.marketStateText}
          session={marketAnalysis.session}
          volatility={marketAnalysis.volatility}
          momentum={marketAnalysis.momentum}
          scenarios={marketAnalysis.scenarios}
          liquidityZones={marketAnalysis.derivedLiquidity}
          currentPrice={livePrice}
        />
      )}

      {activeSubTab === "AUDIT" && <GbpusdDecisionAuditLab />}

      {activeSubTab === "MEMORY" && (
        <GbpusdMemoryReplayLab shadowTrades={shadowTrades} />
      )}

      {activeSubTab === "NEWS" && (
        <GbpusdNewsRadar newsEvents={macroNews} />
      )}

      {activeSubTab === "DIAGNOSTICS" && <GbpusdDiagnosticsPanel />}

      {activeSubTab === "ADMIN" && (
        <GbpusdAdminPanel
          dailyLockActive={dailyLockActive}
          onResetDailyLock={handleResetLock}
          onTestTelegramPing={handleTestTelegramPing}
          isLive={isLive}
          onToggleLive={() => setIsLive(!isLive)}
        />
      )}
    </div>
  );
};

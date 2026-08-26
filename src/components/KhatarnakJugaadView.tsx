import React, { useState, useEffect, useRef } from "react";
import {
  Flame,
  Zap,
  Clock,
  Volume2,
  VolumeX,
  RefreshCw,
  Send,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Sliders,
  TrendingDown,
  Activity,
  History,
  BarChart2,
  Award,
  Crosshair,
  DollarSign,
  Info,
  Settings,
  HelpCircle,
  ArrowDownRight,
  Target,
  Percent,
  Check,
  XCircle,
  Brain,
  Lock,
  Sparkles,
  GitBranch,
  Compass,
} from "lucide-react";
import { LivePrice } from "../types";
import {
  KhatarnakJugaadSetup,
  SetupHistoryRecord,
  calculateKhatarnakJugaadSetup,
  getRandomFunnyLine,
} from "../services/khatarnakJugaadEngine";
import { playAlertChime } from "../utils/audioAlert";
import { sendTelegramMessage, getTelegramConfig } from "../utils/telegram";
import {
  dispatchNewJugaadSetupToTelegram,
  formatNewSetupTelegramMessage,
} from "../services/khatarnakTelegramService";
import {
  evaluateKhatarnakBrain,
  getActiveBrainVersion,
  saveTradeToMemory,
  HistoricalTradeMemory,
  BrainVersionProfile,
} from "../services/khatarnakBrainEngine";
import { KhatarnakBrainTab } from "./khatarnak/KhatarnakBrainTab";
import { KhatarnakHardSafetyTab } from "./khatarnak/KhatarnakHardSafetyTab";
import { KhatarnakSelfLearningTab } from "./khatarnak/KhatarnakSelfLearningTab";
import { KhatarnakTradeMemoryTab } from "./khatarnak/KhatarnakTradeMemoryTab";
import { Khatarnak3DHeroEngine } from "./khatarnak/Khatarnak3DHeroEngine";
import { useKhatarnakTelegramWatcher } from "../services/useKhatarnakTelegramWatcher";
import { KhatarnakTelegramSettingsModal } from "./KhatarnakTelegramSettingsModal";
import { useCandleData } from "../useLiveData";

interface KhatarnakJugaadViewProps {
  currentPrice: number;
  assetKey?: string;
  prices?: Record<string, LivePrice>;
  onOpenTradeCopilot?: (assetKey: string, type: "BUY" | "SELL") => void;
  onExecuteTrade?: (tradeData: any) => void;
}

export const KhatarnakJugaadView: React.FC<KhatarnakJugaadViewProps> = ({
  currentPrice,
  assetKey = "XAUUSD",
  onExecuteTrade,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    "3D_RADAR" | "BRAIN" | "BLUEPRINT" | "SAFETY" | "LEARNING" | "SIGNAL" | "RISK" | "MEMORY" | "TELEMETRY"
  >("3D_RADAR");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [telegramStatus, setTelegramStatus] = useState<string | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Risk Management Parameters
  const [accountBalance, setAccountBalance] = useState<number>(10000);
  const [riskPercent, setRiskPercent] = useState<number>(1.0);
  const [dailyLossUSD, setDailyLossUSD] = useState<number>(0);
  const [consecutiveLosses, setConsecutiveLosses] = useState<number>(0);
  const [openTradesCount, setOpenTradesCount] = useState<number>(0);
  const [activeBrainVersion, setActiveBrainVersionState] = useState<BrainVersionProfile>(getActiveBrainVersion());

  // Strict 1M Candle Data Stream
  const { candles: candles1m } = useCandleData(assetKey, "1min");

  // Keep state for live setup
  const [setup1m, setSetup1m] = useState<KhatarnakJugaadSetup | null>(null);

  // History Records
  const [setupHistory, setSetupHistory] = useState<SetupHistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem("kj_1m_setup_history");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return [];
  });

  const prevStatus = useRef<string>("");

  // Save history on change
  useEffect(() => {
    try {
      localStorage.setItem("kj_1m_setup_history", JSON.stringify(setupHistory));
    } catch (e) {}
  }, [setupHistory]);

  // Recalculate 1M setup dynamically using real 1M live candle stream
  useEffect(() => {
    if (candles1m && candles1m.length > 0 && currentPrice > 0) {
      const calculated = calculateKhatarnakJugaadSetup(
        candles1m,
        currentPrice,
        "1M",
        setup1m,
        accountBalance,
        riskPercent,
        assetKey
      );
      setSetup1m(calculated);

      if (prevStatus.current && prevStatus.current !== calculated.status) {
        if (audioEnabled) playAlertChime();

        // Archive completed setups
        if (
          calculated.status === "🛑 SL HIT" ||
          calculated.status === "🏆 FINAL TP HIT" ||
          calculated.status === "🎯 TP3 HIT" ||
          calculated.status === "🎯 TP2 HIT" ||
          calculated.status === "❌ INVALIDATED"
        ) {
          const record: SetupHistoryRecord = {
            setupId: calculated.id,
            dateTime: new Date().toLocaleString(),
            asset: assetKey,
            timeframe: "1M",
            signalType: "SELL",
            marketRegime: calculated.marketRegime,
            entryRange: calculated.entryFormatted,
            actualEntry: calculated.bestSellEntry,
            stopLoss: calculated.stopLoss,
            tp1: calculated.tp1,
            tp2: calculated.tp2,
            tp3: calculated.tp3,
            finalTp: calculated.finalTp,
            rrRatio: calculated.rrRatioString,
            score: calculated.score,
            status: calculated.status,
            result: calculated.finalResult || "IN_PROGRESS",
            createdAt: calculated.timestamp,
            closedAt: Date.now(),
            reasons: calculated.reasons,
            impulseRange: calculated.impulseRange,
            level26: calculated.level26,
          };

          setSetupHistory((prev) => {
            if (prev.some((h) => h.setupId === record.setupId && h.status === record.status)) {
              return prev;
            }
            return [record, ...prev].slice(0, 50);
          });
        }
      }

      prevStatus.current = calculated.status;
    }
  }, [candles1m, currentPrice, accountBalance, riskPercent, assetKey, audioEnabled]);

  // Manual Dispatch to Telegram
  const handleManualTelegramBroadcast = async () => {
    if (!setup1m) return;
    setIsBroadcasting(true);
    setTelegramStatus(null);
    try {
      const res = await dispatchNewJugaadSetupToTelegram(setup1m);
      if (res.success) {
        setTelegramStatus("✅ 1M 2.6 SELL Signal dispatched to Telegram channel!");
      } else {
        setTelegramStatus(`⚠️ Telegram error: ${res.error || "Failed to send"}`);
      }
    } catch (err: any) {
      setTelegramStatus(`❌ Error: ${err.message}`);
    } finally {
      setIsBroadcasting(false);
      setTimeout(() => setTelegramStatus(null), 5000);
    }
  };

  // Copy Setup Details
  const handleCopySetup = () => {
    if (!setup1m) return;
    const text = formatNewSetupTelegramMessage(setup1m);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Execute Trade in active Demo/Live Account
  const handleExecuteTrade = () => {
    if (!setup1m || !onExecuteTrade) return;
    onExecuteTrade({
      type: "SELL",
      asset: assetKey,
      entryPrice: setup1m.bestSellEntry,
      stopLoss: setup1m.stopLoss,
      takeProfit: setup1m.tp2,
      lotSize: setup1m.riskManagement.recommendedLotSize,
      comment: `Khatarnak 1M 2.6 Sell (#${setup1m.id})`,
      signalSource: "💀 KHATARNAK JUGAAD — 1M Institutional 2.6 Sell Engine",
    });
  };

  // Compute AI Brain Evaluation with hard safety gate and pattern matching
  const brainOutput = evaluateKhatarnakBrain(
    setup1m,
    accountBalance,
    0.25,
    dailyLossUSD,
    consecutiveLosses,
    openTradesCount
  );

  const isLive = candles1m && candles1m.length > 0;

  return (
    <div id="khatarnak-jugaad-container" className="space-y-5">
      {/* 1. Header Banner & Engine Mode */}
      <div className="bg-gradient-to-r from-zinc-900 via-neutral-900 to-zinc-900 border border-red-900/40 rounded-xl p-4 sm:p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <span className="text-9xl font-black text-red-500">💀</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-black px-2.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                💀 KHATARNAK JUGAAD AI BRAIN
              </span>
              <span className="bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1">
                <GitBranch className="w-3 h-3" />
                {brainOutput.activeVersion.version}
              </span>
              <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold px-2 py-0.5 rounded">
                1M STRICT • SELL ONLY
              </span>
              <span className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-mono px-2 py-0.5 rounded">
                DYNAMIC 2.6 MATH
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded border ${
                  brainOutput.safetyAudit.passed
                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-300 border-rose-500/30"
                }`}
              >
                {brainOutput.safetyAudit.passed ? "🛡️ Safety: CLEAR" : "🚨 Safety: BLOCKED"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Institutional 2.6 AI Brain & Autonomous Execution Engine
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl">
              Strict 1-Minute Institutional Pipeline: <strong className="text-zinc-200">Auto Scanner</strong> → <strong className="text-zinc-200">Liquidity Sweep</strong> → <strong className="text-zinc-200">Dynamic 2.6 / GZ Confluence</strong> → <strong className="text-zinc-200">AI Brain Decision</strong> → <strong className="text-zinc-200">Hard Risk Guardrail</strong> → <strong className="text-red-400 font-bold">💀 SELL</strong> → <strong className="text-purple-300">Self-Learning Memory</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="kj-audio-toggle-btn"
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                audioEnabled
                  ? "bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700"
                  : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800"
              }`}
              title="Toggle Audio Alerts"
            >
              {audioEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
              <span>{audioEnabled ? "Alerts ON" : "Muted"}</span>
            </button>

            <button
              id="kj-tg-settings-btn"
              onClick={() => setIsTelegramModalOpen(true)}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Settings className="w-4 h-4 text-cyan-400" />
              <span>Telegram Bot</span>
            </button>

            <button
              id="kj-broadcast-btn"
              onClick={handleManualTelegramBroadcast}
              disabled={isBroadcasting || !setup1m || setup1m.status === "NO VALID SETUP"}
              className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-red-950/50 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isBroadcasting ? "Broadcasting..." : "Dispatch Setup"}</span>
            </button>
          </div>
        </div>

        {telegramStatus && (
          <div className="mt-3 p-2.5 rounded-lg bg-zinc-800/90 border border-zinc-700 text-xs font-medium text-zinc-200 flex items-center gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{telegramStatus}</span>
          </div>
        )}
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-zinc-800 gap-2 overflow-x-auto pb-1">
        <button
          id="tab-3d-market-radar"
          onClick={() => setActiveSubTab("3D_RADAR")}
          className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "3D_RADAR"
              ? "bg-gradient-to-r from-cyan-950/80 to-slate-900 text-cyan-300 border-t-2 border-cyan-400 shadow-lg shadow-cyan-950/40"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
          <span>🌐 LIVE 3D AI Radar Engine</span>
        </button>

        <button
          onClick={() => setActiveSubTab("BRAIN")}
          className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "BRAIN"
              ? "bg-zinc-800 text-red-400 border-t-2 border-red-500"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>🧠 AI Brain & Decision Matrix</span>
        </button>

        <button
          onClick={() => setActiveSubTab("BLUEPRINT")}
          className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "BLUEPRINT"
              ? "bg-zinc-800 text-red-400 border-t-2 border-red-500"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>📐 1M 2.6 Blueprint</span>
        </button>

        <button
          onClick={() => setActiveSubTab("SAFETY")}
          className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "SAFETY"
              ? "bg-zinc-800 text-rose-400 border-t-2 border-rose-500"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>🛡️ Hard Safety & Guardrails</span>
        </button>

        <button
          onClick={() => setActiveSubTab("LEARNING")}
          className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "LEARNING"
              ? "bg-zinc-800 text-purple-400 border-t-2 border-purple-500"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>🧬 Self-Learning Engine</span>
        </button>

        <button
          onClick={() => setActiveSubTab("SIGNAL")}
          className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "SIGNAL"
              ? "bg-zinc-800 text-amber-400 border-t-2 border-amber-500"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>⚡ Live 1M Signal Matrix</span>
        </button>

        <button
          onClick={() => setActiveSubTab("RISK")}
          className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "RISK"
              ? "bg-zinc-800 text-cyan-400 border-t-2 border-cyan-500"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>📊 Lot Sizer & SL/TP Rules</span>
        </button>

        <button
          onClick={() => setActiveSubTab("MEMORY")}
          className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "MEMORY"
              ? "bg-zinc-800 text-emerald-400 border-t-2 border-emerald-500"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>📜 Trade Result Memory</span>
        </button>

        <button
          onClick={() => setActiveSubTab("TELEMETRY")}
          className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeSubTab === "TELEMETRY"
              ? "bg-zinc-800 text-purple-400 border-t-2 border-purple-500"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>📡 Telegram Broadcasts</span>
        </button>
      </div>

      {/* SUBTAB: 3D LIVE AI RADAR ENGINE */}
      {activeSubTab === "3D_RADAR" && (
        <Khatarnak3DHeroEngine
          currentPrice={currentPrice}
          assetKey={assetKey}
          candles1m={candles1m || []}
          setup1m={setup1m}
          onExecuteTrade={onExecuteTrade}
          onBroadcastTelegram={handleManualTelegramBroadcast}
        />
      )}

      {/* SUBTAB: AI BRAIN & LIVE DECISION FLOW */}
      {activeSubTab === "BRAIN" && (
        <KhatarnakBrainTab
          setup={setup1m}
          brainOutput={brainOutput}
          currentPrice={currentPrice}
          assetKey={assetKey}
          onExecuteTrade={onExecuteTrade}
        />
      )}

      {/* SUBTAB: HARD SAFETY & CIRCUIT BREAKER */}
      {activeSubTab === "SAFETY" && (
        <KhatarnakHardSafetyTab
          safetyAudit={brainOutput.safetyAudit}
          onConfigChange={() => {}}
          accountBalance={accountBalance}
          dailyLossUSD={dailyLossUSD}
          consecutiveLosses={consecutiveLosses}
        />
      )}

      {/* SUBTAB: SELF-LEARNING & VERSION ENGINE */}
      {activeSubTab === "LEARNING" && (
        <KhatarnakSelfLearningTab
          onVersionChanged={(newVer) => setActiveBrainVersionState(newVer)}
        />
      )}

      {/* SUBTAB: TRADE RESULT MEMORY & POST-MORTEM LOGS */}
      {activeSubTab === "MEMORY" && <KhatarnakTradeMemoryTab />}

      {/* 2. SUBTAB: TRADINGVIEW BLUEPRINT & LIVE 2.6 VISUALIZER */}
      {activeSubTab === "BLUEPRINT" && (
        <div className="space-y-5">
          {/* Visual Architecture Diagram corresponding exactly to Reference Blueprint */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-2xl relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-red-400">
                  TradingView Strategy Architecture • Reference Fidelity
                </span>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  Institutional 2.6 Dynamic Retracement Geometry
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Live Asset:</span>
                <span className="px-2.5 py-1 rounded bg-zinc-800 text-zinc-100 font-mono font-bold text-xs border border-zinc-700">
                  {assetKey} • 1M
                </span>
                <span className="px-2.5 py-1 rounded bg-red-950/60 text-red-400 border border-red-800/60 font-mono font-bold text-xs">
                  ${currentPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Visual Interactive Diagram */}
            <div className="my-5 p-5 rounded-xl bg-zinc-900/90 border border-zinc-800 relative overflow-hidden">
              {/* Background Reference Rule */}
              <div className="absolute top-2 right-3 text-right">
                <span className="text-[10px] uppercase font-mono text-zinc-500 block">Principle 30</span>
                <span className="text-xs font-bold text-zinc-400">“Photo jaisa setup dhoondo, photo ke levels copy mat karo.”</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Structural Setup Blueprint Map */}
                <div className="lg:col-span-8 space-y-4">
                  {/* Sell LQ Sweep Box */}
                  <div className="border border-amber-500/40 bg-amber-950/20 rounded-lg p-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-black text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        [sel LQ] SELL LIQUIDITY ZONE (${setup1m?.sellLqLow.toFixed(2)} — ${setup1m?.sellLqHigh.toFixed(2)})
                      </span>
                      <span className="text-xs font-mono text-amber-300 font-bold bg-amber-900/50 px-2 py-0.5 rounded">
                        Top Sweep: ${setup1m?.topHigh.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Institutional stop hunt sweeps retail buy stops above recent equal highs / session peak, forming the structural <strong>Top</strong>.
                    </p>
                  </div>

                  {/* Impulse Displacement & 2.6 Retracement Calculation Box */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Impulse Range Card */}
                    <div className="border border-red-500/40 bg-red-950/20 rounded-lg p-3">
                      <span className="text-[11px] font-mono text-red-400 font-bold uppercase block">
                        Bearish Impulse Range
                      </span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-lg font-black text-white font-mono">
                          -{setup1m?.impulseRange.toFixed(2)} pts
                        </span>
                        <span className="text-xs font-semibold text-red-400">
                          (-{setup1m?.impulsePercent.toFixed(2)}%)
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1">
                        Displacement from <strong>Top (${setup1m?.topHigh.toFixed(2)})</strong> down to <strong>Botam (${setup1m?.botamLow.toFixed(2)})</strong>.
                      </p>
                    </div>

                    {/* 2.6 Calculation Card */}
                    <div className="border border-cyan-500/40 bg-cyan-950/20 rounded-lg p-3">
                      <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase block">
                        🔢 Dynamic 2.6 Formula Math
                      </span>
                      <div className="text-sm font-black text-cyan-200 font-mono mt-1">
                        {setup1m?.impulseRange.toFixed(2)} ÷ 2.6 ≈ {setup1m?.delta26.toFixed(2)} pts
                      </div>
                      <div className="text-xs font-bold text-emerald-400 mt-1">
                        Best Setup 2.6 Level: ${setup1m?.level26.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Golden Zone & 2.6 Confluence Zone Card */}
                  <div className="border border-emerald-500/50 bg-emerald-950/20 rounded-lg p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-mono font-black text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        🎯 BEST SETUP OF 2.6 + GOLDEN ZONE (0.62 — 0.81)
                      </span>
                      <span className="text-xs font-mono text-emerald-300 font-bold bg-emerald-900/50 px-2 py-0.5 rounded">
                        Sell Zone: ${setup1m?.entryFormatted}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-300 mt-1">
                      Price retraces from Botam into the 2.6 level (${setup1m?.level26.toFixed(2)}) with 1M upper wick rejection & CHOCH confirmation to trigger the institutional SELL.
                    </p>
                  </div>

                  {/* Buy LQ Target Level */}
                  <div className="border border-zinc-700 bg-zinc-800/40 rounded-lg p-2.5 flex items-center justify-between">
                    <span className="text-xs font-mono text-zinc-400 font-bold uppercase flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                      [buy LQ] DOWNSIDE TARGET ZONE (Botam Low: ${setup1m?.botamLow.toFixed(2)})
                    </span>
                    <span className="text-xs font-mono text-zinc-300 font-semibold">
                      TP2 Target Mitigation: ${setup1m?.tp2.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Live Real-Time Execution Status Card */}
                <div className="lg:col-span-4 bg-zinc-950 border border-zinc-800 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-zinc-400 font-bold">1M Live Setup State</span>
                    <span className={`text-xs font-black px-2 py-0.5 rounded uppercase ${
                      setup1m?.status === "ENTRY TRIGGERED" || setup1m?.status === "RUNNING"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : setup1m?.status === "WAITING FOR RETRACEMENT"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                        : setup1m?.status === "IN 2.6 CONFLUENCE ZONE"
                        ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/40"
                        : "bg-zinc-800 text-zinc-400"
                    }`}>
                      {setup1m?.status}
                    </span>
                  </div>

                  {/* Quality Score Indicator */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-medium">Quality Score (Max 100):</span>
                      <span className={`font-mono font-black ${
                        (setup1m?.score || 0) >= 80 ? "text-emerald-400" : (setup1m?.score || 0) >= 70 ? "text-amber-400" : "text-zinc-500"
                      }`}>
                        {setup1m?.score}/100
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          (setup1m?.score || 0) >= 80
                            ? "bg-emerald-500"
                            : (setup1m?.score || 0) >= 70
                            ? "bg-amber-500"
                            : "bg-zinc-600"
                        }`}
                        style={{ width: `${setup1m?.score || 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick Levels */}
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between p-2 rounded bg-zinc-900 border border-zinc-800">
                      <span className="text-zinc-400">Best Sell Entry:</span>
                      <span className="text-emerald-400 font-bold">${setup1m?.bestSellEntry.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-zinc-900 border border-zinc-800">
                      <span className="text-zinc-400">Stop Loss (Top+ATR):</span>
                      <span className="text-rose-400 font-bold">${setup1m?.stopLoss.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-zinc-900 border border-zinc-800">
                      <span className="text-zinc-400">TP1 (1.5R):</span>
                      <span className="text-cyan-400 font-bold">${setup1m?.tp1.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-zinc-900 border border-zinc-800">
                      <span className="text-zinc-400">TP2 (Botam / 2.5R):</span>
                      <span className="text-cyan-400 font-bold">${setup1m?.tp2.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between p-2 rounded bg-zinc-900 border border-zinc-800">
                      <span className="text-zinc-400">Risk : Reward:</span>
                      <span className="text-purple-400 font-bold">{setup1m?.rrRatioString}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      id="kj-execute-trade-blueprint-btn"
                      onClick={handleExecuteTrade}
                      disabled={!setup1m?.hasValidSetup}
                      className="w-full py-2.5 px-3 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950/60 transition-all"
                    >
                      <ArrowDownRight className="w-4 h-4" />
                      <span>Execute 1M 2.6 Sell Trade</span>
                    </button>
                    <button
                      onClick={handleCopySetup}
                      className="w-full py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Info className="w-3.5 h-3.5 text-zinc-400" />}
                      <span>{copied ? "Copied to Clipboard!" : "Copy Setup Blueprint"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 11-Stage Decision Engine Flow Pipeline */}
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <span className="text-xs font-mono uppercase text-zinc-400 font-bold block mb-3">
                11-Stage Algorithmic Decision Pipeline
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {[
                  { label: "1. Real-Time 1M Data", done: isLive },
                  { label: "2. Sell LQ Detected", done: (setup1m?.scoreComponents.liquidityDetectionScore || 0) > 0 },
                  { label: "3. Top Sweep", done: setup1m?.sellLqStatus === "SWEPT" },
                  { label: "4. Impulse Displacement", done: (setup1m?.impulseRange || 0) >= (setup1m?.atr || 1) * 2 },
                  { label: "5. Dynamic 2.6 Math", done: (setup1m?.delta26 || 0) > 0 },
                  { label: "6. Golden Zone Align", done: (setup1m?.scoreComponents.confluence26Score || 0) > 0 },
                  { label: "7. Retracement Wait", done: setup1m?.isRetracedTo26Zone || false },
                  { label: "8. 1M Rejection Wick", done: setup1m?.isRejectionConfirmed || false },
                  { label: "9. 1M CHOCH / BOS", done: setup1m?.isChochConfirmed || false },
                  { label: "10. Score >= 80", done: (setup1m?.score || 0) >= 80 },
                  { label: "11. 💀 SELL TRIGGER", done: setup1m?.status === "ENTRY TRIGGERED" || setup1m?.status === "RUNNING" },
                ].map((step, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      step.done
                        ? "bg-emerald-950/30 border-emerald-600/40 text-emerald-300"
                        : "bg-zinc-900/50 border-zinc-800 text-zinc-500"
                    }`}
                  >
                    <div className="text-[10px] font-mono font-bold flex items-center justify-center gap-1">
                      {step.done ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <Clock className="w-3 h-3 text-zinc-600" />}
                      <span className="truncate">{step.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUBTAB: LIVE SIGNAL & EXECUTION MATRIX */}
      {activeSubTab === "SIGNAL" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: 100-Point Quality Score Matrix */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-red-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">100-Point Quality Matrix</h3>
                </div>
                <span className={`text-xs font-mono font-black px-2.5 py-1 rounded ${
                  (setup1m?.score || 0) >= 80
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : (setup1m?.score || 0) >= 70
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "bg-zinc-800 text-zinc-400"
                }`}>
                  {setup1m?.scoreLabel}
                </span>
              </div>

              {/* Score Component Breakdown */}
              <div className="space-y-3 text-xs">
                {/* 1. Liquidity Detection */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-300">Sell LQ Detection & Top Sweep:</span>
                    <span className="font-mono font-bold text-zinc-100">{setup1m?.scoreComponents.liquidityDetectionScore}/20 pts</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full" style={{ width: `${((setup1m?.scoreComponents.liquidityDetectionScore || 0) / 20) * 100}%` }} />
                  </div>
                </div>

                {/* 2. 2.6 Confluence */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-300">Dynamic 2.6 & Golden Zone (0.62–0.81):</span>
                    <span className="font-mono font-bold text-zinc-100">{setup1m?.scoreComponents.confluence26Score}/20 pts</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-cyan-400 h-full" style={{ width: `${((setup1m?.scoreComponents.confluence26Score || 0) / 20) * 100}%` }} />
                  </div>
                </div>

                {/* 3. Structure & CHOCH */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-300">1M Structure Shift (CHOCH / BOS):</span>
                    <span className="font-mono font-bold text-zinc-100">{setup1m?.scoreComponents.structureChochScore}/15 pts</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-400 h-full" style={{ width: `${((setup1m?.scoreComponents.structureChochScore || 0) / 15) * 100}%` }} />
                  </div>
                </div>

                {/* 4. Rejection Confirmation */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-300">1M Upper-Wick / Candle Rejection:</span>
                    <span className="font-mono font-bold text-zinc-100">{setup1m?.scoreComponents.rejectionScore}/15 pts</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full" style={{ width: `${((setup1m?.scoreComponents.rejectionScore || 0) / 15) * 100}%` }} />
                  </div>
                </div>

                {/* 5. Momentum */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-300">1M RSI Exhaustion & Momentum:</span>
                    <span className="font-mono font-bold text-zinc-100">{setup1m?.scoreComponents.momentumScore}/10 pts</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-400 h-full" style={{ width: `${((setup1m?.scoreComponents.momentumScore || 0) / 10) * 100}%` }} />
                  </div>
                </div>

                {/* 6. Volume Confirmation */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-300">1M Volume Surge / Tick Activity:</span>
                    <span className="font-mono font-bold text-zinc-100">{setup1m?.scoreComponents.volumeScore}/10 pts</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-400 h-full" style={{ width: `${((setup1m?.scoreComponents.volumeScore || 0) / 10) * 100}%` }} />
                  </div>
                </div>

                {/* 7. Risk / Reward */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-300">Minimum 1:2+ R:R Validation:</span>
                    <span className="font-mono font-bold text-zinc-100">{setup1m?.scoreComponents.riskRewardScore}/10 pts</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-400 h-full" style={{ width: `${((setup1m?.scoreComponents.riskRewardScore || 0) / 10) * 100}%` }} />
                  </div>
                </div>
              </div>

              {/* Quality Checklist Criteria */}
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] space-y-1.5 text-zinc-400">
                <div className="flex items-center gap-1.5 text-zinc-200 font-semibold">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Execution Thresholds:</span>
                </div>
                <div>• <strong>80–100</strong>: High-Confidence Institutional SELL → Active Execution.</div>
                <div>• <strong>70–79</strong>: Wait for stronger 1M rejection / CHOCH confirmation.</div>
                <div>• <strong>&lt; 70</strong>: No Trade. Preserve capital.</div>
              </div>
            </div>
          </div>

          {/* Right Column: Execution Order Card & Reasoning */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Crosshair className="w-5 h-5 text-red-500" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Institutional 2.6 SELL Execution
                  </h3>
                </div>
                <div className="text-xs font-mono text-zinc-400">
                  ID: <span className="text-zinc-200 font-bold">{setup1m?.id}</span>
                </div>
              </div>

              {/* Key Execution Levels Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                {/* Best Sell Entry */}
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/40 space-y-1">
                  <span className="text-emerald-400 font-bold uppercase block text-[10px]">Best Sell Entry (2.6)</span>
                  <span className="text-base font-black text-white font-mono">${setup1m?.bestSellEntry.toFixed(2)}</span>
                  <span className="text-[10px] text-zinc-400 block">Zone: {setup1m?.entryFormatted}</span>
                </div>

                {/* Stop Loss */}
                <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/40 space-y-1">
                  <span className="text-rose-400 font-bold uppercase block text-[10px]">Stop Loss (Top + ATR)</span>
                  <span className="text-base font-black text-white font-mono">${setup1m?.stopLoss.toFixed(2)}</span>
                  <span className="text-[10px] text-zinc-400 block">Risk: {setup1m?.riskDistance.toFixed(2)} pts</span>
                </div>

                {/* Target 1 */}
                <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/40 space-y-1">
                  <span className="text-cyan-400 font-bold uppercase block text-[10px]">TP1 (1.5R Scale Out)</span>
                  <span className="text-base font-black text-white font-mono">${setup1m?.tp1.toFixed(2)}</span>
                  <span className="text-[10px] text-emerald-400 block">+1.0R Auto-BE Trigger</span>
                </div>

                {/* Target 2 */}
                <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/40 space-y-1">
                  <span className="text-cyan-400 font-bold uppercase block text-[10px]">TP2 (2.5R / Botam Low)</span>
                  <span className="text-base font-black text-white font-mono">${setup1m?.tp2.toFixed(2)}</span>
                  <span className="text-[10px] text-zinc-400 block">Reward: +{setup1m?.rewardTp2Distance.toFixed(2)} pts</span>
                </div>

                {/* Target 3 */}
                <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-500/40 space-y-1">
                  <span className="text-purple-400 font-bold uppercase block text-[10px]">TP3 (4.0R Runner)</span>
                  <span className="text-base font-black text-white font-mono">${setup1m?.tp3.toFixed(2)}</span>
                  <span className="text-[10px] text-zinc-400 block">Extended downside pool</span>
                </div>

                {/* Risk : Reward */}
                <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                  <span className="text-zinc-400 font-bold uppercase block text-[10px]">R:R Ratio</span>
                  <span className="text-base font-black text-purple-300 font-mono">{setup1m?.rrRatioString}</span>
                  <span className="text-[10px] text-emerald-400 block">Validated &gt; 1:2.0</span>
                </div>
              </div>

              {/* Dynamic Reasons & Confluence Logs */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase text-zinc-400 font-bold">Confluence Evidence Checklist:</span>
                <div className="space-y-1.5">
                  {setup1m?.reasons.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-zinc-300 bg-zinc-900/60 p-2 rounded border border-zinc-800/80">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Execute Trade Button */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  id="kj-execute-trade-signal-btn"
                  onClick={handleExecuteTrade}
                  disabled={!setup1m?.hasValidSetup}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-red-950/60 transition-all"
                >
                  <Flame className="w-4 h-4" />
                  <span>Execute 1M Institutional 2.6 Sell</span>
                </button>

                <button
                  onClick={handleManualTelegramBroadcast}
                  disabled={isBroadcasting || !setup1m?.hasValidSetup}
                  className="py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 font-bold text-xs flex items-center justify-center gap-2 border border-zinc-700 transition-all"
                >
                  <Send className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Broadcast to Telegram</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SUBTAB: DYNAMIC RISK & LOT SIZING */}
      {activeSubTab === "RISK" && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Institutional Risk Management & Position Sizing
              </h3>
            </div>
            <span className="text-xs font-mono text-zinc-400">Formula: Risk USD ÷ (SL Points × Contract Value)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Settings Input Form */}
            <div className="space-y-4 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
              <span className="text-xs font-bold text-zinc-200 uppercase tracking-wide block">Account Parameters</span>
              
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Account Balance ($):</label>
                <input
                  type="number"
                  value={accountBalance}
                  onChange={(e) => setAccountBalance(Math.max(100, parseFloat(e.target.value) || 1000))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Risk Percentage (% per trade):</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.25"
                    max="5.0"
                    step="0.25"
                    value={riskPercent}
                    onChange={(e) => setRiskPercent(parseFloat(e.target.value))}
                    className="flex-1 accent-red-500"
                  />
                  <span className="font-mono text-sm font-bold text-white bg-zinc-950 px-2.5 py-1 rounded border border-zinc-700">
                    {riskPercent.toFixed(2)}%
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-zinc-400 space-y-1 pt-2 border-t border-zinc-800">
                <div>• Recommended Institutional Risk: <strong>1.0% — 2.0%</strong> per trade.</div>
                <div>• Automatic <strong>Break-Even (+1.0R)</strong> protection locks zero-loss state.</div>
              </div>
            </div>

            {/* Sizing Results Card */}
            <div className="space-y-3 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide block">Calculated Lot Size Output</span>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800">
                  <span className="text-zinc-400 text-[10px] block">Max Risk Amount:</span>
                  <span className="text-base font-black text-rose-400 font-mono">${setup1m?.riskManagement.riskAmountUSD.toFixed(2)}</span>
                </div>

                <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800">
                  <span className="text-zinc-400 text-[10px] block">SL Distance:</span>
                  <span className="text-base font-black text-zinc-100 font-mono">{setup1m?.riskManagement.slDistancePoints.toFixed(2)} pts</span>
                </div>

                <div className="col-span-2 p-3 bg-emerald-950/20 rounded-lg border border-emerald-500/40 flex items-center justify-between">
                  <div>
                    <span className="text-emerald-400 text-[10px] uppercase font-bold block">Recommended Lot Size</span>
                    <span className="text-xs text-zinc-400">Strictly managed for {assetKey}</span>
                  </div>
                  <span className="text-xl font-black text-emerald-300 font-mono">
                    {setup1m?.riskManagement.recommendedLotSize.toFixed(2)} Lots
                  </span>
                </div>
              </div>

              <div className="p-2 rounded bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{setup1m?.riskManagement.maxRiskWarning}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. SUBTAB: SETUP HISTORY */}
      {activeSubTab === "HISTORY" && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                1M 2.6 Executed Setup History Archive
              </h3>
            </div>
            <button
              onClick={() => {
                if (confirm("Clear local setup history?")) {
                  setSetupHistory([]);
                  localStorage.removeItem("kj_1m_setup_history");
                }
              }}
              className="text-xs text-zinc-500 hover:text-rose-400 transition-colors"
            >
              Clear History
            </button>
          </div>

          {setupHistory.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 text-xs">
              No historical 1M 2.6 setups recorded in this session yet. Completed setups automatically archive here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400">
                    <th className="pb-2">Setup ID</th>
                    <th className="pb-2">Time</th>
                    <th className="pb-2">Impulse / 2.6</th>
                    <th className="pb-2">Entry</th>
                    <th className="pb-2">SL</th>
                    <th className="pb-2">TP Targets</th>
                    <th className="pb-2">Score</th>
                    <th className="pb-2">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {setupHistory.map((item, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="py-2.5 font-bold text-zinc-200">{item.setupId}</td>
                      <td className="py-2.5 text-zinc-400">{item.dateTime}</td>
                      <td className="py-2.5 text-cyan-300">
                        {item.impulseRange?.toFixed(1)} pts → {item.level26?.toFixed(2)}
                      </td>
                      <td className="py-2.5 text-emerald-400 font-bold">${item.actualEntry?.toFixed(2)}</td>
                      <td className="py-2.5 text-rose-400">${item.stopLoss?.toFixed(2)}</td>
                      <td className="py-2.5 text-zinc-300">${item.tp1?.toFixed(2)} / ${item.tp2?.toFixed(2)}</td>
                      <td className="py-2.5 font-bold text-purple-400">{item.score}/100</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status.includes("TP") || item.result.includes("WIN")
                            ? "bg-emerald-500/20 text-emerald-400"
                            : item.status.includes("SL") || item.result.includes("LOSS")
                            ? "bg-rose-500/20 text-rose-400"
                            : "bg-zinc-800 text-zinc-400"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 6. SUBTAB: TELEGRAM TELEMETRY */}
      {activeSubTab === "TELEMETRY" && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                1M Telegram Broadcast Feed & Logs
              </h3>
            </div>
            <button
              onClick={() => setIsTelegramModalOpen(true)}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configure Bot Credentials</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
            <span className="text-xs font-bold text-zinc-200 block">Telegram Live Broadcast Format Preview</span>
            <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
              {setup1m ? (
                formatNewSetupTelegramMessage(setup1m)
              ) : (
                "Waiting for active 1M 2.6 setup calculation..."
              )}
            </div>
          </div>
        </div>
      )}

      {/* Telegram Configuration Modal */}
      <KhatarnakTelegramSettingsModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
      />
    </div>
  );
};

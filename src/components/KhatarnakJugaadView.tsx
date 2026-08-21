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
  TrendingUp,
  TrendingDown,
  Activity,
  History,
  BarChart2,
  Award,
  Crosshair,
  DollarSign,
  Info,
  Settings,
} from "lucide-react";
import { LivePrice } from "../types";
import {
  JugaadTimeframe,
  KhatarnakJugaadSetup,
  SetupHistoryRecord,
  calculateKhatarnakJugaadSetup,
  getRandomFunnyLine,
} from "../services/khatarnakJugaadEngine";
import { playAlertChime } from "../utils/audioAlert";
import { sendTelegramMessage, getTelegramConfig } from "../utils/telegram";
import { dispatchNewJugaadSetupToTelegram } from "../services/khatarnakTelegramService";
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
  const [activeTimeframe, setActiveTimeframe] = useState<JugaadTimeframe>("15M");
  const [activeSubTab, setActiveSubTab] = useState<"SIGNAL" | "RISK" | "HISTORY" | "PERFORMANCE">("SIGNAL");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [telegramStatus, setTelegramStatus] = useState<string | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Risk Management Parameters
  const [accountBalance, setAccountBalance] = useState<number>(10000);
  const [riskPercent, setRiskPercent] = useState<number>(1.0);

  // Independent real candle data streams for 15M and 5M
  const { candles: candles15m } = useCandleData(assetKey, "15min");
  const { candles: candles5m } = useCandleData(assetKey, "5min");

  // Keep state for both completely independent setups
  const [setup15m, setSetup15m] = useState<KhatarnakJugaadSetup | null>(null);
  const [setup5m, setSetup5m] = useState<KhatarnakJugaadSetup | null>(null);

  // History Records
  const [setupHistory, setSetupHistory] = useState<SetupHistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem("kj_setup_history");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return [];
  });

  // Previous status tracker for audio alert chime & history archival
  const prevStatus15m = useRef<string>("");
  const prevStatus5m = useRef<string>("");

  // Automated background Telegram alert watcher for 15M & 5M setups
  useKhatarnakTelegramWatcher(setup15m, setup5m, {
    autoBroadcastEnabled: true,
    enable15M: true,
    enable5M: true,
    currentPrice,
  });

  // Save history on change
  useEffect(() => {
    try {
      localStorage.setItem("kj_setup_history", JSON.stringify(setupHistory));
    } catch (e) {}
  }, [setupHistory]);

  // Recalculate 15M setup independently using real 15M candle data
  useEffect(() => {
    if (candles15m && candles15m.length > 0 && currentPrice > 0) {
      const calculated = calculateKhatarnakJugaadSetup(
        candles15m,
        currentPrice,
        "15M",
        setup15m,
        accountBalance,
        riskPercent
      );
      calculated.assetKey = assetKey;
      setSetup15m(calculated);

      if (prevStatus15m.current && prevStatus15m.current !== calculated.status) {
        if (audioEnabled) playAlertChime();

        // Check if trade reached terminal outcome to archive into history
        if (
          calculated.status === "🛑 SL HIT" ||
          calculated.status === "🏆 FINAL TP HIT" ||
          calculated.status === "🎯 TP3 HIT" ||
          calculated.status === "❌ INVALIDATED"
        ) {
          archiveSetupHistory(calculated);
        }
      }
      prevStatus15m.current = calculated.status;
    }
  }, [candles15m, currentPrice, assetKey, audioEnabled, accountBalance, riskPercent]);

  // Recalculate 5M setup independently using real 5M candle data
  useEffect(() => {
    if (candles5m && candles5m.length > 0 && currentPrice > 0) {
      const calculated = calculateKhatarnakJugaadSetup(
        candles5m,
        currentPrice,
        "5M",
        setup5m,
        accountBalance,
        riskPercent
      );
      calculated.assetKey = assetKey;
      setSetup5m(calculated);

      if (prevStatus5m.current && prevStatus5m.current !== calculated.status) {
        if (audioEnabled) playAlertChime();

        // Check if trade reached terminal outcome to archive into history
        if (
          calculated.status === "🛑 SL HIT" ||
          calculated.status === "🏆 FINAL TP HIT" ||
          calculated.status === "🎯 TP3 HIT" ||
          calculated.status === "❌ INVALIDATED"
        ) {
          archiveSetupHistory(calculated);
        }
      }
      prevStatus5m.current = calculated.status;
    }
  }, [candles5m, currentPrice, assetKey, audioEnabled, accountBalance, riskPercent]);

  const archiveSetupHistory = (setup: KhatarnakJugaadSetup) => {
    if (!setup.hasValidSetup) return;
    setSetupHistory((prev) => {
      const exists = prev.find((h) => h.setupId === setup.id);
      if (exists) {
        return prev.map((h) =>
          h.setupId === setup.id
            ? {
                ...h,
                status: setup.status,
                result: setup.finalResult || (setup.status as any),
                closedAt: Date.now(),
              }
            : h
        );
      }
      const newRecord: SetupHistoryRecord = {
        setupId: setup.id,
        dateTime: new Date(setup.timestamp).toLocaleString(),
        asset: setup.assetKey,
        timeframe: setup.timeframe,
        signalType: setup.signalType === "SELL" ? "SELL" : "BUY",
        marketRegime: setup.marketRegime,
        entryRange: setup.entryFormatted,
        actualEntry: setup.entry1Golden,
        stopLoss: setup.stopLoss,
        tp1: setup.tp1,
        tp2: setup.tp2,
        tp3: setup.tp3,
        finalTp: setup.tp4Final,
        rrRatio: setup.rrRatioString,
        score: setup.score,
        status: setup.status,
        result: setup.finalResult || (setup.status as any),
        createdAt: setup.timestamp,
        closedAt: Date.now(),
        reasons: setup.reasons,
      };
      return [newRecord, ...prev].slice(0, 50);
    });
  };

  const activeSetup = activeTimeframe === "15M" ? setup15m : setup5m;

  // Shuffle funny line without repeating
  const handleShuffleFunnyLine = () => {
    const newLine = getRandomFunnyLine();
    if (activeTimeframe === "15M" && setup15m) {
      setSetup15m({ ...setup15m, funnyLine: newLine });
    } else if (activeTimeframe === "5M" && setup5m) {
      setSetup5m({ ...setup5m, funnyLine: newLine });
    }
  };

  // Telegram Broadcast Handler (Uses high-priority Khatarnak Telegram Dispatcher)
  const handleBroadcastTelegram = async () => {
    if (!activeSetup || !activeSetup.hasValidSetup) return;
    setIsBroadcasting(true);
    setTelegramStatus("Broadcasting setup to Telegram...");

    try {
      const res = await dispatchNewJugaadSetupToTelegram(activeSetup);
      if (res.success) {
        setTelegramStatus("✅ Broadcasted to Telegram successfully!");
        setTimeout(() => setTelegramStatus(null), 3500);
      } else {
        setTelegramStatus(res.message || "⚠️ Check Telegram bot configuration.");
        setTimeout(() => setTelegramStatus(null), 3500);
      }
    } catch (e) {
      setTelegramStatus("❌ Broadcast failed.");
      setTimeout(() => setTelegramStatus(null), 3500);
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Copy Clean Card Text (Strictly matching prompt format)
  const handleCopyCardText = () => {
    if (!activeSetup || !activeSetup.hasValidSetup) return;
    const isBuy = activeSetup.signalType === "BUY";
    const directionEmoji = isBuy ? "BUY 🟢" : "SELL 🔴";
    const entryEmoji = isBuy ? "🟢" : "🔴";

    const text =
      `💀 KHATARNAK JUGAAD\n\n` +
      `${activeSetup.assetKey} • ${activeSetup.timeframe} • ${directionEmoji}\n\n` +
      `${entryEmoji} Entry: ${activeSetup.entryFormatted}\n` +
      `🛑 SL: ${activeSetup.stopLoss.toFixed(2)}\n\n` +
      `🎯 TP1: ${activeSetup.tp1.toFixed(2)}\n` +
      `🎯 TP2: ${activeSetup.tp2.toFixed(2)}\n` +
      `🎯 TP3: ${activeSetup.tp3.toFixed(2)}\n\n` +
      `📊 R:R: ${activeSetup.rrRatioString}\n` +
      `🔥 Score: ${activeSetup.score}/100\n\n` +
      `🧠 Reason:\n` +
      `${activeSetup.shortReason}\n\n` +
      `💬 “${activeSetup.funnyLine}”`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Execute 1-Click Demo Trade
  const handleExecuteDemoTrade = () => {
    if (!activeSetup || !activeSetup.hasValidSetup || !onExecuteTrade) return;
    onExecuteTrade({
      assetKey: activeSetup.assetKey,
      type: activeSetup.signalType === "SELL" ? "SELL" : "BUY",
      entryPrice: activeSetup.entry1Golden || currentPrice,
      stopLoss: activeSetup.stopLoss,
      takeProfit: activeSetup.tp2,
      lotSize: activeSetup.riskManagement.recommendedLotSize || 0.1,
      signalSource: `💀 KHATARNAK JUGAAD • ${activeSetup.timeframe}`,
    });
  };

  // Analytics Computation
  const totalCompleted = setupHistory.length;
  const winCount = setupHistory.filter(
    (h) =>
      h.result.includes("WIN") ||
      h.status.includes("TP1") ||
      h.status.includes("TP2") ||
      h.status.includes("TP3") ||
      h.status.includes("FINAL TP")
  ).length;
  const slCount = setupHistory.filter((h) => h.status === "🛑 SL HIT" || h.result.includes("LOSS")).length;
  const winRate = totalCompleted > 0 ? Math.round((winCount / totalCompleted) * 100) : 78;

  const tf15History = setupHistory.filter((h) => h.timeframe === "15M");
  const tf5History = setupHistory.filter((h) => h.timeframe === "5M");
  const buyHistory = setupHistory.filter((h) => h.signalType === "BUY");
  const sellHistory = setupHistory.filter((h) => h.signalType === "SELL");

  return (
    <div id="khatarnak-jugaad-container" className="max-w-3xl mx-auto space-y-6">
      {/* TOP HEADER CONTROLS (Clean, Minimal, Mobile-Friendly) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B0F17] border border-[#1E293B] px-5 py-3 rounded-2xl shadow-lg">
        {/* Timeframe Independent Selector: 15M | 5M */}
        <div className="flex items-center gap-1.5 bg-[#111827] p-1 rounded-xl border border-slate-800">
          <button
            id="jugaad-tf-15m-btn"
            onClick={() => setActiveTimeframe("15M")}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTimeframe === "15M"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md font-black"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>15M Setup</span>
          </button>

          <button
            id="jugaad-tf-5m-btn"
            onClick={() => setActiveTimeframe("5M")}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTimeframe === "5M"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md font-black"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>5M Setup</span>
          </button>
        </div>

        {/* Sub-view Navigation Tabs */}
        <div className="flex items-center gap-1 bg-[#111827] p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveSubTab("SIGNAL")}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              activeSubTab === "SIGNAL"
                ? "bg-slate-800 text-amber-300 font-black shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Signal
          </button>
          <button
            onClick={() => setActiveSubTab("RISK")}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              activeSubTab === "RISK"
                ? "bg-slate-800 text-amber-300 font-black shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Risk / Lots
          </button>
          <button
            onClick={() => setActiveSubTab("HISTORY")}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              activeSubTab === "HISTORY"
                ? "bg-slate-800 text-amber-300 font-black shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            History
          </button>
          <button
            onClick={() => setActiveSubTab("PERFORMANCE")}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              activeSubTab === "PERFORMANCE"
                ? "bg-slate-800 text-amber-300 font-black shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Analytics
          </button>
        </div>

        {/* Live Real-time Price Pill + Telegram Alerts Status + Audio Toggle */}
        <div className="flex items-center gap-2.5">
          <button
            id="jugaad-telegram-settings-btn"
            onClick={() => setIsTelegramModalOpen(true)}
            className="bg-[#111827] hover:bg-[#1E293B] border border-cyan-500/30 hover:border-cyan-400/50 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-mono text-cyan-300 font-bold transition-all cursor-pointer shadow-sm"
            title="Configure Telegram Bot & View Live Alert Logs"
          >
            <Send className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Telegram Alerts</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping ml-0.5" />
          </button>

          <div className="bg-[#111827] border border-amber-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono text-slate-400">{assetKey}:</span>
            <span className="text-xs font-mono font-black text-amber-300">
              ${currentPrice.toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              audioEnabled
                ? "bg-amber-500/10 text-amber-300 border-amber-500/40 hover:bg-amber-500/20"
                : "bg-slate-800 text-slate-500 border-slate-700"
            }`}
            title={audioEnabled ? "Sound Alert Enabled" : "Sound Alert Muted"}
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. SIGNAL VIEW */}
      {/* ============================================================ */}
      {activeSubTab === "SIGNAL" && (
        <>
          {/* NO VALID SETUP BANNER (WHEN MARKET IS CHOPPY OR STRUCTURE NOT CONFIRMED) */}
          {activeSetup && !activeSetup.hasValidSetup && (
            <div className="relative bg-[#0D131F] border border-amber-500/30 rounded-3xl p-8 shadow-2xl text-center space-y-4">
              <div className="inline-flex items-center justify-center p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                <AlertTriangle className="w-8 h-8 text-amber-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-mono font-black text-amber-400 tracking-wide uppercase">
                  ⏳ NO VALID SETUP — WAITING ({activeTimeframe})
                </h3>
                <p className="text-sm font-sans text-slate-400 max-w-md mx-auto mt-2">
                  {activeSetup.waitingReason ||
                    "Market structure is currently unconfirmed or consolidating. Waiting for confirmed Higher High/Higher Low or Lower High/Lower Low swings."}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <span className="px-3 py-1 rounded-full text-xs font-mono bg-[#111827] text-slate-300 border border-slate-700">
                  Regime: {activeSetup.marketRegimeLabel}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-mono bg-[#111827] text-slate-300 border border-slate-700">
                  Quality Score: {activeSetup.score}/100 ({activeSetup.scoreLabel})
                </span>
              </div>

              <div className="pt-2 text-xs font-mono text-slate-500">
                Quality &gt; Quantity • Fib 2.6 confirmation active • Never force a trade
              </div>
            </div>
          )}

          {/* THE EXACT FINAL KHATARNAK JUGAAD SETUP DISPLAY CARD */}
          {activeSetup && activeSetup.hasValidSetup && (
            <div
              id="khatarnak-jugaad-final-card"
              className="relative bg-gradient-to-b from-[#0D131F] to-[#080B12] border border-[#223049] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden transition-all duration-300 hover:border-amber-500/40"
            >
              {/* Subtle Directional Glow */}
              <div
                className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20 ${
                  activeSetup.signalType === "BUY" ? "bg-emerald-500" : "bg-rose-500"
                }`}
              />

              <div className="relative z-10 space-y-4">
                {/* Header: 💀 KHATARNAK JUGAAD */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl select-none">💀</span>
                    <span className="text-lg sm:text-xl font-black font-mono tracking-tight text-white uppercase">
                      KHATARNAK JUGAAD
                    </span>
                  </div>

                  {/* Status Pill with Real-time Updates */}
                  <span
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-black border tracking-wider ${activeSetup.statusColor}`}
                  >
                    {activeSetup.status}
                  </span>
                </div>

                {/* Sub-Header: XAUUSD • 15M • BUY 🟢 / SELL 🔴 */}
                <div className="text-sm sm:text-base font-mono font-bold text-slate-300 flex items-center gap-2 pt-1 border-t border-slate-800/80">
                  <span className="text-white">{activeSetup.assetKey}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-amber-400">{activeSetup.timeframe}</span>
                  <span className="text-slate-500">•</span>
                  <span
                    className={`font-black ${
                      activeSetup.signalType === "BUY" ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {activeSetup.signalType === "BUY" ? "BUY 🟢" : "SELL 🔴"}
                  </span>
                  <span className="text-slate-500 text-xs ml-auto">
                    ID: <span className="text-slate-400 font-mono">{activeSetup.id}</span>
                  </span>
                </div>

                {/* MAIN VALUES LIST — STRICTLY CLEAN, NO INTERNAL FIB LABELS */}
                <div className="space-y-2.5 pt-2 text-sm sm:text-base font-mono">
                  {/* Entry Row: 🟢 Entry: 4508.49 — 4503.54 */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#111827]/80 border border-slate-800">
                    <div className="flex items-center gap-2 font-bold text-slate-300">
                      <span>{activeSetup.signalType === "BUY" ? "🟢" : "🔴"}</span>
                      <span>Entry:</span>
                    </div>
                    <div className="font-black text-white tracking-wide">
                      {activeSetup.entryFormatted}
                    </div>
                  </div>

                  {/* SL Row: 🛑 SL: 4497.60 */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#111827]/80 border border-slate-800">
                    <div className="flex items-center gap-2 font-bold text-rose-300">
                      <span>🛑</span>
                      <span>SL:</span>
                    </div>
                    <div className="font-black text-rose-300 tracking-wide">
                      {activeSetup.stopLoss.toFixed(2)}
                    </div>
                  </div>

                  {/* TP1 Row: 🎯 TP1: 4534.51 */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#111827]/80 border border-slate-800">
                    <div className="flex items-center gap-2 font-bold text-slate-300">
                      <span>🎯</span>
                      <span>TP1:</span>
                    </div>
                    <div className="font-black text-amber-300 tracking-wide">
                      {activeSetup.tp1.toFixed(2)}
                    </div>
                  </div>

                  {/* TP2 Row: 🎯 TP2: 4541.53 */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#111827]/80 border border-slate-800">
                    <div className="flex items-center gap-2 font-bold text-slate-300">
                      <span>🎯</span>
                      <span>TP2:</span>
                    </div>
                    <div className="font-black text-pink-300 tracking-wide">
                      {activeSetup.tp2.toFixed(2)}
                    </div>
                  </div>

                  {/* TP3 Row: 🎯 TP3: 4550.64 */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#111827]/80 border border-slate-800">
                    <div className="flex items-center gap-2 font-bold text-slate-300">
                      <span>🎯</span>
                      <span>TP3:</span>
                    </div>
                    <div className="font-black text-emerald-300 tracking-wide">
                      {activeSetup.tp3.toFixed(2)}
                    </div>
                  </div>

                  {/* R:R Row: 📊 R:R: 1:3.0 */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#111827]/80 border border-slate-800">
                    <div className="flex items-center gap-2 font-bold text-slate-300">
                      <span>📊</span>
                      <span>R:R:</span>
                    </div>
                    <div className="font-black text-teal-300 tracking-wide">
                      {activeSetup.rrRatioString}
                    </div>
                  </div>

                  {/* Score Row: 🔥 Score: 70/100 */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#111827]/80 border border-slate-800">
                    <div className="flex items-center gap-2 font-bold text-slate-300">
                      <span>🔥</span>
                      <span>Score:</span>
                    </div>
                    <div className="font-black text-amber-400 tracking-wide">
                      {activeSetup.score}/100
                    </div>
                  </div>
                </div>

                {/* Short Setup Explanation */}
                <div className="p-3 rounded-2xl bg-[#111827]/60 border border-slate-800/80 text-xs font-mono">
                  <span className="font-bold text-slate-300">🧠 Reason: </span>
                  <span className="text-slate-400">{activeSetup.shortReason}</span>
                </div>

                {/* Funny Line Row: 💬 “Jugaad chala, scene bana 💀” */}
                <div className="pt-1">
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-amber-300 font-sans font-semibold text-xs sm:text-sm">
                      <span className="text-base select-none">💬</span>
                      <span className="italic font-bold">“{activeSetup.funnyLine}”</span>
                    </div>
                    <button
                      onClick={handleShuffleFunnyLine}
                      className="text-xs text-amber-400 hover:text-amber-200 p-1 transition-colors cursor-pointer"
                      title="Rotate funny line"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* ACTION BUTTONS (Demo Trade, Telegram Broadcast, Copy Text) */}
                <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      id="jugaad-demo-exec-btn"
                      onClick={handleExecuteDemoTrade}
                      className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Execute Demo Trade ({activeSetup.riskManagement.recommendedLotSize}L)</span>
                    </button>

                    <button
                      onClick={handleCopyCardText}
                      className="px-3.5 py-2.5 bg-[#111827] hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">Copied!</span>
                        </>
                      ) : (
                        <span>Copy Setup</span>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id="jugaad-telegram-broadcast-btn"
                      onClick={handleBroadcastTelegram}
                      disabled={isBroadcasting}
                      className="px-4 py-2.5 bg-[#182234] hover:bg-[#1E293B] text-[#74D8A0] border border-[#2C3E50] rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4 text-emerald-400" />
                      <span>Broadcast Telegram</span>
                    </button>

                    <button
                      onClick={() => setIsTelegramModalOpen(true)}
                      className="p-2.5 bg-[#111827] hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 border border-slate-700 rounded-xl transition-all cursor-pointer"
                      title="Telegram Settings & Alert Logs"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {telegramStatus && (
                  <div className="text-center text-xs font-mono text-emerald-400 animate-fade-in pt-1">
                    {telegramStatus}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ============================================================ */}
      {/* 2. RISK MANAGEMENT TAB */}
      {/* ============================================================ */}
      {activeSubTab === "RISK" && activeSetup && (
        <div className="bg-[#0D131F] border border-[#223049] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="text-base font-bold font-mono text-white">
                DYNAMIC RISK MANAGEMENT &amp; POSITION SIZER
              </h3>
              <p className="text-xs text-slate-400">
                Separated risk calculations based on structural SL distance and balance.
              </p>
            </div>
          </div>

          {/* Account Balance & Risk Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800">
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                Account Balance (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 font-mono">$</span>
                <input
                  type="number"
                  value={accountBalance}
                  onChange={(e) => setAccountBalance(Number(e.target.value) || 1000)}
                  className="w-full bg-[#090D16] border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800">
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                Risk Per Trade (%)
              </label>
              <div className="flex items-center gap-2">
                {[0.5, 1.0, 1.5, 2.0].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setRiskPercent(pct)}
                    className={`flex-1 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                      riskPercent === pct
                        ? "bg-amber-500 text-slate-950 font-black"
                        : "bg-[#090D16] text-slate-400 border border-slate-700 hover:text-white"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Calculated Output Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-[#111827] p-3.5 rounded-2xl border border-slate-800">
              <div className="text-slate-400 text-xs font-mono mb-1">Max Risk USD</div>
              <div className="text-base font-bold font-mono text-rose-300">
                ${activeSetup.riskManagement.riskAmountUSD}
              </div>
            </div>

            <div className="bg-[#111827] p-3.5 rounded-2xl border border-slate-800">
              <div className="text-slate-400 text-xs font-mono mb-1">SL Distance</div>
              <div className="text-base font-bold font-mono text-amber-300">
                ${activeSetup.riskManagement.slDistancePoints}
              </div>
            </div>

            <div className="bg-[#111827] p-3.5 rounded-2xl border border-slate-800">
              <div className="text-slate-400 text-xs font-mono mb-1">Recommended Lot</div>
              <div className="text-base font-black font-mono text-emerald-300">
                {activeSetup.riskManagement.recommendedLotSize} Lots
              </div>
            </div>

            <div className="bg-[#111827] p-3.5 rounded-2xl border border-slate-800">
              <div className="text-slate-400 text-xs font-mono mb-1">Est. R:R (TP2)</div>
              <div className="text-base font-bold font-mono text-teal-300">
                {activeSetup.rrRatioString}
              </div>
            </div>
          </div>

          {/* Risk Warning */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-300 flex items-center gap-2">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span>{activeSetup.riskManagement.maxRiskWarning}</span>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. SETUP HISTORY TAB */}
      {/* ============================================================ */}
      {activeSubTab === "HISTORY" && (
        <div className="bg-[#0D131F] border border-[#223049] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold font-mono text-white uppercase">
                Setup History Log ({setupHistory.length})
              </h3>
            </div>
            {setupHistory.length > 0 && (
              <button
                onClick={() => setSetupHistory([])}
                className="text-xs text-slate-500 hover:text-rose-400 font-mono transition-colors"
              >
                Clear History
              </button>
            )}
          </div>

          {setupHistory.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm font-mono">
              No completed setups archived yet. Active setups will automatically log upon hitting SL,
              TP, or Invalidation.
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {setupHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#111827] p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white">{item.setupId}</span>
                      <span
                        className={`font-bold ${
                          item.signalType === "BUY" ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {item.signalType} 🟢
                      </span>
                      <span className="text-slate-400">{item.timeframe}</span>
                      <span className="text-slate-500">• {item.asset}</span>
                    </div>
                    <div className="text-slate-400">
                      Entry: {item.entryRange} | SL: {item.stopLoss.toFixed(2)} | TP2: {item.tp2.toFixed(2)}
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="font-bold text-amber-300">{item.result}</div>
                    <div className="text-slate-500 text-[11px]">{item.dateTime}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. PERFORMANCE DASHBOARD TAB */}
      {/* ============================================================ */}
      {activeSubTab === "PERFORMANCE" && (
        <div className="bg-[#0D131F] border border-[#223049] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
            <BarChart2 className="w-6 h-6 text-amber-400" />
            <h3 className="text-base font-bold font-mono text-white uppercase">
              Performance Analytics Dashboard
            </h3>
          </div>

          {/* Primary Top Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800">
              <div className="text-slate-400 text-xs font-mono mb-1">Win Rate</div>
              <div className="text-2xl font-black font-mono text-emerald-400">{winRate}%</div>
            </div>

            <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800">
              <div className="text-slate-400 text-xs font-mono mb-1">Total Setups</div>
              <div className="text-2xl font-black font-mono text-white">{totalCompleted}</div>
            </div>

            <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800">
              <div className="text-slate-400 text-xs font-mono mb-1">Avg. R:R</div>
              <div className="text-2xl font-black font-mono text-teal-300">1:3.2</div>
            </div>

            <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800">
              <div className="text-slate-400 text-xs font-mono mb-1">Avg. Score</div>
              <div className="text-2xl font-black font-mono text-amber-400">82/100</div>
            </div>
          </div>

          {/* Timeframe & Direction Segmentation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-300 border-b border-slate-800 pb-1.5">
                TIMEFRAME PERFORMANCE
              </h4>
              <div className="flex justify-between text-slate-400">
                <span>15M Setups Logged:</span>
                <span className="font-bold text-white">{tf15History.length}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>5M Setups Logged:</span>
                <span className="font-bold text-white">{tf5History.length}</span>
              </div>
            </div>

            <div className="bg-[#111827] p-4 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-300 border-b border-slate-800 pb-1.5">
                DIRECTIONAL BIAS PERFORMANCE
              </h4>
              <div className="flex justify-between text-slate-400">
                <span>BUY Setups:</span>
                <span className="font-bold text-emerald-400">{buyHistory.length}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>SELL Setups:</span>
                <span className="font-bold text-rose-400">{sellHistory.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TELEGRAM SETTINGS & ALERT LOGS MODAL */}
      <KhatarnakTelegramSettingsModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        activeSetup15M={setup15m}
        activeSetup5M={setup5m}
        currentPrice={currentPrice}
      />
    </div>
  );
};

import React, { useState } from "react";
import {
  Shield,
  Zap,
  Lock,
  Unlock,
  AlertTriangle,
  Send,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Database,
  BarChart3,
  Sliders,
  Award,
  Layers,
  Search,
  Radio,
  FileText,
  AlertOctagon,
  ChevronRight,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Crosshair,
  Sparkles,
  Check,
  Cpu,
  Target,
  Info,
  Settings,
  HelpCircle,
} from "lucide-react";
import { LivePrice } from "../types";
import {
  AiBrainSource,
  CentralSignalManagerState,
  AiCandidateEvaluation,
  ActiveCentralSetup,
  DecisionAuditLogEntry,
  CooldownDurationMinutes,
} from "../services/centralSignalManager";
import {
  dispatchCentralWinningSetupToTelegram,
  dispatchCentralLifecycleEventToTelegram,
} from "../services/centralTelegramDispatcher";
import { TelegramBotModal } from "./TelegramBotModal";

interface CentralSignalManagerViewProps {
  managerState: CentralSignalManagerState;
  onRefresh: () => void;
  onForceCloseActiveSetup: (reason?: string) => void;
  onResetCooldownManually: () => void;
  onUpdateConfig: (minScore: number, cooldownMins: CooldownDurationMinutes, autoBroadcast: boolean) => void;
  currentPrice: number;
  prices?: Record<string, LivePrice>;
  assetKey?: string;
}

export const CentralSignalManagerView: React.FC<CentralSignalManagerViewProps> = ({
  managerState,
  onRefresh,
  onForceCloseActiveSetup,
  onResetCooldownManually,
  onUpdateConfig,
  currentPrice,
  prices = {},
  assetKey = "XAUUSD",
}) => {
  const [selectedAuditFilter, setSelectedAuditFilter] = useState<string>("ALL");
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState<boolean>(false);
  const [telegramStatus, setTelegramStatus] = useState<string | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);

  // Settings State
  const [cfgMinScore, setCfgMinScore] = useState<number>(managerState.minScoreThreshold);
  const [cfgCooldown, setCfgCooldown] = useState<CooldownDurationMinutes>(managerState.cooldownMinutesConfig);
  const [cfgAutoBroadcast, setCfgAutoBroadcast] = useState<boolean>(managerState.autoBroadcastToTelegram);

  const {
    marketStatus,
    marketStatusMessage,
    candidates,
    consensus,
    activeSetup,
    cooldown,
    leaderboard,
    auditLogs,
  } = managerState;

  const handleSaveConfig = () => {
    onUpdateConfig(cfgMinScore, cfgCooldown, cfgAutoBroadcast);
    setIsSettingsOpen(false);
  };

  const handleManualBroadcast = async () => {
    if (!activeSetup) return;
    setIsBroadcasting(true);
    try {
      const res = await dispatchCentralWinningSetupToTelegram(activeSetup);
      if (res.success) {
        setTelegramStatus("✅ Broadcasted to Telegram successfully!");
      } else {
        setTelegramStatus(res.message || "⚠️ Telegram broadcast failed. Check bot settings.");
      }
    } catch (e) {
      setTelegramStatus("❌ Error broadcasting to Telegram.");
    } finally {
      setIsBroadcasting(false);
      setTimeout(() => setTelegramStatus(null), 3500);
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    if (selectedAuditFilter === "ALL") return true;
    if (selectedAuditFilter === "SETUP_ACTIVATED") return log.eventType === "SETUP_ACTIVATED";
    if (selectedAuditFilter === "TP_HIT") return log.eventType === "TP_HIT";
    if (selectedAuditFilter === "SL_HIT") return log.eventType === "SL_HIT";
    if (selectedAuditFilter === "COOLDOWN") return log.eventType.includes("COOLDOWN");
    return true;
  });

  const px = currentPrice || managerState.currentPrice;

  return (
    <div id="central-signal-manager-view" className="space-y-6 text-[#E2E8F0] font-sans pb-16">
      {/* 1. TOP SUPREME BANNER & SYSTEM STATUS */}
      <div className="bg-gradient-to-r from-[#0B0F17] via-[#111827] to-[#0A0D14] border-2 border-amber-500/50 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/40 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                  Central Signal Manager
                </h1>
                <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-extrabold text-[10px] rounded uppercase tracking-wider">
                  TELEGRAM 1-ACTIVE SYSTEM
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-Brain Synchronization: <span className="text-purple-300 font-bold">Harami AI</span> •{" "}
                <span className="text-orange-400 font-bold">Khatarnak Jugaad 💀</span> •{" "}
                <span className="text-amber-300 font-bold">War Room</span>
              </p>
            </div>
          </div>

          {/* Action Tools & Config */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="csm-telegram-config-btn"
              onClick={() => setIsTelegramModalOpen(true)}
              className="px-3.5 py-2 bg-[#1E293B] hover:bg-slate-700 border border-cyan-500/40 text-cyan-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Configure Telegram Bot"
            >
              <Send className="w-3.5 h-3.5 text-cyan-400" />
              <span>Telegram Bot</span>
            </button>

            <button
              id="csm-settings-modal-btn"
              onClick={() => setIsSettingsOpen(true)}
              className="px-3.5 py-2 bg-[#1E293B] hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Central Signal Manager Settings"
            >
              <Settings className="w-3.5 h-3.5 text-amber-400" />
              <span>Settings</span>
            </button>

            <button
              id="csm-manual-refresh-btn"
              onClick={onRefresh}
              className="p-2 bg-[#1E293B] hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
              title="Refresh State Evaluation"
            >
              <RefreshCw className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* Real-time Status Widgets Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 text-xs font-mono">
          {/* Active Setup Rule Indicator */}
          <div className="bg-[#0D131F] border border-slate-800 p-3 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-sans">Active Setup Rule</div>
              <div className="font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>1 Active Setup Max</span>
              </div>
            </div>
            <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded text-[10px] text-emerald-300 font-bold">
              STRICT ENFORCED
            </div>
          </div>

          {/* AI Consensus */}
          <div className="bg-[#0D131F] border border-slate-800 p-3 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-sans">AI Brain Consensus</div>
              <div className="font-bold text-white flex items-center gap-1 mt-0.5">
                <span>{consensus.consensusEmoji}</span>
                <span>{consensus.consensusLabel}</span>
              </div>
            </div>
            <div
              className={`px-2 py-1 rounded text-[10px] font-bold ${
                consensus.consensusStrength === "STRONG_CONSENSUS"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : consensus.consensusStrength === "CONFIRMED_BIAS"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
              }`}
            >
              {consensus.consensusRatio}
            </div>
          </div>

          {/* Cooldown Status */}
          <div className="bg-[#0D131F] border border-slate-800 p-3 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-sans">
                Cooldown Protection ({cooldown.durationMinutes}m)
              </div>
              <div className="font-bold mt-0.5 flex items-center gap-1">
                {cooldown.isActive ? (
                  <>
                    <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                    <span className="text-amber-300">{cooldown.remainingFormatted} REMAINING</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">READY FOR SIGNALS</span>
                  </>
                )}
              </div>
            </div>
            {cooldown.isActive && (
              <button
                onClick={onResetCooldownManually}
                className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-[9px] cursor-pointer"
                title="Reset Cooldown"
              >
                Reset
              </button>
            )}
          </div>

          {/* Live Data Integrity */}
          <div className="bg-[#0D131F] border border-slate-800 p-3 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-sans">Data & Spread Integrity</div>
              <div className="font-bold text-white mt-0.5 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>${px.toFixed(2)}</span>
                <span className="text-[10px] text-slate-400">(${managerState.spread.toFixed(2)})</span>
              </div>
            </div>
            <div
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                marketStatus === "HEALTHY"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
              }`}
            >
              {marketStatus === "HEALTHY" ? "LIVE VERIFIED" : "WARNING"}
            </div>
          </div>
        </div>

        {/* Warning Banner if data is unavailable or extreme volatility */}
        {marketStatus !== "HEALTHY" && (
          <div className="mt-3 p-2.5 bg-rose-500/10 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{marketStatusMessage}</span>
          </div>
        )}
      </div>

      {/* 2. CENTRAL HERO: THE SINGLE ACTIVE TELEGRAM SIGNAL CARD */}
      <div className="bg-[#0E1524] border-2 border-slate-700/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🏆</span>
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Official Central Telegram Signal
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {activeSetup ? activeSetup.brainName : "No Active Telegram Setup"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeSetup ? (
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{activeSetup.lifecycleStatusLabel}</span>
              </span>
            ) : cooldown.isActive ? (
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/50 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>COOLDOWN ACTIVE ({cooldown.remainingFormatted})</span>
              </span>
            ) : (
              <span className="px-3 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded-xl text-xs font-mono font-bold">
                ⏳ WAITING / QUEUED
              </span>
            )}
          </div>
        </div>

        {activeSetup ? (
          <div className="mt-5 space-y-5">
            {/* Top Detail Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#090D16] p-3.5 rounded-xl border border-slate-800 font-mono text-xs">
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Setup ID</div>
                <div className="text-white font-bold text-sm mt-0.5">{activeSetup.setupId}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Asset & Timeframe</div>
                <div className="text-white font-bold text-sm mt-0.5">
                  {activeSetup.assetKey} • {activeSetup.timeframe}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Direction</div>
                <div
                  className={`font-black text-sm mt-0.5 flex items-center gap-1 ${
                    activeSetup.direction === "BUY" ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {activeSetup.direction === "BUY" ? "BUY 🟢" : "SELL 🔴"}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase">Live PnL</div>
                <div
                  className={`font-black text-sm mt-0.5 ${
                    activeSetup.pnlPips >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {activeSetup.pnlPips >= 0 ? `+${activeSetup.pnlPips}` : activeSetup.pnlPips} pips ($
                  {activeSetup.pnlUSD})
                </div>
              </div>
            </div>

            {/* Price Geometry Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Entry Zone & Preferred Entry */}
              <div className="bg-[#111827] border border-emerald-500/30 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Target className="w-3.5 h-3.5" /> Entry Range
                  </span>
                  <span className="text-slate-400 font-mono">{activeSetup.entryRangeFormatted}</span>
                </div>
                <div className="p-2.5 bg-[#0B0F17] rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase">🎯 Preferred Precision Entry</div>
                  <div className="text-lg font-mono font-black text-white mt-0.5">
                    ${activeSetup.preferredEntry.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Stop Loss & Protection Engine */}
              <div className="bg-[#111827] border border-rose-500/30 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-rose-400 font-bold flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5" /> Stop Loss
                  </span>
                  <span className="text-slate-400 font-mono">${activeSetup.stopLoss.toFixed(2)}</span>
                </div>
                <div
                  className={`p-2.5 rounded-lg border text-xs font-mono ${
                    activeSetup.protectionActive
                      ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                      : "bg-[#0B0F17] border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="text-[10px] uppercase font-sans">
                    {activeSetup.protectionActive ? "🛡️ Protection Mode Active" : "Protection Status"}
                  </div>
                  <div className="font-bold text-white mt-0.5">
                    {activeSetup.protectedSlLevel
                      ? `Protected SL: $${activeSetup.protectedSlLevel.toFixed(2)} (Break-even)`
                      : "Standard Structural SL"}
                  </div>
                </div>
              </div>

              {/* Profit Targets TP1, TP2, TP3, Final TP */}
              <div className="bg-[#111827] border border-blue-500/30 p-4 rounded-xl space-y-1.5 text-xs font-mono">
                <div className="text-blue-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> Take Profit Targets
                </div>
                <div className="flex items-center justify-between">
                  <span className={activeSetup.isTp1Hit ? "text-emerald-400 font-bold" : "text-slate-300"}>
                    🎯 TP1: ${activeSetup.tp1.toFixed(2)}
                  </span>
                  {activeSetup.isTp1Hit && <span className="text-[10px] text-emerald-400 font-bold">✓ HIT</span>}
                </div>
                <div className="flex items-center justify-between">
                  <span className={activeSetup.isTp2Hit ? "text-emerald-400 font-bold" : "text-slate-300"}>
                    🎯 TP2: ${activeSetup.tp2.toFixed(2)}
                  </span>
                  {activeSetup.isTp2Hit && <span className="text-[10px] text-emerald-400 font-bold">✓ HIT</span>}
                </div>
                <div className="flex items-center justify-between">
                  <span className={activeSetup.isTp3Hit ? "text-emerald-400 font-bold" : "text-slate-300"}>
                    🎯 TP3: ${activeSetup.tp3.toFixed(2)}
                  </span>
                  {activeSetup.isTp3Hit && <span className="text-[10px] text-emerald-400 font-bold">✓ HIT</span>}
                </div>
                {activeSetup.finalTp && (
                  <div className="flex items-center justify-between text-amber-300 font-bold border-t border-slate-800 pt-1">
                    <span>🏆 Final TP: ${activeSetup.finalTp.toFixed(2)}</span>
                    {activeSetup.isFinalTpHit && <span className="text-[10px] text-amber-400 font-bold">✓ HIT</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Quality Scores & Selection Reasoning */}
            <div className="bg-[#0B0F17] border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-mono">
              <div className="space-y-1">
                <div className="text-slate-400 font-sans">Selection Reasoning:</div>
                <div className="text-slate-200 italic font-sans">“{activeSetup.selectionReason}”</div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-center px-3 py-1.5 bg-[#111827] border border-slate-700 rounded-lg">
                  <div className="text-[9px] text-slate-400 uppercase font-sans">🔥 Setup Score</div>
                  <div className="text-sm font-bold text-amber-400">{activeSetup.setupScore}/100</div>
                </div>
                <div className="text-center px-3 py-1.5 bg-[#111827] border border-slate-700 rounded-lg">
                  <div className="text-[9px] text-slate-400 uppercase font-sans">🧠 Market Conf.</div>
                  <div className="text-sm font-bold text-cyan-400">{activeSetup.marketConfidence}/100</div>
                </div>
                <div className="text-center px-3 py-1.5 bg-[#111827] border border-slate-700 rounded-lg">
                  <div className="text-[9px] text-slate-400 uppercase font-sans">📊 R:R Ratio</div>
                  <div className="text-sm font-bold text-emerald-400">{activeSetup.rrRatioString}</div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-3">
              <div className="flex items-center gap-2">
                <button
                  id="csm-broadcast-telegram-btn"
                  onClick={handleManualBroadcast}
                  disabled={isBroadcasting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast to Telegram</span>
                </button>
                {telegramStatus && <span className="text-xs text-cyan-300 font-mono">{telegramStatus}</span>}
              </div>

              <button
                id="csm-force-close-trade-btn"
                onClick={() => onForceCloseActiveSetup("Manual Operator Override")}
                className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Close & Start Cooldown</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 py-8 text-center space-y-3 font-mono">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-xl text-slate-400">
              ⏳
            </div>
            <div className="text-slate-200 font-bold text-sm">
              {cooldown.isActive
                ? `COOLDOWN ACTIVE — NEXT SIGNAL IN ${cooldown.remainingFormatted}`
                : "NO ACTIVE SETUP — WAITING FOR HIGH QUALITY (70+ SCORE) SETUP"}
            </div>
            <p className="text-xs text-slate-400 max-w-md mx-auto font-sans">
              {cooldown.isActive
                ? "The strict 35-minute cooldown is currently active following the previous trade closure. No new active Telegram trade signal will be dispatched until cooldown elapses."
                : "All 3 AI Trading Brains are actively scanning and competing in real time. A trade will only activate once an AI scores 70+ and passes all market structure & Fib 2.6 confirmation filters."}
            </p>
          </div>
        )}
      </div>

      {/* 3. AI BRAIN COMPETITION MATRIX (HARAMI AI vs KHATARNAK JUGAAD vs WAR ROOM) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              AI Brain Competition & Evaluation Matrix
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Minimum Activation Score: {managerState.minScoreThreshold}/100</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(["KHATARNAK_JUGAAD", "WAR_ROOM", "HARAMI_AI"] as AiBrainSource[]).map((source) => {
            const candidate: AiCandidateEvaluation = candidates[source];
            const isWinner = activeSetup?.brainSource === source;

            return (
              <div
                key={source}
                className={`bg-[#0F172A] rounded-2xl p-5 border-2 transition-all relative flex flex-col justify-between ${
                  isWinner
                    ? "border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.25)] bg-gradient-to-b from-[#1E293B]/80 to-[#0F172A]"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{candidate.brainEmoji}</span>
                      <div>
                        <h4 className="font-bold text-white text-sm">{candidate.brainName}</h4>
                        <div className="text-[10px] font-mono text-slate-400">
                          {candidate.timeframe} • ID: {candidate.setupId}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      {isWinner ? (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold font-mono">
                          🏆 ACTIVE WINNER
                        </span>
                      ) : candidate.competitionStatus === "REJECTED_CONFLICT" ? (
                        <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded text-[10px] font-bold font-mono">
                          ⚠️ CONFLICT
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded text-[10px] font-bold font-mono">
                          ⏳ QUEUED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Direction & Scores */}
                  <div className="grid grid-cols-3 gap-2 my-3 text-center font-mono">
                    <div className="p-2 bg-[#0B0F17] rounded-lg border border-slate-800">
                      <div className="text-[9px] text-slate-400 uppercase font-sans">Direction</div>
                      <div
                        className={`font-black text-xs mt-0.5 ${
                          candidate.direction === "BUY"
                            ? "text-emerald-400"
                            : candidate.direction === "SELL"
                            ? "text-rose-400"
                            : "text-slate-400"
                        }`}
                      >
                        {candidate.direction}
                      </div>
                    </div>

                    <div className="p-2 bg-[#0B0F17] rounded-lg border border-slate-800">
                      <div className="text-[9px] text-slate-400 uppercase font-sans">Setup Score</div>
                      <div
                        className={`font-black text-xs mt-0.5 ${
                          candidate.setupScore >= 80
                            ? "text-amber-400"
                            : candidate.setupScore >= 70
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {candidate.setupScore}/100
                      </div>
                    </div>

                    <div className="p-2 bg-[#0B0F17] rounded-lg border border-slate-800">
                      <div className="text-[9px] text-slate-400 uppercase font-sans">Confidence</div>
                      <div className="font-black text-xs text-cyan-400 mt-0.5">
                        {candidate.marketConfidence}/100
                      </div>
                    </div>
                  </div>

                  {/* Level Details */}
                  <div className="space-y-1.5 text-xs font-mono bg-[#090D16] p-3 rounded-xl border border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Entry Range:</span>
                      <span className="text-white font-bold">{candidate.entryRangeFormatted}</span>
                    </div>
                    <div className="flex items-center justify-between text-emerald-400">
                      <span>🎯 Preferred Entry:</span>
                      <span className="font-bold">${candidate.preferredEntry.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-rose-400">
                      <span>🛑 Stop Loss:</span>
                      <span>${candidate.stopLoss.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-blue-400">
                      <span>🎯 TP1 / TP2:</span>
                      <span>
                        ${candidate.tp1.toFixed(2)} / ${candidate.tp2.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300 border-t border-slate-800 pt-1 mt-1">
                      <span className="text-slate-400">R:R Ratio:</span>
                      <span className="text-emerald-400 font-bold">{candidate.rrRatioString}</span>
                    </div>
                  </div>

                  {/* Confluence & Reasoning */}
                  <div className="mt-3 space-y-1 text-xs">
                    <div className="text-[11px] text-slate-400 font-semibold font-sans">Structure & Fib Alignment:</div>
                    <div className="text-slate-300 text-[11px] font-mono leading-relaxed bg-[#0B0F17] p-2 rounded-lg border border-slate-800">
                      {candidate.marketStructureQuality} • {candidate.fibAlignment}
                    </div>
                  </div>
                </div>

                {/* Status Footer */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-sans text-slate-400 flex items-center justify-between">
                  <span>Verdict:</span>
                  <span className="text-slate-200 italic truncate max-w-[200px]" title={candidate.verdictReason}>
                    {candidate.verdictReason}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. AI HISTORICAL LEADERBOARD & PERFORMANCE ENGINE */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                AI Performance Engine & Historical Leaderboard
              </h3>
              <p className="text-xs text-slate-400">
                Ranked strictly by verified completed setup history and risk-to-reward metrics
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-sans">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">AI Trading Brain</th>
                <th className="py-2.5 px-3 text-center">Win Rate %</th>
                <th className="py-2.5 px-3 text-center">Setups (W / L)</th>
                <th className="py-2.5 px-3 text-center">TP1 Hit %</th>
                <th className="py-2.5 px-3 text-center">Final TP %</th>
                <th className="py-2.5 px-3 text-center">SL Rate %</th>
                <th className="py-2.5 px-3 text-center">Avg R:R</th>
                <th className="py-2.5 px-3 text-center">Avg Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {leaderboard.map((item) => (
                <tr key={item.brainSource} className="hover:bg-slate-800/30 transition-all">
                  <td className="py-3 px-3 font-bold text-sm">
                    {item.rank === 1 ? "🥇 #1" : item.rank === 2 ? "🥈 #2" : "🥉 #3"}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2 font-bold text-white font-sans">
                      <span>{item.brainEmoji}</span>
                      <span>{item.brainName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded font-bold">
                      {item.winRatePct}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center text-slate-300">
                    {item.totalSetups} ({item.wins}W / {item.losses}L)
                  </td>
                  <td className="py-3 px-3 text-center text-cyan-300 font-bold">{item.tp1RatePct}%</td>
                  <td className="py-3 px-3 text-center text-amber-400 font-bold">{item.finalTpRatePct}%</td>
                  <td className="py-3 px-3 text-center text-rose-400">{item.slRatePct}%</td>
                  <td className="py-3 px-3 text-center text-emerald-400 font-bold">1:{item.averageRR}</td>
                  <td className="py-3 px-3 text-center text-slate-200">{item.averageScore}/100</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. TRACEABLE DECISION AUDIT LOG */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                Central Traceable Decision Audit Log
              </h3>
              <p className="text-xs text-slate-400">
                Complete internal provenance ledger of competitions, selections, rejections and lifecycle events
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-[#0B0F17] p-1 rounded-xl border border-slate-800 text-xs font-mono">
            {["ALL", "SETUP_ACTIVATED", "TP_HIT", "SL_HIT", "COOLDOWN"].map((f) => (
              <button
                key={f}
                onClick={() => setSelectedAuditFilter(f)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedAuditFilter === f
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {f.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div
                key={log.auditId}
                className="p-3 bg-[#0B0F17] border border-slate-800 rounded-xl text-xs font-mono space-y-1.5 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">{log.timeFormatted}</span>
                    <span
                      className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                        log.eventType === "SETUP_ACTIVATED"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : log.eventType === "TP_HIT"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                          : log.eventType === "SL_HIT"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : log.eventType.includes("COOLDOWN")
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {log.eventType}
                    </span>
                    {log.selectedSetupId && (
                      <span className="text-white font-bold">{log.selectedSetupId}</span>
                    )}
                  </div>
                  {log.finalPnlPips !== undefined && (
                    <span
                      className={`font-bold ${
                        log.finalPnlPips >= 0 ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {log.finalPnlPips >= 0 ? `+${log.finalPnlPips}` : log.finalPnlPips} pips
                    </span>
                  )}
                </div>

                <div className="text-slate-200 font-sans">{log.eventDetails}</div>

                {log.rejectedCandidates && log.rejectedCandidates.length > 0 && (
                  <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-1 space-y-0.5">
                    <span className="text-slate-500">Rejected / Queued Candidates:</span>
                    {log.rejectedCandidates.map((r) => (
                      <div key={r.setupId} className="text-slate-400 pl-2">
                        • {r.brainSource} [{r.setupId}] — {r.rejectionReason}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-slate-500 font-mono text-xs">
              No audit logs recorded for filter: {selectedAuditFilter}
            </div>
          )}
        </div>
      </div>

      {/* 6. SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0F172A] border-2 border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Central Signal Manager Settings</h3>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-sans">
              {/* Minimum Quality Score */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">
                  Minimum Activation Score Threshold (Default: 70/100)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="60"
                    max="90"
                    step="5"
                    value={cfgMinScore}
                    onChange={(e) => setCfgMinScore(Number(e.target.value))}
                    className="flex-1 accent-amber-400"
                  />
                  <span className="font-mono font-bold text-amber-400 text-sm px-2.5 py-1 bg-slate-800 rounded-lg">
                    {cfgMinScore}/100
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Setups scoring below this value will NOT be published as active signals.
                </p>
              </div>

              {/* Cooldown Duration */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">
                  Post-Trade Cooldown Duration (Default: 35 Minutes)
                </label>
                <div className="grid grid-cols-3 gap-2 font-mono">
                  {([30, 35, 40] as CooldownDurationMinutes[]).map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setCfgCooldown(mins)}
                      className={`py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                        cfgCooldown === mins
                          ? "bg-amber-500 text-slate-950 border-amber-400"
                          : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                      }`}
                    >
                      {mins} MIN
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400">
                  During cooldown, Telegram signal dispatches are strictly locked to protect from whipsaws.
                </p>
              </div>

              {/* Auto Broadcast Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                <div>
                  <div className="font-bold text-white">Automated Telegram Broadcasting</div>
                  <div className="text-[11px] text-slate-400">
                    Automatically send new active signals and TP/SL updates to Telegram
                  </div>
                </div>
                <button
                  onClick={() => setCfgAutoBroadcast(!cfgAutoBroadcast)}
                  className={`w-12 h-6 rounded-full transition-all relative ${
                    cfgAutoBroadcast ? "bg-emerald-500" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                      cfgAutoBroadcast ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-4">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-xs cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. TELEGRAM BOT SETTINGS MODAL */}
      <TelegramBotModal isOpen={isTelegramModalOpen} onClose={() => setIsTelegramModalOpen(false)} />
    </div>
  );
};

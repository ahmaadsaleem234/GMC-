import React, { useState, useEffect } from "react";
import {
  Lock,
  Unlock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  RefreshCw,
  Zap,
  Activity,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Flame,
  Radio,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Pause,
  Play,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface TradeLockReport {
  lockStatus: "LOCKED" | "UNLOCKED";
  lockStatusLabel: string;
  isLocked: boolean;
  autoRiskMode: "NORMAL" | "SAFE" | "EMERGENCY";
  currentActiveTrade: {
    signalId: string;
    direction: "BUY" | "SELL";
    entry: number;
    entryZone: [number, number];
    sl: number;
    tp1: number;
    tp2: number;
    tp3: number;
    tp4: number;
    status: string;
    createdAt?: number;
  } | null;
  currentTradeId: string;
  nextAllowedSignalTime: number | null;
  nextAllowedSignalTimeFormatted: string;
  primaryBlockReason: string;
  cooldown: {
    isActive: boolean;
    remainingMinutes: number;
    cooldownUntil: number;
    reason: string | null;
    displayText: string;
  };
  daily: {
    tradesExecuted: number;
    limit: number;
    remaining: number;
    isLimitReached: boolean;
    volatilityCondition: string;
  };
  consecutiveLoss: {
    count: number;
    limit: number;
    isPaused: boolean;
    remainingMinutes: number;
    pauseUntil: number | null;
  };
  activeBlocks: {
    code: string;
    category: string;
    reason: string;
  }[];
}

export interface SignalRejectionItem {
  id: string;
  timestamp: string;
  signalId: string;
  symbol: string;
  engine: string;
  confidence?: number;
  category:
    | "LOW_CONFIDENCE"
    | "NEWS_RISK"
    | "OPPOSITE_ACTIVE_TRADE"
    | "MARKET_RANGE_CHOPPY"
    | "HIGH_SPREAD_SLIPPAGE"
    | "SESSION_RESTRICTION"
    | "EMERGENCY_STOP"
    | "DAILY_TRADE_LIMIT"
    | "CONSECUTIVE_LOSS_PAUSE"
    | "COOLDOWN_ACTIVE"
    | "HIGH_SPREAD";
  reason: string;
  currentPrice?: number;
  spread?: number;
}

export const TradeLockAdminDashboard: React.FC = () => {
  const [report, setReport] = useState<TradeLockReport | null>(null);
  const [rejections, setRejections] = useState<SignalRejectionItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchTelemetry = async () => {
    try {
      const [lockRes, rejRes] = await Promise.all([
        fetch("/api/trade-lock-status"),
        fetch("/api/signal-rejections?limit=50"),
      ]);

      if (lockRes.ok) {
        const lockData = await lockRes.json();
        if (lockData.ok && lockData.data) {
          setReport(lockData.data);
        }
      }

      if (rejRes.ok) {
        const rejData = await rejRes.json();
        if (rejData.ok && rejData.data) {
          setRejections(rejData.data);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch trade lock telemetry:", err);
    } finally {
      setLoading(false);
      setLastRefreshed(new Date());
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSetRiskMode = async (mode: "NORMAL" | "SAFE" | "EMERGENCY") => {
    setActionLoading(`mode-${mode}`);
    setActionMessage(null);
    try {
      const res = await fetch("/api/risk-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      const data = await res.json();
      if (data.ok) {
        setActionMessage({ type: "success", text: `Auto Risk Mode updated to ${mode}.` });
        await fetchTelemetry();
      } else {
        setActionMessage({ type: "error", text: data.error || "Failed to set risk mode." });
      }
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message || "Network request failed." });
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetCooldown = async () => {
    setActionLoading("cooldown");
    setActionMessage(null);
    try {
      const res = await fetch("/api/cooldown/reset", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setActionMessage({ type: "success", text: "Cooldown timer reset! Armed for next trade." });
        await fetchTelemetry();
      } else {
        setActionMessage({ type: "error", text: data.error || "Failed to reset cooldown." });
      }
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message || "Network request failed." });
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetLossPause = async () => {
    setActionLoading("loss-pause");
    setActionMessage(null);
    try {
      const res = await fetch("/api/consecutive-loss/reset", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setActionMessage({ type: "success", text: "Consecutive loss pause reset! Normal trading resumed." });
        await fetchTelemetry();
      } else {
        setActionMessage({ type: "error", text: data.error || "Failed to reset loss pause." });
      }
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message || "Network request failed." });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReleaseTradeLock = async () => {
    if (!window.confirm("Are you sure you want to force release the active trade lock? This will reset the position gate.")) {
      return;
    }
    setActionLoading("release-lock");
    setActionMessage(null);
    try {
      const res = await fetch("/api/trade-lock/release", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setActionMessage({ type: "success", text: "Trade lock released successfully." });
        await fetchTelemetry();
      } else {
        setActionMessage({ type: "error", text: data.error || "Failed to release trade lock." });
      }
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message || "Network request failed." });
    } finally {
      setActionLoading(null);
    }
  };

  const handleClearRejections = async () => {
    if (!window.confirm("Clear all recorded signal rejection logs?")) return;
    try {
      const res = await fetch("/api/signal-rejections/clear", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setRejections([]);
        setActionMessage({ type: "success", text: "Rejection logs cleared." });
      }
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message || "Failed to clear logs." });
    }
  };

  const filteredRejections = selectedCategory === "ALL"
    ? rejections
    : rejections.filter((r) => r.category === selectedCategory);

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "EMERGENCY_STOP":
        return "bg-[#EE777F]/15 text-[#EE777F] border-[#EE777F]/30";
      case "CONSECUTIVE_LOSS_PAUSE":
      case "DAILY_TRADE_LIMIT":
        return "bg-[#F1CC6B]/15 text-[#F1CC6B] border-[#F1CC6B]/30";
      case "NEWS_RISK":
        return "bg-[#F97316]/15 text-[#F97316] border-[#F97316]/30";
      case "LOW_CONFIDENCE":
        return "bg-[#38BDF8]/15 text-[#38BDF8] border-[#38BDF8]/30";
      case "MARKET_RANGE_CHOPPY":
        return "bg-[#A855F7]/15 text-[#A855F7] border-[#A855F7]/30";
      case "HIGH_SPREAD":
      case "HIGH_SPREAD_SLIPPAGE":
        return "bg-[#EAB308]/15 text-[#EAB308] border-[#EAB308]/30";
      default:
        return "bg-[#242A31] text-[#9299A3] border-[#343D48]";
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="bg-[#151921] border border-[#242A31] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#F1CC6B]/10 border border-[#F1CC6B]/20 text-[#F1CC6B]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#F3F4F5] tracking-tight">
                Trade Lock & Advanced Risk Command Center
              </h2>
              <p className="text-xs text-[#9299A3]">
                Autonomous trade guard, cooldown synchronization, and real-time gatekeeper controls
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0E1115] border border-[#242A31] text-xs">
            <span className="w-2 h-2 rounded-full bg-[#74D8A0] animate-pulse" />
            <span className="text-[#9299A3] font-mono">Sync:</span>
            <span className="text-[#F3F4F5] font-mono font-medium">
              {lastRefreshed.toLocaleTimeString()}
            </span>
          </div>
          <button
            onClick={fetchTelemetry}
            className="p-2 rounded-xl bg-[#0E1115] border border-[#242A31] hover:bg-[#242A31] text-[#9299A3] hover:text-[#F3F4F5] transition-colors"
            title="Refresh telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ACTION NOTIFICATION BANNER */}
      {actionMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium ${
            actionMessage.type === "success"
              ? "bg-[#74D8A0]/10 border-[#74D8A0]/30 text-[#74D8A0]"
              : "bg-[#EE777F]/10 border-[#EE777F]/30 text-[#EE777F]"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* 4 CORE METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. TRADE LOCK STATUS */}
        <div className="bg-[#151921] border border-[#242A31] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9299A3] uppercase font-semibold">1. TRADE LOCK STATUS</span>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                report?.isLocked
                  ? "bg-[#EE777F]/15 border-[#EE777F]/30 text-[#EE777F]"
                  : "bg-[#74D8A0]/15 border-[#74D8A0]/30 text-[#74D8A0]"
              }`}
            >
              {report?.lockStatusLabel || (report?.isLocked ? "ON (LOCKED)" : "OFF (ARMED)")}
            </span>
          </div>
          <div className="my-3">
            <div className="text-xl font-bold text-[#F3F4F5]">
              {report?.isLocked ? "SIGNALS BLOCKED" : "READY TO BROADCAST"}
            </div>
            <p className="text-xs text-[#9299A3] mt-1 line-clamp-2">
              {report?.primaryBlockReason || "Clean risk environment. System armed for next A+ setup."}
            </p>
          </div>
          {report?.isLocked && (
            <button
              onClick={handleReleaseTradeLock}
              disabled={actionLoading === "release-lock"}
              className="w-full py-1.5 px-3 rounded-lg bg-[#EE777F]/10 border border-[#EE777F]/20 hover:bg-[#EE777F]/20 text-[#EE777F] text-xs font-semibold transition-colors"
            >
              {actionLoading === "release-lock" ? "Releasing..." : "Admin Force Unlock"}
            </button>
          )}
        </div>

        {/* 2. COOLDOWN TIMER DISPLAY */}
        <div className="bg-[#151921] border border-[#242A31] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9299A3] uppercase font-semibold">2. COOLDOWN TIMER</span>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                report?.cooldown.isActive
                  ? "bg-[#F1CC6B]/15 border-[#F1CC6B]/30 text-[#F1CC6B]"
                  : "bg-[#74D8A0]/15 border-[#74D8A0]/30 text-[#74D8A0]"
              }`}
            >
              {report?.cooldown.isActive ? "ACTIVE" : "STANDBY"}
            </span>
          </div>
          <div className="my-3">
            <div className="text-xl font-bold text-[#F3F4F5] font-mono">
              {report?.cooldown.displayText || "No active cooldown"}
            </div>
            <p className="text-xs text-[#9299A3] mt-1">
              Next available: <span className="text-[#F1CC6B] font-semibold">{report?.nextAllowedSignalTimeFormatted || "Immediate"}</span>
            </p>
          </div>
          {report?.cooldown.isActive && (
            <button
              onClick={handleResetCooldown}
              disabled={actionLoading === "cooldown"}
              className="w-full py-1.5 px-3 rounded-lg bg-[#F1CC6B]/10 border border-[#F1CC6B]/20 hover:bg-[#F1CC6B]/20 text-[#F1CC6B] text-xs font-semibold transition-colors"
            >
              {actionLoading === "cooldown" ? "Resetting..." : "Reset Cooldown"}
            </button>
          )}
        </div>

        {/* 3. AUTO RISK MODE */}
        <div className="bg-[#151921] border border-[#242A31] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9299A3] uppercase font-semibold">3. AUTO RISK MODE</span>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                report?.autoRiskMode === "EMERGENCY"
                  ? "bg-[#EE777F]/15 border-[#EE777F]/30 text-[#EE777F]"
                  : report?.autoRiskMode === "SAFE"
                  ? "bg-[#38BDF8]/15 border-[#38BDF8]/30 text-[#38BDF8]"
                  : "bg-[#74D8A0]/15 border-[#74D8A0]/30 text-[#74D8A0]"
              }`}
            >
              {report?.autoRiskMode || "NORMAL"}
            </span>
          </div>
          <div className="my-3">
            <div className="text-xl font-bold text-[#F3F4F5]">
              {report?.autoRiskMode === "EMERGENCY"
                ? "EMERGENCY HALT"
                : report?.autoRiskMode === "SAFE"
                ? "SAFE MODE (≥92%)"
                : "NORMAL (STANDARD)"}
            </div>
            <p className="text-xs text-[#9299A3] mt-1">
              {report?.autoRiskMode === "EMERGENCY"
                ? "All new signals blocked across Telegram"
                : report?.autoRiskMode === "SAFE"
                ? "Highest quality setups only"
                : "Full signal generation with all 8 rules active"}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleSetRiskMode("NORMAL")}
              disabled={actionLoading === "mode-NORMAL"}
              className={`flex-1 py-1 text-[11px] rounded font-semibold transition-colors ${
                report?.autoRiskMode === "NORMAL"
                  ? "bg-[#74D8A0] text-black"
                  : "bg-[#0E1115] hover:bg-[#242A31] text-[#9299A3]"
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => handleSetRiskMode("SAFE")}
              disabled={actionLoading === "mode-SAFE"}
              className={`flex-1 py-1 text-[11px] rounded font-semibold transition-colors ${
                report?.autoRiskMode === "SAFE"
                  ? "bg-[#38BDF8] text-black"
                  : "bg-[#0E1115] hover:bg-[#242A31] text-[#9299A3]"
              }`}
            >
              Safe
            </button>
            <button
              onClick={() => handleSetRiskMode("EMERGENCY")}
              disabled={actionLoading === "mode-EMERGENCY"}
              className={`flex-1 py-1 text-[11px] rounded font-semibold transition-colors ${
                report?.autoRiskMode === "EMERGENCY"
                  ? "bg-[#EE777F] text-white"
                  : "bg-[#0E1115] hover:bg-[#242A31] text-[#EE777F]"
              }`}
            >
              Stop
            </button>
          </div>
        </div>

        {/* 4. DAILY LIMIT & LOSS SHIELD */}
        <div className="bg-[#151921] border border-[#242A31] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9299A3] uppercase font-semibold">4. DAILY & LOSS LIMITS</span>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                report?.daily.isLimitReached || report?.consecutiveLoss.isPaused
                  ? "bg-[#EE777F]/15 border-[#EE777F]/30 text-[#EE777F]"
                  : "bg-[#74D8A0]/15 border-[#74D8A0]/30 text-[#74D8A0]"
              }`}
            >
              {report?.consecutiveLoss.isPaused
                ? "LOSS PAUSE"
                : report?.daily.isLimitReached
                ? "MAX DAILY"
                : "HEALTHY"}
            </span>
          </div>
          <div className="my-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#9299A3]">Daily Trades:</span>
              <span className="font-mono font-bold text-[#F3F4F5]">
                {report?.daily.tradesExecuted ?? 0} / {report?.daily.limit ?? 14} ({report?.daily.remaining ?? 14} left)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#9299A3]">Consecutive SL:</span>
              <span className="font-mono font-bold text-[#F3F4F5]">
                {report?.consecutiveLoss.count ?? 0} / {report?.consecutiveLoss.limit ?? 4} SL
              </span>
            </div>
          </div>
          {report?.consecutiveLoss.isPaused && (
            <button
              onClick={handleResetLossPause}
              disabled={actionLoading === "loss-pause"}
              className="w-full py-1.5 px-3 rounded-lg bg-[#F1CC6B]/10 border border-[#F1CC6B]/20 hover:bg-[#F1CC6B]/20 text-[#F1CC6B] text-xs font-semibold transition-colors"
            >
              {actionLoading === "loss-pause" ? "Resetting..." : "Reset 4-SL Pause"}
            </button>
          )}
        </div>
      </div>

      {/* ACTIVE TRADE INSPECTOR (IF ON) */}
      {report?.currentActiveTrade ? (
        <div className="bg-[#151921] border border-[#F1CC6B]/30 rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#242A31]">
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                  report.currentActiveTrade.direction === "BUY"
                    ? "bg-[#74D8A0]/15 text-[#74D8A0] border-[#74D8A0]/30"
                    : "bg-[#EE777F]/15 text-[#EE777F] border-[#EE777F]/30"
                }`}
              >
                {report.currentActiveTrade.direction === "BUY" ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                ACTIVE {report.currentActiveTrade.direction}
              </span>
              <div>
                <span className="text-sm font-bold text-[#F3F4F5] font-mono">
                  #{report.currentActiveTrade.signalId}
                </span>
                <span className="text-xs text-[#9299A3] ml-2">
                  Status: <strong className="text-[#F1CC6B]">{report.currentActiveTrade.status}</strong>
                </span>
              </div>
            </div>
            <div className="text-xs text-[#9299A3]">
              Trade Lock Engaged (1 Active Trade Rule Active)
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mt-4 text-xs font-mono">
            <div className="bg-[#0E1115] p-2.5 rounded-xl border border-[#242A31]">
              <span className="text-[#9299A3] block text-[10px] uppercase">ENTRY PRICE</span>
              <span className="text-[#F3F4F5] font-bold text-sm">
                ${report.currentActiveTrade.entry.toFixed(2)}
              </span>
            </div>
            <div className="bg-[#0E1115] p-2.5 rounded-xl border border-[#242A31]">
              <span className="text-[#EE777F] block text-[10px] uppercase">STOP LOSS</span>
              <span className="text-[#EE777F] font-bold text-sm">
                ${report.currentActiveTrade.sl.toFixed(2)}
              </span>
            </div>
            <div className="bg-[#0E1115] p-2.5 rounded-xl border border-[#242A31]">
              <span className="text-[#74D8A0] block text-[10px] uppercase">TARGET 1</span>
              <span className="text-[#74D8A0] font-bold text-sm">
                ${report.currentActiveTrade.tp1.toFixed(2)}
              </span>
            </div>
            <div className="bg-[#0E1115] p-2.5 rounded-xl border border-[#242A31]">
              <span className="text-[#74D8A0] block text-[10px] uppercase">TARGET 2</span>
              <span className="text-[#74D8A0] font-bold text-sm">
                ${report.currentActiveTrade.tp2.toFixed(2)}
              </span>
            </div>
            <div className="bg-[#0E1115] p-2.5 rounded-xl border border-[#242A31]">
              <span className="text-[#74D8A0] block text-[10px] uppercase">TARGET 3</span>
              <span className="text-[#74D8A0] font-bold text-sm">
                ${report.currentActiveTrade.tp3.toFixed(2)}
              </span>
            </div>
            <div className="bg-[#0E1115] p-2.5 rounded-xl border border-[#242A31]">
              <span className="text-[#F1CC6B] block text-[10px] uppercase">FINAL TP 4</span>
              <span className="text-[#F1CC6B] font-bold text-sm">
                ${report.currentActiveTrade.tp4.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#151921] border border-[#242A31] rounded-2xl p-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#74D8A0]">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-semibold">NO ACTIVE TRADE POSITION</span>
            <span className="text-[#9299A3] font-normal">— Pipeline is free to accept qualified setups</span>
          </div>
          <span className="text-[11px] font-mono text-[#9299A3]">
            Current Trade ID: <strong className="text-[#F3F4F5]">{report?.currentTradeId || "NONE"}</strong>
          </span>
        </div>
      )}

      {/* SIGNAL REJECTION LOG */}
      <div className="bg-[#151921] border border-[#242A31] rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#242A31]">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#EE777F]" />
              <h3 className="text-sm font-bold text-[#F3F4F5] uppercase tracking-wide">
                Signal Rejection Audit Log
              </h3>
              <span className="text-[10px] bg-[#242A31] text-[#9299A3] px-2 py-0.5 rounded font-mono">
                {filteredRejections.length} EVENTS
              </span>
            </div>
            <p className="text-xs text-[#9299A3] mt-0.5">
              Transparent reasons why potential signals were blocked by the 8-Pillar safety gate
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearRejections}
              disabled={rejections.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0E1115] border border-[#242A31] hover:bg-[#242A31] text-[#9299A3] hover:text-[#EE777F] text-xs transition-colors disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Logs</span>
            </button>
          </div>
        </div>

        {/* CATEGORY FILTER BUTTONS */}
        <div className="flex flex-wrap gap-1.5 py-3 border-b border-[#242A31]/50 text-xs">
          {[
            { id: "ALL", label: "All Categories" },
            { id: "LOW_CONFIDENCE", label: "Low Confidence" },
            { id: "NEWS_RISK", label: "News Blackout" },
            { id: "OPPOSITE_ACTIVE_TRADE", label: "Active Trade Conflict" },
            { id: "MARKET_RANGE_CHOPPY", label: "Range/Chop" },
            { id: "HIGH_SPREAD_SLIPPAGE", label: "High Spread" },
            { id: "CONSECUTIVE_LOSS_PAUSE", label: "4-SL Pause" },
            { id: "DAILY_TRADE_LIMIT", label: "Daily Limit" },
            { id: "EMERGENCY_STOP", label: "Emergency Stop" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                selectedCategory === cat.id
                  ? "bg-[#F1CC6B] text-black font-semibold"
                  : "bg-[#0E1115] text-[#9299A3] hover:text-[#F3F4F5] border border-[#242A31]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* REJECTIONS LIST */}
        <div className="mt-4 space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
          {filteredRejections.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#9299A3]">
              <ShieldCheck className="w-8 h-8 text-[#74D8A0] mx-auto mb-2 opacity-60" />
              <p className="font-medium text-[#F3F4F5]">No Signal Rejections Recorded</p>
              <p className="mt-1">All processed signals met risk thresholds or no conflicts were detected.</p>
            </div>
          ) : (
            filteredRejections.map((item) => (
              <div
                key={item.id}
                className="bg-[#0E1115] p-3 rounded-xl border border-[#242A31] flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs hover:border-[#343D48] transition-colors"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getCategoryBadge(
                        item.category
                      )}`}
                    >
                      {item.category.replace(/_/g, " ")}
                    </span>
                    <span className="font-mono font-semibold text-[#F3F4F5]">
                      {item.signalId || item.symbol}
                    </span>
                    {item.confidence && (
                      <span className="text-[11px] font-mono text-[#F1CC6B]">
                        {item.confidence.toFixed(1)}% Conf
                      </span>
                    )}
                    {item.currentPrice && (
                      <span className="text-[11px] font-mono text-[#9299A3]">
                        @ ${item.currentPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <p className="text-[#C5CAD2] text-[11px] leading-relaxed">
                    {item.reason}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-[#9299A3] block">
                    {new Date(item.timestamp).toLocaleTimeString()} UTC
                  </span>
                  <span className="text-[9px] text-[#606977] block">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

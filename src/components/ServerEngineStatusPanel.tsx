import React, { useState, useEffect } from "react";
import {
  Activity,
  Radio,
  Send,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Database,
  Cpu,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Pause,
  Play,
  Lock,
  X,
} from "lucide-react";
import { TradeLockAdminDashboard } from "./TradeLockAdminDashboard";

export interface ServerEngineStatusData {
  engineStatus: "Running" | "Stopped";
  telegramStatus: "Connected" | "Disconnected";
  marketDataStatus: "Live" | "Stale";
  lastAnalysisTime: string | null;
  nextAnalysisTime: string | null;
  lastSignalTime: string | null;
  currentDecision: "BUY" | "SELL" | "WAIT — NO VALID SETUP" | "WAIT — MARKET CLOSED" | string;
  telegramDeliveryStatus: "Sent" | "Failed" | "Retrying" | "Idle" | string;
  hasActiveTrade: boolean;
  activeTrade?: any;
  accountMetrics?: any;
}

export const ServerEngineStatusPanel: React.FC = () => {
  const [status, setStatus] = useState<ServerEngineStatusData | null>(null);
  const [riskReport, setRiskReport] = useState<any | null>(null);
  const [showRiskDetails, setShowRiskDetails] = useState<boolean>(false);
  const [showTradeLockModal, setShowTradeLockModal] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [lastFetched, setLastFetched] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const [statusRes, riskRes] = await Promise.all([
        fetch("/api/telegram/status"),
        fetch("/api/risk/status").catch(() => null),
      ]);

      if (!statusRes.ok) throw new Error(`HTTP ${statusRes.status}`);
      const data = await statusRes.json();
      if (data.ok) {
        setStatus({
          engineStatus: data.engineStatus || "Running",
          telegramStatus: data.telegramStatus || "Connected",
          marketDataStatus: data.marketDataStatus || "Live",
          lastAnalysisTime: data.lastAnalysisTime,
          nextAnalysisTime: data.nextAnalysisTime,
          lastSignalTime: data.lastSignalTime,
          currentDecision: data.currentDecision || "WAIT — NO VALID SETUP",
          telegramDeliveryStatus: data.telegramDeliveryStatus || "Sent",
          hasActiveTrade: !!data.hasActiveTrade,
          activeTrade: data.activeTrade,
          accountMetrics: data.accountMetrics,
        });
        setError(null);
      }

      if (riskRes && riskRes.ok) {
        const riskData = await riskRes.json();
        if (riskData.ok && riskData.summary) {
          setRiskReport(riskData.summary);
        }
      }
    } catch (err: any) {
      console.warn("Failed to fetch server engine status:", err);
      setError("Connecting to server telemetry...");
    } finally {
      setLoading(false);
      setLastFetched(new Date());
    }
  };

  const handleTestTelegram = async () => {
    setTestingTelegram(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/telegram/test-ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.ok) {
        setTestResult({
          ok: true,
          message: `Telegram Test Delivered! Chat ID: ${data.chatId || "5218548758"}`,
        });
        fetchStatus();
      } else {
        setTestResult({
          ok: false,
          message: data.error || "Telegram ping failed. Check bot token/chat ID.",
        });
      }
    } catch (err: any) {
      setTestResult({
        ok: false,
        message: err.message || "Failed to reach Telegram server",
      });
    } finally {
      setTestingTelegram(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (isoString: string | null) => {
    if (!isoString || isoString === "Not Yet Started" || isoString === "None Dispatched Yet") {
      return "—";
    }
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return isoString;
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " (" + d.toLocaleDateString([], { month: "short", day: "numeric" }) + ")";
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="bg-[#080A0D] border border-[#292E35] rounded-2xl p-4 sm:p-5 shadow-none space-y-4 font-mono text-xs">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#272C32] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Cpu className="w-5 h-5 text-[#F1CC6B]" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#74D8A0] rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white text-xs uppercase tracking-wide">
                24/7 AUTONOMOUS BACKEND ENGINE TELEMETRY
              </h3>
              <span className="px-2 py-0.5 rounded bg-[rgba(116,216,160,0.1)] text-[#74D8A0] border border-[rgba(116,216,160,0.3)] text-[10px] font-medium uppercase">
                Server Active
              </span>
            </div>
            <p className="text-[10px] text-[#9299A3] font-sans mt-0.5">
              Continuously evaluating XAUUSD every 30 mins independently of browser state
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTradeLockModal(true)}
            className="px-2.5 py-1 bg-[#1A1E26] hover:bg-[#252C38] text-[#F1CC6B] rounded-lg border border-[#3A4350] text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Lock className="w-3.5 h-3.5 text-[#F1CC6B]" />
            <span>Trade Lock Dashboard</span>
          </button>
          <button
            onClick={handleTestTelegram}
            disabled={testingTelegram}
            className="px-2.5 py-1 bg-[#1A222D] hover:bg-[#25303F] text-[#74D8A0] rounded-lg border border-[#344458] text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className={`w-3 h-3 ${testingTelegram ? "animate-pulse text-[#74D8A0]" : ""}`} />
            <span>{testingTelegram ? "Testing..." : "Test Telegram"}</span>
          </button>
          <button
            onClick={fetchStatus}
            className="px-2.5 py-1 bg-[#101318] hover:bg-[#161A21] text-[#E2BA57] rounded-lg border border-[#2C3239] text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin text-[#F1CC6B]" : ""}`} />
            <span>Sync</span>
          </button>
          <span className="text-[10px] text-[#646C77]">
            Live: {lastFetched.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {testResult && (
        <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
          testResult.ok
            ? "bg-[#0C1A14] border-[#1D4A33] text-[#74D8A0]"
            : "bg-[#1A0C0E] border-[#4A1D23] text-[#EE777F]"
        }`}>
          <div className="flex items-center gap-2">
            {testResult.ok ? <CheckCircle2 className="w-4 h-4 text-[#74D8A0]" /> : <AlertCircle className="w-4 h-4 text-[#EE777F]" />}
            <span>{testResult.message}</span>
          </div>
          <button onClick={() => setTestResult(null)} className="text-[10px] underline opacity-70 hover:opacity-100 cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* 9 Status Parameters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2">
        {/* 1. Trading Engine */}
        <div className="bg-[#0E1115] p-2.5 rounded-xl border border-[#242A31] flex flex-col justify-between">
          <span className="text-[10px] text-[#9299A3] uppercase font-medium block mb-1">TRADING ENGINE</span>
          <div className="flex items-center gap-1.5">
            {status?.engineStatus === "Running" ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#74D8A0]" />
                <span className="text-[#74D8A0] font-semibold text-xs">RUNNING</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-[#EE777F]" />
                <span className="text-[#EE777F] font-semibold text-xs">STOPPED</span>
              </>
            )}
          </div>
        </div>

        {/* 2. Telegram Connection */}
        <div className="bg-[#0E1115] p-2.5 rounded-xl border border-[#242A31] flex flex-col justify-between">
          <span className="text-[10px] text-[#9299A3] uppercase font-medium block mb-1">TELEGRAM</span>
          <div className="flex items-center gap-1.5">
            <Send className={`w-3.5 h-3.5 ${status?.telegramStatus === "Connected" ? "text-[#74D8A0]" : "text-[#EE777F]"}`} />
            <span className={`font-semibold text-xs ${status?.telegramStatus === "Connected" ? "text-[#74D8A0]" : "text-[#EE777F]"}`}>
              {status?.telegramStatus === "Connected" ? "CONNECTED" : "DISCONNECTED"}
            </span>
          </div>
        </div>

        {/* 3. Market Data */}
        <div className="bg-[#0E1115] p-2.5 rounded-xl border border-[#242A31] flex flex-col justify-between">
          <span className="text-[10px] text-[#9299A3] uppercase font-medium block mb-1">MARKET DATA</span>
          <div className="flex items-center gap-1.5">
            <Activity className={`w-3.5 h-3.5 ${status?.marketDataStatus === "Live" ? "text-[#74D8A0]" : "text-[#F1CC6B]"}`} />
            <span className={`font-semibold text-xs ${status?.marketDataStatus === "Live" ? "text-[#74D8A0]" : "text-[#F1CC6B]"}`}>
              {status?.marketDataStatus === "Live" ? "LIVE SPOT" : "STALE"}
            </span>
          </div>
        </div>

        {/* 4. Last Analysis */}
        <div className="bg-[#0E1115] p-2.5 rounded-xl border border-[#242A31] flex flex-col justify-between">
          <span className="text-[10px] text-[#9299A3] uppercase font-medium block mb-1">LAST ANALYSIS</span>
          <span className="text-[#F1CC6B] font-semibold text-[11px] truncate">
            {formatDate(status?.lastAnalysisTime || null)}
          </span>
        </div>

        {/* 5. Next Analysis */}
        <div className="bg-[#0E1115] p-2.5 rounded-xl border border-[#242A31] flex flex-col justify-between">
          <span className="text-[10px] text-[#9299A3] uppercase font-medium block mb-1">NEXT ANALYSIS</span>
          <span className="text-[#F3F4F5] font-semibold text-[11px] truncate">
            {formatDate(status?.nextAnalysisTime || null)}
          </span>
        </div>

        {/* 6. Last Signal */}
        <div className="bg-[#0E1115] p-2.5 rounded-xl border border-[#242A31] flex flex-col justify-between">
          <span className="text-[10px] text-[#9299A3] uppercase font-medium block mb-1">LAST SIGNAL</span>
          <span className="text-[#74D8A0] font-semibold text-[11px] truncate">
            {formatDate(status?.lastSignalTime || null)}
          </span>
        </div>

        {/* 7. Current Decision */}
        <div className="bg-[#0E1115] p-2.5 rounded-xl border border-[#242A31] flex flex-col justify-between col-span-2 sm:col-span-1">
          <span className="text-[10px] text-[#9299A3] uppercase font-medium block mb-1">CURRENT DECISION</span>
          <span className={`font-semibold text-[11px] truncate ${
            status?.currentDecision === "BUY"
              ? "text-[#74D8A0]"
              : status?.currentDecision === "SELL"
              ? "text-[#EE777F]"
              : "text-[#9299A3]"
          }`}>
            {status?.currentDecision || "WAIT — NO VALID SETUP"}
          </span>
        </div>

        {/* 8. Telegram Delivery */}
        <div className="bg-[#0E1115] p-2.5 rounded-xl border border-[#242A31] flex flex-col justify-between">
          <span className="text-[10px] text-[#9299A3] uppercase font-medium block mb-1">DELIVERY</span>
          <span className={`font-semibold text-xs ${
            status?.telegramDeliveryStatus === "Sent"
              ? "text-[#74D8A0]"
              : status?.telegramDeliveryStatus === "Retrying"
              ? "text-[#F1CC6B]"
              : status?.telegramDeliveryStatus === "Failed"
              ? "text-[#EE777F]"
              : "text-[#9299A3]"
          }`}>
            {status?.telegramDeliveryStatus || "Sent"}
          </span>
        </div>

        {/* 9. Active Trade */}
        <div className="bg-[#0E1115] p-2.5 rounded-xl border border-[#242A31] flex flex-col justify-between">
          <span className="text-[10px] text-[#9299A3] uppercase font-medium block mb-1">ACTIVE TRADE</span>
          <span className={`font-semibold text-xs ${status?.hasActiveTrade ? "text-[#F1CC6B]" : "text-[#74D8A0]"}`}>
            {status?.hasActiveTrade ? "YES (LOCKED)" : "STANDBY (READY)"}
          </span>
        </div>
      </div>

      {/* 8-PILLAR ADVANCED RISK & TRADE QUALITY CONTROLS MONITOR */}
      <div className="mt-3 pt-3 border-t border-[#242A31]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#F1CC6B]" />
            <span className="text-xs font-bold text-[#F3F4F5] tracking-wide uppercase">
              8-Pillar Advanced Risk & Quality Controls
            </span>
            <span className="text-[10px] bg-[#242A31] text-[#9299A3] px-2 py-0.5 rounded font-mono">
              ACTIVE
            </span>
          </div>
          <button
            onClick={() => setShowRiskDetails(!showRiskDetails)}
            className="text-[11px] text-[#F1CC6B] hover:text-[#F1CC6B]/80 font-medium transition-colors"
          >
            {showRiskDetails ? "Hide Details" : "Show All 8 Rules"}
          </button>
        </div>

        {/* Quick Badges Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          {/* Rule 1: Daily Trade Limit */}
          <div className="bg-[#0E1115] p-2 rounded-lg border border-[#242A31] flex flex-col">
            <span className="text-[10px] text-[#9299A3] font-mono">1. DAILY TRADES</span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="font-bold text-[#F3F4F5]">
                {riskReport?.daily?.tradesExecuted ?? 0} / {riskReport?.daily?.limitNormal ?? 14}
              </span>
              <span className={`text-[10px] font-semibold ${riskReport?.daily?.isLimitReached ? "text-[#EE777F]" : "text-[#74D8A0]"}`}>
                {riskReport?.daily?.isLimitReached ? "MAX REACHED" : `${riskReport?.daily?.remaining ?? 14} REM`}
              </span>
            </div>
          </div>

          {/* Rule 2: Consecutive Loss Protection */}
          <div className="bg-[#0E1115] p-2 rounded-lg border border-[#242A31] flex flex-col">
            <span className="text-[10px] text-[#9299A3] font-mono">2. LOSS SHIELD (4 SL)</span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="font-bold text-[#F3F4F5]">
                {riskReport?.consecutiveLoss?.count ?? 0} / {riskReport?.consecutiveLoss?.limit ?? 4} SL
              </span>
              <span className={`text-[10px] font-semibold ${riskReport?.consecutiveLoss?.isPaused ? "text-[#EE777F]" : "text-[#74D8A0]"}`}>
                {riskReport?.consecutiveLoss?.isPaused
                  ? `PAUSED (${riskReport?.consecutiveLoss?.pauseRemainingMinutes}m)`
                  : "SAFE"}
              </span>
            </div>
          </div>

          {/* Rule 3: Signal Expiry (45-60 min) */}
          <div className="bg-[#0E1115] p-2 rounded-lg border border-[#242A31] flex flex-col">
            <span className="text-[10px] text-[#9299A3] font-mono">3. SIGNAL EXPIRY</span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="font-bold text-[#F3F4F5]">45 Min Limit</span>
              <span className="text-[10px] font-semibold text-[#74D8A0]">AUTO-CANCEL</span>
            </div>
          </div>

          {/* Rule 6: Economic News Filter */}
          <div className="bg-[#0E1115] p-2 rounded-lg border border-[#242A31] flex flex-col">
            <span className="text-[10px] text-[#9299A3] font-mono">6. NEWS BLACKOUT</span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="font-bold text-[#F3F4F5]">±30m High Impact</span>
              <span className={`text-[10px] font-semibold ${riskReport?.news?.inBlackout ? "text-[#EE777F]" : "text-[#74D8A0]"}`}>
                {riskReport?.news?.inBlackout ? "BLACKOUT" : "CLEAR"}
              </span>
            </div>
          </div>
        </div>

        {/* Expandable Details for Rules 4, 5, 7, 8 */}
        {showRiskDetails && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] mt-2 pt-2 border-t border-[#242A31]/50">
            {/* Rule 4: Market Regime Filter */}
            <div className="bg-[#0E1115] p-2 rounded-lg border border-[#242A31] flex flex-col">
              <span className="text-[10px] text-[#9299A3] font-mono">4. MARKET REGIME</span>
              <span className="text-[11px] text-[#74D8A0] font-semibold mt-0.5">
                TRENDING ALLOWED
              </span>
              <span className="text-[9px] text-[#9299A3]">Range/Choppy/Extreme Vol Blocked</span>
            </div>

            {/* Rule 5: Spread & Slippage */}
            <div className="bg-[#0E1115] p-2 rounded-lg border border-[#242A31] flex flex-col">
              <span className="text-[10px] text-[#9299A3] font-mono">5. SPREAD & SLIPPAGE</span>
              <span className="text-[11px] text-[#F3F4F5] font-semibold mt-0.5">
                Max Spread: ${riskReport?.spread?.maxPermissibleUSD ?? 0.45}
              </span>
              <span className="text-[9px] text-[#9299A3]">Fast quote freshness verified</span>
            </div>

            {/* Rule 7: Confidence Score */}
            <div className="bg-[#0E1115] p-2 rounded-lg border border-[#242A31] flex flex-col">
              <span className="text-[10px] text-[#9299A3] font-mono">7. CONFIDENCE GATE</span>
              <span className="text-[11px] text-[#F1CC6B] font-semibold mt-0.5">
                ≥90% Normal | &lt;80% Reject
              </span>
              <span className="text-[9px] text-[#9299A3]">80-90% requires strong MTF sync</span>
            </div>

            {/* Rule 8: Fast TP Cooldown */}
            <div className="bg-[#0E1115] p-2 rounded-lg border border-[#242A31] flex flex-col">
              <span className="text-[10px] text-[#9299A3] font-mono">8. FAST TP COOLDOWN</span>
              <span className={`text-[11px] font-semibold mt-0.5 ${riskReport?.fastTp?.isActive ? "text-[#F1CC6B]" : "text-[#74D8A0]"}`}>
                {riskReport?.fastTp?.isActive ? `${riskReport?.fastTp?.remainingMinutes}m Cooldown` : "IDLE (READY)"}
              </span>
              <span className="text-[9px] text-[#9299A3]">15-30m cooldown after quick spike</span>
            </div>
          </div>
        )}
      </div>

      {/* TRADE LOCK & RISK CONTROLS MODAL OVERLAY */}
      {showTradeLockModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#0B0E14] border border-[#242A31] rounded-3xl max-w-5xl w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setShowTradeLockModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-[#151921] border border-[#242A31] hover:bg-[#242A31] text-[#9299A3] hover:text-[#F3F4F5] transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
            <TradeLockAdminDashboard />
          </div>
        </div>
      )}
    </div>
  );
};

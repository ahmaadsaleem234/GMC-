import React, { useState, useEffect } from "react";
import {
  Activity,
  Zap,
  Target,
  Shield,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Flame,
  Radio,
  Layers,
  FileText,
  Lock,
  Send,
  Copy,
  Check,
  Search,
  Filter,
  Database,
  CheckCircle,
  XCircle,
  Clock3,
} from "lucide-react";
import { LivePrice } from "../types";
import { RetestXCandle, RetestXDojiReference, RetestXSetup, RetestXState } from "../services/retestXEngine";
import { RetestX3DCommandCenter } from "./RetestX3DCommandCenter";

interface RetestXDashboardViewProps {
  currentPrice?: number;
  assetKey?: string;
  prices?: Record<string, LivePrice>;
  latencyMs?: number;
  onOpenTelegramModal?: () => void;
}

export const RetestXDashboardView: React.FC<RetestXDashboardViewProps> = ({
  currentPrice: propPrice,
  assetKey = "XAUUSD",
  prices = {},
  latencyMs = 18,
  onOpenTelegramModal,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState(assetKey || "XAUUSD");
  const [engineState, setEngineState] = useState<RetestXState>("WAITING");
  const [referenceDoji, setReferenceDoji] = useState<RetestXDojiReference | null>(null);
  const [activeSetup, setActiveSetup] = useState<RetestXSetup | null>(null);
  const [setupHistory, setSetupHistory] = useState<RetestXSetup[]>([]);
  const [referenceHistory, setReferenceHistory] = useState<RetestXDojiReference[]>([]);
  const [candles, setCandles] = useState<RetestXCandle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isResetting, setIsResetting] = useState(false);
  const [show3DView, setShow3DView] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sendingAlertId, setSendingAlertId] = useState<string | null>(null);
  const [telegramStatusMsg, setTelegramStatusMsg] = useState<{ text: string; isSuccess: boolean } | null>(null);
  const [historyFilter, setHistoryFilter] = useState<"ALL" | "WIN" | "LOSS" | "PENDING" | "ACTIVE">("ALL");
  const [historySearch, setHistorySearch] = useState("");

  const livePriceObj = prices[selectedSymbol];
  const livePrice = propPrice && selectedSymbol === assetKey ? propPrice : (livePriceObj?.price || 4382.50);

  // Fetch live setup and reference data from isolated backend API
  const fetchEngineData = async () => {
    try {
      const res = await fetch(`/api/retest-x/setup?symbol=${selectedSymbol}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setEngineState(data.state || "WAITING");
          setReferenceDoji(data.reference || null);
          setActiveSetup(data.activeSetup || null);
          setSetupHistory(data.history || []);
          if (data.candles && Array.isArray(data.candles)) {
            setCandles(data.candles);
          }
        }
      }

      const histRes = await fetch("/api/retest-x/history");
      if (histRes.ok) {
        const histData = await histRes.json();
        if (histData.success && histData.referenceHistory) {
          setReferenceHistory(histData.referenceHistory);
        }
      }
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("[RETEST X DASHBOARD] Error polling engine API:", err);
    }
  };

  useEffect(() => {
    fetchEngineData();
    const interval = setInterval(fetchEngineData, 2000);
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  const handleResetEngine = async () => {
    setIsResetting(true);
    try {
      const res = await fetch("/api/retest-x/reset", { method: "POST" });
      if (res.ok) {
        await fetchEngineData();
      }
    } catch (err) {
      console.error("Failed to reset RETEST X engine", err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleCopySetupId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSendTelegramAlert = async (setupId?: string) => {
    const targetId = setupId || activeSetup?.setupId;
    if (!targetId && !activeSetup && setupHistory.length === 0) return;
    setSendingAlertId(targetId || "active");
    setTelegramStatusMsg(null);
    try {
      const res = await fetch("/api/retest-x/trigger-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setupId: targetId }),
      });
      const data = await res.json();
      if (data.success) {
        setTelegramStatusMsg({ text: `Alert dispatched to Telegram (Setup ID: ${data.setupId || targetId})`, isSuccess: true });
        await fetchEngineData();
      } else {
        setTelegramStatusMsg({ text: data.message || "Failed to dispatch alert", isSuccess: false });
      }
    } catch (err: any) {
      setTelegramStatusMsg({ text: err.message || "Network error", isSuccess: false });
    } finally {
      setSendingAlertId(null);
      setTimeout(() => setTelegramStatusMsg(null), 5000);
    }
  };

  // Derive dynamic setup status badge
  const getComputedStatus = (): {
    badgeText: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
    dotClass: string;
  } => {
    // Check trade outcome state if setup active
    if (activeSetup) {
      if (activeSetup.state === "BUY_CONFIRMED") {
        if (livePrice >= activeSetup.tp1) {
          return {
            badgeText: "TP HIT",
            bgClass: "bg-emerald-500/20",
            textClass: "text-emerald-300",
            borderClass: "border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.4)]",
            dotClass: "bg-emerald-400",
          };
        }
        if (livePrice <= activeSetup.stopLoss) {
          return {
            badgeText: "SL HIT",
            bgClass: "bg-rose-500/20",
            textClass: "text-rose-300",
            borderClass: "border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.4)]",
            dotClass: "bg-rose-400",
          };
        }
        return {
          badgeText: "BUY CONFIRMED",
          bgClass: "bg-emerald-500/20",
          textClass: "text-emerald-300",
          borderClass: "border-emerald-400/80 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse",
          dotClass: "bg-emerald-400",
        };
      }
      if (activeSetup.state === "SELL_CONFIRMED") {
        if (livePrice <= activeSetup.tp1) {
          return {
            badgeText: "TP HIT",
            bgClass: "bg-emerald-500/20",
            textClass: "text-emerald-300",
            borderClass: "border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.4)]",
            dotClass: "bg-emerald-400",
          };
        }
        if (livePrice >= activeSetup.stopLoss) {
          return {
            badgeText: "SL HIT",
            bgClass: "bg-rose-500/20",
            textClass: "text-rose-300",
            borderClass: "border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.4)]",
            dotClass: "bg-rose-400",
          };
        }
        return {
          badgeText: "SELL CONFIRMED",
          bgClass: "bg-red-500/20",
          textClass: "text-red-300",
          borderClass: "border-red-400/80 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse",
          dotClass: "bg-red-400",
        };
      }
      if (activeSetup.state === "SETUP_CLOSED") {
        return {
          badgeText: "CLOSED",
          bgClass: "bg-slate-800/60",
          textClass: "text-slate-400",
          borderClass: "border-slate-700",
          dotClass: "bg-slate-500",
        };
      }
    }

    switch (engineState) {
      case "DOJI_DETECTED":
        return {
          badgeText: "DOJI DETECTED",
          bgClass: "bg-amber-500/20",
          textClass: "text-amber-300",
          borderClass: "border-amber-400/70 shadow-[0_0_12px_rgba(245,158,11,0.4)]",
          dotClass: "bg-amber-400 animate-ping",
        };
      case "BREAKOUT_CONFIRMED":
        return {
          badgeText: "BREAKOUT CONFIRMED",
          bgClass: "bg-cyan-500/20",
          textClass: "text-cyan-300",
          borderClass: "border-cyan-400/70 shadow-[0_0_12px_rgba(6,182,212,0.4)]",
          dotClass: "bg-cyan-400",
        };
      case "RETEST_PENDING":
        return {
          badgeText: "RETEST PENDING",
          bgClass: "bg-indigo-500/20",
          textClass: "text-indigo-300",
          borderClass: "border-indigo-400/70 shadow-[0_0_12px_rgba(99,102,241,0.4)] animate-pulse",
          dotClass: "bg-indigo-400",
        };
      case "BUY_CONFIRMED":
        return {
          badgeText: "BUY CONFIRMED",
          bgClass: "bg-emerald-500/20",
          textClass: "text-emerald-300",
          borderClass: "border-emerald-400/80 shadow-[0_0_15px_rgba(16,185,129,0.5)]",
          dotClass: "bg-emerald-400",
        };
      case "SELL_CONFIRMED":
        return {
          badgeText: "SELL CONFIRMED",
          bgClass: "bg-red-500/20",
          textClass: "text-red-300",
          borderClass: "border-red-400/80 shadow-[0_0_15px_rgba(239,68,68,0.5)]",
          dotClass: "bg-red-400",
        };
      case "SETUP_CLOSED":
        return {
          badgeText: "CLOSED",
          bgClass: "bg-slate-800/60",
          textClass: "text-slate-400",
          borderClass: "border-slate-700",
          dotClass: "bg-slate-500",
        };
      case "WAITING":
      default:
        return {
          badgeText: "WAITING",
          bgClass: "bg-slate-800/40",
          textClass: "text-slate-300",
          borderClass: "border-slate-700/80",
          dotClass: "bg-slate-400",
        };
    }
  };

  const status = getComputedStatus();

  // Compute mathematical confidence score
  const computeConfidenceScore = (): { score: number; grade: string; rationale: string } => {
    if (!referenceDoji) {
      return { score: 0, grade: "STANDBY", rationale: "Scanning for confirmed 15M Red Doji" };
    }
    let score = 70; // Base valid Doji score
    // Tighter body gives higher score
    if (referenceDoji.bodySize <= referenceDoji.referenceRange * 0.10) score += 15;
    else if (referenceDoji.bodySize <= referenceDoji.referenceRange * 0.15) score += 10;
    else score += 5;

    // Symmetrical wicks
    const wickDiff = Math.abs(referenceDoji.upperWick - referenceDoji.lowerWick);
    if (wickDiff <= referenceDoji.referenceRange * 0.08) score += 10;
    else if (wickDiff <= referenceDoji.referenceRange * 0.12) score += 5;

    if (engineState === "BUY_CONFIRMED" || engineState === "SELL_CONFIRMED") score += 5;

    const grade = score >= 90 ? "A+ CONVICTION" : score >= 80 ? "A INSTITUTIONAL" : "STANDARD";
    const rationale = `Body ratio ${((referenceDoji.bodySize / (referenceDoji.referenceRange || 1)) * 100).toFixed(1)}%, Wick symmetry ${((wickDiff / (referenceDoji.referenceRange || 1)) * 100).toFixed(1)}%`;
    return { score: Math.min(score, 98), grade, rationale };
  };

  const confidence = computeConfidenceScore();

  // Retest zone formatting
  const getRetestZoneText = (): string => {
    if (!referenceDoji) return "Awaiting Reference Doji";
    if (engineState === "WAITING" || engineState === "DOJI_DETECTED") {
      return `Upper Zone: ${referenceDoji.dojiHigh.toFixed(2)} | Lower Zone: ${referenceDoji.dojiLow.toFixed(2)}`;
    }
    if (activeSetup?.direction === "SELL") {
      return `${referenceDoji.dojiLow.toFixed(2)} (Broken Support → Resistance)`;
    }
    if (activeSetup?.direction === "BUY") {
      return `${referenceDoji.dojiHigh.toFixed(2)} (Broken Resistance → Support)`;
    }
    return `${referenceDoji.dojiLow.toFixed(2)} - ${referenceDoji.dojiHigh.toFixed(2)}`;
  };

  return (
    <div id="retest-x-dashboard-view" className="space-y-5 font-sans text-slate-100 pb-12">
      {/* Top Banner & Universal Header */}
      <div className="bg-[#0B0E14] border border-[#232B38] rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/20">
                <Zap className="w-5 h-5 text-slate-950 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
                    RETEST <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">X</span>
                  </h1>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    15M ENGINE
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  15-Minute Confirmed Red Doji Reference, Breakout Gate & Single-Attempt Retest Engine
                </p>
              </div>
            </div>
          </div>

          {/* Right Status Badge & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Live Engine Status Badge */}
            <div
              id="retest-x-status-badge"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase border transition-all ${status.bgClass} ${status.textClass} ${status.borderClass}`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${status.dotClass}`} />
              <span>STATUS: {status.badgeText}</span>
            </div>

            {/* 3D View Toggle */}
            <button
              id="retest-x-toggle-3d-btn"
              onClick={() => setShow3DView(!show3DView)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                show3DView
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/70 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                  : "bg-[#141A23] hover:bg-[#1C2432] text-slate-400 border-[#2D3748]"
              }`}
              title="Toggle 3D Command Center Hologram"
            >
              <Radio className={`w-3.5 h-3.5 ${show3DView ? "text-cyan-400 animate-pulse" : "text-slate-500"}`} />
              <span>{show3DView ? "3D Hologram (ON)" : "3D Hologram (OFF)"}</span>
            </button>

            {/* Reset Button */}
            <button
              id="retest-x-reset-btn"
              onClick={handleResetEngine}
              disabled={isResetting}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#141A23] hover:bg-[#1C2432] text-slate-300 border border-[#2D3748] hover:border-slate-500 transition-all cursor-pointer disabled:opacity-50"
              title="Reset RETEST X Engine State to WAITING"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin text-cyan-400" : ""}`} />
              <span>Reset State</span>
            </button>

            {/* Refresh Button */}
            <button
              id="retest-x-refresh-btn"
              onClick={fetchEngineData}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#141A23] hover:bg-[#1C2432] text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 transition-all cursor-pointer"
              title="Poll Live Engine State"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Sync Live</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3D COMMAND CENTER HOLOGRAPHIC UNIVERSE */}
      {show3DView && (
        <div className="w-full">
          <RetestX3DCommandCenter
            candles={candles}
            referenceDoji={referenceDoji}
            activeSetup={activeSetup}
            engineState={engineState}
            livePrice={livePrice}
            symbol={selectedSymbol}
          />
        </div>
      )}

      {/* 4 CORE METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* CARD 1: MARKET */}
        <div id="retest-x-market-card" className="bg-[#0B0E14] border border-[#232B38] rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-[#1E2530] pb-2.5">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-black tracking-wider uppercase text-slate-300">MARKET</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              {latencyMs}ms LIVE
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Instrument</div>
              <div className="text-base font-black text-white tracking-wide">{selectedSymbol}</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 font-medium">Live Spot Price</div>
              <div className="text-2xl font-mono font-black text-amber-400 tracking-tight">
                {livePrice ? Number(livePrice).toFixed(2) : "---"}
              </div>
            </div>

            <div className="pt-1 border-t border-[#19202A] flex items-center justify-between text-xs">
              <span className="text-slate-400">15M Status</span>
              <span className="font-mono font-bold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Feed
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2: REFERENCE (15M RED DOJI) */}
        <div id="retest-x-reference-card" className="bg-[#0B0E14] border border-[#232B38] rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-[#1E2530] pb-2.5">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black tracking-wider uppercase text-slate-300">REFERENCE DOJI</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              15M CLOSED
            </span>
          </div>

          {referenceDoji ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Doji Time</span>
                <span className="font-mono font-bold text-slate-200 text-[11px]">
                  {new Date(referenceDoji.referenceTimestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-[#121722] p-2 rounded-xl border border-[#1F2736]">
                <div>
                  <div className="text-[10px] text-slate-400">Doji High (Fixed)</div>
                  <div className="text-sm font-mono font-black text-rose-400">
                    {referenceDoji.dojiHigh.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Doji Low (Fixed)</div>
                  <div className="text-sm font-mono font-black text-emerald-400">
                    {referenceDoji.dojiLow.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="pt-1 border-t border-[#19202A] flex justify-between items-center text-xs">
                <span className="text-slate-400">Doji Range</span>
                <span className="font-mono font-bold text-amber-300">
                  {referenceDoji.referenceRange.toFixed(2)} pts (Body: {referenceDoji.bodySize.toFixed(2)})
                </span>
              </div>
            </div>
          ) : (
            <div className="py-5 text-center space-y-1 text-slate-500">
              <Clock className="w-6 h-6 mx-auto opacity-50 text-slate-400" />
              <p className="text-xs font-medium">Scanning 15M candles...</p>
              <p className="text-[10px] text-slate-600">Waiting for confirmed 15M Red Doji</p>
            </div>
          )}
        </div>

        {/* CARD 3: SETUP (BREAKOUT & RETEST) */}
        <div id="retest-x-setup-card" className="bg-[#0B0E14] border border-[#232B38] rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-[#1E2530] pb-2.5">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-black tracking-wider uppercase text-slate-300">SETUP ENGINE</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              {activeSetup ? activeSetup.direction : "MONITORING"}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Direction</span>
              <span className={`font-black font-mono px-2 py-0.5 rounded text-[11px] ${
                activeSetup?.direction === "BUY"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : activeSetup?.direction === "SELL"
                  ? "bg-red-500/20 text-red-300 border border-red-500/40"
                  : "bg-slate-800 text-slate-400"
              }`}>
                {activeSetup?.direction || "NONE"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Breakout Status</span>
              <span className="font-bold text-slate-200 text-right truncate max-w-[150px]">
                {engineState === "BREAKOUT_CONFIRMED" || engineState === "RETEST_PENDING" || activeSetup
                  ? "Confirmed 15M Close"
                  : "Waiting Breakout"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Retest Zone</span>
              <span className="font-mono text-cyan-300 text-[11px] text-right truncate max-w-[140px]">
                {getRetestZoneText()}
              </span>
            </div>

            <div className="pt-1 border-t border-[#19202A] flex justify-between items-center">
              <span className="text-slate-400">R:R Ratio</span>
              <span className="font-mono font-bold text-amber-300">
                {activeSetup ? `1:${activeSetup.riskRewardRatio}` : "Min 1:2.0 Required"}
              </span>
            </div>
          </div>
        </div>

        {/* CARD 4: EXECUTION & CONFIDENCE */}
        <div id="retest-x-execution-card" className="bg-[#0B0E14] border border-[#232B38] rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-[#1E2530] pb-2.5">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black tracking-wider uppercase text-slate-300">EXECUTION MATH</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {confidence.grade}
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Confidence Score</span>
              <span className="font-black font-mono text-emerald-400 text-sm">
                {confidence.score}%
              </span>
            </div>

            {activeSetup ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Entry Price</span>
                  <span className="font-mono font-bold text-white">{activeSetup.entryPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Stop Loss (SL)</span>
                  <span className="font-mono font-bold text-rose-400">{activeSetup.stopLoss.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">TP1 / TP2 / TP3</span>
                  <span className="font-mono font-bold text-emerald-400 text-[11px]">
                    {activeSetup.tp1.toFixed(1)} / {activeSetup.tp2.toFixed(1)} / {activeSetup.tp3.toFixed(1)}
                  </span>
                </div>
              </>
            ) : (
              <div className="py-2 text-[11px] text-slate-500 leading-relaxed">
                {referenceDoji
                  ? "SL will be locked to Doji High (SELL) or Doji Low (BUY) with exact 1:2 R:R targets."
                  : "Awaiting valid reference Doji to calculate mathematical targets."}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ACTIVE SETUP FULL DETAIL PANEL */}
      {activeSetup && (
        <div id="retest-x-active-setup-detail" className="bg-[#0B0E14] border border-cyan-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#232B38] pb-3">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ${activeSetup.direction === "BUY" ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
                {activeSetup.direction === "BUY" ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-black text-white tracking-wide">
                  ACTIVE SETUP: {activeSetup.setupId}
                </h3>
                <p className="text-xs text-slate-400">
                  {activeSetup.statusMessage}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono flex-wrap">
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                Attempt: {activeSetup.retestAttemptCount}/1 (Strict Single-Shot)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                R:R 1:{activeSetup.riskRewardRatio}
              </span>
              <button
                onClick={() => handleSendTelegramAlert(activeSetup.setupId)}
                disabled={sendingAlertId === activeSetup.setupId}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/50 text-xs font-bold transition-all shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendingAlertId === activeSetup.setupId ? "Broadcasting..." : activeSetup.signalSent ? "Resend Telegram" : "Broadcast Telegram"}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div className="bg-[#121722] p-3 rounded-xl border border-[#1F2736]">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Direction</div>
              <div className={`text-base font-black font-mono ${activeSetup.direction === "BUY" ? "text-emerald-400" : "text-rose-400"}`}>
                {activeSetup.direction}
              </div>
            </div>

            <div className="bg-[#121722] p-3 rounded-xl border border-[#1F2736]">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Entry Level</div>
              <div className="text-base font-black font-mono text-white">
                {activeSetup.entryPrice.toFixed(2)}
              </div>
            </div>

            <div className="bg-[#121722] p-3 rounded-xl border border-[#1F2736]">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Stop Loss (SL)</div>
              <div className="text-base font-black font-mono text-rose-400">
                {activeSetup.stopLoss.toFixed(2)}
              </div>
            </div>

            <div className="bg-[#121722] p-3 rounded-xl border border-[#1F2736]">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">TP1 (1:2 R:R)</div>
              <div className="text-base font-black font-mono text-emerald-400">
                {activeSetup.tp1.toFixed(2)}
              </div>
            </div>

            <div className="bg-[#121722] p-3 rounded-xl border border-[#1F2736]">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">TP2 (1:3 R:R)</div>
              <div className="text-base font-black font-mono text-emerald-300">
                {activeSetup.tp2.toFixed(2)}
              </div>
            </div>

            <div className="bg-[#121722] p-3 rounded-xl border border-[#1F2736]">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">TP3 (1:4 R:R)</div>
              <div className="text-base font-black font-mono text-emerald-200">
                {activeSetup.tp3.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATE TRANSITION TIMELINE & ENGINE AUDIT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: State Flow Diagnostic */}
        <div className="lg:col-span-2 bg-[#0B0E14] border border-[#232B38] rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-[#232B38] pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-black text-white tracking-wide uppercase">
                RETEST X STATE TRANSITION PIPELINE
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Last Synced: {lastRefreshed.toLocaleTimeString()}
            </span>
          </div>

          {/* 5-Step Visual State Stepper */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {[
              { key: "WAITING", label: "1. WAITING", desc: "Scanning 15M bars" },
              { key: "DOJI_DETECTED", label: "2. DOJI DETECTED", desc: "Red Doji locked" },
              { key: "BREAKOUT_CONFIRMED", label: "3. BREAKOUT", desc: "15M close confirmed" },
              { key: "RETEST_PENDING", label: "4. RETEST PENDING", desc: "Single attempt" },
              { key: "CONFIRMED", label: "5. CONFIRMED", desc: "BUY / SELL Trigger" },
            ].map((step, idx) => {
              const isCurrent =
                (step.key === "CONFIRMED" && (engineState === "BUY_CONFIRMED" || engineState === "SELL_CONFIRMED")) ||
                engineState === step.key;

              return (
                <div
                  key={step.key}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    isCurrent
                      ? "bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                      : "bg-[#121722] border-[#1E2532] text-slate-400"
                  }`}
                >
                  <div className="text-[11px] font-black">{step.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{step.desc}</div>
                </div>
              );
            })}
          </div>

          {/* Detailed Diagnostic Specifications */}
          <div className="bg-[#10141D] p-3.5 rounded-xl border border-[#1D2431] text-xs text-slate-300 space-y-2">
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Engine Verification Parameters
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Body Size ≤ 20% of 15M Total Range</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Wick Symmetry Difference ≤ 15%</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Breakout: 15M Candle CLOSE only</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Retest Limit: Exactly 1 Attempt allowed</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Col: Reference & Setup History */}
        <div className="bg-[#0B0E14] border border-[#232B38] rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-[#232B38] pb-3">
            <h3 className="text-sm font-black text-white tracking-wide uppercase">
              REFERENCE HISTORY
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {referenceHistory.length} Detected
            </span>
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {referenceHistory.length > 0 ? (
              referenceHistory.map((item, i) => (
                <div
                  key={i}
                  className="bg-[#121722] p-2.5 rounded-xl border border-[#1E2532] text-xs flex justify-between items-center"
                >
                  <div>
                    <div className="font-mono font-bold text-slate-200">
                      {new Date(item.referenceTimestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Range: {item.referenceRange.toFixed(2)} (Body: {item.bodySize.toFixed(2)})
                    </div>
                  </div>
                  <div className="text-right font-mono text-[11px]">
                    <div className="text-rose-400">H: {item.dojiHigh.toFixed(2)}</div>
                    <div className="text-emerald-400">L: {item.dojiLow.toFixed(2)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                No previous reference candles in buffer
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RETEST X COMPREHENSIVE SETUP HISTORY TABLE */}
      <div className="bg-[#0B0E14] border border-[#232B38] rounded-2xl p-5 shadow-2xl space-y-5">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#232B38] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white tracking-wide uppercase">
                  RETEST X SETUP HISTORY
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-500/30">
                  {setupHistory.length} Total Records
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Full lifecycle audit log of confirmed 15M Red Doji setups with live Telegram broadcast tracking.
              </p>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="flex items-center gap-2 flex-wrap">
            {(() => {
              const wins = setupHistory.filter((s) => s.result === "WIN").length;
              const losses = setupHistory.filter((s) => s.result === "LOSS").length;
              const closedCount = wins + losses;
              const winRate = closedCount > 0 ? ((wins / closedCount) * 100).toFixed(0) : "100";
              const activeCount = setupHistory.filter((s) => s.status === "ACTIVE").length;

              return (
                <>
                  <div className="bg-[#121722] px-3 py-1.5 rounded-xl border border-[#1F2736] flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Win Rate:</span>
                    <span className="text-xs font-mono font-black text-emerald-400">{winRate}%</span>
                    <span className="text-[10px] text-slate-500 font-mono">({wins}W / {losses}L)</span>
                  </div>

                  <div className="bg-[#121722] px-3 py-1.5 rounded-xl border border-[#1F2736] flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Active:</span>
                    <span className="text-xs font-mono font-black text-cyan-400">{activeCount}</span>
                  </div>

                  <button
                    onClick={() => handleSendTelegramAlert()}
                    disabled={sendingAlertId !== null}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-bold transition-all shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sendingAlertId ? "Dispatching..." : "Test Telegram Alert"}</span>
                  </button>
                </>
              );
            })()}
          </div>
        </div>

        {/* Telegram Status Notification Banner */}
        {telegramStatusMsg && (
          <div
            className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-medium ${
              telegramStatusMsg.isSuccess
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            {telegramStatusMsg.isSuccess ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{telegramStatusMsg.text}</span>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#10141D] p-3 rounded-xl border border-[#1E2532]">
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {(["ALL", "ACTIVE", "WIN", "LOSS", "PENDING"] as const).map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => setHistoryFilter(filterKey)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  historyFilter === filterKey
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                    : "bg-[#161C26] text-slate-400 hover:text-white hover:bg-[#1E2634] border border-[#232C3B]"
                }`}
              >
                {filterKey}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Setup ID or Symbol..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="w-full bg-[#161C26] border border-[#232C3B] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>

        {/* 13-Column Responsive Table */}
        <div className="overflow-x-auto rounded-xl border border-[#1E2532] bg-[#0E121A]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#232C3B] bg-[#121722] text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Time</th>
                <th className="py-3 px-3">Instrument</th>
                <th className="py-3 px-3">Direction</th>
                <th className="py-3 px-3">Doji High / Low</th>
                <th className="py-3 px-3">Entry</th>
                <th className="py-3 px-3">SL</th>
                <th className="py-3 px-3">TP1 - TP3</th>
                <th className="py-3 px-3 text-center">R:R</th>
                <th className="py-3 px-3 text-center">Confidence</th>
                <th className="py-3 px-3 text-center">Result</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3">Setup ID</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B222E]">
              {(() => {
                const filtered = setupHistory.filter((item) => {
                  if (historyFilter === "ACTIVE" && item.status !== "ACTIVE") return false;
                  if (historyFilter === "WIN" && item.result !== "WIN") return false;
                  if (historyFilter === "LOSS" && item.result !== "LOSS") return false;
                  if (historyFilter === "PENDING" && item.result !== "PENDING") return false;
                  if (historySearch.trim()) {
                    const query = historySearch.toLowerCase();
                    const matchId = item.setupId.toLowerCase().includes(query);
                    const matchSym = item.instrument.toLowerCase().includes(query);
                    const matchDir = item.direction.toLowerCase().includes(query);
                    if (!matchId && !matchSym && !matchDir) return false;
                  }
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <tr>
                      <td colSpan={14} className="text-center py-12 text-slate-500 text-xs">
                        No RETEST X setups match the selected filter.
                      </td>
                    </tr>
                  );
                }

                return filtered.map((row, idx) => {
                  const isBuy = row.direction === "BUY";
                  const dojiHighVal = row.dojiHigh || row.referenceDoji?.dojiHigh || 0;
                  const dojiLowVal = row.dojiLow || row.referenceDoji?.dojiLow || 0;
                  const confVal = row.confidence || 88;
                  const rowTs = row.createdAt || row.referenceTimestamp || Date.now();
                  const dObj = new Date(rowTs);
                  const validDate = isNaN(dObj.getTime()) ? new Date() : dObj;
                  const displayDate = row.date || validDate.toISOString().split("T")[0];
                  const displayTime = row.time || validDate.toTimeString().split(" ")[0];

                  return (
                    <tr
                      key={row.setupId || idx}
                      className="hover:bg-[#141A24] transition-colors font-mono"
                    >
                      {/* 1. Date */}
                      <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                        {displayDate}
                      </td>

                      {/* 2. Time */}
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                        {displayTime}
                      </td>

                      {/* 3. Instrument */}
                      <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                        {row.instrument}
                      </td>

                      {/* 4. Direction */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black ${
                            isBuy
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {isBuy ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {row.direction}
                        </span>
                      </td>

                      {/* 5. Doji High / Low */}
                      <td className="py-3 px-3 text-[11px] whitespace-nowrap">
                        <div className="text-rose-400">H: {dojiHighVal.toFixed(2)}</div>
                        <div className="text-emerald-400">L: {dojiLowVal.toFixed(2)}</div>
                      </td>

                      {/* 6. Entry */}
                      <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                        {row.entryPrice.toFixed(2)}
                      </td>

                      {/* 7. SL */}
                      <td className="py-3 px-3 text-rose-400 font-semibold whitespace-nowrap">
                        {row.stopLoss.toFixed(2)}
                      </td>

                      {/* 8. TP1-3 */}
                      <td className="py-3 px-3 text-[10px] whitespace-nowrap">
                        <div className="text-emerald-400">TP1: {row.tp1.toFixed(2)}</div>
                        <div className="text-emerald-300">TP2: {row.tp2.toFixed(2)}</div>
                        <div className="text-emerald-200">TP3: {row.tp3.toFixed(2)}</div>
                      </td>

                      {/* 9. R:R */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-bold border border-cyan-500/30 text-[10px]">
                          1:{row.riskRewardRatio}
                        </span>
                      </td>

                      {/* 10. Confidence */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="font-black text-amber-400">{confVal}%</div>
                        <div className="text-[9px] text-slate-400">{row.confidenceGrade || "A+"}</div>
                      </td>

                      {/* 11. Result */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {row.result === "WIN" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            WIN
                          </span>
                        ) : row.result === "LOSS" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black">
                            <XCircle className="w-3 h-3 text-rose-400" />
                            LOSS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black animate-pulse">
                            <Clock3 className="w-3 h-3 text-amber-400" />
                            PENDING
                          </span>
                        )}
                      </td>

                      {/* 12. Status */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            row.status === "ACTIVE"
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse"
                              : row.status === "CLOSED"
                              ? "bg-slate-800 text-slate-400 border border-slate-700"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>

                      {/* 13. Setup ID */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <code className="text-[10px] text-slate-300 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
                            {row.setupId}
                          </code>
                          <button
                            onClick={() => handleCopySetupId(row.setupId)}
                            title="Copy Setup ID"
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                          >
                            {copiedId === row.setupId ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <div className="text-[9px] text-slate-500 mt-0.5">
                          {row.signalSent ? "📡 Telegram Dispatched" : "⏳ Telegram Pending"}
                        </div>
                      </td>

                      {/* 14. Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleSendTelegramAlert(row.setupId)}
                          disabled={sendingAlertId === row.setupId}
                          className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-[10px] font-bold inline-flex items-center gap-1 transition-all"
                        >
                          <Send className="w-2.5 h-2.5" />
                          <span>{sendingAlertId === row.setupId ? "Sending..." : "Alert"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

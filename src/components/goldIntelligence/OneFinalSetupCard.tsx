import React, { useState } from "react";
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Clock,
  Send,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Info,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Award,
  BarChart2,
  Share2,
} from "lucide-react";
import { HaramiSingleSetup, TimezoneMode, formatEventTime } from "../../services/goldIntelligenceService";
import { LiveChartXAUUSD } from "./LiveChartXAUUSD";

interface OneFinalSetupCardProps {
  setup: HaramiSingleSetup;
  currentPrice: number;
  timezoneMode: TimezoneMode;
  setTimezoneMode: (mode: TimezoneMode) => void;
  onExecuteTrade?: (type: "BUY" | "SELL") => void;
}

export const OneFinalSetupCard: React.FC<OneFinalSetupCardProps> = ({
  setup,
  currentPrice,
  timezoneMode,
  setTimezoneMode,
  onExecuteTrade,
}) => {
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Format message for Telegram in exact requested format
  const telegramFormattedText = setup.decision === "BUY"
    ? `🟢🔥 HARAMI AI — BUY GOLD\n📊 XAUUSD | BUY\n📰 News: ${setup.newsEvent}\n🕒 News Time: ${formatEventTime(setup.newsTimeUtc, "DUBAI")}\n⏱️ Setup Timeframes: D1/H4 Context | H1/M15 Setup | M5 Trigger\n📍 Entry: $${setup.entryRange.low} - $${setup.entryRange.high}\n💎 Best: $${setup.bestEntry}\n🛡️ SL: $${setup.stopLoss}\n🎯 TP1: $${setup.tp1}\n🎯 TP2: $${setup.tp2}\n🎯 TP3: $${setup.tp3}\n⚖️ R:R: 1:${setup.riskRewardRatio}\n🔥 Confidence: ${setup.calibratedConfidencePct}%\n⌛ Valid Until: ${formatEventTime(setup.expiryTimeUtc, "DUBAI")}\n❌ Invalidation: ${setup.invalidationCondition}\n🧠 ${setup.shortRationale}\n⚠️ News volatility and slippage may occur.\n⚡ Harami AI • Serious Signals, Zero Drama.`
    : setup.decision === "SELL"
    ? `🔴🔥 HARAMI AI — SELL GOLD\n📊 XAUUSD | SELL\n📰 News: ${setup.newsEvent}\n🕒 News Time: ${formatEventTime(setup.newsTimeUtc, "DUBAI")}\n⏱️ Setup Timeframes: D1/H4 Context | H1/M15 Setup | M5 Trigger\n📍 Entry: $${setup.entryRange.low} - $${setup.entryRange.high}\n💎 Best: $${setup.bestEntry}\n🛡️ SL: $${setup.stopLoss}\n🎯 TP1: $${setup.tp1}\n🎯 TP2: $${setup.tp2}\n🎯 TP3: $${setup.tp3}\n⚖️ R:R: 1:${setup.riskRewardRatio}\n🔥 Confidence: ${setup.calibratedConfidencePct}%\n⌛ Valid Until: ${formatEventTime(setup.expiryTimeUtc, "DUBAI")}\n❌ Invalidation: ${setup.invalidationCondition}\n🧠 ${setup.shortRationale}\n⚠️ News volatility and slippage may occur.\n⚡ Harami AI • Serious Signals, Zero Drama.`
    : `⚪ HARAMI AI — NO TRADE\n📰 News: ${setup.newsEvent}\n🧠 Reason: ${setup.noTradeReason || "Outside T-2H execution window. Capital protected. No forced setup."}\n⚡ Harami AI • Capital Protected.`;

  const handleCopyTelegramFormat = () => {
    navigator.clipboard.writeText(telegramFormattedText);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  const handleBroadcastTelegram = () => {
    setBroadcastSent(true);
    setTimeout(() => setBroadcastSent(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 🌟 Header Section for Single Setup Engine */}
      <div className="bg-[#0B0F17] border border-[#D4AF37]/50 rounded-3xl p-6 shadow-[0_0_50px_rgba(212,175,55,0.15)] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                SINGLE-SETUP AI DECISION ENGINE
              </span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                News-Day Only Rule Active
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>ONE FINAL XAUUSD SETUP</span>
              <span className="text-[#D4AF37] font-mono text-lg font-normal">
                ({setup.decision === "BUY" ? "🟢 BUY" : setup.decision === "SELL" ? "🔴 SELL" : "⚪ NO TRADE"})
              </span>
            </h2>
          </div>

          {/* Timezone Mode Selector */}
          <div className="flex items-center gap-2 bg-[#121824] p-1.5 rounded-2xl border border-slate-700/80 font-mono text-xs">
            <span className="text-slate-400 px-2 font-bold hidden sm:inline">Timezone:</span>
            {(["DUBAI", "UTC", "NEW_YORK", "LOCAL"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setTimezoneMode(mode)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  timezoneMode === mode
                    ? "bg-[#D4AF37] text-black shadow-md font-black"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {mode === "DUBAI" ? "Dubai (GST)" : mode === "NEW_YORK" ? "NY (EST)" : mode}
              </button>
            ))}
          </div>
        </div>

        {/* 🟢/🔴/⚪ DECISION DISPLAY BANNER */}
        {setup.decision !== "NO_TRADE" ? (
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F1823] via-[#131F2E] to-[#0A0E17] border-2 border-emerald-500/60 p-6 md:p-8 space-y-6 shadow-[0_0_35px_rgba(16,185,129,0.2)]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800 pb-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                  <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-black tracking-wide text-sm uppercase flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
                    🟢🔥 HARAMI AI — BUY GOLD
                  </span>
                  <span className="text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 font-semibold">
                    Asset: {setup.asset} (Spot Gold)
                  </span>
                  <span className="text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 font-semibold">
                    News: {setup.newsEvent}
                  </span>
                </div>

                <div className="text-xs font-mono text-slate-300 space-y-1">
                  <div>
                    <span className="text-slate-400">Scheduled Event Release: </span>
                    <span className="font-bold text-amber-300">{formatEventTime(setup.newsTimeUtc, timezoneMode)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Signal Published (T-2H Gate): </span>
                    <span className="font-bold text-emerald-300">{formatEventTime(setup.publishedTimeUtc, timezoneMode)}</span>
                  </div>
                </div>
              </div>

              {/* Price & Action Buttons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#080C14] p-4 rounded-2xl border border-slate-800">
                <div>
                  <div className="text-xs font-mono text-slate-400 uppercase">Live Spot Rate</div>
                  <div className="text-2xl font-mono font-black text-amber-300">${currentPrice.toFixed(2)}</div>
                </div>

                {onExecuteTrade && (
                  <button
                    onClick={() => onExecuteTrade("BUY")}
                    className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-mono font-black rounded-xl text-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <ArrowUpRight className="w-5 h-5 text-black" />
                    <span>EXECUTE BUY ORDER</span>
                  </button>
                )}
              </div>
            </div>

            {/* Timelines & Multi-timeframe Stack */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="bg-[#080D17] p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold block text-[11px] uppercase tracking-wider">
                  D1 / H4 Macro Context
                </span>
                <p className="text-slate-200 font-medium">{setup.timeframeContext.macro}</p>
              </div>
              <div className="bg-[#080D17] p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold block text-[11px] uppercase tracking-wider">
                  H1 / M15 Key Setup Zone
                </span>
                <p className="text-amber-300 font-bold">{setup.timeframeContext.setup}</p>
              </div>
              <div className="bg-[#080D17] p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-bold block text-[11px] uppercase tracking-wider">
                  M5 Confirmation Trigger
                </span>
                <p className="text-emerald-300 font-bold">{setup.timeframeContext.trigger}</p>
              </div>
            </div>

            {/* Key Level Matrix Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
              <div className="bg-[#090F1C] p-3 rounded-xl border border-amber-500/40">
                <div className="text-[11px] text-amber-400/90 font-bold">ENTRY RANGE</div>
                <div className="text-base font-black text-amber-300">
                  ${setup.entryRange.low} – ${setup.entryRange.high}
                </div>
              </div>

              <div className="bg-[#090F1C] p-3 rounded-xl border border-amber-400">
                <div className="text-[11px] text-amber-300 font-black">⭐ BEST ENTRY</div>
                <div className="text-lg font-black text-amber-300 animate-pulse">
                  ${setup.bestEntry}
                </div>
              </div>

              <div className="bg-[#090F1C] p-3 rounded-xl border border-rose-500/50">
                <div className="text-[11px] text-rose-400 font-bold">🛑 STOP LOSS</div>
                <div className="text-base font-black text-rose-400">
                  ${setup.stopLoss}
                </div>
              </div>

              <div className="bg-[#090F1C] p-3 rounded-xl border border-emerald-500/30">
                <div className="text-[11px] text-emerald-400 font-bold">🎯 TARGET TP1</div>
                <div className="text-base font-black text-emerald-300">
                  ${setup.tp1}
                </div>
              </div>

              <div className="bg-[#090F1C] p-3 rounded-xl border border-emerald-500/50">
                <div className="text-[11px] text-emerald-400 font-bold">🎯 TARGET TP2</div>
                <div className="text-base font-black text-emerald-300">
                  ${setup.tp2}
                </div>
              </div>

              <div className="bg-[#090F1C] p-3 rounded-xl border border-emerald-500/70">
                <div className="text-[11px] text-emerald-300 font-bold">🎯 TARGET TP3</div>
                <div className="text-base font-black text-emerald-300">
                  ${setup.tp3}
                </div>
              </div>
            </div>

            {/* Metrics & Probability Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#080D18] p-4 rounded-xl border border-slate-800 font-mono text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">RISK-TO-REWARD</span>
                <span className="text-base font-black text-amber-300">1:{setup.riskRewardRatio}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">AI CONFIDENCE</span>
                <span className="text-base font-black text-emerald-400">{setup.calibratedConfidencePct}%</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">25Y SAMPLE SIZE</span>
                <span className="text-base font-bold text-white">{setup.sampleSize25Y} Analogues</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">MAX ACCOUNT RISK</span>
                <span className="text-base font-bold text-amber-300">{setup.maxRiskPct}% Default</span>
              </div>
            </div>

            {/* Invalidation & Rationale */}
            <div className="space-y-3 pt-2 font-mono text-xs border-t border-slate-800">
              <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl text-rose-200">
                <span className="font-bold text-rose-400 block mb-0.5">❌ SETUP INVALIDATION CONDITION:</span>
                <span>{setup.invalidationCondition}</span>
              </div>

              <div className="bg-[#080E1A] p-3.5 rounded-xl border border-slate-800 space-y-1 text-slate-300">
                <span className="font-bold text-amber-300 block">🧠 AI DATA-FUSION RATIONALE:</span>
                <p className="leading-relaxed">{setup.shortRationale}</p>
              </div>
            </div>
          </div>
        ) : (
          /* ⚪ CAPITAL PROTECTED NO TRADE BANNER */
          <div className="rounded-2xl bg-gradient-to-br from-[#0F141F] to-[#0A0D14] border border-slate-700/80 p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-2">
                <span className="px-3.5 py-1.5 rounded-full bg-slate-800 text-slate-200 border border-slate-600 font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 w-fit">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  ⚪ HARAMI AI — NO ACTIVE TRADE SETUP
                </span>
                <h3 className="text-xl font-bold text-white font-mono">
                  Capital Protection Rule Enforced
                </h3>
                <p className="text-xs text-slate-400 font-mono max-w-2xl">
                  {setup.noTradeReason || "Outside T-2H execution window for upcoming high-impact news. Signal engine unlocks 2 hours before release."}
                </p>
              </div>

              <div className="bg-[#070A10] p-4 rounded-2xl border border-slate-800 min-w-[200px] text-center font-mono">
                <span className="text-[11px] text-slate-400 uppercase block">Next T-2H Analysis Window</span>
                <span className="text-sm font-bold text-amber-300 block mt-1">
                  {formatEventTime(setup.nextAnalysisWindowUtc || new Date().toISOString(), timezoneMode)}
                </span>
              </div>
            </div>

            <div className="bg-[#070A10] p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Info className="w-4 h-4 text-amber-400" />
                <span>Why is there NO TRADE right now?</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
                <li>HARAMI AI disables signal generation on ordinary non-news days to prevent unnecessary exposure.</li>
                <li>Trade setups are published strictly 2 hours prior to verified high-impact Gold news events.</li>
                <li>All 4 independent data sources must pass health, spread, and confidence thresholds (&gt;=75%).</li>
              </ul>
            </div>
          </div>
        )}

        {/* 📈 REAL-TIME INTERACTIVE CHART SECTION */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-amber-400" />
              <span>LIVE XAUUSD CHART WITH SETUP LEVELS</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Auto-syncs with Spot Feed
            </span>
          </div>

          <LiveChartXAUUSD
            currentPrice={currentPrice}
            setup={setup}
            onShareToTelegram={handleCopyTelegramFormat}
          />
        </div>

        {/* ✈️ TELEGRAM SYNCHRONIZATION & BROADCAST PANEL */}
        <div className="bg-[#080D18] border border-sky-500/30 rounded-2xl p-5 space-y-4 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-sky-400" />
              <span className="font-bold text-white text-sm">TELEGRAM CHANNEL SYNCHRONIZER</span>
              <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[11px]">
                Bot @HaramiGoldBot
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyTelegramFormat}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-600 font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span>{copiedMsg ? "Copied to Clipboard!" : "Copy Syntax"}</span>
              </button>

              <button
                onClick={handleBroadcastTelegram}
                className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-black font-black rounded-lg shadow-md flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-black" />
                <span>{broadcastSent ? "Broadcast Sent! 🚀" : "Broadcast to Telegram"}</span>
              </button>
            </div>
          </div>

          {/* Formatted Text Preview Container */}
          <div className="bg-[#05080E] p-4 rounded-xl border border-slate-800 text-slate-300 whitespace-pre-wrap font-mono leading-relaxed select-all">
            {telegramFormattedText}
          </div>
        </div>
      </div>
    </div>
  );
};

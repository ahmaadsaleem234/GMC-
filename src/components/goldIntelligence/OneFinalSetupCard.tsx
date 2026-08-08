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
      <div className="bg-[#080A0D] border border-[#292E35] rounded-2xl p-5 md:p-6 shadow-none space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#272C32] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded bg-[rgba(241,204,107,0.08)] text-[#F1CC6B] border border-[rgba(241,204,107,0.3)] text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F1CC6B]" />
                SINGLE-SETUP AI DECISION ENGINE
              </span>
              <span className="text-xs font-mono text-[#74D8A0] bg-[#17342E] px-2.5 py-0.5 rounded border border-[rgba(116,216,160,0.4)] font-medium">
                News-Day Only Rule Active
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>ONE FINAL XAUUSD SETUP</span>
              <span className="text-[#F1CC6B] font-mono text-base font-normal">
                ({setup.decision === "BUY" ? "🟢 BUY" : setup.decision === "SELL" ? "🔴 SELL" : "⚪ NO TRADE"})
              </span>
            </h2>
          </div>

          {/* Timezone Mode Selector */}
          <div className="flex items-center gap-2 bg-[#0E1115] p-1.5 rounded-xl border border-[#242A31] font-mono text-xs">
            <span className="text-[#9299A3] px-2 font-medium hidden sm:inline">Timezone:</span>
            {(["DUBAI", "UTC", "NEW_YORK", "LOCAL"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setTimezoneMode(mode)}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  timezoneMode === mode
                    ? "bg-[#F1CC6B] text-[#111111] font-semibold"
                    : "text-[#9299A3] hover:text-white hover:bg-[#161A21]"
                }`}
              >
                {mode === "DUBAI" ? "Dubai (GST)" : mode === "NEW_YORK" ? "NY (EST)" : mode}
              </button>
            ))}
          </div>
        </div>

        {/* 🟢/🔴/⚪ DECISION DISPLAY BANNER */}
        {setup.decision !== "NO_TRADE" ? (
          <div className="rounded-xl bg-[#111419] border border-[#292E35] p-5 md:p-6 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#252A31] pb-5">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                  <span className="px-3 py-1 rounded bg-[#17342E] text-[#74D8A0] border border-[rgba(116,216,160,0.4)] font-semibold tracking-wide text-xs uppercase flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#74D8A0]" />
                    🟢 HARAMI AI — BUY GOLD
                  </span>
                  <span className="text-[#9299A3] bg-[#0E1115] px-2.5 py-1 rounded border border-[#242A31] font-medium">
                    Asset: {setup.asset} (Spot Gold)
                  </span>
                  <span className="text-[#F1CC6B] bg-[rgba(241,204,107,0.08)] px-2.5 py-1 rounded border border-[rgba(241,204,107,0.3)] font-medium">
                    News: {setup.newsEvent}
                  </span>
                </div>

                <div className="text-xs font-mono text-[#9299A3] space-y-1">
                  <div>
                    <span>Scheduled Event Release: </span>
                    <span className="font-semibold text-[#F1CC6B]">{formatEventTime(setup.newsTimeUtc, timezoneMode)}</span>
                  </div>
                  <div>
                    <span>Signal Published (T-2H Gate): </span>
                    <span className="font-semibold text-[#74D8A0]">{formatEventTime(setup.publishedTimeUtc, timezoneMode)}</span>
                  </div>
                </div>
              </div>

              {/* Price & Action Buttons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#0E1115] p-3.5 rounded-xl border border-[#242A31]">
                <div>
                  <div className="text-xs font-mono text-[#9299A3] uppercase">Live Spot Rate</div>
                  <div className="text-xl font-mono font-bold text-[#F1CC6B]">${currentPrice.toFixed(2)}</div>
                </div>

                {onExecuteTrade && (
                  <button
                    onClick={() => onExecuteTrade("BUY")}
                    className="px-4 py-2.5 btn-buy text-xs font-mono font-semibold rounded-lg cursor-pointer flex items-center gap-2"
                  >
                    <ArrowUpRight className="w-4 h-4 text-white" />
                    <span>EXECUTE BUY ORDER</span>
                  </button>
                )}
              </div>
            </div>

            {/* Timelines & Multi-timeframe Stack */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
              <div className="bg-[#0E1115] p-3 rounded-xl border border-[#242A31] space-y-1">
                <span className="text-[#9299A3] font-medium block text-[11px] uppercase tracking-wider">
                  D1 / H4 Macro Context
                </span>
                <p className="text-[#F3F4F5] font-medium">{setup.timeframeContext.macro}</p>
              </div>
              <div className="bg-[#0E1115] p-3 rounded-xl border border-[#242A31] space-y-1">
                <span className="text-[#9299A3] font-medium block text-[11px] uppercase tracking-wider">
                  H1 / M15 Key Setup Zone
                </span>
                <p className="text-[#F1CC6B] font-semibold">{setup.timeframeContext.setup}</p>
              </div>
              <div className="bg-[#0E1115] p-3 rounded-xl border border-[#242A31] space-y-1">
                <span className="text-[#9299A3] font-medium block text-[11px] uppercase tracking-wider">
                  M5 Confirmation Trigger
                </span>
                <p className="text-[#74D8A0] font-semibold">{setup.timeframeContext.trigger}</p>
              </div>
            </div>

            {/* Key Level Matrix Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 font-mono">
              <div className="bg-[#0E1115] p-3 rounded-xl border border-[#252A31]">
                <div className="text-[11px] text-[#F1CC6B] font-medium">ENTRY RANGE</div>
                <div className="text-sm font-bold text-white">
                  ${setup.entryRange.low} – ${setup.entryRange.high}
                </div>
              </div>

              <div className="bg-[#0E1115] p-3 rounded-xl border border-[rgba(241,204,107,0.5)]">
                <div className="text-[11px] text-[#F1CC6B] font-bold">BEST ENTRY</div>
                <div className="text-base font-bold text-[#F1CC6B]">
                  ${setup.bestEntry}
                </div>
              </div>

              <div className="bg-[#0E1115] p-3 rounded-xl border border-[rgba(238,119,127,0.4)]">
                <div className="text-[11px] text-[#EE777F] font-medium">STOP LOSS</div>
                <div className="text-sm font-bold text-[#EE777F]">
                  ${setup.stopLoss}
                </div>
              </div>

              <div className="bg-[#0E1115] p-3 rounded-xl border border-[rgba(116,216,160,0.4)]">
                <div className="text-[11px] text-[#74D8A0] font-medium">TARGET TP1</div>
                <div className="text-sm font-bold text-[#74D8A0]">
                  ${setup.tp1}
                </div>
              </div>

              <div className="bg-[#0E1115] p-3 rounded-xl border border-[rgba(116,216,160,0.4)]">
                <div className="text-[11px] text-[#74D8A0] font-medium">TARGET TP2</div>
                <div className="text-sm font-bold text-[#74D8A0]">
                  ${setup.tp2}
                </div>
              </div>

              <div className="bg-[#0E1115] p-3 rounded-xl border border-[rgba(116,216,160,0.4)]">
                <div className="text-[11px] text-[#74D8A0] font-medium">TARGET TP3</div>
                <div className="text-sm font-bold text-[#74D8A0]">
                  ${setup.tp3}
                </div>
              </div>
            </div>

            {/* Metrics & Probability Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0E1115] p-3.5 rounded-xl border border-[#242A31] font-mono text-xs">
              <div>
                <span className="text-[#9299A3] block text-[11px]">RISK-TO-REWARD</span>
                <span className="text-sm font-bold text-[#F1CC6B]">1:{setup.riskRewardRatio}</span>
              </div>
              <div>
                <span className="text-[#9299A3] block text-[11px]">AI CONFIDENCE</span>
                <span className="text-sm font-bold text-[#74D8A0]">{setup.calibratedConfidencePct}%</span>
              </div>
              <div>
                <span className="text-[#9299A3] block text-[11px]">25Y SAMPLE SIZE</span>
                <span className="text-sm font-semibold text-white">{setup.sampleSize25Y} Analogues</span>
              </div>
              <div>
                <span className="text-[#9299A3] block text-[11px]">MAX ACCOUNT RISK</span>
                <span className="text-sm font-semibold text-[#F1CC6B]">{setup.maxRiskPct}% Default</span>
              </div>
            </div>

            {/* Invalidation & Rationale */}
            <div className="space-y-3 pt-2 font-mono text-xs border-t border-[#252A31]">
              <div className="bg-[#352329] border border-[rgba(238,119,127,0.4)] p-3 rounded-xl text-[#EE777F]">
                <span className="font-semibold block mb-0.5">❌ SETUP INVALIDATION CONDITION:</span>
                <span>{setup.invalidationCondition}</span>
              </div>

              <div className="bg-[#0E1115] p-3.5 rounded-xl border border-[#242A31] space-y-1 text-[#9299A3]">
                <span className="font-semibold text-[#F1CC6B] block">🧠 AI DATA-FUSION RATIONALE:</span>
                <p className="leading-relaxed">{setup.shortRationale}</p>
              </div>
            </div>
          </div>
        ) : (
          /* ⚪ CAPITAL PROTECTED NO TRADE BANNER */
          <div className="rounded-xl bg-[#111419] border border-[#292E35] p-5 md:p-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#252A31] pb-4">
              <div className="space-y-2">
                <span className="px-3 py-1 rounded bg-[#101318] text-[#9299A3] border border-[#2B3037] font-mono font-medium text-xs uppercase tracking-wider flex items-center gap-2 w-fit">
                  <ShieldCheck className="w-4 h-4 text-[#74D8A0]" />
                  ⚪ HARAMI AI — NO ACTIVE TRADE SETUP
                </span>
                <h3 className="text-base font-semibold text-white font-mono">
                  Capital Protection Rule Enforced
                </h3>
                <p className="text-xs text-[#9299A3] font-mono max-w-2xl">
                  {setup.noTradeReason || "Outside T-2H execution window for upcoming high-impact news. Signal engine unlocks 2 hours before release."}
                </p>
              </div>

              <div className="bg-[#0E1115] p-3.5 rounded-xl border border-[#242A31] min-w-[200px] text-center font-mono">
                <span className="text-[11px] text-[#9299A3] uppercase block">Next T-2H Analysis Window</span>
                <span className="text-xs font-semibold text-[#F1CC6B] block mt-1">
                  {formatEventTime(setup.nextAnalysisWindowUtc || new Date().toISOString(), timezoneMode)}
                </span>
              </div>
            </div>

            <div className="bg-[#0E1115] p-3.5 rounded-xl border border-[#242A31] text-xs font-mono text-[#9299A3] space-y-2">
              <div className="flex items-center gap-2 text-[#F1CC6B] font-semibold">
                <Info className="w-4 h-4 text-[#F1CC6B]" />
                <span>Why is there NO TRADE right now?</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[#9299A3] pl-1">
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
            <h3 className="text-sm font-semibold text-white font-mono flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#F1CC6B]" />
              <span>LIVE XAUUSD CHART WITH SETUP LEVELS</span>
            </h3>
            <span className="text-xs font-mono text-[#9299A3]">
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
        <div className="bg-[#0E1115] border border-[#242A31] rounded-xl p-4 space-y-4 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#252A31] pb-3">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-[#74D8A0]" />
              <span className="font-semibold text-white text-xs">TELEGRAM CHANNEL SYNCHRONIZER</span>
              <span className="px-2 py-0.5 rounded bg-[#101318] text-[#9299A3] border border-[#2B3037] text-[10px]">
                Bot @HaramiGoldBot
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyTelegramFormat}
                className="px-3 py-1.5 bg-[#101318] hover:bg-[#161A21] text-[#E2BA57] rounded-lg border border-[#2C3239] font-medium flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-[#F1CC6B]" />
                <span>{copiedMsg ? "Copied to Clipboard!" : "Copy Syntax"}</span>
              </button>

              <button
                onClick={handleBroadcastTelegram}
                className="px-3.5 py-1.5 btn-gold text-black font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-black" />
                <span>{broadcastSent ? "Broadcast Sent!" : "Broadcast to Telegram"}</span>
              </button>
            </div>
          </div>

          {/* Formatted Text Preview Container */}
          <div className="bg-[#080A0D] p-3.5 rounded-xl border border-[#242A31] text-[#9299A3] whitespace-pre-wrap font-mono leading-relaxed select-all">
            {telegramFormattedText}
          </div>
        </div>
      </div>
    </div>
  );
};

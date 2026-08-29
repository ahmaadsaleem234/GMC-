import React from "react";
import {
  Radio,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Flame,
  ShieldAlert,
  Activity,
  Layers,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { MacroIntelligenceReport, EconomicEvent, NewsHeadline } from "../../services/sp500NewsMacroService";

interface Sp500MacroNewsRadarProps {
  newsReport: MacroIntelligenceReport;
}

export const Sp500MacroNewsRadar: React.FC<Sp500MacroNewsRadarProps> = ({ newsReport }) => {
  const {
    providerStatus,
    activeProviders,
    nextHighImpactEvent,
    recentReleasedHighImpactEvent,
    overallNewsRisk,
    tradeBlockReason,
    isTradeBlockedByNews,
    minutesToNextEvent,
    minutesSinceRecentEvent,
    isPostNewsHunterEligible,
    marketSentimentScore,
    macroSummary,
    events,
    headlines,
  } = newsReport;

  return (
    <div className="bg-[#0b0e14]/90 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                📰 MACRO & NEWS RADAR
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase font-bold">
                MULTI-PROVIDER
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Multi-Source Economic Calendar & 30-Minute Volatility Shield Engine
            </p>
          </div>
        </div>

        {/* Provider Status Tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-300 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            {providerStatus === "CONNECTED" ? "🟢 NEWS CONNECTED" : "🟡 DELAYED"}
          </div>
          {activeProviders.map((p, idx) => (
            <span key={idx} className="hidden sm:inline-block px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* 🚨 30-MINUTE SAFETY BLOCK BANNERS */}
      {isTradeBlockedByNews && (
        <div className="mb-5 bg-gradient-to-r from-rose-950/60 via-red-900/30 to-transparent border-2 border-rose-500/60 rounded-xl p-4 shadow-[0_0_25px_rgba(244,63,94,0.25)] animate-pulse">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5 animate-bounce" />
            <div>
              <div className="text-sm font-black text-rose-300 uppercase tracking-wider flex items-center gap-2">
                <span>🔴 HARD SAFETY RULE ACTIVE: ALL NEW TRADES BLOCKED</span>
              </div>
              <p className="text-xs text-rose-200 mt-1 font-medium leading-relaxed">
                {tradeBlockReason}
              </p>
              <div className="mt-2 flex items-center gap-3 text-[11px] font-mono text-rose-300/80">
                <span>Rule: No trades within 30 min before or 30 min after High-Impact macro releases.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 POST-NEWS HUNTER ELIGIBLE BANNER */}
      {isPostNewsHunterEligible && !isTradeBlockedByNews && (
        <div className="mb-5 bg-gradient-to-r from-cyan-950/60 via-sky-900/30 to-transparent border border-cyan-400/50 rounded-xl p-4 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
          <div className="flex items-start gap-3">
            <Flame className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-black text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <span>🔥 POST-NEWS HUNTER MODE ACTIVATED</span>
              </div>
              <p className="text-xs text-cyan-100 mt-1">
                {recentReleasedHighImpactEvent?.name} 30-minute cooldown completed. Price has stabilized; searching for clean post-event liquidity sweeps and structural 15M/5M reclaims.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout: Next Event Spotlight + Economic Calendar Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 5 Cols: Spotlight Event Status */}
        <div className="lg:col-span-5 space-y-3">
          {/* Next High Impact Event Card */}
          <div className="bg-[#070a10] border border-slate-800 rounded-xl p-4 shadow-inner">
            <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center justify-between">
              <span>NEXT HIGH-IMPACT EVENT</span>
              <span className="text-rose-400 font-mono">COUNTDOWN</span>
            </div>
            {nextHighImpactEvent ? (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    {nextHighImpactEvent.impact}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{nextHighImpactEvent.country}</span>
                </div>
                <h3 className="text-sm font-black text-white mt-1">{nextHighImpactEvent.name}</h3>
                
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-mono">
                  <div className="bg-[#0b0e14] p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">TIME REMAINING</span>
                    <span className={`text-base font-black ${minutesToNextEvent && minutesToNextEvent <= 30 ? "text-rose-400 animate-pulse" : "text-cyan-300"}`}>
                      {minutesToNextEvent} MIN
                    </span>
                  </div>
                  <div className="bg-[#0b0e14] p-2 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">FORECAST / PREV</span>
                    <span className="text-xs font-bold text-slate-300">
                      {nextHighImpactEvent.forecast || "N/A"} / {nextHighImpactEvent.previous || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 mt-2">No extreme events scheduled in next 6 hours.</div>
            )}
          </div>

          {/* Recent Released Event & Post-News Reaction */}
          {recentReleasedHighImpactEvent && (
            <div className="bg-[#070a10] border border-slate-800 rounded-xl p-4 shadow-inner">
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center justify-between">
                <span>RECENT MACRO RELEASE</span>
                <span className="text-cyan-400 font-mono">{minutesSinceRecentEvent}m AGO</span>
              </div>
              <div className="mt-2">
                <h3 className="text-xs font-bold text-white">{recentReleasedHighImpactEvent.name}</h3>
                <div className="flex items-center gap-3 mt-2 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500">ACTUAL: </span>
                    <span className="font-black text-emerald-400">{recentReleasedHighImpactEvent.actual}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">FORECAST: </span>
                    <span className="text-slate-300">{recentReleasedHighImpactEvent.forecast}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">PREV: </span>
                    <span className="text-slate-400">{recentReleasedHighImpactEvent.previous}</span>
                  </div>
                </div>

                {recentReleasedHighImpactEvent.marketReaction && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
                    Reaction: <span className="text-emerald-400 font-bold">+{recentReleasedHighImpactEvent.marketReaction.initialSpikePoints} pts initial spike</span> (Stabilized: {recentReleasedHighImpactEvent.marketReaction.isStabilized ? "Yes" : "No"})
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right 7 Cols: Upcoming Economic Calendar List */}
        <div className="lg:col-span-7 bg-[#070a10] border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-3 flex items-center justify-between">
            <span>UPCOMING ECONOMIC SCHEDULE</span>
            <span className="text-[10px] text-slate-500">EST TIME</span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-56 pr-1 no-scrollbar">
            {events.map((evt) => {
              const isPast = evt.minutesRemaining <= 0;
              const isImminent = evt.minutesRemaining > 0 && evt.minutesRemaining <= 30;

              return (
                <div
                  key={evt.id}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 transition-all ${
                    isImminent
                      ? "bg-rose-950/30 border-rose-500/50 text-rose-200"
                      : isPast
                      ? "bg-[#05070c] border-slate-800/60 text-slate-500"
                      : "bg-[#090d15] border-slate-800/90 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`text-[9px] font-black font-mono px-1.5 py-0.5 rounded uppercase ${
                        evt.impact === "EXTREME"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : evt.impact === "HIGH"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {evt.impact}
                    </span>
                    <span className="font-bold text-white truncate">{evt.name}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                    <span className="text-slate-400">
                      {isPast ? `${Math.abs(evt.minutesRemaining)}m ago` : `in ${evt.minutesRemaining}m`}
                    </span>
                    {evt.forecast && (
                      <span className="text-slate-400 hidden sm:inline">
                        Exp: <strong className="text-slate-200">{evt.forecast}</strong>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

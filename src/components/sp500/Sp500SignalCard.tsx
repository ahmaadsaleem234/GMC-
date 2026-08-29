import React from "react";
import {
  Target,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  BarChart3,
  Layers,
  ChevronRight,
  Flame,
} from "lucide-react";
import { Sp500HunterAnalysis } from "../../services/sp500HunterEngine";

interface Sp500SignalCardProps {
  analysis: Sp500HunterAnalysis;
  onExecuteDemoTrade?: () => void;
}

export const Sp500SignalCard: React.FC<Sp500SignalCardProps> = ({
  analysis,
  onExecuteDemoTrade,
}) => {
  const {
    selectedInstrument,
    activeSetup,
    aiVerdict,
    aiScore,
    scoreBreakdown,
    marketRegime,
    timeframes,
    newsReport,
    aiReasoning,
    dailyGovernor,
  } = analysis as any;

  const isBuy = aiVerdict === "BUY" && activeSetup;

  if (isBuy) {
    return (
      <div className="bg-gradient-to-b from-[#0b101b] to-[#070a10] border-2 border-cyan-500/60 rounded-2xl p-5 sm:p-6 shadow-[0_0_35px_rgba(6,182,212,0.25)] relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center font-black shadow-[0_0_15px_rgba(6,182,212,0.8)]">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  HIGH-CONVICTION TRADE SETUP
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold">
                  VERIFIED CONFLUENCE
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>{activeSetup.instrument}</span>
                <span className="text-emerald-400">🟢 BUY ENTRY</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-[#05070c] border border-cyan-500/40 px-3.5 py-1.5 rounded-xl text-right">
              <div className="text-[10px] font-bold uppercase text-slate-400">AI CONVICTION</div>
              <div className="text-lg font-black font-mono text-cyan-300">
                {activeSetup.score} <span className="text-xs text-slate-500">/ 100</span>
              </div>
            </div>
            <div className="bg-[#05070c] border border-slate-800 px-3.5 py-1.5 rounded-xl text-right">
              <div className="text-[10px] font-bold uppercase text-slate-400">RISK : REWARD</div>
              <div className="text-lg font-black font-mono text-emerald-400">
                1 : {activeSetup.riskRewardRatio}
              </div>
            </div>
          </div>
        </div>

        {/* Core Price Execution Levels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-5">
          {/* Entry Zone & Primary Entry */}
          <div className="bg-[#060910] border border-cyan-500/30 rounded-xl p-3.5 shadow-inner">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
              <span>ENTRY ZONE</span>
              <span className="text-cyan-400 font-mono">DEMAND</span>
            </div>
            <div className="mt-1 text-base sm:text-lg font-black font-mono text-cyan-300">
              ${activeSetup.entryZone.low.toFixed(2)} – ${activeSetup.entryZone.high.toFixed(2)}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-1 flex justify-between">
              <span>E1: ${activeSetup.entry1.toFixed(2)}</span>
              <span>E2: ${activeSetup.entry2.toFixed(2)}</span>
            </div>
          </div>

          {/* Stop Loss & Invalidation */}
          <div className="bg-[#060910] border border-rose-500/40 rounded-xl p-3.5 shadow-inner">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
              <span>STOP LOSS</span>
              <span className="text-rose-400 font-mono">INVALIDATION</span>
            </div>
            <div className="mt-1 text-base sm:text-lg font-black font-mono text-rose-400">
              ${activeSetup.stopLoss.toFixed(2)}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-1 truncate" title={activeSetup.invalidationReason}>
              Below 15M Swing Low
            </div>
          </div>

          {/* TP1 & TP2 */}
          <div className="bg-[#060910] border border-emerald-500/30 rounded-xl p-3.5 shadow-inner">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
              <span>TARGETS (TP1 & TP2)</span>
              <span className="text-emerald-400 font-mono">FIB EXT</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] text-slate-400 mr-1">TP1:</span>
                <span className="text-base font-black font-mono text-emerald-300">${activeSetup.takeProfit1.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 mr-1">TP2:</span>
                <span className="text-base font-black font-mono text-emerald-400">${activeSetup.takeProfit2.toFixed(2)}</span>
              </div>
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-1">
              TP1: 1.272 Ext | TP2: 1.618 Major Liquidity
            </div>
          </div>

          {/* TP3 Extended Target */}
          <div className="bg-[#060910] border border-indigo-500/30 rounded-xl p-3.5 shadow-inner">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase">
              <span>EXTENDED TARGET (TP3)</span>
              <span className="text-indigo-400 font-mono">STRUCTURAL</span>
            </div>
            <div className="mt-1 text-base sm:text-lg font-black font-mono text-indigo-300">
              ${activeSetup.takeProfit3.toFixed(2)}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-1">
              HTF 4H Structural High Projection
            </div>
          </div>
        </div>

        {/* Confluence Parameter Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-[11px] font-mono">
          <div className="bg-[#05080e] p-2 rounded-lg border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400">MARKET REGIME:</span>
            <span className="font-bold text-emerald-400">{activeSetup.marketRegime.replace("_", " ")}</span>
          </div>
          <div className="bg-[#05080e] p-2 rounded-lg border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400">15M STRUCTURE:</span>
            <span className="font-bold text-cyan-400">BULLISH BOS</span>
          </div>
          <div className="bg-[#05080e] p-2 rounded-lg border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400">5M CONFIRMATION:</span>
            <span className="font-bold text-emerald-400">CONFIRMED</span>
          </div>
          <div className="bg-[#05080e] p-2 rounded-lg border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400">NEWS RISK:</span>
            <span className="font-bold text-emerald-400">🟢 SAFE</span>
          </div>
        </div>

        {/* Mathematical AI Reasoning Checklist */}
        <div className="bg-[#05080e] border border-slate-800/90 rounded-xl p-4 mb-4">
          <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>INSTITUTIONAL AI CONFLUENCE BREAKDOWN</span>
          </div>
          <div className="space-y-1.5">
            {activeSetup.executionTriggers.map((trig: string, idx: number) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 font-sans">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{trig}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom execution action */}
        {onExecuteDemoTrade && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-xs text-slate-400">
              ⚡ Governor: <span className="text-white font-mono font-bold">1 / 2</span> daily setups active. Maximum 2 per trading day.
            </div>
            <button
              id="sp500-execute-signal-btn"
              onClick={onExecuteDemoTrade}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-400 hover:to-sky-500 text-slate-950 font-black text-xs tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.6)] transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>EXECUTE {activeSetup.instrument} CONVICTION SETUP</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // 🟡 WAIT CARD (Default State when conditions are not exceptional)
  return (
    <div className="bg-gradient-to-b from-[#0b0e14] to-[#07090e] border border-amber-500/40 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 flex items-center justify-center font-black">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                DISCIPLINE GOVERNOR ACTIVE
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono">
                QUALITY &gt; FREQUENCY
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>S&P 500 AI HUNTER</span>
              <span className="text-amber-400">🟡 STAND ASIDE (WAIT)</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#05070c] border border-amber-500/30 px-3.5 py-1.5 rounded-xl text-right">
            <div className="text-[10px] font-bold uppercase text-slate-400">CURRENT SCORE</div>
            <div className="text-lg font-black font-mono text-amber-400">
              {aiScore} <span className="text-xs text-slate-500">/ 100</span>
            </div>
          </div>
          <div className="bg-[#05070c] border border-slate-800 px-3.5 py-1.5 rounded-xl text-right">
            <div className="text-[10px] font-bold uppercase text-slate-400">THRESHOLD</div>
            <div className="text-lg font-black font-mono text-slate-300">
              80+ <span className="text-xs text-slate-500">REQ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rationale & Reasoning Box */}
      <div className="my-5 bg-[#05070d] border border-slate-800/90 rounded-xl p-4">
        <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2 mb-3">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>WHY AI IS WAITING — MATHEMATICAL REJECTION RATIONALE</span>
        </div>

        <div className="space-y-2">
          {aiReasoning.bulletPoints.map((reason: string, idx: number) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <span>{reason}</span>
            </div>
          ))}
        </div>

        {/* 100-point Score Component Breakdown */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <div className="text-[11px] font-bold uppercase text-slate-400 mb-2">
            100-POINT CONFLUENCE SCORE MATRIX:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs font-mono">
            <div className="bg-[#080c14] p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500">STRUCTURE</div>
              <div className="font-bold text-cyan-300">{scoreBreakdown.structureScore}/25</div>
            </div>
            <div className="bg-[#080c14] p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500">FIBONACCI</div>
              <div className="font-bold text-cyan-300">{scoreBreakdown.fibonacciScore}/20</div>
            </div>
            <div className="bg-[#080c14] p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500">REACTION</div>
              <div className="font-bold text-cyan-300">{scoreBreakdown.entryReactionScore}/20</div>
            </div>
            <div className="bg-[#080c14] p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500">MOMENTUM</div>
              <div className="font-bold text-cyan-300">{scoreBreakdown.momentumScore}/15</div>
            </div>
            <div className="bg-[#080c14] p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500">VOLUME</div>
              <div className="font-bold text-cyan-300">{scoreBreakdown.volumeScore}/10</div>
            </div>
            <div className="bg-[#080c14] p-2 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500">R:R RATIO</div>
              <div className="font-bold text-cyan-300">{scoreBreakdown.riskRewardScore}/10</div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Action Footer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono text-slate-400 bg-[#05070d] p-3 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>NEXT ACTION: <strong className="text-white">{aiReasoning.nextAction}</strong></span>
        </div>
        <div className="text-slate-500">
          Target: 0–2 High-Conviction Setups / Day
        </div>
      </div>
    </div>
  );
};

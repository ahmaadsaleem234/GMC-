import React, { useState } from "react";
import {
  Crosshair,
  Shield,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  Send,
  Lock,
  Zap,
  Clock,
  Sparkles,
  HelpCircle,
  TrendingUp,
} from "lucide-react";
import { GbpusdSniperSetup } from "../../services/gbpusdSniperEngine";

interface GbpusdActiveSetupCardProps {
  setup: GbpusdSniperSetup | null;
  currentPrice: number;
  dailyLockActive: boolean;
  whyNoTrade: string[];
  onDispatchTelegram?: (setup: GbpusdSniperSetup) => void;
  onLockTrade?: (setupId: string) => void;
}

export const GbpusdActiveSetupCard: React.FC<GbpusdActiveSetupCardProps> = ({
  setup,
  currentPrice,
  dailyLockActive,
  whyNoTrade,
  onDispatchTelegram,
  onLockTrade,
}) => {
  const [dispatching, setDispatching] = useState(false);
  const [dispatchedSuccess, setDispatchedSuccess] = useState(false);

  // If No A+ Setup exists or Daily Lock is active, render Institutional "NO TRADE" Observatory
  if (!setup || dailyLockActive) {
    return (
      <div className="w-full rounded-2xl bg-gradient-to-b from-[#080d17] to-[#0b1322] border border-slate-800 p-5 shadow-xl flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-wider flex items-center gap-2">
                <span>GBPUSD 3D AI SNIPER</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
                  {dailyLockActive ? "🛡️ DAILY QUOTA LOCKED" : "🟡 SCANNING • NO TRADE"}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {dailyLockActive
                  ? "Maximum 1 GBPUSD trade per day already executed. Capital protection active."
                  : "Market observatory scanning 24/7. System remains patient until an A+ condition forms."}
              </p>
            </div>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-mono text-slate-300">
            ACTION: <b className="text-amber-400 uppercase font-black">PATIENT WAIT</b>
          </div>
        </div>

        {/* Why No Trade Section */}
        <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wide">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>Why No Official Trade Right Now?</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-400">
            {whyNoTrade.length > 0 ? (
              whyNoTrade.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{reason}</span>
                </div>
              ))
            ) : (
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>
                  Multi-timeframe confluences currently scoring below the strict 90/100 A+ Sniper threshold. GMC enforces zero forced trades.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Philosophy Footer */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
          <span>RULE: MAXIMUM 1 A+ TRADE PER DAY</span>
          <span>DISCIPLINE OVER ACTIVITY</span>
        </div>
      </div>
    );
  }

  // Active A+ Setup Card
  const isBuy = setup.direction === "BUY";
  const slPips = Math.abs((setup.bestEntry - setup.stopLoss) * 10000).toFixed(1);
  const tp1Pips = Math.abs((setup.tp1 - setup.bestEntry) * 10000).toFixed(1);
  const tp2Pips = Math.abs((setup.tp2 - setup.bestEntry) * 10000).toFixed(1);
  const tp3Pips = Math.abs((setup.tp3 - setup.bestEntry) * 10000).toFixed(1);

  const handleTelegramClick = async () => {
    setDispatching(true);
    if (onDispatchTelegram) {
      await onDispatchTelegram(setup);
    }
    if (onLockTrade) {
      onLockTrade(setup.id);
    }
    setDispatchedSuccess(true);
    setDispatching(false);
  };

  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-[#080d17] via-[#0b1626] to-[#080d17] border border-cyan-500/40 p-5 shadow-[0_0_35px_rgba(6,182,212,0.18)] flex flex-col gap-4.5 animate-fadeIn">
      {/* Header with Direction, Grade and Target */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-500/30 pb-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-2xl border shadow-lg ${
              isBuy
                ? "bg-emerald-950/60 border-emerald-500/60 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                : "bg-rose-950/60 border-rose-500/60 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.4)]"
            }`}
          >
            {isBuy ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white tracking-wider">
                GBPUSD {setup.direction} SETUP
              </h3>
              <span className="text-xs font-black font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/50">
                GRADE A+ (SCORE {setup.score}/100)
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              SETUP ID: <b>#{setup.id}</b> • RISK:REWARD <b>{setup.riskToReward}</b>
            </p>
          </div>
        </div>

        {/* Action Button: Broadcast to Telegram / Lock Trade */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTelegramClick}
            disabled={dispatching || dispatchedSuccess}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-lg ${
              dispatchedSuccess
                ? "bg-emerald-600 text-white border border-emerald-400"
                : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            }`}
          >
            {dispatching ? (
              <Zap className="w-4 h-4 animate-spin" />
            ) : dispatchedSuccess ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>
              {dispatchedSuccess
                ? "BROADCASTED & 1-TRADE LOCKED"
                : dispatching
                ? "DISPATCHING..."
                : "DISPATCH TO TELEGRAM"}
            </span>
          </button>
        </div>
      </div>

      {/* Target Price Matrix (Entry, SL, TP1, TP2, TP3) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs font-mono">
        {/* Entry Zone */}
        <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex flex-col justify-between">
          <span className="text-[10px] text-cyan-300 font-sans uppercase font-bold">Best Entry</span>
          <span className="text-base font-black text-white mt-1">{setup.bestEntry.toFixed(5)}</span>
          <span className="text-[10px] text-slate-400">
            Zone: {setup.entryLow.toFixed(5)} - {setup.entryHigh.toFixed(5)}
          </span>
        </div>

        {/* Stop Loss */}
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 flex flex-col justify-between">
          <span className="text-[10px] text-rose-300 font-sans uppercase font-bold">Stop Loss</span>
          <span className="text-base font-black text-rose-300 mt-1">{setup.stopLoss.toFixed(5)}</span>
          <span className="text-[10px] text-rose-400/80">Risk: -{slPips} pips</span>
        </div>

        {/* TP1 */}
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col justify-between">
          <span className="text-[10px] text-emerald-300 font-sans uppercase font-bold">TP 1 (Secure)</span>
          <span className="text-base font-black text-emerald-300 mt-1">{setup.tp1.toFixed(5)}</span>
          <span className="text-[10px] text-emerald-400/80">+{tp1Pips} pips</span>
        </div>

        {/* TP2 */}
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col justify-between">
          <span className="text-[10px] text-emerald-300 font-sans uppercase font-bold">TP 2 (Target)</span>
          <span className="text-base font-black text-emerald-300 mt-1">{setup.tp2.toFixed(5)}</span>
          <span className="text-[10px] text-emerald-400/80">+{tp2Pips} pips</span>
        </div>

        {/* TP3 */}
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex flex-col justify-between">
          <span className="text-[10px] text-emerald-300 font-sans uppercase font-bold">TP 3 (Runner)</span>
          <span className="text-base font-black text-emerald-300 mt-1">{setup.tp3.toFixed(5)}</span>
          <span className="text-[10px] text-emerald-400/80">+{tp3Pips} pips</span>
        </div>
      </div>

      {/* Why This Trade (SMC & Quantitative Confluences) */}
      <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Why This Trade? (5 Verified Institutional Confluences)</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
          {setup.whyThisTrade.map((reason, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Invalidation Rules */}
      <div className="p-3 rounded-xl bg-slate-900 border border-rose-500/30 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-rose-300">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>
            <b>INVALIDATION CRITERIA:</b> {setup.invalidationCriteria}
          </span>
        </div>
        <div className="text-slate-400 text-[11px]">
          Historical Win Rate: <b className="text-emerald-400">{setup.historicalMatch.winRateInRegime}%</b>
        </div>
      </div>
    </div>
  );
};

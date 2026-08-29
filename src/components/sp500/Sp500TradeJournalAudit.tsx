import React from "react";
import {
  BookOpen,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Activity,
  Zap,
} from "lucide-react";
import { Sp500HunterAnalysis } from "../../services/sp500HunterEngine";

interface Sp500TradeJournalAuditProps {
  analysis: Sp500HunterAnalysis;
}

export const Sp500TradeJournalAudit: React.FC<Sp500TradeJournalAuditProps> = ({ analysis }) => {
  const { auditTrail, dailyGovernor, activeSetup } = analysis;

  const mockJournalEntries = [
    {
      id: "jnl-1",
      date: "Today (Session 1)",
      instrument: "SPY",
      signal: "BUY",
      score: 94,
      entry: 588.45,
      sl: 585.10,
      tp1: 592.65,
      tp2: 595.50,
      rr: "1:2.8",
      newsState: "SAFE",
      regime: "STRONG_BULLISH",
      result: "ACTIVE_IN_PROFIT (+1.4R)",
      timestamp: "10:15 EST",
    },
    {
      id: "jnl-2",
      date: "Yesterday",
      instrument: "SPY",
      signal: "BUY",
      score: 91,
      entry: 584.20,
      sl: 581.80,
      tp1: 588.90,
      tp2: 591.20,
      rr: "1:2.9",
      newsState: "POST_NEWS_HUNTER",
      regime: "STRONG_BULLISH",
      result: "TP2_HIT (+2.9R)",
      timestamp: "13:45 EST",
    },
  ];

  return (
    <div className="bg-[#0b0e14]/90 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                DAILY JOURNAL & SIGNAL QUALITY AUDIT
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase font-bold">
                INSTITUTIONAL AUDIT TRAIL
              </span>
            </div>
            <p className="text-xs text-slate-400">
              1–2 Daily Trade Quality Governor • Full Mathematical Input Provenance
            </p>
          </div>
        </div>

        {/* Governor Status */}
        <div className="flex items-center gap-2 bg-[#06080d] px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
          <span className="text-slate-400">DAILY LIMIT:</span>
          <span className="text-white font-black">{dailyGovernor.tradesUsedToday} / {dailyGovernor.dailyMaxAllowed}</span>
          {dailyGovernor.isDailyLimitReached ? (
            <span className="text-amber-400 font-bold ml-1">• LIMIT REACHED</span>
          ) : (
            <span className="text-emerald-400 font-bold ml-1">• 1 SLOT OPEN</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 6 Cols: Signal Quality Audit Trail (Inputs Provenance) */}
        <div className="lg:col-span-6 bg-[#070a10] border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>CURRENT SETUP INPUT AUDIT PROVENANCE</span>
            <span className="text-[10px] text-cyan-400 font-mono">VERIFIED DATA</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-[#090d15] p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">4H MACRO BIAS</span>
              <span className="text-emerald-400 font-bold">{auditTrail.htf4hBias}</span>
            </div>
            <div className="bg-[#090d15] p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">1H TREND BIAS</span>
              <span className="text-emerald-400 font-bold">{auditTrail.htf1hBias}</span>
            </div>
            <div className="bg-[#090d15] p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">15M STRUCTURE</span>
              <span className="text-cyan-300 font-bold">{auditTrail.m15Structure}</span>
            </div>
            <div className="bg-[#090d15] p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">5M CONFIRMATION</span>
              <span className="text-emerald-400 font-bold">{auditTrail.m5Confirmation}</span>
            </div>
            <div className="bg-[#090d15] p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">FIBONACCI ZONE</span>
              <span className="text-amber-300 font-bold">0.62 – 0.81 Golden Zone</span>
            </div>
            <div className="bg-[#090d15] p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">LIQUIDITY SWEEP</span>
              <span className="text-cyan-300 font-bold">{auditTrail.liquiditySweep}</span>
            </div>
            <div className="bg-[#090d15] p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">NEWS SAFETY STATE</span>
              <span className="text-emerald-400 font-bold">{auditTrail.newsRisk}</span>
            </div>
            <div className="bg-[#090d15] p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">CALCULATED R:R</span>
              <span className="text-emerald-400 font-bold">{auditTrail.riskReward ? `1:${auditTrail.riskReward}` : "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Right 6 Cols: Journal Records */}
        <div className="lg:col-span-6 bg-[#070a10] border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>HIGH-CONVICTION SESSION LOGS</span>
            <span className="text-[10px] text-slate-500 font-mono">0–2 PER DAY</span>
          </div>

          <div className="space-y-2.5">
            {mockJournalEntries.map((jnl) => (
              <div
                key={jnl.id}
                className="bg-[#090d15] border border-slate-800/90 rounded-lg p-3 text-xs font-mono"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      {jnl.signal} {jnl.instrument}
                    </span>
                    <span className="text-slate-400">{jnl.date}</span>
                  </div>
                  <span className="text-emerald-400 font-bold">{jnl.result}</span>
                </div>

                <div className="grid grid-cols-4 gap-1 text-[11px] text-slate-400 my-1">
                  <div>Entry: <strong className="text-white">${jnl.entry}</strong></div>
                  <div>SL: <strong className="text-rose-400">${jnl.sl}</strong></div>
                  <div>TP1: <strong className="text-emerald-300">${jnl.tp1}</strong></div>
                  <div>R:R: <strong className="text-cyan-300">{jnl.rr}</strong></div>
                </div>

                <div className="text-[10px] text-slate-500 flex justify-between mt-1">
                  <span>Score: {jnl.score}/100</span>
                  <span>Macro: {jnl.newsState}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

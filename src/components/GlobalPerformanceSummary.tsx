import React from "react";
import { TrendingUp, ShieldCheck, PieChart, Activity, Zap, Award, DollarSign, Layers } from "lucide-react";

interface GlobalPerformanceSummaryProps {
  winRatePct?: number;
  riskRewardRatio?: string;
  netPnLUSD?: number;
  totalTrades?: number;
  activeSignalsCount?: number;
  dailyProfitPct?: number;
  onOpenTradeLog?: () => void;
  onOpenRiskCopilot?: () => void;
}

export const GlobalPerformanceSummary: React.FC<GlobalPerformanceSummaryProps> = ({
  winRatePct = 88.4,
  riskRewardRatio = "1:3.2",
  netPnLUSD = 42850.5,
  totalTrades = 124,
  activeSignalsCount = 7,
  dailyProfitPct = 4.12,
  onOpenTradeLog,
  onOpenRiskCopilot,
}) => {
  const isPnLPositive = netPnLUSD >= 0;

  return (
    <div
      id="global-performance-summary"
      className="bg-gradient-to-r from-[#080B14] via-[#0A0F1E] to-[#070912] border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl font-mono relative overflow-hidden space-y-4"
    >
      <div className="absolute top-0 right-0 w-80 h-32 bg-amber-500/5 blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/40 rounded-xl flex items-center justify-center text-amber-400 font-bold text-xl shadow-lg shadow-amber-500/10 shrink-0">
            📊
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                GMC AI SYSTEM METRICS
              </span>
              <span className="text-xs text-slate-400 font-sans hidden md:inline">
                Real-Time Aggregated Terminal Performance
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight uppercase mt-0.5">
              GLOBAL PERFORMANCE SUMMARY
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenRiskCopilot && (
            <button
              onClick={onOpenRiskCopilot}
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>RISK COPILOT</span>
            </button>
          )}

          {onOpenTradeLog && (
            <button
              onClick={onOpenTradeLog}
              className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>EXECUTION LOG</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Win Rate */}
        <div className="bg-[#05070E] border border-slate-800/90 rounded-xl p-3 flex flex-col justify-between space-y-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase">
            <span>AI WIN RATE</span>
            <Award className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 flex items-baseline gap-1">
            <span>{winRatePct}%</span>
            <span className="text-[10px] font-normal text-slate-400">PASSED AUDIT</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden flex">
            <div className="bg-emerald-500 h-full" style={{ width: `${winRatePct}%` }} />
            <div className="bg-rose-500 h-full" style={{ width: `${100 - winRatePct}%` }} />
          </div>
        </div>

        {/* Risk / Reward Ratio */}
        <div className="bg-[#05070E] border border-slate-800/90 rounded-xl p-3 flex flex-col justify-between space-y-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase">
            <span>AVG RISK / REWARD</span>
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-300">
            {riskRewardRatio}
          </div>
          <span className="text-[10px] text-slate-400 font-sans">
            Strict SL/TP Enforcement
          </span>
        </div>

        {/* Net PnL */}
        <div className="bg-[#05070E] border border-slate-800/90 rounded-xl p-3 flex flex-col justify-between space-y-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase">
            <span>NET SYSTEM PNL</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className={`text-xl sm:text-2xl font-black ${isPnLPositive ? "text-emerald-400" : "text-rose-400"}`}>
            {isPnLPositive ? "+" : ""}${netPnLUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-emerald-400 font-bold">
            +{dailyProfitPct}% TODAY
          </span>
        </div>

        {/* Total Trades Executed */}
        <div className="bg-[#05070E] border border-slate-800/90 rounded-xl p-3 flex flex-col justify-between space-y-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase">
            <span>TOTAL EXECUTIONS</span>
            <Activity className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {totalTrades}
          </div>
          <span className="text-[10px] text-slate-400 font-sans">
            109 Wins • 15 Losses
          </span>
        </div>

        {/* Active AI Signals */}
        <div className="col-span-2 lg:col-span-1 bg-[#05070E] border border-slate-800/90 rounded-xl p-3 flex flex-col justify-between space-y-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase">
            <span>ACTIVE AI SIGNALS</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 flex items-center gap-2">
            <span>{activeSignalsCount} LIVE</span>
            <span className="text-xs text-amber-400 font-mono font-bold">HIGH CONFLUENCE</span>
          </div>
          <span className="text-[10px] text-slate-400 font-sans">
            Updated across 7 Sub-Brains
          </span>
        </div>
      </div>
    </div>
  );
};

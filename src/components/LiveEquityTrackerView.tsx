import React from "react";
import { getModuleTitle } from "../utils/moduleRegistry";
import { TrendingUp, BarChart3, ShieldAlert, Award, PieChart, Activity, DollarSign, ArrowUpRight } from "lucide-react";
import { TradeLogEntry } from "../types";

interface LiveEquityTrackerViewProps {
  trades?: TradeLogEntry[];
}

export function LiveEquityTrackerView({ trades = [] }: LiveEquityTrackerViewProps) {
  // Generate sample equity curve points from initial $10,000 capital
  const initialCapital = 10000;
  const equityPoints = [
    { time: "09:00 AM", balance: 10000, drawdown: 0.0 },
    { time: "09:30 AM", balance: 10180, drawdown: 0.0 },
    { time: "10:00 AM", balance: 10320, drawdown: 0.0 },
    { time: "10:30 AM", balance: 10290, drawdown: 0.29 },
    { time: "11:00 AM", balance: 10540, drawdown: 0.0 },
    { time: "11:30 AM", balance: 10720, drawdown: 0.0 },
    { time: "12:00 PM", balance: 10880, drawdown: 0.0 },
  ];

  const currentEquity = equityPoints[equityPoints.length - 1].balance;
  const netProfit = currentEquity - initialCapital;
  const roiPct = ((netProfit / initialCapital) * 100).toFixed(2);
  const maxDrawdownPct = "0.29%";
  const profitFactor = "4.65";
  const winRatePct = "89.5%";

  return (
    <div id="live-equity-tracker-view" className="space-y-6 font-mono text-xs">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0C1220] via-[#080D1A] to-[#04060C] border-2 border-emerald-500/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/50 rounded-2xl flex items-center justify-center text-emerald-400 text-2xl shadow-lg shadow-emerald-500/20">
              📈
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                  {getModuleTitle("equitytracker")}
                </h1>
                <span className="px-2.5 py-0.5 bg-emerald-500 text-black font-extrabold text-[10px] rounded uppercase tracking-wider">
                  PORTFOLIO ANALYTICS
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Real-time visual tracking of portfolio balance, growth curve, maximum drawdown, profit factor, and trade performance analytics.
              </p>
            </div>
          </div>
        </div>

        {/* Core KPI Metrics */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#05070F] border border-slate-800 p-3 rounded-xl">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">INITIAL CAPITAL</span>
            <span className="text-base font-black text-white">${initialCapital.toLocaleString()}</span>
          </div>

          <div className="bg-[#05070F] border border-emerald-500/40 p-3 rounded-xl">
            <span className="text-[10px] text-emerald-400 uppercase font-bold block">CURRENT EQUITY</span>
            <span className="text-base font-black text-emerald-400">${currentEquity.toLocaleString()}</span>
          </div>

          <div className="bg-[#05070F] border border-amber-500/40 p-3 rounded-xl">
            <span className="text-[10px] text-amber-400 uppercase font-bold block">NET PROFIT (ROI)</span>
            <span className="text-base font-black text-amber-400">+${netProfit.toLocaleString()} (+{roiPct}%)</span>
          </div>

          <div className="bg-[#05070F] border border-slate-800 p-3 rounded-xl">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">MAX DRAWDOWN</span>
            <span className="text-base font-black text-emerald-400">{maxDrawdownPct}</span>
          </div>
        </div>
      </div>

      {/* Equity Growth Visual Chart */}
      <div className="bg-[#080B14] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
              REAL-TIME EQUITY GROWTH CURVE ($)
            </h2>
          </div>
          <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded">
            STEEP UPWARD ACCELERATION
          </span>
        </div>

        {/* Visual SVG Growth Curve */}
        <div className="p-4 bg-[#05070F] border border-slate-800 rounded-xl space-y-2">
          <div className="h-48 flex items-end justify-between gap-2 pt-6 px-2">
            {equityPoints.map((pt, idx) => {
              const heightPct = Math.max(20, ((pt.balance - 9800) / (11000 - 9800)) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[9px] text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    ${pt.balance}
                  </span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full bg-gradient-to-t from-emerald-600 via-emerald-500 to-emerald-400 rounded-t-lg transition-all group-hover:brightness-125 shadow-lg shadow-emerald-500/20"
                  />
                  <span className="text-[9px] text-slate-500 font-mono">{pt.time}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

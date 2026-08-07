import React from "react";
import { Zap, Trophy, ShieldCheck, ArrowUpRight, RefreshCw, BarChart2 } from "lucide-react";
import { TabDemoAccount } from "../useDemoAccounts";

interface TabDemoBannerProps {
  account: TabDemoAccount;
  onExecuteDemoTrade?: () => void;
}

export function TabDemoBanner({ account, onExecuteDemoTrade }: TabDemoBannerProps) {
  if (!account) return null;

  const pnlUSD = (account.equity ?? 5000) - (account.initialBalance ?? 5000);
  const pnlPct = (((pnlUSD) / (account.initialBalance || 5000)) * 100).toFixed(2);
  const isProfitable = pnlUSD >= 0;

  return (
    <div className="bg-gradient-to-r from-[#0B0F19] via-[#070A12] to-[#04060A] border-2 border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden font-mono text-xs my-4">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left Info */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-emerald-500/20 border border-emerald-500/50 rounded-xl flex items-center justify-center text-emerald-400 text-xl shadow-lg shadow-emerald-500/20 shrink-0">
            🏆
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-extrabold text-sm sm:text-base">
                {account.tabLabel} — $5,000 DEMO ALLOCATION
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-black rounded uppercase">
                {account.badge}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Independent $5,000 simulation account auto-executing trades for this AI Brain module to evaluate real win-rate & performance.
            </p>
          </div>
        </div>

        {/* Right Stats */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="bg-[#05070F] border border-slate-800 px-3.5 py-2 rounded-xl text-center">
            <span className="text-[9px] text-slate-500 uppercase font-bold block">DEMO BALANCE</span>
            <span className="text-sm font-black text-white">${account.balance.toLocaleString()}</span>
          </div>

          <div className="bg-[#05070F] border border-emerald-500/30 px-3.5 py-2 rounded-xl text-center">
            <span className="text-[9px] text-slate-500 uppercase font-bold block">TOTAL PnL</span>
            <span className={`text-sm font-black ${isProfitable ? "text-emerald-400" : "text-rose-400"}`}>
              {isProfitable ? "+" : ""}${pnlUSD.toFixed(2)} ({isProfitable ? "+" : ""}{pnlPct}%)
            </span>
          </div>

          <div className="bg-[#05070F] border border-slate-800 px-3.5 py-2 rounded-xl text-center">
            <span className="text-[9px] text-slate-500 uppercase font-bold block">WIN RATE</span>
            <span className="text-sm font-black text-amber-400">{account.winRatePct}%</span>
          </div>

          {onExecuteDemoTrade && (
            <button
              onClick={onExecuteDemoTrade}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>TEST $5K AUTO-TRADE</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

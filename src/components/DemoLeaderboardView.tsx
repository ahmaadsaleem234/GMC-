import React from "react";
import { getModuleTitle } from "../utils/moduleRegistry";
import { Trophy, Zap, ShieldCheck, BarChart3, TrendingUp, RefreshCw, Award, Activity, Cpu } from "lucide-react";
import { TabDemoAccount } from "../useDemoAccounts";

interface DemoLeaderboardViewProps {
  accounts: Record<string, TabDemoAccount>;
  onExecuteDemoTrade: (tabId: string) => void;
  onResetAccounts: () => void;
  onSelectTab: (tabId: string) => void;
}

export function DemoLeaderboardView({
  accounts,
  onExecuteDemoTrade,
  onResetAccounts,
  onSelectTab,
}: DemoLeaderboardViewProps) {
  const accountList = Object.values(accounts).sort((a, b) => b.totalPnL - a.totalPnL);

  const totalSimulatedCapital = accountList.length * 5000;
  const currentTotalEquity = accountList.reduce((sum, acc) => sum + acc.equity, 0);
  const totalSimulatedPnL = currentTotalEquity - totalSimulatedCapital;
  const avgWinRate = (
    accountList.reduce((sum, acc) => sum + acc.winRatePct, 0) / (accountList.length || 1)
  ).toFixed(1);

  return (
    <div id="demo-leaderboard-view" className="space-y-6 font-mono text-xs">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0C101C] via-[#080D1A] to-[#04060C] border-2 border-amber-500/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500/20 border border-amber-500/50 rounded-2xl flex items-center justify-center text-amber-400 text-2xl shadow-lg shadow-amber-500/20">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                  {getModuleTitle("demoleaderboard")}
                </h1>
                <span className="px-2.5 py-0.5 bg-amber-500 text-black font-extrabold text-[10px] rounded uppercase tracking-wider">
                  REAL-TIME COMPARISON
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Every AI System tab operates an independent $5,000 demo account. Compare win rates, return on investment (ROI), and trade execution logs across all AI engines.
              </p>
            </div>
          </div>

          <button
            onClick={onResetAccounts}
            className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 rounded-xl font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
            <span>RESET ALL $5,000 DEMO ACCOUNTS</span>
          </button>
        </div>

        {/* Global Summary Metrics */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#05070F] border border-slate-800 p-3 rounded-xl">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">TOTAL ALLOCATED DEMO CAPITAL</span>
            <span className="text-base font-black text-white">${totalSimulatedCapital.toLocaleString()}</span>
          </div>

          <div className="bg-[#05070F] border border-emerald-500/40 p-3 rounded-xl">
            <span className="text-[10px] text-emerald-400 uppercase font-bold block">COMBINED DEMO EQUITY</span>
            <span className="text-base font-black text-emerald-400">${currentTotalEquity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="bg-[#05070F] border border-amber-500/40 p-3 rounded-xl">
            <span className="text-[10px] text-amber-400 uppercase font-bold block">TOTAL DEMO NET PROFIT</span>
            <span className="text-base font-black text-amber-400">+${totalSimulatedPnL.toFixed(2)}</span>
          </div>

          <div className="bg-[#05070F] border border-slate-800 p-3 rounded-xl">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">AVERAGE AI WIN RATE</span>
            <span className="text-base font-black text-blue-400">{avgWinRate}%</span>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-[#080B14] border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
              AI ENGINE PERFORMANCE RANKING ($5,000 INITIAL CAPITAL EACH)
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            UPDATED LIVE EVERY TICK
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="text-[10px] text-slate-500 uppercase border-b border-slate-800 pb-2">
                <th className="p-3">Rank</th>
                <th className="p-3">AI Engine / Tab</th>
                <th className="p-3">Badge</th>
                <th className="p-3">Demo Balance</th>
                <th className="p-3">Equity</th>
                <th className="p-3">Total PnL ($ / %)</th>
                <th className="p-3">Win Rate</th>
                <th className="p-3">Trades</th>
                <th className="p-3">Profit Factor</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {accountList.map((acc, index) => {
                const pnlUSD = acc.equity - acc.initialBalance;
                const pnlPct = ((pnlUSD / acc.initialBalance) * 100).toFixed(2);
                const isTop1 = index === 0;

                return (
                  <tr key={acc.tabId} className={`hover:bg-slate-900/50 transition-colors ${isTop1 ? "bg-amber-500/5" : ""}`}>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded font-black text-xs ${isTop1 ? "bg-amber-500 text-black shadow-md shadow-amber-500/20" : "bg-slate-800 text-slate-300"}`}>
                        #{index + 1}
                      </span>
                    </td>
                    <td className="p-3 font-extrabold text-white text-sm">
                      {acc.tabLabel}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[9px] font-bold rounded uppercase">
                        {acc.badge}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-200">${acc.balance.toLocaleString()}</td>
                    <td className="p-3 font-bold text-white">${acc.equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="p-3 font-black text-emerald-400">
                      +${pnlUSD.toFixed(2)} (+{pnlPct}%)
                    </td>
                    <td className="p-3 font-extrabold text-amber-400">{acc.winRatePct}%</td>
                    <td className="p-3 text-slate-300">{acc.totalTrades} ({acc.winningTrades}W / {acc.losingTrades}L)</td>
                    <td className="p-3 font-bold text-purple-400">{acc.profitFactor}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectTab(acc.tabId)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10px] rounded-lg transition-all active:scale-95"
                        >
                          OPEN TAB
                        </button>
                        <button
                          onClick={() => onExecuteDemoTrade(acc.tabId)}
                          className="px-2.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-400 font-bold text-[10px] rounded-lg transition-all active:scale-95"
                        >
                          + TRADE
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

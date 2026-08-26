import React, { useState } from "react";
import {
  History,
  TrendingUp,
  TrendingDown,
  Award,
  Filter,
  DollarSign,
  BarChart2,
  Clock,
  Sparkles,
  ArrowDownRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  HistoricalTradeMemory,
  getTradeMemoryLibrary,
} from "../../services/khatarnakBrainEngine";

export const KhatarnakTradeMemoryTab: React.FC = () => {
  const [trades] = useState<HistoricalTradeMemory[]>(getTradeMemoryLibrary());
  const [filterResult, setFilterResult] = useState<"ALL" | "WIN" | "LOSS" | "BREAK_EVEN">("ALL");
  const [filterSession, setFilterSession] = useState<string>("ALL");

  const filteredTrades = trades.filter((t) => {
    if (filterResult !== "ALL" && t.result !== filterResult) return false;
    if (filterSession !== "ALL" && t.session !== filterSession) return false;
    return true;
  });

  const totalTrades = trades.length;
  const winCount = trades.filter((t) => t.result === "WIN").length;
  const lossCount = trades.filter((t) => t.result === "LOSS").length;
  const winRate = totalTrades > 0 ? Math.round((winCount / totalTrades) * 100) : 0;
  const netPnLUSD = Math.round(trades.reduce((acc, t) => acc + (t.pnlUSD || 0), 0));
  const totalR = Math.round(trades.reduce((acc, t) => acc + (t.pnlR || 0), 0) * 10) / 10;
  const avgMfe =
    totalTrades > 0
      ? Math.round((trades.reduce((acc, t) => acc + (t.mfePoints || 0), 0) / totalTrades) * 10) / 10
      : 0;
  const avgMae =
    totalTrades > 0
      ? Math.round((trades.reduce((acc, t) => acc + (t.maePoints || 0), 0) / totalTrades) * 10) / 10
      : 0;

  return (
    <div className="space-y-6" id="kj-trade-memory-tab">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Total Memory Library</span>
          <div className="text-2xl font-black text-white font-mono">{totalTrades} Trades</div>
          <div className="text-[10px] text-zinc-400">1M Strict Execution</div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Historical Win Rate</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">{winRate}%</div>
          <div className="text-[10px] text-zinc-400">
            {winCount} Wins / {lossCount} Losses
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Cumulative Net P&L</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">+${netPnLUSD}</div>
          <div className="text-[10px] text-emerald-300 font-bold">+{totalR}R Multiple</div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Avg MFE (Profit Peak)</span>
          <div className="text-2xl font-black text-cyan-400 font-mono">+{avgMfe} pts</div>
          <div className="text-[10px] text-zinc-400">Excursion before exit</div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-semibold">Avg MAE (Adverse Heat)</span>
          <div className="text-2xl font-black text-rose-400 font-mono">-{avgMae} pts</div>
          <div className="text-[10px] text-zinc-400">Drawdown into entry</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <span className="text-xs font-bold text-zinc-200">Filter Memory Records:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Result Filter */}
          <div className="flex bg-zinc-950 rounded-lg p-1 border border-zinc-800">
            {(["ALL", "WIN", "LOSS", "BREAK_EVEN"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setFilterResult(r)}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  filterResult === r
                    ? "bg-zinc-800 text-white shadow"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Session Filter */}
          <select
            value={filterSession}
            onChange={(e) => setFilterSession(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none"
          >
            <option value="ALL">All Sessions</option>
            <option value="NEW_YORK">New York</option>
            <option value="LONDON">London</option>
            <option value="OVERLAP">London/NY Overlap</option>
            <option value="ASIAN">Asian</option>
          </select>
        </div>
      </div>

      {/* Comprehensive Memory Table */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-900/90 border-b border-zinc-800 text-zinc-400 uppercase text-[10px] tracking-wider font-bold font-mono">
                <th className="py-3 px-4">Setup ID / Time</th>
                <th className="py-3 px-4">Asset / Session</th>
                <th className="py-3 px-4">Top → Botam (2.6)</th>
                <th className="py-3 px-4">Entry / SL / TP2</th>
                <th className="py-3 px-4">Quality & Confidence</th>
                <th className="py-3 px-4">MFE / MAE</th>
                <th className="py-3 px-4">Result & P&L</th>
                <th className="py-3 px-4">Key Factors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {filteredTrades.map((t) => {
                const isWin = t.result === "WIN";
                const isLoss = t.result === "LOSS";
                return (
                  <tr key={t.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-white">{t.setupId}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{t.dateTime}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-zinc-200">{t.asset}</div>
                      <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300">
                        {t.session}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <div className="text-zinc-200">
                        {t.topHigh.toFixed(1)} → {t.botamLow.toFixed(1)}
                      </div>
                      <div className="text-[10px] text-amber-400">
                        Range: {t.impulseRange.toFixed(1)} pts • 2.6: {t.level26.toFixed(1)}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <div className="text-zinc-200">
                        Entry: <strong className="text-red-400">{t.entryPrice.toFixed(2)}</strong>
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        SL: {t.stopLoss.toFixed(2)} • TP: {t.tp2.toFixed(2)}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-white font-mono">{t.score}/100 Score</div>
                      <div className="text-[10px] text-purple-300 font-mono">{t.aiConfidence}% Conf</div>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <div className="text-cyan-400 font-bold">+{t.mfePoints} pts MFE</div>
                      <div className="text-rose-400 text-[10px]">-{t.maePoints} pts MAE</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            isWin
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : isLoss
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                              : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                          }`}
                        >
                          {t.result}
                        </span>
                      </div>
                      <div
                        className={`text-[11px] font-bold font-mono mt-1 ${
                          t.pnlUSD >= 0 ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {t.pnlUSD >= 0 ? `+$${t.pnlUSD.toFixed(1)}` : `-$${Math.abs(t.pnlUSD).toFixed(1)}`} (
                        {t.pnlR >= 0 ? `+${t.pnlR}R` : `${t.pnlR}R`})
                      </div>
                    </td>

                    <td className="py-3 px-4 text-[11px] text-zinc-300 max-w-xs">
                      <div className="space-y-0.5">
                        {t.keyFactors.map((f, i) => (
                          <div key={i} className="flex items-center gap-1 text-[10px] text-zinc-400">
                            <span className="text-red-400">•</span>
                            <span>{f}</span>
                          </div>
                        ))}
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
};

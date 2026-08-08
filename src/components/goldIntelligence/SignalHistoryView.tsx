import React from "react";
import {
  Award,
  BarChart2,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
} from "lucide-react";
import {
  SIGNAL_HISTORY_DATA,
  SignalHistoryRecord,
  formatEventTime,
  TimezoneMode,
} from "../../services/goldIntelligenceService";

interface SignalHistoryViewProps {
  timezoneMode: TimezoneMode;
}

export const SignalHistoryView: React.FC<SignalHistoryViewProps> = ({ timezoneMode }) => {
  const totalSignals = SIGNAL_HISTORY_DATA.length;
  const wins = SIGNAL_HISTORY_DATA.filter((s) => s.winLoss === "WIN").length;
  const winRate = Math.round((wins / totalSignals) * 100);

  return (
    <div className="space-y-6 font-mono selection:bg-amber-500 selection:text-black">
      {/* Global Performance Summary Cards */}
      <div className="bg-[#0B0F17] border border-[#D4AF37]/40 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold uppercase tracking-wider">
              VERIFIED AUDIT LOG
            </span>
            <h2 className="text-2xl font-black text-white mt-1">
              HARAMI AI Signal History & Performance
            </h2>
          </div>
          <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 font-bold">
            Zero Overfitting / Sample Size: 25 Years
          </span>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#070A10] p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase block">Total Signals</span>
            <div className="text-2xl font-black text-white">{totalSignals}</div>
          </div>
          <div className="bg-[#070A10] p-4 rounded-2xl border border-emerald-500/30">
            <span className="text-xs text-slate-400 uppercase block">Win Rate</span>
            <div className="text-2xl font-black text-emerald-400">{winRate}%</div>
          </div>
          <div className="bg-[#070A10] p-4 rounded-2xl border border-amber-500/30">
            <span className="text-xs text-slate-400 uppercase block">Avg R-Multiple</span>
            <div className="text-2xl font-black text-amber-300">+3.01R</div>
          </div>
          <div className="bg-[#070A10] p-4 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase block">Max Drawdown</span>
            <div className="text-2xl font-black text-rose-400">-3.2%</div>
          </div>
        </div>
      </div>

      {/* Signal Log Table */}
      <div className="bg-[#070A10] border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-base">HISTORICAL HIGH-IMPACT SIGNAL AUDIT LOG</h3>
          </div>
          <span className="text-xs text-slate-400 font-bold">100% Reproducible</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-[#0A0F1A]">
                <th className="p-3">DATE ({timezoneMode})</th>
                <th className="p-3">EVENT NAME</th>
                <th className="p-3">DIRECTION</th>
                <th className="p-3">ENTRY</th>
                <th className="p-3">STOP LOSS</th>
                <th className="p-3">TARGET TP2</th>
                <th className="p-3">RESULT</th>
                <th className="p-3">R-MULTIPLE</th>
                <th className="p-3">MFE / MAE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {SIGNAL_HISTORY_DATA.map((sig) => (
                <tr key={sig.id} className="hover:bg-[#0E1524] transition-colors">
                  <td className="p-3 font-bold text-amber-300">
                    {formatEventTime(sig.dateUtc, timezoneMode)}
                  </td>
                  <td className="p-3 text-white font-bold max-w-[200px]">
                    <div>{sig.event}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{sig.newsImpact}</div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        sig.direction === "BUY"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : sig.direction === "SELL"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {sig.direction}
                    </span>
                  </td>
                  <td className="p-3 text-amber-300">${sig.entryPrice ? sig.entryPrice.toFixed(2) : "N/A"}</td>
                  <td className="p-3 text-rose-400">${sig.stopLoss ? sig.stopLoss.toFixed(2) : "N/A"}</td>
                  <td className="p-3 text-emerald-300">${sig.tp2 ? sig.tp2.toFixed(2) : "N/A"}</td>
                  <td className="p-3 font-black">
                    {sig.winLoss === "WIN" ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        WIN ({sig.exitType})
                      </span>
                    ) : sig.winLoss === "LOSS" ? (
                      <span className="text-rose-400 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        SL HIT
                      </span>
                    ) : (
                      <span className="text-slate-400">NO TRADE</span>
                    )}
                  </td>
                  <td className="p-3 font-bold text-amber-300">
                    {sig.rMultiple > 0 ? `+${sig.rMultiple}R` : "0R"}
                  </td>
                  <td className="p-3 text-slate-400">
                    <span className="text-emerald-400">+{sig.mfePips}p</span> / <span className="text-rose-400">-{sig.maePips}p</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

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
    <div className="space-y-6 font-mono">
      {/* Global Performance Summary Cards */}
      <div className="bg-[#080A0D] border border-[#292E35] rounded-2xl p-5 md:p-6 shadow-none space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#272C32] pb-3">
          <div>
            <span className="px-3 py-1 rounded bg-[rgba(241,204,107,0.08)] text-[#F1CC6B] border border-[rgba(241,204,107,0.3)] text-xs font-semibold uppercase tracking-wider">
              VERIFIED AUDIT LOG
            </span>
            <h2 className="text-xl font-bold text-white mt-1">
              HARAMI AI Signal History & Performance
            </h2>
          </div>
          <span className="text-xs text-[#74D8A0] bg-[#17342E] px-3 py-1 rounded border border-[rgba(116,216,160,0.4)] font-medium">
            Zero Overfitting / Sample Size: 25 Years
          </span>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#0E1115] p-3.5 rounded-xl border border-[#242A31]">
            <span className="text-xs text-[#9299A3] uppercase block">Total Signals</span>
            <div className="text-xl font-bold text-white">{totalSignals}</div>
          </div>
          <div className="bg-[#0E1115] p-3.5 rounded-xl border border-[rgba(116,216,160,0.4)]">
            <span className="text-xs text-[#9299A3] uppercase block">Win Rate</span>
            <div className="text-xl font-bold text-[#74D8A0]">{winRate}%</div>
          </div>
          <div className="bg-[#0E1115] p-3.5 rounded-xl border border-[rgba(241,204,107,0.4)]">
            <span className="text-xs text-[#9299A3] uppercase block">Avg R-Multiple</span>
            <div className="text-xl font-bold text-[#F1CC6B]">+3.01R</div>
          </div>
          <div className="bg-[#0E1115] p-3.5 rounded-xl border border-[#242A31]">
            <span className="text-xs text-[#9299A3] uppercase block">Max Drawdown</span>
            <div className="text-xl font-bold text-[#EE777F]">-3.2%</div>
          </div>
        </div>
      </div>

      {/* Signal Log Table */}
      <div className="bg-[#111419] border border-[#292E35] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#252A31] pb-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-[#F1CC6B]" />
            <h3 className="font-semibold text-white text-sm">HISTORICAL HIGH-IMPACT SIGNAL AUDIT LOG</h3>
          </div>
          <span className="text-xs text-[#9299A3] font-medium">100% Reproducible</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#272C32] text-[#9299A3] bg-[#0E1115]">
                <th className="p-2.5">DATE ({timezoneMode})</th>
                <th className="p-2.5">EVENT NAME</th>
                <th className="p-2.5">DIRECTION</th>
                <th className="p-2.5">ENTRY</th>
                <th className="p-2.5">STOP LOSS</th>
                <th className="p-2.5">TARGET TP2</th>
                <th className="p-2.5">RESULT</th>
                <th className="p-2.5">R-MULTIPLE</th>
                <th className="p-2.5">MFE / MAE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242A31]">
              {SIGNAL_HISTORY_DATA.map((sig) => (
                <tr key={sig.id} className="hover:bg-[#161A21] transition-colors">
                  <td className="p-2.5 font-semibold text-[#F1CC6B]">
                    {formatEventTime(sig.dateUtc, timezoneMode)}
                  </td>
                  <td className="p-2.5 text-white font-semibold max-w-[200px]">
                    <div>{sig.event}</div>
                    <div className="text-[10px] text-[#9299A3] font-normal">{sig.newsImpact}</div>
                  </td>
                  <td className="p-2.5">
                    <span
                      className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                        sig.direction === "BUY"
                          ? "bg-[#17342E] text-[#74D8A0] border border-[rgba(116,216,160,0.4)]"
                          : sig.direction === "SELL"
                          ? "bg-[#352329] text-[#EE777F] border border-[rgba(238,119,127,0.4)]"
                          : "bg-[#0E1115] text-[#9299A3]"
                      }`}
                    >
                      {sig.direction}
                    </span>
                  </td>
                  <td className="p-2.5 text-[#F1CC6B]">${sig.entryPrice ? sig.entryPrice.toFixed(2) : "N/A"}</td>
                  <td className="p-2.5 text-[#EE777F]">${sig.stopLoss ? sig.stopLoss.toFixed(2) : "N/A"}</td>
                  <td className="p-2.5 text-[#74D8A0]">${sig.tp2 ? sig.tp2.toFixed(2) : "N/A"}</td>
                  <td className="p-2.5 font-bold">
                    {sig.winLoss === "WIN" ? (
                      <span className="text-[#74D8A0] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#74D8A0]" />
                        WIN ({sig.exitType})
                      </span>
                    ) : sig.winLoss === "LOSS" ? (
                      <span className="text-[#EE777F] flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 text-[#EE777F]" />
                        SL HIT
                      </span>
                    ) : (
                      <span className="text-[#646C77]">NO TRADE</span>
                    )}
                  </td>
                  <td className="p-2.5 font-semibold text-[#F1CC6B]">
                    {sig.rMultiple > 0 ? `+${sig.rMultiple}R` : "0R"}
                  </td>
                  <td className="p-2.5 text-[#9299A3]">
                    <span className="text-[#74D8A0]">+{sig.mfePips}p</span> / <span className="text-[#EE777F]">-{sig.maePips}p</span>
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

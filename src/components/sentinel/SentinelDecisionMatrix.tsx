import React from "react";
import { SentinelTradeDecision } from "../../services/sentinelEngine";
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface SentinelDecisionMatrixProps {
  decision: SentinelTradeDecision;
}

export const SentinelDecisionMatrix: React.FC<SentinelDecisionMatrixProps> = ({ decision }) => {
  const { brains, scoreBreakdown, isConflictDetected, conflictReason, finalDecision } = decision;

  return (
    <div className="bg-[#050608] border border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_25px_rgba(6,182,212,0.12)] font-mono flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-xs text-cyan-300 uppercase tracking-wider">
            AI DECISION & CONFLICT MATRIX
          </span>
        </div>
        <div className="text-[10px] text-slate-400">
          GATEKEEPER: <span className="text-cyan-300 font-bold">ACTIVE</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
              <th className="py-2 px-2">MODULE</th>
              <th className="py-2 px-2">TIMEFRAME</th>
              <th className="py-2 px-2">BIAS</th>
              <th className="py-2 px-2">SCORE</th>
              <th className="py-2 px-2">STATE</th>
              <th className="py-2 px-2">REASONING</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-[11px]">
            {Object.values(brains as Record<string, { id: string; name: string; emoji: string; timeframe: string; direction: string; score: number; state: string; rationale: string }>).map((b) => {
              const isSell = b.direction === "SELL";
              const isWait = b.direction === "WAIT" || b.direction === "NO_TRADE";

              return (
                <tr key={b.id} className="hover:bg-[#080E17] transition-all">
                  <td className="py-2.5 px-2 font-bold text-white flex items-center gap-1.5">
                    <span>{b.emoji}</span>
                    <span>{b.name}</span>
                  </td>
                  <td className="py-2.5 px-2 text-slate-400">{b.timeframe}</td>
                  <td className="py-2.5 px-2">
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded ${
                        isWait
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : isSell
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      }`}
                    >
                      {b.direction}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 font-mono font-bold text-cyan-300">{b.score}/100</td>
                  <td className="py-2.5 px-2">
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                        b.state === "ACTIVE"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {b.state}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-slate-400 max-w-[220px] truncate">{b.rationale}</td>
                </tr>
              );
            })}

            {/* FINAL SENTINEL ROW */}
            <tr className="bg-[#0A1624] font-bold border-t border-cyan-500/40">
              <td className="py-3 px-2 text-cyan-300 flex items-center gap-1.5 font-black">
                <span>⚡</span>
                <span>SENTINEL CORE</span>
              </td>
              <td className="py-3 px-2 text-cyan-200">15M/5M/1M</td>
              <td className="py-3 px-2">
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded ${
                    decision.direction === "SELL"
                      ? "bg-rose-500/30 text-rose-300 border border-rose-500/60"
                      : "bg-emerald-500/30 text-emerald-300 border border-emerald-500/60"
                  }`}
                >
                  {decision.direction}
                </span>
              </td>
              <td className="py-3 px-2 text-cyan-300 font-mono font-black text-sm">
                {scoreBreakdown.totalScore}/100
              </td>
              <td className="py-3 px-2">
                <span className="text-[10px] font-black text-white bg-cyan-500/30 border border-cyan-400 px-2 py-0.5 rounded shadow-[0_0_8px_rgba(6,182,212,0.5)]">
                  {finalDecision.replace(/_/g, " ")}
                </span>
              </td>
              <td className="py-3 px-2 text-cyan-200 text-[10px]">{decision.decisionSummary}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {isConflictDetected && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2 text-amber-300 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">AI CONFLICT DETECTED:</span> {conflictReason} —
            <span className="font-black text-white ml-1">ACTION: WAIT FOR RESOLUTION</span>
          </div>
        </div>
      )}
    </div>
  );
};

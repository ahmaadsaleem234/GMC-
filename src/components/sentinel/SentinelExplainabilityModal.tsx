import React from "react";
import { SentinelTradeDecision } from "../../services/sentinelEngine";
import { X, HelpCircle, ShieldCheck, CheckCircle2, Zap } from "lucide-react";

interface SentinelExplainabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  decision: SentinelTradeDecision;
}

export const SentinelExplainabilityModal: React.FC<SentinelExplainabilityModalProps> = ({
  isOpen,
  onClose,
  decision,
}) => {
  if (!isOpen) return null;

  const { whyRationale, scoreBreakdown, finalDecision, direction, assetKey } = decision;
  const isSell = direction === "SELL";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-mono">
      <div className="relative w-full max-w-2xl bg-[#07090E] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden flex flex-col text-slate-200 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cyan-500/20 bg-[#0A0E17]">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <span className="font-extrabold text-sm text-cyan-300 uppercase tracking-wider">
              DATA TRANSPARENCY: WHY {direction} {assetKey}?
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Executive Verdict Banner */}
          <div className="p-4 bg-[#0A1624] border border-cyan-400/40 rounded-xl flex items-center justify-between gap-3 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <div>
              <div className="text-[10px] text-cyan-400 font-bold uppercase">DECISION STATUS</div>
              <div className="text-base font-black text-white flex items-center gap-2 mt-0.5">
                <span>{whyRationale.verdict}</span>
              </div>
            </div>
            <div className="text-right font-mono">
              <div className="text-[10px] text-slate-400">TOTAL SCORE</div>
              <div className="text-lg font-black text-cyan-300">{scoreBreakdown.totalScore}/100</div>
            </div>
          </div>

          {/* Step-by-Step Mathematical Reasonings */}
          <div className="space-y-2.5">
            <div className="p-3 bg-[#0A0D14] border border-slate-800 rounded-xl">
              <div className="text-cyan-400 font-bold text-[11px] mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                1. 15M MACRO STRUCTURE ({scoreBreakdown.structure}/20 PTS)
              </div>
              <div className="text-slate-300 pl-5">{whyRationale.m15Reason}</div>
            </div>

            <div className="p-3 bg-[#0A0D14] border border-slate-800 rounded-xl">
              <div className="text-purple-400 font-bold text-[11px] mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                2. 5M LIQUIDITY SWEEP ({scoreBreakdown.liquidity}/15 PTS)
              </div>
              <div className="text-slate-300 pl-5">{whyRationale.m5Reason}</div>
            </div>

            <div className="p-3 bg-[#0A0D14] border border-slate-800 rounded-xl">
              <div className="text-emerald-400 font-bold text-[11px] mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                3. 1M MICRO CHOCH & PRECISION TRIGGER ({scoreBreakdown.entryReaction}/10 PTS)
              </div>
              <div className="text-slate-300 pl-5">{whyRationale.m1Reason}</div>
            </div>

            <div className="p-3 bg-[#0A0D14] border border-slate-800 rounded-xl">
              <div className="text-amber-400 font-bold text-[11px] mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                4. FIBONACCI GOLDEN ZONE & 2.6 ({scoreBreakdown.fibGoldenZone}/15 PTS)
              </div>
              <div className="text-slate-300 pl-5">{whyRationale.fibReason}</div>
            </div>

            <div className="p-3 bg-[#0A0D14] border border-slate-800 rounded-xl">
              <div className="text-rose-400 font-bold text-[11px] mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />
                5. INSTITUTIONAL ORDER FLOW & FVG ({scoreBreakdown.institutionalFlow}/15 PTS)
              </div>
              <div className="text-slate-300 pl-5">{whyRationale.orderFlowReason}</div>
            </div>

            <div className="p-3 bg-[#0A0D14] border border-slate-800 rounded-xl">
              <div className="text-cyan-400 font-bold text-[11px] mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                6. RISK-TO-REWARD & STRUCTURAL SL ({scoreBreakdown.riskReward}/5 PTS)
              </div>
              <div className="text-slate-300 pl-5">{whyRationale.rrReason}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-cyan-500/20 bg-[#0A0E17] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.4)]"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};

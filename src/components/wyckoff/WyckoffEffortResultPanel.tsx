import React from "react";
import { EffortVsResultData } from "../../services/wyckoffEngine";
import { Activity, Gauge, Flame, Sparkles, AlertCircle } from "lucide-react";

interface WyckoffEffortResultPanelProps {
  effortVsResult: EffortVsResultData;
  currentPrice: number;
}

export const WyckoffEffortResultPanel: React.FC<WyckoffEffortResultPanelProps> = ({
  effortVsResult,
  currentPrice,
}) => {
  const { effortLevel, resultLevel, ratio, interpretation, effortScore, resultScore, unusualBehaviorTag } =
    effortVsResult;

  const isAbsorption = interpretation.includes("ABSORPTION");
  const isTest = interpretation.includes("TEST");
  const isDemand = interpretation.includes("DEMAND");
  const isSupply = interpretation.includes("SUPPLY");

  const getInterpretationBadgeColor = () => {
    if (isAbsorption) return "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]";
    if (isTest) return "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]";
    if (isDemand) return "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
    if (isSupply) return "bg-red-500/20 text-red-300 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]";
    return "bg-slate-800 text-slate-300 border-slate-700";
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#090e17]/90 p-4 backdrop-blur-xl shadow-xl flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-950/60 border border-amber-500/40">
            <Gauge className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-widest text-slate-200 uppercase">
              EFFORT VS RESULT ENGINE
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              VOLUME SPREAD INTERACTION DYNAMICS
            </span>
          </div>
        </div>

        {unusualBehaviorTag && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[9px] font-mono font-bold text-amber-300 animate-pulse">
            <Sparkles className="w-2.5 h-2.5" />
            <span>{unusualBehaviorTag}</span>
          </div>
        )}
      </div>

      {/* Effort (Volume) & Result (Price Spread) Metrics */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Effort Box */}
        <div className="p-3 rounded-xl bg-[#060a12] border border-slate-800 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-cyan-400" />
              EFFORT (VOLUME)
            </span>
            <span className="font-bold text-cyan-300">{effortScore}%</span>
          </div>
          <div className="text-sm font-black font-mono text-white tracking-wider">
            EFFORT: <span className="text-cyan-400">{effortLevel}</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${effortScore}%` }}
            />
          </div>
        </div>

        {/* Result Box */}
        <div className="p-3 rounded-xl bg-[#060a12] border border-slate-800 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-amber-400" />
              RESULT (SPREAD)
            </span>
            <span className="font-bold text-amber-300">{resultScore}%</span>
          </div>
          <div className="text-sm font-black font-mono text-white tracking-wider">
            RESULT: <span className="text-amber-400">{resultLevel}</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${resultScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* AI Live Interpretation */}
      <div className="p-3 rounded-xl bg-[#0b1320] border border-cyan-950 flex flex-col gap-1">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
          WYCKOFF EFFORT/RESULT INTERPRETATION
        </span>
        <div
          className={`px-3 py-2 rounded-lg font-mono text-xs font-black uppercase text-center border ${getInterpretationBadgeColor()}`}
        >
          {interpretation}
        </div>
      </div>
    </div>
  );
};

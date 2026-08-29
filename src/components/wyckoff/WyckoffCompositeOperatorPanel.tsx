import React from "react";
import { CompositeOperatorModel } from "../../services/wyckoffEngine";
import { Cpu, ShieldCheck, Activity, Flame, Layers } from "lucide-react";

interface WyckoffCompositeOperatorPanelProps {
  model: CompositeOperatorModel;
}

export const WyckoffCompositeOperatorPanel: React.FC<WyckoffCompositeOperatorPanelProps> = ({
  model,
}) => {
  const isAccum = model.intent === "ACCUMULATION" || model.intent === "MARKUP";

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#090e17]/90 p-4 backdrop-blur-xl shadow-xl flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/40">
            <Cpu className="w-4 h-4 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-widest text-slate-200 uppercase">
              COMPOSITE OPERATOR ENGINE
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              INSTITUTIONAL ACCUMULATION & DISTRIBUTION MODEL
            </span>
          </div>
        </div>

        <div className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-[9px] font-mono font-black text-indigo-300">
          INTENT: {model.intent}
        </div>
      </div>

      {/* Pressure Matrix */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Accumulation Pressure */}
        <div className="p-2.5 rounded-xl bg-[#060a12] border border-slate-800 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-400">ACCUMULATION:</span>
            <span className="font-bold text-cyan-300">{model.accumulationPressure}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${model.accumulationPressure}%` }}
            />
          </div>
        </div>

        {/* Distribution Pressure */}
        <div className="p-2.5 rounded-xl bg-[#060a12] border border-slate-800 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-400">DISTRIBUTION:</span>
            <span className="font-bold text-amber-300">{model.distributionPressure}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${model.distributionPressure}%` }}
            />
          </div>
        </div>

        {/* Demand Strength */}
        <div className="p-2.5 rounded-xl bg-[#060a12] border border-slate-800 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-400">DEMAND FLOW:</span>
            <span className="font-bold text-emerald-300">{model.demandStrength}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${model.demandStrength}%` }}
            />
          </div>
        </div>

        {/* Supply Strength */}
        <div className="p-2.5 rounded-xl bg-[#060a12] border border-slate-800 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-400">SUPPLY FLOAT:</span>
            <span className="font-bold text-red-300">{model.supplyStrength}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-red-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${model.supplyStrength}%` }}
            />
          </div>
        </div>
      </div>

      {/* Model Interpretation Narrative */}
      <div className="p-2.5 rounded-xl bg-[#0c1424] border border-indigo-900/50 text-[11px] font-mono text-indigo-200/90 leading-relaxed">
        {model.summary}
      </div>
    </div>
  );
};

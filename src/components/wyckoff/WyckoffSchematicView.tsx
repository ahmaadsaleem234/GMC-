import React from "react";
import {
  WyckoffPhase,
  WyckoffSchematicProgress,
  WyckoffEventCode,
} from "../../services/wyckoffEngine";
import { Workflow, Sparkles, AlertTriangle, ArrowRight, CheckCircle, ShieldAlert } from "lucide-react";

interface WyckoffSchematicViewProps {
  phase: WyckoffPhase;
  schematic: WyckoffSchematicProgress;
  isInvalidated: boolean;
}

const ACCUM_STEPS: { code: WyckoffEventCode; label: string; desc: string }[] = [
  { code: "PS", label: "Preliminary Support", desc: "Initial high-volume buying" },
  { code: "SC", label: "Selling Climax", desc: "Panic liquidation absorbed" },
  { code: "AR", label: "Automatic Rally", desc: "Upper resistance boundary (Creek)" },
  { code: "ST", label: "Secondary Test", desc: "Testing SC low on lower volume" },
  { code: "SPRING", label: "Spring", desc: "Liquidity wash beneath Ice" },
  { code: "TEST", label: "Test", desc: "Dry test of Spring low" },
  { code: "SOS", label: "Sign of Strength", desc: "Jump across Creek resistance" },
  { code: "LPS", label: "Last Point Support", desc: "Higher low pullback holding" },
];

const DIST_STEPS: { code: WyckoffEventCode; label: string; desc: string }[] = [
  { code: "PSY", label: "Preliminary Supply", desc: "Initial heavy selling meeting rally" },
  { code: "BC", label: "Buying Climax", desc: "Retail rush into smart money sells" },
  { code: "AR", label: "Automatic Reaction", desc: "Lower support boundary (Ice)" },
  { code: "ST", label: "Secondary Test", desc: "Testing BC high on lower volume" },
  { code: "UTAD", label: "UT / UTAD", desc: "Upthrust trapping buyers above Creek" },
  { code: "SOW", label: "Sign of Weakness", desc: "Breakdown through Ice support" },
  { code: "LPSY", label: "Last Point Supply", desc: "Weak upward test failing" },
];

export const WyckoffSchematicView: React.FC<WyckoffSchematicViewProps> = ({
  phase,
  schematic,
  isInvalidated,
}) => {
  const isAccum = phase === "ACCUMULATION" || phase === "MARKUP";
  const steps = isAccum ? ACCUM_STEPS : DIST_STEPS;
  const currentStage = schematic.currentStage;

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#090e17]/90 p-4 backdrop-blur-xl shadow-xl flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40">
            <Workflow className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-widest text-slate-200 uppercase">
              LIVE WYCKOFF SCHEMATIC MAP
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              HOLOGRAPHIC PIPELINE & REAL-TIME STAGE TRACKER
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400">PROGRESS:</span>
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-xs font-black font-mono text-cyan-300">
            <span>{schematic.progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* Invalidation Alert Overlay */}
      {isInvalidated ? (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/60 flex items-center justify-center gap-3 text-center animate-pulse">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <h4 className="text-xs font-black text-red-300 tracking-wider uppercase">
              WYCKOFF STRUCTURE INVALIDATED
            </h4>
            <p className="text-[10px] font-mono text-red-200/80">
              Expected sequence failed invalidation boundary. AI is resetting model.
            </p>
          </div>
        </div>
      ) : (
        /* Schematic Flow Nodes */
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {steps.map((step, idx) => {
            const isCompleted = schematic.sequenceHistory.includes(step.code);
            const isCurrent = currentStage === step.code;
            const isNext = schematic.expectedNextEvent === step.code;

            return (
              <div
                key={step.code}
                className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all relative ${
                  isCurrent
                    ? "bg-cyan-950/60 border-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.4)] scale-102"
                    : isCompleted
                    ? "bg-[#0c1424] border-emerald-500/40 text-emerald-300"
                    : isNext
                    ? "bg-[#060a12] border-amber-500/50 text-amber-300 animate-pulse"
                    : "bg-[#060a12]/60 border-slate-800 text-slate-500"
                }`}
              >
                {/* Node Top Indicator */}
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-mono font-bold opacity-60">0{idx + 1}</span>
                  {isCurrent && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  )}
                  {isCompleted && !isCurrent && (
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                  )}
                </div>

                {/* Event Code Badge */}
                <div className="my-1">
                  <span
                    className={`text-xs font-black font-mono tracking-wider ${
                      isCurrent
                        ? "text-cyan-300"
                        : isCompleted
                        ? "text-emerald-300"
                        : isNext
                        ? "text-amber-300"
                        : "text-slate-400"
                    }`}
                  >
                    {step.code}
                  </span>
                  <div className="text-[10px] font-semibold text-slate-300 truncate mt-0.5">
                    {step.label}
                  </div>
                </div>

                {/* Subtext description */}
                <span className="text-[8px] font-mono text-slate-400 truncate mt-1">
                  {isCurrent ? "ACTIVE STAGE" : isNext ? "EXPECTED NEXT" : step.desc}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

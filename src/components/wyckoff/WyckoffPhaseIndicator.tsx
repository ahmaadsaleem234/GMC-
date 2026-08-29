import React from "react";
import { WyckoffPhase, WyckoffPhaseStage } from "../../services/wyckoffEngine";
import { Sparkles, Shield, Activity, TrendingUp, TrendingDown, Layers } from "lucide-react";

interface WyckoffPhaseIndicatorProps {
  phase: WyckoffPhase;
  phaseStage: WyckoffPhaseStage;
  confidence: number;
}

export const WyckoffPhaseIndicator: React.FC<WyckoffPhaseIndicatorProps> = ({
  phase,
  phaseStage,
  confidence,
}) => {
  const isAccum = phase === "ACCUMULATION";
  const isMarkup = phase === "MARKUP";
  const isDist = phase === "DISTRIBUTION";
  const isMarkdown = phase === "MARKDOWN";

  const getPhaseTheme = () => {
    if (isAccum) {
      return {
        border: "border-cyan-500/50",
        bg: "bg-cyan-950/30",
        glow: "shadow-[0_0_30px_rgba(6,182,212,0.25)]",
        badgeBg: "bg-cyan-500/20 text-cyan-300 border-cyan-500/50",
        textColor: "text-cyan-400",
        icon: Sparkles,
      };
    }
    if (isMarkup) {
      return {
        border: "border-emerald-500/50",
        bg: "bg-emerald-950/30",
        glow: "shadow-[0_0_30px_rgba(16,185,129,0.25)]",
        badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50",
        textColor: "text-emerald-400",
        icon: TrendingUp,
      };
    }
    if (isDist) {
      return {
        border: "border-amber-500/50",
        bg: "bg-amber-950/30",
        glow: "shadow-[0_0_30px_rgba(245,158,11,0.25)]",
        badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/50",
        textColor: "text-amber-400",
        icon: Layers,
      };
    }
    return {
      border: "border-red-500/50",
      bg: "bg-red-950/30",
      glow: "shadow-[0_0_30px_rgba(239,68,68,0.25)]",
      badgeBg: "bg-red-500/20 text-red-300 border-red-500/50",
      textColor: "text-red-400",
      icon: TrendingDown,
    };
  };

  const theme = getPhaseTheme();
  const Icon = theme.icon;

  const stages: WyckoffPhaseStage[] = ["EARLY", "DEVELOPING", "CONFIRMED"];

  return (
    <div
      className={`relative rounded-2xl border ${theme.border} ${theme.bg} ${theme.glow} p-4 backdrop-blur-xl flex flex-col gap-3 transition-all duration-300 overflow-hidden`}
    >
      {/* Background Holographic Ring Pattern */}
      <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full border border-cyan-500/10 pointer-events-none animate-[spin_20s_linear_infinite]" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#0b1320] border border-slate-700/60">
            <Icon className={`w-4 h-4 ${theme.textColor} animate-pulse`} />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">
              WYCKOFF PHASE
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">3D HOLOGRAPHIC CLASSIFIER</span>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0b1320] border border-slate-700/60 text-[10px] font-mono">
          <span className="text-slate-400">CONFIDENCE:</span>
          <span className={`font-bold ${theme.textColor}`}>{confidence}%</span>
        </div>
      </div>

      {/* Primary 3D Phase Display */}
      <div className="relative py-2 flex flex-col items-center justify-center text-center">
        <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
          CURRENT MARKET PHASE
        </span>
        <div className="flex items-center gap-2 mt-1">
          <h2 className={`text-2xl sm:text-3xl font-black tracking-wider uppercase ${theme.textColor} drop-shadow-[0_0_15px_rgba(6,182,212,0.4)]`}>
            {phase}
          </h2>
        </div>
      </div>

      {/* Phase Development Stage Pipeline: EARLY → DEVELOPING → CONFIRMED */}
      <div className="pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5">
          <span>PHASE DEVELOPMENT</span>
          <span className="font-bold text-white">{phaseStage}</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {stages.map((stage) => {
            const isCurrent = phaseStage === stage;
            const stageIndex = stages.indexOf(stage);
            const currentIndex = stages.indexOf(phaseStage);
            const isPassed = stageIndex <= currentIndex;

            return (
              <div
                key={stage}
                className={`py-1.5 px-2 rounded-lg text-center font-mono text-[10px] font-bold transition-all border ${
                  isCurrent
                    ? `${theme.badgeBg} shadow-[0_0_12px_rgba(6,182,212,0.3)] animate-pulse`
                    : isPassed
                    ? "bg-slate-800/40 text-slate-300 border-slate-700/60"
                    : "bg-slate-900/40 text-slate-600 border-slate-800/40"
                }`}
              >
                {stage}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

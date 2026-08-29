import React from "react";
import { Terminal, Sparkles, Brain, Cpu } from "lucide-react";

interface WyckoffAiInterpretationPanelProps {
  interpretationText: string;
  isInvalidated: boolean;
  phase: string;
}

export const WyckoffAiInterpretationPanel: React.FC<WyckoffAiInterpretationPanelProps> = ({
  interpretationText,
  isInvalidated,
  phase,
}) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#090e17]/90 p-4 backdrop-blur-xl shadow-xl flex flex-col gap-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40">
            <Brain className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-widest text-slate-200 uppercase">
              WYCKOFF AI INTERPRETATION
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              REAL-TIME SYNTHESIS & MARKET INTENT
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[9px] font-mono text-cyan-300">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>AUTONOMOUS STREAM</span>
        </div>
      </div>

      {/* Terminal Output Body */}
      <div className="p-3 rounded-xl bg-[#05080f] border border-slate-800 font-mono text-xs text-cyan-200/90 leading-relaxed relative overflow-hidden">
        {/* Subtle scanline line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent animate-pulse" />

        <p className="flex items-start gap-2">
          <span className="text-cyan-400 font-bold select-none">&gt;</span>
          <span>{interpretationText}</span>
        </p>
      </div>
    </div>
  );
};

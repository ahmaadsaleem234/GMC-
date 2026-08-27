import React from "react";
import { SentinelTradeDecision } from "../../services/sentinelEngine";
import { Cpu, Zap, Activity, ShieldCheck, Flame, Crosshair } from "lucide-react";

interface SentinelNeuralCoreProps {
  decision: SentinelTradeDecision;
}

export const SentinelNeuralCore: React.FC<SentinelNeuralCoreProps> = ({ decision }) => {
  const { brains, finalDecision, scoreBreakdown } = decision;

  return (
    <div className="bg-[#050608] border border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_25px_rgba(6,182,212,0.12)] font-mono flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2.5">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-bold text-xs text-cyan-300 uppercase tracking-wider">
            AI NEURAL CORE SYNTHESIZER
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-emerald-300 font-bold">4-BRAIN SYNAPSE ACTIVE</span>
        </div>
      </div>

      {/* Futuristic Synaptic Node Graph Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {/* 1. Harami AI Node */}
        <div
          className={`p-2.5 rounded-xl border transition-all ${
            brains.haramiAi.state === "ACTIVE"
              ? "bg-[#09131C] border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
              : "bg-[#0A0D12] border-slate-800 opacity-60"
          }`}
        >
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-bold text-cyan-300 flex items-center gap-1">
              <span>🤖</span> Harami AI
            </span>
            <span
              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                brains.haramiAi.direction === "SELL"
                  ? "bg-rose-500/20 text-rose-300"
                  : "bg-emerald-500/20 text-emerald-300"
              }`}
            >
              {brains.haramiAi.direction}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Score:</span>
            <span className="text-cyan-200 font-bold font-mono">{brains.haramiAi.score}/100</span>
          </div>
          <div className="mt-1 text-[9px] text-slate-400 truncate">
            {brains.haramiAi.rationale}
          </div>
        </div>

        {/* 2. Khatarnak Jugaad Node */}
        <div
          className={`p-2.5 rounded-xl border transition-all ${
            brains.khatarnakJugaad.state === "ACTIVE"
              ? "bg-[#150A0B] border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.25)]"
              : "bg-[#0A0D12] border-slate-800 opacity-60"
          }`}
        >
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-bold text-red-300 flex items-center gap-1">
              <span>💀</span> Khatarnak
            </span>
            <span
              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                brains.khatarnakJugaad.direction === "SELL"
                  ? "bg-rose-500/20 text-rose-300"
                  : "bg-amber-500/20 text-amber-300"
              }`}
            >
              {brains.khatarnakJugaad.direction}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Score:</span>
            <span className="text-red-200 font-bold font-mono">{brains.khatarnakJugaad.score}/100</span>
          </div>
          <div className="mt-1 text-[9px] text-slate-400 truncate">
            {brains.khatarnakJugaad.rationale}
          </div>
        </div>

        {/* 3. War Room Node */}
        <div
          className={`p-2.5 rounded-xl border transition-all ${
            brains.warRoom.state === "ACTIVE"
              ? "bg-[#141009] border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]"
              : "bg-[#0A0D12] border-slate-800 opacity-60"
          }`}
        >
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-bold text-amber-300 flex items-center gap-1">
              <span>⚔️</span> War Room
            </span>
            <span
              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                brains.warRoom.direction === "SELL"
                  ? "bg-rose-500/20 text-rose-300"
                  : "bg-emerald-500/20 text-emerald-300"
              }`}
            >
              {brains.warRoom.direction}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Score:</span>
            <span className="text-amber-200 font-bold font-mono">{brains.warRoom.score}/100</span>
          </div>
          <div className="mt-1 text-[9px] text-slate-400 truncate">
            {brains.warRoom.rationale}
          </div>
        </div>

        {/* 4. Precision Hunter Node */}
        <div
          className={`p-2.5 rounded-xl border transition-all ${
            brains.precisionHunter.state === "ACTIVE"
              ? "bg-[#081510] border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
              : "bg-[#0A0D12] border-slate-800 opacity-60"
          }`}
        >
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-bold text-emerald-300 flex items-center gap-1">
              <span>🎯</span> Precision
            </span>
            <span
              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                brains.precisionHunter.direction === "SELL"
                  ? "bg-rose-500/20 text-rose-300"
                  : "bg-emerald-500/20 text-emerald-300"
              }`}
            >
              {brains.precisionHunter.direction}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Score:</span>
            <span className="text-emerald-200 font-bold font-mono">{brains.precisionHunter.score}/100</span>
          </div>
          <div className="mt-1 text-[9px] text-slate-400 truncate">
            {brains.precisionHunter.rationale}
          </div>
        </div>
      </div>

      {/* Central Synaptic Funnel Convergence Bar */}
      <div className="flex items-center justify-center gap-2 py-1">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></span>
        <span className="text-[10px] text-cyan-400 font-extrabold tracking-widest uppercase">
          ↓↓ 4-BRAIN WEIGHTED SYNAPSE ↓↓
        </span>
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></span>
      </div>

      {/* SENTINEL CORE APEX DECISION NODE */}
      <div className="bg-gradient-to-r from-[#081522] via-[#0B1A28] to-[#081522] border border-cyan-400/60 rounded-xl p-3 shadow-[0_0_20px_rgba(6,182,212,0.3)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.5)]">
            <ShieldCheck className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
              SENTINEL CORE FINAL GATEKEEPER
            </div>
            <div className="text-sm font-black text-white flex items-center gap-2">
              <span>{finalDecision.replace(/_/g, " ")}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                {scoreBreakdown.totalScore}/100 PTS
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <div className="text-[10px] text-slate-400">STRUCTURE</div>
            <div className="font-bold text-cyan-300">{scoreBreakdown.structure}/20</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">LIQUIDITY</div>
            <div className="font-bold text-purple-300">{scoreBreakdown.liquidity}/15</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">FLOW/OB</div>
            <div className="font-bold text-amber-300">{scoreBreakdown.institutionalFlow}/15</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400">FIB/GZ</div>
            <div className="font-bold text-emerald-300">{scoreBreakdown.fibGoldenZone}/15</div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { Activity, Radio, Cpu, CheckCircle, ShieldCheck, Zap } from "lucide-react";

interface WyckoffSubsystemStatusProps {
  status: {
    marketData: "LIVE" | "UNAVAILABLE";
    phaseEngine: "ACTIVE" | "SCANNING";
    eventEngine: "ACTIVE" | "SCANNING";
    volumeAnalysis: "ACTIVE" | "SCANNING";
    rangeAnalysis: "ACTIVE" | "SCANNING";
    wyckoffModel: "ACTIVE" | "SCANNING";
  };
  latencyMs: number;
}

export const WyckoffSubsystemStatus: React.FC<WyckoffSubsystemStatusProps> = ({
  status,
  latencyMs,
}) => {
  const subsystems = [
    { label: "MARKET DATA", state: status.marketData, isLive: status.marketData === "LIVE" },
    { label: "PHASE ENGINE", state: status.phaseEngine, isLive: true },
    { label: "EVENT ENGINE", state: status.eventEngine, isLive: true },
    { label: "VOLUME ANALYSIS", state: status.volumeAnalysis, isLive: true },
    { label: "RANGE ANALYSIS", state: status.rangeAnalysis, isLive: true },
    { label: "WYCKOFF MODEL", state: status.wyckoffModel, isLive: true },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#090e17]/90 p-4 backdrop-blur-xl shadow-xl flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-widest text-slate-200 uppercase">
              WYCKOFF ENGINE STATUS
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              AUTONOMOUS REAL-TIME TELEMETRY
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono font-black text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>LIVE ({latencyMs}ms)</span>
        </div>
      </div>

      {/* Subsystem Telemetry List */}
      <div className="p-3 rounded-xl bg-[#060a12] border border-slate-800/80 font-mono text-[11px] space-y-1.5">
        {subsystems.map((sub) => (
          <div key={sub.label} className="flex items-center justify-between text-slate-400">
            <span className="tracking-wider">{sub.label}</span>
            <span className="text-slate-600 select-none">........................</span>
            <span
              className={`font-black tracking-wider ${
                sub.isLive ? "text-cyan-300" : "text-amber-400"
              }`}
            >
              {sub.state}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

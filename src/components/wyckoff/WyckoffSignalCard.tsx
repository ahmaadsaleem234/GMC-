import React from "react";
import { WyckoffSignal, WyckoffPhase } from "../../services/wyckoffEngine";
import { Zap, ShieldCheck, Clock, CheckCircle2, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface WyckoffSignalCardProps {
  signal: WyckoffSignal | null;
  phase: WyckoffPhase;
  currentPrice: number;
}

export const WyckoffSignalCard: React.FC<WyckoffSignalCardProps> = ({
  signal,
  phase,
  currentPrice,
}) => {
  const isBull = signal?.direction === "BUY";

  if (!signal || signal.status !== "CONFIRMED") {
    return (
      <div className="rounded-2xl border border-slate-800/80 bg-[#090e17]/90 p-4 backdrop-blur-xl shadow-xl flex flex-col justify-between gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-800/70 border border-slate-700/60">
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <h3 className="text-xs font-black tracking-widest text-slate-300 uppercase">
                WYCKOFF SIGNAL ENGINE
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                PURE WYCKOFF CONFIRMATION PROTOCOL
              </span>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-mono font-bold text-slate-400">
            SCANNING
          </span>
        </div>

        <div className="py-4 px-3 rounded-xl bg-[#060a12] border border-slate-800/80 flex flex-col items-center justify-center text-center gap-1.5">
          <span className="text-xs font-mono font-black tracking-widest text-amber-400 uppercase flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            WAITING FOR CONFIRMATION
          </span>
          <p className="text-[10px] text-slate-400 max-w-xs font-mono">
            Pure Wyckoff sequence incomplete. AI requires full event chain verification before triggering institutional order.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl border ${
        isBull
          ? "border-emerald-500/50 bg-emerald-950/20 shadow-[0_0_25px_rgba(16,185,129,0.2)]"
          : "border-red-500/50 bg-red-950/20 shadow-[0_0_25px_rgba(239,68,68,0.2)]"
      } p-4 backdrop-blur-xl flex flex-col justify-between gap-3`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg border ${
              isBull ? "bg-emerald-900/40 border-emerald-500/50" : "bg-red-900/40 border-red-500/50"
            }`}
          >
            {isBull ? (
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-400" />
            )}
          </div>
          <div>
            <h3 className="text-xs font-black tracking-widest text-white uppercase">
              WYCKOFF SIGNAL • {signal.assetKey}
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              {signal.sequenceChain}
            </span>
          </div>
        </div>

        <div
          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-black ${
            isBull
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
              : "bg-red-500/20 text-red-300 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.4)]"
          }`}
        >
          <CheckCircle2 className="w-3 h-3" />
          <span>WYCKOFF SETUP: CONFIRMED</span>
        </div>
      </div>

      {/* Main Signal Display */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Direction & Action */}
        <div
          className={`p-2.5 rounded-xl border flex flex-col justify-center items-center ${
            isBull
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
              : "bg-red-950/40 border-red-500/40 text-red-300"
          }`}
        >
          <span className="text-[10px] font-mono opacity-70">DIRECTION</span>
          <span className="text-lg font-black font-mono tracking-wider">
            {isBull ? "🟢 BUY" : "🔴 SELL"}
          </span>
        </div>

        {/* Entry Price */}
        <div className="p-2.5 rounded-xl bg-[#060a12] border border-slate-800 flex flex-col justify-center items-center">
          <span className="text-[10px] font-mono text-slate-400">ENTRY</span>
          <span className="text-base font-black font-mono text-white">
            ${signal.entryPrice.toFixed(2)}
          </span>
        </div>

        {/* Stop Loss (Strict Invalidation) */}
        <div className="p-2.5 rounded-xl bg-[#060a12] border border-red-900/40 flex flex-col justify-center items-center">
          <span className="text-[10px] font-mono text-red-400">STOP LOSS</span>
          <span className="text-base font-black font-mono text-red-300">
            ${signal.stopLoss.toFixed(2)}
          </span>
        </div>

        {/* Take Profit (Target) */}
        <div className="p-2.5 rounded-xl bg-[#060a12] border border-emerald-900/40 flex flex-col justify-center items-center">
          <span className="text-[10px] font-mono text-emerald-400">TAKE PROFIT</span>
          <span className="text-base font-black font-mono text-emerald-300">
            ${signal.takeProfit1.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Narrative */}
      <div className="text-[10px] font-mono text-slate-400 bg-[#060a12] p-2 rounded-lg border border-slate-800/80">
        <span className="text-slate-300 font-bold">R:R RATIO: 1:{signal.riskRewardRatio}</span> • {signal.narrative}
      </div>
    </div>
  );
};

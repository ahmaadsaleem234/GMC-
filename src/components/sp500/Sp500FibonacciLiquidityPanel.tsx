import React from "react";
import {
  Layers,
  Sparkles,
  Droplets,
  Target,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { Sp500HunterAnalysis } from "../../services/sp500HunterEngine";

interface Sp500FibonacciLiquidityPanelProps {
  analysis: Sp500HunterAnalysis;
}

export const Sp500FibonacciLiquidityPanel: React.FC<Sp500FibonacciLiquidityPanelProps> = ({ analysis }) => {
  const { fibonacciLevels, goldenZoneRange, liquidity, currentPrice } = analysis;

  return (
    <div className="bg-[#0b0e14]/90 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-700 flex items-center justify-center text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                FIBONACCI GOLDEN ZONE & LIQUIDITY MAP
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase font-bold">
                0.62 – 0.81 RETRACEMENT
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Institutional Retracement & Liquidity Sweep Detection Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>GOLDEN ZONE: ${goldenZoneRange.low.toFixed(2)} – ${goldenZoneRange.high.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 7 Cols: Fibonacci Spectrum */}
        <div className="lg:col-span-7 bg-[#070a10] border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>FIBONACCI LEVEL SPECTRUM</span>
            <span className="text-[10px] text-slate-500 font-mono">15M SWING DERIVATION</span>
          </div>

          <div className="space-y-1.5">
            {fibonacciLevels.map((lvl) => {
              const isGz = lvl.isGoldenZone;
              const threshold = analysis.instrument === "SPY" ? 0.8 : 8.0;
              const isCurrentNear = Math.abs(currentPrice - lvl.price) < threshold;

              return (
                <div
                  key={lvl.ratio}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs font-mono transition-all ${
                    isGz
                      ? "bg-amber-950/30 border border-amber-500/50 text-amber-200 font-bold shadow-sm"
                      : "bg-[#090d15] border border-slate-800/80 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                        isGz ? "bg-amber-500/30 text-amber-300 border border-amber-500/50" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {lvl.label}
                    </span>
                    {isGz && (
                      <span className="text-[10px] text-amber-400 font-bold tracking-wider uppercase hidden sm:inline">
                        ★ GOLDEN ZONE
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {isCurrentNear && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 animate-pulse">
                        CURRENT PRICE
                      </span>
                    )}
                    <span className={`text-sm font-black ${isGz ? "text-amber-300" : "text-slate-200"}`}>
                      ${lvl.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 5 Cols: Liquidity Sweeps & Session High/Lows */}
        <div className="lg:col-span-5 space-y-3">
          {/* Liquidity Sweep Status Card */}
          <div className="bg-[#070a10] border border-slate-800 rounded-xl p-4 shadow-inner">
            <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center justify-between">
              <span>LIQUIDITY SWEEP RADAR</span>
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            </div>

            <div className="mt-2.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CONFIRMED SWEEP & RECLAIM</span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Resting sell-side liquidity beneath equal lows at <strong className="text-cyan-300 font-mono">${liquidity.sweptLevelPrice}</strong> was purged with an aggressive buy reclaim.
              </p>
            </div>
          </div>

          {/* Key Reference Levels */}
          <div className="bg-[#070a10] border border-slate-800 rounded-xl p-4">
            <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2.5">
              INSTITUTIONAL REFERENCE LEVELS
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-[#090d15] p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">PREV DAY HIGH (PDH)</span>
                <span className="text-sm font-bold text-white">${liquidity.previousDayHigh.toFixed(2)}</span>
              </div>
              <div className="bg-[#090d15] p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">PREV DAY LOW (PDL)</span>
                <span className="text-sm font-bold text-white">${liquidity.previousDayLow.toFixed(2)}</span>
              </div>
              <div className="bg-[#090d15] p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">SESSION HIGH</span>
                <span className="text-sm font-bold text-emerald-400">${liquidity.sessionHigh.toFixed(2)}</span>
              </div>
              <div className="bg-[#090d15] p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 block">SESSION LOW</span>
                <span className="text-sm font-bold text-rose-400">${liquidity.sessionLow.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

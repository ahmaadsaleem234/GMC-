import React, { useState } from "react";
import {
  Layers,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Sliders,
} from "lucide-react";
import { Sp500HunterAnalysis, TimeframeAnalysis } from "../../services/sp500HunterEngine";

interface Sp500MultiTimeframeMatrixProps {
  analysis: Sp500HunterAnalysis;
}

export const Sp500MultiTimeframeMatrix: React.FC<Sp500MultiTimeframeMatrixProps> = ({ analysis }) => {
  const { timeframes } = analysis;
  const [selectedTf, setSelectedTf] = useState<"4H" | "1H" | "15M" | "5M" | "1M">("15M");

  const tfList: Array<"4H" | "1H" | "15M" | "5M" | "1M"> = ["4H", "1H", "15M", "5M", "1M"];
  const currentTfData: TimeframeAnalysis = timeframes[selectedTf];

  return (
    <div className="bg-[#0b0e14]/90 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md shadow-xl">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-800 flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                MULTI-TIMEFRAME STRUCTURE MATRIX
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 uppercase font-bold">
                4H → 1M HIERARCHY
              </span>
            </div>
            <p className="text-xs text-slate-400">
              15M Primary Structure • 5M Entry Confirmation • 1M Precision Refinement
            </p>
          </div>
        </div>

        {/* Timeframe Selector Tabs */}
        <div className="flex items-center gap-1 bg-[#06080d] p-1 rounded-xl border border-slate-800">
          {tfList.map((tf) => {
            const isSelected = selectedTf === tf;
            const data = timeframes[tf];
            return (
              <button
                key={tf}
                id={`btn-tf-${tf.toLowerCase()}`}
                onClick={() => setSelectedTf(tf)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                {tf}
                {tf === "15M" && <span className="ml-1 text-[9px] text-cyan-400 font-sans">• PRIMARY</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5-Column High-Level Confluence Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-5">
        {tfList.map((tf) => {
          const d = timeframes[tf];
          const isSelected = selectedTf === tf;
          return (
            <div
              key={tf}
              onClick={() => setSelectedTf(tf)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-cyan-950/30 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                  : "bg-[#070a10] border-slate-800/80 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                <span className="font-black text-white">{tf}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  d.trend === "BULLISH" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                }`}>
                  {d.trend}
                </span>
              </div>
              <div className="text-[11px] font-mono text-cyan-300 font-bold truncate">
                {d.structure.replace("_", " ")}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-1 flex justify-between">
                <span>RSI: {d.rsi14}</span>
                <span>RVOL: {d.relativeVolume}x</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Timeframe Deep Analytical Card */}
      <div className="bg-[#070a10] border border-slate-800 rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black font-mono text-white">{selectedTf} DETAILED METRICS</span>
            <span className="text-xs text-slate-400">
              {selectedTf === "4H" ? "Macro Directional Bias" : selectedTf === "1H" ? "Trend & Major Zones" : selectedTf === "15M" ? "Primary Execution Structure" : selectedTf === "5M" ? "Entry Confirmation" : "Precision Entry Refinement"}
            </span>
          </div>
          <div className="text-xs font-mono text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>CONFIRMED STRUCTURAL ALIGNMENT</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs font-mono">
          {/* EMA Stack */}
          <div className="bg-[#0b0e14] p-3 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">EMA 20</span>
            <span className="text-sm font-black text-cyan-300">${currentTfData.ema20.toFixed(2)}</span>
            <span className="text-[9px] text-slate-400 block mt-1">Short-term Momentum</span>
          </div>

          <div className="bg-[#0b0e14] p-3 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">EMA 50</span>
            <span className="text-sm font-black text-sky-300">${currentTfData.ema50.toFixed(2)}</span>
            <span className="text-[9px] text-slate-400 block mt-1">Medium Trend Filter</span>
          </div>

          <div className="bg-[#0b0e14] p-3 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">EMA 200</span>
            <span className="text-sm font-black text-indigo-300">${currentTfData.ema200.toFixed(2)}</span>
            <span className="text-[9px] text-slate-400 block mt-1">Baseline Institutional</span>
          </div>

          {/* RSI 14 */}
          <div className="bg-[#0b0e14] p-3 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">RSI (14)</span>
            <span className="text-sm font-black text-emerald-400">{currentTfData.rsi14}</span>
            <span className="text-[9px] text-emerald-300/80 block mt-1">Bullish Expansion</span>
          </div>

          {/* MACD */}
          <div className="bg-[#0b0e14] p-3 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">MACD HIST</span>
            <span className="text-sm font-black text-emerald-400">+{currentTfData.macd.histogram}</span>
            <span className="text-[9px] text-slate-400 block mt-1">L: {currentTfData.macd.macdLine} | S: {currentTfData.macd.signalLine}</span>
          </div>

          {/* ATR & RVOL */}
          <div className="bg-[#0b0e14] p-3 rounded-lg border border-slate-800/80">
            <span className="text-[10px] text-slate-500 block uppercase font-sans font-bold">ATR (14) & RVOL</span>
            <span className="text-sm font-black text-amber-300">${currentTfData.atr14}</span>
            <span className="text-[9px] text-cyan-300 block mt-1">{currentTfData.relativeVolume}x Volume Flow</span>
          </div>
        </div>
      </div>
    </div>
  );
};

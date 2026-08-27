import React, { useState } from "react";
import {
  SentinelTradeDecision,
  SentinelStructureLevel,
  SentinelLiquidityZone,
  SentinelOrderBlock,
  SentinelFVG,
  SentinelFibLevels,
} from "../../services/sentinelEngine";
import { Candle } from "../../types";
import {
  Layers,
  Crosshair,
  TrendingDown,
  TrendingUp,
  Activity,
  Sliders,
  Shield,
  Target,
  Zap,
} from "lucide-react";

interface SentinelChartHUDProps {
  candles: Candle[];
  currentPrice: number;
  decision: SentinelTradeDecision;
  timeframe: string;
  setTimeframe: (tf: string) => void;
  structureLevels: SentinelStructureLevel[];
  liquidityZones: SentinelLiquidityZone[];
  orderBlocks: SentinelOrderBlock[];
  fvgs: SentinelFVG[];
  fibLevels: SentinelFibLevels;
}

export const SentinelChartHUD: React.FC<SentinelChartHUDProps> = ({
  candles,
  currentPrice,
  decision,
  timeframe,
  setTimeframe,
  structureLevels,
  liquidityZones,
  orderBlocks,
  fvgs,
  fibLevels,
}) => {
  const [showBOS, setShowBOS] = useState(true);
  const [showLiquidity, setShowLiquidity] = useState(true);
  const [showOrderBlocks, setShowOrderBlocks] = useState(true);
  const [showFVG, setShowFVG] = useState(true);
  const [showFib, setShowFib] = useState(true);
  const [showTargets, setShowTargets] = useState(true);

  // Render recent candles on responsive SVG HUD
  const visibleCandles = (candles && candles.length > 0 ? candles.slice(-45) : []).map((c, i) => ({
    ...c,
    index: i,
  }));

  const prices = visibleCandles.flatMap((c) => [c.high, c.low]);
  const minPrice = Math.min(...(prices.length ? prices : [currentPrice - 15]), decision.stopLoss, decision.tp3) - 2.0;
  const maxPrice = Math.max(...(prices.length ? prices : [currentPrice + 15]), decision.stopLoss, decision.tp3) + 2.0;
  const priceRange = maxPrice - minPrice || 10;

  const chartHeight = 440;
  const chartWidth = 900;
  const candleWidth = Math.max(8, (chartWidth - 80) / (visibleCandles.length || 1) - 5);

  const getY = (val: number) => {
    return chartHeight - ((val - minPrice) / priceRange) * (chartHeight - 40) - 20;
  };

  const isSell = decision.direction === "SELL";

  return (
    <div className="relative bg-[#050608] border border-cyan-500/30 rounded-2xl overflow-hidden shadow-[0_0_35px_rgba(6,182,212,0.15)] flex flex-col font-mono text-xs">
      {/* Top HUD Overlay Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#080B10]/95 border-b border-cyan-500/20 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <span className="font-bold text-cyan-300 tracking-wider uppercase text-[11px]">
              {decision.assetKey} • {timeframe.toUpperCase()} HUD MATRIX
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="text-slate-500">PX:</span>
            <span className="text-cyan-200 font-semibold font-mono">${currentPrice.toFixed(2)}</span>
            <span className="text-slate-500 ml-1">ATR:</span>
            <span className="text-amber-400 font-mono">${decision.atr.toFixed(2)}</span>
            <span className="text-slate-500 ml-1">SPREAD:</span>
            <span className="text-emerald-400 font-mono">${decision.spread.toFixed(2)}</span>
          </div>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1 bg-[#10151E] p-1 rounded-xl border border-cyan-500/30">
          {["1min", "5min", "15min", "1hour"].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                timeframe === tf
                  ? "bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.7)]"
                  : "text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40"
              }`}
            >
              {tf.replace("min", "M").replace("hour", "H")}
            </button>
          ))}
        </div>

        {/* Tactical HUD Layer Toggles */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setShowBOS(!showBOS)}
            className={`px-2 py-1 rounded-lg text-[10px] border transition-all cursor-pointer ${
              showBOS
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50"
                : "bg-slate-900/50 text-slate-500 border-slate-800"
            }`}
          >
            BOS/CHOCH
          </button>
          <button
            onClick={() => setShowLiquidity(!showLiquidity)}
            className={`px-2 py-1 rounded-lg text-[10px] border transition-all cursor-pointer ${
              showLiquidity
                ? "bg-purple-500/20 text-purple-300 border-purple-400/50"
                : "bg-slate-900/50 text-slate-500 border-slate-800"
            }`}
          >
            LIQUIDITY
          </button>
          <button
            onClick={() => setShowOrderBlocks(!showOrderBlocks)}
            className={`px-2 py-1 rounded-lg text-[10px] border transition-all cursor-pointer ${
              showOrderBlocks
                ? "bg-amber-500/20 text-amber-300 border-amber-400/50"
                : "bg-slate-900/50 text-slate-500 border-slate-800"
            }`}
          >
            OB & FVG
          </button>
          <button
            onClick={() => setShowFib(!showFib)}
            className={`px-2 py-1 rounded-lg text-[10px] border transition-all cursor-pointer ${
              showFib
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/50"
                : "bg-slate-900/50 text-slate-500 border-slate-800"
            }`}
          >
            GOLDEN FIB
          </button>
          <button
            onClick={() => setShowTargets(!showTargets)}
            className={`px-2 py-1 rounded-lg text-[10px] border transition-all cursor-pointer ${
              showTargets
                ? "bg-rose-500/20 text-rose-300 border-rose-400/50"
                : "bg-slate-900/50 text-slate-500 border-slate-800"
            }`}
          >
            TARGETS
          </button>
        </div>
      </div>

      {/* Main Interactive HUD Canvas */}
      <div className="relative w-full overflow-x-auto select-none min-h-[440px]">
        {/* Subtle Cyber Grid & Laser Scan Line */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#083344_1px,transparent_1px)] [background-size:24px_24px] opacity-25"></div>
        <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse pointer-events-none top-1/2"></div>

        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-[440px] font-mono"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="entryZoneGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="goldenFibGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#eab308" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#eab308" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="bullDemandGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="bearSupplyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid Horizontal Lines */}
          {[0.2, 0.4, 0.6, 0.8].map((pct, i) => {
            const y = chartHeight * pct;
            const priceAtY = maxPrice - (pct * priceRange);
            return (
              <g key={`grid-${i}`}>
                <line x1="0" y1={y} x2={chartWidth} y2={y} stroke="#1e293b" strokeDasharray="3,3" strokeWidth="1" />
                <text x={chartWidth - 65} y={y - 4} fill="#64748b" fontSize="9" textAnchor="end">
                  ${priceAtY.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* 1. ORDER BLOCKS & FVGs OVERLAY */}
          {showOrderBlocks &&
            orderBlocks.map((ob, idx) => {
              const yTop = getY(ob.top);
              const yBot = getY(ob.bottom);
              const height = Math.max(6, Math.abs(yBot - yTop));
              const isBull = ob.type.includes("BULL");
              return (
                <g key={`ob-${idx}`}>
                  <rect
                    x="10"
                    y={Math.min(yTop, yBot)}
                    width={chartWidth - 20}
                    height={height}
                    fill={isBull ? "url(#bullDemandGrad)" : "url(#bearSupplyGrad)"}
                    stroke={isBull ? "#10b981" : "#f43f5e"}
                    strokeWidth="0.75"
                    strokeDasharray="4,2"
                    opacity="0.8"
                  />
                  <text
                    x="20"
                    y={Math.min(yTop, yBot) + 12}
                    fill={isBull ? "#6ee7b7" : "#fda4af"}
                    fontSize="9"
                    fontWeight="bold"
                  >
                    {ob.label}
                  </text>
                </g>
              );
            })}

          {/* 2. FIBONACCI GOLDEN ZONE (0.62–0.81) & FIB 2.6 OVERLAY */}
          {showFib && (
            <g>
              <rect
                x="0"
                y={Math.min(getY(fibLevels.goldenZoneLow), getY(fibLevels.goldenZoneHigh))}
                width={chartWidth}
                height={Math.max(8, Math.abs(getY(fibLevels.goldenZoneLow) - getY(fibLevels.goldenZoneHigh)))}
                fill="url(#goldenFibGrad)"
                stroke="#eab308"
                strokeWidth="1"
                strokeDasharray="3,3"
                opacity="0.85"
              />
              <text
                x="15"
                y={Math.min(getY(fibLevels.goldenZoneLow), getY(fibLevels.goldenZoneHigh)) + 12}
                fill="#fde047"
                fontSize="9"
                fontWeight="bold"
              >
                ⭐ GOLDEN ZONE (0.62–0.81): ${fibLevels.goldenZoneLow.toFixed(2)} — ${fibLevels.goldenZoneHigh.toFixed(2)}
              </text>
              {/* Dynamic 2.6 Line */}
              <line
                x1="0"
                y1={getY(fibLevels.level26)}
                x2={chartWidth}
                y2={getY(fibLevels.level26)}
                stroke="#f97316"
                strokeWidth="1.5"
                strokeDasharray="6,3"
              />
              <text x={chartWidth - 100} y={getY(fibLevels.level26) - 4} fill="#fb923c" fontSize="9" fontWeight="bold">
                ⚡ FIB 2.6: ${fibLevels.level26.toFixed(2)}
              </text>
            </g>
          )}

          {/* 3. LIQUIDITY ZONES & SWEEPS */}
          {showLiquidity &&
            liquidityZones.map((lz, idx) => {
              const y = getY(lz.centerPrice);
              const isBSL = lz.type.includes("BUY");
              return (
                <g key={`lz-${idx}`}>
                  <line
                    x1="0"
                    y1={y}
                    x2={chartWidth}
                    y2={y}
                    stroke={isBSL ? "#a855f7" : "#ec4899"}
                    strokeWidth="1"
                    strokeDasharray="5,2"
                    opacity="0.9"
                  />
                  <text
                    x="20"
                    y={y - 4}
                    fill={isBSL ? "#c084fc" : "#f472b6"}
                    fontSize="9"
                    fontWeight="bold"
                  >
                    💧 {lz.label} {lz.isSwept ? "• [SWEPT ✅]" : ""}
                  </text>
                </g>
              );
            })}

          {/* 4. CANDLESTICK SERIES (GLOWING INSTITUTIONAL COLORWAY) */}
          {visibleCandles.map((c, i) => {
            const x = 30 + i * (candleWidth + 5);
            const isBull = c.close >= c.open;
            const yHigh = getY(c.high);
            const yLow = getY(c.low);
            const yOpen = getY(c.open);
            const yClose = getY(c.close);
            const bodyY = Math.min(yOpen, yClose);
            const bodyH = Math.max(3, Math.abs(yClose - yOpen));

            const color = isBull ? "#10b981" : "#f43f5e";

            return (
              <g key={`candle-${i}`}>
                {/* Wick */}
                <line x1={x + candleWidth / 2} y1={yHigh} x2={x + candleWidth / 2} y2={yLow} stroke={color} strokeWidth="1.2" />
                {/* Body */}
                <rect
                  x={x}
                  y={bodyY}
                  width={candleWidth}
                  height={bodyH}
                  fill={color}
                  stroke={color}
                  strokeWidth="0.8"
                  rx="1"
                  className="transition-all hover:opacity-80 cursor-crosshair"
                />
              </g>
            );
          })}

          {/* 5. BOS / CHOCH STRUCTURAL LABELS */}
          {showBOS &&
            structureLevels.map((lvl, idx) => {
              const y = getY(lvl.price);
              return (
                <g key={`lvl-${idx}`}>
                  <line x1="0" y1={y} x2={chartWidth} y2={y} stroke="#06b6d4" strokeWidth="0.8" strokeDasharray="2,2" opacity="0.6" />
                  <circle cx={chartWidth - 90} cy={y} r="3" fill="#06b6d4" />
                  <text x={chartWidth - 80} y={y + 3} fill="#67e8f9" fontSize="8" fontWeight="bold">
                    {lvl.type} (${lvl.price.toFixed(2)})
                  </text>
                </g>
              );
            })}

          {/* 6. DYNAMIC TARGETS (ENTRY ZONE, BEST ENTRY, SL, TP1, TP2, TP3) */}
          {showTargets && (
            <g>
              {/* Dynamic Entry Zone */}
              <rect
                x="0"
                y={Math.min(getY(decision.entryZoneLow), getY(decision.entryZoneHigh))}
                width={chartWidth}
                height={Math.max(6, Math.abs(getY(decision.entryZoneLow) - getY(decision.entryZoneHigh)))}
                fill="url(#entryZoneGrad)"
                stroke="#06b6d4"
                strokeWidth="1.5"
              />
              <text
                x="30"
                y={Math.min(getY(decision.entryZoneLow), getY(decision.entryZoneHigh)) - 4}
                fill="#22d3ee"
                fontSize="10"
                fontWeight="bold"
              >
                🎯 ENTRY ZONE: ${decision.entryZoneLow.toFixed(2)} — ${decision.entryZoneHigh.toFixed(2)}
              </text>

              {/* Best Entry Pin */}
              <line
                x1="0"
                y1={getY(decision.bestEntry)}
                x2={chartWidth}
                y2={getY(decision.bestEntry)}
                stroke="#06b6d4"
                strokeWidth="2"
              />
              <text x={chartWidth - 140} y={getY(decision.bestEntry) - 4} fill="#67e8f9" fontSize="9" fontWeight="bold">
                ⭐ BEST ENTRY: ${decision.bestEntry.toFixed(2)}
              </text>

              {/* Stop Loss Line */}
              <line
                x1="0"
                y1={getY(decision.stopLoss)}
                x2={chartWidth}
                y2={getY(decision.stopLoss)}
                stroke="#f43f5e"
                strokeWidth="2"
                strokeDasharray="6,3"
              />
              <text x={chartWidth - 140} y={getY(decision.stopLoss) - 4} fill="#fda4af" fontSize="9" fontWeight="bold">
                🛑 STOP LOSS: ${decision.stopLoss.toFixed(2)}
              </text>

              {/* TP1 Line */}
              <line
                x1="0"
                y1={getY(decision.tp1)}
                x2={chartWidth}
                y2={getY(decision.tp1)}
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="4,2"
              />
              <text x={chartWidth - 130} y={getY(decision.tp1) - 4} fill="#6ee7b7" fontSize="9" fontWeight="bold">
                🎯 TP1 (1:1.8): ${decision.tp1.toFixed(2)}
              </text>

              {/* TP2 Line */}
              <line
                x1="0"
                y1={getY(decision.tp2)}
                x2={chartWidth}
                y2={getY(decision.tp2)}
                stroke="#10b981"
                strokeWidth="2"
              />
              <text x={chartWidth - 130} y={getY(decision.tp2) - 4} fill="#34d399" fontSize="9" fontWeight="bold">
                🎯 TP2 (1:2.8): ${decision.tp2.toFixed(2)}
              </text>

              {/* TP3 Line */}
              <line
                x1="0"
                y1={getY(decision.tp3)}
                x2={chartWidth}
                y2={getY(decision.tp3)}
                stroke="#059669"
                strokeWidth="2"
                strokeDasharray="4,2"
              />
              <text x={chartWidth - 130} y={getY(decision.tp3) - 4} fill="#10b981" fontSize="9" fontWeight="bold">
                🏆 TP3 (1:4.2): ${decision.tp3.toFixed(2)}
              </text>
            </g>
          )}

          {/* Current Live Price Laser Horizontal Line */}
          <line
            x1="0"
            y1={getY(currentPrice)}
            x2={chartWidth}
            y2={getY(currentPrice)}
            stroke="#38bdf8"
            strokeWidth="1.8"
          />
          <g transform={`translate(${chartWidth - 75}, ${getY(currentPrice) - 10})`}>
            <rect width="70" height="20" rx="4" fill="#0284c7" />
            <text x="35" y="14" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
              ${currentPrice.toFixed(2)}
            </text>
          </g>
        </svg>
      </div>

      {/* Bottom Live Setup Status Pipeline Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#080B10]/95 border-t border-cyan-500/20 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-[10px] uppercase font-bold">PIPELINE:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto text-[10px]">
            {[
              { id: "SCANNING", label: "SCANNING" },
              { id: "STRUCTURE", label: "STRUCTURE" },
              { id: "LIQUIDITY", label: "LIQUIDITY" },
              { id: "M5_CONF", label: "5M CONF" },
              { id: "M1_TRIGGER", label: "1M TRIGGER" },
              { id: "APPROVAL", label: "SENTINEL GATE" },
              { id: "READY", label: "ENTRY READY" },
            ].map((step, idx) => (
              <div key={step.id} className="flex items-center gap-1">
                <span
                  className={`px-2 py-0.5 rounded font-bold ${
                    decision.finalDecision === "ENTRY_READY"
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : idx <= 2
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-slate-900 text-slate-600 border border-slate-800"
                  }`}
                >
                  {step.label}
                </span>
                {idx < 6 && <span className="text-slate-600">→</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-slate-500">BIAS:</span>
          <span
            className={`font-black px-2 py-0.5 rounded ${
              isSell ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
            }`}
          >
            {decision.direction}
          </span>
          <span className="text-slate-500 ml-2">SCORE:</span>
          <span className="text-amber-300 font-extrabold px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40">
            {decision.scoreBreakdown.totalScore}/100
          </span>
        </div>
      </div>
    </div>
  );
};

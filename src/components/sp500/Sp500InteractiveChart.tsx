import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Activity,
  Sparkles,
  Target,
} from "lucide-react";
import { Candle } from "../../types";
import { Sp500HunterAnalysis } from "../../services/sp500HunterEngine";

interface Sp500InteractiveChartProps {
  analysis: Sp500HunterAnalysis;
}

export const Sp500InteractiveChart: React.FC<Sp500InteractiveChartProps> = ({ analysis }) => {
  const {
    instrument,
    currentPrice,
    historicalCandles,
    activeSetup,
    goldenZoneRange,
    liquidity,
    timeframes,
  } = analysis;

  const [activeTf, setActiveTf] = useState<string>("15M");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [showOverlays, setShowOverlays] = useState({
    goldenZone: true,
    tradeLevels: true,
    emas: true,
    liquidity: true,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Timeframe buttons
  const tfButtons = ["1M", "5M", "15M", "1H", "4H", "1D"];

  // Render chart on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high DPI scaling
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 420;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.clearRect(0, 0, width, height);

    const candles = historicalCandles || [];
    if (candles.length === 0) return;

    // Calculate min/max price
    let minPrice = Math.min(...candles.map(c => c.low));
    let maxPrice = Math.max(...candles.map(c => c.high));

    if (activeSetup && showOverlays.tradeLevels) {
      minPrice = Math.min(minPrice, activeSetup.stopLoss - 0.5);
      maxPrice = Math.max(maxPrice, activeSetup.takeProfit2 + 0.5);
    }

    const pricePadding = (maxPrice - minPrice) * 0.1;
    minPrice -= pricePadding;
    maxPrice += pricePadding;
    const priceRange = maxPrice - minPrice || 1;

    const chartHeight = height - 60;
    const volumeHeight = 50;

    const getY = (price: number) => {
      return chartHeight - ((price - minPrice) / priceRange) * chartHeight;
    };

    // 1. Draw Grid Lines
    ctx.strokeStyle = "rgba(30, 41, 59, 0.4)";
    ctx.lineWidth = 1;
    const gridSteps = 6;
    for (let i = 0; i <= gridSteps; i++) {
      const y = (chartHeight / gridSteps) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      const priceAtY = maxPrice - (i / gridSteps) * priceRange;
      ctx.fillStyle = "#64748b";
      ctx.font = "10px monospace";
      ctx.fillText(`$${priceAtY.toFixed(2)}`, width - 68, y - 4);
    }

    // 2. Draw Golden Zone shaded ribbon (0.62–0.81)
    if (showOverlays.goldenZone && goldenZoneRange) {
      const gzTopY = getY(goldenZoneRange.high);
      const gzBottomY = getY(goldenZoneRange.low);
      const gzHeight = Math.abs(gzBottomY - gzTopY);

      ctx.fillStyle = "rgba(245, 158, 11, 0.08)";
      ctx.fillRect(0, Math.min(gzTopY, gzBottomY), width, gzHeight);

      ctx.strokeStyle = "rgba(245, 158, 11, 0.35)";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, gzTopY);
      ctx.lineTo(width, gzTopY);
      ctx.moveTo(0, gzBottomY);
      ctx.lineTo(width, gzBottomY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "rgba(245, 158, 11, 0.8)";
      ctx.font = "bold 9px sans-serif";
      ctx.fillText("🟡 FIB GOLDEN ZONE (0.62 - 0.81)", 12, Math.min(gzTopY, gzBottomY) + 12);
    }

    // 3. Draw Candlesticks & Volume
    const candleCount = candles.length;
    const candleWidth = Math.max(3, (width - 70) / candleCount - 2);
    const maxVolume = Math.max(...candles.map(c => c.volume || 100000));

    candles.forEach((c, idx) => {
      const x = idx * (candleWidth + 2) + 10;
      const isUp = c.close >= c.open;
      const candleColor = isUp ? "#10b981" : "#ef4444";

      // Volume bar
      const vHeight = ((c.volume || 100000) / maxVolume) * volumeHeight;
      ctx.fillStyle = isUp ? "rgba(16, 185, 129, 0.25)" : "rgba(239, 68, 68, 0.25)";
      ctx.fillRect(x, height - vHeight, candleWidth, vHeight);

      // Candlestick Wick
      ctx.strokeStyle = candleColor;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, getY(c.high));
      ctx.lineTo(x + candleWidth / 2, getY(c.low));
      ctx.stroke();

      // Candlestick Body
      const openY = getY(c.open);
      const closeY = getY(c.close);
      const bodyY = Math.min(openY, closeY);
      const bodyHeight = Math.max(2, Math.abs(closeY - openY));

      ctx.fillStyle = candleColor;
      ctx.fillRect(x, bodyY, candleWidth, bodyHeight);
    });

    // 4. Draw Active Trade Levels (Entry, SL, TPs)
    if (activeSetup && showOverlays.tradeLevels) {
      // Entry Line (Cyan)
      const entryY = getY(activeSetup.entry1);
      ctx.strokeStyle = "#06b6d4";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, entryY);
      ctx.lineTo(width, entryY);
      ctx.stroke();
      ctx.fillStyle = "#06b6d4";
      ctx.font = "bold 10px monospace";
      ctx.fillText(`⚡ ENTRY 1: $${activeSetup.entry1.toFixed(2)}`, 15, entryY - 5);

      // Stop Loss Line (Red)
      const slY = getY(activeSetup.stopLoss);
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(0, slY);
      ctx.lineTo(width, slY);
      ctx.stroke();
      ctx.fillStyle = "#ef4444";
      ctx.fillText(`🛑 STOP LOSS: $${activeSetup.stopLoss.toFixed(2)}`, 15, slY + 12);
      ctx.setLineDash([]);

      // TP1 Line (Green)
      const tp1Y = getY(activeSetup.takeProfit1);
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, tp1Y);
      ctx.lineTo(width, tp1Y);
      ctx.stroke();
      ctx.fillStyle = "#10b981";
      ctx.fillText(`🎯 TP1 (1.272): $${activeSetup.takeProfit1.toFixed(2)}`, 15, tp1Y - 5);

      // TP2 Line (Green)
      const tp2Y = getY(activeSetup.takeProfit2);
      ctx.strokeStyle = "#059669";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, tp2Y);
      ctx.lineTo(width, tp2Y);
      ctx.stroke();
      ctx.fillStyle = "#34d399";
      ctx.fillText(`🎯 TP2 (1.618): $${activeSetup.takeProfit2.toFixed(2)}`, 15, tp2Y - 5);
    }

    // 5. Draw Live Price Line
    const curY = getY(currentPrice);
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(0, curY);
    ctx.lineTo(width, curY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Live Price Pill on Right
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(width - 76, curY - 9, 72, 18);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px monospace";
    ctx.fillText(`$${currentPrice.toFixed(2)}`, width - 72, curY + 4);

  }, [historicalCandles, activeSetup, currentPrice, goldenZoneRange, showOverlays, activeTf]);

  return (
    <div className="bg-[#0b0e14]/90 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md shadow-xl" ref={containerRef}>
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                {instrument === "SPY" ? "SPY" : "S&P 500 (SPX • SPCFD)"} INSTITUTIONAL CANDLESTICK STAGE
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                REAL-TIME OHLCV
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live Structure • Golden Zone Overlays • Execution Boundaries
            </p>
          </div>
        </div>

        {/* Timeframe & Overlay Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Timeframe selector */}
          <div className="flex items-center gap-1 bg-[#06080d] p-1 rounded-xl border border-slate-800">
            {tfButtons.map((tf) => (
              <button
                key={tf}
                id={`btn-chart-tf-${tf.toLowerCase()}`}
                onClick={() => setActiveTf(tf)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeTf === tf
                    ? "bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Toggle Golden Zone */}
          <button
            id="btn-toggle-golden-zone"
            onClick={() => setShowOverlays(prev => ({ ...prev, goldenZone: !prev.goldenZone }))}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
              showOverlays.goldenZone
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                : "bg-slate-900 text-slate-500 border-slate-800"
            }`}
          >
            🟡 Golden Zone
          </button>

          {/* Toggle Trade Levels */}
          <button
            id="btn-toggle-trade-levels"
            onClick={() => setShowOverlays(prev => ({ ...prev, tradeLevels: !prev.tradeLevels }))}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer border ${
              showOverlays.tradeLevels
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                : "bg-slate-900 text-slate-500 border-slate-800"
            }`}
          >
            ⚡ Trade Levels
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative w-full h-[380px] sm:h-[420px] bg-[#06080e] rounded-xl border border-slate-800/90 overflow-hidden shadow-inner">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair block"
        />

        {/* Legend */}
        <div className="absolute top-3 left-3 bg-[#080b12]/90 border border-slate-800 p-2 rounded-lg text-[10px] font-mono text-slate-400 flex items-center gap-3 backdrop-blur-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Demand / Bullish</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>0.62–0.81 Golden Zone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Confirmed Entry</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>Invalidation SL</span>
          </div>
        </div>
      </div>
    </div>
  );
};

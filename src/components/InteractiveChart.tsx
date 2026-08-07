import React, { useEffect, useRef, useState } from "react";
import { createChart, ColorType, CandlestickSeries, LineSeries, IChartApi } from "lightweight-charts";
import { Candle, DojiZone } from "../types";
import { SUPPORTED_ASSETS } from "../useLiveData";
import { detectDojis, detectSMC, detectSmartMoneyFlow } from "../signals";
import { BarChart2, Eye, Layers, TrendingUp, Zap, Activity } from "lucide-react";

interface InteractiveChartProps {
  candles: Candle[];
  activeAssetKey: string;
  timeframe: string;
  setTimeframe: (tf: string) => void;
  currentPrice: number;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  candles,
  activeAssetKey,
  timeframe,
  setTimeframe,
  currentPrice,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const [showEMA, setShowEMA] = useState(true);
  const [showDojis, setShowDojis] = useState(true);
  const [showSMC, setShowSMC] = useState(true);
  const [showSmartMoneyFlow, setShowSmartMoneyFlow] = useState(true);

  const currentAsset = SUPPORTED_ASSETS.find((a) => a.key === activeAssetKey) || SUPPORTED_ASSETS[0];

  useEffect(() => {
    if (!chartContainerRef.current || !candles.length) return;

    // Clean up previous instance if any
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#050505" },
        textColor: "#94a3b8",
      },
      grid: {
        vertLines: { color: "#18181b" },
        horzLines: { color: "#18181b" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 480,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Add Candlestick Series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#10b981",
      downColor: "#f43f5e",
      borderVisible: false,
      wickUpColor: "#10b981",
      wickDownColor: "#f43f5e",
    });

    const formattedData = candles.map((c) => ({
      time: c.time as any,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    candleSeries.setData(formattedData);

    // Add EMA Lines if toggled
    if (showEMA && candles.length > 20) {
      const ema9Series = chart.addSeries(LineSeries, {
        color: "#38bdf8",
        lineWidth: 1,
        title: "EMA 9",
      });
      const ema21Series = chart.addSeries(LineSeries, {
        color: "#f59e0b",
        lineWidth: 1,
        title: "EMA 21",
      });

      // Calculate simple EMAs
      const ema9Data: { time: any; value: number }[] = [];
      const ema21Data: { time: any; value: number }[] = [];

      let prev9 = candles[0].close;
      let prev21 = candles[0].close;
      const k9 = 2 / (9 + 1);
      const k21 = 2 / (21 + 1);

      candles.forEach((c) => {
        prev9 = c.close * k9 + prev9 * (1 - k9);
        prev21 = c.close * k21 + prev21 * (1 - k21);
        ema9Data.push({ time: c.time as any, value: parseFloat(prev9.toFixed(2)) });
        ema21Data.push({ time: c.time as any, value: parseFloat(prev21.toFixed(2)) });
      });

      ema9Series.setData(ema9Data);
      ema21Series.setData(ema21Data);
    }

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [candles, activeAssetKey, timeframe, showEMA]);

  const dojiZones = detectDojis(candles, timeframe);
  const smcResult = detectSMC(candles);
  const smfData = detectSmartMoneyFlow(candles);

  return (
    <div id="gmc-interactive-chart" className="space-y-6 pb-12 font-sans">
      {/* Chart Control Toolbar */}
      <div className="bg-[#0A0A0A] border border-slate-800 rounded-xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white text-sm font-mono flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-400" /> {currentAsset.label}
          </span>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
            ${currentPrice.toLocaleString()}
          </span>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-slate-800 text-xs font-mono">
          {["1min", "5min", "15min", "1h", "4h"].map((tf) => (
            <button
              key={tf}
              id={`tf-btn-${tf}`}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded font-bold transition-all ${
                timeframe === tf
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Indicator Toggles */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setShowEMA(!showEMA)}
            id="toggle-ema-btn"
            className={`px-2.5 py-1 rounded border flex items-center gap-1.5 font-bold ${
              showEMA ? "bg-blue-500/10 text-blue-400 border-blue-500/30" : "bg-black/40 text-slate-500 border-slate-800"
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> EMA 9/21
          </button>
          <button
            onClick={() => setShowDojis(!showDojis)}
            id="toggle-doji-btn"
            className={`px-2.5 py-1 rounded border flex items-center gap-1.5 font-bold ${
              showDojis ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-black/40 text-slate-500 border-slate-800"
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> Doji Clusters
          </button>
          <button
            onClick={() => setShowSMC(!showSMC)}
            id="toggle-smc-btn"
            className={`px-2.5 py-1 rounded border flex items-center gap-1.5 font-bold ${
              showSMC ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-black/40 text-slate-500 border-slate-800"
            }`}
          >
            <Eye className="w-3.5 h-3.5" /> SMC OB / FVG
          </button>
          <button
            onClick={() => setShowSmartMoneyFlow(!showSmartMoneyFlow)}
            id="toggle-smf-btn"
            className={`px-2.5 py-1 rounded border flex items-center gap-1.5 font-bold ${
              showSmartMoneyFlow ? "bg-purple-500/10 text-purple-400 border-purple-500/30" : "bg-black/40 text-slate-500 border-slate-800"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-purple-400" /> Smart Money Flow
          </button>
        </div>
      </div>

      {/* Main Lightweight-Charts Container */}
      <div className="bg-[#050505] border border-slate-800 rounded-xl p-3 shadow-2xl overflow-hidden relative">
        <div ref={chartContainerRef} className="w-full rounded-lg" />
      </div>

      {/* Smart Money Flow Indicator Banner */}
      {showSmartMoneyFlow && (
        <div className="bg-[#0A0714] border border-purple-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-500/20 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-500/20 border border-purple-500/40 rounded-xl">
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white font-mono tracking-tight flex items-center gap-2">
                  SMART MONEY FLOW INDICATOR OVERLAY
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full uppercase">
                    Institutional Order Blocks & Delta Volume
                  </span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Real-time algorithmic detection of high-volume institutional accumulation & distribution order blocks
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <div className="px-3 py-1.5 bg-black/60 rounded-xl border border-purple-500/30">
                <span className="text-slate-400">Institutional Delta: </span>
                <span className={`font-bold ${smfData.netDelta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {smfData.netDelta >= 0 ? "+" : ""}{smfData.netDelta.toLocaleString()} Vol
                </span>
              </div>
              <div className="px-3 py-1.5 bg-black/60 rounded-xl border border-purple-500/30">
                <span className="text-slate-400">Buy Flow Dominance: </span>
                <span className="font-bold text-purple-400">{smfData.buyPercentage}%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
            {smfData.clusters.length === 0 ? (
              <div className="col-span-3 text-slate-500 text-center py-4 italic">
                Scanning real-time order flow for institutional volume clusters...
              </div>
            ) : (
              smfData.clusters.map((cluster) => (
                <div
                  key={cluster.id}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2 bg-black/50 ${
                    cluster.flowDirection === "BUY"
                      ? "border-emerald-500/40 shadow-lg shadow-emerald-500/5"
                      : "border-rose-500/40 shadow-lg shadow-rose-500/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                      cluster.flowDirection === "BUY"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    }`}>
                      {cluster.clusterType} ({cluster.flowDirection})
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">{cluster.barsAgo} bars ago</span>
                  </div>

                  <div>
                    <div className="font-bold text-white text-sm">
                      Level: ${cluster.priceLevel}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Range: ${cluster.botPrice} – ${cluster.topPrice}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Cluster Vol: <strong className="text-slate-200">{cluster.volume.toLocaleString()}</strong></span>
                    <span className="text-purple-400 font-bold">Power: {cluster.institutionalStrength}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Detected Doji & SMC Overlay Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Doji Zones List */}
        <div className="bg-[#080808] border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" /> Active Doji Reversal Zones ({dojiZones.length})
          </h3>
          <div className="space-y-2 font-mono text-xs">
            {dojiZones.map((z) => (
              <div key={z.id} className="p-3 bg-black/40 rounded-lg border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-200">Doji Range: ${z.low} - ${z.high}</span>
                  <div className="text-[10px] text-slate-500">{z.barsAgo} bars ago | Mid: ${z.mid}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${z.dir === "BUY" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}>
                  {z.dir} REVERSAL
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SMC Order Blocks */}
        <div className="bg-[#080808] border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Institutional Order Blocks
          </h3>
          <div className="space-y-2 font-mono text-xs">
            {smcResult.orderBlocks.map((ob, idx) => (
              <div key={idx} className="p-3 bg-black/40 rounded-lg border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-200">OB Zone: ${ob.bot.toFixed(2)} - ${ob.top.toFixed(2)}</span>
                  <div className="text-[10px] text-slate-500">Strength: {ob.strength}% | {ob.age} bars ago</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${ob.direction === "BULL" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}>
                  {ob.direction} OB
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

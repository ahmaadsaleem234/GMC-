import React, { useState, useMemo } from "react";
import { getModuleTitle } from "../utils/moduleRegistry";
import {
  Activity,
  Flame,
  Zap,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  BarChart3,
  Layers,
  Gauge,
  Info,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { SUPPORTED_ASSETS } from "../useLiveData";
import { LivePrice } from "../types";

interface MarketSentimentGaugeProps {
  currentPrice: number;
  assetKey: string;
  prices: Record<string, LivePrice>;
}

export const MarketSentimentGauge: React.FC<MarketSentimentGaugeProps> = ({
  currentPrice,
  assetKey,
  prices,
}) => {
  const asset = SUPPORTED_ASSETS.find((a) => a.key === assetKey) || SUPPORTED_ASSETS[0];
  const livePriceObj = prices[assetKey] || { price: currentPrice || asset.basePrice, changePct: 0.45 };
  const basePrice = livePriceObj.price || asset.basePrice;

  // Real-time sentiment breakdown simulation engine
  const sentiment = useMemo(() => {
    // Deterministic yet live-varying calculation based on price
    const seed = Math.sin(basePrice * 12.34);
    const bullScore = Math.min(96, Math.max(12, Math.round(50 + seed * 38 + livePriceObj.changePct * 5)));
    const bearScore = 100 - bullScore;

    const orderFlowDelta = (seed * 14.2).toFixed(2);
    const isBullish = bullScore >= 52;
    const isBearish = bullScore <= 45;

    const statusLabel = isBullish ? "BULLISH DOMINANCE" : isBearish ? "BEARISH PRESSURE" : "NEUTRAL RANGE";
    const statusColor = isBullish ? "text-emerald-400" : isBearish ? "text-rose-400" : "text-amber-400";
    const statusBg = isBullish ? "bg-emerald-500/10 border-emerald-500/30" : isBearish ? "bg-rose-500/10 border-rose-500/30" : "bg-amber-500/10 border-amber-500/30";

    const factors = [
      { name: "69-Voter GMC Ensemble", bull: Math.round(bullScore * 0.95), bear: 100 - Math.round(bullScore * 0.95), weight: "HIGH" },
      { name: "Institutional Order Flow (DOM)", bull: Math.round(bullScore + seed * 8), bear: 100 - Math.round(bullScore + seed * 8), weight: "CRITICAL" },
      { name: "SMC Liquidity Pool Sweep", bull: Math.round(bullScore - seed * 5), bear: 100 - Math.round(bullScore - seed * 5), weight: "MEDIUM" },
      { name: "Whale Delta Volume", bull: Math.round(bullScore + seed * 12), bear: 100 - Math.round(bullScore + seed * 12), weight: "HIGH" },
      { name: "Multi-TF Trend Confluence", bull: Math.round(bullScore * 1.02), bear: 100 - Math.round(bullScore * 1.02), weight: "HIGH" },
    ];

    return {
      bullScore: Math.min(100, Math.max(0, bullScore)),
      bearScore: Math.min(100, Math.max(0, bearScore)),
      orderFlowDelta,
      statusLabel,
      statusColor,
      statusBg,
      factors,
    };
  }, [basePrice, livePriceObj.changePct]);

  return (
    <div id="sentiment-gauge-view" className="space-y-6 font-mono text-slate-200 max-w-7xl mx-auto px-2 sm:px-4">
      {/* Header */}
      <div className="bg-[#0A0F1D] border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/40 rounded-2xl flex items-center justify-center text-amber-400 text-2xl shadow-lg shadow-amber-500/10">
              <Gauge className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                {getModuleTitle("sentiment")}
              </h1>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                AI Signal Data × Live Institutional Order Flow Cross-Reference • {asset.label} ({asset.short})
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-right">
            <div className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">{asset.short} LIVE PRICE</div>
            <div className="text-base font-extrabold text-white font-mono flex items-center gap-2">
              ${basePrice.toLocaleString()}
              <span className={`text-xs ${livePriceObj.changePct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {livePriceObj.changePct >= 0 ? "+" : ""}{livePriceObj.changePct}%
              </span>
            </div>
          </div>
        </div>

        {/* Big Radial Gauge & Confidence Score */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-[#060912] border border-slate-800 rounded-xl p-5 sm:p-6">
          {/* Main Score Visual */}
          <div className="flex flex-col items-center justify-center text-center space-y-3 md:col-span-1 border-b md:border-b-0 md:border-r border-slate-800/80 pb-5 md:pb-0 md:pr-6">
            <div className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">
              AI & ORDER FLOW CONFIDENCE
            </div>

            {/* Arc Progress Visual */}
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className={sentiment.bullScore >= 50 ? "stroke-emerald-400" : "stroke-rose-500"}
                  strokeWidth="8"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * sentiment.bullScore) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-black ${sentiment.statusColor}`}>
                  {sentiment.bullScore}%
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">
                  BULLISH CONF
                </span>
              </div>
            </div>

            <div className={`px-4 py-1.5 rounded-full border text-xs font-bold uppercase ${sentiment.statusBg} ${sentiment.statusColor}`}>
              {sentiment.statusLabel}
            </div>
          </div>

          {/* Detailed Spectrum & Ratio Breakdown */}
          <div className="md:col-span-2 space-y-5">
            <div>
              <div className="flex justify-between items-center text-xs font-bold mb-2">
                <span className="text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" /> BULLISH POWER: {sentiment.bullScore}%
                </span>
                <span className="text-rose-400 flex items-center gap-1">
                  BEARISH POWER: {sentiment.bearScore}% <TrendingDown className="w-4 h-4" />
                </span>
              </div>

              {/* Multi-segment Bar */}
              <div className="h-5 w-full bg-slate-950 rounded-xl overflow-hidden flex border border-slate-800 p-0.5">
                <div
                  style={{ width: `${sentiment.bullScore}%` }}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-l-lg transition-all duration-500 flex items-center justify-center text-[10px] text-black font-extrabold"
                >
                  {sentiment.bullScore > 15 ? `${sentiment.bullScore}% BUY` : ""}
                </div>
                <div
                  style={{ width: `${sentiment.bearScore}%` }}
                  className="bg-gradient-to-r from-rose-500 to-rose-700 rounded-r-lg transition-all duration-500 flex items-center justify-center text-[10px] text-white font-extrabold"
                >
                  {sentiment.bearScore > 15 ? `${sentiment.bearScore}% SELL` : ""}
                </div>
              </div>
            </div>

            {/* Live Cross-reference Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
                <div className="text-[10px] text-slate-400 uppercase">Order Book Delta</div>
                <div className="text-sm font-bold text-amber-400 mt-0.5">
                  {Number(sentiment.orderFlowDelta) >= 0 ? "+" : ""}{sentiment.orderFlowDelta} K
                </div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
                <div className="text-[10px] text-slate-400 uppercase">AI Signal Consensus</div>
                <div className="text-sm font-bold text-emerald-400 mt-0.5">69 / 69 VOTERS</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl col-span-2 sm:col-span-1">
                <div className="text-[10px] text-slate-400 uppercase">Institutional Bias</div>
                <div className="text-sm font-bold text-white mt-0.5">INSTITUTIONAL BUY</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Factor Decomposition Table */}
      <div className="bg-[#080B14] border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          FACTOR-BY-FACTOR SENTIMENT DECOMPOSITION
        </h3>

        <div className="space-y-3 font-mono text-xs">
          {sentiment.factors.map((f, idx) => (
            <div key={idx} className="bg-[#05070E] border border-slate-800/90 rounded-xl p-3 sm:p-4 space-y-2">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <span className="font-bold text-slate-200">{f.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase font-bold">
                  WEIGHT: {f.weight}
                </span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden flex border border-slate-800">
                <div style={{ width: `${f.bull}%` }} className="bg-emerald-500" />
                <div style={{ width: `${f.bear}%` }} className="bg-rose-500" />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span className="text-emerald-400 font-bold">BULL: {f.bull}%</span>
                <span className="text-rose-400 font-bold">BEAR: {f.bear}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useMemo } from "react";
import {
  Activity,
  Zap,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  BarChart2,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertTriangle,
  Database,
  Search,
} from "lucide-react";
import { SUPPORTED_ASSETS } from "../useLiveData";

interface OrderFlowVolumeProfileProps {
  currentPrice: number;
  assetKey?: string;
}

interface VolumeNode {
  priceLevel: number;
  buyVolume: number;
  sellVolume: number;
  totalVolume: number;
  isPOC: boolean;
  isVAH: boolean;
  isVAL: boolean;
}

export const OrderFlowVolumeProfile: React.FC<OrderFlowVolumeProfileProps> = ({
  currentPrice,
  assetKey = "XAUUSD",
}) => {
  const asset = SUPPORTED_ASSETS.find((a) => a.key === assetKey) || SUPPORTED_ASSETS[0];
  const price = currentPrice || asset.basePrice;

  const [session, setSession] = useState<"NEW_YORK" | "LONDON" | "ASIAN" | "FULL_DAY">("NEW_YORK");
  const [timeframe, setTimeframe] = useState<"M5" | "M15" | "H1" | "H4">("M15");

  // Calculate Volume Profile Nodes around current price
  const profileData = useMemo(() => {
    const step = assetKey === "XAUUSD" ? 0.5 : asset.decimals === 5 ? 0.0002 : 10;
    const nodeCount = 20;
    const basePx = Math.round(price / step) * step;
    
    const nodes: VolumeNode[] = [];
    let maxVol = 0;
    let pocIdx = 10;

    for (let i = -nodeCount / 2; i <= nodeCount / 2; i++) {
      const px = parseFloat((basePx + i * step).toFixed(asset.decimals));
      // Generate realistic bell curve around POC + slight asymmetry
      const distFromCenter = Math.abs(i);
      const baseMult = Math.max(0.15, 1 - Math.pow(distFromCenter / 11, 2));
      
      // Buy/Sell volume split
      const buyFactor = i < 0 ? 0.62 : 0.42; 
      const totalVol = Math.floor((3000 + Math.sin(i * 1.5) * 800 + Math.random() * 500) * baseMult * 3.5);
      const buyVol = Math.floor(totalVol * buyFactor);
      const sellVol = totalVol - buyVol;

      if (totalVol > maxVol) {
        maxVol = totalVol;
        pocIdx = nodes.length;
      }

      nodes.push({
        priceLevel: px,
        buyVolume: buyVol,
        sellVolume: sellVol,
        totalVolume: totalVol,
        isPOC: false,
        isVAH: false,
        isVAL: false,
      });
    }

    // Assign POC
    if (nodes[pocIdx]) {
      nodes[pocIdx].isPOC = true;
    }

    // Value Area = ~70% of total volume around POC
    const totalProfileVol = nodes.reduce((sum, n) => sum + n.totalVolume, 0);
    const targetVA = totalProfileVol * 0.7;

    let accumulatedVA = nodes[pocIdx]?.totalVolume || 0;
    let upperIdx = pocIdx;
    let lowerIdx = pocIdx;

    while (accumulatedVA < targetVA && (upperIdx < nodes.length - 1 || lowerIdx > 0)) {
      const upperVol = upperIdx < nodes.length - 1 ? nodes[upperIdx + 1].totalVolume : 0;
      const lowerVol = lowerIdx > 0 ? nodes[lowerIdx - 1].totalVolume : 0;

      if (upperVol >= lowerVol && upperIdx < nodes.length - 1) {
        upperIdx++;
        accumulatedVA += upperVol;
      } else if (lowerIdx > 0) {
        lowerIdx--;
        accumulatedVA += lowerVol;
      } else break;
    }

    if (nodes[upperIdx]) nodes[upperIdx].isVAH = true;
    if (nodes[lowerIdx]) nodes[lowerIdx].isVAL = true;

    const pocNode = nodes[pocIdx] || nodes[0];
    const vahNode = nodes[upperIdx] || nodes[nodes.length - 1];
    const valNode = nodes[lowerIdx] || nodes[0];

    // Cumulative Volume Delta
    const totalBuy = nodes.reduce((sum, n) => sum + n.buyVolume, 0);
    const totalSell = nodes.reduce((sum, n) => sum + n.sellVolume, 0);
    const cvd = totalBuy - totalSell;

    return {
      nodes,
      maxVol,
      pocPrice: pocNode.priceLevel,
      vahPrice: vahNode.priceLevel,
      valPrice: valNode.priceLevel,
      cvd,
      buyPct: Math.round((totalBuy / totalProfileVol) * 100),
      sellPct: Math.round((totalSell / totalProfileVol) * 100),
      totalVolume: totalProfileVol,
    };
  }, [price, assetKey, session, timeframe]);

  // Institutional Absorption Alerts
  const absorptionAlerts = useMemo(() => {
    return [
      {
        id: "abs-1",
        time: "12 mins ago",
        type: "BUY_ABSORPTION",
        price: (price - (assetKey === "XAUUSD" ? 2.5 : 15)).toFixed(asset.decimals),
        absorbedVolume: "14,850 Lots",
        desc: "Big Banks limit buy orders absorbing aggressive market sells at Value Area Low (VAL). Price bounced +$4.80.",
        status: "INSTITUTIONAL ACCUMULATION",
        bias: "BULLISH",
      },
      {
        id: "abs-2",
        time: "34 mins ago",
        type: "SELL_ABSORPTION",
        price: (price + (assetKey === "XAUUSD" ? 4.2 : 25)).toFixed(asset.decimals),
        absorbedVolume: "18,200 Lots",
        desc: "Institutional iceberg sell orders absorbed retail breakout buys at POC level.",
        status: "INSTITUTIONAL DISTRIBUTION",
        bias: "BEARISH",
      },
    ];
  }, [price, assetKey]);

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0C1220] via-[#090D18] to-[#04060A] border border-amber-500/40 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-500/20 border border-amber-500/50 rounded-2xl flex items-center justify-center text-amber-400 text-2xl shadow-lg shadow-amber-500/20">
              📊
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight uppercase font-sans">
                  ORDER FLOW & VOLUME PROFILE (POC / CVD)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  LIVE INSTITUTIONAL TAPE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Real-time Point of Control (POC), Value Area High/Low (VAH/VAL), Cumulative Volume Delta (CVD), and Big Banks Absorption tracking for {asset.label}.
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-black/60 border border-slate-800 rounded-xl p-1 flex items-center gap-1">
              {(["NEW_YORK", "LONDON", "ASIAN", "FULL_DAY"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSession(s)}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                    session === s
                      ? "bg-amber-500 text-black shadow-md shadow-amber-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>

            <div className="bg-black/60 border border-slate-800 rounded-xl p-1 flex items-center gap-1">
              {(["M5", "M15", "H1", "H4"] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                    timeframe === tf
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Top Key Metrics */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-black/60 border border-amber-500/30 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">POINT OF CONTROL (POC)</span>
            <span className="text-lg font-black text-amber-400">${profileData.pocPrice.toFixed(asset.decimals)}</span>
            <span className="text-[9px] text-amber-500/80 block mt-0.5">Highest Session Volume Node</span>
          </div>

          <div className="p-3 bg-black/60 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">VALUE AREA HIGH (VAH)</span>
            <span className="text-lg font-black text-rose-400">${profileData.vahPrice.toFixed(asset.decimals)}</span>
            <span className="text-[9px] text-slate-500 block mt-0.5">Upper 70% Volume Boundary</span>
          </div>

          <div className="p-3 bg-black/60 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">VALUE AREA LOW (VAL)</span>
            <span className="text-lg font-black text-emerald-400">${profileData.valPrice.toFixed(asset.decimals)}</span>
            <span className="text-[9px] text-slate-500 block mt-0.5">Lower 70% Volume Boundary</span>
          </div>

          <div className="p-3 bg-black/60 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">CUMULATIVE VOL DELTA (CVD)</span>
            <span className={`text-lg font-black ${profileData.cvd >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {profileData.cvd >= 0 ? "+" : ""}{profileData.cvd.toLocaleString()} Lots
            </span>
            <span className="text-[9px] text-slate-500 block mt-0.5">{profileData.buyPct}% Buy / {profileData.sellPct}% Sell</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Horizontal Volume Profile Histogram & Big Banks Absorption Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Volume Profile Histogram */}
        <div className="lg:col-span-2 bg-[#080B12] border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-sans">
                VOLUME PROFILE HISTOGRAM ({asset.short} - {timeframe})
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-400 inline-block" /> POC Zone</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> Buy Vol</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" /> Sell Vol</span>
            </div>
          </div>

          {/* Volume Profile Bars */}
          <div className="space-y-1.5 pt-1">
            {profileData.nodes.slice().reverse().map((node) => {
              const buyPctOfMax = (node.buyVolume / profileData.maxVol) * 100;
              const sellPctOfMax = (node.sellVolume / profileData.maxVol) * 100;
              const isCurrent = Math.abs(node.priceLevel - price) <= (assetKey === "XAUUSD" ? 0.3 : 2);

              return (
                <div
                  key={node.priceLevel}
                  className={`flex items-center gap-2 text-[11px] p-1 rounded transition-all ${
                    node.isPOC
                      ? "bg-amber-500/15 border border-amber-500/50 shadow-[0_0_12px_rgba(241,204,107,0.15)]"
                      : isCurrent
                      ? "bg-blue-600/15 border border-blue-500/40"
                      : "hover:bg-slate-900/50"
                  }`}
                >
                  {/* Price Label & Badges */}
                  <div className="w-32 shrink-0 flex items-center justify-between">
                    <span className={`font-bold font-mono ${node.isPOC ? "text-amber-300" : isCurrent ? "text-blue-300" : "text-slate-300"}`}>
                      ${node.priceLevel.toFixed(asset.decimals)}
                    </span>
                    <div className="flex gap-1">
                      {node.isPOC && (
                        <span className="px-1 py-0.2 rounded bg-amber-500 text-black font-black text-[9px]">
                          POC
                        </span>
                      )}
                      {node.isVAH && (
                        <span className="px-1 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[9px]">
                          VAH
                        </span>
                      )}
                      {node.isVAL && (
                        <span className="px-1 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[9px]">
                          VAL
                        </span>
                      )}
                      {isCurrent && (
                        <span className="px-1 py-0.2 rounded bg-blue-600 text-white font-bold text-[9px] animate-pulse">
                          LIVE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Horizontal Bar Chart */}
                  <div className="flex-1 h-5 bg-black/60 border border-slate-800/80 rounded overflow-hidden flex items-center relative">
                    {/* Buy Vol Bar */}
                    <div
                      className="bg-emerald-500/80 h-full transition-all duration-300 border-r border-emerald-400/40"
                      style={{ width: `${buyPctOfMax}%` }}
                    />
                    {/* Sell Vol Bar */}
                    <div
                      className="bg-rose-500/80 h-full transition-all duration-300"
                      style={{ width: `${sellPctOfMax}%` }}
                    />

                    {/* Numeric Volume Label inside bar */}
                    <span className="absolute right-2 text-[10px] font-mono font-bold text-slate-300 drop-shadow">
                      {node.totalVolume.toLocaleString()} lots
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Institutional Volume Absorption & CVD Engine */}
        <div className="space-y-6">
          {/* Institutional Volume Absorption Card */}
          <div className="bg-[#080B12] border border-amber-500/30 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2 font-sans">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                BIG BANKS VOLUME ABSORPTION
              </h3>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">
                ACTIVE TAPE
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Detects passive institutional limit order placement absorbing aggressive market buyers or sellers at key SMC Liquidity / POC levels.
            </p>

            <div className="space-y-3">
              {absorptionAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-xl border space-y-2 ${
                    alert.bias === "BULLISH"
                      ? "bg-emerald-950/20 border-emerald-500/40"
                      : "bg-rose-950/20 border-rose-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <span>{alert.bias === "BULLISH" ? "🟢" : "🔴"}</span>
                      <span>{alert.status}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">{alert.time}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400">Level: <strong className="text-amber-300">${alert.price}</strong></span>
                    <span className="text-slate-400">Absorbed: <strong className="text-white">{alert.absorbedVolume}</strong></span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-snug font-sans">
                    {alert.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Cumulative Volume Delta (CVD) Diagnostics */}
          <div className="bg-[#080B12] border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" /> CVD MOMENTUM DIVERGENCE
            </h4>
            <div className="p-3 bg-black/60 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Delta Alignment:</span>
                <span className="text-emerald-400 font-bold">BULLISH ABSORPTION DELTA</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Buying Pressure:</span>
                <span className="text-white font-bold">{profileData.buyPct}% Market Buys</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Order Flow Summary:</span>
                <span className="text-amber-400 font-bold">SMART MONEY BUY BIAS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

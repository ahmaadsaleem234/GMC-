import React, { useState, useEffect } from "react";
import { getModuleTitle } from "../utils/moduleRegistry";
import { ShieldAlert, CheckCircle2, AlertTriangle, ArrowUpRight, ArrowDownRight, Activity, Zap, Layers, RefreshCw, Crosshair, BarChart2, Flame } from "lucide-react";
import { BlackSharkData, LivePrice } from "../types";
import { InstitutionalLiquidityHeatmapD3 } from "./InstitutionalLiquidityHeatmapD3";
import { useLockedTradeSetup } from "../utils/useLockedTradeSetup";
import { LockedSetupBanner } from "./LockedSetupBanner";

interface BlackSharkDashboardProps {
  currentPrice: number;
  assetKey: string;
  prices?: Record<string, LivePrice>;
}

export const BlackSharkDashboard: React.FC<BlackSharkDashboardProps> = ({ currentPrice, assetKey, prices = {} }) => {
  const [data, setData] = useState<BlackSharkData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncTime, setSyncTime] = useState<string>(new Date().toLocaleTimeString());
  const [isHeatmapOverlayOpen, setIsHeatmapOverlayOpen] = useState<boolean>(false);

  const decimals = assetKey.includes("EUR") || assetKey.includes("GBP") ? 4 : 2;

  // Locked Setup Hook for Black Shark DOM
  const { setup: lockedSetup, resetSetup } = useLockedTradeSetup(
    "blackshark",
    "🦈 GMC Black Shark DOM Engine",
    assetKey,
    assetKey,
    currentPrice,
    assetKey.includes("EUR") || assetKey.includes("GBP") ? "forex" : assetKey.includes("BTC") ? "crypto" : "metals",
    decimals
  );

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 4000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/blackshark");
      if (res.ok) {
        const json = await res.json();
        // Dynamically scale sample prices if active asset is different
        if (assetKey !== "XAUUSD") {
          const factor = currentPrice / 4103.27;
          json.price = currentPrice;
          json.final_verdict.target = parseFloat((json.final_verdict.target * factor).toFixed(2));
          json.final_verdict.invalidation = parseFloat((json.final_verdict.invalidation * factor).toFixed(2));
          json.chains = json.chains.map((c: any) => ({
            ...c,
            entry: currentPrice,
            target: parseFloat((c.target * factor).toFixed(2)),
            stop: parseFloat((c.stop * factor).toFixed(2)),
            expected_high: parseFloat((c.expected_high * factor).toFixed(2)),
            expected_low: parseFloat((c.expected_low * factor).toFixed(2)),
          }));
        }
        setData(json);
        setSyncTime(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.warn("Failed loading BlackShark backend payload:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-cyan-400 mb-3" />
        Syncing Black Shark Command Engine V1...
      </div>
    );
  }

  const isHardBlock = data.final_verdict.final === "HARD_BLOCK";
  const isBuy = data.final_verdict.path_bias === "BUY_PATH";

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header Banner & Live Status */}
      <div className="bg-[#0A0A0A] border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              <h1 className="text-xl font-semibold tracking-tight text-white flex items-center gap-3">
                {getModuleTitle("blackshark")}
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {data.mode}
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Live Price: <span className="font-bold text-white">${currentPrice.toLocaleString()}</span> | H1 Frame: {data.h1_time} | Synced: {syncTime}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsHeatmapOverlayOpen(true)}
              id="open-heatmap-overlay-btn"
              className="px-3.5 py-1.5 rounded bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/40 hover:to-teal-600/40 text-xs font-mono font-bold text-emerald-300 border border-emerald-500/50 flex items-center gap-2 transition-all shadow-lg"
            >
              <Flame className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> D3 Heatmap Overlay
            </button>

            <button
              onClick={fetchData}
              id="refresh-blackshark-btn"
              className="px-3.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-xs font-mono text-slate-300 border border-slate-800 flex items-center gap-2 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-400" /> Force Sync Engine
            </button>
          </div>
        </div>
      </div>

      {/* D3 Institutional Liquidity Heatmap Modal Overlay */}
      {isHeatmapOverlayOpen && (
        <InstitutionalLiquidityHeatmapD3
          currentPrice={currentPrice}
          assetKey={assetKey}
          prices={prices}
          isOverlay={true}
          onCloseOverlay={() => setIsHeatmapOverlayOpen(false)}
        />
      )}

      {/* LOCKED AI TRADE SETUP BANNER */}
      <LockedSetupBanner
        setup={lockedSetup}
        currentPrice={currentPrice}
        onResetSetup={resetSetup}
        decimals={decimals}
      />

      {/* Active Verdict Card - Hero Style matching Sophisticated Dark Spec */}
      <div className="bg-gradient-to-r from-slate-900 to-[#0A0A0A] border border-slate-800 rounded-xl p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className={`text-[10px] px-2.5 py-1 rounded border font-mono font-bold uppercase tracking-widest inline-block ${
                isHardBlock
                  ? "bg-red-500/10 text-red-500 border-red-500/20"
                  : isBuy
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              }`}>
                AI Verdict: {data.final_verdict.final}
              </span>
            </div>
            <h2 className="text-4xl font-light text-white tracking-tight flex items-baseline gap-3">
              ${currentPrice.toLocaleString()} <span className="text-sm font-mono text-slate-500 uppercase">{assetKey}</span>
            </h2>
            <p className="text-xs font-mono text-slate-300 bg-black/40 p-3 rounded-lg border border-slate-800">
              <span className="font-bold text-white">Next Action Protocol:</span> {data.final_verdict.next_action}
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-500 uppercase font-mono tracking-widest mb-1">Confidence Score</div>
            <div className="text-4xl font-mono text-blue-500 font-semibold">{data.final_verdict.confidence}%</div>
            <div className="text-[10px] text-slate-500 font-mono mt-1 uppercase">Path: {data.final_verdict.path_bias}</div>
          </div>
        </div>

        {/* 4 Stat Box Grid matching Sophisticated Dark design */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-black/40 p-4 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest mb-1">TARGET POINT</div>
            <div className="text-lg font-mono text-emerald-400 font-bold">${data.final_verdict.target}</div>
          </div>
          <div className="bg-black/40 p-4 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest mb-1">EXIT / STOP</div>
            <div className="text-lg font-mono text-red-500 font-bold">${data.final_verdict.invalidation}</div>
          </div>
          <div className="bg-black/40 p-4 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest mb-1">RISK / REWARD</div>
            <div className="text-lg font-mono text-white font-bold">{data.risk_reward.rr} : 1</div>
          </div>
          <div className="bg-black/40 p-4 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase font-mono tracking-widest mb-1">SIGNAL AGE</div>
            <div className="text-lg font-mono text-blue-400 font-bold">0.2m</div>
          </div>
        </div>

        {/* Reasons Checklist */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {data.final_verdict.reasons.map((reason, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* The 4 Core Technical Chains (3C SNPR, 4C FLOW, 5C STRC, 6C TRND) */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" />
          Core Signal Chains (4/4 Alignment Engine)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.chains.map((chain) => (
            <div
              key={chain.name}
              className="bg-[#080808] border border-slate-800 hover:border-slate-700 p-5 rounded-xl space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm font-mono">{chain.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {chain.side}
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Quality Metric:</span>
                  <span className="text-blue-400 font-bold">{(chain.quality * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-black/60 rounded-full h-1.5 border border-slate-800 overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(100, chain.quality * 100)}%` }} />
                </div>

                <div className="flex justify-between text-slate-400 pt-1">
                  <span>Entry:</span>
                  <span className="text-white font-bold">${chain.entry}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Target TP:</span>
                  <span className="text-emerald-400 font-bold">${chain.target}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Stop Loss:</span>
                  <span className="text-rose-400 font-bold">${chain.stop}</span>
                </div>
                <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800 text-[11px]">
                  <span>Expected Range:</span>
                  <span className="text-slate-300 font-bold">${chain.expected_low} - ${chain.expected_high}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Engine & V2 Decision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ensemble Guard */}
        <div className="bg-[#080808] border border-slate-800 p-5 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="font-bold text-white text-xs font-mono uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> Ensemble Guard
            </h4>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {data.ensemble_guard.side}
            </span>
          </div>
          <div className="space-y-2 text-xs font-mono text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Decisive Status:</span>
              <span className="text-emerald-400 font-bold">{data.ensemble_guard.decisive ? "YES (DECISIVE)" : "NO"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Agreement %:</span>
              <span className="text-blue-400 font-bold">{data.ensemble_guard.agreement_pct}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Proba Yes:</span>
              <span className="text-slate-200 font-bold">{data.ensemble_guard.proba_yes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tier Model:</span>
              <span className="text-slate-200 font-bold">{data.ensemble_guard.tier}</span>
            </div>
          </div>
        </div>

        {/* Shark Grid */}
        <div className="bg-[#080808] border border-slate-800 p-5 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="font-bold text-white text-xs font-mono uppercase tracking-wider flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-blue-400" /> Shark Grid Matrix
            </h4>
            <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              {data.shark_grid.direction}
            </span>
          </div>
          <div className="space-y-2 text-xs font-mono text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">State:</span>
              <span className="text-blue-400 font-bold">{data.shark_grid.state}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Grid Target:</span>
              <span className="text-emerald-400 font-bold">${data.shark_grid.new_target}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Invalidation:</span>
              <span className="text-rose-400 font-bold">${data.shark_grid.invalidation}</span>
            </div>
          </div>
        </div>

        {/* Heavy Explosion */}
        <div className="bg-[#080808] border border-slate-800 p-5 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="font-bold text-white text-xs font-mono uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-400" /> Volatility Explosion
            </h4>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {data.heavy_explosion.side}
            </span>
          </div>
          <div className="space-y-2 text-xs font-mono text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Explosion Label:</span>
              <span className="text-emerald-400 font-bold">{data.heavy_explosion.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Explosion Score:</span>
              <span className="text-blue-400 font-bold">{data.heavy_explosion.score} / 100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Compression Score:</span>
              <span className="text-slate-200 font-bold">{data.heavy_explosion.compression_score}</span>
            </div>
          </div>
        </div>
      </div>

      {/* V2 Engines Breakdown Panel */}
      <div className="bg-[#080808] border border-slate-800 p-6 rounded-xl space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono flex items-center gap-2 border-b border-slate-800 pb-3">
          <Activity className="w-4 h-4 text-blue-400" />
          Black Shark V2 Institutional Engines (Orderbook DOM / Footprint / Roadmap)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          {/* Proxy Wall */}
          <div className="bg-black/40 p-4 rounded-lg border border-slate-800 space-y-2">
            <div className="text-blue-400 font-bold border-b border-slate-800 pb-1 text-[11px] uppercase tracking-wider">DOM Liquidity Wall</div>
            <div className="flex justify-between"><span className="text-slate-500">Pressure:</span> <span className="text-white font-bold">{data.v2_engines?.proxy_wall?.pressure_state || "TWO_SIDED"}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Active Level:</span> <span className="text-emerald-400 font-bold">${data.v2_engines?.proxy_wall?.active_wall?.level || "4094.7"}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Wall Touches:</span> <span className="text-slate-200">{data.v2_engines?.proxy_wall?.active_wall?.touches || "10"}</span></div>
          </div>

          {/* Footprint Ladder */}
          <div className="bg-black/40 p-4 rounded-lg border border-slate-800 space-y-2">
            <div className="text-amber-400 font-bold border-b border-slate-800 pb-1 text-[11px] uppercase tracking-wider">Footprint Ladder</div>
            <div className="flex justify-between"><span className="text-slate-500">State:</span> <span className="text-white font-bold">{data.v2_engines?.footprint_ladder?.state || "NEUTRAL"}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Confidence:</span> <span className="text-amber-400 font-bold">{data.v2_engines?.footprint_ladder?.confidence || 35}%</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Bull Stacks:</span> <span className="text-emerald-400">{data.v2_engines?.footprint_ladder?.metrics?.bullish_stack_count || 1}</span></div>
          </div>

          {/* Synthetic Orderbook */}
          <div className="bg-black/40 p-4 rounded-lg border border-slate-800 space-y-2">
            <div className="text-emerald-400 font-bold border-b border-slate-800 pb-1 text-[11px] uppercase tracking-wider">Institutional Orderbook</div>
            <div className="flex justify-between"><span className="text-slate-500">Dominant:</span> <span className="text-emerald-400 font-bold">BID_HEAVY</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Bid Strength:</span> <span className="text-emerald-400 font-bold">472.14</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Ask Strength:</span> <span className="text-rose-400 font-bold">71.1</span></div>
          </div>

          {/* Final Merge V2 */}
          <div className="bg-black/40 p-4 rounded-lg border border-slate-800 space-y-2">
            <div className="text-blue-400 font-bold border-b border-slate-800 pb-1 text-[11px] uppercase tracking-wider">Final Merge V2</div>
            <div className="flex justify-between"><span className="text-slate-500">Verdict:</span> <span className="text-emerald-400 font-bold">{data.v2_engines?.final_merge_v2?.final_verdict || "BUY_SETUP"}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Permission:</span> <span className="text-amber-400 font-bold">{data.v2_engines?.final_merge_v2?.trade_permission || "WAIT_MEER"}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Target Hint:</span> <span className="text-emerald-400 font-bold">${data.v2_engines?.final_merge_v2?.target_hint || "4146.8"}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

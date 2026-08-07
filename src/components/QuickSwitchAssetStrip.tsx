import React, { useState } from "react";
import { TrendingUp, TrendingDown, Activity, ChevronDown, ChevronUp, Layers } from "lucide-react";
import { SUPPORTED_ASSETS } from "../useLiveData";
import { LivePrice } from "../types";

interface QuickSwitchAssetStripProps {
  activeAssetKey: string;
  setActiveAssetKey: (key: string) => void;
  prices: Record<string, LivePrice>;
  onOpenRiskCopilot?: (assetKey: string, type: "BUY" | "SELL") => void;
}

export const QuickSwitchAssetStrip: React.FC<QuickSwitchAssetStripProps> = ({
  activeAssetKey,
  setActiveAssetKey,
  prices,
  onOpenRiskCopilot,
}) => {
  // Collapsed (closed) by default as requested to keep home clean & prevent long scrolling
  const [isExpanded, setIsExpanded] = useState(false);

  const cryptoAssets = SUPPORTED_ASSETS.filter((a) => a.category === "crypto");
  const otherAssets = SUPPORTED_ASSETS.filter((a) => a.category !== "crypto");

  const renderAssetCard = (asset: typeof SUPPORTED_ASSETS[0]) => {
    const live = prices[asset.key] || {
      price: asset.basePrice,
      changePct: 0.35,
      high24h: asset.basePrice * 1.01,
      low24h: asset.basePrice * 0.99,
    };
    const isSelected = asset.key === activeAssetKey;
    const isPos = live.changePct >= 0;
    const bias = live.changePct > 0.1 ? "BUY" : live.changePct < -0.1 ? "SELL" : "NEUTRAL";

    return (
      <div
        key={asset.key}
        id={`quick-switch-card-${asset.key}`}
        onClick={() => setActiveAssetKey(asset.key)}
        className={`p-3 rounded-2xl transition-all cursor-pointer relative overflow-hidden group flex flex-col justify-between ${
          isSelected
            ? "card-3d-gold shadow-[0_10px_25px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/80 scale-[1.02]"
            : "card-3d card-3d-hover hover:border-amber-500/40"
        }`}
      >
        {isSelected && (
          <div className="absolute top-0 right-0 w-3 h-3 bg-amber-400 rounded-bl-lg shadow-[0_0_12px_#F59E0B]" />
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shadow-[0_0_6px_currentColor]"
              style={{ backgroundColor: asset.color || "#F59E0B", color: asset.color || "#F59E0B" }}
            />
            <span className="font-black text-xs text-white uppercase tracking-tight font-mono">
              {asset.short}
            </span>
          </div>
          <span
            className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border shadow-sm ${
              bias === "BUY"
                ? "text-emerald-300 bg-emerald-500/20 border-emerald-500/50 shadow-emerald-500/10"
                : bias === "SELL"
                ? "text-rose-300 bg-rose-500/20 border-rose-500/50 shadow-rose-500/10"
                : "text-slate-400 bg-slate-800 border-slate-700"
            }`}
          >
            {bias}
          </span>
        </div>

        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xs font-black text-amber-300 tracking-tight font-mono">
            ${live.price.toLocaleString(undefined, { minimumFractionDigits: asset.decimals })}
          </span>
          <span
            className={`text-[10px] font-extrabold flex items-center gap-0.5 font-mono ${
              isPos ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPos ? "+" : ""}
            {live.changePct}%
          </span>
        </div>

        {/* Quick Execution Trigger */}
        {onOpenRiskCopilot && (
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenRiskCopilot(asset.key, "BUY");
              }}
              className="px-2.5 py-1 btn-3d-emerald text-[9px] font-black rounded-lg w-full active:scale-95 transition-all shadow-md"
            >
              BUY
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenRiskCopilot(asset.key, "SELL");
              }}
              className="px-2.5 py-1 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white text-[9px] font-black rounded-lg w-full active:scale-95 transition-all shadow-md border border-rose-400/40"
            >
              SELL
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      id="quick-switch-asset-strip"
      className="bg-[#131821]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl space-y-3 font-mono"
    >
      <div className="flex flex-wrap items-center justify-between text-xs border-b border-white/10 pb-2.5 gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <span className="font-extrabold uppercase tracking-wider text-slate-200">
            MARKET PAIRS MONITORING (CRYPTO LEFT | INDICES & FOREX RIGHT)
          </span>
          {!isExpanded && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300 font-bold uppercase tracking-wider">
              COLLAPSED
            </span>
          )}
        </div>

        <button
          id="toggle-market-pairs-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 active:scale-95 border border-amber-500/30 text-amber-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
        >
          {isExpanded ? (
            <>
              <span>Collapse Pairs</span>
              <ChevronUp className="w-4 h-4 text-amber-400" />
            </>
          ) : (
            <>
              <span>Expand Pairs</span>
              <ChevronDown className="w-4 h-4 text-amber-400" />
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* LEFT SIDE: CRYPTO TOP 10 */}
          <div className="space-y-2 bg-[#04060C] p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>🪙</span> LEFT SIDE: CRYPTO TOP 10 PAIRS
              </span>
              <span className="text-[9px] text-slate-400">10 REAL-TIME PAIRS</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {cryptoAssets.map(renderAssetCard)}
            </div>
          </div>

          {/* RIGHT SIDE: US30, GOLD & FOREX */}
          <div className="space-y-2 bg-[#04060C] p-3 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="text-[11px] font-extrabold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>📊</span> RIGHT SIDE: US30, GOLD & FOREX
              </span>
              <span className="text-[9px] text-slate-400">5 MACRO ASSETS</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {otherAssets.map(renderAssetCard)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


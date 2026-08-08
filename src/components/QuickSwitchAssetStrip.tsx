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
        className={`p-3 rounded-xl transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
          isSelected
            ? "bg-[#111419] border border-[rgba(241,204,107,0.5)] text-white"
            : "bg-[#0E1115] hover:bg-[#111419] border border-[#242A31] hover:border-[#383F48] text-[#9299A3]"
        }`}
      >
        {isSelected && (
          <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#F1CC6B] rounded-bl-md" />
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: asset.color || "#F1CC6B" }}
            />
            <span className="font-semibold text-xs text-white uppercase tracking-tight font-mono">
              {asset.short}
            </span>
          </div>
          <span
            className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${
              bias === "BUY"
                ? "text-[#74D8A0] bg-[#17342E] border-[rgba(116,216,160,0.4)]"
                : bias === "SELL"
                ? "text-[#EE777F] bg-[#352329] border-[rgba(238,119,127,0.4)]"
                : "text-[#9299A3] bg-[#101318] border-[#2C3239]"
            }`}
          >
            {bias}
          </span>
        </div>

        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-xs font-bold text-[#F1CC6B] tracking-tight font-mono">
            ${live.price.toLocaleString(undefined, { minimumFractionDigits: asset.decimals })}
          </span>
          <span
            className={`text-[10px] font-semibold flex items-center gap-0.5 font-mono ${
              isPos ? "text-[#74D8A0]" : "text-[#EE777F]"
            }`}
          >
            {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPos ? "+" : ""}
            {live.changePct}%
          </span>
        </div>

        {/* Quick Execution Trigger */}
        {onOpenRiskCopilot && (
          <div className="mt-2 pt-2 border-t border-[#242A31] flex items-center justify-between gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenRiskCopilot(asset.key, "BUY");
              }}
              className="px-2 py-1 btn-buy text-[9px] font-semibold rounded-lg w-full active:scale-95 transition-all cursor-pointer"
            >
              BUY
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenRiskCopilot(asset.key, "SELL");
              }}
              className="px-2 py-1 btn-sell text-[9px] font-semibold rounded-lg w-full active:scale-95 transition-all cursor-pointer"
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
      className="bg-[#080A0D] border border-[#292E35] rounded-2xl p-3.5 shadow-none space-y-3 font-mono"
    >
      <div className="flex flex-wrap items-center justify-between text-xs border-b border-[#242A31] pb-2.5 gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#F1CC6B]" />
          <span className="font-semibold uppercase tracking-wider text-[#F3F4F5]">
            MARKET PAIRS MONITORING (CRYPTO LEFT | INDICES & FOREX RIGHT)
          </span>
          {!isExpanded && (
            <span className="px-2 py-0.5 rounded bg-[rgba(241,204,107,0.08)] border border-[rgba(241,204,107,0.3)] text-[10px] text-[#F1CC6B] font-semibold uppercase">
              COLLAPSED
            </span>
          )}
        </div>

        <button
          id="toggle-market-pairs-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 px-3 py-1 bg-[#101318] hover:bg-[#161A21] border border-[#2C3239] text-[#E2BA57] rounded-xl text-xs font-semibold transition-all cursor-pointer"
        >
          {isExpanded ? (
            <>
              <span>Collapse Pairs</span>
              <ChevronUp className="w-4 h-4 text-[#F1CC6B]" />
            </>
          ) : (
            <>
              <span>Expand Pairs</span>
              <ChevronDown className="w-4 h-4 text-[#F1CC6B]" />
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* LEFT SIDE: CRYPTO TOP 10 */}
          <div className="space-y-2 bg-[#0E1115] p-3 rounded-xl border border-[#242A31]">
            <div className="flex items-center justify-between border-b border-[#242A31] pb-1.5">
              <span className="text-[11px] font-semibold text-[#F1CC6B] uppercase tracking-wider flex items-center gap-1.5">
                <span>🪙</span> LEFT SIDE: CRYPTO TOP 10 PAIRS
              </span>
              <span className="text-[9px] text-[#646C77]">10 REAL-TIME PAIRS</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {cryptoAssets.map(renderAssetCard)}
            </div>
          </div>

          {/* RIGHT SIDE: US30, GOLD & FOREX */}
          <div className="space-y-2 bg-[#0E1115] p-3 rounded-xl border border-[#242A31]">
            <div className="flex items-center justify-between border-b border-[#242A31] pb-1.5">
              <span className="text-[11px] font-semibold text-[#F1CC6B] uppercase tracking-wider flex items-center gap-1.5">
                <span>📊</span> RIGHT SIDE: US30, GOLD & FOREX
              </span>
              <span className="text-[9px] text-[#646C77]">5 MACRO ASSETS</span>
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


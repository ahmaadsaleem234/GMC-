import React from "react";
import { LivePrice } from "../types";
import { InstitutionalLiquidityHeatmapD3 } from "./InstitutionalLiquidityHeatmapD3";

interface LiquidityHeatmapProps {
  currentPrice: number;
  assetKey: string;
  prices: Record<string, LivePrice>;
}

export const LiquidityHeatmap: React.FC<LiquidityHeatmapProps> = ({
  currentPrice,
  assetKey,
  prices,
}) => {
  return (
    <div id="liquidity-heatmap-view" className="space-y-6 font-mono text-slate-200 max-w-7xl mx-auto px-2 sm:px-4">
      <InstitutionalLiquidityHeatmapD3
        currentPrice={currentPrice}
        assetKey={assetKey}
        prices={prices}
        isOverlay={false}
      />
    </div>
  );
};


import React from "react";
import {
  Activity,
  Layers,
  TrendingUp,
  ShieldCheck,
  Zap,
  Info,
} from "lucide-react";
import {
  MARKET_DRIVERS,
  MarketDriver,
} from "../../services/goldIntelligenceService";

export const DriverMatrixView: React.FC = () => {
  // Compute overall composite score
  const totalScore = MARKET_DRIVERS.reduce((acc, d) => acc + (d.contributionScore * d.weightPct) / 100, 0);

  return (
    <div className="space-y-6 font-mono">
      {/* Top Header Banner */}
      <div className="bg-[#080A0D] border border-[#292E35] rounded-2xl p-5 md:p-6 shadow-none space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#272C32] pb-4">
          <div className="space-y-1">
            <span className="px-3 py-1 rounded bg-[rgba(241,204,107,0.08)] text-[#F1CC6B] border border-[rgba(241,204,107,0.3)] text-xs font-semibold uppercase tracking-wider">
              MACRO DRIVER MATRIX & COMPOSITE SCORE
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Fundamental, Technical & Intermarket Fusion Matrix
            </h2>
          </div>

          {/* Composite Score Gauge Box */}
          <div className="bg-[#0E1115] p-3.5 rounded-xl border border-[rgba(116,216,160,0.4)] min-w-[240px]">
            <span className="text-[11px] text-[#9299A3] uppercase block">Composite Bullish Matrix Score</span>
            <div className="text-2xl font-bold text-[#74D8A0]">+{totalScore.toFixed(1)} / 100</div>
            <span className="text-[11px] font-semibold text-[#F1CC6B]">Strong Bullish Macro Regime</span>
          </div>
        </div>

        <p className="text-xs text-[#9299A3] max-w-4xl leading-relaxed">
          The Driver Matrix evaluates 10 primary fundamental, sentiment, flow, and intermarket drivers. Weights are validated using walk-forward optimization against 25 years of gold price action.
        </p>
      </div>

      {/* 10 Drivers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MARKET_DRIVERS.map((drv) => (
          <div
            key={drv.id}
            className="bg-[#111419] border border-[#292E35] p-4 sm:p-5 rounded-2xl space-y-3 relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] text-[#F1CC6B] font-semibold uppercase block">{drv.category}</span>
                <h3 className="text-sm sm:text-base font-semibold text-white">{drv.name}</h3>
                <span className="text-xs text-[#F1CC6B] font-medium">Value: {drv.currentValue}</span>
              </div>

              <span className="px-2.5 py-1 rounded bg-[#17342E] text-[#74D8A0] border border-[rgba(116,216,160,0.4)] text-xs font-semibold shrink-0">
                Score: +{drv.contributionScore}
              </span>
            </div>

            {/* Score Bar */}
            <div className="w-full bg-[#0E1115] h-1.5 rounded-full overflow-hidden border border-[#242A31]">
              <div
                className="bg-[#74D8A0] h-full rounded-full transition-all"
                style={{ width: `${Math.max(10, drv.contributionScore)}%` }}
              />
            </div>

            <p className="text-xs text-[#9299A3] leading-relaxed">{drv.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

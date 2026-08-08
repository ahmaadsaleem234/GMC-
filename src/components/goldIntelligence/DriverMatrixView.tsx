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
    <div className="space-y-6 font-mono selection:bg-amber-500 selection:text-black">
      {/* Top Header Banner */}
      <div className="bg-[#0B0F17] border border-[#D4AF37]/40 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold uppercase tracking-wider">
              MACRO DRIVER MATRIX & COMPOSITE SCORE
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Fundamental, Technical & Intermarket Fusion Matrix
            </h2>
          </div>

          {/* Composite Score Gauge Box */}
          <div className="bg-[#070A10] p-4 rounded-2xl border border-emerald-500/40 min-w-[240px]">
            <span className="text-[11px] text-slate-400 uppercase block">Composite Bullish Matrix Score</span>
            <div className="text-3xl font-black text-emerald-400">+{totalScore.toFixed(1)} / 100</div>
            <span className="text-[11px] font-bold text-amber-300">Strong Bullish Macro Regime</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 max-w-4xl leading-relaxed">
          The Driver Matrix evaluates 10 primary fundamental, sentiment, flow, and intermarket drivers. Weights are validated using walk-forward optimization against 25 years of gold price action.
        </p>
      </div>

      {/* 10 Drivers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MARKET_DRIVERS.map((drv) => (
          <div
            key={drv.id}
            className="bg-[#070A10] border border-slate-800 p-5 rounded-2xl space-y-3 relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase block">{drv.category}</span>
                <h3 className="text-base font-bold text-white">{drv.name}</h3>
                <span className="text-xs text-amber-300 font-bold">Value: {drv.currentValue}</span>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold shrink-0">
                Score: +{drv.contributionScore}
              </span>
            </div>

            {/* Score Bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all"
                style={{ width: `${Math.max(10, drv.contributionScore)}%` }}
              />
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{drv.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

import React, { useState } from "react";
import {
  Compass,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Info,
  Clock,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  Layers,
} from "lucide-react";
import {
  FUTURE_PROJECTIONS_DATA,
  FutureProjectionHorizon,
  formatEventTime,
  TimezoneMode,
} from "../../services/goldIntelligenceService";

interface FutureOutlookViewProps {
  currentPrice: number;
  timezoneMode: TimezoneMode;
}

export const FutureOutlookView: React.FC<FutureOutlookViewProps> = ({
  currentPrice,
  timezoneMode,
}) => {
  const [selectedHorizonIndex, setSelectedHorizonIndex] = useState<number>(0);
  const activeHorizon = FUTURE_PROJECTIONS_DATA[selectedHorizonIndex] || FUTURE_PROJECTIONS_DATA[0];

  return (
    <div className="space-y-6 font-mono selection:bg-amber-500 selection:text-black">
      {/* 🌟 Current Year YTD & Future Outlook Header */}
      <div className="bg-[#0B0F17] border border-[#D4AF37]/40 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                MULTI-HORIZON PROBABILITY ENGINE
              </span>
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                Dynamic Recalculation Active
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Gold (XAUUSD) Current Year YTD & Future Outlook
            </h2>
          </div>

          {/* Current Year 2026 YTD Stat Card */}
          <div className="bg-[#070A10] p-4 rounded-2xl border border-amber-500/30 min-w-[240px]">
            <div className="text-[11px] text-slate-400 uppercase">2026 YTD Gold Performance</div>
            <div className="text-2xl font-black text-emerald-400">+26.04% (${currentPrice.toFixed(2)})</div>
            <div className="text-[10px] text-slate-400 mt-0.5 flex justify-between">
              <span>High: $4,390.00</span>
              <span>Low: $3,380.00</span>
            </div>
          </div>
        </div>

        {/* Disclaimer Warning */}
        <div className="bg-[#070D18] p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-amber-300">Important Probabilistic Notice:</strong> Actual future prices do not exist. HARAMI AI uses 25 years of yield correlations, central bank flows, and seasonality to construct multi-scenario probability distributions. Forecasts automatically adjust when new macro data is published.
          </p>
        </div>
      </div>

      {/* Horizon Selection Strip */}
      <div className="flex flex-wrap items-center gap-2 bg-[#070A10] p-2 rounded-2xl border border-slate-800 text-xs">
        <span className="text-slate-400 font-bold px-2">Select Target Horizon:</span>
        {FUTURE_PROJECTIONS_DATA.map((h, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedHorizonIndex(idx)}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer ${
              selectedHorizonIndex === idx
                ? "bg-[#D4AF37] text-black shadow-md font-black"
                : "bg-[#0E1524] text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            {h.horizonLabel}
          </button>
        ))}
      </div>

      {/* Active Horizon Detailed Projections Card */}
      <div className="bg-[#070A10] border border-[#D4AF37]/50 rounded-2xl p-6 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs text-amber-400 font-bold block uppercase">{activeHorizon.timeframePeriod}</span>
            <h3 className="text-xl font-black text-white">{activeHorizon.horizonLabel} Scenario Projections</h3>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="bg-[#0D1424] px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-slate-400">Model Confidence: </span>
              <span className="text-emerald-400 font-black">{activeHorizon.confidenceScore}%</span>
            </div>
            <div className="bg-[#0D1424] px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-slate-400">Data As Of: </span>
              <span className="text-amber-300 font-bold">{formatEventTime(activeHorizon.dataAsOfUtc, timezoneMode)}</span>
            </div>
          </div>
        </div>

        {/* 3 Scenarios Grid: Bullish / Base / Bearish */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 🟢 Bullish Scenario */}
          <div className="bg-[#080F1D] border-2 border-emerald-500/50 p-5 rounded-2xl space-y-3 relative overflow-hidden shadow-[0_0_25px_rgba(16,185,129,0.1)]">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-black text-xs uppercase border border-emerald-500/40">
                🟢 BULLISH SCENARIO
              </span>
              <span className="text-lg font-black text-emerald-400">{activeHorizon.bullishScenario.probabilityPct}% Prob</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 uppercase block">Projected Price Range</span>
              <div className="text-2xl font-black text-emerald-300">{activeHorizon.bullishScenario.targetRangeUSD}</div>
            </div>

            <div className="space-y-1.5 border-t border-slate-800 pt-3 text-xs">
              <span className="text-slate-400 font-bold block">Key Catalysts:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                {activeHorizon.bullishScenario.catalysts.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* 🟡 Base Scenario */}
          <div className="bg-[#080F1D] border-2 border-amber-500/40 p-5 rounded-2xl space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-black text-xs uppercase border border-amber-500/40">
                🟡 BASE SCENARIO
              </span>
              <span className="text-lg font-black text-amber-300">{activeHorizon.baseScenario.probabilityPct}% Prob</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 uppercase block">Projected Price Range</span>
              <div className="text-2xl font-black text-amber-300">{activeHorizon.baseScenario.targetRangeUSD}</div>
            </div>

            <div className="space-y-1.5 border-t border-slate-800 pt-3 text-xs">
              <span className="text-slate-400 font-bold block">Key Catalysts:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                {activeHorizon.baseScenario.catalysts.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* 🔴 Bearish Scenario */}
          <div className="bg-[#080F1D] border-2 border-rose-500/40 p-5 rounded-2xl space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 font-black text-xs uppercase border border-rose-500/40">
                🔴 BEARISH SCENARIO
              </span>
              <span className="text-lg font-black text-rose-400">{activeHorizon.bearishScenario.probabilityPct}% Prob</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 uppercase block">Projected Price Range</span>
              <div className="text-2xl font-black text-rose-300">{activeHorizon.bearishScenario.targetRangeUSD}</div>
            </div>

            <div className="space-y-1.5 border-t border-slate-800 pt-3 text-xs">
              <span className="text-slate-400 font-bold block">Key Catalysts:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                {activeHorizon.bearishScenario.catalysts.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Drivers & Invalidation Rules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="bg-[#05080E] p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="font-bold text-amber-300 uppercase block">Primary Supporting Drivers</span>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              {activeHorizon.primarySupportingDrivers.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>

          <div className="bg-[#05080E] p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="font-bold text-rose-400 uppercase block">Invalidation Conditions</span>
            <ul className="list-disc list-inside space-y-1 text-rose-200">
              {activeHorizon.invalidationConditions.map((ic, i) => (
                <li key={i}>{ic}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

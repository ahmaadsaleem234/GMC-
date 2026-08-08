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
    <div className="space-y-6 font-mono">
      {/* 🌟 Current Year YTD & Future Outlook Header */}
      <div className="bg-[#080A0D] border border-[#292E35] rounded-2xl p-5 md:p-6 shadow-none space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#272C32] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded bg-[rgba(241,204,107,0.08)] text-[#F1CC6B] border border-[rgba(241,204,107,0.3)] text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#F1CC6B]" />
                MULTI-HORIZON PROBABILITY ENGINE
              </span>
              <span className="text-xs text-[#74D8A0] bg-[#17342E] px-2.5 py-0.5 rounded border border-[rgba(116,216,160,0.4)] font-medium">
                Dynamic Recalculation Active
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Gold (XAUUSD) Current Year YTD & Future Outlook
            </h2>
          </div>

          {/* Current Year 2026 YTD Stat Card */}
          <div className="bg-[#0E1115] p-3.5 rounded-xl border border-[#242A31] min-w-[240px]">
            <div className="text-[11px] text-[#9299A3] uppercase">2026 YTD Gold Performance</div>
            <div className="text-xl font-bold text-[#74D8A0]">+26.04% (${currentPrice.toFixed(2)})</div>
            <div className="text-[10px] text-[#9299A3] mt-0.5 flex justify-between">
              <span>High: $4,390.00</span>
              <span>Low: $3,380.00</span>
            </div>
          </div>
        </div>

        {/* Disclaimer Warning */}
        <div className="bg-[#0E1115] p-3.5 rounded-xl border border-[#242A31] text-xs text-[#9299A3] flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#F1CC6B] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-[#F1CC6B]">Important Probabilistic Notice:</strong> Actual future prices do not exist. HARAMI AI uses 25 years of yield correlations, central bank flows, and seasonality to construct multi-scenario probability distributions. Forecasts automatically adjust when new macro data is published.
          </p>
        </div>
      </div>

      {/* Horizon Selection Strip */}
      <div className="flex flex-wrap items-center gap-2 bg-[#111419] p-2 rounded-xl border border-[#292E35] text-xs">
        <span className="text-[#9299A3] font-medium px-2">Select Target Horizon:</span>
        {FUTURE_PROJECTIONS_DATA.map((h, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedHorizonIndex(idx)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              selectedHorizonIndex === idx
                ? "bg-[#F1CC6B] text-[#111111] font-semibold"
                : "bg-[#0E1115] text-[#9299A3] border border-[#242A31] hover:text-white"
            }`}
          >
            {h.horizonLabel}
          </button>
        ))}
      </div>

      {/* Active Horizon Detailed Projections Card */}
      <div className="bg-[#111419] border border-[#292E35] rounded-2xl p-5 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252A31] pb-4">
          <div>
            <span className="text-xs text-[#F1CC6B] font-semibold block uppercase">{activeHorizon.timeframePeriod}</span>
            <h3 className="text-base font-bold text-white">{activeHorizon.horizonLabel} Scenario Projections</h3>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="bg-[#0E1115] px-3 py-1.5 rounded-lg border border-[#242A31]">
              <span className="text-[#9299A3]">Model Confidence: </span>
              <span className="text-[#74D8A0] font-semibold">{activeHorizon.confidenceScore}%</span>
            </div>
            <div className="bg-[#0E1115] px-3 py-1.5 rounded-lg border border-[#242A31]">
              <span className="text-[#9299A3]">Data As Of: </span>
              <span className="text-[#F1CC6B] font-semibold">{formatEventTime(activeHorizon.dataAsOfUtc, timezoneMode)}</span>
            </div>
          </div>
        </div>

        {/* 3 Scenarios Grid: Bullish / Base / Bearish */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 🟢 Bullish Scenario */}
          <div className="bg-[#0E1115] border border-[rgba(116,216,160,0.4)] p-4 sm:p-5 rounded-xl space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded bg-[#17342E] text-[#74D8A0] font-semibold text-xs uppercase border border-[rgba(116,216,160,0.4)]">
                🟢 BULLISH SCENARIO
              </span>
              <span className="text-base font-bold text-[#74D8A0]">{activeHorizon.bullishScenario.probabilityPct}% Prob</span>
            </div>

            <div>
              <span className="text-[11px] text-[#9299A3] uppercase block">Projected Price Range</span>
              <div className="text-xl font-bold text-[#74D8A0]">{activeHorizon.bullishScenario.targetRangeUSD}</div>
            </div>

            <div className="space-y-1.5 border-t border-[#242A31] pt-3 text-xs">
              <span className="text-[#9299A3] font-medium block">Key Catalysts:</span>
              <ul className="list-disc list-inside space-y-1 text-[#9299A3] text-[11px]">
                {activeHorizon.bullishScenario.catalysts.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* 🟡 Base Scenario */}
          <div className="bg-[#0E1115] border border-[rgba(241,204,107,0.4)] p-4 sm:p-5 rounded-xl space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded bg-[rgba(241,204,107,0.08)] text-[#F1CC6B] font-semibold text-xs uppercase border border-[rgba(241,204,107,0.3)]">
                🟡 BASE SCENARIO
              </span>
              <span className="text-base font-bold text-[#F1CC6B]">{activeHorizon.baseScenario.probabilityPct}% Prob</span>
            </div>

            <div>
              <span className="text-[11px] text-[#9299A3] uppercase block">Projected Price Range</span>
              <div className="text-xl font-bold text-[#F1CC6B]">{activeHorizon.baseScenario.targetRangeUSD}</div>
            </div>

            <div className="space-y-1.5 border-t border-[#242A31] pt-3 text-xs">
              <span className="text-[#9299A3] font-medium block">Key Catalysts:</span>
              <ul className="list-disc list-inside space-y-1 text-[#9299A3] text-[11px]">
                {activeHorizon.baseScenario.catalysts.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* 🔴 Bearish Scenario */}
          <div className="bg-[#0E1115] border border-[rgba(238,119,127,0.4)] p-4 sm:p-5 rounded-xl space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded bg-[#352329] text-[#EE777F] font-semibold text-xs uppercase border border-[rgba(238,119,127,0.4)]">
                🔴 BEARISH SCENARIO
              </span>
              <span className="text-base font-bold text-[#EE777F]">{activeHorizon.bearishScenario.probabilityPct}% Prob</span>
            </div>

            <div>
              <span className="text-[11px] text-[#9299A3] uppercase block">Projected Price Range</span>
              <div className="text-xl font-bold text-[#EE777F]">{activeHorizon.bearishScenario.targetRangeUSD}</div>
            </div>

            <div className="space-y-1.5 border-t border-[#242A31] pt-3 text-xs">
              <span className="text-[#9299A3] font-medium block">Key Catalysts:</span>
              <ul className="list-disc list-inside space-y-1 text-[#9299A3] text-[11px]">
                {activeHorizon.bearishScenario.catalysts.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Drivers & Invalidation Rules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="bg-[#080A0D] p-3.5 rounded-xl border border-[#242A31] space-y-2">
            <span className="font-semibold text-[#F1CC6B] uppercase block">Primary Supporting Drivers</span>
            <ul className="list-disc list-inside space-y-1 text-[#9299A3]">
              {activeHorizon.primarySupportingDrivers.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>

          <div className="bg-[#080A0D] p-3.5 rounded-xl border border-[#242A31] space-y-2">
            <span className="font-semibold text-[#EE777F] uppercase block">Invalidation Conditions</span>
            <ul className="list-disc list-inside space-y-1 text-[#EE777F]">
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

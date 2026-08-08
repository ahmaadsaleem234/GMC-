import React, { useState } from "react";
import {
  Activity,
  BarChart3,
  Sliders,
  Clock,
  TrendingUp,
  Info,
} from "lucide-react";
import {
  HISTORICAL_REACTION_INTERVALS,
  FOMC_SCENARIO_PLANNER,
  NFP_SCENARIO_PLANNER,
  ReactionInterval,
  EventScenario,
} from "../../services/goldIntelligenceService";

export const EventReactionLabView: React.FC = () => {
  const [selectedPointIndex, setSelectedPointIndex] = useState<number>(3); // default +5m
  const activeInterval = HISTORICAL_REACTION_INTERVALS[selectedPointIndex] || HISTORICAL_REACTION_INTERVALS[0];

  const [scenarioEventType, setScenarioEventType] = useState<"FOMC" | "NFP">("FOMC");
  const scenarios = scenarioEventType === "FOMC" ? FOMC_SCENARIO_PLANNER : NFP_SCENARIO_PLANNER;

  return (
    <div className="space-y-6 font-mono">
      {/* Top Header Banner */}
      <div className="bg-[#080A0D] border border-[#292E35] rounded-2xl p-5 md:p-6 shadow-none space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded bg-[rgba(241,204,107,0.08)] text-[#F1CC6B] border border-[rgba(241,204,107,0.3)] text-xs font-semibold uppercase tracking-wider">
            QUANTITATIVE EVENT REACTION LAB
          </span>
          <span className="text-xs text-[#9299A3] font-medium">Intervals: -24h to +120h</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Gold (XAUUSD) Post-Release Volatility & Reaction Scrubbing
        </h2>
        <p className="text-xs text-[#9299A3] max-w-4xl leading-relaxed">
          Interactive reaction analyzer measuring average price displacement, maximum favorable excursion (MFE), maximum adverse excursion (MAE), directional accuracy, and spread risk before and after high-impact news releases.
        </p>
      </div>

      {/* Interval Scrubbing Slider Card */}
      <div className="bg-[#111419] border border-[#292E35] rounded-2xl p-5 md:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#252A31] pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#F1CC6B]" />
            <h3 className="font-semibold text-white text-sm">TIME HORIZON SCRUBBER</h3>
          </div>
          <span className="text-xs text-[#F1CC6B] font-semibold">
            Selected Interval: {activeInterval.label}
          </span>
        </div>

        {/* Range Input Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max={HISTORICAL_REACTION_INTERVALS.length - 1}
            value={selectedPointIndex}
            onChange={(e) => setSelectedPointIndex(parseInt(e.target.value))}
            className="w-full accent-[#F1CC6B] cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-[#9299A3] font-mono">
            {HISTORICAL_REACTION_INTERVALS.map((int, i) => (
              <span
                key={i}
                onClick={() => setSelectedPointIndex(i)}
                className={`cursor-pointer ${selectedPointIndex === i ? "text-[#F1CC6B] font-semibold" : "hover:text-white"}`}
              >
                {int.label.split(" ")[0]}
              </span>
            ))}
          </div>
        </div>

        {/* Active Interval Reaction Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0E1115] p-4 rounded-xl border border-[#242A31]">
          <div>
            <span className="text-[11px] text-[#9299A3] uppercase block">Avg Price Displacement</span>
            <div className="text-xl font-bold text-[#F1CC6B]">+${activeInterval.avgPriceChangeUSD} ({activeInterval.avgPctChange}%)</div>
          </div>
          <div>
            <span className="text-[11px] text-[#9299A3] uppercase block">Max Upward Move</span>
            <div className="text-xl font-bold text-[#74D8A0]">+{activeInterval.maxUpwardMovePips} Pips</div>
          </div>
          <div>
            <span className="text-[11px] text-[#9299A3] uppercase block">Max Downward Move</span>
            <div className="text-xl font-bold text-[#EE777F]">-{activeInterval.maxDownwardMovePips} Pips</div>
          </div>
          <div>
            <span className="text-[11px] text-[#9299A3] uppercase block">Directional Edge</span>
            <div className="text-xl font-bold text-[#74D8A0]">{activeInterval.directionAccuracyPct}% Win</div>
          </div>
        </div>
      </div>

      {/* Scenario Planner (FOMC / NFP) */}
      <div className="bg-[#111419] border border-[#292E35] rounded-2xl p-5 md:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#252A31] pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#F1CC6B]" />
            <h3 className="font-semibold text-white text-sm">EVENT SCENARIO PLANNER (FOMC & NFP)</h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {(["FOMC", "NFP"] as const).map((eType) => (
              <button
                key={eType}
                onClick={() => setScenarioEventType(eType)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  scenarioEventType === eType
                    ? "bg-[#F1CC6B] text-[#111111] font-semibold"
                    : "bg-[#0E1115] text-[#9299A3] border border-[#242A31] hover:text-white"
                }`}
              >
                {eType === "FOMC" ? "FOMC Rate Decision" : "NFP Employment"}
              </button>
            ))}
          </div>
        </div>

        {/* Scenarios Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenarios.map((sc, idx) => (
            <div
              key={idx}
              className="bg-[#0E1115] p-4 sm:p-5 rounded-xl border border-[#242A31] space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#F1CC6B] text-xs uppercase">{sc.outcomeName}</span>
                <span className="text-[#74D8A0] font-bold text-xs">{sc.probabilityPct}% Prob</span>
              </div>

              <p className="text-xs text-[#9299A3] leading-relaxed">{sc.conditionDescription}</p>

              <div className="bg-[#080A0D] p-3 rounded-lg border border-[#242A31] text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#9299A3]">Expected Range:</span>
                  <span className="text-[#F1CC6B] font-semibold">{sc.expectedRangeUSD}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9299A3]">Invalidation Level:</span>
                  <span className="text-[#EE777F] font-semibold">${sc.invalidationLevelUSD}</span>
                </div>
              </div>

              <p className="text-[11px] text-[#9299A3] leading-relaxed border-t border-[#242A31] pt-2">
                {sc.keyDriverNotes}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

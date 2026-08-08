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
    <div className="space-y-6 font-mono selection:bg-amber-500 selection:text-black">
      {/* Top Header Banner */}
      <div className="bg-[#0B0F17] border border-[#D4AF37]/40 rounded-3xl p-6 shadow-2xl space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold uppercase tracking-wider">
            QUANTITATIVE EVENT REACTION LAB
          </span>
          <span className="text-xs text-slate-400 font-bold">Intervals: -24h to +120h</span>
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          Gold (XAUUSD) Post-Release Volatility & Reaction Scrubbing
        </h2>
        <p className="text-xs text-slate-300 max-w-4xl leading-relaxed">
          Interactive reaction analyzer measuring average price displacement, maximum favorable excursion (MFE), maximum adverse excursion (MAE), directional accuracy, and spread risk before and after high-impact news releases.
        </p>
      </div>

      {/* Interval Scrubbing Slider Card */}
      <div className="bg-[#070A10] border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-base">TIME HORIZON SCRUBBER</h3>
          </div>
          <span className="text-xs text-amber-300 font-bold">
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
            className="w-full accent-[#D4AF37] cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            {HISTORICAL_REACTION_INTERVALS.map((int, i) => (
              <span
                key={i}
                onClick={() => setSelectedPointIndex(i)}
                className={`cursor-pointer ${selectedPointIndex === i ? "text-amber-300 font-bold" : "hover:text-slate-200"}`}
              >
                {int.label.split(" ")[0]}
              </span>
            ))}
          </div>
        </div>

        {/* Active Interval Reaction Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#0A0F1D] p-5 rounded-xl border border-slate-800">
          <div>
            <span className="text-[11px] text-slate-400 uppercase block">Avg Price Displacement</span>
            <div className="text-2xl font-black text-amber-300">+${activeInterval.avgPriceChangeUSD} ({activeInterval.avgPctChange}%)</div>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase block">Max Upward Move</span>
            <div className="text-2xl font-black text-emerald-400">+{activeInterval.maxUpwardMovePips} Pips</div>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase block">Max Downward Move</span>
            <div className="text-2xl font-black text-rose-400">-{activeInterval.maxDownwardMovePips} Pips</div>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase block">Directional Edge</span>
            <div className="text-2xl font-black text-emerald-300">{activeInterval.directionAccuracyPct}% Win</div>
          </div>
        </div>
      </div>

      {/* Scenario Planner (FOMC / NFP) */}
      <div className="bg-[#070A10] border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-base">EVENT SCENARIO PLANNER (FOMC & NFP)</h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {(["FOMC", "NFP"] as const).map((eType) => (
              <button
                key={eType}
                onClick={() => setScenarioEventType(eType)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  scenarioEventType === eType
                    ? "bg-[#D4AF37] text-black shadow-md font-black"
                    : "bg-[#101726] text-slate-400 hover:text-white"
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
              className="bg-[#090E1A] p-5 rounded-xl border border-slate-800 space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 text-xs uppercase">{sc.outcomeName}</span>
                <span className="text-emerald-400 font-black text-sm">{sc.probabilityPct}% Prob</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{sc.conditionDescription}</p>

              <div className="bg-[#05080E] p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Expected Range:</span>
                  <span className="text-amber-300 font-bold">{sc.expectedRangeUSD}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Invalidation Level:</span>
                  <span className="text-rose-400 font-bold">${sc.invalidationLevelUSD}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/80 pt-2">
                {sc.keyDriverNotes}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

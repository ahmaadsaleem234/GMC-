import React from "react";
import {
  Radar,
  Crosshair,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Award,
  Zap,
  BarChart3,
  Sliders,
} from "lucide-react";
import { ScoreBreakdown } from "../../services/gbpusdSniperEngine";

interface GbpusdOpportunityRadarProps {
  scoreBreakdown: ScoreBreakdown;
  grade: "A+" | "WATCH" | "WATCHLIST" | "REJECT";
  dailyLockActive: boolean;
  spreadPips: number;
}

export const GbpusdOpportunityRadar: React.FC<GbpusdOpportunityRadarProps> = ({
  scoreBreakdown,
  grade,
  dailyLockActive,
  spreadPips,
}) => {
  const isAplus = grade === "A+";
  const total = scoreBreakdown.totalScore;

  const scoreItems = [
    { label: "Market Regime", score: scoreBreakdown.marketRegime, max: 15 },
    { label: "Multi-Timeframe Structure", score: scoreBreakdown.structure, max: 15 },
    { label: "Precision Entry Location", score: scoreBreakdown.entryLocation, max: 15 },
    { label: "Derived Liquidity Sweeps", score: scoreBreakdown.derivedLiquidity, max: 10 },
    { label: "Velocity Vectors", score: scoreBreakdown.velocityVectors, max: 10 },
    { label: "Historical Analogues", score: scoreBreakdown.historicalAnalogues, max: 10 },
    { label: "ATR Expansion", score: scoreBreakdown.atrExpansion, max: 8 },
    { label: "Risk-to-Reward Geometry", score: scoreBreakdown.riskReward, max: 7 },
    { label: "Trap Risk Inversion", score: scoreBreakdown.trapRisk, max: 5 },
    { label: "Spread Integrity", score: scoreBreakdown.spreadIntegrity, max: 5 },
  ];

  return (
    <div className="w-full rounded-2xl bg-[#080d17]/90 border border-slate-800 p-4.5 shadow-lg flex flex-col gap-4">
      {/* Header with Total Score & Grade Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Radar className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-sm font-black text-white tracking-wider">
              A+ SNIPER 100-POINT SCORING MATRIX
            </h3>
            <p className="text-[10px] text-slate-400">10-Point Deterministic Quantitative Evaluation</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Total Score Badge */}
          <div className="flex items-baseline gap-1 px-3 py-1 rounded-xl bg-slate-900 border border-slate-700">
            <span className="text-[10px] text-slate-400 font-mono">SCORE:</span>
            <span
              className={`text-lg font-black font-mono ${
                total >= 90
                  ? "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                  : total >= 85
                  ? "text-amber-400"
                  : "text-slate-300"
              }`}
            >
              {total}
            </span>
            <span className="text-xs text-slate-500 font-mono">/100</span>
          </div>

          {/* Grade Badge */}
          <div
            className={`px-3 py-1 rounded-xl font-black text-xs uppercase flex items-center gap-1.5 border shadow-md ${
              isAplus
                ? "bg-emerald-950/70 border-emerald-500/60 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                : grade === "WATCH"
                ? "bg-amber-950/70 border-amber-500/60 text-amber-300"
                : "bg-slate-900 border-slate-700 text-slate-400"
            }`}
          >
            {isAplus ? <Award className="w-4 h-4 text-emerald-400" /> : <Crosshair className="w-4 h-4" />}
            <span>GRADE {grade}</span>
          </div>
        </div>
      </div>

      {/* 10-Point Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
        {scoreItems.map((item, idx) => {
          const pct = Math.round((item.score / item.max) * 100);
          return (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-[11px] font-sans truncate">{item.label}</span>
                <span className="font-bold text-white">
                  {item.score} <span className="text-slate-500 text-[10px]">/ {item.max}</span>
                </span>
              </div>
              {/* Progress track */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    pct >= 90
                      ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]"
                      : pct >= 75
                      ? "bg-cyan-400"
                      : "bg-amber-400"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Gatekeeper Criteria Rule Footer */}
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span>
            A+ Sniper Gatekeeper: <b>≥90 Score</b> • <b>Spread ≤1.8p</b> • <b>No News Risk</b> •{" "}
            <b>1 Trade/Day Lock</b>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Current Spread:</span>
          <b className="text-amber-300 font-mono">{spreadPips.toFixed(1)} pips</b>
        </div>
      </div>
    </div>
  );
};

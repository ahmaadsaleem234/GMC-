import React from "react";
import {
  Brain,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Crosshair,
  TrendingDown,
  Activity,
  ShieldCheck,
  ShieldAlert,
  ArrowDownRight,
  Target,
  Sparkles,
  Layers,
  Search,
  Scale,
  Percent,
} from "lucide-react";
import { KhatarnakJugaadSetup } from "../../services/khatarnakJugaadEngine";
import {
  BrainEvaluationOutput,
  HardSafetyAudit,
  PatternSimilarityResult,
} from "../../services/khatarnakBrainEngine";

interface KhatarnakBrainTabProps {
  setup: KhatarnakJugaadSetup | null;
  brainOutput: BrainEvaluationOutput;
  currentPrice: number;
  assetKey: string;
  onExecuteTrade?: (tradeData: any) => void;
}

export const KhatarnakBrainTab: React.FC<KhatarnakBrainTabProps> = ({
  setup,
  brainOutput,
  currentPrice,
  assetKey,
  onExecuteTrade,
}) => {
  const {
    decision,
    decisionLabel,
    decisionColor,
    aiConfidence,
    confidenceNote,
    reasons,
    safetyAudit,
    similarityResult,
    activeVersion,
    pipelineStages,
  } = brainOutput;

  return (
    <div className="space-y-6" id="kj-brain-decision-tab">
      {/* 1. TOP HERO: DECISION HEADER & AI CONFIDENCE */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Brain className="w-48 h-48 text-red-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 items-center">
          {/* Decision Box */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5" />
                AI SETUP BRAIN • {activeVersion.version}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                {assetKey} • 1M STRICT
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                  safetyAudit.passed
                    ? "bg-emerald-950/50 text-emerald-300 border-emerald-700/50"
                    : "bg-rose-950/50 text-rose-300 border-rose-700/50"
                }`}
              >
                {safetyAudit.passed ? "🛡️ Hard Safety: CLEAR" : "🚨 Hard Safety: BLOCKED"}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-zinc-400">Algorithmic Confluence Decision:</div>
              <div
                className={`text-xl sm:text-2xl font-black tracking-tight px-4 py-3 rounded-xl border flex items-center gap-3 ${decisionColor}`}
              >
                {decision === "TRADE" ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0 animate-bounce" />
                ) : decision === "WAIT" ? (
                  <AlertTriangle className="w-7 h-7 text-amber-400 shrink-0" />
                ) : (
                  <XCircle className="w-7 h-7 text-rose-400 shrink-0" />
                )}
                <span>{decisionLabel}</span>
              </div>
            </div>

            {/* Decision Reasons list */}
            <div className="space-y-1 pt-1">
              {reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                  <span className="text-red-400 font-bold mt-0.5">•</span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Confidence & Quality Score Gauge */}
          <div className="lg:col-span-4 bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>AI Confidence Metric</span>
              </div>
              <span className="text-xs font-mono text-zinc-400">Calibrated</span>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-3xl sm:text-4xl font-black text-white font-mono">
                {aiConfidence}%
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-zinc-300">
                  Quality Score:{" "}
                  <span className="text-red-400 font-mono text-sm">{setup?.score || 0}/100</span>
                </div>
                <div className="text-[10px] text-zinc-400">100-pt Institutional Matrix</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  aiConfidence >= 85
                    ? "bg-gradient-to-r from-amber-500 to-emerald-500"
                    : aiConfidence >= 70
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
                style={{ width: `${aiConfidence}%` }}
              />
            </div>

            <p className="text-[10px] text-zinc-400 leading-relaxed italic border-t border-zinc-800/80 pt-2">
              {confidenceNote}
            </p>
          </div>
        </div>
      </div>

      {/* 2. AUTO MARKET SCANNER & AUTO CALCULATOR STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Auto Market Scanner */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">1. Auto Market Scanner</h2>
                <p className="text-[11px] text-zinc-400">Real-time 1M Candlestick Structure Detector</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SCANNING 1M LIVE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">Sell LQ (Top)</span>
              <div className="text-base font-black text-red-400 font-mono">
                {setup?.topHigh ? setup.topHigh.toFixed(2) : "Detecting..."}
              </div>
              <div className="text-[10px] text-zinc-400">
                Status:{" "}
                <span className={setup?.sellLqStatus === "SWEPT" ? "text-emerald-400 font-bold" : "text-zinc-400"}>
                  {setup?.sellLqStatus || "SEARCHING"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">Displacement Low (Botam)</span>
              <div className="text-base font-black text-cyan-400 font-mono">
                {setup?.botamLow ? setup.botamLow.toFixed(2) : "Detecting..."}
              </div>
              <div className="text-[10px] text-zinc-400">Target Low Liquidity</div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">1M Impulse Range</span>
              <div className="text-base font-black text-amber-400 font-mono">
                {setup?.impulseRange ? `${setup.impulseRange.toFixed(2)} pts` : "0.00"}
              </div>
              <div className="text-[10px] text-zinc-400">Top − Botam Displacement</div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-1">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">Market Regime</span>
              <div className="text-sm font-bold text-white uppercase">
                {setup?.marketRegimeLabel || "Analyzing..."}
              </div>
              <div className="text-[10px] text-zinc-400">Volatility & Direction</div>
            </div>
          </div>
        </div>

        {/* Auto Calculator */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">2. Auto Dynamic Calculator</h2>
                <p className="text-[11px] text-zinc-400">Zero manual math required — calculated in real-time</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              FORMULA: RANGE ÷ 2.6
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80">
              <span className="text-[10px] text-zinc-400 block font-semibold">2.6 Delta</span>
              <span className="text-sm font-black text-cyan-400 font-mono">
                {setup?.delta26 ? `${setup.delta26.toFixed(2)} pts` : "0.00"}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80">
              <span className="text-[10px] text-zinc-400 block font-semibold">2.6 Golden Level</span>
              <span className="text-sm font-black text-amber-400 font-mono">
                {setup?.level26 ? setup.level26.toFixed(2) : "0.00"}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80">
              <span className="text-[10px] text-zinc-400 block font-semibold">Golden Zone (0.62-0.81)</span>
              <span className="text-xs font-bold text-zinc-200 font-mono">
                {setup?.goldenZone62 && setup?.goldenZone81
                  ? `${setup.goldenZone62.toFixed(1)} - ${setup.goldenZone81.toFixed(1)}`
                  : "0.00"}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80">
              <span className="text-[10px] text-zinc-400 block font-semibold">Best 2.6 Entry</span>
              <span className="text-sm font-black text-red-400 font-mono">
                {setup?.bestSellEntry ? setup.bestSellEntry.toFixed(2) : "0.00"}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80">
              <span className="text-[10px] text-zinc-400 block font-semibold">Dynamic SL (Top+Buffer)</span>
              <span className="text-sm font-black text-rose-400 font-mono">
                {setup?.stopLoss ? setup.stopLoss.toFixed(2) : "0.00"}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80">
              <span className="text-[10px] text-zinc-400 block font-semibold">Recommended Lot Size</span>
              <span className="text-sm font-black text-emerald-400 font-mono">
                {setup?.riskManagement.recommendedLotSize || 0.01} Lots
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. AI SETUP MEMORY & PATTERN SIMILARITY MATCHER */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>3. AI Setup Memory & Pattern Similarity Matcher</span>
                <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  HISTORICAL VECTOR COMPARISON
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Compares current 1M geometry against stored historical setup pattern library
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Similarity Match:</span>
            <span className="px-2.5 py-1 rounded-lg bg-purple-950/80 border border-purple-700/60 font-mono text-xs font-black text-purple-300">
              {similarityResult.similarityScore}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-0.5">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold">Matched Historical Setups</span>
            <div className="text-xl font-black text-white font-mono">{similarityResult.matchedCount}</div>
            <div className="text-[10px] text-zinc-400">In Pattern Library</div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-0.5">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold">Historical Win Rate</span>
            <div className="text-xl font-black text-emerald-400 font-mono">
              {similarityResult.historicalWinRate}%
            </div>
            <div className="text-[10px] text-zinc-400">
              {similarityResult.winCount} Wins / {similarityResult.lossCount} Losses
            </div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-0.5">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold">Avg MFE (Max Favorable)</span>
            <div className="text-xl font-black text-cyan-400 font-mono">
              +{similarityResult.averageMfe} pts
            </div>
            <div className="text-[10px] text-zinc-400">Peak profit excursion</div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-0.5">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold">Avg MAE (Adverse Drawdown)</span>
            <div className="text-xl font-black text-rose-400 font-mono">
              -{similarityResult.averageMae} pts
            </div>
            <div className="text-[10px] text-zinc-400">Entry heat before drop</div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              <strong>Memory Verdict:</strong> {similarityResult.verdict}
            </span>
          </div>
          {similarityResult.topSimilarIds.length > 0 && (
            <div className="text-[10px] font-mono text-zinc-400 hidden sm:block">
              Top Matches: {similarityResult.topSimilarIds.slice(0, 3).join(", ")}
            </div>
          )}
        </div>
      </div>

      {/* 4. 11-STAGE AI PIPELINE EVALUATION MATRIX */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-red-400" />
              <span>4. AI Setup Confluence Pipeline Matrix</span>
            </h2>
            <p className="text-[11px] text-zinc-400">
              Liquidity → Sweep → Impulse → 2.6 → Golden Zone → Retracement → CHOCH → Rejection → Momentum → Volume → R:R
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {pipelineStages.filter((s) => s.passed).length} / {pipelineStages.length} Passed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {pipelineStages.map((stage, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border text-xs space-y-1.5 transition-all ${
                stage.passed
                  ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-200"
                  : "bg-zinc-950 border-zinc-800 text-zinc-400"
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className={stage.passed ? "text-emerald-300" : "text-zinc-300"}>{stage.name}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    stage.passed
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {stage.score}/{stage.maxScore} pts
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-tight">{stage.description}</p>
              <div className="flex items-center gap-1 text-[10px] font-semibold pt-1">
                {stage.passed ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Criteria Satisfied
                  </span>
                ) : (
                  <span className="text-zinc-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-500" /> Pending Confirmation
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

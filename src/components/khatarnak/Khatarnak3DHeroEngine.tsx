import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  Zap,
  TrendingDown,
  TrendingUp,
  Activity,
  ShieldCheck,
  AlertTriangle,
  Send,
  CheckCircle2,
  Lock,
  Target,
  Clock,
  Flame,
  BarChart2,
  DollarSign,
  Layers,
  Compass,
  ArrowDownRight,
  Info,
  Radio,
  Play,
} from "lucide-react";
import { Candle, LivePrice } from "../../types";
import {
  DynamicMarketLevel,
  AiReactionZone,
  MarketRegime,
  extractDynamicLevels,
  calculateKhatarnakConfluenceScore,
  KhatarnakConfluenceScoreBreakdown,
  AiGeneratedTradeSignal,
} from "../../services/khatarnak3dMarketEngine";
import { KhatarnakJugaadSetup } from "../../services/khatarnakJugaadEngine";
import { Khatarnak3DMarketRadar } from "./Khatarnak3DMarketRadar";
import { playAlertChime } from "../../utils/audioAlert";

interface Khatarnak3DHeroEngineProps {
  currentPrice: number;
  assetKey?: string;
  candles1m: Candle[];
  setup1m: KhatarnakJugaadSetup | null;
  onExecuteTrade?: (tradeData: any) => void;
  onBroadcastTelegram?: (setup: any) => void;
}

export const Khatarnak3DHeroEngine: React.FC<Khatarnak3DHeroEngineProps> = ({
  currentPrice,
  assetKey = "XAUUSD",
  candles1m,
  setup1m,
  onExecuteTrade,
  onBroadcastTelegram,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<DynamicMarketLevel | null>(null);
  const [copiedSignal, setCopiedSignal] = useState(false);

  // 1. Dynamic Level Extraction Engine (Visual layer for 1M Brain)
  const { levels, reactionZones, mtf } = useMemo(() => {
    return extractDynamicLevels(currentPrice, candles1m, setup1m, undefined, undefined, assetKey);
  }, [currentPrice, candles1m, setup1m, assetKey]);

  // 2. Confluence Score & AI Trade Generator
  const { confluenceScore, activeTradeSignal, regime } = useMemo(() => {
    return calculateKhatarnakConfluenceScore(currentPrice, levels, reactionZones, mtf, setup1m);
  }, [currentPrice, levels, reactionZones, mtf, setup1m]);

  // Nearest Key Levels
  const nearestAbove = useMemo(
    () => levels.filter((l) => l.side === "ABOVE").sort((a, b) => a.distanceFromPrice - b.distanceFromPrice)[0] || null,
    [levels]
  );
  const nearestBelow = useMemo(
    () => levels.filter((l) => l.side === "BELOW").sort((a, b) => a.distanceFromPrice - b.distanceFromPrice)[0] || null,
    [levels]
  );

  const handleCopySignal = () => {
    if (!activeTradeSignal) return;
    const text = `💀 ${activeTradeSignal.signalTitle}\nAsset: ${assetKey}\nOptimal Entry: ${activeTradeSignal.optimalEntry}\nZone: ${activeTradeSignal.entryZoneLow} - ${activeTradeSignal.entryZoneHigh}\nSL: ${activeTradeSignal.stopLoss}\nTP1: ${activeTradeSignal.tp1}\nTP2: ${activeTradeSignal.tp2}\nTP3: ${activeTradeSignal.tp3}\nR:R: ${activeTradeSignal.riskRewardRatio}\nConfidence: ${activeTradeSignal.confidenceScore}%`;
    navigator.clipboard.writeText(text);
    setCopiedSignal(true);
    setTimeout(() => setCopiedSignal(false), 2000);
  };

  const handleQuickExecute = () => {
    if (onExecuteTrade && activeTradeSignal) {
      onExecuteTrade({
        asset: assetKey,
        type: activeTradeSignal.action === "SELL" ? "SELL" : "BUY",
        entry: activeTradeSignal.optimalEntry,
        sl: activeTradeSignal.stopLoss,
        tp1: activeTradeSignal.tp1,
        tp2: activeTradeSignal.tp2,
        tp3: activeTradeSignal.tp3,
        confidence: activeTradeSignal.confidenceScore,
        strategy: "KHATARNAK_3D_JUGAAD",
      });
    }
  };

  return (
    <div id="khatarnak-3d-hero-engine" className="space-y-4">
      {/* Hero Header HUD */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        {/* Left: Branding & Asset */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/20 via-amber-500/20 to-cyan-500/20 border border-rose-500/40 flex items-center justify-center shadow-lg shadow-rose-500/10">
            <span className="text-2xl animate-pulse">💀</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                KHATARNAK JUGAAD
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  LIVE 3D AI RADAR
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
              <span className="font-mono font-bold text-amber-400 flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-rose-500 animate-ping" />
                {assetKey} LIVE TICK ENGINE
              </span>
              <span>•</span>
              <span className="text-slate-300">
                Regime:{" "}
                <strong
                  className={
                    regime === "STRONG_BEARISH"
                      ? "text-rose-400 font-bold"
                      : regime === "STRONG_BULLISH"
                      ? "text-emerald-400 font-bold"
                      : "text-amber-400 font-bold"
                  }
                >
                  {regime.replace("_", " ")}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live Price Hero Ticker */}
        <div className="flex items-center gap-4 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800/80">
          <div className="text-right">
            <div className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Spot Price</div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight flex items-center gap-1.5">
              <span className="text-cyan-400 text-lg">●</span>
              {currentPrice.toFixed(2)}
            </div>
          </div>
          <div className="h-9 w-px bg-slate-800" />
          <div className="text-left">
            <div className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Dynamic 2.6</div>
            <div className="text-sm font-bold font-mono text-amber-400">
              {levels.find((l) => l.type === "FIB_2_6")?.price.toFixed(2) || "Calculating..."}
            </div>
            <div className="text-[9px] text-slate-500">Range ÷ 2.6 delta</div>
          </div>
        </div>

        {/* Right: AI Score Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] uppercase font-mono text-slate-400">Khatarnak Score</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
              {confluenceScore.totalScore}/100
            </div>
            <div className="text-[9px] font-bold text-slate-300 uppercase tracking-wide">
              {confluenceScore.classification}
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-400 flex items-center justify-center font-black text-xs text-white bg-emerald-950/40">
            {confluenceScore.totalScore}%
          </div>
        </div>
      </div>

      {/* Main 3D Radar + HUD Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side: 3D Market Radar View (Col 8) */}
        <div className="lg:col-span-8 space-y-3">
          <Khatarnak3DMarketRadar
            currentPrice={currentPrice}
            levels={levels}
            reactionZones={reactionZones}
            regime={regime}
            assetKey={assetKey}
            confluenceScore={confluenceScore.totalScore}
            onLevelClick={(lvl) => setSelectedLevel(lvl)}
          />

          {/* Real-time Multi-Timeframe Alignment Ribbon */}
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-slate-200">MTF AI Confluence:</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-400">1M Tick:</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                    mtf.timeframe1m.trend === "BEARISH"
                      ? "bg-rose-500/20 text-rose-300"
                      : "bg-emerald-500/20 text-emerald-300"
                  }`}
                >
                  {mtf.timeframe1m.trend} (RSI {mtf.timeframe1m.momentumRsi})
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-400">5M Setup:</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-500/20 text-rose-300">
                  {mtf.timeframe5m.trend} (DISPLACEMENT YES)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-400">15M Macro:</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300">
                  INSTITUTIONAL SELL BIAS
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: AI Trade Generator & Confluence Cockpit (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          {/* AI Decision & Trade Generator Card */}
          <div
            id="ai-trade-generator-card"
            className={`p-4 rounded-2xl border shadow-xl relative overflow-hidden transition-all ${
              activeTradeSignal.action === "SELL"
                ? "bg-gradient-to-b from-rose-950/40 to-slate-900 border-rose-500/40"
                : "bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {activeTradeSignal.action === "SELL" ? "💀" : "⚠️"}
                </span>
                <h3 className="text-base font-black text-white tracking-wide">
                  {activeTradeSignal.signalTitle}
                </h3>
              </div>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  activeTradeSignal.action === "SELL"
                    ? "bg-rose-500 text-slate-950 font-bold"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                }`}
              >
                {activeTradeSignal.action === "SELL" ? "ACTIVE TRIGGER" : "WAITING"}
              </span>
            </div>

            {/* Trade Parameters Grid */}
            <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 space-y-2 mb-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Entry Zone:</span>
                <span className="font-mono font-bold text-amber-300">
                  {activeTradeSignal.entryZoneLow} — {activeTradeSignal.entryZoneHigh}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Optimal 2.6 Entry:</span>
                <span className="font-mono font-bold text-cyan-300">{activeTradeSignal.optimalEntry}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Stop Loss (Hard SL):</span>
                <span className="font-mono font-bold text-rose-400">{activeTradeSignal.stopLoss}</span>
              </div>
              <div className="h-px bg-slate-800" />
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
                  <div className="text-[9px] text-slate-400">TP1</div>
                  <div className="font-mono font-bold text-xs text-emerald-400">{activeTradeSignal.tp1}</div>
                </div>
                <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
                  <div className="text-[9px] text-slate-400">TP2 (Botam)</div>
                  <div className="font-mono font-bold text-xs text-emerald-400">{activeTradeSignal.tp2}</div>
                </div>
                <div className="bg-slate-900/90 p-1.5 rounded-lg border border-slate-800">
                  <div className="text-[9px] text-slate-400">TP3 (Ext)</div>
                  <div className="font-mono font-bold text-xs text-emerald-400">{activeTradeSignal.tp3}</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">Reward to Risk:</span>
                <span className="font-mono font-bold text-emerald-300">{activeTradeSignal.riskRewardRatio}</span>
              </div>
            </div>

            {/* AI Decision Reasons / Missing Factors */}
            <div className="space-y-1.5 mb-3 text-[11px]">
              <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                AI Confluence Audit:
              </div>
              {activeTradeSignal.reasons.map((r, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </div>
              ))}
              {activeTradeSignal.missingFactors &&
                activeTradeSignal.missingFactors.map((m, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-amber-300/90">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{m}</span>
                  </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                id="btn-quick-execute-3d"
                onClick={handleQuickExecute}
                disabled={activeTradeSignal.action !== "SELL"}
                className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  activeTradeSignal.action === "SELL"
                    ? "bg-rose-500 hover:bg-rose-400 text-slate-950 shadow-lg shadow-rose-500/25"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Quick Execute Setup
              </button>

              <button
                id="btn-copy-signal-3d"
                onClick={handleCopySignal}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 text-xs flex items-center justify-center transition-all"
                title="Copy Signal Payload"
              >
                {copiedSignal ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confluence Score Breakdown Card */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                Confluence Weight Matrix
              </span>
              <span className="font-mono text-cyan-400">{confluenceScore.totalScore}/100</span>
            </div>

            {/* Progress Bars */}
            <div className="space-y-2 text-[11px]">
              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>Market Structure (25%)</span>
                  <span className="font-mono font-bold text-slate-200">{confluenceScore.marketStructureScore}/25</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-500"
                    style={{ width: `${(confluenceScore.marketStructureScore / 25) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>Fibonacci 2.6 Alignment (25%)</span>
                  <span className="font-mono font-bold text-slate-200">{confluenceScore.fib26AlignmentScore}/25</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${(confluenceScore.fib26AlignmentScore / 25) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>Entry Zone Reaction (20%)</span>
                  <span className="font-mono font-bold text-slate-200">{confluenceScore.entryZoneReactionScore}/20</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-pink-400 transition-all duration-500"
                    style={{ width: `${(confluenceScore.entryZoneReactionScore / 20) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>Momentum & RSI (15%)</span>
                  <span className="font-mono font-bold text-slate-200">{confluenceScore.momentumScore}/15</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-500"
                    style={{ width: `${(confluenceScore.momentumScore / 15) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-0.5">
                  <span>Risk / Reward Safety (15%)</span>
                  <span className="font-mono font-bold text-slate-200">{confluenceScore.riskRewardScore}/15</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-400 transition-all duration-500"
                    style={{ width: `${(confluenceScore.riskRewardScore / 15) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Dynamic Levels Ordered Feed (All Calculated Levels) */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Dynamic Real-Time Level Feed ({levels.length} Monitored Targets)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Auto-calculated via Multi-Timeframe Institutional Math
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-mono">
                <th className="py-2 px-3">Type / Label</th>
                <th className="py-2 px-3">Price</th>
                <th className="py-2 px-3">Distance ($)</th>
                <th className="py-2 px-3">Strength</th>
                <th className="py-2 px-3">Confluences</th>
                <th className="py-2 px-3">First Touch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {levels.map((lvl) => {
                const isAbove = lvl.side === "ABOVE";
                const isSelected = selectedLevel?.id === lvl.id;
                return (
                  <tr
                    key={lvl.id}
                    onClick={() => setSelectedLevel(lvl)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-cyan-500/10 text-white"
                        : "hover:bg-slate-800/50 text-slate-300"
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          lvl.type === "FIB_2_6"
                            ? "bg-amber-400"
                            : isAbove
                            ? "bg-rose-400"
                            : "bg-emerald-400"
                        }`}
                      />
                      <span className="text-slate-200">{lvl.label}</span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white">{lvl.price.toFixed(2)}</td>
                    <td
                      className={`py-2.5 px-3 font-bold ${
                        isAbove ? "text-rose-400" : "text-emerald-400"
                      }`}
                    >
                      {isAbove ? `+${lvl.distanceFromPrice.toFixed(2)}$` : `-${lvl.distanceFromPrice.toFixed(2)}$`}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                          lvl.strength === "EXTREME"
                            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                            : lvl.strength === "STRONG"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        }`}
                      >
                        {lvl.strength} ({lvl.strengthScore}%)
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px] font-sans">
                      {lvl.confluences.join(" • ")}
                    </td>
                    <td className="py-2.5 px-3">
                      {lvl.isFirstTouch ? (
                        <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 text-[9px] font-bold border border-yellow-500/40 animate-pulse">
                          🔥 FIRST TOUCH
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Mitigated</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

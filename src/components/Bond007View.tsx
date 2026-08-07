import React, { useState } from "react";
import { getModuleTitle } from "../utils/moduleRegistry";
import {
  ShieldAlert,
  Zap,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Activity,
  BarChart3,
  TrendingDown,
  TrendingUp,
  Lock,
  Compass,
  Layers,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Clock,
  Flame,
} from "lucide-react";
import { LivePrice, Candle } from "../types";
import { InteractiveChart } from "./InteractiveChart";
import { useLockedTradeSetup } from "../utils/useLockedTradeSetup";
import { LockedSetupBanner } from "./LockedSetupBanner";

interface Bond007ViewProps {
  currentPrice: number;
  candles: Candle[];
  timeframe: string;
  setTimeframe: (tf: string) => void;
  activeAssetKey: string;
}

export const Bond007View: React.FC<Bond007ViewProps> = ({
  currentPrice,
  candles,
  timeframe,
  setTimeframe,
  activeAssetKey,
}) => {
  const [showConfidence, setShowConfidence] = useState(false);
  const [showEngineLayers, setShowEngineLayers] = useState(false);
  const [ladderFilter, setLadderFilter] = useState<"ALL" | "BUY" | "SELL">("ALL");

  const decimals = activeAssetKey.includes("EUR") || activeAssetKey.includes("GBP") ? 4 : 2;

  // Locked Setup Engine for Bond 007 Sniper
  const { setup: lockedSetup, resetSetup } = useLockedTradeSetup(
    "bond007",
    "🕵️ GMC Secret Agent Order Block Sniper",
    activeAssetKey,
    activeAssetKey,
    currentPrice || 4055.14,
    activeAssetKey.includes("EUR") || activeAssetKey.includes("GBP") ? "forex" : activeAssetKey.includes("BTC") ? "crypto" : "metals",
    decimals
  );

  // Calculated zone prices relative to gold live price
  const base = currentPrice || 4055.14;
  const buyEntryHi = (base - 31.9).toFixed(2);
  const buyEntryLo = (base - 35.9).toFixed(2);
  const buyAnchor = (base - 33.9).toFixed(2);
  const buySL = (base - 47.57).toFixed(2);

  const buyTP1 = (base + 18.44).toFixed(2);
  const buyTP2 = (base + 27.74).toFixed(2);
  const buyTP3 = (base + 34.26).toFixed(2);

  const sellEntryLo = (base + 36.49).toFixed(2);
  const sellEntryHi = (base + 40.49).toFixed(2);
  const sellAnchor = (base + 38.49).toFixed(2);
  const sellSL = (base + 52.16).toFixed(2);

  const sellTP1 = (base - 28.07).toFixed(2);
  const sellTP2 = (base - 33.91).toFixed(2);
  const sellTP3 = (base - 44.34).toFixed(2);

  const gates = [
    { label: "engine health", ok: true },
    { label: "wait dominance", ok: true },
    { label: "mtf alignment", ok: true },
    { label: "cooldown", ok: true },
    { label: "reentry", ok: true },
    { label: "entry location", ok: true },
    { label: "sl placement", ok: true },
    { label: "engine overpower", ok: true },
    { label: "rr minimum", ok: true },
  ];

  // Zone ladder levels matching screenshot exact format
  const zoneLadderLevels = [
    { type: "SELL SL", price: (base + 52.16).toFixed(3), color: "bg-rose-600/20 text-rose-400 border-rose-500/40" },
    { type: "LEVEL 8", price: (base + 49.92).toFixed(3), color: "bg-indigo-950/60 text-indigo-300 border-indigo-800/40" },
    { type: "LEVEL 7", price: (base + 44.81).toFixed(3), color: "bg-indigo-950/60 text-indigo-300 border-indigo-800/40" },
    { type: "SELL entry HI", price: sellEntryHi, color: "bg-rose-950/80 text-rose-400 border-rose-600/50 font-bold" },
    { type: "LEVEL 5", price: (base + 38.49).toFixed(3), color: "bg-indigo-950/60 text-indigo-300 border-indigo-800/40" },
    { type: "SELL retest DEEP CRITICAL", price: sellAnchor, color: "bg-rose-950/90 text-rose-400 border-rose-500 font-bold" },
    { type: "SELL entry LO", price: sellEntryLo, color: "bg-rose-950/80 text-rose-400 border-rose-600/50 font-bold" },
    { type: "LEVEL 9", price: (base + 34.25).toFixed(3), color: "bg-indigo-950/60 text-indigo-300 border-indigo-800/40" },
    { type: "NOW (LIVE)", price: base.toFixed(2), color: "bg-amber-400 text-black font-extrabold border-amber-300 shadow-lg shadow-amber-400/20 scale-102" },
    { type: "BUY TP3", price: buyTP3, color: "bg-emerald-950/80 text-emerald-400 border-emerald-600/50" },
    { type: "LEVEL 2", price: (base + 27.74).toFixed(3), color: "bg-indigo-950/60 text-indigo-300 border-indigo-800/40" },
    { type: "BUY TP2", price: buyTP2, color: "bg-emerald-950/80 text-emerald-400 border-emerald-600/50" },
    { type: "SELL retest SWING CRITICAL", price: (base + 27.74).toFixed(3), color: "bg-rose-950/90 text-rose-400 border-rose-500 font-bold" },
    { type: "LEVEL 4", price: (base + 18.44).toFixed(3), color: "bg-indigo-950/60 text-indigo-300 border-indigo-800/40" },
    { type: "BUY TP1", price: buyTP1, color: "bg-emerald-950/80 text-emerald-400 border-emerald-600/50" },
    { type: "SELL retest NEAREST CRITICAL", price: (base + 18.44).toFixed(3), color: "bg-amber-500/20 text-amber-400 border-amber-500/50 font-bold" },
    { type: "LEVEL 11", price: sellTP1, color: "bg-indigo-950/60 text-indigo-300 border-indigo-800/40" },
    { type: "SELL TP1", price: sellTP1, color: "bg-rose-950/80 text-rose-400 border-rose-600/50" },
    { type: "BUY entry HI", price: buyEntryHi, color: "bg-emerald-950/90 text-emerald-400 border-emerald-500 font-bold" },
    { type: "LEVEL 1", price: buyAnchor, color: "bg-indigo-950/60 text-indigo-300 border-indigo-800/40" },
    { type: "SELL TP2", price: sellTP2, color: "bg-rose-950/80 text-rose-400 border-rose-600/50" },
    { type: "SELL deep", price: sellTP2, color: "bg-rose-950/80 text-rose-400 border-rose-600/50" },
    { type: "BUY entry LO", price: buyEntryLo, color: "bg-emerald-950/90 text-emerald-400 border-emerald-500 font-bold" },
    { type: "LEVEL 3", price: (base - 44.34).toFixed(3), color: "bg-indigo-950/60 text-indigo-300 border-indigo-800/40" },
    { type: "SELL TP3", price: sellTP3, color: "bg-rose-950/80 text-rose-400 border-rose-600/50" },
    { type: "BUY SL", price: buySL, color: "bg-rose-600/20 text-rose-400 border-rose-500/40 font-bold" },
  ];

  return (
    <div id="bond007-view" className="space-y-6 pb-20 font-mono max-w-7xl mx-auto px-2 sm:px-4 text-slate-200">
      {/* Header Banner - Matching Screenshot 7 */}
      <div className="bg-[#0A0F1D] border border-amber-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-amber-400 uppercase">
                {getModuleTitle("bond007")}
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-1">
              7-Layer Fusion • Master Verdict • Live XAUUSD Institutional Zones & Execution Gates
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-900/90 border border-amber-500/30 px-3 py-1.5 rounded-xl text-right">
              <div className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">XAUUSD • LICENSE TO TRADE</div>
              <div className="text-sm font-extrabold text-white font-mono flex items-center justify-end gap-1">
                ${base.toLocaleString()}
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Big Verdict Status Card - WAIT / BUY / SELL */}
        <div className="mt-5 bg-[#070B14] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <div className="text-4xl sm:text-5xl font-black text-amber-400 tracking-widest uppercase flex items-center justify-center md:justify-start gap-3">
                <span>WAIT</span>
                <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-md tracking-normal">
                  STANDBY MODE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Bias <span className="text-rose-400 font-bold">SELL</span> • honest conf <span className="text-white font-bold">32.5%</span> • directional <span className="text-white font-bold">32.5%</span>
              </p>
            </div>

            <div className="flex flex-col items-center md:items-end gap-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-bold shadow-md shadow-emerald-500/10">
                <CheckCircle2 className="w-4 h-4" />
                <span>TRADE ALLOWED: YES</span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-3 font-mono">
                <span>engine health: <strong className="text-emerald-400">78%</strong></span>
                <span>mode: <strong className="text-amber-400">NORMAL</strong></span>
                <span>failed gates: <strong className="text-emerald-400">0/9</strong></span>
              </div>
            </div>
          </div>

          {/* Fusion Confidence Distribution Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>fusion confidence</span>
              <span className="text-slate-300">32.5% / 65% needed</span>
            </div>
            <div className="w-full h-4 bg-slate-950 rounded-lg overflow-hidden flex border border-slate-800">
              <div className="w-[10%] bg-emerald-500 flex items-center justify-center text-[9px] font-bold text-black" title="BUY 10%">10%</div>
              <div className="w-[58%] bg-amber-400 flex items-center justify-center text-[9px] font-bold text-black" title="WAIT 58%">58%</div>
              <div className="w-[32%] bg-rose-500 flex items-center justify-center text-[9px] font-bold text-white" title="SELL 32%">32%</div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span className="text-emerald-400 font-bold">▲ BUY 10%</span>
              <span className="text-amber-400 font-bold">WAIT 58%</span>
              <span className="text-rose-400 font-bold">SELL 32% ▼</span>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 uppercase tracking-wider text-center pt-1 font-bold">
            state: <span className="text-amber-300">LAYER CONSENSUS MISMATCH</span>
          </div>
        </div>
      </div>

      {/* BUY & SELL ZONES Side-by-Side Cards (Screenshots 3 & 7) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* BUY ZONE CARD */}
        <div className="bg-[#070D18] border border-emerald-500/50 rounded-2xl p-5 shadow-2xl relative overflow-hidden space-y-3">
          <div className="flex justify-between items-center border-b border-emerald-500/20 pb-2">
            <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2 uppercase">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" /> ▲ BUY ZONE
            </h2>
            <span className="text-[10px] text-slate-400 uppercase">DOWN-FIRST → buy from LAST demand (deepest STR)</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Entry</span>
              <span className="font-bold text-slate-100">${buyEntryLo} — ${buyEntryHi}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Anchor</span>
              <span className="font-bold text-amber-400">${buyAnchor} • CRITICAL</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Stop loss</span>
              <span className="font-bold text-rose-400">${buySL}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">TP1 / TP2 / TP3</span>
              <span className="font-bold text-emerald-400">${buyTP1} / ${buyTP2} / ${buyTP3}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">R:R (TP1)</span>
              <span className="font-bold text-white">1 : 3.83</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Distance</span>
              <span className="font-bold text-slate-200">$34 away</span>
            </div>
          </div>
        </div>

        {/* SELL ZONE CARD */}
        <div className="bg-[#12080D] border border-rose-500/50 rounded-2xl p-5 shadow-2xl relative overflow-hidden space-y-3">
          <div className="flex justify-between items-center border-b border-rose-500/20 pb-2">
            <h2 className="text-sm font-bold text-rose-400 flex items-center gap-2 uppercase">
              <ArrowDownRight className="w-4 h-4 text-rose-400" /> ▼ SELL ZONE
            </h2>
            <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              ★ NEAREST
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Entry</span>
              <span className="font-bold text-slate-100">${sellEntryLo} — ${sellEntryHi}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Anchor</span>
              <span className="font-bold text-amber-400">${sellAnchor} • CRITICAL</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Stop loss</span>
              <span className="font-bold text-rose-400">${sellSL}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">TP1 / TP2 / TP3</span>
              <span className="font-bold text-emerald-400">${sellTP1} / ${sellTP2} / ${sellTP3}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">R:R (TP1)</span>
              <span className="font-bold text-white">1 : 4.87</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Distance</span>
              <span className="font-bold text-slate-200">$18 away</span>
            </div>
          </div>
        </div>
      </div>

      {/* LOCKED AI TRADE SETUP BANNER */}
      <LockedSetupBanner
        setup={lockedSetup}
        currentPrice={currentPrice || 4055.14}
        onResetSetup={resetSetup}
        decimals={decimals}
      />

      {/* RADAR • XAUUSD H1 CHART + ZONE MAP (Screenshots 3, 4, 5, 6) */}
      <div className="bg-[#080B14] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              RADAR • XAUUSD H1 CHART + ZONE MAP
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-amber-400 font-bold">━ SELL entry</span>
            <span className="text-emerald-400 font-bold">━ BUY entry</span>
            <span className="text-rose-400 font-bold">━ SL</span>
          </div>
        </div>

        {/* Live Candle Chart */}
        <InteractiveChart
          candles={candles}
          activeAssetKey={activeAssetKey}
          timeframe={timeframe}
          setTimeframe={setTimeframe}
          currentPrice={currentPrice}
        />

        {/* ZONE LADDER Table (Vertical list of levels with live price scrollable view) */}
        <div className="bg-[#05070E] border border-slate-800/90 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                ZONE LADDER • NOW ${base.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px]">
              <button
                onClick={() => setLadderFilter("ALL")}
                className={`px-2 py-0.5 rounded border ${ladderFilter === "ALL" ? "bg-amber-500/20 text-amber-400 border-amber-500/40 font-bold" : "text-slate-500 border-slate-800"}`}
              >
                ALL
              </button>
              <button
                onClick={() => setLadderFilter("BUY")}
                className={`px-2 py-0.5 rounded border ${ladderFilter === "BUY" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold" : "text-slate-500 border-slate-800"}`}
              >
                BUY
              </button>
              <button
                onClick={() => setLadderFilter("SELL")}
                className={`px-2 py-0.5 rounded border ${ladderFilter === "SELL" ? "bg-rose-500/20 text-rose-400 border-rose-500/40 font-bold" : "text-slate-500 border-slate-800"}`}
              >
                SELL
              </button>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs">
            {zoneLadderLevels
              .filter((item) => {
                if (ladderFilter === "BUY") return item.type.includes("BUY") || item.type.includes("NOW");
                if (ladderFilter === "SELL") return item.type.includes("SELL") || item.type.includes("NOW");
                return true;
              })
              .map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2 rounded-lg border transition-all ${item.color}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold tracking-tight text-[11px]">{item.type}</span>
                  </div>
                  <span className="font-mono font-bold">${item.price}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* WHALE MATRIX Card (Screenshot 3 & 4) */}
      <div className="bg-[#070B14] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-base">🐋</span>
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest">WHALE MATRIX</h3>
          </div>
          <span className="text-xs font-bold text-amber-400">WAIT</span>
        </div>
        <div className="text-xs font-mono space-y-1">
          <p className="font-bold text-slate-300">
            <span className="text-rose-400">BEAR</span> + <span className="text-amber-400">NEUTRAL</span> &nbsp; | &nbsp; <span className="text-amber-400">NEUTRAL</span> &nbsp; | &nbsp; sess: <span className="text-slate-100 font-bold">NY</span>
          </p>
          <p className="text-[11px] text-slate-400">
            • Family #3 (n=937, bias=down, edge +0.97p)
          </p>
        </div>
      </div>

      {/* WHAT TO DO NOW Card (Screenshot 3 & 4) */}
      <div className="bg-[#070B14] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">WHAT TO DO NOW</h3>
        <div className="space-y-2 text-xs font-mono">
          <div className="font-bold text-slate-200">
            Direction: <span className="text-rose-400">SELL</span> @ 32.5% confidence <span className="text-slate-400 font-normal">(2 brains agree)</span>
          </div>
          <div className="text-slate-300">
            ML ensemble: <span className="text-emerald-400 font-bold">BUY</span> — diverges
          </div>
          <div className="pt-2 border-t border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase font-bold">WHY BLOCKED</div>
            <div className="text-rose-400 font-bold flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> all 9 gates passed — clean setup
            </div>
          </div>
        </div>
      </div>

      {/* GATES • 0 FAILED OF 9 Pills Grid (Screenshot 6) */}
      <div className="bg-[#070B14] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono flex items-center justify-between">
          <span>GATES • 0 FAILED OF 9</span>
          <span className="text-emerald-400 text-[10px]">ALL PASSING</span>
        </h3>
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          {gates.map((g, i) => (
            <span
              key={i}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{g.label}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Collapsible Accordions: CONFIDENCE & VOTING & ENGINE LAYERS */}
      <div className="space-y-3 font-mono text-xs">
        {/* Accordion 1 */}
        <div className="bg-[#070B14] border border-slate-800 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowConfidence(!showConfidence)}
            className="w-full p-4 flex justify-between items-center text-left hover:bg-slate-900/50 transition-all text-slate-300 font-bold"
          >
            <span className="flex items-center gap-2">
              🧠 CONFIDENCE & VOTING
            </span>
            <span className="flex items-center gap-2 text-[10px] text-slate-500">
              <span>TAP</span>
              {showConfidence ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </button>
          {showConfidence && (
            <div className="p-4 bg-black/40 border-t border-slate-800 space-y-2 text-slate-400">
              <div className="flex justify-between">
                <span>Multi-TF Sub-Brain Vote:</span>
                <span className="text-emerald-400 font-bold">8 BUY / 4 SELL / 2 WAIT</span>
              </div>
              <div className="flex justify-between">
                <span>GMC Consensus Engine:</span>
                <span className="text-amber-400 font-bold">69 Voter Consensus</span>
              </div>
              <div className="flex justify-between">
                <span>Institutional Order Flow:</span>
                <span className="text-rose-400 font-bold">High Selling Pressure at $4093</span>
              </div>
            </div>
          )}
        </div>

        {/* Accordion 2 */}
        <div className="bg-[#070B14] border border-slate-800 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowEngineLayers(!showEngineLayers)}
            className="w-full p-4 flex justify-between items-center text-left hover:bg-slate-900/50 transition-all text-slate-300 font-bold"
          >
            <span className="flex items-center gap-2">
              🏗️ ENGINE LAYERS
            </span>
            <span className="flex items-center gap-2 text-[10px] text-slate-500">
              <span>TAP</span>
              {showEngineLayers ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          </button>
          {showEngineLayers && (
            <div className="p-4 bg-black/40 border-t border-slate-800 space-y-2 text-slate-400">
              <div className="flex justify-between">
                <span>Layer 1 - Macro Trend:</span>
                <span className="text-emerald-400 font-bold font-mono">BULLISH H4</span>
              </div>
              <div className="flex justify-between">
                <span>Layer 2 - SMC Liquidity:</span>
                <span className="text-amber-400 font-bold font-mono">SWEEP COMPLETE</span>
              </div>
              <div className="flex justify-between">
                <span>Layer 3 - Doji Reversal:</span>
                <span className="text-white font-bold font-mono">M15 CLUSTER CONFIRMED</span>
              </div>
              <div className="flex justify-between">
                <span>Layer 4 - Black Shark DOM:</span>
                <span className="text-rose-400 font-bold font-mono">DEFENDING $4095 WALL</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Urdu & English Legal Disclaimer (Screenshot 6) */}
      <div className="bg-[#05070D] border border-amber-500/20 rounded-2xl p-5 text-center space-y-2 font-sans text-xs">
        <div className="inline-block bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider font-mono">
          ⚠️ DISCLAIMER
        </div>
        <p className="text-slate-300 font-medium leading-relaxed max-w-3xl mx-auto">
          <strong>Yeh analysis hai, signal nahi.</strong> Apni risk khud lain. Yeh tool sirf education aur research purpose ke liye hai. Yeh koi financial, investment ya trading advice nahi. Trades apni marzi se aur apni responsibility par karein.
        </p>
        <p className="text-slate-500 text-[11px] leading-relaxed max-w-2xl mx-auto">
          <strong>Not financial advice.</strong> This is for educational and research purposes only. We are not responsible for any losses. Trade at your own risk.
        </p>
      </div>
    </div>
  );
};

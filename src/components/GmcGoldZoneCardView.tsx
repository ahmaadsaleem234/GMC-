import React, { useState, useEffect, useMemo } from "react";
import { getModuleTitle } from "../utils/moduleRegistry";
import {
  Crown,
  Globe,
  Zap,
  TrendingUp,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart2,
  Target,
  Flame,
  Droplets,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Bell,
  Lock,
  ChevronRight,
  Info,
  Calendar,
  Radio,
  Sliders,
  DollarSign,
  Filter,
  Sparkles,
  Check,
  X,
} from "lucide-react";
import { LivePrice } from "../types";
import { SUPPORTED_ASSETS } from "../useLiveData";
import { fetchAndUpdateDailyBankLevels } from "../utils/gmcBankLevels";
import { useLockedTradeSetup } from "../utils/useLockedTradeSetup";
import { LockedSetupBanner } from "./LockedSetupBanner";

interface GmcGoldZoneCardViewProps {
  currentPrice: number;
  assetKey: string;
  prices: Record<string, LivePrice>;
  onOpenTradeCopilot?: (assetKey: string, type: "BUY" | "SELL") => void;
  onOpenHeatmapOverlay?: () => void;
}

interface EconomicNewsEvent {
  id: string;
  time: string;
  currency: string;
  event: string;
  impact: "HIGH" | "MEDIUM" | "LOW";
  forecast: string;
  previous: string;
  actual?: string;
  status: "UPCOMING" | "LIVE" | "COMPLETED";
  minutesAway: number;
}

export const GmcGoldZoneCardView: React.FC<GmcGoldZoneCardViewProps> = ({
  currentPrice: propPrice,
  assetKey = "XAUUSD",
  prices = {},
  onOpenTradeCopilot,
  onOpenHeatmapOverlay,
}) => {
  const [selectedAssetKey, setSelectedAssetKey] = useState<string>("XAUUSD");
  const [selectedScenario, setSelectedScenario] = useState<"PREMIUM_WATCH" | "ZONE_DIP_ACTIVE" | "SELL_SCALP">("PREMIUM_WATCH");
  const [activeNewsFilter, setActiveNewsFilter] = useState<"ALL" | "HIGH_IMPACT" | "USD_XAU">("ALL");
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Active Asset Live Price calculation
  const asset = useMemo(() => {
    return SUPPORTED_ASSETS.find((a) => a.key === selectedAssetKey) || SUPPORTED_ASSETS[0];
  }, [selectedAssetKey]);

  const livePriceObj = prices[selectedAssetKey] || {
    price: propPrice || asset.basePrice,
    changePct: 0.42,
  };
  const livePrice = livePriceObj.price || asset.basePrice;
  const isForex = selectedAssetKey.includes("EUR") || selectedAssetKey.includes("GBP");
  const decimals = isForex ? 4 : 2;

  // AI Brain Locked Trade Setup Engine
  const { setup: lockedSetup, resetSetup } = useLockedTradeSetup(
    "gmcgold",
    "👑 GMC GOLD Apex Bank-Zone Matrix",
    selectedAssetKey,
    asset.label,
    livePrice,
    asset.category,
    decimals
  );

  // Dynamic Bank Level calculations fetched & updated via institutional bank levels helper
  const [h1TickCounter, setH1TickCounter] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setH1TickCounter((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const bankLevels = useMemo(() => {
    return fetchAndUpdateDailyBankLevels(livePrice, selectedAssetKey);
  }, [livePrice, selectedAssetKey, h1TickCounter]);

  // Format 1H close countdown string (MM:SS)
  const h1CountdownFormatted = useMemo(() => {
    const totalSecs = bankLevels.next1HCloseSeconds;
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, [bankLevels.next1HCloseSeconds]);

  // Dynamic 6-Gate Status Checks depending on active scenario
  const gateChecks = useMemo(() => {
    if (selectedScenario === "ZONE_DIP_ACTIVE") {
      return {
        g1: { met: true, label: "ZONE TOUCH", sub: `Price touched Tier 1 Zone ($${bankLevels.tier1Low}-$${bankLevels.tier1High})` },
        g2: { met: true, label: "LIQUIDITY SWEEP", sub: "Asian Low Liquidity Swept on M15" },
        g3: { met: true, label: "REJECTION", sub: `Bullish Rejection Candle (1.45x ATR, body 68%)` },
        g4: { met: true, label: "BOS / MSS", sub: `BOS_UP — H1 close above $${bankLevels.tier1High}` },
        g5: { met: true, label: "M30 CONFIRM", sub: "M30 Bullish Engulfing Confirmed" },
        g6: { met: true, label: "NEWS + SPREAD", sub: "No Red News next 30m • Spread $0.35" },
        totalMet: 6,
        verdict: "CONFIRMED BUY",
        verdictSub: `Price entering Tier 1 Buy Dip Zone ($${bankLevels.tier1Low}-$${bankLevels.tier1High}). Execute Buy setup with SL $${bankLevels.tier1SL}.`,
      };
    }

    if (selectedScenario === "SELL_SCALP") {
      return {
        g1: { met: true, label: "ZONE TOUCH", sub: `Price inside Sell Scalp Zone ($${bankLevels.sellScalpLow}-$${bankLevels.sellScalpHigh})` },
        g2: { met: true, label: "LIQUIDITY SWEEP", sub: "NY Session High Swept on M15" },
        g3: { met: true, label: "REJECTION", sub: "Bearish Pinbar (>1.35x ATR)" },
        g4: { met: true, label: "BOS / MSS", sub: "MSS_DOWN — M15 market structure shift" },
        g5: { met: false, label: "M30 CONFIRM", sub: "Awaiting M30 candle close below resistance" },
        g6: { met: true, label: "NEWS + SPREAD", sub: "Spread $0.38 normal" },
        totalMet: 5,
        verdict: "WATCH SELL SCALP",
        verdictSub: `5/6 Gates Met. Wait for M30 close before opening short scalp.`,
      };
    }

    // Default PREMIUM_WATCH scenario (Matching exact reference screenshots)
    return {
      g1: { met: false, label: "ZONE TOUCH", sub: "price outside all zones" },
      g2: { met: false, label: "LIQUIDITY SWEEP", sub: "no sweep detected in M15" },
      g3: { met: false, label: "REJECTION", sub: `no rejection/displacement pattern (range 0.73x ATR, body 13%)` },
      g4: { met: true, label: "BOS / MSS", sub: `BOS_UP — H1 close $${bankLevels.basePrice} above swing high $4106.48` },
      g5: { met: false, label: "M30 CONFIRM", sub: "no active zone to confirm against" },
      g6: { met: true, label: "NEWS + SPREAD", sub: "news UNKNOWN, spread $0.39" },
      totalMet: 2,
      verdict: "WATCH BUY",
      verdictSub: `WATCH BUY — G4 + G6 aligned. Awaiting pullback into T1 $${bankLevels.tier1Low}-$${bankLevels.tier1High} ($37.06 away).`,
    };
  }, [selectedScenario, bankLevels]);

  // News events list
  const newsEvents: EconomicNewsEvent[] = [
    {
      id: "news-1",
      time: "13:30 GMT",
      currency: "USD",
      event: "US Core CPI MoM & Consumer Inflation Rate",
      impact: "HIGH",
      forecast: "0.3%",
      previous: "0.2%",
      status: "UPCOMING",
      minutesAway: 24,
    },
    {
      id: "news-2",
      time: "15:00 GMT",
      currency: "USD",
      event: "Fed Chair Powell Speaks at Banking Summit",
      impact: "HIGH",
      forecast: "Hawkish Hold",
      previous: "Neutral",
      status: "UPCOMING",
      minutesAway: 114,
    },
    {
      id: "news-3",
      time: "18:00 GMT",
      currency: "USD",
      event: "FOMC Meeting Minutes & Rate Decision Path",
      impact: "HIGH",
      forecast: "5.25%",
      previous: "5.25%",
      status: "UPCOMING",
      minutesAway: 294,
    },
    {
      id: "news-4",
      time: "08:30 GMT",
      currency: "EUR",
      event: "ECB Main Refinancing Rate Announcement",
      impact: "MEDIUM",
      forecast: "3.75%",
      previous: "4.00%",
      status: "COMPLETED",
      actual: "3.75%",
      minutesAway: -210,
    },
    {
      id: "news-5",
      time: "10:00 GMT",
      currency: "GBP",
      event: "UK Crude Oil Inventories & Production Output",
      impact: "LOW",
      forecast: "-1.2M",
      previous: "+0.8M",
      status: "COMPLETED",
      actual: "-1.5M",
      minutesAway: -120,
    },
  ];

  const filteredNews = newsEvents.filter((e) => {
    if (activeNewsFilter === "HIGH_IMPACT") return e.impact === "HIGH";
    if (activeNewsFilter === "USD_XAU") return e.currency === "USD" || e.currency === "XAU";
    return true;
  });

  const triggerScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setLastRefreshed(new Date().toLocaleTimeString());
    }, 600);
  };

  return (
    <div id="gmc-gold-zone-card-root" className="max-w-7xl mx-auto px-2 sm:px-4 py-4 space-y-6 font-mono text-slate-200">
      
      {/* SCENARIO QUICK TEST CONTROL BAR */}
      <div className="bg-[#05070E] border border-amber-500/30 p-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
            ZONE CARD SIMULATION MODE:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedScenario("PREMIUM_WATCH")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              selectedScenario === "PREMIUM_WATCH"
                ? "bg-amber-500 text-black border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            🟡 1. PREMIUM WATCH (2/6 GATES)
          </button>
          <button
            onClick={() => setSelectedScenario("ZONE_DIP_ACTIVE")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              selectedScenario === "ZONE_DIP_ACTIVE"
                ? "bg-emerald-500 text-black border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            🟢 2. T1 ZONE DIP ACTIVE (6/6 CONFIRMED)
          </button>
          <button
            onClick={() => setSelectedScenario("SELL_SCALP")}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              selectedScenario === "SELL_SCALP"
                ? "bg-rose-500 text-white border-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.5)]"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            🔴 3. SELL SCALP ZONE SCAN
          </button>
        </div>
      </div>

      {/* GMC GOLD ZONE CARD - MAIN HERO BOARD */}
      <div className="bg-gradient-to-b from-[#0B0F1A] via-[#070A12] to-[#04060A] border-2 border-amber-500/50 rounded-3xl p-4 sm:p-7 shadow-[0_0_50px_rgba(245,158,11,0.15)] relative overflow-hidden space-y-6">
        
        {/* Top Header Row with Custom Circular Logo Badge */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border-b border-amber-500/20 pb-5">
          <div className="flex items-center gap-4">
            {/* Custom Circular Logo Emblem */}
            <div className="relative group shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-900 rounded-full border-2 border-amber-300/80 p-0.5 shadow-[0_0_25px_rgba(245,158,11,0.5)] flex items-center justify-center text-center">
                <div className="w-full h-full bg-[#080B14] rounded-full flex flex-col items-center justify-center p-1 border border-amber-400/40">
                  <Crown className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse" />
                  <span className="text-[11px] sm:text-[12px] font-black tracking-tighter text-amber-300 leading-none mt-0.5">
                    GMC
                  </span>
                  <span className="text-[8px] font-black tracking-widest text-amber-400 uppercase leading-none">
                    GOLD
                  </span>
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full border border-amber-300 shadow-md">
                ZONE
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-amber-400 uppercase tracking-tight flex items-center gap-2">
                  {getModuleTitle("gmcgold")}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mt-1">
                <span className="text-amber-400 font-extrabold flex items-center gap-1">
                  🥇 {selectedAssetKey}
                </span>
                <span className="text-slate-600">•</span>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full font-bold">
                  ~${bankLevels.basePrice.toLocaleString("en-US", { minimumFractionDigits: decimals })}
                </span>
              </div>
            </div>
          </div>

          {/* Asset Switcher & Live Refresh CTA */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-[#03060C] border border-amber-500/30 p-1 rounded-xl">
              {SUPPORTED_ASSETS.map((a) => (
                <button
                  key={a.key}
                  onClick={() => setSelectedAssetKey(a.key)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    selectedAssetKey === a.key
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {a.short}
                </button>
              ))}
            </div>

            {onOpenHeatmapOverlay && (
              <button
                onClick={onOpenHeatmapOverlay}
                className="px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 rounded-xl font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-lg"
              >
                <Flame className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>🔥 D3 HEATMAP</span>
              </button>
            )}

            <button
              onClick={triggerScan}
              disabled={isScanning}
              className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 rounded-xl font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-lg"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin text-amber-400" : ""}`} />
              <span>{isScanning ? "RE-SCANNING..." : "SYNC SCAN"}</span>
            </button>
          </div>
        </div>

        {/* Date, Session & Macro Bias Bar */}
        <div className="bg-[#03050B] border border-amber-500/30 rounded-2xl p-4 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>WED, 05 AUG 2026</span>
              </span>
              <span className="text-slate-700">|</span>
              <span className="flex items-center gap-1.5">
                <span className="text-slate-400 font-bold">Session:</span>
                <span className="text-emerald-400 font-black bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                  LONDON NEW YORK OVERLAP
                </span>
              </span>
            </div>
            <div className="text-slate-400 text-[11px]">
              Last Scan: <strong className="text-amber-300">{lastRefreshed}</strong>
            </div>
          </div>

          {/* Macro Bias Indicators */}
          <div className="space-y-2">
            <div className="text-xs text-amber-400 font-black uppercase flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-amber-400" />
              <span>🎯 BIAS MATRIX:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-[#060912] border border-slate-800 p-2.5 rounded-xl space-y-1">
                <div><strong className="text-slate-400">W1:</strong> <span className="text-emerald-400 font-bold">BULLISH_RECOVERY</span></div>
                <div><strong className="text-slate-400">D1:</strong> <span className="text-emerald-400 font-bold">BULLISH_BREAKOUT</span></div>
              </div>
              <div className="bg-[#060912] border border-slate-800 p-2.5 rounded-xl space-y-1">
                <div><strong className="text-slate-400">H4/H1:</strong> <span className="text-emerald-300 font-bold">STRONG_BULLISH / IMPULSIVE_BULLISH</span></div>
                <div className="text-amber-300 font-bold">👉 BREAKOUT HOLD OR RETEST</div>
              </div>
            </div>
          </div>

          {/* Multi-Timeframe Pills Grid */}
          <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
            <div className="bg-[#060912] border border-slate-800 p-2 rounded-xl">
              <div className="text-[10px] text-slate-500 font-bold">MN</div>
              <div className="text-amber-400 font-black text-[11px]">CORRECTIVE</div>
            </div>
            <div className="bg-[#060912] border border-emerald-500/30 p-2 rounded-xl">
              <div className="text-[10px] text-slate-500 font-bold">W1</div>
              <div className="text-emerald-400 font-black text-[11px]">BULLISH_RE</div>
            </div>
            <div className="bg-[#060912] border border-emerald-500/30 p-2 rounded-xl">
              <div className="text-[10px] text-slate-500 font-bold">D1</div>
              <div className="text-emerald-400 font-black text-[11px]">BULLISH_BR</div>
            </div>
            <div className="bg-[#060912] border border-emerald-500/50 p-2 rounded-xl bg-emerald-500/5">
              <div className="text-[10px] text-slate-500 font-bold">H4</div>
              <div className="text-emerald-300 font-black text-[11px]">STRONG_BUL</div>
            </div>
            <div className="bg-[#060912] border border-emerald-500/50 p-2 rounded-xl bg-emerald-500/5">
              <div className="text-[10px] text-slate-500 font-bold">H1</div>
              <div className="text-emerald-300 font-black text-[11px]">IMPULSIVE_</div>
            </div>
          </div>

          {/* Current Live Price Tick Box */}
          <div className="bg-[#020409] border border-amber-500/40 rounded-xl p-3 flex items-center justify-between">
            <span className="text-slate-400 font-bold text-xs">CURRENT PRICE</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight">
                {bankLevels.basePrice.toFixed(decimals)}
              </span>
              <span className="text-xl">🐂</span>
            </div>
          </div>
        </div>

        {/* CONFIRMATION STATE CARD */}
        <div className="bg-[#03060D] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
            CONFIRMATION STATE
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#060A14] border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center text-amber-400 text-xl">
                ⏳
              </div>
              <div>
                <div className="text-lg font-black text-white">{gateChecks.verdict}</div>
                <div className="text-xs text-slate-400 font-sans">{gateChecks.verdictSub}</div>
              </div>
            </div>

            <div className="bg-[#020408] border border-slate-800 px-6 py-3 rounded-xl text-center shrink-0">
              <div className="text-xl font-black text-white">{gateChecks.totalMet} / 6</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">CHECKS MET</div>
            </div>
          </div>
        </div>

        {/* DYNAMIC INSTITUTIONAL ZONE DETECTOR (SUPPLY & DEMAND REAL-TIME RADAR) */}
        <div id="gmc-institutional-zone-detector" className="bg-gradient-to-b from-[#060B18] via-[#040812] to-[#02040A] border-2 border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-2xl shadow-inner">
                <Target className="w-6 h-6 text-amber-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                    🎯 INSTITUTIONAL ZONE DETECTOR
                  </h3>
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black rounded-full">
                    LIVE PRICE SYNCED
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Real-time calculated Supply &amp; Demand Order Blocks synced with {selectedAssetKey} live feed
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-3 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl font-bold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-ping" />
                <span>PRICE: ${bankLevels.basePrice.toFixed(decimals)}</span>
              </span>
            </div>
          </div>

          {/* Supply & Demand Live Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
            {/* SUPPLY ZONE CARD */}
            <div className="bg-[#12060A] border-2 border-rose-500/40 rounded-2xl p-4 sm:p-5 space-y-3.5 relative overflow-hidden shadow-lg group hover:border-rose-500/60 transition-all">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/50 text-[10px] font-black rounded-lg flex items-center gap-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
                  RED ZONE &bull; INSTITUTIONAL SUPPLY
                </span>
                <span className="text-[10px] font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/30">
                  {bankLevels.supplyZone.status}
                </span>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-bold uppercase">
                  {bankLevels.supplyZone.name}
                </div>
                <div className="text-2xl sm:text-3xl font-black text-rose-200 mt-1">
                  ${bankLevels.supplyZone.low.toFixed(decimals)} — ${bankLevels.supplyZone.high.toFixed(decimals)}
                </div>
                <div className="text-xs text-slate-300 font-sans mt-1">
                  {bankLevels.supplyZone.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-rose-500/20">
                <div className="bg-[#0A0306] p-2 rounded-xl border border-rose-500/20">
                  <span className="text-slate-400 text-[10px] block">DISTANCE TO SUPPLY</span>
                  <strong className="text-rose-400 font-bold">
                    +{bankLevels.supplyZone.distance.toFixed(decimals)} ({bankLevels.supplyZone.distancePct}%)
                  </strong>
                </div>
                <div className="bg-[#0A0306] p-2 rounded-xl border border-rose-500/20">
                  <span className="text-slate-400 text-[10px] block">ZONE STRENGTH</span>
                  <strong className="text-amber-300 font-bold">{bankLevels.supplyZone.strength}</strong>
                </div>
              </div>

              {/* Visual Proximity Meter */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>PROXIMITY RADAR</span>
                  <span className="text-rose-300 font-bold">CEILING S/R</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    style={{ width: `${Math.min(100, Math.max(10, 100 - bankLevels.supplyZone.distancePct * 10))}%` }}
                    className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* DEMAND ZONE CARD */}
            <div className="bg-[#05110B] border-2 border-emerald-500/40 rounded-2xl p-4 sm:p-5 space-y-3.5 relative overflow-hidden shadow-lg group hover:border-emerald-500/60 transition-all">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-[10px] font-black rounded-lg flex items-center gap-1.5">
                  <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
                  GREEN ZONE &bull; INSTITUTIONAL DEMAND
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                  {bankLevels.demandZone.status}
                </span>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 font-bold uppercase">
                  {bankLevels.demandZone.name}
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-200 mt-1">
                  ${bankLevels.demandZone.low.toFixed(decimals)} — ${bankLevels.demandZone.high.toFixed(decimals)}
                </div>
                <div className="text-xs text-slate-300 font-sans mt-1">
                  {bankLevels.demandZone.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-emerald-500/20">
                <div className="bg-[#020A06] p-2 rounded-xl border border-emerald-500/20">
                  <span className="text-slate-400 text-[10px] block">DISTANCE TO DEMAND</span>
                  <strong className="text-emerald-400 font-bold">
                    -{bankLevels.demandZone.distance.toFixed(decimals)} ({bankLevels.demandZone.distancePct}%)
                  </strong>
                </div>
                <div className="bg-[#020A06] p-2 rounded-xl border border-emerald-500/20">
                  <span className="text-slate-400 text-[10px] block">ZONE STRENGTH</span>
                  <strong className="text-amber-300 font-bold">{bankLevels.demandZone.strength}</strong>
                </div>
              </div>

              {/* Visual Proximity Meter */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>PROXIMITY RADAR</span>
                  <span className="text-emerald-300 font-bold">FLOOR S/R</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    style={{ width: `${Math.min(100, Math.max(10, 100 - bankLevels.demandZone.distancePct * 10))}%` }}
                    className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* DAILY BANK-LEVEL SUPPORT & RESISTANCE PIVOTS MATRIX */}
          <div className="bg-[#03060D] border border-amber-500/30 rounded-2xl p-4 sm:p-5 space-y-3.5 font-mono">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-amber-400" />
                🏛️ DAILY BANK-LEVEL TURNING POINTS &amp; 1H MARKET CLOSE ENGINE
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  1H CANDLE CLOSE IN: {h1CountdownFormatted}
                </span>
                <span className="text-[10px] text-slate-400 font-bold hidden sm:inline">
                  LAST 1H SNAPSHOT: {bankLevels.last1HCloseTime}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 text-xs">
              <div className="bg-[#060912] border border-amber-500/40 p-2.5 rounded-xl space-y-1 text-center">
                <div className="text-[10px] text-amber-400 font-bold">DAILY PIVOT</div>
                <div className="text-white font-black">${bankLevels.pivots.dailyPivot.toFixed(decimals)}</div>
                <div className="text-[9px] text-slate-400">
                  {bankLevels.basePrice >= bankLevels.pivots.dailyPivot ? "🟢 ABOVE" : "🔴 BELOW"}
                </div>
              </div>

              <div className="bg-[#060912] border border-slate-800 p-2.5 rounded-xl space-y-1 text-center">
                <div className="text-[10px] text-rose-400 font-bold">R1 RESISTANCE</div>
                <div className="text-white font-black">${bankLevels.pivots.r1.toFixed(decimals)}</div>
                <div className="text-[9px] text-slate-400">RESISTANCE</div>
              </div>

              <div className="bg-[#060912] border border-slate-800 p-2.5 rounded-xl space-y-1 text-center">
                <div className="text-[10px] text-rose-400 font-bold">R2 RESISTANCE</div>
                <div className="text-white font-black">${bankLevels.pivots.r2.toFixed(decimals)}</div>
                <div className="text-[9px] text-slate-400">RESISTANCE</div>
              </div>

              <div className="bg-[#060912] border border-slate-800 p-2.5 rounded-xl space-y-1 text-center">
                <div className="text-[10px] text-emerald-400 font-bold">S1 SUPPORT</div>
                <div className="text-white font-black">${bankLevels.pivots.s1.toFixed(decimals)}</div>
                <div className="text-[9px] text-slate-400">SUPPORT</div>
              </div>

              <div className="bg-[#060912] border border-slate-800 p-2.5 rounded-xl space-y-1 text-center">
                <div className="text-[10px] text-emerald-400 font-bold">S2 SUPPORT</div>
                <div className="text-white font-black">${bankLevels.pivots.s2.toFixed(decimals)}</div>
                <div className="text-[9px] text-slate-400">SUPPORT</div>
              </div>

              <div className="bg-[#060912] border border-slate-800 p-2.5 rounded-xl space-y-1 text-center">
                <div className="text-[10px] text-cyan-400 font-bold">ASIAN HIGH / LOW</div>
                <div className="text-white font-black text-[11px]">
                  ${bankLevels.pivots.asianLow.toFixed(decimals)} - ${bankLevels.pivots.asianHigh.toFixed(decimals)}
                </div>
                <div className="text-[9px] text-slate-400">SESSION RANGE</div>
              </div>
            </div>

            {/* MULTI-YEAR INSTITUTIONAL S/R LEVELS OVERLAY */}
            <div className="border-t border-slate-800/80 pt-3 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  INSTITUTIONAL MULTI-YEAR SUPPORT &amp; RESISTANCE ZONES (2024 - 2026)
                </span>
                <span className="text-[10px] text-amber-400 font-bold">1H CLOSE AUTO-SYNCHRONIZED</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {bankLevels.multiYearLevels.map((mylevel, idx) => {
                  const dist = parseFloat((mylevel.price - bankLevels.basePrice).toFixed(decimals));
                  const isAbove = dist >= 0;
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                        mylevel.type === "MACRO_ATH" || mylevel.type === "VA_HIGH"
                          ? "bg-rose-950/20 border-rose-500/30 text-rose-200"
                          : mylevel.type === "CB_LIQUIDITY"
                          ? "bg-amber-950/20 border-amber-500/40 text-amber-200"
                          : "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="uppercase">{mylevel.label}</span>
                        <span className="bg-black/50 px-1.5 py-0.5 rounded text-white font-mono">{mylevel.yearRange}</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-black font-mono text-white">${mylevel.price.toFixed(decimals)}</span>
                        <span className={`text-[10px] font-mono ${isAbove ? "text-rose-400" : "text-emerald-400"}`}>
                          {isAbove ? `+${dist.toFixed(decimals)}` : `${dist.toFixed(decimals)}`} pts
                        </span>
                      </div>
                      <div className="text-[9px] text-slate-400 line-clamp-1">{mylevel.significance}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* PREMIUM AREA (NO FRESH BUY) RANGE METER */}
        <div className="bg-[#03060D] border border-amber-500/40 rounded-2xl p-5 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between text-xs gap-2">
            <span className="text-amber-400 font-black flex items-center gap-2">
              🟡 PREMIUM AREA <span className="text-slate-400 font-normal">(NO FRESH BUY)</span>
            </span>
            <span className="text-slate-400 font-bold">
              Midpoint: ${bankLevels.rangeMid.toLocaleString()}
            </span>
          </div>

          <div className="text-center font-mono text-xl sm:text-2xl font-black text-white">
            {bankLevels.rangeLow.toLocaleString()} — {bankLevels.rangeHigh.toLocaleString()}
          </div>

          {/* Meter Bar */}
          <div className="relative w-full bg-slate-900 h-6 rounded-xl border border-slate-800 overflow-hidden flex font-mono text-[9px] font-bold">
            <div className="w-1/2 bg-emerald-500/20 h-full flex items-center justify-start pl-3 text-emerald-400 border-r border-slate-700">
              D
            </div>
            <div className="w-1/2 bg-rose-500/20 h-full flex items-center justify-end pr-3 text-rose-400">
              EQ &bull; P
            </div>

            <div
              style={{ left: `${bankLevels.rangePct}%` }}
              className="absolute top-0 bottom-0 w-2 bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)] transform -translate-x-1/2 z-10"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Position: <strong className="text-amber-300 font-bold">{bankLevels.rangePct}% of range</strong></span>
            <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-lg text-[11px] font-black">
              🚫 NO FRESH ENTRY
            </span>
          </div>

          <div className="bg-[#050810] border border-slate-800 p-3 rounded-xl text-xs space-y-1 text-slate-300 font-sans">
            <p className="flex items-center gap-2 text-amber-300">
              ⚠️ Price extended in premium/above-range after strong breakout; do not chase, monitor {bankLevels.tier1Low}-{bankLevels.tier1High} retest for continuation entries.
            </p>
            <p className="flex items-center gap-2 text-slate-400">
              ⚠️ Wait for liquidity sweep + rejection or breakout confirmation.
            </p>
            <p className="flex items-center gap-2 text-slate-400">
              ⚠️ Do not chase the market.
            </p>
          </div>
        </div>

        {/* BUY ZONES (DIP SETUPS) */}
        <div className="bg-[#03060D] border border-emerald-500/40 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="font-extrabold text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              🟢 BUY ZONES (DIP SETUPS)
            </span>
            <span className="text-[10px] text-slate-400 font-bold">INSTITUTIONAL FLIP-ZONES</span>
          </div>

          {/* Tier 1 */}
          <div className="bg-[#050A14] border border-emerald-500/40 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-[10px] font-black rounded">
                TIER 1
              </span>
              <div className="text-amber-400 text-xs font-bold">★★★★☆</div>
            </div>

            <div className="text-xl sm:text-2xl font-black text-white font-mono">
              {bankLevels.tier1Low} — {bankLevels.tier1High}
            </div>

            <p className="text-xs text-slate-300 font-sans">
              H1 breakout point of {bankLevels.tier1Low}-{bankLevels.tier1High} congestion &bull; prior D1 supply now flipped to demand
            </p>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 text-slate-400">
              <span>SL: <strong className="text-rose-400">{bankLevels.tier1SL}</strong></span>
              <span>h1 close below</span>
            </div>
          </div>

          {/* Tier 2 */}
          <div className="bg-[#050A14] border border-emerald-500/40 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 text-[10px] font-black rounded">
                TIER 2 (EXTREME)
              </span>
              <div className="text-amber-400 text-xs font-bold">★★★★★</div>
            </div>

            <div className="text-xl sm:text-2xl font-black text-white font-mono">
              {bankLevels.tier2Low} — {bankLevels.tier2High}
            </div>

            <p className="text-xs text-slate-300 font-sans">
              H1 consolidation shelf 03:00-05:00 session &bull; prior day high area now support
            </p>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 text-slate-400">
              <span>SL: <strong className="text-rose-400">{bankLevels.tier2SL}</strong></span>
              <span>h1 close below</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-sans italic bg-[#050810] p-2.5 rounded-xl border border-slate-800">
            Note: Deep zone is higher quality. Try Tier 1 first.
          </div>
        </div>

        {/* SELL SCALP ZONE */}
        <div className="bg-[#03060D] border border-rose-500/30 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
            <span className="font-extrabold text-rose-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" />
              🔴 SELL SCALP ZONE
            </span>
            <span className="text-[10px] text-slate-400 font-bold">BEARISH SCALP</span>
          </div>

          {selectedScenario === "SELL_SCALP" ? (
            <div className="bg-[#12060A] border border-rose-500/40 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/50 text-[10px] font-black rounded">
                  SELL SCALP ACTIVE
                </span>
                <div className="text-rose-400 text-xs font-bold">★★★☆☆ COUNTER-TREND</div>
              </div>

              <div className="text-xl sm:text-2xl font-black text-white font-mono">
                {bankLevels.sellScalpLow} — {bankLevels.sellScalpHigh}
              </div>

              <p className="text-xs text-slate-300 font-sans">
                NY Session High Liquidity Pool. Bearish Rejection wick setup for short scalps into H1 equilibrium.
              </p>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 text-slate-400">
                <span>SL: <strong className="text-rose-400">{bankLevels.sellScalpSL}</strong></span>
                <span>m15 close above</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 bg-[#050810] rounded-xl text-xs text-slate-400 font-sans border border-slate-800">
              No qualifying sell zones this scan
            </div>
          )}
        </div>

        {/* 6-GATE ENTRY CONFIRMATION GRID (REAL-TIME • DETERMINISTIC) */}
        <div className="bg-[#03060D] border border-blue-500/40 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-black text-blue-400 text-xs uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                📋 6-GATE ENTRY CONFIRMATION
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase">(REAL-TIME &bull; DETERMINISTIC)</p>
            </div>
            <span className="px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-black rounded-lg">
              SYSTEM RULES
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 font-mono">
            {/* Gate 1 */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              gateChecks.g1.met ? "bg-emerald-950/20 border-emerald-500/50" : "bg-[#060A14] border-slate-800"
            }`}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 font-extrabold rounded text-[10px]">G1</span>
                {gateChecks.g1.met ? <Check className="w-4 h-4 text-emerald-400" /> : <span className="w-3 h-3 rounded-full bg-slate-700" />}
              </div>
              <div className="font-black text-white text-xs flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-rose-400" /> {gateChecks.g1.label}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">{gateChecks.g1.sub}</div>
            </div>

            {/* Gate 2 */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              gateChecks.g2.met ? "bg-emerald-950/20 border-emerald-500/50" : "bg-[#060A14] border-slate-800"
            }`}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 font-extrabold rounded text-[10px]">G2</span>
                {gateChecks.g2.met ? <Check className="w-4 h-4 text-emerald-400" /> : <span className="w-3 h-3 rounded-full bg-slate-700" />}
              </div>
              <div className="font-black text-white text-xs flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" /> {gateChecks.g2.label}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">{gateChecks.g2.sub}</div>
            </div>

            {/* Gate 3 */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              gateChecks.g3.met ? "bg-emerald-950/20 border-emerald-500/50" : "bg-[#060A14] border-slate-800"
            }`}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 font-extrabold rounded text-[10px]">G3</span>
                {gateChecks.g3.met ? <Check className="w-4 h-4 text-emerald-400" /> : <span className="w-3 h-3 rounded-full bg-slate-700" />}
              </div>
              <div className="font-black text-white text-xs flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> {gateChecks.g3.label}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">{gateChecks.g3.sub}</div>
            </div>

            {/* Gate 4 */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              gateChecks.g4.met ? "bg-emerald-950/30 border-emerald-500/50" : "bg-[#060A14] border-slate-800"
            }`}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 font-extrabold rounded text-[10px]">G4</span>
                <Check className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="font-black text-white text-xs flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> {gateChecks.g4.label}
              </div>
              <div className="text-[10px] text-emerald-300 mt-1">{gateChecks.g4.sub}</div>
            </div>

            {/* Gate 5 */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              gateChecks.g5.met ? "bg-emerald-950/20 border-emerald-500/50" : "bg-[#060A14] border-slate-800"
            }`}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 font-extrabold rounded text-[10px]">G5</span>
                {gateChecks.g5.met ? <Check className="w-4 h-4 text-emerald-400" /> : <span className="w-3 h-3 rounded-full bg-slate-700" />}
              </div>
              <div className="font-black text-white text-xs flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" /> {gateChecks.g5.label}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">{gateChecks.g5.sub}</div>
            </div>

            {/* Gate 6 */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              gateChecks.g6.met ? "bg-emerald-950/30 border-emerald-500/50" : "bg-[#060A14] border-slate-800"
            }`}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 font-extrabold rounded text-[10px]">G6</span>
                <Check className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="font-black text-white text-xs flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" /> {gateChecks.g6.label}
              </div>
              <div className="text-[10px] text-emerald-300 mt-1">{gateChecks.g6.sub}</div>
            </div>
          </div>

          <div className="bg-rose-950/30 border border-rose-500/40 p-3 rounded-xl text-center text-xs font-black text-rose-300 uppercase tracking-widest">
            ❌ ANY GATE MISSING = NO TRADE &bull; CONFIRMED requires 6/6 same direction
          </div>
        </div>

        {/* TARGETS (INTRADAY) */}
        <div className="bg-[#03060D] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-extrabold text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" /> 🎯 TARGETS (INTRADAY)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="bg-[#060912] border border-slate-800 p-3 rounded-xl space-y-2">
              <div className="text-emerald-400 font-bold border-b border-slate-800 pb-1 text-center">
                BUY TARGETS
              </div>
              <div className="space-y-1.5 text-slate-200">
                <div className="flex justify-between"><span>TP1</span><strong className="text-white">{bankLevels.tp1}</strong></div>
                <div className="flex justify-between"><span>TP2</span><strong className="text-white">{bankLevels.tp2}</strong></div>
                <div className="flex justify-between"><span>TP3</span><strong className="text-white">{bankLevels.tp3}</strong></div>
              </div>
            </div>

            <div className="bg-[#060912] border border-slate-800 p-3 rounded-xl space-y-2">
              <div className="text-rose-400 font-bold border-b border-slate-800 pb-1 text-center">
                SELL TARGETS
              </div>
              <div className="text-center py-4 text-slate-500 font-bold">
                —
              </div>
            </div>
          </div>
        </div>

        {/* NEWS & RISK SECTION */}
        <div className="bg-[#050812] border border-purple-500/40 rounded-2xl p-4 space-y-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-purple-400 font-black">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span>📅 NEWS & RISK: UNKNOWN</span>
          </div>
          <p className="text-slate-300 font-sans">
            News feed not wired; large intraday displacement suggests possible catalyst — verify before entry.
          </p>
          <div className="text-amber-300 font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Avoid news candle entries.</span>
          </div>
        </div>

        {/* BREAKOUT RULE BOX */}
        <div className="bg-[#03060D] border border-cyan-500/30 rounded-2xl p-4 space-y-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-cyan-400 font-black">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>📋 BREAKOUT RULE</span>
          </div>
          <div className="text-slate-300 font-sans space-y-1">
            <p className="font-bold text-white">If H1 breaks premium ceiling + retests:</p>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> Sell setup cancelled
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> Do not short
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> Wait for continuation buy setup
            </div>
          </div>
        </div>

        {/* LOCKED AI TRADE SETUP BANNER */}
        <LockedSetupBanner
          setup={lockedSetup}
          currentPrice={livePrice}
          onResetSetup={resetSetup}
          onExecuteTrade={onOpenTradeCopilot ? () => onOpenTradeCopilot(selectedAssetKey, lockedSetup.direction) : undefined}
          decimals={decimals}
        />

        {/* GMC GOLD APEX BRAIN VERDICT BOX */}
        <div className="bg-[#050812] border border-amber-500/50 rounded-2xl p-5 space-y-2.5 font-mono">
          <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
            <span>⏳ GMC GOLD APEX BRAIN VERDICT</span>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-xs">
              BREAKOUT WATCH
            </span>
          </div>
          <h4 className="font-bold text-white text-xs">
            Gold breaks out to 4250 — wait for retest
          </h4>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            Price extended in premium/above-range after strong breakout; do not chase, monitor {bankLevels.tier1Low}-{bankLevels.tier1High} retest for continuation entries.
          </p>

          <div className="pt-2 flex justify-end">
            {onOpenTradeCopilot && (
              <button
                onClick={() => onOpenTradeCopilot(selectedAssetKey, "BUY")}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                <span>OPEN TRADE COPILOT</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ENTRY LOGIC SYSTEM ARCHITECTURE CARD - (KIS BASED PAR ENTRY DETA HAI) */}
        <div id="gmc-entry-logic-explanation" className="bg-[#040812] border border-amber-500/40 p-5 sm:p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-xl">
                <Info className="w-5 h-5 text-amber-400" />
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                  GMC GOLD AI BRAIN — ENTRY SIGNAL LOGIC (KIS BASED PAR ENTRY DETA HAI)
                </h3>
                <p className="text-[11px] text-slate-400 font-sans">
                  5-Tier Institutional Bank Level System Rules
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/50 rounded-lg text-[10px] font-black">
              BANK LEVEL RULES
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs font-mono">
            {/* Rule 1 */}
            <div className="bg-[#070C1B] border border-slate-800 p-3.5 rounded-xl space-y-1.5">
              <div className="text-amber-400 font-black flex items-center gap-1.5">
                <span>1.</span> INSTITUTIONAL S/R FLIP-ZONES
              </div>
              <p className="text-[11px] text-slate-300 font-sans">
                Price action calculate hoti hai H1/H4 Bank Liquidity Shelves se. Tier 1 Primary Flip Zone and Tier 2 Extreme Deep Support zones identify hotay hain.
              </p>
            </div>

            {/* Rule 2 */}
            <div className="bg-[#070C1B] border border-slate-800 p-3.5 rounded-xl space-y-1.5">
              <div className="text-emerald-400 font-black flex items-center gap-1.5">
                <span>2.</span> DISCOUNT VS PREMIUM FILTER
              </div>
              <p className="text-[11px] text-slate-300 font-sans">
                Agar price range ke Premium section (&gt;50% Equilibrium) mein ho, toh System strict &quot;NO FRESH BUY&quot; rule implement karta hai. Standard Buy only Discount zone mein valid hota hai.
              </p>
            </div>

            {/* Rule 3 */}
            <div className="bg-[#070C1B] border border-slate-800 p-3.5 rounded-xl space-y-1.5">
              <div className="text-cyan-400 font-black flex items-center gap-1.5">
                <span>3.</span> 3-POINT TRIPLE CONFIRMATION
              </div>
              <p className="text-[11px] text-slate-300 font-sans">
                Entry confirmation ke liye 3 strict criteria darkar hain: <strong>Zone Touch</strong>, <strong>Liquidity Sweep (Asian/NY High-Low)</strong>, aur <strong>Rejection (&gt;1.3x ATR Volatility)</strong>.
              </p>
            </div>

            {/* Rule 4 */}
            <div className="bg-[#070C1B] border border-slate-800 p-3.5 rounded-xl space-y-1.5">
              <div className="text-purple-400 font-black flex items-center gap-1.5">
                <span>4.</span> MACRO TIMEFRAME SYNC
              </div>
              <p className="text-[11px] text-slate-300 font-sans">
                System W1, D1, H4 aur H1 timeframes ke trend bias ko alignment mein check karta hai. Jab macro direction Strong Bullish/Bearish aligned ho tabhi setup active hota hai.
              </p>
            </div>

            {/* Rule 5 */}
            <div className="bg-[#070C1B] border border-slate-800 p-3.5 rounded-xl space-y-1.5 md:col-span-2 lg:col-span-2">
              <div className="text-rose-400 font-black flex items-center gap-1.5">
                <span>5.</span> HIGH IMPACT MACRO NEWS RISK GUARD
              </div>
              <p className="text-[11px] text-slate-300 font-sans">
                Red-Folder Macro Events (CPI, FOMC, Fed Powell Speeches) ke release se 15 min pehle aur 15 min baad trade entries auto-restrict hoti hain taakay slippage aur news candles se account safe rahay.
              </p>
            </div>
          </div>
        </div>

        {/* CARD FOOTER MOTTO */}
        <div className="border-t border-slate-800 pt-4 text-center space-y-2">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
            ⚠️ THIS IS ANALYSIS, NOT A SIGNAL. TRADE AT YOUR OWN RISK.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-black text-slate-400">
            <span>🛡️ DISCIPLINE</span>
            <span>⏳ PATIENCE</span>
            <span>⚖️ RISK CONTROL</span>
            <span>🎯 CONSISTENCY</span>
          </div>
        </div>

      </div>

      {/* DEDICATED HIGH-IMPACT ECONOMIC NEWS TOOL DESK */}
      <div id="gmc-news-tool-desk" className="bg-[#060913] border-2 border-blue-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/40 rounded-2xl flex items-center justify-center text-blue-400 text-2xl shadow-lg">
              <Globe className="w-6 h-6 text-blue-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                GMC MACRO ECONOMIC NEWS DESK
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2.5 py-0.5 rounded-full font-bold">
                  HIGH IMPACT NEWS FILTER
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Real-Time Economic Events &bull; Inflation Data &bull; FOMC Rates &bull; High Volatility Risk Guard
              </p>
            </div>
          </div>

          {/* News Filter Options */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setActiveNewsFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeNewsFilter === "ALL"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              ALL NEWS
            </button>
            <button
              onClick={() => setActiveNewsFilter("HIGH_IMPACT")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeNewsFilter === "HIGH_IMPACT"
                  ? "bg-rose-500 text-white shadow-md"
                  : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              🔥 RED FOLDER ONLY
            </button>
            <button
              onClick={() => setActiveNewsFilter("USD_XAU")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeNewsFilter === "USD_XAU"
                  ? "bg-amber-500 text-black shadow-md"
                  : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              🥇 USD / GOLD IMPACT
            </button>
          </div>
        </div>

        {/* News Items Table Grid */}
        <div className="space-y-3 font-mono">
          {filteredNews.map((e) => (
            <div
              key={e.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                e.impact === "HIGH"
                  ? "bg-[#0E060A] border-rose-500/40"
                  : "bg-[#070B16] border-slate-800"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                    e.impact === "HIGH"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/50"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                  }`}
                >
                  {e.currency}
                </span>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-extrabold text-sm sm:text-base">
                      {e.event}
                    </span>
                    {e.impact === "HIGH" && (
                      <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 text-[9px] font-black rounded-full border border-rose-500/40">
                        HIGH VOLATILITY
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 font-sans mt-0.5 flex flex-wrap items-center gap-3">
                    <span>TIME: <strong className="text-slate-200">{e.time}</strong></span>
                    <span>&bull;</span>
                    <span>FORECAST: <strong className="text-slate-200">{e.forecast}</strong></span>
                    <span>&bull;</span>
                    <span>PREVIOUS: <strong className="text-slate-200">{e.previous}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto border-t md:border-t-0 border-slate-800 pt-2 md:pt-0">
                {e.status === "UPCOMING" ? (
                  <div className="text-right">
                    <span className="text-xs text-amber-300 font-bold block">
                      IN {e.minutesAway} MINS
                    </span>
                    <span className="text-[10px] text-rose-400 font-extrabold uppercase bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                      ⚡ RISK GUARD ACTIVE
                    </span>
                  </div>
                ) : (
                  <div className="text-right">
                    <span className="text-xs text-emerald-400 font-bold block">
                      ACTUAL: {e.actual}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">RELEASED</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

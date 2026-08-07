import React, { useState } from "react";
import {
  Smartphone,
  ArrowRight,
  Lock,
  CheckCircle2,
  Search,
  Sliders,
  Shield,
  Activity,
  Zap,
  Sparkles,
} from "lucide-react";
import { LiveGoldMarketCard } from "./LiveGoldMarketCard";
import { LivePrice } from "../types";

interface BrainVaultGridProps {
  onSelectTab: (tabId: string) => void;
  isLoggedIn: boolean;
  loggedInUser: string | null;
  onOpenLoginModal: () => void;
  prices?: Record<string, LivePrice>;
  currentPrice?: number;
}

export const BrainVaultGrid: React.FC<BrainVaultGridProps> = ({
  onSelectTab,
  isLoggedIn,
  loggedInUser,
  onOpenLoginModal,
  prices = {},
  currentPrice = 4348.50,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");

  // Display user name safely from authenticated account
  const displayUsername = loggedInUser
    ? loggedInUser.includes("Ahmed") || loggedInUser === "Ahmed"
      ? "Ahmed (Admin)"
      : loggedInUser
    : "Ahmed (Admin)";

  const categories = [
    { id: "ALL", label: "SHOW ALL" },
    { id: "PRICE_ACTION", label: "PRICE ACTION" },
    { id: "SUPPORT_RESISTANCE", label: "SUPPORT & RESISTANCE" },
    { id: "SIGNALS", label: "SIGNALS" },
    { id: "GOLD", label: "GOLD" },
    { id: "VOLUME", label: "VOLUME BASED" },
    { id: "FORECASTING", label: "FORECASTING" },
  ];

  const topTools = [
    {
      id: "gmcgold",
      title: "🥇 TOP 1 – GMC GOLD Apex Bank-Zone Matrix",
      emoji: "🥇",
      tag: "TOP 1 APEX BANK-ZONE",
      tagColor: "bg-amber-400/30 text-amber-300 border-amber-400/80 shadow-[0_0_16px_rgba(234,179,8,0.6)] animate-pulse",
      desc: "Top #1 Apex Bank-Zone liquidity matrix, Gold institutional order blocks & zone maps with live trade execution",
      tabTarget: "gmcgold",
      highlight: true,
    },
    {
      id: "gmccap",
      title: "🥈 TOP 2 – GMC Alpha 1H Trend Command Engine",
      emoji: "🥈",
      tag: "TOP 2 ALPHA H1 COMMAND",
      tagColor: "bg-amber-400/20 text-amber-300 border-amber-400/60 shadow-[0_0_12px_rgba(234,179,8,0.4)]",
      desc: "The supreme 1-Hour H1 Timeframe AI Brain Master — High precision institutional H1 zone matrix with live trade execution, supply/demand maps & scenarios",
      tabTarget: "gmccap",
      highlight: true,
    },
    {
      id: "harami",
      title: "GMC Reversal Rejection Neural Radar",
      emoji: "⚔️",
      tag: "REVERSAL RADAR",
      tagColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      desc: "Top AI Master matrix synthesizing M15 order block sweeps with 99.1% Win Rate for Gold & BTC",
      tabTarget: "harami",
      highlight: true,
    },
    {
      id: "masterbrain",
      title: "GMC Sovereign AI Signal Fusion Core",
      emoji: "👑",
      tag: "FUSION CORE",
      tagColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      desc: "Reads signals from all sub-tools & synthesizes 1 unified Master Consensus verdict",
      tabTarget: "masterbrain",
      highlight: true,
    },
    {
      id: "bond007",
      title: "GMC Secret Agent Order Block Sniper",
      emoji: "🕵️‍♂️",
      tag: "SECRET AGENT",
      tagColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
      desc: "7-layer fusion • master verdict • London breaker block reclaim & high-precision sniper execution",
      tabTarget: "bond007",
      highlight: true,
    },
    {
      id: "institutional",
      title: "GMC Sovereign SMC Liquidity Desk",
      emoji: "🏛️",
      tag: "SOVEREIGN SMC",
      tagColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      desc: "Institutional Order Blocks, FVG imbalances, Premium/Discount zones & institutional liquidity sweep engine",
      tabTarget: "institutional",
      highlight: true,
    },
    {
      id: "blackshark",
      title: "GMC Apex Predator DOM & Depth Scanner",
      emoji: "🦈",
      tag: "PREDATOR DOM",
      tagColor: "bg-blue-500/20 text-blue-400 border-blue-500/40",
      desc: "Order-flow depth of market + institutional bid/ask wall radar for BTC & Gold",
      tabTarget: "blackshark",
      highlight: true,
    },
    {
      id: "sentiment",
      title: "GMC Macro Sentiment & Order Flow Gauge",
      emoji: "🎯",
      tag: "ORDER FLOW GAUGE",
      tagColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      desc: "Cross-reference AI signals with live order flow for real-time Bullish/Bearish confidence score",
      tabTarget: "sentiment",
    },
    {
      id: "heatmap",
      title: "GMC Deep Order Book Volatility Thermal",
      emoji: "🌋",
      tag: "VOLATILITY THERMAL",
      tagColor: "bg-blue-500/20 text-blue-400 border-blue-500/40",
      desc: "Clusters of stop-loss & take-profit pools • BSL/SSL entry & exit radar",
      tabTarget: "heatmap",
    },
    {
      id: "comparative",
      title: "GMC Cross-Asset Intermarket Scanner",
      emoji: "⚖️",
      tag: "INTERMARKET SCAN",
      tagColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      desc: "Dual asset side-by-side price action (Gold vs USD Index DXY) • divergence entry timing",
      tabTarget: "comparative",
    },
    {
      id: "aimaster",
      title: "GMC Vanguard 5-System Signal Matrix",
      emoji: "🦁",
      tag: "VANGUARD FUSION",
      tagColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      desc: "5-system ensemble: Command + AI Chains + GMC zones + Meer safety + Snake timing",
      tabTarget: "aimaster",
    },
    {
      id: "breakout",
      title: "GMC Kinetic Momentum Breakout Radar",
      emoji: "🚀",
      tag: "MOMENTUM BREAKOUT",
      tagColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
      desc: "XAUUSD H1 advance zone • breakout • retest • shadow setups + performance",
      tabTarget: "breakout",
    },
    {
      id: "aibrain",
      title: "GMC Quantum AI Trade Signal Director",
      emoji: "✨",
      tag: "QUANTUM DIRECTOR",
      tagColor: "bg-amber-500/20 text-amber-400 border-amber-500/40",
      desc: "69-voter consensus • GMC engine • hardening gates • MTF-aware verdict",
      tabTarget: "aibrain",
    },
    {
      id: "chart",
      title: "GMC Live Professional Charting Suite",
      emoji: "📊",
      tag: "CHARTING SUITE",
      tagColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
      desc: "Live XAUUSD & BTCUSD chart • zones, entries, volume profile and target map",
      tabTarget: "chart",
    },
    {
      id: "sniper",
      title: "GMC Micro Order Block Trigger Scanner",
      emoji: "🎯",
      tag: "ORDER BLOCK TRIGGER",
      tagColor: "bg-amber-500/20 text-amber-400 border-amber-500/40",
      desc: "Full XAUUSD & BTCUSD sniper dashboard • live order block price-action signals",
      tabTarget: "sniper",
    },
    {
      id: "nexus",
      title: "GMC Horizon Tactical Command Core",
      emoji: "⚡",
      tag: "HORIZON COMMAND",
      tagColor: "bg-amber-500/20 text-amber-400 border-amber-500/40",
      desc: "Gold intelligence platform • 10-agent council • calibrated probability • live zones",
      tabTarget: "nexus",
    },
    {
      id: "mtfdoji",
      title: "GMC Multi-Layer Supply & Demand Grid",
      emoji: "🔮",
      tag: "SUPPLY & DEMAND GRID",
      tagColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
      desc: "MTF Red Doji supply & demand zones matrix with real-time zone testing alerts",
      tabTarget: "mtfdoji",
    },
    {
      id: "cipher",
      title: "GMC Cyber-Reactor ML Pattern Predictor",
      emoji: "🤖",
      tag: "CYBER REACTOR ML",
      tagColor: "bg-amber-500/20 text-amber-400 border-amber-500/40",
      desc: "XAUUSD supply/demand ML • respect vs break probability • zone map • shadow track",
      tabTarget: "cipher",
    },
    {
      id: "doji",
      title: "GMC Stealth Candle Reversal Trigger",
      emoji: "🐍",
      tag: "STEALTH REVERSAL",
      tagColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
      desc: "Zone-lifecycle snake scanner • macro overlay • mechanical entry timing decision",
      tabTarget: "doji",
    },
    {
      id: "smc",
      title: "GMC Structural Market Cycle Engine",
      emoji: "🌊",
      tag: "MARKET CYCLE",
      tagColor: "bg-blue-500/20 text-blue-400 border-blue-500/40",
      desc: "Smart money flow, change of character (CHoCH) & market structure break radar",
      tabTarget: "smc",
    },
    {
      id: "falcon",
      title: "GMC Eagle-Eye Institutional Order Pilot",
      emoji: "🦅",
      tag: "EAGLE-EYE PILOT",
      tagColor: "bg-amber-500/20 text-amber-400 border-amber-500/40",
      desc: "High-altitude market scanner detecting institutional order block mitigation",
      tabTarget: "falcon",
    },
    {
      id: "brainspro",
      title: "GMC Multi-Agent AI Strategy Synthesizer",
      emoji: "🧠",
      tag: "STRATEGY SYNTHESIZER",
      tagColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      desc: "AI chains reasoning — multi-agent verdict aggregation and deep trade synthesis",
      tabTarget: "brainspro",
    },
    {
      id: "satoshi",
      title: "GMC Digital Asset Crypto Macro Desk",
      emoji: "🪙",
      tag: "CRYPTO MACRO DESK",
      tagColor: "bg-amber-500/20 text-amber-400 border-amber-500/40",
      desc: "BTCUSD institutional suite • order blocks, liquidity pools & real-time crypto setups",
      tabTarget: "satoshi",
    },
    {
      id: "liquidity",
      title: "GMC Market Liquidity & Depth Analyzer",
      emoji: "💧",
      tag: "DEPTH ANALYZER",
      tagColor: "bg-blue-500/20 text-blue-400 border-blue-500/40",
      desc: "Granular market depth map showing buy/sell stop liquidity build-up across pairs",
      tabTarget: "liquidity",
    },
    {
      id: "multitf",
      title: "GMC Multi-Timeframe Trend Alignment Engine",
      emoji: "📐",
      tag: "TREND ALIGNMENT",
      tagColor: "bg-amber-500/20 text-amber-400 border-amber-500/40",
      desc: "M15 • M30 • H1 • H4 • D1 sub-brain matrix — 14 voters per timeframe",
      tabTarget: "multitf",
    },
    {
      id: "whale",
      title: "GMC Whale Order Tracker & Big Money Radar",
      emoji: "🐳",
      tag: "BIG MONEY RADAR",
      tagColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
      desc: "XAUUSD & BTCUSD whale volume spike & Fair Value Gap (FVG) execution radar",
      tabTarget: "whale",
    },
    {
      id: "journal",
      title: "GMC AI Precision Trade Logger & Analytics",
      emoji: "📓",
      tag: "PRECISION JOURNAL",
      tagColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      desc: "Automated AI journal tracking every trade, analyzing mistakes & refining win rates",
      tabTarget: "journal",
    },
    {
      id: "equitytracker",
      title: "GMC Dynamic Portfolio Risk & Drawdown Monitor",
      emoji: "📈",
      tag: "RISK & EQUITY MONITOR",
      tagColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
      desc: "Live equity curve, peak-to-trough drawdown tracker & account risk telemetry",
      tabTarget: "equitytracker",
    },
    {
      id: "demoleaderboard",
      title: "GMC $5K Institutional Trader Hall",
      emoji: "🥇",
      tag: "TRADER HALL",
      tagColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      desc: "Live performance rankings of top algorithmic AI signal models",
      tabTarget: "demoleaderboard",
    },
    {
      id: "tradelog",
      title: "GMC Live Execution History & Ledger",
      emoji: "📜",
      tag: "EXECUTION HISTORY",
      tagColor: "bg-slate-500/20 text-slate-300 border-slate-500/40",
      desc: "Real-time log of every trade entry, stop-loss adjustment, and take-profit execution",
      tabTarget: "tradelog",
    },
    {
      id: "metrics",
      title: "GMC Quantitative Analytics & Win-Rate Lab",
      emoji: "📉",
      tag: "WIN-RATE LAB",
      tagColor: "bg-blue-500/20 text-blue-400 border-blue-500/40",
      desc: "Sharpe ratio, Profit Factor, win/loss breakdown & quantitative risk metrics",
      tabTarget: "metrics",
    },
    {
      id: "news",
      title: "GMC Macro Economic News Terminal",
      emoji: "📅",
      tag: "LIVE NEWS",
      tagColor: "bg-blue-500/20 text-blue-400 border-blue-500/40",
      desc: "Live economic calendar • high-impact CPI, NFP & FOMC alerts for XAUUSD & FX",
      tabTarget: "news",
    },
    {
      id: "ainews",
      title: "GMC AI Global News & Sentiment Desk",
      emoji: "📡",
      tag: "AI NEWS",
      tagColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      desc: "Real-time AI news scraper converting financial headlines into market bias scores",
      tabTarget: "ainews",
    },
    {
      id: "backtest",
      title: "GMC Quantitative Backtest Engine",
      emoji: "🔬",
      tag: "BACKTESTER",
      tagColor: "bg-amber-500/20 text-amber-400 border-amber-500/40",
      desc: "Historical strategy backtester testing GMC rules against 5+ years of market tick data",
      tabTarget: "backtest",
    },
    {
      id: "risk",
      title: "GMC Position Risk & Lot Calculator",
      emoji: "🧮",
      tag: "RISK CALCULATOR",
      tagColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
      desc: "Calculate exact lot sizes (0.01 standard) based on account balance & SL pip distance",
      tabTarget: "risk",
    },
    {
      id: "alerts",
      title: "GMC Real-Time Smart Price Alerts",
      emoji: "🔔",
      tag: "PRICE ALERTS",
      tagColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      desc: "Set custom price alerts for key order blocks, liquidity sweeps, and breakout triggers",
      tabTarget: "alerts",
    },
  ];

  // Filter tools based on search and selected category
  const filteredTools = topTools.filter((tool) => {
    const matchesSearch = searchQuery
      ? tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.desc.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    if (!matchesSearch) return false;

    if (activeCategory === "ALL") return true;
    if (activeCategory === "PRICE_ACTION")
      return (
        tool.title.includes("SMC") ||
        tool.title.includes("Order Block") ||
        tool.title.includes("Harami") ||
        tool.title.includes("Doji")
      );
    if (activeCategory === "SUPPORT_RESISTANCE")
      return (
        tool.title.includes("Supply-Demand") ||
        tool.title.includes("Zone") ||
        tool.title.includes("Breakout")
      );
    if (activeCategory === "SIGNALS")
      return (
        tool.title.includes("Signal") ||
        tool.title.includes("Sniper") ||
        tool.title.includes("Fusion") ||
        tool.title.includes("Matrix")
      );
    if (activeCategory === "GOLD")
      return (
        tool.title.includes("Gold") ||
        tool.title.includes("XAUUSD") ||
        tool.desc.includes("Gold")
      );
    if (activeCategory === "VOLUME")
      return (
        tool.title.includes("Liquidity") ||
        tool.title.includes("Heatmap") ||
        tool.title.includes("DOM") ||
        tool.title.includes("Whale")
      );
    if (activeCategory === "FORECASTING")
      return (
        tool.title.includes("ML") ||
        tool.title.includes("Neural") ||
        tool.title.includes("AI") ||
        tool.title.includes("Predict")
      );

    return true;
  });

  return (
    <div
      id="brain-vault-grid"
      className="space-y-6 pb-20 font-sans text-slate-200 max-w-7xl mx-auto px-3 sm:px-6"
    >
      {/* MAIN DASHBOARD HEADER & USER WELCOME CARD */}
      <div className="bg-gradient-to-r from-[#0D1117] via-[#070A10] to-[#0D1117] border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40 text-xs font-mono font-bold tracking-widest uppercase">
                INSTITUTIONAL AI PLATFORM
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
                <span>System Online</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-mono tracking-tight uppercase drop-shadow-md">
              GMC AI COMMAND CENTER
            </h1>
            <p className="text-sm sm:text-base text-amber-200/80 font-mono tracking-wide">
              Institutional Market Intelligence • Quantitative Decision Platform
            </p>
          </div>

          {/* User Welcome Card */}
          <div className="bg-[#070A10]/90 border border-[#D4AF37]/40 p-4 rounded-2xl flex items-center justify-between gap-4 shadow-xl min-w-[260px]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-amber-700 flex items-center justify-center font-bold text-black font-mono shadow-md">
                👑
              </div>
              <div>
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  AUTHENTICATED TRADER
                </div>
                <div className="text-sm font-black text-amber-300 font-mono">
                  Welcome, {displayUsername}
                </div>
              </div>
            </div>

            <button
              onClick={onOpenLoginModal}
              className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold border border-[#D4AF37]/50 text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all cursor-pointer"
            >
              PROFILE
            </button>
          </div>
        </div>
      </div>

      {/* LIVE GOLD MARKET CARD (ONLY MARKET WIDGET ABOVE INTELLIGENCE MODULES) */}
      <LiveGoldMarketCard prices={prices} currentPrice={currentPrice} />

      {/* ⭐ INTELLIGENCE MODULES SECTION */}
      <div className="pt-4 space-y-6">
        {/* Section Heading */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D4AF37]/20 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⭐</span>
            <h2 className="text-2xl sm:text-3xl font-black font-mono uppercase tracking-tight text-white flex items-center gap-2">
              INTELLIGENCE MODULES
            </h2>
            <span className="px-3 py-1 rounded-full bg-[#D4AF37]/10 text-amber-300 border border-[#D4AF37]/30 text-xs font-mono font-bold">
              {filteredTools.length} ACTIVE ENGINES
            </span>
          </div>

          {/* Search Input */}
          <div className="relative flex items-center min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search AI modules..."
              className="w-full bg-[#070A10] border border-[#D4AF37]/30 focus:border-[#D4AF37] text-slate-100 placeholder:text-slate-500 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none transition-all font-mono"
            />
          </div>
        </div>

        {/* Category Filter Capsules */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all uppercase whitespace-nowrap cursor-pointer border ${
                  isActive
                    ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.4)]"
                    : "bg-[#070A10] text-slate-400 border-slate-800 hover:text-white hover:border-[#D4AF37]/40"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* INTELLIGENCE MODULE CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => onSelectTab(tool.tabTarget)}
              className="bg-gradient-to-b from-[#0D1117] to-[#070A10] border border-[#D4AF37]/25 hover:border-[#D4AF37]/80 rounded-2xl group cursor-pointer overflow-hidden flex flex-col justify-between p-5 space-y-4 relative transition-all duration-300 hover:shadow-[0_0_25px_rgba(212,175,55,0.18)] hover:-translate-y-1 backdrop-blur-xl"
            >
              {/* Card Top Row */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-11 h-11 bg-[#070A10] border border-[#D4AF37]/40 rounded-xl flex items-center justify-center text-2xl shadow-inner group-hover:border-[#D4AF37] group-hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all">
                    {tool.emoji}
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border ${tool.tagColor || "bg-amber-500/10 text-amber-300 border-amber-500/30"}`}>
                    {tool.tag}
                  </span>
                </div>

                {/* Module Title & Description */}
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white group-hover:text-[#D4AF37] transition-colors tracking-tight font-mono">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-slate-300 font-normal leading-relaxed mt-2 line-clamp-2">
                    {tool.desc}
                  </p>
                </div>
              </div>

              {/* Card Bottom CTA Row */}
              <div className="pt-3 border-t border-slate-800/90 flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>SYNCHRONIZED</span>
                </span>

                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#D4AF37] group-hover:translate-x-1 transition-transform">
                  <span>LAUNCH</span>
                  <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

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
  latencyMs?: number;
}

export const BrainVaultGrid: React.FC<BrainVaultGridProps> = ({
  onSelectTab,
  isLoggedIn,
  loggedInUser,
  onOpenLoginModal,
  prices = {},
  currentPrice = 4402.50,
  latencyMs = 14,
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
    // ⚡ GMC TRADING — MULTI-TIMEFRAME REJECTION & CONFIRMATION ENGINE
    {
      id: "gmctrading",
      title: "⚡ GMC TRADING — Multi-Timeframe Rejection & Confirmation Engine",
      emoji: "⚡",
      tag: "GMC TRADING APEX",
      statusLabel: "APEX #1",
      desc: "Multi-Timeframe Matrix (1M–1D), Live Setup Card, SMC Key Zones (Demand/Supply), Confirmation Ladder & Strict Verdict Discipline.",
      useCase: "Top-tier high conviction institutional execution engine for Gold, Crypto & Forex.",
      btnText: "Open GMC Trading",
      tabTarget: "gmctrading",
      highlight: true,
      category: "SIGNALS",
    },
    // 🎯 TOP 1 TRADE EXECUTION MAP — XAUUSD MULTI-TIMEFRAME SMART MAPPING
    {
      id: "tradeexecutionmap",
      title: "🎯 Trade Execution Map — Multi-Timeframe Smart Mapping & 1M Execution",
      emoji: "🎯",
      tag: "TOP 1 EXECUTION MAP",
      statusLabel: "FLAGSHIP",
      desc: "4H Macro Context → 1H Structure → 15M Primary POI → 5M Refinement → 1M Precision Execution Trigger.",
      useCase: "Multi-timeframe hierarchy smart mapping (4H→1H→15M→5M→1M) for XAUUSD.",
      btnText: "Open Execution Map",
      tabTarget: "tradeexecutionmap",
      highlight: true,
      category: "SIGNALS",
    },
    // 👑 TOP LEVEL KEYSTONE PREMIUM GOLD SETUP MODULE
    {
      id: "levelkeystone",
      title: "👑 LEVEL KEYSTONE — XAUUSD Premium AI Brain Setups",
      emoji: "👑",
      tag: "LEVEL KEYSTONE TOP 1",
      statusLabel: "FLAGSHIP",
      desc: "XAUUSD high-confidence setups with 4-timeframe AI Brain analysis (H1→M30→M15→M5) & news filter.",
      useCase: "Top 1 filtered Gold setups with Entry, SL, TP1, TP2 & AI reasoning.",
      btnText: "Open Keystone",
      tabTarget: "levelkeystone",
      highlight: true,
      category: "SIGNALS",
    },
    // 🏆 TOP RANKED PRIMARY TOOLS (EXACT EXISTING RANKING PRESERVED)
    {
      id: "gmcgold",
      title: "🥇 TOP 1 – GMC GOLD Apex Bank-Zone Matrix",
      emoji: "🥇",
      tag: "APEX BANK-ZONE",
      statusLabel: "FLAGSHIP",
      desc: "Top #1 Apex Bank-Zone liquidity matrix, Gold institutional order blocks & zone maps with live trade execution.",
      useCase: "Bank-level institutional supply & demand liquidity zones.",
      btnText: "Open Matrix",
      tabTarget: "gmcgold",
      highlight: true,
      category: "SUPPORT_RESISTANCE",
    },
    {
      id: "gmccap",
      title: "🥈 TOP 2 – GMC Alpha 1H Trend Command Engine",
      emoji: "🥈",
      tag: "ALPHA H1 COMMAND",
      statusLabel: "LIVE",
      desc: "Top #2 Supreme 1-Hour H1 Timeframe AI Brain Master with high-precision institutional zone matrix.",
      useCase: "High-precision H1 timeframe trend direction & execution.",
      btnText: "Launch Engine",
      tabTarget: "gmccap",
      highlight: true,
      category: "SIGNALS",
    },
    {
      id: "goldintelligence",
      title: "🌟 Gold Intelligence — 25-Yr Research & Forecast Core",
      emoji: "🌟",
      tag: "25-YR GOLD INTEL",
      statusLabel: "FLAGSHIP",
      desc: "25-Year Gold seasonality engine, economic news reactions, event scenario planner & probability forecast core.",
      useCase: "Multi-dimensional 25-year gold macro analytics.",
      btnText: "View Intelligence",
      tabTarget: "goldintelligence",
      highlight: true,
      category: "GOLD",
    },
    {
      id: "harami",
      title: "⚔️ GMC Reversal Rejection Neural Radar",
      emoji: "⚔️",
      tag: "REVERSAL RADAR",
      statusLabel: "LIVE",
      desc: "M15 order block reversal rejection neural radar with 99.1% Win Rate for Gold & BTC.",
      useCase: "Micro order-block sweep & rejection sniper execution.",
      btnText: "Open Radar",
      tabTarget: "harami",
      highlight: true,
      category: "PRICE_ACTION",
    },
    {
      id: "masterbrain",
      title: "👑 GMC Sovereign AI Signal Fusion Core",
      emoji: "👑",
      tag: "FUSION CORE",
      statusLabel: "FLAGSHIP",
      desc: "Reads signals from all sub-tools & synthesizes 1 unified Master Consensus verdict.",
      useCase: "Multi-engine signal synthesis & consensus validation.",
      btnText: "View Fusion",
      tabTarget: "masterbrain",
      highlight: true,
      category: "SIGNALS",
    },

    // 🌟 10 STRUCTURED CORE INTELLIGENCE MODULES
    {
      id: "mod_signals",
      title: "1. AI Trade Signal Module",
      emoji: "🤖",
      tag: "SIGNALS ENGINE",
      statusLabel: "LIVE",
      desc: "Realtime market data, trend direction, entry zones, stop loss, take profit & confidence scores.",
      useCase: "Live high-probability trade entry & risk setup generation.",
      btnText: "Open Signals",
      tabTarget: "aibrain",
      highlight: true,
      category: "SIGNALS",
    },
    {
      id: "mod_news_analyzer",
      title: "2. News Impact Analyzer",
      emoji: "📡",
      tag: "NEWS ANALYZER",
      statusLabel: "ACTIVE",
      desc: "Upcoming high-impact news (NFP, FOMC, CPI, Interest Rate) & gold price impact analysis.",
      useCase: "Macro economic news event impact & volatility calculation.",
      btnText: "Analyze Impact",
      tabTarget: "ainews",
      highlight: true,
      category: "FORECASTING",
    },
    {
      id: "mod_xauusd_intel",
      title: "3. XAUUSD Market Intelligence",
      emoji: "🌟",
      tag: "XAUUSD INTEL",
      statusLabel: "FLAGSHIP",
      desc: "Technical, fundamental & 25-yr historical data combined analysis for Gold.",
      useCase: "Multi-dimensional XAUUSD spot market assessment.",
      btnText: "View Intelligence",
      tabTarget: "goldintelligence",
      highlight: true,
      category: "GOLD",
    },
    {
      id: "mod_25y_data",
      title: "4. 25-Year Historical Data Module",
      emoji: "📊",
      tag: "HISTORICAL DATA",
      statusLabel: "LIVE",
      desc: "25 years of gold historical patterns (2001–2026), monthly movement & seasonal reactions.",
      useCase: "Long-term statistical gold pattern back-testing & research.",
      btnText: "Explore Data",
      tabTarget: "goldintelligence",
      highlight: true,
      category: "GOLD",
    },
    {
      id: "mod_econ_calendar",
      title: "5. Economic Calendar Module",
      emoji: "📅",
      tag: "ECONOMIC CALENDAR",
      statusLabel: "ACTIVE",
      desc: "Important upcoming news events, release time (UTC/GST), expected impact & countdown system.",
      useCase: "Event tracking & news release countdown warnings.",
      btnText: "Open Calendar",
      tabTarget: "news",
      highlight: false,
      category: "FORECASTING",
    },
    {
      id: "mod_ai_pred",
      title: "6. AI Prediction Engine",
      emoji: "🔮",
      tag: "PREDICTION ENGINE",
      statusLabel: "NEW",
      desc: "Past data, live market conditions & news analysis for future movement prediction.",
      useCase: "Predictive scenario modeling & directional bias estimation.",
      btnText: "Run Prediction",
      tabTarget: "cipher",
      highlight: true,
      category: "FORECASTING",
    },
    {
      id: "mod_risk_calc",
      title: "7. Risk Management Calculator",
      emoji: "🧮",
      tag: "RISK CALCULATOR",
      statusLabel: "ACTIVE",
      desc: "Lot size (0.01 std), stop loss, account balance & risk percentage trade calculation.",
      useCase: "Position sizing & account drawdown prevention.",
      btnText: "Open Calculator",
      tabTarget: "risk",
      highlight: false,
      category: "PRICE_ACTION",
    },
    {
      id: "mod_sentiment",
      title: "8. Market Sentiment Module",
      emoji: "🎯",
      tag: "SENTIMENT GAUGE",
      statusLabel: "LIVE",
      desc: "Bullish or bearish market sentiment, order flow volume behavior & trend strength.",
      useCase: "Real-time buyer/seller sentiment gauge & confidence score.",
      btnText: "Check Sentiment",
      tabTarget: "sentiment",
      highlight: false,
      category: "VOLUME",
    },
    {
      id: "mod_prenew_setup",
      title: "9. Pre-News Trade Setup Module",
      emoji: "⚡",
      tag: "PRE-NEWS SETUP",
      statusLabel: "FLAGSHIP",
      desc: "AI-based T-2H pre-news trade setup generated only during high-probability conditions.",
      useCase: "Qualified news catalyst preparation & T-2H signal gating.",
      btnText: "View Setup",
      tabTarget: "goldintelligence",
      highlight: true,
      category: "SIGNALS",
    },
    {
      id: "mod_monthly_forecast",
      title: "10. Monthly Gold Forecast Module",
      emoji: "🗓️",
      tag: "MONTHLY FORECAST",
      statusLabel: "LIVE",
      desc: "Monthly gold direction forecast based on previous years data & upcoming news.",
      useCase: "Long-term monthly trend projection & macro planning.",
      btnText: "View Forecast",
      tabTarget: "goldintelligence",
      highlight: true,
      category: "GOLD",
    },

    // ⚡ ADDITIONAL SYSTEM & SPECIALIZED TRADING TOOLS (COMPLETE CATALOG)
    {
      id: "bond007",
      title: "GMC Secret Agent Order Block Sniper",
      emoji: "🕵️‍♂️",
      tag: "SECRET AGENT",
      statusLabel: "LIVE",
      desc: "7-layer fusion • London breaker block reclaim & high-precision sniper execution.",
      useCase: "Breaker block reclaim & London session sniper trades.",
      btnText: "Open Sniper",
      tabTarget: "bond007",
      highlight: true,
      category: "SIGNALS",
    },
    {
      id: "institutional",
      title: "GMC Sovereign SMC Liquidity Desk",
      emoji: "🏛️",
      tag: "SOVEREIGN SMC",
      statusLabel: "ACTIVE",
      desc: "Institutional Order Blocks, FVG imbalances, Premium/Discount zones & liquidity sweeps.",
      useCase: "SMC structure, FVG gaps & liquidity pool mapping.",
      btnText: "Launch SMC Desk",
      tabTarget: "institutional",
      highlight: true,
      category: "SUPPORT_RESISTANCE",
    },
    {
      id: "blackshark",
      title: "GMC Apex Predator DOM & Depth Scanner",
      emoji: "🦈",
      tag: "PREDATOR DOM",
      statusLabel: "LIVE",
      desc: "Order-flow depth of market + institutional bid/ask wall radar for BTC & Gold.",
      useCase: "Depth of market order book wall analysis.",
      btnText: "Open Scanner",
      tabTarget: "blackshark",
      highlight: true,
      category: "VOLUME",
    },
    {
      id: "heatmap",
      title: "GMC Deep Order Book Volatility Thermal",
      emoji: "🌋",
      tag: "VOLATILITY THERMAL",
      statusLabel: "ACTIVE",
      desc: "Clusters of stop-loss & take-profit pools • BSL/SSL entry & exit radar.",
      useCase: "Heatmap visualization of liquidity clusters.",
      btnText: "View Heatmap",
      tabTarget: "heatmap",
      highlight: false,
      category: "VOLUME",
    },
    {
      id: "d3heatmap",
      title: "GMC D3 Institutional Liquidity Thermal",
      emoji: "🔥",
      tag: "D3 THERMAL",
      statusLabel: "LIVE",
      desc: "Interactive D3 liquidity thermal map & real-time order book cluster radar.",
      useCase: "D3 interactive heatmap order book depth visualization.",
      btnText: "Launch Thermal",
      tabTarget: "d3heatmap",
      highlight: false,
      category: "VOLUME",
    },
    {
      id: "comparative",
      title: "GMC Cross-Asset Intermarket Scanner",
      emoji: "⚖️",
      tag: "INTERMARKET SCAN",
      statusLabel: "ACTIVE",
      desc: "Dual asset side-by-side price action (Gold vs USD Index DXY) • divergence entry timing.",
      useCase: "Intermarket DXY vs XAUUSD divergence tracking.",
      btnText: "Open Terminal",
      tabTarget: "comparative",
      highlight: false,
      category: "FORECASTING",
    },
    {
      id: "aimaster",
      title: "GMC Vanguard 5-System Signal Matrix",
      emoji: "🦁",
      tag: "VANGUARD MATRIX",
      statusLabel: "ACTIVE",
      desc: "5-system ensemble: Command + AI Chains + GMC zones + Meer safety + Snake timing.",
      useCase: "Multi-system ensemble consensus validation.",
      btnText: "Launch Vanguard",
      tabTarget: "aimaster",
      highlight: false,
      category: "SIGNALS",
    },
    {
      id: "breakout",
      title: "GMC Kinetic Momentum Breakout Radar",
      emoji: "🚀",
      tag: "MOMENTUM BREAKOUT",
      statusLabel: "NEW",
      desc: "XAUUSD H1 advance zone • breakout • retest • shadow setups + performance.",
      useCase: "Momentum breakout & retest confirmation.",
      btnText: "Open Radar",
      tabTarget: "breakout",
      highlight: false,
      category: "PRICE_ACTION",
    },
    {
      id: "aibrain",
      title: "GMC Quantum AI Trade Signal Director",
      emoji: "✨",
      tag: "QUANTUM DIRECTOR",
      statusLabel: "FLAGSHIP",
      desc: "69-voter consensus • GMC engine • hardening gates • MTF-aware verdict.",
      useCase: "Quantum voter consensus trade signals.",
      btnText: "Open Director",
      tabTarget: "aibrain",
      highlight: true,
      category: "SIGNALS",
    },
    {
      id: "chart",
      title: "GMC Live Professional Charting Suite",
      emoji: "📊",
      tag: "CHARTING SUITE",
      statusLabel: "LIVE",
      desc: "Live XAUUSD & BTCUSD chart • zones, entries, volume profile and target map.",
      useCase: "Interactive charting with institutional overlay.",
      btnText: "Open Charts",
      tabTarget: "chart",
      highlight: false,
      category: "PRICE_ACTION",
    },
    {
      id: "sniper",
      title: "GMC Micro Order Block Trigger Scanner",
      emoji: "🎯",
      tag: "ORDER BLOCK TRIGGER",
      statusLabel: "ACTIVE",
      desc: "Full XAUUSD & BTCUSD sniper dashboard • live order block price-action signals.",
      useCase: "Micro timeframe order block triggers.",
      btnText: "Open Trigger",
      tabTarget: "sniper",
      highlight: false,
      category: "PRICE_ACTION",
    },
    {
      id: "nexus",
      title: "GMC Horizon Tactical Command Core",
      emoji: "⚡",
      tag: "HORIZON COMMAND",
      statusLabel: "LIVE",
      desc: "Gold intelligence platform • 10-agent council • calibrated probability • live zones.",
      useCase: "10-agent AI council strategy decision engine.",
      btnText: "Open Command",
      tabTarget: "nexus",
      highlight: false,
      category: "SIGNALS",
    },
    {
      id: "mtfdoji",
      title: "GMC Multi-Layer Supply & Demand Grid",
      emoji: "🔮",
      tag: "SUPPLY DEMAND GRID",
      statusLabel: "ACTIVE",
      desc: "MTF Red Doji supply & demand zones matrix with real-time zone testing alerts.",
      useCase: "Multi-timeframe supply & demand zone grid.",
      btnText: "View Grid",
      tabTarget: "mtfdoji",
      highlight: false,
      category: "SUPPORT_RESISTANCE",
    },
    {
      id: "cipher",
      title: "GMC Cyber-Reactor ML Pattern Predictor",
      emoji: "🤖",
      tag: "CYBER REACTOR ML",
      statusLabel: "ACTIVE",
      desc: "XAUUSD supply/demand ML • respect vs break probability • zone map • shadow track.",
      useCase: "Machine learning pattern recognition & zone respect predictions.",
      btnText: "Run ML Engine",
      tabTarget: "cipher",
      highlight: false,
      category: "FORECASTING",
    },
    {
      id: "doji",
      title: "GMC Stealth Candle Reversal Trigger",
      emoji: "🐍",
      tag: "STEALTH REVERSAL",
      statusLabel: "LIVE",
      desc: "Zone-lifecycle snake scanner • macro overlay • mechanical entry timing decision.",
      useCase: "Stealth candlestick pattern rejection trigger.",
      btnText: "Launch Trigger",
      tabTarget: "doji",
      highlight: false,
      category: "PRICE_ACTION",
    },
    {
      id: "smc",
      title: "GMC Structural Market Cycle Engine",
      emoji: "🌊",
      tag: "MARKET CYCLE",
      statusLabel: "ACTIVE",
      desc: "Smart money flow, change of character (CHoCH) & market structure break radar.",
      useCase: "Market structure shift (MSS) & CHoCH tracking.",
      btnText: "View Cycles",
      tabTarget: "smc",
      highlight: false,
      category: "PRICE_ACTION",
    },
    {
      id: "falcon",
      title: "GMC Eagle-Eye Institutional Order Pilot",
      emoji: "🦅",
      tag: "EAGLE-EYE PILOT",
      statusLabel: "LIVE",
      desc: "High-altitude market scanner detecting institutional order block mitigation.",
      useCase: "Institutional order block mitigation scanner.",
      btnText: "Open Pilot",
      tabTarget: "falcon",
      highlight: false,
      category: "SUPPORT_RESISTANCE",
    },
    {
      id: "brainspro",
      title: "GMC Multi-Agent AI Strategy Synthesizer",
      emoji: "🧠",
      tag: "STRATEGY SYNTHESIZER",
      statusLabel: "FLAGSHIP",
      desc: "AI chains reasoning — multi-agent verdict aggregation and deep trade synthesis.",
      useCase: "Deep multi-agent chain reasoning synthesis.",
      btnText: "Synthesize",
      tabTarget: "brainspro",
      highlight: true,
      category: "SIGNALS",
    },
    {
      id: "satoshi",
      title: "GMC Digital Asset Crypto Macro Desk",
      emoji: "🪙",
      tag: "CRYPTO MACRO DESK",
      statusLabel: "NEW",
      desc: "BTCUSD institutional suite • order blocks, liquidity pools & real-time crypto setups.",
      useCase: "Institutional crypto & Bitcoin macro analysis.",
      btnText: "Open Desk",
      tabTarget: "satoshi",
      highlight: false,
      category: "SIGNALS",
    },
    {
      id: "liquidity",
      title: "GMC Market Liquidity & Depth Analyzer",
      emoji: "💧",
      tag: "DEPTH ANALYZER",
      statusLabel: "ACTIVE",
      desc: "Granular market depth map showing buy/sell stop liquidity build-up across pairs.",
      useCase: "Granular order book market depth analysis.",
      btnText: "Analyze Depth",
      tabTarget: "liquidity",
      highlight: false,
      category: "VOLUME",
    },
    {
      id: "multitf",
      title: "GMC Multi-Timeframe Trend Alignment Engine",
      emoji: "📐",
      tag: "TREND ALIGNMENT",
      statusLabel: "ACTIVE",
      desc: "M15 • M30 • H1 • H4 • D1 sub-brain matrix — 14 voters per timeframe.",
      useCase: "Multi-timeframe trend alignment check.",
      btnText: "Check Alignment",
      tabTarget: "multitf",
      highlight: false,
      category: "SIGNALS",
    },
    {
      id: "whale",
      title: "GMC Whale Order Tracker & Big Money Radar",
      emoji: "🐳",
      tag: "BIG MONEY RADAR",
      statusLabel: "LIVE",
      desc: "XAUUSD & BTCUSD whale volume spike & Fair Value Gap (FVG) execution radar.",
      useCase: "Whale order volume spike & FVG execution radar.",
      btnText: "Track Whales",
      tabTarget: "whale",
      highlight: false,
      category: "VOLUME",
    },
    {
      id: "journal",
      title: "GMC AI Precision Trade Logger & Analytics",
      emoji: "📓",
      tag: "PRECISION JOURNAL",
      statusLabel: "SYNCHRONIZED",
      desc: "Automated AI journal tracking every trade, analyzing mistakes & refining win rates.",
      useCase: "Automated trade journaling & error diagnosis.",
      btnText: "Open Journal",
      tabTarget: "journal",
      highlight: false,
      category: "PRICE_ACTION",
    },
    {
      id: "equitytracker",
      title: "GMC Dynamic Portfolio Risk & Drawdown Monitor",
      emoji: "📈",
      tag: "RISK MONITOR",
      statusLabel: "ACTIVE",
      desc: "Live equity curve, peak-to-trough drawdown tracker & account risk telemetry.",
      useCase: "Account equity curve & peak-to-trough drawdown monitor.",
      btnText: "Open Monitor",
      tabTarget: "equitytracker",
      highlight: false,
      category: "PRICE_ACTION",
    },
    {
      id: "demoleaderboard",
      title: "GMC $5K Institutional Trader Hall",
      emoji: "🥇",
      tag: "TRADER HALL",
      statusLabel: "LIVE",
      desc: "Live performance rankings of top algorithmic AI signal models.",
      useCase: "Top performing AI trading model rankings.",
      btnText: "View Rankings",
      tabTarget: "demoleaderboard",
      highlight: false,
      category: "SIGNALS",
    },
    {
      id: "tradelog",
      title: "GMC Live Execution History & Ledger",
      emoji: "📜",
      tag: "EXECUTION LOG",
      statusLabel: "SYNCHRONIZED",
      desc: "Real-time log of every trade entry, stop-loss adjustment, and take-profit execution.",
      useCase: "Real-time trade entry/exit ledger.",
      btnText: "View Ledger",
      tabTarget: "tradelog",
      highlight: false,
      category: "PRICE_ACTION",
    },
    {
      id: "metrics",
      title: "GMC Quantitative Analytics & Win-Rate Lab",
      emoji: "📉",
      tag: "WIN-RATE LAB",
      statusLabel: "ACTIVE",
      desc: "Sharpe ratio, Profit Factor, win/loss breakdown & quantitative risk metrics.",
      useCase: "Quantitative metrics & profit factor analytics.",
      btnText: "Open Lab",
      tabTarget: "metrics",
      highlight: false,
      category: "FORECASTING",
    },
    {
      id: "news",
      title: "GMC Macro Economic News Terminal",
      emoji: "📅",
      tag: "LIVE NEWS",
      statusLabel: "LIVE",
      desc: "Live economic calendar • high-impact CPI, NFP & FOMC alerts for XAUUSD & FX.",
      useCase: "Economic calendar & live news event triggers.",
      btnText: "Open Terminal",
      tabTarget: "news",
      highlight: false,
      category: "FORECASTING",
    },
    {
      id: "ainews",
      title: "GMC AI Global News & Sentiment Desk",
      emoji: "📡",
      tag: "AI NEWS",
      statusLabel: "ACTIVE",
      desc: "Real-time AI news scraper converting financial headlines into market bias scores.",
      useCase: "AI news headline sentiment scoring.",
      btnText: "Open News Desk",
      tabTarget: "ainews",
      highlight: false,
      category: "FORECASTING",
    },
    {
      id: "backtest",
      title: "GMC Quantitative Backtest Engine",
      emoji: "🔬",
      tag: "BACKTESTER",
      statusLabel: "ACTIVE",
      desc: "Historical strategy backtester testing GMC rules against 5+ years of market tick data.",
      useCase: "Quantitative historical strategy testing & rule validation.",
      btnText: "Run Backtest",
      tabTarget: "backtest",
      highlight: false,
      category: "FORECASTING",
    },
    {
      id: "risk",
      title: "GMC Position Risk & Lot Calculator",
      emoji: "🧮",
      tag: "RISK CALCULATOR",
      statusLabel: "ACTIVE",
      desc: "Calculate exact lot sizes (0.01 standard) based on account balance & SL pip distance.",
      useCase: "Exact lot size & risk calculation.",
      btnText: "Open Calculator",
      tabTarget: "risk",
      highlight: false,
      category: "PRICE_ACTION",
    },
    {
      id: "alerts",
      title: "GMC Real-Time Smart Price Alerts",
      emoji: "🔔",
      tag: "PRICE ALERTS",
      statusLabel: "SYNCHRONIZED",
      desc: "Set custom price alerts for key order blocks, liquidity sweeps, and breakout triggers.",
      useCase: "Automated price level & zone alerts.",
      btnText: "Set Alerts",
      tabTarget: "alerts",
      highlight: false,
      category: "PRICE_ACTION",
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
      className="space-y-6 pb-20 font-sans text-[#F3F4F5] max-w-7xl mx-auto px-3 sm:px-6"
    >
      {/* MAIN DASHBOARD HEADER & USER WELCOME CARD */}
      <div className="bg-[#080A0D] border border-[#292E35] rounded-2xl p-6 sm:p-8 shadow-none relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded bg-[rgba(241,204,107,0.08)] text-[#F1CC6B] border border-[rgba(241,204,107,0.3)] text-xs font-mono font-semibold tracking-wider uppercase">
                INSTITUTIONAL AI PLATFORM
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#101318] border border-[#2C3239] text-[#74D8A0] font-mono text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-[#74D8A0]" />
                <span>System Online</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight uppercase">
              GMC AI COMMAND CENTER
            </h1>
            <p className="text-xs sm:text-sm text-[#9299A3] font-mono tracking-wide">
              Institutional Market Intelligence • Quantitative Decision Platform
            </p>
          </div>

          {/* User Welcome Card */}
          <div className="bg-[#111419] border border-[#292E35] p-4 rounded-xl flex items-center justify-between gap-4 min-w-[260px]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#101318] border border-[#2C3239] flex items-center justify-center font-bold text-[#F1CC6B] font-mono">
                👑
              </div>
              <div>
                <div className="text-[11px] font-mono text-[#9299A3] uppercase tracking-wider">
                  AUTHENTICATED TRADER
                </div>
                <div className="text-xs font-semibold text-[#F1CC6B] font-mono">
                  Welcome, {displayUsername}
                </div>
              </div>
            </div>

            <button
              onClick={onOpenLoginModal}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border border-[rgba(241,204,107,0.4)] text-[#E2BA57] bg-[rgba(241,204,107,0.04)] hover:bg-[rgba(241,204,107,0.1)] transition-all cursor-pointer"
            >
              PROFILE
            </button>
          </div>
        </div>
      </div>

      {/* LIVE GOLD MARKET CARD (ONLY MARKET WIDGET ABOVE INTELLIGENCE MODULES) */}
      <LiveGoldMarketCard prices={prices} currentPrice={currentPrice} latencyMs={latencyMs} />

      {/* ⭐ INTELLIGENCE MODULES SECTION */}
      <div className="pt-4 space-y-6">
        {/* Section Heading */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#272C32] pb-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">⭐</span>
            <h2 className="text-xl sm:text-2xl font-bold font-mono uppercase tracking-tight text-white flex items-center gap-2">
              INTELLIGENCE MODULES
            </h2>
            <span className="px-3 py-1 rounded bg-[rgba(241,204,107,0.08)] text-[#F1CC6B] border border-[rgba(241,204,107,0.3)] text-xs font-mono font-semibold">
              {filteredTools.length} ACTIVE ENGINES
            </span>
          </div>

          {/* Search Input */}
          <div className="relative flex items-center min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 text-[#646C77] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search AI modules..."
              className="w-full bg-[#0E1115] border border-[#2B3138] focus:border-[rgba(241,204,107,0.65)] text-[#F3F4F5] placeholder:text-[#646C77] rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none transition-all font-mono"
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all uppercase whitespace-nowrap cursor-pointer border ${
                  isActive
                    ? "pill-filter-active"
                    : "pill-filter-inactive"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* INTELLIGENCE MODULE CARDS GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          {filteredTools.map((tool) => {
            let statusLabel = tool.statusLabel || "SYNCHRONIZED";
            let statusStyle = "bg-[#101318] text-[#9299A3] border-[#2B3037]";
            let dotColor = "bg-[#74D8A0]";

            if (statusLabel === "FLAGSHIP") {
              statusStyle = "bg-[rgba(241,204,107,0.1)] text-[#F1CC6B] border-[rgba(241,204,107,0.35)]";
              dotColor = "bg-[#F1CC6B]";
            } else if (statusLabel === "LIVE") {
              statusStyle = "bg-[#17342E] text-[#74D8A0] border-[rgba(116,216,160,0.35)]";
              dotColor = "bg-[#74D8A0]";
            } else if (statusLabel === "ACTIVE") {
              statusStyle = "bg-[#17342E] text-[#74D8A0] border-[rgba(116,216,160,0.35)]";
              dotColor = "bg-[#74D8A0]";
            } else if (statusLabel === "NEW") {
              statusStyle = "bg-[rgba(241,204,107,0.08)] text-[#F1CC6B] border-[rgba(241,204,107,0.25)]";
              dotColor = "bg-[#F1CC6B]";
            }

            return (
              <div
                key={tool.id}
                onClick={() => onSelectTab(tool.tabTarget)}
                className={`bg-[#111419] border ${
                  tool.highlight
                    ? "border-[rgba(241,204,107,0.35)] shadow-[0_0_12px_rgba(241,204,107,0.05)]"
                    : "border-[#292E35]"
                } hover:border-[rgba(241,204,107,0.55)] rounded-xl group cursor-pointer p-3 sm:p-3.5 transition-all flex flex-col justify-between space-y-2.5 relative overflow-hidden`}
              >
                {/* Top Row: Icon + Category Tag & Status Badge */}
                <div className="flex items-start justify-between gap-1.5">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#0E1115] border border-[#252A31] rounded-lg flex items-center justify-center text-base sm:text-lg shrink-0 group-hover:border-[rgba(241,204,107,0.5)] transition-colors">
                    {tool.emoji}
                  </div>

                  <div className="flex flex-col items-end gap-1 min-w-0">
                    <span className="text-[9px] font-mono font-medium text-[#9299A3] uppercase tracking-tight truncate max-w-[100px] sm:max-w-[120px] text-right">
                      {tool.tag}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold uppercase tracking-wider flex items-center gap-1 border shrink-0 ${statusStyle}`}
                    >
                      <span className={`w-1 h-1 rounded-full ${dotColor}`} />
                      <span>{statusLabel}</span>
                    </span>
                  </div>
                </div>

                {/* Module Title & Short Explanation */}
                <div className="space-y-1">
                  <h3 className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#F1CC6B] transition-colors tracking-tight font-mono leading-snug line-clamp-2">
                    {tool.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-[#9299A3] font-sans leading-tight line-clamp-2">
                    {tool.desc}
                  </p>
                </div>

                {/* Use Case & Action Button */}
                <div className="pt-2 border-t border-[#252A31] flex items-center justify-between gap-1 text-[10px] font-mono">
                  <span className="text-[#9299A3] truncate text-[9px] hidden xs:inline">
                    {tool.useCase ? tool.useCase.slice(0, 24) + "..." : "XAUUSD Analytics"}
                  </span>
                  <div className="flex items-center gap-1 font-semibold text-[#F1CC6B] group-hover:translate-x-0.5 transition-transform ml-auto shrink-0">
                    <span>{tool.btnText || "Open"}</span>
                    <ArrowRight className="w-3 h-3 text-[#F1CC6B]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

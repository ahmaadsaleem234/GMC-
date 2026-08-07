import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Zap,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Lock,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Cpu,
  Layers,
  Activity,
  Globe,
  Radio,
  ArrowRight,
  Sparkles,
  BarChart3,
  Sliders,
  Award,
  Clock,
  Check,
  Building2,
  PieChart,
  Terminal,
  RefreshCw,
} from "lucide-react";

interface GmcLandingPageProps {
  currentGoldPrice: number;
  onOpenLiveTerminal: () => void;
  onOpenWhatsApp: () => void;
  onOpenTelegram: () => void;
}

export const GmcLandingPage: React.FC<GmcLandingPageProps> = ({
  currentGoldPrice,
  onOpenLiveTerminal,
  onOpenWhatsApp,
  onOpenTelegram,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "pipeline" | "brain" | "why">("overview");
  const [liveClock, setLiveClock] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      setLiveClock(new Date().toUTCString().replace("GMT", "UTC"));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // 15 Specialized AI Engines
  const aiBrainModules = [
    {
      id: "vision",
      name: "Institutional Vision AI",
      tagline: "Directional Market Intelligence",
      icon: Cpu,
      color: "from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/40",
      features: ["Macro Directional Bias", "Hedge Fund Positioning", "Institutional Order Imbalance", "Bias Heatmapping"],
    },
    {
      id: "smc",
      name: "Smart Money AI",
      tagline: "SMC Core Architecture",
      icon: Zap,
      color: "from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/40",
      features: ["Break of Structure (BOS)", "Change of Character (CHoCH)", "Institutional Order Blocks", "Fair Value Gaps (FVG)", "Liquidity Sweeps", "Premium & Discount Zones"],
    },
    {
      id: "liquidity",
      name: "Liquidity Intelligence",
      tagline: "Institutional Liquidity Mapping",
      icon: Layers,
      color: "from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/40",
      features: ["Stop Hunt Detection", "Liquidity Voids", "Market Efficiency Profiling", "Equal Highs/Lows Target Mapping"],
    },
    {
      id: "structure",
      name: "Market Structure AI",
      tagline: "Structural Trend Architecture",
      icon: BarChart3,
      color: "from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/40",
      features: ["Trend Architecture", "Swing Point Analysis", "Break Confirmation", "Internal Structure", "External Structure"],
    },
    {
      id: "momentum",
      name: "Momentum Intelligence",
      tagline: "Impulse & Velocity Dynamics",
      icon: TrendingUp,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/40",
      features: ["Impulse Strength Index", "Market Speed Vector", "Trend Continuation Score", "Exhaustion & Reversal Detection"],
    },
    {
      id: "zone",
      name: "Zone Intelligence",
      tagline: "AI Confluence Zone Matrix",
      icon: Sparkles,
      color: "from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/40",
      features: ["AI Buy Zones", "AI Sell Zones", "Confluence Ranking (0-100%)", "Critical Levels", "Deep & Near Zones"],
    },
    {
      id: "probability",
      name: "Probability Engine",
      tagline: "Quantitative Win-Rate Scoring",
      icon: PieChart,
      color: "from-cyan-500/20 to-emerald-500/20 text-cyan-300 border-cyan-500/40",
      features: ["Confidence Scoring (0-100%)", "Trade Probability Weighting", "Risk Rating Matrix", "Scenario Comparison"],
    },
    {
      id: "macro",
      name: "Macro Intelligence",
      tagline: "Global Macroeconomic Policy",
      icon: Globe,
      color: "from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-500/40",
      features: ["Fed & Central Bank Rate Shifts", "Economic Event Impact", "Inflation (CPI/PCE) Tracking", "Employment & GDP Trends", "Policy Shift Alerts"],
    },
    {
      id: "news",
      name: "News Intelligence",
      tagline: "Real-time AI NLP Sentiment",
      icon: Radio,
      color: "from-rose-500/20 to-pink-500/20 text-rose-300 border-rose-500/40",
      features: ["Real-time Breaking News Desk", "AI NLP Sentiment Analysis", "Policy Impact Calculator", "Priced-in Expectations"],
    },
    {
      id: "sentiment",
      name: "Market Sentiment AI",
      tagline: "Institutional Order Psychology",
      icon: Activity,
      color: "from-violet-500/20 to-purple-500/20 text-violet-300 border-violet-500/40",
      features: ["Institutional Positioning Ratio", "Market Psychology Gauge", "Risk Appetite Index (Risk On/Off)", "Volume Behaviour Dynamics"],
    },
    {
      id: "volatility",
      name: "Volatility Engine",
      tagline: "ATR & Expansion Dynamics",
      icon: Sliders,
      color: "from-amber-500/20 to-red-500/20 text-amber-400 border-amber-500/40",
      features: ["ATR Intelligence Metric", "Market Expansion Phases", "Compression Detection", "Breakout Probability"],
    },
    {
      id: "risk",
      name: "Risk Intelligence",
      tagline: "Capital Protection Matrix",
      icon: ShieldAlert,
      color: "from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/40",
      features: ["Dynamic Risk Assessment", "Position Size Validation", "Hard Drawdown Filters", "Capital Protection Protocol"],
    },
    {
      id: "execution",
      name: "Execution Intelligence",
      tagline: "Institutional Entry & SL Logic",
      icon: Terminal,
      color: "from-emerald-500/20 to-green-500/20 text-emerald-300 border-emerald-500/40",
      features: ["Precision Entry Validation", "Adaptive Stop Loss Logic", "Multi-Target TP Optimization", "Active Trade Management"],
    },
    {
      id: "multitf",
      name: "Multi-Timeframe Intelligence",
      tagline: "Harmonic Alignment Core",
      icon: Clock,
      color: "from-sky-500/20 to-blue-500/20 text-sky-300 border-sky-500/40",
      features: ["Monthly & Weekly Macro", "Daily & H4 Trend Alignment", "H1 & M15 Execution Setup", "M5 Micro Timing Engine"],
    },
    {
      id: "confirmation",
      name: "Confirmation Engine",
      tagline: "Consensus Final Gatekeeper",
      icon: CheckCircle2,
      color: "from-amber-400/20 to-emerald-400/20 text-amber-300 border-amber-400/50",
      features: ["6-Gate Institutional Check", "Consensus Verification", "Execution Permission Grant", "Telegram Dispatcher"],
    },
  ];

  // Decision Pipeline Steps
  const pipelineSteps = [
    {
      num: "01",
      title: "Read",
      desc: "Collect live market data, price action, liquidity, volatility, order flow, sessions and institutional activity.",
    },
    {
      num: "02",
      title: "Analyze",
      desc: "Independent AI engines evaluate structure, momentum, Smart Money behaviour and macro conditions.",
    },
    {
      num: "03",
      title: "Consult",
      desc: "Every AI engine contributes weighted intelligence before consensus is generated.",
    },
    {
      num: "04",
      title: "Rank",
      desc: "Candidate Buy and Sell zones are scored using proprietary confluence algorithms.",
    },
    {
      num: "05",
      title: "Validate",
      desc: "Risk protocols, confidence thresholds, event timing and execution conditions are verified.",
    },
    {
      num: "06",
      title: "Release",
      desc: "Only fully validated opportunities appear inside the Live Terminal.",
    },
  ];

  // Live Terminal Features List
  const terminalFeatures = [
    "Institutional AI Verdict (BUY / SELL / WAIT)",
    "Live AI Buy Zones & Live AI Sell Zones",
    "Smart Money Concepts (BOS, CHoCH, FVG, Order Blocks)",
    "Liquidity Map & Volume Thermal Profiling",
    "Market Structure & Trend Architecture Analysis",
    "Momentum & Impulse Vector Analysis",
    "Probability Score & Confluence Percentage",
    "AI Confidence Scoring Matrix",
    "Trade Validation & Dynamic SL/TP Logic",
    "Economic Calendar & High-Impact Macro Events",
    "AI News Analysis & Real-Time Sentiment Desk",
    "Risk Management & Capital Protection Copilot",
    "Trade Management & Trailing Stop Protocols",
    "Transparent AI Reasoning & Decision Timeline",
    "Live Gold Price Ticker & Professional Charting Suite",
    "Institutional $5K Demo Leaderboard & Trade Journal",
  ];

  const whyPillars = [
    { name: "Technical Structure", icon: BarChart3 },
    { name: "Liquidity Behaviour", icon: Layers },
    { name: "Smart Money Concepts", icon: Zap },
    { name: "Institutional Order Flow", icon: Building2 },
    { name: "Volatility Intelligence", icon: Sliders },
    { name: "Macro Environment", icon: Globe },
    { name: "News Intelligence", icon: Radio },
    { name: "AI Consensus", icon: Cpu },
    { name: "Probability Models", icon: PieChart },
    { name: "Risk Validation", icon: ShieldAlert },
  ];

  return (
    <div className="bg-[#05070e] text-slate-200 font-sans selection:bg-amber-500 selection:text-black min-h-screen">
      {/* BACKGROUND GRAPHICS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[160px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
        {/* HERO SECTION */}
        <section className="text-center pt-6 pb-10 space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(245,179,1,0.15)]">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider text-amber-300 uppercase">
              GMC TRADING AI™ — INSTITUTIONAL EDITION
            </span>
          </div>

          {/* Main Title */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
              GMC TRADING AI<span className="text-amber-400">™</span>
            </h1>
            <p className="text-xl sm:text-3xl font-extrabold bg-gradient-to-r from-cyan-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
              Institutional Intelligence. Engineered for Precision.
            </p>
            <p className="text-lg sm:text-xl font-medium text-slate-300 font-mono">
              One AI Brain. Multiple Intelligence Engines. One Trusted Market Decision.
            </p>
          </div>

          {/* Description */}
          <div className="max-w-3xl mx-auto text-slate-300 text-base sm:text-lg leading-relaxed space-y-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
            <p>
              GMC TRADING AI transforms millions of market data points into one transparent, explainable, and institution-grade trading decision.
            </p>
            <p className="text-slate-400 text-sm sm:text-base">
              Rather than relying on a single indicator, our proprietary AI architecture combines Smart Money Concepts, liquidity behaviour, market structure, volatility modelling, macroeconomic intelligence, quantitative scoring, and multi-engine consensus into one unified decision pipeline.
            </p>
            <p className="text-amber-400 font-semibold font-mono text-sm sm:text-base">
              Every verdict is verified before it reaches the trader. No Guesswork. No Noise. Only Intelligent Decisions.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onOpenWhatsApp}
              className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] cursor-pointer"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
              🟢 Join WhatsApp Community
            </button>

            <button
              onClick={onOpenTelegram}
              className="px-6 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-[1.02] cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-cyan-200" />
              💬 Live Chat Support
            </button>

            <button
              onClick={onOpenLiveTerminal}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm flex items-center gap-2 transition-all shadow-[0_0_25px_rgba(245,179,1,0.4)] hover:scale-[1.03] cursor-pointer"
            >
              🟡 Open Live Terminal →
            </button>
          </div>
        </section>

        {/* LIVE STATUS PANEL */}
        <section className="bg-[#080c18] border border-amber-500/40 rounded-2xl p-6 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-lg font-black font-mono tracking-wider text-white uppercase flex items-center gap-2">
                LIVE MARKET STATUS <span className="text-xs font-normal text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">INSTITUTIONAL FEED</span>
              </h2>
            </div>
            <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>System Clock: <strong className="text-slate-200">{liveClock || "SYNCHRONIZING..."}</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-6 font-mono">
            {/* Final AI Verdict */}
            <div className="bg-slate-900/80 border border-emerald-500/40 rounded-xl p-4 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Final AI Verdict</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 font-black text-base shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <TrendingUp className="w-4 h-4" /> BUY
              </span>
              <span className="text-[10px] text-emerald-300 block mt-1">6/6 Gates Passed</span>
            </div>

            {/* Current Gold Price */}
            <div className="bg-slate-900/80 border border-amber-500/40 rounded-xl p-4 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Current Gold Price</span>
              <span className="text-amber-300 font-black text-lg block">${currentGoldPrice ? currentGoldPrice.toFixed(2) : "3,317.80"}</span>
              <span className="text-[10px] text-amber-400 block mt-1">XAUUSD Live Spot</span>
            </div>

            {/* Market Regime */}
            <div className="bg-slate-900/80 border border-cyan-500/30 rounded-xl p-4 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Market Regime</span>
              <span className="text-cyan-300 font-bold text-xs block truncate">INSTITUTIONAL EXPANSION</span>
              <span className="text-[10px] text-cyan-400 block mt-1">High Volatility Vector</span>
            </div>

            {/* AI Confidence Score */}
            <div className="bg-slate-900/80 border border-purple-500/30 rounded-xl p-4 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">AI Confidence Score</span>
              <span className="text-purple-300 font-black text-base block">96.8%</span>
              <span className="text-[10px] text-purple-400 block mt-1">Multi-Engine Consensus</span>
            </div>

            {/* Signal Strength */}
            <div className="bg-slate-900/80 border border-blue-500/30 rounded-xl p-4 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Signal Strength</span>
              <span className="text-blue-300 font-bold text-xs block">STRONG BULLISH</span>
              <span className="text-[10px] text-blue-400 block mt-1">SMC Order Block Confluence</span>
            </div>

            {/* Live Feed Status */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">Live Feed Status</span>
              <span className="text-emerald-400 font-bold text-xs flex items-center justify-center gap-1">
                <Check className="w-3 h-3" /> CONNECTED
              </span>
              <span className="text-[10px] text-slate-500 block">12ms Latency</span>
            </div>

            {/* Next High Impact Event */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">Next High Impact Event</span>
              <span className="text-amber-300 font-bold text-xs block truncate">US NFP Payrolls</span>
              <span className="text-[10px] text-slate-400 block">In 2h 45m</span>
            </div>

            {/* Market Session */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">Market Session</span>
              <span className="text-slate-200 font-bold text-xs block">LONDON / NY OVERLAP</span>
              <span className="text-[10px] text-emerald-400 block">Peak Volume Active</span>
            </div>

            {/* System Health */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">System Health</span>
              <span className="text-cyan-400 font-bold text-xs block">100% OPERATIONAL</span>
              <span className="text-[10px] text-slate-400 block">15 AI Nodes Active</span>
            </div>

            {/* Last Updated */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">Last Updated</span>
              <span className="text-slate-300 font-bold text-xs block">REAL-TIME LIVE</span>
              <span className="text-[10px] text-slate-500 block">Sub-Second Sync</span>
            </div>
          </div>
        </section>

        {/* WHAT IS GMC TRADING AI? */}
        <section className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
              ABOUT THE ECOSYSTEM
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black text-white">
              WHAT IS GMC TRADING AI?
            </h3>
            <p className="text-xl font-bold text-cyan-400">
              More Than An Indicator. A Complete AI Decision Ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-6 space-y-4 transition-all hover:bg-slate-900/80">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Cpu className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white">Multi-Engine Collaboration</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                GMC TRADING AI is an institutional decision-support platform built specifically for professional Gold traders. Every market hypothesis passes through multiple independent AI engines before reaching consensus.
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-6 space-y-4 transition-all hover:bg-slate-900/80">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white">Institutional Validation</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Quantitative scoring systems, Smart Money validation, macroeconomic filters, liquidity intelligence, and execution protocols verify every single opportunity to eliminate retail trap setups.
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-6 space-y-4 transition-all hover:bg-slate-900/80">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white">Transparent Decisions</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                Instead of guessing market direction or following black-box signals, traders receive transparent, explainable, and confidence-based decisions with precise locked entry, SL, and TP levels.
              </p>
            </div>
          </div>
        </section>

        {/* AI DECISION PIPELINE (Six Institutional Layers) */}
        <section className="space-y-8 bg-slate-950/60 border border-slate-800 rounded-3xl p-6 sm:p-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              INSTITUTIONAL ARCHITECTURE
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black text-white">
              AI DECISION PIPELINE
            </h3>
            <p className="text-slate-400 text-base">
              Every Decision Passes Through Six Institutional Layers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono">
            {pipelineSteps.map((step) => (
              <div
                key={step.num}
                className="bg-[#080c18] border border-slate-800 hover:border-amber-500/40 rounded-2xl p-6 space-y-3 relative overflow-hidden group transition-all"
              >
                <div className="text-4xl font-black text-amber-400/30 group-hover:text-amber-400 transition-colors">
                  {step.num}
                </div>
                <h4 className="text-xl font-bold text-white flex items-center justify-between">
                  <span>{step.title}</span>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
                </h4>
                <p className="text-slate-400 text-xs font-sans leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* AI BRAIN (Multiple Specialized AI Systems) */}
        <section className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
              DEEP INTELLIGENCE MATRIX
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black text-white">
              AI BRAIN
            </h3>
            <p className="text-slate-300 text-base font-semibold">
              Multiple Specialized AI Systems Working Together
            </p>
            <p className="text-slate-400 text-sm">
              Unlike traditional trading software, GMC TRADING AI uses independent intelligence modules that collaborate before making a decision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiBrainModules.map((mod) => {
              const IconComp = mod.icon;
              return (
                <div
                  key={mod.id}
                  className="bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 space-y-4 transition-all duration-300 hover:bg-slate-900/90 group"
                >
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${mod.color} border`}>
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      ACTIVE AI NODE
                    </span>
                  </div>

                  <div>
                    <h4 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                      {mod.name}
                    </h4>
                    <span className="text-xs font-mono text-cyan-400">{mod.tagline}</span>
                  </div>

                  <ul className="space-y-2 border-t border-slate-800/80 pt-3">
                    {mod.features.map((feat, idx) => (
                      <li key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* LIVE TERMINAL FEATURES GRID */}
        <section className="bg-gradient-to-br from-slate-950 via-[#060914] to-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-10 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              PROFESSIONAL CAPABILITIES
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black text-white">
              LIVE TERMINAL FEATURES
            </h3>
            <p className="text-slate-300 text-base">
              Everything built inside the live GMC TRADING AI workspace
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
            {terminalFeatures.map((feat, idx) => (
              <div
                key={idx}
                className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex items-center gap-3 hover:border-amber-500/40 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-200">{feat}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 text-center">
            <button
              onClick={onOpenLiveTerminal}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base transition-all shadow-[0_0_30px_rgba(245,179,1,0.4)] cursor-pointer"
            >
              Enter Live AI Terminal Now →
            </button>
          </div>
        </section>

        {/* WHY GMC TRADING AI? */}
        <section className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
              THE INSTITUTIONAL ADVANTAGE
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black text-white">
              WHY GMC TRADING AI?
            </h3>
            <p className="text-slate-300 text-base">
              Traditional indicators only analyse charts. <strong className="text-amber-400">GMC TRADING AI analyses the complete market environment.</strong>
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
            <h4 className="text-xl font-bold text-white text-center font-mono">
              Every decision combines 10 Institutional Pillars:
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {whyPillars.map((p, idx) => {
                const IconComp = p.icon;
                return (
                  <div
                    key={idx}
                    className="bg-[#080c18] border border-amber-500/30 rounded-xl p-4 text-center space-y-2 hover:border-amber-400 transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 mx-auto flex items-center justify-center text-amber-400">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-200 block">{p.name}</span>
                  </div>
                );
              })}
            </div>

            <p className="text-center text-slate-300 text-sm font-mono pt-4 border-t border-slate-800">
              The result is a professional decision-support system built for consistency, transparency, and precision.
            </p>
          </div>
        </section>

        {/* LIVE TERMINAL NAVIGATION / ACCESS BANNER */}
        <section className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-cyan-950/40 border border-amber-500/50 rounded-3xl p-8 text-center space-y-6 shadow-[0_0_40px_rgba(245,179,1,0.15)]">
          <div className="max-w-3xl mx-auto space-y-3">
            <h3 className="text-2xl sm:text-4xl font-black text-white">
              Ready to Experience Institutional Decision Intelligence?
            </h3>
            <p className="text-slate-300 text-base">
              Access 25+ specialized AI engines, live Smart Money concepts, real-time gold order book heatmaps, and price-locked trade setup signals.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onOpenLiveTerminal}
              className="px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base shadow-[0_0_25px_rgba(245,179,1,0.5)] transition-all cursor-pointer flex items-center gap-2"
            >
              <Terminal className="w-5 h-5" /> Open Live Terminal →
            </button>
            <button
              onClick={onOpenWhatsApp}
              className="px-6 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 font-bold text-base transition-all cursor-pointer flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5" /> Join WhatsApp Community
            </button>
          </div>
        </section>

        {/* FOOTER & RISK DISCLOSURE */}
        <footer className="pt-12 border-t border-slate-800/80 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <h4 className="text-xl font-black text-white flex items-center gap-2">
                GMC TRADING AI<span className="text-amber-400">™</span>
              </h4>
              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                Institutional Artificial Intelligence for Professional Gold Trading
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                One AI Brain. Multiple Intelligence Engines. One Trusted Market Decision.
              </p>
            </div>

            <div>
              <h5 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-3">Live Terminal</h5>
              <ul className="space-y-2 text-xs text-slate-400 font-mono">
                <li><button onClick={onOpenLiveTerminal} className="hover:text-amber-300 transition-colors">👑 GMC GOLD Apex Matrix</button></li>
                <li><button onClick={onOpenLiveTerminal} className="hover:text-amber-300 transition-colors">⚡ GMC Alpha 1H Command</button></li>
                <li><button onClick={onOpenLiveTerminal} className="hover:text-amber-300 transition-colors">⚔️ Harami Reversal Radar</button></li>
                <li><button onClick={onOpenLiveTerminal} className="hover:text-amber-300 transition-colors">🦈 Black Shark DOM Depth</button></li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider mb-3">Community & Support</h5>
              <ul className="space-y-2 text-xs text-slate-400 font-mono">
                <li><button onClick={onOpenWhatsApp} className="hover:text-cyan-300 transition-colors">🟢 WhatsApp VIP Desk</button></li>
                <li><button onClick={onOpenTelegram} className="hover:text-cyan-300 transition-colors">💬 Telegram Signal Channel</button></li>
                <li><button onClick={onOpenLiveTerminal} className="hover:text-cyan-300 transition-colors">🔐 Enterprise Security</button></li>
                <li><button onClick={onOpenLiveTerminal} className="hover:text-cyan-300 transition-colors">📜 AI Trade Journal</button></li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3">Enterprise Specs</h5>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                Engineered with high-frequency quantitative models, sub-second websocket streaming, and multi-agent neural consensus.
              </p>
            </div>
          </div>

          {/* RISK DISCLOSURE BOX */}
          <div className="bg-[#04060b] border border-slate-800/80 rounded-2xl p-6 text-xs text-slate-400 space-y-3 font-mono">
            <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 shrink-0" /> RISK DISCLOSURE & LEGAL DISCLAIMER
            </div>
            <p className="leading-relaxed">
              GMC TRADING AI is an Artificial Intelligence-powered market analysis and decision-support platform. It does not execute trades, manage investments, or provide financial advice. All trading decisions remain the sole responsibility of the user. Leveraged trading involves significant risk and may result in substantial financial loss. Always conduct your own research and apply disciplined risk management.
            </p>
          </div>

          {/* FINAL BRAND MESSAGE */}
          <div className="text-center py-6 border-t border-slate-900 space-y-2">
            <p className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
              Institutional Intelligence. Transparent Decisions. Professional Execution.
            </p>
            <p className="text-[11px] text-slate-500 max-w-2xl mx-auto">
              GMC TRADING AI is built to bridge the gap between institutional market intelligence and professional retail trading—combining advanced artificial intelligence, quantitative models, Smart Money Concepts, macroeconomic intelligence, and transparent reasoning into one trusted decision ecosystem.
            </p>
            <p className="text-xs text-slate-600 font-mono pt-2">
              © {new Date().getFullYear()} GMC TRADING AI™. All Rights Reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

import React, { useState, useMemo, useEffect } from "react";
import {
  Play,
  RotateCcw,
  TrendingUp,
  ShieldAlert,
  Award,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Sliders,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  Activity,
  Download,
  FileSpreadsheet,
  FileCode,
  Clock,
  Filter,
  Search,
  ChevronDown,
  Info,
  ShieldCheck,
  Percent,
  TrendingDown,
  Flame,
  PieChart,
} from "lucide-react";
import {
  BacktestConfig,
  BacktestResult,
  BacktestStrategyType,
  BacktestTradingRules,
  BacktestTrade,
} from "../types";
import { runBacktest, calculateDateRangeInfo, DEFAULT_TRADING_RULES } from "../backtester";
import { SUPPORTED_ASSETS } from "../useLiveData";

interface BacktesterViewProps {
  activeAssetKey: string;
  currentPrice: number;
}

const STRATEGY_OPTIONS: {
  id: BacktestStrategyType;
  name: string;
  badge: string;
  desc: string;
  icon: string;
  recommendedTf: string;
}[] = [
  {
    id: "gmc_harami_ai",
    name: "GMC Harami AI A+ Algorithm",
    badge: "INSTITUTIONAL A+",
    desc: "Detects High-Probability Bullish/Bearish Inside Bar (Harami) Mother candle breakout with RSI & volume confirmation.",
    icon: "⚡",
    recommendedTf: "15min",
  },
  {
    id: "gmc_war_room_7gate",
    name: "GMC War Room 7-Gate Execution",
    badge: "7-GATE MSS",
    desc: "200 EMA Macro Trend + Order Block mitigation + Market Structure Shift (MSS) + Fair Value Gap (FVG) confluence.",
    icon: "🏛️",
    recommendedTf: "15min",
  },
  {
    id: "smc_orderblock",
    name: "Smart Money Concepts (SMC)",
    badge: "ORDER BLOCK",
    desc: "Liquidity pool sweeps of 20-bar highs/lows + institutional discount/premium mitigation retests.",
    icon: "💎",
    recommendedTf: "15min",
  },
  {
    id: "khatarnak_jugaad",
    name: "Khatarnak Jugaad Reversal Scalper",
    badge: "ASIAN TRAP",
    desc: "Asian session liquidity grab followed by rapid 3-candle rejection pinbar momentum during London/NY open.",
    icon: "🎯",
    recommendedTf: "5min",
  },
  {
    id: "black_shark_grid",
    name: "Black Shark Grid & Momentum",
    badge: "SUPER-TREND",
    desc: "Dynamic ATR volatility channel breakout combined with fast EMA trend momentum confirmation.",
    icon: "🦈",
    recommendedTf: "1h",
  },
  {
    id: "red_green_breakout",
    name: "Red-to-Green Candle Breakout",
    badge: "BREAKOUT",
    desc: "High-volume color flip candle exploding through prior candle high/low with follow-through impulse.",
    icon: "📈",
    recommendedTf: "5min",
  },
  {
    id: "ema_crossover",
    name: "EMA 9/21 Dynamic Trend Flow",
    badge: "TREND FLOW",
    desc: "Fast EMA 9 crossing Slow EMA 21 in alignment with 200 EMA macro filter and RSI momentum buffer.",
    icon: "🌊",
    recommendedTf: "15min",
  },
  {
    id: "custom_rules",
    name: "Custom Rule Builder",
    badge: "CUSTOM ENGINE",
    desc: "Fully user-configurable entry filters (RSI boundaries, 200 EMA trend, Volume surge, Session timing).",
    icon: "🛠️",
    recommendedTf: "15min",
  },
];

export const BacktesterView: React.FC<BacktesterViewProps> = ({ activeAssetKey, currentPrice }) => {
  // Active Configuration Tab
  const [configTab, setConfigTab] = useState<"asset_date" | "strategy_rules" | "exit_friction">("asset_date");
  // Active Analytics Tab
  const [analyticsTab, setAnalyticsTab] = useState<"equity" | "monthly" | "sessions" | "monte_carlo">("equity");

  const [config, setConfig] = useState<BacktestConfig>(() => {
    const rangeInfo = calculateDateRangeInfo("3M", undefined, undefined, "15min");
    return {
      assetKey: activeAssetKey || "XAUUSD",
      strategy: "gmc_harami_ai",
      timeframe: "15min",
      initialCapital: 10000,
      riskPerTradePct: 1.5,
      riskModel: "PERCENTAGE",
      fixedRiskUSD: 150,
      leverage: 10,
      periodBars: rangeInfo.totalBars,
      dateRange: {
        preset: "3M",
        startDate: rangeInfo.startDate,
        endDate: rangeInfo.endDate,
      },
      rules: { ...DEFAULT_TRADING_RULES },
      stopLossATRMultiplier: 1.5,
      takeProfitATRMultiplier: 3.0,
    };
  });

  const [result, setResult] = useState<BacktestResult | null>(() => {
    return runBacktest(
      {
        assetKey: activeAssetKey || "XAUUSD",
        strategy: "gmc_harami_ai",
        timeframe: "15min",
        initialCapital: 10000,
        riskPerTradePct: 1.5,
        riskModel: "PERCENTAGE",
        fixedRiskUSD: 150,
        leverage: 10,
        periodBars: 400,
        dateRange: {
          preset: "3M",
          startDate: calculateDateRangeInfo("3M").startDate,
          endDate: calculateDateRangeInfo("3M").endDate,
        },
        rules: { ...DEFAULT_TRADING_RULES },
        stopLossATRMultiplier: 1.5,
        takeProfitATRMultiplier: 3.0,
      },
      undefined,
      currentPrice
    );
  });

  const [isExecuting, setIsExecuting] = useState(false);
  const [tradeFilter, setTradeFilter] = useState<"ALL" | "WIN" | "LOSS" | "BREAKEVEN" | "BUY" | "SELL">("ALL");
  const [tradeSearch, setTradeSearch] = useState("");
  const [chartViewMode, setChartViewMode] = useState<"EQUITY" | "DRAWDOWN">("EQUITY");
  const [selectedTrade, setSelectedTrade] = useState<BacktestTrade | null>(null);

  // Sync asset if prop changes and not manually overridden
  useEffect(() => {
    if (activeAssetKey && activeAssetKey !== config.assetKey) {
      setConfig((prev) => ({ ...prev, assetKey: activeAssetKey }));
    }
  }, [activeAssetKey]);

  // Handle Date Range preset changes
  const handleDatePresetChange = (preset: "1M" | "3M" | "6M" | "YTD" | "1Y" | "2Y" | "CUSTOM") => {
    const rangeInfo = calculateDateRangeInfo(preset, config.dateRange?.startDate, config.dateRange?.endDate, config.timeframe);
    setConfig((prev) => ({
      ...prev,
      periodBars: rangeInfo.totalBars,
      dateRange: {
        preset,
        startDate: rangeInfo.startDate,
        endDate: rangeInfo.endDate,
      },
    }));
  };

  // Handle Custom Date inputs
  const handleCustomDateChange = (type: "start" | "end", val: string) => {
    const start = type === "start" ? val : config.dateRange?.startDate || "";
    const end = type === "end" ? val : config.dateRange?.endDate || "";
    const rangeInfo = calculateDateRangeInfo("CUSTOM", start, end, config.timeframe);
    setConfig((prev) => ({
      ...prev,
      periodBars: rangeInfo.totalBars,
      dateRange: {
        preset: "CUSTOM",
        startDate: rangeInfo.startDate,
        endDate: rangeInfo.endDate,
      },
    }));
  };

  const handleRunTest = () => {
    setIsExecuting(true);
    setTimeout(() => {
      const res = runBacktest(config, undefined, currentPrice);
      setResult(res);
      setIsExecuting(false);
    }, 280);
  };

  const handleResetDefaults = () => {
    const rangeInfo = calculateDateRangeInfo("3M", undefined, undefined, "15min");
    const freshConfig: BacktestConfig = {
      assetKey: activeAssetKey || "XAUUSD",
      strategy: "gmc_harami_ai",
      timeframe: "15min",
      initialCapital: 10000,
      riskPerTradePct: 1.5,
      riskModel: "PERCENTAGE",
      fixedRiskUSD: 150,
      leverage: 10,
      periodBars: rangeInfo.totalBars,
      dateRange: {
        preset: "3M",
        startDate: rangeInfo.startDate,
        endDate: rangeInfo.endDate,
      },
      rules: { ...DEFAULT_TRADING_RULES },
      stopLossATRMultiplier: 1.5,
      takeProfitATRMultiplier: 3.0,
    };
    setConfig(freshConfig);
    setResult(runBacktest(freshConfig, undefined, currentPrice));
  };

  // Filtered Trades list
  const filteredTrades = useMemo(() => {
    if (!result) return [];
    return result.trades.filter((t) => {
      // Filter by type/result
      if (tradeFilter === "WIN" && t.pnlUSD <= 0) return false;
      if (tradeFilter === "LOSS" && t.pnlUSD >= 0) return false;
      if (tradeFilter === "BREAKEVEN" && t.result !== "BREAKEVEN") return false;
      if (tradeFilter === "BUY" && t.type !== "BUY") return false;
      if (tradeFilter === "SELL" && t.type !== "SELL") return false;

      // Search query
      if (tradeSearch.trim() !== "") {
        const q = tradeSearch.toLowerCase();
        const matchId = String(t.id).includes(q);
        const matchDate = t.entryTime.toLowerCase().includes(q) || t.exitTime.toLowerCase().includes(q);
        const matchRule = (t.ruleTriggered || "").toLowerCase().includes(q);
        const matchResult = t.result.toLowerCase().includes(q);
        if (!matchId && !matchDate && !matchRule && !matchResult) return false;
      }

      return true;
    });
  }, [result, tradeFilter, tradeSearch]);

  // Export to CSV
  const handleExportCSV = () => {
    if (!result || !result.trades.length) return;
    const headers = [
      "Trade #",
      "Asset",
      "Direction",
      "Entry Date",
      "Exit Date",
      "Entry Price",
      "Exit Price",
      "Stop Loss",
      "Take Profit",
      "Result",
      "Rule Triggered",
      "PnL ($)",
      "PnL (%)",
      "PnL (Pips)",
      "R:R Achieved",
      "Balance After ($)",
      "Holding Bars",
    ];
    const rows = result.trades.map((t) => [
      t.id,
      config.assetKey,
      t.type,
      t.entryTime,
      t.exitTime,
      t.entryPrice,
      t.exitPrice,
      t.stopLoss,
      t.takeProfit,
      t.result,
      `"${t.ruleTriggered || ""}"`,
      t.pnlUSD,
      t.pnlPct,
      t.pnlPips || 0,
      t.rr,
      t.balanceAfter,
      t.barsHeld,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `GMC_Backtest_${config.assetKey}_${config.strategy}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const handleExportJSON = () => {
    if (!result) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(result, null, 2))}`;
    const link = document.createElement("a");
    link.setAttribute("href", jsonString);
    link.setAttribute("download", `GMC_Backtest_${config.assetKey}_${config.strategy}_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const assetObj = SUPPORTED_ASSETS.find((a) => a.key === config.assetKey) || SUPPORTED_ASSETS[0];

  return (
    <div id="gmc-backtester" className="space-y-6 pb-16 font-sans text-slate-100">
      {/* Top Banner & Control Bar */}
      <div className="bg-[#0B0E14] border border-[#222733] rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-wide text-white flex items-center gap-2.5">
                  HISTORICAL STRATEGY BACKTESTING ENGINE
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                    PRO GRADE
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Simulate high-precision algorithmic rules, multi-tier risk/reward models, and friction slippage against historical market sequences.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleResetDefaults}
              className="px-3.5 py-2 rounded-xl bg-[#141820] hover:bg-[#1C222E] text-slate-400 hover:text-slate-200 border border-[#293040] text-xs font-mono font-semibold flex items-center gap-1.5 transition-all"
              title="Reset parameters to institutional defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>

            <button
              onClick={handleExportCSV}
              disabled={!result || !result.trades.length}
              className="px-3.5 py-2 rounded-xl bg-[#141820] hover:bg-[#1C222E] text-slate-300 hover:text-white border border-[#293040] text-xs font-mono font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40"
              title="Download detailed CSV trade log"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              CSV
            </button>

            <button
              onClick={handleExportJSON}
              disabled={!result}
              className="px-3.5 py-2 rounded-xl bg-[#141820] hover:bg-[#1C222E] text-slate-300 hover:text-white border border-[#293040] text-xs font-mono font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40"
              title="Download JSON backtest report"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-400" />
              JSON
            </button>

            <button
              onClick={handleRunTest}
              disabled={isExecuting}
              id="run-backtest-btn"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wider font-mono shadow-lg shadow-blue-600/25 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 uppercase cursor-pointer"
            >
              <Play className={`w-4 h-4 ${isExecuting ? "animate-spin" : ""}`} />
              {isExecuting ? "SIMULATING BARS..." : "RUN BACKTEST"}
            </button>
          </div>
        </div>

        {/* Quick Pair Selector Pills */}
        <div className="mt-4 pt-4 border-t border-[#1C222E] flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-bold mr-1">
            Quick Pairs:
          </span>
          {["XAUUSD", "BTCUSDT", "ETHUSDT", "EURUSD", "GBPUSD", "US30", "NAS100"].map((pairKey) => {
            const isSelected = config.assetKey === pairKey;
            const asset = SUPPORTED_ASSETS.find((a) => a.key === pairKey);
            return (
              <button
                key={pairKey}
                onClick={() => {
                  setConfig((prev) => ({ ...prev, assetKey: pairKey }));
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-sm"
                    : "bg-[#12161F] text-slate-400 hover:text-slate-200 border border-[#202633] hover:border-slate-700"
                }`}
              >
                <span>{asset?.short || pairKey}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Configuration Card with Tabs */}
      <div className="bg-[#0B0E14] border border-[#222733] rounded-2xl p-6 shadow-2xl space-y-5">
        {/* Navigation Tabs for Settings */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1C222E] pb-4">
          <div className="flex items-center gap-2">
            {[
              { id: "asset_date", label: "1. Trading Pair & Date Range", icon: Calendar },
              { id: "strategy_rules", label: "2. Strategy & Entry Rules", icon: Sliders },
              { id: "exit_friction", label: "3. Risk & Exit Management", icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = configTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setConfigTab(tab.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "bg-[#141820] text-slate-400 hover:text-slate-200 border border-[#222836]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
            <span>Estimated Bars: <strong className="text-blue-400">{config.periodBars.toLocaleString()}</strong></span>
            <span className="text-slate-600">•</span>
            <span>Timeframe: <strong className="text-white uppercase">{config.timeframe}</strong></span>
          </div>
        </div>

        {/* TAB 1: Asset & Date Range */}
        {configTab === "asset_date" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 text-xs font-mono animate-fadeIn">
            {/* Target Instrument */}
            <div>
              <label className="block text-slate-400 mb-1.5 text-[11px] font-bold">Select Trading Pair</label>
              <select
                value={config.assetKey}
                onChange={(e) => setConfig({ ...config, assetKey: e.target.value })}
                id="backtest-asset-select"
                className="w-full bg-[#12161F] border border-[#222836] text-slate-100 rounded-xl p-3 font-bold focus:border-blue-500 focus:outline-none"
              >
                {SUPPORTED_ASSETS.map((a) => (
                  <option key={a.key} value={a.key}>
                    {a.label} ({a.short})
                  </option>
                ))}
              </select>
            </div>

            {/* Timeframe */}
            <div>
              <label className="block text-slate-400 mb-1.5 text-[11px] font-bold">Chart Timeframe</label>
              <select
                value={config.timeframe}
                onChange={(e) => {
                  const tf = e.target.value as any;
                  const rangeInfo = calculateDateRangeInfo(
                    config.dateRange?.preset || "3M",
                    config.dateRange?.startDate,
                    config.dateRange?.endDate,
                    tf
                  );
                  setConfig({ ...config, timeframe: tf, periodBars: rangeInfo.totalBars });
                }}
                id="backtest-tf-select"
                className="w-full bg-[#12161F] border border-[#222836] text-slate-100 rounded-xl p-3 font-bold focus:border-blue-500 focus:outline-none"
              >
                <option value="1min">1 Minute (M1 - Ultra Scalp)</option>
                <option value="5min">5 Minutes (M5 - Momentum Scalp)</option>
                <option value="15min">15 Minutes (M15 - Intraday Standard)</option>
                <option value="1h">1 Hour (H1 - Swing Structure)</option>
                <option value="4h">4 Hours (H4 - Macro Swing)</option>
                <option value="1d">1 Day (D1 - Position Trend)</option>
              </select>
            </div>

            {/* Date Range Preset */}
            <div>
              <label className="block text-slate-400 mb-1.5 text-[11px] font-bold">Historical Date Range</label>
              <select
                value={config.dateRange?.preset || "3M"}
                onChange={(e) => handleDatePresetChange(e.target.value as any)}
                id="backtest-date-preset-select"
                className="w-full bg-[#12161F] border border-[#222836] text-slate-100 rounded-xl p-3 font-bold focus:border-blue-500 focus:outline-none"
              >
                <option value="1M">Last 1 Month (Fast Sample)</option>
                <option value="3M">Last 3 Months (Quarterly Standard)</option>
                <option value="6M">Last 6 Months (Half-Year Deep Dive)</option>
                <option value="YTD">Year-to-Date (YTD 2026)</option>
                <option value="1Y">Last 1 Full Year (Annual Cycle)</option>
                <option value="2Y">Last 2 Years (Multi-Year Stress Test)</option>
                <option value="CUSTOM">Custom Date Range...</option>
              </select>
            </div>

            {/* Starting Account Capital */}
            <div>
              <label className="block text-slate-400 mb-1.5 text-[11px] font-bold">Starting Balance ($ USD)</label>
              <input
                type="number"
                value={config.initialCapital}
                onChange={(e) =>
                  setConfig({ ...config, initialCapital: Math.max(100, parseFloat(e.target.value) || 10000) })
                }
                id="backtest-capital-input"
                className="w-full bg-[#12161F] border border-[#222836] text-slate-100 rounded-xl p-3 font-bold focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Custom Date Pickers if selected */}
            {config.dateRange?.preset === "CUSTOM" && (
              <>
                <div>
                  <label className="block text-slate-400 mb-1.5 text-[11px] font-bold">Start Date</label>
                  <input
                    type="date"
                    value={config.dateRange?.startDate}
                    onChange={(e) => handleCustomDateChange("start", e.target.value)}
                    className="w-full bg-[#12161F] border border-[#222836] text-slate-100 rounded-xl p-3 font-bold focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1.5 text-[11px] font-bold">End Date</label>
                  <input
                    type="date"
                    value={config.dateRange?.endDate}
                    onChange={(e) => handleCustomDateChange("end", e.target.value)}
                    className="w-full bg-[#12161F] border border-[#222836] text-slate-100 rounded-xl p-3 font-bold focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </>
            )}

            {/* Leverage and Risk Model */}
            <div>
              <label className="block text-slate-400 mb-1.5 text-[11px] font-bold">Account Leverage</label>
              <select
                value={config.leverage}
                onChange={(e) => setConfig({ ...config, leverage: parseInt(e.target.value) || 10 })}
                className="w-full bg-[#12161F] border border-[#222836] text-slate-100 rounded-xl p-3 font-bold focus:border-blue-500 focus:outline-none"
              >
                <option value={1}>1:1 (No Leverage / Spot)</option>
                <option value={5}>1:5 (Conservative Prop)</option>
                <option value={10}>1:10 (Standard Institutional)</option>
                <option value={20}>1:20 (Standard FX)</option>
                <option value={50}>1:50 (Aggressive)</option>
                <option value={100}>1:100 (Max Volatility)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1.5 text-[11px] font-bold">Risk Model Mode</label>
              <select
                value={config.riskModel || "PERCENTAGE"}
                onChange={(e) => setConfig({ ...config, riskModel: e.target.value as any })}
                className="w-full bg-[#12161F] border border-[#222836] text-slate-100 rounded-xl p-3 font-bold focus:border-blue-500 focus:outline-none"
              >
                <option value="PERCENTAGE">Dynamic % of Account Balance</option>
                <option value="FIXED_USD">Fixed Dollar Risk ($) per Trade</option>
              </select>
            </div>
          </div>
        )}

        {/* TAB 2: Strategy & Entry Rules */}
        {configTab === "strategy_rules" && (
          <div className="space-y-6 animate-fadeIn text-xs font-mono">
            {/* Strategy Grid Cards */}
            <div>
              <label className="block text-slate-400 mb-2.5 text-[11px] font-bold uppercase tracking-wider">
                Select Strategy Engine
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {STRATEGY_OPTIONS.map((strat) => {
                  const isSelected = config.strategy === strat.id;
                  return (
                    <div
                      key={strat.id}
                      onClick={() => setConfig({ ...config, strategy: strat.id })}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                        isSelected
                          ? "bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/10"
                          : "bg-[#12161F] border-[#222836] hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xl">{strat.icon}</span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                            isSelected
                              ? "bg-blue-500 text-white"
                              : "bg-[#1B202C] text-slate-400 border border-[#293040]"
                          }`}
                        >
                          {strat.badge}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{strat.name}</h4>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {strat.desc}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-[#1E2430] flex items-center justify-between text-[10px] text-slate-500">
                        <span>Rec. TF: {strat.recommendedTf}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Entry Confluence Filters */}
            <div className="p-4 rounded-xl bg-[#12161F] border border-[#222836] space-y-4">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-blue-400" />
                Signal Entry Confluence Filters
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Direction Bias */}
                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">Trade Direction Bias</label>
                  <select
                    value={config.rules?.directionBias || "ALL"}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        rules: { ...config.rules!, directionBias: e.target.value as any },
                      })
                    }
                    className="w-full bg-black/40 border border-[#293040] text-slate-100 rounded-lg p-2.5 font-bold focus:border-blue-500 focus:outline-none"
                  >
                    <option value="ALL">Both Long (BUY) & Short (SELL)</option>
                    <option value="LONG_ONLY">Long Only (Bullish Trends)</option>
                    <option value="SHORT_ONLY">Short Only (Bearish Trends)</option>
                  </select>
                </div>

                {/* 200 EMA Macro Filter */}
                <div className="flex flex-col justify-between p-2.5 rounded-lg bg-black/30 border border-[#202533]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300">200 EMA Macro Filter</span>
                    <input
                      type="checkbox"
                      checked={config.rules?.useEma200Trend ?? true}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          rules: { ...config.rules!, useEma200Trend: e.target.checked },
                        })
                      }
                      className="rounded accent-blue-500 w-4 h-4 cursor-pointer"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Only buy above 200 EMA / sell below</p>
                </div>

                {/* RSI Filter */}
                <div className="flex flex-col justify-between p-2.5 rounded-lg bg-black/30 border border-[#202533]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300">RSI Momentum Filter</span>
                    <input
                      type="checkbox"
                      checked={config.rules?.useRsiFilter ?? true}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          rules: { ...config.rules!, useRsiFilter: e.target.checked },
                        })
                      }
                      className="rounded accent-blue-500 w-4 h-4 cursor-pointer"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Avoid buying overbought / selling oversold</p>
                </div>

                {/* Session Filter */}
                <div>
                  <label className="block text-slate-400 mb-1 text-[11px]">Trading Session Filter</label>
                  <select
                    value={config.rules?.session || "ALL"}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        rules: {
                          ...config.rules!,
                          session: e.target.value as any,
                          useSessionFilter: e.target.value !== "ALL",
                        },
                      })
                    }
                    className="w-full bg-black/40 border border-[#293040] text-slate-100 rounded-lg p-2.5 font-bold focus:border-blue-500 focus:outline-none"
                  >
                    <option value="ALL">All 24/7 Hours (No Restriction)</option>
                    <option value="LONDON">London Open (07:00 - 12:00 UTC)</option>
                    <option value="NEW_YORK">New York Open (12:00 - 17:00 UTC)</option>
                    <option value="OVERLAP">London / NY Overlap (12:00 - 15:00 UTC)</option>
                    <option value="ASIAN">Asian Session (00:00 - 07:00 UTC)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Exit Rules & Friction Model */}
        {configTab === "exit_friction" && (
          <div className="space-y-6 animate-fadeIn text-xs font-mono">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Exit Mode */}
              <div>
                <label className="block text-slate-400 mb-1.5 text-[11px] font-bold">Exit Target Mode</label>
                <select
                  value={config.rules?.exitMode || "ATR_DYNAMIC"}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      rules: { ...config.rules!, exitMode: e.target.value as any },
                    })
                  }
                  className="w-full bg-[#12161F] border border-[#222836] text-slate-100 rounded-xl p-3 font-bold focus:border-blue-500 focus:outline-none"
                >
                  <option value="ATR_DYNAMIC">ATR Dynamic Volatility Target</option>
                  <option value="FIXED_RR">Fixed Risk-to-Reward Ratio (e.g. 1:2, 1:3)</option>
                  <option value="TRAILING_STOP">ATR Dynamic Trailing Stop</option>
                  <option value="MULTI_TP_PARTIAL">Multi-TP with Partial Scaling</option>
                </select>
              </div>

              {/* Risk:Reward Ratio */}
              <div>
                <label className="block text-slate-400 mb-1.5 text-[11px] font-bold">Target Risk:Reward (R:R)</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="10"
                  value={config.rules?.riskRewardRatio || 2.0}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      rules: { ...config.rules!, riskRewardRatio: parseFloat(e.target.value) || 2 },
                    })
                  }
                  className="w-full bg-[#12161F] border border-[#222836] text-slate-100 rounded-xl p-3 font-bold focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Stop Loss ATR Multiplier */}
              <div>
                <label className="block text-slate-400 mb-1.5 text-[11px] font-bold">Stop Loss (x ATR)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="5"
                  value={config.stopLossATRMultiplier}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      stopLossATRMultiplier: parseFloat(e.target.value) || 1.5,
                      rules: { ...config.rules!, stopLossATRMultiplier: parseFloat(e.target.value) || 1.5 },
                    })
                  }
                  className="w-full bg-[#12161F] border border-[#222836] text-slate-100 rounded-xl p-3 font-bold focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Take Profit ATR Multiplier */}
              <div>
                <label className="block text-slate-400 mb-1.5 text-[11px] font-bold">Take Profit (x ATR)</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="10"
                  value={config.takeProfitATRMultiplier}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      takeProfitATRMultiplier: parseFloat(e.target.value) || 3.0,
                      rules: { ...config.rules!, takeProfitATRMultiplier: parseFloat(e.target.value) || 3.0 },
                    })
                  }
                  className="w-full bg-[#12161F] border border-[#222836] text-slate-100 rounded-xl p-3 font-bold focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Breakeven Toggle */}
              <div className="flex flex-col justify-between p-3 rounded-xl bg-[#12161F] border border-[#222836]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-200">Auto-Breakeven at +1R</span>
                  <input
                    type="checkbox"
                    checked={config.rules?.enableBreakevenAfterRR ?? true}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        rules: { ...config.rules!, enableBreakevenAfterRR: e.target.checked },
                      })
                    }
                    className="rounded accent-blue-500 w-4 h-4 cursor-pointer"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Move SL to entry price once trade reaches +1.0R</p>
              </div>

              {/* Trailing Stop Multiplier */}
              <div>
                <label className="block text-slate-400 mb-1.5 text-[11px] font-bold">Trailing Step (x ATR)</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="5"
                  value={config.rules?.trailingStopATRMultiplier || 2.0}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      rules: { ...config.rules!, trailingStopATRMultiplier: parseFloat(e.target.value) || 2 },
                    })
                  }
                  className="w-full bg-[#12161F] border border-[#222836] text-slate-100 rounded-xl p-3 font-bold focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Spread Modeling */}
              <div>
                <label className="block text-slate-400 mb-1.5 text-[11px] font-bold">Broker Spread (Pips)</label>
                <input
                  type="number"
                  step="0.2"
                  min="0"
                  max="10"
                  value={config.rules?.spreadPips || 1.2}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      rules: { ...config.rules!, spreadPips: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full bg-[#12161F] border border-[#222836] text-slate-100 rounded-xl p-3 font-bold focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Commission per Lot */}
              <div>
                <label className="block text-slate-400 mb-1.5 text-[11px] font-bold">Commission ($ / Lot)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="20"
                  value={config.rules?.commissionPerLot || 3.5}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      rules: { ...config.rules!, commissionPerLot: parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="w-full bg-[#12161F] border border-[#222836] text-slate-100 rounded-xl p-3 font-bold focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RESULTS DISPLAY & METRICS SECTION */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Hero Performance Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3.5 font-mono">
            {/* Total Net Profit */}
            <div className="bg-[#0B0E14] border border-[#222733] p-4 rounded-2xl space-y-1 relative overflow-hidden">
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Net Profit</div>
              <div
                className={`text-xl font-black ${
                  result.totalNetProfitUSD >= 0 ? "text-emerald-400" : "text-red-500"
                }`}
              >
                {result.totalNetProfitUSD >= 0 ? "+" : ""}${result.totalNetProfitUSD.toLocaleString()}
              </div>
              <div
                className={`text-[11px] font-bold flex items-center gap-1 ${
                  result.roiPct >= 0 ? "text-emerald-400" : "text-red-500"
                }`}
              >
                {result.roiPct >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {result.roiPct >= 0 ? "+" : ""}{result.roiPct}% ROI
              </div>
            </div>

            {/* Win Rate */}
            <div className="bg-[#0B0E14] border border-[#222733] p-4 rounded-2xl space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Win Rate</div>
              <div className="text-xl font-black text-blue-400">{result.winRatePct}%</div>
              <div className="text-[11px] text-slate-400">
                <span className="text-emerald-400 font-bold">{result.winningTrades}W</span> /{" "}
                <span className="text-red-400 font-bold">{result.losingTrades}L</span>
              </div>
            </div>

            {/* Profit Factor */}
            <div className="bg-[#0B0E14] border border-[#222733] p-4 rounded-2xl space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Profit Factor</div>
              <div className="text-xl font-black text-amber-400">{result.profitFactor}</div>
              <div className="text-[11px] text-slate-500">Gross W/L Ratio</div>
            </div>

            {/* Max Drawdown */}
            <div className="bg-[#0B0E14] border border-[#222733] p-4 rounded-2xl space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Max Drawdown</div>
              <div className="text-xl font-black text-red-400">-{result.maxDrawdownPct}%</div>
              <div className="text-[11px] text-slate-500">-${result.maxDrawdownUSD.toLocaleString()}</div>
            </div>

            {/* Sharpe Ratio */}
            <div className="bg-[#0B0E14] border border-[#222733] p-4 rounded-2xl space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Sharpe Ratio</div>
              <div className="text-xl font-black text-purple-400">{result.sharpeRatio}</div>
              <div className="text-[11px] text-slate-500">Sortino: {result.sortinoRatio || 1.8}</div>
            </div>

            {/* Expectancy */}
            <div className="bg-[#0B0E14] border border-[#222733] p-4 rounded-2xl space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Expectancy</div>
              <div className={`text-xl font-black ${(result.expectancyUSD || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                ${(result.expectancyUSD || 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500">Per Trade</div>
            </div>

            {/* Avg Win vs Avg Loss */}
            <div className="bg-[#0B0E14] border border-[#222733] p-4 rounded-2xl space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Avg Win / Loss</div>
              <div className="text-sm font-black text-emerald-400">+${result.avgWinUSD.toLocaleString()}</div>
              <div className="text-sm font-black text-red-400">-${result.avgLossUSD.toLocaleString()}</div>
            </div>

            {/* Total Trades & Streak */}
            <div className="bg-[#0B0E14] border border-[#222733] p-4 rounded-2xl space-y-1">
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total Trades</div>
              <div className="text-xl font-black text-white">{result.totalTrades}</div>
              <div className="text-[10px] text-slate-500">
                Streak: <span className="text-emerald-400 font-bold">+{result.maxConsecutiveWins}</span> /{" "}
                <span className="text-red-400 font-bold">-{result.maxConsecutiveLosses}</span>
              </div>
            </div>
          </div>

          {/* Interactive Visualizations & Analytics Sub-Tabs */}
          <div className="bg-[#0B0E14] border border-[#222733] rounded-2xl p-6 shadow-2xl space-y-5">
            {/* Header & View Mode Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1C222E] pb-4">
              <div className="flex items-center gap-2">
                {[
                  { id: "equity", label: "Equity Growth & Drawdown", icon: TrendingUp },
                  { id: "monthly", label: "Monthly Returns Matrix", icon: Calendar },
                  { id: "sessions", label: "Trading Sessions", icon: Clock },
                  { id: "monte_carlo", label: "Monte Carlo 1k Stress Test", icon: Sparkles },
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = analyticsTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setAnalyticsTab(t.id as any)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                        isActive
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                          : "bg-[#141820] text-slate-400 hover:text-slate-200 border border-[#222836]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {analyticsTab === "equity" && (
                <div className="flex items-center gap-1 bg-[#141820] p-1 rounded-xl border border-[#222836] font-mono text-[11px]">
                  <button
                    onClick={() => setChartViewMode("EQUITY")}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      chartViewMode === "EQUITY" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Equity Curve ($)
                  </button>
                  <button
                    onClick={() => setChartViewMode("DRAWDOWN")}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      chartViewMode === "DRAWDOWN" ? "bg-red-600 text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Drawdown (%)
                  </button>
                </div>
              )}
            </div>

            {/* TAB CONTENT A: Equity Curve & Underwater Chart */}
            {analyticsTab === "equity" && (
              <div className="space-y-4">
                <div className="h-60 w-full bg-black/40 border border-[#1E2430] rounded-xl p-4 flex items-end gap-1 overflow-x-auto relative">
                  {chartViewMode === "EQUITY" ? (
                    // Equity Bar & Peak Chart
                    result.equityCurve.map((pt, idx) => {
                      const minBal = Math.min(...result.equityCurve.map((e) => e.balance));
                      const maxBal = Math.max(...result.equityCurve.map((e) => e.balance));
                      const range = Math.max(1, maxBal - minBal);
                      const heightPct = Math.max(8, Math.min(100, ((pt.balance - minBal) / range) * 100));
                      const isGain = pt.balance >= config.initialCapital;

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group relative min-w-[5px]">
                          <div
                            className={`w-full rounded-t transition-all ${
                              isGain
                                ? "bg-emerald-500/80 group-hover:bg-emerald-400"
                                : "bg-red-500/80 group-hover:bg-red-400"
                            }`}
                            style={{ height: `${heightPct}%` }}
                          />
                          {/* Hover Tooltip */}
                          <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col bg-[#0B0E14] border border-[#2B3345] text-[10px] font-mono text-white p-2.5 rounded-xl shadow-2xl z-30 whitespace-nowrap pointer-events-none">
                            <span className="text-slate-400">Date: {pt.time}</span>
                            <span className={isGain ? "text-emerald-400 font-bold text-xs" : "text-red-400 font-bold text-xs"}>
                              Balance: ${pt.balance.toLocaleString()}
                            </span>
                            <span className="text-red-400">Drawdown: -{pt.drawdown}%</span>
                            <span className="text-slate-500">Peak: ${pt.highWaterMark?.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    // Underwater Drawdown Chart
                    result.equityCurve.map((pt, idx) => {
                      const heightPct = Math.max(4, Math.min(100, (pt.drawdown / (result.maxDrawdownPct || 10)) * 100));
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center justify-start h-full group relative min-w-[5px] pt-1">
                          <div
                            className="w-full rounded-b bg-red-500/75 group-hover:bg-red-400 transition-all"
                            style={{ height: `${heightPct}%` }}
                          />
                          {/* Tooltip */}
                          <div className="absolute top-full mt-2 hidden group-hover:flex flex-col bg-[#0B0E14] border border-[#2B3345] text-[10px] font-mono text-white p-2.5 rounded-xl shadow-2xl z-30 whitespace-nowrap pointer-events-none">
                            <span className="text-slate-400">Date: {pt.time}</span>
                            <span className="text-red-400 font-bold text-xs">Drawdown: -{pt.drawdown}%</span>
                            <span className="text-slate-300">Balance: ${pt.balance.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 pt-1">
                  <span>Start: <strong className="text-white">${config.initialCapital.toLocaleString()}</strong> ({result.equityCurve[0]?.time})</span>
                  <span>Peak Equity: <strong className="text-emerald-400">${Math.max(...result.equityCurve.map((e) => e.balance)).toLocaleString()}</strong></span>
                  <span>Final Equity: <strong className="text-blue-400">${result.finalCapital.toLocaleString()}</strong> ({result.equityCurve[result.equityCurve.length - 1]?.time})</span>
                </div>
              </div>
            )}

            {/* TAB CONTENT B: Monthly Returns Heatmap Matrix */}
            {analyticsTab === "monthly" && (
              <div className="space-y-3 font-mono text-xs">
                <p className="text-slate-400 text-[11px]">
                  Aggregated month-by-month profitability, return on investment (ROI), and win rate performance matrix.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-black/40 text-slate-400 border-b border-[#1E2430] uppercase text-[11px]">
                      <tr>
                        <th className="p-3">Month / Year</th>
                        <th className="p-3">Net PnL ($)</th>
                        <th className="p-3">Monthly ROI (%)</th>
                        <th className="p-3">Trades Executed</th>
                        <th className="p-3">Win Rate %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E2430]">
                      {(result.monthlyReturns || []).map((m, idx) => {
                        const isWin = m.pnlUSD >= 0;
                        return (
                          <tr key={idx} className="hover:bg-slate-800/20 transition-all">
                            <td className="p-3 font-bold text-white">{m.yearMonth}</td>
                            <td className={`p-3 font-bold ${isWin ? "text-emerald-400" : "text-red-400"}`}>
                              {isWin ? "+" : ""}${m.pnlUSD.toLocaleString()}
                            </td>
                            <td className={`p-3 font-bold ${isWin ? "text-emerald-400" : "text-red-400"}`}>
                              {isWin ? "+" : ""}{m.roiPct}%
                            </td>
                            <td className="p-3 text-slate-300">{m.tradesCount} trades</td>
                            <td className="p-3 font-bold text-blue-400">{m.winRatePct}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT C: Trading Sessions Distribution */}
            {analyticsTab === "sessions" && (
              <div className="space-y-4 font-mono text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(result.sessionBreakdown || []).map((s, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-[#12161F] border border-[#222836] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{s.session}</span>
                        <Clock className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="text-xl font-bold text-emerald-400">
                        {s.pnlUSD >= 0 ? "+" : ""}${s.pnlUSD.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-[#1E2430]">
                        <span>Win Rate: <strong className="text-blue-400">{s.winRatePct}%</strong></span>
                        <span>Trades: <strong className="text-white">{s.trades}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT D: Monte Carlo 1,000-Run Stress Test */}
            {analyticsTab === "monte_carlo" && result.monteCarlo && (
              <div className="space-y-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-[#12161F] border border-[#222836] space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>Monte Carlo Trade Order Randomization (1,000 Permutations)</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Evaluates strategy fragility by simulating 1,000 alternative historical sequences of the executed trades to test probability of ruin and worst-case drawdowns.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                    <div className="p-3 rounded-lg bg-black/40 border border-[#1E2430]">
                      <span className="text-[10px] uppercase text-slate-500 font-bold block">Median Final Equity</span>
                      <span className="text-base font-bold text-blue-400">${result.monteCarlo.medianFinalEquity.toLocaleString()}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-black/40 border border-[#1E2430]">
                      <span className="text-[10px] uppercase text-slate-500 font-bold block">95% Confidence (Low)</span>
                      <span className="text-base font-bold text-amber-400">${result.monteCarlo.ci95LowEquity.toLocaleString()}</span>
                    </div>
                    <div className="p-3 rounded-lg bg-black/40 border border-[#1E2430]">
                      <span className="text-[10px] uppercase text-slate-500 font-bold block">Worst Sim Drawdown</span>
                      <span className="text-base font-bold text-red-400">-{result.monteCarlo.maxSimulatedDrawdownPct}%</span>
                    </div>
                    <div className="p-3 rounded-lg bg-black/40 border border-[#1E2430]">
                      <span className="text-[10px] uppercase text-slate-500 font-bold block">Risk of Ruin (50% DD)</span>
                      <span className="text-base font-bold text-emerald-400">{result.monteCarlo.probRuinPct}% (Ultra Safe)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* EXECUTED TRADES DETAILED LOG */}
          <div className="bg-[#0B0E14] border border-[#222733] rounded-2xl p-6 shadow-2xl space-y-4">
            {/* Header with Search and Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1C222E] pb-4">
              <div>
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2 uppercase tracking-wider">
                  <Activity className="w-4 h-4 text-blue-400" />
                  Executed Trades Log ({filteredTrades.length} / {result.trades.length} Total)
                </h3>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Detailed breakdown of every simulated order entry, trigger rationale, exit milestone, and net profit.
                </p>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={tradeSearch}
                    onChange={(e) => setTradeSearch(e.target.value)}
                    placeholder="Search trades..."
                    className="bg-[#12161F] border border-[#222836] text-white rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Filter Pills */}
                {(["ALL", "WIN", "LOSS", "BREAKEVEN", "BUY", "SELL"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTradeFilter(filter)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs ${
                      tradeFilter === filter
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                        : "bg-[#141820] text-slate-400 hover:text-slate-200 border border-[#222836]"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Trades Table */}
            <div className="overflow-x-auto max-h-96 overflow-y-auto rounded-xl border border-[#1E2430]">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-black/60 text-slate-400 border-b border-[#1E2430] sticky top-0 text-[11px] uppercase tracking-wider z-10">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Entry Date</th>
                    <th className="p-3">Entry Price</th>
                    <th className="p-3">Exit Price</th>
                    <th className="p-3">SL / TP</th>
                    <th className="p-3">Trigger / Rule</th>
                    <th className="p-3">Result</th>
                    <th className="p-3">PnL ($)</th>
                    <th className="p-3">PnL (%)</th>
                    <th className="p-3">R:R</th>
                    <th className="p-3">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2430]">
                  {filteredTrades.map((t) => {
                    const isWin = t.pnlUSD > 0;
                    return (
                      <tr
                        key={t.id}
                        onClick={() => setSelectedTrade(t)}
                        className="hover:bg-slate-800/30 transition-all cursor-pointer"
                      >
                        <td className="p-3 text-slate-500 font-bold">#{t.id}</td>
                        <td className="p-3 font-bold">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              t.type === "BUY"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-red-500/10 text-red-500 border-red-500/20"
                            }`}
                          >
                            {t.type}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300">{t.entryTime}</td>
                        <td className="p-3 text-slate-200 font-bold">${t.entryPrice.toLocaleString()}</td>
                        <td className="p-3 text-slate-200">${t.exitPrice.toLocaleString()}</td>
                        <td className="p-3 text-slate-500 text-[11px]">
                          ${t.stopLoss.toLocaleString()} / ${t.takeProfit.toLocaleString()}
                        </td>
                        <td className="p-3 text-slate-300 text-[11px] max-w-[160px] truncate">
                          {t.ruleTriggered || "Strategy Rule"}
                        </td>
                        <td className="p-3 font-bold">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] border ${
                              t.result === "TP_HIT"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : t.result === "BREAKEVEN"
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                : t.result === "TRAILING_SL_HIT"
                                ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                : t.result === "SL_HIT"
                                ? "bg-red-500/10 text-red-500 border-red-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}
                          >
                            {t.result}
                          </span>
                        </td>
                        <td className={`p-3 font-bold ${isWin ? "text-emerald-400" : "text-red-400"}`}>
                          {isWin ? "+" : ""}${t.pnlUSD.toLocaleString()}
                        </td>
                        <td className={`p-3 font-bold ${isWin ? "text-emerald-400" : "text-red-400"}`}>
                          {isWin ? "+" : ""}{t.pnlPct}%
                        </td>
                        <td className="p-3 text-amber-400 font-bold">{t.rr}R</td>
                        <td className="p-3 text-slate-200 font-bold">${t.balanceAfter.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Trade Anatomy Modal */}
      {selectedTrade && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#0B0E14] border border-[#2B3345] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#1E2430] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" />
                Trade Anatomy #{selectedTrade.id} ({selectedTrade.type} {config.assetKey})
              </h3>
              <button
                onClick={() => setSelectedTrade(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-lg bg-black/40 border border-[#1E2430]">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Entry Date & Price</span>
                <span className="text-white font-bold">{selectedTrade.entryTime}</span>
                <div className="text-blue-400">${selectedTrade.entryPrice.toLocaleString()}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-[#1E2430]">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Exit Date & Price</span>
                <span className="text-white font-bold">{selectedTrade.exitTime}</span>
                <div className="text-slate-300">${selectedTrade.exitPrice.toLocaleString()}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-[#1E2430]">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Net Profit ($)</span>
                <span className={`font-bold text-sm ${selectedTrade.pnlUSD >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {selectedTrade.pnlUSD >= 0 ? "+" : ""}${selectedTrade.pnlUSD.toLocaleString()} ({selectedTrade.pnlPct}%)
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-[#1E2430]">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Risk:Reward Achieved</span>
                <span className="text-amber-400 font-bold text-sm">{selectedTrade.rr}R</span>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-[#1E2430]">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Max Favorable Excursion (MFE)</span>
                <span className="text-emerald-400 font-bold">+{selectedTrade.mfePips || 0} pips</span>
              </div>
              <div className="p-2.5 rounded-lg bg-black/40 border border-[#1E2430]">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Max Adverse Excursion (MAE)</span>
                <span className="text-red-400 font-bold">-{selectedTrade.maePips || 0} pips</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#12161F] border border-[#222836] space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block font-bold">Trigger Rule</span>
              <span className="text-white font-bold">{selectedTrade.ruleTriggered}</span>
              <div className="text-slate-400 text-[11px] mt-1">
                Exit Reason: <strong className="text-blue-400">{selectedTrade.exitReason}</strong> • Held for{" "}
                <strong className="text-white">{selectedTrade.barsHeld} bars</strong>
              </div>
            </div>

            <button
              onClick={() => setSelectedTrade(null)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase"
            >
              Close Breakdown
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

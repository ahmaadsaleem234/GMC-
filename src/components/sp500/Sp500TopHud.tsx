import React, { useState } from "react";
import {
  ShieldAlert,
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Flame,
  Radio,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Check,
  RotateCcw,
} from "lucide-react";
import { Sp500HunterAnalysis, Sp500Instrument } from "../../services/sp500HunterEngine";

interface Sp500TopHudProps {
  analysis: Sp500HunterAnalysis;
  selectedInstrument: Sp500Instrument;
  onSelectInstrument: (instrument: Sp500Instrument) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  customPrice?: number | null;
  onUpdateCustomPrice?: (price: number | null) => void;
}

export const Sp500TopHud: React.FC<Sp500TopHudProps> = ({
  analysis,
  selectedInstrument,
  onSelectInstrument,
  onRefresh,
  isRefreshing,
  customPrice,
  onUpdateCustomPrice,
}) => {
  const {
    currentPrice,
    dailyChange,
    dailyChangePct,
    marketStatus,
    dataStatus,
    dataFreshnessMs,
    aiBias,
    aiScore,
    aiVerdict,
    newsReport,
    dailyGovernor,
  } = analysis;

  const [isCalibratorOpen, setIsCalibratorOpen] = useState(false);
  const [tempPriceInput, setTempPriceInput] = useState(currentPrice.toFixed(2));

  const isTradeBlocked = newsReport.isTradeBlockedByNews || dailyGovernor.isDailyLimitReached || dailyGovernor.isCooldownActive;
  const isNegativeChange = dailyChange < 0;

  const handleApplyCustomPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(tempPriceInput);
    if (!isNaN(val) && val > 0 && onUpdateCustomPrice) {
      onUpdateCustomPrice(val);
      setIsCalibratorOpen(false);
    }
  };

  const handleResetPrice = () => {
    if (onUpdateCustomPrice) {
      onUpdateCustomPrice(null);
      const defaultP = selectedInstrument === "SPY" ? 588.65 : 7711.76;
      setTempPriceInput(defaultP.toFixed(2));
      setIsCalibratorOpen(false);
    }
  };

  return (
    <div className="bg-[#0b0e14]/90 border border-slate-800/80 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-2xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-96 h-40 bg-gradient-to-l from-cyan-500/10 via-indigo-500/5 to-transparent blur-2xl pointer-events-none" />

      {/* Top row: Title matching TradingView layout, Instrument Selector, Live Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          {/* TradingView-style 500 red circular badge */}
          <div className="w-11 h-11 rounded-full bg-[#e11d48] text-white flex items-center justify-center font-black text-sm shadow-[0_0_18px_rgba(225,29,72,0.5)] border-2 border-rose-300/40">
            500
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                S&P 500
                <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700">
                  {selectedInstrument === "SPY" ? "SPY • ETF" : "SPX • SPCFD"}
                </span>
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 uppercase tracking-wider font-bold">
                HIGH-CONVICTION AI HUNTER
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium tracking-wide">
              REAL-TIME S&P 500 (SPX / SPCFD) MARKET INTELLIGENCE — <span className="text-cyan-400 font-mono font-bold">1–2 TRADES/DAY GOVERNOR</span>
            </p>
          </div>
        </div>

        {/* Center: Pair Switcher (SPX • SPCFD / US500 / SPY) */}
        <div className="flex items-center gap-1.5 bg-[#06080d] p-1.5 rounded-xl border border-slate-800/90 shadow-inner flex-wrap">
          <span className="text-[10px] uppercase font-bold text-slate-400 px-2 tracking-wider">
            PAIR:
          </span>
          {([
            { id: "SPX", label: "SPX • SPCFD", tag: "7,711.76", desc: "TradingView CFD" },
            { id: "US500", label: "US500", tag: "7,711.76", desc: "Cash Index" },
            { id: "SPY", label: "SPY", tag: "588.65", desc: "ETF" },
          ] as { id: Sp500Instrument; label: string; tag: string; desc: string }[]).map((inst) => {
            const isSelected = selectedInstrument === inst.id;
            return (
              <button
                key={inst.id}
                id={`btn-select-${inst.id.toLowerCase()}`}
                onClick={() => {
                  onSelectInstrument(inst.id);
                  const defaultP = inst.id === "SPY" ? 588.65 : 7711.76;
                  setTempPriceInput(defaultP.toFixed(2));
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 text-slate-950 shadow-[0_0_16px_rgba(6,182,212,0.7)] font-black scale-105"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
                title={`Select ${inst.label} (${inst.desc})`}
              >
                <span>{inst.label}</span>
                {inst.id === "SPX" && (
                  <span className={`text-[9px] font-mono px-1 rounded ${isSelected ? "bg-slate-950 text-cyan-300 font-bold" : "bg-cyan-950/70 text-cyan-400 border border-cyan-800"}`}>
                    LIVE
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Data Status, Broker Price Calibrator, and Manual Refresh */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-bold">{dataStatus}</span>
            <span className="text-slate-500">|</span>
            <span>{dataFreshnessMs}ms</span>
          </div>

          {/* Broker Price Calibrator Toggle */}
          <button
            id="sp500-price-calibrator-toggle"
            onClick={() => setIsCalibratorOpen(!isCalibratorOpen)}
            className={`p-2 rounded-xl border transition-all active:scale-95 cursor-pointer flex items-center gap-1 text-xs font-bold ${
              customPrice
                ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                : "bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white"
            }`}
            title="Calibrate / Sync with Your Broker Live Quote"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sync Price</span>
          </button>

          <button
            id="sp500-manual-refresh-btn"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Refresh Real-Time Calculations"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Broker Price Calibrator Drawer */}
      {isCalibratorOpen && (
        <div className="mt-3 p-3.5 bg-[#060911] border border-cyan-500/40 rounded-xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              Broker Quote Calibrator:
            </span>
            <span className="text-[11px] text-slate-400">
              Fine-tune the price to match your exact broker / TradingView live quote:
            </span>
          </div>

          <form onSubmit={handleApplyCustomPrice} className="flex items-center gap-2">
            <div className="relative">
              <span className="absolute left-2.5 top-1.5 text-xs text-slate-500 font-mono">$</span>
              <input
                type="number"
                step="0.01"
                value={tempPriceInput}
                onChange={(e) => setTempPriceInput(e.target.value)}
                className="w-32 pl-6 pr-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-white focus:outline-none focus:border-cyan-400"
                placeholder="7711.76"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1 bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-cyan-400 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3 h-3" />
              Apply
            </button>
            <button
              type="button"
              onClick={handleResetPrice}
              className="px-2.5 py-1 bg-slate-800 text-slate-300 font-medium rounded-lg text-xs hover:bg-slate-700 transition-all flex items-center gap-1 cursor-pointer"
              title="Reset to TradingView default (7,711.76)"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </form>
        </div>
      )}

      {/* Main HUD Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">
        {/* Metric 1: Live Price (Matching TradingView: 7,711.76 USD -19.23 -0.25%) */}
        <div className="bg-[#080b11] border border-cyan-500/30 rounded-xl p-3 flex flex-col justify-between shadow-[0_0_15px_rgba(6,182,212,0.1)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              {selectedInstrument === "SPY" ? "SPY" : "SPX (SPCFD)"} PRICE
            </span>
            <span className="text-[9px] font-mono text-cyan-400 font-bold">USD</span>
          </div>
          <div className="mt-1">
            <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
              {currentPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`text-[11px] font-mono font-bold flex items-center gap-1 mt-0.5 ${isNegativeChange ? "text-rose-400" : "text-emerald-400"}`}>
              {isNegativeChange ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              <span>
                {dailyChange > 0 ? `+${dailyChange.toFixed(2)}` : dailyChange.toFixed(2)} ({dailyChangePct > 0 ? `+${dailyChangePct.toFixed(2)}%` : `${dailyChangePct.toFixed(2)}%`})
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: AI Bias */}
        <div className="bg-[#080b11] border border-slate-800/90 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
            AI BIAS
          </span>
          <div className="mt-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-black">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              {aiBias.replace("_", " ")}
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-1">
              REGIME: <span className="text-slate-200 font-bold">INSTITUTIONAL</span>
            </div>
          </div>
        </div>

        {/* Metric 3: AI Setup Score */}
        <div className="bg-[#080b11] border border-slate-800/90 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center justify-between">
            AI SCORE
            <span className="text-[9px] text-slate-500 font-mono">MIN 80</span>
          </span>
          <div className="mt-1">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-xl font-black font-mono ${aiScore >= 80 ? "text-cyan-400" : "text-amber-400"}`}>
                {aiScore}
              </span>
              <span className="text-xs font-mono text-slate-500">/ 100</span>
            </div>
            <div className="w-full bg-slate-800/80 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${aiScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 4: News Risk */}
        <div className="bg-[#080b11] border border-slate-800/90 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
            NEWS RISK
          </span>
          <div className="mt-1">
            {newsReport.overallNewsRisk === "SAFE" ? (
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-black">
                <CheckCircle2 className="w-3 h-3" />
                🟢 SAFE
              </div>
            ) : newsReport.overallNewsRisk === "COOLDOWN_ACTIVE" ? (
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-black">
                <Clock className="w-3 h-3 animate-spin" />
                🟡 COOLDOWN
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-black">
                <AlertTriangle className="w-3 h-3 animate-bounce" />
                🔴 BLOCKED
              </div>
            )}
            <div className="text-[10px] font-mono text-slate-400 mt-1 truncate">
              {newsReport.nextHighImpactEvent ? `Next: in ${newsReport.minutesToNextEvent}m` : "No pending macro event"}
            </div>
          </div>
        </div>

        {/* Metric 5: Trade Status */}
        <div className="bg-[#080b11] border border-slate-800/90 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
            TRADE STATUS
          </span>
          <div className="mt-1">
            {aiVerdict === "BUY" && !isTradeBlocked ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500 text-slate-950 font-black text-xs shadow-[0_0_12px_rgba(6,182,212,0.6)] animate-pulse">
                <Flame className="w-3 h-3 fill-current" />
                🔥 BUY ARMED
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black text-xs">
                <Clock className="w-3 h-3" />
                🟡 WAIT
              </div>
            )}
            <div className="text-[10px] font-mono text-slate-400 mt-1">
              {isTradeBlocked ? "Governor Guard" : "High Conviction"}
            </div>
          </div>
        </div>

        {/* Metric 6: Daily Trades Governor */}
        <div className="bg-[#080b11] border border-slate-800/90 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center justify-between">
            DAILY TRADES
            <span className="text-[9px] text-cyan-400 font-mono">MAX 2</span>
          </span>
          <div className="mt-1">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black font-mono text-white">
                {dailyGovernor.tradesUsedToday}
              </span>
              <span className="text-xs font-mono text-slate-500">/ {dailyGovernor.dailyMaxAllowed}</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-1">
              {dailyGovernor.isDailyLimitReached ? (
                <span className="text-amber-400 font-bold">Limit Reached</span>
              ) : (
                <span className="text-emerald-400">{dailyGovernor.dailyMaxAllowed - dailyGovernor.tradesUsedToday} remaining</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

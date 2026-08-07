import React, { useState, useMemo } from "react";
import { Play, RotateCcw, TrendingUp, ShieldAlert, Award, BarChart3, ArrowUpRight, ArrowDownRight, DollarSign, Sliders, CheckCircle2 } from "lucide-react";
import { BacktestConfig, BacktestResult } from "../types";
import { runBacktest } from "../backtester";
import { SUPPORTED_ASSETS } from "../useLiveData";

interface BacktesterViewProps {
  activeAssetKey: string;
  currentPrice: number;
}

export const BacktesterView: React.FC<BacktesterViewProps> = ({ activeAssetKey, currentPrice }) => {
  const [config, setConfig] = useState<BacktestConfig>({
    assetKey: activeAssetKey,
    strategy: "smc_orderblock",
    timeframe: "15min",
    initialCapital: 10000,
    riskPerTradePct: 1.5,
    leverage: 10,
    periodBars: 400,
    stopLossATRMultiplier: 1.5,
    takeProfitATRMultiplier: 3.0,
  });

  const [result, setResult] = useState<BacktestResult | null>(() => {
    return runBacktest(
      {
        assetKey: activeAssetKey,
        strategy: "smc_orderblock",
        timeframe: "15min",
        initialCapital: 10000,
        riskPerTradePct: 1.5,
        leverage: 10,
        periodBars: 400,
        stopLossATRMultiplier: 1.5,
        takeProfitATRMultiplier: 3.0,
      },
      undefined,
      currentPrice
    );
  });

  const [tradeFilter, setTradeFilter] = useState<"ALL" | "WIN" | "LOSS">("ALL");
  const [isExecuting, setIsExecuting] = useState(false);

  const handleRunTest = () => {
    setIsExecuting(true);
    setTimeout(() => {
      const res = runBacktest(config, undefined, currentPrice);
      setResult(res);
      setIsExecuting(false);
    }, 300);
  };

  const filteredTrades = useMemo(() => {
    if (!result) return [];
    if (tradeFilter === "WIN") return result.trades.filter((t) => t.pnlUSD > 0);
    if (tradeFilter === "LOSS") return result.trades.filter((t) => t.pnlUSD < 0);
    return result.trades;
  }, [result, tradeFilter]);

  const assetObj = SUPPORTED_ASSETS.find((a) => a.key === config.assetKey) || SUPPORTED_ASSETS[0];

  return (
    <div id="gmc-backtester" className="space-y-6 pb-12 font-sans">
      {/* Backtester Header */}
      <div className="bg-[#0A0A0A] border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              HISTORICAL STRATEGY BACKTESTING ENGINE
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Test automated trading rules against historical data to evaluate win rate, profit factor, equity curve, and max drawdown.
            </p>
          </div>

          <button
            onClick={handleRunTest}
            disabled={isExecuting}
            id="run-backtest-btn"
            className="px-5 py-2.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wider font-mono shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 uppercase"
          >
            <Play className={`w-4 h-4 ${isExecuting ? "animate-spin" : ""}`} />
            {isExecuting ? "SIMULATING STRATEGY..." : "EXECUTE BACKTEST"}
          </button>
        </div>
      </div>

      {/* Configuration Inputs Card */}
      <div className="bg-[#080808] border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono flex items-center gap-2 border-b border-slate-800 pb-3">
          <Sliders className="w-4 h-4 text-blue-400" /> Backtest Parameter Settings
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          {/* Target Asset */}
          <div>
            <label className="block text-slate-500 mb-1 text-[11px]">Select Asset</label>
            <select
              value={config.assetKey}
              onChange={(e) => setConfig({ ...config, assetKey: e.target.value })}
              id="backtest-asset-select"
              className="w-full bg-black/40 border border-slate-800 text-slate-100 rounded p-2.5 font-bold focus:border-blue-500 focus:outline-none"
            >
              {SUPPORTED_ASSETS.map((a) => (
                <option key={a.key} value={a.key}>
                  {a.label} ({a.short})
                </option>
              ))}
            </select>
          </div>

          {/* Strategy Algorithm */}
          <div>
            <label className="block text-slate-500 mb-1 text-[11px]">Trading Strategy</label>
            <select
              value={config.strategy}
              onChange={(e) => setConfig({ ...config, strategy: e.target.value as any })}
              id="backtest-strategy-select"
              className="w-full bg-black/40 border border-slate-800 text-slate-100 rounded p-2.5 font-bold focus:border-blue-500 focus:outline-none"
            >
              <option value="smc_orderblock">Smart Money Concepts (SMC Order Block)</option>
              <option value="black_shark_grid">Black Shark Command Grid V1</option>
              <option value="red_green_breakout">Red-to-Green Candle Breakout</option>
              <option value="ema_crossover">EMA 9/21 Trend Crossover</option>
              <option value="supertrend">Supertrend Momentum</option>
            </select>
          </div>

          {/* Timeframe */}
          <div>
            <label className="block text-slate-500 mb-1 text-[11px]">Chart Timeframe</label>
            <select
              value={config.timeframe}
              onChange={(e) => setConfig({ ...config, timeframe: e.target.value as any })}
              id="backtest-tf-select"
              className="w-full bg-black/40 border border-slate-800 text-slate-100 rounded p-2.5 font-bold focus:border-blue-500 focus:outline-none"
            >
              <option value="1min">1 Minute (M1)</option>
              <option value="5min">5 Minutes (M5)</option>
              <option value="15min">15 Minutes (M15)</option>
              <option value="1h">1 Hour (H1)</option>
              <option value="4h">4 Hours (H4)</option>
              <option value="1d">1 Day (D1)</option>
            </select>
          </div>

          {/* Initial Capital */}
          <div>
            <label className="block text-slate-500 mb-1 text-[11px]">Starting Account ($)</label>
            <input
              type="number"
              value={config.initialCapital}
              onChange={(e) => setConfig({ ...config, initialCapital: Math.max(100, parseFloat(e.target.value) || 1000) })}
              id="backtest-capital-input"
              className="w-full bg-black/40 border border-slate-800 text-slate-100 rounded p-2.5 font-bold focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Risk % */}
          <div>
            <label className="block text-slate-500 mb-1 text-[11px]">Risk per Trade (%)</label>
            <input
              type="number"
              step="0.5"
              min="0.1"
              max="10"
              value={config.riskPerTradePct}
              onChange={(e) => setConfig({ ...config, riskPerTradePct: parseFloat(e.target.value) || 1 })}
              id="backtest-risk-input"
              className="w-full bg-black/40 border border-slate-800 text-slate-100 rounded p-2.5 font-bold focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Leverage */}
          <div>
            <label className="block text-slate-500 mb-1 text-[11px]">Leverage (x)</label>
            <input
              type="number"
              min="1"
              max="100"
              value={config.leverage}
              onChange={(e) => setConfig({ ...config, leverage: parseInt(e.target.value) || 1 })}
              id="backtest-leverage-input"
              className="w-full bg-black/40 border border-slate-800 text-slate-100 rounded p-2.5 font-bold focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Test Duration Bars */}
          <div>
            <label className="block text-slate-500 mb-1 text-[11px]">History Length (Bars)</label>
            <select
              value={config.periodBars}
              onChange={(e) => setConfig({ ...config, periodBars: parseInt(e.target.value) })}
              id="backtest-bars-select"
              className="w-full bg-black/40 border border-slate-800 text-slate-100 rounded p-2.5 font-bold focus:border-blue-500 focus:outline-none"
            >
              <option value={200}>200 Bars</option>
              <option value={400}>400 Bars</option>
              <option value={700}>700 Bars</option>
              <option value={1000}>1,000 Bars</option>
            </select>
          </div>

          {/* Target Risk:Reward Multipliers */}
          <div>
            <label className="block text-slate-500 mb-1 text-[11px]">Take Profit Multiplier (x ATR)</label>
            <input
              type="number"
              step="0.5"
              value={config.takeProfitATRMultiplier}
              onChange={(e) => setConfig({ ...config, takeProfitATRMultiplier: parseFloat(e.target.value) || 2 })}
              id="backtest-tp-multiplier-input"
              className="w-full bg-black/40 border border-slate-800 text-slate-100 rounded p-2.5 font-bold focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Results Overview Metrics */}
      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Net Profit Card */}
            <div className="bg-[#080808] border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block font-bold">Total Net Profit</span>
              <div className={`text-lg font-bold font-mono ${result.totalNetProfitUSD >= 0 ? "text-emerald-400" : "text-red-500"}`}>
                {result.totalNetProfitUSD >= 0 ? "+" : ""}${result.totalNetProfitUSD.toLocaleString()}
              </div>
              <div className={`text-xs font-mono font-bold ${result.roiPct >= 0 ? "text-emerald-400" : "text-red-500"}`}>
                {result.roiPct >= 0 ? "+" : ""}{result.roiPct}% ROI
              </div>
            </div>

            {/* Win Rate */}
            <div className="bg-[#080808] border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block font-bold">Win Rate %</span>
              <div className="text-lg font-bold font-mono text-blue-400">{result.winRatePct}%</div>
              <div className="text-xs font-mono text-slate-400">
                {result.winningTrades} W / {result.losingTrades} L
              </div>
            </div>

            {/* Profit Factor */}
            <div className="bg-[#080808] border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block font-bold">Profit Factor</span>
              <div className="text-lg font-bold font-mono text-amber-400">{result.profitFactor}</div>
              <div className="text-xs font-mono text-slate-500">Gross W/L Ratio</div>
            </div>

            {/* Max Drawdown */}
            <div className="bg-[#080808] border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block font-bold">Max Drawdown</span>
              <div className="text-lg font-bold font-mono text-red-500">-{result.maxDrawdownPct}%</div>
              <div className="text-xs font-mono text-slate-500">-${result.maxDrawdownUSD.toLocaleString()}</div>
            </div>

            {/* Sharpe Ratio */}
            <div className="bg-[#080808] border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block font-bold">Sharpe Ratio</span>
              <div className="text-lg font-bold font-mono text-slate-200">{result.sharpeRatio}</div>
              <div className="text-xs font-mono text-slate-500">Risk-Adjusted Return</div>
            </div>

            {/* Total Executed Trades */}
            <div className="bg-[#080808] border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block font-bold">Total Trades</span>
              <div className="text-lg font-bold font-mono text-white">{result.totalTrades}</div>
              <div className="text-xs font-mono text-slate-500">Streak: +{result.maxConsecutiveWins} / -{result.maxConsecutiveLosses}</div>
            </div>
          </div>

          {/* Equity Curve Visualiser */}
          <div className="bg-[#080808] border border-slate-800 p-6 rounded-xl space-y-3 shadow-xl">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Backtest Account Equity Curve
            </h3>

            <div className="h-44 w-full bg-black/40 border border-slate-800 rounded-lg p-3 flex items-end gap-1 overflow-x-auto">
              {result.equityCurve.map((pt, idx) => {
                const minBal = Math.min(...result.equityCurve.map((e) => e.balance));
                const maxBal = Math.max(...result.equityCurve.map((e) => e.balance));
                const range = Math.max(1, maxBal - minBal);
                const heightPct = Math.max(10, Math.min(100, ((pt.balance - minBal) / range) * 100));
                const isGain = pt.balance >= config.initialCapital;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group relative min-w-[6px]">
                    <div
                      className={`w-full rounded-t transition-all ${isGain ? "bg-emerald-500/80 group-hover:bg-emerald-400" : "bg-red-500/80 group-hover:bg-red-400"}`}
                      style={{ height: `${heightPct}%` }}
                    />
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col bg-[#0A0A0A] border border-slate-700 text-[10px] font-mono text-white p-2 rounded shadow-xl z-20 whitespace-nowrap">
                      <span>Date: {pt.time}</span>
                      <span className={isGain ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                        Balance: ${pt.balance.toLocaleString()}
                      </span>
                      <span className="text-red-400">DD: -{pt.drawdown}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Executed Trade Log Table */}
          <div className="bg-[#080808] border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono flex items-center gap-2">
                Executed Trades Log ({filteredTrades.length} Trades)
              </h3>

              <div className="flex items-center gap-1 font-mono text-xs">
                {(["ALL", "WIN", "LOSS"] as const).map((filter) => (
                  <button
                    key={filter}
                    id={`trade-filter-${filter}`}
                    onClick={() => setTradeFilter(filter)}
                    className={`px-3 py-1 rounded font-bold transition-all ${
                      tradeFilter === filter
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {filter} ({filter === "ALL" ? result.trades.length : filter === "WIN" ? result.winningTrades : result.losingTrades})
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-black/40 text-slate-500 border-b border-slate-800 sticky top-0 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5">Entry Date</th>
                    <th className="p-2.5">Entry Price</th>
                    <th className="p-2.5">Exit Price</th>
                    <th className="p-2.5">SL / TP</th>
                    <th className="p-2.5">Result</th>
                    <th className="p-2.5">PnL ($)</th>
                    <th className="p-2.5">PnL (%)</th>
                    <th className="p-2.5">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredTrades.map((t) => {
                    const isWin = t.pnlUSD > 0;
                    return (
                      <tr key={t.id} className="hover:bg-slate-800/20 transition-all">
                        <td className="p-2.5 text-slate-500">#{t.id}</td>
                        <td className="p-2.5 font-bold">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${t.type === "BUY" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}>
                            {t.type}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-400">{t.entryTime}</td>
                        <td className="p-2.5 text-slate-200">${t.entryPrice.toLocaleString()}</td>
                        <td className="p-2.5 text-slate-200">${t.exitPrice.toLocaleString()}</td>
                        <td className="p-2.5 text-slate-500 text-[11px]">
                          ${t.stopLoss.toLocaleString()} / ${t.takeProfit.toLocaleString()}
                        </td>
                        <td className="p-2.5 font-bold">
                          <span className={`px-2 py-0.5 rounded text-[10px] border ${t.result === "TP_HIT" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : t.result === "SL_HIT" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                            {t.result}
                          </span>
                        </td>
                        <td className={`p-2.5 font-bold ${isWin ? "text-emerald-400" : "text-red-500"}`}>
                          {isWin ? "+" : ""}${t.pnlUSD.toLocaleString()}
                        </td>
                        <td className={`p-2.5 font-bold ${isWin ? "text-emerald-400" : "text-red-500"}`}>
                          {isWin ? "+" : ""}{t.pnlPct}%
                        </td>
                        <td className="p-2.5 text-slate-200 font-bold">${t.balanceAfter.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

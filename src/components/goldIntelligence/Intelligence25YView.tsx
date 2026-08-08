import React, { useState } from "react";
import {
  Calendar,
  BarChart3,
  TrendingUp,
  Award,
  Filter,
  Info,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  HISTORICAL_25Y_DATA,
  MONTHLY_SEASONALITY,
  PERIOD_COMPARISONS,
} from "../../services/goldIntelligenceService";

export const Intelligence25YView: React.FC = () => {
  const [heatmapMetric, setHeatmapMetric] = useState<
    "avgReturnPct" | "medianReturnPct" | "bullishWinRate" | "bearishWinRate" | "avgVolatilityPct"
  >("avgReturnPct");

  const [selectedYear, setSelectedYear] = useState<number | "ALL">("ALL");

  const filteredYears = selectedYear === "ALL"
    ? HISTORICAL_25Y_DATA
    : HISTORICAL_25Y_DATA.filter((y) => y.year === selectedYear);

  return (
    <div className="space-y-6 font-mono selection:bg-amber-500 selection:text-black">
      {/* Top Banner */}
      <div className="bg-[#0B0F17] border border-[#D4AF37]/40 rounded-3xl p-6 shadow-2xl space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold uppercase tracking-wider">
            25-YEAR ROLLING DATASET (2001–2026)
          </span>
          <span className="text-xs text-slate-400 font-bold">25 Complete Years + 2026 YTD</span>
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          Historical Gold (XAUUSD) Seasonality & Performance Core
        </h2>
        <p className="text-xs text-slate-300 max-w-4xl leading-relaxed">
          Comprehensive 25-year statistical matrix analyzing monthly return distributions, volatility profiles, win-rates, and multi-decade structural bull regimes across macroeconomic policy shifts.
        </p>
      </div>

      {/* Period Comparisons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PERIOD_COMPARISONS.map((p, idx) => (
          <div key={idx} className="bg-[#070A10] border border-slate-800 p-4 rounded-2xl space-y-2">
            <span className="text-xs font-bold text-amber-400 block uppercase">{p.periodLabel}</span>
            <div className="text-2xl font-black text-white">{p.avgAnnualReturnPct > 0 ? `+${p.avgAnnualReturnPct}%` : `${p.avgAnnualReturnPct}%`}</div>
            <div className="text-[11px] text-slate-400 space-y-0.5">
              <div className="flex justify-between">
                <span>Annual Win Rate:</span>
                <span className="text-emerald-400 font-bold">{p.winRatePct}%</span>
              </div>
              <div className="flex justify-between">
                <span>Max Drawdown:</span>
                <span className="text-rose-400 font-bold">{p.maxDrawdownPct}%</span>
              </div>
              <div className="flex justify-between">
                <span>Best Year:</span>
                <span className="text-amber-300 font-bold">{p.bestYear}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Seasonality Matrix (Heatmap) */}
      <div className="bg-[#070A10] border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-base">MONTHLY SEASONALITY MATRIX (JAN – DEC)</h3>
          </div>

          {/* Metric Selector */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-bold">Metric:</span>
            {(
              [
                { key: "avgReturnPct", label: "Avg Return %" },
                { key: "medianReturnPct", label: "Median %" },
                { key: "bullishWinRate", label: "Bullish Win %" },
                { key: "avgVolatilityPct", label: "Avg Volatility %" },
              ] as const
            ).map((m) => (
              <button
                key={m.key}
                onClick={() => setHeatmapMetric(m.key)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  heatmapMetric === m.key
                    ? "bg-[#D4AF37] text-black shadow-sm"
                    : "bg-[#101726] text-slate-400 hover:text-white"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* 12-Month Heatmap Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          {MONTHLY_SEASONALITY.map((m) => {
            const val = m[heatmapMetric];
            const isPositive = typeof val === "number" && val > 0;
            return (
              <div
                key={m.monthIndex}
                className={`p-3.5 rounded-xl border space-y-2 transition-all ${
                  heatmapMetric === "bullishWinRate"
                    ? (val as number) >= 60
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                      : "bg-[#0A0F1A] border-slate-800 text-slate-300"
                    : isPositive
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                    : "bg-rose-500/15 border-rose-500/40 text-rose-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white uppercase text-sm">{m.monthName}</span>
                  <span className="text-[10px] text-slate-400">25Y</span>
                </div>

                <div className="text-xl font-black font-mono">
                  {heatmapMetric === "bullishWinRate"
                    ? `${val}% Win`
                    : typeof val === "number" && val > 0
                    ? `+${val}%`
                    : `${val}%`}
                </div>

                <div className="text-[10px] text-slate-400 space-y-0.5 border-t border-slate-800/80 pt-1.5">
                  <div className="flex justify-between">
                    <span>Win Rate:</span>
                    <span className="text-emerald-400 font-bold">{m.bullishWinRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Strongest:</span>
                    <span className="text-amber-300">{m.strongestWeek}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Year-by-Year Historical Table */}
      <div className="bg-[#070A10] border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-base">YEAR-BY-YEAR GOLD PERFORMANCE (2001–2026)</h3>
          </div>
          <span className="text-xs text-slate-400 font-bold">25 Years Complete + 2026 YTD</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-[#0A0F1A]">
                <th className="p-3">YEAR</th>
                <th className="p-3">OPEN ($)</th>
                <th className="p-3">CLOSE ($)</th>
                <th className="p-3">HIGH ($)</th>
                <th className="p-3">LOW ($)</th>
                <th className="p-3">ANNUAL RETURN %</th>
                <th className="p-3">MAX DRAWDOWN</th>
                <th className="p-3">VOLATILITY</th>
                <th className="p-3">BEST MONTH</th>
                <th className="p-3">WORST MONTH</th>
                <th className="p-3">BULL / BEAR MONTHS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredYears.map((y) => (
                <tr key={y.year} className="hover:bg-[#0E1524] transition-colors">
                  <td className="p-3 font-bold text-amber-300">{y.year}</td>
                  <td className="p-3 text-slate-300">${y.open.toFixed(1)}</td>
                  <td className="p-3 font-bold text-white">${y.close.toFixed(1)}</td>
                  <td className="p-3 text-emerald-400">${y.high.toFixed(1)}</td>
                  <td className="p-3 text-rose-400">${y.low.toFixed(1)}</td>
                  <td className="p-3 font-black">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        y.returnPct >= 0
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      }`}
                    >
                      {y.returnPct >= 0 ? `+${y.returnPct}%` : `${y.returnPct}%`}
                    </span>
                  </td>
                  <td className="p-3 text-rose-400">{y.maxDrawdownPct}%</td>
                  <td className="p-3 text-slate-300">{y.volatilityPct}%</td>
                  <td className="p-3 text-emerald-300">{y.bestMonth} (+{y.bestMonthReturn}%)</td>
                  <td className="p-3 text-rose-300">{y.worstMonth} ({y.worstMonthReturn}%)</td>
                  <td className="p-3 text-slate-300">
                    <span className="text-emerald-400 font-bold">{y.bullishMonths} Bull</span> / <span className="text-rose-400 font-bold">{y.bearishMonths} Bear</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

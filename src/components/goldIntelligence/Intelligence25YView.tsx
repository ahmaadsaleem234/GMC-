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
    <div className="space-y-6 font-mono">
      {/* Top Banner */}
      <div className="bg-[#080A0D] border border-[#292E35] rounded-2xl p-5 md:p-6 shadow-none space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded bg-[rgba(241,204,107,0.08)] text-[#F1CC6B] border border-[rgba(241,204,107,0.3)] text-xs font-semibold uppercase tracking-wider">
            25-YEAR ROLLING DATASET (2001–2026)
          </span>
          <span className="text-xs text-[#9299A3] font-medium">25 Complete Years + 2026 YTD</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Historical Gold (XAUUSD) Seasonality & Performance Core
        </h2>
        <p className="text-xs text-[#9299A3] max-w-4xl leading-relaxed">
          Comprehensive 25-year statistical matrix analyzing monthly return distributions, volatility profiles, win-rates, and multi-decade structural bull regimes across macroeconomic policy shifts.
        </p>
      </div>

      {/* Period Comparisons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PERIOD_COMPARISONS.map((p, idx) => (
          <div key={idx} className="bg-[#111419] border border-[#292E35] p-4 rounded-xl space-y-2">
            <span className="text-xs font-semibold text-[#F1CC6B] block uppercase">{p.periodLabel}</span>
            <div className="text-xl font-bold text-white">{p.avgAnnualReturnPct > 0 ? `+${p.avgAnnualReturnPct}%` : `${p.avgAnnualReturnPct}%`}</div>
            <div className="text-[11px] text-[#9299A3] space-y-0.5">
              <div className="flex justify-between">
                <span>Annual Win Rate:</span>
                <span className="text-[#74D8A0] font-semibold">{p.winRatePct}%</span>
              </div>
              <div className="flex justify-between">
                <span>Max Drawdown:</span>
                <span className="text-[#EE777F] font-semibold">{p.maxDrawdownPct}%</span>
              </div>
              <div className="flex justify-between">
                <span>Best Year:</span>
                <span className="text-[#F1CC6B] font-semibold">{p.bestYear}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Seasonality Matrix (Heatmap) */}
      <div className="bg-[#111419] border border-[#292E35] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#252A31] pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#F1CC6B]" />
            <h3 className="font-semibold text-white text-sm">MONTHLY SEASONALITY MATRIX (JAN – DEC)</h3>
          </div>

          {/* Metric Selector */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[#9299A3] font-medium">Metric:</span>
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
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  heatmapMetric === m.key
                    ? "bg-[#F1CC6B] text-[#111111] font-semibold"
                    : "bg-[#0E1115] text-[#9299A3] border border-[#242A31] hover:text-white"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* 12-Month Heatmap Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          {MONTHLY_SEASONALITY.map((m) => {
            const val = m[heatmapMetric];
            const isPositive = typeof val === "number" && val > 0;
            return (
              <div
                key={m.monthIndex}
                className={`p-3 rounded-xl border space-y-2 transition-all ${
                  heatmapMetric === "bullishWinRate"
                    ? (val as number) >= 60
                      ? "bg-[#17342E] border-[rgba(116,216,160,0.4)] text-[#74D8A0]"
                      : "bg-[#0E1115] border-[#242A31] text-[#9299A3]"
                    : isPositive
                    ? "bg-[#17342E] border-[rgba(116,216,160,0.4)] text-[#74D8A0]"
                    : "bg-[#352329] border-[rgba(238,119,127,0.4)] text-[#EE777F]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white uppercase text-xs">{m.monthName}</span>
                  <span className="text-[10px] text-[#9299A3]">25Y</span>
                </div>

                <div className="text-lg font-bold font-mono">
                  {heatmapMetric === "bullishWinRate"
                    ? `${val}% Win`
                    : typeof val === "number" && val > 0
                    ? `+${val}%`
                    : `${val}%`}
                </div>

                <div className="text-[10px] text-[#9299A3] space-y-0.5 border-t border-[#242A31] pt-1.5">
                  <div className="flex justify-between">
                    <span>Win Rate:</span>
                    <span className="text-[#74D8A0] font-medium">{m.bullishWinRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Strongest:</span>
                    <span className="text-[#F1CC6B]">{m.strongestWeek}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Year-by-Year Historical Table */}
      <div className="bg-[#111419] border border-[#292E35] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#252A31] pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#F1CC6B]" />
            <h3 className="font-semibold text-white text-sm">YEAR-BY-YEAR GOLD PERFORMANCE (2001–2026)</h3>
          </div>
          <span className="text-xs text-[#9299A3] font-medium">25 Years Complete + 2026 YTD</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#272C32] text-[#9299A3] bg-[#0E1115]">
                <th className="p-2.5">YEAR</th>
                <th className="p-2.5">OPEN ($)</th>
                <th className="p-2.5">CLOSE ($)</th>
                <th className="p-2.5">HIGH ($)</th>
                <th className="p-2.5">LOW ($)</th>
                <th className="p-2.5">ANNUAL RETURN %</th>
                <th className="p-2.5">MAX DRAWDOWN</th>
                <th className="p-2.5">VOLATILITY</th>
                <th className="p-2.5">BEST MONTH</th>
                <th className="p-2.5">WORST MONTH</th>
                <th className="p-2.5">BULL / BEAR MONTHS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242A31]">
              {filteredYears.map((y) => (
                <tr key={y.year} className="hover:bg-[#161A21] transition-colors">
                  <td className="p-2.5 font-bold text-[#F1CC6B]">{y.year}</td>
                  <td className="p-2.5 text-[#F3F4F5]">${y.open.toFixed(1)}</td>
                  <td className="p-2.5 font-semibold text-white">${y.close.toFixed(1)}</td>
                  <td className="p-2.5 text-[#74D8A0]">${y.high.toFixed(1)}</td>
                  <td className="p-2.5 text-[#EE777F]">${y.low.toFixed(1)}</td>
                  <td className="p-2.5 font-semibold">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        y.returnPct >= 0
                          ? "bg-[#17342E] text-[#74D8A0] border border-[rgba(116,216,160,0.4)]"
                          : "bg-[#352329] text-[#EE777F] border border-[rgba(238,119,127,0.4)]"
                      }`}
                    >
                      {y.returnPct >= 0 ? `+${y.returnPct}%` : `${y.returnPct}%`}
                    </span>
                  </td>
                  <td className="p-2.5 text-[#EE777F]">{y.maxDrawdownPct}%</td>
                  <td className="p-2.5 text-[#9299A3]">{y.volatilityPct}%</td>
                  <td className="p-2.5 text-[#74D8A0]">{y.bestMonth} (+{y.bestMonthReturn}%)</td>
                  <td className="p-2.5 text-[#EE777F]">{y.worstMonth} ({y.worstMonthReturn}%)</td>
                  <td className="p-2.5 text-[#9299A3]">
                    <span className="text-[#74D8A0] font-semibold">{y.bullishMonths} Bull</span> / <span className="text-[#EE777F] font-semibold">{y.bearishMonths} Bear</span>
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

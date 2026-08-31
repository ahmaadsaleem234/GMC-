import React, { useState, useMemo } from "react";

export interface SessionPnLPoint {
  time: string;
  pnl: number; // in USD or %
}

interface SessionGhostTrailPnLChartProps {
  todayData?: SessionPnLPoint[];
  yesterdayData?: SessionPnLPoint[];
  height?: number;
  showLegend?: boolean;
  currencyPrefix?: string;
  className?: string;
}

export const SessionGhostTrailPnLChart: React.FC<SessionGhostTrailPnLChartProps> = ({
  todayData,
  yesterdayData,
  height = 160,
  showLegend = true,
  currencyPrefix = "$",
  className = "",
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Default realistic live session data if not provided
  const defaultToday: SessionPnLPoint[] = useMemo(
    () => [
      { time: "09:00", pnl: 0 },
      { time: "09:45", pnl: 180 },
      { time: "10:30", pnl: 320 },
      { time: "11:15", pnl: 290 },
      { time: "12:00", pnl: 540 },
      { time: "12:45", pnl: 720 },
      { time: "13:30", pnl: 880 },
      { time: "14:15", pnl: 1140 },
      { time: "15:00", pnl: 1350 },
    ],
    []
  );

  const defaultYesterday: SessionPnLPoint[] = useMemo(
    () => [
      { time: "09:00", pnl: 0 },
      { time: "09:45", pnl: 90 },
      { time: "10:30", pnl: 210 },
      { time: "11:15", pnl: 180 },
      { time: "12:00", pnl: 380 },
      { time: "12:45", pnl: 490 },
      { time: "13:30", pnl: 620 },
      { time: "14:15", pnl: 780 },
      { time: "15:00", pnl: 940 },
    ],
    []
  );

  const today = todayData || defaultToday;
  const yesterday = yesterdayData || defaultYesterday;

  // Calculate dynamic bounds for both series
  const allValues = [...today.map((d) => d.pnl), ...yesterday.map((d) => d.pnl)];
  const minVal = Math.min(0, ...allValues);
  const maxVal = Math.max(100, ...allValues) * 1.08;
  const range = maxVal - minVal || 1;

  const width = 600;
  const svgHeight = height;
  const paddingX = 20;
  const paddingY = 24;

  const chartWidth = width - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  // Convert points to SVG coordinates
  const getCoordinates = (points: SessionPnLPoint[]) => {
    return points.map((pt, i) => {
      const x = paddingX + (i / (points.length - 1)) * chartWidth;
      const y = paddingY + chartHeight - ((pt.pnl - minVal) / range) * chartHeight;
      return { x, y, pt };
    });
  };

  const todayCoords = useMemo(() => getCoordinates(today), [today, minVal, range]);
  const yesterdayCoords = useMemo(() => getCoordinates(yesterday), [yesterday, minVal, range]);

  // Generate smooth SVG paths
  const generateSmoothPath = (coords: { x: number; y: number }[]) => {
    if (coords.length === 0) return "";
    return coords.reduce((acc, point, i, arr) => {
      if (i === 0) return `M ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
      const prev = arr[i - 1];
      const cx1 = (prev.x + point.x) / 2;
      const cy1 = prev.y;
      const cx2 = (prev.x + point.x) / 2;
      const cy2 = point.y;
      return `${acc} C ${cx1.toFixed(1)} ${cy1.toFixed(1)}, ${cx2.toFixed(1)} ${cy2.toFixed(1)}, ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    }, "");
  };

  const todayPath = useMemo(() => generateSmoothPath(todayCoords), [todayCoords]);
  const yesterdayPath = useMemo(() => generateSmoothPath(yesterdayCoords), [yesterdayCoords]);

  // Generate closed area path for Today's gradient fill
  const todayAreaPath = useMemo(() => {
    if (todayCoords.length === 0) return "";
    const first = todayCoords[0];
    const last = todayCoords[todayCoords.length - 1];
    const baselineY = paddingY + chartHeight;
    return `${todayPath} L ${last.x.toFixed(1)} ${baselineY} L ${first.x.toFixed(1)} ${baselineY} Z`;
  }, [todayCoords, todayPath, paddingY, chartHeight]);

  const latestTodayPnl = today[today.length - 1]?.pnl ?? 0;
  const latestYesterdayPnl = yesterday[yesterday.length - 1]?.pnl ?? 0;
  const pnlDifference = latestTodayPnl - latestYesterdayPnl;

  return (
    <div className={`w-full font-mono select-none space-y-2 ${className}`}>
      {showLegend && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold tracking-wide">SESSION PNL COMPARISON</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              {pnlDifference >= 0 ? `+${currencyPrefix}${pnlDifference.toFixed(0)} vs Yest` : `-${currencyPrefix}${Math.abs(pnlDifference).toFixed(0)} vs Yest`}
            </span>
          </div>

          {/* Tiny Legend (Mandated) */}
          <div className="flex items-center gap-4 text-[10px]">
            {/* Today Solid Line */}
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-emerald-400 rounded-full shadow-[0_0_6px_rgba(16,185,129,0.8)] inline-block" />
              <span className="text-emerald-300 font-semibold">Today (Solid)</span>
            </div>

            {/* Yesterday Ghost Trail */}
            <div className="flex items-center gap-1.5">
              <span
                className="w-4 h-0.5 border-t border-dashed border-slate-400 opacity-60 inline-block"
                style={{ borderTopWidth: "1.5px" }}
              />
              <span className="text-slate-400">Yesterday (Ghost Trail)</span>
            </div>
          </div>
        </div>
      )}

      {/* SVG Canvas Area */}
      <div className="relative w-full overflow-hidden rounded-xl bg-[#070B14]/60 border border-slate-800/60 p-2">
        <svg
          viewBox={`0 0 ${width} ${svgHeight}`}
          className="w-full h-auto overflow-visible"
          preserveAspectRatio="none"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            {/* Today Gradient Fill */}
            <linearGradient id="todayAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.28" />
              <stop offset="90%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>

            {/* Glowing filter for Today line */}
            <filter id="todayGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#10B981" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingY + chartHeight * ratio;
            return (
              <line
                key={idx}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#1E293B"
                strokeWidth="0.8"
                strokeDasharray="2 4"
                opacity="0.6"
              />
            );
          })}

          {/* 1. GHOST LINE: Yesterday's PnL curve at 25-30% opacity, dashed stroke */}
          <path
            d={yesterdayPath}
            fill="none"
            stroke="#94A3B8"
            strokeWidth="1.8"
            strokeDasharray="5 4"
            opacity="0.28"
            className="pointer-events-none"
          />

          {/* 2. TODAY AREA FILL */}
          <path d={todayAreaPath} fill="url(#todayAreaGrad)" className="pointer-events-none" />

          {/* 3. MAIN LINE: Today's Live PnL curve (Full Opacity, Emerald Glow) */}
          <path
            d={todayPath}
            fill="none"
            stroke="#10B981"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#todayGlow)"
          />

          {/* Data Points and Hover Target on Today Line */}
          {todayCoords.map((coord, idx) => {
            const isHovered = hoverIndex === idx;
            const isLatest = idx === todayCoords.length - 1;
            return (
              <g
                key={idx}
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(idx)}
              >
                {/* Invisible hit box for mobile/touch */}
                <circle cx={coord.x} cy={coord.y} r="12" fill="transparent" />

                {/* Visible node circle */}
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r={isHovered || isLatest ? 4.5 : 2.5}
                  fill={isHovered || isLatest ? "#34D399" : "#10B981"}
                  stroke="#070B14"
                  strokeWidth="1.5"
                  className="transition-all duration-150"
                  style={{
                    filter: isHovered || isLatest ? "drop-shadow(0 0 6px #10B981)" : undefined,
                  }}
                />
              </g>
            );
          })}

          {/* Hover Tooltip / Overlay */}
          {hoverIndex !== null && todayCoords[hoverIndex] && (
            <g>
              <line
                x1={todayCoords[hoverIndex].x}
                y1={paddingY}
                x2={todayCoords[hoverIndex].x}
                y2={paddingY + chartHeight}
                stroke="#34D399"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.8"
              />
              <circle
                cx={todayCoords[hoverIndex].x}
                cy={todayCoords[hoverIndex].y}
                r="6"
                fill="#FFFFFF"
                stroke="#10B981"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Floating Tooltip Label */}
        {hoverIndex !== null && todayCoords[hoverIndex] && (
          <div
            className="absolute top-2 z-20 px-2.5 py-1 bg-[#0F172A] border border-emerald-500/40 rounded-lg text-[10px] text-white shadow-xl pointer-events-none transform -translate-x-1/2 flex items-center gap-2"
            style={{
              left: `${(todayCoords[hoverIndex].x / width) * 100}%`,
            }}
          >
            <span className="text-slate-400">{todayCoords[hoverIndex].pt.time}:</span>
            <span className="text-emerald-400 font-bold">
              +{currencyPrefix}{todayCoords[hoverIndex].pt.pnl.toFixed(2)}
            </span>
            {yesterday[hoverIndex] && (
              <span className="text-slate-500 text-[9px]">
                (Yest: +{currencyPrefix}{yesterday[hoverIndex].pnl.toFixed(0)})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Axis Time Labels */}
      <div className="flex justify-between text-[9px] text-slate-500 font-mono px-2">
        {today.map((pt, i) => (
          <span key={i} className={i % 2 === 0 ? "opacity-100" : "opacity-0 sm:opacity-100"}>
            {pt.time}
          </span>
        ))}
      </div>
    </div>
  );
};

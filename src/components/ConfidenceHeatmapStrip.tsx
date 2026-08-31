import React from "react";

interface ConfidenceHeatmapStripProps {
  winRatePct: number;
  brainName?: string;
  className?: string;
  showLabels?: boolean;
}

export const ConfidenceHeatmapStrip: React.FC<ConfidenceHeatmapStripProps> = ({
  winRatePct,
  brainName,
  className = "",
  showLabels = true,
}) => {
  // Clamp win rate between 0 and 100 for position calculation
  const clampedPct = Math.max(0, Math.min(100, winRatePct));

  // Determine color badge style based on win rate tier
  const getTierColor = (val: number) => {
    if (val >= 90) return "text-emerald-400";
    if (val >= 80) return "text-amber-400";
    return "text-rose-400";
  };

  return (
    <div className={`w-full space-y-1 select-none ${className}`}>
      {showLabels && (
        <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-pulse" />
            <span>CONFIDENCE HEATMAP</span>
          </span>
          <span className={`font-bold ${getTierColor(clampedPct)}`}>
            {clampedPct.toFixed(1)}% WR
          </span>
        </div>
      )}

      {/* Heatmap Bar Container */}
      <div className="relative w-full h-2 bg-slate-900 rounded-full border border-slate-800/80 p-0.5 overflow-visible">
        {/* Continuous Red -> Yellow/Orange -> Emerald Green gradient */}
        <div
          className="w-full h-full rounded-full opacity-90"
          style={{
            background:
              "linear-gradient(90deg, #EF4444 0%, #F97316 35%, #EAB308 65%, #10B981 85%, #059669 100%)",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.6)",
          }}
        />

        {/* Marker / Indicator Dot on exact win rate position */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 transition-all duration-500 ease-out"
          style={{ left: `${clampedPct}%` }}
          title={`${brainName ? `${brainName}: ` : ""}Historical Win Rate ${clampedPct.toFixed(1)}%`}
        >
          {/* Glowing pulse ring */}
          <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-[#0B0F17] shadow-[0_0_8px_rgba(255,255,255,0.9),0_0_12px_rgba(16,185,129,0.7)]" />
        </div>
      </div>

      {/* Subtle Scale Markers */}
      <div className="flex justify-between text-[8px] font-mono text-slate-500 px-0.5 pt-0.5">
        <span>0%</span>
        <span className="text-slate-600">50%</span>
        <span>100%</span>
      </div>
    </div>
  );
};

import React from "react";
import { SentinelHeatmapCell } from "../../services/sentinelEngine";
import { Grid, Flame, Activity } from "lucide-react";

interface SentinelOpportunityHeatmapProps {
  heatmapCells: SentinelHeatmapCell[];
  onSelectAsset: (assetKey: string) => void;
  activeAssetKey: string;
}

export const SentinelOpportunityHeatmap: React.FC<SentinelOpportunityHeatmapProps> = ({
  heatmapCells,
  onSelectAsset,
  activeAssetKey,
}) => {
  return (
    <div className="bg-[#050608] border border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_25px_rgba(6,182,212,0.12)] font-mono flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2.5">
        <div className="flex items-center gap-2">
          <Grid className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-xs text-cyan-300 uppercase tracking-wider">
            OPPORTUNITY CONFLUENCE HEATMAP
          </span>
        </div>
        <span className="text-[10px] text-slate-400">MULTI-FACTOR INTENSITY</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
              <th className="py-2 px-2.5">ASSET</th>
              <th className="py-2 px-2.5">BIAS</th>
              <th className="py-2 px-2.5">LIQUIDITY</th>
              <th className="py-2 px-2.5">MOMENTUM</th>
              <th className="py-2 px-2.5">VOLATILITY</th>
              <th className="py-2 px-2.5">STRUCTURE</th>
              <th className="py-2 px-2.5 text-right">CONFIDENCE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {heatmapCells.map((cell) => {
              const isSelected = cell.assetKey === activeAssetKey;
              const isSell = cell.bias === "SELL";

              const getHeatColor = (score: number) => {
                if (score >= 90) return "bg-cyan-500/25 text-cyan-300 border-cyan-500/40";
                if (score >= 80) return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
                if (score >= 70) return "bg-amber-500/20 text-amber-300 border-amber-500/30";
                return "bg-slate-800 text-slate-400 border-slate-700";
              };

              return (
                <tr
                  key={cell.assetKey}
                  onClick={() => onSelectAsset(cell.assetKey)}
                  className={`hover:bg-[#0B1017] transition-all cursor-pointer ${
                    isSelected ? "bg-[#0A1624] text-white" : "text-slate-300"
                  }`}
                >
                  <td className="py-2.5 px-2.5 font-bold text-cyan-200">
                    {cell.symbol}
                  </td>
                  <td className="py-2.5 px-2.5">
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                        isSell ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300"
                      }`}
                    >
                      {cell.bias}
                    </span>
                  </td>
                  <td className="py-2.5 px-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getHeatColor(cell.liquidityScore)}`}>
                      {cell.liquidityScore}%
                    </span>
                  </td>
                  <td className="py-2.5 px-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getHeatColor(cell.momentumScore)}`}>
                      {cell.momentumScore}%
                    </span>
                  </td>
                  <td className="py-2.5 px-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getHeatColor(cell.volatilityScore)}`}>
                      {cell.volatilityScore}%
                    </span>
                  </td>
                  <td className="py-2.5 px-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getHeatColor(cell.structureScore)}`}>
                      {cell.structureScore}%
                    </span>
                  </td>
                  <td className="py-2.5 px-2.5 text-right">
                    <span className="font-extrabold text-cyan-300 font-mono bg-cyan-500/15 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                      {cell.confidenceScore}/100
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

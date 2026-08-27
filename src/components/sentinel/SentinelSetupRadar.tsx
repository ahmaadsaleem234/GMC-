import React from "react";
import { SentinelRadarItem } from "../../services/sentinelEngine";
import { Radar, Compass, AlertCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface SentinelSetupRadarProps {
  radarItems: SentinelRadarItem[];
  onSelectAsset: (assetKey: string) => void;
  activeAssetKey: string;
}

export const SentinelSetupRadar: React.FC<SentinelSetupRadarProps> = ({
  radarItems,
  onSelectAsset,
  activeAssetKey,
}) => {
  return (
    <div className="bg-[#050608] border border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_25px_rgba(6,182,212,0.12)] font-mono flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2.5">
        <div className="flex items-center gap-2">
          <Radar className="w-4 h-4 text-cyan-400 animate-spin text-opacity-80" />
          <span className="font-bold text-xs text-cyan-300 uppercase tracking-wider">
            MULTI-ASSET SETUP RADAR
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">SCANNING 5 MARKETS</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {radarItems.map((item) => {
          const isSelected = item.assetKey === activeAssetKey;
          const isSell = item.direction === "SELL";
          const isReady = item.status === "ENTRY_READY";

          return (
            <div
              key={item.assetKey}
              onClick={() => onSelectAsset(item.assetKey)}
              className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? "bg-[#0A1726] border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  : "bg-[#090C12] border-slate-800/80 hover:border-cyan-500/40 hover:bg-[#0B1019]"
              }`}
            >
              {/* Radar status glow indicator */}
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-extrabold text-white text-xs tracking-tight">
                  {item.symbol}
                </span>
                <span
                  className={`text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                    isSell
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  }`}
                >
                  {isSell ? <ArrowDownRight className="w-2.5 h-2.5" /> : <ArrowUpRight className="w-2.5 h-2.5" />}
                  {item.direction}
                </span>
              </div>

              <div className="text-[11px] font-bold text-cyan-200 font-mono mb-1">
                ${item.price.toFixed(item.price > 500 ? 2 : 4)}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span>Score:</span>
                <span
                  className={`font-bold font-mono ${
                    item.score >= 90
                      ? "text-cyan-300"
                      : item.score >= 80
                      ? "text-emerald-300"
                      : item.score >= 70
                      ? "text-amber-300"
                      : "text-rose-400"
                  }`}
                >
                  {item.score}/100
                </span>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Status:</span>
                <span
                  className={`font-extrabold text-[9px] px-1.5 py-0.5 rounded ${
                    isReady
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 animate-pulse"
                      : item.status === "FORMING"
                      ? "bg-amber-500/20 text-amber-300"
                      : item.status === "WAIT"
                      ? "bg-slate-800 text-slate-400"
                      : "bg-rose-500/20 text-rose-300"
                  }`}
                >
                  {item.status.replace(/_/g, " ")}
                </span>
              </div>

              <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[9px] text-slate-400 truncate">
                {item.liquidityState}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

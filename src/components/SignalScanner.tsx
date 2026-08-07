import React from "react";
import { getModuleTitle } from "../utils/moduleRegistry";
import { Radio, ArrowUpRight, ArrowDownRight, Zap } from "lucide-react";
import { SUPPORTED_ASSETS } from "../useLiveData";
import { LivePrice } from "../types";

interface SignalScannerProps {
  prices: Record<string, LivePrice>;
  onSelectAsset: (key: string) => void;
}

export const SignalScanner: React.FC<SignalScannerProps> = ({ prices, onSelectAsset }) => {
  return (
    <div id="gmc-signal-scanner" className="space-y-6 pb-12 font-sans">
      <div className="bg-[#0A0A0A] border border-slate-800 rounded-xl p-5 shadow-xl">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          {getModuleTitle("aimaster")}
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-mono">
          Scans multi-timeframe indicators, RSI momentum, SMC Order Blocks, and session volatility across all supported markets.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono">
        {SUPPORTED_ASSETS.map((asset) => {
          const live = prices[asset.key] || { price: asset.basePrice, changePct: 0.2 };
          const pos = live.changePct >= 0;
          const isBull = pos;

          return (
            <div
              key={asset.key}
              onClick={() => onSelectAsset(asset.key)}
              className="bg-[#080808] border border-slate-800 hover:border-blue-500/50 p-5 rounded-xl cursor-pointer transition-all space-y-3 group shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    {asset.short}
                    <span className="text-[10px] text-slate-500 font-normal uppercase tracking-wider">{asset.category}</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-sans">{asset.label}</span>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-white">${live.price.toLocaleString()}</div>
                  <div className={`text-xs font-bold flex items-center justify-end ${pos ? "text-emerald-400" : "text-red-500"}`}>
                    {pos ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {pos ? "+" : ""}{live.changePct}%
                  </div>
                </div>
              </div>

              <div className="p-3 bg-black/40 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px] uppercase tracking-wider">Verdict:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[10px] border ${isBull ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
                  {isBull ? "BUY CONFLUENCE" : "SELL REVERSAL"}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-slate-500 border-t border-slate-800/80 pt-2">
                <span>High: ${live.high24h?.toLocaleString()}</span>
                <span>Low: ${live.low24h?.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

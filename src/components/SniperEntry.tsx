import React, { useState } from "react";
import { Zap, CheckCircle2, ShieldAlert, Send, ArrowUpRight, ArrowDownRight, Layers, Target, Lock, AlertCircle } from "lucide-react";
import { Candle, ConfluenceResult } from "../types";
import { buildEntryConfluence } from "../signals";
import { SUPPORTED_ASSETS } from "../useLiveData";
import { dispatchTradeAlertToTelegram } from "../utils/telegram";

interface SniperEntryProps {
  candles: Candle[];
  currentPrice: number;
  activeAssetKey: string;
}

export const SniperEntry: React.FC<SniperEntryProps> = ({ candles, currentPrice, activeAssetKey }) => {
  const [telegramSent, setTelegramSent] = useState(false);
  const confluence: ConfluenceResult = buildEntryConfluence(candles, currentPrice);
  const currentAsset = SUPPORTED_ASSETS.find((a) => a.key === activeAssetKey) || SUPPORTED_ASSETS[0];

  const handleSendTelegram = async () => {
    try {
      await dispatchTradeAlertToTelegram({
        source: "🎯 GMC SNIPER ENTRY ENGINE",
        asset: currentAsset.label,
        type: confluence.direction === "SELL" ? "SELL" : "BUY",
        entry: confluence.entry,
        sl: confluence.stopLoss,
        tp1: confluence.tp1,
        tp2: confluence.tp2,
        tp3: confluence.tp3,
        lotSize: 0.01,
        confluence: `Score: ${confluence.score}% (Grade ${confluence.score >= 80 ? "A+" : "A"})`,
      });
      setTelegramSent(true);
      setTimeout(() => setTelegramSent(false), 4000);
    } catch (e) {
      console.warn("Telegram alert send error:", e);
    }
  };

  const isBuy = confluence.direction === "BUY";
  const isSell = confluence.direction === "SELL";

  return (
    <div id="gmc-sniper-entry" className="space-y-6 pb-12 font-sans">
      {/* Signal Header Card */}
      <div className="bg-[#0A0A0A] border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400 font-bold flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-blue-400" /> GMC SNIPER CONFLUENCE SIGNAL
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-3">
              {currentAsset.label} Real-time Signal
              <span
                className={`text-xs font-mono font-bold px-3 py-1 rounded border ${
                  isBuy
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : isSell
                    ? "bg-red-500/10 text-red-500 border-red-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}
              >
                {confluence.direction} (GRADE: {confluence.score >= 80 ? "A+" : confluence.score >= 65 ? "A" : "B"})
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSendTelegram}
              id="send-telegram-signal-btn"
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-xs font-mono text-white font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-600/20 active:scale-95 uppercase tracking-wider"
            >
              <Send className="w-4 h-4 text-white" />
              {telegramSent ? "ALERT DISPATCHED!" : "DISPATCH TELEGRAM ALERT"}
            </button>
          </div>
        </div>

        {/* Confidence Gauge Bar */}
        <div className="space-y-1 font-mono text-xs">
          <div className="flex justify-between text-slate-300">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Confluence Score:</span>
            <span className="font-bold text-blue-400">{confluence.score}% / 100%</span>
          </div>
          <div className="w-full bg-black/60 rounded-full h-2 border border-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isBuy ? "bg-emerald-400" : isSell ? "bg-red-500" : "bg-amber-400"
              }`}
              style={{ width: `${confluence.score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Entry, SL, TP Execution Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Entry Price */}
        <div className="bg-black/40 border border-slate-800 p-5 rounded-xl space-y-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">1. Entry Zone</span>
          <div className="text-2xl font-bold font-mono text-white">${confluence.entry.toLocaleString()}</div>
          <p className="text-[11px] font-mono text-slate-500">Market order execution baseline</p>
        </div>

        {/* Stop Loss */}
        <div className="bg-black/40 border border-slate-800 p-5 rounded-xl space-y-2">
          <span className="text-[10px] font-mono text-red-500 uppercase tracking-widest block font-bold">2. Invalidation Stop Loss</span>
          <div className="text-2xl font-bold font-mono text-red-500">${confluence.stopLoss.toLocaleString()}</div>
          <p className="text-[11px] font-mono text-slate-500">1.5x ATR Invalidation Floor</p>
        </div>

        {/* Target 1 */}
        <div className="bg-black/40 border border-slate-800 p-5 rounded-xl space-y-2">
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">3. Take Profit 1 (TP1)</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">${confluence.tp1.toLocaleString()}</div>
          <p className="text-[11px] font-mono text-slate-500">Conservative 1:1.8 RR Target</p>
        </div>

        {/* Target 2 & 3 */}
        <div className="bg-black/40 border border-slate-800 p-5 rounded-xl space-y-2">
          <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest block font-bold">4. Runner Targets (TP2 / TP3)</span>
          <div className="text-lg font-bold font-mono text-blue-400">${confluence.tp2.toLocaleString()} / ${confluence.tp3.toLocaleString()}</div>
          <p className="text-[11px] font-mono text-slate-500">Calculated RR: <span className="font-bold text-blue-400">{confluence.rr} : 1</span></p>
        </div>
      </div>

      {/* Reasons & Confluence Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#080808] border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono flex items-center gap-2 border-b border-slate-800 pb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Technical Confluence Reasons
          </h3>

          <div className="space-y-2.5 font-mono text-xs">
            {confluence.reasons.map((r, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-black/40 border border-slate-800">
                <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${r.ok ? "bg-emerald-400" : "bg-amber-400"}`} />
                <span className="text-slate-200">{r.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Money Concept OB / FVG Status */}
        <div className="bg-[#080808] border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono flex items-center gap-2 border-b border-slate-800 pb-3">
            <Layers className="w-4 h-4 text-blue-400" /> Institutional SMC Zones
          </h3>

          <div className="space-y-3 font-mono text-xs">
            {confluence.nearestOB ? (
              <div className="p-3 bg-black/40 rounded-lg border border-slate-800 space-y-1">
                <div className="text-blue-400 font-bold uppercase tracking-wider text-[11px]">Nearest Order Block (OB)</div>
                <div className="flex justify-between text-slate-400">
                  <span>Direction:</span>
                  <span className="text-emerald-400 font-bold">{confluence.nearestOB.direction}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Price Range:</span>
                  <span className="font-bold text-white">${confluence.nearestOB.bot} - ${confluence.nearestOB.top}</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-black/40 rounded-lg border border-slate-800 text-slate-500">
                No unmitigated Order Blocks near current price.
              </div>
            )}

            {confluence.nearestFVG ? (
              <div className="p-3 bg-black/40 rounded-lg border border-slate-800 space-y-1">
                <div className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">Fair Value Gap (FVG)</div>
                <div className="flex justify-between text-slate-400">
                  <span>Gap Range:</span>
                  <span className="font-bold text-white">${confluence.nearestFVG.bot} - ${confluence.nearestFVG.top}</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

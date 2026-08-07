import React from "react";
import { Lock, Unlock, CheckCircle2, AlertTriangle, RefreshCw, Zap, TrendingUp, TrendingDown, ShieldAlert, Target } from "lucide-react";
import { LockedTradeSetup } from "../utils/tradeSetupManager";

interface LockedSetupBannerProps {
  setup: LockedTradeSetup;
  currentPrice: number;
  onResetSetup: () => void;
  onExecuteTrade?: () => void;
  decimals?: number;
}

export function LockedSetupBanner({
  setup,
  currentPrice,
  onResetSetup,
  onExecuteTrade,
  decimals = 2,
}: LockedSetupBannerProps) {
  const isBuy = setup.direction === "BUY";
  const isActive = setup.status === "ACTIVE_LOCKED";
  const isTpHit = setup.status === "TP_HIT";
  const isSlHit = setup.status === "SL_HIT";

  // Calculate live distance to SL & TP
  const distToTp = Math.abs(currentPrice - setup.takeProfit1);
  const distToSl = Math.abs(currentPrice - setup.stopLoss);

  // Live unrealized PnL from LOCKED entry price
  const pnlUSD = setup.unrealizedPnlUSD || 0;
  const pnlPips = setup.unrealizedPips || 0;
  const isProfit = pnlUSD >= 0;

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 transition-all duration-300 font-mono ${
      isTpHit
        ? "bg-emerald-950/40 border-emerald-500/80 shadow-[0_0_25px_rgba(16,185,129,0.3)]"
        : isSlHit
        ? "bg-rose-950/40 border-rose-500/80 shadow-[0_0_25px_rgba(244,63,94,0.3)]"
        : "bg-[#0b101d]/90 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
    }`}>
      {/* Top Bar Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          {isActive ? (
            <span className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-full text-xs font-bold animate-pulse">
              <Lock className="w-3.5 h-3.5" /> 🔒 SETUP LOCKED AT ENTRY
            </span>
          ) : isTpHit ? (
            <span className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 px-2.5 py-1 rounded-full text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> ✅ TAKE PROFIT 1 HIT
            </span>
          ) : (
            <span className="flex items-center gap-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/50 px-2.5 py-1 rounded-full text-xs font-bold">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> ❌ STOP LOSS HIT / FAILED
            </span>
          )}

          <span className="text-slate-400 text-xs">
            Module: <strong className="text-slate-200">{setup.moduleName}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs">Locked @ {setup.timeLocked}</span>
          <button
            onClick={onResetSetup}
            className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-amber-500/30 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            title="Reset and lock a fresh setup at current live price"
          >
            <RefreshCw className="w-3 h-3" /> Reset & Lock New AI Setup
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4">
        {/* Signal Direction */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 text-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-0.5">Direction</span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-black text-sm ${
            isBuy ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
          }`}>
            {isBuy ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {setup.direction}
          </span>
        </div>

        {/* Locked Entry Price */}
        <div className="bg-slate-900/80 border border-amber-500/40 rounded-xl p-2.5 text-center relative overflow-hidden">
          <span className="text-[10px] uppercase tracking-wider text-amber-400 block mb-0.5 flex items-center justify-center gap-1">
            <Lock className="w-2.5 h-2.5" /> Locked Entry
          </span>
          <span className="text-amber-300 font-bold text-sm block">${setup.entryPrice.toFixed(decimals)}</span>
          <span className="text-[9px] text-slate-400 block mt-0.5">Fixed Price</span>
        </div>

        {/* Stop Loss */}
        <div className="bg-slate-900/80 border border-rose-500/30 rounded-xl p-2.5 text-center">
          <span className="text-[10px] uppercase tracking-wider text-rose-400 block mb-0.5">Stop Loss</span>
          <span className="text-rose-300 font-bold text-sm block">${setup.stopLoss.toFixed(decimals)}</span>
          <span className="text-[9px] text-slate-500 block mt-0.5">Risk Limit</span>
        </div>

        {/* Take Profit 1 */}
        <div className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-2.5 text-center">
          <span className="text-[10px] uppercase tracking-wider text-emerald-400 block mb-0.5">TP1 Target</span>
          <span className="text-emerald-300 font-bold text-sm block">${setup.takeProfit1.toFixed(decimals)}</span>
          <span className="text-[9px] text-slate-500 block mt-0.5">Main Target</span>
        </div>

        {/* Live Market Price vs Entry */}
        <div className="bg-slate-900/80 border border-blue-500/30 rounded-xl p-2.5 text-center">
          <span className="text-[10px] uppercase tracking-wider text-blue-400 block mb-0.5">Live Price</span>
          <span className="text-blue-300 font-bold text-sm block">${currentPrice.toFixed(decimals)}</span>
          <span className="text-[9px] text-slate-400 block mt-0.5">
            {currentPrice > setup.entryPrice ? `+$${(currentPrice - setup.entryPrice).toFixed(decimals)}` : `-$${(setup.entryPrice - currentPrice).toFixed(decimals)}`}
          </span>
        </div>

        {/* Realized/Unrealized PnL */}
        <div className={`bg-slate-900/80 border rounded-xl p-2.5 text-center ${
          isProfit ? "border-emerald-500/40 text-emerald-400" : "border-rose-500/40 text-rose-400"
        }`}>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-0.5">
            {isActive ? "Live PnL" : "Final PnL"}
          </span>
          <span className="font-bold text-sm block">
            {isProfit ? `+${pnlUSD.toFixed(2)} USD` : `${pnlUSD.toFixed(2)} USD`}
          </span>
          <span className="text-[9px] block mt-0.5 opacity-80">
            {pnlPips >= 0 ? `+${pnlPips} pips` : `${pnlPips} pips`}
          </span>
        </div>
      </div>

      {/* Target TP2 / TP3 Bar */}
      {(setup.takeProfit2 || setup.takeProfit3) && (
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            {setup.takeProfit2 && (
              <span>TP2 (Extreme): <strong className="text-emerald-400">${setup.takeProfit2.toFixed(decimals)}</strong></span>
            )}
            {setup.takeProfit3 && (
              <span>TP3 (Moonshot): <strong className="text-emerald-300">${setup.takeProfit3.toFixed(decimals)}</strong></span>
            )}
          </div>
          <div className="text-slate-400">
            Confluence: <strong className="text-amber-300">{setup.confluenceScore}%</strong> ({setup.gatesPassed || 6}/6 Gates)
          </div>
        </div>
      )}

      {/* Result Notification Banner & Auto-Reset Button */}
      {(isTpHit || isSlHit) && (
        <div className={`mt-3 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 ${
          isTpHit ? "bg-emerald-900/50 border border-emerald-500/60 text-emerald-200" : "bg-rose-900/50 border border-rose-500/60 text-rose-200"
        }`}>
          <div className="flex items-center gap-2">
            {isTpHit ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <div>
              <div className="font-bold text-sm">
                {isTpHit
                  ? `🎯 TAKE PROFIT HIT! Result: +$${(setup.pnlResultUSD || pnlUSD).toFixed(2)} USD (${setup.pnlPips || pnlPips} Pips)`
                  : `❌ STOP LOSS HIT! Result: $${(setup.pnlResultUSD || pnlUSD).toFixed(2)} USD (${setup.pnlPips || pnlPips} Pips)`}
              </div>
              <p className="text-xs opacity-80">
                Setup completed! AI Brain is ready to lock a fresh trade setup for current market structure.
              </p>
            </div>
          </div>

          <button
            onClick={onResetSetup}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              isTpHit
                ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                : "bg-rose-500 hover:bg-rose-400 text-white shadow-[0_0_12px_rgba(244,63,94,0.4)]"
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> ✨ Lock New Fresh AI Setup
          </button>
        </div>
      )}

      {/* Execute Button */}
      {isActive && onExecuteTrade && (
        <div className="mt-3 flex items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <span className="text-slate-400 text-xs flex items-center gap-1">
            <Lock className="w-3 h-3 text-amber-400" /> Setup is active & locked. Prices will not jump or shift.
          </span>
          <button
            onClick={onExecuteTrade}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              isBuy
                ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                : "bg-rose-500 hover:bg-rose-400 text-white shadow-[0_0_12px_rgba(244,63,94,0.3)]"
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> Execute Locked {setup.direction} Setup
          </button>
        </div>
      )}
    </div>
  );
}

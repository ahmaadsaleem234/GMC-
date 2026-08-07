import React, { useState, useEffect } from "react";
import {
  X,
  Gauge,
  Calculator,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Zap,
  Check,
} from "lucide-react";
import { SUPPORTED_ASSETS } from "../useLiveData";
import { TradeLogEntry } from "../types";

interface RiskManagementCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAssetKey?: string;
  initialType?: "BUY" | "SELL";
  currentPrice?: number;
  onExecuteTrade?: (trade: Omit<TradeLogEntry, "id" | "timestamp">) => void;
}

export const RiskManagementCopilotModal: React.FC<RiskManagementCopilotModalProps> = ({
  isOpen,
  onClose,
  initialAssetKey = "XAUUSD",
  initialType = "BUY",
  currentPrice = 4348.50,
  onExecuteTrade,
}) => {
  const [assetKey, setAssetKey] = useState<string>(initialAssetKey);
  const [tradeType, setTradeType] = useState<"BUY" | "SELL">(initialType);
  const [accountBalance, setAccountBalance] = useState<number>(10000);
  const [riskPct, setRiskPct] = useState<number>(1.0);
  const [stopLossDistancePips, setStopLossDistancePips] = useState<number>(40);
  const [takeProfitMultiple, setTakeProfitMultiple] = useState<number>(3.0);
  const [executedSuccessMsg, setExecutedSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setAssetKey(initialAssetKey);
    setTradeType(initialType);
  }, [initialAssetKey, initialType, isOpen]);

  if (!isOpen) return null;

  const currentAsset = SUPPORTED_ASSETS.find((a) => a.key === assetKey) || SUPPORTED_ASSETS[0];
  const price = currentPrice || currentAsset.basePrice;

  // Calculation Logic
  const riskUSD = (accountBalance * riskPct) / 100;
  // Standard Forex/Gold Pip value calculations
  const pipValuePerLot = assetKey.includes("XAU") ? 10 : assetKey.includes("BTC") ? 1 : 10;
  const calculatedLotSize = Math.max(0.01, parseFloat((riskUSD / (stopLossDistancePips * pipValuePerLot)).toFixed(2)));

  const slPriceOffset = (stopLossDistancePips * (assetKey.includes("XAU") ? 0.1 : 0.0001));
  const calculatedSL = tradeType === "BUY" ? price - slPriceOffset : price + slPriceOffset;

  const tp1PriceOffset = slPriceOffset * 1.5;
  const tp2PriceOffset = slPriceOffset * takeProfitMultiple;

  const calculatedTP1 = tradeType === "BUY" ? price + tp1PriceOffset : price - tp1PriceOffset;
  const calculatedTP2 = tradeType === "BUY" ? price + tp2PriceOffset : price - tp2PriceOffset;

  const projectedProfitTP1 = riskUSD * 1.5;
  const projectedProfitTP2 = riskUSD * takeProfitMultiple;
  const riskRewardRatio = `1:${takeProfitMultiple.toFixed(1)}`;

  const handleConfirmTrade = () => {
    const newTrade = {
      assetKey,
      type: tradeType,
      entryPrice: parseFloat(price.toFixed(currentAsset.decimals)),
      currentPrice: parseFloat(price.toFixed(currentAsset.decimals)),
      stopLoss: parseFloat(calculatedSL.toFixed(currentAsset.decimals)),
      takeProfit: parseFloat(calculatedTP2.toFixed(currentAsset.decimals)),
      lotSize: calculatedLotSize,
      status: "IN_PROGRESS" as const,
      pnlUSD: 0,
      pnlPips: 0,
      signalSource: "AI Risk Copilot Engine",
    };

    if (onExecuteTrade) {
      onExecuteTrade(newTrade);
    }

    setExecutedSuccessMsg(`TRADE LOGGED: ${tradeType} ${calculatedLotSize} LOTS ON ${assetKey}`);
    setTimeout(() => {
      setExecutedSuccessMsg(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#080B14] border border-amber-500/40 rounded-2xl p-6 shadow-[0_25px_60px_rgba(0,0,0,0.9)] text-slate-200 font-mono space-y-5 overflow-hidden">
        {/* Top Glow Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-emerald-400 to-blue-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center text-amber-400">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                BATMAN COPILOT
              </span>
              <span className="text-xs text-slate-400">VOLATILITY RISK ENGINE</span>
            </div>
            <h2 className="text-lg font-black text-white tracking-tight">
              FLOATING RISK MANAGEMENT COPILOT
            </h2>
          </div>
        </div>

        {executedSuccessMsg ? (
          <div className="p-6 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-center space-y-3">
            <div className="w-12 h-12 mx-auto bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-emerald-300">{executedSuccessMsg}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Asset & Direction Switcher */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                  TARGET ASSET
                </label>
                <select
                  value={assetKey}
                  onChange={(e) => setAssetKey(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-white font-bold py-2 px-3 rounded-xl focus:border-amber-500 focus:outline-none text-xs"
                >
                  {SUPPORTED_ASSETS.map((a) => (
                    <option key={a.key} value={a.key} className="bg-slate-900">
                      {a.short} — ${a.basePrice}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                  ORDER TYPE
                </label>
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
                  <button
                    onClick={() => setTradeType("BUY")}
                    className={`py-1 text-xs font-black rounded-lg transition-all ${
                      tradeType === "BUY"
                        ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    BUY
                  </button>
                  <button
                    onClick={() => setTradeType("SELL")}
                    className={`py-1 text-xs font-black rounded-lg transition-all ${
                      tradeType === "SELL"
                        ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    SELL
                  </button>
                </div>
              </div>
            </div>

            {/* Inputs: Balance & Risk % */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                  ACCOUNT BALANCE ($)
                </label>
                <input
                  type="number"
                  value={accountBalance}
                  onChange={(e) => setAccountBalance(Number(e.target.value))}
                  className="w-full bg-black/60 border border-slate-800 text-amber-300 font-bold py-2 px-3 rounded-xl text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                  MAX CAPITAL RISK (%)
                </label>
                <div className="flex items-center gap-1">
                  {[0.5, 1.0, 2.0, 3.0].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRiskPct(r)}
                      className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
                        riskPct === r
                          ? "bg-amber-500 text-black border-amber-400"
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                      }`}
                    >
                      {r}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Stop Loss Distance & R:R Slider */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                  STOP LOSS (PIPS)
                </label>
                <input
                  type="number"
                  value={stopLossDistancePips}
                  onChange={(e) => setStopLossDistancePips(Number(e.target.value))}
                  className="w-full bg-black/60 border border-slate-800 text-rose-400 font-bold py-2 px-3 rounded-xl text-xs focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                  TARGET R:R MULTIPLE
                </label>
                <select
                  value={takeProfitMultiple}
                  onChange={(e) => setTakeProfitMultiple(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 text-emerald-400 font-bold py-2 px-3 rounded-xl text-xs focus:border-amber-500 focus:outline-none"
                >
                  <option value={1.5}>1:1.5 Standard</option>
                  <option value={2.0}>1:2.0 High Probability</option>
                  <option value={3.0}>1:3.0 Institutional Anchor</option>
                  <option value={5.0}>1:5.0 Whale Run</option>
                </select>
              </div>
            </div>

            {/* AI Calculation Results Box */}
            <div className="bg-[#05070E] border border-amber-500/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase">
                  AUTOMATED LOT & LEVELS SPECIFICATION
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  R:R RATIO: <strong className="text-white">{riskRewardRatio}</strong>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block uppercase">RECOMMENDED LOT</span>
                  <span className="text-lg font-black text-emerald-400">{calculatedLotSize} LOTS</span>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block uppercase">MAX CAPITAL AT RISK</span>
                  <span className="text-lg font-black text-rose-400">${riskUSD.toFixed(2)}</span>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block uppercase">CALCULATED STOP LOSS</span>
                  <span className="text-xs font-bold text-rose-300">${calculatedSL.toFixed(currentAsset.decimals)}</span>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block uppercase">PROJECTED TP2 PROFIT</span>
                  <span className="text-xs font-bold text-emerald-300">+${projectedProfitTP2.toFixed(2)} (${calculatedTP2.toFixed(currentAsset.decimals)})</span>
                </div>
              </div>
            </div>

            {/* Execute Button */}
            <button
              onClick={handleConfirmTrade}
              className={`w-full py-3.5 rounded-xl text-black font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 ${
                tradeType === "BUY"
                  ? "bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/25"
                  : "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/25"
              }`}
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>CONFIRM & LOG {tradeType} POSITION ({calculatedLotSize} LOTS)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

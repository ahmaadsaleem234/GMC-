import React, { useState } from "react";
import { Sliders, ShieldCheck, DollarSign, Calculator, AlertTriangle } from "lucide-react";

interface RiskCalculatorProps {
  currentPrice: number;
}

export const RiskCalculator: React.FC<RiskCalculatorProps> = ({ currentPrice }) => {
  const [balance, setBalance] = useState<number>(10000);
  const [riskPct, setRiskPct] = useState<number>(1.0);
  const [entryPrice, setEntryPrice] = useState<number>(currentPrice || 4348.50);
  const [stopLossPrice, setStopLossPrice] = useState<number>((currentPrice || 4348.50) * 0.99);
  const [leverage, setLeverage] = useState<number>(20);

  const riskAmountUSD = (balance * riskPct) / 100;
  const priceDistance = Math.abs(entryPrice - stopLossPrice);
  const unitsCount = priceDistance > 0 ? riskAmountUSD / priceDistance : 0;
  const forexStandardLots = priceDistance > 0 ? (riskAmountUSD / (priceDistance * 100)) : 0;
  const totalPositionSizeUSD = unitsCount * entryPrice;
  const requiredMarginUSD = totalPositionSizeUSD / leverage;

  return (
    <div id="gmc-risk-calculator" className="space-y-6 pb-12 font-sans">
      <div className="bg-[#0A0A0A] border border-slate-800 rounded-xl p-5 shadow-xl">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-blue-400" /> INSTITUTIONAL POSITION SIZE & RISK CALCULATOR
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-mono">
          Calculate precise lot sizes and position margins before entering trades to enforce risk discipline.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono">
        {/* Input Parameters */}
        <div className="bg-[#080808] border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-800 pb-3">
            Account & Trade Parameters
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-500 mb-1 text-[11px]">Account Balance ($)</label>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
                className="w-full bg-black/40 border border-slate-800 text-white rounded p-2.5 font-bold focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-500 mb-1 text-[11px]">Risk Percentage (%)</label>
              <input
                type="number"
                step="0.25"
                value={riskPct}
                onChange={(e) => setRiskPct(parseFloat(e.target.value) || 0)}
                className="w-full bg-black/40 border border-slate-800 text-white rounded p-2.5 font-bold focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 mb-1 text-[11px]">Entry Price ($)</label>
                <input
                  type="number"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/40 border border-slate-800 text-white rounded p-2.5 font-bold focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1 text-[11px]">Stop Loss ($)</label>
                <input
                  type="number"
                  value={stopLossPrice}
                  onChange={(e) => setStopLossPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black/40 border border-slate-800 text-white rounded p-2.5 font-bold focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 mb-1 text-[11px]">Leverage (x)</label>
              <input
                type="number"
                value={leverage}
                onChange={(e) => setLeverage(parseInt(e.target.value) || 1)}
                className="w-full bg-black/40 border border-slate-800 text-white rounded p-2.5 font-bold focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Calculated Results */}
        <div className="bg-[#080808] border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-blue-400 border-b border-slate-800 pb-3 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-blue-400" /> Recommended Position Size
          </h2>

          <div className="space-y-4 text-xs">
            <div className="p-4 bg-black/40 rounded-lg border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px] uppercase tracking-wider block font-bold">MAX DOLLAR RISK ($)</span>
              <div className="text-2xl font-bold text-red-500">${riskAmountUSD.toFixed(2)}</div>
              <p className="text-[10px] text-slate-500">{riskPct}% of total ${balance.toLocaleString()} account</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-black/40 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase tracking-wider block font-bold">Crypto Units</span>
                <div className="text-lg font-bold text-blue-400">{unitsCount.toFixed(3)}</div>
              </div>

              <div className="p-3 bg-black/40 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase tracking-wider block font-bold">Forex Standard Lot</span>
                <div className="text-lg font-bold text-amber-400">{forexStandardLots.toFixed(2)} Lots</div>
              </div>
            </div>

            <div className="p-3 bg-black/40 rounded-lg border border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Total Position Value:</span>
                <span className="text-white font-bold">${totalPositionSizeUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Required Margin ({leverage}x):</span>
                <span className="text-emerald-400 font-bold">${requiredMarginUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

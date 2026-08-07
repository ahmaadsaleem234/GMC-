import React, { useState, useEffect } from "react";
import { Bell, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { PriceAlert, LivePrice } from "../types";
import { SUPPORTED_ASSETS } from "../useLiveData";

interface PriceAlertsProps {
  prices: Record<string, LivePrice>;
  activeAssetKey: string;
}

const ALERTS_STORAGE_KEY = "gmc_user_price_alerts";

export const PriceAlerts: React.FC<PriceAlertsProps> = ({ prices, activeAssetKey }) => {
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    try {
      const raw = localStorage.getItem(ALERTS_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [
      {
        id: "alert-1",
        assetKey: "BTCUSDT",
        assetLabel: "Bitcoin / USDT",
        direction: "above",
        targetPrice: 105000,
        active: true,
        triggeredAt: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: "alert-2",
        assetKey: "XAUUSD",
        assetLabel: "Gold / USD",
        direction: "below",
        targetPrice: 3300,
        active: true,
        triggeredAt: null,
        createdAt: new Date().toISOString(),
      },
    ];
  });

  const [assetKey, setAssetKey] = useState(activeAssetKey);
  const [direction, setDirection] = useState<"above" | "below">("above");
  const [targetPrice, setTargetPrice] = useState<number>(3350);

  useEffect(() => {
    try {
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
    } catch (e) {}
  }, [alerts]);

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const assetObj = SUPPORTED_ASSETS.find((a) => a.key === assetKey) || SUPPORTED_ASSETS[0];
    const newAlert: PriceAlert = {
      id: `alert-${Date.now()}`,
      assetKey,
      assetLabel: assetObj.label,
      direction,
      targetPrice,
      active: true,
      triggeredAt: null,
      createdAt: new Date().toISOString(),
    };
    setAlerts([newAlert, ...alerts]);
  };

  const handleDelete = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  return (
    <div id="gmc-price-alerts" className="space-y-6 pb-12 font-sans">
      <div className="bg-[#0A0A0A] border border-slate-800 rounded-xl p-5 shadow-xl">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-400" /> CUSTOM REAL-TIME PRICE ALERTS
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-mono">
          Set instant price target triggers for Gold, Bitcoin, Ethereum, Solana, and Forex pairs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono">
        {/* Create Alert Form */}
        <form onSubmit={handleAddAlert} className="bg-[#080808] border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-800 pb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-400" /> Create New Price Alert
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-500 mb-1 text-[11px]">Target Asset</label>
              <select
                value={assetKey}
                onChange={(e) => setAssetKey(e.target.value)}
                id="alert-asset-select"
                className="w-full bg-black/40 border border-slate-800 text-white rounded p-2.5 font-bold focus:border-blue-500 focus:outline-none"
              >
                {SUPPORTED_ASSETS.map((a) => (
                  <option key={a.key} value={a.key}>{a.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 mb-1 text-[11px]">Condition</label>
                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value as any)}
                  id="alert-condition-select"
                  className="w-full bg-black/40 border border-slate-800 text-white rounded p-2.5 font-bold focus:border-blue-500 focus:outline-none"
                >
                  <option value="above">Price Rises Above (&gt;)</option>
                  <option value="below">Price Drops Below (&lt;)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 text-[11px]">Trigger Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(parseFloat(e.target.value) || 0)}
                  id="alert-price-input"
                  className="w-full bg-black/40 border border-slate-800 text-white rounded p-2.5 font-bold focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              id="add-alert-submit-btn"
              className="w-full py-2.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/20 transition-all border border-blue-500/40"
            >
              Add Price Trigger
            </button>
          </div>
        </form>

        {/* Alerts List */}
        <div className="bg-[#080808] border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-800 pb-3">
            Active Watchlist Alerts ({alerts.length})
          </h2>

          <div className="space-y-3 text-xs">
            {alerts.map((a) => {
              const live = prices[a.assetKey]?.price || 0;
              const isTriggered = a.direction === "above" ? live >= a.targetPrice : live <= a.targetPrice;

              return (
                <div key={a.id} className="p-3 bg-black/40 rounded-lg border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-100 flex items-center gap-2">
                      {a.assetLabel}
                      <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 font-mono">
                        {a.direction} ${a.targetPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Current: ${live.toLocaleString()} | {isTriggered ? <span className="text-emerald-400 font-bold">TRIGGER CONDITION MET</span> : "Monitoring..."}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-1.5 rounded bg-slate-800/60 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all border border-slate-700/50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { X, ShieldCheck, Activity, Radio, Cpu, CheckCircle2, Zap, Key, RefreshCw, ExternalLink, Globe } from "lucide-react";

interface InstitutionalMarketDataHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  latencyMs: number;
  isConnected: boolean;
}

export const InstitutionalMarketDataHubModal: React.FC<InstitutionalMarketDataHubModalProps> = ({
  isOpen,
  onClose,
  latencyMs,
  isConnected,
}) => {
  const [twelveDataKey, setTwelveDataKey] = useState<string>(
    () => localStorage.getItem("gmc_twelvedata_api_key") || (import.meta as any).env?.VITE_TWELVEDATA_API_KEY || ""
  );
  const [finnhubKey, setFinnhubKey] = useState<string>(
    () => localStorage.getItem("gmc_finnhub_api_key") || (import.meta as any).env?.VITE_FINNHUB_API_KEY || ""
  );
  const [savedStatus, setSavedStatus] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("gmc_twelvedata_api_key", twelveDataKey);
    localStorage.setItem("gmc_finnhub_api_key", finnhubKey);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#0D1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden font-sans text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#131821] border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                INSTITUTIONAL MARKET DATA ARCHITECTURE
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono text-[10px] font-bold">
                  ACTIVE 100%
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Multi-Provider Low-Latency Stream (Gold, Forex, Indices & Crypto)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto no-scrollbar font-mono">
          {/* Realtime Stream Metrics Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-[#131821] border border-white/5 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Stream Connection</span>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? "bg-emerald-400 animate-pulse" : "bg-rose-500"}`} />
                <span className="text-sm font-extrabold text-white">
                  {isConnected ? "WEBSOCKET LIVE" : "REST FALLBACK"}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-[#131821] border border-white/5 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Tick Latency</span>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-extrabold text-amber-300">
                  {latencyMs}ms <span className="text-[10px] font-normal text-slate-400">(Ultra Fast)</span>
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-[#131821] border border-white/5 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Data Quality</span>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-extrabold text-emerald-300">Level-1 Institutional</span>
              </div>
            </div>
          </div>

          {/* Active Data Feeds Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              Active Feed Architectures (Zero-Config Ready)
            </h4>

            <div className="space-y-2">
              {/* Gold & Silver */}
              <div className="p-4 bg-[#131821]/80 border border-amber-500/30 rounded-xl flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black">
                      GOLD (XAU/USD) & SILVER (XAG)
                    </span>
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 100% NON-BINANCE / NON-BYBIT DEDICATED SPOT FX
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">
                    London Bullion & COMEX Spot benchmark rates powered by TwelveData, Finnhub (OANDA:XAU_USD), and MetalPrice API. Zero crypto-spread gap.
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold whitespace-nowrap">
                  INSTITUTIONAL SPOT ⚡
                </span>
              </div>

              {/* Crypto */}
              <div className="p-4 bg-[#131821]/80 border border-sky-500/20 rounded-xl flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-black">
                      CRYPTO (BTC, ETH, SOL, etc.)
                    </span>
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Multi-Exchange Aggregated
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Binance + Bybit WebSocket stream. Real-time 24h ticker, high/low spread, live order book liquidity depth.
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold whitespace-nowrap">
                  ACTIVE ⚡
                </span>
              </div>

              {/* Forex & Indices */}
              <div className="p-4 bg-[#131821]/80 border border-purple-500/20 rounded-xl flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-black">
                      FOREX (EUR/USD, US30, NAS100)
                    </span>
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Institutional Level Ticks
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">
                    High-precision intermarket currency rates synchronized with global market trading sessions.
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold whitespace-nowrap">
                  ACTIVE ⚡
                </span>
              </div>
            </div>
          </div>

          {/* Optional Key Configuration */}
          <form onSubmit={handleSaveKeys} className="p-4 bg-[#131821] border border-white/10 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                Optional Institutional API Keys (Free Tier Supported)
              </h4>
              <span className="text-[10px] text-amber-400/90 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                OPTIONAL
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-sans">
              The platform already runs with built-in zero-config live feeds. If you have your own TwelveData or Finnhub key for dedicated custom endpoints, enter them below:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">TwelveData API Key</label>
                <input
                  type="text"
                  value={twelveDataKey}
                  onChange={(e) => setTwelveDataKey(e.target.value)}
                  placeholder="e.g. 847291a0b3..."
                  className="w-full bg-[#0A0D12] border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Finnhub API Key</label>
                <input
                  type="text"
                  value={finnhubKey}
                  onChange={(e) => setFinnhubKey(e.target.value)}
                  placeholder="e.g. c78a991..."
                  className="w-full bg-[#0A0D12] border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400/50"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Save & Update Feed Configurations
              </button>

              {savedStatus && (
                <span className="text-xs font-bold text-emerald-400 animate-fadeIn">
                  ✓ Configuration Saved!
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#131821] border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 font-mono">
            <Globe className="w-3.5 h-3.5 text-sky-400" /> GMC AI Data Pipeline v4.2
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};

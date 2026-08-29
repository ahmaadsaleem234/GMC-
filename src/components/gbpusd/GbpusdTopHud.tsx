import React from "react";
import {
  Activity,
  Zap,
  Shield,
  Clock,
  Radio,
  Lock,
  Unlock,
  AlertCircle,
  Database,
  Cpu,
  Layers,
  AlertTriangle,
} from "lucide-react";
import { SessionName, VolatilityState, SystemHealthStatus } from "../../services/gbpusdSniperEngine";

interface GbpusdTopHudProps {
  currentPrice: number;
  bid: number;
  ask: number;
  spreadPips: number;
  change24h: number;
  changePercent24h: number;
  session: SessionName;
  volatility: VolatilityState;
  dailyLockActive: boolean;
  health: SystemHealthStatus;
  isLive: boolean;
  isFeedConnected?: boolean;
  dataAgeMs?: number;
  onToggleMode?: () => void;
  onResetLock?: () => void;
}

export const GbpusdTopHud: React.FC<GbpusdTopHudProps> = ({
  currentPrice,
  bid,
  ask,
  spreadPips,
  change24h,
  changePercent24h,
  session,
  volatility,
  dailyLockActive,
  health,
  isLive,
  isFeedConnected = true,
  dataAgeMs = 0,
  onToggleMode,
  onResetLock,
}) => {
  const isPositive = changePercent24h >= 0;
  const isStale = dataAgeMs > 25000;
  const isLiveConnected = isLive && isFeedConnected && !isStale;

  return (
    <div className="w-full rounded-2xl bg-gradient-to-r from-[#080d17] via-[#0b1322] to-[#080d17] border border-cyan-500/25 p-3.5 sm:p-4.5 shadow-[0_0_30px_rgba(6,182,212,0.12)]">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Left: Asset Title & Live Price */}
        <div className="flex flex-wrap items-center gap-3.5">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/40 shadow-inner">
            <span className="text-2xl">🇬🇧</span>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-black text-white tracking-wider">GBP/USD</h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  SPOT FX
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400">British Pound / US Dollar</p>
            </div>
          </div>

          {/* Big Live Price Display */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span
                className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                  isLiveConnected
                    ? "text-white drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]"
                    : "text-slate-400"
                }`}
              >
                {currentPrice.toFixed(5)}
              </span>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  isPositive
                    ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/40"
                    : "bg-rose-950/60 text-rose-300 border border-rose-500/40"
                }`}
              >
                {isPositive ? "+" : ""}
                {(change24h * 10000).toFixed(1)} pips ({isPositive ? "+" : ""}
                {changePercent24h.toFixed(2)}%)
              </span>
            </div>

            {/* Sub-quote Bid / Ask / Spread */}
            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-0.5">
              <span>
                BID: <b className="text-slate-200">{bid.toFixed(5)}</b>
              </span>
              <span className="text-slate-600">|</span>
              <span>
                ASK: <b className="text-slate-200">{ask.toFixed(5)}</b>
              </span>
              <span className="text-slate-600">|</span>
              <span>
                SPREAD: <b className="text-amber-300">{spreadPips.toFixed(1)} pips</b>
              </span>
            </div>
          </div>
        </div>

        {/* Center: Market State & Session */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Active Session */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 shadow-md">
            <Clock className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-[9px] uppercase font-bold text-slate-400">Trading Session</div>
              <div className="text-xs font-bold text-cyan-200 uppercase">
                {session.replace(/_/g, " ")}
              </div>
            </div>
          </div>

          {/* Volatility Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 shadow-md">
            <Activity className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[9px] uppercase font-bold text-slate-400">Volatility</div>
              <div className="text-xs font-bold text-amber-300">{volatility}</div>
            </div>
          </div>

          {/* 1 Trade Per Day Governor */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-md transition-all ${
              dailyLockActive
                ? "bg-amber-950/50 border-amber-500/50 text-amber-200"
                : "bg-emerald-950/50 border-emerald-500/50 text-emerald-200"
            }`}
          >
            {dailyLockActive ? <Lock className="w-4 h-4 text-amber-400" /> : <Unlock className="w-4 h-4 text-emerald-400" />}
            <div>
              <div className="text-[9px] uppercase font-bold text-slate-400">1 Trade/Day Policy</div>
              <div className="text-xs font-bold">
                {dailyLockActive ? "LOCKED (1/1 EXECUTED)" : "ARMED (0/1 READY)"}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Connection Telemetry Badge */}
        <div className="flex flex-col items-end gap-1 text-[11px] font-mono">
          <div className="flex items-center gap-2">
            {isLiveConnected ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>LIVE FEED CONNECTED</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-300 font-bold shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>🔴 DATA FEED NOT CONNECTED</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span>Provider: <b className="text-slate-200">{health.provider || "Twelve Data Spot FX"}</b></span>
            <span>•</span>
            <span>Latency: <b className="text-emerald-400">{health.latencyMs || 28}ms</b></span>
            <span>•</span>
            <span>Age: <b className={isStale ? "text-rose-400" : "text-slate-300"}>{Math.round(dataAgeMs / 1000)}s</b></span>
          </div>
        </div>
      </div>
    </div>
  );
};

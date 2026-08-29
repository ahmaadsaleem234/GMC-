import React, { useState, useEffect } from "react";
import {
  Sliders,
  Shield,
  Lock,
  Unlock,
  Send,
  Radio,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  SlidersHorizontal,
  Activity,
} from "lucide-react";
import { GbpusdDiagnosticsPanel } from "./GbpusdDiagnosticsPanel";

interface GbpusdAdminPanelProps {
  dailyLockActive: boolean;
  onResetDailyLock: () => void;
  onTestTelegramPing: () => Promise<void>;
  isLive: boolean;
  onToggleLive: () => void;
}

export const GbpusdAdminPanel: React.FC<GbpusdAdminPanelProps> = ({
  dailyLockActive,
  onResetDailyLock,
  onTestTelegramPing,
  isLive,
  onToggleLive,
}) => {
  const [minScoreThreshold, setMinScoreThreshold] = useState<number>(90);
  const [maxSpreadLimit, setMaxSpreadLimit] = useState<number>(1.8);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [savingConfig, setSavingConfig] = useState<boolean>(false);

  // Sync initial config from server
  useEffect(() => {
    fetch("/api/gbpusd/config")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.minAplusScoreThreshold) {
          setMinScoreThreshold(data.minAplusScoreThreshold);
        }
        if (data && data.maxSpreadLimit) {
          setMaxSpreadLimit(data.maxSpreadLimit);
        }
      })
      .catch(() => null);
  }, []);

  const handleUpdateConfig = async (threshold: number, spread: number) => {
    setSavingConfig(true);
    try {
      await fetch("/api/gbpusd/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          minAplusScoreThreshold: threshold,
          maxSpreadLimit: spread,
        }),
      });
    } catch (e) {
      console.warn("Failed to persist config:", e);
    } finally {
      setSavingConfig(false);
    }
  };

  const handlePing = async () => {
    setIsPinging(true);
    setPingResult(null);
    try {
      await onTestTelegramPing();
      setPingResult("✅ Telegram Ping Delivered Successfully to GMC Channel!");
    } catch (e: any) {
      setPingResult("❌ Telegram Ping Failed: " + (e.message || "Unknown error"));
    } finally {
      setIsPinging(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Master Gatekeeper Calibration */}
      <div className="w-full rounded-2xl bg-[#080d17]/95 border border-slate-800 p-5 shadow-xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-black text-white tracking-wider">
                GBPUSD SYSTEM ADMIN & QUANTITATIVE CALIBRATION
              </h3>
              <p className="text-[10px] text-slate-400">Master Gatekeeper Tuning & Signal Lock Controls</p>
            </div>
          </div>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/40">
            OPERATOR ACCESS
          </span>
        </div>

        {/* Control Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          {/* 1. Daily 1-Trade Lock Management */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-slate-300 font-sans font-bold">
                {dailyLockActive ? <Lock className="w-4 h-4 text-amber-400" /> : <Unlock className="w-4 h-4 text-emerald-400" />}
                <span>Daily Signal Lock</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-sans">
                Governor Status:{" "}
                <b className={dailyLockActive ? "text-amber-300" : "text-emerald-300"}>
                  {dailyLockActive ? "1/1 ACTIVE (LOCKED)" : "0/1 READY (ARMED)"}
                </b>
              </p>
            </div>

            <button
              onClick={onResetDailyLock}
              className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>RESET DAILY SIGNAL LOCK</span>
            </button>
          </div>

          {/* 2. A+ Score Threshold & Tiers */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between text-slate-300 font-sans font-bold">
                <span>Minimum A+ Score Gate</span>
                <span className="text-emerald-400 font-mono font-black">{minScoreThreshold}/100</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 space-y-0.5 font-mono">
                <div>• 90–100: <b className="text-emerald-400">A+ SNIPER (TRADE)</b></div>
                <div>• 85–89: <b className="text-amber-400">WATCH (NO TRADE)</b></div>
                <div>• 75–84: <b className="text-cyan-400">WATCHLIST (NO TRADE)</b></div>
                <div>• &lt;75: <b className="text-rose-400">REJECT</b></div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="range"
                min={85}
                max={95}
                value={minScoreThreshold}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMinScoreThreshold(val);
                  handleUpdateConfig(val, maxSpreadLimit);
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* 3. Telegram Connectivity Test */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-slate-300 font-sans font-bold">
                <Send className="w-4 h-4 text-cyan-400" />
                <span>Telegram Broadcast Channel</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-sans">
                Verify real-time bot communication and subscriber broadcast pipeline.
              </p>
            </div>

            <button
              onClick={handlePing}
              disabled={isPinging}
              className="w-full py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isPinging ? <Zap className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>{isPinging ? "TESTING PING..." : "DISPATCH TEST PING"}</span>
            </button>
          </div>
        </div>

        {pingResult && (
          <div className="p-2.5 rounded-xl bg-slate-950 border border-cyan-500/30 text-xs font-mono text-cyan-300">
            {pingResult}
          </div>
        )}
      </div>

      {/* Diagnostics Subsystem Embedded */}
      <GbpusdDiagnosticsPanel />
    </div>
  );
};

import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  AlertTriangle,
  Zap,
  Sliders,
  DollarSign,
  Percent,
  RefreshCw,
  PowerOff,
  Flame,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  HardSafetyConfig,
  HardSafetyAudit,
  getHardSafetyConfig,
  saveHardSafetyConfig,
} from "../../services/khatarnakBrainEngine";

interface KhatarnakHardSafetyTabProps {
  safetyAudit: HardSafetyAudit;
  onConfigChange: (newConfig: HardSafetyConfig) => void;
  accountBalance: number;
  dailyLossUSD: number;
  consecutiveLosses: number;
}

export const KhatarnakHardSafetyTab: React.FC<KhatarnakHardSafetyTabProps> = ({
  safetyAudit,
  onConfigChange,
  accountBalance,
  dailyLossUSD,
  consecutiveLosses,
}) => {
  const [config, setConfig] = useState<HardSafetyConfig>(getHardSafetyConfig());
  const [savedNotice, setSavedNotice] = useState(false);

  const handleUpdate = (patch: Partial<HardSafetyConfig>) => {
    const updated = saveHardSafetyConfig(patch);
    setConfig(updated);
    onConfigChange(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleToggleKillSwitch = () => {
    handleUpdate({ masterKillSwitch: !config.masterKillSwitch });
  };

  return (
    <div className="space-y-6" id="kj-hard-safety-tab">
      {/* Top Banner: Hard Safety Philosophy */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                IMMUTABLE RISK GUARDRAILS
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                ZERO AI OVERRIDE AUTHORITY
              </span>
            </div>
            <h2 className="text-xl font-black text-white">
              Hard Safety Layer & Circuit Breaker Engine
            </h2>
            <p className="text-xs text-zinc-400 max-w-2xl">
              AI brain operates with deep pattern calculation intelligence, but{" "}
              <strong className="text-rose-300">has zero authority over risk controls</strong>. Risk
              limits, stop loss caps, daily drawdown circuit breakers, and direction locks are
              hard-enforced in code.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleKillSwitch}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
                config.masterKillSwitch
                  ? "bg-rose-600 hover:bg-rose-500 text-white animate-pulse"
                  : "bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300"
              }`}
            >
              <PowerOff className="w-4 h-4" />
              <span>
                {config.masterKillSwitch ? "EMERGENCY KILL SWITCH: ENGAGED" : "Master Kill Switch"}
              </span>
            </button>
          </div>
        </div>

        {/* Live Safety Status Alert */}
        <div className="mt-4 pt-4 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div
            className={`p-3 rounded-lg border flex items-center gap-3 ${
              safetyAudit.passed
                ? "bg-emerald-950/40 border-emerald-800/50 text-emerald-300"
                : "bg-rose-950/40 border-rose-800/50 text-rose-300"
            }`}
          >
            {safetyAudit.passed ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <div>
              <div className="font-bold text-white">Overall Safety Status</div>
              <div className="text-[11px] text-zinc-300">
                {safetyAudit.passed ? "All 8 Hard Guardrails Clear" : "Guardrail Breach Detected"}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-white">
                Daily Drawdown:{" "}
                <span className="text-amber-400 font-mono">-${dailyLossUSD.toFixed(2)}</span>
              </div>
              <div className="text-[11px] text-zinc-400">
                Limit: -${config.dailyLossLimitUSD.toFixed(2)} Max
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <div className="font-bold text-white">
                Consecutive Losses:{" "}
                <span className="text-purple-300 font-mono">{consecutiveLosses}</span>
              </div>
              <div className="text-[11px] text-zinc-400">
                Max Allowed: {config.maxConsecutiveLosses} Losses
              </div>
            </div>
          </div>
        </div>

        {savedNotice && (
          <div className="mt-3 p-2 rounded-lg bg-emerald-950/80 border border-emerald-700 text-xs font-semibold text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Safety Parameters Updated & Locked!</span>
          </div>
        )}
      </div>

      {/* Grid of 8 Active Hard Guardrail Audits */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Active Immutable Guardrail Audits</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {safetyAudit.activeRules.map((rule, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-lg border text-xs flex items-center justify-between gap-3 ${
                rule.status === "PASSED"
                  ? "bg-zinc-950 border-zinc-800 text-zinc-300"
                  : rule.status === "WARNING"
                  ? "bg-amber-950/30 border-amber-800/50 text-amber-200"
                  : "bg-rose-950/40 border-rose-800/60 text-rose-200"
              }`}
            >
              <div className="space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-zinc-400" />
                  <span>{rule.rule}</span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  Current: <strong className="text-zinc-200 font-mono">{rule.currentValue}</strong> | Limit:{" "}
                  <strong className="text-zinc-200 font-mono">{rule.limitValue}</strong>
                </div>
              </div>

              <div className="shrink-0">
                {rule.status === "PASSED" ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    PASSED
                  </span>
                ) : rule.status === "WARNING" ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    WARNING
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    BLOCKED
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Parameter Configuration */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Adjust Guardrail Thresholds (Within Hard Safety Ceilings)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Max Risk % */}
          <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-300">Max Risk % Per Trade</span>
              <span className="font-mono font-bold text-amber-400">{config.maxRiskPercent}%</span>
            </div>
            <input
              type="range"
              min="0.25"
              max="2.0"
              step="0.25"
              value={config.maxRiskPercent}
              onChange={(e) => handleUpdate({ maxRiskPercent: parseFloat(e.target.value) })}
              className="w-full accent-amber-500"
            />
            <div className="text-[10px] text-zinc-400 flex justify-between">
              <span>0.25% min</span>
              <span>2.0% hard cap</span>
            </div>
          </div>

          {/* Daily Loss Limit */}
          <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-300">Daily Loss Limit (Circuit Breaker)</span>
              <span className="font-mono font-bold text-rose-400">${config.dailyLossLimitUSD}</span>
            </div>
            <input
              type="range"
              min="100"
              max="1000"
              step="50"
              value={config.dailyLossLimitUSD}
              onChange={(e) => handleUpdate({ dailyLossLimitUSD: parseFloat(e.target.value) })}
              className="w-full accent-rose-500"
            />
            <div className="text-[10px] text-zinc-400 flex justify-between">
              <span>$100</span>
              <span>$1,000 max</span>
            </div>
          </div>

          {/* Max Consecutive Losses */}
          <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-300">Max Consecutive Losses</span>
              <span className="font-mono font-bold text-purple-400">
                {config.maxConsecutiveLosses}
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="5"
              step="1"
              value={config.maxConsecutiveLosses}
              onChange={(e) => handleUpdate({ maxConsecutiveLosses: parseInt(e.target.value) })}
              className="w-full accent-purple-500"
            />
            <div className="text-[10px] text-zinc-400 flex justify-between">
              <span>2 losses</span>
              <span>5 losses max</span>
            </div>
          </div>

          {/* Max Spread Points */}
          <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-300">Max Spread Tolerance</span>
              <span className="font-mono font-bold text-cyan-400">{config.maxSpreadPoints} pts</span>
            </div>
            <input
              type="range"
              min="0.15"
              max="0.60"
              step="0.05"
              value={config.maxSpreadPoints}
              onChange={(e) => handleUpdate({ maxSpreadPoints: parseFloat(e.target.value) })}
              className="w-full accent-cyan-500"
            />
            <div className="text-[10px] text-zinc-400 flex justify-between">
              <span>0.15 pts ($15 pips)</span>
              <span>0.60 pts max</span>
            </div>
          </div>

          {/* Max Structural SL */}
          <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-300">Max SL Distance Cap</span>
              <span className="font-mono font-bold text-red-400">
                {config.maxStopLossPoints} pts
              </span>
            </div>
            <input
              type="range"
              min="5.0"
              max="20.0"
              step="1.0"
              value={config.maxStopLossPoints}
              onChange={(e) => handleUpdate({ maxStopLossPoints: parseFloat(e.target.value) })}
              className="w-full accent-red-500"
            />
            <div className="text-[10px] text-zinc-400 flex justify-between">
              <span>5.0 pts</span>
              <span>20.0 pts</span>
            </div>
          </div>

          {/* News Protection Toggle */}
          <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-zinc-300">News Event Lockout</span>
              <span
                className={`text-[11px] font-bold ${
                  config.newsProtectionActive ? "text-amber-400" : "text-zinc-500"
                }`}
              >
                {config.newsProtectionActive ? "ACTIVE" : "OFF"}
              </span>
            </div>
            <button
              onClick={() =>
                handleUpdate({ newsProtectionActive: !config.newsProtectionActive })
              }
              className={`w-full py-1.5 rounded-lg font-bold text-xs border transition-all ${
                config.newsProtectionActive
                  ? "bg-amber-950/80 border-amber-700 text-amber-300"
                  : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white"
              }`}
            >
              {config.newsProtectionActive ? "Disable News Lockout" : "Enable News Lockout (CPI/NFP)"}
            </button>
            <div className="text-[10px] text-zinc-400">
              Pauses signals 15m before & after major news
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

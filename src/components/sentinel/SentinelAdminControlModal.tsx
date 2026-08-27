import React from "react";
import { SentinelSystemConfig, DEFAULT_SENTINEL_CONFIG } from "../../services/sentinelEngine";
import { X, Sliders, Shield, Zap, RefreshCw, Save } from "lucide-react";

interface SentinelAdminControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SentinelSystemConfig;
  onSaveConfig: (newConfig: SentinelSystemConfig) => void;
}

export const SentinelAdminControlModal: React.FC<SentinelAdminControlModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [localConfig, setLocalConfig] = React.useState<SentinelSystemConfig>({ ...config });

  React.useEffect(() => {
    setLocalConfig({ ...config });
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleToggle = (key: keyof SentinelSystemConfig) => {
    setLocalConfig((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    onSaveConfig(localConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md font-mono">
      <div className="relative w-full max-w-xl bg-[#07090E] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden flex flex-col text-slate-200 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cyan-500/20 bg-[#0A0E17]">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <span className="font-extrabold text-sm text-cyan-300 uppercase tracking-wider">
              SENTINEL CORE ADMIN CONTROL CENTER
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Section: Sub-AI Brains */}
          <div>
            <div className="text-[10px] text-cyan-400 font-extrabold uppercase mb-2">
              SUB-AI BRAIN SUBSYSTEMS
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { key: "haramiAiEnabled", label: "🤖 Harami AI v3.0" },
                { key: "khatarnakJugaadEnabled", label: "💀 Khatarnak Jugaad 1M" },
                { key: "warRoomEnabled", label: "⚔️ War Room Supreme" },
                { key: "precisionHunterEnabled", label: "🎯 Precision Hunter AI" },
              ].map((item) => (
                <div
                  key={item.key}
                  onClick={() => handleToggle(item.key as any)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    localConfig[item.key as keyof SentinelSystemConfig]
                      ? "bg-[#091624] border-cyan-400 text-cyan-200"
                      : "bg-[#080B10] border-slate-800 text-slate-500"
                  }`}
                >
                  <span className="font-bold">{item.label}</span>
                  <span
                    className={`text-[9px] font-black px-2 py-0.5 rounded ${
                      localConfig[item.key as keyof SentinelSystemConfig]
                        ? "bg-cyan-500 text-slate-950"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {localConfig[item.key as keyof SentinelSystemConfig] ? "ON" : "OFF"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Sentinel Gatekeeper & Filters */}
          <div>
            <div className="text-[10px] text-cyan-400 font-extrabold uppercase mb-2">
              CORE PERCEPTION & PROTECTION ENGINES
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { key: "sentinelCoreEnabled", label: "⚡ Sentinel Core Gatekeeper" },
                { key: "liquidityEngineEnabled", label: "💧 Liquidity Sweep Engine" },
                { key: "fibEngineEnabled", label: "📐 Fibonacci 2.6 & GZ Engine" },
                { key: "newsFilterEnabled", label: "📰 News & Volatility Shield" },
                { key: "autoTelegramEnabled", label: "✈️ Auto Telegram Dispatch" },
                { key: "singleActiveSetupOnly", label: "🔒 Strict 1-Active Setup Lock" },
              ].map((item) => (
                <div
                  key={item.key}
                  onClick={() => handleToggle(item.key as any)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    localConfig[item.key as keyof SentinelSystemConfig]
                      ? "bg-[#091624] border-cyan-400 text-cyan-200"
                      : "bg-[#080B10] border-slate-800 text-slate-500"
                  }`}
                >
                  <span className="font-bold">{item.label}</span>
                  <span
                    className={`text-[9px] font-black px-2 py-0.5 rounded ${
                      localConfig[item.key as keyof SentinelSystemConfig]
                        ? "bg-cyan-500 text-slate-950"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {localConfig[item.key as keyof SentinelSystemConfig] ? "ON" : "OFF"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Numerical Thresholds */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 bg-[#0A0D14] border border-slate-800 rounded-xl">
              <div>
                <div className="font-bold text-white">Minimum Risk/Reward (R:R)</div>
                <div className="text-[10px] text-slate-400">Rejects trades below this R:R</div>
              </div>
              <input
                type="number"
                step="0.1"
                min="1.5"
                max="5.0"
                value={localConfig.minRR}
                onChange={(e) => setLocalConfig({ ...localConfig, minRR: parseFloat(e.target.value) || 2.0 })}
                className="w-20 bg-[#07090E] border border-cyan-500/40 rounded-lg px-2.5 py-1 text-right text-cyan-300 font-bold font-mono focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-[#0A0D14] border border-slate-800 rounded-xl">
              <div>
                <div className="font-bold text-white">Score Confidence Threshold</div>
                <div className="text-[10px] text-slate-400">Min 100-point AI score to approve trade</div>
              </div>
              <input
                type="number"
                step="1"
                min="60"
                max="95"
                value={localConfig.minScoreThreshold}
                onChange={(e) => setLocalConfig({ ...localConfig, minScoreThreshold: parseInt(e.target.value) || 75 })}
                className="w-20 bg-[#07090E] border border-cyan-500/40 rounded-lg px-2.5 py-1 text-right text-cyan-300 font-bold font-mono focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-[#0A0D14] border border-slate-800 rounded-xl">
              <div>
                <div className="font-bold text-white">Post-Trade Cooldown (Minutes)</div>
                <div className="text-[10px] text-slate-400">30–40m wait after TP or SL</div>
              </div>
              <input
                type="number"
                step="5"
                min="15"
                max="60"
                value={localConfig.cooldownMinutes}
                onChange={(e) => setLocalConfig({ ...localConfig, cooldownMinutes: parseInt(e.target.value) || 35 })}
                className="w-20 bg-[#07090E] border border-cyan-500/40 rounded-lg px-2.5 py-1 text-right text-cyan-300 font-bold font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-cyan-500/20 bg-[#0A0E17] flex justify-between items-center">
          <button
            onClick={() => setLocalConfig({ ...DEFAULT_SENTINEL_CONFIG })}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all cursor-pointer"
          >
            Reset Defaults
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.4)] flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

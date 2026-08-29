import React from "react";
import {
  Dna,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  Sparkles,
  Zap,
  Target,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import {
  MarketRegime,
  SessionName,
  VolatilityState,
  AiModelScenario,
  DerivedLiquidityZone,
} from "../../services/gbpusdSniperEngine";

interface GbpusdMarketDnaPanelProps {
  marketRegime: MarketRegime;
  marketStateText: string;
  session: SessionName;
  volatility: VolatilityState;
  momentum: "STRONG_BULLISH" | "MILD_BULLISH" | "NEUTRAL" | "MILD_BEARISH" | "STRONG_BEARISH";
  scenarios: AiModelScenario[];
  liquidityZones: DerivedLiquidityZone[];
  currentPrice: number;
}

export const GbpusdMarketDnaPanel: React.FC<GbpusdMarketDnaPanelProps> = ({
  marketRegime,
  marketStateText,
  session,
  volatility,
  momentum,
  scenarios,
  liquidityZones,
  currentPrice,
}) => {
  const isBullish = momentum.includes("BULLISH");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full">
      {/* Left 6 cols: Market DNA & Institutional Confluence Matrix */}
      <div className="lg:col-span-6 rounded-2xl bg-[#080d17]/90 border border-slate-800 p-4.5 shadow-lg flex flex-col justify-between gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Dna className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-black text-white tracking-wider">GBPUSD MARKET DNA</h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
            DETERMINISTIC QUANT MATRIX
          </span>
        </div>

        {/* State Banner */}
        <div className="rounded-xl bg-gradient-to-r from-slate-900 via-cyan-950/30 to-slate-900 border border-cyan-500/20 p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Current Phase</div>
            <div className="text-xs font-black text-cyan-300">{marketStateText}</div>
          </div>
          <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-300">
            {isBullish ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-400" />
            )}
            <span>{momentum.replace(/_/g, " ")}</span>
          </div>
        </div>

        {/* DNA Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[9px] text-slate-500 block uppercase">Regime</span>
            <span className="font-bold text-white text-xs">{marketRegime.replace(/_/g, " ")}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[9px] text-slate-500 block uppercase">Session</span>
            <span className="font-bold text-amber-300 text-xs">{session.replace(/_/g, " ")}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[9px] text-slate-500 block uppercase">Vol State</span>
            <span className="font-bold text-cyan-300 text-xs">{volatility}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[9px] text-slate-500 block uppercase">Derived Liq</span>
            <span className="font-bold text-emerald-300 text-xs">{liquidityZones.length} Zones</span>
          </div>
        </div>

        {/* Key Liquidity Levels */}
        <div className="space-y-1.5">
          <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
            <span>Derived Liquidity Pools & Order Blocks</span>
            <span className="text-slate-500 font-mono">Status</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {liquidityZones.slice(0, 4).map((zone) => {
              const isHigh = zone.type.includes("HIGH");
              const distPips = ((zone.price - currentPrice) * 10000).toFixed(1);
              return (
                <div
                  key={zone.id}
                  className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-[11px] font-mono"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isHigh ? "bg-rose-400" : "bg-emerald-400"
                      }`}
                    />
                    <span className="font-bold text-slate-200 truncate">{zone.type}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-amber-300 font-bold">{zone.price.toFixed(5)}</span>
                    <span className="text-[9px] text-slate-500 ml-1">({distPips}p)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right 6 cols: AI Scenario Universe with 5 Branching Probabilities */}
      <div className="lg:col-span-6 rounded-2xl bg-[#080d17]/90 border border-slate-800 p-4.5 shadow-lg flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-black text-white tracking-wider">
              AI MODEL SCENARIOS (5 BRANCHES)
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30">
            MODEL ESTIMATE
          </span>
        </div>

        {/* Scenarios List */}
        <div className="space-y-2.5">
          {scenarios.map((sc, idx) => (
            <div
              key={sc.id}
              className={`p-2.5 rounded-xl border transition-all ${
                idx === 0
                  ? "bg-cyan-950/20 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                  : "bg-slate-900/50 border-slate-800/80 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: sc.color }}
                  />
                  <span className="font-black text-white">{sc.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-400 text-[10px]">
                    Target: <b className="text-white">{sc.targetPrice.toFixed(5)}</b>
                  </span>
                  <span
                    className="text-xs font-mono font-black px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: `${sc.color}22`,
                      color: sc.color,
                      borderColor: `${sc.color}44`,
                      borderWidth: "1px",
                    }}
                  >
                    {sc.probability}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1">
                <div
                  className="h-full transition-all duration-500 rounded-full"
                  style={{
                    width: `${sc.probability}%`,
                    backgroundColor: sc.color,
                  }}
                />
              </div>

              <p className="text-[10px] text-slate-400 truncate">{sc.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

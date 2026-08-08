import React from "react";
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Cpu,
  Globe,
  Sliders,
} from "lucide-react";
import {
  DATA_SOURCES_HEALTH,
  formatEventTime,
  TimezoneMode,
} from "../../services/goldIntelligenceService";

interface SourceHealthViewProps {
  timezoneMode: TimezoneMode;
}

export const SourceHealthView: React.FC<SourceHealthViewProps> = ({ timezoneMode }) => {
  return (
    <div className="space-y-6 font-mono selection:bg-amber-500 selection:text-black">
      {/* Top Banner */}
      <div className="bg-[#0B0F17] border border-[#D4AF37]/40 rounded-3xl p-6 shadow-2xl space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider">
            MULTI-SOURCE HEALTH & DATA FUSION CORE
          </span>
          <span className="text-xs text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30 font-bold">
            Min 4 Sources Mandatory
          </span>
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">
          Live Data Source Health & AI Fusion Engine Parameters
        </h2>
        <p className="text-xs text-slate-300 max-w-4xl leading-relaxed">
          Every HARAMI AI signal requires multi-node verification across execution broker feeds, economic calendars, official US government releases, and institutional CFTC/WGC flow data. If data quality degrades or feeds conflict, the system issues "NO TRADE — DATA UNVERIFIED".
        </p>
      </div>

      {/* 4 Connected Source Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DATA_SOURCES_HEALTH.map((src) => (
          <div
            key={src.id}
            className="bg-[#070A10] border border-slate-800 p-5 rounded-2xl space-y-3 relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase block">{src.category}</span>
                <h3 className="text-base font-bold text-white">{src.name}</h3>
                <span className="text-xs text-slate-400">{src.providerName}</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-[#0C1220] p-3 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Latency</span>
                <span className="font-bold text-amber-300">{src.latencyMs}ms</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Quality</span>
                <span className="font-bold text-emerald-400">{src.dataQualityScorePct}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Conflicts</span>
                <span className="font-bold text-slate-200">{src.conflictStatus}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">{src.notes}</p>
          </div>
        ))}
      </div>

      {/* AI Data Fusion & Validation Parameters */}
      <div className="bg-[#070A10] border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Cpu className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-white text-base">WALK-FORWARD & OUT-OF-SAMPLE VALIDATION PARAMETERS</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#0A0F1D] p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-amber-400 font-bold block uppercase">Zero Look-Ahead Bias</span>
            <p className="text-slate-300">
              All statistical weights and event-response rules use only historical data available strictly prior to the news release timestamp.
            </p>
          </div>

          <div className="bg-[#0A0F1D] p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-amber-400 font-bold block uppercase">Out-of-Sample Window</span>
            <p className="text-slate-300">
              2018–2026 data is reserved strictly for out-of-sample walk-forward testing to eliminate overfitting and curve-fitting errors.
            </p>
          </div>

          <div className="bg-[#0A0F1D] p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-amber-400 font-bold block uppercase">Confidence Calibration</span>
            <p className="text-slate-300">
              Final signal confidence % is calibrated against 25 years of empirical probability density functions, requiring &gt;= 75% for trade qualification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

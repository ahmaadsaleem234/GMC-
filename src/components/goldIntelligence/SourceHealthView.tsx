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
    <div className="space-y-6 font-mono">
      {/* Top Banner */}
      <div className="bg-[#080A0D] border border-[#292E35] rounded-2xl p-5 md:p-6 shadow-none space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded bg-[#17342E] text-[#74D8A0] border border-[rgba(116,216,160,0.4)] text-xs font-semibold uppercase tracking-wider">
            MULTI-SOURCE HEALTH & DATA FUSION CORE
          </span>
          <span className="text-xs text-[#F1CC6B] bg-[rgba(241,204,107,0.08)] px-2.5 py-0.5 rounded border border-[rgba(241,204,107,0.3)] font-medium">
            Min 4 Sources Mandatory
          </span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Live Data Source Health & AI Fusion Engine Parameters
        </h2>
        <p className="text-xs text-[#9299A3] max-w-4xl leading-relaxed">
          Every HARAMI AI signal requires multi-node verification across execution broker feeds, economic calendars, official US government releases, and institutional CFTC/WGC flow data. If data quality degrades or feeds conflict, the system issues "NO TRADE — DATA UNVERIFIED".
        </p>
      </div>

      {/* 4 Connected Source Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DATA_SOURCES_HEALTH.map((src) => (
          <div
            key={src.id}
            className="bg-[#111419] border border-[#292E35] p-4 sm:p-5 rounded-2xl space-y-3 relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] text-[#F1CC6B] font-semibold uppercase block">{src.category}</span>
                <h3 className="text-sm sm:text-base font-semibold text-white">{src.name}</h3>
                <span className="text-xs text-[#9299A3]">{src.providerName}</span>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#17342E] text-[#74D8A0] border border-[rgba(116,216,160,0.4)] text-xs font-semibold flex items-center gap-1.5 shrink-0">
                <span className="w-2 h-2 rounded-full bg-[#74D8A0]" />
                ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-[#0E1115] p-3 rounded-xl border border-[#242A31] text-xs">
              <div>
                <span className="text-[10px] text-[#9299A3] uppercase block">Latency</span>
                <span className="font-semibold text-[#F1CC6B]">{src.latencyMs}ms</span>
              </div>
              <div>
                <span className="text-[10px] text-[#9299A3] uppercase block">Quality</span>
                <span className="font-semibold text-[#74D8A0]">{src.dataQualityScorePct}%</span>
              </div>
              <div>
                <span className="text-[10px] text-[#9299A3] uppercase block">Conflicts</span>
                <span className="font-semibold text-slate-200">{src.conflictStatus}</span>
              </div>
            </div>

            <p className="text-xs text-[#9299A3] leading-relaxed">{src.notes}</p>
          </div>
        ))}
      </div>

      {/* AI Data Fusion & Validation Parameters */}
      <div className="bg-[#111419] border border-[#292E35] rounded-2xl p-5 md:p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#252A31] pb-3">
          <Cpu className="w-4 h-4 text-[#F1CC6B]" />
          <h3 className="font-semibold text-white text-sm">WALK-FORWARD & OUT-OF-SAMPLE VALIDATION PARAMETERS</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#0E1115] p-4 rounded-xl border border-[#242A31] space-y-1">
            <span className="text-[#F1CC6B] font-semibold block uppercase">Zero Look-Ahead Bias</span>
            <p className="text-[#9299A3]">
              All statistical weights and event-response rules use only historical data available strictly prior to the news release timestamp.
            </p>
          </div>

          <div className="bg-[#0E1115] p-4 rounded-xl border border-[#242A31] space-y-1">
            <span className="text-[#F1CC6B] font-semibold block uppercase">Out-of-Sample Window</span>
            <p className="text-[#9299A3]">
              2018–2026 data is reserved strictly for out-of-sample walk-forward testing to eliminate overfitting and curve-fitting errors.
            </p>
          </div>

          <div className="bg-[#0E1115] p-4 rounded-xl border border-[#242A31] space-y-1">
            <span className="text-[#F1CC6B] font-semibold block uppercase">Confidence Calibration</span>
            <p className="text-[#9299A3]">
              Final signal confidence % is calibrated against 25 years of empirical probability density functions, requiring &gt;= 75% for trade qualification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

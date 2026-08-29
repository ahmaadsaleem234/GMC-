import React from "react";
import {
  ShieldAlert,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Lock,
  Radio,
  Flame,
} from "lucide-react";
import { GbpusdMacroNewsEvent } from "../../services/gbpusdSniperEngine";

interface GbpusdNewsRadarProps {
  newsEvents: GbpusdMacroNewsEvent[];
}

export const GbpusdNewsRadar: React.FC<GbpusdNewsRadarProps> = ({ newsEvents }) => {
  const activeRiskEvent = newsEvents.find((e) => e.isRiskActive || (e.impact === "HIGH" && e.minutesUntil <= 30));

  return (
    <div className="w-full rounded-2xl bg-[#080d17]/90 border border-slate-800 p-4.5 shadow-lg flex flex-col gap-3.5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-sm font-black text-white tracking-wider">
              GBP / USD MACRO NEWS RADAR
            </h3>
            <p className="text-[10px] text-slate-400">High-Impact BoE & Fed Economic Release Filter</p>
          </div>
        </div>

        {/* Shield Status Badge */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase border shadow-md ${
            activeRiskEvent
              ? "bg-rose-950/70 border-rose-500/60 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse"
              : "bg-emerald-950/70 border-emerald-500/60 text-emerald-300"
          }`}
        >
          {activeRiskEvent ? <ShieldAlert className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{activeRiskEvent ? "NEWS SHIELD ACTIVE (TRADING HALTED)" : "NEWS SHIELD CLEAR (SAFE)"}</span>
        </div>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {newsEvents.map((evt) => {
          const isHigh = evt.impact === "HIGH";
          const isGBP = evt.currency === "GBP";

          return (
            <div
              key={evt.id}
              className={`p-3 rounded-xl border flex flex-col justify-between gap-2 transition-all ${
                evt.isRiskActive
                  ? "bg-rose-950/30 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
                  : "bg-slate-900/50 border-slate-800"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{isGBP ? "🇬🇧" : "🇺🇸"}</span>
                  <span className="text-xs font-black text-white font-mono">{evt.currency}</span>
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                      isHigh
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    }`}
                  >
                    {evt.impact}
                  </span>
                </div>

                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {evt.timeUtc} UTC
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{evt.title}</h4>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                <span>
                  COUNTDOWN:{" "}
                  <b className={evt.minutesUntil <= 30 ? "text-rose-400" : "text-cyan-300"}>
                    {evt.minutesUntil > 0 ? `${evt.minutesUntil}m` : "LIVE NOW"}
                  </b>
                </span>
                {evt.forecast && (
                  <span>
                    FCST: <b className="text-white">{evt.forecast}</b>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

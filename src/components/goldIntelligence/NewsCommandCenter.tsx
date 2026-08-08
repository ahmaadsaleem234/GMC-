import React, { useState, useEffect } from "react";
import {
  Clock,
  Calendar,
  Zap,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Database,
  Globe,
  Filter,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Info,
} from "lucide-react";
import {
  SCHEDULED_ECONOMIC_EVENTS,
  DATA_SOURCES_HEALTH,
  EconomicEvent,
  TimezoneMode,
  formatEventTime,
} from "../../services/goldIntelligenceService";

interface NewsCommandCenterProps {
  currentPrice: number;
  timezoneMode: TimezoneMode;
  setTimezoneMode: (mode: TimezoneMode) => void;
  onSelectEventForSetup?: (event: EconomicEvent) => void;
}

export const NewsCommandCenter: React.FC<NewsCommandCenterProps> = ({
  currentPrice,
  timezoneMode,
  setTimezoneMode,
  onSelectEventForSetup,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedImpact, setSelectedImpact] = useState<string>("HIGH");

  // Find next upcoming high impact event
  const upcomingHighImpact = SCHEDULED_ECONOMIC_EVENTS.find((e) => e.impact === "HIGH" && e.status === "UPCOMING") || SCHEDULED_ECONOMIC_EVENTS[1];

  // Countdown clock state
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 18,
    minutes: 42,
    seconds: 15,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredEvents = SCHEDULED_ECONOMIC_EVENTS.filter((e) => {
    const matchCat = selectedCategory === "ALL" || e.category === selectedCategory;
    const matchImp = selectedImpact === "ALL" || e.impact === selectedImpact;
    return matchCat && matchImp;
  });

  const warningStages = [
    { label: "T-24H", stage: "Reminder Sent", active: true, desc: "24h Early News Alert" },
    { label: "T-6H", stage: "Market Context Lock", active: true, desc: "D1/H4 Trend Confirmation" },
    { label: "T-2H", stage: "T-2H Signal Engine Gate", active: true, desc: "HARAMI AI Final Setup Release Window", highlight: true },
    { label: "T-1H", stage: "H1/M15 Zone Mapping", active: true, desc: "Best Entry Range Sealed" },
    { label: "T-30M", stage: "Order Lockout", active: true, desc: "Fresh Orders Blocked Before Release" },
    { label: "T-0", stage: "News Release", active: false, desc: "Volatility & Execution Window" },
    { label: "T+15M", stage: "Post-News Audit", active: false, desc: "TP/SL & Slippage Tracking" },
    { label: "T+24H", stage: "Historical Archive", active: false, desc: "25Y Database Synchronization" },
  ];

  return (
    <div className="space-y-6 selection:bg-amber-500 selection:text-black">
      {/* 🌟 Next Event Countdown Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B111E] via-[#121B2C] to-[#0B111E] border border-[#D4AF37]/50 p-6 md:p-8 shadow-[0_0_40px_rgba(212,175,55,0.15)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/50 font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                NEXT HIGH-IMPACT NEWS CATALYST
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                T-2H Signal Engine Qualified
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              {upcomingHighImpact.name}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-300">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Event Time: </span>
                <span className="font-bold text-amber-300">{formatEventTime(upcomingHighImpact.dateUtc, timezoneMode)}</span>
              </div>
              <span className="text-slate-600">•</span>
              <div>
                <span className="text-slate-400">Previous: </span>
                <span className="font-bold text-white">{upcomingHighImpact.previous}</span>
              </div>
              <span className="text-slate-600">•</span>
              <div>
                <span className="text-slate-400">Forecast: </span>
                <span className="font-bold text-amber-300">{upcomingHighImpact.forecast}</span>
              </div>
            </div>
          </div>

          {/* Countdown Clock Unit */}
          <div className="flex flex-col items-center justify-center bg-[#060910] p-4 md:p-5 rounded-2xl border border-[#D4AF37]/40 min-w-[260px] shadow-2xl">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest mb-1">
              Countdown to Release
            </span>
            <div className="text-3xl md:text-4xl font-mono font-black text-amber-300 tracking-wider drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">
              {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
            </div>
            <span className="text-[11px] font-mono text-emerald-400 mt-1 font-bold">
              ⚡ T-2H Signal Published at {formatEventTime(new Date(new Date(upcomingHighImpact.dateUtc).getTime() - 7200000).toISOString(), timezoneMode)}
            </span>
          </div>
        </div>

        {/* Warning Stages Pipeline */}
        <div className="mt-6 pt-6 border-t border-slate-800">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-3">
            HARAMI AI NEWS WARNING & SIGNAL PIPELINE (T-24H TO T+24H)
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 font-mono text-xs">
            {warningStages.map((stage, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border transition-all ${
                  stage.highlight
                    ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                    : stage.active
                    ? "bg-[#101726] border-slate-700 text-slate-200"
                    : "bg-[#080C14] border-slate-800/60 text-slate-500 opacity-60"
                }`}
              >
                <div className="font-black text-sm">{stage.label}</div>
                <div className="text-[10px] font-bold tracking-tight truncate">{stage.stage}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4-Source Data Health Header */}
      <div className="bg-[#070A10] border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white text-sm">4 INDEPENDENT DATA SOURCES VERIFICATION BAR</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
            All 4 Feeds Active (0 Conflicts)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {DATA_SOURCES_HEALTH.map((src) => (
            <div key={src.id} className="bg-[#0D1320] p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 truncate">{src.providerName}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Latency: {src.latencyMs}ms</span>
                <span className="text-emerald-400 font-bold">{src.dataQualityScorePct}% Quality</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scheduled News Event Table */}
      <div className="bg-[#070A10] border border-slate-800 rounded-2xl p-5 space-y-4 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-base">HIGH-IMPACT GOLD ECONOMIC EVENTS</h3>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-bold">Impact:</span>
            {(["ALL", "HIGH", "MEDIUM"] as const).map((imp) => (
              <button
                key={imp}
                onClick={() => setSelectedImpact(imp)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedImpact === imp
                    ? "bg-amber-400 text-black shadow-sm"
                    : "bg-[#101726] text-slate-400 hover:text-white"
                }`}
              >
                {imp}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-[#0A0F1A]">
                <th className="p-3">EVENT NAME</th>
                <th className="p-3">SCHEDULED TIME ({timezoneMode})</th>
                <th className="p-3">IMPACT</th>
                <th className="p-3">PREVIOUS</th>
                <th className="p-3">FORECAST</th>
                <th className="p-3">ACTUAL</th>
                <th className="p-3">GOLD EXPECTED IMPACT</th>
                <th className="p-3">SIGNAL ELIGIBILITY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-[#0E1524] transition-colors">
                  <td className="p-3 font-bold text-white max-w-[220px]">
                    <div>{evt.name}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{evt.details}</div>
                  </td>
                  <td className="p-3 text-amber-300 font-bold">
                    {formatEventTime(evt.dateUtc, timezoneMode)}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        evt.impact === "HIGH"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {evt.impact}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{evt.previous}</td>
                  <td className="p-3 text-amber-300 font-bold">{evt.forecast}</td>
                  <td className="p-3 font-black">
                    {evt.actual ? (
                      <span className="text-emerald-400">{evt.actual}</span>
                    ) : (
                      <span className="text-slate-500">Pending</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        evt.expectedGoldImpact.includes("BULLISH")
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      }`}
                    >
                      {evt.expectedGoldImpact}
                    </span>
                  </td>
                  <td className="p-3">
                    {evt.impact === "HIGH" ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        T-2H Qualified
                      </span>
                    ) : (
                      <span className="text-slate-500">Informational</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

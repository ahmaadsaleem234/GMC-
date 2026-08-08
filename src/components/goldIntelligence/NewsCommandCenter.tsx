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
    <div className="space-y-6">
      {/* 🌟 Next Event Countdown Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#080A0D] border border-[#292E35] p-5 md:p-6 shadow-none">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              <span className="px-3 py-1 rounded bg-[rgba(241,204,107,0.08)] text-[#F1CC6B] border border-[rgba(241,204,107,0.3)] font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-none">
                <Zap className="w-3.5 h-3.5 text-[#F1CC6B]" />
                NEXT HIGH-IMPACT NEWS CATALYST
              </span>
              <span className="px-3 py-1 rounded bg-[#17342E] text-[#74D8A0] border border-[rgba(116,216,160,0.4)] font-semibold">
                T-2H Signal Engine Qualified
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {upcomingHighImpact.name}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#9299A3]">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#F1CC6B]" />
                <span>Event Time: </span>
                <span className="font-semibold text-[#F1CC6B]">{formatEventTime(upcomingHighImpact.dateUtc, timezoneMode)}</span>
              </div>
              <span className="text-[#272C32]">•</span>
              <div>
                <span className="text-[#9299A3]">Previous: </span>
                <span className="font-semibold text-white">{upcomingHighImpact.previous}</span>
              </div>
              <span className="text-[#272C32]">•</span>
              <div>
                <span className="text-[#9299A3]">Forecast: </span>
                <span className="font-semibold text-[#F1CC6B]">{upcomingHighImpact.forecast}</span>
              </div>
            </div>
          </div>

          {/* Countdown Clock Unit */}
          <div className="flex flex-col items-center justify-center bg-[#0E1115] p-4 rounded-xl border border-[#242A31] min-w-[260px]">
            <span className="text-[11px] font-mono text-[#9299A3] uppercase tracking-widest mb-1">
              Countdown to Release
            </span>
            <div className="text-3xl font-mono font-bold text-[#F1CC6B] tracking-wider">
              {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
            </div>
            <span className="text-[11px] font-mono text-[#74D8A0] mt-1 font-semibold">
              ⚡ T-2H Signal Published at {formatEventTime(new Date(new Date(upcomingHighImpact.dateUtc).getTime() - 7200000).toISOString(), timezoneMode)}
            </span>
          </div>
        </div>

        {/* Warning Stages Pipeline */}
        <div className="mt-6 pt-5 border-t border-[#272C32]">
          <span className="text-xs font-mono font-semibold text-[#9299A3] uppercase tracking-wider block mb-3">
            HARAMI AI NEWS WARNING & SIGNAL PIPELINE (T-24H TO T+24H)
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 font-mono text-xs">
            {warningStages.map((stage, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg border transition-all ${
                  stage.highlight
                    ? "bg-[rgba(241,204,107,0.12)] border-[#F1CC6B] text-[#F1CC6B]"
                    : stage.active
                    ? "bg-[#111419] border-[#292E35] text-slate-200"
                    : "bg-[#0E1115] border-[#242A31] text-[#646C77]"
                }`}
              >
                <div className="font-bold text-sm">{stage.label}</div>
                <div className="text-[10px] font-medium tracking-tight truncate">{stage.stage}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4-Source Data Health Header */}
      <div className="bg-[#111419] border border-[#292E35] rounded-2xl p-4 sm:p-5 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#74D8A0]" />
            <span className="font-semibold text-white text-sm">4 INDEPENDENT DATA SOURCES VERIFICATION BAR</span>
          </div>
          <span className="px-2.5 py-0.5 rounded bg-[#17342E] text-[#74D8A0] border border-[rgba(116,216,160,0.4)] font-medium">
            All 4 Feeds Active (0 Conflicts)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {DATA_SOURCES_HEALTH.map((src) => (
            <div key={src.id} className="bg-[#0E1115] p-3 rounded-xl border border-[#242A31] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 truncate">{src.providerName}</span>
                <span className="w-2 h-2 rounded-full bg-[#74D8A0]" />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#9299A3]">
                <span>Latency: {src.latencyMs}ms</span>
                <span className="text-[#74D8A0] font-medium">{src.dataQualityScorePct}% Quality</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scheduled News Event Table */}
      <div className="bg-[#111419] border border-[#292E35] rounded-2xl p-5 space-y-4 font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#252A31] pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#F1CC6B]" />
            <h3 className="font-semibold text-white text-sm">HIGH-IMPACT GOLD ECONOMIC EVENTS</h3>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#9299A3] font-medium">Impact:</span>
            {(["ALL", "HIGH", "MEDIUM"] as const).map((imp) => (
              <button
                key={imp}
                onClick={() => setSelectedImpact(imp)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedImpact === imp
                    ? "bg-[#F1CC6B] text-[#111111] font-semibold"
                    : "bg-[#0E1115] text-[#9299A3] border border-[#242A31] hover:text-white"
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
              <tr className="border-b border-[#272C32] text-[#9299A3] bg-[#0E1115]">
                <th className="p-2.5">EVENT NAME</th>
                <th className="p-2.5">SCHEDULED TIME ({timezoneMode})</th>
                <th className="p-2.5">IMPACT</th>
                <th className="p-2.5">PREVIOUS</th>
                <th className="p-2.5">FORECAST</th>
                <th className="p-2.5">ACTUAL</th>
                <th className="p-2.5">GOLD EXPECTED IMPACT</th>
                <th className="p-2.5">SIGNAL ELIGIBILITY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242A31]">
              {filteredEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-[#161A21] transition-colors">
                  <td className="p-2.5 font-semibold text-white max-w-[220px]">
                    <div>{evt.name}</div>
                    <div className="text-[10px] text-[#9299A3] font-normal">{evt.details}</div>
                  </td>
                  <td className="p-2.5 text-[#F1CC6B] font-semibold">
                    {formatEventTime(evt.dateUtc, timezoneMode)}
                  </td>
                  <td className="p-2.5">
                    <span
                      className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                        evt.impact === "HIGH"
                          ? "bg-[#352329] text-[#EE777F] border border-[rgba(238,119,127,0.4)]"
                          : "bg-[rgba(241,204,107,0.08)] text-[#F1CC6B] border border-[rgba(241,204,107,0.3)]"
                      }`}
                    >
                      {evt.impact}
                    </span>
                  </td>
                  <td className="p-2.5 text-[#F3F4F5]">{evt.previous}</td>
                  <td className="p-2.5 text-[#F1CC6B] font-semibold">{evt.forecast}</td>
                  <td className="p-2.5 font-bold">
                    {evt.actual ? (
                      <span className="text-[#74D8A0]">{evt.actual}</span>
                    ) : (
                      <span className="text-[#646C77]">Pending</span>
                    )}
                  </td>
                  <td className="p-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        evt.expectedGoldImpact.includes("BULLISH")
                          ? "bg-[#17342E] text-[#74D8A0] border border-[rgba(116,216,160,0.4)]"
                          : "bg-[#352329] text-[#EE777F] border border-[rgba(238,119,127,0.4)]"
                      }`}
                    >
                      {evt.expectedGoldImpact}
                    </span>
                  </td>
                  <td className="p-2.5">
                    {evt.impact === "HIGH" ? (
                      <span className="text-[#74D8A0] font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#74D8A0]" />
                        T-2H Qualified
                      </span>
                    ) : (
                      <span className="text-[#646C77]">Informational</span>
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

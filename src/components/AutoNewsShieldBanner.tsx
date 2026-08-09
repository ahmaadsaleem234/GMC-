import React, { useState, useEffect } from "react";
import { AlertTriangle, ShieldCheck, Zap, Clock, ShieldAlert, PauseCircle } from "lucide-react";

export interface MacroEconomicEvent {
  id: string;
  title: string;
  country: string; // "USD", "EUR", "GBP"
  impact: "high" | "medium" | "low"; // "high" = Red Folder
  scheduledTimestamp: number; // Unix epoch ms
  forecast: string;
  previous: string;
  description: string;
}

// Default Key USD & Gold High Impact Events
export const UPCOMING_MACRO_EVENTS: MacroEconomicEvent[] = [
  {
    id: "evt-cpi",
    title: "US Core CPI Inflation Rate (MoM / YoY)",
    country: "USD",
    impact: "high",
    scheduledTimestamp: Date.now() + 18 * 60 * 1000, // 18 minutes from now
    forecast: "0.2%",
    previous: "0.3%",
    description: "Crucial inflation gauge directly impacting Fed Interest Rate Expectations & Gold volatility.",
  },
  {
    id: "evt-nfp",
    title: "US Non-Farm Payrolls (NFP) & Unemployment",
    country: "USD",
    impact: "high",
    scheduledTimestamp: Date.now() + 2 * 3600 * 1000 + 15 * 60 * 1000, // 2h 15m from now
    forecast: "175K",
    previous: "182K",
    description: "Labor market benchmark triggering 30-50 pip immediate Gold / FX spikes.",
  },
  {
    id: "evt-fomc",
    title: "FOMC Rate Decision & Press Conference",
    country: "USD",
    impact: "high",
    scheduledTimestamp: Date.now() + 6 * 3600 * 1000 + 45 * 60 * 1000, // 6h 45m from now
    forecast: "5.25%",
    previous: "5.25%",
    description: "Federal Reserve interest rate stance and monetary policy release.",
  },
  {
    id: "evt-ppi",
    title: "US Producer Price Index (PPI)",
    country: "USD",
    impact: "high",
    scheduledTimestamp: Date.now() + 14 * 3600 * 1000,
    forecast: "0.1%",
    previous: "0.2%",
    description: "Wholesale inflation leading indicator for future CPI prints.",
  },
  {
    id: "evt-retail",
    title: "US Advance Retail Sales (MoM)",
    country: "USD",
    impact: "high",
    scheduledTimestamp: Date.now() + 22 * 3600 * 1000,
    forecast: "0.4%",
    previous: "0.1%",
    description: "Primary consumer spending metric driving Dollar strength.",
  },
];

export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return "LIVE NOW!";
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));

  const hStr = hours > 0 ? `${hours}h ` : "";
  const mStr = `${minutes.toString().padStart(2, "0")}m `;
  const sStr = `${seconds.toString().padStart(2, "0")}s`;

  return `${hStr}${mStr}${sStr}`;
}

export const AutoNewsShieldBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [events, setEvents] = useState<MacroEconomicEvent[]>(UPCOMING_MACRO_EVENTS);
  const [shieldEnabled, setShieldEnabled] = useState(true);
  const [now, setNow] = useState(Date.now());

  // Timer loop
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Find nearest high-impact event
  const upcomingHighImpact = events
    .filter((e) => e.impact === "high")
    .sort((a, b) => a.scheduledTimestamp - b.scheduledTimestamp)[0];

  const diffMs = upcomingHighImpact ? upcomingHighImpact.scheduledTimestamp - now : 9999999;
  const minutesAway = diffMs / 60000;

  // Auto-News Shield Active Warning Buffer: 15 to 30 mins before OR live
  const isDangerZone = minutesAway <= 30 && minutesAway >= -10;

  if (compact) {
    return (
      <div className={`px-3 py-1.5 rounded-xl border flex items-center justify-between text-xs font-mono transition-all ${
        isDangerZone && shieldEnabled
          ? "bg-rose-950/80 border-rose-500/80 text-rose-200 animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.3)]"
          : "bg-black/60 border-slate-800 text-slate-300"
      }`}>
        <div className="flex items-center gap-2">
          {isDangerZone ? (
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span className="font-bold uppercase tracking-wider text-[11px]">
            {isDangerZone ? "🚨 AUTO-NEWS SHIELD: PAUSED" : "🛡️ NEWS SHIELD ARMED"}
          </span>
        </div>

        {upcomingHighImpact && (
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-slate-400 font-sans hidden sm:inline">{upcomingHighImpact.title}:</span>
            <span className={`font-extrabold px-2 py-0.5 rounded text-[10px] ${
              isDangerZone ? "bg-rose-500 text-black font-black" : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
            }`}>
              {formatTimeRemaining(diffMs)}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border p-5 font-mono shadow-2xl transition-all ${
      isDangerZone && shieldEnabled
        ? "bg-gradient-to-r from-[#1A0508] via-[#120306] to-[#0A0204] border-rose-500/80 shadow-[0_0_35px_rgba(244,63,94,0.25)]"
        : "bg-gradient-to-r from-[#0B101D] via-[#080B15] to-[#04060A] border-blue-500/40"
    }`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl shadow-lg ${
            isDangerZone
              ? "bg-rose-500/20 border-rose-500/80 text-rose-400 animate-bounce shadow-rose-500/30"
              : "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-emerald-500/20"
          }`}>
            {isDangerZone ? "🚨" : "🛡️"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white tracking-tight uppercase font-sans">
                AUTO-NEWS SHIELD & RED-FOLDER ALERT SYSTEM
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                shieldEnabled ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-slate-800 text-slate-400"
              }`}>
                {shieldEnabled ? "SHIELD ACTIVE" : "SHIELD DISABLED"}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Automatically detects upcoming High-Impact USD Economic Releases (CPI, NFP, FOMC) and activates a 15–30 minute safety buffer to prevent news slippage.
            </p>
          </div>
        </div>

        {/* Shield Toggle Switch */}
        <button
          onClick={() => setShieldEnabled(!shieldEnabled)}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 shrink-0 ${
            shieldEnabled
              ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-600/30"
              : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{shieldEnabled ? "AUTO-PAUSE ACTIVE (ON)" : "ENABLE AUTO-SHIELD"}</span>
        </button>
      </div>

      {/* Warning Alert Banner when in Danger Zone */}
      {isDangerZone && shieldEnabled && (
        <div className="mt-4 p-4 rounded-xl bg-rose-500/15 border-2 border-rose-500/80 text-rose-200 space-y-2 animate-pulse">
          <div className="flex items-center justify-between font-sans">
            <span className="font-black text-sm uppercase tracking-wider flex items-center gap-2 text-rose-300">
              <PauseCircle className="w-5 h-5 text-rose-400 animate-spin" />
              HIGH-IMPACT NEWS WARNING — AUTO-PAUSE TRIGGERED!
            </span>
            <span className="px-3 py-1 bg-rose-600 text-white font-black text-xs rounded-lg">
              {formatTimeRemaining(diffMs)} REMAINING
            </span>
          </div>
          <p className="text-xs font-sans text-rose-100 leading-relaxed">
            Red-Folder Event <strong>{upcomingHighImpact?.title}</strong> is scheduled in under 30 minutes. Automated AI trade execution and signal triggers have been auto-paused to protect account capital from news spike slippage.
          </p>
        </div>
      )}

      {/* Upcoming USD / Gold Events Timer Cards */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {events.slice(0, 3).map((evt) => {
          const evtDiff = evt.scheduledTimestamp - now;
          const isSoon = evtDiff <= 30 * 60 * 1000 && evtDiff >= -10 * 60 * 1000;

          return (
            <div
              key={evt.id}
              className={`p-3.5 rounded-xl border space-y-2 transition-all ${
                isSoon
                  ? "bg-rose-950/40 border-rose-500/60 shadow-lg"
                  : "bg-black/50 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-white text-xs leading-snug">{evt.title}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase shrink-0 border ${
                  evt.impact === "high" ? "bg-rose-500/20 text-rose-400 border-rose-500/40" : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                }`}>
                  {evt.country} ({evt.impact.toUpperCase()})
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                <span className="text-slate-400 font-sans flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-400" /> Countdown:
                </span>
                <span className={`font-mono font-black ${isSoon ? "text-rose-400 text-sm animate-pulse" : "text-amber-400"}`}>
                  {formatTimeRemaining(evtDiff)}
                </span>
              </div>

              <div className="flex justify-between text-[10px] text-slate-400 pt-1 font-mono">
                <span>Forecast: <strong className="text-white">{evt.forecast}</strong></span>
                <span>Previous: <strong className="text-slate-300">{evt.previous}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

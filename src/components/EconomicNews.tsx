import React, { useEffect, useState } from "react";
import { Globe, Calendar, Zap, ExternalLink, RefreshCw, Clock, AlertTriangle, ShieldCheck } from "lucide-react";
import { AutoNewsShieldBanner, UPCOMING_MACRO_EVENTS, formatTimeRemaining } from "./AutoNewsShieldBanner";

export const EconomicNews: React.FC = () => {
  const [headlines, setHeadlines] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [digest, setDigest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    loadNewsData();
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const loadNewsData = async () => {
    setLoading(true);
    try {
      const [hRes, cRes, dRes] = await Promise.all([
        fetch("/api/news/headlines"),
        fetch("/api/news/calendar"),
        fetch("/api/news/ai-digest"),
      ]);

      if (hRes.ok) {
        const hData = await hRes.json();
        setHeadlines(hData.headlines || []);
      }
      if (cRes.ok) {
        const cData = await cRes.json();
        setEvents(cData.events || []);
      }
      if (dRes.ok) {
        const dData = await dRes.json();
        setDigest(dData);
      }
    } catch (e) {
      console.warn("News data load error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="gmc-economic-news" className="space-y-6 pb-12 font-mono text-xs">
      {/* Top Auto News Shield Banner */}
      <AutoNewsShieldBanner />

      {/* Title Bar */}
      <div className="bg-[#0A0A0A] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 font-sans">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" /> MACRO ECONOMIC NEWS & FOREX CALENDAR
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Real-time event timers for CPI, NFP, FOMC, Interest Rates, PPI, and Retail Sales releases.
          </p>
        </div>
        <button
          onClick={loadNewsData}
          id="reload-news-btn"
          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs text-white font-bold font-mono border border-blue-500/40 flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 uppercase tracking-wider shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-white" : ""}`} /> Refresh News
        </button>
      </div>

      {/* AI News Digest Banner */}
      {digest && (
        <div className="bg-[#080808] border border-slate-800 p-5 rounded-xl space-y-3 font-mono shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2 font-sans">
              <Zap className="w-4 h-4 text-blue-400" /> GMC AI MARKET DIGEST & SENTIMENT
            </h2>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {digest.overallBias} ({digest.confidence}% CONFIDENCE)
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed bg-black/40 p-3.5 rounded-xl border border-slate-800 font-sans">
            {digest.summary}
          </p>
        </div>
      )}

      {/* Major USD & Gold Macro Releases Table with Countdown Timers */}
      <div className="bg-[#080808] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2 font-sans">
            <Calendar className="w-5 h-5 text-amber-400" />
            MAJOR USD & GOLD ECONOMIC EVENT TIMERS
          </h2>
          <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">
            5 KEY MACRO DRIVERS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {UPCOMING_MACRO_EVENTS.map((evt) => {
            const diff = evt.scheduledTimestamp - now;
            const isSoon = diff <= 30 * 60 * 1000 && diff >= -10 * 60 * 1000;

            return (
              <div
                key={evt.id}
                className={`p-4 rounded-xl border space-y-2.5 transition-all ${
                  isSoon
                    ? "bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-950/50"
                    : "bg-black/40 border-slate-800 hover:border-slate-700"
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

                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  {evt.description}
                </p>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                  <span className="text-slate-400 font-sans flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-400" /> Countdown:
                  </span>
                  <span className={`font-mono font-black ${isSoon ? "text-rose-400 text-sm animate-pulse" : "text-amber-400 text-xs"}`}>
                    {formatTimeRemaining(diff)}
                  </span>
                </div>

                <div className="flex justify-between text-[11px] text-slate-400 font-mono pt-1">
                  <span>Forecast: <strong className="text-white">{evt.forecast}</strong></span>
                  <span>Previous: <strong className="text-slate-300">{evt.previous}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live News Grid: Calendar & Breaking Headlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono">
        {/* Economic Calendar Events */}
        <div className="bg-[#080808] border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 border-b border-slate-800 pb-2 font-sans">
            <Calendar className="w-4 h-4 text-amber-400" /> Full Economic Calendar Stream
          </h2>
          <div className="space-y-2 text-xs">
            {events.map((ev, i) => (
              <div key={i} className="p-3 bg-black/40 rounded-lg border border-slate-800 space-y-1">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-100">{ev.title}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${ev.impact === "high" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                    {ev.country} ({ev.impact.toUpperCase()})
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/80">
                  <span>Forecast: <strong className="text-slate-300">{ev.forecast}</strong></span>
                  <span>Previous: <strong className="text-slate-300">{ev.previous}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live News Headlines */}
        <div className="bg-[#080808] border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 border-b border-slate-800 pb-2 font-sans">
            <Globe className="w-4 h-4 text-blue-400" /> Live Breaking Financial News
          </h2>
          <div className="space-y-2 text-xs">
            {headlines.map((item) => (
              <div key={item.id} className="p-3 bg-black/40 rounded-lg border border-slate-800 space-y-1">
                <a href={item.link} target="_blank" rel="noreferrer" className="font-bold text-slate-200 hover:text-blue-400 flex items-center justify-between gap-2 transition-colors">
                  <span>{item.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                </a>
                <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                  <span>Source: {item.source}</span>
                  <span className="uppercase text-blue-400 font-bold">{item.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


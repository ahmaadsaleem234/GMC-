import React, { useEffect, useState } from "react";
import { Globe, Calendar, Zap, ExternalLink, RefreshCw } from "lucide-react";

export const EconomicNews: React.FC = () => {
  const [headlines, setHeadlines] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [digest, setDigest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNewsData();
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
    <div id="gmc-economic-news" className="space-y-6 pb-12 font-sans">
      <div className="bg-[#0A0A0A] border border-slate-800 rounded-xl p-5 shadow-xl flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" /> MACRO ECONOMIC NEWS & FOREX CALENDAR
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Real-time market sentiment, central bank rate events, and high-impact macro headlines.
          </p>
        </div>
        <button
          onClick={loadNewsData}
          id="reload-news-btn"
          className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-xs text-white font-bold font-mono border border-blue-500/40 flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 uppercase tracking-wider"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-white" : ""}`} /> Refresh News
        </button>
      </div>

      {/* AI News Digest Banner */}
      {digest && (
        <div className="bg-[#080808] border border-slate-800 p-5 rounded-xl space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400" /> GMC AI MARKET DIGEST & SENTIMENT
            </h2>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {digest.overallBias} ({digest.confidence}% CONFIDENCE)
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed bg-black/40 p-3 rounded-lg border border-slate-800">
            {digest.summary}
          </p>
        </div>
      )}

      {/* News Grid: Calendar & Headlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono">
        {/* Economic Calendar Events */}
        <div className="bg-[#080808] border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Calendar className="w-4 h-4 text-amber-400" /> Upcoming Economic Releases
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
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2 border-b border-slate-800 pb-2">
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

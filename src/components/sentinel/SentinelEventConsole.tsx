import React, { useState, useEffect, useRef } from "react";
import { SentinelEventLog } from "../../services/sentinelEngine";
import { Terminal, RefreshCw, Filter } from "lucide-react";

interface SentinelEventConsoleProps {
  events: SentinelEventLog[];
}

export const SentinelEventConsole: React.FC<SentinelEventConsoleProps> = ({ events }) => {
  const [filter, setFilter] = useState<string>("ALL");
  const scrollRef = useRef<HTMLDivElement>(null);

  const filtered = events.filter((e) => {
    if (filter === "ALL") return true;
    return e.category === filter;
  });

  return (
    <div className="bg-[#050608] border border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_25px_rgba(6,182,212,0.12)] font-mono flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/20 pb-2.5">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-xs text-cyan-300 uppercase tracking-wider">
            LIVE SYSTEM EVENT CONSOLE
          </span>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1 bg-[#090D14] p-0.5 rounded-lg border border-slate-800 text-[10px]">
          {["ALL", "STRUCTURE", "LIQUIDITY", "FLOW", "FIB", "SENTINEL"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2 py-0.5 rounded font-bold uppercase transition-all cursor-pointer ${
                filter === cat
                  ? "bg-cyan-500 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                  : "text-slate-400 hover:text-cyan-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Viewport */}
      <div
        ref={scrollRef}
        className="h-44 overflow-y-auto bg-[#030406] border border-slate-800/80 rounded-xl p-2.5 space-y-1.5 text-xs text-slate-300 font-mono scrollbar-thin scrollbar-thumb-cyan-500/20"
      >
        {filtered.length === 0 ? (
          <div className="text-slate-600 text-center py-8">Awaiting real-time perception events...</div>
        ) : (
          filtered.map((ev) => {
            const isSuccess = ev.level === "SUCCESS";
            const isWarning = ev.level === "WARNING";
            const isCritical = ev.level === "CRITICAL";

            return (
              <div
                key={ev.id}
                className="flex items-start gap-2 hover:bg-white/[0.02] py-0.5 px-1 rounded transition-all text-[11px]"
              >
                <span className="text-slate-500 shrink-0 select-none">[{ev.timestamp}]</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase shrink-0 ${
                    ev.category === "SENTINEL"
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : ev.category === "LIQUIDITY"
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                      : ev.category === "FLOW"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {ev.category}
                </span>
                <span
                  className={`${
                    isSuccess
                      ? "text-emerald-300 font-semibold"
                      : isWarning
                      ? "text-amber-300"
                      : isCritical
                      ? "text-rose-400 font-bold"
                      : "text-slate-300"
                  }`}
                >
                  {ev.message}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

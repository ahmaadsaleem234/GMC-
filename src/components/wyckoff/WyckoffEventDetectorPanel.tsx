import React, { useState } from "react";
import {
  WyckoffEventCode,
  WyckoffEventDetail,
  WyckoffEventState,
  WyckoffPhase,
} from "../../services/wyckoffEngine";
import { Radar, CheckCircle2, Clock, AlertTriangle, XCircle, Search, ShieldCheck } from "lucide-react";

interface WyckoffEventDetectorPanelProps {
  events: WyckoffEventDetail[];
  activePhase: WyckoffPhase;
  currentPrice: number;
}

const ALL_EVENTS: { code: WyckoffEventCode; name: string; category: "ACCUMULATION" | "DISTRIBUTION"; desc: string }[] = [
  // Accumulation
  { code: "PS", name: "Preliminary Support", category: "ACCUMULATION", desc: "Initial high-volume buying pausing downtrend." },
  { code: "SC", name: "Selling Climax", category: "ACCUMULATION", desc: "Panic selling absorbed by institutional bids." },
  { code: "AR", name: "Automatic Rally", category: "ACCUMULATION", desc: "Technical bounce defining upper trading range Creek." },
  { code: "ST", name: "Secondary Test", category: "ACCUMULATION", desc: "Revisiting selling climax area on lower volume." },
  { code: "SPRING", name: "Spring (Liquidity Wash)", category: "ACCUMULATION", desc: "Break beneath support with instant recovery." },
  { code: "TEST", name: "Test of Spring", category: "ACCUMULATION", desc: "Low-volume test confirming absence of supply." },
  { code: "SOS", name: "Sign of Strength", category: "ACCUMULATION", desc: "Expansion overcoming trading range resistance." },
  { code: "LPS", name: "Last Point of Support", category: "ACCUMULATION", desc: "Shallow pullback holding above Ice boundary." },
  // Distribution
  { code: "PSY", name: "Preliminary Supply", category: "DISTRIBUTION", desc: "Initial heavy selling meeting uptrend demand." },
  { code: "BC", name: "Buying Climax", category: "DISTRIBUTION", desc: "Climactic retail rush meeting smart money sell orders." },
  { code: "UT", name: "Upthrust", category: "DISTRIBUTION", desc: "False breakout above range high rejected swiftly." },
  { code: "UTAD", name: "Upthrust After Dist.", category: "DISTRIBUTION", desc: "Definitive trap above resistance before markdown." },
  { code: "SOW", name: "Sign of Weakness", category: "DISTRIBUTION", desc: "Breakdown penetrating trading range support." },
  { code: "LPSY", name: "Last Point of Supply", category: "DISTRIBUTION", desc: "Weak upward test failing beneath Creek." },
];

export const WyckoffEventDetectorPanel: React.FC<WyckoffEventDetectorPanelProps> = ({
  events,
  activePhase,
  currentPrice,
}) => {
  const [filterCategory, setFilterCategory] = useState<"ALL" | "ACCUMULATION" | "DISTRIBUTION">("ALL");

  const getEventStatus = (code: WyckoffEventCode): { state: WyckoffEventState; detail?: WyckoffEventDetail } => {
    const found = events.find((e) => e.code === code);
    if (found) {
      return { state: found.state, detail: found };
    }
    return { state: "SCANNING" };
  };

  const filteredEvents = ALL_EVENTS.filter((e) => {
    if (filterCategory === "ALL") return true;
    return e.category === filterCategory;
  });

  const getStateBadge = (state: WyckoffEventState) => {
    switch (state) {
      case "CONFIRMED":
        return {
          bg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]",
          icon: CheckCircle2,
          text: "CONFIRMED",
        };
      case "CONFIRMING":
        return {
          bg: "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.3)]",
          icon: Radar,
          text: "CONFIRMING",
        };
      case "DETECTED":
        return {
          bg: "bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse",
          icon: AlertTriangle,
          text: "DETECTED",
        };
      case "INVALIDATED":
        return {
          bg: "bg-red-500/20 text-red-300 border-red-500/50",
          icon: XCircle,
          text: "INVALIDATED",
        };
      case "SCANNING":
      default:
        return {
          bg: "bg-slate-900/40 text-slate-500 border-slate-800/60",
          icon: Clock,
          text: "SCANNING…",
        };
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#090e17]/90 p-4 backdrop-blur-xl shadow-xl flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40">
            <Radar className="w-4 h-4 text-cyan-400 animate-spin" />
          </div>
          <div>
            <h3 className="text-xs font-black tracking-widest text-slate-200 uppercase">
              WYCKOFF EVENT DETECTOR
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              REAL-TIME QUANTITATIVE CATALYST SCANNER
            </span>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex rounded-lg bg-[#06090e] border border-slate-800 p-0.5 text-[10px] font-mono">
          <button
            onClick={() => setFilterCategory("ALL")}
            className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
              filterCategory === "ALL" ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40" : "text-slate-400"
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => setFilterCategory("ACCUMULATION")}
            className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
              filterCategory === "ACCUMULATION" ? "bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40" : "text-slate-400"
            }`}
          >
            ACCUM
          </button>
          <button
            onClick={() => setFilterCategory("DISTRIBUTION")}
            className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
              filterCategory === "DISTRIBUTION" ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40" : "text-slate-400"
            }`}
          >
            DIST
          </button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[290px] overflow-y-auto pr-1 custom-scrollbar">
        {filteredEvents.map((ev) => {
          const { state, detail } = getEventStatus(ev.code);
          const badge = getStateBadge(state);
          const Icon = badge.icon;
          const isHighPriority = ev.code === "SPRING" || ev.code === "TEST" || ev.code === "SOS" || ev.code === "UTAD" || ev.code === "SOW";

          return (
            <div
              key={ev.code}
              className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                state !== "SCANNING"
                  ? "bg-[#0c1424] border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                  : "bg-[#060a12]/70 border-slate-800/70 hover:border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs font-black font-mono px-1.5 py-0.5 rounded ${
                      ev.category === "ACCUMULATION"
                        ? "bg-cyan-950/70 text-cyan-300 border border-cyan-800/60"
                        : "bg-amber-950/70 text-amber-300 border border-amber-800/60"
                    }`}
                  >
                    {ev.code}
                  </span>
                  <span className="text-[11px] font-bold text-slate-200 truncate">
                    {ev.name}
                  </span>
                </div>

                <div
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-black border ${badge.bg}`}
                >
                  <Icon className="w-2.5 h-2.5" />
                  <span>{badge.text}</span>
                </div>
              </div>

              <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="truncate max-w-[180px]">{ev.desc}</span>
                {detail && (
                  <span className="font-bold text-cyan-300 shrink-0">
                    ${detail.priceLevel.toFixed(2)}
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

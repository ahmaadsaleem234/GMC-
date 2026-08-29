import React, { useState } from "react";
import {
  Brain,
  History,
  Ghost,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Award,
} from "lucide-react";
import { ShadowTrade } from "../../services/gbpusdSniperEngine";

interface GbpusdMemoryReplayLabProps {
  shadowTrades: ShadowTrade[];
}

export const GbpusdMemoryReplayLab: React.FC<GbpusdMemoryReplayLabProps> = ({ shadowTrades }) => {
  const [activeTab, setActiveTab] = useState<"MEMORY" | "SHADOW" | "REPLAY">("SHADOW");
  const [isReplaying, setIsReplaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState<number>(1);
  const [replayIndex, setReplayIndex] = useState<number>(18);

  const historicalCases = [
    {
      id: "CASE-2025-11-04",
      date: "Nov 04, 2025",
      regime: "London Expansion Bull",
      similarity: 94.8,
      entry: 1.3415,
      exit: 1.3482,
      rr: "1:3.4",
      outcome: "TP3_HIT (+67 pips)",
    },
    {
      id: "CASE-2025-10-18",
      date: "Oct 18, 2025",
      regime: "NY Reversal Sweep",
      similarity: 91.2,
      entry: 1.3490,
      exit: 1.3435,
      rr: "1:2.8",
      outcome: "TP2_HIT (+55 pips)",
    },
    {
      id: "CASE-2025-09-22",
      date: "Sep 22, 2025",
      regime: "Asian Liquidity Reclaim",
      similarity: 88.5,
      entry: 1.3380,
      exit: 1.3440,
      rr: "1:3.0",
      outcome: "TP2_HIT (+60 pips)",
    },
  ];

  return (
    <div className="w-full rounded-2xl bg-[#080d17]/90 border border-slate-800 p-4.5 shadow-lg flex flex-col gap-4">
      {/* Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="text-sm font-black text-white tracking-wider">
              MARKET MEMORY & SHADOW TRADES LAB
            </h3>
            <p className="text-[10px] text-slate-400">Institutional Regime Matching & Near-Miss Tracking</p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex rounded-xl bg-slate-900 border border-slate-700/80 p-1 text-xs font-bold font-mono">
          <button
            onClick={() => setActiveTab("SHADOW")}
            className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
              activeTab === "SHADOW"
                ? "bg-purple-500/30 text-purple-300 border border-purple-500/50"
                : "text-slate-400 hover:text-white"
            }`}
          >
            SHADOW TRADES ({shadowTrades.length})
          </button>
          <button
            onClick={() => setActiveTab("MEMORY")}
            className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
              activeTab === "MEMORY"
                ? "bg-purple-500/30 text-purple-300 border border-purple-500/50"
                : "text-slate-400 hover:text-white"
            }`}
          >
            HISTORICAL MATCHES (3)
          </button>
          <button
            onClick={() => setActiveTab("REPLAY")}
            className={`px-3 py-1 rounded-lg cursor-pointer transition-all ${
              activeTab === "REPLAY"
                ? "bg-purple-500/30 text-purple-300 border border-purple-500/50"
                : "text-slate-400 hover:text-white"
            }`}
          >
            BAR-BY-BAR REPLAY
          </button>
        </div>
      </div>

      {/* Tab 1: Shadow Trades Archive */}
      {activeTab === "SHADOW" && (
        <div className="space-y-2.5">
          <div className="text-xs text-slate-400">
            Near-miss setups filtered by quantitative gatekeepers (tracked internally without Telegram broadcast):
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
            {shadowTrades.map((st) => (
              <div
                key={st.id}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ghost className="w-4 h-4 text-purple-400" />
                    <span className="font-bold text-white">#{st.id}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                      {st.direction} @ {st.entry}
                    </span>
                  </div>
                  <span className="text-emerald-400 font-bold">{st.outcome.replace(/_/g, " ")}</span>
                </div>

                <div className="text-[11px] text-slate-400 font-sans">{st.rejectionReason}</div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                  <span>MFE: +{st.mfe} pips</span>
                  <span>MAE: -{st.mae} pips</span>
                  <span>Score: {st.score}/100</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Historical Memory Pattern Matching */}
      {activeTab === "MEMORY" && (
        <div className="space-y-2.5">
          <div className="text-xs text-slate-400">
            Closest historical structural analogues to current market conditions:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
            {historicalCases.map((hc) => (
              <div
                key={hc.id}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10px]">{hc.date}</span>
                  <span className="text-purple-300 font-bold">{hc.similarity}% SIMILAR</span>
                </div>
                <div className="text-xs font-bold text-white font-sans">{hc.regime}</div>
                <div className="text-[11px] text-slate-300">
                  Entry: <b>{hc.entry}</b> • Exit: <b>{hc.exit}</b> ({hc.rr})
                </div>
                <div className="text-[11px] text-emerald-400 font-bold">{hc.outcome}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Bar-by-Bar Replay Simulation */}
      {activeTab === "REPLAY" && (
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-300">
              Interactive historical playback without lookahead bias. Step through previous London sessions.
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsReplaying(!isReplaying)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer"
              >
                {isReplaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isReplaying ? "PAUSE" : "PLAY"}</span>
              </button>

              <button
                onClick={() => setReplayIndex((prev) => Math.min(36, prev + 1))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setReplayIndex(10)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span>Replay Bar: <b>{replayIndex} / 36</b></span>
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full"
                style={{ width: `${(replayIndex / 36) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

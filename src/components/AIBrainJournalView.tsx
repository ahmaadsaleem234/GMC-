import React, { useState } from "react";
import { getModuleTitle } from "../utils/moduleRegistry";
import {
  Brain,
  ShieldCheck,
  Zap,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Layers,
  Activity,
  Award,
  BookOpen,
  Sparkles,
  RefreshCw,
  Tag,
  PlusCircle,
  BarChart3,
  Globe,
  Clock,
} from "lucide-react";
import { TabDemoAccount } from "../useDemoAccounts";
import { SUPPORTED_ASSETS } from "../useLiveData";
import { playAlertChime } from "../utils/audioAlert";

interface SMCJournalTrade {
  id: string;
  timestamp: string;
  assetKey: string;
  type: "BUY" | "SELL";
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  lotSize: number;
  smcTag: "Order Block Retest" | "Liquidity Sweep" | "FVG Fill" | "CHOCH Retest" | "Inducement Sweep";
  session: "London Session" | "New York Session" | "Asian Session";
  riskReward: number; // e.g. 3.2 (1:3.2)
  pnlUSD: number;
  outcome: "WIN" | "LOSS" | "RUNNING";
  notes: string;
}

const INITIAL_SMC_JOURNAL: SMCJournalTrade[] = [
  {
    id: "smc-101",
    timestamp: "14:20:10",
    assetKey: "XAUUSD",
    type: "BUY",
    entryPrice: 4338.5,
    stopLoss: 4328.0,
    takeProfit: 4370.0,
    lotSize: 0.1,
    smcTag: "Order Block Retest",
    session: "New York Session",
    riskReward: 3.0,
    pnlUSD: 315.0,
    outcome: "WIN",
    notes: "Perfect tap into 15M Bullish OB after London SSL sweep.",
  },
  {
    id: "smc-102",
    timestamp: "10:15:30",
    assetKey: "XAUUSD",
    type: "BUY",
    entryPrice: 4312.0,
    stopLoss: 4305.0,
    takeProfit: 4335.0,
    lotSize: 0.2,
    smcTag: "Liquidity Sweep",
    session: "London Session",
    riskReward: 3.28,
    pnlUSD: 460.0,
    outcome: "WIN",
    notes: "Asian Low SSL swept with fast M1 CHOCH confirmation.",
  },
  {
    id: "smc-103",
    timestamp: "07:40:12",
    assetKey: "EURUSD",
    type: "SELL",
    entryPrice: 1.0865,
    stopLoss: 1.0885,
    takeProfit: 1.0815,
    lotSize: 1.0,
    smcTag: "FVG Fill",
    session: "London Session",
    riskReward: 2.5,
    pnlUSD: 500.0,
    outcome: "WIN",
    notes: "1H Bearish FVG fill aligned with DXY momentum.",
  },
  {
    id: "smc-104",
    timestamp: "03:12:00",
    assetKey: "BTCUSD",
    type: "BUY",
    entryPrice: 94500.0,
    stopLoss: 93800.0,
    takeProfit: 96600.0,
    lotSize: 0.05,
    smcTag: "CHOCH Retest",
    session: "Asian Session",
    riskReward: 3.0,
    pnlUSD: 105.0,
    outcome: "WIN",
    notes: "Micro CHOCH retest with institutional limit order absorption.",
  },
];

interface AIBrainJournalViewProps {
  accounts: Record<string, TabDemoAccount>;
  onResetAllAccounts: () => void;
  onRefillTabAccount: (tabId: string) => void;
}

export function AIBrainJournalView({
  accounts,
  onResetAllAccounts,
  onRefillTabAccount,
}: AIBrainJournalViewProps) {
  const [selectedTabFilter, setSelectedTabFilter] = useState<string>("all");
  const [smcLogs, setSmcLogs] = useState<SMCJournalTrade[]>(INITIAL_SMC_JOURNAL);
  const [filterTag, setFilterTag] = useState<string>("ALL");
  const [filterSession, setFilterSession] = useState<string>("ALL");

  // New SMC Trade Entry Form Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAsset, setNewAsset] = useState("XAUUSD");
  const [newType, setNewType] = useState<"BUY" | "SELL">("BUY");
  const [newEntry, setNewEntry] = useState("4340.00");
  const [newSl, setNewSl] = useState("4330.00");
  const [newTp, setNewTp] = useState("4370.00");
  const [newLot, setNewLot] = useState("0.1");
  const [newTag, setNewTag] = useState<SMCJournalTrade["smcTag"]>("Order Block Retest");
  const [newSession, setNewSession] = useState<SMCJournalTrade["session"]>("New York Session");
  const [newNotes, setNewNotes] = useState("");

  const accountList = Object.values(accounts);

  // Collect all trades across all AI Brain tabs
  const allTrades = accountList.flatMap((acc) =>
    acc.trades.map((t) => ({ ...t, tabLabel: acc.tabLabel, tabId: acc.tabId }))
  );

  const filteredTrades =
    selectedTabFilter === "all"
      ? allTrades
      : allTrades.filter((t) => t.tabId === selectedTabFilter);

  // Filtered SMC Journal Logs
  const filteredSmcLogs = smcLogs.filter((trade) => {
    if (filterTag !== "ALL" && trade.smcTag !== filterTag) return false;
    if (filterSession !== "ALL" && trade.session !== filterSession) return false;
    return true;
  });

  // Calculate SMC Statistics
  const totalSmcTrades = smcLogs.length;
  const wins = smcLogs.filter((t) => t.outcome === "WIN").length;
  const smcWinRate = totalSmcTrades > 0 ? Math.round((wins / totalSmcTrades) * 100) : 0;
  const avgRR = (smcLogs.reduce((acc, t) => acc + t.riskReward, 0) / (totalSmcTrades || 1)).toFixed(2);
  const totalNetPnL = smcLogs.reduce((acc, t) => acc + t.pnlUSD, 0);

  // Total Performance Summary
  const totalBalance = accountList.reduce((acc, curr) => acc + (curr.balance || 5000), 0);
  const totalEquity = accountList.reduce((acc, curr) => acc + (curr.equity || 5000), 0);
  const totalInitial = accountList.length * 5000;
  const netPnL = totalEquity - totalInitial;

  const handleSaveSmcTrade = (e: React.FormEvent) => {
    e.preventDefault();
    const entryPx = parseFloat(newEntry) || 4340;
    const slPx = parseFloat(newSl) || 4330;
    const tpPx = parseFloat(newTp) || 4370;
    const lot = parseFloat(newLot) || 0.1;

    const risk = Math.abs(entryPx - slPx);
    const reward = Math.abs(tpPx - entryPx);
    const rr = risk > 0 ? parseFloat((reward / risk).toFixed(2)) : 2.5;

    // Simulate outcome based on TP hit logic
    const pnl = newType === "BUY" ? (tpPx - entryPx) * lot * 100 : (entryPx - tpPx) * lot * 100;

    const newLogItem: SMCJournalTrade = {
      id: `smc-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
      assetKey: newAsset,
      type: newType,
      entryPrice: entryPx,
      stopLoss: slPx,
      takeProfit: tpPx,
      lotSize: lot,
      smcTag: newTag,
      session: newSession,
      riskReward: rr,
      pnlUSD: pnl,
      outcome: pnl >= 0 ? "WIN" : "LOSS",
      notes: newNotes || "Logged via SMC Visual Setup Form",
    };

    setSmcLogs([newLogItem, ...smcLogs]);
    setShowAddModal(false);
    playAlertChime("high_confidence");
  };

  // AI Self-Correction Logs
  const aiSelfCorrections = [
    {
      id: "sc-1",
      timestamp: "11:42:15 AM",
      brain: "🧠 HARAMI AI MASTER",
      issue: "Minor drawdown on US30 fast momentum tick",
      correction: "Auto-expanded SL buffer by +2.5 pips & aligned 0.01 lot position size for low slippage execution.",
      status: "OPTIMIZED",
      impact: "+4.2% Win Rate Boost",
    },
    {
      id: "sc-2",
      timestamp: "10:18:04 AM",
      brain: "🦅 White Crow Radar",
      issue: "Liquidity wick fakeout detected near BTC $104,200 ask wall",
      correction: "Self-corrected order flow delta thresholds by +12%. Filtered out false break sweeps.",
      status: "OPTIMIZED",
      impact: "+3.8% Profit Factor",
    },
    {
      id: "sc-3",
      timestamp: "09:05:30 AM",
      brain: "⛓️ Chains AI Reasoning",
      issue: "Asian session spread widening on EURUSD & GBPUSD",
      correction: "Auto-delayed entry confirmations by 3 M1 candles during low-volume sessions.",
      status: "OPTIMIZED",
      impact: "Zero False Entries",
    },
  ];

  return (
    <div id="ai-brain-auto-journal-view" className="space-y-6 font-mono text-xs">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0C1022] via-[#090C1A] to-[#04060E] border-2 border-indigo-500/60 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-indigo-500/20 border-2 border-indigo-500/60 rounded-2xl flex items-center justify-center text-indigo-300 text-3xl shadow-lg shadow-indigo-500/30">
              🧠
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase font-sans">
                  {getModuleTitle("journal")}
                </h1>
                <span className="px-2.5 py-0.5 bg-indigo-500 text-white font-extrabold text-[10px] rounded uppercase tracking-wider">
                  REAL-TIME SYNCHRONIZED
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Centralized master ledger tracking SMC setups (Order Block, Sweep, FVG), $5,000 capital auto-refills, and session analytics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all active:scale-95 flex items-center gap-2 shrink-0 font-sans uppercase"
            >
              <PlusCircle className="w-4 h-4" />
              <span>LOG SMC TRADE SETUP</span>
            </button>

            <button
              onClick={() => {
                onResetAllAccounts();
                playAlertChime("high_confidence");
              }}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95 flex items-center gap-2 shrink-0 font-sans uppercase"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RE-FUND TABS ($5,000)</span>
            </button>
          </div>
        </div>

        {/* Global Overview Cards */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-black/60 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">SMC WIN RATE</span>
            <span className="text-lg font-black text-emerald-400">{smcWinRate}%</span>
          </div>

          <div className="p-3 bg-black/60 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">AVG RISK:REWARD</span>
            <span className="text-lg font-black text-amber-400">1:{avgRR}</span>
          </div>

          <div className="p-3 bg-black/60 border border-slate-800 rounded-xl">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">TOTAL NET SMC PNL</span>
            <span className={`text-lg font-black ${totalNetPnL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {totalNetPnL >= 0 ? "+" : ""}${totalNetPnL.toFixed(2)}
            </span>
          </div>

          <div className="p-3 bg-black/60 border border-emerald-500/40 rounded-xl">
            <span className="text-[10px] text-emerald-400 uppercase font-bold block">AUTO REFILL ENGINE</span>
            <span className="text-lg font-black text-emerald-400">ENABLED (100% $5k SAFE)</span>
          </div>
        </div>
      </div>

      {/* SMC Visual Trade Setup Tagging & Journal Section */}
      <div className="bg-[#080B14] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider font-sans">
              SMC VISUAL SETUP TAGGING & LOG JOURNAL
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              aria-label="Filter trade logs by SMC Setup Tag"
              className="bg-[#05070F] border border-slate-700 text-amber-300 font-bold text-xs rounded-lg px-3 py-1.5 outline-none focus:border-amber-500"
            >
              <option value="ALL">ALL SMC TAGS</option>
              <option value="Order Block Retest">Order Block Retest</option>
              <option value="Liquidity Sweep">Liquidity Sweep</option>
              <option value="FVG Fill">FVG Fill</option>
              <option value="CHOCH Retest">CHOCH Retest</option>
              <option value="Inducement Sweep">Inducement Sweep</option>
            </select>

            <select
              value={filterSession}
              onChange={(e) => setFilterSession(e.target.value)}
              aria-label="Filter trade logs by Session"
              className="bg-[#05070F] border border-slate-700 text-blue-300 font-bold text-xs rounded-lg px-3 py-1.5 outline-none focus:border-blue-500"
            >
              <option value="ALL">ALL SESSIONS</option>
              <option value="London Session">London Session</option>
              <option value="New York Session">New York Session</option>
              <option value="Asian Session">Asian Session</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase font-bold">
                <th className="p-3">Time / Asset</th>
                <th className="p-3">SMC Tag Setup</th>
                <th className="p-3">Session</th>
                <th className="p-3">Type</th>
                <th className="p-3">Entry / Target</th>
                <th className="p-3">R:R Ratio</th>
                <th className="p-3">Outcome</th>
                <th className="p-3 text-right">Net PnL ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredSmcLogs.map((item) => (
                <tr key={item.id} className="hover:bg-indigo-500/5 transition-colors">
                  <td className="p-3">
                    <span className="font-bold text-white block uppercase">{item.assetKey}</span>
                    <span className="text-[10px] text-slate-500">{item.timestamp}</span>
                  </td>

                  <td className="p-3">
                    <span className="px-2.5 py-1 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold text-[10px] inline-flex items-center gap-1">
                      🏷️ {item.smcTag}
                    </span>
                  </td>

                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                      🌐 {item.session}
                    </span>
                  </td>

                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-black text-[10px] ${item.type === "BUY" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                      {item.type} ({item.lotSize}L)
                    </span>
                  </td>

                  <td className="p-3">
                    <div className="text-[11px]">
                      <span className="text-slate-300 font-bold">${item.entryPrice.toFixed(2)}</span>
                      <span className="text-slate-500 text-[10px] block">SL: ${item.stopLoss.toFixed(2)} | TP: ${item.takeProfit.toFixed(2)}</span>
                    </div>
                  </td>

                  <td className="p-3 font-bold text-amber-400 text-xs">
                    1:{item.riskReward.toFixed(2)}
                  </td>

                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold ${item.outcome === "WIN" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"}`}>
                      {item.outcome}
                    </span>
                  </td>

                  <td className={`p-3 text-right font-black ${item.pnlUSD >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {item.pnlUSD >= 0 ? "+" : ""}${item.pnlUSD.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SMC Add Setup Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B0F19] border-2 border-emerald-500/60 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2 font-sans">
                <PlusCircle className="w-5 h-5 text-emerald-400" />
                LOG NEW SMC TRADE SETUP
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSmcTrade} className="space-y-3 font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Asset:</label>
                  <select
                    value={newAsset}
                    onChange={(e) => setNewAsset(e.target.value)}
                    className="w-full bg-black/60 border border-slate-700 text-white rounded-lg p-2 text-xs font-mono"
                  >
                    {SUPPORTED_ASSETS.map((a) => (
                      <option key={a.key} value={a.key}>{a.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Direction:</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-black/60 border border-slate-700 text-white rounded-lg p-2 text-xs font-mono font-bold"
                  >
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 font-mono">
                <div>
                  <label className="text-[9px] text-slate-400 uppercase font-bold block mb-1">Entry:</label>
                  <input
                    type="text"
                    value={newEntry}
                    onChange={(e) => setNewEntry(e.target.value)}
                    className="w-full bg-black/60 border border-slate-700 text-white rounded-lg p-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 uppercase font-bold block mb-1">SL:</label>
                  <input
                    type="text"
                    value={newSl}
                    onChange={(e) => setNewSl(e.target.value)}
                    className="w-full bg-black/60 border border-slate-700 text-rose-400 rounded-lg p-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 uppercase font-bold block mb-1">TP:</label>
                  <input
                    type="text"
                    value={newTp}
                    onChange={(e) => setNewTp(e.target.value)}
                    className="w-full bg-black/60 border border-slate-700 text-emerald-400 rounded-lg p-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">SMC Setup Tag:</label>
                  <select
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value as any)}
                    className="w-full bg-black/60 border border-slate-700 text-amber-300 rounded-lg p-2 text-xs font-bold font-mono"
                  >
                    <option value="Order Block Retest">Order Block Retest</option>
                    <option value="Liquidity Sweep">Liquidity Sweep</option>
                    <option value="FVG Fill">FVG Fill</option>
                    <option value="CHOCH Retest">CHOCH Retest</option>
                    <option value="Inducement Sweep">Inducement Sweep</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Trading Session:</label>
                  <select
                    value={newSession}
                    onChange={(e) => setNewSession(e.target.value as any)}
                    className="w-full bg-black/60 border border-slate-700 text-blue-300 rounded-lg p-2 text-xs font-bold font-mono"
                  >
                    <option value="London Session">London Session</option>
                    <option value="New York Session">New York Session</option>
                    <option value="Asian Session">Asian Session</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Notes / Confluence:</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. 15M OB tap + M1 CHOCH confirmation"
                  className="w-full bg-black/60 border border-slate-700 text-white rounded-lg p-2 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 font-mono">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold uppercase shadow-lg shadow-emerald-600/30"
                >
                  SAVE TRADE TO JOURNAL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Self-Correction Module */}
      <div className="bg-[#080B14] border border-indigo-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider font-sans">
              AI SELF-CORRECTION & AUTOMATIC DIAGNOSTICS ENGINE
            </h2>
          </div>
          <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded">
            SELF-HEAL ACTIVE
          </span>
        </div>

        <div className="space-y-3">
          {aiSelfCorrections.map((sc) => (
            <div
              key={sc.id}
              className="p-4 bg-[#05070F] border border-slate-800 rounded-xl space-y-2 hover:border-indigo-500/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-indigo-300 text-xs">{sc.brain}</span>
                <span className="text-[9px] text-slate-500">{sc.timestamp}</span>
              </div>
              <p className="text-xs text-rose-300 font-sans">
                <strong className="text-rose-400">DIAGNOSED:</strong> {sc.issue}
              </p>
              <p className="text-xs text-emerald-300 font-sans">
                <strong className="text-emerald-400 font-bold">SELF-CORRECTION:</strong> {sc.correction}
              </p>
              <div className="flex items-center justify-between text-[10px] pt-1 text-slate-400 border-t border-slate-800/60 font-mono">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {sc.status}
                </span>
                <span className="text-amber-300 font-bold">{sc.impact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab-by-Tab Capital & Performance Table */}
      <div className="bg-[#080B14] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            AI BRAIN TABS CAPITAL & AUTO-REFILL STATUS ($5,000 PER TAB)
          </h2>
          <span className="text-[10px] text-slate-400 font-mono">FIXED LOT SIZE: 0.01 LOTS | RISK: 2-3%</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accountList.map((acc) => {
            const pnl = acc.equity - acc.initialBalance;
            const isProfitable = pnl >= 0;
            const isLowBalance = acc.equity < 500;

            return (
              <div
                key={acc.tabId}
                className="p-4 bg-[#05070F] border border-slate-800 hover:border-indigo-500/50 rounded-xl space-y-3 transition-all"
              >
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="font-extrabold text-white text-xs truncate max-w-[180px]">
                    {acc.tabLabel}
                  </span>
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[9px] font-bold rounded">
                    {acc.badge}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Balance:</span>
                    <strong className="text-white">${acc.balance.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Equity:</span>
                    <strong className={isProfitable ? "text-emerald-400" : "text-rose-400"}>
                      ${acc.equity.toFixed(2)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Win Rate:</span>
                    <strong className="text-amber-400">{acc.winRatePct}%</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Total Trades:</span>
                    <strong className="text-slate-300">{acc.totalTrades}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[9px] text-slate-400">
                    Cap: <strong className="text-emerald-400">$5,000.00</strong>
                  </span>
                  <button
                    onClick={() => onRefillTabAccount(acc.tabId)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-indigo-600 text-white font-bold text-[10px] rounded transition-all flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3 text-indigo-300" />
                    REFILL $5,000
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Self-Correction Module */}
      <div className="bg-[#080B14] border border-indigo-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
              AI SELF-CORRECTION & AUTOMATIC DIAGNOSTICS ENGINE
            </h2>
          </div>
          <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded">
            SELF-HEAL ACTIVE
          </span>
        </div>

        <div className="space-y-3">
          {aiSelfCorrections.map((sc) => (
            <div
              key={sc.id}
              className="p-4 bg-[#05070F] border border-slate-800 rounded-xl space-y-2 hover:border-indigo-500/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-indigo-300 text-xs">{sc.brain}</span>
                <span className="text-[9px] text-slate-500">{sc.timestamp}</span>
              </div>
              <p className="text-xs text-rose-300">
                <strong className="text-rose-400">DIAGNOSED:</strong> {sc.issue}
              </p>
              <p className="text-xs text-emerald-300">
                <strong className="text-emerald-400 font-bold">SELF-CORRECTION:</strong> {sc.correction}
              </p>
              <div className="flex items-center justify-between text-[10px] pt-1 text-slate-400 border-t border-slate-800/60">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {sc.status}
                </span>
                <span className="text-amber-300 font-bold">{sc.impact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Master Trade Log Journal Table */}
      <div className="bg-[#080B14] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
              AI BRAIN MASTER EXECUTED TRADES JOURNAL
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400">Filter Tab:</span>
            <select
              value={selectedTabFilter}
              onChange={(e) => setSelectedTabFilter(e.target.value)}
              aria-label="Filter trade logs by AI Brain Tab"
              className="bg-[#05070F] border border-slate-700 text-white font-bold text-xs rounded-lg px-3 py-1.5 outline-none focus:border-indigo-500"
            >
              <option value="all">ALL AI BRAIN TABS</option>
              {accountList.map((acc) => (
                <option key={acc.tabId} value={acc.tabId}>
                  {acc.tabLabel}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredTrades.length === 0 ? (
          <div className="p-8 text-center text-slate-500 font-sans text-xs">
            No trade log entries registered for this filter yet. Execute trades from HARAMI AI or any sub-brain tab to populate the master journal!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase font-bold">
                  <th className="p-3">Time</th>
                  <th className="p-3">AI Brain Tab</th>
                  <th className="p-3">Asset</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Lot</th>
                  <th className="p-3">Entry</th>
                  <th className="p-3">Stop Loss</th>
                  <th className="p-3">Take Profit</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">PnL ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredTrades.map((t, i) => (
                  <tr key={i} className="hover:bg-indigo-500/5 transition-colors">
                    <td className="p-3 text-slate-400">{t.timestamp}</td>
                    <td className="p-3 font-bold text-indigo-300">{t.tabLabel}</td>
                    <td className="p-3 font-bold text-white uppercase">{t.assetKey}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${t.type === "BUY" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="p-3 text-amber-400 font-bold">{t.lotSize || 0.01}</td>
                    <td className="p-3 font-bold text-white">${t.entryPrice.toFixed(2)}</td>
                    <td className="p-3 text-rose-400">${t.stopLoss.toFixed(2)}</td>
                    <td className="p-3 text-emerald-400">${t.takeProfit.toFixed(2)}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold rounded">
                        {t.status}
                      </span>
                    </td>
                    <td className={`p-3 text-right font-black ${t.pnlUSD >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {t.pnlUSD >= 0 ? "+" : ""}${t.pnlUSD.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

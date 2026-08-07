import React, { useState } from "react";
import {
  Layers,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Zap,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { TradeLogEntry } from "../types";

interface TradeExecutionLogProps {
  trades: TradeLogEntry[];
  onCloseTrade?: (tradeId: string) => void;
  onClearLog?: () => void;
  onOpenRiskCopilot?: (assetKey: string, type: "BUY" | "SELL") => void;
}

export const TradeExecutionLog: React.FC<TradeExecutionLogProps> = ({
  trades,
  onCloseTrade,
  onClearLog,
  onOpenRiskCopilot,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterSource, setFilterSource] = useState<string>("ALL");

  const isTop1Trade = (t: TradeLogEntry) => {
    const src = (t.signalSource || "").toLowerCase();
    return (
      src.includes("top 1") ||
      src.includes("gmc gold") ||
      src.includes("apex bank-zone") ||
      src.includes("gmcgold") ||
      src.includes("zone card")
    );
  };

  const top1TradesCount = trades.filter(isTop1Trade).length;

  const filteredTrades = trades.filter((t) => {
    const matchesSearch =
      t.assetKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.signalSource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.status.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === "ALL" || t.status === filterStatus;
    const matchesType = filterType === "ALL" || t.type === filterType;
    const matchesSource =
      filterSource === "ALL" || (filterSource === "TOP1" && isTop1Trade(t));

    return matchesSearch && matchesStatus && matchesType && matchesSource;
  });

  const getStatusBadge = (status: TradeLogEntry["status"]) => {
    switch (status) {
      case "IN_PROGRESS":
        return (
          <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-bold rounded flex items-center gap-1">
            <Clock className="w-3 h-3 animate-spin text-blue-400" />
            IN PROGRESS
          </span>
        );
      case "TARGET_1_HIT":
        return (
          <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            TP1 HIT (+PROFIT)
          </span>
        );
      case "TARGET_2_HIT":
        return (
          <span className="px-2.5 py-0.5 bg-emerald-500/15 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold rounded flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-300" />
            TP2 FULL TARGET
          </span>
        );
      case "CLOSED_PROFIT":
        return (
          <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            CLOSED (PROFIT)
          </span>
        );
      case "CLOSED_LOSS":
        return (
          <span className="px-2.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-bold rounded flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            STOP LOSS HIT
          </span>
        );
      case "AI_GUARD_EXIT":
        return (
          <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold rounded flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            AI GUARD AUTO-EXIT
          </span>
        );
      default:
        return null;
    }
  };

  const totalPnL = trades.reduce((acc, t) => acc + t.pnlUSD, 0);

  return (
    <div
      id="trade-execution-log-view"
      className="bg-[#080B14] border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 font-mono text-slate-200 max-w-7xl mx-auto"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600/10 border border-blue-500/30 rounded-xl flex items-center justify-center text-blue-400 font-bold text-xl shadow-lg shadow-blue-600/10 shrink-0">
            📜
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                LIVE EXECUTION JOURNAL
              </span>
              <span className="text-xs text-slate-400 font-sans hidden md:inline">
                Real-Time AI-Triggered Entry & Exit History
              </span>
            </div>
            <h2 className="text-lg font-black text-white tracking-tight uppercase mt-0.5">
              TRADE EXECUTION LOG
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2">
            <span className="text-slate-400">LOGGED PNL:</span>
            <span
              className={`font-black ${
                totalPnL >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
            </span>
          </div>

          {onClearLog && (
            <button
              onClick={onClearLog}
              className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-xl text-xs transition-colors"
              title="Clear Execution Log"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-[#05070E] p-3 rounded-xl border border-slate-800/80 text-xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by asset, signal source, or status..."
            className="w-full bg-black/60 border border-slate-800 text-slate-200 pl-9 pr-3 py-2 rounded-lg font-mono focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Quick TOP 1 AI Brain Filter Button & Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* TOP 1 Quick Toggle Button */}
          <button
            onClick={() => setFilterSource(filterSource === "TOP1" ? "ALL" : "TOP1")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 border shadow-sm ${
              filterSource === "TOP1"
                ? "bg-amber-400/20 text-amber-300 border-amber-400/80 shadow-[0_0_12px_rgba(234,179,8,0.4)] animate-pulse"
                : "bg-black/50 text-slate-300 border-slate-800 hover:text-amber-300 hover:border-amber-400/50"
            }`}
            title="Filter specifically for 🥇 TOP 1 AI Brain signals that match Telegram broadcasts"
          >
            <span>🥇 TOP 1 AI BRAIN ONLY</span>
            <span className="px-1.5 py-0.2 bg-amber-400/30 text-amber-200 text-[10px] rounded-full font-extrabold ml-0.5">
              {top1TradesCount}
            </span>
          </button>

          {/* Source Dropdown */}
          <div className="flex items-center gap-1 bg-black/50 border border-slate-800 px-2.5 py-1.5 rounded-lg text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] text-slate-500 uppercase font-bold">SOURCE:</span>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">ALL SOURCES</option>
              <option value="TOP1" className="bg-slate-900 text-amber-300 font-bold">🥇 TOP 1 AI BRAIN ONLY</option>
            </select>
          </div>

          {/* Type Dropdown */}
          <div className="flex items-center gap-1 bg-black/50 border border-slate-800 px-2.5 py-1.5 rounded-lg text-slate-300">
            <span className="text-[10px] text-slate-500 uppercase font-bold">TYPE:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">ALL TYPES</option>
              <option value="BUY" className="bg-slate-900 text-emerald-400">BUY ONLY</option>
              <option value="SELL" className="bg-slate-900 text-rose-400">SELL ONLY</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-1 bg-black/50 border border-slate-800 px-2.5 py-1.5 rounded-lg text-slate-300">
            <span className="text-[10px] text-slate-500 uppercase font-bold">STATUS:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">ALL STATUSES</option>
              <option value="IN_PROGRESS" className="bg-slate-900 text-blue-400">IN PROGRESS</option>
              <option value="TARGET_1_HIT" className="bg-slate-900 text-emerald-400">TP1 HIT</option>
              <option value="TARGET_2_HIT" className="bg-slate-900 text-emerald-300">TP2 HIT</option>
              <option value="CLOSED_PROFIT" className="bg-slate-900 text-emerald-400">CLOSED PROFIT</option>
              <option value="CLOSED_LOSS" className="bg-slate-900 text-rose-400">STOP LOSS</option>
              <option value="AI_GUARD_EXIT" className="bg-slate-900 text-amber-400">AI GUARD EXIT</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trades Table List */}
      <div className="overflow-x-auto border border-slate-800/80 rounded-xl bg-[#05070E]">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-[#0A0D18] text-slate-400 text-[11px] uppercase border-b border-slate-800">
            <tr>
              <th className="py-3 px-4 font-bold">TIMESTAMP / ASSET</th>
              <th className="py-3 px-4 font-bold">TYPE & LOT</th>
              <th className="py-3 px-4 font-bold">ENTRY PRICE</th>
              <th className="py-3 px-4 font-bold">STOP LOSS / TP</th>
              <th className="py-3 px-4 font-bold">STATUS</th>
              <th className="py-3 px-4 font-bold text-right">LIVE PNL ($)</th>
              <th className="py-3 px-4 font-bold text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filteredTrades.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                  No execution logs found matching criteria.
                </td>
              </tr>
            ) : (
              filteredTrades.map((trade) => {
                const isBuy = trade.type === "BUY";
                const isPosPnL = trade.pnlUSD >= 0;
                const isTop1 = isTop1Trade(trade);

                return (
                  <tr
                    key={trade.id}
                    className={`transition-colors group ${
                      isTop1
                        ? "bg-amber-500/10 hover:bg-amber-500/15 border-l-4 border-l-amber-400"
                        : "hover:bg-slate-900/40"
                    }`}
                  >
                    {/* Timestamp & Asset */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isBuy ? "bg-emerald-400" : "bg-rose-400"
                          }`}
                        />
                        <div>
                          <div className="font-bold text-white uppercase flex items-center gap-1.5">
                            <span>{trade.assetKey}</span>
                            {isTop1 && (
                              <span className="px-1.5 py-0.2 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded text-[9px] font-black uppercase tracking-wider">
                                🥇 TOP 1
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500">{trade.timestamp}</div>
                        </div>
                      </div>
                    </td>

                    {/* Type & Lot */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                            isBuy
                              ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                              : "text-rose-400 bg-rose-500/10 border-rose-500/30"
                          }`}
                        >
                          {trade.type}
                        </span>
                        <span className="text-slate-300 font-bold">{trade.lotSize} LOTS</span>
                      </div>
                      <div className="flex flex-col gap-0.5 mt-0.5">
                        <span className="text-[10px] text-slate-400 font-semibold">{trade.signalSource}</span>
                        {isTop1 && (
                          <span className="text-[9px] text-amber-300/90 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            TELEGRAM MATCH VERIFIED
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Entry Price */}
                    <td className="py-3 px-4 font-bold text-white">
                      ${trade.entryPrice.toLocaleString()}
                    </td>

                    {/* SL & TP */}
                    <td className="py-3 px-4 text-[11px]">
                      <div>
                        SL: <span className="text-rose-400">${trade.stopLoss.toLocaleString()}</span>
                      </div>
                      <div>
                        TP: <span className="text-emerald-400">${trade.takeProfit.toLocaleString()}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">{getStatusBadge(trade.status)}</td>

                    {/* PnL */}
                    <td className="py-3 px-4 text-right">
                      <div
                        className={`font-black text-sm flex items-center justify-end gap-1 ${
                          isPosPnL ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {isPosPnL ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        <span>{isPosPnL ? "+" : ""}${trade.pnlUSD.toFixed(2)}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {isPosPnL ? "+" : ""}{trade.pnlPips} Pips
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-center">
                      {trade.status === "IN_PROGRESS" ? (
                        <button
                          onClick={() => onCloseTrade && onCloseTrade(trade.id)}
                          className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[10px] font-bold rounded-lg transition-all"
                        >
                          CLOSE POS
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500">CLOSED</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

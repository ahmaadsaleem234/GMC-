import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Flame,
  Zap,
  Radio,
  FileText,
  Activity,
  Layers,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  X,
  ExternalLink,
} from "lucide-react";
import { LockedWarRoomSetup } from "../../services/warRoomEngine";
import { AuthoritativeSetup, SetupStatus, LifecycleEvent, SetupProofSnapshot } from "../../types/setupLifecycle";

interface SetupLifecycleHistoryProps {
  onSelectSetupForTelemetry?: (setup: LockedWarRoomSetup) => void;
}

export const SetupLifecycleHistorySection: React.FC<SetupLifecycleHistoryProps> = ({
  onSelectSetupForTelemetry,
}) => {
  const [setups, setSetups] = useState<AuthoritativeSetup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [directionFilter, setDirectionFilter] = useState<string>("ALL");
  const [selectedProofSetupId, setSelectedProofSetupId] = useState<string | null>(null);
  const [proofData, setProofData] = useState<{
    setup: AuthoritativeSetup;
    events: LifecycleEvent[];
    snapshots: SetupProofSnapshot[];
    immutableAudit: any;
  } | null>(null);
  const [proofLoading, setProofLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeProofTab, setActiveProofTab] = useState<"SUMMARY" | "TIMELINE" | "SNAPSHOTS" | "AUTOPSY" | "RAW_AUDIT">("SUMMARY");

  // Fetch setups list
  const fetchSetups = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (directionFilter !== "ALL") params.append("direction", directionFilter);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/warroom/setups?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.ok && Array.isArray(data.setups)) {
          setSetups(data.setups);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch setups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSetups();
    const interval = setInterval(fetchSetups, 5000);
    return () => clearInterval(interval);
  }, [statusFilter, directionFilter, searchQuery]);

  // Fetch proof when modal opened
  const handleOpenProof = async (setupId: string) => {
    setSelectedProofSetupId(setupId);
    setProofLoading(true);
    try {
      const res = await fetch(`/api/warroom/setups/${encodeURIComponent(setupId)}/proof`);
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.proof) {
          setProofData(data.proof);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch proof data:", err);
    } finally {
      setProofLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: SetupStatus | string, finalOutcome?: string) => {
    if (finalOutcome?.startsWith("WIN")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {finalOutcome.replace("_", " ")}
        </span>
      );
    }
    if (finalOutcome === "LOSS_SL") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
          <XCircle className="w-3.5 h-3.5" />
          STOP HIT
        </span>
      );
    }
    if (finalOutcome === "BREAKEVEN") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30">
          <Shield className="w-3.5 h-3.5" />
          BREAK-EVEN
        </span>
      );
    }

    switch (status) {
      case "WAITING":
      case "WAITING_ENTRY":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            WAITING ENTRY
          </span>
        );
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
            <Radio className="w-3.5 h-3.5" />
            LIVE ACTIVE
          </span>
        );
      case "TP1_HIT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/10 text-teal-400 border border-teal-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            TP1 HIT (SL BE)
          </span>
        );
      case "TP2_HIT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            TP2 HIT
          </span>
        );
      case "TP3_HIT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            TP3 HIT
          </span>
        );
      case "TP4_HIT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Flame className="w-3.5 h-3.5" />
            TP4 SMASHED
          </span>
        );
      case "SL_HIT":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            SL HIT
          </span>
        );
      case "EXPIRED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-500/10 text-zinc-400 border border-zinc-500/30">
            <Clock className="w-3.5 h-3.5" />
            EXPIRED
          </span>
        );
      case "CANCELLED":
      case "CANCELLED_BEFORE_ENTRY":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            CANCELLED
          </span>
        );
      case "INVALIDATED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <XCircle className="w-3.5 h-3.5" />
            INVALIDATED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
            {status}
          </span>
        );
    }
  };

  const statusChips = [
    { label: "All Setups", value: "ALL" },
    { label: "Active Live", value: "ACTIVE" },
    { label: "Waiting", value: "WAITING" },
    { label: "Wins", value: "WON" },
    { label: "Losses", value: "LOST" },
    { label: "Break-Even", value: "BREAKEVEN" },
    { label: "Expired", value: "EXPIRED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  return (
    <div id="setup-lifecycle-history-section" className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white tracking-wide">
                Authoritative Setup Lifecycle & Immutable History
              </h2>
              <span className="px-2 py-0.5 text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                SINGLE SOURCE OF TRUTH
              </span>
            </div>
            <p className="text-sm text-zinc-400">
              Permanent append-only repository. Website, Telegram alerts, and performance metrics synchronize from the same immutable Setup ID.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right px-4 py-2 bg-zinc-950/80 border border-zinc-800 rounded-lg">
              <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Total Recorded</div>
              <div className="text-xl font-black text-amber-400 font-mono">{setups.length}</div>
            </div>
            <div className="text-right px-4 py-2 bg-zinc-950/80 border border-zinc-800 rounded-lg">
              <div className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Live Active</div>
              <div className="text-xl font-black text-emerald-400 font-mono">
                {setups.filter((s) => s.status === "ACTIVE" || s.status.includes("TP")).length}
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search Strip */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {statusChips.map((chip) => (
              <button
                key={chip.value}
                id={`filter-chip-${chip.value.toLowerCase()}`}
                onClick={() => setStatusFilter(chip.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  statusFilter === chip.value
                    ? "bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20"
                    : "bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/50"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Direction & Search */}
          <div className="flex items-center gap-2">
            <select
              id="direction-filter-select"
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Direction: All</option>
              <option value="BUY">BUY Only</option>
              <option value="SELL">SELL Only</option>
            </select>

            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                id="setup-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Setup ID or Note..."
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-amber-500 placeholder-zinc-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Setups Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase font-mono tracking-wider">
                <th className="py-3.5 px-4">Setup ID & Symbol</th>
                <th className="py-3.5 px-4">Direction & Grade</th>
                <th className="py-3.5 px-4">Locked Levels</th>
                <th className="py-3.5 px-4">Target Matrix</th>
                <th className="py-3.5 px-4">Performance (R / Pts)</th>
                <th className="py-3.5 px-4">Status & Health</th>
                <th className="py-3.5 px-4">Timestamp (UTC)</th>
                <th className="py-3.5 px-4 text-right">Proof & Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading && setups.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500 font-mono">
                    <Activity className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                    Synchronizing authoritative lifecycle records...
                  </td>
                </tr>
              ) : setups.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500">
                    No setups found matching current filter criteria.
                  </td>
                </tr>
              ) : (
                setups.map((s) => {
                  const isBuy = s.direction === "BUY";
                  const pnlR = s.finalPnlR ?? s.currentFloatingR ?? 0;
                  const isPos = pnlR > 0;
                  const isNeg = pnlR < 0;

                  return (
                    <tr
                      key={s.setupId}
                      id={`setup-row-${s.setupId}`}
                      className="hover:bg-zinc-800/40 transition-colors group"
                    >
                      {/* Setup ID & Symbol */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-amber-400 text-xs tracking-tight">
                            {s.setupId}
                          </span>
                          <button
                            id={`copy-id-${s.setupId}`}
                            onClick={() => copyToClipboard(s.setupId, s.setupId)}
                            title="Copy authoritative Setup ID"
                            className="text-zinc-500 hover:text-zinc-300 p-0.5 rounded transition-colors"
                          >
                            {copiedId === s.setupId ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <div className="text-[11px] text-zinc-400 font-medium mt-0.5">{s.symbol}</div>
                      </td>

                      {/* Direction & Grade */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-black text-xs ${
                              isBuy
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {isBuy ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                            {s.direction}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold text-[10px] border border-zinc-700">
                            {s.grade || "A+"}
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">
                          Conf: <span className="text-zinc-300 font-mono">{s.confidence}%</span>
                        </div>
                      </td>

                      {/* Locked Levels */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div>
                          <span className="text-zinc-500">Entry:</span>{" "}
                          <span className="text-amber-300 font-bold">${s.bestEntry.toFixed(2)}</span>
                        </div>
                        <div className="mt-0.5">
                          <span className="text-zinc-500">SL:</span>{" "}
                          <span className="text-rose-400 font-bold">${s.stopLoss.toFixed(2)}</span>
                        </div>
                      </td>

                      {/* Targets */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className={s.targetsHit?.tp1 ? "text-emerald-400 font-bold" : "text-zinc-400"}>
                            TP1: ${s.tp1.toFixed(2)}
                          </span>
                          <span className={s.targetsHit?.tp2 ? "text-emerald-400 font-bold" : "text-zinc-400"}>
                            TP2: ${s.tp2.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-zinc-500">
                          <span className={s.targetsHit?.tp3 ? "text-emerald-400 font-bold" : "text-zinc-400"}>
                            TP3: ${s.tp3.toFixed(2)}
                          </span>
                          <span className={s.targetsHit?.tp4 ? "text-emerald-400 font-bold" : "text-zinc-400"}>
                            TP4: ${s.tp4.toFixed(2)}
                          </span>
                        </div>
                      </td>

                      {/* Performance */}
                      <td className="py-3 px-4 font-mono">
                        <div
                          className={`font-black text-xs ${
                            isPos ? "text-emerald-400" : isNeg ? "text-rose-400" : "text-zinc-400"
                          }`}
                        >
                          {isPos ? `+${pnlR.toFixed(2)} R` : `${pnlR.toFixed(2)} R`}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">
                          MFE: <span className="text-emerald-400 font-bold">+{s.mfePoints?.toFixed(1) || 0} pts</span> | MAE:{" "}
                          <span className="text-rose-400">-{s.maePoints?.toFixed(1) || 0} pts</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <div>{getStatusBadge(s.status, s.finalOutcome)}</div>
                        <div className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          Health: {s.healthScore || 95}%
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">
                        <div>{s.createdAtUtc ? s.createdAtUtc.split(" ")[0] : "2026-08-16"}</div>
                        <div className="text-[10px] text-zinc-500">
                          {s.createdAtUtc ? s.createdAtUtc.split(" ")[1] : "00:00:00"} UTC
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          id={`inspect-proof-btn-${s.setupId}`}
                          onClick={() => handleOpenProof(s.setupId)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-200 text-xs font-bold rounded-lg transition-all border border-zinc-700/80 shadow"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Proof
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SETUP PROOF AUDIT MODAL */}
      {selectedProofSetupId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            id="setup-proof-modal"
            className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Modal Header */}
            <div className="p-5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-white font-mono">{selectedProofSetupId}</h3>
                    <span className="px-2 py-0.5 text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                      IMMUTABLE PROOF
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Cryptographically & mathematically auditable execution log and snapshot proof.
                  </p>
                </div>
              </div>

              <button
                id="close-proof-modal-btn"
                onClick={() => {
                  setSelectedProofSetupId(null);
                  setProofData(null);
                }}
                className="p-2 text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Sub-tabs */}
            <div className="px-5 py-2.5 bg-zinc-950/60 border-b border-zinc-800/80 flex items-center gap-2 overflow-x-auto">
              {[
                { id: "SUMMARY", label: "Executive Summary" },
                { id: "TIMELINE", label: `Lifecycle Timeline (${proofData?.events.length || 0})` },
                { id: "SNAPSHOTS", label: `Chart Proof (${proofData?.snapshots.length || 0})` },
                { id: "AUTOPSY", label: "Post-Trade Autopsy" },
                { id: "RAW_AUDIT", label: "Raw JSON Audit" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  id={`proof-tab-${tab.id.toLowerCase()}`}
                  onClick={() => setActiveProofTab(tab.id as any)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
                    activeProofTab === tab.id
                      ? "bg-amber-500 text-zinc-950"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {proofLoading ? (
                <div className="py-16 text-center text-zinc-500 font-mono">
                  <Activity className="w-8 h-8 animate-spin mx-auto mb-3 text-amber-400" />
                  Extracting immutable proof records from disk storage...
                </div>
              ) : !proofData ? (
                <div className="py-16 text-center text-zinc-500">No proof records located for this Setup ID.</div>
              ) : (
                <>
                  {/* TAB 1: EXECUTIVE SUMMARY */}
                  {activeProofTab === "SUMMARY" && (
                    <div className="space-y-5">
                      {/* Top Metric Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
                          <div className="text-[11px] text-zinc-500 font-medium">LOCKED BEST ENTRY</div>
                          <div className="text-base font-mono font-black text-amber-400 mt-0.5">
                            ${proofData.setup.bestEntry.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-zinc-500 mt-1">
                            Zone: ${proofData.setup.entryZone[0].toFixed(2)} - ${proofData.setup.entryZone[1].toFixed(2)}
                          </div>
                        </div>

                        <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
                          <div className="text-[11px] text-zinc-500 font-medium">STOP LOSS</div>
                          <div className="text-base font-mono font-black text-rose-400 mt-0.5">
                            ${proofData.setup.stopLoss.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-zinc-500 mt-1">Risk Budget: 1.0 R</div>
                        </div>

                        <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
                          <div className="text-[11px] text-zinc-500 font-medium">FINAL OUTCOME</div>
                          <div className="text-base font-mono font-black text-emerald-400 mt-0.5">
                            {proofData.setup.finalOutcome || proofData.setup.status}
                          </div>
                          <div className="text-[10px] text-zinc-500 mt-1">
                            Realized R: {proofData.setup.finalPnlR || 0} R
                          </div>
                        </div>

                        <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
                          <div className="text-[11px] text-zinc-500 font-medium">MAX FAVORABLE (MFE)</div>
                          <div className="text-base font-mono font-black text-teal-400 mt-0.5">
                            +{proofData.setup.mfePoints?.toFixed(2) || 0} pts
                          </div>
                          <div className="text-[10px] text-zinc-500 mt-1">
                            MAE: -{proofData.setup.maePoints?.toFixed(2) || 0} pts
                          </div>
                        </div>
                      </div>

                      {/* Locked Target Grid */}
                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
                        <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
                          <span>Institutional Profit Delivery Matrix</span>
                          <span className="text-amber-400 font-mono">R:R {proofData.setup.riskToReward}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-center font-mono">
                          <div
                            className={`p-2.5 rounded-lg border ${
                              proofData.setup.targetsHit?.tp1
                                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                                : "bg-zinc-900 border-zinc-800 text-zinc-400"
                            }`}
                          >
                            <div className="text-[10px] font-bold">TP1 (BE Shift)</div>
                            <div className="text-xs font-bold mt-1">${proofData.setup.tp1.toFixed(2)}</div>
                          </div>

                          <div
                            className={`p-2.5 rounded-lg border ${
                              proofData.setup.targetsHit?.tp2
                                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                                : "bg-zinc-900 border-zinc-800 text-zinc-400"
                            }`}
                          >
                            <div className="text-[10px] font-bold">TP2</div>
                            <div className="text-xs font-bold mt-1">${proofData.setup.tp2.toFixed(2)}</div>
                          </div>

                          <div
                            className={`p-2.5 rounded-lg border ${
                              proofData.setup.targetsHit?.tp3
                                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                                : "bg-zinc-900 border-zinc-800 text-zinc-400"
                            }`}
                          >
                            <div className="text-[10px] font-bold">TP3</div>
                            <div className="text-xs font-bold mt-1">${proofData.setup.tp3.toFixed(2)}</div>
                          </div>

                          <div
                            className={`p-2.5 rounded-lg border ${
                              proofData.setup.targetsHit?.tp4
                                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                                : "bg-zinc-900 border-zinc-800 text-zinc-400"
                            }`}
                          >
                            <div className="text-[10px] font-bold">TP4 (Full)</div>
                            <div className="text-xs font-bold mt-1">${proofData.setup.tp4.toFixed(2)}</div>
                          </div>
                        </div>
                      </div>

                      {/* Multi-Timeframe Institutional Confluences */}
                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2.5">
                        <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                          Locked Multi-Timeframe Alignment
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 bg-zinc-900/60 rounded-lg border border-zinc-800">
                            <span className="text-zinc-500 font-bold">4H Macro Bias:</span>{" "}
                            <span className="text-zinc-200 font-medium">{proofData.setup.h4Bias}</span>
                          </div>
                          <div className="p-2.5 bg-zinc-900/60 rounded-lg border border-zinc-800">
                            <span className="text-zinc-500 font-bold">1H Directional Flow:</span>{" "}
                            <span className="text-zinc-200 font-medium">{proofData.setup.h1Bias}</span>
                          </div>
                          <div className="p-2.5 bg-zinc-900/60 rounded-lg border border-zinc-800">
                            <span className="text-zinc-500 font-bold">15M Institutional Zone:</span>{" "}
                            <span className="text-zinc-200 font-medium">{proofData.setup.m15Setup}</span>
                          </div>
                          <div className="p-2.5 bg-zinc-900/60 rounded-lg border border-zinc-800">
                            <span className="text-zinc-500 font-bold">5M SMC Confirmation:</span>{" "}
                            <span className="text-zinc-200 font-medium">{proofData.setup.m5Confirmation}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: LIFECYCLE TIMELINE */}
                  {activeProofTab === "TIMELINE" && (
                    <div className="space-y-4">
                      {proofData.events.length === 0 ? (
                        <div className="py-8 text-center text-zinc-500">No events logged yet.</div>
                      ) : (
                        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
                          {proofData.events.map((evt) => (
                            <div key={evt.id} className="relative group">
                              <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-amber-400 ring-4 ring-zinc-900" />
                              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-mono font-bold text-amber-400">{evt.eventType}</span>
                                  <span className="font-mono text-zinc-500">{evt.timestampFormatted}</span>
                                </div>
                                <div className="text-sm font-semibold text-zinc-200">{evt.eventNote}</div>
                                <div className="text-xs font-mono text-zinc-400">
                                  Recorded Price: <span className="text-white font-bold">${evt.price.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: CHART SNAPSHOTS */}
                  {activeProofTab === "SNAPSHOTS" && (
                    <div className="space-y-4">
                      {proofData.snapshots.length === 0 ? (
                        <div className="py-8 text-center text-zinc-500">No chart snapshots generated yet.</div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {proofData.snapshots.map((snap) => (
                            <div
                              key={snap.id}
                              className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col shadow-lg"
                            >
                              <div className="p-3 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between text-xs">
                                <span className="font-mono font-bold text-amber-400">{snap.eventType}</span>
                                <span className="font-mono text-zinc-500">{snap.timestampFormatted}</span>
                              </div>
                              {snap.chartSnapshotBase64 ? (
                                <div className="p-2 bg-black flex items-center justify-center">
                                  <img
                                    src={snap.chartSnapshotBase64}
                                    alt={`Proof for ${snap.eventType}`}
                                    className="w-full h-auto rounded object-contain"
                                  />
                                </div>
                              ) : (
                                <div className="p-8 text-center text-zinc-600 font-mono text-xs">
                                  Proof Snapshot Stored (Image Render In Background)
                                </div>
                              )}
                              <div className="p-3 text-xs text-zinc-300 border-t border-zinc-800 bg-zinc-950">
                                {snap.eventNote}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: POST-TRADE AUTOPSY */}
                  {activeProofTab === "AUTOPSY" && (
                    <div className="space-y-4">
                      {proofData.setup.autopsySummary ? (
                        <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800 space-y-4">
                          <div>
                            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Root Cause Summary</div>
                            <div className="text-sm font-semibold text-zinc-200 mt-1">
                              {proofData.setup.autopsySummary.rootCause}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-zinc-900/60 p-3.5 rounded-lg border border-zinc-800">
                              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
                                What Worked
                              </div>
                              <ul className="space-y-1 text-xs text-zinc-300 list-disc list-inside">
                                {proofData.setup.autopsySummary.whatWorked?.map((w: string, i: number) => (
                                  <li key={i}>{w}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="bg-zinc-900/60 p-3.5 rounded-lg border border-zinc-800">
                              <div className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">
                                Friction / Failure Points
                              </div>
                              <ul className="space-y-1 text-xs text-zinc-300 list-disc list-inside">
                                {proofData.setup.autopsySummary.whatFailed?.map((f: string, i: number) => (
                                  <li key={i}>{f}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="p-3.5 bg-zinc-900/80 rounded-lg border border-zinc-800">
                            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Strategy Lesson</div>
                            <div className="text-xs text-zinc-200 mt-1 font-medium">
                              {proofData.setup.autopsySummary.lessons}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-8 text-center text-zinc-500">
                          Trade is currently live. Post-trade autopsy will automatically generate upon closure.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 5: RAW JSON AUDIT */}
                  {activeProofTab === "RAW_AUDIT" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-400 font-mono">Immutable Audit Payload</span>
                        <button
                          onClick={() => copyToClipboard(JSON.stringify(proofData.immutableAudit, null, 2), "audit-json")}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded font-mono"
                        >
                          {copiedId === "audit-json" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          Copy JSON
                        </button>
                      </div>
                      <pre className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-300 font-mono text-xs overflow-x-auto max-h-96">
                        {JSON.stringify(proofData.immutableAudit, null, 2)}
                      </pre>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

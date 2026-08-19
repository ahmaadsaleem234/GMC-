import React, { useState, useEffect } from "react";
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  RefreshCw,
  Search,
  Send,
  UserCheck,
  UserX,
  Shield,
  MessageSquare,
  Sparkles,
  AlertCircle,
  Copy,
  Trash2,
  Radio,
  ExternalLink,
  Info,
  Check,
} from "lucide-react";

export interface TelegramBotUser {
  userId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  chatId: string;
  status: "approved" | "pending" | "rejected" | "blocked";
  joinedAt: string;
  lastActive: string;
  totalSignalsReceived: number;
  decisionAt?: string | null;
  languageCode?: string;
}

export interface TelegramUsersStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  blocked: number;
  totalSignalsSent?: number;
}

export const TelegramBotUsersSection: React.FC = () => {
  const [users, setUsers] = useState<TelegramBotUser[]>([]);
  const [stats, setStats] = useState<TelegramUsersStats>({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    blocked: 0,
    totalSignalsSent: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED" | "BLOCKED">("ALL");
  const [actionMsg, setActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Custom Direct Message State
  const [directMsgUser, setDirectMsgUser] = useState<TelegramBotUser | null>(null);
  const [directMsgText, setDirectMsgText] = useState<string>("");
  const [isSendingDirect, setIsSendingDirect] = useState<boolean>(false);
  const [directResult, setDirectResult] = useState<string | null>(null);

  // Custom Announcement Broadcast State
  const [showBroadcastModal, setShowBroadcastModal] = useState<boolean>(false);
  const [broadcastText, setBroadcastText] = useState<string>("");
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [broadcastResult, setBroadcastResult] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/telegram/users");
      const data = await res.json();
      if (data.ok) {
        setUsers(data.users || []);
        setStats(
          data.stats || {
            total: 0,
            approved: 0,
            pending: 0,
            rejected: 0,
            blocked: 0,
            totalSignalsSent: 0,
          }
        );
      }
    } catch (err: any) {
      console.error("[TELEGRAM USERS FETCH ERROR]:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUserAction = async (
    userId: string,
    action: "approve" | "reject" | "block" | "unblock" | "revoke" | "delete" | "ping",
    customMessage?: string
  ) => {
    try {
      setActionInProgress(`${userId}-${action}`);
      setActionMsg(null);
      const res = await fetch("/api/admin/telegram/users/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, customMessage }),
      });
      const data = await res.json();
      if (data.ok) {
        setUsers(data.users || []);
        setStats(data.stats);
        const actionLabels: Record<string, string> = {
          approve: "APPROVED — User notified via Telegram & authorized for signals",
          reject: "REJECTED — User notified & signal access denied",
          block: "BLOCKED — User blacklisted & access terminated",
          unblock: "UNBLOCKED — User restored to approved status",
          revoke: "REVOKED — User reset back to PENDING status",
          delete: "DELETED — User record removed from database",
          ping: "DIRECT PING SENT — Test message successfully delivered to user",
        };
        setActionMsg({
          type: "success",
          text: `User ${userId}: ${actionLabels[action] || action.toUpperCase()}`,
        });
        setTimeout(() => setActionMsg(null), 5000);
      } else {
        setActionMsg({
          type: "error",
          text: data.error || `Failed to perform action '${action}'`,
        });
      }
    } catch (err: any) {
      setActionMsg({
        type: "error",
        text: err.message || "Server connection error",
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleSendDirectMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directMsgUser || !directMsgText.trim()) return;

    setIsSendingDirect(true);
    setDirectResult(null);

    try {
      const res = await fetch("/api/admin/telegram/users/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: directMsgUser.userId,
          action: "message",
          customMessage: directMsgText.trim(),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setDirectResult(`✅ Direct message dispatched to @${directMsgUser.username || directMsgUser.userId}`);
        setDirectMsgText("");
        setTimeout(() => {
          setDirectMsgUser(null);
          setDirectResult(null);
        }, 2000);
      } else {
        setDirectResult(`❌ Failed: ${data.error || "Message delivery failed"}`);
      }
    } catch (err: any) {
      setDirectResult(`❌ Error: ${err.message || "Failed to reach backend"}`);
    } finally {
      setIsSendingDirect(false);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;

    setIsBroadcasting(true);
    setBroadcastResult(null);

    try {
      const res = await fetch("/api/telegram/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `<b>📢 ANNOUNCEMENT FROM HARAMI AI SUPER ADMIN</b>\n━━━━━━━━━━━━━━━━━━━\n${broadcastText.trim()}\n\n<i>⚡ Harami AI Official Broadcast • gmctrading.online</i>`,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setBroadcastResult(`✅ Announcement broadcast dispatched to all ${stats.approved} approved Telegram subscribers!`);
        setBroadcastText("");
        fetchUsers();
        setTimeout(() => {
          setShowBroadcastModal(false);
          setBroadcastResult(null);
        }, 2500);
      } else {
        setBroadcastResult(`❌ Failed: ${data.error || "Broadcast delivery failed"}`);
      }
    } catch (err: any) {
      setBroadcastResult(`❌ Error: ${err.message || "Failed to reach backend"}`);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return "—";
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 45) return "Just now";
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return `${Math.floor(diffSec / 86400)}d ago`;
    } catch {
      return "—";
    }
  };

  const filteredUsers = users.filter((u) => {
    // Status Filter
    if (statusFilter === "PENDING" && u.status !== "pending") return false;
    if (statusFilter === "APPROVED" && u.status !== "approved") return false;
    if (statusFilter === "REJECTED" && u.status !== "rejected") return false;
    if (statusFilter === "BLOCKED" && u.status !== "blocked") return false;

    // Search Query
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const idMatch = u.userId.toLowerCase().includes(q);
    const usernameMatch = u.username?.toLowerCase().includes(q);
    const nameMatch = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase().includes(q);
    return idMatch || usernameMatch || nameMatch;
  });

  return (
    <div className="space-y-6 font-sans text-slate-200">
      {/* Header & Quick Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#080B14] border border-sky-500/30 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-sky-500/10 border border-sky-500/30 rounded-xl flex items-center justify-center text-sky-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-white tracking-tight">Telegram Bot Users &amp; Access Control</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase">
                Server-Side RBAC Active
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Strict access approval gate: New Telegram users default to <span className="text-amber-400 font-bold">PENDING</span> and cannot receive signals or use commands until Super Admin approval.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-xl font-mono text-xs font-bold flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Broadcast to Approved ({stats.approved})</span>
          </button>

          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 font-mono text-xs"
            title="Refresh User List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-sky-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Action Message Alert */}
      {actionMsg && (
        <div
          className={`p-4 rounded-xl border font-mono text-xs flex items-center justify-between shadow-lg transition-all animate-fade-in ${
            actionMsg.type === "success"
              ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300"
              : "bg-rose-950/60 border-rose-500/50 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {actionMsg.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            <span className="font-semibold">{actionMsg.text}</span>
          </div>
          <button onClick={() => setActionMsg(null)} className="text-slate-400 hover:text-white px-2 py-0.5 text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Pending Attention Notice */}
      {stats.pending > 0 && (
        <div className="bg-amber-950/40 border-2 border-amber-500/60 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg shadow-amber-500/5 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 font-bold shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-amber-200">
                {stats.pending} User Access Request{stats.pending > 1 ? "s" : ""} Awaiting Super Admin Review
              </div>
              <div className="text-xs text-amber-400/80 font-mono">
                These users cannot receive signals, entry alerts, or execute bot commands until approved.
              </div>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter("PENDING")}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs rounded-xl transition-all shadow cursor-pointer"
          >
            Review Pending Users ({stats.pending})
          </button>
        </div>
      )}

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono">
        <button
          onClick={() => setStatusFilter("ALL")}
          className={`bg-[#05070E] border rounded-2xl p-4 text-center space-y-1 transition-all cursor-pointer text-left ${
            statusFilter === "ALL" ? "border-sky-500/60 bg-sky-950/10 shadow-lg shadow-sky-500/10" : "border-slate-800 hover:border-slate-700"
          }`}
        >
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Users</span>
          <div className="text-2xl font-black text-white">{stats.total}</div>
          <span className="text-[9px] text-slate-500 block">All recorded</span>
        </button>

        <button
          onClick={() => setStatusFilter("APPROVED")}
          className={`bg-[#05070E] border rounded-2xl p-4 text-center space-y-1 transition-all cursor-pointer text-left ${
            statusFilter === "APPROVED" ? "border-emerald-500 bg-emerald-950/20 shadow-lg shadow-emerald-500/10" : "border-emerald-500/30 hover:border-emerald-500/60"
          }`}
        >
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block flex items-center justify-between">
            <span>Approved</span>
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          </span>
          <div className="text-2xl font-black text-emerald-400">{stats.approved}</div>
          <span className="text-[9px] text-emerald-500/80 block">Active Signal Subscribers</span>
        </button>

        <button
          onClick={() => setStatusFilter("PENDING")}
          className={`bg-[#05070E] border rounded-2xl p-4 text-center space-y-1 transition-all cursor-pointer text-left relative ${
            statusFilter === "PENDING" ? "border-amber-500 bg-amber-950/20 shadow-lg shadow-amber-500/10" : "border-amber-500/30 hover:border-amber-500/60"
          }`}
        >
          {stats.pending > 0 && (
            <span className="absolute top-2 right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
          )}
          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block flex items-center justify-between">
            <span>Pending</span>
            <Clock className="w-3 h-3 text-amber-400" />
          </span>
          <div className="text-2xl font-black text-amber-400">{stats.pending}</div>
          <span className="text-[9px] text-amber-500/80 block">Awaiting Approval</span>
        </button>

        <button
          onClick={() => setStatusFilter("REJECTED")}
          className={`bg-[#05070E] border rounded-2xl p-4 text-center space-y-1 transition-all cursor-pointer text-left ${
            statusFilter === "REJECTED" ? "border-rose-500 bg-rose-950/20 shadow-lg shadow-rose-500/10" : "border-rose-500/30 hover:border-rose-500/60"
          }`}
        >
          <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider block flex items-center justify-between">
            <span>Rejected</span>
            <XCircle className="w-3 h-3 text-rose-400" />
          </span>
          <div className="text-2xl font-black text-rose-400">{stats.rejected}</div>
          <span className="text-[9px] text-rose-500/80 block">Access Denied</span>
        </button>

        <button
          onClick={() => setStatusFilter("BLOCKED")}
          className={`bg-[#05070E] border rounded-2xl p-4 text-center space-y-1 transition-all cursor-pointer text-left col-span-2 sm:col-span-1 ${
            statusFilter === "BLOCKED" ? "border-purple-500 bg-purple-950/20 shadow-lg shadow-purple-500/10" : "border-purple-500/30 hover:border-purple-500/60"
          }`}
        >
          <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block flex items-center justify-between">
            <span>Blocked</span>
            <Ban className="w-3 h-3 text-purple-400" />
          </span>
          <div className="text-2xl font-black text-purple-400">{stats.blocked}</div>
          <span className="text-[9px] text-purple-500/80 block">Blacklisted</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#05070E] border border-slate-800 rounded-2xl p-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar font-mono text-xs">
          {(["ALL", "PENDING", "APPROVED", "REJECTED", "BLOCKED"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[11px] transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === filter
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/50 shadow-md shadow-sky-500/10"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              <span>{filter}</span>
              {filter === "PENDING" && stats.pending > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-black text-[9px] rounded-full font-black">
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72 font-mono text-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Telegram ID, username, or name..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/60"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#05070E] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider">
                <th className="p-3.5">User Identity</th>
                <th className="p-3.5">Telegram ID</th>
                <th className="p-3.5">Access Status</th>
                <th className="p-3.5">Joined Date</th>
                <th className="p-3.5">Last Active</th>
                <th className="p-3.5 text-center">Signals Recv</th>
                <th className="p-3.5 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500 font-mono text-xs">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Users className="w-8 h-8 mx-auto text-slate-600 opacity-50" />
                      <div className="text-slate-400 font-bold">No Telegram Users Found</div>
                      <p className="text-[11px] text-slate-600">
                        {searchQuery
                          ? `No user records match "${searchQuery}"`
                          : statusFilter !== "ALL"
                          ? `No users currently in ${statusFilter} status.`
                          : "Any Telegram user who starts or interacts with the bot will appear here automatically."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Telegram Trader";
                  const isMaster = u.userId === "5218548758" || u.username === "@admin_master";

                  return (
                    <tr
                      key={u.userId}
                      className={`hover:bg-slate-900/50 transition-colors ${
                        u.status === "pending" ? "bg-amber-950/10" : ""
                      }`}
                    >
                      {/* User Info */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-white font-bold text-xs uppercase shrink-0">
                            {fullName.substring(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{fullName}</span>
                              {isMaster && (
                                <span className="px-1.5 py-0.2 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] rounded font-mono font-bold">
                                  MASTER ADMIN
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-sky-400 font-semibold flex items-center gap-1 mt-0.5">
                              {u.username ? (
                                <a
                                  href={`https://t.me/${u.username.replace("@", "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline flex items-center gap-0.5"
                                >
                                  <span>{u.username}</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              ) : (
                                <span className="text-slate-500">No @handle</span>
                              )}
                              {u.languageCode && (
                                <span className="text-[9px] text-slate-500 uppercase px-1 bg-slate-900 rounded border border-slate-800">
                                  {u.languageCode}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Telegram ID */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <code className="bg-slate-900 px-2 py-0.5 rounded text-amber-300 font-bold border border-slate-800 text-[11px]">
                            {u.userId}
                          </code>
                          <button
                            onClick={() => handleCopy(u.userId)}
                            className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                            title="Copy Telegram User ID"
                          >
                            {copiedId === u.userId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Access Status Badge */}
                      <td className="p-3.5">
                        {u.status === "approved" && (
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-[10px] uppercase flex items-center gap-1.5 w-fit">
                            <CheckCircle2 className="w-3.5 h-3.5" /> APPROVED
                          </span>
                        )}
                        {u.status === "pending" && (
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 font-extrabold text-[10px] uppercase flex items-center gap-1.5 w-fit animate-pulse">
                            <Clock className="w-3.5 h-3.5 text-amber-400" /> PENDING REVIEW
                          </span>
                        )}
                        {u.status === "rejected" && (
                          <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 font-extrabold text-[10px] uppercase flex items-center gap-1.5 w-fit">
                            <XCircle className="w-3.5 h-3.5" /> REJECTED
                          </span>
                        )}
                        {u.status === "blocked" && (
                          <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 font-extrabold text-[10px] uppercase flex items-center gap-1.5 w-fit">
                            <Ban className="w-3.5 h-3.5" /> BLOCKED
                          </span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="p-3.5 text-slate-400 text-[11px]">
                        <div>{u.joinedAt ? new Date(u.joinedAt).toLocaleDateString() : "—"}</div>
                        <div className="text-[9px] text-slate-500">
                          {u.joinedAt ? new Date(u.joinedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                        </div>
                      </td>

                      {/* Last Active */}
                      <td className="p-3.5 text-[11px]">
                        <div className="text-slate-300 font-semibold">{formatRelativeTime(u.lastActive)}</div>
                        <div className="text-[9px] text-slate-500">
                          {u.lastActive ? new Date(u.lastActive).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                        </div>
                      </td>

                      {/* Signals Count */}
                      <td className="p-3.5 text-center font-bold">
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
                          {u.totalSignalsReceived || 0}
                        </span>
                      </td>

                      {/* Admin Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {u.status !== "approved" && (
                            <button
                              onClick={() => handleUserAction(u.userId, "approve")}
                              disabled={actionInProgress === `${u.userId}-approve`}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[10px] uppercase transition-all flex items-center gap-1 shadow cursor-pointer disabled:opacity-50"
                              title="Approve User Access"
                            >
                              <UserCheck className="w-3 h-3" /> Approve
                            </button>
                          )}

                          {u.status === "approved" && (
                            <button
                              onClick={() => handleUserAction(u.userId, "revoke")}
                              disabled={actionInProgress === `${u.userId}-revoke`}
                              className="px-2.5 py-1.5 bg-amber-600/80 hover:bg-amber-500 text-white rounded-lg font-bold text-[10px] uppercase transition-all flex items-center gap-1 shadow cursor-pointer disabled:opacity-50"
                              title="Revoke Access (Reset to Pending)"
                            >
                              <UserX className="w-3 h-3" /> Revoke
                            </button>
                          )}

                          {u.status === "pending" && (
                            <button
                              onClick={() => handleUserAction(u.userId, "reject")}
                              disabled={actionInProgress === `${u.userId}-reject`}
                              className="px-2.5 py-1.5 bg-rose-700 hover:bg-rose-600 text-white rounded-lg font-bold text-[10px] uppercase transition-all flex items-center gap-1 shadow cursor-pointer disabled:opacity-50"
                              title="Reject User Request"
                            >
                              <XCircle className="w-3 h-3" /> Reject
                            </button>
                          )}

                          {u.status !== "blocked" && (
                            <button
                              onClick={() => handleUserAction(u.userId, "block")}
                              disabled={actionInProgress === `${u.userId}-block`}
                              className="px-2 py-1.5 bg-purple-950/60 hover:bg-purple-900 text-purple-300 border border-purple-500/40 rounded-lg font-bold text-[10px] uppercase transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              title="Block & Blacklist User"
                            >
                              <Ban className="w-3 h-3" /> Block
                            </button>
                          )}

                          {u.status === "blocked" && (
                            <button
                              onClick={() => handleUserAction(u.userId, "unblock")}
                              disabled={actionInProgress === `${u.userId}-unblock`}
                              className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold text-[10px] uppercase transition-all cursor-pointer disabled:opacity-50"
                              title="Unblock User"
                            >
                              Unblock
                            </button>
                          )}

                          {/* Direct Message / Ping Trigger */}
                          <button
                            onClick={() => setDirectMsgUser(u)}
                            className="p-1.5 bg-slate-900 hover:bg-sky-950 border border-slate-800 hover:border-sky-500/40 text-slate-400 hover:text-sky-300 rounded-lg transition-all cursor-pointer"
                            title="Send Direct Telegram Message"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Action */}
                          {!isMaster && (
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete user ${u.userId} (${fullName})?`)) {
                                  handleUserAction(u.userId, "delete");
                                }
                              }}
                              className="p-1.5 bg-slate-900 hover:bg-rose-950/80 border border-slate-800 hover:border-rose-500/40 text-slate-500 hover:text-rose-300 rounded-lg transition-all cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Direct Message to User Modal */}
      {directMsgUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono text-xs">
          <div className="w-full max-w-lg bg-[#080B14] border-2 border-sky-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-sky-400 font-bold uppercase text-sm">
                <MessageSquare className="w-4 h-4" />
                <span>Message Telegram User</span>
              </div>
              <button
                onClick={() => setDirectMsgUser(null)}
                className="text-slate-400 hover:text-white px-2 py-1 bg-slate-900 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1">
              <div className="text-white font-bold">
                Recipient: {directMsgUser.firstName} {directMsgUser.lastName} ({directMsgUser.username || "No @username"})
              </div>
              <div className="text-[11px] text-amber-300">
                Telegram ID: {directMsgUser.userId} • Status: {directMsgUser.status.toUpperCase()}
              </div>
            </div>

            <form onSubmit={handleSendDirectMessage} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-[11px] font-bold uppercase mb-1">
                  Message Text (HTML allowed)
                </label>
                <textarea
                  rows={4}
                  value={directMsgText}
                  onChange={(e) => setDirectMsgText(e.target.value)}
                  placeholder="Enter message or announcement to send directly to this user's Telegram chat..."
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-sans text-xs"
                  required
                />
              </div>

              {directResult && (
                <div
                  className={`p-3 rounded-xl border text-xs font-bold ${
                    directResult.startsWith("✅")
                      ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                      : "bg-rose-950/40 border-rose-500/30 text-rose-300"
                  }`}
                >
                  {directResult}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => handleUserAction(directMsgUser.userId, "ping")}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-800 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer text-[11px]"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Send Test Ping</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDirectMsgUser(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingDirect || !directMsgText.trim()}
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-sky-500/20"
                  >
                    {isSendingDirect ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Send Message</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono text-xs">
          <div className="w-full max-w-lg bg-[#080B14] border-2 border-sky-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-sky-400 font-bold uppercase text-sm">
                <Send className="w-4 h-4" />
                <span>Broadcast Telegram Announcement</span>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="text-slate-400 hover:text-white px-2 py-1 bg-slate-900 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-400 text-xs">
              This announcement will be delivered immediately via Telegram to all <strong>{stats.approved} Approved Subscribers</strong>.
            </p>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-[11px] font-bold uppercase mb-1">
                  Message Content (HTML Allowed)
                </label>
                <textarea
                  rows={4}
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  placeholder="e.g. Major NFP Economic News release in 30 minutes! AI system entering protective pause..."
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-sans text-xs"
                  required
                />
              </div>

              {broadcastResult && (
                <div
                  className={`p-3 rounded-xl border text-xs font-bold ${
                    broadcastResult.startsWith("✅")
                      ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                      : "bg-rose-950/40 border-rose-500/30 text-rose-300"
                  }`}
                >
                  {broadcastResult}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBroadcasting || !broadcastText.trim()}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-sky-500/20"
                >
                  {isBroadcasting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Send Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

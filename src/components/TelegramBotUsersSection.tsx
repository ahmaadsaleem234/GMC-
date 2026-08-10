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
}

export interface TelegramUsersStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  blocked: number;
}

export const TelegramBotUsersSection: React.FC = () => {
  const [users, setUsers] = useState<TelegramBotUser[]>([]);
  const [stats, setStats] = useState<TelegramUsersStats>({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    blocked: 0,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED" | "BLOCKED">("ALL");
  const [actionMsg, setActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
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
    const interval = setInterval(fetchUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUserAction = async (
    userId: string,
    action: "approve" | "reject" | "block" | "unblock" | "revoke" | "delete"
  ) => {
    try {
      setActionMsg(null);
      const res = await fetch("/api/admin/telegram/users/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json();
      if (data.ok) {
        setUsers(data.users || []);
        setStats(data.stats);
        setActionMsg({
          type: "success",
          text: `Action '${action.toUpperCase()}' successfully applied to Telegram User ID ${userId}`,
        });
        setTimeout(() => setActionMsg(null), 4000);
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
          text: `<b>📢 ANNOUNCEMENT FROM HARAMI AI ADMIN</b>\n━━━━━━━━━━━━━━━━━━━\n${broadcastText.trim()}\n\n<i>⚡ Harami AI Official Broadcast</i>`,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setBroadcastResult(`✅ Announcement broadcast dispatched to all approved Telegram users!`);
        setBroadcastText("");
        setTimeout(() => {
          setShowBroadcastModal(false);
          setBroadcastResult(null);
        }, 2000);
      } else {
        setBroadcastResult(`❌ Failed: ${data.error || "Broadcast delivery failed"}`);
      }
    } catch (err: any) {
      setBroadcastResult(`❌ Error: ${err.message || "Failed to reach backend"}`);
    } finally {
      setIsBroadcasting(false);
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
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-sky-500/10 border border-sky-500/30 rounded-xl flex items-center justify-center text-sky-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">Telegram Bot Users &amp; Access Control</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase">
                Unlimited Multi-User Support
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Approve, reject, or block Telegram users who start or interact with your bot. Only approved users receive 24/7 signals.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-xl font-mono text-xs font-bold flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Broadcast Announcement</span>
          </button>

          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
            title="Refresh User List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-sky-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Action Message Alert */}
      {actionMsg && (
        <div
          className={`p-3.5 rounded-xl border font-mono text-xs flex items-center justify-between ${
            actionMsg.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
              : "bg-rose-950/40 border-rose-500/40 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMsg.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            <span>{actionMsg.text}</span>
          </div>
        </div>
      )}

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono">
        <div className="bg-[#05070E] border border-slate-800 rounded-2xl p-4 text-center space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Users</span>
          <div className="text-2xl font-black text-white">{stats.total}</div>
          <span className="text-[9px] text-slate-500">All registered</span>
        </div>

        <div className="bg-[#05070E] border border-emerald-500/30 rounded-2xl p-4 text-center space-y-1">
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Approved</span>
          <div className="text-2xl font-black text-emerald-400">{stats.approved}</div>
          <span className="text-[9px] text-emerald-500/80">Receiving Signals</span>
        </div>

        <div className="bg-[#05070E] border border-amber-500/30 rounded-2xl p-4 text-center space-y-1">
          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Pending</span>
          <div className="text-2xl font-black text-amber-400">{stats.pending}</div>
          <span className="text-[9px] text-amber-500/80">Awaiting Action</span>
        </div>

        <div className="bg-[#05070E] border border-rose-500/30 rounded-2xl p-4 text-center space-y-1">
          <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">Rejected</span>
          <div className="text-2xl font-black text-rose-400">{stats.rejected}</div>
          <span className="text-[9px] text-rose-500/80">Access Denied</span>
        </div>

        <div className="bg-[#05070E] border border-purple-500/30 rounded-2xl p-4 text-center space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Blocked</span>
          <div className="text-2xl font-black text-purple-400">{stats.blocked}</div>
          <span className="text-[9px] text-purple-500/80">User Blacklisted</span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#05070E] border border-slate-800 rounded-2xl p-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar font-mono text-xs">
          {(["ALL", "PENDING", "APPROVED", "REJECTED", "BLOCKED"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[11px] transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === filter
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/50 shadow-md shadow-sky-500/10"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              {filter}
              {filter === "PENDING" && stats.pending > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 bg-amber-500 text-black text-[9px] rounded-full font-black">
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64 font-mono text-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ID, username, or name..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500/60"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#05070E] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 text-[10px] uppercase tracking-wider">
                <th className="p-3.5">User Info</th>
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
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-mono text-xs">
                    {searchQuery ? "No Telegram users match your search query." : "No Telegram bot users found."}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim() || "Trader";
                  return (
                    <tr key={u.userId} className="hover:bg-slate-900/40 transition-colors">
                      {/* User Info */}
                      <td className="p-3.5">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{fullName}</span>
                        </div>
                        <div className="text-[10px] text-sky-400 font-semibold">{u.username || "No username"}</div>
                      </td>

                      {/* Telegram ID */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1">
                          <code className="bg-slate-900 px-2 py-0.5 rounded text-amber-300 font-bold border border-slate-800">
                            {u.userId}
                          </code>
                          <button
                            onClick={() => navigator.clipboard.writeText(u.userId)}
                            className="p-1 text-slate-500 hover:text-slate-300"
                            title="Copy Telegram User ID"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Access Status Badge */}
                      <td className="p-3.5">
                        {u.status === "approved" && (
                          <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-[10px] uppercase flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" /> Approved
                          </span>
                        )}
                        {u.status === "pending" && (
                          <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-[10px] uppercase flex items-center gap-1 w-fit animate-pulse">
                            <Clock className="w-3 h-3" /> Pending Approval
                          </span>
                        )}
                        {u.status === "rejected" && (
                          <span className="px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 font-extrabold text-[10px] uppercase flex items-center gap-1 w-fit">
                            <XCircle className="w-3 h-3" /> Restricted
                          </span>
                        )}
                        {u.status === "blocked" && (
                          <span className="px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-400 font-extrabold text-[10px] uppercase flex items-center gap-1 w-fit">
                            <Ban className="w-3 h-3" /> Blocked
                          </span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="p-3.5 text-slate-400 text-[11px]">
                        {u.joinedAt ? new Date(u.joinedAt).toLocaleDateString() : "—"}
                      </td>

                      {/* Last Active */}
                      <td className="p-3.5 text-slate-400 text-[11px]">
                        {u.lastActive ? new Date(u.lastActive).toLocaleTimeString() : "—"}
                      </td>

                      {/* Signals Count */}
                      <td className="p-3.5 text-center font-bold text-amber-300">
                        {u.totalSignalsReceived || 0}
                      </td>

                      {/* Admin Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {u.status !== "approved" && (
                            <button
                              onClick={() => handleUserAction(u.userId, "approve")}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[10px] uppercase transition-all flex items-center gap-1 shadow cursor-pointer"
                              title="Approve Access"
                            >
                              <UserCheck className="w-3 h-3" /> Approve
                            </button>
                          )}

                          {u.status === "approved" && (
                            <button
                              onClick={() => handleUserAction(u.userId, "reject")}
                              className="px-2.5 py-1 bg-amber-600/80 hover:bg-amber-500 text-white rounded-lg font-bold text-[10px] uppercase transition-all flex items-center gap-1 shadow cursor-pointer"
                              title="Revoke Access"
                            >
                              <UserX className="w-3 h-3" /> Revoke
                            </button>
                          )}

                          {u.status !== "blocked" && (
                            <button
                              onClick={() => handleUserAction(u.userId, "block")}
                              className="px-2.5 py-1 bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/30 rounded-lg font-bold text-[10px] uppercase transition-all flex items-center gap-1 cursor-pointer"
                              title="Block User"
                            >
                              <Ban className="w-3 h-3" /> Block
                            </button>
                          )}

                          {u.status === "blocked" && (
                            <button
                              onClick={() => handleUserAction(u.userId, "unblock")}
                              className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold text-[10px] uppercase transition-all cursor-pointer"
                              title="Unblock User"
                            >
                              Unblock
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete user ${u.userId}?`)) {
                                handleUserAction(u.userId, "delete");
                              }
                            }}
                            className="p-1 bg-slate-900 hover:bg-rose-950/80 border border-slate-800 hover:border-rose-500/40 text-slate-500 hover:text-rose-300 rounded-lg transition-all cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
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
                className="text-slate-400 hover:text-white px-2 py-1 bg-slate-900 rounded-lg"
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
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold"
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

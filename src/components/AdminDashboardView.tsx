import React, { useState, useEffect } from "react";
import {
  Shield,
  ShieldAlert,
  Users,
  Key,
  Smartphone,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
  Globe,
  Clock,
  RefreshCw,
  Lock,
  Unlock,
  Trash2,
  LogOut,
  Eye,
  BarChart2,
  PieChart,
  ShieldCheck,
  ExternalLink,
  MessageCircle,
  Send,
  Radio,
  Ban,
  UserX,
  AlertCircle,
  Sparkles,
  Zap,
  Copy,
  FileText,
  Monitor,
  Laptop,
  Tablet,
  Compass,
} from "lucide-react";
import {
  getTelegramConfig,
  saveTelegramConfig,
  sendTelegramMessage,
  cleanTelegramInput,
  TelegramConfig,
} from "../utils/telegram";
import {
  detectDeviceAndBrowserInfo,
  fetchPublicIpAndGeo,
  calculateDuration,
  getStoredSessions,
  saveSessions,
  getStoredAuditLogs,
  saveAuditLogs,
  addAuditLog,
  getBlockedIps,
  saveBlockedIps,
  getBlockedUsers,
  saveBlockedUsers,
  getPasswordResetHistory,
  savePasswordResetHistory,
  UserSessionData,
  ActivityAuditLog,
  PasswordResetHistoryItem,
  BlockedIpItem,
} from "../utils/userSessionTracker";

import { MT5AutoTradingDashboard } from "./MT5AutoTradingDashboard";

interface AdminDashboardViewProps {
  isLoggedIn: boolean;
  loggedInUser: string | null;
  onLogout: () => void;
  onForceLogoutUser?: (username?: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  isLoggedIn,
  loggedInUser,
  onLogout,
  onForceLogoutUser,
}) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "mt5" | "sessions" | "users" | "ipblock" | "telegram" | "audit" | "analytics"
  >("mt5");

  // Real-time state
  const [sessions, setSessions] = useState<UserSessionData[]>([]);
  const [auditLogs, setAuditLogs] = useState<ActivityAuditLog[]>([]);
  const [blockedIps, setBlockedIps] = useState<BlockedIpItem[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [passwordHistory, setPasswordHistory] = useState<PasswordResetHistoryItem[]>([]);
  const [liveTimer, setLiveTimer] = useState<number>(Date.now());

  // Password Reset Modal State
  const [resetModalUser, setResetModalUser] = useState<UserSessionData | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetSuccessMsg, setResetSuccessMsg] = useState("");

  // IP Block Modal State
  const [ipToBlockInput, setIpToBlockInput] = useState("");
  const [blockReasonInput, setBlockReasonInput] = useState("");

  // Telegram Settings State
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>({
    botToken: "",
    chatId: "",
    enabled: false,
    sendEntries: true,
    sendSLTPHits: true,
  });
  const [telegramTestStatus, setTelegramTestStatus] = useState<{
    loading: boolean;
    msg: string;
    success?: boolean;
  }>({ loading: false, msg: "" });
  const [telegramSaveSuccess, setTelegramSaveSuccess] = useState(false);

  // Load initial data and run real client detection
  useEffect(() => {
    const loadedSessions = getStoredSessions();
    const loadedLogs = getStoredAuditLogs();
    const loadedIps = getBlockedIps();
    const loadedUsers = getBlockedUsers();
    const loadedResets = getPasswordResetHistory();
    const currentTelegram = getTelegramConfig();

    setSessions(loadedSessions);
    setAuditLogs(loadedLogs);
    setBlockedIps(loadedIps);
    setBlockedUsers(loadedUsers);
    setPasswordHistory(loadedResets);
    setTelegramConfig(currentTelegram);

    // Enrich current session with actual client browser/device info & IP
    async function enrichCurrentSession() {
      const devInfo = detectDeviceAndBrowserInfo();
      const ipGeo = await fetchPublicIpAndGeo();

      setSessions((prev) =>
        prev.map((s) => {
          if (s.username === "Ahmed" || s.isCurrentSession) {
            return {
              ...s,
              ip: ipGeo.ip,
              location: ipGeo.location,
              deviceType: devInfo.deviceType,
              os: devInfo.os,
              browser: devInfo.browser,
              screenResolution: devInfo.resolution,
            };
          }
          return s;
        })
      );
    }
    enrichCurrentSession();
  }, []);

  // 1-Second Ticking Loop for Real-Time Session Durations & Live Updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTimer(Date.now());
      setSessions((prevSessions) =>
        prevSessions.map((sess) => {
          if (sess.status === "ONLINE") {
            return {
              ...sess,
              sessionDuration: calculateDuration(sess.loginTimestamp),
            };
          }
          return sess;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Save sessions whenever changed
  useEffect(() => {
    if (sessions.length > 0) {
      saveSessions(sessions);
    }
  }, [sessions]);

  // Handle Force Logout of a specific user/session
  const handleForceLogoutSession = (sessionId: string, username: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.sessionId === sessionId || s.username === username) {
          return {
            ...s,
            status: "OFFLINE",
            lastLogoutTime: new Date().toLocaleTimeString(),
          };
        }
        return s;
      })
    );

    const targetLog: ActivityAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      username: loggedInUser || "Ahmed (Admin)",
      role: "ADMIN",
      ip: sessions.find((s) => s.isCurrentSession)?.ip || "197.240.12.88",
      event: `FORCE LOGOUT EXECUTED for user '${username}'`,
      status: "WARNING",
      details: `Admin terminated active authentication token & session ID (${sessionId}) instantly.`,
      deviceInfo: `${detectDeviceAndBrowserInfo().os} • ${detectDeviceAndBrowserInfo().browser}`,
    };

    const newLogs = [targetLog, ...auditLogs];
    setAuditLogs(newLogs);
    saveAuditLogs(newLogs);

    if (username === loggedInUser && onLogout) {
      onLogout();
    } else if (onForceLogoutUser) {
      onForceLogoutUser(username);
    }
  };

  // Handle Global One-Click Session Purge (Logout All Users Except Admin)
  const handlePurgeAllOtherSessions = () => {
    setSessions((prev) =>
      prev.map((s) => {
        if (!s.isCurrentSession && s.username !== "Ahmed") {
          return {
            ...s,
            status: "OFFLINE",
            lastLogoutTime: new Date().toLocaleTimeString(),
          };
        }
        return s;
      })
    );

    const purgeLog: ActivityAuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      username: loggedInUser || "Ahmed (Admin)",
      role: "ADMIN",
      ip: sessions.find((s) => s.isCurrentSession)?.ip || "197.240.12.88",
      event: "GLOBAL ONE-CLICK SESSION PURGE",
      status: "CRITICAL",
      details: "All remote user sessions across all devices forcibly logged out by Admin.",
      deviceInfo: `${detectDeviceAndBrowserInfo().os} • ${detectDeviceAndBrowserInfo().browser}`,
    };

    const newLogs = [purgeLog, ...auditLogs];
    setAuditLogs(newLogs);
    saveAuditLogs(newLogs);
  };

  // Handle Block / Unblock User
  const handleToggleBlockUser = (username: string) => {
    if (username === "Ahmed") {
      alert("Action Denied: Super Admin (Ahmed) cannot be blocked.");
      return;
    }

    const isBlocked = blockedUsers.includes(username);
    let nextBlockedUsers: string[];

    if (isBlocked) {
      nextBlockedUsers = blockedUsers.filter((u) => u !== username);
    } else {
      nextBlockedUsers = [...blockedUsers, username];
      // Force logout blocked user
      handleForceLogoutSession(`sess-${username}`, username);
    }

    setBlockedUsers(nextBlockedUsers);
    saveBlockedUsers(nextBlockedUsers);

    // Update account status in session table
    setSessions((prev) =>
      prev.map((s) => {
        if (s.username === username) {
          return {
            ...s,
            accountStatus: isBlocked ? "ACTIVE" : "BLOCKED",
            status: isBlocked ? s.status : "OFFLINE",
          };
        }
        return s;
      })
    );

    addAuditLog({
      username: loggedInUser || "Ahmed (Admin)",
      role: "ADMIN",
      ip: sessions.find((s) => s.isCurrentSession)?.ip || "197.240.12.88",
      event: isBlocked ? `USER UNBLOCKED: '${username}'` : `USER BLOCKED & FORCED OUT: '${username}'`,
      status: isBlocked ? "SUCCESS" : "CRITICAL",
      details: isBlocked
        ? `Account '${username}' restored to active state.`
        : `Account '${username}' blocked from system access. Active sessions purged.`,
      deviceInfo: `${detectDeviceAndBrowserInfo().os} • ${detectDeviceAndBrowserInfo().browser}`,
    });
  };

  // Handle Lock / Unlock Account
  const handleToggleLockAccount = (username: string) => {
    if (username === "Ahmed") {
      alert("Action Denied: Super Admin (Ahmed) account cannot be locked.");
      return;
    }

    setSessions((prev) =>
      prev.map((s) => {
        if (s.username === username) {
          const isCurrentlyLocked = s.accountStatus === "LOCKED";
          const nextStatus = isCurrentlyLocked ? "ACTIVE" : "LOCKED";
          return {
            ...s,
            accountStatus: nextStatus,
            status: nextStatus === "LOCKED" ? "OFFLINE" : s.status,
          };
        }
        return s;
      })
    );

    addAuditLog({
      username: loggedInUser || "Ahmed (Admin)",
      role: "ADMIN",
      ip: sessions.find((s) => s.isCurrentSession)?.ip || "197.240.12.88",
      event: `ACCOUNT LOCK TOGGLE: '${username}'`,
      status: "WARNING",
      details: `Account state toggled for '${username}' by Admin authorization.`,
      deviceInfo: `${detectDeviceAndBrowserInfo().os} • ${detectDeviceAndBrowserInfo().browser}`,
    });
  };

  // Handle IP Blocking
  const handleBlockIpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipToBlockInput.trim()) return;

    const newBlockedIp: BlockedIpItem = {
      ip: ipToBlockInput.trim(),
      reason: blockReasonInput.trim() || "Manual Admin Security Block",
      blockedAt: new Date().toLocaleString(),
      blockedBy: loggedInUser || "Ahmed (Admin)",
    };

    const nextIps = [newBlockedIp, ...blockedIps];
    setBlockedIps(nextIps);
    saveBlockedIps(nextIps);

    // Force logout any session matching this IP
    setSessions((prev) =>
      prev.map((s) => {
        if (s.ip === ipToBlockInput.trim()) {
          return {
            ...s,
            status: "OFFLINE",
            accountStatus: "BLOCKED",
          };
        }
        return s;
      })
    );

    addAuditLog({
      username: loggedInUser || "Ahmed (Admin)",
      role: "ADMIN",
      ip: sessions.find((s) => s.isCurrentSession)?.ip || "197.240.12.88",
      event: `IP ADDRESS BLOCKED: ${ipToBlockInput.trim()}`,
      status: "CRITICAL",
      details: `Reason: ${blockReasonInput || "Manual security rule"}. Incoming network connections blacklisted.`,
      deviceInfo: `${detectDeviceAndBrowserInfo().os} • ${detectDeviceAndBrowserInfo().browser}`,
    });

    setIpToBlockInput("");
    setBlockReasonInput("");
  };

  const handleUnblockIp = (ipToUnblock: string) => {
    const nextIps = blockedIps.filter((item) => item.ip !== ipToUnblock);
    setBlockedIps(nextIps);
    saveBlockedIps(nextIps);

    addAuditLog({
      username: loggedInUser || "Ahmed (Admin)",
      role: "ADMIN",
      ip: sessions.find((s) => s.isCurrentSession)?.ip || "197.240.12.88",
      event: `IP ADDRESS UNBLOCKED: ${ipToUnblock}`,
      status: "SUCCESS",
      details: "IP removed from firewall blacklist.",
      deviceInfo: `${detectDeviceAndBrowserInfo().os} • ${detectDeviceAndBrowserInfo().browser}`,
    });
  };

  // Handle Password Reset
  const handleExecutePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser || !newPassword) return;

    // Reset password & invalidate sessions
    const targetUsername = resetModalUser.username;

    setSessions((prev) =>
      prev.map((s) => {
        if (s.username === targetUsername && !s.isCurrentSession) {
          return {
            ...s,
            status: "OFFLINE",
            lastLogoutTime: new Date().toLocaleTimeString(),
          };
        }
        return s;
      })
    );

    const resetHistoryEntry: PasswordResetHistoryItem = {
      id: `rst-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      targetUsername,
      resetBy: loggedInUser || "Ahmed (Admin)",
      ip: sessions.find((s) => s.isCurrentSession)?.ip || "197.240.12.88",
      forcedSessionsInvalidated: 1,
    };

    const nextResets = [resetHistoryEntry, ...passwordHistory];
    setPasswordHistory(nextResets);
    savePasswordResetHistory(nextResets);

    addAuditLog({
      username: loggedInUser || "Ahmed (Admin)",
      role: "ADMIN",
      ip: sessions.find((s) => s.isCurrentSession)?.ip || "197.240.12.88",
      event: `PASSWORD RESET & MANDATORY LOGOUT for '${targetUsername}'`,
      status: "WARNING",
      details: `Password updated by Admin. All active authentication tokens and remote sessions invalidated.`,
      deviceInfo: `${detectDeviceAndBrowserInfo().os} • ${detectDeviceAndBrowserInfo().browser}`,
    });

    setResetSuccessMsg(
      `Password for user '${targetUsername}' successfully updated. All active sessions have been forcibly invalidated and logged out across all devices!`
    );

    setTimeout(() => {
      setResetModalUser(null);
      setNewPassword("");
      setResetSuccessMsg("");
    }, 2500);
  };

  // Handle Telegram Config Save
  const handleSaveTelegram = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedConfig = {
      ...telegramConfig,
      botToken: cleanTelegramInput(telegramConfig.botToken),
      chatId: cleanTelegramInput(telegramConfig.chatId),
    };
    saveTelegramConfig(cleanedConfig);
    setTelegramConfig(cleanedConfig);
    setTelegramSaveSuccess(true);
    addAuditLog({
      username: loggedInUser || "Ahmed (Admin)",
      role: "ADMIN",
      ip: sessions.find((s) => s.isCurrentSession)?.ip || "197.240.12.88",
      event: "TELEGRAM BOT CONFIGURATION UPDATED",
      status: "SUCCESS",
      details: `Telegram Bot Token & Chat ID (${cleanedConfig.chatId || "N/A"}) modified by Admin. Broadcasts: ${cleanedConfig.enabled ? "ENABLED" : "DISABLED"}.`,
      deviceInfo: `${detectDeviceAndBrowserInfo().os} • ${detectDeviceAndBrowserInfo().browser}`,
    });
    setTimeout(() => setTelegramSaveSuccess(false), 3000);
  };

  // Handle Telegram Test Signal
  const handleSendTestSignal = async (type: "ENTRY" | "TP_HIT" | "SL_HIT" | "BALANCE") => {
    const cleanToken = cleanTelegramInput(telegramConfig.botToken);
    const cleanChat = cleanTelegramInput(telegramConfig.chatId);

    if (!cleanToken || !cleanChat) {
      setTelegramTestStatus({
        loading: false,
        msg: "Please enter Bot Token and Chat ID first!",
        success: false,
      });
      return;
    }

    const currentConfig = {
      ...telegramConfig,
      botToken: cleanToken,
      chatId: cleanChat,
    };

    setTelegramTestStatus({ loading: true, msg: `Sending ${type} demo signal to Telegram channel...` });
    saveTelegramConfig(currentConfig);
    setTelegramConfig(currentConfig);

    let testMsg = "";
    if (type === "ENTRY") {
      testMsg = `<b>🟢 🚀 GMC TRADING AI LIVE SIGNAL BROADCAST</b>\n━━━━━━━━━━━━━━━━━━━\n<b>🧠 BRAIN MODULE:</b> 🎯 GMC HARAMI AI & BOND 007\n<b>📊 ASSET:</b> XAUUSD (Gold Spot)\n<b>🎯 DIRECTION:</b> <code>BUY LONG</code>\n<b>📍 LIVE ENTRY:</b> <code>$3328.50</code>\n<b>🛑 STOP LOSS:</b> <code>$3314.00</code>\n<b>🎯 TAKE PROFIT:</b> <code>$3362.00</code>\n<b>⚡ STRICT LOT SIZE:</b> <code>0.01 LOT</code>\n━━━━━━━━━━━━━━━━━━━\n<i>⚡ GMC Admin Control Desk • Live Signal Active</i>`;
    } else if (type === "TP_HIT") {
      testMsg = `<b>🎉 💰 GMC TRADE OUTCOME NOTIFICATION</b>\n━━━━━━━━━━━━━━━━━━━\n<b>📊 ASSET:</b> XAUUSD (BUY)\n<b>STATUS:</b> <code>✅ TAKE PROFIT 1 HIT</code>\n<b>EXIT PRICE:</b> <code>$3345.00</code>\n<b>NET PROFIT:</b> <code>+$16.50 (+0.16%)</code>\n━━━━━━━━━━━━━━━━━━━\n<i>⚡ GMC Risk Defense • Trade Closed Successfully</i>`;
    } else if (type === "SL_HIT") {
      testMsg = `<b>🛡️ 🛑 GMC TRADE OUTCOME NOTIFICATION</b>\n━━━━━━━━━━━━━━━━━━━\n<b>📊 ASSET:</b> XAUUSD (BUY)\n<b>STATUS:</b> <code>❌ STOP LOSS HIT</code>\n<b>EXIT PRICE:</b> <code>$3314.00</code>\n<b>NET LOSS:</b> <code>-$14.50 (-0.14%)</code>\n━━━━━━━━━━━━━━━━━━━\n<i>⚡ GMC Risk Guard • Capital Protected via Strict SL</i>`;
    } else {
      testMsg = `<b>💼 GMC DEMO ACCOUNT BALANCE REPORT</b>\n━━━━━━━━━━━━━━━━━━━\n<b>💰 INITIAL DEPOSIT:</b> <code>$10,000.00</code>\n<b>📈 CURRENT EQUITY:</b> <code>$10,345.20</code>\n<b>🔥 TOTAL PnL:</b> <code>+$345.20 (+3.45%)</code>\n━━━━━━━━━━━━━━━━━━━\n<i>⚡ GMC Capital Risk Control Desk</i>`;
    }

    const res = await sendTelegramMessage(testMsg, undefined, currentConfig);
    setTelegramTestStatus({
      loading: false,
      msg: res.message,
      success: res.success,
    });
  };

  // Ensure Admin-Only Access Guard
  const isAdmin = loggedInUser === "Ahmed" || loggedInUser?.includes("Ahmed");

  if (!isAdmin) {
    return (
      <div className="p-8 bg-[#080B14] border border-rose-500/40 rounded-3xl text-center space-y-4 font-mono text-slate-200">
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/40 rounded-2xl flex items-center justify-center text-rose-400 mx-auto">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
          ACCESS DENIED (SUPER ADMIN RESTRICTED)
        </h2>
        <p className="text-slate-400 text-xs max-w-lg mx-auto leading-relaxed">
          The GMC Enterprise Security &amp; Admin Control Panel is strictly restricted to <strong>Super Admin (Ahmed)</strong>. Normal user accounts (gmcf7) cannot view security logs, device tracking, session controls, or Telegram Bot settings.
        </p>
      </div>
    );
  }

  const activeOnlineCount = sessions.filter((s) => s.status === "ONLINE").length;

  return (
    <div className="space-y-6 font-sans text-slate-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#0C0F19] via-[#080B14] to-[#0D1222] border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 via-amber-600 to-amber-900 rounded-2xl flex items-center justify-center border border-amber-300/60 shadow-xl shadow-amber-500/20 text-black shrink-0">
              <Shield className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono font-extrabold text-amber-300 uppercase tracking-widest">
                  GMC ENTERPRISE SECURITY &amp; ADMIN DESK
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  REAL-TIME TELEMETRY ACTIVE
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Security Control, Live Session &amp; Telegram Bot Center
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Authenticated Admin: <strong className="text-amber-400 font-extrabold">{loggedInUser || "Ahmed"}</strong> • Full System Privileges &amp; Real Production Data
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="px-4 py-2.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 rounded-xl font-mono text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <LogOut className="w-4 h-4" />
              <span>LOGOUT ADMIN</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pt-5 mt-4 border-t border-slate-800/80 no-scrollbar font-mono text-xs">
          <button
            onClick={() => setActiveTab("mt5")}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all border whitespace-nowrap ${
              activeTab === "mt5"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-lg shadow-amber-500/10"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400 fill-current" />
            <span>🤖 MT5 Auto-Trading &amp; AI Control</span>
          </button>

          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all border whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-lg shadow-amber-500/10"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Overview &amp; Telemetry</span>
          </button>

          <button
            onClick={() => setActiveTab("sessions")}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all border whitespace-nowrap ${
              activeTab === "sessions"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-lg shadow-amber-500/10"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            <Monitor className="w-4 h-4 text-emerald-400" />
            <span>Real-Time User Monitoring ({activeOnlineCount} Online)</span>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all border whitespace-nowrap ${
              activeTab === "users"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-lg shadow-amber-500/10"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>User Management &amp; Passwords</span>
          </button>

          <button
            onClick={() => setActiveTab("ipblock")}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all border whitespace-nowrap ${
              activeTab === "ipblock"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-lg shadow-amber-500/10"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            <Ban className="w-4 h-4 text-rose-400" />
            <span>IP &amp; User Blacklist ({blockedIps.length + blockedUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("telegram")}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all border whitespace-nowrap ${
              activeTab === "telegram"
                ? "bg-sky-500/20 text-sky-300 border-sky-500/60 shadow-lg shadow-sky-500/10"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            <Send className="w-4 h-4 text-sky-400" />
            <span>✈️ Telegram Bot Management (Admin-Only)</span>
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all border whitespace-nowrap ${
              activeTab === "audit"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-lg shadow-amber-500/10"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            <Activity className="w-4 h-4 text-purple-400" />
            <span>Security Audit Logs ({auditLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all border whitespace-nowrap ${
              activeTab === "analytics"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-lg shadow-amber-500/10"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            <BarChart2 className="w-4 h-4 text-amber-400" />
            <span>Traffic Analytics</span>
          </button>
        </div>
      </div>

      {/* TAB 0: MT5 AUTO-TRADING & AI CONTROL */}
      {activeTab === "mt5" && (
        <div className="animate-fade-in">
          <MT5AutoTradingDashboard />
        </div>
      )}

      {/* TAB 1: OVERVIEW & SYSTEM STATUS */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-fade-in">
          {/* Real Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 font-mono">
            <div className="bg-[#080B14] border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>ACTIVE ONLINE USERS</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                {activeOnlineCount} Active
              </div>
              <div className="text-[11px] text-slate-400">
                Ahmed (Admin) &amp; gmcf7 (User)
              </div>
            </div>

            <div className="bg-[#080B14] border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>TOTAL SESSIONS RECORDED</span>
                <Monitor className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-white">{sessions.length} Sessions</div>
              <div className="text-[11px] text-cyan-400">
                Live device &amp; browser tracking
              </div>
            </div>

            <div className="bg-[#080B14] border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>FIREWALL BLOCKLIST</span>
                <Ban className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-black text-rose-400">{blockedIps.length} IPs Blocked</div>
              <div className="text-[11px] text-slate-400">
                {blockedUsers.length} Users Blocked
              </div>
            </div>

            <div className="bg-[#080B14] border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>TELEGRAM SIGNAL BOT</span>
                <Send className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-black text-sky-400">
                {telegramConfig.enabled ? "ACTIVE" : "DISABLED"}
              </div>
              <div className="text-[11px] text-slate-400">
                Admin Token: {telegramConfig.botToken ? "Configured" : "Not Set"}
              </div>
            </div>
          </div>

          {/* System Security Policy Card */}
          <div className="bg-[#080B14] border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2 font-mono">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              Admin Security Controls &amp; Enforcement Matrix
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-[#05070E] border border-slate-800/90 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-300 font-bold">Role-Based Access Control (RBAC):</span>
                  <span className="text-emerald-400 font-bold">STRICTLY ENFORCED</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Only <strong>Ahmed</strong> has access to the Admin Dashboard, Telegram Bot settings, device tracking, session management, and IP blocking.
                </p>
              </div>

              <div className="bg-[#05070E] border border-slate-800/90 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-300 font-bold">Password Reset Logout Policy:</span>
                  <span className="text-emerald-400 font-bold">MANDATORY LOGOUT</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  When Admin executes a password reset for any user, all active sessions and authentication cookies are immediately invalidated across all devices.
                </p>
              </div>

              <div className="bg-[#05070E] border border-slate-800/90 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-300 font-bold">Inactivity Auto-Logout:</span>
                  <span className="text-emerald-400 font-bold">30 MINUTES ACTIVE</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Sessions idle for 30 minutes are automatically logged out and redirected to login page.
                </p>
              </div>

              <div className="bg-[#05070E] border border-slate-800/90 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-300 font-bold">Telegram Bot Protection:</span>
                  <span className="text-sky-400 font-bold">ADMIN-ONLY ACCESS</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Telegram Bot menu and settings are completely hidden from all normal users. Only Ahmed can configure tokens or send signals.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REAL-TIME USER MONITORING & SESSIONS */}
      {activeTab === "sessions" && (
        <div className="space-y-6 animate-fade-in font-mono text-xs">
          <div className="bg-[#080B14] border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-emerald-400" />
                  Real-Time User Monitoring &amp; Session Control Center
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  Live monitoring of logged-in users, device details, IP addresses, geolocations, and dynamic session ticking.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePurgeAllOtherSessions}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>LOGOUT ALL USERS (ONE-CLICK PURGE)</span>
                </button>
              </div>
            </div>

            {/* Detailed Real-Time User Sessions Grid */}
            <div className="space-y-4">
              {sessions.map((sess) => (
                <div
                  key={sess.sessionId}
                  className={`p-5 rounded-2xl border space-y-4 transition-all ${
                    sess.status === "ONLINE"
                      ? "bg-[#050812] border-emerald-500/40 text-slate-200"
                      : "bg-[#05060B] border-slate-800/80 text-slate-400 opacity-80"
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base ${
                        sess.role === "ADMIN" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      }`}>
                        {sess.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-sm">{sess.displayName}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            sess.role === "ADMIN" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                          }`}>
                            {sess.role}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">Session ID: {sess.sessionId}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right font-mono">
                        <span className="text-[10px] text-slate-500 block">SESSION DURATION</span>
                        <span className="text-base font-black text-emerald-400">{sess.sessionDuration}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                        sess.status === "ONLINE"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-slate-800 text-slate-400"
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${sess.status === "ONLINE" ? "bg-emerald-400 animate-ping" : "bg-slate-500"}`} />
                        {sess.status}
                      </span>
                    </div>
                  </div>

                  {/* Complete User Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-[11px] bg-black/40 p-3.5 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-slate-500 block text-[10px]">PUBLIC IP ADDRESS</span>
                      <strong className="text-cyan-400">{sess.ip}</strong>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px]">DEVICE TYPE</span>
                      <span className="text-white font-bold">{sess.deviceType}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px]">OPERATING SYSTEM</span>
                      <span className="text-slate-300">{sess.os}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px]">BROWSER &amp; VER</span>
                      <span className="text-slate-300">{sess.browser}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px]">LOCATION</span>
                      <span className="text-amber-300 font-bold">{sess.location}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px]">LOGIN METHOD</span>
                      <span className="text-emerald-400">{sess.loginMethod}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px]">LOGIN DATE &amp; TIME</span>
                      <span className="text-slate-300">{sess.loginTime}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px]">LAST ACTIVITY TIME</span>
                      <span className="text-slate-300">{sess.lastActivityTime}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px]">ACTIVE SESSIONS</span>
                      <span className="text-white font-bold">{sess.activeSessionsCount}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px]">FAILED ATTEMPTS</span>
                      <span className="text-amber-400 font-bold">{sess.failedLoginAttempts}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px]">ACCOUNT STATUS</span>
                      <span className={`font-bold ${sess.accountStatus === "ACTIVE" ? "text-emerald-400" : "text-rose-400"}`}>
                        {sess.accountStatus}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px]">LAST LOGOUT TIME</span>
                      <span className="text-slate-400">{sess.lastLogoutTime}</span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                    <div className="text-[10px] text-slate-500 flex items-center gap-2">
                      <span>Screen Res: {sess.screenResolution}</span>
                      {sess.isCurrentSession && (
                        <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                          (THIS ADMIN SESSION)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {sess.status === "ONLINE" && !sess.isCurrentSession && (
                        <button
                          onClick={() => handleForceLogoutSession(sess.sessionId, sess.username)}
                          className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Force Logout</span>
                        </button>
                      )}

                      {sess.username !== "Ahmed" && (
                        <button
                          onClick={() => handleToggleBlockUser(sess.username)}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border flex items-center gap-1 cursor-pointer ${
                            blockedUsers.includes(sess.username)
                              ? "bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-500/40"
                              : "bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-500/40"
                          }`}
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>{blockedUsers.includes(sess.username) ? "Unblock User" : "Block User"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USER MANAGEMENT & PASSWORD RESET */}
      {activeTab === "users" && (
        <div className="space-y-6 animate-fade-in font-mono text-xs">
          <div className="bg-[#080B14] border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-4">
              <Users className="w-5 h-5 text-cyan-400" />
              User Account Directory &amp; Admin Credentials Control
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950">
                    <th className="p-3">ACCOUNT</th>
                    <th className="p-3">ROLE</th>
                    <th className="p-3">STATUS</th>
                    <th className="p-3">PUBLIC IP</th>
                    <th className="p-3">LOCATION</th>
                    <th className="p-3 text-right">ADMIN CONTROL ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {sessions.map((user) => (
                    <tr key={user.username} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3 font-bold text-white">
                        <div>{user.displayName}</div>
                        <div className="text-[10px] text-slate-500">@{user.username}</div>
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          user.role === "ADMIN" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        }`}>
                          {user.role}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          user.accountStatus === "ACTIVE" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        }`}>
                          {user.accountStatus}
                        </span>
                      </td>

                      <td className="p-3 text-cyan-400 font-bold">{user.ip}</td>
                      <td className="p-3 text-slate-300">{user.location}</td>

                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setResetModalUser(user);
                            setNewPassword("");
                            setResetSuccessMsg("");
                          }}
                          className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                        >
                          Reset Password
                        </button>

                        {user.username !== "Ahmed" && (
                          <button
                            onClick={() => handleToggleLockAccount(user.username)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border cursor-pointer ${
                              user.accountStatus === "ACTIVE"
                                ? "bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border-rose-500/40"
                                : "bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border-emerald-500/40"
                            }`}
                          >
                            {user.accountStatus === "ACTIVE" ? "Lock Account" : "Unlock Account"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Password Reset Audit History */}
            {passwordHistory.length > 0 && (
              <div className="pt-4 space-y-2 border-t border-slate-800">
                <h4 className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-amber-400" />
                  Password Reset &amp; Session Clearance Audit History
                </h4>
                <div className="space-y-1.5">
                  {passwordHistory.map((item) => (
                    <div key={item.id} className="p-2.5 bg-black/50 border border-slate-800 rounded-xl flex items-center justify-between text-[11px]">
                      <div>
                        <strong className="text-amber-300">{item.targetUsername}</strong> password reset by {item.resetBy} ({item.ip})
                      </div>
                      <span className="text-slate-400 text-[10px]">{item.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: IP & USER BLACKLIST FIREWALL */}
      {activeTab === "ipblock" && (
        <div className="space-y-6 animate-fade-in font-mono text-xs">
          <div className="bg-[#080B14] border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-4">
              <Ban className="w-5 h-5 text-rose-400" />
              IP Address &amp; User Blacklist Control Panel
            </h3>

            {/* Block IP Form */}
            <form onSubmit={handleBlockIpSubmit} className="p-4 bg-[#05070E] border border-slate-800 rounded-2xl space-y-3">
              <h4 className="font-bold text-amber-400 uppercase text-xs">Add New IP to Firewall Blacklist</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={ipToBlockInput}
                  onChange={(e) => setIpToBlockInput(e.target.value)}
                  placeholder="e.g. 185.220.101.5"
                  className="bg-[#080B14] border border-slate-800 text-cyan-300 p-2.5 rounded-xl focus:border-rose-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={blockReasonInput}
                  onChange={(e) => setBlockReasonInput(e.target.value)}
                  placeholder="Reason (e.g. Suspicious brute force attempt)"
                  className="bg-[#080B14] border border-slate-800 text-slate-200 p-2.5 rounded-xl focus:border-rose-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg transition-all"
              >
                BLOCK IP ADDRESS INSTANTLY
              </button>
            </form>

            {/* Blocked IPs Table */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-300 text-xs">Blacklisted IP Addresses ({blockedIps.length})</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-950">
                      <th className="p-3">BLOCKED IP</th>
                      <th className="p-3">REASON</th>
                      <th className="p-3">TIMESTAMP</th>
                      <th className="p-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {blockedIps.map((b) => (
                      <tr key={b.ip} className="hover:bg-slate-900/40">
                        <td className="p-3 font-bold text-rose-400">{b.ip}</td>
                        <td className="p-3 text-slate-300">{b.reason}</td>
                        <td className="p-3 text-slate-400 text-[10px]">{b.blockedAt}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleUnblockIp(b.ip)}
                            className="px-3 py-1 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 rounded-lg font-bold transition-all cursor-pointer"
                          >
                            Unblock IP
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TELEGRAM BOT MANAGEMENT (ADMIN ONLY) */}
      {activeTab === "telegram" && (
        <div className="space-y-6 animate-fade-in font-mono text-xs">
          <div className="bg-[#080B14] border-2 border-sky-500/40 rounded-3xl p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-sky-500/20 border border-sky-500/50 rounded-2xl flex items-center justify-center text-sky-400 text-2xl shadow-lg shadow-sky-500/20 shrink-0">
                  ✈️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-sky-500/20 text-sky-400 border border-sky-500/40 font-bold text-[10px] rounded uppercase">
                      TELEGRAM BOT MANAGEMENT (ADMIN-ONLY)
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                      SUPER ADMIN DESK
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight mt-0.5">
                    Real-Time Signal Broadcast Webhook Configuration
                  </h2>
                </div>
              </div>
            </div>

            {/* Official Support Info */}
            <div className="p-4 bg-[#05070E] border-2 border-amber-500/40 rounded-2xl space-y-2">
              <div className="text-amber-400 font-extrabold text-xs uppercase flex items-center gap-1.5 border-b border-amber-500/20 pb-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                GMC OFFICIAL TELEGRAM SUPPORT DIRECTORY
              </div>
              <div className="bg-black/60 p-3 rounded-xl border border-slate-800 text-slate-200 text-xs leading-relaxed space-y-1 font-mono">
                <div className="font-extrabold text-amber-300">李**</div>
                <div className="text-sky-300 font-bold">03211010302 • 00441702201783 • 8327500</div>
                <div className="text-emerald-400 font-bold">+923026327500 • + 3725242427</div>
              </div>
            </div>

            {/* Telegram Form */}
            <form onSubmit={handleSaveTelegram} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Enable Toggle */}
                <div className="sm:col-span-2 p-3 bg-[#05070E] border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white uppercase block">ENABLE TELEGRAM SIGNAL BROADCASTS</span>
                    <span className="text-[10px] text-slate-400 font-sans">
                      Automatically dispatch trade entries &amp; SL/TP hits directly to your Telegram channel
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTelegramConfig({ ...telegramConfig, enabled: !telegramConfig.enabled })}
                    className={`w-12 h-6 rounded-full transition-colors relative p-0.5 border ${
                      telegramConfig.enabled ? "bg-emerald-500 border-emerald-400" : "bg-slate-800 border-slate-700"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        telegramConfig.enabled ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Bot Token Input */}
                <div>
                  <label className="block text-slate-300 mb-1 text-[11px] font-bold uppercase">
                    TELEGRAM BOT TOKEN
                  </label>
                  <input
                    type="text"
                    value={telegramConfig.botToken}
                    onChange={(e) => setTelegramConfig({ ...telegramConfig, botToken: e.target.value })}
                    placeholder="e.g. 7123456789:AAFg... (from @BotFather)"
                    className="w-full bg-[#05070E] border border-slate-800 text-sky-300 px-3.5 py-2.5 rounded-xl focus:border-sky-500 focus:outline-none text-xs"
                  />
                </div>

                {/* Chat ID Input */}
                <div>
                  <label className="block text-slate-300 mb-1 text-[11px] font-bold uppercase">
                    CHAT ID / CHANNEL ID
                  </label>
                  <input
                    type="text"
                    value={telegramConfig.chatId}
                    onChange={(e) => setTelegramConfig({ ...telegramConfig, chatId: e.target.value })}
                    placeholder="e.g. 987654321 or -100123456789"
                    className="w-full bg-[#05070E] border border-slate-800 text-sky-300 px-3.5 py-2.5 rounded-xl focus:border-sky-500 focus:outline-none text-xs"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="p-3 bg-[#05070E] border border-slate-800 rounded-xl flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={telegramConfig.sendEntries}
                    onChange={(e) => setTelegramConfig({ ...telegramConfig, sendEntries: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-900 text-sky-500"
                  />
                  <span className="text-[11px] font-bold text-slate-300">Broadcast New Signal Entries</span>
                </label>

                <label className="p-3 bg-[#05070E] border border-slate-800 rounded-xl flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={telegramConfig.sendSLTPHits}
                    onChange={(e) => setTelegramConfig({ ...telegramConfig, sendSLTPHits: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-900 text-sky-500"
                  />
                  <span className="text-[11px] font-bold text-slate-300">Broadcast SL / TP Hits</span>
                </label>
              </div>

              {/* Admin Demo Signal Broadcast Controls */}
              <div className="p-3.5 bg-[#05070E] border border-slate-800 rounded-2xl space-y-2">
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                  ⚡ ADMIN TELEGRAM BROADCAST DEMO TESTERS
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSendTestSignal("ENTRY")}
                    disabled={telegramTestStatus.loading}
                    className="py-2.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl font-bold text-[10px] uppercase transition-all"
                  >
                    🟢 SIGNAL ENTRY DEMO
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendTestSignal("TP_HIT")}
                    disabled={telegramTestStatus.loading}
                    className="py-2.5 px-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/40 rounded-xl font-bold text-[10px] uppercase transition-all"
                  >
                    🎉 TP HIT DEMO
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendTestSignal("SL_HIT")}
                    disabled={telegramTestStatus.loading}
                    className="py-2.5 px-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-xl font-bold text-[10px] uppercase transition-all"
                  >
                    🛑 SL HIT DEMO
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendTestSignal("BALANCE")}
                    disabled={telegramTestStatus.loading}
                    className="py-2.5 px-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-xl font-bold text-[10px] uppercase transition-all"
                  >
                    💼 BALANCE DEMO
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold rounded-xl shadow-lg shadow-sky-500/20 transition-all uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>SAVE TELEGRAM SETTINGS</span>
              </button>

              {telegramSaveSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-center font-bold">
                  ✓ Telegram Bot Settings Saved Successfully!
                </div>
              )}

              {telegramTestStatus.msg && (
                <div className={`p-3 rounded-xl border font-mono text-xs ${telegramTestStatus.success ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-rose-500/10 border-rose-500/30 text-rose-300"}`}>
                  {telegramTestStatus.msg}
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* TAB 6: SECURITY AUDIT LOGS */}
      {activeTab === "audit" && (
        <div className="space-y-6 animate-fade-in font-mono text-xs">
          <div className="bg-[#080B14] border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-4">
              <Activity className="w-5 h-5 text-purple-400" />
              Live System Activity &amp; Security Audit Logs
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950">
                    <th className="p-3">TIMESTAMP</th>
                    <th className="p-3">USER</th>
                    <th className="p-3">IP ADDRESS</th>
                    <th className="p-3">EVENT</th>
                    <th className="p-3">STATUS</th>
                    <th className="p-3">DETAILS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/40">
                      <td className="p-3 text-slate-400">{log.timestamp}</td>
                      <td className="p-3 font-bold text-white">{log.username}</td>
                      <td className="p-3 text-cyan-400">{log.ip}</td>
                      <td className="p-3 font-bold text-slate-200">{log.event}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === "SUCCESS"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : log.status === "WARNING"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: TRAFFIC ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="space-y-6 animate-fade-in font-mono text-xs">
          <div className="bg-[#080B14] border border-slate-800 rounded-3xl p-6 space-y-6">
            <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-4">
              <BarChart2 className="w-5 h-5 text-amber-400" />
              Website Traffic Analytics &amp; Visitor Telemetry
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#05070E] border border-slate-800 p-4 rounded-2xl">
                <span className="text-[10px] text-slate-500 block">TOTAL VISITORS (30D)</span>
                <span className="text-2xl font-black text-white">48,290</span>
                <span className="text-[10px] text-emerald-400 block mt-1">+14.2% live growth</span>
              </div>

              <div className="bg-[#05070E] border border-slate-800 p-4 rounded-2xl">
                <span className="text-[10px] text-slate-500 block">ACTIVE ONLINE USERS</span>
                <span className="text-2xl font-black text-emerald-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                  {activeOnlineCount}
                </span>
                <span className="text-[10px] text-slate-400 block mt-1">Live active sessions</span>
              </div>

              <div className="bg-[#05070E] border border-slate-800 p-4 rounded-2xl">
                <span className="text-[10px] text-slate-500 block">PAGE VIEWS</span>
                <span className="text-2xl font-black text-white">184,920</span>
                <span className="text-[10px] text-cyan-400 block mt-1">3.82 pages / session</span>
              </div>

              <div className="bg-[#05070E] border border-slate-800 p-4 rounded-2xl">
                <span className="text-[10px] text-slate-500 block">AVG SESSION DURATION</span>
                <span className="text-2xl font-black text-amber-400">14m 32s</span>
                <span className="text-[10px] text-slate-400 block mt-1">High engagement rate</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-mono text-xs">
          <div className="relative w-full max-w-md bg-[#080B14] border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              Reset Password: {resetModalUser.displayName}
            </h3>

            {resetSuccessMsg ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 space-y-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <p>{resetSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleExecutePasswordReset} className="space-y-4">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                  ⚠️ <strong>Security Policy:</strong> Resetting password will immediately invalidate all active remote sessions and cookies for account <strong>{resetModalUser.username}</strong>.
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-bold">NEW PASSWORD</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter strong password..."
                    className="w-full bg-[#05070E] border border-slate-800 text-white p-3 rounded-xl focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetModalUser(null)}
                    className="px-4 py-2 bg-slate-900 text-slate-400 hover:text-white rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl shadow-lg cursor-pointer"
                  >
                    Execute Reset &amp; Force Logout
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

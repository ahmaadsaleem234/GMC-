// Real-Time User Session Tracking, Device Parsing & Admin Security Control Engine

export interface UserSessionData {
  sessionId: string;
  username: string;
  role: "ADMIN" | "USER";
  displayName: string;
  ip: string;
  deviceType: "Desktop" | "Mobile" | "Tablet";
  os: string;
  browser: string;
  location: string;
  loginTime: string;
  loginTimestamp: number;
  lastActivityTime: string;
  lastActivityTimestamp: number;
  status: "ONLINE" | "OFFLINE" | "IDLE";
  sessionDuration: string; // Dynamic HH:MM:SS
  activeSessionsCount: number;
  loginMethod: "Password + 2FA" | "Standard Password" | "Session Token";
  failedLoginAttempts: number;
  accountStatus: "ACTIVE" | "LOCKED" | "BLOCKED";
  lastLogoutTime: string;
  isCurrentSession: boolean;
  screenResolution: string;
}

export interface ActivityAuditLog {
  id: string;
  timestamp: string;
  username: string;
  role: string;
  ip: string;
  event: string;
  status: "SUCCESS" | "WARNING" | "BLOCKED" | "CRITICAL";
  details: string;
  deviceInfo: string;
}

export interface PasswordResetHistoryItem {
  id: string;
  timestamp: string;
  targetUsername: string;
  resetBy: string;
  ip: string;
  forcedSessionsInvalidated: number;
}

export interface BlockedIpItem {
  ip: string;
  reason: string;
  blockedAt: string;
  blockedBy: string;
}

// Keys for persistence
const SESSIONS_STORAGE_KEY = "gmc_active_user_sessions_v2";
const AUDIT_LOGS_STORAGE_KEY = "gmc_security_audit_logs_v2";
const BLOCKED_IPS_KEY = "gmc_blocked_ips_list";
const BLOCKED_USERS_KEY = "gmc_blocked_users_list";
const PASSWORD_RESETS_KEY = "gmc_password_reset_history";

// Helper to detect Device Type, OS, and Browser from Navigator User Agent
export function detectDeviceAndBrowserInfo(): {
  deviceType: "Desktop" | "Mobile" | "Tablet";
  os: string;
  browser: string;
  resolution: string;
} {
  const ua = navigator.userAgent;
  let deviceType: "Desktop" | "Mobile" | "Tablet" = "Desktop";
  let os = "Unknown OS";
  let browser = "Unknown Browser";

  // Device type
  if (/mobile/i.test(ua)) {
    deviceType = "Mobile";
  } else if (/ipad|tablet|playbook|silk/i.test(ua)) {
    deviceType = "Tablet";
  }

  // OS Detection
  if (ua.indexOf("Mac OS X") !== -1) {
    os = "macOS";
    if (/Mac OS X 10_15_7|14_|15_|16_/.test(ua)) os = "macOS Sequoia / Sonoma";
  } else if (ua.indexOf("Windows") !== -1) {
    os = "Windows 11 / 10";
  } else if (ua.indexOf("Android") !== -1) {
    os = "Android 14";
  } else if (ua.indexOf("iPhone") !== -1 || ua.indexOf("iPad") !== -1) {
    os = "iOS 17.5";
  } else if (ua.indexOf("Linux") !== -1) {
    os = "Linux x86_64";
  }

  // Browser Detection
  if (ua.indexOf("Chrome") !== -1 && ua.indexOf("Edg") === -1 && ua.indexOf("OPR") === -1) {
    const match = ua.match(/Chrome\/([0-9.]+)/);
    browser = `Chrome ${match ? match[1].split(".")[0] : ""}`;
  } else if (ua.indexOf("Safari") !== -1 && ua.indexOf("Chrome") === -1) {
    const match = ua.match(/Version\/([0-9.]+)/);
    browser = `Safari ${match ? match[1] : ""}`;
  } else if (ua.indexOf("Firefox") !== -1) {
    const match = ua.match(/Firefox\/([0-9.]+)/);
    browser = `Firefox ${match ? match[1] : ""}`;
  } else if (ua.indexOf("Edg") !== -1) {
    const match = ua.match(/Edg\/([0-9.]+)/);
    browser = `Edge ${match ? match[1].split(".")[0] : ""}`;
  }

  const resolution = `${window.screen.width}x${window.screen.height}`;

  return { deviceType, os, browser, resolution };
}

// Asynchronously fetch Public IP & Geolocation
export async function fetchPublicIpAndGeo(): Promise<{ ip: string; location: string }> {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    if (res.ok) {
      const data = await res.json();
      const ip = data.ip || "197.240.12.88";
      
      // Try fetching country/city info
      try {
        const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          const city = geoData.city || "Riyadh";
          const country = geoData.country_name || "Saudi Arabia";
          return { ip, location: `${city}, ${country}` };
        }
      } catch (e) {
        // Fallback geo
      }
      return { ip, location: "Riyadh, Saudi Arabia" };
    }
  } catch (err) {
    // Network fallback
  }

  return { ip: "197.240.12.88", location: "Riyadh, Saudi Arabia" };
}

// Calculate dynamic session duration formatted as HH:MM:SS
export function calculateDuration(loginTimestamp: number): string {
  const diffSecs = Math.max(0, Math.floor((Date.now() - loginTimestamp) / 1000));
  const hrs = Math.floor(diffSecs / 3600);
  const mins = Math.floor((diffSecs % 3600) / 60);
  const secs = diffSecs % 60;
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

// Initial default sessions for Admin (Ahmed) and Normal User (gmcf7)
export function getStoredSessions(): UserSessionData[] {
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  const now = Date.now();
  const defaultSessions: UserSessionData[] = [
    {
      sessionId: "sess-ahmed-01",
      username: "Ahmed",
      role: "ADMIN",
      displayName: "Ahmed (Super Admin)",
      ip: "197.240.12.88",
      deviceType: "Desktop",
      os: "macOS Sequoia",
      browser: "Chrome 127.0",
      location: "Riyadh, Saudi Arabia",
      loginTime: new Date(now - 14 * 60 * 1000).toLocaleString(),
      loginTimestamp: now - 14 * 60 * 1000,
      lastActivityTime: new Date(now).toLocaleTimeString(),
      lastActivityTimestamp: now,
      status: "ONLINE",
      sessionDuration: "00:14:00",
      activeSessionsCount: 1,
      loginMethod: "Password + 2FA",
      failedLoginAttempts: 0,
      accountStatus: "ACTIVE",
      lastLogoutTime: "N/A",
      isCurrentSession: true,
      screenResolution: "2560x1440",
    },
    {
      sessionId: "sess-gmcf7-02",
      username: "gmcf7",
      role: "USER",
      displayName: "gmcf7 (Normal Trader)",
      ip: "82.165.44.12",
      deviceType: "Mobile",
      os: "iOS 17.5",
      browser: "Safari Mobile",
      location: "London, United Kingdom",
      loginTime: new Date(now - 45 * 60 * 1000).toLocaleString(),
      loginTimestamp: now - 45 * 60 * 1000,
      lastActivityTime: new Date(now - 2 * 60 * 1000).toLocaleTimeString(),
      lastActivityTimestamp: now - 2 * 60 * 1000,
      status: "ONLINE",
      sessionDuration: "00:45:00",
      activeSessionsCount: 1,
      loginMethod: "Standard Password",
      failedLoginAttempts: 0,
      accountStatus: "ACTIVE",
      lastLogoutTime: "Yesterday, 22:15",
      isCurrentSession: false,
      screenResolution: "393x852",
    },
  ];

  localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(defaultSessions));
  return defaultSessions;
}

export function saveSessions(sessions: UserSessionData[]) {
  try {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  } catch (e) {}
}

// Initial Audit Logs
export function getStoredAuditLogs(): ActivityAuditLog[] {
  try {
    const raw = localStorage.getItem(AUDIT_LOGS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  const defaultLogs: ActivityAuditLog[] = [
    {
      id: "log-101",
      timestamp: new Date().toLocaleTimeString(),
      username: "Ahmed",
      role: "ADMIN",
      ip: "197.240.12.88",
      event: "Super Admin 2FA Verification Success",
      status: "SUCCESS",
      details: "Granted full administrative control over sessions, RBAC, and Telegram Bot.",
      deviceInfo: "MacBook Pro M3 Max • Chrome 127.0",
    },
    {
      id: "log-102",
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toLocaleTimeString(),
      username: "gmcf7",
      role: "USER",
      ip: "82.165.44.12",
      event: "Normal User Auth Success",
      status: "SUCCESS",
      details: "Logged into trading dashboard. Telegram Bot management hidden.",
      deviceInfo: "iPhone 15 Pro Max • Safari Mobile",
    },
    {
      id: "log-103",
      timestamp: new Date(Date.now() - 22 * 60 * 1000).toLocaleTimeString(),
      username: "Unrecognized User",
      role: "GUEST",
      ip: "185.220.101.5",
      event: "Unauthorized Access Attempt Blocked",
      status: "BLOCKED",
      details: "Invalid password supplied. Generic security defense response returned.",
      deviceInfo: "Linux x86_64 • Unknown Client",
    },
  ];

  localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(defaultLogs));
  return defaultLogs;
}

export function saveAuditLogs(logs: ActivityAuditLog[]) {
  try {
    localStorage.setItem(AUDIT_LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {}
}

export function addAuditLog(log: Omit<ActivityAuditLog, "id" | "timestamp">) {
  const current = getStoredAuditLogs();
  const newLog: ActivityAuditLog = {
    ...log,
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString(),
  };
  saveAuditLogs([newLog, ...current]);
}

// Blocked IPs List
export function getBlockedIps(): BlockedIpItem[] {
  try {
    const raw = localStorage.getItem(BLOCKED_IPS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [
    {
      ip: "185.220.101.5",
      reason: "5 consecutive failed login attempts detected",
      blockedAt: new Date(Date.now() - 3600000).toLocaleString(),
      blockedBy: "Ahmed (Admin)",
    },
  ];
}

export function saveBlockedIps(ips: BlockedIpItem[]) {
  try {
    localStorage.setItem(BLOCKED_IPS_KEY, JSON.stringify(ips));
  } catch (e) {}
}

// Blocked Users List
export function getBlockedUsers(): string[] {
  try {
    const raw = localStorage.getItem(BLOCKED_USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

export function saveBlockedUsers(users: string[]) {
  try {
    localStorage.setItem(BLOCKED_USERS_KEY, JSON.stringify(users));
  } catch (e) {}
}

// Password Reset History
export function getPasswordResetHistory(): PasswordResetHistoryItem[] {
  try {
    const raw = localStorage.getItem(PASSWORD_RESETS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [
    {
      id: "rst-01",
      timestamp: new Date(Date.now() - 86400000).toLocaleString(),
      targetUsername: "gmcf7",
      resetBy: "Ahmed (Admin)",
      ip: "197.240.12.88",
      forcedSessionsInvalidated: 2,
    },
  ];
}

export function savePasswordResetHistory(items: PasswordResetHistoryItem[]) {
  try {
    localStorage.setItem(PASSWORD_RESETS_KEY, JSON.stringify(items));
  } catch (e) {}
}

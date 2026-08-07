/**
 * Secure Persistent Session Manager for GMC Trading AI Platform
 * Handles 14-Day "Remember Me" encrypted persistent browser sessions & auto-login
 */

export interface UserSession {
  username: string;
  token: string;
  createdAt: number;
  expiresAt: number;
  rememberMe: boolean;
  signature: string;
}

const SESSION_STORAGE_KEY = "gmc_secure_session_v2";
const SESSION_COOKIE_NAME = "gmc_remember_token";
const DEFAULT_REMEMBER_DAYS = 14; // 14 Days Persistent Session

/**
 * Generate a simple HMAC-like device signature to prevent manual tampering of stored session state
 */
function generateSignature(username: string, createdAt: number, expiresAt: number, token: string): string {
  const secret = "GMC_INSTITUTIONAL_AI_SECURE_SALT_966305";
  const raw = `${username}:${createdAt}:${expiresAt}:${token}:${secret}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36) + "gmc_sec";
}

/**
 * Obfuscate/encrypt session string
 */
function encryptData(str: string): string {
  try {
    return btoa(encodeURIComponent(str).split("").reverse().join(""));
  } catch {
    return btoa(str);
  }
}

/**
 * Decrypt obfuscated session string
 */
function decryptData(encryptedStr: string): string {
  try {
    const rev = atob(encryptedStr);
    return decodeURIComponent(rev.split("").reverse().join(""));
  } catch {
    try {
      return atob(encryptedStr);
    } catch {
      return "";
    }
  }
}

/**
 * Save user session to persistent localStorage or sessionStorage with 14-day expiration
 */
export function createSession(username: string, rememberMe: boolean = true, durationDays: number = DEFAULT_REMEMBER_DAYS): UserSession {
  const now = Date.now();
  const durationMs = (rememberMe ? durationDays : 1) * 24 * 60 * 60 * 1000; // 14 days or 1 day
  const expiresAt = now + durationMs;

  // Generate secure random session token
  const randomBytes = new Uint8Array(16);
  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < 16; i++) randomBytes[i] = Math.floor(Math.random() * 256);
  }
  const token = Array.from(randomBytes, (b) => b.toString(16).padStart(2, "0")).join("");

  const signature = generateSignature(username, now, expiresAt, token);

  const session: UserSession = {
    username,
    token,
    createdAt: now,
    expiresAt,
    rememberMe,
    signature,
  };

  const encrypted = encryptData(JSON.stringify(session));

  if (typeof window !== "undefined") {
    if (rememberMe) {
      // Persistent session across browser restarts for 14 days
      localStorage.setItem(SESSION_STORAGE_KEY, encrypted);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);

      // Set encrypted cookie as backup
      try {
        const maxAgeSec = Math.floor(durationMs / 1000);
        document.cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(encrypted)}; max-age=${maxAgeSec}; path=/; SameSite=Strict; Secure`;
      } catch (e) {
        console.warn("Cookie set failed, fallback to localStorage", e);
      }
    } else {
      // Session-only (expires when tab/browser closes)
      sessionStorage.setItem(SESSION_STORAGE_KEY, encrypted);
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }

  return session;
}

/**
 * Retrieve and validate current active session. Returns valid session or null if expired/tampered.
 */
export function getValidSession(): UserSession | null {
  if (typeof window === "undefined") return null;

  try {
    // 1. Try LocalStorage (Remember Me)
    let rawEncrypted = localStorage.getItem(SESSION_STORAGE_KEY);

    // 2. Fallback to SessionStorage if not in LocalStorage
    if (!rawEncrypted) {
      rawEncrypted = sessionStorage.getItem(SESSION_STORAGE_KEY);
    }

    // 3. Fallback to Cookie if neither localStorage nor sessionStorage found
    if (!rawEncrypted && document.cookie) {
      const match = document.cookie.match(new RegExp("(?:^|; )" + SESSION_COOKIE_NAME + "=([^;]*)"));
      if (match) {
        rawEncrypted = decodeURIComponent(match[1]);
      }
    }

    if (!rawEncrypted) return null;

    const decryptedJson = decryptData(rawEncrypted);
    if (!decryptedJson) {
      clearSession();
      return null;
    }

    const session: UserSession = JSON.parse(decryptedJson);

    // Validate structure
    if (!session.username || !session.expiresAt || !session.signature || !session.token) {
      clearSession();
      return null;
    }

    // Verify tamper-proof signature
    const expectedSig = generateSignature(session.username, session.createdAt, session.expiresAt, session.token);
    if (session.signature !== expectedSig) {
      console.warn("🔒 Security alert: Invalid session signature detected. Session purged.");
      clearSession();
      return null;
    }

    // Check expiration timestamp
    if (Date.now() >= session.expiresAt) {
      console.info("🔒 Session expired. Requiring re-authentication.");
      clearSession();
      return null;
    }

    return session;
  } catch (err) {
    console.error("Error validating session:", err);
    clearSession();
    return null;
  }
}

/**
 * Immediately destroy current session on manual logout or security reset
 */
export function clearSession(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);

    // Expire cookie
    document.cookie = `${SESSION_COOKIE_NAME}=; max-age=0; path=/; SameSite=Strict; Secure`;
  } catch (e) {
    console.error("Error clearing session:", e);
  }
}

/**
 * Format remaining session duration in days and hours
 */
export function formatSessionRemainingTime(expiresAt: number): string {
  const diffMs = expiresAt - Date.now();
  if (diffMs <= 0) return "Expired";

  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (days > 0) {
    return `${days} Day${days > 1 ? "s" : ""} ${hours} Hour${hours !== 1 ? "s" : ""}`;
  }
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m`;
}

let fsModule: any = null;
let pathModule: any = null;
try {
  if (typeof process !== "undefined" && process.versions && process.versions.node) {
    fsModule = eval('require("fs")');
    pathModule = eval('require("path")');
  }
} catch (e) {
  // Edge runtime
}

export interface DispatchedEventRecord {
  key: string;
  tradeId?: string;
  event?: string;
  chatId?: string;
  textHash: string;
  dispatchedAt: number;
  dateTime: string;
}

const STORAGE_FILE = typeof process !== "undefined" && process.cwd && pathModule ? pathModule.join(process.cwd(), "data", "telegram_idempotency_store.json") : "telegram_idempotency_store.json";
const DEDUPLICATION_WINDOW_MS = 45 * 60 * 1000; // 45 minutes window for text hash

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16) + str.length.toString(16);
}

class TelegramIdempotencyRegistry {
  private dispatchedKeys: Set<string> = new Set();
  private records: DispatchedEventRecord[] = [];
  private textHashRecentMap: Map<string, number> = new Map(); // hash:chatId -> timestamp

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      if (fsModule && fsModule.existsSync && fsModule.existsSync(STORAGE_FILE)) {
        const raw = fsModule.readFileSync(STORAGE_FILE, "utf-8");
        const parsed: DispatchedEventRecord[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.records = parsed;
          for (const rec of parsed) {
            if (rec.key) this.dispatchedKeys.add(rec.key);
            if (rec.textHash) {
              const hashKey = `${rec.textHash}::${rec.chatId || "all"}`;
              this.textHashRecentMap.set(hashKey, rec.dispatchedAt);
            }
          }
        }
      }
    } catch (err) {
      // In edge environments, start fresh or load from KV
    }
  }

  private saveToDisk(): void {
    try {
      if (fsModule && typeof process !== "undefined" && process.cwd && pathModule) {
        const dataDir = pathModule.join(process.cwd(), "data");
        if (!fsModule.existsSync(dataDir)) {
          fsModule.mkdirSync(dataDir, { recursive: true });
        }
        // Retain the last 1,000 records
        const trimmed = this.records.slice(-1000);
        fsModule.writeFileSync(STORAGE_FILE, JSON.stringify(trimmed, null, 2), "utf-8");
      }
    } catch (err) {
      // In edge environments, handled via KV / memory
    }
  }

  /**
   * Extract trade/setup ID from message or key
   */
  public extractTradeId(text: string, alertId?: string): string | undefined {
    if (alertId) {
      const parts = alertId.split(/[:#_]/);
      if (parts[0]) return parts[0];
    }
    // Match Khatarnak Jugaad: KJ-15M-1221, KJ-5M-1244
    const kjMatch = text.match(/(?:SETUP ID|ID):\s*<code>(KJ-[0-9A-Za-z-]+)<\/code>/i) || text.match(/\b(KJ-[0-9A-Za-z-]+)\b/i);
    if (kjMatch) return kjMatch[1].toUpperCase();

    // Match Harami AI: HARAMI-XXXX, ID: #1740000000, trade-harami-XXXX
    const haramiMatch = text.match(/(?:SIGNAL ID|ID):\s*(?:<b>)?<code>#?([A-Za-z0-9_-]+)<\/code>/i) || text.match(/ID:\s*#([0-9]+)/i);
    if (haramiMatch) return `HARAMI-${haramiMatch[1]}`.toUpperCase();

    // Match War Room: WR-XXXX
    const wrMatch = text.match(/(?:SETUP ID|ID):\s*<code>(WR-[0-9A-Za-z-]+)<\/code>/i) || text.match(/\b(WR-[0-9A-Za-z-]+)\b/i);
    if (wrMatch) return wrMatch[1].toUpperCase();

    return undefined;
  }

  /**
   * Extract event type from message or key
   */
  public extractEventType(text: string, alertId?: string): string {
    if (alertId) {
      const upperAlert = alertId.toUpperCase();
      if (upperAlert.includes("TP1")) return "TP1_HIT";
      if (upperAlert.includes("TP2")) return "TP2_HIT";
      if (upperAlert.includes("TP3")) return "TP3_HIT";
      if (upperAlert.includes("FINAL_TP") || upperAlert.includes("TP4")) return "FINAL_TP_HIT";
      if (upperAlert.includes("SL_HIT") || upperAlert.includes("STOP_LOSS")) return "SL_HIT";
      if (upperAlert.includes("ENTRY")) return "ENTRY_HIT";
      if (upperAlert.includes("NEW_SETUP") || upperAlert.includes("SIGNAL")) return "NEW_SETUP";
      if (upperAlert.includes("INVALID")) return "INVALIDATED";
      if (upperAlert.includes("EXPIRE")) return "EXPIRED";
    }

    const t = text.toUpperCase();
    if (t.includes("FINAL TP HIT") || t.includes("TARGET 4 HIT") || t.includes("MAXIMUM TARGET HIT")) return "FINAL_TP_HIT";
    if (t.includes("TP3 HIT") || t.includes("TARGET 3 HIT")) return "TP3_HIT";
    if (t.includes("TP2 HIT") || t.includes("TARGET 2 HIT")) return "TP2_HIT";
    if (t.includes("TP1 HIT") || t.includes("TARGET 1 HIT")) return "TP1_HIT";
    if (t.includes("SL HIT") || t.includes("STOP LOSS HIT") || t.includes("STOP LOSS TRIGGERED")) return "SL_HIT";
    if (t.includes("ENTRY HIT") || t.includes("ENTRY ACTIVATED") || t.includes("TAPPED INTO")) return "ENTRY_HIT";
    if (t.includes("INVALIDATED") || t.includes("CANCELLED")) return "INVALIDATED";
    if (t.includes("EXPIRED")) return "EXPIRED";
    if (t.includes("SIGNAL ALERT") || t.includes("NEW SETUP") || t.includes("KHATARNAK JUGAAD") || t.includes("HARAMI AI MASTER")) return "NEW_SETUP";

    return "GENERAL_ALERT";
  }

  /**
   * Generate canonical text hash ignoring dynamic timestamps / seconds
   */
  public generateNormalizedHash(text: string): string {
    const normalized = text
      .replace(/\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/g, "") // remove ISO/date timestamps
      .replace(/\d{1,2}:\d{2}:\d{2}\s*(?:AM|PM|UTC)?/gi, "") // remove time strings
      .replace(/\s+/g, " ")
      .trim();
    try {
      if (typeof crypto !== "undefined" && typeof (crypto as any).createHash === "function") {
        return (crypto as any).createHash("sha256").update(normalized).digest("hex").substring(0, 24);
      }
    } catch (e) {}
    return simpleHash(normalized);
  }

  /**
   * Generate composite idempotency key
   */
  public resolveCompositeKey(alertId?: string, text?: string): string {
    if (alertId && alertId.includes("::")) return alertId.toUpperCase();
    const tradeId = this.extractTradeId(text || "", alertId);
    const event = this.extractEventType(text || "", alertId);
    if (tradeId) {
      return `${tradeId}::${event}`.toUpperCase();
    }
    if (alertId) {
      return `${alertId}::${event}`.toUpperCase();
    }
    const hash = this.generateNormalizedHash(text || "");
    return `HASH::${hash}::${event}`;
  }

  /**
   * Check if this alert/signal has already been dispatched.
   * Enforces 1 trade = 1 signal, and 1 event = 1 update.
   */
  public isDuplicate(
    alertId?: string,
    messageText: string = "",
    chatId?: string
  ): { isDuplicate: boolean; key: string; reason?: string } {
    const key = this.resolveCompositeKey(alertId, messageText);

    // 1. Direct composite key check (Permanent per trade & lifecycle event)
    if (this.dispatchedKeys.has(key)) {
      return {
        isDuplicate: true,
        key,
        reason: `Event key [${key}] has already been dispatched to Telegram.`,
      };
    }

    // 2. Text hash deduplication within sliding window (Prevents identical spam text)
    const textHash = this.generateNormalizedHash(messageText);
    const hashKey = `${textHash}::${chatId || "all"}`;
    const lastSent = this.textHashRecentMap.get(hashKey);
    const now = Date.now();

    if (lastSent && now - lastSent < DEDUPLICATION_WINDOW_MS) {
      const minutesAgo = Math.round((now - lastSent) / 60000);
      return {
        isDuplicate: true,
        key,
        reason: `Identical message text was already sent ${minutesAgo}m ago to chat ${chatId || "subscribers"}.`,
      };
    }

    return { isDuplicate: false, key };
  }

  /**
   * Mark an event as sent and persist
   */
  public markDispatched(
    alertId?: string,
    messageText: string = "",
    chatId?: string
  ): string {
    const key = this.resolveCompositeKey(alertId, messageText);
    const tradeId = this.extractTradeId(messageText, alertId);
    const event = this.extractEventType(messageText, alertId);
    const textHash = this.generateNormalizedHash(messageText);
    const now = Date.now();

    this.dispatchedKeys.add(key);
    const hashKey = `${textHash}::${chatId || "all"}`;
    this.textHashRecentMap.set(hashKey, now);

    const record: DispatchedEventRecord = {
      key,
      tradeId,
      event,
      chatId,
      textHash,
      dispatchedAt: now,
      dateTime: new Date().toISOString(),
    };

    this.records.push(record);
    this.saveToDisk();

    console.log(`[TELEGRAM IDEMPOTENCY]: Registered dispatched event [${key}] (Total sent: ${this.dispatchedKeys.size})`);
    return key;
  }

  /**
   * Get audit statistics
   */
  public getStats() {
    return {
      totalDispatchedKeys: this.dispatchedKeys.size,
      totalRecords: this.records.length,
      recentRecords: this.records.slice(-20),
    };
  }

  /**
   * Reset registry (Super Admin only)
   */
  public resetRegistry() {
    this.dispatchedKeys.clear();
    this.records = [];
    this.textHashRecentMap.clear();
    try {
      if (fsModule && fsModule.existsSync && fsModule.existsSync(STORAGE_FILE)) {
        fsModule.unlinkSync(STORAGE_FILE);
      }
    } catch (e) {}
    console.log("[TELEGRAM IDEMPOTENCY]: Registry cleared.");
  }
}

export const serverTelegramIdempotency = new TelegramIdempotencyRegistry();

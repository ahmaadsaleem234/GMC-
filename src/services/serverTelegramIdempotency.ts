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

export interface IdempotencyStoreSchema {
  records: DispatchedEventRecord[];
  activeTradeId: string | null;
  activeTradeStartedAt: number;
  cooldownUntil: number;
  cooldownDurationMinutes: number;
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

  private lastNewSetupTimestamp: number = 0;
  private recentSetups: Array<{ direction: string; entry: number; timestamp: number }> = [];

  // 🛡️ STRICT SINGLE ACTIVE TRADE & COOLDOWN STATE
  private activeTradeId: string | null = null;
  private activeTradeStartedAt: number = 0;
  private cooldownUntil: number = 0;
  private cooldownDurationMinutes: number = 30;

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      if (fsModule && fsModule.existsSync && fsModule.existsSync(STORAGE_FILE)) {
        const raw = fsModule.readFileSync(STORAGE_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.records = parsed;
        } else if (parsed && typeof parsed === "object") {
          this.records = Array.isArray(parsed.records) ? parsed.records : [];
          this.activeTradeId = parsed.activeTradeId || null;
          this.activeTradeStartedAt = parsed.activeTradeStartedAt || 0;
          this.cooldownUntil = parsed.cooldownUntil || 0;
          if (typeof parsed.cooldownDurationMinutes === "number") {
            this.cooldownDurationMinutes = parsed.cooldownDurationMinutes;
          }
        }

        for (const rec of this.records) {
          if (rec.key) this.dispatchedKeys.add(rec.key);
          if (rec.textHash) {
            const hashKey = `${rec.textHash}::${rec.chatId || "all"}`;
            this.textHashRecentMap.set(hashKey, rec.dispatchedAt);
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
        const payload: IdempotencyStoreSchema = {
          records: trimmed,
          activeTradeId: this.activeTradeId,
          activeTradeStartedAt: this.activeTradeStartedAt,
          cooldownUntil: this.cooldownUntil,
          cooldownDurationMinutes: this.cooldownDurationMinutes,
        };
        fsModule.writeFileSync(STORAGE_FILE, JSON.stringify(payload, null, 2), "utf-8");
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
      if (parts[0] && (parts[0].startsWith("HA-") || parts[0].startsWith("KJ-") || parts[0].startsWith("WR-") || parts[0].startsWith("PH-") || parts[0].startsWith("HRM-") || parts[0].startsWith("RX-"))) {
        return parts[0].toUpperCase();
      }
    }
    // Match Central Signals: HA-101, KJ-101, WR-101, PH-101
    const centralMatch = text.match(/\b(HA-\d+|KJ-\d+|WR-\d+|PH-\d+)\b/i) || text.match(/(?:SETUP ID|ID):\s*<code>(HA-\d+|KJ-\d+|WR-\d+|PH-\d+)<\/code>/i);
    if (centralMatch) return centralMatch[1].toUpperCase();

    // Match Khatarnak Jugaad: KJ-15M-1221, KJ-5M-1244
    const kjMatch = text.match(/(?:SETUP ID|ID):\s*<code>(KJ-[0-9A-Za-z-]+)<\/code>/i) || text.match(/\b(KJ-[0-9A-Za-z-]+)\b/i);
    if (kjMatch) return kjMatch[1].toUpperCase();

    // Match Harami AI: HRM-XXXX, #HRM-XXXX, HARAMI-XXXX, ID: #1740000000, trade-harami-XXXX
    const hrmMatch = text.match(/#?(HRM-[0-9A-Za-z_-]+)/i);
    if (hrmMatch) return hrmMatch[1].replace(/^#/, "").toUpperCase();

    const haramiMatch = text.match(/(?:SIGNAL ID|ID):\s*(?:<b>)?<code>#?([A-Za-z0-9_-]+)<\/code>/i) || text.match(/ID:\s*#([0-9]+)/i);
    if (haramiMatch) return `HARAMI-${haramiMatch[1]}`.toUpperCase();

    // Match War Room: WR-XXXX
    const wrMatch = text.match(/(?:SETUP ID|ID):\s*<code>(WR-[0-9A-Za-z-]+)<\/code>/i) || text.match(/\b(WR-[0-9A-Za-z-]+)\b/i);
    if (wrMatch) return wrMatch[1].toUpperCase();

    // Match Retest-X: RX-XXXX, RETX-XXXX, RETEST-XXXX
    const rxMatch = text.match(/(?:SETUP ID|ID):\s*<code>(R[EX]TX?-[0-9A-Za-z-]+)<\/code>/i) || text.match(/\b(R[EX]TX?-[0-9A-Za-z-]+)\b/i);
    if (rxMatch) return rxMatch[1].toUpperCase();

    if (alertId) {
      const parts = alertId.split(/[:#_]/);
      if (parts[0]) return parts[0].toUpperCase();
    }

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
    if (t.includes("FINAL TP HIT") || t.includes("TARGET 4 HIT") || t.includes("MAXIMUM TARGET HIT") || t.includes("TP4 ALL TARGETS HIT")) return "FINAL_TP_HIT";
    if (t.includes("TP3 HIT") || t.includes("TARGET 3 HIT") || t.includes("TP3 REACHED")) return "TP3_HIT";
    if (t.includes("TP2 HIT") || t.includes("TARGET 2 HIT") || t.includes("TP2 REACHED")) return "TP2_HIT";
    if (t.includes("TP1 HIT") || t.includes("TARGET 1 HIT") || t.includes("TP1 REACHED")) return "TP1_HIT";
    if (t.includes("SL HIT") || t.includes("STOP LOSS HIT") || t.includes("STOP LOSS TRIGGERED")) return "SL_HIT";
    if (t.includes("ENTRY HIT") || t.includes("ENTRY ACTIVATED") || t.includes("TAPPED INTO")) return "ENTRY_HIT";
    if (t.includes("INVALIDATED") || t.includes("CANCELLED")) return "INVALIDATED";
    if (t.includes("EXPIRED")) return "EXPIRED";
    if (
      t.includes("SIGNAL ALERT") ||
      t.includes("NEW SETUP") ||
      t.includes("KHATARNAK JUGAAD") ||
      t.includes("HARAMI AI") ||
      t.includes("HARAMI AI MASTER") ||
      t.includes("WAR ROOM") ||
      t.includes("RETEST-X") ||
      t.includes("RETEST X") ||
      t.includes("ENTRY ZONE") ||
      t.includes("EXECUTION ZONE") ||
      t.includes("BEST ENTRY")
    ) return "NEW_SETUP";

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
   * Enforces:
   * 1. Strict 1 Active Trade Lock: While a trade is running, NO NEW trade signals can be broadcasted.
   * 2. Post-Trade Cooldown Lock: After TP/SL closes the trade, system waits for cooldown before allowing next trade.
   * 3. 1 Event = 1 Update: Entry, TP1, TP2, TP3, Final TP, SL can only be sent ONCE per trade.
   */
  public isDuplicate(
    alertId?: string,
    messageText: string = "",
    chatId?: string
  ): { isDuplicate: boolean; key: string; reason?: string } {
    const key = this.resolveCompositeKey(alertId, messageText);
    const tradeId = this.extractTradeId(messageText, alertId);
    const event = this.extractEventType(messageText, alertId);
    const now = Date.now();

    // 1. Direct composite key check (Permanent per trade & lifecycle event)
    if (this.dispatchedKeys.has(key)) {
      return {
        isDuplicate: true,
        key,
        reason: `Event key [${key}] has already been dispatched to Telegram.`,
      };
    }

    // 2. STRICT 1 ACTIVE TRADE LOCK FOR NEW TRADES
    if (event === "NEW_SETUP") {
      // If a trade is currently active on Telegram, block any competing or new trade signals
      if (this.activeTradeId) {
        if (tradeId && tradeId === this.activeTradeId) {
          return {
            isDuplicate: true,
            key,
            reason: `Setup signal for active trade #${this.activeTradeId} was already broadcasted. Waiting for TP/SL outcome.`,
          };
        }
        return {
          isDuplicate: true,
          key,
          reason: `Strict Single Active Trade Rule: Active trade #${this.activeTradeId} is currently running. Waiting for TP or SL hit before next trade.`,
        };
      }

      // If system is currently in post-trade cooldown, block new trade signals
      if (now < this.cooldownUntil) {
        const remainingSecs = Math.max(0, Math.round((this.cooldownUntil - now) / 1000));
        const remMins = Math.floor(remainingSecs / 60);
        const remSecs = remainingSecs % 60;
        const timeStr = `${remMins}m ${remSecs}s`;
        return {
          isDuplicate: true,
          key,
          reason: `Post-trade cooldown active (${timeStr} remaining). Next trade is blocked until cooldown completes.`,
        };
      }

      // Throttle: Never allow 2 new setups within 60 seconds of each other
      if (this.lastNewSetupTimestamp > 0 && now - this.lastNewSetupTimestamp < 60 * 1000) {
        return {
          isDuplicate: true,
          key,
          reason: `Global setup rate limit active. Another trade signal was broadcasted ${Math.round((now - this.lastNewSetupTimestamp) / 1000)}s ago.`,
        };
      }

      // Check Direction & Execution Zone against recent setups (15 minutes window)
      const isBuy = messageText.includes("BUY") || (alertId && alertId.includes("BUY"));
      const isSell = messageText.includes("SELL") || (alertId && alertId.includes("SELL"));
      const dir = isBuy ? "BUY" : isSell ? "SELL" : "UNKNOWN";

      const zoneMatch = messageText.match(/(?:Execution Zone|Entry Zone|Entry):\s*<code>?\$?([\d.]+)/i) || messageText.match(/\$?(\d{4}(?:\.\d+)?)/);
      const entryPx = zoneMatch ? parseFloat(zoneMatch[1]) : 0;

      if (dir !== "UNKNOWN" && entryPx > 1000) {
        const recentDupe = this.recentSetups.find(
          (s) => s.direction === dir && Math.abs(s.entry - entryPx) <= 8.0 && now - s.timestamp < 15 * 60 * 1000
        );
        if (recentDupe) {
          const minsAgo = Math.round((now - recentDupe.timestamp) / 60000);
          return {
            isDuplicate: true,
            key,
            reason: `Duplicate setup in ${dir} zone ($${entryPx.toFixed(2)} vs prior $${recentDupe.entry.toFixed(2)}) already broadcasted ${minsAgo}m ago.`,
          };
        }
      }
    }

    // 3. Text hash deduplication within sliding window (Prevents identical spam text)
    const textHash = this.generateNormalizedHash(messageText);
    const hashKey = `${textHash}::${chatId || "all"}`;
    const lastSent = this.textHashRecentMap.get(hashKey);

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

    if (event === "NEW_SETUP") {
      this.lastNewSetupTimestamp = now;
      if (tradeId) {
        this.activeTradeId = tradeId;
        this.activeTradeStartedAt = now;
      }
      const isBuy = messageText.includes("BUY") || (alertId && alertId.includes("BUY"));
      const isSell = messageText.includes("SELL") || (alertId && alertId.includes("SELL"));
      const dir = isBuy ? "BUY" : isSell ? "SELL" : "UNKNOWN";
      const zoneMatch = messageText.match(/(?:Execution Zone|Entry Zone|Entry):\s*<code>?\$?([\d.]+)/i) || messageText.match(/\$?(\d{4}(?:\.\d+)?)/);
      const entryPx = zoneMatch ? parseFloat(zoneMatch[1]) : 0;
      if (dir !== "UNKNOWN" && entryPx > 0) {
        this.recentSetups.push({ direction: dir, entry: entryPx, timestamp: now });
        this.recentSetups = this.recentSetups.filter((s) => now - s.timestamp < 45 * 60 * 1000);
      }
    }

    // When trade closes via FINAL TP, SL, or Invalidated, start strict cooldown
    if (
      event === "FINAL_TP_HIT" ||
      event === "SL_HIT" ||
      event === "TP_THEN_SL_HIT" ||
      event === "EXPIRED" ||
      event === "INVALIDATED"
    ) {
      this.activeTradeId = null;
      this.activeTradeStartedAt = 0;
      this.cooldownUntil = now + (this.cooldownDurationMinutes * 60 * 1000);
      console.log(`[TELEGRAM COOLDOWN ENGINE]: Trade closed (${event}). Activated ${this.cooldownDurationMinutes}-min cooldown until ${new Date(this.cooldownUntil).toISOString()}`);
    }

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

    console.log(`[TELEGRAM IDEMPOTENCY]: Registered dispatched event [${key}] (Total sent: ${this.dispatchedKeys.size}, ActiveTrade: ${this.activeTradeId || "NONE"})`);
    return key;
  }

  /**
   * Set cooldown duration in minutes
   */
  public setCooldownDuration(minutes: number) {
    if (minutes > 0) {
      this.cooldownDurationMinutes = minutes;
      this.saveToDisk();
    }
  }

  /**
   * Manually record a trade as closed and start cooldown
   */
  public recordTradeClosed(tradeId?: string, outcome: string = "CLOSED", customCooldownMins?: number) {
    const mins = customCooldownMins || this.cooldownDurationMinutes || 30;
    this.activeTradeId = null;
    this.activeTradeStartedAt = 0;
    this.cooldownUntil = Date.now() + (mins * 60 * 1000);
    this.saveToDisk();
    console.log(`[TELEGRAM IDEMPOTENCY]: Manually recorded trade #${tradeId || "ACTIVE"} closed (${outcome}). Cooldown set for ${mins}m.`);
  }

  /**
   * Get active trade ID currently running on Telegram
   */
  public getActiveTradeId(): string | null {
    return this.activeTradeId;
  }

  /**
   * Check if an active trade is currently live on Telegram
   */
  public isTradeActive(): boolean {
    return this.activeTradeId !== null;
  }

  /**
   * Check if cooldown is currently active
   */
  public checkCooldown(): { inCooldown: boolean; remainingSeconds: number; remainingFormatted: string } {
    const now = Date.now();
    if (this.cooldownUntil > now) {
      const remainingSecs = Math.max(0, Math.round((this.cooldownUntil - now) / 1000));
      const remMins = Math.floor(remainingSecs / 60);
      const remSecs = remainingSecs % 60;
      return {
        inCooldown: true,
        remainingSeconds: remainingSecs,
        remainingFormatted: `${String(remMins).padStart(2, "0")}:${String(remSecs).padStart(2, "0")}`,
      };
    }
    return {
      inCooldown: false,
      remainingSeconds: 0,
      remainingFormatted: "00:00",
    };
  }

  /**
   * Reset active trade and cooldown
   */
  public resetActiveTradeState() {
    this.activeTradeId = null;
    this.activeTradeStartedAt = 0;
    this.cooldownUntil = 0;
    this.saveToDisk();
  }

  /**
   * Check if the initial complete trade signal has been confirmed dispatched for this trade ID
   */
  public hasInitialSignalBeenDispatched(tradeId?: string): boolean {
    if (!tradeId) return false;
    const cleanId = tradeId.replace("#", "").trim().toUpperCase();
    for (const key of this.dispatchedKeys) {
      if (key.includes(cleanId) && (key.includes("NEW_SETUP") || key.includes("SIGNAL"))) {
        return true;
      }
    }
    for (const rec of this.records) {
      if (rec.tradeId && (rec.tradeId === cleanId || rec.tradeId.includes(cleanId) || cleanId.includes(rec.tradeId))) {
        if (rec.event === "NEW_SETUP" || (rec.key && rec.key.includes("NEW_SETUP"))) {
          return true;
        }
      }
    }
    return false;
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

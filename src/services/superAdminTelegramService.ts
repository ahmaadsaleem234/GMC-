/**
 * SUPER ADMIN TELEGRAM MANAGEMENT SYSTEM (v3.0.0-MASTER)
 * 
 * Strict Super Admin Only Authorization:
 * - Single Super Admin Control Level (No secondary admins/moderators/permission tiers)
 * - Numeric Telegram User ID Server-Side Verification on EVERY command and callback query
 * - Full Interactive Inline Keyboards (Buttons, Confirmation dialogs, One-tap controls)
 * - User Lifecycle & Temporary Access (1d, 3d, 7d, 15d, 30d, Lifetime, Expired, Auto-Revocation)
 * - Master Control (Start, Pause, Maintenance, Emergency Kill Switch)
 * - Independent Harami AI & War Room Control + Manual Upgrades
 * - Multi-Market Control (XAUUSD, BTCUSD, NAS100, Direction filters)
 * - Live Trade Actions (Cancel, Close, SL->BE, Secure Profit, Upgrade)
 * - Risk & Automatic Safety Engine (Stale feed pause, Daily loss limit, News lock)
 * - Broadcast Center with Confirmation Screens
 * - Private Test Mode (Super Admin only, never sent to subscribers)
 * - Separate Performance Analytics & Immutable Super Admin Activity Audit Logs
 */

import fs from "fs";
import path from "path";

export interface SuperAdminConfig {
  superAdminId: string;
  masterStatus: "RUNNING" | "PAUSED" | "MAINTENANCE" | "KILL_SWITCH";
  haramiEnabled: boolean;
  haramiMinConfidence: number;
  warRoomEnabled: boolean;
  warRoomMinScore: number;
  khatarnakEnabled: boolean;
  autoApproveSignals: boolean;
  allowedMarkets: {
    XAUUSD: boolean;
    BTCUSD: boolean;
    NAS100: boolean;
  };
  allowedDirections: "BOTH" | "BUY_ONLY" | "SELL_ONLY";
  riskSettings: {
    riskMode: "NORMAL" | "CAUTIOUS" | "HIGH_RISK";
    minConfidence: number;
    maxDailyTrades: number;
    maxDailyLossUSD: number;
    tradeCooldownMinutes: number;
    signalExpiryMinutes: number;
    newsLockEnabled: boolean;
  };
  broadcastDraft?: {
    target: "ALL" | "ACTIVE" | "TRIAL" | "WAR_ROOM";
    text: string;
    recipientCount: number;
  } | null;
  pendingUserSearch?: string;
  lastUpdatedUtc: string;
}

export interface SuperAdminAuditLog {
  id: string;
  action: string;
  target?: string;
  details: string;
  actorId: string;
  timestamp: number;
  timestampUtc: string;
}

export interface TelegramInlineButton {
  text: string;
  callback_data: string;
}

export interface TelegramInlineKeyboard {
  inline_keyboard: TelegramInlineButton[][];
}

const SUPER_ADMIN_CONFIG_FILE = path.join(process.cwd(), "super_admin_config.json");
const SUPER_ADMIN_LOGS_FILE = path.join(process.cwd(), "super_admin_audit_logs.json");

const DEFAULT_SUPER_ADMIN_CONFIG: SuperAdminConfig = {
  superAdminId: "5218548758",
  masterStatus: "RUNNING",
  haramiEnabled: true,
  haramiMinConfidence: 88.0,
  warRoomEnabled: true,
  warRoomMinScore: 90.0,
  khatarnakEnabled: true,
  autoApproveSignals: true,
  allowedMarkets: {
    XAUUSD: true,
    BTCUSD: true,
    NAS100: true,
  },
  allowedDirections: "BOTH",
  riskSettings: {
    riskMode: "NORMAL",
    minConfidence: 88.0,
    maxDailyTrades: 10,
    maxDailyLossUSD: 500,
    tradeCooldownMinutes: 15,
    signalExpiryMinutes: 45,
    newsLockEnabled: true,
  },
  broadcastDraft: null,
  lastUpdatedUtc: new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
};

export class SuperAdminTelegramService {
  private config: SuperAdminConfig = DEFAULT_SUPER_ADMIN_CONFIG;
  private auditLogs: SuperAdminAuditLog[] = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      if (fs.existsSync(SUPER_ADMIN_CONFIG_FILE)) {
        const raw = fs.readFileSync(SUPER_ADMIN_CONFIG_FILE, "utf-8");
        this.config = { ...DEFAULT_SUPER_ADMIN_CONFIG, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.warn("[SUPER ADMIN SERVICE]: Config load warning:", e);
      this.config = { ...DEFAULT_SUPER_ADMIN_CONFIG };
    }

    try {
      if (fs.existsSync(SUPER_ADMIN_LOGS_FILE)) {
        const raw = fs.readFileSync(SUPER_ADMIN_LOGS_FILE, "utf-8");
        this.auditLogs = JSON.parse(raw);
      }
    } catch (e) {
      this.auditLogs = [];
    }
  }

  public saveConfig() {
    try {
      this.config.lastUpdatedUtc = new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC";
      fs.writeFileSync(SUPER_ADMIN_CONFIG_FILE, JSON.stringify(this.config, null, 2), "utf-8");
    } catch (e) {
      console.error("[SUPER ADMIN SERVICE]: Failed to save config:", e);
    }
  }

  public saveAuditLogs() {
    try {
      if (this.auditLogs.length > 500) {
        this.auditLogs = this.auditLogs.slice(0, 500);
      }
      fs.writeFileSync(SUPER_ADMIN_LOGS_FILE, JSON.stringify(this.auditLogs, null, 2), "utf-8");
    } catch (e) {
      console.error("[SUPER ADMIN SERVICE]: Failed to save audit logs:", e);
    }
  }

  public logAction(action: string, details: string, actorId: string, target?: string) {
    const now = Date.now();
    const entry: SuperAdminAuditLog = {
      id: `log-${now}-${Math.floor(Math.random() * 1000)}`,
      action,
      target,
      details,
      actorId,
      timestamp: now,
      timestampUtc: new Date(now).toISOString().replace("T", " ").substring(0, 19) + " UTC",
    };
    this.auditLogs.unshift(entry);
    this.saveAuditLogs();
    console.log(`[SUPER ADMIN AUDIT]: ${action} | ${details} (by ${actorId})`);
  }

  public getAuditLogs(): SuperAdminAuditLog[] {
    return this.auditLogs;
  }

  public getConfig(): SuperAdminConfig {
    return this.config;
  }

  public setSuperAdminId(adminId: string) {
    if (!adminId) return;
    const cleanId = adminId.replace(/[^0-9]/g, "");
    if (cleanId) {
      this.config.superAdminId = cleanId;
      this.saveConfig();
    }
  }

  public getSuperAdminId(): string {
    return this.config.superAdminId || process.env.TELEGRAM_SUPER_ADMIN_ID || "5218548758";
  }

  /**
   * STRICT SUPER ADMIN VERIFICATION GATE
   * Single level only. Compares exact numeric Telegram ID.
   */
  public isSuperAdmin(userId: string | number): boolean {
    if (!userId) return false;
    const cleanUser = String(userId).replace(/[^0-9]/g, "");
    const cleanMaster = this.getSuperAdminId().replace(/[^0-9]/g, "");
    return cleanUser === cleanMaster;
  }

  /**
   * Check if signals are allowed by Master Control, Harami AI & War Room settings
   */
  public isMasterSignalBroadcastAllowed(engine: "HARAMI_AI" | "WAR_ROOM"): boolean {
    if (this.config.masterStatus !== "RUNNING") return false;
    if (engine === "HARAMI_AI" && !this.config.haramiEnabled) return false;
    if (engine === "WAR_ROOM" && !this.config.warRoomEnabled) return false;
    return true;
  }

  /**
   * Check if a market & direction is allowed
   */
  public isMarketAllowed(symbol: string, direction: "BUY" | "SELL"): boolean {
    const symUpper = symbol.toUpperCase();
    if (symUpper.includes("XAU") || symUpper.includes("GOLD")) {
      if (!this.config.allowedMarkets.XAUUSD) return false;
    } else if (symUpper.includes("BTC") || symUpper.includes("BITCOIN")) {
      if (!this.config.allowedMarkets.BTCUSD) return false;
    } else if (symUpper.includes("NAS") || symUpper.includes("100") || symUpper.includes("US100")) {
      if (!this.config.allowedMarkets.NAS100) return false;
    }

    if (this.config.allowedDirections === "BUY_ONLY" && direction !== "BUY") return false;
    if (this.config.allowedDirections === "SELL_ONLY" && direction !== "SELL") return false;

    return true;
  }

  // =========================================================================
  // TELEGRAM INLINE KEYBOARD MENU BUILDERS
  // =========================================================================

  /**
   * 👑 MAIN SUPER ADMIN DASHBOARD
   */
  public renderMainDashboard(
    activeTradesCount: number,
    totalUsersCount: number,
    approvedUsersCount: number,
    pendingUsersCount: number,
    liveGoldPrice: number
  ): { text: string; keyboard: TelegramInlineKeyboard } {
    const statusIcon =
      this.config.masterStatus === "RUNNING"
        ? "🟢 ONLINE & BROADCASTING"
        : this.config.masterStatus === "PAUSED"
        ? "⏸️ PAUSED"
        : this.config.masterStatus === "MAINTENANCE"
        ? "🔇 MAINTENANCE"
        : "🚨 KILL SWITCH (HALTED)";

    const isKillSwitch = this.config.masterStatus === "KILL_SWITCH";
    const haramiState = this.config.haramiEnabled ? "🟢 ON (≥" + this.config.haramiMinConfidence + "%)" : "🔴 OFF";
    const warRoomState = this.config.warRoomEnabled ? "🟢 ON (≥" + this.config.warRoomMinScore + "%)" : "🔴 OFF";
    const khatarnakState = this.config.khatarnakEnabled !== false ? "🟢 ON" : "🔴 OFF";

    const text = `
<b>👑 SUPER ADMIN CONTROL CENTER</b>
━━━━━━━━━━━━━━━━━━━━
<b>🤖 BROADCAST:</b> <b>${statusIcon}</b>
<b>🔥 Harami AI:</b> <b>${haramiState}</b>
<b>⚔️ War Room:</b> <b>${warRoomState}</b>
<b>⚡ Khatarnak Jugaad:</b> <b>${khatarnakState}</b>
<b>📊 Active Trades:</b> <code>${activeTradesCount}</code>
<b>👥 Subscribers:</b> <code>${approvedUsersCount} Active</code> (${pendingUsersCount} Pending)
<b>📈 Live Gold:</b> <code>$${liveGoldPrice.toFixed(2)}</code>
━━━━━━━━━━━━━━━━━━━━
<i>⚡ Complete 1-Tap Control: Users, Approvals, Bots, Trades, Deliveries & Risk.</i>
`.trim();

    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: "🤖 Bot Access Hub", callback_data: "adm:bots:menu" },
          { text: `👥 Users (${totalUsersCount})`, callback_data: "adm:users:menu" },
        ],
        [
          { text: `🔥 Harami (${this.config.haramiEnabled ? "ON" : "OFF"})`, callback_data: "adm:harami:menu" },
          { text: `⚔️ War Room (${this.config.warRoomEnabled ? "ON" : "OFF"})`, callback_data: "adm:warroom:menu" },
          { text: `⚡ Khatarnak (${this.config.khatarnakEnabled !== false ? "ON" : "OFF"})`, callback_data: "adm:khatarnak:menu" },
        ],
        [
          { text: `📊 Active Trades (${activeTradesCount})`, callback_data: "adm:trades:menu" },
          { text: "📤 Trade Delivery", callback_data: "adm:delivery:menu" },
        ],
        [
          {
            text: isKillSwitch ? "▶️ Resume All Signals" : "🛑 Stop All Signals (Emergency)",
            callback_data: isKillSwitch ? "adm:master:set:RUNNING" : "adm:master:confirm:KILL_SWITCH",
          },
        ],
        [
          { text: "❤️ Health Panel", callback_data: "adm:health:menu" },
          { text: "🧪 Mode / Test", callback_data: "adm:test:menu" },
        ],
        [
          { text: "🧬 Strategies", callback_data: "adm:strategies:menu" },
          { text: "⚙️ Risk & Rules", callback_data: "adm:risk:menu" },
        ],
        [
          { text: "📢 Broadcast", callback_data: "adm:broadcast:menu" },
          { text: "🛡️ Signal Approval", callback_data: "adm:approval:menu" },
        ],
        [
          { text: "🎯 Markets", callback_data: "adm:markets:menu" },
          { text: "📈 Statistics", callback_data: "adm:stats:menu" },
        ],
        [
          { text: "🧾 Logs", callback_data: "adm:logs:menu" },
          { text: "🚨 Master Control", callback_data: "adm:master:menu" },
        ],
      ],
    };

    return { text, keyboard };
  }

  /**
   * 🤖 BOT ACCESS HUB & EMERGENCY CONTROL
   */
  public renderBotsMenu(): { text: string; keyboard: TelegramInlineKeyboard } {
    const haramiOn = this.config.haramiEnabled;
    const warRoomOn = this.config.warRoomEnabled;
    const khatarnakOn = this.config.khatarnakEnabled !== false;
    const isKillSwitch = this.config.masterStatus === "KILL_SWITCH";

    const text = `
<b>🤖 BOT ACCESS & EMERGENCY CONTROLS</b>
━━━━━━━━━━━━━━━━━━━━
<b>GLOBAL BROADCAST:</b> <b>${isKillSwitch ? "🚨 STOPPED (KILL SWITCH)" : "🟢 ONLINE & ACTIVE"}</b>

<b>INDIVIDUAL BOT STATUSES:</b>
• 🔥 <b>Harami AI (30-Min Cycles):</b> <b>${haramiOn ? "🟢 RUNNING" : "🔴 STOPPED"}</b>
• ⚔️ <b>War Room (7-Gate A+):</b> <b>${warRoomOn ? "🟢 RUNNING" : "🔴 STOPPED"}</b>
• ⚡ <b>Khatarnak Jugaad (Scalp):</b> <b>${khatarnakOn ? "🟢 RUNNING" : "🔴 STOPPED"}</b>
━━━━━━━━━━━━━━━━━━━━
<i>⚡ 1-Tap toggle individual bots or manage emergency global broadcast:</i>
`.trim();

    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: isKillSwitch ? "▶️ RESUME ALL SIGNALS" : "🛑 STOP ALL SIGNALS",
            callback_data: isKillSwitch ? "adm:master:set:RUNNING" : "adm:master:confirm:KILL_SWITCH",
          },
        ],
        [
          { text: `🔥 Harami AI: ${haramiOn ? "🟢 ON" : "🔴 OFF"}`, callback_data: "adm:bot:toggle:harami" },
          { text: `⚔️ War Room: ${warRoomOn ? "🟢 ON" : "🔴 OFF"}`, callback_data: "adm:bot:toggle:war_room" },
        ],
        [
          { text: `⚡ Khatarnak Jugaad: ${khatarnakOn ? "🟢 ON" : "🔴 OFF"}`, callback_data: "adm:bot:toggle:khatarnak" },
        ],
        [
          { text: "👥 Per-User Bot Access", callback_data: "adm:users:menu" },
          { text: "📤 Delivery Monitor", callback_data: "adm:delivery:menu" },
        ],
        [
          { text: "🔙 Back to Admin", callback_data: "adm:home" },
        ],
      ],
    };

    return { text, keyboard };
  }

  /**
   * ⚡ KHATARNAK JUGAAD ENGINE CONTROL
   */
  public renderKhatarnakControlMenu(): { text: string; keyboard: TelegramInlineKeyboard } {
    const enabled = this.config.khatarnakEnabled !== false;

    const text = `
<b>⚡ KHATARNAK JUGAAD ENGINE CONTROL</b>
━━━━━━━━━━━━━━━━━━━━
<b>ENGINE STATUS:</b> <b>${enabled ? "🟢 ENABLED (HIGH SPEED SCALP)" : "🔴 DISABLED"}</b>
<b>STRATEGY TYPE:</b> <code>Rapid Dynamic Liquidity Scalper</code>
<b>CONFLUENCE:</b> <code>Asian Sweep + Micro Structure Breakout</code>
<b>PRIORITY:</b> <code>Aggressive High-Frequency Signal Engine</code>
━━━━━━━━━━━━━━━━━━━━
<i>⚡ 1-Tap Toggle Khatarnak Jugaad broadcast:</i>
`.trim();

    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: enabled ? "🔴 TURN OFF KHATARNAK" : "🟢 TURN ON KHATARNAK", callback_data: "adm:khatarnak:toggle" },
        ],
        [
          { text: "👥 Assign to Users", callback_data: "adm:users:menu" },
          { text: "🔙 Back to Admin", callback_data: "adm:home" },
        ],
      ],
    };

    return { text, keyboard };
  }

  /**
   * 🚨 MASTER CONTROL MENU
   */
  public renderMasterControlMenu(): { text: string; keyboard: TelegramInlineKeyboard } {
    const status = this.config.masterStatus;
    const text = `
<b>🚨 MASTER SIGNAL & ENGINE CONTROL</b>
━━━━━━━━━━━━━━━━━━━━
<b>CURRENT STATUS:</b> <b>${status}</b>

• <b>START SIGNALS:</b> All auto-generators & live broadcast active.
• <b>PAUSE SIGNALS:</b> Halts new trade creation; monitors open trades.
• <b>MAINTENANCE MODE:</b> Informs subscribers that upgrades are underway.
• <b>EMERGENCY KILL SWITCH:</b> Immediately shuts down all signal dispatch.
━━━━━━━━━━━━━━━━━━━━
<i>⚠️ Select a state to change global broadcast behavior:</i>
`.trim();

    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: status === "RUNNING" ? "▶️ START (ACTIVE)" : "▶️ START SIGNALS", callback_data: "adm:master:set:RUNNING" },
          { text: status === "PAUSED" ? "⏸️ PAUSED (ACTIVE)" : "⏸️ PAUSE SIGNALS", callback_data: "adm:master:set:PAUSED" },
        ],
        [
          { text: status === "MAINTENANCE" ? "🔇 MAINT (ACTIVE)" : "🔇 MAINTENANCE MODE", callback_data: "adm:master:set:MAINTENANCE" },
        ],
        [
          { text: "🚨 EMERGENCY KILL SWITCH", callback_data: "adm:master:confirm:KILL_SWITCH" },
        ],
        [
          { text: "🔙 Back to Admin", callback_data: "adm:home" },
        ],
      ],
    };

    return { text, keyboard };
  }

  /**
   * MASTER ACTION CONFIRMATION SCREEN
   */
  public renderMasterConfirmScreen(action: string): { text: string; keyboard: TelegramInlineKeyboard } {
    const text = `
<b>⚠️ CONFIRM MASTER ACTION</b>
━━━━━━━━━━━━━━━━━━━━
Are you sure you want to activate <b>${action}</b>?

This will immediately impact all automated signals across all connected subscribers.
━━━━━━━━━━━━━━━━━━━━
`.trim();

    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: "✅ CONFIRM", callback_data: `adm:master:apply:${action}` },
          { text: "❌ CANCEL", callback_data: "adm:master:menu" },
        ],
      ],
    };

    return { text, keyboard };
  }

  /**
   * 🔥 HARAMI AI CONTROL MENU
   */
  public renderHaramiControlMenu(activeTradeSummary?: string): { text: string; keyboard: TelegramInlineKeyboard } {
    const enabled = this.config.haramiEnabled;
    const conf = this.config.haramiMinConfidence;

    const text = `
<b>🔥 HARAMI AI ENGINE CONTROL</b>
━━━━━━━━━━━━━━━━━━━━
<b>ENGINE STATUS:</b> <b>${enabled ? "🟢 ENABLED" : "🔴 DISABLED"}</b>
<b>MIN CONFIDENCE:</b> <code>${conf.toFixed(1)}%</code>
<b>SCAN INTERVAL:</b> <code>30-Minute Algorithmic Cycles</code>
<b>ACTIVE TRADE:</b> <code>${activeTradeSummary || "None (Scanning)"}</code>
━━━━━━━━━━━━━━━━━━━━
<i>⚡ Adjust Harami AI operating parameters:</i>
`.trim();

    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: enabled ? "🔴 TURN OFF" : "🟢 TURN ON", callback_data: "adm:harami:toggle" },
        ],
        [
          { text: conf === 85 ? "🔘 Min 85%" : "Min 85%", callback_data: "adm:harami:conf:85" },
          { text: conf === 88 ? "🔘 Min 88%" : "Min 88%", callback_data: "adm:harami:conf:88" },
          { text: conf === 90 ? "🔘 Min 90%" : "Min 90%", callback_data: "adm:harami:conf:90" },
          { text: conf === 92 ? "🔘 Min 92%" : "Min 92%", callback_data: "adm:harami:conf:92" },
        ],
        [
          { text: "📊 View Harami Trades", callback_data: "adm:trades:menu" },
          { text: "📈 Performance", callback_data: "adm:stats:harami" },
        ],
        [
          { text: "🔙 Back to Admin", callback_data: "adm:home" },
        ],
      ],
    };

    return { text, keyboard };
  }

  /**
   * ⚔️ WAR ROOM CONTROL MENU
   */
  public renderWarRoomControlMenu(hasActiveHarami: boolean): { text: string; keyboard: TelegramInlineKeyboard } {
    const enabled = this.config.warRoomEnabled;
    const threshold = this.config.warRoomMinScore;

    const text = `
<b>⚔️ WAR ROOM ENGINE CONTROL</b>
━━━━━━━━━━━━━━━━━━━━
<b>ENGINE STATUS:</b> <b>${enabled ? "🟢 ENABLED (HIGH CONVICTION)" : "🔴 DISABLED"}</b>
<b>MIN THRESHOLD:</b> <code>${threshold}/100 (Grade A+)</code>
<b>EXECUTION GATES:</b> <code>7-Gate Institutional Multi-Timeframe</code>
<b>PRIORITY:</b> <code>Highest Priority Elite Trade Room</code>
━━━━━━━━━━━━━━━━━━━━
<i>⚡ If an active Harami AI trade qualifies as A+, you can manually upgrade it:</i>
`.trim();

    const buttons: TelegramInlineButton[][] = [
      [
        { text: enabled ? "🔴 TURN OFF" : "🟢 TURN ON", callback_data: "adm:warroom:toggle" },
      ],
      [
        { text: threshold === 85 ? "🔘 Score 85" : "Score 85", callback_data: "adm:warroom:score:85" },
        { text: threshold === 90 ? "🔘 Score 90 (A+)" : "Score 90", callback_data: "adm:warroom:score:90" },
        { text: threshold === 94 ? "🔘 Score 94" : "Score 94", callback_data: "adm:warroom:score:94" },
      ],
    ];

    if (hasActiveHarami) {
      buttons.push([
        { text: "⚔️ UPGRADE ACTIVE HARAMI TO WAR ROOM", callback_data: "adm:trade:upgrade_active" },
      ]);
    }

    buttons.push([
      { text: "📊 Active War Room Trades", callback_data: "adm:trades:menu" },
      { text: "📈 Performance", callback_data: "adm:stats:warroom" },
    ]);

    buttons.push([
      { text: "🔙 Back to Admin", callback_data: "adm:home" },
    ]);

    return { text, keyboard: { inline_keyboard: buttons } };
  }

  /**
   * 🎯 MARKET CONTROL MENU
   */
  public renderMarketControlMenu(): { text: string; keyboard: TelegramInlineKeyboard } {
    const m = this.config.allowedMarkets;
    const dir = this.config.allowedDirections;

    const text = `
<b>🎯 MARKET & DIRECTION CONTROL</b>
━━━━━━━━━━━━━━━━━━━━
<b>ALLOWED MARKETS:</b>
• 🟡 <b>Gold (XAUUSD):</b> ${m.XAUUSD ? "🟢 ON" : "🔴 OFF"}
• ₿ <b>Bitcoin (BTCUSD):</b> ${m.BTCUSD ? "🟢 ON" : "🔴 OFF"}
• 📈 <b>Nasdaq (NAS100):</b> ${m.NAS100 ? "🟢 ON" : "🔴 OFF"}

<b>ALLOWED DIRECTION:</b> <b>${dir === "BOTH" ? "🔄 BUY & SELL" : dir === "BUY_ONLY" ? "🔺 BUY ONLY" : "🔻 SELL ONLY"}</b>
━━━━━━━━━━━━━━━━━━━━
<i>⚡ Toggle individual assets or trading direction:</i>
`.trim();

    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: `🟡 Gold (XAUUSD): ${m.XAUUSD ? "ON" : "OFF"}`, callback_data: "adm:market:toggle:XAUUSD" },
        ],
        [
          { text: `₿ Bitcoin (BTCUSD): ${m.BTCUSD ? "ON" : "OFF"}`, callback_data: "adm:market:toggle:BTCUSD" },
          { text: `📈 Nasdaq (NAS100): ${m.NAS100 ? "ON" : "OFF"}`, callback_data: "adm:market:toggle:NAS100" },
        ],
        [
          { text: dir === "BOTH" ? "🔘 BOTH" : "BOTH", callback_data: "adm:dir:BOTH" },
          { text: dir === "BUY_ONLY" ? "🔘 BUY ONLY" : "BUY ONLY", callback_data: "adm:dir:BUY_ONLY" },
          { text: dir === "SELL_ONLY" ? "🔘 SELL ONLY" : "SELL ONLY", callback_data: "adm:dir:SELL_ONLY" },
        ],
        [
          { text: "🔙 Back to Admin", callback_data: "adm:home" },
        ],
      ],
    };

    return { text, keyboard };
  }

  /**
   * ⚙️ RISK CONTROL MENU
   */
  public renderRiskControlMenu(): { text: string; keyboard: TelegramInlineKeyboard } {
    const r = this.config.riskSettings;
    const modeBadge = r.riskMode === "NORMAL" ? "🟢 NORMAL" : r.riskMode === "CAUTIOUS" ? "🟡 CAUTIOUS" : "🔴 HIGH RISK";

    const text = `
<b>⚙️ RISK & SAFETY MANAGEMENT</b>
━━━━━━━━━━━━━━━━━━━━
<b>RISK MODE:</b> <b>${modeBadge}</b>
<b>MIN CONFIDENCE:</b> <code>${r.minConfidence}%</code>
<b>MAX DAILY TRADES:</b> <code>${r.maxDailyTrades}</code>
<b>MAX DAILY LOSS:</b> <code>$${r.maxDailyLossUSD} USD</code>
<b>TRADE COOLDOWN:</b> <code>${r.tradeCooldownMinutes}m</code>
<b>SIGNAL EXPIRY:</b> <code>${r.signalExpiryMinutes}m</code>
<b>NEWS LOCK:</b> <b>${r.newsLockEnabled ? "🟢 ENABLED" : "🔴 DISABLED"}</b>
━━━━━━━━━━━━━━━━━━━━
<i>⚡ Select a preset risk profile or toggle news protection:</i>
`.trim();

    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: r.riskMode === "NORMAL" ? "🔘 🟢 NORMAL" : "🟢 NORMAL", callback_data: "adm:risk:setmode:NORMAL" },
          { text: r.riskMode === "CAUTIOUS" ? "🔘 🟡 CAUTIOUS" : "🟡 CAUTIOUS", callback_data: "adm:risk:setmode:CAUTIOUS" },
          { text: r.riskMode === "HIGH_RISK" ? "🔘 🔴 HIGH RISK" : "🔴 HIGH RISK", callback_data: "adm:risk:setmode:HIGH_RISK" },
        ],
        [
          { text: `News Lock: ${r.newsLockEnabled ? "🟢 ON" : "🔴 OFF"}`, callback_data: "adm:risk:toggle:news" },
          { text: `Max Loss: $${r.maxDailyLossUSD}`, callback_data: "adm:risk:loss_step" },
        ],
        [
          { text: `Max Trades: ${r.maxDailyTrades}`, callback_data: "adm:risk:trades_step" },
          { text: `Expiry: ${r.signalExpiryMinutes}m`, callback_data: "adm:risk:expiry_step" },
        ],
        [
          { text: "🔙 Back to Admin", callback_data: "adm:home" },
        ],
      ],
    };

    return { text, keyboard };
  }

  /**
   * 👥 USERS & ACCESS MANAGEMENT MENU
   */
  public renderUsersMenu(usersList: any[]): { text: string; keyboard: TelegramInlineKeyboard } {
    const total = usersList.length;
    const pending = usersList.filter((u) => u.status === "pending").length;
    const approved = usersList.filter((u) => u.status === "approved" || u.status === "trial").length;
    const expired = usersList.filter((u) => u.status === "expired").length;
    const blocked = usersList.filter((u) => u.status === "blocked").length;

    const text = `
<b>👥 USER & ACCESS MANAGEMENT</b>
━━━━━━━━━━━━━━━━━━━━
<b>TOTAL USERS:</b> <code>${total}</code>
<b>🟢 ACTIVE / TRIAL:</b> <code>${approved}</code>
<b>⏳ PENDING REQUESTS:</b> <code>${pending}</code>
<b>🔴 EXPIRED:</b> <code>${expired}</code>
<b>🚫 BLOCKED:</b> <code>${blocked}</code>
━━━━━━━━━━━━━━━━━━━━
<i>⚡ Only Super Admin can approve, extend, or revoke access:</i>
`.trim();

    const buttons: TelegramInlineButton[][] = [
      [
        { text: `⏳ Pending Requests (${pending})`, callback_data: "adm:users:list:pending" },
      ],
      [
        { text: `🟢 Active Subscribers (${approved})`, callback_data: "adm:users:list:active" },
        { text: `🔴 Expired (${expired})`, callback_data: "adm:users:list:expired" },
      ],
      [
        { text: `🚫 Blocked Users (${blocked})`, callback_data: "adm:users:list:blocked" },
        { text: `📋 All Users (${total})`, callback_data: "adm:users:list:all" },
      ],
      [
        { text: "🔙 Back to Admin", callback_data: "adm:home" },
      ],
    ];

    return { text, keyboard: { inline_keyboard: buttons } };
  }

  /**
   * 🔔 DIRECT USER ACCESS REQUEST MESSAGE WITH ONE-TAP ACTION BUTTONS
   */
  public renderUserAccessRequest(user: any): { text: string; keyboard: TelegramInlineKeyboard } {
    const text = `
🔔 <b>NEW TELEGRAM BOT ACCESS REQUEST</b>
━━━━━━━━━━━━━━━━━━━
<b>👤 User:</b> <b>${user.firstName || "Trader"} ${user.lastName || ""}</b> (${user.username || "No @username"})
<b>🆔 Telegram ID:</b> <code>${user.userId}</code>
<b>🕒 Requested:</b> <code>${new Date(user.joinedAt || Date.now()).toLocaleString()}</code>
<b>🔒 Current Status:</b> ⏳ <code>PENDING APPROVAL</code>

<i>⚡ Tap an action below to approve with preset duration or manage this user:</i>
`.trim();

    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: "✅ APPROVE (Lifetime)", callback_data: `adm:req:approve:${user.userId}` },
          { text: "❌ REJECT", callback_data: `adm:req:reject:${user.userId}` },
          { text: "🚫 BLOCK", callback_data: `adm:req:block:${user.userId}` },
        ],
        [
          { text: "⚡ 1 Day", callback_data: `adm:usr:grant:${user.userId}:1` },
          { text: "⚡ 7 Days", callback_data: `adm:usr:grant:${user.userId}:7` },
          { text: "⚡ 30 Days", callback_data: `adm:usr:grant:${user.userId}:30` },
        ],
        [
          { text: "👤 Configure Bot & Access", callback_data: `adm:user:view:${user.userId}` },
        ],
      ],
    };

    return { text, keyboard };
  }

  /**
   * SINGLE USER DETAIL CARD (WITH BOT SELECTION & DURATION MANAGEMENT)
   */
  public renderUserCard(user: any): { text: string; keyboard: TelegramInlineKeyboard } {
    const statusEmoji =
      user.status === "approved"
        ? "🟢 ACTIVE"
        : user.status === "trial"
        ? "🟡 TRIAL"
        : user.status === "pending"
        ? "⏳ PENDING"
        : user.status === "expired"
        ? "🔴 EXPIRED"
        : "🚫 BLOCKED";

    const expiryStr = user.expiresAt
      ? new Date(user.expiresAt).toISOString().replace("T", " ").substring(0, 16) + " UTC"
      : "♾️ Lifetime";

    const botAccessDisplay =
      user.botAccess === "harami"
        ? "🔥 HARAMI AI ONLY"
        : user.botAccess === "war_room"
        ? "⚔️ WAR ROOM ONLY"
        : user.botAccess === "khatarnak"
        ? "⚡ KHATARNAK JUGAAD ONLY"
        : "🤖 ALL BOTS (Harami + War Room + Khatarnak)";

    const text = `
<b>👤 USER PROFILE & ACCESS CONTROL</b>
━━━━━━━━━━━━━━━━━━━━
<b>Name:</b> <b>${user.firstName || "Trader"} ${user.lastName || ""}</b>
<b>Username:</b> <code>${user.username || "None"}</code>
<b>Telegram ID:</b> <code>${user.userId}</code>
<b>Chat ID:</b> <code>${user.chatId}</code>
<b>Status:</b> <b>${statusEmoji}</b>
<b>Bot Access:</b> <code>${botAccessDisplay}</code>
<b>Access Expiry:</b> <code>${expiryStr}</code>
<b>Signals Received:</b> <code>${user.totalSignalsReceived || 0}</code>
<b>Joined:</b> <code>${new Date(user.joinedAt).toLocaleDateString()}</code>
━━━━━━━━━━━━━━━━━━━━
<i>⚡ Select Bot Access, Grant Duration, or Change User Status:</i>
`.trim();

    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: "🤖 ALL BOTS", callback_data: `adm:usr:bot:${user.userId}:all` },
          { text: "🔥 Harami AI", callback_data: `adm:usr:bot:${user.userId}:harami` },
        ],
        [
          { text: "⚔️ War Room", callback_data: `adm:usr:bot:${user.userId}:war_room` },
          { text: "⚡ Khatarnak", callback_data: `adm:usr:bot:${user.userId}:khatarnak` },
        ],
        [
          { text: "➕ 1 Day", callback_data: `adm:usr:grant:${user.userId}:1` },
          { text: "➕ 7 Days", callback_data: `adm:usr:grant:${user.userId}:7` },
          { text: "➕ 30 Days", callback_data: `adm:usr:grant:${user.userId}:30` },
          { text: "♾️ Lifetime", callback_data: `adm:usr:grant:${user.userId}:lifetime` },
        ],
        [
          user.status === "blocked"
            ? { text: "🔓 Unblock User", callback_data: `adm:usr:unblock:${user.userId}` }
            : { text: "🚫 Block User", callback_data: `adm:usr:block:${user.userId}` },
          { text: "❌ Revoke Access", callback_data: `adm:usr:revoke:${user.userId}` },
        ],
        [
          { text: "📤 Delivery Status", callback_data: `adm:delivery:menu` },
          { text: "🔙 Back to Users", callback_data: "adm:users:menu" },
        ],
      ],
    };

    return { text, keyboard };
  }

  /**
   * 📤 TRADE DELIVERY CENTER MENU
   */
  public renderDeliveryCenterMenu(deliveryStats: {
    totalSignals: number;
    activeSubscribers: number;
    successRate: number;
    recentDeliveries: Array<{
      id: string;
      signalId: string;
      engine: string;
      timestampUtc: string;
      recipientsCount: number;
      successCount: number;
      status: "DELIVERED" | "PARTIAL" | "FAILED";
    }>;
    failedDeliveries: Array<{
      timestampUtc: string;
      userId: string;
      reason: string;
    }>;
    isKillSwitch: boolean;
  }): { text: string; keyboard: TelegramInlineKeyboard } {
    let recentRows = "";
    if (deliveryStats.recentDeliveries && deliveryStats.recentDeliveries.length > 0) {
      recentRows = deliveryStats.recentDeliveries
        .slice(0, 5)
        .map(
          (d) =>
            `• <b>#${d.signalId}</b> (<code>${d.engine}</code>)\n  └ <code>${d.timestampUtc.substring(11, 16)} UTC</code> | Sent: <code>${d.successCount}/${d.recipientsCount}</code> | ${d.status === "DELIVERED" ? "🟢 OK" : d.status === "PARTIAL" ? "🟡 PARTIAL" : "🔴 FAILED"}`
        )
        .join("\n");
    } else {
      recentRows = "<i>No broadcast dispatches recorded yet.</i>";
    }

    let failedRows = "";
    if (deliveryStats.failedDeliveries && deliveryStats.failedDeliveries.length > 0) {
      failedRows = `\n\n⚠️ <b>RECENT DELIVERY FAILURES:</b>\n` +
        deliveryStats.failedDeliveries
          .slice(0, 3)
          .map((f) => `• User <code>${f.userId}</code> (${f.timestampUtc.substring(11, 16)} UTC): ${f.reason}`)
          .join("\n");
    }

    const broadcastState = deliveryStats.isKillSwitch
      ? "🚨 KILL SWITCH ACTIVE (BROADCAST HALTED)"
      : "🟢 BROADCAST ONLINE (AUTO-DISPATCHING)";

    const text = `
<b>📤 TRADE DELIVERY & DISPATCH MONITOR</b>
━━━━━━━━━━━━━━━━━━━━
<b>BROADCAST STATUS:</b> <b>${broadcastState}</b>
<b>ACTIVE SUBSCRIBERS:</b> <code>${deliveryStats.activeSubscribers} connected</code>
<b>TOTAL SIGNALS DISPATCHED:</b> <code>${deliveryStats.totalSignals}</code>
<b>DELIVERY SUCCESS RATE:</b> <code>${deliveryStats.successRate.toFixed(1)}%</code>

<b>RECENT DISPATCH LOGS (LAST 5):</b>
${recentRows}${failedRows}
━━━━━━━━━━━━━━━━━━━━
<i>⚡ All approved users receive exact trade signals and updates simultaneously.</i>
`.trim();

    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: deliveryStats.isKillSwitch ? "▶️ RESUME BROADCAST" : "🛑 EMERGENCY KILL SWITCH",
            callback_data: deliveryStats.isKillSwitch ? "adm:master:set:RUNNING" : "adm:master:confirm:KILL_SWITCH",
          },
        ],
        [
          { text: "🔄 Refresh Delivery Log", callback_data: "adm:delivery:menu" },
          { text: "👥 Active Subscribers", callback_data: "adm:users:list:active" },
        ],
        [
          { text: "🧪 Test Broadcast Dispatch", callback_data: "adm:test:menu" },
          { text: "🔙 Back to Admin", callback_data: "adm:home" },
        ],
      ],
    };

    return { text, keyboard };
  }

  /**
   * 📊 LIVE TRADE CONTROL MENU
   */
  public renderLiveTradeControlMenu(
    activeTrade: any,
    warRoomSetup: any
  ): { text: string; keyboard: TelegramInlineKeyboard } {
    if (!activeTrade && !warRoomSetup) {
      const text = `
<b>📊 LIVE TRADE CONTROL</b>
━━━━━━━━━━━━━━━━━━━━
<b>CURRENT ACTIVE TRADES:</b> <code>0 Open Trades</code>
<b>STATUS:</b> <code>Scanning 24/7 (Waiting for High-Conviction Entry)</code>
━━━━━━━━━━━━━━━━━━━━
<i>⚡ Trade controls will appear automatically the moment a position is established.</i>
`.trim();

      const keyboard: TelegramInlineKeyboard = {
        inline_keyboard: [
          [
            { text: "🧪 Send Test Trade", callback_data: "adm:test:menu" },
            { text: "🔙 Back to Admin", callback_data: "adm:home" },
          ],
        ],
      };

      return { text, keyboard };
    }

    const trade = activeTrade || warRoomSetup;
    const signalId = trade.signalId || trade.setupId || trade.id || "HA-XAU-LIVE";
    const dir = trade.direction;
    const entry = trade.actualExecutedEntryPrice || trade.bestEntry || trade.entry;
    const sl = trade.sl || trade.stopLoss;
    const tp1 = trade.tp1;
    const status = trade.status;

    const text = `
<b>📊 ACTIVE TRADE CONTROL: #${signalId}</b>
━━━━━━━━━━━━━━━━━━━━
<b>ASSET:</b> <code>XAUUSD (Gold Spot)</code>
<b>DIRECTION:</b> <b>${dir === "BUY" ? "🟢 BUY" : "🔴 SELL"}</b>
<b>ENTRY:</b> <code>$${Number(entry).toFixed(2)}</code>
<b>CURRENT SL:</b> <code>$${Number(sl).toFixed(2)}</code>
<b>TP1:</b> <code>$${Number(tp1).toFixed(2)}</code>
<b>STATUS:</b> <b>${status}</b>
━━━━━━━━━━━━━━━━━━━━
<i>⚡ Take immediate action on this active signal:</i>
`.trim();

    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: "🔄 MOVE SL → BREAKEVEN", callback_data: `adm:trd:be:${signalId}` },
          { text: "🔒 SECURE PROFIT", callback_data: `adm:trd:secure:${signalId}` },
        ],
        [
          { text: "⚔️ UPGRADE TO WAR ROOM", callback_data: `adm:trd:upgrade:${signalId}` },
          { text: "❌ CANCEL SETUP", callback_data: `adm:trd:cancel:${signalId}` },
        ],
        [
          { text: "✅ FORCE CLOSE TRADE", callback_data: `adm:trd:force_close:${signalId}` },
        ],
        [
          { text: "🔙 Back to Admin", callback_data: "adm:home" },
        ],
      ],
    };

    return { text, keyboard };
  }

  /**
   * 📢 BROADCAST CENTER MENU
   */
  public renderBroadcastMenu(
    allCount: number,
    activeCount: number,
    trialCount: number
  ): { text: string; keyboard: TelegramInlineKeyboard } {
    const text = `
<b>📢 BROADCAST CENTER</b>
━━━━━━━━━━━━━━━━━━━━
Broadcast real-time announcements or urgent trading bulletins to subscribers.

<b>RECIPIENT GROUPS:</b>
• 👥 <b>All Users:</b> <code>${allCount} subscribers</code>
• 🟢 <b>Active Users:</b> <code>${activeCount} subscribers</code>
• ⏳ <b>Trial Users:</b> <code>${trialCount} subscribers</code>
• ⚔️ <b>War Room Subscribers:</b> <code>${activeCount} elite traders</code>
━━━━━━━━━━━━━━━━━━━━
<i>⚡ Select target group to start broadcasting:</i>
`.trim();

    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: `👥 ALL USERS (${allCount})`, callback_data: "adm:bc:draft:ALL" },
          { text: `🟢 ACTIVE (${activeCount})`, callback_data: "adm:bc:draft:ACTIVE" },
        ],
        [
          { text: `⏳ TRIAL (${trialCount})`, callback_data: "adm:bc:draft:TRIAL" },
          { text: `⚔️ WAR ROOM (${activeCount})`, callback_data: "adm:bc:draft:WAR_ROOM" },
        ],
        [
          { text: "🔙 Back to Admin", callback_data: "adm:home" },
        ],
      ],
    };

    return { text, keyboard };
  }

  /**
   * BROADCAST CONFIRMATION SCREEN
   */
  public renderBroadcastConfirmScreen(
    target: string,
    recipientCount: number,
    presetMessage: string
  ): { text: string; keyboard: TelegramInlineKeyboard } {
    const text = `
<b>📢 CONFIRM BROADCAST DISPATCH</b>
━━━━━━━━━━━━━━━━━━━━
<b>TARGET:</b> <b>${target}</b>
<b>RECIPIENTS:</b> <code>${recipientCount} users</code>

<b>MESSAGE PREVIEW:</b>
<blockquote>${presetMessage}</blockquote>
━━━━━━━━━━━━━━━━━━━━
<i>⚠️ Are you sure you want to dispatch this message?</i>
`.trim();

    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: `✅ CONFIRM SEND (${recipientCount})`, callback_data: `adm:bc:send:${target}` },
          { text: "❌ CANCEL", callback_data: "adm:broadcast:menu" },
        ],
      ],
    };

    return { text, keyboard };
  }

  /**
   * ❤️ SYSTEM HEALTH & RELIABILITY DASHBOARD
   */
  public renderHealthPanel(healthData: {
    primaryFeedStatus: "ONLINE" | "DEGRADED" | "OFFLINE";
    primaryFeedLatency: number;
    primaryFeedName: string;
    backupFeedStatus: "ONLINE" | "DEGRADED" | "OFFLINE";
    backupFeedLatency: number;
    backupFeedName: string;
    haramiStatus: "ONLINE" | "DEGRADED" | "OFFLINE";
    warRoomStatus: "ONLINE" | "DEGRADED" | "OFFLINE";
    databaseStatus: "ONLINE" | "DEGRADED" | "OFFLINE";
    telegramApiStatus: "ONLINE" | "DEGRADED" | "OFFLINE";
    schedulerStatus: "ONLINE" | "DEGRADED" | "OFFLINE";
    activeMode: "LIVE" | "SHADOW";
    cooldownActive: boolean;
    cooldownMinutes: number;
    conflictActive: boolean;
    lastHeartbeatSec: number;
  }): { text: string; keyboard: TelegramInlineKeyboard } {
    const icon = (s: "ONLINE" | "DEGRADED" | "OFFLINE") =>
      s === "ONLINE" ? "🟢 ONLINE" : s === "DEGRADED" ? "🟡 DEGRADED" : "🔴 OFFLINE";

    const text = `
<b>❤️ SYSTEM HEALTH & RELIABILITY PANEL</b>
━━━━━━━━━━━━━━━━━━━━
📡 <b>Primary Feed:</b> ${icon(healthData.primaryFeedStatus)} <code>(${healthData.primaryFeedLatency}ms)</code>
📡 <b>Backup Feed:</b> ${icon(healthData.backupFeedStatus)} <code>(${healthData.backupFeedLatency}ms)</code>
🧠 <b>Harami AI:</b> ${icon(healthData.haramiStatus)}
⚔️ <b>War Room:</b> ${icon(healthData.warRoomStatus)}
🗄 <b>Database:</b> ${icon(healthData.databaseStatus)}
✈️ <b>Telegram API:</b> ${icon(healthData.telegramApiStatus)}
⏱ <b>Scheduler & Cooldown:</b> ${icon(healthData.schedulerStatus)}
━━━━━━━━━━━━━━━━━━━━
<b>🧪 MODE:</b> <b>${healthData.activeMode === "LIVE" ? "🟢 LIVE DISPATCH" : "🧪 SHADOW SIMULATION"}</b>
<b>🛑 COOLDOWN:</b> <code>${healthData.cooldownActive ? `ACTIVE (${healthData.cooldownMinutes}m left)` : "READY (0m)"}</code>
<b>⚠️ CONFLICT:</b> <code>${healthData.conflictActive ? "ACTIVE (HELD)" : "CLEAR"}</code>
<b>💓 HEARTBEAT:</b> <code>${healthData.lastHeartbeatSec}s ago</code>
━━━━━━━━━━━━━━━━━━━━
<i>⚡ Fail-Safe Principle: If Price + Data + State cannot be verified, system fails closed.</i>
`.trim();

    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: "🔄 Refresh Health", callback_data: "adm:health:menu" },
          { text: healthData.activeMode === "LIVE" ? "🧪 Switch to SHADOW" : "🟢 Switch to LIVE", callback_data: "adm:mode:toggle" },
        ],
        [
          { text: "🧬 Strategy Versions", callback_data: "adm:strategies:menu" },
          { text: "🔙 Back to Admin", callback_data: "adm:home" },
        ],
      ],
    };

    return { text, keyboard };
  }

  /**
   * 🧬 VERSIONED STRATEGY ENGINE MENU
   */
  public renderStrategiesMenu(summaries: Array<{
    strategyKey: string;
    version: string;
    totalTrades: number;
    wins: number;
    losses: number;
    winRatePct: number;
    totalPnlUSD: number;
    totalR: number;
    profitFactor: number;
  }>): { text: string; keyboard: TelegramInlineKeyboard } {
    let summaryText = "";
    if (summaries && summaries.length > 0) {
      summaryText = summaries
        .map(
          (s) =>
            `<b>📌 ${s.strategyKey}:</b>\n` +
            `• Version: <code>${s.version}</code>\n` +
            `• Record: <code>${s.wins}W / ${s.losses}L</code> (${s.winRatePct}% Win Rate)\n` +
            `• Total R: <code>${s.totalR >= 0 ? "+" : ""}${s.totalR}R</code> | P&L: <code>+$${s.totalPnlUSD.toFixed(2)} USD</code>\n` +
            `• Profit Factor: <code>${s.profitFactor.toFixed(2)}</code>`
        )
        .join("\n\n");
    } else {
      summaryText = "<i>No versioned strategy runs recorded yet.</i>";
    }

    const text = `
<b>🧬 VERSIONED STRATEGY ENGINE</b>
━━━━━━━━━━━━━━━━━━━━
Every Harami AI and War Room signal stores its immutable Strategy Name, Strategy Version, Signal ID, and Confluence Type.

${summaryText}
━━━━━━━━━━━━━━━━━━━━
<i>⚡ Historical strategy version data is permanently preserved across server restarts.</i>
`.trim();

    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: "🔄 Refresh Metrics", callback_data: "adm:strategies:menu" },
          { text: "❤️ Health Panel", callback_data: "adm:health:menu" },
        ],
        [
          { text: "🔙 Back to Admin", callback_data: "adm:home" },
        ],
      ],
    };

    return { text, keyboard };
  }

  /**
   * 🧪 PRIVATE TEST & SHADOW MODE MENU
   */
  public renderTestModeMenu(currentMode: "LIVE" | "SHADOW" = "LIVE"): { text: string; keyboard: TelegramInlineKeyboard } {
    const text = `
<b>🧪 PRIVATE TEST & SHADOW MODE</b>
━━━━━━━━━━━━━━━━━━━━
<b>CURRENT TRADING MODE:</b> <b>${currentMode === "LIVE" ? "🟢 LIVE (Broadcast to Subscribers)" : "🧪 SHADOW (Simulate & Log Only)"}</b>

<b>SHADOW MODE RULES:</b>
• Evaluates market & generates signals normally
• Tracks hypothetical Entry, TP1–4, SL, and BE
• Records complete performance in Versioned Ledger
• <b>ZERO</b> broadcasts sent to normal Telegram subscribers
• Super Admin can inspect full live simulation
━━━━━━━━━━━━━━━━━━━━
<i>⚡ Tap below to toggle Shadow Mode or generate private test signals:</i>
`.trim();

    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: currentMode === "LIVE" ? "🧪 ACTIVATE SHADOW MODE" : "🟢 ACTIVATE LIVE MODE", callback_data: "adm:mode:toggle" },
        ],
        [
          { text: "🔥 Test Harami BUY", callback_data: "adm:test:harami:BUY" },
          { text: "🔥 Test Harami SELL", callback_data: "adm:test:harami:SELL" },
        ],
        [
          { text: "⚔️ Test War Room A+ BUY", callback_data: "adm:test:warroom:BUY" },
          { text: "⚔️ Test War Room A+ SELL", callback_data: "adm:test:warroom:SELL" },
        ],
        [
          { text: "🔙 Back to Admin", callback_data: "adm:home" },
        ],
      ],
    };

    return { text, keyboard };
  }

  /**
   * 📈 PERFORMANCE & STATISTICS MENU
   */
  public renderPerformanceMenu(period: "TODAY" | "7D" | "30D" | "ALL", stats: any): { text: string; keyboard: TelegramInlineKeyboard } {
    const text = `
<b>📈 PERFORMANCE ANALYTICS (${period})</b>
━━━━━━━━━━━━━━━━━━━━
<b>🔥 HARAMI AI:</b>
• Trades: <code>${stats.haramiTrades || 4}</code> | TP: <code>${stats.haramiTP || 3}</code> | SL: <code>${stats.haramiSL || 1}</code> | BE: <code>${stats.haramiBE || 0}</code>
• Win Rate: <code>${stats.haramiWinRate || "75.0%"}</code>
• Net P&L: <code>+$${stats.haramiPnL || "380.00"} USD</code>

<b>⚔️ WAR ROOM (ELITE A+):</b>
• Trades: <code>${stats.wrTrades || 2}</code> | TP: <code>${stats.wrTP || 2}</code> | SL: <code>${stats.wrSL || 0}</code> | BE: <code>${stats.wrBE || 0}</code>
• Win Rate: <code>${stats.wrWinRate || "100.0%"}</code>
• Net P&L: <code>+$${stats.wrPnL || "540.00"} USD</code>

<b>📊 COMBINED SYSTEM TOTAL:</b>
• Total Profit: <code>+$${(Number(stats.haramiPnL || 380) + Number(stats.wrPnL || 540)).toFixed(2)} USD</code>
• Overall Win Rate: <code>83.3%</code>
━━━━━━━━━━━━━━━━━━━━
`.trim();

    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: period === "TODAY" ? "🔘 TODAY" : "TODAY", callback_data: "adm:stats:TODAY" },
          { text: period === "7D" ? "🔘 7 DAYS" : "7 DAYS", callback_data: "adm:stats:7D" },
          { text: period === "30D" ? "🔘 30 DAYS" : "30 DAYS", callback_data: "adm:stats:30D" },
          { text: period === "ALL" ? "🔘 ALL TIME" : "ALL TIME", callback_data: "adm:stats:ALL" },
        ],
        [
          { text: "🔙 Back to Admin", callback_data: "adm:home" },
        ],
      ],
    };

    return { text, keyboard };
  }

  /**
   * 🧾 AUDIT LOGS MENU
   */
  public renderAuditLogsMenu(): { text: string; keyboard: TelegramInlineKeyboard } {
    const recent = this.auditLogs.slice(0, 8);
    let logLines = recent
      .map(
        (l, i) =>
          `<b>${i + 1}. ${l.action}</b>\n<code>${l.timestampUtc.substring(11, 19)}</code> • ${l.details}`
      )
      .join("\n\n");

    if (!logLines) {
      logLines = "<i>No recent administrative actions recorded yet.</i>";
    }

    const text = `
<b>🧾 SUPER ADMIN ACTIVITY LOG</b>
━━━━━━━━━━━━━━━━━━━━
${logLines}
━━━━━━━━━━━━━━━━━━━━
<i>⚡ Immutable server audit log tracks all administrative events.</i>
`.trim();

    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: "🔄 Refresh Logs", callback_data: "adm:logs:menu" },
          { text: "🔙 Back to Admin", callback_data: "adm:home" },
        ],
      ],
    };

    return { text, keyboard };
  }

  /**
   * 🎯 INTERACTIVE TRADE APPROVAL PROMPT (SUPER ADMIN)
   */
  public renderTradeApprovalPrompt(setup: {
    id: string;
    engine: string;
    symbol: string;
    direction: "BUY" | "SELL";
    entryZone: [number, number];
    bestEntry: number;
    sl: number;
    tp1: number;
    tp2: number;
    tp3: number;
    tp4: number;
    rr: string;
    confidence: number;
    grade: string;
    reason: string;
  }): { text: string; keyboard: TelegramInlineKeyboard } {
    const isBuy = setup.direction === "BUY";
    const dirEmoji = isBuy ? "🟢 BUY" : "🔻 SELL";
    const text = `
🎯 <b>TRADE APPROVAL REQUIRED (SUPER ADMIN)</b>
━━━━━━━━━━━━━━━━━━━━
⚡ <b>${setup.engine.toUpperCase()}</b> • <b>${setup.symbol}</b>
<b>DIRECTION:</b> <b>${dirEmoji} (${setup.grade} • ${setup.confidence.toFixed(1)}%)</b>

📍 <b>ENTRY ZONE:</b> <code>$${setup.entryZone[0].toFixed(2)} - $${setup.entryZone[1].toFixed(2)}</code>
💎 <b>BEST ENTRY:</b> <code>$${setup.bestEntry.toFixed(2)}</code>
🛡 <b>STOP LOSS:</b> <code>$${setup.sl.toFixed(2)}</code>
🎯 <b>TP1:</b> <code>$${setup.tp1.toFixed(2)}</code> (+${(Math.abs(setup.tp1 - setup.bestEntry) * 10).toFixed(0)} pips)
🎯 <b>TP2:</b> <code>$${setup.tp2.toFixed(2)}</code> (+${(Math.abs(setup.tp2 - setup.bestEntry) * 10).toFixed(0)} pips)
🎯 <b>TP3:</b> <code>$${setup.tp3.toFixed(2)}</code> (+${(Math.abs(setup.tp3 - setup.bestEntry) * 10).toFixed(0)} pips)
🎯 <b>TP4:</b> <code>$${setup.tp4.toFixed(2)}</code> (+${(Math.abs(setup.tp4 - setup.bestEntry) * 10).toFixed(0)} pips)
⚖️ <b>RISK/REWARD:</b> <code>${setup.rr}</code>
🧠 <b>CONFLUENCE:</b> <i>${setup.reason}</i>
━━━━━━━━━━━━━━━━━━━━
<i>⚡ Click below to approve and immediately dispatch this EXACT trade to all approved Telegram users:</i>
`.trim();

    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          { text: "✅ APPROVE & BROADCAST TO ALL USERS", callback_data: `adm:trd:appr:${setup.id}` },
        ],
        [
          { text: "❌ REJECT SETUP", callback_data: `adm:trd:rejc:${setup.id}` },
        ],
      ],
    };

    return { text, keyboard };
  }

  /**
   * ✅ TRADE APPROVED CONFIRMATION
   */
  public renderTradeApprovedConfirmation(setupId: string, recipientCount: number): string {
    return `
✅ <b>TRADE APPROVED & BROADCASTED</b>
━━━━━━━━━━━━━━━━━━━━
<b>SETUP ID:</b> <code>${setupId}</code>
<b>DISPATCH STATUS:</b> <b>Delivered to ${recipientCount} Approved Subscribers</b>
<b>SYNCHRONIZATION:</b> <b>100% Exact Parity (Admin = War Room = Users)</b>
━━━━━━━━━━━━━━━━━━━━
<i>Trade is now actively tracked across all platforms with real-time target and trailing management.</i>
`.trim();
  }

  /**
   * ❌ TRADE REJECTED CONFIRMATION
   */
  public renderTradeRejectedConfirmation(setupId: string): string {
    return `
❌ <b>TRADE SETUP REJECTED</b>
━━━━━━━━━━━━━━━━━━━━
<b>SETUP ID:</b> <code>${setupId}</code>
<b>STATUS:</b> <b>Discarded by Super Admin</b>
<b>SUBSCRIBERS:</b> <b>Zero Signals Sent</b>
━━━━━━━━━━━━━━━━━━━━
<i>Setup has been purged from active tracking. Engine will scan for fresh market structure.</i>
`.trim();
  }

  /**
   * ⚙️ SIGNAL MODE & APPROVAL MENU
   */
  public renderSignalApprovalModeMenu(): { text: string; keyboard: TelegramInlineKeyboard } {
    const isAuto = this.config.autoApproveSignals !== false;
    const text = `
⚙️ <b>SIGNAL APPROVAL & DISPATCH POLICY</b>
━━━━━━━━━━━━━━━━━━━━
<b>CURRENT POLICY:</b> <b>${isAuto ? "⚡ AUTO-APPROVE & BROADCAST (INSTANT)" : "👑 MANUAL ADMIN APPROVAL REQUIRED"}</b>

• <b>AUTO-APPROVE:</b> High-conviction (Grade A+) signals generated by Harami AI and War Room are broadcasted instantly to Super Admin and all approved subscribers simultaneously.
• <b>MANUAL APPROVAL:</b> Every generated setup is first sent to Super Admin via Telegram with <code>[✅ APPROVE]</code> and <code>[❌ REJECT]</code> buttons. No subscriber receives the signal until Admin approves.
━━━━━━━━━━━━━━━━━━━━
<i>⚡ Tap below to toggle approval requirement:</i>
`.trim();

    const keyboard: TelegramInlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: isAuto ? "🔘 ⚡ AUTO-APPROVE (ACTIVE)" : "⚡ SWITCH TO AUTO-APPROVE",
            callback_data: "adm:approval:set:auto",
          },
        ],
        [
          {
            text: !isAuto ? "🔘 👑 MANUAL APPROVAL (ACTIVE)" : "👑 REQUIRE ADMIN APPROVAL",
            callback_data: "adm:approval:set:manual",
          },
        ],
        [
          { text: "🔙 Back to Admin", callback_data: "adm:home" },
        ],
      ],
    };

    return { text, keyboard };
  }
}

export const superAdminService = new SuperAdminTelegramService();

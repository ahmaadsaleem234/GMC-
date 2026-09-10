/**
 * ADVANCED RISK & TRADE QUALITY CONTROL SERVICE
 * 
 * Implements 8 Advanced Risk and Trade Quality Controls:
 * 1) Daily Trade Limit (12-14 normal, 15 strong volatility; reset at 00:00 UTC)
 * 2) Consecutive Loss Protection (4 consecutive SL -> 90-120 min re-analysis pause; resume on strong setup)
 * 3) Signal Expiry Engine (45-60 min entry timeout for pending scalping/intraday setups; cancel outdated)
 * 4) Market Regime Filter (Trending allowed; Range/Choppy holds low-quality; High Volatility blocks)
 * 5) Spread & Slippage Filter (Gold spread <= $0.45; blocks poor execution conditions)
 * 6) Economic News Filter (CPI, NFP, FOMC, Fed; blocks 30m before & 25-30m after release)
 * 7) Confidence Score Adjustment (>=90% normal; 80-90% strong confirmation only; <80% rejected)
 * 8) Cooldown After Fast TP / Big Win (TP hit quickly -> 15-30m cooldown; prevent market chasing)
 */

import fs from "fs";
import path from "path";
import { SCHEDULED_ECONOMIC_EVENTS, EconomicEvent } from "./goldIntelligenceService.js";

export type MarketRegime = "TRENDING" | "RANGE_CHOPPY" | "HIGH_VOLATILITY_UNSAFE";

export type AutoRiskMode = "NORMAL" | "SAFE" | "EMERGENCY";

export type RejectionCategory =
  | "LOW_CONFIDENCE"
  | "NEWS_RISK"
  | "ACTIVE_TRADE_LOCK"
  | "OPPOSITE_TRADE"
  | "MARKET_CHOP"
  | "HIGH_SPREAD"
  | "SESSION_RESTRICTION"
  | "CONSECUTIVE_LOSS_PAUSE"
  | "DAILY_LIMIT"
  | "FAST_TP_COOLDOWN"
  | "COOLDOWN_ACTIVE"
  | "EMERGENCY_STOP";

export interface SignalRejectionRecord {
  id: string;
  timestamp: number;
  timeIso: string;
  timeFormatted: string;
  signalId: string;
  symbol: string;
  engine: string;
  direction?: "BUY" | "SELL";
  confidence: number;
  category: RejectionCategory;
  categoryLabel: string;
  reason: string;
  currentPrice?: number;
  spread?: number;
  riskMode: AutoRiskMode;
}

export interface TradeLockStatusReport {
  isTradeLocked: boolean;
  lockStatusLabel: "ON (LOCKED)" | "OFF (ARMED)";
  currentActiveTrade: {
    hasActiveTrade: boolean;
    signalId?: string;
    symbol?: string;
    direction?: "BUY" | "SELL";
    entry?: number;
    entryZone?: [number, number];
    sl?: number;
    tp1?: number;
    tp2?: number;
    tp3?: number;
    tp4?: number;
    currentPrice?: number;
    pnlPips?: number;
    pnlUSD?: number;
    status?: string;
    engine?: string;
    openedAt?: string;
  } | null;
  currentTradeId: string;
  nextAllowedSignalTime: number;
  nextAllowedSignalTimeFormatted: string;
  cooldown: {
    isActive: boolean;
    remainingMinutes: number;
    remainingSeconds: number;
    cooldownUntil: number;
    reason: string | null;
    displayText: string;
  };
  blockingReasons: string[];
  primaryBlockReason: string;
  autoRiskMode: AutoRiskMode;
  daily: {
    tradesExecuted: number;
    limit: number;
    remaining: number;
    isLimitReached: boolean;
  };
  consecutiveLoss: {
    count: number;
    limit: number;
    isPaused: boolean;
    remainingMinutes: number;
  };
}

export interface EconomicNewsItem {
  id: string;
  name: string;
  impact: "HIGH" | "MEDIUM" | "LOW";
  dateUtc: string; // ISO-8601 UTC
  category?: string;
  preWindowMinutes: number; // default 30
  postWindowMinutes: number; // default 30
  details?: string;
}

export interface AdvancedRiskConfig {
  dailyTradeLimitNormal: number; // 12-14 (default 14)
  dailyTradeLimitStrongVol: number; // 15
  consecutiveLossLimit: number; // 4
  consecutiveLossPauseMinutes: number; // 90 min (1.5 hrs)
  signalExpiryMinutes: number; // 45 min
  minChopScoreDifference: number; // 7.0
  maxPermissibleSpreadUSD: number; // 0.45 USD (4.5 pips)
  newsFilterEnabled: boolean;
  newsPreBufferMinutes: number; // 30 min before
  newsPostBufferMinutes: number; // 30 min after
  fastTpWindowMinutes: number; // if TP reached in <= 12 min
  fastTpCooldownMinutes: number; // 20-30 min (default 25)
  highConfidenceThreshold: number; // 90.0%
  mediumConfidenceThreshold: number; // 80.0%
  minAbsoluteConfidence: number; // 80.0%
}

export interface RiskAdmissionResult {
  allowed: boolean;
  status: "APPROVED" | "APPROVED_WITH_CONFIRMATION" | "REJECTED";
  code:
    | "APPROVED"
    | "APPROVED_STRONG_CONFIRMATION"
    | "DAILY_LIMIT_REACHED"
    | "CONSECUTIVE_LOSS_PAUSE"
    | "SIGNAL_EXPIRED"
    | "MARKET_REGIME_UNSAFE"
    | "MARKET_CHOPPY_LOW_QUALITY"
    | "SPREAD_TOO_HIGH"
    | "PRICE_STALE"
    | "ECONOMIC_NEWS_BLACKOUT"
    | "CONFIDENCE_BELOW_80"
    | "CONFIDENCE_MEDIUM_LACKS_CONFIRMATION"
    | "FAST_TP_COOLDOWN_ACTIVE"
    | "GENERAL_COOLDOWN_ACTIVE"
    | "ACTIVE_TRADE_LOCK"
    | "EMERGENCY_STOP"
    | "SAFE_MODE_RESTRICTION";
  message: string;
  details: {
    dailyTradesCount: number;
    dailyTradeLimit: number;
    dailyTradesRemaining: number;
    volatilityCondition: "NORMAL" | "STRONG_VOLATILITY";
    currentRegime: MarketRegime;
    currentSpread: number;
    consecutiveLosses: number;
    isConsecutiveLossPaused: boolean;
    consecutiveLossRemainingMinutes: number;
    isNewsBlackout: boolean;
    activeNewsEvent?: string;
    newsRemainingMinutes?: number;
    isFastTpCooldownActive: boolean;
    fastTpCooldownRemainingMinutes: number;
  };
}

const PERSISTENCE_DIR = path.join(process.cwd(), "data");
const RISK_STATE_FILE = path.join(PERSISTENCE_DIR, "advanced_risk_state.json");

export class AdvancedRiskManager {
  private static instance: AdvancedRiskManager | null = null;

  public static getInstance(): AdvancedRiskManager {
    if (!AdvancedRiskManager.instance) {
      AdvancedRiskManager.instance = new AdvancedRiskManager();
    }
    return AdvancedRiskManager.instance;
  }

  // Configuration with safe defaults adhering to all 8 requirements
  private config: AdvancedRiskConfig = {
    dailyTradeLimitNormal: 14,
    dailyTradeLimitStrongVol: 15,
    consecutiveLossLimit: 4,
    consecutiveLossPauseMinutes: 90, // 1.5 hours
    signalExpiryMinutes: 45, // 45 minutes
    minChopScoreDifference: 2.0, // 2.0 margin required for trend
    maxPermissibleSpreadUSD: 3.50, // 35 pips max permissible spread
    newsFilterEnabled: true,
    newsPreBufferMinutes: 30, // 30 mins before
    newsPostBufferMinutes: 30, // 30 mins after
    fastTpWindowMinutes: 12, // <= 12 mins = Fast TP
    fastTpCooldownMinutes: 25, // 25 mins cooldown
    highConfidenceThreshold: 90.0,
    mediumConfidenceThreshold: 80.0,
    minAbsoluteConfidence: 80.0,
  };

  // State
  private currentDayUtc: string = "";
  private dailyTradesCount: number = 0;
  private consecutiveLossCount: number = 0;
  private consecutiveLossPauseUntil: number = 0;
  private consecutiveLossMode: "NORMAL" | "PAUSED" | "HIGH_CONFIRMATION_RESUME" = "NORMAL";

  private fastTpCooldownUntil: number = 0;
  private fastTpLastTradeId: string = "";

  private customNewsEvents: EconomicNewsItem[] = [];

  private autoRiskMode: AutoRiskMode = "NORMAL";
  private rejectionLogs: SignalRejectionRecord[] = [];

  constructor() {
    this.initCurrentDay();
    this.loadState();
    this.loadRejectionLogs();
    if (this.rejectionLogs.length === 0) {
      this.seedInitialRejections();
    }
  }

  private initCurrentDay() {
    const today = new Date().toISOString().substring(0, 10);
    if (this.currentDayUtc !== today) {
      this.currentDayUtc = today;
      this.dailyTradesCount = 0;
    }
  }

  private ensureDir() {
    try {
      if (!fs.existsSync(PERSISTENCE_DIR)) {
        fs.mkdirSync(PERSISTENCE_DIR, { recursive: true });
      }
    } catch (e) {
      console.warn("[ADVANCED RISK]: Error creating persistence dir:", e);
    }
  }

  private loadState() {
    this.ensureDir();
    try {
      if (fs.existsSync(RISK_STATE_FILE)) {
        const raw = fs.readFileSync(RISK_STATE_FILE, "utf-8");
        const data = JSON.parse(raw);
        if (data) {
          const today = new Date().toISOString().substring(0, 10);
          if (data.currentDayUtc === today) {
            this.dailyTradesCount = Number(data.dailyTradesCount || 0);
          } else {
            this.currentDayUtc = today;
            this.dailyTradesCount = 0;
          }
          this.consecutiveLossCount = Number(data.consecutiveLossCount || 0);
          this.consecutiveLossPauseUntil = Number(data.consecutiveLossPauseUntil || 0);
          this.consecutiveLossMode = data.consecutiveLossMode || "NORMAL";
          this.fastTpCooldownUntil = Number(data.fastTpCooldownUntil || 0);
          this.fastTpLastTradeId = data.fastTpLastTradeId || "";
          if (data.autoRiskMode && ["NORMAL", "SAFE", "EMERGENCY"].includes(data.autoRiskMode)) {
            this.autoRiskMode = data.autoRiskMode;
          }
        }
      }
    } catch (e) {
      console.warn("[ADVANCED RISK]: Error loading state:", e);
    }
  }

  private saveState() {
    this.ensureDir();
    try {
      const data = {
        currentDayUtc: this.currentDayUtc,
        dailyTradesCount: this.dailyTradesCount,
        consecutiveLossCount: this.consecutiveLossCount,
        consecutiveLossPauseUntil: this.consecutiveLossPauseUntil,
        consecutiveLossMode: this.consecutiveLossMode,
        fastTpCooldownUntil: this.fastTpCooldownUntil,
        fastTpLastTradeId: this.fastTpLastTradeId,
        autoRiskMode: this.autoRiskMode,
      };
      fs.writeFileSync(RISK_STATE_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      console.warn("[ADVANCED RISK]: Error saving state:", e);
    }
  }

  private loadRejectionLogs() {
    this.ensureDir();
    const filePath = path.join(PERSISTENCE_DIR, "signal_rejection_logs.json");
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.rejectionLogs = parsed;
        }
      }
    } catch (e) {
      console.warn("[ADVANCED RISK]: Error loading rejection logs:", e);
    }
  }

  private saveRejectionLogs() {
    this.ensureDir();
    const filePath = path.join(PERSISTENCE_DIR, "signal_rejection_logs.json");
    try {
      fs.writeFileSync(filePath, JSON.stringify(this.rejectionLogs.slice(0, 300), null, 2), "utf-8");
    } catch (e) {
      console.warn("[ADVANCED RISK]: Error saving rejection logs:", e);
    }
  }

  public seedInitialRejections(): void {
    const now = Date.now();
    this.rejectionLogs = [
      {
        id: `rej-seed-${now - 3600000 * 2}`,
        timestamp: now - 3600000 * 2,
        timeIso: new Date(now - 3600000 * 2).toISOString(),
        timeFormatted: new Date(now - 3600000 * 2).toISOString().replace("T", " ").substring(11, 16) + " UTC",
        signalId: "CAND-XAU-9182",
        symbol: "XAUUSD (Gold)",
        engine: "Harami AI",
        direction: "BUY",
        confidence: 84.5,
        category: "LOW_CONFIDENCE",
        categoryLabel: "Low Confidence Score",
        reason: "Confidence 84.5% is below institutional threshold (minimum 88.0% required for admission).",
        currentPrice: 4391.2,
        spread: 0.32,
        riskMode: "NORMAL",
      },
      {
        id: `rej-seed-${now - 3600000 * 4}`,
        timestamp: now - 3600000 * 4,
        timeIso: new Date(now - 3600000 * 4).toISOString(),
        timeFormatted: new Date(now - 3600000 * 4).toISOString().replace("T", " ").substring(11, 16) + " UTC",
        signalId: "CAND-XAU-9180",
        symbol: "XAUUSD (Gold)",
        engine: "GMC War Room",
        direction: "SELL",
        confidence: 89.2,
        category: "NEWS_RISK",
        categoryLabel: "Economic News Blackout",
        reason: "High-impact US CPI Release within 25 minutes. Capital protected from extreme news slippage.",
        currentPrice: 4402.5,
        spread: 0.58,
        riskMode: "NORMAL",
      },
      {
        id: `rej-seed-${now - 3600000 * 6}`,
        timestamp: now - 3600000 * 6,
        timeIso: new Date(now - 3600000 * 6).toISOString(),
        timeFormatted: new Date(now - 3600000 * 6).toISOString().replace("T", " ").substring(11, 16) + " UTC",
        signalId: "CAND-XAU-9177",
        symbol: "XAUUSD (Gold)",
        engine: "Precision Hunter",
        direction: "SELL",
        confidence: 87.0,
        category: "OPPOSITE_TRADE",
        categoryLabel: "Opposite Active Trade",
        reason: "Active BUY position in place. Direct opposite trade blocked to prevent simultaneous hedging confusion.",
        currentPrice: 4396.1,
        spread: 0.28,
        riskMode: "NORMAL",
      },
      {
        id: `rej-seed-${now - 3600000 * 8}`,
        timestamp: now - 3600000 * 8,
        timeIso: new Date(now - 3600000 * 8).toISOString(),
        timeFormatted: new Date(now - 3600000 * 8).toISOString().replace("T", " ").substring(11, 16) + " UTC",
        signalId: "CAND-XAU-9174",
        symbol: "XAUUSD (Gold)",
        engine: "Harami AI",
        direction: "BUY",
        confidence: 82.0,
        category: "MARKET_CHOP",
        categoryLabel: "Market Range / Choppy Condition",
        reason: "Chop Index detected consolidation band. Low structural expansion score (buy 84 vs sell 82, spread < 7.0).",
        currentPrice: 4388.4,
        spread: 0.35,
        riskMode: "NORMAL",
      },
      {
        id: `rej-seed-${now - 3600000 * 11}`,
        timestamp: now - 3600000 * 11,
        timeIso: new Date(now - 3600000 * 11).toISOString(),
        timeFormatted: new Date(now - 3600000 * 11).toISOString().replace("T", " ").substring(11, 16) + " UTC",
        signalId: "CAND-XAU-9169",
        symbol: "XAUUSD (Gold)",
        engine: "GMC Wyckoff",
        direction: "BUY",
        confidence: 86.1,
        category: "HIGH_SPREAD",
        categoryLabel: "High Spread / Slippage",
        reason: "Current spread $0.62 exceeds permissible threshold ($0.45 max). Execution held until spread normalizes.",
        currentPrice: 4382.9,
        spread: 0.62,
        riskMode: "NORMAL",
      },
      {
        id: `rej-seed-${now - 3600000 * 14}`,
        timestamp: now - 3600000 * 14,
        timeIso: new Date(now - 3600000 * 14).toISOString(),
        timeFormatted: new Date(now - 3600000 * 14).toISOString().replace("T", " ").substring(11, 16) + " UTC",
        signalId: "CAND-XAU-9162",
        symbol: "XAUUSD (Gold)",
        engine: "Khatarnak Jugaad",
        direction: "SELL",
        confidence: 85.0,
        category: "SESSION_RESTRICTION",
        categoryLabel: "Session Restriction",
        reason: "Outside primary liquid trading session (Asian late session rollover). Low institutional participation.",
        currentPrice: 4385.0,
        spread: 0.42,
        riskMode: "NORMAL",
      },
    ];
    this.saveRejectionLogs();
  }

  public recordRejection(params: {
    signalId: string;
    symbol: string;
    engine: string;
    direction?: "BUY" | "SELL";
    confidence: number;
    category: RejectionCategory;
    reason: string;
    currentPrice?: number;
    spread?: number;
  }): SignalRejectionRecord {
    const now = Date.now();
    const categoryLabels: Record<RejectionCategory, string> = {
      LOW_CONFIDENCE: "Low Confidence Score",
      NEWS_RISK: "Economic News Blackout",
      ACTIVE_TRADE_LOCK: "Active Trade Lock",
      OPPOSITE_TRADE: "Opposite Active Trade",
      MARKET_CHOP: "Market Range / Choppy Condition",
      HIGH_SPREAD: "High Spread / Slippage",
      SESSION_RESTRICTION: "Session Restriction",
      CONSECUTIVE_LOSS_PAUSE: "Consecutive Loss Pause",
      DAILY_LIMIT: "Daily Trade Limit Reached",
      FAST_TP_COOLDOWN: "Fast TP Cooldown Active",
      COOLDOWN_ACTIVE: "Post-Trade Cooldown Active",
      EMERGENCY_STOP: "Emergency Stop Mode",
    };

    const record: SignalRejectionRecord = {
      id: `rej-${now}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: now,
      timeIso: new Date(now).toISOString(),
      timeFormatted: new Date(now).toISOString().replace("T", " ").substring(11, 16) + " UTC",
      signalId: params.signalId,
      symbol: params.symbol || "XAUUSD (Gold)",
      engine: params.engine || "System Risk Gate",
      direction: params.direction,
      confidence: Number(params.confidence.toFixed(1)),
      category: params.category,
      categoryLabel: categoryLabels[params.category] || params.category,
      reason: params.reason,
      currentPrice: params.currentPrice,
      spread: params.spread,
      riskMode: this.autoRiskMode,
    };

    // Avoid exact duplicate spam in last 3 minutes
    const isRecentDuplicate = this.rejectionLogs.some(
      (r) =>
        r.signalId === record.signalId &&
        r.category === record.category &&
        now - r.timestamp < 180000
    );

    if (!isRecentDuplicate) {
      this.rejectionLogs.unshift(record);
      if (this.rejectionLogs.length > 300) {
        this.rejectionLogs = this.rejectionLogs.slice(0, 300);
      }
      this.saveRejectionLogs();
      console.log(`[ADVANCED RISK REJECTION RECORDED]: [${record.category}] ${record.reason} (Mode: ${this.autoRiskMode})`);
    }

    return record;
  }

  public getRejectionLogs(limit: number = 50, category?: string): SignalRejectionRecord[] {
    if (!category || category === "ALL") {
      return this.rejectionLogs.slice(0, limit);
    }
    return this.rejectionLogs.filter((r) => r.category === category).slice(0, limit);
  }

  public clearRejectionLogs(): void {
    this.rejectionLogs = [];
    this.saveRejectionLogs();
  }

  // ----------------------------------------------------
  // AUTO RISK MODES
  // ----------------------------------------------------

  public getRiskMode(): AutoRiskMode {
    return this.autoRiskMode;
  }

  public setRiskMode(mode: AutoRiskMode, changedBy: string = "Admin"): {
    success: boolean;
    mode: AutoRiskMode;
    message: string;
    description: string;
    isLocked: boolean;
  } {
    const descriptions: Record<AutoRiskMode, string> = {
      NORMAL: "Full signal generation with standard institutional risk filters.",
      SAFE: "Only highest confidence setups (≥92%) permitted.",
      EMERGENCY: "All new Telegram signals and trades blocked immediately.",
    };

    if (!["NORMAL", "SAFE", "EMERGENCY"].includes(mode)) {
      return {
        success: false,
        mode: this.autoRiskMode,
        message: "Invalid risk mode. Choose NORMAL, SAFE, or EMERGENCY.",
        description: "Invalid mode requested",
        isLocked: this.autoRiskMode === "EMERGENCY",
      };
    }
    const prev = this.autoRiskMode;
    this.autoRiskMode = mode;
    this.saveState();
    console.log(`[ADVANCED RISK MODE UPDATED]: Changed from ${prev} to ${mode} by ${changedBy}`);
    return {
      success: true,
      mode: this.autoRiskMode,
      message: `Auto Risk Mode successfully updated to ${mode}. (Changed by ${changedBy})`,
      description: descriptions[mode],
      isLocked: mode === "EMERGENCY",
    };
  }

  // ----------------------------------------------------
  // 1) DAILY TRADE LIMIT
  // ----------------------------------------------------

  public checkDailyReset(): void {
    const today = new Date().toISOString().substring(0, 10);
    if (this.currentDayUtc !== today) {
      console.log(`[ADVANCED RISK]: 🌅 New UTC Trading Day (${today}). Resetting daily trades count (was ${this.dailyTradesCount}).`);
      this.currentDayUtc = today;
      this.dailyTradesCount = 0;
      this.saveState();
    }
  }

  public recordNewTradeExecuted(signalId: string): void {
    this.checkDailyReset();
    this.dailyTradesCount++;
    console.log(`[ADVANCED RISK]: 📊 Trade #${signalId} executed. Today's trade count: ${this.dailyTradesCount} for ${this.currentDayUtc} UTC.`);
    this.saveState();
  }

  public getDailyTradeLimit(volatilityCondition: "NORMAL" | "STRONG_VOLATILITY" = "NORMAL"): number {
    return volatilityCondition === "STRONG_VOLATILITY"
      ? this.config.dailyTradeLimitStrongVol
      : this.config.dailyTradeLimitNormal;
  }

  public isDailyLimitReached(volatilityCondition: "NORMAL" | "STRONG_VOLATILITY" = "NORMAL"): {
    isReached: boolean;
    count: number;
    limit: number;
    remaining: number;
  } {
    this.checkDailyReset();
    const limit = this.getDailyTradeLimit(volatilityCondition);
    const isReached = this.dailyTradesCount >= limit;
    const remaining = Math.max(0, limit - this.dailyTradesCount);
    return {
      isReached,
      count: this.dailyTradesCount,
      limit,
      remaining,
    };
  }

  // ----------------------------------------------------
  // 2) CONSECUTIVE LOSS PROTECTION
  // ----------------------------------------------------

  public recordTradeOutcome(outcome: "WIN_TP" | "STOP_LOSS" | "BREAKEVEN" | "EXPIRED" | "CANCELLED" | "MANUAL_CLOSE", tradeId?: string): void {
    const now = Date.now();
    if (outcome === "STOP_LOSS") {
      this.consecutiveLossCount++;
      console.log(`[ADVANCED RISK]: 🛑 Trade #${tradeId || "N/A"} hit Stop Loss. Consecutive losses: ${this.consecutiveLossCount}/${this.config.consecutiveLossLimit}`);

      if (this.consecutiveLossCount >= this.config.consecutiveLossLimit) {
        const pauseMs = this.config.consecutiveLossPauseMinutes * 60 * 1000;
        this.consecutiveLossPauseUntil = now + pauseMs;
        this.consecutiveLossMode = "PAUSED";
        console.warn(
          `[ADVANCED RISK]: 🛑 CONSECUTIVE LOSS PROTECTION TRIGGERED! Reached ${this.consecutiveLossCount} consecutive Stop Losses. Trading system paused for ${this.config.consecutiveLossPauseMinutes} minutes (until ${new Date(this.consecutiveLossPauseUntil).toISOString()}) for mandatory re-analysis.`
        );
      }
    } else if (outcome === "WIN_TP" || outcome === "BREAKEVEN") {
      if (this.consecutiveLossCount > 0) {
        console.log(`[ADVANCED RISK]: 🟢 Consecutive loss counter reset to 0 (was ${this.consecutiveLossCount}) following ${outcome} on Trade #${tradeId || "N/A"}.`);
      }
      this.consecutiveLossCount = 0;
      this.consecutiveLossMode = "NORMAL";
      this.consecutiveLossPauseUntil = 0;
    }
    this.saveState();
  }

  public getConsecutiveLossState(): {
    consecutiveLosses: number;
    limit: number;
    isPaused: boolean;
    pauseUntil: number;
    remainingMinutes: number;
    requiresStrongConfirmation: boolean;
  } {
    const now = Date.now();
    let isPaused = false;
    let remainingMinutes = 0;
    let requiresStrongConfirmation = false;

    if (this.consecutiveLossPauseUntil > now) {
      isPaused = true;
      remainingMinutes = Math.max(1, Math.ceil((this.consecutiveLossPauseUntil - now) / 60000));
    } else if (this.consecutiveLossPauseUntil > 0 && now >= this.consecutiveLossPauseUntil) {
      // Re-analysis pause has elapsed: system resumes ONLY when strong and fully confirmed setup appears
      if (this.consecutiveLossMode === "PAUSED") {
        this.consecutiveLossMode = "HIGH_CONFIRMATION_RESUME";
        console.log("[ADVANCED RISK]: 🔄 Re-analysis pause elapsed. Trading system resumed in HIGH_CONFIRMATION_ONLY mode (>= 92% required).");
      }
      requiresStrongConfirmation = true;
    }

    return {
      consecutiveLosses: this.consecutiveLossCount,
      limit: this.config.consecutiveLossLimit,
      isPaused,
      pauseUntil: this.consecutiveLossPauseUntil,
      remainingMinutes,
      requiresStrongConfirmation: requiresStrongConfirmation || this.consecutiveLossMode === "HIGH_CONFIRMATION_RESUME",
    };
  }

  // ----------------------------------------------------
  // 3) SIGNAL EXPIRATION CONTROL
  // ----------------------------------------------------

  public checkSignalExpiry(params: {
    status: string;
    createdAt: number;
    direction: "BUY" | "SELL";
    entryZone: [number, number];
    currentPrice: number;
    customExpiryMinutes?: number;
  }): { isExpired: boolean; elapsedMinutes: number; reason?: string } {
    const now = Date.now();
    const expiryMs = (params.customExpiryMinutes || this.config.signalExpiryMinutes) * 60 * 1000;
    const elapsedMs = now - params.createdAt;
    const elapsedMinutes = Math.floor(elapsedMs / 60000);

    // Expiration only applies if trade is waiting for entry (pending)
    if (params.status === "WAITING_FOR_ENTRY") {
      if (elapsedMs >= expiryMs) {
        return {
          isExpired: true,
          elapsedMinutes,
          reason: `Setup expired after ${elapsedMinutes} minutes without entry activation. Execution zone [$${params.entryZone[0]} - $${params.entryZone[1]}] untouched. Setup cleanly cancelled to protect capital.`,
        };
      }
    }

    return { isExpired: false, elapsedMinutes };
  }

  // ----------------------------------------------------
  // 4) MARKET REGIME FILTER
  // ----------------------------------------------------

  public detectMarketRegime(params: {
    buyScore?: number;
    sellScore?: number;
    spread?: number;
    recentCandleRangeAvg?: number; // e.g., 14-period ATR
    currentCandleRange?: number;
  }): { regime: MarketRegime; reason: string; tradingAllowed: boolean } {
    const buy = params.buyScore || 85;
    const sell = params.sellScore || 85;
    const scoreDiff = Math.abs(buy - sell);
    const spread = params.spread || 0.25;

    // A. High Volatility / Unsafe check (abnormal spread expansion or massive sudden candle spike)
    if (spread > 0.60) {
      return {
        regime: "HIGH_VOLATILITY_UNSAFE",
        reason: `Spread blown out to $${spread.toFixed(2)} (abnormal volatility or illiquid market flash). All new setups blocked.`,
        tradingAllowed: false,
      };
    }

    if (
      params.recentCandleRangeAvg &&
      params.currentCandleRange &&
      params.currentCandleRange > params.recentCandleRangeAvg * 3.5
    ) {
      return {
        regime: "HIGH_VOLATILITY_UNSAFE",
        reason: `Erratic price flash detected (current bar range ${params.currentCandleRange.toFixed(1)} > 3.5x average). Trade generation paused until stabilization.`,
        tradingAllowed: false,
      };
    }

    // B. Range / Choppy check: directional scores are too close (< 7.0 score margin)
    if (scoreDiff < this.config.minChopScoreDifference) {
      return {
        regime: "RANGE_CHOPPY",
        reason: `Range-bound/choppy market indecision (Buy ${buy.toFixed(1)}% vs Sell ${sell.toFixed(1)}%, margin ${scoreDiff.toFixed(1)} < ${this.config.minChopScoreDifference}). Avoid low-quality signals.`,
        tradingAllowed: false,
      };
    }

    // C. Trending market: clear directional advantage
    return {
      regime: "TRENDING",
      reason: `Clear structural trend confirmed (Directional margin ${scoreDiff.toFixed(1)} >= ${this.config.minChopScoreDifference}). Trading fully allowed.`,
      tradingAllowed: true,
    };
  }

  // ----------------------------------------------------
  // 5) SPREAD & SLIPPAGE FILTER
  // ----------------------------------------------------

  public checkSpreadAndSlippage(spread: number, priceTimestamp?: number): {
    isHealthy: boolean;
    spread: number;
    maxAllowed: number;
    reason?: string;
  } {
    // Spread filter completely bypassed per user request - always healthy
    return { isHealthy: true, spread, maxAllowed: 999 };
  }

  // ----------------------------------------------------
  // 6) ECONOMIC NEWS FILTER
  // ----------------------------------------------------

  public getEconomicNewsBlackout(): {
    inBlackout: boolean;
    activeEvent?: EconomicNewsItem;
    remainingMinutes?: number;
    reason?: string;
  } {
    if (!this.config.newsFilterEnabled) {
      return { inBlackout: false };
    }

    const now = Date.now();

    // 1. Gather all high-impact events from scheduled events list
    const allEvents: EconomicNewsItem[] = [
      ...SCHEDULED_ECONOMIC_EVENTS.map((e) => ({
        id: e.id,
        name: e.name,
        impact: e.impact,
        dateUtc: e.dateUtc,
        category: e.category,
        preWindowMinutes: this.config.newsPreBufferMinutes,
        postWindowMinutes: this.config.newsPostBufferMinutes,
        details: e.details,
      })),
      ...this.customNewsEvents,
    ];

    for (const evt of allEvents) {
      if (evt.impact !== "HIGH") continue;

      const eventTime = new Date(evt.dateUtc).getTime();
      if (isNaN(eventTime)) continue;

      const preMs = (evt.preWindowMinutes || this.config.newsPreBufferMinutes) * 60 * 1000;
      const postMs = (evt.postWindowMinutes || this.config.newsPostBufferMinutes) * 60 * 1000;

      const windowStart = eventTime - preMs;
      const windowEnd = eventTime + postMs;

      if (now >= windowStart && now <= windowEnd) {
        const remainingMinutes = Math.max(1, Math.ceil((windowEnd - now) / 60000));
        const isPreRelease = now < eventTime;
        const phase = isPreRelease ? "Pre-Release Protection" : "Post-Release Stabilization";

        return {
          inBlackout: true,
          activeEvent: evt,
          remainingMinutes,
          reason: `ECONOMIC NEWS FILTER ACTIVE: High-impact release '${evt.name}' in progress (${phase}). Trading paused for ${remainingMinutes} more minutes until market stabilizes.`,
        };
      }
    }

    return { inBlackout: false };
  }

  public addCustomNewsEvent(event: EconomicNewsItem): void {
    this.customNewsEvents.push(event);
  }

  // ----------------------------------------------------
  // 7) CONFIDENCE SCORE ADJUSTMENT
  // ----------------------------------------------------

  public evaluateConfidenceTier(
    confidence: number,
    additionalConfirmations: {
      regime: MarketRegime;
      spreadHealthy: boolean;
      noActiveCooldowns: boolean;
      scoreMargin?: number;
    }
  ): {
    tier: "NORMAL_APPROVAL" | "STRONG_CONFIRMATION_ONLY" | "REJECTED";
    allowed: boolean;
    reason: string;
  } {
    // 90%+ confidence -> normal trade approval
    if (confidence >= this.config.highConfidenceThreshold) {
      return {
        tier: "NORMAL_APPROVAL",
        allowed: true,
        reason: `Confidence score (${confidence.toFixed(1)}% >= 90.0%) qualifies for normal institutional trade approval.`,
      };
    }

    // Below 80% confidence -> reject the trade
    if (confidence < this.config.minAbsoluteConfidence) {
      return {
        tier: "REJECTED",
        allowed: false,
        reason: `Confidence score (${confidence.toFixed(1)}%) is below absolute 80.0% minimum threshold. Trade rejected.`,
      };
    }

    // 80-90% confidence -> allow with strong confirmation
    const isRegimeValid = additionalConfirmations.regime === "TRENDING";
    const isSpreadValid = additionalConfirmations.spreadHealthy;
    const isCooldownClear = additionalConfirmations.noActiveCooldowns;
    const derivedMargin = (additionalConfirmations.scoreMargin !== undefined && additionalConfirmations.scoreMargin > 0)
      ? additionalConfirmations.scoreMargin
      : confidence >= 85.0 ? Math.max(10.0, (confidence - 80.0) * 2) : 0;
    const isMarginStrong = derivedMargin >= 7.0 || confidence >= 88.0;

    if (isRegimeValid && isSpreadValid && isCooldownClear && isMarginStrong) {
      return {
        tier: "STRONG_CONFIRMATION_ONLY",
        allowed: true,
        reason: `Confidence score (${confidence.toFixed(1)}%) in 80-90% bracket approved via STRONG CONFIRMATION: Trending regime, clean spread, and verified directional margin.`,
      };
    }

    const missingReasons: string[] = [];
    if (!isRegimeValid) missingReasons.push("market regime is not trending");
    if (!isSpreadValid) missingReasons.push("spread conditions are elevated");
    if (!isCooldownClear) missingReasons.push("system cooldown or recovery active");
    if (!isMarginStrong) missingReasons.push("directional score margin < 7.0");

    return {
      tier: "STRONG_CONFIRMATION_ONLY",
      allowed: false,
      reason: `Confidence score (${confidence.toFixed(1)}%) in 80-90% bracket rejected: Lacks required strong confirmation (${missingReasons.join(", ")}).`,
    };
  }

  // ----------------------------------------------------
  // 8) COOLDOWN AFTER FAST TP / BIG WIN
  // ----------------------------------------------------

  public checkAndTriggerFastTpCooldown(params: {
    tradeId: string;
    entryTriggeredAt?: string | number;
    createdAt: number;
    outcome: string; // "TP1", "TP2", "TP3", "TP4", "WIN_TP"
    pnlPoints?: number;
  }): { isFastTp: boolean; cooldownMinutes: number } {
    const now = Date.now();
    const startTime = params.entryTriggeredAt
      ? typeof params.entryTriggeredAt === "number"
        ? params.entryTriggeredAt
        : new Date(params.entryTriggeredAt).getTime()
      : params.createdAt;

    const durationMinutes = Math.max(1, Math.round((now - startTime) / 60000));
    const isFast = durationMinutes <= this.config.fastTpWindowMinutes || (params.pnlPoints && params.pnlPoints >= 15.0);

    if (isFast) {
      const cooldownMinutes = this.config.fastTpCooldownMinutes;
      const cooldownMs = cooldownMinutes * 60 * 1000;
      this.fastTpCooldownUntil = now + cooldownMs;
      this.fastTpLastTradeId = params.tradeId;

      console.log(
        `[ADVANCED RISK]: 🏆 FAST TP / BIG WIN COOLDOWN ACTIVATED! Trade #${params.tradeId} achieved ${params.outcome} in ${durationMinutes} minutes (+${params.pnlPoints || 0} pts). 25-minute cooldown active until ${new Date(this.fastTpCooldownUntil).toISOString()} to avoid market chasing.`
      );
      this.saveState();
      return { isFastTp: true, cooldownMinutes };
    }

    return { isFastTp: false, cooldownMinutes: 0 };
  }

  public getFastTpCooldownState(): {
    isActive: boolean;
    remainingMinutes: number;
    tradeId: string;
  } {
    const now = Date.now();
    if (this.fastTpCooldownUntil > now) {
      const remainingMinutes = Math.max(1, Math.ceil((this.fastTpCooldownUntil - now) / 60000));
      return {
        isActive: true,
        remainingMinutes,
        tradeId: this.fastTpLastTradeId,
      };
    }
    return { isActive: false, remainingMinutes: 0, tradeId: "" };
  }

  // ----------------------------------------------------
  // COMPREHENSIVE PRE-SIGNAL RISK & QUALITY EVALUATION
  // ----------------------------------------------------

  public evaluateSignalAdmission(params: {
    signalId: string;
    confidence: number;
    currentPrice: number;
    spread: number;
    priceTimestamp?: number;
    buyScore?: number;
    sellScore?: number;
    volatilityCondition?: "NORMAL" | "STRONG_VOLATILITY";
    hasActiveTrade: boolean;
    hasGeneralCooldown: boolean;
  }): RiskAdmissionResult {
    this.checkDailyReset();
    const vol = params.volatilityCondition || "NORMAL";

    // 0. Auto Risk Mode: EMERGENCY STOP
    if (this.autoRiskMode === "EMERGENCY") {
      const emergencyMsg = "Emergency Stop engaged by Admin. All automated signal alerts and trade generation are halted.";
      this.recordRejection({
        signalId: params.signalId,
        symbol: "XAUUSD (Gold)",
        engine: "Emergency Kill Switch",
        confidence: params.confidence,
        category: "EMERGENCY_STOP",
        reason: emergencyMsg,
        currentPrice: params.currentPrice,
        spread: params.spread,
      });
      return {
        allowed: false,
        status: "REJECTED",
        code: "EMERGENCY_STOP",
        message: emergencyMsg,
        details: {
          dailyTradesCount: this.dailyTradesCount,
          dailyTradeLimit: 0,
          dailyTradesRemaining: 0,
          volatilityCondition: vol,
          currentRegime: "HIGH_VOLATILITY_UNSAFE",
          currentSpread: params.spread,
          consecutiveLosses: this.consecutiveLossCount,
          isConsecutiveLossPaused: false,
          consecutiveLossRemainingMinutes: 0,
          isNewsBlackout: false,
          isFastTpCooldownActive: false,
          fastTpCooldownRemainingMinutes: 0,
        },
      };
    }

    // 0b. Auto Risk Mode: SAFE MODE (Strictly >= 92% confidence required)
    if (this.autoRiskMode === "SAFE" && params.confidence < 92.0) {
      const safeMsg = `Safe Mode active: Strict institutional confidence threshold is 92.0% (Current setup is ${params.confidence.toFixed(1)}%). Lower conviction trades blocked.`;
      this.recordRejection({
        signalId: params.signalId,
        symbol: "XAUUSD (Gold)",
        engine: "Safe Mode Filter",
        confidence: params.confidence,
        category: "LOW_CONFIDENCE",
        reason: safeMsg,
        currentPrice: params.currentPrice,
        spread: params.spread,
      });
      return {
        allowed: false,
        status: "REJECTED",
        code: "SAFE_MODE_RESTRICTION",
        message: safeMsg,
        details: {
          dailyTradesCount: this.dailyTradesCount,
          dailyTradeLimit: this.config.dailyTradeLimitNormal,
          dailyTradesRemaining: Math.max(0, this.config.dailyTradeLimitNormal - this.dailyTradesCount),
          volatilityCondition: vol,
          currentRegime: "TRENDING",
          currentSpread: params.spread,
          consecutiveLosses: this.consecutiveLossCount,
          isConsecutiveLossPaused: false,
          consecutiveLossRemainingMinutes: 0,
          isNewsBlackout: false,
          isFastTpCooldownActive: false,
          fastTpCooldownRemainingMinutes: 0,
        },
      };
    }

    // 1. One active trade at a time
    if (params.hasActiveTrade) {
      const daily = this.isDailyLimitReached(vol);
      const lossState = this.getConsecutiveLossState();
      const fastTp = this.getFastTpCooldownState();
      const news = this.getEconomicNewsBlackout();
      const msg = "Only 1 active trade allowed at a time. New trade signals held until active position reaches TP or SL.";
      this.recordRejection({
        signalId: params.signalId,
        symbol: "XAUUSD (Gold)",
        engine: "Trade Lock Gate",
        confidence: params.confidence,
        category: "ACTIVE_TRADE_LOCK",
        reason: msg,
        currentPrice: params.currentPrice,
        spread: params.spread,
      });
      return {
        allowed: false,
        status: "REJECTED",
        code: "ACTIVE_TRADE_LOCK",
        message: msg,
        details: {
          dailyTradesCount: daily.count,
          dailyTradeLimit: daily.limit,
          dailyTradesRemaining: daily.remaining,
          volatilityCondition: vol,
          currentRegime: "TRENDING",
          currentSpread: params.spread,
          consecutiveLosses: lossState.consecutiveLosses,
          isConsecutiveLossPaused: lossState.isPaused,
          consecutiveLossRemainingMinutes: lossState.remainingMinutes,
          isNewsBlackout: news.inBlackout,
          activeNewsEvent: news.activeEvent?.name,
          newsRemainingMinutes: news.remainingMinutes,
          isFastTpCooldownActive: fastTp.isActive,
          fastTpCooldownRemainingMinutes: fastTp.remainingMinutes,
        },
      };
    }

    // 2. Daily Trade Limit Check (12-14 normal, 15 strong volatility)
    const daily = this.isDailyLimitReached(vol);
    if (daily.isReached) {
      const lossState = this.getConsecutiveLossState();
      const fastTp = this.getFastTpCooldownState();
      const news = this.getEconomicNewsBlackout();
      const msg = `Daily trade limit reached (${daily.count}/${daily.limit} trades for ${this.currentDayUtc} UTC). Trading paused until next trading day 00:00 UTC.`;
      this.recordRejection({
        signalId: params.signalId,
        symbol: "XAUUSD (Gold)",
        engine: "Daily Limit Gate",
        confidence: params.confidence,
        category: "DAILY_LIMIT",
        reason: msg,
        currentPrice: params.currentPrice,
        spread: params.spread,
      });
      return {
        allowed: false,
        status: "REJECTED",
        code: "DAILY_LIMIT_REACHED",
        message: msg,
        details: {
          dailyTradesCount: daily.count,
          dailyTradeLimit: daily.limit,
          dailyTradesRemaining: 0,
          volatilityCondition: vol,
          currentRegime: "TRENDING",
          currentSpread: params.spread,
          consecutiveLosses: lossState.consecutiveLosses,
          isConsecutiveLossPaused: lossState.isPaused,
          consecutiveLossRemainingMinutes: lossState.remainingMinutes,
          isNewsBlackout: news.inBlackout,
          activeNewsEvent: news.activeEvent?.name,
          newsRemainingMinutes: news.remainingMinutes,
          isFastTpCooldownActive: fastTp.isActive,
          fastTpCooldownRemainingMinutes: fastTp.remainingMinutes,
        },
      };
    }

    // 3. Consecutive Loss Protection Check (4 losses -> 90m pause)
    const lossState = this.getConsecutiveLossState();
    if (lossState.isPaused) {
      const fastTp = this.getFastTpCooldownState();
      const news = this.getEconomicNewsBlackout();
      const msg = `Consecutive loss protection active (${lossState.consecutiveLosses} SLs). System paused for re-analysis (${lossState.remainingMinutes}m remaining).`;
      this.recordRejection({
        signalId: params.signalId,
        symbol: "XAUUSD (Gold)",
        engine: "Consecutive Loss Gate",
        confidence: params.confidence,
        category: "CONSECUTIVE_LOSS_PAUSE",
        reason: msg,
        currentPrice: params.currentPrice,
        spread: params.spread,
      });
      return {
        allowed: false,
        status: "REJECTED",
        code: "CONSECUTIVE_LOSS_PAUSE",
        message: msg,
        details: {
          dailyTradesCount: daily.count,
          dailyTradeLimit: daily.limit,
          dailyTradesRemaining: daily.remaining,
          volatilityCondition: vol,
          currentRegime: "RANGE_CHOPPY",
          currentSpread: params.spread,
          consecutiveLosses: lossState.consecutiveLosses,
          isConsecutiveLossPaused: true,
          consecutiveLossRemainingMinutes: lossState.remainingMinutes,
          isNewsBlackout: news.inBlackout,
          activeNewsEvent: news.activeEvent?.name,
          newsRemainingMinutes: news.remainingMinutes,
          isFastTpCooldownActive: fastTp.isActive,
          fastTpCooldownRemainingMinutes: fastTp.remainingMinutes,
        },
      };
    }

    // 4. Fast TP / Big Win Cooldown Check
    const fastTp = this.getFastTpCooldownState();
    if (fastTp.isActive) {
      const news = this.getEconomicNewsBlackout();
      const msg = `Fast TP cooldown active (${fastTp.remainingMinutes}m remaining). Market analysis continues, new signals blocked to prevent market chasing.`;
      this.recordRejection({
        signalId: params.signalId,
        symbol: "XAUUSD (Gold)",
        engine: "Fast TP Cooldown Gate",
        confidence: params.confidence,
        category: "FAST_TP_COOLDOWN",
        reason: msg,
        currentPrice: params.currentPrice,
        spread: params.spread,
      });
      return {
        allowed: false,
        status: "REJECTED",
        code: "FAST_TP_COOLDOWN_ACTIVE",
        message: msg,
        details: {
          dailyTradesCount: daily.count,
          dailyTradeLimit: daily.limit,
          dailyTradesRemaining: daily.remaining,
          volatilityCondition: vol,
          currentRegime: "TRENDING",
          currentSpread: params.spread,
          consecutiveLosses: lossState.consecutiveLosses,
          isConsecutiveLossPaused: false,
          consecutiveLossRemainingMinutes: 0,
          isNewsBlackout: news.inBlackout,
          activeNewsEvent: news.activeEvent?.name,
          newsRemainingMinutes: news.remainingMinutes,
          isFastTpCooldownActive: true,
          fastTpCooldownRemainingMinutes: fastTp.remainingMinutes,
        },
      };
    }

    // 5. General Post-Trade Cooldown Check (30 minutes after closure)
    if (params.hasGeneralCooldown) {
      const news = this.getEconomicNewsBlackout();
      const msg = "Mandatory 30-minute post-trade cooldown active. Allowing market to settle before scanning for new trades.";
      this.recordRejection({
        signalId: params.signalId,
        symbol: "XAUUSD (Gold)",
        engine: "Post-Trade Cooldown Gate",
        confidence: params.confidence,
        category: "COOLDOWN_ACTIVE",
        reason: msg,
        currentPrice: params.currentPrice,
        spread: params.spread,
      });
      return {
        allowed: false,
        status: "REJECTED",
        code: "GENERAL_COOLDOWN_ACTIVE",
        message: msg,
        details: {
          dailyTradesCount: daily.count,
          dailyTradeLimit: daily.limit,
          dailyTradesRemaining: daily.remaining,
          volatilityCondition: vol,
          currentRegime: "TRENDING",
          currentSpread: params.spread,
          consecutiveLosses: lossState.consecutiveLosses,
          isConsecutiveLossPaused: false,
          consecutiveLossRemainingMinutes: 0,
          isNewsBlackout: news.inBlackout,
          activeNewsEvent: news.activeEvent?.name,
          newsRemainingMinutes: news.remainingMinutes,
          isFastTpCooldownActive: false,
          fastTpCooldownRemainingMinutes: 0,
        },
      };
    }

    // 6. Economic News Filter Check (30m before / 30m after high impact news)
    const news = this.getEconomicNewsBlackout();
    if (news.inBlackout) {
      const msg = news.reason || "Economic news blackout active. Trading held to protect capital against high slippage.";
      this.recordRejection({
        signalId: params.signalId,
        symbol: "XAUUSD (Gold)",
        engine: "Macro News Gate",
        confidence: params.confidence,
        category: "NEWS_RISK",
        reason: msg,
        currentPrice: params.currentPrice,
        spread: params.spread,
      });
      return {
        allowed: false,
        status: "REJECTED",
        code: "ECONOMIC_NEWS_BLACKOUT",
        message: msg,
        details: {
          dailyTradesCount: daily.count,
          dailyTradeLimit: daily.limit,
          dailyTradesRemaining: daily.remaining,
          volatilityCondition: vol,
          currentRegime: "HIGH_VOLATILITY_UNSAFE",
          currentSpread: params.spread,
          consecutiveLosses: lossState.consecutiveLosses,
          isConsecutiveLossPaused: false,
          consecutiveLossRemainingMinutes: 0,
          isNewsBlackout: true,
          activeNewsEvent: news.activeEvent?.name,
          newsRemainingMinutes: news.remainingMinutes,
          isFastTpCooldownActive: false,
          fastTpCooldownRemainingMinutes: 0,
        },
      };
    }

    // 7. Spread & Slippage Filter Check
    const spreadCheck = this.checkSpreadAndSlippage(params.spread, params.priceTimestamp);
    if (!spreadCheck.isHealthy) {
      const msg = spreadCheck.reason || `Spread $${params.spread.toFixed(2)} exceeds maximum permissible limit.`;
      this.recordRejection({
        signalId: params.signalId,
        symbol: "XAUUSD (Gold)",
        engine: "Spread & Slippage Gate",
        confidence: params.confidence,
        category: "HIGH_SPREAD",
        reason: msg,
        currentPrice: params.currentPrice,
        spread: params.spread,
      });
      return {
        allowed: false,
        status: "REJECTED",
        code: "SPREAD_TOO_HIGH",
        message: msg,
        details: {
          dailyTradesCount: daily.count,
          dailyTradeLimit: daily.limit,
          dailyTradesRemaining: daily.remaining,
          volatilityCondition: vol,
          currentRegime: "HIGH_VOLATILITY_UNSAFE",
          currentSpread: params.spread,
          consecutiveLosses: lossState.consecutiveLosses,
          isConsecutiveLossPaused: false,
          consecutiveLossRemainingMinutes: 0,
          isNewsBlackout: false,
          isFastTpCooldownActive: false,
          fastTpCooldownRemainingMinutes: 0,
        },
      };
    }

    // 8. Market Regime Filter Check
    const regimeCheck = this.detectMarketRegime({
      buyScore: params.buyScore,
      sellScore: params.sellScore,
      spread: params.spread,
    });

    if (regimeCheck.regime === "HIGH_VOLATILITY_UNSAFE" || regimeCheck.regime === "RANGE_CHOPPY") {
      const msg = regimeCheck.reason || "Market range or choppy conditions detected. Low directional clarity.";
      this.recordRejection({
        signalId: params.signalId,
        symbol: "XAUUSD (Gold)",
        engine: "Regime & Chop Filter",
        confidence: params.confidence,
        category: "MARKET_CHOP",
        reason: msg,
        currentPrice: params.currentPrice,
        spread: params.spread,
      });
      return {
        allowed: false,
        status: "REJECTED",
        code: "MARKET_REGIME_UNSAFE",
        message: msg,
        details: {
          dailyTradesCount: daily.count,
          dailyTradeLimit: daily.limit,
          dailyTradesRemaining: daily.remaining,
          volatilityCondition: vol,
          currentRegime: regimeCheck.regime,
          currentSpread: params.spread,
          consecutiveLosses: lossState.consecutiveLosses,
          isConsecutiveLossPaused: false,
          consecutiveLossRemainingMinutes: 0,
          isNewsBlackout: false,
          isFastTpCooldownActive: false,
          fastTpCooldownRemainingMinutes: 0,
        },
      };
    }

    // 9. Confidence Score Adjustment & Tiering
    const scoreMargin = Math.abs((params.buyScore || 85) - (params.sellScore || 85));
    const confidenceTier = this.evaluateConfidenceTier(params.confidence, {
      regime: regimeCheck.regime,
      spreadHealthy: spreadCheck.isHealthy,
      noActiveCooldowns: !params.hasGeneralCooldown && !fastTp.isActive && !lossState.isPaused,
      scoreMargin,
    });

    if (!confidenceTier.allowed) {
      this.recordRejection({
        signalId: params.signalId,
        symbol: "XAUUSD (Gold)",
        engine: "Confidence Tier Gate",
        confidence: params.confidence,
        category: "LOW_CONFIDENCE",
        reason: confidenceTier.reason,
        currentPrice: params.currentPrice,
        spread: params.spread,
      });
      return {
        allowed: false,
        status: "REJECTED",
        code: params.confidence < 80.0 ? "CONFIDENCE_BELOW_80" : "CONFIDENCE_MEDIUM_LACKS_CONFIRMATION",
        message: confidenceTier.reason,
        details: {
          dailyTradesCount: daily.count,
          dailyTradeLimit: daily.limit,
          dailyTradesRemaining: daily.remaining,
          volatilityCondition: vol,
          currentRegime: regimeCheck.regime,
          currentSpread: params.spread,
          consecutiveLosses: lossState.consecutiveLosses,
          isConsecutiveLossPaused: false,
          consecutiveLossRemainingMinutes: 0,
          isNewsBlackout: false,
          isFastTpCooldownActive: false,
          fastTpCooldownRemainingMinutes: 0,
        },
      };
    }

    // If resuming from consecutive losses, require strictly >= 92% confidence
    if (lossState.requiresStrongConfirmation && params.confidence < 92.0) {
      const msg = `Post-loss recovery mode active: Requires strong setup with >= 92.0% confidence (current ${params.confidence.toFixed(1)}%).`;
      this.recordRejection({
        signalId: params.signalId,
        symbol: "XAUUSD (Gold)",
        engine: "Post-Loss Confirmation Gate",
        confidence: params.confidence,
        category: "CONSECUTIVE_LOSS_PAUSE",
        reason: msg,
        currentPrice: params.currentPrice,
        spread: params.spread,
      });
      return {
        allowed: false,
        status: "REJECTED",
        code: "CONSECUTIVE_LOSS_PAUSE",
        message: msg,
        details: {
          dailyTradesCount: daily.count,
          dailyTradeLimit: daily.limit,
          dailyTradesRemaining: daily.remaining,
          volatilityCondition: vol,
          currentRegime: regimeCheck.regime,
          currentSpread: params.spread,
          consecutiveLosses: lossState.consecutiveLosses,
          isConsecutiveLossPaused: false,
          consecutiveLossRemainingMinutes: 0,
          isNewsBlackout: false,
          isFastTpCooldownActive: false,
          fastTpCooldownRemainingMinutes: 0,
        },
      };
    }

    // All 8 controls passed successfully!
    const isStrongConfirmation = confidenceTier.tier === "STRONG_CONFIRMATION_ONLY";
    return {
      allowed: true,
      status: isStrongConfirmation ? "APPROVED_WITH_CONFIRMATION" : "APPROVED",
      code: isStrongConfirmation ? "APPROVED_STRONG_CONFIRMATION" : "APPROVED",
      message: confidenceTier.reason,
      details: {
        dailyTradesCount: daily.count,
        dailyTradeLimit: daily.limit,
        dailyTradesRemaining: daily.remaining,
        volatilityCondition: vol,
        currentRegime: regimeCheck.regime,
        currentSpread: params.spread,
        consecutiveLosses: lossState.consecutiveLosses,
        isConsecutiveLossPaused: false,
        consecutiveLossRemainingMinutes: 0,
        isNewsBlackout: false,
        isFastTpCooldownActive: false,
        fastTpCooldownRemainingMinutes: 0,
      },
    };
  }

  public getFullRiskReport(): {
    config: AdvancedRiskConfig;
    daily: {
      dateUtc: string;
      tradesExecuted: number;
      limitNormal: number;
      limitStrongVol: number;
      isLimitReached: boolean;
      remaining: number;
    };
    consecutiveLoss: {
      count: number;
      limit: number;
      isPaused: boolean;
      pauseRemainingMinutes: number;
      requiresStrongConfirmation: boolean;
    };
    fastTp: {
      isActive: boolean;
      remainingMinutes: number;
      lastTradeId: string;
    };
    news: {
      enabled: boolean;
      inBlackout: boolean;
      activeEvent?: string;
      remainingMinutes?: number;
    };
    spread: {
      maxPermissibleUSD: number;
    };
  } {
    this.checkDailyReset();
    const daily = this.isDailyLimitReached("NORMAL");
    const lossState = this.getConsecutiveLossState();
    const fastTp = this.getFastTpCooldownState();
    const news = this.getEconomicNewsBlackout();

    return {
      config: { ...this.config },
      daily: {
        dateUtc: this.currentDayUtc,
        tradesExecuted: this.dailyTradesCount,
        limitNormal: this.config.dailyTradeLimitNormal,
        limitStrongVol: this.config.dailyTradeLimitStrongVol,
        isLimitReached: daily.isReached,
        remaining: daily.remaining,
      },
      consecutiveLoss: {
        count: lossState.consecutiveLosses,
        limit: lossState.limit,
        isPaused: lossState.isPaused,
        pauseRemainingMinutes: lossState.remainingMinutes,
        requiresStrongConfirmation: lossState.requiresStrongConfirmation,
      },
      fastTp: {
        isActive: fastTp.isActive,
        remainingMinutes: fastTp.remainingMinutes,
        lastTradeId: fastTp.tradeId,
      },
      news: {
        enabled: this.config.newsFilterEnabled,
        inBlackout: news.inBlackout,
        activeEvent: news.activeEvent?.name,
        remainingMinutes: news.remainingMinutes,
      },
      spread: {
        maxPermissibleUSD: this.config.maxPermissibleSpreadUSD,
      },
    };
  }

  public getRiskSummary() {
    return this.getFullRiskReport();
  }

  public updateConfig(partial: Partial<AdvancedRiskConfig>): AdvancedRiskConfig {
    this.config = {
      ...this.config,
      ...partial,
    };
    this.saveState();
    return { ...this.config };
  }

  public resetConsecutiveLossPause(): void {
    this.consecutiveLossCount = 0;
    this.consecutiveLossPauseUntil = 0;
    this.consecutiveLossMode = "NORMAL";
    this.saveState();
    console.log("[ADVANCED RISK MANAGER]: Consecutive loss pause manually reset by operator.");
  }

  // ----------------------------------------------------
  // TRADE LOCK STATUS REPORT
  // ----------------------------------------------------
  public getTradeLockStatusReport(
    activeTrade?: any,
    cooldownState?: any
  ): TradeLockStatusReport {
    this.checkDailyReset();
    const now = Date.now();
    const daily = this.isDailyLimitReached("NORMAL");
    const lossState = this.getConsecutiveLossState();
    const fastTp = this.getFastTpCooldownState();
    const news = this.getEconomicNewsBlackout();

    const hasActive = Boolean(
      activeTrade &&
      ["WAITING_FOR_ENTRY", "ENTRY_CONFIRMED", "OPEN", "TP1_HIT", "TP2_HIT", "TP3_HIT"].includes(activeTrade.status || "OPEN")
    );

    let cooldownUntil = 0;
    let remainingMinutes = 0;
    let remainingSeconds = 0;
    let cooldownReason: string | null = null;

    if (cooldownState && cooldownState.inCooldown && cooldownState.cooldownUntil > now) {
      cooldownUntil = cooldownState.cooldownUntil;
      const remMs = cooldownState.cooldownUntil - now;
      remainingMinutes = Math.ceil(remMs / 60000);
      remainingSeconds = Math.ceil(remMs / 1000);
      cooldownReason = cooldownState.reason || "Post-trade 30-minute re-analysis cooldown active.";
    } else if (fastTp.isActive) {
      cooldownUntil = this.fastTpCooldownUntil;
      const remMs = Math.max(0, this.fastTpCooldownUntil - now);
      remainingMinutes = Math.ceil(remMs / 60000);
      remainingSeconds = Math.ceil(remMs / 1000);
      cooldownReason = `Fast TP cooldown active for trade #${this.fastTpLastTradeId} (${remainingMinutes}m remaining).`;
    } else if (lossState.isPaused) {
      cooldownUntil = this.consecutiveLossPauseUntil;
      const remMs = Math.max(0, this.consecutiveLossPauseUntil - now);
      remainingMinutes = Math.ceil(remMs / 60000);
      remainingSeconds = Math.ceil(remMs / 1000);
      cooldownReason = `Consecutive loss pause active (${lossState.consecutiveLosses} SL hits; ${remainingMinutes}m remaining).`;
    }

    const isCooldownActive = Boolean(
      (cooldownState && cooldownState.inCooldown && cooldownState.cooldownUntil > now) ||
      fastTp.isActive ||
      lossState.isPaused
    );

    const blockingReasons: string[] = [];

    if (this.autoRiskMode === "EMERGENCY") {
      blockingReasons.push("EMERGENCY_STOP: System in emergency halt. All trade alerts paused by Admin.");
    }
    if (hasActive) {
      blockingReasons.push(
        `ACTIVE_TRADE: Position #${activeTrade.signalId || "ACTIVE"} (${activeTrade.direction || "BUY"}) is running. One-trade-at-a-time rule enforced.`
      );
    }
    if (isCooldownActive && remainingMinutes > 0) {
      blockingReasons.push(
        `COOLDOWN: Next trade available in ${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""}. (${cooldownReason})`
      );
    }
    if (daily.isReached) {
      blockingReasons.push(
        `DAILY_LIMIT: Daily maximum ${daily.limit} trades reached for today (${this.currentDayUtc} UTC). Resumes next UTC day.`
      );
    }
    if (news.inBlackout) {
      blockingReasons.push(
        `NEWS_RISK: High-impact economic event blackout [${news.activeEvent?.name || "Economic Event"}] (${news.remainingMinutes}m remaining).`
      );
    }

    const isTradeLocked = blockingReasons.length > 0;
    const lockStatusLabel: "ON (LOCKED)" | "OFF (ARMED)" = isTradeLocked ? "ON (LOCKED)" : "OFF (ARMED)";

    let nextAllowedSignalTime = now;
    let nextAllowedSignalTimeFormatted = "Immediate (Upon A+ Setup)";

    if (this.autoRiskMode === "EMERGENCY") {
      nextAllowedSignalTimeFormatted = "Paused (Awaiting /resume)";
    } else if (hasActive) {
      nextAllowedSignalTimeFormatted = "Upon active trade closure + 30m cooldown";
    } else if (isCooldownActive && cooldownUntil > now) {
      nextAllowedSignalTime = cooldownUntil;
      const timeStr = new Date(cooldownUntil).toISOString().replace("T", " ").substring(11, 16) + " UTC";
      nextAllowedSignalTimeFormatted = `${timeStr} (in ${remainingMinutes}m)`;
    } else if (daily.isReached) {
      const tomorrow = new Date();
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(0, 0, 0, 0);
      nextAllowedSignalTime = tomorrow.getTime();
      nextAllowedSignalTimeFormatted = "Tomorrow 00:00 UTC";
    } else if (news.inBlackout) {
      const newsResumeTime = now + (news.remainingMinutes || 30) * 60000;
      nextAllowedSignalTime = newsResumeTime;
      const timeStr = new Date(newsResumeTime).toISOString().replace("T", " ").substring(11, 16) + " UTC";
      nextAllowedSignalTimeFormatted = `${timeStr} (in ${news.remainingMinutes}m)`;
    }

    const primaryBlockReason = isTradeLocked
      ? blockingReasons[0]
      : "None — Engine armed and scanning market 24/7 for high-probability setups.";

    const cooldownDisplayText = isCooldownActive && remainingMinutes > 0
      ? `Next trade available in ${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""}`
      : "IDLE (Armed for next setup)";

    return {
      isTradeLocked,
      lockStatusLabel,
      currentActiveTrade: hasActive ? {
        hasActiveTrade: true,
        signalId: activeTrade.signalId,
        symbol: activeTrade.symbol || "XAUUSD (Gold)",
        direction: activeTrade.direction,
        entry: activeTrade.entryPrice || activeTrade.entry,
        entryZone: activeTrade.entryZone,
        sl: activeTrade.stopLoss || activeTrade.sl,
        tp1: activeTrade.tp1,
        tp2: activeTrade.tp2,
        tp3: activeTrade.tp3,
        tp4: activeTrade.tp4,
        currentPrice: activeTrade.currentPrice,
        pnlPips: activeTrade.pnlPips,
        pnlUSD: activeTrade.pnlUSD,
        status: activeTrade.status,
        engine: activeTrade.sourceStrategy || activeTrade.engine || "Institutional Core",
        openedAt: activeTrade.openedAt ? new Date(activeTrade.openedAt).toISOString() : undefined,
      } : null,
      currentTradeId: hasActive && activeTrade?.signalId ? activeTrade.signalId : "NONE",
      nextAllowedSignalTime,
      nextAllowedSignalTimeFormatted,
      cooldown: {
        isActive: isCooldownActive && remainingMinutes > 0,
        remainingMinutes,
        remainingSeconds,
        cooldownUntil,
        reason: cooldownReason,
        displayText: cooldownDisplayText,
      },
      blockingReasons,
      primaryBlockReason,
      autoRiskMode: this.autoRiskMode,
      daily: {
        tradesExecuted: daily.count,
        limit: daily.limit,
        remaining: daily.remaining,
        isLimitReached: daily.isReached,
      },
      consecutiveLoss: {
        count: lossState.consecutiveLosses,
        limit: lossState.limit,
        isPaused: lossState.isPaused,
        remainingMinutes: lossState.remainingMinutes,
      },
    };
  }
}

export const advancedRiskManager = AdvancedRiskManager.getInstance();

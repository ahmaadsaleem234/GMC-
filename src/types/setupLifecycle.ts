/**
 * GMC AI WAR ROOM — Setup Lifecycle, Immutable History & Live Alert Engine Types
 * 
 * Strict Single Source of Truth for Setups, Lifecycle Events, Chart Snapshots, and Live Alerts.
 */

export type SetupStatus =
  | "WAITING"
  | "ACTIVE"
  | "TP1_HIT"
  | "TP2_HIT"
  | "TP3_HIT"
  | "TP4_HIT"
  | "SL_HIT"
  | "CLOSED"
  | "INVALIDATED"
  | "EXPIRED"
  | "CANCELLED";

export type SetupFinalOutcome =
  | "WIN_TP4"
  | "WIN_TP3"
  | "WIN_TP2"
  | "WIN_TP1"
  | "BREAKEVEN"
  | "LOSS_SL"
  | "INVALIDATED"
  | "EXPIRED"
  | "CANCELLED";

export type LifecycleEventType =
  | "CANDIDATE_CREATED"
  | "LEVELS_FROZEN"
  | "GATES_PASSED"
  | "SETUP_ACTIVATED"
  | "ENTRY_HIT"
  | "TP1_HIT"
  | "TP2_HIT"
  | "TP3_HIT"
  | "TP4_HIT"
  | "SL_HIT"
  | "BREAKEVEN_MOVED"
  | "SETUP_INVALIDATED"
  | "SETUP_EXPIRED"
  | "SETUP_CANCELLED"
  | "SETUP_CLOSED";

export interface SetupLifecycleEvent {
  id: string;
  setupId: string;
  eventType: LifecycleEventType;
  timestamp: number;
  timestampFormatted: string;
  price: number;
  note: string;
  candleContext?: string;
  details?: Record<string, any>;
}

export interface SetupSnapshot {
  id: string;
  setupId: string;
  eventType: LifecycleEventType;
  timestamp: number;
  timestampFormatted: string;
  timeframe: string;
  price: number;
  entry: number;
  sl: number;
  tp1: number;
  tp2: number;
  tp3: number;
  tp4: number;
  imageUrl?: string;
  chartSnapshotBase64?: string;
  eventNote?: string;
  note: string;
}

export type LifecycleEvent = SetupLifecycleEvent & {
  eventNote?: string;
};

export type SetupProofSnapshot = SetupSnapshot;

export interface LiveAlertNotification {
  id: string;
  idempotencyKey: string; // `${setupId}:${eventType}`
  setupId: string;
  eventType: LifecycleEventType;
  title: string;
  message: string;
  direction: "BUY" | "SELL" | "NEUTRAL";
  price: number;
  level?: number;
  timestamp: number;
  timestampFormatted: string;
  severity: "SUCCESS" | "INFO" | "WARNING" | "CRITICAL";
  telegramSent: boolean;
  telegramSentAt?: string | null;
  read: boolean;
}

export interface AuthoritativeSetup {
  setupId: string;
  symbol: string;
  direction: "BUY" | "SELL";
  status: SetupStatus;
  grade: "A+" | "A" | "B" | "C";
  confidence: number;
  setupScore: number;
  mode: "LIVE" | "PAPER" | "BACKTEST";
  strategyVersion: string;
  isOfficialSignal: boolean;

  // 🔒 IMMUTABLE PRICE LEVELS
  entryZone: [number, number];
  bestEntry: number;
  stopLoss: number;
  invalidationLevel: number;
  tp1: number;
  tp2: number;
  tp3: number;
  tp4: number;
  riskToReward: string;
  rrNumber: number;

  // Multi-Timeframe Context & Institutional Analysis
  h4Bias: "Bullish" | "Bearish" | "Neutral";
  h1Bias: "Bullish" | "Bearish" | "Neutral";
  m15Setup: string;
  m5Confirmation: string;
  m1Trigger: string;
  sourceZoneIds: string[];
  requiredConfirmation: string;
  marketStructure: string;
  relevantPois: string[];
  relevantLiquidity: string;
  newsState: string;
  timeframeAlignment: {
    h4: string;
    h1: string;
    m15: string;
    m5: string;
    m1: string;
  };

  // Lifecycle Timestamps
  createdAt: number;
  createdAtUtc: string;
  lockedAt: number | null;
  activatedAt: number | null;
  activationPrice: number | null;
  confirmationCandle: string | null;
  confirmationTimeframe: string | null;
  expiresAt: number | null;
  closedAt: number | null;
  closingReason: string | null;
  currentAgeMinutes: number;

  // Realtime Telemetry & P/L
  currentPrice: number;
  currentFloatingR: number;
  mfePoints: number;
  maePoints: number;
  mfeR: number;
  maeR: number;
  targetsHit: {
    tp1: boolean;
    tp2: boolean;
    tp3: boolean;
    tp4: boolean;
  };
  healthScore: number;
  healthStatus: "PRISTINE" | "STABLE" | "DEGRADING" | "CRITICAL" | "INVALIDATED";
  healthDowngradeReasons: string[];

  // Outcome & Performance Accounting
  finalOutcome?: SetupFinalOutcome;
  finalResult?: "WIN" | "LOSS" | "BREAKEVEN" | "PARTIAL_WIN" | "INVALIDATED" | "EXPIRED" | "CANCELLED";
  realizedPoints?: number;
  finalPnlPts?: number;
  finalPnlR?: number;
  rMultiple?: number;
  pnlUsd?: number;

  // Post-Trade Autopsy Summary
  autopsySummary?: {
    storedEvidenceUsed: {
      rule: string;
      detectedAt: string;
      expected: string;
      actualResult: string;
    }[];
    whatWorked: string[];
    whatFailed: string[];
    lessons: string;
    rootCause: string;
  };

  // Telegram Integration & Idempotency
  telegramDispatched: boolean;
  telegramMessageId: number | null;
  telegramSentAt: string | null;
  telegramStatus: "PENDING" | "SENDING" | "SENT" | "FAILED" | "RETRYING" | "NOT_REQUIRED";
  telegramRetryCount: number;
  telegramLastError: string | null;
  dispatchedUpdates: string[];

  // Linked History: Events & Snapshots
  events: SetupLifecycleEvent[];
  snapshots: SetupSnapshot[];
}

export interface SetupFilterQuery {
  status?: "ALL" | "WAITING" | "ACTIVE" | "WON" | "LOST" | "INVALIDATED" | "EXPIRED";
  direction?: "ALL" | "BUY" | "SELL";
  search?: string;
  limit?: number;
}

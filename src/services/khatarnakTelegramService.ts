import { KhatarnakJugaadSetup, JugaadTimeframe, SetupFinalResult } from "./khatarnakJugaadEngine.js";
import { getTelegramConfig, sendTelegramMessage, cleanTelegramInput, TelegramConfig } from "../utils/telegram.js";
import { centralSignalManager } from "./centralSignalManager.js";
import { safeLocalStorage } from "../utils/safeStorage.js";

export type JugaadTelegramEventType =
  | "NEW_SETUP"
  | "ENTRY_HIT"
  | "TP1_HIT"
  | "TP2_HIT"
  | "TP3_HIT"
  | "FINAL_TP_HIT"
  | "SL_HIT"
  | "TP_THEN_SL_HIT"
  | "INVALIDATED";

export interface DispatchedJugaadAlert {
  id: string;
  setupId: string;
  timeframe: "1M";
  signalType: "SELL";
  event: JugaadTelegramEventType;
  eventLabel: string;
  price: number;
  timestamp: number;
  dateTime: string;
  messageText: string;
  success: boolean;
}

const DISPATCHED_EVENTS_STORAGE_KEY = "kj_dispatched_telegram_events_v2";
const ALERT_LOGS_STORAGE_KEY = "kj_telegram_alert_logs_v2";

/**
 * Get the set of dispatched event keys to prevent duplicate broadcasts.
 * Key format: `${setupId}::${event}`
 */
export function getDispatchedEventKeys(): Set<string> {
  try {
    const raw = safeLocalStorage.getItem(DISPATCHED_EVENTS_STORAGE_KEY);
    if (raw) {
      const parsed: string[] = JSON.parse(raw);
      return new Set(parsed);
    }
  } catch (e) {
    // Graceful fallback
  }
  return new Set();
}

/**
 * Record an event key as dispatched.
 */
export function recordDispatchedEventKey(setupId: string, event: JugaadTelegramEventType): void {
  try {
    const keys = getDispatchedEventKeys();
    keys.add(`${setupId}::${event}`);
    const array = Array.from(keys).slice(-500);
    safeLocalStorage.setItem(DISPATCHED_EVENTS_STORAGE_KEY, JSON.stringify(array));
  } catch (e) {
    // Graceful fallback
  }
}

/**
 * Check if a specific event has already been dispatched for this Setup ID.
 */
export function isEventAlreadyDispatched(setupId: string, event: JugaadTelegramEventType): boolean {
  const keys = getDispatchedEventKeys();
  return keys.has(`${setupId}::${event}`);
}

/**
 * Get recent alert logs for the UI telemetry list.
 */
export function getRecentAlertLogs(): DispatchedJugaadAlert[] {
  try {
    const raw = safeLocalStorage.getItem(ALERT_LOGS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // Graceful fallback
  }
  return [];
}

/**
 * Append an alert log to storage.
 */
export function saveAlertLog(log: DispatchedJugaadAlert): void {
  try {
    const prev = getRecentAlertLogs();
    const updated = [log, ...prev].slice(0, 100);
    safeLocalStorage.setItem(ALERT_LOGS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    // Graceful fallback
  }
}

/**
 * Clear alert history logs and event keys (for reset/testing).
 */
export function clearDispatchedEventHistory(): void {
  try {
    safeLocalStorage.removeItem(DISPATCHED_EVENTS_STORAGE_KEY);
    safeLocalStorage.removeItem(ALERT_LOGS_STORAGE_KEY);
  } catch (e) {}
}

/**
 * Get clean confirmation status string
 */
export function getConfirmationStatusText(setup: KhatarnakJugaadSetup): string {
  if (setup.isChochConfirmed && setup.isRejectionConfirmed) {
    return "CHOCH + 1M Rejection Confirmed";
  }
  if (setup.isChochConfirmed) {
    return "CHOCH Confirmed (Rejection Pending)";
  }
  if (setup.isRejectionConfirmed) {
    return "1M Rejection Confirmed (CHOCH Pending)";
  }
  if (setup.isEntryTriggered || setup.status === "ENTRY TRIGGERED" || setup.status === "RUNNING") {
    return "1M Rejection Confirmed";
  }
  return "CHOCH + Rejection Pending";
}

/**
 * Format the EXACT Telegram message for every 1M SELL Setup
 * Strictly adheres to the clean, formal, professional format
 */
export function formatNewSetupTelegramMessage(setup: KhatarnakJugaadSetup): string {
  const asset = setup.assetKey || "XAUUSD";
  const rr = setup.rrRatioString ? setup.rrRatioString.replace(/^R:R:\s*/i, "").trim() : "1:2.5";
  const entryZone = `<code>${setup.sellZoneLow.toFixed(2)} – ${setup.sellZoneHigh.toFixed(2)}</code>`;
  const confirmation = getConfirmationStatusText(setup);

  const riskPips = Math.max(1, Math.round(Math.abs(setup.stopLoss - setup.bestSellEntry) * 10));
  const tp1Pips = Math.max(1, Math.round(Math.abs(setup.bestSellEntry - setup.tp1) * 10));
  const tp2Pips = Math.max(1, Math.round(Math.abs(setup.bestSellEntry - setup.tp2) * 10));
  const tp3Pips = Math.max(1, Math.round(Math.abs(setup.bestSellEntry - setup.tp3) * 10));

  const message = [
    `💀 <b>KHATARNAK JUGAAD | 1M SELL 🔴</b>`,
    `━━━━━━━━━━━━━━━━━━━`,
    `<b>#${setup.id} • ${asset} (GOLD)</b>`,
    `📍 <b>Entry Zone:</b> ${entryZone}`,
    `⚡ <b>Best Entry:</b> <code>${setup.bestSellEntry.toFixed(2)}</code>`,
    ``,
    `🛑 <b>SL:</b> <code>${setup.stopLoss.toFixed(2)}</code> (-${riskPips} pips)`,
    `🎯 <b>TP1:</b> <code>${setup.tp1.toFixed(2)}</code> (+${tp1Pips} pips)`,
    `🎯 <b>TP2:</b> <code>${setup.tp2.toFixed(2)}</code> (+${tp2Pips} pips)`,
    `🎯 <b>TP3:</b> <code>${setup.tp3.toFixed(2)}</code> (+${tp3Pips} pips)`,
    ``,
    `📊 <b>R:R:</b> <code>${rr}</code>`,
    `🔥 <b>Score:</b> <code>${setup.score}/100</code>`,
    `⚡ <b>Confirmation:</b> ${confirmation}`,
    `⏱️ <b>Expiry:</b> <code>30 Minutes (Auto-Close if no TP/SL)</code>`,
    `━━━━━━━━━━━━━━━━━━━`,
    `<i>💡 Tip: Tap any price number to copy directly to MT5.</i>`,
  ].join("\n");

  return message;
}

/**
 * Format status update message for existing setup
 */
export function formatStatusUpdateTelegramMessage(
  setup: KhatarnakJugaadSetup,
  event: JugaadTelegramEventType | "EXPIRED",
  currentPrice: number
): string {
  const asset = setup.assetKey || "XAUUSD";

  let statusHeader = "";
  let statusDetail = "";

  switch (event) {
    case "EXPIRED":
      statusHeader = `⏱️ SIGNAL EXPIRED (30 MIN LIMIT)`;
      statusDetail = `30-minute validity limit reached without SL or TP hit. Position auto-expired at $${currentPrice.toFixed(2)}. Market analysis mode active.`;
      break;
    case "ENTRY_HIT":
      statusHeader = `🔴 ENTRY TRIGGERED`;
      statusDetail = `⚡ Price tapped into 1M Sell Zone (${setup.bestSellEntry.toFixed(2)}). Trade active.`;
      break;
    case "TP1_HIT":
      statusHeader = `🎯 TP1 HIT (+1.5R)`;
      statusDetail = `💰 Target 1 hit at ${setup.tp1.toFixed(2)}. Move SL to Break-Even (${setup.bestSellEntry.toFixed(2)}).`;
      break;
    case "TP2_HIT":
      statusHeader = `🎯 TP2 HIT (+2.5R)`;
      statusDetail = `💰 Target 2 achieved at ${setup.tp2.toFixed(2)}. Swing low liquidity mitigated.`;
      break;
    case "TP3_HIT":
    case "FINAL_TP_HIT":
      statusHeader = `🏆 FINAL TP HIT (+4.0R)`;
      statusDetail = `💰 Maximum target achieved at ${setup.tp3.toFixed(2)}. Trade completed.`;
      break;
    case "SL_HIT":
      statusHeader = `🛑 SL HIT`;
      statusDetail = `Stop loss triggered at ${setup.stopLoss.toFixed(2)}. Capital protected.`;
      break;
    case "TP_THEN_SL_HIT":
      statusHeader = `🎯 TP1 HIT → 🛑 BREAK-EVEN EXIT`;
      statusDetail = `Profit locked at TP1 before position exited at Break-Even.`;
      break;
    case "INVALIDATED":
      statusHeader = `❌ SETUP INVALIDATED`;
      statusDetail = `Price broke above Sell LQ ceiling. Setup cancelled.`;
      break;
    default:
      statusHeader = `📢 STATUS UPDATE`;
      statusDetail = `Status updated for 1M SELL setup.`;
  }

  const message = [
    `💀 KHATARNAK JUGAAD | 1M SELL UPDATE`,
    ``,
    `${asset} • SELL ONLY 🔴`,
    ``,
    `${statusHeader}`,
    `${statusDetail}`,
    ``,
    `📍 Best Entry: ${setup.bestSellEntry.toFixed(2)}`,
    `🛑 SL: ${setup.stopLoss.toFixed(2)}`,
    `💰 Current Price: ${currentPrice.toFixed(2)}`,
    ``,
    `KJ • 1M Institutional Setup`,
  ].join("\n");

  return message;
}

/**
 * Dispatch NEW setup to Telegram
 * Validated through the Central Signal Manager Gatekeeper
 */
export async function dispatchNewJugaadSetupToTelegram(
  setup: KhatarnakJugaadSetup
): Promise<{ success: boolean; error?: string }> {
  // USER DIRECTIVE: "Only harami ai send kiya karyein ga telegram py"
  return {
    success: false,
    error: "Telegram broadcasting is exclusively restricted to Harami AI per user directive.",
  };
}

/**
 * Dispatch status update to Telegram and sync lifecycle with Central Signal Manager
 */
export async function dispatchStatusUpdateToTelegram(
  setup: KhatarnakJugaadSetup,
  event: JugaadTelegramEventType,
  currentPrice: number
): Promise<{ success: boolean; error?: string }> {
  // USER DIRECTIVE: "Only harami ai send kiya karyein ga telegram py"
  return {
    success: false,
    error: "Telegram status updates are exclusively restricted to Harami AI per user directive.",
  };
}

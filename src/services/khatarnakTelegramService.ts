import { KhatarnakJugaadSetup, JugaadTimeframe, SetupFinalResult } from "./khatarnakJugaadEngine";
import { getTelegramConfig, sendTelegramMessage, cleanTelegramInput, TelegramConfig } from "../utils/telegram";
import { centralSignalManager } from "./centralSignalManager";

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
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(DISPATCHED_EVENTS_STORAGE_KEY);
      if (raw) {
        const parsed: string[] = JSON.parse(raw);
        return new Set(parsed);
      }
    }
  } catch (e) {
    console.error("Failed to load dispatched event keys", e);
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
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(DISPATCHED_EVENTS_STORAGE_KEY, JSON.stringify(array));
    }
  } catch (e) {
    console.error("Failed to save dispatched event key", e);
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
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(ALERT_LOGS_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    }
  } catch (e) {
    console.error("Failed to load alert logs", e);
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
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(ALERT_LOGS_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (e) {
    console.error("Failed to save alert log", e);
  }
}

/**
 * Clear alert history logs and event keys (for reset/testing).
 */
export function clearDispatchedEventHistory(): void {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(DISPATCHED_EVENTS_STORAGE_KEY);
      localStorage.removeItem(ALERT_LOGS_STORAGE_KEY);
    }
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
  const entryZone = `${setup.sellZoneLow.toFixed(2)} – ${setup.sellZoneHigh.toFixed(2)}`;
  const confirmation = getConfirmationStatusText(setup);

  const message = [
    `💀 KHATARNAK JUGAAD | 1M SELL`,
    ``,
    `${asset} • SELL ONLY 🔴`,
    ``,
    `🎯 ENTRY: ${entryZone}`,
    `📍 Best Entry: ${setup.bestSellEntry.toFixed(2)}`,
    `🛑 SL: ${setup.stopLoss.toFixed(2)}`,
    ``,
    `💰 TP1: ${setup.tp1.toFixed(2)}`,
    `💰 TP2: ${setup.tp2.toFixed(2)}`,
    `💰 TP3: ${setup.tp3.toFixed(2)}`,
    ``,
    `📊 R:R: ${rr}`,
    `🔥 Score: ${setup.score}/100`,
    `⚡ Confirmation: ${confirmation}`,
    ``,
    `KJ • 1M Institutional Setup`,
  ].join("\n");

  return message;
}

/**
 * Format status update message for existing setup
 */
export function formatStatusUpdateTelegramMessage(
  setup: KhatarnakJugaadSetup,
  event: JugaadTelegramEventType,
  currentPrice: number
): string {
  const asset = setup.assetKey || "XAUUSD";

  let statusHeader = "";
  let statusDetail = "";

  switch (event) {
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
  if (!setup.hasValidSetup && setup.score < 80) {
    return { success: false, error: "Setup score below 80 or no valid setup." };
  }

  // 1. Check with Central Signal Manager Gatekeeper
  const gatekeeper = centralSignalManager.promoteKhatarnakJugaadSetup(setup);
  if (!gatekeeper.allowed) {
    return {
      success: false,
      error: gatekeeper.message,
    };
  }

  const message = formatNewSetupTelegramMessage(setup);
  const cfg = getTelegramConfig();

  if (!cfg.botToken || !cfg.chatId) {
    return { success: false, error: "Telegram Bot Token or Chat ID not configured." };
  }

  const res = await sendTelegramMessage(message);

  const log: DispatchedJugaadAlert = {
    id: `ALERT-${Date.now()}`,
    setupId: setup.id,
    timeframe: "1M",
    signalType: "SELL",
    event: "NEW_SETUP",
    eventLabel: `NEW 1M 2.6 SELL (#${setup.id})`,
    price: setup.currentPrice,
    timestamp: Date.now(),
    dateTime: new Date().toLocaleTimeString(),
    messageText: message,
    success: res.success,
  };

  saveAlertLog(log);
  if (res.success) {
    recordDispatchedEventKey(setup.id, "NEW_SETUP");
  }

  return res;
}

/**
 * Dispatch status update to Telegram and sync lifecycle with Central Signal Manager
 */
export async function dispatchStatusUpdateToTelegram(
  setup: KhatarnakJugaadSetup,
  event: JugaadTelegramEventType,
  currentPrice: number
): Promise<{ success: boolean; error?: string }> {
  const message = formatStatusUpdateTelegramMessage(setup, event, currentPrice);
  const cfg = getTelegramConfig();

  // Sync lifecycle transition into Central Signal Manager
  if (
    event === "ENTRY_HIT" ||
    event === "TP1_HIT" ||
    event === "TP2_HIT" ||
    event === "TP3_HIT" ||
    event === "FINAL_TP_HIT" ||
    event === "SL_HIT" ||
    event === "TP_THEN_SL_HIT" ||
    event === "INVALIDATED"
  ) {
    centralSignalManager.updateActiveSetupLifecycleEvent(setup.id, event, currentPrice);
  }

  if (!cfg.botToken || !cfg.chatId) {
    return { success: false, error: "Telegram Bot Token or Chat ID not configured." };
  }

  const res = await sendTelegramMessage(message);

  const log: DispatchedJugaadAlert = {
    id: `ALERT-${Date.now()}`,
    setupId: setup.id,
    timeframe: "1M",
    signalType: "SELL",
    event,
    eventLabel: `${event} (#${setup.id})`,
    price: currentPrice,
    timestamp: Date.now(),
    dateTime: new Date().toLocaleTimeString(),
    messageText: message,
    success: res.success,
  };

  saveAlertLog(log);
  if (res.success) {
    recordDispatchedEventKey(setup.id, event);
  }

  return res;
}

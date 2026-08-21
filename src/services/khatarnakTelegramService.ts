import { KhatarnakJugaadSetup, JugaadTimeframe, SetupFinalResult } from "./khatarnakJugaadEngine";
import { getTelegramConfig, sendTelegramMessage, cleanTelegramInput, TelegramConfig } from "../utils/telegram";

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
  timeframe: JugaadTimeframe;
  signalType: "BUY" | "SELL";
  event: JugaadTelegramEventType;
  eventLabel: string;
  price: number;
  timestamp: number;
  dateTime: string;
  messageText: string;
  success: boolean;
}

const DISPATCHED_EVENTS_STORAGE_KEY = "kj_dispatched_telegram_events_v1";
const ALERT_LOGS_STORAGE_KEY = "kj_telegram_alert_logs_v1";

/**
 * Get the set of dispatched event keys to prevent duplicate broadcasts.
 * Key format: `${setupId}::${event}`
 */
export function getDispatchedEventKeys(): Set<string> {
  try {
    const raw = localStorage.getItem(DISPATCHED_EVENTS_STORAGE_KEY);
    if (raw) {
      const parsed: string[] = JSON.parse(raw);
      return new Set(parsed);
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
    // Keep max 500 keys in storage
    const array = Array.from(keys).slice(-500);
    localStorage.setItem(DISPATCHED_EVENTS_STORAGE_KEY, JSON.stringify(array));
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
    const raw = localStorage.getItem(ALERT_LOGS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
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
    localStorage.setItem(ALERT_LOGS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save alert log", e);
  }
}

/**
 * Clear alert history logs and event keys (for reset/testing).
 */
export function clearDispatchedEventHistory(): void {
  try {
    localStorage.removeItem(DISPATCHED_EVENTS_STORAGE_KEY);
    localStorage.removeItem(ALERT_LOGS_STORAGE_KEY);
  } catch (e) {}
}

/**
 * Format the EXACT Telegram message for a NEW Khatarnak Jugaad Setup:
 * 
 * 💀 KHATARNAK JUGAAD
 * 
 * XAUUSD • 15M • BUY 🟢
 * 
 * 🟢 Entry: REAL PRICE — REAL PRICE
 * 🛑 SL: REAL PRICE
 * 
 * 🎯 TP1: REAL PRICE
 * 🎯 TP2: REAL PRICE
 * 🎯 TP3: REAL PRICE
 * 
 * 📊 R:R: REAL VALUE
 * 🔥 Score: REAL SCORE/100
 * 
 * 🧠 Reason: REAL STRUCTURE + FIB 2.6 CONFIRMATION
 * 
 * 💬 “Jugaad chala, scene bana 💀”
 * 
 * SETUP ID: KJ-XXXX
 */
export function formatNewSetupTelegramMessage(setup: KhatarnakJugaadSetup): string {
  const isBuy = setup.signalType === "BUY";
  const directionEmoji = isBuy ? "BUY 🟢" : "SELL 🔴";
  const entryEmoji = isBuy ? "🟢" : "🔴";
  const asset = setup.assetKey || "XAUUSD";

  const message = [
    `💀 <b>KHATARNAK JUGAAD</b>`,
    ``,
    `<b>${asset} • ${setup.timeframe} • ${directionEmoji}</b>`,
    ``,
    `${entryEmoji} <b>Entry:</b> <code>${setup.entryFormatted}</code>`,
    `🛑 <b>SL:</b> <code>${setup.stopLoss.toFixed(2)}</code>`,
    ``,
    `🎯 <b>TP1:</b> <code>${setup.tp1.toFixed(2)}</code>`,
    `🎯 <b>TP2:</b> <code>${setup.tp2.toFixed(2)}</code>`,
    `🎯 <b>TP3:</b> <code>${setup.tp3.toFixed(2)}</code>`,
    `🏆 <b>TP4 (Final):</b> <code>${setup.tp4Final.toFixed(2)}</code>`,
    ``,
    `📊 <b>R:R:</b> <code>${setup.rrRatioString}</code>`,
    `🔥 <b>Score:</b> <code>${setup.score}/100</code>`,
    ``,
    `🧠 <b>Reason:</b> <i>${setup.shortReason}</i>`,
    ``,
    `💬 <i>“${setup.funnyLine}”</i>`,
    ``,
    `<b>SETUP ID:</b> <code>${setup.id}</code>`,
  ].join("\n");

  return message;
}

/**
 * Format the EXACT Telegram message for a Status Update on an existing Setup ID:
 * 
 * 🟢 ENTRY HIT
 * 🎯 TP1 HIT
 * 🎯 TP2 HIT
 * 🎯 TP3 HIT
 * 🏆 FINAL TP HIT
 * 🛑 SL HIT
 * ❌ INVALIDATED
 * 🎯 TP1 HIT → 🛑 SL HIT
 */
export function formatStatusUpdateTelegramMessage(
  setup: KhatarnakJugaadSetup,
  event: JugaadTelegramEventType,
  currentPrice: number
): string {
  const isBuy = setup.signalType === "BUY";
  const directionEmoji = isBuy ? "BUY 🟢" : "SELL 🔴";
  const asset = setup.assetKey || "XAUUSD";

  let statusHeader = "";
  let statusDetail = "";

  switch (event) {
    case "ENTRY_HIT":
      statusHeader = `🟢 <b>ENTRY HIT</b>`;
      statusDetail = `⚡ Price tapped into 0.62 / 0.81 Golden Execution Zone! Trade is now active.`;
      break;
    case "TP1_HIT":
      statusHeader = `🎯 <b>TP1 HIT</b>`;
      statusDetail = `💰 Target 1 ($${setup.tp1.toFixed(2)}) reached! Move Stop Loss to Break-Even / Secure partials.`;
      break;
    case "TP2_HIT":
      statusHeader = `🎯 <b>TP2 HIT</b>`;
      statusDetail = `🚀 Target 2 ($${setup.tp2.toFixed(2)}) smashed! Risk-free momentum ride active.`;
      break;
    case "TP3_HIT":
      statusHeader = `🎯 <b>TP3 HIT</b>`;
      statusDetail = `🔥 Target 3 ($${setup.tp3.toFixed(2)}) reached! High multiplier institutional expansion.`;
      break;
    case "FINAL_TP_HIT":
      statusHeader = `🏆 <b>FINAL TP HIT</b>`;
      statusDetail = `👑 MAXIMUM TARGET HIT ($${setup.tp4Final.toFixed(2)})! Complete Fibonacci 2.6 cycle achieved.`;
      break;
    case "SL_HIT":
      statusHeader = `🛑 <b>SL HIT</b>`;
      statusDetail = `🛡️ Stop Loss triggered at $${setup.stopLoss.toFixed(2)}. Risk strictly managed per setup rule.`;
      break;
    case "TP_THEN_SL_HIT":
      statusHeader = `🎯 <b>TP1 HIT → 🛑 SL HIT</b>`;
      statusDetail = `⚠️ Profit was locked at TP1 before remaining runner tapped protected Stop Loss / Break-Even.`;
      break;
    case "INVALIDATED":
      statusHeader = `❌ <b>INVALIDATED</b>`;
      statusDetail = `⚠️ Structural swing invalidated before entry was filled. Setup cancelled to preserve capital.`;
      break;
    default:
      statusHeader = `📢 <b>STATUS UPDATE</b>`;
      statusDetail = `Setup status updated.`;
  }

  const message = [
    `💀 <b>KHATARNAK JUGAAD</b>`,
    ``,
    statusHeader,
    ``,
    `<b>${asset} • ${setup.timeframe} • ${directionEmoji}</b>`,
    ``,
    `📍 <b>Current Price:</b> <code>$${currentPrice.toFixed(2)}</code>`,
    `🟢 <b>Entry Range:</b> <code>${setup.entryFormatted}</code>`,
    `🛑 <b>SL:</b> <code>${setup.stopLoss.toFixed(2)}</code>`,
    `🎯 <b>Targets:</b> TP1: <code>$${setup.tp1.toFixed(2)}</code> | TP2: <code>$${setup.tp2.toFixed(2)}</code> | TP3: <code>$${setup.tp3.toFixed(2)}</code>`,
    ``,
    `ℹ️ <i>${statusDetail}</i>`,
    ``,
    `💬 <i>“${setup.funnyLine}”</i>`,
    ``,
    `<b>SETUP ID:</b> <code>${setup.id}</code>`,
  ].join("\n");

  return message;
}

/**
 * Dispatch a New Setup alert to Telegram with duplicate protection.
 */
export async function dispatchNewJugaadSetupToTelegram(
  setup: KhatarnakJugaadSetup,
  overrideConfig?: { botToken?: string; chatId?: string }
): Promise<{ success: boolean; message: string }> {
  // Strict quality filter: only real high quality setups
  if (!setup.hasValidSetup || setup.status === "NO VALID SETUP" || setup.status === "WAITING" && setup.score < 60) {
    return { success: false, message: "Filtered: Setup is not active or below quality threshold." };
  }

  // Check if NEW_SETUP was already dispatched for this Setup ID
  if (isEventAlreadyDispatched(setup.id, "NEW_SETUP")) {
    return { success: true, message: `Setup ${setup.id} already dispatched to Telegram.` };
  }

  const messageText = formatNewSetupTelegramMessage(setup);
  const alertKey = `kj-setup-${setup.id}-${setup.timeframe}`;

  const res = await sendTelegramMessage(messageText, alertKey, overrideConfig);

  if (res.success) {
    recordDispatchedEventKey(setup.id, "NEW_SETUP");
    saveAlertLog({
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      setupId: setup.id,
      timeframe: setup.timeframe,
      signalType: setup.signalType === "SELL" ? "SELL" : "BUY",
      event: "NEW_SETUP",
      eventLabel: `NEW ${setup.signalType} SETUP (${setup.score}/100)`,
      price: setup.currentPrice,
      timestamp: Date.now(),
      dateTime: new Date().toLocaleTimeString(),
      messageText,
      success: true,
    });
  }

  return res;
}

/**
 * Dispatch a Status Update alert to Telegram for an existing Setup ID.
 * Strictly prevents duplicates for the same event on the same Setup ID.
 */
export async function dispatchJugaadStatusUpdateToTelegram(
  setup: KhatarnakJugaadSetup,
  event: JugaadTelegramEventType,
  currentPrice: number,
  overrideConfig?: { botToken?: string; chatId?: string }
): Promise<{ success: boolean; message: string }> {
  if (!setup.hasValidSetup || !setup.id || setup.id.includes("WAIT") || setup.id.includes("VOLATILE")) {
    return { success: false, message: "Invalid setup ID." };
  }

  // Deduplication check per setup ID & event
  if (isEventAlreadyDispatched(setup.id, event)) {
    return { success: true, message: `Event ${event} already dispatched for ${setup.id}.` };
  }

  const messageText = formatStatusUpdateTelegramMessage(setup, event, currentPrice);
  const alertKey = `kj-status-${setup.id}-${event}`;

  const res = await sendTelegramMessage(messageText, alertKey, overrideConfig);

  if (res.success) {
    recordDispatchedEventKey(setup.id, event);
    saveAlertLog({
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      setupId: setup.id,
      timeframe: setup.timeframe,
      signalType: setup.signalType === "SELL" ? "SELL" : "BUY",
      event,
      eventLabel: getEventLabel(event),
      price: currentPrice,
      timestamp: Date.now(),
      dateTime: new Date().toLocaleTimeString(),
      messageText,
      success: true,
    });
  }

  return res;
}

function getEventLabel(event: JugaadTelegramEventType): string {
  switch (event) {
    case "ENTRY_HIT":
      return "🟢 ENTRY HIT";
    case "TP1_HIT":
      return "🎯 TP1 HIT";
    case "TP2_HIT":
      return "🎯 TP2 HIT";
    case "TP3_HIT":
      return "🎯 TP3 HIT";
    case "FINAL_TP_HIT":
      return "🏆 FINAL TP HIT";
    case "SL_HIT":
      return "🛑 SL HIT";
    case "TP_THEN_SL_HIT":
      return "🎯 TP1 HIT → 🛑 SL HIT";
    case "INVALIDATED":
      return "❌ INVALIDATED";
    default:
      return event;
  }
}

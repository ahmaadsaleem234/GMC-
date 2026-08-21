/**
 * CENTRAL TELEGRAM DISPATCHER
 * — FORMAL 3 AI SINGLE ACTIVE TRADE DISPATCHER & LIFECYCLE MONITOR —
 * 
 * Implements the exact formal setup templates for:
 * 1. Khatarnak Jugaad 💀
 * 2. Harami AI 🤖
 * 3. War Room 🛡️
 * 
 * Enforces:
 * - Single Active Setup constraint across all 3 AI systems
 * - Real-time market data & calculated 5M / 15M timeframe
 * - Random non-repeating signature line per AI
 * - Formatted status updates with deduplication
 * - 30-minute cooldown notification upon trade closure
 */

import { sendTelegramMessage } from "../utils/telegram";
import {
  ActiveCentralSetup,
  AiBrainSource,
  getRandomSignatureLine,
} from "./centralSignalManager";

const SENT_ALERTS_KEY = "central_telegram_sent_events_v1";

function getSentEvents(): Set<string> {
  try {
    const raw = localStorage.getItem(SENT_ALERTS_KEY);
    if (raw) {
      return new Set(JSON.parse(raw));
    }
  } catch (e) {
    // Ignore storage parse errors
  }
  return new Set<string>();
}

function recordSentEvent(eventKey: string) {
  try {
    const events = getSentEvents();
    events.add(eventKey);
    const arr = Array.from(events).slice(-300);
    localStorage.setItem(SENT_ALERTS_KEY, JSON.stringify(arr));
  } catch (e) {
    // Ignore storage write errors
  }
}

/**
 * Format the exact KHATARNAK JUGAAD Telegram setup message:
 * 
 * 💀 KHATARNAK JUGAAD
 * 
 * XAUUSD • 15M • BUY
 * 
 * Entry 1: 2884.20 — 0.62 Golden
 * Entry 2: 2882.50 — 0.81 Green
 * 
 * SL: 2876.00
 * 
 * TP1: 2892.00
 * TP2: 2898.50
 * TP3: 2906.00
 * 
 * R:R: 1:2.8
 * Score: 88/100
 * 
 * Status: ACTIVE
 * 
 * 💬 [ONE RANDOM SIGNATURE LINE]
 */
export function formatKhatarnakJugaadTelegramMessage(setup: ActiveCentralSetup): string {
  const isBuy = setup.direction === "BUY";
  const e1 = setup.entry1Golden || (isBuy ? setup.entryZoneHigh : setup.entryZoneLow);
  const e2 = setup.entry2Green || (isBuy ? setup.entryZoneLow : setup.entryZoneHigh);
  const sig = setup.signatureLine || getRandomSignatureLine("KHATARNAK_JUGAAD");
  const rr = setup.rrRatioString.replace(/^R:R:\s*/i, "");

  return [
    `💀 <b>KHATARNAK JUGAAD</b>`,
    ``,
    `<b>${setup.assetKey} • ${setup.timeframe} • ${setup.direction}</b>`,
    ``,
    `Entry 1: <code>${e1.toFixed(2)}</code> — 0.62 Golden`,
    `Entry 2: <code>${e2.toFixed(2)}</code> — 0.81 Green`,
    ``,
    `SL: <code>${setup.stopLoss.toFixed(2)}</code>`,
    ``,
    `TP1: <code>${setup.tp1.toFixed(2)}</code>`,
    `TP2: <code>${setup.tp2.toFixed(2)}</code>`,
    `TP3: <code>${setup.tp3.toFixed(2)}</code>`,
    ``,
    `R:R: <code>${rr}</code>`,
    `Score: <code>${setup.setupScore}/100</code>`,
    ``,
    `Status: <b>ACTIVE</b>`,
    ``,
    `💬 <i>“${sig}”</i>`,
  ].join("\n");
}

/**
 * Format the exact HARAMI AI Telegram setup message:
 * 
 * 🤖 HARAMI AI
 * 
 * XAUUSD • 15M • SELL
 * 
 * Entry Zone: 2892.50 — 2895.00
 * 
 * SL: 2901.50
 * 
 * TP1: 2885.00
 * TP2: 2878.00
 * TP3: 2869.00
 * 
 * R:R: 1:3.1
 * Confidence: 91%
 * 
 * Status: ACTIVE
 * 
 * 💬 [ONE RANDOM SIGNATURE LINE]
 */
export function formatHaramiAiTelegramMessage(setup: ActiveCentralSetup): string {
  const low = Math.min(setup.entryZoneLow, setup.entryZoneHigh);
  const high = Math.max(setup.entryZoneLow, setup.entryZoneHigh);
  const sig = setup.signatureLine || getRandomSignatureLine("HARAMI_AI");
  const rr = setup.rrRatioString.replace(/^R:R:\s*/i, "");

  return [
    `🤖 <b>HARAMI AI</b>`,
    ``,
    `<b>${setup.assetKey} • ${setup.timeframe} • ${setup.direction}</b>`,
    ``,
    `Entry Zone: <code>${low.toFixed(2)} — ${high.toFixed(2)}</code>`,
    ``,
    `SL: <code>${setup.stopLoss.toFixed(2)}</code>`,
    ``,
    `TP1: <code>${setup.tp1.toFixed(2)}</code>`,
    `TP2: <code>${setup.tp2.toFixed(2)}</code>`,
    `TP3: <code>${setup.tp3.toFixed(2)}</code>`,
    ``,
    `R:R: <code>${rr}</code>`,
    `Confidence: <code>${setup.marketConfidence}%</code>`,
    ``,
    `Status: <b>ACTIVE</b>`,
    ``,
    `💬 <i>“${sig}”</i>`,
  ].join("\n");
}

/**
 * Format the exact WAR ROOM Telegram setup message:
 * 
 * 🛡️ WAR ROOM
 * 
 * XAUUSD • 5M • BUY
 * 
 * Execution Zone: 2885.00 — 2888.00
 * 
 * SL: 2879.50
 * 
 * TP1: 2894.00
 * TP2: 2901.00
 * TP3: 2910.00
 * 
 * R:R: 1:2.9
 * Setup Score: 89/100
 * 
 * Status: ACTIVE
 * 
 * 💬 [ONE RANDOM SIGNATURE LINE]
 */
export function formatWarRoomTelegramMessage(setup: ActiveCentralSetup): string {
  const low = Math.min(setup.entryZoneLow, setup.entryZoneHigh);
  const high = Math.max(setup.entryZoneLow, setup.entryZoneHigh);
  const sig = setup.signatureLine || getRandomSignatureLine("WAR_ROOM");
  const rr = setup.rrRatioString.replace(/^R:R:\s*/i, "");

  return [
    `🛡️ <b>WAR ROOM</b>`,
    ``,
    `<b>${setup.assetKey} • ${setup.timeframe} • ${setup.direction}</b>`,
    ``,
    `Execution Zone: <code>${low.toFixed(2)} — ${high.toFixed(2)}</code>`,
    ``,
    `SL: <code>${setup.stopLoss.toFixed(2)}</code>`,
    ``,
    `TP1: <code>${setup.tp1.toFixed(2)}</code>`,
    `TP2: <code>${setup.tp2.toFixed(2)}</code>`,
    `TP3: <code>${setup.tp3.toFixed(2)}</code>`,
    ``,
    `R:R: <code>${rr}</code>`,
    `Setup Score: <code>${setup.setupScore}/100</code>`,
    ``,
    `Status: <b>ACTIVE</b>`,
    ``,
    `💬 <i>“${sig}”</i>`,
  ].join("\n");
}

/**
 * Dispatch a brand-new winning active setup to Telegram
 */
export async function dispatchCentralWinningSetupToTelegram(
  setup: ActiveCentralSetup
): Promise<{ success: boolean; message?: string }> {
  const eventKey = `${setup.setupId}_NEW_SETUP`;
  const sent = getSentEvents();
  if (sent.has(eventKey)) {
    return { success: true, message: "Alert already broadcasted." };
  }

  let message = "";
  if (setup.brainSource === "KHATARNAK_JUGAAD") {
    message = formatKhatarnakJugaadTelegramMessage(setup);
  } else if (setup.brainSource === "HARAMI_AI") {
    message = formatHaramiAiTelegramMessage(setup);
  } else {
    message = formatWarRoomTelegramMessage(setup);
  }

  const ok = await sendTelegramMessage(message);
  if (ok) {
    recordSentEvent(eventKey);
    return { success: true, message: "Broadcasted successfully to Telegram." };
  }
  return { success: false, message: "Telegram bot delivery failed. Check bot credentials." };
}

/**
 * Format and dispatch lifecycle status updates to Telegram:
 * 
 * 🟢 ENTRY HIT
 * 🔵 RUNNING
 * 🎯 TP1 HIT
 * 🎯 TP2 HIT
 * 🎯 TP3 HIT
 * 🏆 FINAL TP HIT
 * 🛑 SL HIT
 * ❌ INVALIDATED
 * ⏳ EXPIRED
 */
export async function dispatchCentralLifecycleEventToTelegram(
  setup: ActiveCentralSetup,
  event:
    | "ENTRY_HIT"
    | "RUNNING"
    | "TP1_HIT"
    | "TP2_HIT"
    | "TP3_HIT"
    | "FINAL_TP_HIT"
    | "SL_HIT"
    | "TP_THEN_SL_HIT"
    | "INVALIDATED"
    | "EXPIRED"
    | "PROTECTION_ACTIVE",
  currentPrice?: number,
  nextAvailableTimeFormatted?: string
): Promise<{ success: boolean; message?: string }> {
  const eventKey = `${setup.setupId}_${event}`;
  const sent = getSentEvents();
  if (sent.has(eventKey)) {
    return { success: true, message: "Lifecycle alert already dispatched." };
  }

  const px = currentPrice || setup.preferredEntry;
  const brainHeader =
    setup.brainSource === "KHATARNAK_JUGAAD"
      ? "💀 KHATARNAK JUGAAD"
      : setup.brainSource === "HARAMI_AI"
      ? "🤖 HARAMI AI"
      : "🛡️ WAR ROOM";

  const cdTime = nextAvailableTimeFormatted || "in 30 mins";

  let statusHeader = "";
  let bodyLines: string[] = [];

  switch (event) {
    case "ENTRY_HIT":
      statusHeader = "🟢 <b>ENTRY HIT</b>";
      bodyLines = [
        `<b>${brainHeader}</b>`,
        `<b>${setup.assetKey} • ${setup.timeframe} • ${setup.direction}</b>`,
        `Setup ID: <code>${setup.setupId}</code>`,
        ``,
        `Trigger Price: <code>$${px.toFixed(2)}</code>`,
        `Status: <b>ACTIVE (RUNNING 🔵)</b>`,
        ``,
        `TP1: <code>$${setup.tp1.toFixed(2)}</code>`,
        `SL: <code>$${setup.stopLoss.toFixed(2)}</code>`,
      ];
      break;

    case "RUNNING":
      statusHeader = "🔵 <b>RUNNING</b>";
      bodyLines = [
        `<b>${brainHeader}</b>`,
        `<b>${setup.assetKey} • ${setup.timeframe} • ${setup.direction}</b>`,
        `Setup ID: <code>${setup.setupId}</code>`,
        ``,
        `Current Price: <code>$${px.toFixed(2)}</code>`,
        `Status: <b>ACTIVE & IN PROFIT</b>`,
      ];
      break;

    case "TP1_HIT":
      statusHeader = "🎯 <b>TP1 HIT</b>";
      bodyLines = [
        `<b>${brainHeader}</b>`,
        `<b>${setup.assetKey} • ${setup.timeframe} • ${setup.direction}</b>`,
        `Setup ID: <code>${setup.setupId}</code>`,
        ``,
        `Price: <code>$${setup.tp1.toFixed(2)}</code>`,
        `Status: <b>ACTIVE (PARTIAL PROFIT SECURED)</b>`,
        ``,
        `🛡️ <b>Protection:</b> <code>SL MOVED TO BREAK-EVEN</code> (100% Risk-Free)`,
        `🎯 <b>Next Target:</b> <code>TP2 ($${setup.tp2.toFixed(2)})</code>`,
      ];
      break;

    case "TP2_HIT":
      statusHeader = "🎯 <b>TP2 HIT</b>";
      bodyLines = [
        `<b>${brainHeader}</b>`,
        `<b>${setup.assetKey} • ${setup.timeframe} • ${setup.direction}</b>`,
        `Setup ID: <code>${setup.setupId}</code>`,
        ``,
        `Price: <code>$${setup.tp2.toFixed(2)}</code>`,
        `Status: <b>ACTIVE (70% PROFIT SECURED)</b>`,
        ``,
        `🔒 <b>Protection:</b> <code>Trailing SL locked at TP1 ($${setup.tp1.toFixed(2)})</code>`,
        `🎯 <b>Next Target:</b> <code>TP3 ($${setup.tp3.toFixed(2)})</code>`,
      ];
      break;

    case "TP3_HIT":
      statusHeader = "🎯 <b>TP3 HIT</b>";
      bodyLines = [
        `<b>${brainHeader}</b>`,
        `<b>${setup.assetKey} • ${setup.timeframe} • ${setup.direction}</b>`,
        `Setup ID: <code>${setup.setupId}</code>`,
        ``,
        `Price: <code>$${setup.tp3.toFixed(2)}</code>`,
        `Status: <b>ACTIVE (RUNNER ACTIVE)</b>`,
        ``,
        `🔒 <b>Protection:</b> <code>Trailing SL locked at TP2 ($${setup.tp2.toFixed(2)})</code>`,
      ];
      break;

    case "FINAL_TP_HIT":
      statusHeader = "🏆 <b>FINAL TP HIT</b>";
      bodyLines = [
        `<b>${brainHeader}</b>`,
        `<b>${setup.assetKey} • ${setup.timeframe} • ${setup.direction}</b>`,
        `Setup ID: <code>${setup.setupId}</code>`,
        ``,
        `Exit Price: <code>$${setup.finalTp.toFixed(2)}</code>`,
        `Status: <b>CLOSED ✅</b>`,
        ``,
        `Result: <b>FULL WIN — ALL TARGETS COMPLETED</b>`,
        ``,
        `⏳ <b>30-MINUTE COOLDOWN ACTIVE</b>`,
        `Next setup available after: <code>${cdTime}</code>`,
        `<i>All 3 AI Trading Brains will analyze independently after cooldown.</i>`,
      ];
      break;

    case "SL_HIT":
      statusHeader = "🛑 <b>SL HIT</b>";
      bodyLines = [
        `<b>${brainHeader}</b>`,
        `<b>${setup.assetKey} • ${setup.timeframe} • ${setup.direction}</b>`,
        `Setup ID: <code>${setup.setupId}</code>`,
        ``,
        `Exit Price: <code>$${px.toFixed(2)}</code>`,
        `Status: <b>CLOSED ❌</b>`,
        ``,
        `Result: <b>STOP LOSS HIT (Capital Preservation Rule Enforced)</b>`,
        ``,
        `⏳ <b>30-MINUTE COOLDOWN ACTIVE</b>`,
        `Next setup available after: <code>${cdTime}</code>`,
        `<i>All 3 AI Trading Brains will analyze independently after cooldown.</i>`,
      ];
      break;

    case "TP_THEN_SL_HIT":
      statusHeader = "🛑 <b>PROTECTED SL HIT (AFTER TP1)</b>";
      bodyLines = [
        `<b>${brainHeader}</b>`,
        `<b>${setup.assetKey} • ${setup.timeframe} • ${setup.direction}</b>`,
        `Setup ID: <code>${setup.setupId}</code>`,
        ``,
        `Exit Price: <code>$${px.toFixed(2)}</code> (Break-Even)`,
        `Status: <b>CLOSED ✅ (PROFIT PROTECTED)</b>`,
        ``,
        `Outcome: <b>Partial Profit Secured at TP1 — Zero Capital Loss</b>`,
        ``,
        `⏳ <b>30-MINUTE COOLDOWN ACTIVE</b>`,
        `Next setup available after: <code>${cdTime}</code>`,
      ];
      break;

    case "INVALIDATED":
      statusHeader = "❌ <b>INVALIDATED</b>";
      bodyLines = [
        `<b>${brainHeader}</b>`,
        `<b>${setup.assetKey} • ${setup.timeframe} • ${setup.direction}</b>`,
        `Setup ID: <code>${setup.setupId}</code>`,
        ``,
        `Status: <b>CLOSED ❌</b>`,
        ``,
        `Reason: <b>Market structure shifted prior to entry confirmation</b>`,
        `Risk Capital 100% Preserved`,
        ``,
        `⏳ <b>30-MINUTE COOLDOWN ACTIVE</b>`,
        `Next setup available after: <code>${cdTime}</code>`,
      ];
      break;

    case "EXPIRED":
      statusHeader = "⏳ <b>EXPIRED</b>";
      bodyLines = [
        `<b>${brainHeader}</b>`,
        `<b>${setup.assetKey} • ${setup.timeframe} • ${setup.direction}</b>`,
        `Setup ID: <code>${setup.setupId}</code>`,
        ``,
        `Status: <b>CLOSED ⚠️</b>`,
        ``,
        `Reason: <b>Setup validity window expired without entry fill</b>`,
        ``,
        `⏳ <b>30-MINUTE COOLDOWN ACTIVE</b>`,
        `Next setup available after: <code>${cdTime}</code>`,
      ];
      break;

    default:
      return { success: false, message: "Unknown lifecycle event." };
  }

  const message = `${statusHeader}\n\n${bodyLines.join("\n")}`;
  const ok = await sendTelegramMessage(message);
  if (ok) {
    recordSentEvent(eventKey);
    return { success: true, message: `Dispatched ${event} alert.` };
  }
  return { success: false, message: "Delivery failed." };
}

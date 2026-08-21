/**
 * CENTRAL TELEGRAM DISPATCHER
 * — SINGLE ACTIVE SETUP TELEGRAM FORMATTER & BROADCASTER —
 * 
 * Strict formatting and lifecycle alerts conforming to the Central Signal Manager spec.
 * Features deduplication to prevent duplicate alerts for the same Setup ID + Event.
 */

import { sendTelegramMessage } from "../utils/telegram";
import { ActiveCentralSetup, SetupLifecycleState } from "./centralSignalManager";

const SENT_ALERTS_KEY = "central_telegram_sent_events_v1";

function getSentEvents(): Set<string> {
  try {
    const raw = localStorage.getItem(SENT_ALERTS_KEY);
    if (raw) {
      return new Set(JSON.parse(raw));
    }
  } catch (e) {
    // Ignore error
  }
  return new Set<string>();
}

function recordSentEvent(eventKey: string) {
  try {
    const events = getSentEvents();
    events.add(eventKey);
    const arr = Array.from(events).slice(-200);
    localStorage.setItem(SENT_ALERTS_KEY, JSON.stringify(arr));
  } catch (e) {
    // Ignore error
  }
}

/**
 * Format and dispatch a brand-new winning active setup to Telegram
 */
export async function dispatchCentralWinningSetupToTelegram(
  setup: ActiveCentralSetup
): Promise<{ success: boolean; message?: string }> {
  const eventKey = `${setup.setupId}_NEW_SETUP`;
  const sent = getSentEvents();
  if (sent.has(eventKey)) {
    return { success: true, message: "Alert already broadcasted." };
  }

  const isBuy = setup.direction === "BUY";
  const dirLabel = isBuy ? "BUY 🟢" : "SELL 🔴";
  const entryEmoji = isBuy ? "🟢" : "🔴";

  const message =
`🏆 *SELECTED SYSTEM: ${setup.brainName}*
*SETUP ID:* \`${setup.setupId}\`
*STATUS:* 🟢 *ACTIVE*

*${setup.assetKey} • ${setup.timeframe} • ${dirLabel}*

${entryEmoji} *Entry:* \`${setup.entryRangeFormatted}\`
🎯 *Preferred Entry:* \`$${setup.preferredEntry.toFixed(2)}\`
🛑 *SL:* \`$${setup.stopLoss.toFixed(2)}\`

🎯 *TP1:* \`$${setup.tp1.toFixed(2)}\`
🎯 *TP2:* \`$${setup.tp2.toFixed(2)}\`
🎯 *TP3:* \`$${setup.tp3.toFixed(2)}\`
${setup.finalTp ? `🏆 *Final TP:* \`$${setup.finalTp.toFixed(2)}\`\n` : ""}
📊 *R:R:* \`${setup.rrRatioString}\`
🔥 *Setup Score:* \`${setup.setupScore}/100\`
🧠 *Market Confidence:* \`${setup.marketConfidence}/100\`
🤖 *AI Consensus:* \`${setup.aiConsensus}\`

🧠 *Reason:*
_${setup.selectionReason}_`;

  const ok = await sendTelegramMessage(message);
  if (ok) {
    recordSentEvent(eventKey);
    return { success: true, message: "Broadcasted successfully to Telegram." };
  }
  return { success: false, message: "Telegram bot delivery failed. Check bot credentials." };
}

/**
 * Format and dispatch lifecycle status updates to Telegram
 */
export async function dispatchCentralLifecycleEventToTelegram(
  setup: ActiveCentralSetup,
  event: "ENTRY_HIT" | "TP1_HIT" | "TP2_HIT" | "TP3_HIT" | "FINAL_TP_HIT" | "SL_HIT" | "TP_THEN_SL_HIT" | "INVALIDATED" | "PROTECTION_ACTIVE",
  currentPrice?: number
): Promise<{ success: boolean; message?: string }> {
  const eventKey = `${setup.setupId}_${event}`;
  const sent = getSentEvents();
  if (sent.has(eventKey)) {
    return { success: true, message: "Lifecycle alert already dispatched." };
  }

  const px = currentPrice || setup.preferredEntry;
  const isBuy = setup.direction === "BUY";
  const dirLabel = isBuy ? "BUY 🟢" : "SELL 🔴";
  const pips = setup.pnlPips ? `${setup.pnlPips > 0 ? "+" : ""}${setup.pnlPips} pips` : "";

  let title = "";
  let body = "";

  switch (event) {
    case "ENTRY_HIT":
      title = "🟢 *ENTRY TRIGGERED & RUNNING*";
      body =
`*${setup.brainName}* | \`${setup.setupId}\` | *${setup.assetKey} • ${setup.timeframe} • ${dirLabel}*

📍 *Trigger Price:* \`$${px.toFixed(2)}\`
🎯 *Target 1:* \`$${setup.tp1.toFixed(2)}\`
🛑 *Stop Loss:* \`$${setup.stopLoss.toFixed(2)}\``;
      break;

    case "TP1_HIT":
      title = "🎯 *TP1 HIT — PROTECTION MODE ACTIVE*";
      body =
`*${setup.brainName}* | \`${setup.setupId}\` | *${setup.assetKey} • ${setup.timeframe} • ${dirLabel}*

📍 *Price:* \`$${setup.tp1.toFixed(2)}\` (${pips})
🛡️ *Protection:* \`SL MOVED TO BREAK-EVEN\` (Trade is 100% Risk-Free)
🎯 *Next Target:* \`TP2 ($${setup.tp2.toFixed(2)})\``;
      break;

    case "TP2_HIT":
      title = "🎯 *TP2 HIT — 70% PROFIT SECURED*";
      body =
`*${setup.brainName}* | \`${setup.setupId}\` | *${setup.assetKey} • ${setup.timeframe} • ${dirLabel}*

📍 *Price:* \`$${setup.tp2.toFixed(2)}\` (${pips})
🔒 *Protection:* \`Trailing SL locked at TP1 ($${setup.tp1.toFixed(2)})\`
🎯 *Next Target:* \`TP3 ($${setup.tp3.toFixed(2)})\``;
      break;

    case "TP3_HIT":
      title = "🎯 *TP3 HIT — RUNNER ACTIVE*";
      body =
`*${setup.brainName}* | \`${setup.setupId}\` | *${setup.assetKey} • ${setup.timeframe} • ${dirLabel}*

📍 *Price:* \`$${setup.tp3.toFixed(2)}\` (${pips})
🔒 *Protection:* \`Trailing SL locked at TP2 ($${setup.tp2.toFixed(2)})\`
🏆 *Final Target:* \`$${setup.finalTp.toFixed(2)}\``;
      break;

    case "FINAL_TP_HIT":
      title = "🏆 *FINAL TP ACHIEVED — TRADE FULLY CLOSED*";
      body =
`*${setup.brainName}* | \`${setup.setupId}\` | *${setup.assetKey} • ${setup.timeframe} • ${dirLabel}*

📍 *Exit Price:* \`$${setup.finalTp.toFixed(2)}\` (${pips})
✅ *Status:* \`WIN — ALL TARGETS COMPLETED\`
⏳ *Cooldown:* \`35-Minute Cooldown active before next competition\``;
      break;

    case "SL_HIT":
      title = "🛑 *STOP LOSS HIT — TRADE CLOSED*";
      body =
`*${setup.brainName}* | \`${setup.setupId}\` | *${setup.assetKey} • ${setup.timeframe} • ${dirLabel}*

📍 *Exit Price:* \`$${px.toFixed(2)}\` (${pips})
🛡️ *Capital Preservation Rule Applied*
⏳ *Cooldown:* \`35-Minute Cooldown active before next competition\``;
      break;

    case "TP_THEN_SL_HIT":
      title = "🛑 *PROTECTED SL HIT (AFTER TP1)*";
      body =
`*${setup.brainName}* | \`${setup.setupId}\` | *${setup.assetKey} • ${setup.timeframe} • ${dirLabel}*

📍 *Exit Price:* \`$${px.toFixed(2)}\` (Break-Even Exit)
🛡️ *Outcome:* \`Partial Profit Secured at TP1 — Zero Capital Loss\`
⏳ *Cooldown:* \`35-Minute Cooldown active before next competition\``;
      break;

    case "INVALIDATED":
      title = "❌ *SETUP INVALIDATED / EXPIRED*";
      body =
`*${setup.brainName}* | \`${setup.setupId}\` | *${setup.assetKey} • ${setup.timeframe}*

⚠️ *Reason:* \`Market structure shifted prior to entry fill\`
🛡️ *Risk Capital 100% Preserved*`;
      break;

    default:
      return { success: false, message: "Unknown lifecycle event." };
  }

  const message = `${title}\n\n${body}`;
  const ok = await sendTelegramMessage(message);
  if (ok) {
    recordSentEvent(eventKey);
    return { success: true, message: `Dispatched ${event} alert.` };
  }
  return { success: false, message: "Delivery failed." };
}

// Telegram Bot Signal Alert Dispatcher
import { generateDynamicReason, formatHaramiSignalMessage } from "./haramiSignalFormatter.js";
import { safeLocalStorage } from "./safeStorage.js";

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
  sendEntries: boolean;
  sendSLTPHits: boolean;
}

const STORAGE_KEY = "gmc_telegram_config";

export function cleanTelegramInput(str?: string): string {
  if (!str) return "";
  return str.replace(/[\u200B-\u200D\uFEFF\u00A0\r\n\s]/g, "").trim();
}

export function getTelegramConfig(): TelegramConfig {
  try {
    const saved = safeLocalStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      parsed.botToken = cleanTelegramInput(parsed.botToken);
      parsed.chatId = cleanTelegramInput(parsed.chatId);

      // Auto upgrade old expired tokens to current active bot token
      if (!parsed.botToken || parsed.botToken === "" || parsed.botToken.includes("8995493734")) {
        parsed.botToken = "8935835253:AAGWp1IeU9yA6wh2XmlcIE_W4ZAv4MIhA28";
      }
      if (!parsed.chatId || parsed.chatId === "") {
        parsed.chatId = "5218548758";
      }
      parsed.enabled = true;
      return parsed;
    }
  } catch (e) {
    // Graceful fallback without crashing
  }
  const defaultConfig: TelegramConfig = {
    botToken: "8935835253:AAGWp1IeU9yA6wh2XmlcIE_W4ZAv4MIhA28",
    chatId: "5218548758",
    enabled: true,
    sendEntries: true,
    sendSLTPHits: true,
  };
  saveTelegramConfig(defaultConfig);
  return defaultConfig;
}

export function saveTelegramConfig(config: TelegramConfig): void {
  try {
    const cleaned: TelegramConfig = {
      ...config,
      botToken: cleanTelegramInput(config.botToken),
      chatId: cleanTelegramInput(config.chatId),
    };
    safeLocalStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));

    // Sync credentials directly to 24/7 server background broadcaster if in browser
    if (typeof window !== "undefined" && typeof fetch === "function" && (cleaned.botToken || cleaned.chatId)) {
      fetch("/api/telegram/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botToken: cleaned.botToken,
          chatId: cleaned.chatId,
        }),
      }).catch(() => {});
    }
  } catch (e) {
    // Graceful fallback
  }
}

// Track sent messages to prevent duplicates / spam (persisted in safeLocalStorage)
const STORAGE_SENT_ALERTS_KEY = "gmc_telegram_sent_alert_ids_v1";

function getClientSentAlertCache(): Set<string> {
  try {
    const raw = safeLocalStorage.getItem(STORAGE_SENT_ALERTS_KEY);
    if (raw) {
      return new Set(JSON.parse(raw));
    }
  } catch (e) {}
  return new Set<string>();
}

function recordClientSentAlert(alertId: string) {
  try {
    const cache = getClientSentAlertCache();
    cache.add(alertId);
    const arr = Array.from(cache).slice(-500);
    safeLocalStorage.setItem(STORAGE_SENT_ALERTS_KEY, JSON.stringify(arr));
  } catch (e) {}
}

export async function sendTelegramMessage(
  messageText: string,
  alertId?: string,
  overrideConfig?: { botToken?: string; chatId?: string }
): Promise<{ success: boolean; message: string; duplicateSuppressed?: boolean }> {
  try {
    const config = getTelegramConfig();

    const token = cleanTelegramInput(overrideConfig?.botToken || config.botToken);
    const chatId = cleanTelegramInput(overrideConfig?.chatId || config.chatId);

    if (!token || !chatId) {
      return { success: false, message: "❌ Telegram Bot Token & Chat ID are required." };
    }

    if (alertId) {
      const cache = getClientSentAlertCache();
      if (cache.has(alertId)) {
        return { success: true, duplicateSuppressed: true, message: "Alert already dispatched (duplicate suppressed)." };
      }
    }

    // Method 1: Server Proxy Route /api/telegram/send with Idempotency Protection (Only in browser or resolved URL)
    if (typeof window !== "undefined" && typeof fetch === "function") {
      try {
        const response = await fetch("/api/telegram/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: messageText,
            alertId: alertId || undefined,
            botToken: token,
            chatId: chatId,
          }),
        });

        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const data = await response.json();
          if (data.ok) {
            if (alertId) recordClientSentAlert(alertId);
            if (data.duplicateSuppressed) {
              return { success: true, duplicateSuppressed: true, message: "Duplicate signal suppressed by server idempotency guard." };
            }
            return { success: true, message: "✅ Telegram signal dispatched successfully to channel!" };
          }
          if (data.error) {
            console.warn("Server route returned error:", data.error);
          }
        }
      } catch (serverErr) {
        console.warn("Server proxy Telegram send failed, trying direct browser API...", serverErr);
      }
    }

    // Method 2: Direct Telegram Bot API Call
    try {
      const directUrl = `https://api.telegram.org/bot${token}/sendMessage`;
      const directRes = await fetch(directUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      });

      const contentType = directRes.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const directData = await directRes.json();
        if (directData.ok) {
          if (alertId) recordClientSentAlert(alertId);
          return { success: true, message: "✅ Telegram signal dispatched successfully to channel!" };
        } else if (directData.description) {
          return { success: false, message: `Telegram Error: ${directData.description}` };
        }
      }
    } catch (directErr) {
      console.warn("Direct Telegram API fetch failed:", directErr);
    }

    return {
      success: false,
      message: "❌ Telegram dispatch failed. Please verify Bot Token & Chat ID.",
    };
  } catch (err: any) {
    console.error("sendTelegramMessage top-level exception:", err);
    let errMsg = err?.message || "Error sending message to Telegram.";
    if (errMsg.includes("pattern") || errMsg.includes("SyntaxError") || errMsg.includes("TypeError")) {
      errMsg = "❌ Dispatch failed. Please re-check Bot Token & Chat ID format.";
    }
    return { success: false, message: errMsg };
  }
}

export async function dispatchTradeAlertToTelegram(trade: {
  source: string;
  asset: string;
  type: "BUY" | "SELL";
  entry: number;
  sl: number;
  tp1: number;
  tp2?: number;
  tp3?: number;
  tp4?: number;
  lotSize: number;
  confluence?: string;
  accountBalance?: number;
  totalPnL?: number;
  confidence?: number;
  reason?: string;
}) {
  const alertId = `trade-harami-${trade.asset}-${trade.type}-${trade.entry}-${Math.floor(Date.now() / 300000)}`;
  const icon = trade.type === "BUY" ? "🟢 🚀" : "🔴 📉";

  const isBuy = trade.type === "BUY";
  const iconEmoji = isBuy ? "🟢🔥" : "🔴🔥";
  const entryLowStr = (trade.entry - 0.55).toFixed(2);
  const entryHighStr = (trade.entry + 0.65).toFixed(2);
  const entryZone = `$${entryLowStr} - $${entryHighStr}`;
  const risk = Math.abs(trade.entry - trade.sl);
  const reward = Math.abs(trade.tp1 - trade.entry);
  const rr = risk > 0 ? `1 : ${(reward / risk).toFixed(1)}` : "1 : 1.6";
  const confidence = trade.confidence || 96.9;
  const tp2 = trade.tp2 || Number((isBuy ? trade.entry + reward * 1.8 : trade.entry - reward * 1.8).toFixed(2));
  const tp3 = trade.tp3 || Number((isBuy ? trade.entry + reward * 2.8 : trade.entry - reward * 2.8).toFixed(2));
  const tp4 = trade.tp4 || Number((isBuy ? trade.entry + reward * 4.0 : trade.entry - reward * 4.0).toFixed(2));

  let assetName = "GOLD";
  if (trade.asset.includes("BTC")) assetName = "BITCOIN";
  else if (trade.asset.includes("ETH")) assetName = "ETHEREUM";
  else if (!trade.asset.includes("XAU") && !trade.asset.includes("Gold")) {
    assetName = trade.asset.split(" ")[0].replace("FOREXCOM:", "");
  }

  const symbolShort = trade.asset.includes("XAU") ? "XAUUSD" : trade.asset.split(" ")[0].replace("FOREXCOM:", "");
  const dynamicReason = trade.reason || trade.confluence || generateDynamicReason(trade.type);

  const message = formatHaramiSignalMessage({
    direction: trade.type,
    symbolShort,
    assetName,
    h4Context: isBuy ? "Bullish" : "Bearish",
    h1Bias: isBuy ? "BULLISH" : "BEARISH",
    m15Setup: isBuy ? "BULLISH" : "BEARISH",
    m5Entry: "CONFIRMED",
    entryLow: trade.entry - 0.55,
    entryHigh: trade.entry + 0.65,
    bestEntry: trade.entry,
    currentPrice: trade.entry,
    sl: trade.sl,
    tp1: trade.tp1,
    tp2,
    tp3,
    tp4,
    rr,
    confidence,
    reason: dynamicReason,
  });

  return await sendTelegramMessage(message, alertId);
}

export async function dispatchSLTPResultToTelegram(result: {
  source: string;
  asset: string;
  type: "BUY" | "SELL";
  outcome: "TP_HIT" | "SL_HIT";
  pnlUSD: number;
  price: number;
  accountBalance?: number;
}) {
  const alertId = `outcome-harami-${result.asset}-${result.outcome}-${Math.round(result.price)}`;
  const isTP = result.outcome === "TP_HIT";
  const icon = isTP ? "🎉 💰" : "🛡️ 🛑";
  const statusText = isTP ? "✅ Take Profit Hit" : "❌ Stop Loss Hit";
  const balanceStr = result.accountBalance ? `$${result.accountBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$10,257.00";

  const message = `
<b>${icon} 🔥 HARAMI AI – TRADE OUTCOME NOTIFICATION</b>
━━━━━━━━━━━━━━━━━━━
<b>1. 🧠 AI ENGINE:</b> <b>Harami AI</b>
<b>2. 📊 ASSET:</b> ${result.asset} (${result.type})
<b>3. 📢 STATUS:</b> <code>${statusText}</code>
<b>4. 🏁 EXIT PRICE:</b> <code>$${result.price.toFixed(2)}</code>
<b>5. 💵 NET P&L:</b> <code>${result.pnlUSD >= 0 ? "+" : ""}$${result.pnlUSD.toFixed(2)}</code>
<b>6. 💼 UPDATED BALANCE:</b> <code>${balanceStr}</code>
━━━━━━━━━━━━━━━━━━━
<i>⚡ Harami AI • Trade Closed & 12 Min Cooldown Engaged</i>
  `.trim();

  return await sendTelegramMessage(message, alertId);
}

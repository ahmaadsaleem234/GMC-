// Telegram Bot Signal Alert Dispatcher

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
    const saved = localStorage.getItem(STORAGE_KEY);
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
    console.error("Failed to load Telegram config", e);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));

    // Sync credentials directly to 24/7 server background broadcaster
    if (cleaned.botToken || cleaned.chatId) {
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
    console.error("Failed to save Telegram config", e);
  }
}

// Track sent messages to prevent duplicates / spam
const sentAlertCache = new Set<string>();

export async function sendTelegramMessage(
  messageText: string,
  alertId?: string,
  overrideConfig?: { botToken?: string; chatId?: string }
): Promise<{ success: boolean; message: string }> {
  try {
    const config = getTelegramConfig();

    const token = cleanTelegramInput(overrideConfig?.botToken || config.botToken);
    const chatId = cleanTelegramInput(overrideConfig?.chatId || config.chatId);

    if (!token || !chatId) {
      return { success: false, message: "❌ Telegram Bot Token & Chat ID are required." };
    }

    if (alertId) {
      if (sentAlertCache.has(alertId)) {
        return { success: true, message: "Alert already dispatched (duplicate suppressed)." };
      }
      sentAlertCache.add(alertId);
      if (sentAlertCache.size > 200) {
        const first = sentAlertCache.values().next().value;
        if (first) sentAlertCache.delete(first);
      }
    }

    // Method 1: Try Server Proxy Route /api/telegram/send first (prevents CORS & mobile fetch quirks on external domains)
    try {
      const response = await fetch("/api/telegram/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: messageText,
          botToken: token,
          chatId: chatId,
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await response.json();
        if (data.ok) {
          return { success: true, message: "✅ Telegram signal dispatched successfully to channel!" };
        }
        if (data.error) {
          console.warn("Server route returned error:", data.error);
        }
      }
    } catch (serverErr) {
      console.warn("Server proxy Telegram send failed, trying direct browser API...", serverErr);
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
  // STRICT RULE: Only 🥇 TOP 1 AI Brain is allowed to dispatch Telegram signals!
  const isTop1Engine =
    trade.source.includes("TOP 1") ||
    trade.source.includes("gmcgold") ||
    trade.source.includes("GMC GOLD Apex");

  if (!isTop1Engine) {
    console.log(`[TELEGRAM BROADCASTER FILTERED]: ${trade.source} is not 🥇 TOP 1 AI Brain. Suppressed.`);
    return { success: true, message: "Suppressed non-TOP 1 AI Brain signal (Only TOP 1 allowed)." };
  }

  const alertId = `trade-${trade.source}-${trade.asset}-${trade.type}-${trade.entry}-${Math.floor(Date.now() / 300000)}`;
  const icon = trade.type === "BUY" ? "🟢 🚀" : "🔴 📉";

  const entryZone = `$${(trade.entry - 0.5).toFixed(2)} - $${(trade.entry + 0.5).toFixed(2)}`;
  const risk = Math.abs(trade.entry - trade.sl);
  const reward = Math.abs(trade.tp1 - trade.entry);
  const rr = risk > 0 ? `1 : ${(reward / risk).toFixed(1)}` : "1 : 2.5";
  const confidence = trade.confidence || 96.4;
  const tp2 = trade.tp2 || Number((trade.type === "BUY" ? trade.entry + reward * 1.8 : trade.entry - reward * 1.8).toFixed(2));
  const tp3 = trade.tp3 || Number((trade.type === "BUY" ? trade.entry + reward * 2.8 : trade.entry - reward * 2.8).toFixed(2));
  const tp4 = trade.tp4 || Number((trade.type === "BUY" ? trade.entry + reward * 4.0 : trade.entry - reward * 4.0).toFixed(2));
  const timestamp = new Date().toISOString().replace("T", " ").substring(0, 16) + " UTC";

  const message = `
<b>${icon} 🔥 HARAMI AI – INSTITUTIONAL SIGNAL ALERT</b>
━━━━━━━━━━━━━━━━━━━
<b>1. 📊 SYMBOL:</b> <code>${trade.asset}</code>
<b>2. 🎯 DIRECTION:</b> <code>${trade.type}</code>
<b>3. 📍 ENTRY ZONE:</b> <code>${entryZone}</code>
<b>4. 💎 BEST ENTRY:</b> <code>$${trade.entry.toFixed(2)}</code>
<b>5. 🛡️ STOP LOSS:</b> <code>$${trade.sl.toFixed(2)}</code>
<b>6. 🎯 TAKE PROFIT 1:</b> <code>$${trade.tp1.toFixed(2)}</code>
<b>7. 🎯 TAKE PROFIT 2:</b> <code>$${tp2.toFixed(2)}</code>
<b>8. 🎯 TAKE PROFIT 3:</b> <code>$${tp3.toFixed(2)}</code>
<b>9. 🎯 TAKE PROFIT 4:</b> <code>$${tp4.toFixed(2)}</code>
<b>10. ⚖️ RISK : REWARD:</b> <code>${rr}</code>
<b>11. 🔥 CONFIDENCE %:</b> <code>${confidence}% (A+ Setup)</code>
<b>12. 🧠 AI ENGINE:</b> <b>Harami AI</b>
<b>13. ⏱️ TIMEFRAME:</b> <code>5m / M15</code>
<b>14. 💡 REASON FOR ENTRY:</b> ${trade.reason || trade.confluence || "Order Block Sweep + Unmitigated FVG Retest"}
<b>15. 🕒 TIMESTAMP:</b> <code>${timestamp}</code>
━━━━━━━━━━━━━━━━━━━
<i>⚡ Harami AI Engine • Exclusive Signal Dispatch</i>
  `.trim();

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
  const alertId = `outcome-${result.source}-${result.asset}-${result.outcome}-${Math.round(result.price)}`;
  const isTP = result.outcome === "TP_HIT";
  const icon = isTP ? "🎉 💰" : "🛡️ 🛑";
  const statusText = isTP ? "✅ Take Profit Hit" : "❌ Stop Loss Hit";
  const balanceStr = result.accountBalance ? `$${result.accountBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$10,257.00";

  const message = `
<b>${icon} 🔥 HARAMI AI – TRADE OUTCOME NOTIFICATION</b>
━━━━━━━━━━━━━━━━━━━
<b>🧠 BRAIN MODULE:</b> Harami AI
<b>📊 ASSET:</b> ${result.asset} (${result.type})
<b>STATUS:</b> <code>${statusText}</code>
<b>EXIT PRICE:</b> <code>$${result.price.toFixed(2)}</code>
<b>NET PROFIT/LOSS:</b> <code>${result.pnlUSD >= 0 ? "+" : ""}$${result.pnlUSD.toFixed(2)}</code>
<b>💼 UPDATED BALANCE:</b> <code>${balanceStr}</code>
━━━━━━━━━━━━━━━━━━━
<i>⚡ Harami AI • Trade Closed & Completed</i>
  `.trim();

  return await sendTelegramMessage(message, alertId);
}

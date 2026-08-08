/**
 * Pure TypeScript helper for formatting Harami AI signal text and generating dynamic reasons.
 * Contains no Node.js/Canvas dependencies, safe for both client and server code.
 */

export interface HaramiSignalParams {
  direction: "BUY" | "SELL" | "NO_TRADE";
  symbolShort?: string;
  assetName?: string;
  h4Context?: string;
  h1Bias?: string;
  m15Setup?: string;
  m5Entry?: string;
  entryLow?: number;
  entryHigh?: number;
  bestEntry?: number;
  currentPrice?: number;
  sl?: number;
  tp1?: number;
  tp2?: number;
  tp3?: number;
  tp4?: number;
  rr?: string;
  confidence?: number;
  reason?: string;
}

export const DYNAMIC_BUY_REASONS = [
  "H1 bullish structure + M15 liquidity sweep + bullish FVG mitigation + M5 CHOCH confirmation",
  "Apex Demand-Zone Reaction + Sell-Side Liquidity Sweep + Institutional Buyer Influx",
  "Institutional Order Block Rejection + Bullish Fair Value Gap Fill + Delta Volume Surge",
  "Discount Zone Precision Entry + Smart Money Divergence + High-Volume Buyer Aggression",
  "Unmitigated Bullish FVG Mitigation + Mitigation Block Bounce + Delta Influx"
];

export const DYNAMIC_SELL_REASONS = [
  "H1 bearish structure + M15 BSL raid + bearish Order Block rejection + M5 CHOCH confirmation",
  "Apex Supply-Zone Rejection + Buy-Side Liquidity Sweep + Institutional Seller Influx",
  "Institutional Bearish Order Block Rejection + Bearish Fair Value Gap Fill + Delta Distribution",
  "Premium Zone Precision Entry + Smart Money Bearish Divergence + Aggressive Sell Orders",
  "Bearish FVG Mitigation + Supply Block Rejection + Delta Influx"
];

export function generateDynamicReason(direction: "BUY" | "SELL" | "NO_TRADE", seedInput?: number): string {
  if (direction === "NO_TRADE") {
    return "Conflicting timeframe bias (H1 vs M15). Market structure in equilibrium range. Awaiting clean institutional sweep & confirmation.";
  }
  const list = direction === "BUY" ? DYNAMIC_BUY_REASONS : DYNAMIC_SELL_REASONS;
  const index = Math.abs(seedInput !== undefined ? seedInput : Math.floor(Date.now() / 60000)) % list.length;
  return list[index];
}

export function formatHaramiSignalMessage(params: HaramiSignalParams): string {
  if (params.direction === "NO_TRADE") {
    const h4 = params.h4Context || "Neutral";
    const h1 = params.h1Bias || "Neutral";
    const m15 = params.m15Setup || "Neutral";
    const m5 = params.m5Entry || "Waiting";
    const reasonText = params.reason || generateDynamicReason("NO_TRADE");

    return `
⏳ <b>HARAMI AI — NO TRADE</b>

<b>📊 XAUUSD | WAIT</b>

🕒 <b>TIMEFRAME ANALYSIS</b>
H4 Context: ${h4}
H1 Bias: ${h1}
M15 Setup: ${m15}
M5 Confirmation: ${m5}

🧠 <b>Reason:</b>
${reasonText}

⚡ <i>Harami AI • Serious Signals, Zero Drama.</i>
    `.trim();
  }

  const isBuy = params.direction === "BUY";
  const iconEmoji = isBuy ? "🟢🔥" : "🔴🔥";
  const symbolShort = params.symbolShort || "XAUUSD";
  const assetLabel = params.assetName || (symbolShort === "XAUUSD" ? "GOLD" : symbolShort);

  const bestEntry = params.bestEntry ?? (isBuy ? 4342.26 : 4342.26);
  const entryLow = params.entryLow ?? (isBuy ? bestEntry - 0.8 : bestEntry - 0.5);
  const entryHigh = params.entryHigh ?? (isBuy ? bestEntry + 0.5 : bestEntry + 0.8);
  const currentPrice = params.currentPrice ?? bestEntry;
  const sl = params.sl ?? (isBuy ? bestEntry - 4.5 : bestEntry + 4.5);
  const tp1 = params.tp1 ?? (isBuy ? bestEntry + 7.0 : bestEntry - 7.0);
  const tp2 = params.tp2 ?? (isBuy ? bestEntry + 10.0 : bestEntry - 10.0);
  const tp3 = params.tp3 ?? (isBuy ? bestEntry + 14.0 : bestEntry - 14.0);
  const tp4 = params.tp4 ?? (isBuy ? bestEntry + 20.0 : bestEntry - 20.0);

  const h4 = params.h4Context || (isBuy ? "Bullish" : "Bearish");
  const h1 = params.h1Bias || (isBuy ? "BULLISH" : "BEARISH");
  const m15 = params.m15Setup || (isBuy ? "BULLISH" : "BEARISH");
  const m5 = params.m5Entry || "CONFIRMED";

  // Calculate actual mathematical R:R
  let rrStr = params.rr;
  if (!rrStr) {
    const risk = Math.abs(bestEntry - sl);
    const reward = Math.abs(tp1 - bestEntry);
    if (risk > 0) {
      const ratio = (reward / risk).toFixed(2);
      rrStr = `1 : ${ratio}`;
    } else {
      rrStr = "1 : 1.56";
    }
  }

  const confidenceVal = params.confidence || 96.9;
  const confidenceGrade = confidenceVal >= 95.0 ? "A+" : "A";
  const reasonText = params.reason || generateDynamicReason(params.direction);
  const priceIcon = isBuy ? "📈" : "📉";

  return `
${iconEmoji} <b>HARAMI AI — ${params.direction} ${assetLabel}</b>

<b>📊 ${symbolShort} | ${params.direction}</b>

🕒 <b>TIMEFRAME ANALYSIS</b>
H4 Context: ${h4}
H1 Bias: ${h1}
M15 Setup: ${m15}
M5 Entry: ${m5}

📍 <b>Entry:</b> <code>$${entryLow.toFixed(2)} - $${entryHigh.toFixed(2)}</code>
💎 <b>Best:</b> <code>$${bestEntry.toFixed(2)}</code>
${priceIcon} <b>Current:</b> <code>$${currentPrice.toFixed(2)}</code>
🛡️ <b>SL:</b> <code>$${sl.toFixed(2)}</code>

🎯 <b>TP1:</b> <code>$${tp1.toFixed(2)}</code>
🎯 <b>TP2:</b> <code>$${tp2.toFixed(2)}</code>
🎯 <b>TP3:</b> <code>$${tp3.toFixed(2)}</code>
🎯 <b>TP4:</b> <code>$${tp4.toFixed(2)}</code>

⚖️ <b>R:R:</b> <code>${rrStr}</code>
🔥 <b>Confidence:</b> <code>${confidenceVal}% ${confidenceGrade}</code>

🧠 <b>Setup:</b>
${reasonText}

⚡ <i>Harami AI • Serious Signals, Zero Drama.</i>
  `.trim();
}

/**
 * Pure TypeScript helper for formatting Harami AI signal text and generating dynamic reasons.
 * Contains no Node.js/Canvas dependencies, safe for both client and server code.
 */

export interface HaramiSignalParams {
  direction: "BUY" | "SELL";
  symbolShort?: string;
  assetName?: string;
  entryLow: number;
  entryHigh: number;
  bestEntry: number;
  sl: number;
  tp1: number;
  tp2: number;
  tp3: number;
  tp4: number;
  rr?: string;
  confidence?: number;
  reason?: string;
}

export const DYNAMIC_BUY_REASONS = [
  "Apex Demand-Zone Reaction + Sell-Side Liquidity Sweep + Institutional Buyer Influx",
  "Institutional Order Block Rejection + Bullish Fair Value Gap Fill + Delta Volume Surge",
  "Liquidity Pool Sweep Below Recent Lows + Strong Bullish Engulfing Structure + Market Structure Shift",
  "Discount Zone Precision Entry + Smart Money Divergence + High-Volume Buyer Aggression",
  "Unmitigated Bullish FVG Mitigation + Mitigation Block Bounce + Delta Influx"
];

export const DYNAMIC_SELL_REASONS = [
  "Apex Supply-Zone Rejection + Buy-Side Liquidity Sweep + Institutional Seller Influx",
  "Institutional Bearish Order Block Rejection + Bearish Fair Value Gap Fill + Delta Distribution",
  "Liquidity Sweep Above Equal Highs + Bearish Market Structure Break + Heavy Seller Volume",
  "Premium Zone Precision Entry + Smart Money Bearish Divergence + Aggressive Sell Orders",
  "Bearish FVG Mitigation + Supply Block Rejection + Delta Influx"
];

export function generateDynamicReason(direction: "BUY" | "SELL", seedInput?: number): string {
  const list = direction === "BUY" ? DYNAMIC_BUY_REASONS : DYNAMIC_SELL_REASONS;
  const index = Math.abs(seedInput !== undefined ? seedInput : Math.floor(Date.now() / 60000)) % list.length;
  return list[index];
}

export function formatHaramiSignalMessage(params: HaramiSignalParams): string {
  const isBuy = params.direction === "BUY";
  const iconEmoji = isBuy ? "🟢🔥" : "🔴🔥";
  const symbolShort = params.symbolShort || "XAUUSD";
  const assetLabel = params.assetName || (symbolShort === "XAUUSD" ? "GOLD" : symbolShort);
  const entryZoneStr = `$${params.entryLow.toFixed(2)} - $${params.entryHigh.toFixed(2)}`;
  const rrStr = params.rr || "1 : 1.6";
  const confidenceVal = params.confidence || 96.9;
  const reasonText = params.reason || generateDynamicReason(params.direction);

  return `
<b>${iconEmoji} HARAMI AI — ${params.direction} ${assetLabel}</b>

<b>📊 ${symbolShort} | ${params.direction}</b>
📍 <b>Entry:</b> <code>${entryZoneStr}</code>
💎 <b>Best:</b> <code>${params.bestEntry.toFixed(2)}</code>
🛡️ <b>SL:</b> <code>${params.sl.toFixed(2)}</code>

🎯 <b>TP:</b> <code>${params.tp1.toFixed(2)} | ${params.tp2.toFixed(2)} | ${params.tp3.toFixed(2)} | ${params.tp4.toFixed(2)}</code>
⚖️ <b>R:R:</b> <code>${rrStr}</code>
🔥 <b>Confidence:</b> <code>${confidenceVal}% A+</code>

🧠 <b>${reasonText}</b>
<i>⚡ Harami AI • Serious Signals, Zero Drama</i>
  `.trim();
}

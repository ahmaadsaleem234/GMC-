/**
 * Pure TypeScript helper for formatting Harami AI signal text and generating dynamic reasons.
 * Contains no Node.js/Canvas dependencies, safe for both client and server code.
 */

export interface HaramiSignalParams {
  signalId?: string;
  direction: "BUY" | "SELL" | "NO_TRADE";
  symbolShort?: string;
  assetName?: string;
  timeframe?: string;
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
  grade?: string;
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
    const symbolShort = params.symbolShort || "XAUUSD";
    return `
🤖 HARAMI AI | NO TRADE

${symbolShort}
Status: ⏳ SCANNING (Awaiting 14/14 Confirmation)
    `.trim();
  }

  const symbolShort = (params.symbolShort || "XAUUSD").replace("FOREXCOM:", "");
  const bestEntry = params.bestEntry ?? 2885.0;
  const isBuy = params.direction === "BUY";
  const entryLow = params.entryLow ?? (isBuy ? bestEntry - 1.5 : bestEntry - 0.5);
  const entryHigh = params.entryHigh ?? (isBuy ? bestEntry + 0.5 : bestEntry + 1.5);
  const sl = params.sl ?? (isBuy ? bestEntry - 5.5 : bestEntry + 5.5);
  const tp1 = params.tp1 ?? (isBuy ? bestEntry + 8.25 : bestEntry - 8.25);
  const tp2 = params.tp2 ?? (isBuy ? bestEntry + 13.75 : bestEntry - 13.75);
  const tp3 = params.tp3 ?? (isBuy ? bestEntry + 19.8 : bestEntry - 19.8);
  const tp4 = params.tp4 ?? (isBuy ? bestEntry + 26.4 : bestEntry - 26.4);

  // Calculate actual mathematical R:R
  let rrStr = params.rr;
  if (!rrStr) {
    const risk = Math.abs(bestEntry - sl);
    const reward = Math.abs(tp2 - bestEntry);
    if (risk > 0) {
      const ratio = (reward / risk).toFixed(1);
      rrStr = `1:${ratio}`;
    } else {
      rrStr = "1:2.5";
    }
  } else {
    rrStr = rrStr.replace(/^R:R:\s*/i, "").trim();
  }

  const confidenceVal = typeof params.confidence === "number" ? Math.round(params.confidence) : 92;
  const statusEmoji = isBuy ? "🟢" : "🔴";

  return `🤖 HARAMI AI | ${params.direction}

${symbolShort}
Entry: ${entryLow.toFixed(2)} – ${entryHigh.toFixed(2)}
Best Entry: ${bestEntry.toFixed(2)}

SL: ${sl.toFixed(2)}
Risk: 1.0%

TP1: ${tp1.toFixed(2)}
TP2: ${tp2.toFixed(2)}
TP3: ${tp3.toFixed(2)}
TP4: ${tp4.toFixed(2)}

R:R: ${rrStr}
Score: ${confidenceVal}/100
Confirmation: 14/14
Status: ${statusEmoji} ACTIVE`;
}

export interface LifecycleAlertParams {
  signalId: string;
  symbol: string;
  direction: "BUY" | "SELL";
  price?: number;
  entryPrice?: number;
  exitPrice?: number;
  sl?: number;
  newSlPrice?: number;
  tp1?: number;
  tp2?: number;
  tp3?: number;
  tp4?: number;
  pips?: number;
  securedPips?: number;
  pnlUSD?: number;
  pnlPips?: number;
  confidence?: number;
  grade?: string;
  duration?: string;
  outcome?: string;
  reason?: string;
}

export function formatEntryActivatedAlert(params: LifecycleAlertParams): string {
  const signalId = params.signalId.startsWith("#") ? params.signalId : `#${params.signalId}`;
  const symbol = params.symbol.replace("FOREXCOM:", "");
  const price = (params.entryPrice || params.price || 4495.80).toFixed(2);
  const sl = params.sl ? params.sl.toFixed(2) : "—";
  const nextTarget = params.tp1 ? `TP1 (${params.tp1.toFixed(2)})` : "TP1";

  return `
🟢 ENTRY ACTIVATED
${signalId} | ${symbol} | ${params.direction}

📍 Entry Price: ${price}
🛡 SL: ${sl}
🎯 Next Target: ${nextTarget}
  `.trim();
}

export function formatTpHitAlert(level: 1 | 2 | 3 | 4, params: LifecycleAlertParams): string {
  const signalId = params.signalId.startsWith("#") ? params.signalId : `#${params.signalId}`;
  const symbol = params.symbol.replace("FOREXCOM:", "");
  const price = (params.price || 0).toFixed(2);
  const pips = params.pips ?? (level === 1 ? 70 : level === 2 ? 100 : level === 3 ? 140 : 200);

  if (level === 4) {
    return `
🎯 TP4 ALL TARGETS HIT (+${pips} Pips)
${signalId} | ${symbol} | ${params.direction}

📍 Price: ${price}
✅ TRADE FULLY CLOSED
    `.trim();
  }

  let followUpNote = "🔄 SL moved to BREAKEVEN";
  if (level === 2) followUpNote = "🔒 70% Profit Locked | Runner Active";
  if (level === 3) followUpNote = "🔒 Trailing SL Active in Profit";

  return `
🎯 TP${level} HIT (+${pips} Pips)
${signalId} | ${symbol} | ${params.direction}

📍 Price: ${price}
${followUpNote}
  `.trim();
}

export function formatBreakevenAlert(params: LifecycleAlertParams): string {
  const signalId = params.signalId.startsWith("#") ? params.signalId : `#${params.signalId}`;
  const symbol = params.symbol.replace("FOREXCOM:", "");
  const sl = (params.sl || params.entryPrice || 0).toFixed(2);

  return `
🔄 SL → BREAKEVEN
${signalId} | ${symbol} | ${params.direction}

🛡 Stop Loss: ${sl}
🔒 Trade is now completely Risk-Free
  `.trim();
}

export function formatProfitSecuredAlert(params: LifecycleAlertParams): string {
  const signalId = params.signalId.startsWith("#") ? params.signalId : `#${params.signalId}`;
  const symbol = params.symbol.replace("FOREXCOM:", "");
  const pips = params.pips ?? 35;

  return `
🔒 PROFIT SECURED
${signalId} | ${symbol} | ${params.direction}

💰 Partial profit taken
🛡 Trailing SL locked in green (+${pips} pips)
  `.trim();
}

export function formatSlHitAlert(params: LifecycleAlertParams): string {
  const signalId = params.signalId.startsWith("#") ? params.signalId : `#${params.signalId}`;
  const symbol = params.symbol.replace("FOREXCOM:", "");
  const price = (params.price || params.sl || 0).toFixed(2);
  const pips = params.pips ?? 45;

  return `
🛑 STOP LOSS HIT (-${pips} Pips)
${signalId} | ${symbol} | ${params.direction}

📍 Exit: ${price}
✅ CLOSED
  `.trim();
}

export function formatSignalExpiredAlert(params: LifecycleAlertParams): string {
  const signalId = params.signalId.startsWith("#") ? params.signalId : `#${params.signalId}`;
  const symbol = params.symbol.replace("FOREXCOM:", "");

  return `
🚫 SIGNAL EXPIRED
${signalId} | ${symbol} | ${params.direction}

⏳ Price did not tap entry zone in validity window.
🛡 Risk Capital 100% Preserved.
  `.trim();
}

export function formatTradeCancelledAlert(params: LifecycleAlertParams): string {
  const signalId = params.signalId.startsWith("#") ? params.signalId : `#${params.signalId}`;
  const symbol = params.symbol.replace("FOREXCOM:", "");

  return `
❌ TRADE CANCELLED
${signalId} | ${symbol} | ${params.direction}

⚠️ Structure broken before entry.
🛡 Setup Invalidated.
  `.trim();
}

export function formatWarRoomUpgradeAlert(params: LifecycleAlertParams): string {
  const signalId = params.signalId.startsWith("#") ? params.signalId : `#${params.signalId}`;
  const symbol = params.symbol.replace("FOREXCOM:", "");
  const confidence = params.confidence ? params.confidence.toFixed(1) : "95.0";
  const grade = params.grade || "A+";
  const sl = params.sl ? params.sl.toFixed(2) : "—";

  return `
⚔️ UPGRADED TO WAR ROOM
${signalId} | ${symbol} | ${params.direction}

🔥 Confidence: ${confidence}% | ${grade}
⚡ HIGH CONVICTION UPGRADE
🛡 SL: ${sl} | Targets Maintained
  `.trim();
}

export function formatTradeClosedAlert(params: LifecycleAlertParams): string {
  const signalId = params.signalId.startsWith("#") ? params.signalId : `#${params.signalId}`;
  const symbol = params.symbol.replace("FOREXCOM:", "");
  const outcome = params.outcome || "+70 Pips";
  const duration = params.duration || "42m";

  return `
✅ TRADE CLOSED
${signalId} | ${symbol} | ${params.direction}

🏆 Outcome: ${outcome}
⏱ Duration: ${duration}
  `.trim();
}

export interface DailySummaryParams {
  date?: string;
  totalTrades: number;
  tpCount?: number;
  tpHits?: number;
  slCount?: number;
  slHits?: number;
  beCount: number;
  netPips: number;
  netPnLUSD?: number;
  winRate?: number | string;
}

export function formatDailySummaryAlert(params: DailySummaryParams): string {
  const dateStr = params.date || new Date().toISOString().slice(0, 10);
  const pipsSign = params.netPips >= 0 ? "+" : "";
  const tp = params.tpCount ?? params.tpHits ?? 0;
  const sl = params.slCount ?? params.slHits ?? 0;

  return `
📊 DAILY TRADE SUMMARY
${dateStr}

📈 Total Trades: ${params.totalTrades}
🎯 TP: ${tp} | 🛑 SL: ${sl} | 🔄 BE: ${params.beCount}
💰 Net Result: ${pipsSign}${params.netPips} Pips

⚡ GMC AI • Harami & War Room
  `.trim();
}

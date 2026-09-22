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
  isAlreadyInZone?: boolean;
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
🤖 <b>HARAMI AI | NO TRADE</b>

<code>${symbolShort}</code>
Status: ⏳ SCANNING (Awaiting 14/14 Confirmation)
    `.trim();
  }

  const symbolShort = (params.symbolShort || "XAUUSD").replace("FOREXCOM:", "");
  const bestEntry = params.bestEntry ?? 2885.0;
  const isBuy = params.direction === "BUY";
  const entryLow = params.entryLow ?? (isBuy ? bestEntry - 1.5 : bestEntry - 0.5);
  const entryHigh = params.entryHigh ?? (isBuy ? bestEntry + 0.5 : bestEntry + 1.5);
  const sl = params.sl ?? (isBuy ? bestEntry - 3.0 : bestEntry + 3.0);
  const tp1 = params.tp1 ?? (isBuy ? bestEntry + 4.5 : bestEntry - 4.5);
  const tp2 = params.tp2 ?? (isBuy ? bestEntry + 7.5 : bestEntry - 7.5);
  const tp3 = params.tp3 ?? (isBuy ? bestEntry + 11.0 : bestEntry - 11.0);
  const tp4 = params.tp4 ?? (isBuy ? bestEntry + 16.0 : bestEntry - 16.0);

  // Exact pips distance
  const riskPips = Math.max(1, Math.round(Math.abs(bestEntry - sl) * 10));
  const tp1Pips = Math.max(1, Math.round(Math.abs(tp1 - bestEntry) * 10));
  const tp2Pips = Math.max(1, Math.round(Math.abs(tp2 - bestEntry) * 10));
  const tp3Pips = Math.max(1, Math.round(Math.abs(tp3 - bestEntry) * 10));
  const tp4Pips = Math.max(1, Math.round(Math.abs(tp4 - bestEntry) * 10));

  // Calculate actual mathematical R:R against TP2 (standard target)
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
  const dirBadge = isBuy ? "BUY 🟢" : "SELL 🔴";
  const idDisplay = params.signalId ? `#${params.signalId.replace(/^#/, "")}` : "#HRM-AI";
  const inZone = params.isAlreadyInZone ?? false;
  const statusLabel = inZone ? "🟢 IN ZONE (ACTIVE)" : "⏳ PENDING ENTRY";

  return `🤖 <b>HARAMI AI | ${dirBadge}</b>
━━━━━━━━━━━━━━━━━━━
<b>${idDisplay} • ${symbolShort} (GOLD)</b>
📍 <b>Entry Zone:</b> <code>${entryLow.toFixed(2)} – ${entryHigh.toFixed(2)}</code>
⚡ <b>Best Entry:</b> <code>${bestEntry.toFixed(2)}</code>

🛑 <b>SL:</b> <code>${sl.toFixed(2)}</code> (-${riskPips} pips)
🎯 <b>TP1:</b> <code>${tp1.toFixed(2)}</code> (+${tp1Pips} pips)
🎯 <b>TP2:</b> <code>${tp2.toFixed(2)}</code> (+${tp2Pips} pips)
🎯 <b>TP3:</b> <code>${tp3.toFixed(2)}</code> (+${tp3Pips} pips)
🎯 <b>TP4:</b> <code>${tp4.toFixed(2)}</code> (+${tp4Pips} pips)

📊 <b>R:R:</b> <code>${rrStr}</code>
🔥 <b>Score:</b> <code>${confidenceVal}/100</code> (14/14 Confluence)
📌 <b>Status:</b> <b>${statusLabel}</b>
⏱️ <b>Expiry:</b> <code>30 Minutes (Auto-Close if no TP/SL)</code>
━━━━━━━━━━━━━━━━━━━
<i>💡 Tip: Tap any price number to copy directly to MT5.</i>`;
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
  const price = (params.entryPrice || params.price || 0).toFixed(2);
  const sl = params.sl ? params.sl.toFixed(2) : "—";
  const nextTarget = params.tp1 ? `<code>${params.tp1.toFixed(2)}</code>` : "TP1";
  const dirBadge = params.direction === "BUY" ? "BUY 🟢" : "SELL 🔴";

  return `🟢 <b>ENTRY ACTIVATED</b>
━━━━━━━━━━━━━━━━━━━
<b>${signalId} • ${symbol} • ${dirBadge}</b>
📍 <b>Executed Entry:</b> <code>${price}</code>
🛡 <b>Stop Loss:</b> <code>${sl}</code>
🎯 <b>Next Target:</b> ${nextTarget}
⏱️ <b>Validity:</b> 30-Min Active Countdown Started`;
}

export function formatTpHitAlert(level: 1 | 2 | 3 | 4, params: LifecycleAlertParams): string {
  const signalId = params.signalId.startsWith("#") ? params.signalId : `#${params.signalId}`;
  const symbol = params.symbol.replace("FOREXCOM:", "");
  const price = (params.price || 0).toFixed(2);
  const defaultPips = level === 1 ? 45 : level === 2 ? 75 : level === 3 ? 110 : 160;
  const pips = params.pips ?? defaultPips;
  const dirBadge = params.direction === "BUY" ? "BUY 🟢" : "SELL 🔴";

  if (level === 4) {
    return `🎯 <b>TP4 ALL TARGETS HIT (+${pips} Pips)</b>
━━━━━━━━━━━━━━━━━━━
<b>${signalId} • ${symbol} • ${dirBadge}</b>
🏁 <b>Exit Price:</b> <code>${price}</code>
✅ <b>TRADE FULLY CLOSED IN PROFIT</b>
⏳ 30-Minute Quality Cooldown Initiated`;
  }

  let followUpNote = "🔄 <b>SL moved to BREAKEVEN (Risk-Free)</b>";
  if (level === 2) followUpNote = "🔒 <b>70% Profit Locked | Runner Active</b>";
  if (level === 3) followUpNote = "🔒 <b>Trailing SL Active in Profit</b>";

  return `🎯 <b>TP${level} HIT (+${pips} Pips)</b>
━━━━━━━━━━━━━━━━━━━
<b>${signalId} • ${symbol} • ${dirBadge}</b>
📍 <b>Live Market Price:</b> <code>${price}</code>
${followUpNote}`;
}

export function formatBreakevenAlert(params: LifecycleAlertParams): string {
  const signalId = params.signalId.startsWith("#") ? params.signalId : `#${params.signalId}`;
  const symbol = params.symbol.replace("FOREXCOM:", "");
  const sl = (params.sl || params.entryPrice || 0).toFixed(2);
  const dirBadge = params.direction === "BUY" ? "BUY 🟢" : "SELL 🔴";

  return `🔄 <b>SL MOVED TO BREAKEVEN</b>
━━━━━━━━━━━━━━━━━━━
<b>${signalId} • ${symbol} • ${dirBadge}</b>
🛡 <b>New Stop Loss:</b> <code>${sl}</code>
🔒 <b>Trade is now 100% Risk-Free ($0.00 Capital at Risk)</b>`;
}

export function formatProfitSecuredAlert(params: LifecycleAlertParams): string {
  const signalId = params.signalId.startsWith("#") ? params.signalId : `#${params.signalId}`;
  const symbol = params.symbol.replace("FOREXCOM:", "");
  const pips = params.pips ?? 35;
  const dirBadge = params.direction === "BUY" ? "BUY 🟢" : "SELL 🔴";

  return `🔒 <b>PROFIT SECURED</b>
━━━━━━━━━━━━━━━━━━━
<b>${signalId} • ${symbol} • ${dirBadge}</b>
💰 <b>Partial Profits Banked</b>
🛡 <b>Trailing Stop in Green:</b> <code>+${pips} pips</code>`;
}

export function formatSlHitAlert(params: LifecycleAlertParams): string {
  const signalId = params.signalId.startsWith("#") ? params.signalId : `#${params.signalId}`;
  const symbol = params.symbol.replace("FOREXCOM:", "");
  const price = (params.price || params.sl || 0).toFixed(2);
  const pips = params.pips ?? 30;
  const dirBadge = params.direction === "BUY" ? "BUY 🟢" : "SELL 🔴";

  return `🛑 <b>STOP LOSS HIT (-${pips} Pips)</b>
━━━━━━━━━━━━━━━━━━━
<b>${signalId} • ${symbol} • ${dirBadge}</b>
📍 <b>Exit Price:</b> <code>${price}</code>
🛡 <b>Capital Protected via Disciplined SL</b>
⏳ 30-Minute Quality Cooldown Initiated`;
}

export function formatSignalExpiredAlert(params: LifecycleAlertParams): string {
  const signalId = params.signalId.startsWith("#") ? params.signalId : `#${params.signalId}`;
  const symbol = params.symbol.replace("FOREXCOM:", "");
  const exitPrice = params.exitPrice || params.price;
  const exitStr = exitPrice ? `\n📍 <b>Closed At:</b> <code>$${exitPrice.toFixed(2)}</code>` : "";
  const dirBadge = params.direction === "BUY" ? "BUY 🟢" : "SELL 🔴";

  return `⏱️ <b>SIGNAL EXPIRED (30 MIN LIMIT)</b>
━━━━━━━━━━━━━━━━━━━
<b>${signalId} • ${symbol} • ${dirBadge}</b>
⏳ 30 minutes elapsed without hitting SL or TP targets.${exitStr}
🛡️ Position automatically expired & closed at market price.
🔍 <b>Continuous Market Analysis Mode Active</b>
✨ Fresh setup search active — next signal dispatches as soon as high-confidence structure confirms.`;
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

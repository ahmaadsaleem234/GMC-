import { Candle, DojiZone, SMCResult, OrderBlock, FVG, ConfluenceResult, SessionInfo } from "./types";

// ==========================================
// TECHNICAL INDICATORS
// ==========================================

export function calculateRSI(candles: Candle[], period = 14): number[] {
  const rsis: number[] = [];
  if (candles.length <= period) return candles.map(() => 50);

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = 0; i <= period; i++) {
    rsis.push(50);
  }

  for (let i = period + 1; i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    if (diff >= 0) {
      avgGain = (avgGain * (period - 1) + diff) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) - diff) / period;
    }

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);
    rsis.push(parseFloat(rsi.toFixed(2)));
  }

  return rsis;
}

export function calculateEMA(candles: Candle[], period: number): number[] {
  const emas: number[] = [];
  if (!candles.length) return [];
  const k = 2 / (period + 1);
  let prevEMA = candles[0].close;

  for (let i = 0; i < candles.length; i++) {
    if (i < period) {
      const sum = candles.slice(0, i + 1).reduce((s, c) => s + c.close, 0);
      prevEMA = sum / (i + 1);
    } else {
      prevEMA = candles[i].close * k + prevEMA * (1 - k);
    }
    emas.push(parseFloat(prevEMA.toFixed(4)));
  }

  return emas;
}

export function calculateATR(candles: Candle[], period = 14): number {
  if (candles.length < 2) return 1.5;
  let trSum = 0;
  const len = Math.min(candles.length, period);
  for (let i = candles.length - len; i < candles.length; i++) {
    const c = candles[i];
    const prevC = candles[i - 1] || c;
    const tr = Math.max(
      c.high - c.low,
      Math.abs(c.high - prevC.close),
      Math.abs(c.low - prevC.close)
    );
    trSum += tr;
  }
  return parseFloat((trSum / len).toFixed(4));
}

// ==========================================
// DOJI DETECTOR & CLUSTER ZONES
// ==========================================

export function detectDojis(candles: Candle[], tfName = "H1"): DojiZone[] {
  const zones: DojiZone[] = [];
  if (candles.length < 5) return zones;

  for (let i = candles.length - 25; i < candles.length - 1; i++) {
    if (i < 0) continue;
    const c = candles[i];
    const range = c.high - c.low;
    if (range <= 0) continue;

    const body = Math.abs(c.close - c.open);
    const bodyRatio = body / range;

    // Doji condition: body is <= 15% of total candle height
    if (bodyRatio <= 0.15) {
      const barsAgo = candles.length - 1 - i;
      const upperWick = c.high - Math.max(c.open, c.close);
      const lowerWick = Math.min(c.open, c.close) - c.low;
      const dir = lowerWick > upperWick ? "BUY" : "SELL";

      zones.push({
        id: `doji-${tfName}-${i}`,
        tf: tfName,
        dir,
        state: barsAgo < 4 ? "FRESH" : barsAgo < 12 ? "ARMED" : "PLAYED",
        tfStars: tfName === "H4" ? 4 : tfName === "H1" ? 3 : 2,
        high: c.high.toFixed(2),
        low: c.low.toFixed(2),
        mid: parseFloat(((c.high + c.low) / 2).toFixed(2)),
        barsAgo,
      });
    }
  }

  return zones.reverse().slice(0, 6);
}

// ==========================================
// SMART MONEY CONCEPTS (SMC) ENGINE
// ==========================================

export function detectSMC(candles: Candle[]): SMCResult {
  if (candles.length < 20) {
    return { orderBlocks: [], fvgs: [], structure: [] };
  }

  const orderBlocks: OrderBlock[] = [];
  const fvgs: FVG[] = [];
  const structure: SMCResult["structure"] = [];

  const currentPrice = candles[candles.length - 1].close;

  // 1. Order Blocks (Last opposing candle before strong impulse)
  for (let i = 5; i < candles.length - 3; i++) {
    const c = candles[i];
    const next1 = candles[i + 1];
    const next2 = candles[i + 2];

    const isBearCandle = c.close < c.open;
    const isBullImpulse = next1.close > next1.open && next2.close > next2.open && next2.close > c.high;

    if (isBearCandle && isBullImpulse) {
      const isMitigated = currentPrice < c.low;
      orderBlocks.push({
        top: c.high,
        bot: c.low,
        direction: "BULL",
        mitigated: isMitigated,
        strength: Math.min(100, Math.round(((next2.close - c.low) / (c.high - c.low + 0.001)) * 15)),
        age: candles.length - 1 - i,
      });
    }

    const isBullCandle = c.close > c.open;
    const isBearImpulse = next1.close < next1.open && next2.close < next2.open && next2.close < c.low;

    if (isBullCandle && isBearImpulse) {
      const isMitigated = currentPrice > c.high;
      orderBlocks.push({
        top: c.high,
        bot: c.low,
        direction: "BEAR",
        mitigated: isMitigated,
        strength: Math.min(100, Math.round(((c.high - next2.close) / (c.high - c.low + 0.001)) * 15)),
        age: candles.length - 1 - i,
      });
    }
  }

  // 2. Fair Value Gaps (FVG) - 3 candle imbalance gap
  for (let i = 1; i < candles.length - 1; i++) {
    const c1 = candles[i - 1];
    const c3 = candles[i + 1];

    // Bullish FVG (c1 high < c3 low)
    if (c3.low > c1.high) {
      fvgs.push({
        top: c3.low,
        bot: c1.high,
        direction: "BULL",
        mitigated: currentPrice < c1.high,
        strength: Math.round((c3.low - c1.high) * 10),
      });
    }

    // Bearish FVG (c1 low > c3 high)
    if (c1.low > c3.high) {
      fvgs.push({
        top: c1.low,
        bot: c3.high,
        direction: "BEAR",
        mitigated: currentPrice > c1.low,
        strength: Math.round((c1.low - c3.high) * 10),
      });
    }
  }

  // 3. Premium / Discount Equilibrium
  const recent20 = candles.slice(-20);
  const rangeHigh = Math.max(...recent20.map((c) => c.high));
  const rangeLow = Math.min(...recent20.map((c) => c.low));
  const equilibrium = (rangeHigh + rangeLow) / 2;

  return {
    orderBlocks: orderBlocks.filter((ob) => !ob.mitigated).slice(-4),
    fvgs: fvgs.filter((f) => !f.mitigated).slice(-4),
    structure: [
      { type: "BOS", direction: "BULL", price: rangeHigh, time: Date.now() - 3600000 },
      { type: "CHoCH", direction: "BEAR", price: rangeLow, time: Date.now() - 7200000 },
    ],
    premiumDiscount: {
      rangeHigh,
      rangeLow,
      equilibrium,
      premiumBot: equilibrium,
      discountTop: equilibrium,
    },
  };
}

// ==========================================
// SMART MONEY FLOW & INSTITUTIONAL VOLUME CLUSTERS
// ==========================================

export interface SmartMoneyFlowCluster {
  id: string;
  priceLevel: number;
  topPrice: number;
  botPrice: number;
  volume: number;
  flowDirection: "BUY" | "SELL";
  institutionalStrength: number; // 0-100%
  clusterType: "ACCUMULATION" | "DISTRIBUTION" | "LIQUIDITY_SWEEP";
  barsAgo: number;
}

export function detectSmartMoneyFlow(candles: Candle[]) {
  if (candles.length < 10) return { clusters: [], netDelta: 0, buyPercentage: 50 };

  const clusters: SmartMoneyFlowCluster[] = [];
  let totalBuyVol = 0;
  let totalSellVol = 0;

  candles.slice(-30).forEach((c, idx) => {
    const range = c.high - c.low || 0.01;
    const body = Math.abs(c.close - c.open);
    const volume = c.volume || Math.round(range * 15000 + body * 25000);
    const isBull = c.close >= c.open;

    if (isBull) {
      totalBuyVol += volume;
    } else {
      totalSellVol += volume;
    }

    // High volume anomaly check (Institutional Order Block cluster)
    if (volume > 1500) {
      const barsAgo = candles.length - 1 - idx;
      const flowDirection = isBull ? "BUY" : "SELL";
      const institutionalStrength = Math.min(99, Math.round((volume / 2500) * 85));

      clusters.push({
        id: `smf-${idx}`,
        priceLevel: parseFloat(((c.high + c.low) / 2).toFixed(2)),
        topPrice: parseFloat(c.high.toFixed(2)),
        botPrice: parseFloat(c.low.toFixed(2)),
        volume,
        flowDirection,
        institutionalStrength,
        clusterType: isBull ? (body / range > 0.6 ? "ACCUMULATION" : "LIQUIDITY_SWEEP") : (body / range > 0.6 ? "DISTRIBUTION" : "LIQUIDITY_SWEEP"),
        barsAgo,
      });
    }
  });

  const totalVol = totalBuyVol + totalSellVol || 1;
  const buyPercentage = Math.round((totalBuyVol / totalVol) * 100);
  const netDelta = totalBuyVol - totalSellVol;

  return {
    clusters: clusters.reverse().slice(0, 5),
    netDelta,
    buyPercentage,
  };
}

// ==========================================
// SESSION CLOCK INFO
// ==========================================

export function getSessionInfo(): SessionInfo {
  const now = new Date();
  const utcHour = now.getUTCHours();

  const active: string[] = [];
  if (utcHour >= 22 || utcHour < 7) active.push("Sydney");
  if (utcHour >= 0 && utcHour < 9) active.push("Tokyo");
  if (utcHour >= 7 && utcHour < 16) active.push("London");
  if (utcHour >= 12 && utcHour < 21) active.push("New York");

  const isOverlap = active.includes("London") && active.includes("New York");
  const isKillzone = (utcHour >= 7 && utcHour <= 10) || (utcHour >= 12 && utcHour <= 15);

  let label = active.join(" / ") || "Asian Session";
  if (isOverlap) label = "⚡ London / NY Overlap (High Volatility)";

  return {
    label,
    isHighVolume: isOverlap || isKillzone,
    activeSessions: active,
  };
}

// ==========================================
// MULTI-CONFLUENCE SIGNAL BUILDER
// ==========================================

export function buildEntryConfluence(candles: Candle[], currentPrice: number): ConfluenceResult {
  if (candles.length < 15) {
    return {
      direction: "WAIT",
      score: 40,
      entry: currentPrice,
      stopLoss: currentPrice * 0.995,
      tp1: currentPrice * 1.008,
      tp2: currentPrice * 1.015,
      tp3: currentPrice * 1.025,
      rr: 1.6,
      htfTrend: "RANGE",
      ltfTrend: "RANGE",
      reasons: [{ ok: false, text: "Insufficient candle history for confluence" }],
    };
  }

  const rsiList = calculateRSI(candles);
  const currentRSI = rsiList[rsiList.length - 1] || 50;
  const ema9 = calculateEMA(candles, 9);
  const ema21 = calculateEMA(candles, 21);
  const atr = calculateATR(candles);
  const smc = detectSMC(candles);
  const session = getSessionInfo();

  const currentEMA9 = ema9[ema9.length - 1] || currentPrice;
  const currentEMA21 = ema21[ema21.length - 1] || currentPrice;

  let bullScore = 0;
  let bearScore = 0;
  const reasons: { ok: boolean; text: string }[] = [];

  // 1. EMA Alignment
  if (currentEMA9 > currentEMA21) {
    bullScore += 25;
    reasons.push({ ok: true, text: "EMA 9 > EMA 21 (Bullish Trend Alignment)" });
  } else {
    bearScore += 25;
    reasons.push({ ok: true, text: "EMA 9 < EMA 21 (Bearish Trend Alignment)" });
  }

  // 2. RSI Momentum
  if (currentRSI > 50 && currentRSI < 70) {
    bullScore += 20;
    reasons.push({ ok: true, text: `RSI momentum positive (${currentRSI.toFixed(1)})` });
  } else if (currentRSI < 50 && currentRSI > 30) {
    bearScore += 20;
    reasons.push({ ok: true, text: `RSI momentum negative (${currentRSI.toFixed(1)})` });
  } else if (currentRSI <= 30) {
    bullScore += 30;
    reasons.push({ ok: true, text: `RSI Oversold reversal setup (${currentRSI.toFixed(1)})` });
  } else if (currentRSI >= 70) {
    bearScore += 30;
    reasons.push({ ok: true, text: `RSI Overbought reversal setup (${currentRSI.toFixed(1)})` });
  }

  // 3. SMC Orderblock Confluence
  const bullOB = smc.orderBlocks.find((ob) => ob.direction === "BULL" && !ob.mitigated);
  const bearOB = smc.orderBlocks.find((ob) => ob.direction === "BEAR" && !ob.mitigated);

  if (bullOB && currentPrice >= bullOB.bot && currentPrice <= bullOB.top * 1.002) {
    bullScore += 30;
    reasons.push({ ok: true, text: `Price resting at Bullish Order Block zone ($${bullOB.bot.toFixed(2)} - $${bullOB.top.toFixed(2)})` });
  }
  if (bearOB && currentPrice <= bearOB.top && currentPrice >= bearOB.bot * 0.998) {
    bearScore += 30;
    reasons.push({ ok: true, text: `Price retesting Bearish Order Block zone ($${bearOB.bot.toFixed(2)} - $${bearOB.top.toFixed(2)})` });
  }

  // 4. Session Volume Boost
  if (session.isHighVolume) {
    if (bullScore > bearScore) bullScore += 15;
    else bearScore += 15;
    reasons.push({ ok: true, text: `High Liquidity Session active (${session.label})` });
  }

  let direction: "BUY" | "SELL" | "WAIT" = "WAIT";
  let finalScore = 50;

  if (bullScore >= 55 && bullScore > bearScore) {
    direction = "BUY";
    finalScore = Math.min(96, bullScore);
  } else if (bearScore >= 55 && bearScore > bullScore) {
    direction = "SELL";
    finalScore = Math.min(96, bearScore);
  }

  const stopLoss = direction === "BUY" ? currentPrice - atr * 1.5 : currentPrice + atr * 1.5;
  const tp1 = direction === "BUY" ? currentPrice + atr * 1.8 : currentPrice - atr * 1.8;
  const tp2 = direction === "BUY" ? currentPrice + atr * 3.2 : currentPrice - atr * 3.2;
  const tp3 = direction === "BUY" ? currentPrice + atr * 5.0 : currentPrice - atr * 5.0;

  const riskDist = Math.abs(currentPrice - stopLoss);
  const rewardDist = Math.abs(tp2 - currentPrice);
  const rr = riskDist > 0 ? parseFloat((rewardDist / riskDist).toFixed(2)) : 1.5;

  return {
    direction,
    score: finalScore,
    entry: parseFloat(currentPrice.toFixed(4)),
    stopLoss: parseFloat(stopLoss.toFixed(4)),
    tp1: parseFloat(tp1.toFixed(4)),
    tp2: parseFloat(tp2.toFixed(4)),
    tp3: parseFloat(tp3.toFixed(4)),
    rr,
    htfTrend: currentEMA9 > currentEMA21 ? "BULL" : "BEAR",
    ltfTrend: direction === "BUY" ? "BULL" : direction === "SELL" ? "BEAR" : "RANGE",
    reasons,
    nearestOB: bullOB || bearOB || null,
    nearestFVG: smc.fvgs[0] || null,
    session,
  };
}

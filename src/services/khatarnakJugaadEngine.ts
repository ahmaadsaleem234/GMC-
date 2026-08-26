import { Candle } from "../types";

export type JugaadTimeframe = "1M";

export type JugaadSignalType = "SELL" | "WAIT";

export type JugaadStatus =
  | "WAITING FOR RETRACEMENT"
  | "IN 2.6 CONFLUENCE ZONE"
  | "ENTRY TRIGGERED"
  | "RUNNING"
  | "🎯 TP1 HIT"
  | "🎯 TP2 HIT"
  | "🎯 TP3 HIT"
  | "🏆 FINAL TP HIT"
  | "🛑 SL HIT"
  | "❌ INVALIDATED"
  | "⏳ EXPIRED"
  | "NO VALID SETUP";

export type SetupStage =
  | "SEARCHING_LIQUIDITY"
  | "SWEEP_DETECTED"
  | "BEARISH_DISPLACEMENT"
  | "WAITING_RETRACEMENT"
  | "IN_2_6_ZONE"
  | "CONFIRMATION_CHOCH"
  | "ACTIVE_SELL_TRADE"
  | "COMPLETED";

export type MarketRegimeType =
  | "STRONG_BEARISH"
  | "STRONG_BULLISH"
  | "RANGING_SIDEWAYS"
  | "HIGH_VOLATILITY";

export type SetupFinalResult =
  | "🏆 WIN — FINAL TP HIT"
  | "🎯 PARTIAL WIN — TP3 HIT"
  | "🎯 PARTIAL WIN — TP2 HIT"
  | "🎯 PARTIAL WIN — TP1 HIT"
  | "🛑 LOSS — SL HIT"
  | "🎯 TP HIT → 🛑 SL HIT"
  | "❌ INVALID — SETUP CANCELLED"
  | "⏳ EXPIRED"
  | "IN_PROGRESS";

export interface StructurePoint {
  index: number;
  time: number;
  price: number;
  type: "TOP" | "BOTAM" | "SELL_LQ" | "BUY_LQ" | "REJECTION" | "CHOCH";
  label: string;
}

export interface SetupHistoryRecord {
  setupId: string;
  dateTime: string;
  asset: string;
  timeframe: JugaadTimeframe;
  signalType: "SELL";
  marketRegime: MarketRegimeType;
  entryRange: string;
  actualEntry: number;
  stopLoss: number;
  tp1: number;
  tp2: number;
  tp3: number;
  finalTp: number;
  rrRatio: string;
  score: number;
  status: JugaadStatus;
  result: SetupFinalResult;
  timeToResult?: string;
  closedAt?: number;
  createdAt: number;
  reasons: string[];
  impulseRange: number;
  level26: number;
}

export interface RiskManagementDetails {
  accountBalance: number;
  riskPercent: number;
  riskAmountUSD: number;
  slDistancePoints: number;
  recommendedLotSize: number;
  maxRiskWarning: string;
  pointValueUSD: number;
}

export interface KhatarnakJugaadSetup {
  id: string; // e.g. "KJ-1M-001"
  timeframe: "1M";
  signalType: JugaadSignalType;
  status: JugaadStatus;
  stage: SetupStage;
  statusColor: string;
  hasValidSetup: boolean;
  waitingReason?: string;
  marketRegime: MarketRegimeType;
  marketRegimeLabel: string;

  // 100-Point Quality Score Matrix
  score: number;
  scoreComponents: {
    liquidityDetectionScore: number; // 20 pts (Sell LQ detection & sweep quality)
    confluence26Score: number;       // 20 pts (2.6 Level + Golden Zone 0.62-0.81 alignment)
    structureChochScore: number;     // 15 pts (1M CHOCH / BOS confirmation)
    rejectionScore: number;          // 15 pts (1M upper wick / candle rejection)
    momentumScore: number;           // 10 pts (1M RSI & bearish momentum)
    volumeScore: number;             // 10 pts (1M volume elevation / tick confirmation)
    riskRewardScore: number;         // 10 pts (Minimum 1:2+ R:R ratio check)
  };
  scoreLabel: string;
  funnyLine: string;
  assetKey: string;
  currentPrice: number;

  // Genuine 1M Market Structure & Swings (Top / Botam)
  topHigh: number;              // Swing High "top" formed around the liquidity sweep
  botamLow: number;             // Swing Low "botam" formed after bearish displacement
  impulseRange: number;         // Top - Botam (e.g. 529 in reference image)
  impulsePercent: number;       // Range as % of price
  topIndex: number;
  botamIndex: number;
  structureSequence: StructurePoint[];

  // Dynamic 2.6 Methodology
  calculationFormula: string;   // e.g. "Range 529.16 ÷ 2.6 = 203.52 pts"
  delta26: number;              // Impulse Range / 2.6
  level26: number;              // Top - (Impulse Range / 2.6) (e.g. 54,017.97 in reference image)
  
  // Liquidity Zones
  sellLqHigh: number;           // Sell LQ Zone upper limit
  sellLqLow: number;            // Sell LQ Zone lower limit
  sellLqStatus: "UNTOUCHED" | "SWEPT" | "REJECTED" | "VIOLATED";
  buyLqHigh: number;            // Buy LQ (target/downside)
  buyLqLow: number;
  
  // Golden Zone (0.62 → 0.81 Retracement)
  goldenZone62: number;         // Botam + (0.62 * Impulse Range)
  goldenZone81: number;         // Botam + (0.81 * Impulse Range)

  // Sell Execution Zone & Best Entry
  sellZoneHigh: number;         // Upper boundary of confluence zone
  sellZoneLow: number;          // Lower boundary of confluence zone
  bestSellEntry: number;        // Best entry price inside 2.6 / Golden zone confluence
  entryFormatted: string;       // e.g. "54,018.00 — 54,050.00"

  // Structural SL & Take Profit Targets
  stopLoss: number;             // Top + 1.2 * ATR buffer
  structuralInvalidationPrice: number; // Invalidation ceiling
  tp1: number;                  // 1.5R Target
  tp2: number;                  // 2.5R Target (Opposing Buy LQ / Botam)
  tp3: number;                  // 4.0R Target (Extended Downside Liquidity)
  finalTp: number;              // Same as tp3
  atr: number;

  // Real Risk / Reward & Risk Management
  riskDistance: number;
  rewardTp1Distance: number;
  rewardTp2Distance: number;
  rewardTp3Distance: number;
  rewardFinalTpDistance: number;
  rrRatioString: string;        // e.g. "1:2.8"
  riskManagement: RiskManagementDetails;

  // Live Status Flags
  isRetracedTo26Zone: boolean;
  isRejectionConfirmed: boolean;
  isChochConfirmed: boolean;
  isEntryTriggered: boolean;
  isRunning: boolean;
  isTp1Achieved: boolean;
  isTp2Achieved: boolean;
  isTp3Achieved: boolean;
  isFinalTpAchieved: boolean;
  isSlViolated: boolean;
  isStructurallyInvalidated: boolean;
  isBreakevenMoved: boolean;
  entryActivatedPrice?: number;
  finalResult?: SetupFinalResult;

  timestamp: number;
  generatedAt: string;
  shortReason: string;
  reasons: string[];
}

export const FUNNY_JUGAAD_LINES = [
  "Photo jaisa setup dhoonda, 2.6 calculation lagaya 💀",
  "Sell LQ swept, 2.6 zone hit, institutional sell active 😈",
  "Impulse complete, retracement trapped, 1M CHOCH confirmed 💀",
  "Top to Botam 2.6 math locked: scene ab shuru hoga 😈",
  "Golden Zone + 2.6 confluence: Smart money exit, retail trapped 💀",
  "No chasing: Patience rewarded, 1M sniper entry triggered 😈",
];

let lastPickedIndex = -1;

export function getRandomFunnyLine(): string {
  let idx = Math.floor(Math.random() * FUNNY_JUGAAD_LINES.length);
  if (idx === lastPickedIndex && FUNNY_JUGAAD_LINES.length > 1) {
    idx = (idx + 1) % FUNNY_JUGAAD_LINES.length;
  }
  lastPickedIndex = idx;
  return FUNNY_JUGAAD_LINES[idx];
}

/**
 * Calculate dynamic position size based on balance, risk % and structural SL
 */
export function calculatePositionSize(
  accountBalance: number,
  riskPercent: number,
  slDistancePoints: number,
  assetKey: string = "XAUUSD"
): RiskManagementDetails {
  const safeBalance = Math.max(accountBalance || 10000, 100);
  const safeRiskPct = Math.min(Math.max(riskPercent || 1, 0.25), 5);
  const riskAmountUSD = (safeBalance * safeRiskPct) / 100;
  const safeSlDistance = Math.max(slDistancePoints, 0.2);

  // For Gold (XAUUSD): 1 Lot = 100 oz. 1 Point = $1.00 move per oz = $100 per lot.
  // For Crypto / Index / Forex: normalized multiplier
  const isGold = assetKey.toUpperCase().includes("XAU");
  const isCrypto = assetKey.toUpperCase().includes("BTC") || assetKey.toUpperCase().includes("ETH") || assetKey.toUpperCase().includes("SOL");
  const isIndex = assetKey.toUpperCase().includes("US30") || assetKey.toUpperCase().includes("NAS");
  
  let pointValuePerLot = 100;
  if (isIndex) pointValuePerLot = 1;
  else if (isCrypto) pointValuePerLot = 1;
  else if (!isGold) pointValuePerLot = 10;

  const rawLotSize = riskAmountUSD / (safeSlDistance * pointValuePerLot);
  const recommendedLotSize = Math.max(Math.min(Math.round(rawLotSize * 100) / 100, 100), 0.01);

  let maxRiskWarning = "Normal risk parameters applied (1-2% standard).";
  if (safeRiskPct > 3) {
    maxRiskWarning = "⚠️ HIGH RISK WARNING: Risk exceeds recommended 2% max per trade!";
  } else if (safeSlDistance > 50) {
    maxRiskWarning = "⚠️ WIDE SL WARNING: Reduced lot size due to wide structural swing range!";
  }

  return {
    accountBalance: safeBalance,
    riskPercent: safeRiskPct,
    riskAmountUSD: Math.round(riskAmountUSD * 100) / 100,
    slDistancePoints: Math.round(safeSlDistance * 100) / 100,
    recommendedLotSize,
    maxRiskWarning,
    pointValueUSD: pointValuePerLot,
  };
}

/**
 * 1M Fractal Pivot Detector
 */
function find1MPivots(candles: Candle[], leftBars: number = 3, rightBars: number = 2) {
  const highPivots: { index: number; price: number; candle: Candle }[] = [];
  const lowPivots: { index: number; price: number; candle: Candle }[] = [];

  if (candles.length < leftBars + rightBars + 1) return { highPivots, lowPivots };

  for (let i = leftBars; i < candles.length - rightBars; i++) {
    const cur = candles[i];
    let isHigh = true;
    for (let l = i - leftBars; l <= i + rightBars; l++) {
      if (l !== i && candles[l].high >= cur.high) {
        isHigh = false;
        break;
      }
    }
    let isLow = true;
    for (let l = i - leftBars; l <= i + rightBars; l++) {
      if (l !== i && candles[l].low <= cur.low) {
        isLow = false;
        break;
      }
    }
    if (isHigh) highPivots.push({ index: i, price: cur.high, candle: cur });
    if (isLow) lowPivots.push({ index: i, price: cur.low, candle: cur });
  }

  return { highPivots, lowPivots };
}

/**
 * Calculate 14-period RSI
 */
function calculate1MRSI(candles: Candle[]): number {
  if (!candles || candles.length < 15) return 50;
  let gains = 0;
  let losses = 0;
  for (let i = candles.length - 14; i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }
  const avgGain = gains / 14;
  const avgLoss = losses / 14;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return Math.round((100 - 100 / (1 + rs)) * 10) / 10;
}

/**
 * Calculate 1M Average True Range (ATR)
 */
function calculate1MATR(candles: Candle[]): number {
  if (!candles || candles.length < 5) return 2.0;
  const period = Math.min(14, candles.length - 1);
  let trSum = 0;
  for (let i = candles.length - period; i < candles.length; i++) {
    const tr = Math.max(
      candles[i].high - candles[i].low,
      Math.abs(candles[i].high - candles[i - 1].close),
      Math.abs(candles[i].low - candles[i - 1].close)
    );
    trSum += tr;
  }
  return Math.max(trSum / period, 0.2);
}

/**
 * Classify Market Regime on 1M
 */
export function classifyMarketRegime(candles: Candle[]): {
  regime: MarketRegimeType;
  regimeLabel: string;
  atr: number;
  isExcessiveVolatility: boolean;
} {
  const atr = calculate1MATR(candles);
  if (!candles || candles.length < 20) {
    return {
      regime: "RANGING_SIDEWAYS",
      regimeLabel: "↔️ RANGING / SIDEWAYS",
      atr,
      isExcessiveVolatility: false,
    };
  }

  const last20 = candles.slice(-20);
  const netChange = last20[last20.length - 1].close - last20[0].open;
  const totalRange = Math.max(...last20.map((c) => c.high)) - Math.min(...last20.map((c) => c.low));

  let regime: MarketRegimeType = "RANGING_SIDEWAYS";
  let regimeLabel = "↔️ RANGING / SIDEWAYS";

  if (netChange < -atr * 4) {
    regime = "STRONG_BEARISH";
    regimeLabel = "📉 STRONG BEARISH FLOW";
  } else if (netChange > atr * 4) {
    regime = "STRONG_BULLISH";
    regimeLabel = "📈 STRONG BULLISH FLOW";
  } else if (totalRange > atr * 10) {
    regime = "HIGH_VOLATILITY";
    regimeLabel = "⚡ HIGH VOLATILITY EXPANSION";
  }

  return {
    regime,
    regimeLabel,
    atr,
    isExcessiveVolatility: atr > 15,
  };
}

/**
 * 💀 MAIN KHATARNAK JUGAAD 1M INSTITUTIONAL 2.6 SELL ENGINE
 *
 * Implements the full institutional sequence:
 * Sell Liquidity (Sell LQ) → Liquidity Sweep → Bearish Impulse → Swing High (Top) & Swing Low (Botam)
 * → 2.6 Dynamic Calculation (Range ÷ 2.6) → Golden Zone (0.62-0.81) Confluence → Retracement Wait
 * → 1M Rejection & CHOCH/BOS Confirmation → Dynamic SL/TP → 80+ Quality Score → 💀 SELL ONLY
 */
export function calculateKhatarnakJugaadSetup(
  candles: Candle[],
  currentPrice: number,
  timeframe: JugaadTimeframe = "1M",
  existingSetup: KhatarnakJugaadSetup | null = null,
  accountBalance: number = 10000,
  riskPercent: number = 1.0,
  assetKey: string = "XAUUSD"
): KhatarnakJugaadSetup {
  const atr = calculate1MATR(candles);
  const rsi = calculate1MRSI(candles);
  const { regime, regimeLabel } = classifyMarketRegime(candles);

  const fallbackResult: KhatarnakJugaadSetup = {
    id: `KJ-1M-${Date.now().toString().slice(-4)}`,
    timeframe: "1M",
    signalType: "WAIT",
    status: "NO VALID SETUP",
    stage: "SEARCHING_LIQUIDITY",
    statusColor: "text-zinc-500",
    hasValidSetup: false,
    waitingReason: "Searching for 1M Sell Liquidity sweep and valid Top/Botam 2.6 displacement...",
    marketRegime: regime,
    marketRegimeLabel: regimeLabel,
    score: 0,
    scoreComponents: {
      liquidityDetectionScore: 0,
      confluence26Score: 0,
      structureChochScore: 0,
      rejectionScore: 0,
      momentumScore: 0,
      volumeScore: 0,
      riskRewardScore: 0,
    },
    scoreLabel: "NO SETUP (0/100)",
    funnyLine: "Market dekh rahe hain, jugaad banne do 💀",
    assetKey,
    currentPrice,
    topHigh: currentPrice + atr * 2,
    botamLow: currentPrice - atr * 2,
    impulseRange: atr * 4,
    impulsePercent: 0,
    topIndex: 0,
    botamIndex: 0,
    structureSequence: [],
    calculationFormula: `Range 0 ÷ 2.6 = 0.00`,
    delta26: 0,
    level26: currentPrice,
    sellLqHigh: currentPrice + atr * 3,
    sellLqLow: currentPrice + atr * 2,
    sellLqStatus: "UNTOUCHED",
    buyLqHigh: currentPrice - atr * 2,
    buyLqLow: currentPrice - atr * 3,
    goldenZone62: currentPrice,
    goldenZone81: currentPrice,
    sellZoneHigh: currentPrice + atr,
    sellZoneLow: currentPrice,
    bestSellEntry: currentPrice,
    entryFormatted: "WAITING",
    stopLoss: currentPrice + atr * 2,
    structuralInvalidationPrice: currentPrice + atr * 3,
    tp1: currentPrice - atr * 2,
    tp2: currentPrice - atr * 3.5,
    tp3: currentPrice - atr * 5,
    finalTp: currentPrice - atr * 5,
    atr,
    riskDistance: atr * 2,
    rewardTp1Distance: atr * 2,
    rewardTp2Distance: atr * 3.5,
    rewardTp3Distance: atr * 5,
    rewardFinalTpDistance: atr * 5,
    rrRatioString: "1:0.0",
    riskManagement: calculatePositionSize(accountBalance, riskPercent, atr * 2, assetKey),
    isRetracedTo26Zone: false,
    isRejectionConfirmed: false,
    isChochConfirmed: false,
    isEntryTriggered: false,
    isRunning: false,
    isTp1Achieved: false,
    isTp2Achieved: false,
    isTp3Achieved: false,
    isFinalTpAchieved: false,
    isSlViolated: false,
    isStructurallyInvalidated: false,
    isBreakevenMoved: false,
    timestamp: Date.now(),
    generatedAt: new Date().toLocaleTimeString(),
    shortReason: "Waiting for valid 1M institutional liquidity sweep",
    reasons: ["No confirmed Sell Liquidity sweep with 2.6 retracement on 1M chart"],
  };

  if (!candles || candles.length < 25) {
    return fallbackResult;
  }

  // 1. Automatic 1M Pivots & Swing Extremes Detection
  const { highPivots, lowPivots } = find1MPivots(candles, 3, 2);

  // Lookback window for primary structure (last 20 to 60 1M candles)
  const windowCandles = candles.slice(-50);
  const lookbackStartIdx = Math.max(0, candles.length - 50);

  // Detect Sell Liquidity (Sell LQ) Zone: cluster of recent swing highs
  const recentHighs = highPivots.filter((p) => p.index >= lookbackStartIdx);
  const recentLows = lowPivots.filter((p) => p.index >= lookbackStartIdx);

  // Find the highest swing high in the structural window -> Candidate for "TOP"
  let topCandle = windowCandles[0];
  let topIndexInFull = lookbackStartIdx;

  for (let i = 0; i < windowCandles.length - 3; i++) {
    const c = windowCandles[i];
    if (c.high >= topCandle.high) {
      topCandle = c;
      topIndexInFull = lookbackStartIdx + i;
    }
  }

  const topHigh = topCandle.high;

  // Find Sell LQ Zone around previous highs before the top sweep
  const priorHighs = recentHighs.filter((p) => p.index < topIndexInFull);
  const sellLqRef = priorHighs.length > 0 ? Math.max(...priorHighs.map((p) => p.price)) : topHigh - atr * 0.5;
  const sellLqLow = sellLqRef - atr * 0.4;
  const sellLqHigh = sellLqRef + atr * 0.4;

  // Verify Liquidity Sweep: Top pierced above sellLqLow/sellLqHigh, then rejected
  const didSweepSellLq = topHigh >= sellLqLow;

  // Find lowest low AFTER the top -> Candidate for "BOTAM" (after bearish displacement)
  const afterTopCandles = candles.slice(topIndexInFull + 1);
  if (afterTopCandles.length < 3) {
    // Top is too recent, not enough displacement yet
    const curSetup = fallbackResult;
    curSetup.waitingReason = "Top swing formed; waiting for 1M bearish displacement & botam low...";
    curSetup.topHigh = topHigh;
    curSetup.topIndex = topIndexInFull;
    return curSetup;
  }

  let botamCandle = afterTopCandles[0];
  let botamRelativeIdx = 0;
  for (let i = 0; i < afterTopCandles.length; i++) {
    const c = afterTopCandles[i];
    if (c.low <= botamCandle.low) {
      botamCandle = c;
      botamRelativeIdx = i;
    }
  }

  const botamLow = botamCandle.low;
  const botamIndexInFull = topIndexInFull + 1 + botamRelativeIdx;
  const impulseRange = Math.max(topHigh - botamLow, atr * 1.5);
  const impulsePercent = (impulseRange / topHigh) * 100;

  // Minimum required displacement to form a legitimate impulse (at least 2.5x ATR)
  const isImpulseSufficient = impulseRange >= atr * 2.5;

  // 2. DYNAMIC 2.6 CALCULATION (Exactly as in Reference Image)
  // Impulse Range = topHigh - botamLow
  // Delta 2.6 = Impulse Range / 2.6
  // Level 2.6 = topHigh - Delta 2.6 = botamLow + (Impulse Range * (1 - 1/2.6)) = botamLow + 0.6154 * Impulse Range
  const delta26 = impulseRange / 2.6;
  const level26 = topHigh - delta26;
  const calculationFormula = `Range ${impulseRange.toFixed(2)} ÷ 2.6 = ${delta26.toFixed(2)} pts → Level @ ${level26.toFixed(2)}`;

  // 3. Golden Zone (0.62 → 0.81) Confluence Area
  const goldenZone62 = botamLow + impulseRange * 0.62;
  const goldenZone81 = botamLow + impulseRange * 0.81;

  // Dynamic Sell Confluence Zone
  const sellZoneLow = Math.min(level26 - atr * 0.3, goldenZone62);
  const sellZoneHigh = Math.max(level26 + atr * 0.4, goldenZone81, sellLqHigh);
  const bestSellEntry = level26; // Golden confluence center

  // Buy LQ (Downside Target)
  const buyLqLow = botamLow - atr * 0.5;
  const buyLqHigh = botamLow;

  // 4. Retracement Monitoring (Candles after botamLow)
  const retracementCandles = candles.slice(botamIndexInFull + 1);
  const maxRetracementPrice = retracementCandles.length > 0
    ? Math.max(...retracementCandles.map((c) => c.high), currentPrice)
    : currentPrice;

  // Check if price reached the 2.6 / Golden Zone
  const isRetracedTo26Zone = maxRetracementPrice >= sellZoneLow;

  // Check 1M Rejection in Zone
  let isRejectionConfirmed = false;
  let isChochConfirmed = false;

  if (retracementCandles.length > 0) {
    for (let i = 0; i < retracementCandles.length; i++) {
      const c = retracementCandles[i];
      const upperWick = c.high - Math.max(c.open, c.close);
      const body = Math.abs(c.close - c.open);
      const lowerWick = Math.min(c.open, c.close) - c.low;

      // Pinbar or strong upper rejection in/near sell zone
      if (c.high >= sellZoneLow && upperWick >= body * 1.3 && upperWick >= lowerWick) {
        isRejectionConfirmed = true;
      }
      // Bearish engulfing in zone
      if (i > 0 && c.close < c.open && c.close < retracementCandles[i - 1].low && c.high >= sellZoneLow) {
        isRejectionConfirmed = true;
      }
      // Micro CHOCH: breaking below previous retracement candle's low with a red close
      if (i >= 2 && c.close < retracementCandles[i - 1].low && retracementCandles[i - 1].close < retracementCandles[i - 1].open) {
        isChochConfirmed = true;
      }
    }
  }

  // If current candle itself is rejecting
  const latestCandle = candles[candles.length - 1];
  const latestUpperWick = latestCandle.high - Math.max(latestCandle.open, latestCandle.close);
  const latestBody = Math.abs(latestCandle.close - latestCandle.open);
  if (latestCandle.high >= sellZoneLow && latestUpperWick >= latestBody) {
    isRejectionConfirmed = true;
  }

  // Invalidation: Price closed strongly ABOVE topHigh + buffer
  const invalidationCeiling = topHigh + atr * 0.8;
  const isStructurallyInvalidated = currentPrice > invalidationCeiling || maxRetracementPrice > invalidationCeiling;

  // 5. Dynamic SL & TP Targets
  const stopLoss = Math.round((topHigh + atr * 1.2) * 100) / 100;
  const riskDistance = Math.max(stopLoss - bestSellEntry, atr * 1.2);

  // Targets (SELL):
  const tp1 = Math.round((bestSellEntry - riskDistance * 1.5) * 100) / 100;
  const tp2 = Math.round((bestSellEntry - riskDistance * 2.5) * 100) / 100; // Aligns with botamLow / Buy LQ
  const tp3 = Math.round((bestSellEntry - riskDistance * 4.0) * 100) / 100; // Extended institutional runner
  const finalTp = tp3;

  const rewardTp1Distance = bestSellEntry - tp1;
  const rewardTp2Distance = bestSellEntry - tp2;
  const rewardTp3Distance = bestSellEntry - tp3;
  const rawRR = riskDistance > 0 ? (rewardTp2Distance / riskDistance).toFixed(1) : "0.0";
  const rrRatioString = `1:${rawRR}`;

  // 6. 100-Point Quality Score Calculation
  // ----------------------------------------------------
  // Score:
  // * Liquidity Detection / Sell LQ = 20 pts
  // * 2.6 Confluence = 20 pts
  // * Structure / BOS / CHOCH = 15 pts
  // * Rejection Confirmation = 15 pts
  // * Momentum = 10 pts
  // * Volume = 10 pts
  // * Risk/Reward = 10 pts
  // ----------------------------------------------------
  let liquidityScore = 0;
  if (didSweepSellLq) liquidityScore += 12;
  if (priorHighs.length >= 2) liquidityScore += 8; // Equal Highs (EQH) sweep confluence
  else if (priorHighs.length >= 1) liquidityScore += 5;

  let confluenceScore = 0;
  if (isImpulseSufficient) confluenceScore += 10;
  // Check if 2.6 level sits cleanly within 0.60-0.75 zone
  const level26Ratio = (level26 - botamLow) / impulseRange;
  if (level26Ratio >= 0.58 && level26Ratio <= 0.65) confluenceScore += 10;
  else if (level26Ratio >= 0.50 && level26Ratio <= 0.70) confluenceScore += 6;

  let structureScore = 0;
  if (isChochConfirmed) structureScore += 15;
  else if (retracementCandles.length >= 2) structureScore += 8;

  let rejectionScore = 0;
  if (isRejectionConfirmed) rejectionScore += 15;
  else if (currentPrice <= sellZoneHigh && currentPrice >= sellZoneLow) rejectionScore += 7;

  let momentumScore = 0;
  if (rsi <= 58 && rsi >= 40) momentumScore += 10; // Momentum exhausted & turning down
  else if (rsi > 58) momentumScore += 6; // Still hot, but in rejection zone
  else momentumScore += 4;

  let volumeScore = 0;
  const avgVol = windowCandles.reduce((s, c) => s + (c.volume || 100), 0) / windowCandles.length;
  const sweepVol = topCandle.volume || 100;
  if (sweepVol >= avgVol * 1.3) volumeScore += 10;
  else if (sweepVol >= avgVol) volumeScore += 7;
  else volumeScore += 5;

  let rrScore = 0;
  const numericRR = parseFloat(rawRR);
  if (numericRR >= 2.5) rrScore += 10;
  else if (numericRR >= 2.0) rrScore += 8;
  else if (numericRR >= 1.5) rrScore += 5;

  const totalScore = Math.min(
    100,
    liquidityScore + confluenceScore + structureScore + rejectionScore + momentumScore + volumeScore + rrScore
  );

  let scoreLabel = `HIGH CONFIDENCE (${totalScore}/100)`;
  if (totalScore < 70) scoreLabel = `SEARCHING / WAIT (${totalScore}/100)`;
  else if (totalScore < 80) scoreLabel = `WAIT FOR CONFIRMATION (${totalScore}/100)`;

  // 7. Decision & Lifecycle Progression
  let stage: SetupStage = "SEARCHING_LIQUIDITY";
  let status: JugaadStatus = "NO VALID SETUP";
  let statusColor = "text-zinc-500";
  let signalType: JugaadSignalType = "WAIT";
  let hasValidSetup = false;
  let waitingReason = "";

  // Preserved active states from existing setup if currently running
  let isRunning = existingSetup?.isRunning || false;
  let isEntryTriggered = existingSetup?.isEntryTriggered || false;
  let isTp1Achieved = existingSetup?.isTp1Achieved || false;
  let isTp2Achieved = existingSetup?.isTp2Achieved || false;
  let isTp3Achieved = existingSetup?.isTp3Achieved || false;
  let isFinalTpAchieved = existingSetup?.isFinalTpAchieved || false;
  let isSlViolated = existingSetup?.isSlViolated || false;
  let isBreakevenMoved = existingSetup?.isBreakevenMoved || false;
  let entryActivatedPrice = existingSetup?.entryActivatedPrice;
  let finalResult = existingSetup?.finalResult;

  if (isStructurallyInvalidated) {
    status = "❌ INVALIDATED";
    statusColor = "text-red-500";
    stage = "COMPLETED";
    finalResult = "❌ INVALID — SETUP CANCELLED";
    waitingReason = "Price broke above Sell LQ invalidation ceiling. Setup cancelled.";
  } else if (isRunning || isEntryTriggered) {
    stage = "ACTIVE_SELL_TRADE";
    signalType = "SELL";
    hasValidSetup = true;

    // Check TP/SL hits against real current price
    if (currentPrice >= stopLoss) {
      status = "🛑 SL HIT";
      statusColor = "text-rose-500";
      isSlViolated = true;
      isRunning = false;
      stage = "COMPLETED";
      finalResult = isTp1Achieved ? "🎯 TP HIT → 🛑 SL HIT" : "🛑 LOSS — SL HIT";
    } else if (currentPrice <= tp3) {
      status = "🏆 FINAL TP HIT";
      statusColor = "text-emerald-400";
      isFinalTpAchieved = true;
      isTp3Achieved = true;
      isTp2Achieved = true;
      isTp1Achieved = true;
      isRunning = false;
      stage = "COMPLETED";
      finalResult = "🏆 WIN — FINAL TP HIT";
    } else if (currentPrice <= tp2) {
      status = "🎯 TP2 HIT";
      statusColor = "text-emerald-400";
      isTp2Achieved = true;
      isTp1Achieved = true;
      isBreakevenMoved = true;
    } else if (currentPrice <= tp1) {
      status = "🎯 TP1 HIT";
      statusColor = "text-emerald-400";
      isTp1Achieved = true;
      isBreakevenMoved = true;
    } else {
      status = "RUNNING";
      statusColor = "text-cyan-400";
    }
  } else if (!isImpulseSufficient || !didSweepSellLq) {
    stage = "SEARCHING_LIQUIDITY";
    status = "NO VALID SETUP";
    statusColor = "text-zinc-500";
    waitingReason = "Waiting for strong 1M Sell Liquidity sweep & bearish displacement...";
  } else if (!isRetracedTo26Zone) {
    stage = "WAITING_RETRACEMENT";
    status = "WAITING FOR RETRACEMENT";
    statusColor = "text-amber-400";
    waitingReason = `Displacement formed (${impulseRange.toFixed(1)} pts). Waiting for price to retrace to 2.6 Zone (${level26.toFixed(2)})...`;
    hasValidSetup = true;
  } else if (totalScore < 80 || (!isRejectionConfirmed && !isChochConfirmed)) {
    stage = "IN_2_6_ZONE";
    status = "IN 2.6 CONFLUENCE ZONE";
    statusColor = "text-indigo-400";
    waitingReason = `Inside 2.6 Sell Zone. Waiting for 1M Upper-Wick Rejection or Bearish CHOCH confirmation (Score: ${totalScore}/100)...`;
    hasValidSetup = true;
  } else {
    // 💀 HIGH CONFIDENCE 80+ 1M INSTITUTIONAL 2.6 SELL TRIGGERED
    stage = "ACTIVE_SELL_TRADE";
    status = "ENTRY TRIGGERED";
    statusColor = "text-emerald-400";
    signalType = "SELL";
    hasValidSetup = true;
    isEntryTriggered = true;
    isRunning = true;
    entryActivatedPrice = currentPrice;
  }

  // Structure points for visual chart mapping
  const structureSequence: StructurePoint[] = [
    { index: topIndexInFull, time: topCandle.time, price: topHigh, type: "TOP", label: "Top (Sweep High)" },
    { index: botamIndexInFull, time: botamCandle.time, price: botamLow, type: "BOTAM", label: "Botam (Displacement Low)" },
    { index: botamIndexInFull + 1, time: Date.now(), price: level26, type: "REJECTION", label: "2.6 Retracement Level" },
    { index: 0, time: 0, price: sellLqHigh, type: "SELL_LQ", label: "Sell LQ" },
    { index: 0, time: 0, price: buyLqLow, type: "BUY_LQ", label: "Buy LQ" },
  ];

  const reasons = [
    `Sell Liquidity sweep @ ${topHigh.toFixed(2)} followed by ${impulseRange.toFixed(2)} pts displacement to ${botamLow.toFixed(2)}`,
    `2.6 Institutional Calculation: ${impulseRange.toFixed(2)} ÷ 2.6 = ${delta26.toFixed(2)} pts → Level ${level26.toFixed(2)}`,
    `0.62–0.81 Golden Zone Confluence (${goldenZone62.toFixed(2)} — ${goldenZone81.toFixed(2)})`,
    isRejectionConfirmed ? "1M Upper-wick rejection confirmed in 2.6 supply zone" : "Waiting for 1M rejection wick",
    isChochConfirmed ? "1M Bearish CHOCH / Structure break confirmed" : "1M CHOCH pending",
    `Quality Score: ${totalScore}/100 • R:R: ${rrRatioString}`,
  ];

  const riskManagement = calculatePositionSize(accountBalance, riskPercent, riskDistance, assetKey);

  return {
    id: existingSetup?.id || `KJ-1M-${Date.now().toString().slice(-4)}`,
    timeframe: "1M",
    signalType,
    status,
    stage,
    statusColor,
    hasValidSetup,
    waitingReason,
    marketRegime: regime,
    marketRegimeLabel: regimeLabel,
    score: totalScore,
    scoreComponents: {
      liquidityDetectionScore: liquidityScore,
      confluence26Score: confluenceScore,
      structureChochScore: structureScore,
      rejectionScore: rejectionScore,
      momentumScore: momentumScore,
      volumeScore: volumeScore,
      riskRewardScore: rrScore,
    },
    scoreLabel,
    funnyLine: getRandomFunnyLine(),
    assetKey,
    currentPrice,
    topHigh,
    botamLow,
    impulseRange,
    impulsePercent,
    topIndex: topIndexInFull,
    botamIndex: botamIndexInFull,
    structureSequence,
    calculationFormula,
    delta26,
    level26,
    sellLqHigh,
    sellLqLow,
    sellLqStatus: didSweepSellLq ? "SWEPT" : "UNTOUCHED",
    buyLqHigh,
    buyLqLow,
    goldenZone62,
    goldenZone81,
    sellZoneHigh,
    sellZoneLow,
    bestSellEntry,
    entryFormatted: `${sellZoneLow.toFixed(2)} — ${sellZoneHigh.toFixed(2)}`,
    stopLoss,
    structuralInvalidationPrice: invalidationCeiling,
    tp1,
    tp2,
    tp3,
    finalTp,
    atr,
    riskDistance,
    rewardTp1Distance,
    rewardTp2Distance,
    rewardTp3Distance,
    rewardFinalTpDistance: rewardTp3Distance,
    rrRatioString,
    riskManagement,
    isRetracedTo26Zone,
    isRejectionConfirmed,
    isChochConfirmed,
    isEntryTriggered,
    isRunning,
    isTp1Achieved,
    isTp2Achieved,
    isTp3Achieved,
    isFinalTpAchieved,
    isSlViolated,
    isStructurallyInvalidated,
    isBreakevenMoved,
    entryActivatedPrice,
    finalResult,
    timestamp: Date.now(),
    generatedAt: new Date().toLocaleTimeString(),
    shortReason: `1M 2.6 SELL Confluence @ ${level26.toFixed(2)} (Score ${totalScore}/100)`,
    reasons,
  };
}

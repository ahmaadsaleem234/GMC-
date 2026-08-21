import { Candle } from "../types";

export type JugaadTimeframe = "15M" | "5M";

export type JugaadSignalType = "BUY" | "SELL" | "WAIT";

export type JugaadStatus =
  | "WAITING"
  | "ENTRY HIT"
  | "RUNNING"
  | "🎯 TP1 HIT"
  | "🎯 TP2 HIT"
  | "🎯 TP3 HIT"
  | "🏆 FINAL TP HIT"
  | "🛑 SL HIT"
  | "❌ INVALIDATED"
  | "⏳ EXPIRED"
  | "NO VALID SETUP";

export type MarketRegimeType =
  | "STRONG_BULLISH"
  | "STRONG_BEARISH"
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
  type: "HH" | "HL" | "LH" | "LL" | "PEAK" | "TROUGH";
  label: string;
}

export interface SetupHistoryRecord {
  setupId: string;
  dateTime: string;
  asset: string;
  timeframe: JugaadTimeframe;
  signalType: "BUY" | "SELL";
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
  id: string; // e.g. "KJ-15M-001"
  timeframe: JugaadTimeframe;
  signalType: JugaadSignalType;
  status: JugaadStatus;
  statusColor: string;
  hasValidSetup: boolean;
  waitingReason?: string;
  marketRegime: MarketRegimeType;
  marketRegimeLabel: string;

  // Real 0 - 100 Score Components (Calculated from Real Data)
  score: number;
  scoreComponents: {
    structureScore: number; // 25% max
    fibAlignmentScore: number; // 25% max
    entryZoneReactionScore: number; // 20% max
    momentumScore: number; // 15% max
    riskRewardScore: number; // 15% max
  };
  scoreLabel: string;
  funnyLine: string;
  assetKey: string;
  currentPrice: number;

  // Genuine Market Structure points
  swingHigh: number;
  swingLow: number;
  swingRange: number;
  structureSequence: StructurePoint[];
  structureType: "BULLISH_CONTINUATION" | "BEARISH_CONTINUATION" | "RANGE_CONSOLIDATION";

  // Fibonacci 2.6 Methodology Levels (0, 0.62, 0.81, 1.38, 1.65, 2.00, 2.20, 2.60)
  fib0: number; // 0.00 Base
  fib1: number; // 1.00 Impulse peak
  entry1Golden: number; // 0.62 Golden Zone
  entry2Green: number; // 0.81 Green Zone
  entryFormatted: string; // "4508.49 — 4503.54"
  stopLoss: number; // Structural level +- $1 safety distance
  structuralInvalidationPrice: number;
  tp1: number; // 1.38 Target
  tp2: number; // 1.65 Target
  tp3: number; // 2.00 Target
  tp4Final: number; // 2.20 Final Target
  fib260: number; // 2.60 Boundary

  // Real Risk / Reward & Risk Management
  riskDistance: number;
  rewardTp1Distance: number;
  rewardTp2Distance: number;
  rewardTp3Distance: number;
  rewardFinalTpDistance: number;
  rrRatioString: string; // e.g. "1:3.4"
  riskManagement: RiskManagementDetails;

  // Status progression flags
  isGoldenZoneTouched: boolean;
  isGreenZoneTouched: boolean;
  isEntryTriggered: boolean;
  isRunning: boolean;
  isTp1Achieved: boolean;
  isTp2Achieved: boolean;
  isTp3Achieved: boolean;
  isFinalTpAchieved: boolean;
  isSlViolated: boolean;
  isStructurallyInvalidated: boolean;
  entryActivatedPrice?: number;
  finalResult?: SetupFinalResult;

  timestamp: number;
  generatedAt: string;
  shortReason: string;
  reasons: string[];
}

export const FUNNY_JUGAAD_LINES = [
  "Jugaad chala, scene bana 💀",
  "Zone touch, kaam khatam 😈",
  "Jugaad lagao, profit uthao 💀",
  "Zone aya? Ab scene dekho.",
  "Plan simple, execution dangerous 💀",
  "Market ne zone diya, jugaad ne kaam kiya.",
  "Entry mili? Ab tamasha dekho 😈",
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
  const safeSlDistance = Math.max(slDistancePoints, 0.5);

  // For Gold (XAUUSD): 1 Lot = 100 oz. 1 Point = $1.00 move per oz = $100 per lot.
  // Hence 1 standard lot = $100 per dollar move.
  const pointValuePerLot = assetKey.toUpperCase().includes("XAU") ? 100 : 10;
  const rawLotSize = riskAmountUSD / (safeSlDistance * pointValuePerLot);
  const recommendedLotSize = Math.max(Math.min(Math.round(rawLotSize * 100) / 100, 50), 0.01);

  let maxRiskWarning = "Normal risk parameters applied (1-2% standard).";
  if (safeRiskPct > 3) {
    maxRiskWarning = "⚠️ HIGH RISK WARNING: Risk exceeds recommended 2% max per trade!";
  } else if (safeSlDistance > 20) {
    maxRiskWarning = "⚠️ WIDE SL WARNING: Adjust lot size down due to wide structural swing!";
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
 * Identify genuine market structure swings without fixed candle constraints.
 * 15M: Multi-bar swing fractal detection (4 left / 3 right).
 * 5M: Extra noise-filtering lookback (6 left / 4 right) to strictly eliminate micro-chop.
 */
function findPivots(candles: Candle[], leftBars: number, rightBars: number) {
  const highPivots: { index: number; candle: Candle }[] = [];
  const lowPivots: { index: number; candle: Candle }[] = [];

  if (candles.length < leftBars + rightBars + 1) return { highPivots, lowPivots };

  for (let i = leftBars; i < candles.length - rightBars; i++) {
    const currentHigh = candles[i].high;
    const currentLow = candles[i].low;

    let isHigh = true;
    for (let l = i - leftBars; l <= i + rightBars; l++) {
      if (l !== i && candles[l].high >= currentHigh) {
        isHigh = false;
        break;
      }
    }

    let isLow = true;
    for (let l = i - leftBars; l <= i + rightBars; l++) {
      if (l !== i && candles[l].low <= currentLow) {
        isLow = false;
        break;
      }
    }

    if (isHigh) {
      highPivots.push({ index: i, candle: candles[i] });
    }
    if (isLow) {
      lowPivots.push({ index: i, candle: candles[i] });
    }
  }

  return { highPivots, lowPivots };
}

/**
 * Classify Market Regime:
 * 📈 STRONG BULLISH
 * 📉 STRONG BEARISH
 * ↔️ RANGING / SIDEWAYS
 * ⚠️ HIGH VOLATILITY
 */
export function classifyMarketRegime(candles: Candle[]): {
  regime: MarketRegimeType;
  regimeLabel: string;
  atr: number;
  isExcessiveVolatility: boolean;
  isChoppy: boolean;
} {
  if (!candles || candles.length < 20) {
    return {
      regime: "RANGING_SIDEWAYS",
      regimeLabel: "↔️ RANGING / SIDEWAYS",
      atr: 2.0,
      isExcessiveVolatility: false,
      isChoppy: true,
    };
  }

  // 1. Calculate Real ATR across last 14 candles
  let atrSum = 0;
  const atrPeriod = Math.min(14, candles.length - 1);
  for (let i = candles.length - atrPeriod; i < candles.length; i++) {
    const tr = Math.max(
      candles[i].high - candles[i].low,
      Math.abs(candles[i].high - candles[i - 1].close),
      Math.abs(candles[i].low - candles[i - 1].close)
    );
    atrSum += tr;
  }
  const atr = Math.max(atrSum / atrPeriod, 0.5);

  // Baseline ATR across older 30 candles to measure volatility surge
  let baseAtrSum = 0;
  const basePeriod = Math.min(30, candles.length - 1);
  for (let i = candles.length - basePeriod; i < candles.length; i++) {
    const tr = Math.max(
      candles[i].high - candles[i].low,
      Math.abs(candles[i].high - candles[i - 1].close),
      Math.abs(candles[i].low - candles[i - 1].close)
    );
    baseAtrSum += tr;
  }
  const baseAtr = Math.max(baseAtrSum / basePeriod, 0.5);

  // Check for abnormal volatility (e.g. news candle spikes > 2.8x normal ATR)
  const isExcessiveVolatility = atr > baseAtr * 2.8;

  // Trend detection using EMA 9 and EMA 21 on real closes
  const closes = candles.map((c) => c.close);
  const ema9 = calculateEMA(closes, 9);
  const ema21 = calculateEMA(closes, 21);

  const lastClose = closes[closes.length - 1];
  const lastEma9 = ema9[ema9.length - 1];
  const lastEma21 = ema21[ema21.length - 1];

  const diffPct = Math.abs(lastEma9 - lastEma21) / lastClose;

  if (isExcessiveVolatility) {
    return {
      regime: "HIGH_VOLATILITY",
      regimeLabel: "⚠️ HIGH VOLATILITY — WAIT FOR MARKET STABILITY",
      atr,
      isExcessiveVolatility: true,
      isChoppy: false,
    };
  }

  if (lastEma9 > lastEma21 && diffPct > 0.0008 && lastClose > lastEma9) {
    return {
      regime: "STRONG_BULLISH",
      regimeLabel: "📈 STRONG BULLISH",
      atr,
      isExcessiveVolatility: false,
      isChoppy: false,
    };
  }

  if (lastEma9 < lastEma21 && diffPct > 0.0008 && lastClose < lastEma9) {
    return {
      regime: "STRONG_BEARISH",
      regimeLabel: "📉 STRONG BEARISH",
      atr,
      isExcessiveVolatility: false,
      isChoppy: false,
    };
  }

  return {
    regime: "RANGING_SIDEWAYS",
    regimeLabel: "↔️ RANGING / SIDEWAYS",
    atr,
    isExcessiveVolatility: false,
    isChoppy: true,
  };
}

function calculateEMA(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const emaArray: number[] = [];
  let ema = values[0];
  for (let i = 0; i < values.length; i++) {
    ema = values[i] * k + ema * (1 - k);
    emaArray.push(ema);
  }
  return emaArray;
}

/**
 * Analyze genuine market structure for Higher Highs (HH), Higher Lows (HL),
 * Lower Highs (LH), Lower Lows (LL).
 */
export function analyzeMarketStructure(
  candles: Candle[],
  timeframe: JugaadTimeframe
): {
  structureType: "BULLISH_CONTINUATION" | "BEARISH_CONTINUATION" | "RANGE_CONSOLIDATION";
  structurePoints: StructurePoint[];
  confirmedSwingHigh: number;
  confirmedSwingLow: number;
  lastStructureHigh: number;
  lastStructureLow: number;
  structureClarityScore: number;
  hasConfirmedStructure: boolean;
  atr: number;
} {
  if (!candles || candles.length < 25) {
    return {
      structureType: "RANGE_CONSOLIDATION",
      structurePoints: [],
      confirmedSwingHigh: 0,
      confirmedSwingLow: 0,
      lastStructureHigh: 0,
      lastStructureLow: 0,
      structureClarityScore: 40,
      hasConfirmedStructure: false,
      atr: 2.0,
    };
  }

  const regimeInfo = classifyMarketRegime(candles);
  const atr = regimeInfo.atr;

  // 15M: standard 4/3 pivot; 5M: higher 6/4 lookback to strictly eliminate noise
  const leftBars = timeframe === "5M" ? 6 : 4;
  const rightBars = timeframe === "5M" ? 4 : 3;

  const { highPivots, lowPivots } = findPivots(candles, leftBars, rightBars);

  interface PivotItem {
    index: number;
    time: number;
    price: number;
    isHigh: boolean;
  }

  const allPivots: PivotItem[] = [
    ...highPivots.map((p) => ({ index: p.index, time: p.candle.time, price: p.candle.high, isHigh: true })),
    ...lowPivots.map((p) => ({ index: p.index, time: p.candle.time, price: p.candle.low, isHigh: false })),
  ].sort((a, b) => a.index - b.index);

  // Filter consecutive highs/lows keeping the most extreme
  const filteredPivots: PivotItem[] = [];
  for (const p of allPivots) {
    if (filteredPivots.length === 0) {
      filteredPivots.push(p);
      continue;
    }
    const last = filteredPivots[filteredPivots.length - 1];
    if (last.isHigh === p.isHigh) {
      if (p.isHigh && p.price > last.price) {
        filteredPivots[filteredPivots.length - 1] = p;
      } else if (!p.isHigh && p.price < last.price) {
        filteredPivots[filteredPivots.length - 1] = p;
      }
    } else {
      filteredPivots.push(p);
    }
  }

  const structurePoints: StructurePoint[] = [];
  let prevHigh: number | null = null;
  let prevLow: number | null = null;

  for (let i = 0; i < filteredPivots.length; i++) {
    const p = filteredPivots[i];
    if (p.isHigh) {
      let type: StructurePoint["type"] = "PEAK";
      let label = "High";
      if (prevHigh !== null) {
        if (p.price > prevHigh + atr * 0.25) {
          type = "HH";
          label = "HH (Higher High)";
        } else if (p.price < prevHigh - atr * 0.25) {
          type = "LH";
          label = "LH (Lower High)";
        }
      }
      prevHigh = p.price;
      structurePoints.push({ index: p.index, time: p.time, price: p.price, type, label });
    } else {
      let type: StructurePoint["type"] = "TROUGH";
      let label = "Low";
      if (prevLow !== null) {
        if (p.price > prevLow + atr * 0.25) {
          type = "HL";
          label = "HL (Higher Low)";
        } else if (p.price < prevLow - atr * 0.25) {
          type = "LL";
          label = "LL (Lower Low)";
        }
      }
      prevLow = p.price;
      structurePoints.push({ index: p.index, time: p.time, price: p.price, type, label });
    }
  }

  // Look at the confirmed structural points
  const recentPoints = structurePoints.slice(-8);
  const recentHighs = recentPoints.filter((p) => p.type === "HH" || p.type === "LH" || p.type === "PEAK");
  const recentLows = recentPoints.filter((p) => p.type === "HL" || p.type === "LL" || p.type === "TROUGH");

  const lastHigh = recentHighs[recentHighs.length - 1]?.price || candles[candles.length - 1].high;
  const lastLow = recentLows[recentLows.length - 1]?.price || candles[candles.length - 1].low;

  const prevLastHigh = recentHighs[recentHighs.length - 2]?.price || lastHigh;
  const prevLastLow = recentLows[recentLows.length - 2]?.price || lastLow;

  const swingDist = Math.abs(lastHigh - lastLow);
  const minRequiredSwing = timeframe === "15M" ? atr * 1.5 : atr * 1.2;

  // Bullish: confirmed HH and HL with sufficient swing distance
  const isBullish = lastHigh > prevLastHigh && lastLow >= prevLastLow && swingDist >= minRequiredSwing;
  // Bearish: confirmed LH and LL with sufficient swing distance
  const isBearish = lastHigh <= prevLastHigh && lastLow < prevLastLow && swingDist >= minRequiredSwing;

  let structureType: "BULLISH_CONTINUATION" | "BEARISH_CONTINUATION" | "RANGE_CONSOLIDATION" = "RANGE_CONSOLIDATION";
  let structureClarityScore = 55;
  let hasConfirmedStructure = false;

  if (isBullish && !isBearish) {
    structureType = "BULLISH_CONTINUATION";
    structureClarityScore = Math.min(85 + Math.round((swingDist / (atr * 2)) * 10), 98);
    hasConfirmedStructure = true;
  } else if (isBearish && !isBullish) {
    structureType = "BEARISH_CONTINUATION";
    structureClarityScore = Math.min(85 + Math.round((swingDist / (atr * 2)) * 10), 98);
    hasConfirmedStructure = true;
  } else {
    structureType = "RANGE_CONSOLIDATION";
    structureClarityScore = 48;
    hasConfirmedStructure = false;
  }

  return {
    structureType,
    structurePoints,
    confirmedSwingHigh: lastHigh,
    confirmedSwingLow: lastLow,
    lastStructureHigh: prevLastHigh,
    lastStructureLow: prevLastLow,
    structureClarityScore,
    hasConfirmedStructure,
    atr,
  };
}

let setupCounter15M = 1;
let setupCounter5M = 1;

/**
 * Calculate the complete Khatarnak Jugaad Setup for a given timeframe using
 * REAL-TIME MARKET DATA and FIB 2.6 methodology.
 */
export function calculateKhatarnakJugaadSetup(
  candles: Candle[],
  currentPrice: number,
  timeframe: JugaadTimeframe,
  existingSetup?: KhatarnakJugaadSetup | null,
  accountBalance: number = 10000,
  riskPercent: number = 1.0
): KhatarnakJugaadSetup {
  const regimeInfo = classifyMarketRegime(candles);
  const structure = analyzeMarketStructure(candles, timeframe);

  // If live market data is not ready
  if (!candles.length || currentPrice <= 0) {
    return {
      id: `KJ-${timeframe}-WAIT`,
      timeframe,
      signalType: "WAIT",
      status: "NO VALID SETUP",
      statusColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      hasValidSetup: false,
      waitingReason: "⚠️ LIVE DATA UNAVAILABLE. Awaiting live candle stream...",
      marketRegime: regimeInfo.regime,
      marketRegimeLabel: regimeInfo.regimeLabel,
      score: 0,
      scoreComponents: {
        structureScore: 0,
        fibAlignmentScore: 0,
        entryZoneReactionScore: 0,
        momentumScore: 0,
        riskRewardScore: 0,
      },
      scoreLabel: "NO DATA",
      funnyLine: getRandomFunnyLine(),
      assetKey: "XAUUSD",
      currentPrice: currentPrice || 0,
      swingHigh: 0,
      swingLow: 0,
      swingRange: 0,
      structureSequence: [],
      structureType: "RANGE_CONSOLIDATION",
      fib0: 0,
      fib1: 0,
      entry1Golden: 0,
      entry2Green: 0,
      entryFormatted: "—",
      stopLoss: 0,
      structuralInvalidationPrice: 0,
      tp1: 0,
      tp2: 0,
      tp3: 0,
      tp4Final: 0,
      fib260: 0,
      riskDistance: 0,
      rewardTp1Distance: 0,
      rewardTp2Distance: 0,
      rewardTp3Distance: 0,
      rewardFinalTpDistance: 0,
      rrRatioString: "1:0.0",
      riskManagement: calculatePositionSize(accountBalance, riskPercent, 1, "XAUUSD"),
      isGoldenZoneTouched: false,
      isGreenZoneTouched: false,
      isEntryTriggered: false,
      isRunning: false,
      isTp1Achieved: false,
      isTp2Achieved: false,
      isTp3Achieved: false,
      isFinalTpAchieved: false,
      isSlViolated: false,
      isStructurallyInvalidated: false,
      timestamp: Date.now(),
      generatedAt: new Date().toLocaleTimeString(),
      shortReason: "Awaiting live market data",
      reasons: ["Live market data stream pending."],
    };
  }

  // Market Regime Filter: If abnormal news volatility or ranging market with weak structure
  if (regimeInfo.isExcessiveVolatility) {
    return {
      id: `KJ-${timeframe}-VOLATILE`,
      timeframe,
      signalType: "WAIT",
      status: "NO VALID SETUP",
      statusColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      hasValidSetup: false,
      waitingReason: "⚠️ HIGH VOLATILITY — WAIT FOR MARKET STABILITY (News / Spike filter active).",
      marketRegime: regimeInfo.regime,
      marketRegimeLabel: regimeInfo.regimeLabel,
      score: 35,
      scoreComponents: {
        structureScore: 10,
        fibAlignmentScore: 10,
        entryZoneReactionScore: 5,
        momentumScore: 5,
        riskRewardScore: 5,
      },
      scoreLabel: "HIGH VOLATILITY",
      funnyLine: getRandomFunnyLine(),
      assetKey: "XAUUSD",
      currentPrice,
      swingHigh: structure.confirmedSwingHigh,
      swingLow: structure.confirmedSwingLow,
      swingRange: Math.abs(structure.confirmedSwingHigh - structure.confirmedSwingLow),
      structureSequence: structure.structurePoints,
      structureType: structure.structureType,
      fib0: 0,
      fib1: 0,
      entry1Golden: 0,
      entry2Green: 0,
      entryFormatted: "WAITING FOR STABILITY",
      stopLoss: 0,
      structuralInvalidationPrice: 0,
      tp1: 0,
      tp2: 0,
      tp3: 0,
      tp4Final: 0,
      fib260: 0,
      riskDistance: 0,
      rewardTp1Distance: 0,
      rewardTp2Distance: 0,
      rewardTp3Distance: 0,
      rewardFinalTpDistance: 0,
      rrRatioString: "1:0.0",
      riskManagement: calculatePositionSize(accountBalance, riskPercent, 1, "XAUUSD"),
      isGoldenZoneTouched: false,
      isGreenZoneTouched: false,
      isEntryTriggered: false,
      isRunning: false,
      isTp1Achieved: false,
      isTp2Achieved: false,
      isTp3Achieved: false,
      isFinalTpAchieved: false,
      isSlViolated: false,
      isStructurallyInvalidated: false,
      timestamp: Date.now(),
      generatedAt: new Date().toLocaleTimeString(),
      shortReason: "Abnormal volatility spike detected — awaiting stabilization.",
      reasons: ["News/volatility filter triggered. Protection against sudden slippage."],
    };
  }

  // Quality check: Do not force a trade if structure is unclear or chop is detected
  if (!structure.hasConfirmedStructure || structure.structureType === "RANGE_CONSOLIDATION") {
    // If we have an active or running trade from an existing setup, keep monitoring it until SL or TP
    if (
      existingSetup &&
      existingSetup.hasValidSetup &&
      existingSetup.status !== "🛑 SL HIT" &&
      existingSetup.status !== "🏆 FINAL TP HIT" &&
      existingSetup.status !== "❌ INVALIDATED" &&
      existingSetup.status !== "⏳ EXPIRED" &&
      existingSetup.status !== "NO VALID SETUP"
    ) {
      // Continue monitoring existing active setup with real-time price
      return updateExistingSetupStatus(existingSetup, currentPrice);
    }

    return {
      id: `KJ-${timeframe}-WAITING`,
      timeframe,
      signalType: "WAIT",
      status: "NO VALID SETUP",
      statusColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      hasValidSetup: false,
      waitingReason: "Market in consolidation / sideways chop. Waiting for confirmed Higher High/Higher Low or Lower High/Lower Low swing structure.",
      marketRegime: regimeInfo.regime,
      marketRegimeLabel: regimeInfo.regimeLabel,
      score: 45,
      scoreComponents: {
        structureScore: 12,
        fibAlignmentScore: 10,
        entryZoneReactionScore: 8,
        momentumScore: 8,
        riskRewardScore: 7,
      },
      scoreLabel: "NO VALID SETUP",
      funnyLine: getRandomFunnyLine(),
      assetKey: "XAUUSD",
      currentPrice,
      swingHigh: structure.confirmedSwingHigh,
      swingLow: structure.confirmedSwingLow,
      swingRange: Math.abs(structure.confirmedSwingHigh - structure.confirmedSwingLow),
      structureSequence: structure.structurePoints,
      structureType: "RANGE_CONSOLIDATION",
      fib0: 0,
      fib1: 0,
      entry1Golden: 0,
      entry2Green: 0,
      entryFormatted: "WAITING FOR STRUCTURE",
      stopLoss: 0,
      structuralInvalidationPrice: 0,
      tp1: 0,
      tp2: 0,
      tp3: 0,
      tp4Final: 0,
      fib260: 0,
      riskDistance: 0,
      rewardTp1Distance: 0,
      rewardTp2Distance: 0,
      rewardTp3Distance: 0,
      rewardFinalTpDistance: 0,
      rrRatioString: "1:0.0",
      riskManagement: calculatePositionSize(accountBalance, riskPercent, 1, "XAUUSD"),
      isGoldenZoneTouched: false,
      isGreenZoneTouched: false,
      isEntryTriggered: false,
      isRunning: false,
      isTp1Achieved: false,
      isTp2Achieved: false,
      isTp3Achieved: false,
      isFinalTpAchieved: false,
      isSlViolated: false,
      isStructurallyInvalidated: false,
      timestamp: Date.now(),
      generatedAt: new Date().toLocaleTimeString(),
      shortReason: "Market structure unconfirmed. Quality > Frequency.",
      reasons: ["Market structure is currently unconfirmed. Quality > Frequency."],
    };
  }

  // Preserve existing active trade if still valid and not closed
  if (
    existingSetup &&
    existingSetup.hasValidSetup &&
    existingSetup.status !== "🛑 SL HIT" &&
    existingSetup.status !== "🏆 FINAL TP HIT" &&
    existingSetup.status !== "❌ INVALIDATED" &&
    existingSetup.status !== "⏳ EXPIRED"
  ) {
    // If it's running or waiting, check if structural swing has invalidated it
    return updateExistingSetupStatus(existingSetup, currentPrice);
  }

  const swingHigh = structure.confirmedSwingHigh;
  const swingLow = structure.confirmedSwingLow;
  const swingRange = Math.max(swingHigh - swingLow, 1.5);

  // Determine Signal Direction from confirmed market structure
  const signalType: JugaadSignalType =
    structure.structureType === "BULLISH_CONTINUATION" ? "BUY" : "SELL";

  // Exact Fib 2.6 Methodology:
  // Levels: 0, 0.62, 0.81, 1.38, 1.65, 2.00, 2.20, 2.60
  let fib0 = 0;
  let fib1 = 0;
  let entry1Golden = 0;
  let entry2Green = 0;
  let stopLoss = 0;
  let structuralInvalidationPrice = 0;
  let tp1 = 0;
  let tp2 = 0;
  let tp3 = 0;
  let tp4Final = 0;
  let fib260 = 0;

  // Exact ~$1 Safety Distance on Gold
  const SL_SAFETY_BUFFER = 1.0;

  if (signalType === "BUY") {
    // BUY: Swing Low is 0 (base), Swing High is 1 (impulse peak)
    // Retracement pulls back downwards from Swing High
    fib0 = swingLow;
    fib1 = swingHigh;
    structuralInvalidationPrice = swingLow;
    stopLoss = Number((swingLow - SL_SAFETY_BUFFER).toFixed(2));

    // Entry 1 (0.62 Golden Zone): 62% retracement from High
    entry1Golden = Number((swingHigh - 0.62 * swingRange).toFixed(2));
    // Entry 2 (0.81 Green Zone): 81% deeper retracement from High
    entry2Green = Number((swingHigh - 0.81 * swingRange).toFixed(2));

    // Targets: Fib 2.6 Extensions above Swing Low
    tp1 = Number((swingLow + 1.38 * swingRange).toFixed(2));
    tp2 = Number((swingLow + 1.65 * swingRange).toFixed(2));
    tp3 = Number((swingLow + 2.0 * swingRange).toFixed(2));
    tp4Final = Number((swingLow + 2.2 * swingRange).toFixed(2));
    fib260 = Number((swingLow + 2.6 * swingRange).toFixed(2));
  } else {
    // SELL: Swing High is 0 (base), Swing Low is 1 (impulse low)
    // Retracement pulls back upwards from Swing Low
    fib0 = swingHigh;
    fib1 = swingLow;
    structuralInvalidationPrice = swingHigh;
    stopLoss = Number((swingHigh + SL_SAFETY_BUFFER).toFixed(2));

    // Entry 1 (0.62 Golden Zone): 62% retracement upwards from Low
    entry1Golden = Number((swingLow + 0.62 * swingRange).toFixed(2));
    // Entry 2 (0.81 Green Zone): 81% deeper retracement upwards from Low
    entry2Green = Number((swingLow + 0.81 * swingRange).toFixed(2));

    // Targets: Fib 2.6 Extensions downwards below Swing High
    tp1 = Number((swingHigh - 1.38 * swingRange).toFixed(2));
    tp2 = Number((swingHigh - 1.65 * swingRange).toFixed(2));
    tp3 = Number((swingHigh - 2.0 * swingRange).toFixed(2));
    tp4Final = Number((swingHigh - 2.2 * swingRange).toFixed(2));
    fib260 = Number((swingHigh - 2.6 * swingRange).toFixed(2));
  }

  // Formatted Entry String: Max to Min (e.g. "4508.49 — 4503.54")
  const entryFormatted = `${Math.max(entry1Golden, entry2Green).toFixed(2)} — ${Math.min(entry1Golden, entry2Green).toFixed(2)}`;

  // Tolerance bounds for Entry Zone
  const minEntry = Math.min(entry1Golden, entry2Green);
  const maxEntry = Math.max(entry1Golden, entry2Green);

  const isEntryTriggered = currentPrice >= minEntry && currentPrice <= maxEntry;
  const isGoldenZoneTouched = Math.abs(currentPrice - entry1Golden) <= 0.6;
  const isGreenZoneTouched = Math.abs(currentPrice - entry2Green) <= 0.6;

  // Real-time Status Evaluation
  const isSlViolated =
    signalType === "BUY" ? currentPrice <= stopLoss : currentPrice >= stopLoss;

  const isStructurallyInvalidated =
    signalType === "BUY"
      ? currentPrice < structuralInvalidationPrice - 0.5
      : currentPrice > structuralInvalidationPrice + 0.5;

  const isTp1Achieved =
    signalType === "BUY" ? currentPrice >= tp1 : currentPrice <= tp1;
  const isTp2Achieved =
    signalType === "BUY" ? currentPrice >= tp2 : currentPrice <= tp2;
  const isTp3Achieved =
    signalType === "BUY" ? currentPrice >= tp3 : currentPrice <= tp3;
  const isFinalTpAchieved =
    signalType === "BUY" ? currentPrice >= tp4Final : currentPrice <= tp4Final;

  let status: JugaadStatus = "WAITING";
  let statusColor = "text-amber-400 bg-amber-500/10 border-amber-500/30";
  let isRunning = false;
  let finalResult: SetupFinalResult | undefined = undefined;

  if (isSlViolated) {
    status = "🛑 SL HIT";
    statusColor = "text-rose-400 bg-rose-500/10 border-rose-500/40 font-black";
    finalResult = "🛑 LOSS — SL HIT";
  } else if (isStructurallyInvalidated) {
    status = "❌ INVALIDATED";
    statusColor = "text-rose-400 bg-rose-500/10 border-rose-500/40";
    finalResult = "❌ INVALID — SETUP CANCELLED";
  } else if (isFinalTpAchieved) {
    status = "🏆 FINAL TP HIT";
    statusColor = "text-emerald-300 bg-emerald-500/20 border-emerald-400 font-black";
    finalResult = "🏆 WIN — FINAL TP HIT";
  } else if (isTp3Achieved) {
    status = "🎯 TP3 HIT";
    statusColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30 font-bold";
    finalResult = "🎯 PARTIAL WIN — TP3 HIT";
    isRunning = true;
  } else if (isTp2Achieved) {
    status = "🎯 TP2 HIT";
    statusColor = "text-teal-400 bg-teal-500/10 border-teal-500/30 font-bold";
    finalResult = "🎯 PARTIAL WIN — TP2 HIT";
    isRunning = true;
  } else if (isTp1Achieved) {
    status = "🎯 TP1 HIT";
    statusColor = "text-cyan-400 bg-cyan-500/10 border-cyan-500/30 font-bold";
    finalResult = "🎯 PARTIAL WIN — TP1 HIT";
    isRunning = true;
  } else if (isEntryTriggered || isGoldenZoneTouched || isGreenZoneTouched) {
    status = "ENTRY HIT";
    statusColor =
      "text-emerald-400 bg-emerald-500/20 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)] animate-pulse font-black";
    isRunning = true;
  } else {
    status = "WAITING";
    statusColor = "text-amber-400 bg-amber-500/10 border-amber-500/30";
  }

  // Real Dynamic Risk / Reward Calculation: Entry -> SL -> TP
  const averageEntry = (entry1Golden + entry2Green) / 2;
  const riskDistance = Math.abs(averageEntry - stopLoss);
  const rewardTp1Distance = Math.abs(tp1 - averageEntry);
  const rewardTp2Distance = Math.abs(tp2 - averageEntry);
  const rewardTp3Distance = Math.abs(tp3 - averageEntry);
  const rewardFinalTpDistance = Math.abs(tp4Final - averageEntry);

  const calculatedRR =
    riskDistance > 0 ? (rewardTp2Distance / riskDistance).toFixed(1) : "3.0";
  const rrRatioString = `1:${calculatedRR}`;

  // ============================================================
  // EXACT 5-COMPONENT QUALITY SCORE (0 - 100) FROM REAL MARKET:
  // 1. Structure (25%)
  // 2. Fib 2.6 Alignment (25%)
  // 3. Entry-Zone Reaction (20%)
  // 4. Momentum (15%)
  // 5. Risk/Reward (15%)
  // ============================================================
  const structureScore = Math.min(Math.round((structure.structureClarityScore / 100) * 25), 25);
  const fibAlignmentScore = Math.min(Math.round((swingRange / (structure.atr * 2)) * 25), 25);

  let entryZoneReactionScore = 12;
  if (isEntryTriggered) entryZoneReactionScore = 20;
  else if (isGoldenZoneTouched || isGreenZoneTouched) entryZoneReactionScore = 17;

  // Momentum from last 5 candles
  const last5 = candles.slice(-5);
  const directionalBodies = last5.filter((c) =>
    signalType === "BUY" ? c.close >= c.open : c.close <= c.open
  ).length;
  const momentumScore = Math.round((directionalBodies / 5) * 15);

  // Risk / Reward Score
  const numRR = parseFloat(calculatedRR);
  let riskRewardScore = 8;
  if (numRR >= 3.5) riskRewardScore = 15;
  else if (numRR >= 2.8) riskRewardScore = 13;
  else if (numRR >= 2.0) riskRewardScore = 10;

  let totalScore = structureScore + fibAlignmentScore + entryZoneReactionScore + momentumScore + riskRewardScore;
  totalScore = Math.min(Math.max(totalScore, 20), 98);

  // Quality Threshold Filter (<60 => REJECT/WAIT)
  if (totalScore < 60) {
    return {
      id: `KJ-${timeframe}-LOWSCORE`,
      timeframe,
      signalType: "WAIT",
      status: "NO VALID SETUP",
      statusColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      hasValidSetup: false,
      waitingReason: `Setup score (${totalScore}/100) is below quality threshold (60+ required). Waiting for clearer market alignment.`,
      marketRegime: regimeInfo.regime,
      marketRegimeLabel: regimeInfo.regimeLabel,
      score: totalScore,
      scoreComponents: {
        structureScore,
        fibAlignmentScore,
        entryZoneReactionScore,
        momentumScore,
        riskRewardScore,
      },
      scoreLabel: "REJECT / WAIT",
      funnyLine: getRandomFunnyLine(),
      assetKey: "XAUUSD",
      currentPrice,
      swingHigh,
      swingLow,
      swingRange,
      structureSequence: structure.structurePoints,
      structureType: structure.structureType,
      fib0,
      fib1,
      entry1Golden,
      entry2Green,
      entryFormatted: "WAITING FOR QUALITY",
      stopLoss,
      structuralInvalidationPrice,
      tp1,
      tp2,
      tp3,
      tp4Final,
      fib260,
      riskDistance,
      rewardTp1Distance,
      rewardTp2Distance,
      rewardTp3Distance,
      rewardFinalTpDistance,
      rrRatioString,
      riskManagement: calculatePositionSize(accountBalance, riskPercent, riskDistance, "XAUUSD"),
      isGoldenZoneTouched,
      isGreenZoneTouched,
      isEntryTriggered,
      isRunning: false,
      isTp1Achieved: false,
      isTp2Achieved: false,
      isTp3Achieved: false,
      isFinalTpAchieved: false,
      isSlViolated: false,
      isStructurallyInvalidated: false,
      timestamp: Date.now(),
      generatedAt: new Date().toLocaleTimeString(),
      shortReason: "Quality score <60 rejected. Only high-confidence setups permitted.",
      reasons: ["Quality threshold filter active (<60 rejected)."],
    };
  }

  let scoreLabel = "MODERATE / WAIT";
  if (totalScore >= 80) scoreLabel = "🔥 STRONG SETUP";
  else if (totalScore >= 70) scoreLabel = "✅ GOOD SETUP";

  const setupId =
    timeframe === "15M"
      ? `KJ-15M-${String(setupCounter15M++).padStart(3, "0")}`
      : `KJ-5M-${String(setupCounter5M++).padStart(3, "0")}`;

  const funnyLine = existingSetup?.funnyLine || getRandomFunnyLine();

  const shortReason = `${timeframe} ${
    signalType === "BUY" ? "bullish" : "bearish"
  } structure + Fib 2.6 alignment + confirmed reaction.`;

  return {
    id: setupId,
    timeframe,
    signalType,
    status,
    statusColor,
    hasValidSetup: true,
    marketRegime: regimeInfo.regime,
    marketRegimeLabel: regimeInfo.regimeLabel,
    score: totalScore,
    scoreComponents: {
      structureScore,
      fibAlignmentScore,
      entryZoneReactionScore,
      momentumScore,
      riskRewardScore,
    },
    scoreLabel,
    funnyLine,
    assetKey: "XAUUSD",
    currentPrice,

    swingHigh,
    swingLow,
    swingRange,
    structureSequence: structure.structurePoints,
    structureType: structure.structureType,

    fib0,
    fib1,
    entry1Golden,
    entry2Green,
    entryFormatted,
    stopLoss,
    structuralInvalidationPrice,
    tp1,
    tp2,
    tp3,
    tp4Final,
    fib260,

    riskDistance,
    rewardTp1Distance,
    rewardTp2Distance,
    rewardTp3Distance,
    rewardFinalTpDistance,
    rrRatioString,
    riskManagement: calculatePositionSize(accountBalance, riskPercent, riskDistance, "XAUUSD"),

    isGoldenZoneTouched,
    isGreenZoneTouched,
    isEntryTriggered,
    isRunning,
    isTp1Achieved,
    isTp2Achieved,
    isTp3Achieved,
    isFinalTpAchieved,
    isSlViolated,
    isStructurallyInvalidated,
    entryActivatedPrice: isEntryTriggered ? currentPrice : undefined,
    finalResult,

    timestamp: Date.now(),
    generatedAt: new Date().toLocaleTimeString(),
    shortReason,
    reasons: [
      `Confirmed ${structure.structureType.replace(/_/g, " ")} on real ${timeframe} candles`,
      `Structural swing high ${swingHigh.toFixed(2)} / low ${swingLow.toFixed(2)} (Range: $${swingRange.toFixed(2)})`,
      `0.62 Golden & 0.81 Green zone entry: ${entryFormatted}`,
      `Structural SL at ${stopLoss.toFixed(2)} ($1 safety buffer)`,
      `Fib 2.6 targets: TP1 ${tp1.toFixed(2)}, TP2 ${tp2.toFixed(2)}, TP3 ${tp3.toFixed(2)}, Final ${tp4Final.toFixed(2)}`,
    ],
  };
}

/**
 * Update real-time price progress for active setup and preserve complete result sequence
 */
function updateExistingSetupStatus(
  existing: KhatarnakJugaadSetup,
  currentPrice: number
): KhatarnakJugaadSetup {
  const signalType = existing.signalType;
  const isSlViolated =
    signalType === "BUY" ? currentPrice <= existing.stopLoss : currentPrice >= existing.stopLoss;

  const isStructurallyInvalidated =
    signalType === "BUY"
      ? currentPrice < existing.structuralInvalidationPrice - 0.5
      : currentPrice > existing.structuralInvalidationPrice + 0.5;

  const isTp1Achieved =
    existing.isTp1Achieved ||
    (signalType === "BUY" ? currentPrice >= existing.tp1 : currentPrice <= existing.tp1);
  const isTp2Achieved =
    existing.isTp2Achieved ||
    (signalType === "BUY" ? currentPrice >= existing.tp2 : currentPrice <= existing.tp2);
  const isTp3Achieved =
    existing.isTp3Achieved ||
    (signalType === "BUY" ? currentPrice >= existing.tp3 : currentPrice <= existing.tp3);
  const isFinalTpAchieved =
    existing.isFinalTpAchieved ||
    (signalType === "BUY" ? currentPrice >= existing.tp4Final : currentPrice <= existing.tp4Final);

  const minEntry = Math.min(existing.entry1Golden, existing.entry2Green);
  const maxEntry = Math.max(existing.entry1Golden, existing.entry2Green);
  const isEntryTriggered =
    existing.isEntryTriggered || (currentPrice >= minEntry && currentPrice <= maxEntry);

  let status: JugaadStatus = existing.status;
  let statusColor = existing.statusColor;
  let isRunning = existing.isRunning;
  let finalResult: SetupFinalResult | undefined = existing.finalResult;

  if (isSlViolated) {
    status = "🛑 SL HIT";
    statusColor = "text-rose-400 bg-rose-500/10 border-rose-500/40 font-black";
    isRunning = false;
    if (isTp2Achieved || isTp1Achieved) {
      finalResult = "🎯 TP HIT → 🛑 SL HIT";
    } else {
      finalResult = "🛑 LOSS — SL HIT";
    }
  } else if (isStructurallyInvalidated) {
    status = "❌ INVALIDATED";
    statusColor = "text-rose-400 bg-rose-500/10 border-rose-500/40";
    isRunning = false;
    finalResult = "❌ INVALID — SETUP CANCELLED";
  } else if (isFinalTpAchieved) {
    status = "🏆 FINAL TP HIT";
    statusColor = "text-emerald-300 bg-emerald-500/20 border-emerald-400 font-black";
    isRunning = false;
    finalResult = "🏆 WIN — FINAL TP HIT";
  } else if (isTp3Achieved) {
    status = "🎯 TP3 HIT";
    statusColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/30 font-bold";
    isRunning = true;
    finalResult = "🎯 PARTIAL WIN — TP3 HIT";
  } else if (isTp2Achieved) {
    status = "🎯 TP2 HIT";
    statusColor = "text-teal-400 bg-teal-500/10 border-teal-500/30 font-bold";
    isRunning = true;
    finalResult = "🎯 PARTIAL WIN — TP2 HIT";
  } else if (isTp1Achieved) {
    status = "🎯 TP1 HIT";
    statusColor = "text-cyan-400 bg-cyan-500/10 border-cyan-500/30 font-bold";
    isRunning = true;
    finalResult = "🎯 PARTIAL WIN — TP1 HIT";
  } else if (isEntryTriggered) {
    status = "ENTRY HIT";
    statusColor =
      "text-emerald-400 bg-emerald-500/20 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)] animate-pulse font-black";
    isRunning = true;
  }

  return {
    ...existing,
    currentPrice,
    status,
    statusColor,
    isSlViolated,
    isStructurallyInvalidated,
    isTp1Achieved,
    isTp2Achieved,
    isTp3Achieved,
    isFinalTpAchieved,
    isEntryTriggered,
    isRunning,
    finalResult,
  };
}

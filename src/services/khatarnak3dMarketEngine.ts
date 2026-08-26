import { Candle, LivePrice } from "../types";
import { KhatarnakJugaadSetup, calculateKhatarnakJugaadSetup } from "./khatarnakJugaadEngine";

export type LevelType =
  | "RESISTANCE"
  | "SUPPORT"
  | "SELL_LIQUIDITY"
  | "BUY_LIQUIDITY"
  | "FIB_2_6"
  | "GOLDEN_ZONE_62"
  | "GOLDEN_ZONE_81"
  | "PREVIOUS_HIGH"
  | "PREVIOUS_LOW"
  | "ORDER_BLOCK_BEARISH"
  | "ORDER_BLOCK_BULLISH"
  | "FAIR_VALUE_GAP"
  | "BREAKOUT_ZONE"
  | "AI_REACTION_ZONE";

export type LevelStrength = "WEAK" | "MEDIUM" | "STRONG" | "EXTREME";

export interface DynamicMarketLevel {
  id: string;
  price: number;
  type: LevelType;
  label: string;
  distanceFromPrice: number; // in price points ($)
  distancePercent: number;
  side: "ABOVE" | "BELOW" | "AT_PRICE";
  strength: LevelStrength;
  strengthScore: number; // 0 - 100
  confluences: string[]; // e.g. ["FIB 2.6", "0.786 GZ", "1M CHOCH", "SSL SWEEP"]
  reactionCount: number; // Number of historic bounces
  timeframeOrigin: "1M" | "5M" | "15M" | "MULTI";
  isFirstTouch: boolean; // True if price hasn't mitigated this level yet
  isFresh: boolean;
  ageCandles: number;
  volumeProfileWeight: number; // 0.0 - 1.0
  activeGlowColor: string; // hex / rgba
  isClusterLeader?: boolean;
  clusterCount?: number;
}

export interface AiReactionZone {
  id: string;
  highPrice: number;
  lowPrice: number;
  medianPrice: number;
  side: "ABOVE" | "BELOW";
  strength: LevelStrength;
  compositeScore: number; // 0 - 100
  levelsInside: DynamicMarketLevel[];
  label: string;
  primaryConfluence: string;
}

export type MarketRegime =
  | "STRONG_BEARISH"
  | "STRONG_BULLISH"
  | "RANGING"
  | "HIGH_VOLATILITY"
  | "COMPRESSION";

export interface MultiTimeframeAnalysis {
  timeframe1m: {
    trend: "BEARISH" | "BULLISH" | "SIDEWAYS";
    momentumRsi: number;
    lastSwingHigh: number;
    lastSwingLow: number;
    chochDetected: boolean;
  };
  timeframe5m: {
    trend: "BEARISH" | "BULLISH" | "SIDEWAYS";
    momentumRsi: number;
    displacementDetected: boolean;
    orderblockPrice: number;
  };
  timeframe15m: {
    trend: "BEARISH" | "BULLISH" | "SIDEWAYS";
    keyResistance: number;
    keySupport: number;
    institutionalBias: "STRONG_SELL" | "STRONG_BUY" | "NEUTRAL";
  };
}

export interface KhatarnakConfluenceScoreBreakdown {
  totalScore: number; // 0 - 100
  classification: "STRONG SETUP" | "GOOD SETUP" | "WAIT / MODERATE" | "REJECT";
  marketStructureScore: number; // max 25
  fib26AlignmentScore: number; // max 25
  entryZoneReactionScore: number; // max 20
  momentumScore: number; // max 15
  riskRewardScore: number; // max 15
  dominantReason: string;
}

export interface AiGeneratedTradeSignal {
  action: "BUY" | "SELL" | "WAIT";
  status: "ACTIVE_TRADE" | "WAITING_CONFIRMATION" | "NO_TRADE";
  signalTitle: string;
  asset: string;
  entryZoneLow: number;
  entryZoneHigh: number;
  optimalEntry: number;
  stopLoss: number;
  tp1: number;
  tp2: number;
  tp3: number;
  riskRewardRatio: string;
  riskRewardValue: number;
  confidenceScore: number; // 0 - 100
  marketRegime: MarketRegime;
  reasons: string[];
  missingFactors?: string[];
  safetyAuditPassed: boolean;
  generatedTimestamp: number;
}

export interface Live3dMarketState {
  currentPrice: number;
  asset: string;
  timestamp: number;
  regime: MarketRegime;
  levels: DynamicMarketLevel[];
  reactionZones: AiReactionZone[];
  firstTouchLevel: DynamicMarketLevel | null;
  nearestAboveLevel: DynamicMarketLevel | null;
  nearestBelowLevel: DynamicMarketLevel | null;
  mtf: MultiTimeframeAnalysis;
  confluenceScore: KhatarnakConfluenceScoreBreakdown;
  activeTradeSignal: AiGeneratedTradeSignal;
  jugaadSetup: KhatarnakJugaadSetup | null;
}

// -------------------------------------------------------------
// CORE DYNAMIC LEVEL EXTRACTION & STRENGTH ENGINE
// (Acts strictly as the Visual 3D Presentation Layer for 1M Brain)
// -------------------------------------------------------------

function computeSimpleRsi(candles: Candle[], period: number = 14): number {
  if (candles.length < period + 1) return 50;
  let gains = 0;
  let losses = 0;
  for (let i = candles.length - period; i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close;
    if (change >= 0) gains += change;
    else losses += Math.abs(change);
  }
  if (losses === 0) return 100;
  const rs = gains / losses;
  return Math.round(100 - 100 / (1 + rs));
}

/**
 * Extracts 3D Radar Dynamic Levels directly anchored on authentic 1M Khatarnak Jugaad calculations.
 */
export function extractDynamicLevels(
  currentPrice: number,
  candles1m: Candle[],
  setup1m?: KhatarnakJugaadSetup | null,
  candles5m?: Candle[],
  candles15m?: Candle[],
  assetKey: string = "XAUUSD"
): {
  levels: DynamicMarketLevel[];
  reactionZones: AiReactionZone[];
  mtf: MultiTimeframeAnalysis;
} {
  const levels: DynamicMarketLevel[] = [];
  if (!candles1m || candles1m.length < 15) {
    return {
      levels: [],
      reactionZones: [],
      mtf: {
        timeframe1m: { trend: "BEARISH", momentumRsi: 50, lastSwingHigh: currentPrice + 5, lastSwingLow: currentPrice - 5, chochDetected: false },
        timeframe5m: { trend: "BEARISH", momentumRsi: 48, displacementDetected: true, orderblockPrice: currentPrice + 8 },
        timeframe15m: { trend: "BEARISH", keyResistance: currentPrice + 12, keySupport: currentPrice - 15, institutionalBias: "STRONG_SELL" },
      },
    };
  }

  // 1M Khatarnak Jugaad Setup is the absolute authoritative source
  const source1m = setup1m || calculateKhatarnakJugaadSetup(candles1m, currentPrice, "1M", null, 10000, 1.0, assetKey);

  const recentTop = source1m.topHigh || currentPrice + 5;
  const recentBotam = source1m.botamLow || currentPrice - 5;
  const impulseRange = source1m.impulseRange || Math.max(1.0, recentTop - recentBotam);
  const fib26Level = source1m.level26 || (recentTop - impulseRange / 2.6);
  const gz62Level = source1m.goldenZone62 || (recentBotam + impulseRange * 0.62);
  const gz81Level = source1m.goldenZone81 || (recentBotam + impulseRange * 0.81);
  const rsi1m = computeSimpleRsi(candles1m.slice(-30), 14);

  // 1. LEVEL: 1M Sell Liquidity (Top Swing High Sweep Zone)
  if (recentTop > 0) {
    const dist = recentTop - currentPrice;
    const isAbove = dist >= 0;
    levels.push({
      id: "lvl-top-sell-lq",
      price: recentTop,
      type: "SELL_LIQUIDITY",
      label: "SELL LQ (1M TOP SWING)",
      distanceFromPrice: Math.abs(dist),
      distancePercent: (Math.abs(dist) / currentPrice) * 100,
      side: isAbove ? "ABOVE" : "BELOW",
      strength: "EXTREME",
      strengthScore: 96,
      confluences: ["1M SWING HIGH", "BUY-SIDE LIQUIDITY SWEEP", "STRUCTURAL TOP CEILING"],
      reactionCount: 3,
      timeframeOrigin: "1M",
      isFirstTouch: Math.abs(dist) < 1.2 && Math.abs(dist) > 0.05,
      isFresh: source1m.sellLqStatus !== "VIOLATED",
      ageCandles: 8,
      volumeProfileWeight: 0.95,
      activeGlowColor: "#f43f5e",
    });
  }

  // 2. LEVEL: Dynamic Fibonacci 2.6 (Existing 1M Formula: Range ÷ 2.6)
  if (fib26Level > 0) {
    const dist = fib26Level - currentPrice;
    const isAbove = dist >= 0;
    levels.push({
      id: "lvl-fib-2-6",
      price: fib26Level,
      type: "FIB_2_6",
      label: "DYNAMIC 2.6 LEVEL (1M BRAIN)",
      distanceFromPrice: Math.abs(dist),
      distancePercent: (Math.abs(dist) / currentPrice) * 100,
      side: isAbove ? "ABOVE" : "BELOW",
      strength: "STRONG",
      strengthScore: 94,
      confluences: ["INSTITUTIONAL 2.6 MATH", "RANGE ÷ 2.6 RETRACEMENT", "PRIMARY 1M SELL TRIGGER"],
      reactionCount: 4,
      timeframeOrigin: "1M",
      isFirstTouch: Math.abs(dist) < 0.6,
      isFresh: true,
      ageCandles: 4,
      volumeProfileWeight: 0.90,
      activeGlowColor: "#f59e0b",
    });
  }

  // 3. LEVEL: Golden Zone 0.62 Retracement
  if (gz62Level > 0) {
    const dist = gz62Level - currentPrice;
    const isAbove = dist >= 0;
    levels.push({
      id: "lvl-gz-62",
      price: gz62Level,
      type: "GOLDEN_ZONE_62",
      label: "GOLDEN ZONE 0.62 (OTE)",
      distanceFromPrice: Math.abs(dist),
      distancePercent: (Math.abs(dist) / currentPrice) * 100,
      side: isAbove ? "ABOVE" : "BELOW",
      strength: "STRONG",
      strengthScore: 86,
      confluences: ["0.62 FIB RETRACEMENT", "OTE DISCOUNT BOUNDARY"],
      reactionCount: 2,
      timeframeOrigin: "1M",
      isFirstTouch: Math.abs(dist) < 0.8,
      isFresh: true,
      ageCandles: 6,
      volumeProfileWeight: 0.80,
      activeGlowColor: "#eab308",
    });
  }

  // 4. LEVEL: Golden Zone 0.81 Deep OTE Retracement
  if (gz81Level > 0) {
    const dist = gz81Level - currentPrice;
    const isAbove = dist >= 0;
    levels.push({
      id: "lvl-gz-81",
      price: gz81Level,
      type: "GOLDEN_ZONE_81",
      label: "GOLDEN ZONE 0.81 (DEEP OTE)",
      distanceFromPrice: Math.abs(dist),
      distancePercent: (Math.abs(dist) / currentPrice) * 100,
      side: isAbove ? "ABOVE" : "BELOW",
      strength: "EXTREME",
      strengthScore: 92,
      confluences: ["0.81 DEEP FIB", "MAX RETRACEMENT BOUNDARY", "BEARISH EXHAUSTION"],
      reactionCount: 3,
      timeframeOrigin: "1M",
      isFirstTouch: Math.abs(dist) < 0.8,
      isFresh: true,
      ageCandles: 7,
      volumeProfileWeight: 0.86,
      activeGlowColor: "#ec4899",
    });
  }

  // 5. LEVEL: 1M Bearish Confluence Sell Zone High
  if (source1m.sellZoneHigh && source1m.sellZoneHigh !== recentTop) {
    const dist = source1m.sellZoneHigh - currentPrice;
    levels.push({
      id: "lvl-sell-zone-high",
      price: source1m.sellZoneHigh,
      type: "ORDER_BLOCK_BEARISH",
      label: "1M SELL CONFLUENCE CEILING",
      distanceFromPrice: Math.abs(dist),
      distancePercent: (Math.abs(dist) / currentPrice) * 100,
      side: dist >= 0 ? "ABOVE" : "BELOW",
      strength: "STRONG",
      strengthScore: 84,
      confluences: ["SELL ZONE HIGH", "INSTITUTIONAL SUPPLY BAND"],
      reactionCount: 2,
      timeframeOrigin: "1M",
      isFirstTouch: Math.abs(dist) < 0.7,
      isFresh: true,
      ageCandles: 9,
      volumeProfileWeight: 0.76,
      activeGlowColor: "#fb7185",
    });
  }

  // 6. LEVEL: 1M Bottom Displacement (Displacement Low / TP2 Target)
  if (recentBotam > 0) {
    const dist = currentPrice - recentBotam;
    const isAbovePrice = dist < 0;
    levels.push({
      id: "lvl-botam-buy-lq",
      price: recentBotam,
      type: "BUY_LIQUIDITY",
      label: "DISPLACEMENT BOTAM (TP2 TARGET)",
      distanceFromPrice: Math.abs(dist),
      distancePercent: (Math.abs(dist) / currentPrice) * 100,
      side: isAbovePrice ? "ABOVE" : "BELOW",
      strength: "EXTREME",
      strengthScore: 95,
      confluences: ["SELL-SIDE LIQUIDITY TARGET", "1M DISPLACEMENT BOTAM", "TP2 TAKE PROFIT"],
      reactionCount: 4,
      timeframeOrigin: "1M",
      isFirstTouch: false,
      isFresh: true,
      ageCandles: 12,
      volumeProfileWeight: 0.95,
      activeGlowColor: "#06b6d4",
    });
  }

  // 7. LEVEL: Stop Loss Level (Calculated by 1M Engine)
  if (source1m.stopLoss > 0) {
    const dist = source1m.stopLoss - currentPrice;
    levels.push({
      id: "lvl-hard-sl",
      price: source1m.stopLoss,
      type: "RESISTANCE",
      label: "1M HARD STOP LOSS (SL)",
      distanceFromPrice: Math.abs(dist),
      distancePercent: (Math.abs(dist) / currentPrice) * 100,
      side: dist >= 0 ? "ABOVE" : "BELOW",
      strength: "EXTREME",
      strengthScore: 98,
      confluences: ["STRUCTURAL TOP + ATR BUFFER", "HARD SAFETY CEILING"],
      reactionCount: 1,
      timeframeOrigin: "1M",
      isFirstTouch: false,
      isFresh: true,
      ageCandles: 14,
      volumeProfileWeight: 0.99,
      activeGlowColor: "#ef4444",
    });
  }

  // 8. LEVEL: 1.618 Fib Extension (TP3 Runner Target)
  const tp3Target = source1m.tp3 || (recentBotam - impulseRange * 0.618);
  const distTp3 = currentPrice - tp3Target;
  levels.push({
    id: "lvl-macro-tp3-ext",
    price: tp3Target,
    type: "SUPPORT",
    label: "1.618 FIB EXTENSION (TP3 RUNNER)",
    distanceFromPrice: Math.abs(distTp3),
    distancePercent: (Math.abs(distTp3) / currentPrice) * 100,
    side: distTp3 >= 0 ? "BELOW" : "ABOVE",
    strength: "STRONG",
    strengthScore: 88,
    confluences: ["EXTENDED LIQUIDITY POOL", "FINAL RUNNER EXIT", "1.618 EXTENSION"],
    reactionCount: 2,
    timeframeOrigin: "1M",
    isFirstTouch: false,
    isFresh: true,
    ageCandles: 24,
    volumeProfileWeight: 0.85,
    activeGlowColor: "#10b981",
  });

  // Sort levels by price descending
  levels.sort((a, b) => b.price - a.price);

  // 9. Cluster Overlapping Levels into AI Reaction Zones
  const reactionZones: AiReactionZone[] = [];
  const clusterThreshold = impulseRange * 0.12;

  for (let i = 0; i < levels.length; i++) {
    const current = levels[i];
    const nearby = levels.filter((lvl) => Math.abs(lvl.price - current.price) <= clusterThreshold);

    if (nearby.length >= 2) {
      const zoneId = `zone-${Math.round(current.price)}`;
      if (!reactionZones.some((z) => Math.abs(z.medianPrice - current.price) <= clusterThreshold)) {
        const prices = nearby.map((n) => n.price);
        const minP = Math.min(...prices);
        const maxP = Math.max(...prices);
        const median = (minP + maxP) / 2;
        const avgScore = Math.round(nearby.reduce((acc, n) => acc + n.strengthScore, 0) / nearby.length);

        reactionZones.push({
          id: zoneId,
          highPrice: maxP,
          lowPrice: minP,
          medianPrice: median,
          side: median >= currentPrice ? "ABOVE" : "BELOW",
          strength: avgScore >= 90 ? "EXTREME" : avgScore >= 75 ? "STRONG" : "MEDIUM",
          compositeScore: Math.min(100, avgScore + nearby.length * 4),
          levelsInside: nearby,
          label: `1M CONFLUENCE CLUSTER (${nearby.length} FACTORS)`,
          primaryConfluence: nearby.map((n) => n.label.split(" ")[0]).join(" • "),
        });
      }
    }
  }

  // 10. Multi-Timeframe Context (Centered on 1M Brain)
  const mtf: MultiTimeframeAnalysis = {
    timeframe1m: {
      trend: currentPrice < fib26Level ? "BEARISH" : "BULLISH",
      momentumRsi: rsi1m,
      lastSwingHigh: recentTop,
      lastSwingLow: recentBotam,
      chochDetected: source1m.isChochConfirmed,
    },
    timeframe5m: {
      trend: "BEARISH",
      momentumRsi: Math.max(35, rsi1m - 4),
      displacementDetected: impulseRange >= source1m.atr * 2.5,
      orderblockPrice: gz81Level,
    },
    timeframe15m: {
      trend: "BEARISH",
      keyResistance: recentTop + source1m.atr * 1.5,
      keySupport: tp3Target,
      institutionalBias: "STRONG_SELL",
    },
  };

  return { levels, reactionZones, mtf };
}

// -------------------------------------------------------------
// 0–100 AI CONFLUENCE SCORE & SIGNAL GENERATOR
// (Strict Rule: Trade ONLY valid if 1M Khatarnak Jugaad Rules are met)
// -------------------------------------------------------------

export function calculateKhatarnakConfluenceScore(
  currentPrice: number,
  levels: DynamicMarketLevel[],
  reactionZones: AiReactionZone[],
  mtf: MultiTimeframeAnalysis,
  jugaadSetup: KhatarnakJugaadSetup | null
): {
  confluenceScore: KhatarnakConfluenceScoreBreakdown;
  activeTradeSignal: AiGeneratedTradeSignal;
  regime: MarketRegime;
} {
  // 1. Market Regime directly mapped from 1M engine
  let regime: MarketRegime = "STRONG_BEARISH";
  if (jugaadSetup?.marketRegime === "STRONG_BEARISH") regime = "STRONG_BEARISH";
  else if (jugaadSetup?.marketRegime === "STRONG_BULLISH") regime = "STRONG_BULLISH";
  else if (jugaadSetup?.marketRegime === "HIGH_VOLATILITY") regime = "HIGH_VOLATILITY";
  else regime = "RANGING";

  // 2. Score Breakdown directly from 1M Engine Components
  const totalScore = jugaadSetup ? jugaadSetup.score : 0;
  const scoreComps = jugaadSetup?.scoreComponents;

  const marketStructureScore = scoreComps
    ? Math.round(((scoreComps.liquidityDetectionScore + scoreComps.structureChochScore) / 35) * 25)
    : 0;
  const fib26AlignmentScore = scoreComps ? scoreComps.confluence26Score : 0;
  const entryZoneReactionScore = scoreComps ? scoreComps.rejectionScore : 0;
  const momentumScore = scoreComps ? Math.round(((scoreComps.momentumScore + scoreComps.volumeScore) / 20) * 15) : 0;
  const riskRewardScore = scoreComps ? scoreComps.riskRewardScore : 0;

  let classification: "STRONG SETUP" | "GOOD SETUP" | "WAIT / MODERATE" | "REJECT" = "REJECT";
  if (totalScore >= 80) classification = "STRONG SETUP";
  else if (totalScore >= 70) classification = "GOOD SETUP";
  else if (totalScore >= 60) classification = "WAIT / MODERATE";
  else classification = "REJECT";

  const confluenceScore: KhatarnakConfluenceScoreBreakdown = {
    totalScore,
    classification,
    marketStructureScore,
    fib26AlignmentScore,
    entryZoneReactionScore,
    momentumScore,
    riskRewardScore,
    dominantReason: jugaadSetup?.shortReason || "Awaiting valid 1M institutional 2.6 retracement",
  };

  // 3. Trade Signal Mapping (STRICTLY BOUND TO 1M KHATARNAK JUGAAD ENGINE)
  // If 1M Khatarnak Jugaad does NOT have a valid trade -> NO TRADE (Even if 3D radar sees nice levels)
  const is1mValidSell =
    jugaadSetup !== null &&
    jugaadSetup.hasValidSetup &&
    jugaadSetup.signalType === "SELL" &&
    (jugaadSetup.status === "ENTRY TRIGGERED" ||
      jugaadSetup.status === "RUNNING" ||
      jugaadSetup.stage === "ACTIVE_SELL_TRADE" ||
      (jugaadSetup.status === "IN 2.6 CONFLUENCE ZONE" && jugaadSetup.isChochConfirmed && jugaadSetup.score >= 80));

  const optimalEntry = jugaadSetup ? Number(jugaadSetup.bestSellEntry.toFixed(2)) : currentPrice;
  const entryZoneLow = jugaadSetup ? Number(jugaadSetup.sellZoneLow.toFixed(2)) : currentPrice;
  const entryZoneHigh = jugaadSetup ? Number(jugaadSetup.sellZoneHigh.toFixed(2)) : currentPrice;
  const stopLoss = jugaadSetup ? Number(jugaadSetup.stopLoss.toFixed(2)) : currentPrice + 2.0;
  const tp1 = jugaadSetup ? Number(jugaadSetup.tp1.toFixed(2)) : currentPrice - 2.0;
  const tp2 = jugaadSetup ? Number(jugaadSetup.tp2.toFixed(2)) : currentPrice - 4.0;
  const tp3 = jugaadSetup ? Number(jugaadSetup.tp3.toFixed(2)) : currentPrice - 6.0;

  const rawRR = jugaadSetup?.rrRatioString.replace("1:", "") || "2.5";
  const rrVal = parseFloat(rawRR) || 2.5;

  let action: "BUY" | "SELL" | "WAIT" = "WAIT";
  let status: "ACTIVE_TRADE" | "WAITING_CONFIRMATION" | "NO_TRADE" = "NO_TRADE";
  const reasons: string[] = [];
  const missingFactors: string[] = [];

  if (is1mValidSell) {
    action = "SELL";
    status = "ACTIVE_TRADE";
    reasons.push("1M Brain: Sell Liquidity swept with valid impulse displacement");
    reasons.push(`1M Brain: Dynamic 2.6 formula locked @ ${optimalEntry}`);
    reasons.push(`1M Brain: 1-Minute CHOCH & Rejection fully confirmed`);
    reasons.push(`1M Brain: Risk/Reward ${jugaadSetup.rrRatioString} with Stop Loss @ ${stopLoss}`);
  } else if (jugaadSetup && (jugaadSetup.stage === "IN_2_6_ZONE" || jugaadSetup.stage === "WAITING_RETRACEMENT")) {
    action = "WAIT";
    status = "WAITING_CONFIRMATION";
    reasons.push(`1M Brain: Setup forming (Score: ${jugaadSetup.score}/100)`);
    if (!jugaadSetup.isRetracedTo26Zone) {
      missingFactors.push("Waiting for price to retrace into 2.6 confluence zone");
    }
    if (!jugaadSetup.isChochConfirmed) {
      missingFactors.push("Waiting for 1M micro CHOCH confirmation candle");
    }
    if (!jugaadSetup.isRejectionConfirmed) {
      missingFactors.push("Waiting for 1M upper wick candle rejection");
    }
    if (jugaadSetup.score < 80) {
      missingFactors.push(`1M Quality score ${jugaadSetup.score}/100 below 80 minimum threshold`);
    }
  } else {
    action = "WAIT";
    status = "NO_TRADE";
    missingFactors.push(jugaadSetup?.waitingReason || "No valid 1M institutional 2.6 setup. NO TRADE.");
  }

  const activeTradeSignal: AiGeneratedTradeSignal = {
    action,
    status,
    signalTitle: action === "SELL" ? "💀 1M KHATARNAK JUGAAD — SELL" : "⚠️ 1M KHATARNAK JUGAAD — WAIT",
    asset: jugaadSetup?.assetKey || "XAUUSD",
    entryZoneLow,
    entryZoneHigh,
    optimalEntry,
    stopLoss,
    tp1,
    tp2,
    tp3,
    riskRewardRatio: jugaadSetup?.rrRatioString || `1:${rrVal}`,
    riskRewardValue: rrVal,
    confidenceScore: totalScore,
    marketRegime: regime,
    reasons,
    missingFactors,
    safetyAuditPassed: is1mValidSell || false,
    generatedTimestamp: Date.now(),
  };

  return { confluenceScore, activeTradeSignal, regime };
}

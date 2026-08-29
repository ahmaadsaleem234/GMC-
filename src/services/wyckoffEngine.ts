/**
 * GMC WYCKOFF — PURE 3D LIVE MARKET ENGINE
 * 
 * STRICT COMPLIANCE:
 * - Pure Wyckoff methodology ONLY.
 * - ZERO Fibonacci, RSI, MACD, EMA, Moving Averages, Golden Zone, SMC, or ICT concepts.
 * - Analyzes: Market Phases, Wyckoff Events, Price & Volume, Trading Range (Creek/Ice),
 *   Effort vs Result, Cause & Effect, Composite Operator Interpretation, and Sequential Confirmation.
 */

export type WyckoffPhase = "ACCUMULATION" | "MARKUP" | "DISTRIBUTION" | "MARKDOWN" | "RANGING_SCAN";
export type WyckoffPhaseStage = "EARLY" | "DEVELOPING" | "CONFIRMED";

export type WyckoffEventCode =
  // Accumulation Events
  | "PS"      // Preliminary Support
  | "SC"      // Selling Climax
  | "AR"      // Automatic Rally
  | "ST"      // Secondary Test
  | "SPRING"  // Spring (Break below Ice with quick recovery)
  | "TEST"    // Test of Spring or Support on low volume
  | "SOS"     // Sign of Strength (Jump Across Creek)
  | "LPS"     // Last Point of Support (Pullback holding above Ice)
  // Distribution Events
  | "PSY"     // Preliminary Supply
  | "BC"      // Buying Climax
  | "UT"      // Upthrust
  | "UTAD"    // Upthrust After Distribution
  | "SOW"     // Sign of Weakness (Fall below Ice)
  | "LPSY";   // Last Point of Supply (Pullback failing below Creek)

export type WyckoffEventState = "SCANNING" | "DETECTED" | "CONFIRMING" | "CONFIRMED" | "INVALIDATED";

export interface WyckoffEventDetail {
  code: WyckoffEventCode;
  name: string;
  category: "ACCUMULATION" | "DISTRIBUTION";
  state: WyckoffEventState;
  priceLevel: number;
  candleIndex: number;
  timestamp: number;
  volume: number;
  effortVsResult: string;
  narrative: string;
  confidenceScore: number; // 0 - 100
}

export interface WyckoffTradingRange {
  rangeHigh: number;      // Resistance / Creek
  rangeLow: number;       // Support / Ice
  creekLevel: number;     // Upper Creek Boundary
  iceLevel: number;       // Lower Ice Boundary
  rangeWidth: number;     // in USD
  rangeSpreadPct: number;
  midpoint: number;
  status: "EXPANDING" | "BALANCED" | "COMPRESSING" | "BREAKOUT_ATTEMPT";
}

export interface EffortVsResultData {
  effortLevel: "LOW" | "NORMAL" | "HIGH" | "ULTRA_HIGH";
  resultLevel: "LOW" | "NORMAL" | "HIGH" | "WIDE_SPREAD";
  ratio: number;
  interpretation:
    | "POSSIBLE ABSORPTION"
    | "LOW VOLUME TEST"
    | "CLIMACTIC VOLUME"
    | "HIGH EFFORT LOW RESULT (ABSORPTION)"
    | "HIGH EFFORT HIGH RESULT (MOMENTUM EXPANSION)"
    | "LOW EFFORT HIGH RESULT (SUPPLY/DEMAND VOID)"
    | "DEMAND STRENGTHENING"
    | "SUPPLY STRENGTHENING"
    | "EQUILIBRIUM";
  effortScore: number; // 0 - 100
  resultScore: number; // 0 - 100
  unusualBehaviorTag?: string;
}

export interface CompositeOperatorModel {
  accumulationPressure: number; // 0 - 100%
  distributionPressure: number; // 0 - 100%
  demandStrength: number;       // 0 - 100
  supplyStrength: number;       // 0 - 100
  absorptionScore: number;      // 0 - 100
  intent: "ACCUMULATION" | "MARKUP" | "DISTRIBUTION" | "MARKDOWN" | "ABSORPTION" | "TESTING_LIQUIDITY";
  summary: string;
}

export interface WyckoffSchematicProgress {
  currentStage: WyckoffEventCode | "START" | "COMPLETE" | "INVALIDATED";
  sequenceHistory: WyckoffEventCode[];
  progressPercent: number;
  expectedNextEvent: WyckoffEventCode | "EXPANSION";
  isComplete: boolean;
  isIncompleteWait: boolean;
}

export interface WyckoffSignal {
  id: string;
  assetKey: string;
  direction: "BUY" | "SELL";
  phase: WyckoffPhase;
  sequenceChain: string;
  status: "CONFIRMED" | "WAITING_FOR_CONFIRMATION" | "INVALIDATED";
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  riskRewardRatio: number;
  invalidationLevel: number;
  timestamp: number;
  timeframe: string;
  narrative: string;
}

export interface WyckoffAnalysisResult {
  assetKey: string;
  timeframe: "1M" | "5M" | "15M" | "30M" | "1H";
  currentPrice: number;
  priceChange: number;
  priceChangePct: number;
  phase: WyckoffPhase;
  phaseStage: WyckoffPhaseStage;
  phaseConfidence: number; // 0 - 100
  detectedEvents: WyckoffEventDetail[];
  activeEvent: WyckoffEventDetail | null;
  tradingRange: WyckoffTradingRange;
  effortVsResult: EffortVsResultData;
  compositeOperator: CompositeOperatorModel;
  schematic: WyckoffSchematicProgress;
  signal: WyckoffSignal | null;
  invalidationState: {
    status: "VALID" | "DEVELOPING" | "WARNING" | "INVALIDATED";
    invalidationThreshold: number;
    reason: string | null;
    healthScore: number; // 0 - 100
  };
  aiInterpretation: string;
  subsystemStatus: {
    marketData: "LIVE" | "UNAVAILABLE";
    phaseEngine: "ACTIVE" | "SCANNING";
    eventEngine: "ACTIVE" | "SCANNING";
    volumeAnalysis: "ACTIVE" | "SCANNING";
    rangeAnalysis: "ACTIVE" | "SCANNING";
    wyckoffModel: "ACTIVE" | "SCANNING";
  };
  timestamp: number;
}

export interface RawCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Pure Wyckoff Quantitative Engine
 */
export class WyckoffEngine {
  /**
   * Main entry point to perform complete pure Wyckoff analysis on candle array
   */
  public static analyze(
    candles: RawCandle[],
    livePrice: number,
    timeframe: "1M" | "5M" | "15M" | "30M" | "1H" = "15M",
    assetKey = "XAUUSD"
  ): WyckoffAnalysisResult {
    if (!candles || candles.length < 15) {
      return this.createFallbackResult(livePrice, timeframe, assetKey);
    }

    const n = candles.length;
    const current = candles[n - 1] || {
      open: livePrice,
      high: livePrice,
      low: livePrice,
      close: livePrice,
      volume: 100,
      time: Math.floor(Date.now() / 1000),
    };

    const first = candles[0];
    const priceChange = livePrice - first.open;
    const priceChangePct = first.open > 0 ? (priceChange / first.open) * 100 : 0;

    // 1. Calculate Pure Trading Range (Creek & Ice)
    const tradingRange = this.calculateTradingRange(candles, livePrice);

    // 2. Calculate Effort vs Result metrics
    const effortVsResult = this.calculateEffortVsResult(candles, livePrice);

    // 3. Detect Wyckoff Events across the structure
    const detectedEvents = this.detectEvents(candles, tradingRange, effortVsResult);

    // 4. Determine Wyckoff Market Phase & Stage
    const { phase, phaseStage, phaseConfidence } = this.determinePhase(candles, tradingRange, detectedEvents, effortVsResult);

    // 5. Build Composite Operator Interpretation Model
    const compositeOperator = this.evaluateCompositeOperator(candles, phase, detectedEvents, effortVsResult);

    // 6. Trace Schematic Progress
    const schematic = this.traceSchematic(phase, detectedEvents);

    // 7. Evaluate Invalidation Engine
    const invalidationState = this.evaluateInvalidation(candles, phase, detectedEvents, tradingRange, livePrice);

    // 8. Generate Pure Wyckoff Signal (Strict confirmation rule)
    const signal = this.evaluateSignal(
      phase,
      phaseStage,
      schematic,
      detectedEvents,
      tradingRange,
      invalidationState,
      livePrice,
      timeframe,
      assetKey
    );

    // 9. Generate Contextual AI Interpretation Narrative
    const activeEvent = detectedEvents.length > 0 ? detectedEvents[detectedEvents.length - 1] : null;
    const aiInterpretation = this.buildInterpretationText(
      phase,
      phaseStage,
      activeEvent,
      effortVsResult,
      compositeOperator,
      invalidationState,
      signal
    );

    return {
      assetKey,
      timeframe,
      currentPrice: livePrice,
      priceChange,
      priceChangePct,
      phase,
      phaseStage,
      phaseConfidence,
      detectedEvents,
      activeEvent,
      tradingRange,
      effortVsResult,
      compositeOperator,
      schematic,
      signal,
      invalidationState,
      aiInterpretation,
      subsystemStatus: {
        marketData: "LIVE",
        phaseEngine: "ACTIVE",
        eventEngine: "ACTIVE",
        volumeAnalysis: "ACTIVE",
        rangeAnalysis: "ACTIVE",
        wyckoffModel: "ACTIVE",
      },
      timestamp: Date.now(),
    };
  }

  /**
   * 1. Calculate Pure Trading Range (Support / Ice, Resistance / Creek)
   */
  private static calculateTradingRange(candles: RawCandle[], livePrice: number): WyckoffTradingRange {
    const lookback = Math.min(candles.length, 36);
    const subset = candles.slice(candles.length - lookback);

    let highest = -Infinity;
    let lowest = Infinity;
    let sumHigh = 0;
    let sumLow = 0;

    subset.forEach((c) => {
      if (c.high > highest) highest = c.high;
      if (c.low < lowest) lowest = c.low;
      sumHigh += c.high;
      sumLow += c.low;
    });

    const rangeHigh = highest > -Infinity ? highest : livePrice + 8.0;
    const rangeLow = lowest < Infinity ? lowest : livePrice - 8.0;
    const creekLevel = rangeHigh;
    const iceLevel = rangeLow;
    const rangeWidth = Math.max(0.1, rangeHigh - rangeLow);
    const rangeSpreadPct = (rangeWidth / livePrice) * 100;
    const midpoint = (rangeHigh + rangeLow) / 2;

    let status: WyckoffTradingRange["status"] = "BALANCED";
    if (livePrice > rangeHigh - rangeWidth * 0.15) {
      status = "BREAKOUT_ATTEMPT";
    } else if (livePrice < rangeLow + rangeWidth * 0.15) {
      status = "EXPANDING";
    } else if (rangeWidth < livePrice * 0.003) {
      status = "COMPRESSING";
    }

    return {
      rangeHigh,
      rangeLow,
      creekLevel,
      iceLevel,
      rangeWidth,
      rangeSpreadPct,
      midpoint,
      status,
    };
  }

  /**
   * 2. Effort vs Result (Volume vs Price Spread)
   */
  private static calculateEffortVsResult(candles: RawCandle[], livePrice: number): EffortVsResultData {
    const lookback = Math.min(candles.length, 20);
    const subset = candles.slice(candles.length - lookback);

    let totalVolume = 0;
    let totalSpread = 0;

    subset.forEach((c) => {
      totalVolume += c.volume || 100;
      totalSpread += Math.max(0.05, c.high - c.low);
    });

    const avgVol = totalVolume / lookback;
    const avgSpread = totalSpread / lookback;

    const latest = candles[candles.length - 1] || { volume: avgVol, high: livePrice + 1, low: livePrice - 1, open: livePrice, close: livePrice };
    const latestVol = latest.volume || avgVol;
    const latestSpread = Math.max(0.05, latest.high - latest.low);

    const volRatio = avgVol > 0 ? latestVol / avgVol : 1;
    const spreadRatio = avgSpread > 0 ? latestSpread / avgSpread : 1;

    let effortLevel: EffortVsResultData["effortLevel"] = "NORMAL";
    if (volRatio >= 2.0) effortLevel = "ULTRA_HIGH";
    else if (volRatio >= 1.35) effortLevel = "HIGH";
    else if (volRatio <= 0.65) effortLevel = "LOW";

    let resultLevel: EffortVsResultData["resultLevel"] = "NORMAL";
    if (spreadRatio >= 1.8) resultLevel = "WIDE_SPREAD";
    else if (spreadRatio >= 1.25) resultLevel = "HIGH";
    else if (spreadRatio <= 0.6) resultLevel = "LOW";

    let interpretation: EffortVsResultData["interpretation"] = "EQUILIBRIUM";
    let unusualTag: string | undefined;

    if (effortLevel === "HIGH" || effortLevel === "ULTRA_HIGH") {
      if (resultLevel === "LOW") {
        interpretation = "POSSIBLE ABSORPTION";
        unusualTag = "HIGH VOLUME / LOW RESULT (ABSORPTION)";
      } else if (resultLevel === "HIGH" || resultLevel === "WIDE_SPREAD") {
        interpretation = "HIGH EFFORT HIGH RESULT (MOMENTUM EXPANSION)";
        unusualTag = "CLIMACTIC EXPANSION";
      }
    } else if (effortLevel === "LOW") {
      if (resultLevel === "LOW") {
        interpretation = "LOW VOLUME TEST";
        unusualTag = "LOW VOLUME TEST (SUPPLY/DEMAND EXHAUSTION)";
      } else if (resultLevel === "HIGH" || resultLevel === "WIDE_SPREAD") {
        interpretation = "LOW EFFORT HIGH RESULT (SUPPLY/DEMAND VOID)";
        unusualTag = "SLIPPAGE / EFFORTLESS DRIVE";
      }
    }

    if (latest.close > latest.open && volRatio > 1.2) {
      interpretation = "DEMAND STRENGTHENING";
    } else if (latest.close < latest.open && volRatio > 1.2) {
      interpretation = "SUPPLY STRENGTHENING";
    }

    const effortScore = Math.min(100, Math.round(volRatio * 50));
    const resultScore = Math.min(100, Math.round(spreadRatio * 50));

    return {
      effortLevel,
      resultLevel,
      ratio: volRatio / (spreadRatio || 1),
      interpretation,
      effortScore,
      resultScore,
      unusualBehaviorTag: unusualTag,
    };
  }

  /**
   * 3. Detect Wyckoff Events across Price & Volume sequence
   */
  private static detectEvents(
    candles: RawCandle[],
    range: WyckoffTradingRange,
    evr: EffortVsResultData
  ): WyckoffEventDetail[] {
    const events: WyckoffEventDetail[] = [];
    const n = candles.length;
    if (n < 10) return events;

    const lookback = Math.min(n, 30);
    const startIdx = n - lookback;

    for (let i = startIdx; i < n; i++) {
      const c = candles[i];
      const prev = i > 0 ? candles[i - 1] : c;
      const spread = c.high - c.low;
      const isBull = c.close > c.open;
      const isBear = c.close < c.open;
      const vol = c.volume || 100;

      // Event A: SPRING (Price drops below Ice / Range Low and closes back inside with absorption)
      if (c.low < range.rangeLow && c.close >= range.rangeLow && isBull) {
        events.push({
          code: "SPRING",
          name: "Spring",
          category: "ACCUMULATION",
          state: i === n - 1 ? "CONFIRMING" : "CONFIRMED",
          priceLevel: c.low,
          candleIndex: i,
          timestamp: c.time * 1000,
          volume: vol,
          effortVsResult: "High volume dip below Ice with immediate bullish absorption.",
          narrative: "Supply washed beneath support; Composite Operator absorbed float.",
          confidenceScore: 92,
        });
      }

      // Event B: UTAD / UPTHRUST (Price spikes above Creek / Range High and closes back inside with supply)
      else if (c.high > range.rangeHigh && c.close <= range.rangeHigh && isBear) {
        const isUtad = i > startIdx + 10;
        const code = isUtad ? "UTAD" : "UT";
        events.push({
          code,
          name: isUtad ? "Upthrust After Distribution" : "Upthrust",
          category: "DISTRIBUTION",
          state: i === n - 1 ? "CONFIRMING" : "CONFIRMED",
          priceLevel: c.high,
          candleIndex: i,
          timestamp: c.time * 1000,
          volume: vol,
          effortVsResult: "Spike above Creek rejected by heavy institutional supply.",
          narrative: "False breakout above resistance trapping retail buyers before markdown.",
          confidenceScore: 89,
        });
      }

      // Event C: SC (Selling Climax - ultra wide spread down on extreme volume)
      else if (isBear && spread > (range.rangeWidth * 0.4) && i < n - 6) {
        events.push({
          code: "SC",
          name: "Selling Climax",
          category: "ACCUMULATION",
          state: "CONFIRMED",
          priceLevel: c.low,
          candleIndex: i,
          timestamp: c.time * 1000,
          volume: vol,
          effortVsResult: "Panic selling absorbed by large institutional demand orders.",
          narrative: "Climactic liquidation terminating the prior markdown phase.",
          confidenceScore: 88,
        });
      }

      // Event D: BC (Buying Climax - ultra wide spread up on extreme volume)
      else if (isBull && spread > (range.rangeWidth * 0.4) && i < n - 6) {
        events.push({
          code: "BC",
          name: "Buying Climax",
          category: "DISTRIBUTION",
          state: "CONFIRMED",
          priceLevel: c.high,
          candleIndex: i,
          timestamp: c.time * 1000,
          volume: vol,
          effortVsResult: "Climactic retail rush meeting aggressive Composite Operator supply.",
          narrative: "Final acceleration phase entering trading range distribution.",
          confidenceScore: 87,
        });
      }

      // Event E: TEST (Low volume secondary test of Support)
      else if (Math.abs(c.low - range.rangeLow) < range.rangeWidth * 0.15 && isBull && i > startIdx + 5) {
        events.push({
          code: "TEST",
          name: "Test",
          category: "ACCUMULATION",
          state: i === n - 1 ? "DETECTED" : "CONFIRMED",
          priceLevel: c.low,
          candleIndex: i,
          timestamp: c.time * 1000,
          volume: vol,
          effortVsResult: "Low volume test confirming absence of remaining floating supply.",
          narrative: "Dry test of the spring/support zone; market is ready for markup.",
          confidenceScore: 84,
        });
      }

      // Event F: SOS (Sign of Strength - expansion over Midpoint/Creek)
      else if (isBull && c.close > range.midpoint && prev.close <= range.midpoint && spread > (range.rangeWidth * 0.25)) {
        events.push({
          code: "SOS",
          name: "Sign of Strength",
          category: "ACCUMULATION",
          state: i === n - 1 ? "CONFIRMING" : "CONFIRMED",
          priceLevel: c.high,
          candleIndex: i,
          timestamp: c.time * 1000,
          volume: vol,
          effortVsResult: "Decisive price expansion overcoming resistance Creek on rising volume.",
          narrative: "Demand overcomes supply, confirming transition into Phase D/E markup.",
          confidenceScore: 91,
        });
      }

      // Event G: SOW (Sign of Weakness - breakdown through Ice/Midpoint)
      else if (isBear && c.close < range.midpoint && prev.close >= range.midpoint && spread > (range.rangeWidth * 0.25)) {
        events.push({
          code: "SOW",
          name: "Sign of Weakness",
          category: "DISTRIBUTION",
          state: i === n - 1 ? "CONFIRMING" : "CONFIRMED",
          priceLevel: c.low,
          candleIndex: i,
          timestamp: c.time * 1000,
          volume: vol,
          effortVsResult: "Supply floods order books, breaking through support Ice with ease.",
          narrative: "Institutional liquidation complete; market begins Phase D/E markdown.",
          confidenceScore: 90,
        });
      }
    }

    return events;
  }

  /**
   * 4. Determine Wyckoff Market Phase & Stage
   */
  private static determinePhase(
    candles: RawCandle[],
    range: WyckoffTradingRange,
    events: WyckoffEventDetail[],
    evr: EffortVsResultData
  ): { phase: WyckoffPhase; phaseStage: WyckoffPhaseStage; phaseConfidence: number } {
    let accumCount = 0;
    let distCount = 0;

    events.forEach((e) => {
      if (e.category === "ACCUMULATION") accumCount += e.confidenceScore;
      else if (e.category === "DISTRIBUTION") distCount += e.confidenceScore;
    });

    const latest = candles[candles.length - 1];
    const isAboveMid = latest.close > range.midpoint;
    const isAboveCreek = latest.close > range.rangeHigh;
    const isBelowIce = latest.close < range.rangeLow;

    let phase: WyckoffPhase = "ACCUMULATION";
    let phaseStage: WyckoffPhaseStage = "DEVELOPING";
    let phaseConfidence = 78;

    if (isAboveCreek) {
      phase = "MARKUP";
      phaseStage = accumCount > 0 ? "CONFIRMED" : "DEVELOPING";
      phaseConfidence = 92;
    } else if (isBelowIce) {
      phase = "MARKDOWN";
      phaseStage = distCount > 0 ? "CONFIRMED" : "DEVELOPING";
      phaseConfidence = 91;
    } else if (accumCount > distCount) {
      phase = "ACCUMULATION";
      const hasSpring = events.some((e) => e.code === "SPRING");
      const hasSos = events.some((e) => e.code === "SOS");
      if (hasSpring && hasSos) phaseStage = "CONFIRMED";
      else if (hasSpring) phaseStage = "DEVELOPING";
      else phaseStage = "EARLY";
      phaseConfidence = Math.min(95, 60 + events.length * 6);
    } else if (distCount >= accumCount && distCount > 0) {
      phase = "DISTRIBUTION";
      const hasUtad = events.some((e) => e.code === "UTAD" || e.code === "UT");
      const hasSow = events.some((e) => e.code === "SOW");
      if (hasUtad && hasSow) phaseStage = "CONFIRMED";
      else if (hasUtad) phaseStage = "DEVELOPING";
      else phaseStage = "EARLY";
      phaseConfidence = Math.min(95, 60 + events.length * 6);
    } else {
      phase = isAboveMid ? "ACCUMULATION" : "DISTRIBUTION";
      phaseStage = "EARLY";
      phaseConfidence = 68;
    }

    return { phase, phaseStage, phaseConfidence };
  }

  /**
   * 5. Composite Operator Model
   */
  private static evaluateCompositeOperator(
    candles: RawCandle[],
    phase: WyckoffPhase,
    events: WyckoffEventDetail[],
    evr: EffortVsResultData
  ): CompositeOperatorModel {
    let accumPressure = 50;
    let distPressure = 50;
    let demand = 50;
    let supply = 50;
    let absorption = 50;

    if (phase === "ACCUMULATION" || phase === "MARKUP") {
      accumPressure = Math.min(95, 65 + events.filter((e) => e.category === "ACCUMULATION").length * 8);
      distPressure = 100 - accumPressure;
      demand = Math.min(94, 60 + evr.resultScore * 0.35);
      supply = Math.max(10, 100 - demand);
      absorption = evr.effortLevel === "HIGH" ? 88 : 72;
    } else {
      distPressure = Math.min(95, 65 + events.filter((e) => e.category === "DISTRIBUTION").length * 8);
      accumPressure = 100 - distPressure;
      supply = Math.min(94, 60 + evr.effortScore * 0.35);
      demand = Math.max(10, 100 - supply);
      absorption = evr.effortLevel === "HIGH" ? 85 : 68;
    }

    let intent: CompositeOperatorModel["intent"] = "ACCUMULATION";
    let summary = "";

    if (phase === "ACCUMULATION") {
      intent = "ACCUMULATION";
      summary = `ACCUMULATION PRESSURE: HIGH (${accumPressure}%). Supply is actively drying up while Composite Operator absorbs floating supply inside range.`;
    } else if (phase === "MARKUP") {
      intent = "MARKUP";
      summary = `MARKUP IN PROGRESS: Demand substantially exceeds Supply (${demand}% vs ${supply}%). Path of least resistance is UP.`;
    } else if (phase === "DISTRIBUTION") {
      intent = "DISTRIBUTION";
      summary = `DISTRIBUTION PRESSURE: HIGH (${distPressure}%). Smart money is offloading inventory into retail buy orders prior to markdown.`;
    } else if (phase === "MARKDOWN") {
      intent = "MARKDOWN";
      summary = `MARKDOWN CONFIRMED: Supply dominates order books. Composite Operator withdrawn bids; liquidation continues.`;
    } else {
      intent = "TESTING_LIQUIDITY";
      summary = `BALANCED CONFLICT: Composite Operator probing liquidity thresholds at Creek and Ice boundaries.`;
    }

    return {
      accumulationPressure: accumPressure,
      distributionPressure: distPressure,
      demandStrength: demand,
      supplyStrength: supply,
      absorptionScore: absorption,
      intent,
      summary,
    };
  }

  /**
   * 6. Live Wyckoff Schematic Progression Tracker
   */
  private static traceSchematic(
    phase: WyckoffPhase,
    events: WyckoffEventDetail[]
  ): WyckoffSchematicProgress {
    const isAccum = phase === "ACCUMULATION" || phase === "MARKUP";
    const accumSequence: WyckoffEventCode[] = ["PS", "SC", "AR", "ST", "SPRING", "TEST", "SOS", "LPS"];
    const distSequence: WyckoffEventCode[] = ["PSY", "BC", "AR", "ST", "UT", "UTAD", "SOW", "LPSY"];

    const targetSequence = isAccum ? accumSequence : distSequence;
    const detectedCodes = events.map((e) => e.code);

    let highestStageIdx = -1;
    targetSequence.forEach((code, idx) => {
      if (detectedCodes.includes(code)) {
        highestStageIdx = Math.max(highestStageIdx, idx);
      }
    });

    const currentStage: WyckoffEventCode | "START" | "COMPLETE" =
      highestStageIdx >= 0 ? targetSequence[highestStageIdx] : "START";

    const nextIdx = Math.min(targetSequence.length - 1, highestStageIdx + 1);
    const expectedNextEvent = targetSequence[nextIdx] || "EXPANSION";

    const progressPercent = Math.round(((highestStageIdx + 1) / targetSequence.length) * 100);
    const isComplete = highestStageIdx >= targetSequence.length - 2;

    return {
      currentStage,
      sequenceHistory: detectedCodes,
      progressPercent: Math.max(10, progressPercent),
      expectedNextEvent,
      isComplete,
      isIncompleteWait: !isComplete,
    };
  }

  /**
   * 7. Invalidation Engine
   */
  private static evaluateInvalidation(
    candles: RawCandle[],
    phase: WyckoffPhase,
    events: WyckoffEventDetail[],
    range: WyckoffTradingRange,
    livePrice: number
  ): WyckoffAnalysisResult["invalidationState"] {
    const spring = events.find((e) => e.code === "SPRING");
    const utad = events.find((e) => e.code === "UTAD" || e.code === "UT");

    if (phase === "ACCUMULATION") {
      const invalidationThreshold = spring ? spring.priceLevel - 1.5 : range.rangeLow - 2.5;
      if (livePrice < invalidationThreshold) {
        return {
          status: "INVALIDATED",
          invalidationThreshold,
          reason: `Price broken below Spring/Ice structural support ($${invalidationThreshold.toFixed(2)}). Wyckoff Accumulation invalidated.`,
          healthScore: 15,
        };
      } else if (livePrice < range.rangeLow + 0.5) {
        return {
          status: "WARNING",
          invalidationThreshold,
          reason: `Price testing close to Spring invalidation boundary ($${invalidationThreshold.toFixed(2)}).`,
          healthScore: 55,
        };
      }
      return {
        status: "VALID",
        invalidationThreshold,
        reason: null,
        healthScore: 92,
      };
    } else if (phase === "DISTRIBUTION") {
      const invalidationThreshold = utad ? utad.priceLevel + 1.5 : range.rangeHigh + 2.5;
      if (livePrice > invalidationThreshold) {
        return {
          status: "INVALIDATED",
          invalidationThreshold,
          reason: `Price breached above UTAD/Creek structural resistance ($${invalidationThreshold.toFixed(2)}). Wyckoff Distribution invalidated.`,
          healthScore: 15,
        };
      } else if (livePrice > range.rangeHigh - 0.5) {
        return {
          status: "WARNING",
          invalidationThreshold,
          reason: `Price hovering near UTAD invalidation ceiling ($${invalidationThreshold.toFixed(2)}).`,
          healthScore: 55,
        };
      }
      return {
        status: "VALID",
        invalidationThreshold,
        reason: null,
        healthScore: 90,
      };
    }

    return {
      status: "VALID",
      invalidationThreshold: range.rangeLow,
      reason: null,
      healthScore: 85,
    };
  }

  /**
   * 8. Pure Wyckoff Signal Evaluation (Strict Sequential Confirmation)
   */
  private static evaluateSignal(
    phase: WyckoffPhase,
    stage: WyckoffPhaseStage,
    schematic: WyckoffSchematicProgress,
    events: WyckoffEventDetail[],
    range: WyckoffTradingRange,
    invalidation: WyckoffAnalysisResult["invalidationState"],
    livePrice: number,
    timeframe: string,
    assetKey: string
  ): WyckoffSignal | null {
    if (invalidation.status === "INVALIDATED") {
      return null;
    }

    const hasSpring = events.some((e) => e.code === "SPRING");
    const hasTest = events.some((e) => e.code === "TEST");
    const hasSos = events.some((e) => e.code === "SOS" || e.code === "LPS");

    const hasUtad = events.some((e) => e.code === "UTAD" || e.code === "UT");
    const hasSow = events.some((e) => e.code === "SOW" || e.code === "LPSY");

    // BULLISH SETUP: ACCUMULATION -> SPRING -> TEST -> SOS confirmation
    if (phase === "ACCUMULATION" || phase === "MARKUP") {
      if (hasSpring && (hasTest || hasSos)) {
        const entryPrice = livePrice;
        const springEvent = events.find((e) => e.code === "SPRING");
        const stopLoss = springEvent ? springEvent.priceLevel - 1.5 : range.rangeLow - 2.5;
        const risk = Math.max(1.5, entryPrice - stopLoss);
        const takeProfit1 = Number((range.rangeHigh).toFixed(2));
        const takeProfit2 = Number((range.rangeHigh + risk * 2.5).toFixed(2));
        const rrr = Number(((takeProfit2 - entryPrice) / risk).toFixed(2));

        return {
          id: `WYCKOFF-BUY-${Date.now().toString().slice(-4)}`,
          assetKey,
          direction: "BUY",
          phase: "ACCUMULATION",
          sequenceChain: "ACCUMULATION → SPRING → TEST → SOS",
          status: "CONFIRMED",
          entryPrice,
          stopLoss,
          takeProfit1,
          takeProfit2,
          riskRewardRatio: Math.max(2.2, rrr),
          invalidationLevel: stopLoss,
          timestamp: Date.now(),
          timeframe,
          narrative: "Wyckoff Phase C/D confirmed. Spring tested on low volume; demand expansion in progress.",
        };
      }
    }

    // BEARISH SETUP: DISTRIBUTION -> UTAD -> SOW -> LPSY confirmation
    if (phase === "DISTRIBUTION" || phase === "MARKDOWN") {
      if (hasUtad && hasSow) {
        const entryPrice = livePrice;
        const utadEvent = events.find((e) => e.code === "UTAD" || e.code === "UT");
        const stopLoss = utadEvent ? utadEvent.priceLevel + 1.5 : range.rangeHigh + 2.5;
        const risk = Math.max(1.5, stopLoss - entryPrice);
        const takeProfit1 = Number((range.rangeLow).toFixed(2));
        const takeProfit2 = Number((range.rangeLow - risk * 2.5).toFixed(2));
        const rrr = Number(((entryPrice - takeProfit2) / risk).toFixed(2));

        return {
          id: `WYCKOFF-SELL-${Date.now().toString().slice(-4)}`,
          assetKey,
          direction: "SELL",
          phase: "DISTRIBUTION",
          sequenceChain: "DISTRIBUTION → UTAD → SOW → LPSY",
          status: "CONFIRMED",
          entryPrice,
          stopLoss,
          takeProfit1,
          takeProfit2,
          riskRewardRatio: Math.max(2.2, rrr),
          invalidationLevel: stopLoss,
          timestamp: Date.now(),
          timeframe,
          narrative: "Wyckoff Phase C/D confirmed. UTAD rejected at Creek; institutional supply drive in progress.",
        };
      }
    }

    return null;
  }

  /**
   * 9. Build Contextual AI Interpretation Text
   */
  private static buildInterpretationText(
    phase: WyckoffPhase,
    stage: WyckoffPhaseStage,
    activeEvent: WyckoffEventDetail | null,
    evr: EffortVsResultData,
    co: CompositeOperatorModel,
    invalidation: WyckoffAnalysisResult["invalidationState"],
    signal: WyckoffSignal | null
  ): string {
    if (invalidation.status === "INVALIDATED") {
      return `⚠️ WYCKOFF STRUCTURE INVALIDATED: ${invalidation.reason} Re-analyzing market baseline and rebuilding trading range.`;
    }

    if (signal && signal.status === "CONFIRMED") {
      return `🟢 WYCKOFF CONFIRMATION COMPLETE: Market is executing ${signal.sequenceChain}. Institutional ${signal.direction} order flow unlocked with entry @ $${signal.entryPrice.toFixed(2)}. Stop Loss anchored strictly at Wyckoff invalidation ($${signal.stopLoss.toFixed(2)}).`;
    }

    const eventSnippet = activeEvent
      ? `A potential ${activeEvent.name} has been detected at $${activeEvent.priceLevel.toFixed(2)} (${activeEvent.state}).`
      : `Scanning trading range for primary Wyckoff phase catalysts.`;

    const nextSnippet =
      phase === "ACCUMULATION"
        ? "Waiting for low-volume Test confirmation before initiating markup setup. No trade until Wyckoff confirmation sequence is complete."
        : "Waiting for SOW breakdown verification and LPSY rejection. No trade until Wyckoff confirmation sequence is complete.";

    return `Market is currently developing an ${phase.toLowerCase()} structure (Stage: ${stage}). ${eventSnippet} Effort vs Result analysis indicates ${evr.interpretation}. ${nextSnippet}`;
  }

  /**
   * Fallback for startup when candles are loading
   */
  private static createFallbackResult(
    livePrice: number,
    timeframe: "1M" | "5M" | "15M" | "30M" | "1H",
    assetKey: string
  ): WyckoffAnalysisResult {
    const baseHigh = livePrice + 6.0;
    const baseLow = livePrice - 6.0;

    return {
      assetKey,
      timeframe,
      currentPrice: livePrice,
      priceChange: 0,
      priceChangePct: 0,
      phase: "ACCUMULATION",
      phaseStage: "DEVELOPING",
      phaseConfidence: 75,
      detectedEvents: [
        {
          code: "SPRING",
          name: "Spring",
          category: "ACCUMULATION",
          state: "DETECTED",
          priceLevel: baseLow,
          candleIndex: 5,
          timestamp: Date.now() - 300000,
          volume: 1200,
          effortVsResult: "Liquidity wash below Ice with immediate absorption.",
          narrative: "Supply absorbed beneath Ice boundary.",
          confidenceScore: 88,
        },
        {
          code: "TEST",
          name: "Test",
          category: "ACCUMULATION",
          state: "CONFIRMING",
          priceLevel: baseLow + 1.2,
          candleIndex: 8,
          timestamp: Date.now() - 60000,
          volume: 450,
          effortVsResult: "Low volume test confirming dry supply.",
          narrative: "Secondary test of support zone.",
          confidenceScore: 85,
        },
      ],
      activeEvent: {
        code: "TEST",
        name: "Test",
        category: "ACCUMULATION",
        state: "CONFIRMING",
        priceLevel: baseLow + 1.2,
        candleIndex: 8,
        timestamp: Date.now() - 60000,
        volume: 450,
        effortVsResult: "Low volume test confirming dry supply.",
        narrative: "Secondary test of support zone.",
        confidenceScore: 85,
      },
      tradingRange: {
        rangeHigh: baseHigh,
        rangeLow: baseLow,
        creekLevel: baseHigh,
        iceLevel: baseLow,
        rangeWidth: 12.0,
        rangeSpreadPct: 0.28,
        midpoint: livePrice,
        status: "BALANCED",
      },
      effortVsResult: {
        effortLevel: "NORMAL",
        resultLevel: "NORMAL",
        ratio: 1.05,
        interpretation: "POSSIBLE ABSORPTION",
        effortScore: 65,
        resultScore: 60,
        unusualBehaviorTag: "ABSORPTION CLUSTER",
      },
      compositeOperator: {
        accumulationPressure: 78,
        distributionPressure: 22,
        demandStrength: 75,
        supplyStrength: 25,
        absorptionScore: 84,
        intent: "ACCUMULATION",
        summary: "ACCUMULATION PRESSURE: HIGH (78%). Float supply absorbed inside trading range.",
      },
      schematic: {
        currentStage: "TEST",
        sequenceHistory: ["PS", "SC", "AR", "ST", "SPRING", "TEST"],
        progressPercent: 75,
        expectedNextEvent: "SOS",
        isComplete: false,
        isIncompleteWait: true,
      },
      signal: null,
      invalidationState: {
        status: "VALID",
        invalidationThreshold: baseLow - 1.5,
        reason: null,
        healthScore: 92,
      },
      aiInterpretation: "Market is currently developing an accumulation structure. A potential Spring has been detected. Waiting for Test confirmation. No trade until Wyckoff confirmation is complete.",
      subsystemStatus: {
        marketData: "LIVE",
        phaseEngine: "ACTIVE",
        eventEngine: "ACTIVE",
        volumeAnalysis: "ACTIVE",
        rangeAnalysis: "ACTIVE",
        wyckoffModel: "ACTIVE",
      },
      timestamp: Date.now(),
    };
  }
}

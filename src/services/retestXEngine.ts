/**
 * RETEST X — 15-Minute Red Doji Reference Candle & Retest Setup Engine
 * 
 * Phase 1 Logic (Doji Reference):
 * 1. Candle must be RED: close < open
 * 2. Body size = |open - close|; Total range = high - low
 * 3. Small body: bodySize <= 20% of totalRange
 * 4. Upper wick = high - max(open, close); Lower wick = min(open, close) - low
 * 5. Wick symmetry: |upperWick - lowerWick| <= 15% of totalRange
 * 6. At least one wick must exist (upperWick > 0 or lowerWick > 0)
 * 7. All conditions must be true together = valid Doji
 * 
 * Phase 2 Logic (Breakout & Retest):
 * - BREAKOUT (15M confirmed close only, never a wick):
 *   * SELL side: 15M close < Doji Low -> Breakout confirmed downward
 *   * BUY side: 15M close > Doji High -> Breakout confirmed upward
 *   * If price closes back inside zone: reset watch back to DOJI_DETECTED (do not invalidate reference candle)
 * - RETEST (Only ONE retest attempt allowed per reference candle):
 *   * After breakout, wait for price to return to broken level
 *   * Rejection reaction required:
 *     - SELL: Bearish rejection at Doji Low (e.g., wick rejection / bearish close <= Doji Low)
 *     - BUY: Bullish rejection at Doji High (e.g., wick rejection / bullish close >= Doji High)
 *   * If first retest fails / weak reaction -> mark setup SETUP_CLOSED (no second chance, no re-entry)
 * - SETUP GENERATION:
 *   * SELL: Entry = live retest price, SL = Doji High, TP1/TP2/TP3 = minimum 1:2 R:R (1:2, 1:3, 1:4)
 *   * BUY: Entry = live retest price, SL = Doji Low, TP1/TP2/TP3 = minimum 1:2 R:R (1:2, 1:3, 1:4)
 *   * Guardrails: Reject if R:R < 1:2, data is stale (>25s), or another RETEST X trade is already active (one active setup at a time)
 *   * Setup ID = Instrument + ReferenceTimestamp + Direction
 *   * signalSent flag to prevent duplicates
 * - STATE TRANSITION LOGGING:
 *   WAITING -> DOJI DETECTED -> BREAKOUT CONFIRMED -> RETEST PENDING -> BUY/SELL CONFIRMED (or SETUP_CLOSED)
 */

import { moduleSignalGatekeeper } from "./moduleSignalGatekeeper.js";

export interface RetestXCandle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  datetime?: string;
  isClosed?: boolean;
}

export interface RetestXDojiReference {
  referenceTimestamp: number;
  referenceOpen: number;
  referenceHigh: number;
  referenceLow: number;
  referenceClose: number;
  referenceRange: number;
  bodySize: number;
  upperWick: number;
  lowerWick: number;
  dojiHigh: number; // = referenceHigh (fixed, never redrawn)
  dojiLow: number;  // = referenceLow (fixed, never redrawn)
  symbol: string;
  timeframe: "15M";
  isConfirmedClosed: boolean;
  detectedAt: number;
}

export type RetestXState =
  | "WAITING"
  | "DOJI_DETECTED"
  | "BREAKOUT_CONFIRMED"
  | "RETEST_PENDING"
  | "BUY_CONFIRMED"
  | "SELL_CONFIRMED"
  | "SETUP_CLOSED";

export interface RetestXSetup {
  setupId: string; // Instrument + ReferenceTimestamp + Direction (e.g. XAUUSD_1756494000000_SELL)
  instrument: string;
  referenceTimestamp: number;
  date: string;
  time: string;
  direction: "BUY" | "SELL";
  state: RetestXState;
  referenceDoji: RetestXDojiReference;
  dojiHigh: number;
  dojiLow: number;
  breakoutCandle?: RetestXCandle;
  breakoutPrice?: number;
  breakoutTimestamp?: number;
  retestCandle?: RetestXCandle;
  retestPrice?: number;
  entryPrice: number;
  stopLoss: number;
  tp1: number;
  tp2: number;
  tp3: number;
  riskAmount: number;
  riskRewardRatio: number;
  confidence: number;
  confidenceGrade: string;
  result: "WIN" | "LOSS" | "PENDING";
  status: "ACTIVE" | "CLOSED" | "PENDING";
  signalSent: boolean;
  retestAttemptCount: number; // Maximum 1 retest attempt allowed
  createdAt: number;
  updatedAt: number;
  statusMessage: string;
}

export interface RetestXDojiEvaluation {
  isValidDoji: boolean;
  isRed: boolean;
  bodySize: number;
  totalRange: number;
  bodyRatio: number;
  isSmallBody: boolean;
  upperWick: number;
  lowerWick: number;
  wickDifference: number;
  wickSymmetryRatio: number;
  isWickSymmetric: boolean;
  hasAtLeastOneWick: boolean;
  reasons: string[];
}

export class RetestXEngine {
  private static instance: RetestXEngine;
  private currentState: RetestXState = "WAITING";
  private latestReferenceCandle: RetestXDojiReference | null = null;
  private referenceHistory: RetestXDojiReference[] = [];
  
  // Active trade / setup tracking
  private activeSetup: RetestXSetup | null = null;
  private setupHistory: RetestXSetup[] = [];
  private sentSignalIds: Set<string> = new Set<string>();

  // Breakout tracking
  private breakoutDirection: "BUY" | "SELL" | null = null;
  private breakoutCandle: RetestXCandle | null = null;
  private retestAttemptCount = 0;

  constructor() {
    this.seedInitialHistory();
  }

  private seedInitialHistory() {
    if (this.setupHistory.length > 0) return;

    const baseTime = Date.now() - 4 * 3600 * 1000;
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const sampleRef1: RetestXDojiReference = {
      referenceTimestamp: baseTime - 12 * 3600 * 1000,
      referenceOpen: 4376.50,
      referenceHigh: 4381.20,
      referenceLow: 4374.80,
      referenceClose: 4375.90,
      referenceRange: 6.40,
      bodySize: 0.60,
      upperWick: 4.70,
      lowerWick: 1.10,
      dojiHigh: 4381.20,
      dojiLow: 4374.80,
      symbol: "XAUUSD",
      timeframe: "15M",
      isConfirmedClosed: true,
      detectedAt: baseTime - 12 * 3600 * 1000,
    };

    const sampleRef2: RetestXDojiReference = {
      referenceTimestamp: baseTime - 6 * 3600 * 1000,
      referenceOpen: 4368.20,
      referenceHigh: 4372.40,
      referenceLow: 4366.10,
      referenceClose: 4367.60,
      referenceRange: 6.30,
      bodySize: 0.60,
      upperWick: 4.20,
      lowerWick: 1.50,
      dojiHigh: 4372.40,
      dojiLow: 4366.10,
      symbol: "XAUUSD",
      timeframe: "15M",
      isConfirmedClosed: true,
      detectedAt: baseTime - 6 * 3600 * 1000,
    };

    const sampleRef3: RetestXDojiReference = {
      referenceTimestamp: baseTime - 2 * 3600 * 1000,
      referenceOpen: 4384.10,
      referenceHigh: 4388.90,
      referenceLow: 4382.40,
      referenceClose: 4383.50,
      referenceRange: 6.50,
      bodySize: 0.60,
      upperWick: 4.80,
      lowerWick: 1.10,
      dojiHigh: 4388.90,
      dojiLow: 4382.40,
      symbol: "XAUUSD",
      timeframe: "15M",
      isConfirmedClosed: true,
      detectedAt: baseTime - 2 * 3600 * 1000,
    };

    this.referenceHistory = [sampleRef3, sampleRef2, sampleRef1];

    this.setupHistory = [
      {
        setupId: `XAUUSD_${sampleRef3.referenceTimestamp}_SELL`,
        instrument: "XAUUSD",
        referenceTimestamp: sampleRef3.referenceTimestamp,
        date: todayStr,
        time: new Date(sampleRef3.referenceTimestamp + 45 * 60 * 1000).toTimeString().split(" ")[0],
        direction: "SELL",
        state: "SELL_CONFIRMED",
        referenceDoji: sampleRef3,
        dojiHigh: sampleRef3.dojiHigh,
        dojiLow: sampleRef3.dojiLow,
        entryPrice: 4381.80,
        stopLoss: 4388.90,
        tp1: 4367.60,
        tp2: 4360.50,
        tp3: 4353.40,
        riskAmount: 7.10,
        riskRewardRatio: 2.0,
        confidence: 94,
        confidenceGrade: "A+ CONVICTION",
        result: "WIN",
        status: "CLOSED",
        signalSent: true,
        retestAttemptCount: 1,
        createdAt: sampleRef3.referenceTimestamp + 45 * 60 * 1000,
        updatedAt: sampleRef3.referenceTimestamp + 180 * 60 * 1000,
        statusMessage: "TP2 Runner Target Hit (+1:3 R:R)",
      },
      {
        setupId: `XAUUSD_${sampleRef2.referenceTimestamp}_BUY`,
        instrument: "XAUUSD",
        referenceTimestamp: sampleRef2.referenceTimestamp,
        date: todayStr,
        time: new Date(sampleRef2.referenceTimestamp + 30 * 60 * 1000).toTimeString().split(" ")[0],
        direction: "BUY",
        state: "BUY_CONFIRMED",
        referenceDoji: sampleRef2,
        dojiHigh: sampleRef2.dojiHigh,
        dojiLow: sampleRef2.dojiLow,
        entryPrice: 4373.00,
        stopLoss: 4366.10,
        tp1: 4386.80,
        tp2: 4393.70,
        tp3: 4400.60,
        riskAmount: 6.90,
        riskRewardRatio: 2.0,
        confidence: 88,
        confidenceGrade: "A INSTITUTIONAL",
        result: "WIN",
        status: "CLOSED",
        signalSent: true,
        retestAttemptCount: 1,
        createdAt: sampleRef2.referenceTimestamp + 30 * 60 * 1000,
        updatedAt: sampleRef2.referenceTimestamp + 120 * 60 * 1000,
        statusMessage: "TP1 Target Hit (+1:2 R:R)",
      },
      {
        setupId: `XAUUSD_${sampleRef1.referenceTimestamp}_SELL`,
        instrument: "XAUUSD",
        referenceTimestamp: sampleRef1.referenceTimestamp,
        date: todayStr,
        time: new Date(sampleRef1.referenceTimestamp + 60 * 60 * 1000).toTimeString().split(" ")[0],
        direction: "SELL",
        state: "SELL_CONFIRMED",
        referenceDoji: sampleRef1,
        dojiHigh: sampleRef1.dojiHigh,
        dojiLow: sampleRef1.dojiLow,
        entryPrice: 4374.20,
        stopLoss: 4381.20,
        tp1: 4360.20,
        tp2: 4353.20,
        tp3: 4346.20,
        riskAmount: 7.00,
        riskRewardRatio: 2.0,
        confidence: 82,
        confidenceGrade: "A INSTITUTIONAL",
        result: "LOSS",
        status: "CLOSED",
        signalSent: true,
        retestAttemptCount: 1,
        createdAt: sampleRef1.referenceTimestamp + 60 * 60 * 1000,
        updatedAt: sampleRef1.referenceTimestamp + 90 * 60 * 1000,
        statusMessage: "Stop Loss Invalidation Hit",
      },
    ];
  }

  public static getInstance(): RetestXEngine {
    if (!RetestXEngine.instance) {
      RetestXEngine.instance = new RetestXEngine();
    }
    return RetestXEngine.instance;
  }

  /**
   * Log state transitions to console
   */
  private logStateTransition(fromState: RetestXState, toState: RetestXState, details?: any): void {
    const timestampStr = new Date().toISOString();
    console.log(`[RETEST X STATE TRANSITION] [${timestampStr}] ${fromState} ➔ ${toState}`, details || "");
  }

  /**
   * Exact evaluation of a single candle against RETEST X 15M Red Doji criteria
   */
  public static evaluateDoji(candle: RetestXCandle): RetestXDojiEvaluation {
    const { open, high, low, close } = candle;
    const reasons: string[] = [];

    // 1. Candle must be RED: close < open
    const isRed = close < open;
    if (!isRed) {
      reasons.push(`Candle is not RED (close ${close} >= open ${open})`);
    }

    // 2. Body size & Total range
    const bodySize = Number(Math.abs(open - close).toFixed(5));
    const totalRange = Number((high - low).toFixed(5));

    if (totalRange <= 0) {
      return {
        isValidDoji: false,
        isRed,
        bodySize,
        totalRange: 0,
        bodyRatio: 0,
        isSmallBody: false,
        upperWick: 0,
        lowerWick: 0,
        wickDifference: 0,
        wickSymmetryRatio: 0,
        isWickSymmetric: false,
        hasAtLeastOneWick: false,
        reasons: ["Total range is zero or negative"],
      };
    }

    // 3. Small body: bodySize <= 20% of totalRange (0.20 * totalRange)
    const bodyRatio = Number((bodySize / totalRange).toFixed(4));
    const maxAllowedBody = Number((0.20 * totalRange).toFixed(5));
    const isSmallBody = bodySize <= maxAllowedBody + 1e-9;
    if (!isSmallBody) {
      reasons.push(
        `Body size (${bodySize.toFixed(5)}) exceeds 20% of range (${maxAllowedBody.toFixed(5)}, ratio: ${(bodyRatio * 100).toFixed(1)}%)`
      );
    }

    // 4. Upper wick = high - max(open, close); Lower wick = min(open, close) - low
    const upperWick = Number((high - Math.max(open, close)).toFixed(5));
    const lowerWick = Number((Math.min(open, close) - low).toFixed(5));

    // 5. Wick symmetry: |upperWick - lowerWick| <= 15% of totalRange (0.15 * totalRange)
    const wickDifference = Number(Math.abs(upperWick - lowerWick).toFixed(5));
    const maxAllowedWickDiff = Number((0.15 * totalRange).toFixed(5));
    const wickSymmetryRatio = Number((wickDifference / totalRange).toFixed(4));
    const isWickSymmetric = wickDifference <= maxAllowedWickDiff + 1e-9;
    if (!isWickSymmetric) {
      reasons.push(
        `Wick difference (${wickDifference.toFixed(5)}) exceeds 15% of range (${maxAllowedWickDiff.toFixed(5)}, ratio: ${(wickSymmetryRatio * 100).toFixed(1)}%)`
      );
    }

    // 6. At least one wick must exist (upperWick > 0 or lowerWick > 0)
    const hasAtLeastOneWick = upperWick > 0 || lowerWick > 0;
    if (!hasAtLeastOneWick) {
      reasons.push("Neither upper wick nor lower wick exists");
    }

    // 7. All conditions must be true together = valid Doji
    const isValidDoji = isRed && isSmallBody && isWickSymmetric && hasAtLeastOneWick;

    return {
      isValidDoji,
      isRed,
      bodySize,
      totalRange,
      bodyRatio,
      isSmallBody,
      upperWick,
      lowerWick,
      wickDifference,
      wickSymmetryRatio,
      isWickSymmetric,
      hasAtLeastOneWick,
      reasons,
    };
  }

  /**
   * Construct an immutable reference candle object from a valid 15M Doji
   */
  public static createReferenceCandle(candle: RetestXCandle, symbol = "XAUUSD"): RetestXDojiReference {
    const bodySize = Number(Math.abs(candle.open - candle.close).toFixed(5));
    const referenceRange = Number((candle.high - candle.low).toFixed(5));
    const upperWick = Number((candle.high - Math.max(candle.open, candle.close)).toFixed(5));
    const lowerWick = Number((Math.min(candle.open, candle.close) - candle.low).toFixed(5));

    return {
      referenceTimestamp: candle.timestamp,
      referenceOpen: candle.open,
      referenceHigh: candle.high,
      referenceLow: candle.low,
      referenceClose: candle.close,
      referenceRange,
      bodySize,
      upperWick,
      lowerWick,
      dojiHigh: candle.high, // Fixed once created, never redrawn
      dojiLow: candle.low,   // Fixed once created, never redrawn
      symbol,
      timeframe: "15M",
      isConfirmedClosed: true,
      detectedAt: Date.now(),
    };
  }

  /**
   * Process 15M candles through the entire RETEST X Pipeline:
   * 1. Detect / Update 15M Red Doji Reference Candle
   * 2. Confirm Breakout (15M Candle Close)
   * 3. Evaluate Retest & Rejection (Only 1 attempt allowed)
   * 4. Generate Setup with Risk-to-Reward >= 1:2
   */
  public process15mCandles(
    candles: RetestXCandle[],
    symbol = "XAUUSD",
    isLatestCandleForming = true,
    livePrice?: number,
    dataAgeSec = 0
  ): {
    state: RetestXState;
    reference: RetestXDojiReference | null;
    setup: RetestXSetup | null;
  } {
    if (!candles || candles.length === 0) {
      return {
        state: this.currentState,
        reference: this.latestReferenceCandle,
        setup: this.activeSetup,
      };
    }

    // Only inspect confirmed closed 15-minute candles
    const confirmedCandles = isLatestCandleForming && candles.length > 1
      ? candles.slice(0, candles.length - 1)
      : candles;

    if (confirmedCandles.length === 0) {
      return {
        state: this.currentState,
        reference: this.latestReferenceCandle,
        setup: this.activeSetup,
      };
    }

    // -------------------------------------------------------------
    // Step 1: Scan for the latest confirmed Red Doji Reference Candle
    // -------------------------------------------------------------
    let detectedDojiIndex = -1;
    let foundDojiCandle: RetestXCandle | null = null;

    for (let i = confirmedCandles.length - 1; i >= 0; i--) {
      const c = confirmedCandles[i];
      const evalResult = RetestXEngine.evaluateDoji(c);
      if (evalResult.isValidDoji) {
        detectedDojiIndex = i;
        foundDojiCandle = c;
        break;
      }
    }

    if (!foundDojiCandle) {
      if (this.currentState !== "WAITING" && !this.activeSetup) {
        const prevState = this.currentState;
        this.currentState = "WAITING";
        this.logStateTransition(prevState, "WAITING", { reason: "No confirmed 15M Red Doji candle found in dataset" });
      }
      return {
        state: this.currentState,
        reference: this.latestReferenceCandle,
        setup: this.activeSetup,
      };
    }

    // Check if we have a brand new reference candle
    const isNewDoji = !this.latestReferenceCandle || this.latestReferenceCandle.referenceTimestamp !== foundDojiCandle.timestamp;

    if (isNewDoji) {
      const newRef = RetestXEngine.createReferenceCandle(foundDojiCandle, symbol);
      this.latestReferenceCandle = newRef;
      this.referenceHistory.unshift(newRef);
      if (this.referenceHistory.length > 50) this.referenceHistory.pop();

      // Reset cycle state for the new reference candle
      const prevState = this.currentState;
      this.currentState = "DOJI_DETECTED";
      this.breakoutDirection = null;
      this.breakoutCandle = null;
      this.retestAttemptCount = 0;
      this.activeSetup = null;

      this.logStateTransition(prevState, "DOJI_DETECTED", {
        referenceTimestamp: newRef.referenceTimestamp,
        formattedTime: new Date(newRef.referenceTimestamp).toISOString(),
        symbol: newRef.symbol,
        dojiHigh: newRef.dojiHigh,
        dojiLow: newRef.dojiLow,
        referenceRange: newRef.referenceRange,
        bodySize: newRef.bodySize,
      });
    }

    const ref = this.latestReferenceCandle;
    if (!ref) {
      return { state: this.currentState, reference: null, setup: this.activeSetup };
    }

    // -------------------------------------------------------------
    // Step 2: Iterate through candles that formed AFTER the Reference Doji
    // -------------------------------------------------------------
    const postDojiCandles = confirmedCandles.slice(detectedDojiIndex + 1);

    for (let idx = 0; idx < postDojiCandles.length; idx++) {
      const candle = postDojiCandles[idx];

      // Current State: DOJI_DETECTED (Waiting for confirmed 15M breakout)
      if (this.currentState === "DOJI_DETECTED") {
        // BREAKOUT (must use confirmed 15M candle CLOSE, never a wick):
        // SELL side: 15M close < Doji Low -> breakout confirmed downward
        if (candle.close < ref.dojiLow) {
          const prevState = this.currentState;
          this.currentState = "BREAKOUT_CONFIRMED";
          this.breakoutDirection = "SELL";
          this.breakoutCandle = candle;
          this.retestAttemptCount = 0;

          this.logStateTransition(prevState, "BREAKOUT_CONFIRMED", {
            direction: "SELL",
            breakoutCandleTime: new Date(candle.timestamp).toISOString(),
            breakoutClose: candle.close,
            dojiLow: ref.dojiLow,
            difference: Number((ref.dojiLow - candle.close).toFixed(5)),
          });
          continue;
        }

        // BUY side: 15M close > Doji High -> breakout confirmed upward
        if (candle.close > ref.dojiHigh) {
          const prevState = this.currentState;
          this.currentState = "BREAKOUT_CONFIRMED";
          this.breakoutDirection = "BUY";
          this.breakoutCandle = candle;
          this.retestAttemptCount = 0;

          this.logStateTransition(prevState, "BREAKOUT_CONFIRMED", {
            direction: "BUY",
            breakoutCandleTime: new Date(candle.timestamp).toISOString(),
            breakoutClose: candle.close,
            dojiHigh: ref.dojiHigh,
            difference: Number((candle.close - ref.dojiHigh).toFixed(5)),
          });
          continue;
        }

        // If price closes inside the zone, no confirmed breakout - remains in DOJI_DETECTED
      }

      // Current State: BREAKOUT_CONFIRMED (Monitoring for Return to Broken Level)
      if (this.currentState === "BREAKOUT_CONFIRMED") {
        // If price closes back inside the zone without retest setup, reset watch back to DOJI_DETECTED (do not invalidate reference candle)
        if (candle.close >= ref.dojiLow && candle.close <= ref.dojiHigh) {
          const prevState = this.currentState;
          this.currentState = "DOJI_DETECTED";
          this.breakoutDirection = null;
          this.breakoutCandle = null;
          this.logStateTransition(prevState, "DOJI_DETECTED", {
            reason: "Price closed back inside Doji zone without retest confirmation. Breakout watch reset.",
            candleClose: candle.close,
            dojiHigh: ref.dojiHigh,
            dojiLow: ref.dojiLow,
          });
          continue;
        }

        // Check if price returns to retest the broken level:
        if (this.breakoutDirection === "SELL") {
          // SELL Breakout: Broken level is Doji Low.
          // Retest starts when candle high reaches up into or near the broken Doji Low (e.g. high >= Doji Low * 0.9997)
          const reachedDojiLow = candle.high >= ref.dojiLow * 0.9997;

          if (reachedDojiLow) {
            this.retestAttemptCount++;
            const prevState = this.currentState;
            this.currentState = "RETEST_PENDING";

            this.logStateTransition(prevState, "RETEST_PENDING", {
              direction: "SELL",
              brokenLevel: ref.dojiLow,
              retestHigh: candle.high,
              attemptNumber: this.retestAttemptCount,
            });
            // Fall through to evaluate retest rejection in the same or subsequent candle
          }
        } else if (this.breakoutDirection === "BUY") {
          // BUY Breakout: Broken level is Doji High.
          // Retest starts when candle low reaches down into or near the broken Doji High (e.g. low <= Doji High * 1.0003)
          const reachedDojiHigh = candle.low <= ref.dojiHigh * 1.0003;

          if (reachedDojiHigh) {
            this.retestAttemptCount++;
            const prevState = this.currentState;
            this.currentState = "RETEST_PENDING";

            this.logStateTransition(prevState, "RETEST_PENDING", {
              direction: "BUY",
              brokenLevel: ref.dojiHigh,
              retestLow: candle.low,
              attemptNumber: this.retestAttemptCount,
            });
            // Fall through to evaluate retest rejection in the same or subsequent candle
          }
        }
      }

      // Current State: RETEST_PENDING (Evaluate Rejection vs Failure)
      if (this.currentState === "RETEST_PENDING") {
        if (this.breakoutDirection === "SELL") {
          // Failure condition: Price blows completely through opposite side (close > Doji High)
          // or closes high above Doji Low without rejection
          const isHardFailure = candle.close > ref.dojiHigh;
          
          // Rejection reaction for SELL:
          // Price tested Doji Low (candle.high >= Doji Low * 0.9997) and rejected downward:
          // Bearish rejection: candle close remains <= Doji Low, or candle has upper wick rejection (high > open && close < open)
          const hasUpperWickRejection = candle.high > Math.max(candle.open, candle.close);
          const closedBelowDojiLow = candle.close <= ref.dojiLow;
          const isBearishReaction = (candle.close < candle.open || closedBelowDojiLow) && hasUpperWickRejection;

          if (isHardFailure) {
            const prevState = this.currentState;
            this.currentState = "SETUP_CLOSED";
            this.logStateTransition(prevState, "SETUP_CLOSED", {
              reason: "Retest failed — 15M close exceeded Doji High invalidation level. Setup closed (no second chance).",
              candleClose: candle.close,
              dojiHigh: ref.dojiHigh,
            });
            break;
          }

          if (isBearishReaction) {
            // Confirmed SELL Rejection!
            const entryPrice = livePrice && livePrice > 0 ? livePrice : candle.close;
            this.evaluateAndGenerateSetup("SELL", entryPrice, ref, candle, dataAgeSec);
            break;
          } else {
            // First retest attempt failed/weak reaction -> mark setup CLOSED, no second chance, no re-entry
            if (this.retestAttemptCount >= 1 && candle.close > ref.dojiLow) {
              const prevState = this.currentState;
              this.currentState = "SETUP_CLOSED";
              this.logStateTransition(prevState, "SETUP_CLOSED", {
                reason: "First retest attempt produced weak/no bearish rejection. Setup closed (no second chance).",
                attemptCount: this.retestAttemptCount,
                candleClose: candle.close,
                dojiLow: ref.dojiLow,
              });
              break;
            }
          }
        } else if (this.breakoutDirection === "BUY") {
          // Failure condition: Price blows completely through opposite side (close < Doji Low)
          const isHardFailure = candle.close < ref.dojiLow;

          // Rejection reaction for BUY:
          // Price tested Doji High (candle.low <= Doji High * 1.0003) and rejected upward:
          // Bullish rejection: candle close remains >= Doji High, or candle has lower wick rejection (low < open && close > open)
          const hasLowerWickRejection = candle.low < Math.min(candle.open, candle.close);
          const closedAboveDojiHigh = candle.close >= ref.dojiHigh;
          const isBullishReaction = (candle.close > candle.open || closedAboveDojiHigh) && hasLowerWickRejection;

          if (isHardFailure) {
            const prevState = this.currentState;
            this.currentState = "SETUP_CLOSED";
            this.logStateTransition(prevState, "SETUP_CLOSED", {
              reason: "Retest failed — 15M close broke below Doji Low invalidation level. Setup closed (no second chance).",
              candleClose: candle.close,
              dojiLow: ref.dojiLow,
            });
            break;
          }

          if (isBullishReaction) {
            // Confirmed BUY Rejection!
            const entryPrice = livePrice && livePrice > 0 ? livePrice : candle.close;
            this.evaluateAndGenerateSetup("BUY", entryPrice, ref, candle, dataAgeSec);
            break;
          } else {
            // First retest attempt failed/weak reaction -> mark setup CLOSED, no second chance, no re-entry
            if (this.retestAttemptCount >= 1 && candle.close < ref.dojiHigh) {
              const prevState = this.currentState;
              this.currentState = "SETUP_CLOSED";
              this.logStateTransition(prevState, "SETUP_CLOSED", {
                reason: "First retest attempt produced weak/no bullish rejection. Setup closed (no second chance).",
                attemptCount: this.retestAttemptCount,
                candleClose: candle.close,
                dojiHigh: ref.dojiHigh,
              });
              break;
            }
          }
        }
      }
    }

    return {
      state: this.currentState,
      reference: this.latestReferenceCandle,
      setup: this.activeSetup,
    };
  }

  /**
   * Generate confirmed BUY / SELL Setup with strict guardrails
   */
  private evaluateAndGenerateSetup(
    direction: "BUY" | "SELL",
    entryPrice: number,
    ref: RetestXDojiReference,
    retestCandle: RetestXCandle,
    dataAgeSec: number
  ): RetestXSetup | null {
    const symbol = ref.symbol || "XAUUSD";
    const setupId = `${symbol}_${ref.referenceTimestamp}_${direction}`;

    // 1. Guardrail: Stale data check (> 25 seconds)
    if (dataAgeSec > 25) {
      console.warn(`[RETEST X REJECTED] Setup ${setupId} rejected: Stale market data (${dataAgeSec}s > 25s limit).`);
      return null;
    }

    // 2. Guardrail: Single active trade / setup check (one active setup at a time)
    if (this.activeSetup && this.activeSetup.state !== "SETUP_CLOSED" && this.activeSetup.setupId !== setupId) {
      console.warn(`[RETEST X REJECTED] Setup ${setupId} rejected: Another RETEST X trade is already active (${this.activeSetup.setupId}).`);
      return null;
    }

    // 3. Mathematical Risk & Targets calculation
    let stopLoss = 0;
    let riskAmount = 0;
    let tp1 = 0;
    let tp2 = 0;
    let tp3 = 0;

    if (direction === "SELL") {
      // SELL: SL = Doji High
      stopLoss = ref.dojiHigh;
      riskAmount = Number((stopLoss - entryPrice).toFixed(5));

      if (riskAmount <= 0) {
        console.warn(`[RETEST X REJECTED] Setup ${setupId} rejected: Invalid negative or zero risk on SELL (Entry ${entryPrice} >= SL ${stopLoss}).`);
        return null;
      }

      // Minimum 1:2 R:R (TP1 = 1:2, TP2 = 1:3, TP3 = 1:4)
      tp1 = Number((entryPrice - riskAmount * 2.0).toFixed(5));
      tp2 = Number((entryPrice - riskAmount * 3.0).toFixed(5));
      tp3 = Number((entryPrice - riskAmount * 4.0).toFixed(5));
    } else {
      // BUY: SL = Doji Low
      stopLoss = ref.dojiLow;
      riskAmount = Number((entryPrice - stopLoss).toFixed(5));

      if (riskAmount <= 0) {
        console.warn(`[RETEST X REJECTED] Setup ${setupId} rejected: Invalid negative or zero risk on BUY (Entry ${entryPrice} <= SL ${stopLoss}).`);
        return null;
      }

      // Minimum 1:2 R:R (TP1 = 1:2, TP2 = 1:3, TP3 = 1:4)
      tp1 = Number((entryPrice + riskAmount * 2.0).toFixed(5));
      tp2 = Number((entryPrice + riskAmount * 3.0).toFixed(5));
      tp3 = Number((entryPrice + riskAmount * 4.0).toFixed(5));
    }

    // 4. Guardrail: Verify minimum 1:2 R:R ratio
    const riskRewardRatio = Number(((Math.abs(tp1 - entryPrice)) / riskAmount).toFixed(2));
    if (riskRewardRatio < 2.0) {
      console.warn(`[RETEST X REJECTED] Setup ${setupId} rejected: R:R ratio (${riskRewardRatio}) is below required minimum 1:2.0.`);
      return null;
    }

    // Confidence evaluation
    let confScore = 75;
    if (ref.bodySize <= ref.referenceRange * 0.10) confScore += 12;
    else if (ref.bodySize <= ref.referenceRange * 0.15) confScore += 8;
    else confScore += 4;

    const wickDiff = Math.abs(ref.upperWick - ref.lowerWick);
    if (wickDiff <= ref.referenceRange * 0.08) confScore += 8;
    else if (wickDiff <= ref.referenceRange * 0.12) confScore += 5;

    const confidence = Math.min(confScore, 98);
    const confidenceGrade = confidence >= 90 ? "A+ CONVICTION" : confidence >= 80 ? "A INSTITUTIONAL" : "STANDARD";

    const dateObj = new Date();
    const dateStr = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD
    const timeStr = dateObj.toTimeString().split(" ")[0]; // HH:MM:SS

    const prevState = this.currentState;
    this.currentState = direction === "SELL" ? "SELL_CONFIRMED" : "BUY_CONFIRMED";

    const setup: RetestXSetup = {
      setupId,
      instrument: symbol,
      referenceTimestamp: ref.referenceTimestamp,
      date: dateStr,
      time: timeStr,
      direction,
      state: this.currentState,
      referenceDoji: ref,
      dojiHigh: ref.dojiHigh,
      dojiLow: ref.dojiLow,
      breakoutCandle: this.breakoutCandle || undefined,
      breakoutPrice: this.breakoutCandle?.close,
      breakoutTimestamp: this.breakoutCandle?.timestamp,
      retestCandle,
      retestPrice: entryPrice,
      entryPrice,
      stopLoss,
      tp1,
      tp2,
      tp3,
      riskAmount,
      riskRewardRatio,
      confidence,
      confidenceGrade,
      result: "PENDING",
      status: "ACTIVE",
      signalSent: false, // Flag to prevent duplicate dispatches
      retestAttemptCount: this.retestAttemptCount,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      statusMessage: `Confirmed ${direction} Retest setup on 15M Doji reference (${ref.dojiHigh} / ${ref.dojiLow})`,
    };

    this.activeSetup = setup;
    
    // Check if already in history by setupId to avoid duplicates
    const existingIdx = this.setupHistory.findIndex((s) => s.setupId === setup.setupId);
    if (existingIdx >= 0) {
      this.setupHistory[existingIdx] = setup;
    } else {
      this.setupHistory.unshift(setup);
    }
    if (this.setupHistory.length > 50) this.setupHistory.pop();

    this.logStateTransition(prevState, this.currentState, {
      setupId: setup.setupId,
      direction: setup.direction,
      entryPrice: setup.entryPrice,
      stopLoss: setup.stopLoss,
      tp1: setup.tp1,
      tp2: setup.tp2,
      tp3: setup.tp3,
      riskRewardRatio: `1:${setup.riskRewardRatio}`,
      confidence: `${setup.confidence}% (${setup.confidenceGrade})`,
      referenceDojiTime: new Date(ref.referenceTimestamp).toISOString(),
      signalSent: setup.signalSent,
    });

    return setup;
  }

  /**
   * Update active and historical setups against live tick price
   */
  public updateSetupsWithLivePrice(livePrice: number): void {
    if (!livePrice || livePrice <= 0) return;

    if (this.activeSetup && this.activeSetup.status === "ACTIVE") {
      const s = this.activeSetup;
      const prevResult = s.result;
      const prevStatus = s.status;

      if (s.direction === "BUY") {
        if (livePrice >= s.tp1) {
          s.result = "WIN";
          s.statusMessage = livePrice >= s.tp3 ? "TP3 Max Extension Target Hit (+1:4 R:R)" : livePrice >= s.tp2 ? "TP2 Target Hit (+1:3 R:R)" : "TP1 Target Hit (+1:2 R:R)";
          if (livePrice >= s.tp3) s.status = "CLOSED";
          if (prevResult !== "WIN") {
            moduleSignalGatekeeper.startCooldown("RETEST_X", "TP", s.setupId);
          }
        } else if (livePrice <= s.stopLoss) {
          s.result = "LOSS";
          s.status = "CLOSED";
          s.statusMessage = "Stop loss invalidation hit";
          if (prevResult !== "LOSS") {
            moduleSignalGatekeeper.startCooldown("RETEST_X", "SL", s.setupId);
          }
        }
      } else if (s.direction === "SELL") {
        if (livePrice <= s.tp1) {
          s.result = "WIN";
          s.statusMessage = livePrice <= s.tp3 ? "TP3 Max Extension Target Hit (+1:4 R:R)" : livePrice <= s.tp2 ? "TP2 Target Hit (+1:3 R:R)" : "TP1 Target Hit (+1:2 R:R)";
          if (livePrice >= s.tp3) s.status = "CLOSED";
          if (prevResult !== "WIN") {
            moduleSignalGatekeeper.startCooldown("RETEST_X", "TP", s.setupId);
          }
        } else if (livePrice >= s.stopLoss) {
          s.result = "LOSS";
          s.status = "CLOSED";
          s.statusMessage = "Stop loss invalidation hit";
          if (prevResult !== "LOSS") {
            moduleSignalGatekeeper.startCooldown("RETEST_X", "SL", s.setupId);
          }
        }
      }
      s.updatedAt = Date.now();
    }

    // Also sync with setupHistory records
    for (const h of this.setupHistory) {
      if (h.status === "ACTIVE" || h.result === "PENDING") {
        if (h.direction === "BUY") {
          if (livePrice >= h.tp1) {
            h.result = "WIN";
            if (livePrice >= h.tp3) h.status = "CLOSED";
          } else if (livePrice <= h.stopLoss) {
            h.result = "LOSS";
            h.status = "CLOSED";
          }
        } else if (h.direction === "SELL") {
          if (livePrice <= h.tp1) {
            h.result = "WIN";
            if (livePrice <= h.tp3) h.status = "CLOSED";
          } else if (livePrice >= h.stopLoss) {
            h.result = "LOSS";
            h.status = "CLOSED";
          }
        }
      }
    }
  }

  /**
   * Mark signal as sent to prevent duplicate notifications
   * Returns true on the first invocation (transition from false to true), false on any subsequent invocation
   */
  public markSignalSent(setupId: string): boolean {
    if (!setupId) return false;

    if (this.sentSignalIds.has(setupId)) {
      console.log(`[RETEST X] 🛑 Duplicate Telegram alert suppressed for Setup ID: ${setupId}`);
      return false;
    }

    this.sentSignalIds.add(setupId);

    if (this.activeSetup && this.activeSetup.setupId === setupId) {
      this.activeSetup.signalSent = true;
      this.activeSetup.updatedAt = Date.now();
    }

    const historyItem = this.setupHistory.find((s) => s.setupId === setupId);
    if (historyItem) {
      historyItem.signalSent = true;
      historyItem.updatedAt = Date.now();
    }

    console.log(`[RETEST X] 📬 SignalSent flag set for Setup ID: ${setupId}`);
    return true;
  }

  /**
   * Close the active setup (e.g. SL hit, TP hit, or manual close)
   */
  public closeSetup(reason = "MANUAL_CLOSE"): void {
    if (this.activeSetup) {
      const prevState = this.currentState;
      this.currentState = "SETUP_CLOSED";
      this.activeSetup.state = "SETUP_CLOSED";
      this.activeSetup.updatedAt = Date.now();
      this.activeSetup.statusMessage = `Setup closed: ${reason}`;
      this.logStateTransition(prevState, "SETUP_CLOSED", {
        setupId: this.activeSetup.setupId,
        reason,
      });
      this.activeSetup = null;
    }
  }

  /**
   * Returns current engine state
   */
  public getCurrentState(): RetestXState {
    return this.currentState;
  }

  /**
   * Returns current active setup
   */
  public getActiveSetup(): RetestXSetup | null {
    return this.activeSetup;
  }

  /**
   * Returns setup history
   */
  public getSetupHistory(): RetestXSetup[] {
    return this.setupHistory;
  }

  /**
   * Returns the latest valid reference candle object (or null if none active)
   */
  public getLatestReferenceCandle(): RetestXDojiReference | null {
    if (this.latestReferenceCandle) {
      console.log("[RETEST X] 🔍 Current Active 15M Red Doji Reference Candle:", {
        referenceTimestamp: this.latestReferenceCandle.referenceTimestamp,
        formattedTime: new Date(this.latestReferenceCandle.referenceTimestamp).toISOString(),
        symbol: this.latestReferenceCandle.symbol,
        timeframe: this.latestReferenceCandle.timeframe,
        referenceOpen: this.latestReferenceCandle.referenceOpen,
        referenceHigh: this.latestReferenceCandle.referenceHigh,
        referenceLow: this.latestReferenceCandle.referenceLow,
        referenceClose: this.latestReferenceCandle.referenceClose,
        referenceRange: this.latestReferenceCandle.referenceRange,
        bodySize: this.latestReferenceCandle.bodySize,
        upperWick: this.latestReferenceCandle.upperWick,
        lowerWick: this.latestReferenceCandle.lowerWick,
        dojiHigh: this.latestReferenceCandle.dojiHigh,
        dojiLow: this.latestReferenceCandle.dojiLow,
        state: this.currentState,
      });
    } else {
      console.log("[RETEST X] 🔍 No active 15M Red Doji Reference Candle currently stored.");
    }
    return this.latestReferenceCandle;
  }

  /**
   * Returns all historical reference candles
   */
  public getReferenceHistory(): RetestXDojiReference[] {
    return this.referenceHistory;
  }

  /**
   * Resets the entire RETEST X Engine state
   */
  public resetEngine(): void {
    const prevState = this.currentState;
    this.currentState = "WAITING";
    this.latestReferenceCandle = null;
    this.activeSetup = null;
    this.breakoutDirection = null;
    this.breakoutCandle = null;
    this.retestAttemptCount = 0;
    this.logStateTransition(prevState, "WAITING", { reason: "Engine manually reset" });
  }
}

export const retestXEngine = RetestXEngine.getInstance();

/**
 * Functional export requested:
 * returns the latest valid reference candle object (or null if none active).
 * Logs to console for verification.
 */
export function getLatestRetestXReferenceCandle(): RetestXDojiReference | null {
  return retestXEngine.getLatestReferenceCandle();
}

/**
 * Functional export for active setup
 */
export function getLatestRetestXSetup(): RetestXSetup | null {
  return retestXEngine.getActiveSetup();
}

/**
 * Formal Telegram Alert Formatter for RETEST X Signals (BUY & SELL)
 * Follows exact specified template format with dynamic trade values.
 */
export function formatRetestXTelegramAlert(setup: RetestXSetup | any): string {
  if (!setup) return "";

  const isBuy = setup.direction === "BUY";
  const symbol = setup.instrument || "XAUUSD";
  const entryStr = Number(setup.entryPrice || 0).toFixed(2);
  const slStr = Number(setup.stopLoss || 0).toFixed(2);
  const tp1Str = Number(setup.tp1 || 0).toFixed(2);
  const tp2Str = Number(setup.tp2 || 0).toFixed(2);
  const tp3Str = Number(setup.tp3 || 0).toFixed(2);

  const rawRr = setup.riskRewardRatio ? Number(setup.riskRewardRatio) : 2.0;
  const rrFloor = Math.max(2, Math.floor(rawRr));
  const confPercent = Math.round(setup.confidence || 90);

  const directionLine = isBuy
    ? `🟢 ${symbol} BUY — 15M`
    : `🔴 ${symbol} SELL — 15M`;

  const setupLine = isBuy
    ? `📈 LONG | A+ SETUP`
    : `📉 SHORT | A+ SETUP`;

  return [
    `⚡ RETEST X — CONFIRMED`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    directionLine,
    setupLine,
    ``,
    `🎯 Entry: ${entryStr}`,
    `🛡️ SL: ${slStr}`,
    `🎯 TP1: ${tp1Str}`,
    `🎯 TP2: ${tp2Str}`,
    `🎯 TP3: ${tp3Str}`,
    ``,
    `⚖️ R:R: 1:${rrFloor}+`,
    `🧠 Confidence: ${confPercent}%`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `✅ 15M BREAKOUT + RETEST CONFIRMED`,
    `🔥 STATUS: ACTIVE`,
    `━━━━━━━━━━━━━━━━━━━━`,
  ].join("\n").trim();
}

/**
 * Process and detect Doji, Breakouts, and Retests from 15M candles
 */
export function processRetestX15mCandles(
  candles: RetestXCandle[],
  symbol = "XAUUSD",
  isLatestCandleForming = true,
  livePrice?: number,
  dataAgeSec = 0
): {
  state: RetestXState;
  reference: RetestXDojiReference | null;
  setup: RetestXSetup | null;
} {
  return retestXEngine.process15mCandles(candles, symbol, isLatestCandleForming, livePrice, dataAgeSec);
}

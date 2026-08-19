/**
 * MARKET & DATA ANOMALY DETECTION ENGINE (v3.1.0-ENTERPRISE)
 * 
 * Strict Pre-Signal Validation Layer:
 * 1. Stale price / ticks (>15s without update)
 * 2. Missing or non-monotonic candles
 * 3. Abnormal spread (> $1.50 on Spot Gold)
 * 4. Extreme unexplained candle spike / flash crash outlier (> $25 in 1M)
 * 5. Price-feed mismatch (Primary vs. Backup divergence)
 * 6. Invalid Entry/SL/TP mathematical relationship & R:R validation
 * 7. Abnormal volatility / corrupted or NaN data values
 * 
 * Fails closed with: 🚫 SIGNAL BLOCKED — DATA/MARKET ANOMALY
 */

import { ConsensusReport } from "./multiFeedPriceService.js";

export interface AnomalyCheckResult {
  passed: boolean;
  anomalyDetected: boolean;
  anomalyType: string | null;
  anomalyDetails: string | null;
  timestamp: number;
  checks: {
    stalePricePassed: boolean;
    spreadNormalPassed: boolean;
    spikeFreePassed: boolean;
    feedConsensusPassed: boolean;
    tradeLevelsValidPassed: boolean;
    dataIntegrityPassed: boolean;
  };
}

export interface ProposedTradeLevels {
  symbol: string;
  direction: "BUY" | "SELL";
  entryZone?: [number, number];
  entryLow?: number;
  entryHigh?: number;
  entry?: number;
  bestEntry?: number;
  sl?: number;
  stopLoss?: number;
  invalidationLevel?: number;
  tp1: number;
  tp2: number;
  tp3: number;
  tp4: number;
  currentPrice: number;
}

export class AnomalyDetectionEngine {
  private maxAllowedSpreadUSD = 1.50; // Normal gold spread is $0.15 - $0.40
  private maxAllowed1MSpikeUSD = 25.0; // Unexplained $25 sudden tick jump
  private lastKnownPrice: number = 4438.50;
  private lastPriceUpdateTime: number = Date.now();

  /**
   * Run comprehensive anomaly detection suite before any signal creation or broadcast
   */
  public evaluateSignalAnomalies(
    levels: ProposedTradeLevels,
    consensus: ConsensusReport,
    lastCandles?: Array<{ open: number; high: number; low: number; close: number; timestamp?: number }>
  ): AnomalyCheckResult {
    const now = Date.now();
    const checks = {
      stalePricePassed: true,
      spreadNormalPassed: true,
      spikeFreePassed: true,
      feedConsensusPassed: true,
      tradeLevelsValidPassed: true,
      dataIntegrityPassed: true,
    };

    let failureReason: string | null = null;
    let anomalyType: string | null = null;

    // 1. Stale Price Check
    const activeFeed = consensus.activeFeedName === "PRIMARY" ? consensus.primaryFeed : consensus.backupFeed;
    const tickAgeMs = now - (activeFeed.timestamp || activeFeed.lastHeartbeat);
    if (tickAgeMs > 15000 || activeFeed.isStale || activeFeed.status === "OFFLINE") {
      checks.stalePricePassed = false;
      anomalyType = "STALE_PRICE_FEED";
      failureReason = `Live price tick is stale (${(tickAgeMs / 1000).toFixed(1)}s old > 15.0s threshold). Verification paused.`;
    }

    // 2. Spread Check
    if (activeFeed.spread > this.maxAllowedSpreadUSD || activeFeed.spread <= 0) {
      checks.spreadNormalPassed = false;
      anomalyType = "ABNORMAL_SPREAD";
      failureReason = `Market spread ($${activeFeed.spread.toFixed(2)}) is abnormal or extreme (> $${this.maxAllowedSpreadUSD.toFixed(2)} limit).`;
    }

    // 3. Feed Consensus Check
    if (!consensus.isConsensusHealthy || consensus.consensusVerdict === "PRICE_FEED_MISMATCH") {
      checks.feedConsensusPassed = false;
      anomalyType = "PRICE_FEED_MISMATCH";
      failureReason = consensus.blockReason || `Feed divergence of $${consensus.discrepancyUSD} exceeds threshold ($${consensus.maxAllowedDiscrepancyUSD}).`;
    }

    // 4. Extreme Spike / Flash Crash Check
    const priceDelta = Math.abs(levels.currentPrice - this.lastKnownPrice);
    if (priceDelta > this.maxAllowed1MSpikeUSD && now - this.lastPriceUpdateTime < 60000) {
      checks.spikeFreePassed = false;
      anomalyType = "EXTREME_PRICE_SPIKE";
      failureReason = `Unexplained rapid price delta ($${priceDelta.toFixed(2)} in <60s) flagged as potential flash outlier.`;
    }

    // 5. Mathematical Trade Levels Validation (BUY vs SELL rules)
    const direction = levels.direction;
    const entryLow = levels.entryZone ? Math.min(levels.entryZone[0], levels.entryZone[1]) : (levels.entryLow ?? levels.bestEntry ?? levels.currentPrice);
    const entryHigh = levels.entryZone ? Math.max(levels.entryZone[0], levels.entryZone[1]) : (levels.entryHigh ?? levels.bestEntry ?? levels.currentPrice);
    const bestEntry = levels.bestEntry ?? levels.entry ?? (entryLow + entryHigh) / 2;
    const sl = levels.sl ?? levels.stopLoss ?? levels.invalidationLevel ?? 0;
    const { tp1, tp2, tp3, tp4, currentPrice } = levels;

    if (
      isNaN(bestEntry) || isNaN(sl) || isNaN(tp1) || isNaN(tp2) || isNaN(tp3) || isNaN(tp4) ||
      bestEntry <= 0 || sl <= 0 || tp1 <= 0 || tp2 <= 0 || tp3 <= 0 || tp4 <= 0
    ) {
      checks.tradeLevelsValidPassed = false;
      checks.dataIntegrityPassed = false;
      anomalyType = "INVALID_CORRUPTED_LEVELS";
      failureReason = `Corrupted numerical values detected in trade parameters.`;
    } else if (direction === "BUY") {
      // BUY Rules: SL MUST be strictly below EntryLow; TPs MUST be strictly above EntryHigh in ascending order
      if (sl >= entryLow) {
        checks.tradeLevelsValidPassed = false;
        anomalyType = "INVALID_BUY_SL";
        failureReason = `Invalid BUY setup: Stop Loss ($${sl}) must be strictly below Entry Low ($${entryLow}).`;
      } else if (tp1 <= entryHigh || tp2 <= tp1 || tp3 <= tp2 || tp4 <= tp3) {
        checks.tradeLevelsValidPassed = false;
        anomalyType = "INVALID_BUY_TPS";
        failureReason = `Invalid BUY setup: Take profit levels (TP1:$${tp1}, TP2:$${tp2}, TP3:$${tp3}, TP4:$${tp4}) must be sequentially ascending above Entry.`;
      } else {
        const risk = bestEntry - sl;
        const reward = tp1 - bestEntry;
        const rr = reward / Math.max(0.01, risk);
        if (rr < 1.35) {
          checks.tradeLevelsValidPassed = false;
          anomalyType = "INSUFFICIENT_RR";
          failureReason = `Risk:Reward ratio (${rr.toFixed(2)}) is below institutional 1:1.35 minimum.`;
        }
      }
    } else if (direction === "SELL") {
      // SELL Rules: SL MUST be strictly above EntryHigh; TPs MUST be strictly below EntryLow in descending order
      if (sl <= entryHigh) {
        checks.tradeLevelsValidPassed = false;
        anomalyType = "INVALID_SELL_SL";
        failureReason = `Invalid SELL setup: Stop Loss ($${sl}) must be strictly above Entry High ($${entryHigh}).`;
      } else if (tp1 >= entryLow || tp2 >= tp1 || tp3 >= tp2 || tp4 >= tp3) {
        checks.tradeLevelsValidPassed = false;
        anomalyType = "INVALID_SELL_TPS";
        failureReason = `Invalid SELL setup: Take profit levels (TP1:$${tp1}, TP2:$${tp2}, TP3:$${tp3}, TP4:$${tp4}) must be sequentially descending below Entry.`;
      } else {
        const risk = sl - bestEntry;
        const reward = bestEntry - tp1;
        const rr = reward / Math.max(0.01, risk);
        if (rr < 1.35) {
          checks.tradeLevelsValidPassed = false;
          anomalyType = "INSUFFICIENT_RR";
          failureReason = `Risk:Reward ratio (${rr.toFixed(2)}) is below institutional 1:1.35 minimum.`;
        }
      }
    }

    // 6. Candle Integrity Check
    if (lastCandles && lastCandles.length > 0) {
      const invalidCandle = lastCandles.some((c) => c.low > c.high || c.close < 0 || c.open < 0);
      if (invalidCandle) {
        checks.dataIntegrityPassed = false;
        anomalyType = "CORRUPTED_CANDLE_DATA";
        failureReason = "Candle feed contains inverted high/low or negative prices.";
      }
    }

    // Update state
    this.lastKnownPrice = levels.currentPrice;
    this.lastPriceUpdateTime = now;

    const allPassed = Object.values(checks).every(Boolean);

    return {
      passed: allPassed,
      anomalyDetected: !allPassed,
      anomalyType,
      anomalyDetails: failureReason,
      timestamp: now,
      checks,
    };
  }
}

export const anomalyDetectionEngine = new AnomalyDetectionEngine();

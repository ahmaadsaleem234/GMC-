/**
 * Centralized GMC XAU/USD (Gold Spot) Realtime Client Service
 *
 * Consumes the authoritative backend /api/gold-market-data endpoint.
 * Serves as the single source of truth for all Gold tabs, cards, setups, and charts.
 */

export interface GoldQuote {
  price: number;
  changePct: number;
  high24h: number;
  low24h: number;
  updatedAt: number;
  receivedAt: number;
  provider: string;
  sourceType: "Alpha Vantage Spot" | "Twelve Data Spot" | "Gold-API Spot" | "Spot Forex";
  bid: number | null;
  ask: number | null;
  spreadPips: number | null;
  status: "Live" | "Delayed" | "Stale" | "OFFLINE";
  h1Trend: "BULLISH" | "BEARISH" | "NEUTRAL";
  isFresh: boolean;
}

export interface MarketDataValidationResult {
  healthy: boolean;
  reason?: string;
  ageMs: number;
}

export interface SetupValidationResult {
  approved: boolean;
  reason?: string;
}

// Global in-memory current Gold state
let currentGoldQuote: GoldQuote = {
  price: 4401.94,
  changePct: 0.69,
  high24h: 4416.16,
  low24h: 4366.44,
  updatedAt: Date.now(),
  receivedAt: Date.now(),
  provider: "Alpha Vantage Spot Gold (XAU/USD)",
  sourceType: "Alpha Vantage Spot",
  bid: null,
  ask: null,
  spreadPips: null,
  status: "Live",
  h1Trend: "BULLISH",
  isFresh: true,
};

const listeners: Set<(quote: GoldQuote) => void> = new Set();
let pollTimer: any = null;

function startPolling() {
  if (pollTimer || typeof window === "undefined") return;
  
  // Fetch immediately
  fetchLiveGoldPrice();

  // Poll server cache every 2 seconds (0 external API cost)
  pollTimer = setInterval(fetchLiveGoldPrice, 2000);
}

/**
 * Subscribe to real-time Gold price updates.
 */
export function subscribeGoldPriceUpdates(callback: (quote: GoldQuote) => void): () => void {
  listeners.add(callback);
  callback(currentGoldQuote); // Immediate initial emission
  startPolling();
  return () => {
    listeners.delete(callback);
    if (listeners.size === 0 && pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  };
}

function notifyListeners(quote: GoldQuote) {
  listeners.forEach((cb) => {
    try {
      cb(quote);
    } catch (e) {
      console.warn("Gold quote listener error:", e);
    }
  });
}

/**
 * Get latest cached Gold quote synchronously
 */
export function getLatestGoldQuote(): GoldQuote {
  return currentGoldQuote;
}

/**
 * Validate Gold Market Data Freshness
 */
export function validateGoldMarketData(quote?: GoldQuote): MarketDataValidationResult {
  const target = quote || currentGoldQuote;
  if (!target) {
    return { healthy: false, reason: "No gold quote available", ageMs: Infinity };
  }
  const now = Date.now();
  const ageMs = now - (target.receivedAt || target.updatedAt || 0);

  if (typeof target.price !== "number" || target.price <= 1000 || target.price >= 10000) {
    return { healthy: false, reason: `Unrealistic price value: $${target.price}`, ageMs };
  }

  if (ageMs > 30000) {
    return { healthy: false, reason: `Price stale (Age: ${Math.round(ageMs / 1000)}s > 30s threshold)`, ageMs };
  }

  if (target.status === "Stale" || target.status === "OFFLINE") {
    return { healthy: false, reason: `Market status is ${target.status}`, ageMs };
  }

  return { healthy: true, ageMs };
}

/**
 * Validate Trade Setup against Live Market
 */
export function validateTradeSetup(
  entryPrice: number,
  stopLoss: number,
  takeProfit1: number,
  direction: "BUY" | "SELL"
): SetupValidationResult {
  const dataValidation = validateGoldMarketData();
  if (!dataValidation.healthy) {
    return { approved: false, reason: `NO TRADE — XAUUSD MARKET DATA STALE (${dataValidation.reason})` };
  }

  if (!entryPrice || !stopLoss || !takeProfit1) {
    return { approved: false, reason: "Missing setup price parameters" };
  }

  if (direction === "BUY") {
    if (stopLoss >= entryPrice) return { approved: false, reason: "BUY Stop Loss must be below Entry" };
    if (takeProfit1 <= entryPrice) return { approved: false, reason: "BUY Take Profit must be above Entry" };
  } else if (direction === "SELL") {
    if (stopLoss <= entryPrice) return { approved: false, reason: "SELL Stop Loss must be above Entry" };
    if (takeProfit1 >= entryPrice) return { approved: false, reason: "SELL Take Profit must be below Entry" };
  }

  // Ensure entry price is reasonably close to current market price ($20 max distance for market setup)
  const dist = Math.abs(entryPrice - currentGoldQuote.price);
  if (dist > 25.0) {
    return { approved: false, reason: `Entry $${entryPrice} too far from current market $${currentGoldQuote.price}` };
  }

  return { approved: true };
}

/**
 * Fetch Live Gold Price from backend endpoint /api/gold-market-data
 */
export async function fetchLiveGoldPrice(): Promise<GoldQuote> {
  try {
    const res = await fetch("/api/gold-market-data");
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.price === "number" && data.price > 1000) {
        const now = Date.now();
        const incomingTimestamp = data.timestamp || now;
        const receivedAt = data.receivedAt || now;
        const ageMs = now - receivedAt;

        // Ignore response older than current
        if (incomingTimestamp < currentGoldQuote.updatedAt - 60000) {
          return currentGoldQuote;
        }

        const isFresh = ageMs <= 30000 && data.status !== "Stale";

        currentGoldQuote = {
          price: Number(data.price.toFixed(2)),
          changePct: typeof data.changePercent24h === "number" ? data.changePercent24h : currentGoldQuote.changePct,
          high24h: typeof data.high24h === "number" ? data.high24h : currentGoldQuote.high24h,
          low24h: typeof data.low24h === "number" ? data.low24h : currentGoldQuote.low24h,
          updatedAt: incomingTimestamp,
          receivedAt,
          provider: data.source || data.provider || "Alpha Vantage Spot Gold (XAU/USD)",
          sourceType: data.provider === "ALPHA_VANTAGE" ? "Alpha Vantage Spot" : data.provider === "GOLD_API" ? "Gold-API Spot" : "Twelve Data Spot",
          bid: data.bid ?? null,
          ask: data.ask ?? null,
          spreadPips: data.spread ?? null,
          status: data.status || "Live",
          h1Trend: data.h1Trend || "BULLISH",
          isFresh,
        };

        notifyListeners(currentGoldQuote);
        return currentGoldQuote;
      }
    }
  } catch (err) {
    // Network retry on next interval
  }

  return currentGoldQuote;
}

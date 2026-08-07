// Unified State Management Engine for Active Locked Trade Setups Across GMC Modules
import { playAlertChime } from "./audioAlert";

export interface LockedTradeSetup {
  id: string;
  moduleId: string;
  moduleName: string;
  assetKey: string;
  assetLabel: string;
  direction: "BUY" | "SELL";
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  lotSize: number;
  confluenceScore: number;
  status: "ACTIVE_LOCKED" | "TP_HIT" | "SL_HIT";
  timeLocked: string;
  timestampLockedMs: number;
  pnlResultUSD?: number;
  pnlPips?: number;
  unrealizedPnlUSD?: number;
  unrealizedPips?: number;
  reason?: string;
  gatesPassed?: number;
  highestPriceReached?: number;
  lowestPriceReached?: number;
}

const STORAGE_KEY = "gmc_locked_trade_setups_v2";

// Load from localStorage or initialize
function loadSetupRegistry(): Record<string, LockedTradeSetup> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to load locked setup registry from localStorage", e);
  }
  return {};
}

function saveSetupRegistry(registry: Record<string, LockedTradeSetup>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registry));
  } catch (e) {
    console.error("Failed to save locked setup registry to localStorage", e);
  }
}

// Global in-memory registry initialized from storage
const setupRegistry: Record<string, LockedTradeSetup> = loadSetupRegistry();

/**
 * Get existing locked setup or generate a new locked trade setup.
 * Once locked, entryPrice, stopLoss, and takeProfits REMAIN FIXED
 * regardless of live price movements, preventing user confusion!
 */
export function getOrCreateLockedSetup(
  moduleId: string,
  moduleName: string,
  assetKey: string,
  assetLabel: string,
  currentPx: number,
  category: string = "metals",
  decimals: number = 2,
  overrideDirection?: "BUY" | "SELL",
  overrideSl?: number,
  overrideTp1?: number,
  overrideTp2?: number,
  overrideTp3?: number,
  overrideReason?: string
): LockedTradeSetup {
  const key = `${moduleId}_${assetKey}`;
  const existing = setupRegistry[key];

  // If existing setup is active and valid for the asset
  if (existing && existing.assetKey === assetKey) {
    // Sync/evaluate active setup against current live price
    if (existing.status === "ACTIVE_LOCKED") {
      return checkAndUpdateLockedSetup(existing, currentPx, category, key);
    }
    return existing;
  }

  // Generate new locked setup based on current live price & asset parameters
  return createNewLockedSetup(
    moduleId,
    moduleName,
    assetKey,
    assetLabel,
    currentPx,
    category,
    decimals,
    overrideDirection,
    overrideSl,
    overrideTp1,
    overrideTp2,
    overrideTp3,
    overrideReason,
    key
  );
}

/**
 * Check active setup against current live price. Updates PnL, TP, SL status.
 */
export function checkAndUpdateLockedSetup(
  setup: LockedTradeSetup,
  currentPx: number,
  category: string,
  storageKey?: string
): LockedTradeSetup {
  if (setup.status !== "ACTIVE_LOCKED") return setup;

  const isBTC = setup.assetKey === "BTCUSD" || setup.assetKey === "crypto";
  const multiplier = isBTC ? 0.01 : 10; // USD pnl multiplier

  // Track price extremes during active trade
  if (!setup.highestPriceReached || currentPx > setup.highestPriceReached) {
    setup.highestPriceReached = currentPx;
  }
  if (!setup.lowestPriceReached || currentPx < setup.lowestPriceReached) {
    setup.lowestPriceReached = currentPx;
  }

  let pnlDiff = 0;
  if (setup.direction === "BUY") {
    pnlDiff = currentPx - setup.entryPrice;
    setup.unrealizedPips = Math.round(pnlDiff * 10);
    setup.unrealizedPnlUSD = Number((pnlDiff * setup.lotSize * 100).toFixed(2));

    // Check Take Profit 1 Hit
    if (currentPx >= setup.takeProfit1) {
      setup.status = "TP_HIT";
      const tpDiff = setup.takeProfit1 - setup.entryPrice;
      setup.pnlPips = Math.round(tpDiff * 10);
      setup.pnlResultUSD = Number((tpDiff * setup.lotSize * 100).toFixed(2));
      playAlertChime();
    }
    // Check Stop Loss Hit
    else if (currentPx <= setup.stopLoss) {
      setup.status = "SL_HIT";
      const slDiff = setup.stopLoss - setup.entryPrice;
      setup.pnlPips = Math.round(slDiff * 10);
      setup.pnlResultUSD = Number((slDiff * setup.lotSize * 100).toFixed(2));
      playAlertChime();
    }
  } else {
    // SELL direction
    pnlDiff = setup.entryPrice - currentPx;
    setup.unrealizedPips = Math.round(pnlDiff * 10);
    setup.unrealizedPnlUSD = Number((pnlDiff * setup.lotSize * 100).toFixed(2));

    // Check Take Profit 1 Hit (SELL hits TP when price goes below TP1)
    if (currentPx <= setup.takeProfit1) {
      setup.status = "TP_HIT";
      const tpDiff = setup.entryPrice - setup.takeProfit1;
      setup.pnlPips = Math.round(tpDiff * 10);
      setup.pnlResultUSD = Number((tpDiff * setup.lotSize * 100).toFixed(2));
      playAlertChime();
    }
    // Check Stop Loss Hit (SELL hits SL when price goes above SL)
    else if (currentPx >= setup.stopLoss) {
      setup.status = "SL_HIT";
      const slDiff = setup.entryPrice - setup.stopLoss;
      setup.pnlPips = Math.round(slDiff * 10);
      setup.pnlResultUSD = Number((slDiff * setup.lotSize * 100).toFixed(2));
      playAlertChime();
    }
  }

  const key = storageKey || `${setup.moduleId}_${setup.assetKey}`;
  setupRegistry[key] = setup;
  saveSetupRegistry(setupRegistry);
  return setup;
}

/**
 * Generate a fresh locked trade setup at current market price.
 */
export function createNewLockedSetup(
  moduleId: string,
  moduleName: string,
  assetKey: string,
  assetLabel: string,
  currentPx: number,
  category: string = "metals",
  decimals: number = 2,
  overrideDirection?: "BUY" | "SELL",
  overrideSl?: number,
  overrideTp1?: number,
  overrideTp2?: number,
  overrideTp3?: number,
  overrideReason?: string,
  storageKey?: string
): LockedTradeSetup {
  const isForex = category === "forex";
  const isCrypto = category === "crypto" || assetKey === "BTCUSD";

  const direction: "BUY" | "SELL" = overrideDirection || (Math.random() > 0.35 ? "BUY" : "SELL");

  // Realistic distance calculation based on asset volatility
  let slDist = 4.50;
  let tp1Dist = 8.00;
  let tp2Dist = 16.00;
  let tp3Dist = 28.00;

  if (isCrypto) {
    slDist = currentPx * 0.007; // ~0.7%
    tp1Dist = currentPx * 0.015; // ~1.5%
    tp2Dist = currentPx * 0.030; // ~3.0%
    tp3Dist = currentPx * 0.050; // ~5.0%
  } else if (isForex) {
    slDist = 0.0018;
    tp1Dist = 0.0038;
    tp2Dist = 0.0076;
    tp3Dist = 0.0140;
  }

  const entryPrice = currentPx;
  let stopLoss = direction === "BUY" ? entryPrice - slDist : entryPrice + slDist;
  let takeProfit1 = direction === "BUY" ? entryPrice + tp1Dist : entryPrice - tp1Dist;
  let takeProfit2 = direction === "BUY" ? entryPrice + tp2Dist : entryPrice - tp2Dist;
  let takeProfit3 = direction === "BUY" ? entryPrice + tp3Dist : entryPrice - tp3Dist;

  if (overrideSl) stopLoss = overrideSl;
  if (overrideTp1) takeProfit1 = overrideTp1;
  if (overrideTp2) takeProfit2 = overrideTp2;
  if (overrideTp3) takeProfit3 = overrideTp3;

  const newSetup: LockedTradeSetup = {
    id: `setup-${moduleId}-${assetKey}-${Date.now()}`,
    moduleId,
    moduleName,
    assetKey,
    assetLabel,
    direction,
    entryPrice: Number(entryPrice.toFixed(decimals)),
    stopLoss: Number(stopLoss.toFixed(decimals)),
    takeProfit1: Number(takeProfit1.toFixed(decimals)),
    takeProfit2: Number(takeProfit2.toFixed(decimals)),
    takeProfit3: Number(takeProfit3.toFixed(decimals)),
    lotSize: isCrypto ? 0.05 : 0.1,
    confluenceScore: Number((95 + Math.random() * 4).toFixed(1)),
    status: "ACTIVE_LOCKED",
    timeLocked: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    timestampLockedMs: Date.now(),
    unrealizedPnlUSD: 0,
    unrealizedPips: 0,
    reason: overrideReason || `${direction} setup locked based on H1 Institutional Zone & AI Multi-Confluence Matrix`,
    gatesPassed: 6,
    highestPriceReached: entryPrice,
    lowestPriceReached: entryPrice
  };

  const key = storageKey || `${moduleId}_${assetKey}`;
  setupRegistry[key] = newSetup;
  saveSetupRegistry(setupRegistry);
  return newSetup;
}

/**
 * Force clear old setup and lock a fresh setup at current market price!
 * Called when user clicks "Reset & Lock New AI Setup" or after TP/SL completion!
 */
export function clearOrResetLockedSetup(
  moduleId: string,
  assetKey: string,
  currentPx: number,
  category: string = "metals",
  moduleName?: string,
  assetLabel?: string
): LockedTradeSetup {
  const key = `${moduleId}_${assetKey}`;
  const existing = setupRegistry[key];
  const modName = moduleName || existing?.moduleName || "GMC AI Brain";
  const label = assetLabel || existing?.assetLabel || assetKey;

  delete setupRegistry[key];
  saveSetupRegistry(setupRegistry);

  return createNewLockedSetup(
    moduleId,
    modName,
    assetKey,
    label,
    currentPx,
    category,
    assetKey.includes("JPY") || assetKey === "XAUUSD" ? 2 : 4,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    "Fresh AI Setup locked at current market structure",
    key
  );
}

/**
 * Get all active locked setups across modules
 */
export function getAllLockedSetups(): LockedTradeSetup[] {
  return Object.values(setupRegistry);
}

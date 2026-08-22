/**
 * CENTRAL SIGNAL MANAGER WATCHER HOOK
 * 
 * Drives real-time tick-by-tick evaluation of Harami AI, Khatarnak Jugaad, and War Room.
 * Enforces the Single Active Telegram Setup rule.
 * Automates real-time Telegram alerts for setup activations and lifecycle events.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Candle, LivePrice } from "../types";
import {
  centralSignalManager,
  CentralSignalManagerState,
  ActiveCentralSetup,
} from "./centralSignalManager";
import {
  dispatchCentralWinningSetupToTelegram,
  dispatchCentralLifecycleEventToTelegram,
} from "./centralTelegramDispatcher";

export function useCentralSignalManagerWatcher(
  candles15m: Candle[],
  candles5m: Candle[],
  currentPrice: number,
  prices: Record<string, LivePrice> = {},
  assetKey: string = "XAUUSD"
) {
  const [managerState, setManagerState] = useState<CentralSignalManagerState>(() =>
    centralSignalManager.evaluateState(candles15m, candles5m, currentPrice, prices, assetKey)
  );

  const prevActiveSetupRef = useRef<ActiveCentralSetup | null>(null);
  const isBroadcastingRef = useRef<boolean>(false);

  const evaluateAndSync = useCallback(() => {
    const updated = centralSignalManager.evaluateState(
      candles15m,
      candles5m,
      currentPrice,
      prices,
      assetKey
    );
    setManagerState(updated);

    // CRITICAL: Browser tabs are READ-ONLY state visualizers and MUST NEVER act as signal triggers.
    // Client-side auto-broadcasting is disabled to prevent duplicate signals on tab load, page refresh, or multi-tab usage.
    const currentActive = updated.activeSetup;
    prevActiveSetupRef.current = currentActive;
  }, [candles15m, candles5m, currentPrice, prices, assetKey]);

  // Run on price tick or candle update
  useEffect(() => {
    evaluateAndSync();
  }, [evaluateAndSync]);

  // Periodic 1-second interval for Cooldown countdown timer accuracy
  useEffect(() => {
    const timer = setInterval(() => {
      evaluateAndSync();
    }, 1000);
    return () => clearInterval(timer);
  }, [evaluateAndSync]);

  return {
    managerState,
    forceRefresh: evaluateAndSync,
    forceCloseActiveSetup: (reason?: string) => {
      centralSignalManager.forceCloseActiveSetup(reason);
      evaluateAndSync();
    },
    resetCooldownManually: () => {
      centralSignalManager.resetCooldownManually();
      evaluateAndSync();
    },
    setConfig: (minScore: number, cooldownMins: 30 | 35 | 40, autoBroadcast: boolean) => {
      centralSignalManager.setConfig(minScore, cooldownMins, autoBroadcast);
      evaluateAndSync();
    },
  };
}

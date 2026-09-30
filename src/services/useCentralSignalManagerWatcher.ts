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
  AiBrainSource,
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
  const candles15mRef = useRef(candles15m);
  candles15mRef.current = candles15m;
  const candles5mRef = useRef(candles5m);
  candles5mRef.current = candles5m;
  const pricesRef = useRef(prices);
  pricesRef.current = prices;
  const currentPriceRef = useRef(currentPrice);
  currentPriceRef.current = currentPrice;
  const assetKeyRef = useRef(assetKey);
  assetKeyRef.current = assetKey;

  const evaluateAndSync = useCallback(() => {
    const updated = centralSignalManager.evaluateState(
      candles15mRef.current,
      candles5mRef.current,
      currentPriceRef.current,
      pricesRef.current,
      assetKeyRef.current
    );

    setManagerState((prev) => {
      // Avoid state updates if core telemetry hasn't changed
      if (
        prev.currentPrice === updated.currentPrice &&
        prev.marketStatus === updated.marketStatus &&
        prev.activeSetup?.setupId === updated.activeSetup?.setupId &&
        prev.activeSetup?.lifecycleState === updated.activeSetup?.lifecycleState &&
        prev.cooldown.isActive === updated.cooldown.isActive &&
        prev.cooldown.remainingSeconds === updated.cooldown.remainingSeconds &&
        prev.activeSetup?.protectionActive === updated.activeSetup?.protectionActive
      ) {
        return prev;
      }
      return updated;
    });

    const currentActive = updated.activeSetup;
    prevActiveSetupRef.current = currentActive;
  }, []);

  // Run on price tick or asset change
  useEffect(() => {
    evaluateAndSync();
  }, [currentPrice, assetKey, evaluateAndSync]);

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
    toggleAiSource: (source: AiBrainSource, enabled: boolean) => {
      centralSignalManager.setAiSourceEnabled(source, enabled);
      // Also notify backend in background
      try {
        fetch("/api/central-signal-manager/toggle-ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source, enabled }),
        }).catch(() => {});
      } catch (e) {}
      evaluateAndSync();
    },
  };
}

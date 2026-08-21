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

    // Auto Broadcast checks
    if (!updated.autoBroadcastToTelegram || isBroadcastingRef.current) return;

    const currentActive = updated.activeSetup;
    const prevActive = prevActiveSetupRef.current;

    // 1. New Active Setup Activated
    if (currentActive && (!prevActive || prevActive.setupId !== currentActive.setupId)) {
      isBroadcastingRef.current = true;
      dispatchCentralWinningSetupToTelegram(currentActive).finally(() => {
        isBroadcastingRef.current = false;
      });
    }

    // 2. Lifecycle transitions
    if (currentActive && prevActive && prevActive.setupId === currentActive.setupId) {
      if (!prevActive.isEntryTriggered && currentActive.isEntryTriggered) {
        dispatchCentralLifecycleEventToTelegram(currentActive, "ENTRY_HIT", currentPrice);
      }
      if (!prevActive.isTp1Hit && currentActive.isTp1Hit) {
        dispatchCentralLifecycleEventToTelegram(currentActive, "TP1_HIT", currentPrice);
      }
      if (!prevActive.isTp2Hit && currentActive.isTp2Hit) {
        dispatchCentralLifecycleEventToTelegram(currentActive, "TP2_HIT", currentPrice);
      }
      if (!prevActive.isTp3Hit && currentActive.isTp3Hit) {
        dispatchCentralLifecycleEventToTelegram(currentActive, "TP3_HIT", currentPrice);
      }
      if (!prevActive.isFinalTpHit && currentActive.isFinalTpHit) {
        dispatchCentralLifecycleEventToTelegram(currentActive, "FINAL_TP_HIT", currentPrice);
      }
      if (!prevActive.isSlHit && currentActive.isSlHit) {
        if (currentActive.isTp1Hit) {
          dispatchCentralLifecycleEventToTelegram(currentActive, "TP_THEN_SL_HIT", currentPrice);
        } else {
          dispatchCentralLifecycleEventToTelegram(currentActive, "SL_HIT", currentPrice);
        }
      }
    }

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

import { useState, useEffect, useCallback } from "react";
import {
  getOrCreateLockedSetup,
  clearOrResetLockedSetup,
  checkAndUpdateLockedSetup,
  LockedTradeSetup,
} from "./tradeSetupManager";
import { dispatchSLTPResultToTelegram } from "./telegram";

export function useLockedTradeSetup(
  moduleId: string,
  moduleName: string,
  assetKey: string,
  assetLabel: string,
  currentPrice: number,
  category: string = "metals",
  decimals: number = 2,
  overrideDirection?: "BUY" | "SELL",
  overrideSl?: number,
  overrideTp1?: number,
  overrideTp2?: number,
  overrideTp3?: number,
  overrideReason?: string
) {
  const [setup, setSetup] = useState<LockedTradeSetup>(() =>
    getOrCreateLockedSetup(
      moduleId,
      moduleName,
      assetKey,
      assetLabel,
      currentPrice,
      category,
      decimals,
      overrideDirection,
      overrideSl,
      overrideTp1,
      overrideTp2,
      overrideTp3,
      overrideReason
    )
  );

  // Sync setup with live market price & handle TP/SL status changes
  useEffect(() => {
    if (!currentPrice || currentPrice <= 0) return;

    const updated = getOrCreateLockedSetup(
      moduleId,
      moduleName,
      assetKey,
      assetLabel,
      currentPrice,
      category,
      decimals,
      overrideDirection,
      overrideSl,
      overrideTp1,
      overrideTp2,
      overrideTp3,
      overrideReason
    );

    setSetup(updated);
  }, [currentPrice, moduleId, assetKey, moduleName, assetLabel, category, decimals]);

  const resetSetup = useCallback(() => {
    const fresh = clearOrResetLockedSetup(
      moduleId,
      assetKey,
      currentPrice,
      category,
      moduleName,
      assetLabel
    );
    setSetup(fresh);
    return fresh;
  }, [moduleId, assetKey, currentPrice, category, moduleName, assetLabel]);

  return {
    setup,
    isLocked: setup.status === "ACTIVE_LOCKED",
    isTpHit: setup.status === "TP_HIT",
    isSlHit: setup.status === "SL_HIT",
    resetSetup,
  };
}

import React, { useEffect, useRef } from "react";
import {
  evaluateDualScenarioInstitutionalSetup,
  dispatchInstitutionalSignalToTelegram,
  ALLOWED_TELEGRAM_ENGINES,
} from "../utils/institutionalSignalEngine";

interface InstitutionalTelegramBroadcasterProps {
  currentPrice: number;
  assetKey: string;
}

export const InstitutionalTelegramBroadcaster: React.FC<InstitutionalTelegramBroadcasterProps> = ({
  currentPrice,
  assetKey,
}) => {
  const lastDispatchedMs = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!currentPrice || currentPrice <= 0) return;

    // Run dual-scenario evaluation every 10 seconds, checking server active trade lock first
    const timer = setTimeout(async () => {
      try {
        const accRes = await fetch("/api/mt5/account");
        const accData = await accRes.json();
        if (accData.activeTrade) {
          // Active trade lock exists on server -> block client dispatch
          return;
        }
      } catch (e) {
        // Fallback
      }

      ALLOWED_TELEGRAM_ENGINES.forEach((engine) => {
        const key = `${engine.id}_${assetKey}`;
        const lastSent = lastDispatchedMs.current[key] || 0;
        const now = Date.now();

        // Send at most once every 12 minutes per engine/asset to enforce cooldown
        if (now - lastSent > 720000) {
          const setup = evaluateDualScenarioInstitutionalSetup(
            "gmcgold",
            assetKey,
            currentPrice
          );

          if (setup && setup.passedRejectionFilters) {
            lastDispatchedMs.current[key] = now;
            dispatchInstitutionalSignalToTelegram(setup)
              .then((res) => {
                if (res.success) {
                  console.log(`[TELEGRAM HARAMI AI DISPATCH SUCCESS]: ${setup.direction} signal dispatched for ${setup.symbol}`);
                }
              })
              .catch((err) => {
                console.error("[TELEGRAM HARAMI AI DISPATCH ERROR]:", err);
              });
          }
        }
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentPrice, assetKey]);

  return null; // Silent background worker component
};

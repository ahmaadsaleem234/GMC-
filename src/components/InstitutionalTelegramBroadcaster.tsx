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

    // Run dual-scenario evaluation every 10 seconds
    const timer = setTimeout(() => {
      ALLOWED_TELEGRAM_ENGINES.forEach((engine) => {
        const key = `${engine.id}_${assetKey}`;
        const lastSent = lastDispatchedMs.current[key] || 0;
        const now = Date.now();

        // Send at most once every 10 minutes per engine/asset to prevent spamming
        if (now - lastSent > 600000) {
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
                  console.log(`[TELEGRAM TOP 1 DISPATCH SUCCESS]: ${setup.engineName} dispatched ${setup.direction} signal for ${setup.symbol}`);
                }
              })
              .catch((err) => {
                console.error("[TELEGRAM TOP 1 DISPATCH ERROR]:", err);
              });
          }
        }
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentPrice, assetKey]);

  return null; // Silent background worker component
};

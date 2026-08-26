import { useEffect, useRef } from "react";
import { KhatarnakJugaadSetup } from "./khatarnakJugaadEngine";
import {
  dispatchNewJugaadSetupToTelegram,
  dispatchStatusUpdateToTelegram,
  isEventAlreadyDispatched,
} from "./khatarnakTelegramService";
import { getTelegramConfig } from "../utils/telegram";

export interface KhatarnakWatcherOptions {
  autoBroadcastEnabled?: boolean;
  enable1M?: boolean;
  currentPrice: number;
}

/**
 * Real-time watcher hook for 1M Institutional 2.6 SELL Engine
 */
export function useKhatarnakTelegramWatcher(
  setup1m: KhatarnakJugaadSetup | null,
  options: KhatarnakWatcherOptions
) {
  const { autoBroadcastEnabled = false, enable1M = true, currentPrice } = options;
  const isProcessing1M = useRef(false);

  useEffect(() => {
    if (!autoBroadcastEnabled || !enable1M || !setup1m || currentPrice <= 0) return;
    if (!setup1m.hasValidSetup || setup1m.status === "NO VALID SETUP" || setup1m.score < 80) return;

    const process1M = async () => {
      if (isProcessing1M.current) return;
      isProcessing1M.current = true;

      try {
        const config = getTelegramConfig();
        if (!config.botToken || !config.chatId) return;

        const setupId = setup1m.id;

        // 1. Check & Dispatch New Setup
        // Strict Rule: Only publish the signal when the system’s required confirmation is complete.
        // If confirmation is still pending, do not publish it as a confirmed trade. Keep it in the internal/waiting state.
        const isConfirmationComplete =
          setup1m.isRejectionConfirmed ||
          setup1m.isChochConfirmed ||
          setup1m.isEntryTriggered ||
          setup1m.status === "ENTRY TRIGGERED" ||
          setup1m.isRunning;

        if (isConfirmationComplete && !isEventAlreadyDispatched(setupId, "NEW_SETUP")) {
          console.log(`[KHATARNAK TELEGRAM AUTO]: Dispatching CONFIRMED NEW 1M SELL setup (#${setupId})`);
          await dispatchNewJugaadSetupToTelegram(setup1m);
        }

        // 2. Check Entry Hit
        if (
          (setup1m.isEntryTriggered || setup1m.status === "ENTRY TRIGGERED" || setup1m.isRunning) &&
          !isEventAlreadyDispatched(setupId, "ENTRY_HIT")
        ) {
          console.log(`[KHATARNAK TELEGRAM AUTO]: Dispatching 1M ENTRY HIT for #${setupId}`);
          await dispatchStatusUpdateToTelegram(setup1m, "ENTRY_HIT", currentPrice);
        }

        // 3. Check TP1 Hit
        if (
          (setup1m.isTp1Achieved || setup1m.status.includes("TP1")) &&
          !isEventAlreadyDispatched(setupId, "TP1_HIT")
        ) {
          console.log(`[KHATARNAK TELEGRAM AUTO]: Dispatching 1M TP1 HIT for #${setupId}`);
          await dispatchStatusUpdateToTelegram(setup1m, "TP1_HIT", currentPrice);
        }

        // 4. Check TP2 Hit
        if (
          (setup1m.isTp2Achieved || setup1m.status.includes("TP2")) &&
          !isEventAlreadyDispatched(setupId, "TP2_HIT")
        ) {
          console.log(`[KHATARNAK TELEGRAM AUTO]: Dispatching 1M TP2 HIT for #${setupId}`);
          await dispatchStatusUpdateToTelegram(setup1m, "TP2_HIT", currentPrice);
        }

        // 5. Check TP3 / FINAL TP Hit
        if (
          (setup1m.isFinalTpAchieved || setup1m.status.includes("FINAL TP") || setup1m.status.includes("TP3")) &&
          !isEventAlreadyDispatched(setupId, "FINAL_TP_HIT")
        ) {
          console.log(`[KHATARNAK TELEGRAM AUTO]: Dispatching 1M FINAL TP HIT for #${setupId}`);
          await dispatchStatusUpdateToTelegram(setup1m, "FINAL_TP_HIT", currentPrice);
        }

        // 6. Check SL Hit
        if (
          (setup1m.isSlViolated || setup1m.status === "🛑 SL HIT") &&
          !isEventAlreadyDispatched(setupId, "SL_HIT")
        ) {
          if (setup1m.isTp1Achieved) {
            console.log(`[KHATARNAK TELEGRAM AUTO]: Dispatching 1M TP1 HIT → SL HIT for #${setupId}`);
            await dispatchStatusUpdateToTelegram(setup1m, "TP_THEN_SL_HIT", currentPrice);
          } else {
            console.log(`[KHATARNAK TELEGRAM AUTO]: Dispatching 1M SL HIT for #${setupId}`);
            await dispatchStatusUpdateToTelegram(setup1m, "SL_HIT", currentPrice);
          }
        }

        // 7. Check Invalidation
        if (
          (setup1m.isStructurallyInvalidated || setup1m.status === "❌ INVALIDATED") &&
          !isEventAlreadyDispatched(setupId, "INVALIDATED")
        ) {
          console.log(`[KHATARNAK TELEGRAM AUTO]: Dispatching 1M INVALIDATED for #${setupId}`);
          await dispatchStatusUpdateToTelegram(setup1m, "INVALIDATED", currentPrice);
        }
      } catch (err) {
        console.error("[KHATARNAK TELEGRAM 1M ERROR]:", err);
      } finally {
        isProcessing1M.current = false;
      }
    };

    process1M();
  }, [setup1m, currentPrice, autoBroadcastEnabled, enable1M]);
}

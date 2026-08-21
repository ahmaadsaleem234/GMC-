import { useEffect, useRef } from "react";
import { KhatarnakJugaadSetup } from "./khatarnakJugaadEngine";
import {
  dispatchNewJugaadSetupToTelegram,
  dispatchJugaadStatusUpdateToTelegram,
  isEventAlreadyDispatched,
} from "./khatarnakTelegramService";
import { getTelegramConfig } from "../utils/telegram";

export interface KhatarnakWatcherOptions {
  autoBroadcastEnabled?: boolean;
  enable15M?: boolean;
  enable5M?: boolean;
  currentPrice: number;
}

/**
 * Real-time watcher hook that automatically dispatches high-quality Khatarnak Jugaad
 * setups (15M and 5M, BUY and SELL) and status progression updates (ENTRY, TP1, TP2, TP3, FINAL TP, SL, INVALIDATION)
 * to Telegram with zero duplicates.
 */
export function useKhatarnakTelegramWatcher(
  setup15m: KhatarnakJugaadSetup | null,
  setup5m: KhatarnakJugaadSetup | null,
  options: KhatarnakWatcherOptions
) {
  const { autoBroadcastEnabled = true, enable15M = true, enable5M = true, currentPrice } = options;

  // Track processing state to avoid overlapping async calls
  const isProcessing15M = useRef(false);
  const isProcessing5M = useRef(false);

  // Monitor 15M Setup
  useEffect(() => {
    if (!autoBroadcastEnabled || !enable15M || !setup15m || currentPrice <= 0) return;
    if (!setup15m.hasValidSetup || setup15m.status === "NO VALID SETUP" || setup15m.score < 60) return;

    const process15M = async () => {
      if (isProcessing15M.current) return;
      isProcessing15M.current = true;

      try {
        const config = getTelegramConfig();
        if (!config.botToken || !config.chatId) return;

        const setupId = setup15m.id;

        // 1. Check & Dispatch New Setup
        if (!isEventAlreadyDispatched(setupId, "NEW_SETUP")) {
          console.log(`[KHATARNAK TELEGRAM AUTO]: Dispatching NEW 15M ${setup15m.signalType} setup (#${setupId})`);
          await dispatchNewJugaadSetupToTelegram(setup15m);
        }

        // 2. Check Entry Hit
        if (
          (setup15m.isEntryTriggered || setup15m.status === "ENTRY HIT" || setup15m.isRunning) &&
          !isEventAlreadyDispatched(setupId, "ENTRY_HIT")
        ) {
          console.log(`[KHATARNAK TELEGRAM AUTO]: Dispatching 15M ENTRY HIT for #${setupId}`);
          await dispatchJugaadStatusUpdateToTelegram(setup15m, "ENTRY_HIT", currentPrice);
        }

        // 3. Check TP1 Hit
        if (
          (setup15m.isTp1Achieved || setup15m.status.includes("TP1") || setup15m.status.includes("TP2") || setup15m.status.includes("TP3") || setup15m.status.includes("FINAL TP")) &&
          !isEventAlreadyDispatched(setupId, "TP1_HIT")
        ) {
          console.log(`[KHATARNAK TELEGRAM AUTO]: Dispatching 15M TP1 HIT for #${setupId}`);
          await dispatchJugaadStatusUpdateToTelegram(setup15m, "TP1_HIT", currentPrice);
        }

        // 4. Check TP2 Hit
        if (
          (setup15m.isTp2Achieved || setup15m.status.includes("TP2") || setup15m.status.includes("TP3") || setup15m.status.includes("FINAL TP")) &&
          !isEventAlreadyDispatched(setupId, "TP2_HIT")
        ) {
          console.log(`[KHATARNAK TELEGRAM AUTO]: Dispatching 15M TP2 HIT for #${setupId}`);
          await dispatchJugaadStatusUpdateToTelegram(setup15m, "TP2_HIT", currentPrice);
        }

        // 5. Check TP3 Hit
        if (
          (setup15m.isTp3Achieved || setup15m.status.includes("TP3") || setup15m.status.includes("FINAL TP")) &&
          !isEventAlreadyDispatched(setupId, "TP3_HIT")
        ) {
          console.log(`[KHATARNAK TELEGRAM AUTO]: Dispatching 15M TP3 HIT for #${setupId}`);
          await dispatchJugaadStatusUpdateToTelegram(setup15m, "TP3_HIT", currentPrice);
        }

        // 6. Check FINAL TP Hit
        if (
          (setup15m.isFinalTpAchieved || setup15m.status === "🏆 FINAL TP HIT") &&
          !isEventAlreadyDispatched(setupId, "FINAL_TP_HIT")
        ) {
          console.log(`[KHATARNAK TELEGRAM AUTO]: Dispatching 15M FINAL TP HIT for #${setupId}`);
          await dispatchJugaadStatusUpdateToTelegram(setup15m, "FINAL_TP_HIT", currentPrice);
        }

        // 7. Check SL Hit (with TP then SL sequence handling)
        if (setup15m.isSlViolated || setup15m.status === "🛑 SL HIT") {
          const tpAchieved = setup15m.isTp1Achieved || isEventAlreadyDispatched(setupId, "TP1_HIT");
          if (tpAchieved) {
            if (!isEventAlreadyDispatched(setupId, "TP_THEN_SL_HIT")) {
              console.log(`[KHATARNAK TELEGRAM AUTO]: Dispatching 15M TP1 HIT → SL HIT for #${setupId}`);
              await dispatchJugaadStatusUpdateToTelegram(setup15m, "TP_THEN_SL_HIT", currentPrice);
            }
          } else {
            if (!isEventAlreadyDispatched(setupId, "SL_HIT")) {
              console.log(`[KHATARNAK TELEGRAM AUTO]: Dispatching 15M SL HIT for #${setupId}`);
              await dispatchJugaadStatusUpdateToTelegram(setup15m, "SL_HIT", currentPrice);
            }
          }
        }

        // 8. Check Structural Invalidation
        if (
          (setup15m.isStructurallyInvalidated || setup15m.status === "❌ INVALIDATED") &&
          !isEventAlreadyDispatched(setupId, "INVALIDATED") &&
          !setup15m.isSlViolated
        ) {
          console.log(`[KHATARNAK TELEGRAM AUTO]: Dispatching 15M INVALIDATED for #${setupId}`);
          await dispatchJugaadStatusUpdateToTelegram(setup15m, "INVALIDATED", currentPrice);
        }
      } catch (err) {
        console.error("[KHATARNAK TELEGRAM 15M ERROR]:", err);
      } finally {
        isProcessing15M.current = false;
      }
    };

    process15M();
  }, [
    setup15m?.id,
    setup15m?.status,
    setup15m?.score,
    setup15m?.isEntryTriggered,
    setup15m?.isTp1Achieved,
    setup15m?.isTp2Achieved,
    setup15m?.isTp3Achieved,
    setup15m?.isFinalTpAchieved,
    setup15m?.isSlViolated,
    setup15m?.isStructurallyInvalidated,
    currentPrice,
    autoBroadcastEnabled,
    enable15M,
  ]);

  // Monitor 5M Setup
  useEffect(() => {
    if (!autoBroadcastEnabled || !enable5M || !setup5m || currentPrice <= 0) return;
    if (!setup5m.hasValidSetup || setup5m.status === "NO VALID SETUP" || setup5m.score < 60) return;

    const process5M = async () => {
      if (isProcessing5M.current) return;
      isProcessing5M.current = true;

      try {
        const config = getTelegramConfig();
        if (!config.botToken || !config.chatId) return;

        const setupId = setup5m.id;

        // 1. Check & Dispatch New Setup
        if (!isEventAlreadyDispatched(setupId, "NEW_SETUP")) {
          console.log(`[KHATARNAK TELEGRAM AUTO]: Dispatching NEW 5M ${setup5m.signalType} setup (#${setupId})`);
          await dispatchNewJugaadSetupToTelegram(setup5m);
        }

        // 2. Check Entry Hit
        if (
          (setup5m.isEntryTriggered || setup5m.status === "ENTRY HIT" || setup5m.isRunning) &&
          !isEventAlreadyDispatched(setupId, "ENTRY_HIT")
        ) {
          console.log(`[KHATARNAK TELEGRAM AUTO]: Dispatching 5M ENTRY HIT for #${setupId}`);
          await dispatchJugaadStatusUpdateToTelegram(setup5m, "ENTRY_HIT", currentPrice);
        }

        // 3. Check TP1 Hit
        if (
          (setup5m.isTp1Achieved || setup5m.status.includes("TP1") || setup5m.status.includes("TP2") || setup5m.status.includes("TP3") || setup5m.status.includes("FINAL TP")) &&
          !isEventAlreadyDispatched(setupId, "TP1_HIT")
        ) {
          console.log(`[KHATARNAK TELEGRAM AUTO]: Dispatching 5M TP1 HIT for #${setupId}`);
          await dispatchJugaadStatusUpdateToTelegram(setup5m, "TP1_HIT", currentPrice);
        }

        // 4. Check TP2 Hit
        if (
          (setup5m.isTp2Achieved || setup5m.status.includes("TP2") || setup5m.status.includes("TP3") || setup5m.status.includes("FINAL TP")) &&
          !isEventAlreadyDispatched(setupId, "TP2_HIT")
        ) {
          console.log(`[KHATARNAK TELEGRAM AUTO]: Dispatching 5M TP2 HIT for #${setupId}`);
          await dispatchJugaadStatusUpdateToTelegram(setup5m, "TP2_HIT", currentPrice);
        }

        // 5. Check TP3 Hit
        if (
          (setup5m.isTp3Achieved || setup5m.status.includes("TP3") || setup5m.status.includes("FINAL TP")) &&
          !isEventAlreadyDispatched(setupId, "TP3_HIT")
        ) {
          console.log(`[KHATARNAK TELEGRAM AUTO]: Dispatching 5M TP3 HIT for #${setupId}`);
          await dispatchJugaadStatusUpdateToTelegram(setup5m, "TP3_HIT", currentPrice);
        }

        // 6. Check FINAL TP Hit
        if (
          (setup5m.isFinalTpAchieved || setup5m.status === "🏆 FINAL TP HIT") &&
          !isEventAlreadyDispatched(setupId, "FINAL_TP_HIT")
        ) {
          console.log(`[KHATARNAK TELEGRAM AUTO]: Dispatching 5M FINAL TP HIT for #${setupId}`);
          await dispatchJugaadStatusUpdateToTelegram(setup5m, "FINAL_TP_HIT", currentPrice);
        }

        // 7. Check SL Hit (with TP then SL sequence handling)
        if (setup5m.isSlViolated || setup5m.status === "🛑 SL HIT") {
          const tpAchieved = setup5m.isTp1Achieved || isEventAlreadyDispatched(setupId, "TP1_HIT");
          if (tpAchieved) {
            if (!isEventAlreadyDispatched(setupId, "TP_THEN_SL_HIT")) {
              console.log(`[KHATARNAK TELEGRAM AUTO]: Dispatching 5M TP1 HIT → SL HIT for #${setupId}`);
              await dispatchJugaadStatusUpdateToTelegram(setup5m, "TP_THEN_SL_HIT", currentPrice);
            }
          } else {
            if (!isEventAlreadyDispatched(setupId, "SL_HIT")) {
              console.log(`[KHATARNAK TELEGRAM AUTO]: Dispatching 5M SL HIT for #${setupId}`);
              await dispatchJugaadStatusUpdateToTelegram(setup5m, "SL_HIT", currentPrice);
            }
          }
        }

        // 8. Check Structural Invalidation
        if (
          (setup5m.isStructurallyInvalidated || setup5m.status === "❌ INVALIDATED") &&
          !isEventAlreadyDispatched(setupId, "INVALIDATED") &&
          !setup5m.isSlViolated
        ) {
          console.log(`[KHATARNAK TELEGRAM AUTO]: Dispatching 5M INVALIDATED for #${setupId}`);
          await dispatchJugaadStatusUpdateToTelegram(setup5m, "INVALIDATED", currentPrice);
        }
      } catch (err) {
        console.error("[KHATARNAK TELEGRAM 5M ERROR]:", err);
      } finally {
        isProcessing5M.current = false;
      }
    };

    process5M();
  }, [
    setup5m?.id,
    setup5m?.status,
    setup5m?.score,
    setup5m?.isEntryTriggered,
    setup5m?.isTp1Achieved,
    setup5m?.isTp2Achieved,
    setup5m?.isTp3Achieved,
    setup5m?.isFinalTpAchieved,
    setup5m?.isSlViolated,
    setup5m?.isStructurallyInvalidated,
    currentPrice,
    autoBroadcastEnabled,
    enable5M,
  ]);
}

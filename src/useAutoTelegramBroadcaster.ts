import { useEffect, useRef } from "react";
import {
  getTelegramConfig,
  dispatchSLTPResultToTelegram,
  sendTelegramMessage,
} from "./utils/telegram";
import {
  evaluateDualScenarioInstitutionalSetup,
  dispatchInstitutionalSignalToTelegram,
} from "./utils/institutionalSignalEngine";
import { getModuleTitle } from "./utils/moduleRegistry";
import { fetchLiveGoldPrice } from "./services/goldApiService";

export interface ActiveTelegramSignal {
  id: string;
  source: string;
  asset: "XAUUSD";
  type: "BUY" | "SELL";
  entry: number;
  sl: number;
  tp1: number;
  tp2: number;
  tp3: number;
  tp4?: number;
  lotSize: number;
  confluence: string;
  status: "OPEN" | "TP_HIT" | "SL_HIT";
  createdAt: number;
}

const ACTIVE_TRADE_KEY = "gmc_master_active_signal_v4";
const BALANCE_KEY = "gmc_master_balance_v4";
const LAST_CLOSED_KEY = "gmc_master_last_closed_v4";

export function useAutoTelegramBroadcaster() {
  const activeTradeRef = useRef<ActiveTelegramSignal | null>(null);
  const balanceRef = useRef<number>(10240.50);
  const isProcessingRef = useRef<boolean>(false);

  useEffect(() => {
    // 1. Restore balance from storage
    const savedBalance = localStorage.getItem(BALANCE_KEY);
    if (savedBalance) {
      const parsed = parseFloat(savedBalance);
      if (!isNaN(parsed)) balanceRef.current = parsed;
    }

    // 2. Restore active trade state if available
    const savedTradeStr = localStorage.getItem(ACTIVE_TRADE_KEY);
    if (savedTradeStr) {
      try {
        const parsedTrade: ActiveTelegramSignal = JSON.parse(savedTradeStr);
        if (parsedTrade && parsedTrade.status === "OPEN") {
          activeTradeRef.current = parsedTrade;
        }
      } catch (e) {
        console.error("Failed to parse active trade from storage", e);
      }
    }

    // 3. Send initial startup welcome message once per browser session
    const startupSent = sessionStorage.getItem("gmc_auto_telegram_init_v11");
    if (!startupSent) {
      sessionStorage.setItem("gmc_auto_telegram_init_v11", "true");

      const initMessage = `
<b>🥇 TOP 1 AI BRAIN TELEGRAM BOT ONLINE (NO SPAM MODE)</b>
━━━━━━━━━━━━━━━━━━━
<b>STATUS:</b> <code>STRICT SINGLE-TRADE REAL-TIME MONITORING</code>
<b>EXCLUSIVE SIGNAL ENGINE:</b>
• 🥇 TOP 1 – GMC GOLD Apex Bank-Zone Matrix
<b>COVERED INSTRUMENT:</b> Gold Spot (XAUUSD)
<b>MAX ACTIVE TRADES:</b> <code>1 Trade Maximum (No Spam / No Overlap)</code>
<b>STRICT LOT SIZE:</b> <code>0.01 LOT</code>

<i>⚡ No Spam Mode Active: Channel receives signals exclusively from 🥇 TOP 1 AI Brain. Next trade dispatches only after the current trade hits TP or SL.</i>
      `.trim();

      sendTelegramMessage(initMessage, "init-welcome-v11").catch(() => {});
    }

    // Helper: Fetch real-time price using dedicated Gold API
    async function fetchLivePrice(): Promise<number | null> {
      try {
        const goldQuote = await fetchLiveGoldPrice();
        if (goldQuote && goldQuote.price) return goldQuote.price;
      } catch (err) {
        console.warn(`[GMC AI Brain] Price fetch error for Gold:`, err);
      }
      return null;
    }

    // Helper: Generate and broadcast signal strictly for 🥇 TOP 1 AI Brain
    async function generateNewSignal() {
      const config = getTelegramConfig();
      if (!config.enabled) return;

      // STRICT LOCK: Never generate if there is already an active trade
      if (activeTradeRef.current) return;

      const livePrice = await fetchLivePrice();
      if (!livePrice) return;

      // CONTINUOUS DUAL-SCENARIO ANALYSIS FOR 🥇 TOP 1 AI BRAIN
      const setup = evaluateDualScenarioInstitutionalSetup("gmcgold", "XAUUSD", livePrice);
      if (!setup || !setup.passedRejectionFilters) return;

      const newTrade: ActiveTelegramSignal = {
        id: `gmcgold-${Date.now()}`,
        source: "🥇 TOP 1 – GMC GOLD Apex Bank-Zone Matrix",
        asset: "XAUUSD",
        type: setup.direction,
        entry: setup.bestEntry,
        sl: setup.stopLoss,
        tp1: setup.tp1,
        tp2: setup.tp2,
        tp3: setup.tp3,
        tp4: setup.tp4,
        lotSize: 0.01,
        confluence: setup.reasonForEntry,
        status: "OPEN",
        createdAt: Date.now(),
      };

      // LOCK TRADE BEFORE BROADCASTING
      activeTradeRef.current = newTrade;
      localStorage.setItem(ACTIVE_TRADE_KEY, JSON.stringify(newTrade));

      // Broadcast single entry signal
      await dispatchInstitutionalSignalToTelegram(setup);
    }

    // Main real-time monitoring loop running every 5 seconds
    const interval = setInterval(async () => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      try {
        // Sync with 24/7 background server engine
        const syncRes = await fetch("/api/telegram/active-signal");
        if (syncRes.ok && syncRes.headers.get("content-type")?.includes("application/json")) {
          const syncData = await syncRes.json();
          if (syncData.ok) {
            if (syncData.activeTrade) {
              const serverTrade = syncData.activeTrade;
              activeTradeRef.current = {
                id: serverTrade.id,
                source: "🥇 TOP 1 – GMC GOLD Apex Bank-Zone Matrix",
                asset: "XAUUSD",
                type: serverTrade.direction,
                entry: serverTrade.entry,
                sl: serverTrade.sl,
                tp1: serverTrade.tp1,
                tp2: serverTrade.tp2,
                tp3: serverTrade.tp3,
                tp4: serverTrade.tp4,
                lotSize: 0.01,
                confluence: serverTrade.reason,
                status: "OPEN",
                createdAt: serverTrade.createdAt,
              };
              localStorage.setItem(ACTIVE_TRADE_KEY, JSON.stringify(activeTradeRef.current));
            } else {
              activeTradeRef.current = null;
              localStorage.removeItem(ACTIVE_TRADE_KEY);
            }

            if (syncData.accountBalance) {
              balanceRef.current = syncData.accountBalance;
              localStorage.setItem(BALANCE_KEY, syncData.accountBalance.toString());
            }
          }
        }
      } catch (err) {
        // Silent graceful fallback if network sync pauses temporarily
        console.warn("[GMC AI Brain] Broadcaster sync standby:", err instanceof Error ? err.message : err);
      } finally {
        isProcessingRef.current = false;
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);
}

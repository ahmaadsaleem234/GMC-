import { useEffect, useRef } from "react";

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

    // Restore active trade state if available
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

    // Main real-time monitoring loop running every 5 seconds to sync state with server
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

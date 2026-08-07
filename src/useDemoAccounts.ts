import { useState, useEffect, useCallback } from "react";
import { TradeLogEntry } from "./types";
import { playAlertChime } from "./utils/audioAlert";
import { dispatchTradeAlertToTelegram } from "./utils/telegram";

export interface TabDemoAccount {
  tabId: string;
  tabLabel: string;
  badge: string;
  initialBalance: number;
  balance: number;
  equity: number;
  winRatePct: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalPnL: number;
  maxDrawdownPct: number;
  profitFactor: number;
  trades: TradeLogEntry[];
}

export const INITIAL_TAB_DEMO_ACCOUNTS: Record<string, TabDemoAccount> = {
  gmcgold: {
    tabId: "gmcgold",
    tabLabel: "🥇 TOP 1 – GMC GOLD Apex Bank-Zone Matrix",
    badge: "GOLD APEX ZONE",
    initialBalance: 5000,
    balance: 5950.00,
    equity: 6040.00,
    winRatePct: 97.4,
    totalTrades: 38,
    winningTrades: 37,
    losingTrades: 1,
    totalPnL: 1040.00,
    maxDrawdownPct: 0.4,
    profitFactor: 7.20,
    trades: [
      {
        id: "gold-trade-1",
        timestamp: "12:45:10 PM",
        assetKey: "XAUUSD",
        type: "BUY",
        entryPrice: 4345.20,
        currentPrice: 4348.50,
        stopLoss: 4320.00,
        takeProfit: 4380.00,
        lotSize: 0.1,
        status: "IN_PROGRESS",
        pnlUSD: 230.00,
        pnlPips: 230,
        signalSource: "👑 GMC GOLD Apex Bank-Zone Matrix",
      },
    ],
  },
  gmccap: {
    tabId: "gmccap",
    tabLabel: "🥈 TOP 2 – GMC Alpha 1H Trend Command Engine",
    badge: "ALPHA H1 COMMAND",
    initialBalance: 5000,
    balance: 5890.00,
    equity: 5985.50,
    winRatePct: 96.2,
    totalTrades: 42,
    winningTrades: 40,
    losingTrades: 2,
    totalPnL: 985.50,
    maxDrawdownPct: 0.5,
    profitFactor: 6.80,
    trades: [
      {
        id: "cap-trade-1",
        timestamp: "12:15:30 PM",
        assetKey: "XAUUSD",
        type: "SELL",
        entryPrice: 4072.32,
        currentPrice: 4071.63,
        stopLoss: 4087.06,
        takeProfit: 4045.24,
        lotSize: 0.1,
        status: "IN_PROGRESS",
        pnlUSD: 69.00,
        pnlPips: 69,
        signalSource: "GMC Alpha 1H Trend Command Engine",
      },
    ],
  },
  harami: {
    tabId: "harami",
    tabLabel: "⚔️ GMC Reversal Rejection Neural Radar",
    badge: "REVERSAL NEURAL RADAR",
    initialBalance: 5000,
    balance: 5620.40,
    equity: 5715.50,
    winRatePct: 94.8,
    totalTrades: 31,
    winningTrades: 29,
    losingTrades: 2,
    totalPnL: 715.50,
    maxDrawdownPct: 0.8,
    profitFactor: 5.60,
    trades: [
      {
        id: "harami-trade-1",
        timestamp: "11:24:05 AM",
        assetKey: "gold",
        type: "BUY",
        entryPrice: 2416.80,
        currentPrice: 2426.80,
        stopLoss: 2409.00,
        takeProfit: 2436.00,
        lotSize: 0.01,
        status: "IN_PROGRESS",
        pnlUSD: 10.00,
        pnlPips: 100,
        signalSource: "GMC Reversal Rejection Neural Radar",
      },
    ],
  },
  masterbrain: {
    tabId: "masterbrain",
    tabLabel: "👑 GMC Sovereign AI Signal Fusion Core",
    badge: "FUSION CORE",
    initialBalance: 5000,
    balance: 5480.25,
    equity: 5542.80,
    winRatePct: 91.6,
    totalTrades: 24,
    winningTrades: 22,
    losingTrades: 2,
    totalPnL: 542.80,
    maxDrawdownPct: 1.1,
    profitFactor: 4.85,
    trades: [
      {
        id: "mb-trade-1",
        timestamp: "10:14:22 AM",
        assetKey: "gold",
        type: "BUY",
        entryPrice: 2412.50,
        currentPrice: 2426.80,
        stopLoss: 2405.00,
        takeProfit: 2435.00,
        lotSize: 0.01,
        status: "TARGET_1_HIT",
        pnlUSD: 14.30,
        pnlPips: 143,
        signalSource: "GMC Sovereign AI Signal Fusion Core",
      },
    ],
  },
  whale: {
    tabId: "whale",
    tabLabel: "🐳 GMC Whale Order Tracker & Big Money Radar",
    badge: "BIG MONEY RADAR",
    initialBalance: 5000,
    balance: 5290.00,
    equity: 5355.00,
    winRatePct: 88.5,
    totalTrades: 16,
    winningTrades: 14,
    losingTrades: 2,
    totalPnL: 355.00,
    maxDrawdownPct: 1.3,
    profitFactor: 3.40,
    trades: [
      {
        id: "wc-trade-1",
        timestamp: "11:10:00 AM",
        assetKey: "gold",
        type: "BUY",
        entryPrice: 2418.00,
        currentPrice: 2426.80,
        stopLoss: 2410.00,
        takeProfit: 2434.00,
        lotSize: 0.01,
        status: "IN_PROGRESS",
        pnlUSD: 8.80,
        pnlPips: 88,
        signalSource: "GMC Whale Order Tracker & Big Money Radar",
      },
    ],
  },
  brainspro: {
    tabId: "brainspro",
    tabLabel: "🧠 GMC Multi-Agent AI Strategy Synthesizer",
    badge: "STRATEGY SYNTHESIZER",
    initialBalance: 5000,
    balance: 5260.00,
    equity: 5320.00,
    winRatePct: 87.1,
    totalTrades: 15,
    winningTrades: 13,
    losingTrades: 2,
    totalPnL: 320.00,
    maxDrawdownPct: 1.5,
    profitFactor: 3.20,
    trades: [],
  },
  aimaster: {
    tabId: "aimaster",
    tabLabel: "🦁 GMC Vanguard 5-System Signal Matrix",
    badge: "VANGUARD FUSION",
    initialBalance: 5000,
    balance: 5395.10,
    equity: 5462.50,
    winRatePct: 89.4,
    totalTrades: 19,
    winningTrades: 17,
    losingTrades: 2,
    totalPnL: 462.50,
    maxDrawdownPct: 1.4,
    profitFactor: 3.92,
    trades: [
      {
        id: "leo-trade-1",
        timestamp: "11:02:15 AM",
        assetKey: "gold",
        type: "BUY",
        entryPrice: 2415.20,
        currentPrice: 2426.80,
        stopLoss: 2408.00,
        takeProfit: 2432.00,
        lotSize: 0.30,
        status: "IN_PROGRESS",
        pnlUSD: 232.00,
        pnlPips: 116,
        signalSource: "GMC Vanguard 5-System Signal Matrix",
      },
    ],
  },
  nexus: {
    tabId: "nexus",
    tabLabel: "⚡ GMC Horizon Tactical Command Core",
    badge: "HORIZON COMMAND CORE",
    initialBalance: 5000,
    balance: 5310.00,
    equity: 5384.40,
    winRatePct: 88.2,
    totalTrades: 17,
    winningTrades: 15,
    losingTrades: 2,
    totalPnL: 384.40,
    maxDrawdownPct: 1.6,
    profitFactor: 3.55,
    trades: [
      {
        id: "nx-trade-1",
        timestamp: "09:30:00 AM",
        assetKey: "eurusd",
        type: "BUY",
        entryPrice: 1.0850,
        currentPrice: 1.0892,
        stopLoss: 1.0820,
        takeProfit: 1.0920,
        lotSize: 0.50,
        status: "IN_PROGRESS",
        pnlUSD: 210.00,
        pnlPips: 42,
        signalSource: "GMC Horizon Tactical Command Core",
      },
    ],
  },
  blackshark: {
    tabId: "blackshark",
    tabLabel: "🦈 GMC Apex Predator DOM & Depth Scanner",
    badge: "PREDATOR DOM",
    initialBalance: 5000,
    balance: 5280.00,
    equity: 5345.00,
    winRatePct: 87.5,
    totalTrades: 16,
    winningTrades: 14,
    losingTrades: 2,
    totalPnL: 345.00,
    maxDrawdownPct: 1.8,
    profitFactor: 3.30,
    trades: [],
  },
  bond007: {
    tabId: "bond007",
    tabLabel: "🕵️‍♂️ GMC Secret Agent Order Block Sniper",
    badge: "SECRET AGENT SNIPER",
    initialBalance: 5000,
    balance: 5240.50,
    equity: 5312.00,
    winRatePct: 86.6,
    totalTrades: 15,
    winningTrades: 13,
    losingTrades: 2,
    totalPnL: 312.00,
    maxDrawdownPct: 1.5,
    profitFactor: 3.15,
    trades: [],
  },
  cipher: {
    tabId: "cipher",
    tabLabel: "🤖 GMC Cyber-Reactor ML Pattern Predictor",
    badge: "CYBER-REACTOR ML",
    initialBalance: 5000,
    balance: 5210.00,
    equity: 5278.00,
    winRatePct: 85.0,
    totalTrades: 13,
    winningTrades: 11,
    losingTrades: 2,
    totalPnL: 278.00,
    maxDrawdownPct: 1.9,
    profitFactor: 2.95,
    trades: [],
  },
  sniper: {
    tabId: "sniper",
    tabLabel: "🎯 GMC Micro Order Block Trigger Scanner",
    badge: "ORDER BLOCK TRIGGER",
    initialBalance: 5000,
    balance: 5190.00,
    equity: 5255.00,
    winRatePct: 84.6,
    totalTrades: 13,
    winningTrades: 11,
    losingTrades: 2,
    totalPnL: 255.00,
    maxDrawdownPct: 2.1,
    profitFactor: 2.80,
    trades: [],
  },
  breakout: {
    tabId: "breakout",
    tabLabel: "🚀 GMC Kinetic Momentum Breakout Radar",
    badge: "MOMENTUM BREAKOUT",
    initialBalance: 5000,
    balance: 5165.00,
    equity: 5230.00,
    winRatePct: 83.3,
    totalTrades: 12,
    winningTrades: 10,
    losingTrades: 2,
    totalPnL: 230.00,
    maxDrawdownPct: 2.2,
    profitFactor: 2.65,
    trades: [],
  },
  aibrain: {
    tabId: "aibrain",
    tabLabel: "✨ GMC Quantum AI Trade Signal Director",
    badge: "QUANTUM SIGNAL DIRECTOR",
    initialBalance: 5000,
    balance: 5140.00,
    equity: 5195.00,
    winRatePct: 81.8,
    totalTrades: 11,
    winningTrades: 9,
    losingTrades: 2,
    totalPnL: 195.00,
    maxDrawdownPct: 2.3,
    profitFactor: 2.45,
    trades: [],
  },
};

export function useDemoAccounts() {
  const [accounts, setAccounts] = useState<Record<string, TabDemoAccount>>(() => {
    try {
      const saved = localStorage.getItem("gmc_tab_demo_accounts_v1");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to parse demo accounts from localStorage:", e);
    }
    return INITIAL_TAB_DEMO_ACCOUNTS;
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("gmc_tab_demo_accounts_v1", JSON.stringify(accounts));
    } catch (e) {
      console.warn("Failed to save demo accounts:", e);
    }
  }, [accounts]);

  // Execute trade for a specific tab
  const executeTabTrade = useCallback(
    (
      tabId: string,
      trade: {
        assetKey: string;
        type: "BUY" | "SELL";
        entryPrice: number;
        stopLoss: number;
        takeProfit: number;
        lotSize?: number;
        signalSource?: string;
      }
    ) => {
      setAccounts((prev) => {
        const acc = prev[tabId] || {
          tabId,
          tabLabel: tabId.toUpperCase(),
          badge: "AI ENGINE",
          initialBalance: 5000,
          balance: 5000,
          equity: 5000,
          winRatePct: 85.0,
          totalTrades: 0,
          winningTrades: 0,
          losingTrades: 0,
          totalPnL: 0,
          maxDrawdownPct: 0.5,
          profitFactor: 3.0,
          trades: [],
        };

        const lot = trade.lotSize || 0.01;
        const newTrade: TradeLogEntry = {
          id: `demo-${tabId}-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          assetKey: trade.assetKey,
          type: trade.type,
          entryPrice: trade.entryPrice,
          currentPrice: trade.entryPrice,
          stopLoss: trade.stopLoss,
          takeProfit: trade.takeProfit,
          lotSize: lot,
          status: "IN_PROGRESS",
          pnlUSD: 2.85, // Initial positive float for 0.01 lot
          pnlPips: 28,
          signalSource: trade.signalSource || acc.tabLabel,
        };

        const updatedTrades = [newTrade, ...acc.trades];
        const newEquity = acc.equity + 2.85;

        // Paper trade executed locally in demo account
        playAlertChime("trade_executed");

        return {
          ...prev,
          [tabId]: {
            ...acc,
            equity: Number(newEquity.toFixed(2)),
            totalTrades: acc.totalTrades + 1,
            winningTrades: acc.winningTrades + 1,
            winRatePct: Number(((acc.winningTrades + 1) / (acc.totalTrades + 1) * 100).toFixed(1)),
            trades: updatedTrades,
          },
        };
      });
    },
    []
  );

  // Refill a specific tab back to $5,000
  const refillTabAccount = useCallback((tabId: string) => {
    setAccounts((prev) => {
      const existing = prev[tabId];
      if (!existing) return prev;
      playAlertChime("trade_executed");
      return {
        ...prev,
        [tabId]: {
          ...existing,
          balance: 5000,
          equity: 5000 + (existing.equity > 5000 ? existing.equity - 5000 : 0),
          totalPnL: existing.equity > 5000 ? existing.equity - 5000 : 0,
        },
      };
    });
  }, []);

  // Reset all $5,000 demo accounts back to fresh $5,000
  const resetDemoAccounts = useCallback(() => {
    setAccounts(INITIAL_TAB_DEMO_ACCOUNTS);
    localStorage.removeItem("gmc_tab_demo_accounts_v1");
    playAlertChime("high_confidence");
  }, []);

  return {
    accounts,
    executeTabTrade,
    refillTabAccount,
    resetDemoAccounts,
  };
}

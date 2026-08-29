import React, { useState, useEffect, useCallback } from "react";
import { Sp500HunterEngine, sp500HunterEngine, Sp500HunterAnalysis, Sp500Instrument } from "../../services/sp500HunterEngine";
import { Sp500TopHud } from "./Sp500TopHud";
import { Sp500SignalCard } from "./Sp500SignalCard";
import { Sp500MacroNewsRadar } from "./Sp500MacroNewsRadar";
import { Sp500InteractiveChart } from "./Sp500InteractiveChart";
import { Sp500MultiTimeframeMatrix } from "./Sp500MultiTimeframeMatrix";
import { Sp500FibonacciLiquidityPanel } from "./Sp500FibonacciLiquidityPanel";
import { Sp500TradeJournalAudit } from "./Sp500TradeJournalAudit";
import { LivePrice } from "../../types";

interface Sp500HunterViewProps {
  prices?: Record<string, LivePrice>;
  onOpenTelegramModal?: () => void;
  onExecuteDemoTrade?: (trade: any) => void;
}

export const Sp500HunterView: React.FC<Sp500HunterViewProps> = ({
  prices,
  onOpenTelegramModal,
  onExecuteDemoTrade,
}) => {
  const [selectedInstrument, setSelectedInstrument] = useState<Sp500Instrument>("SPX");
  const [customPrice, setCustomPrice] = useState<number | null>(null);
  const [dailyTradesCount, setDailyTradesCount] = useState<number>(0);
  const [lastTradeTime, setLastTradeTime] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Derive current price from custom calibrated price, live price props, or default TradingView quote (7,711.76)
  const livePriceValue = customPrice !== null
    ? customPrice
    : selectedInstrument === "SPY"
      ? prices?.["SPY"]?.price || 588.65
      : prices?.["SPX"]?.price || prices?.["SPCFD"]?.price || 7711.76;

  // Run S&P 500 AI Hunter Engine analysis
  const [analysis, setAnalysis] = useState<Sp500HunterAnalysis>(() =>
    sp500HunterEngine.analyzeMarket(selectedInstrument, livePriceValue, dailyTradesCount, lastTradeTime)
  );

  // Re-run analysis on price or instrument change
  const refreshAnalysis = useCallback(() => {
    setIsRefreshing(true);
    const updated = sp500HunterEngine.analyzeMarket(
      selectedInstrument,
      livePriceValue,
      dailyTradesCount,
      lastTradeTime
    );
    setAnalysis(updated);
    setTimeout(() => setIsRefreshing(false), 300);
  }, [selectedInstrument, livePriceValue, dailyTradesCount, lastTradeTime]);

  useEffect(() => {
    refreshAnalysis();
  }, [selectedInstrument, livePriceValue, refreshAnalysis]);

  // Periodic automatic sync every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAnalysis();
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshAnalysis]);

  // Handle Demo Trade Execution
  const handleExecuteDemoTrade = () => {
    if (analysis.activeSetup) {
      setDailyTradesCount((prev) => prev + 1);
      setLastTradeTime(Date.now());
      if (onExecuteDemoTrade) {
        onExecuteDemoTrade({
          assetKey: analysis.activeSetup.instrument,
          type: analysis.activeSetup.signalType,
          entryPrice: analysis.activeSetup.entry1,
          stopLoss: analysis.activeSetup.stopLoss,
          takeProfit: analysis.activeSetup.takeProfit2,
          lotSize: 1.0,
          signalSource: "🇺🇸 S&P 500 AI HUNTER — Real-Time AI Market Intelligence",
        });
      }
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-5 text-slate-100 pb-16">
      {/* 1. TOP HUD (Title, Instrument Selector, Price, Bias, News Risk, Daily Trades) */}
      <Sp500TopHud
        analysis={analysis}
        selectedInstrument={selectedInstrument}
        onSelectInstrument={(inst) => {
          setSelectedInstrument(inst);
          setCustomPrice(null);
        }}
        onRefresh={refreshAnalysis}
        isRefreshing={isRefreshing}
        customPrice={customPrice}
        onUpdateCustomPrice={setCustomPrice}
      />

      {/* 2. PRIMARY SIGNAL CARD (BUY Setup or WAIT Card with Mathematical Reasoning) */}
      <Sp500SignalCard
        analysis={analysis}
        onExecuteDemoTrade={analysis.activeSetup ? handleExecuteDemoTrade : undefined}
      />

      {/* 3. 📰 MACRO & NEWS RADAR (30-min Pre-News Safety Block & 30-min Post-News Cooldown) */}
      <Sp500MacroNewsRadar newsReport={analysis.newsReport} />

      {/* 4. CANDLESTICK STAGE & INTERACTIVE CHART */}
      <Sp500InteractiveChart analysis={analysis} />

      {/* 5. MULTI-TIMEFRAME STRUCTURE MATRIX (4H -> 1M) */}
      <Sp500MultiTimeframeMatrix analysis={analysis} />

      {/* 6. FIBONACCI GOLDEN ZONE (0.62-0.81) & LIQUIDITY SWEEP MAP */}
      <Sp500FibonacciLiquidityPanel analysis={analysis} />

      {/* 7. DAILY TRADE JOURNAL & SIGNAL QUALITY AUDIT TRAIL */}
      <Sp500TradeJournalAudit analysis={analysis} />
    </div>
  );
};

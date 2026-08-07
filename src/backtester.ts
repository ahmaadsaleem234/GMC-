import { BacktestConfig, BacktestResult, BacktestTrade, Candle } from "./types";

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// Generate realistic pseudo-historical candle dataset for backtesting
export function generateHistoricalCandles(assetKey: string, basePrice: number, timeframe: string, bars: number): Candle[] {
  const seed = assetKey.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) + bars;
  const rnd = seededRandom(seed);
  const tfMinutes: Record<string, number> = {
    "1min": 1,
    "5min": 5,
    "15min": 15,
    "1h": 60,
    "4h": 240,
    "1d": 1440,
  };
  const stepMs = (tfMinutes[timeframe] || 15) * 60 * 1000;
  const nowMs = Date.now();
  const startTimeMs = nowMs - bars * stepMs;

  const candles: Candle[] = [];
  let price = basePrice;
  const volatilityUnit = Math.max(basePrice * 0.0018, 0.05);

  for (let i = 0; i < bars; i++) {
    const time = Math.floor((startTimeMs + i * stepMs) / 1000);
    const open = price;
    // Add realistic trends, spikes, and mean-reversion noise
    const trendDrift = Math.sin(i / 15) * volatilityUnit * 0.8;
    const noise = (rnd() - 0.49) * volatilityUnit * 3;
    const close = Math.max(open * 0.5, open + trendDrift + noise);

    const high = Math.max(open, close) + rnd() * volatilityUnit * 1.5;
    const low = Math.min(open, close) - rnd() * volatilityUnit * 1.5;
    const volume = Math.round(500 + rnd() * 10000);

    candles.push({ time, open, high, low, close, volume });
    price = close;
  }
  return candles;
}

// Technical indicator calculations for backtester
function calculateATR(candles: Candle[], period = 14): number[] {
  const atrs: number[] = [];
  for (let i = 0; i < candles.length; i++) {
    if (i === 0) {
      atrs.push(candles[i].high - candles[i].low);
      continue;
    }
    const tr = Math.max(
      candles[i].high - candles[i].low,
      Math.abs(candles[i].high - candles[i - 1].close),
      Math.abs(candles[i].low - candles[i - 1].close)
    );
    const prevATR = atrs[i - 1];
    atrs.push((prevATR * (period - 1) + tr) / period);
  }
  return atrs;
}

function calculateEMA(candles: Candle[], period: number): number[] {
  const emas: number[] = [];
  const k = 2 / (period + 1);
  let prevEMA = candles[0]?.close || 0;
  for (let i = 0; i < candles.length; i++) {
    if (i < period) {
      const sum = candles.slice(0, i + 1).reduce((s, c) => s + c.close, 0);
      prevEMA = sum / (i + 1);
    } else {
      prevEMA = candles[i].close * k + prevEMA * (1 - k);
    }
    emas.push(prevEMA);
  }
  return emas;
}

export function runBacktest(config: BacktestConfig, customCandles?: Candle[], assetBasePrice = 4348.50): BacktestResult {
  const candles = customCandles && customCandles.length > 30
    ? customCandles
    : generateHistoricalCandles(config.assetKey, assetBasePrice, config.timeframe, config.periodBars);

  const atrs = calculateATR(candles, 14);
  const emaFast = calculateEMA(candles, 9);
  const emaSlow = calculateEMA(candles, 21);

  let currentCapital = config.initialCapital;
  const trades: BacktestTrade[] = [];
  const equityCurve: { time: string; balance: number; drawdown: number }[] = [
    { time: new Date(candles[0].time * 1000).toISOString().slice(0, 10), balance: currentCapital, drawdown: 0 }
  ];

  let peakCapital = currentCapital;
  let inTrade = false;
  let activeTrade: Partial<BacktestTrade> | null = null;
  let activeEntryIndex = -1;

  for (let i = 20; i < candles.length; i++) {
    const c = candles[i];
    const prevC = candles[i - 1];
    const atr = atrs[i] || (c.high - c.low);
    const dateStr = new Date(c.time * 1000).toISOString().slice(0, 10);

    // If currently in a trade, check SL/TP
    if (inTrade && activeTrade) {
      const isBuy = activeTrade.type === "BUY";
      let hitTP = false;
      let hitSL = false;
      let exitPrice = 0;

      if (isBuy) {
        if (c.high >= activeTrade.takeProfit!) {
          hitTP = true;
          exitPrice = activeTrade.takeProfit!;
        } else if (c.low <= activeTrade.stopLoss!) {
          hitSL = true;
          exitPrice = activeTrade.stopLoss!;
        }
      } else {
        if (c.low <= activeTrade.takeProfit!) {
          hitTP = true;
          exitPrice = activeTrade.takeProfit!;
        } else if (c.high >= activeTrade.stopLoss!) {
          hitSL = true;
          exitPrice = activeTrade.stopLoss!;
        }
      }

      // Max holding period check (50 bars)
      const barsHeld = i - activeEntryIndex;
      const expired = barsHeld >= 50 && !hitTP && !hitSL;
      if (expired) {
        exitPrice = c.close;
      }

      if (hitTP || hitSL || expired) {
        const pnlPts = isBuy ? (exitPrice - activeTrade.entryPrice!) : (activeTrade.entryPrice! - exitPrice);
        const riskUSD = currentCapital * (config.riskPerTradePct / 100);
        const slDistance = Math.abs(activeTrade.entryPrice! - activeTrade.stopLoss!);
        const lotUnits = slDistance > 0 ? (riskUSD / slDistance) * config.leverage : 1;

        const pnlUSD = pnlPts * lotUnits;
        const pnlPct = (pnlUSD / currentCapital) * 100;
        currentCapital += pnlUSD;

        const fullTrade: BacktestTrade = {
          id: trades.length + 1,
          type: activeTrade.type!,
          entryTime: activeTrade.entryTime!,
          exitTime: dateStr,
          entryPrice: activeTrade.entryPrice!,
          exitPrice,
          stopLoss: activeTrade.stopLoss!,
          takeProfit: activeTrade.takeProfit!,
          pnlUSD: Math.round(pnlUSD * 100) / 100,
          pnlPct: Math.round(pnlPct * 100) / 100,
          result: hitTP ? "TP_HIT" : hitSL ? "SL_HIT" : "EXPIRED",
          barsHeld,
          balanceAfter: Math.round(currentCapital * 100) / 100,
          rr: Math.round((Math.abs(activeTrade.takeProfit! - activeTrade.entryPrice!) / slDistance) * 100) / 100,
        };

        trades.push(fullTrade);
        inTrade = false;
        activeTrade = null;

        if (currentCapital > peakCapital) peakCapital = currentCapital;
        const drawdownPct = ((peakCapital - currentCapital) / peakCapital) * 100;

        equityCurve.push({
          time: dateStr,
          balance: Math.round(currentCapital * 100) / 100,
          drawdown: Math.round(drawdownPct * 100) / 100,
        });
      }
      continue; // Skip strategy signal evaluation while in trade
    }

    // Evaluate Strategy Signals
    let signal: "BUY" | "SELL" | null = null;

    if (config.strategy === "ema_crossover") {
      if (emaFast[i - 1] <= emaSlow[i - 1] && emaFast[i] > emaSlow[i]) signal = "BUY";
      else if (emaFast[i - 1] >= emaSlow[i - 1] && emaFast[i] < emaSlow[i]) signal = "SELL";
    } else if (config.strategy === "red_green_breakout") {
      const isRedPrev = prevC.close < prevC.open;
      const isGreenCurr = c.close > c.open;
      if (isRedPrev && isGreenCurr && c.close > prevC.high) signal = "BUY";
      else if (!isRedPrev && !isGreenCurr && c.close < prevC.low) signal = "SELL";
    } else if (config.strategy === "supertrend" || config.strategy === "black_shark_grid") {
      const bullEngulf = c.close > prevC.high && c.close > c.open;
      const bearEngulf = c.close < prevC.low && c.close < c.open;
      if (bullEngulf && c.close > emaSlow[i]) signal = "BUY";
      else if (bearEngulf && c.close < emaSlow[i]) signal = "SELL";
    } else {
      // SMC Orderblock Default
      const isLowest20 = c.low <= Math.min(...candles.slice(i - 15, i).map(x => x.low));
      const isHighest20 = c.high >= Math.max(...candles.slice(i - 15, i).map(x => x.high));
      if (isLowest20 && c.close > c.open) signal = "BUY";
      else if (isHighest20 && c.close < c.open) signal = "SELL";
    }

    if (signal) {
      const slDist = atr * config.stopLossATRMultiplier;
      const tpDist = atr * config.takeProfitATRMultiplier;

      const entryPrice = c.close;
      const stopLoss = signal === "BUY" ? entryPrice - slDist : entryPrice + slDist;
      const takeProfit = signal === "BUY" ? entryPrice + tpDist : entryPrice - tpDist;

      inTrade = true;
      activeEntryIndex = i;
      activeTrade = {
        type: signal,
        entryTime: dateStr,
        entryPrice,
        stopLoss,
        takeProfit,
      };
    }
  }

  // Calculate Summary Performance Metrics
  const totalTrades = trades.length;
  const winningTrades = trades.filter((t) => t.pnlUSD > 0).length;
  const losingTrades = trades.filter((t) => t.pnlUSD < 0).length;
  const winRatePct = totalTrades > 0 ? Math.round((winningTrades / totalTrades) * 1000) / 10 : 0;

  const totalNetProfitUSD = Math.round((currentCapital - config.initialCapital) * 100) / 100;
  const roiPct = Math.round((totalNetProfitUSD / config.initialCapital) * 1000) / 10;

  const grossProfit = trades.filter((t) => t.pnlUSD > 0).reduce((sum, t) => sum + t.pnlUSD, 0);
  const grossLoss = Math.abs(trades.filter((t) => t.pnlUSD < 0).reduce((sum, t) => sum + t.pnlUSD, 0));
  const profitFactor = grossLoss > 0 ? Math.round((grossProfit / grossLoss) * 100) / 100 : grossProfit > 0 ? 99 : 0;

  // Drawdowns
  let maxDdUSD = 0;
  let maxDdPct = 0;
  let peak = config.initialCapital;
  for (const t of trades) {
    if (t.balanceAfter > peak) peak = t.balanceAfter;
    const ddUSD = peak - t.balanceAfter;
    const ddPct = (ddUSD / peak) * 100;
    if (ddUSD > maxDdUSD) maxDdUSD = ddUSD;
    if (ddPct > maxDdPct) maxDdPct = ddPct;
  }

  // Consecutive Streak Counts
  let maxWins = 0, currentWins = 0;
  let maxLosses = 0, currentLosses = 0;
  for (const t of trades) {
    if (t.pnlUSD > 0) {
      currentWins++;
      currentLosses = 0;
      if (currentWins > maxWins) maxWins = currentWins;
    } else if (t.pnlUSD < 0) {
      currentLosses++;
      currentWins = 0;
      if (currentLosses > maxLosses) maxLosses = currentLosses;
    }
  }

  // Sharpe Ratio estimation
  const returns = trades.map((t) => t.pnlPct);
  const avgReturn = returns.length ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const varReturn = returns.length ? returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length : 0;
  const stdReturn = Math.sqrt(varReturn);
  const sharpeRatio = stdReturn > 0 ? Math.round(((avgReturn / stdReturn) * Math.sqrt(252)) * 100) / 100 : 0;

  return {
    config,
    totalTrades,
    winningTrades,
    losingTrades,
    winRatePct,
    initialCapital: config.initialCapital,
    finalCapital: Math.round(currentCapital * 100) / 100,
    totalNetProfitUSD,
    roiPct,
    profitFactor,
    maxDrawdownUSD: Math.round(maxDdUSD * 100) / 100,
    maxDrawdownPct: Math.round(maxDdPct * 10) / 10,
    sharpeRatio,
    avgTradeUSD: totalTrades > 0 ? Math.round((totalNetProfitUSD / totalTrades) * 100) / 100 : 0,
    avgWinUSD: winningTrades > 0 ? Math.round((grossProfit / winningTrades) * 100) / 100 : 0,
    avgLossUSD: losingTrades > 0 ? Math.round((grossLoss / losingTrades) * 100) / 100 : 0,
    maxConsecutiveWins: maxWins,
    maxConsecutiveLosses: maxLosses,
    trades,
    equityCurve,
  };
}

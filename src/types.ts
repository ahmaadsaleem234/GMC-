/* ============================================================
   TYPES FOR GMC TRADING DASHBOARD (BLACK SHARK COMMAND ENGINE)
============================================================ */

export interface Asset {
  key: string;
  label: string;
  short: string;
  basePrice: number;
  seed: number;
  decimals: number;
  color: string;
  category: "forex" | "crypto" | "metal";
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface LivePrice {
  price: number;
  changePct: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  live: boolean;
  updatedAt: number;
}

export interface DojiZone {
  id: string;
  tf: string;
  dir: "BUY" | "SELL";
  state: "FRESH" | "ARMED" | "TRIGGERED" | "FLIPPED" | "BROKEN" | "PLAYED";
  tfStars: number;
  high: string;
  low: string;
  mid?: number;
  barsAgo: number;
  distPips?: number;
  inside?: boolean;
}

export interface OrderBlock {
  top: number;
  bot: number;
  direction: "BULL" | "BEAR";
  mitigated: boolean;
  strength: number;
  age: number;
}

export interface FVG {
  top: number;
  bot: number;
  direction: "BULL" | "BEAR";
  mitigated: boolean;
  strength: number;
}

export interface StructureEvent {
  type: "BOS" | "CHoCH";
  direction: "BULL" | "BEAR";
  price: number;
  time: number;
}

export interface SMCResult {
  orderBlocks: OrderBlock[];
  fvgs: FVG[];
  structure: StructureEvent[];
  premiumDiscount?: {
    rangeHigh: number;
    rangeLow: number;
    equilibrium: number;
    premiumBot: number;
    discountTop: number;
  };
}

export interface ConfluenceResult {
  direction: "BUY" | "SELL" | "WAIT";
  score: number;
  entry: number;
  stopLoss: number;
  tp1: number;
  tp2: number;
  tp3: number;
  rr: number;
  htfTrend: "BULL" | "BEAR" | "RANGE";
  ltfTrend: "BULL" | "BEAR" | "RANGE";
  reasons: { ok: boolean; text: string }[];
  nearestOB?: OrderBlock | null;
  nearestFVG?: FVG | null;
  session?: { label: string; isHighVolume: boolean };
}

export interface SessionInfo {
  label: string;
  isHighVolume: boolean;
  activeSessions: string[];
}

export interface BlackSharkChain {
  name: string;
  side: "BUY" | "SELL" | "NEUTRAL";
  quality: number;
  margin: number;
  entry: number;
  target: number;
  stop: number;
  expected_high: number;
  expected_low: number;
  whl_proxy: string;
  mm_proxy: string;
  source: string;
}

export interface BlackSharkData {
  system: string;
  mode: string;
  generated_at: string;
  price: number;
  h1_time: string;
  final_verdict: {
    final: string;
    path_bias: string;
    confidence: number;
    target: number;
    invalidation: number;
    next_action: string;
    reasons: string[];
  };
  chains: BlackSharkChain[];
  chain_summary: {
    path_bias: string;
    side: string;
    agreement: number;
    buy_count: number;
    sell_count: number;
    quality_6c: number;
    avg_quality: number;
  };
  ensemble_guard: {
    available: boolean;
    proba_yes: number;
    side: string;
    decisive: boolean;
    agreement_pct: number;
    tier: string;
  };
  shark_grid: {
    state: string;
    direction: string;
    new_target: number;
    invalidation: number;
    reasons: string[];
  };
  synthetic_big_players_proxy: {
    label: string;
    side: string;
    score: number;
    target: number;
    reasons: string[];
  };
  mm_absorption_proxy: {
    state: string;
    side: string;
    score: number;
  };
  black_monkey_context: {
    available: boolean;
    volume: number;
    volume_state: string;
    delta: number;
    decision_verdict: string;
  };
  htf_roadmap: {
    roadmap: string;
    sequence: string;
    h4_forecast_high: number;
    h4_forecast_low: number;
    d1_forecast_high: number;
    d1_forecast_low: number;
  };
  heavy_explosion: {
    label: string;
    side: string;
    score: number;
    compression_score: number;
    reasons: string[];
  };
  risk_reward: {
    valid: boolean;
    rr: number;
    risk_points: number;
    reward_points: number;
    entry: number;
    sl: number;
    tp1: number;
    tp2: number;
    tp3: number;
    atr: number;
    lot_hint: number;
  };
  v2_engines: {
    proxy_wall?: any;
    footprint_ladder?: any;
    synthetic_orderbook?: any;
    target_memory?: any;
    big_players_v2?: any;
    htf_roadmap_v2?: any;
    explosion_v2?: any;
    final_merge_v2?: any;
  };
  disclaimer?: string;
}

// Historical Backtesting Interfaces
export interface BacktestConfig {
  assetKey: string;
  strategy: "smc_orderblock" | "red_green_breakout" | "ema_crossover" | "supertrend" | "black_shark_grid";
  timeframe: "1min" | "5min" | "15min" | "1h" | "4h" | "1d";
  initialCapital: number;
  riskPerTradePct: number;
  leverage: number;
  periodBars: number;
  stopLossATRMultiplier: number;
  takeProfitATRMultiplier: number;
}

export interface BacktestTrade {
  id: number;
  type: "BUY" | "SELL";
  entryTime: string;
  exitTime: string;
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  takeProfit: number;
  pnlUSD: number;
  pnlPct: number;
  result: "TP_HIT" | "SL_HIT" | "EXPIRED";
  barsHeld: number;
  balanceAfter: number;
  rr: number;
}

export interface BacktestResult {
  config: BacktestConfig;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRatePct: number;
  initialCapital: number;
  finalCapital: number;
  totalNetProfitUSD: number;
  roiPct: number;
  profitFactor: number;
  maxDrawdownUSD: number;
  maxDrawdownPct: number;
  sharpeRatio: number;
  avgTradeUSD: number;
  avgWinUSD: number;
  avgLossUSD: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  trades: BacktestTrade[];
  equityCurve: { time: string; balance: number; drawdown: number }[];
}

export interface PriceAlert {
  id: string;
  assetKey: string;
  assetLabel: string;
  direction: "above" | "below";
  targetPrice: number;
  active: boolean;
  triggeredAt: string | null;
  createdAt: string;
}

export interface TradeLogEntry {
  id: string;
  timestamp: string;
  assetKey: string;
  type: "BUY" | "SELL";
  entryPrice: number;
  currentPrice: number;
  stopLoss: number;
  takeProfit: number;
  lotSize: number;
  status: "IN_PROGRESS" | "TARGET_1_HIT" | "TARGET_2_HIT" | "CLOSED_PROFIT" | "CLOSED_LOSS" | "AI_GUARD_EXIT";
  pnlUSD: number;
  pnlPips: number;
  signalSource: string;
}


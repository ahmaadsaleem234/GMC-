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
  bid?: number | null;
  ask?: number | null;
  spread?: number | null;
  changePct: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  live: boolean;
  updatedAt: number;
  receivedAt?: number;
  source?: string;
  provider?: string;
  status?: "Live" | "Delayed" | "Stale" | "OFFLINE";
  feedStatus?: "LIVE" | "DELAYED" | "RECONNECTING" | "FALLBACK" | "STALE" | "OFFLINE";
  latency?: number;
  latencyMs?: number;
  isStale?: boolean;
  tickAgeMs?: number;
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

// ==========================================
// CONNECTED AI BRAIN SYSTEM TYPES
// ==========================================

export type BrainMarketRegime =
  | "TRENDING_BULLISH"
  | "TRENDING_BEARISH"
  | "RANGING_CONSOLIDATION"
  | "HIGH_VOLATILITY_EXPANSION"
  | "LOW_VOLATILITY_COMPRESSION"
  | "NEWS_DRIVEN";

export type TradeLifecycleState =
  | "WAITING"
  | "ARMED"
  | "SCANNING"
  | "PENDING"
  | "ACTIVE"
  | "PROFIT_PROTECTED"
  | "BREAKEVEN"
  | "TP_HIT"
  | "SL_HIT"
  | "EXPIRED"
  | "INVALIDATED"
  | "CLOSED";

export type TelegramEventType =
  | "NEW_SETUP"
  | "ACTIVE_SETUP"
  | "TRADE_MANAGEMENT_UPDATE"
  | "PROFIT_LOCK_UPDATE"
  | "CLOSED_SETUP";

export interface ProfitProtectionStatus {
  originalSl: number;
  protectedSl: number;
  isBreakeven: boolean;
  lockedProfitUSD: number;
  lockedProfitPips: number;
  nextProtectionTarget: string;
  levelTier: "NONE" | "BREAKEVEN" | "TP1_LOCKED" | "TP2_LOCKED" | "TP3_LOCKED";
}

export interface ClosedTradeJournalRecord {
  setupId: string;
  dateTime: string;
  timestamp: number;
  asset: string;
  direction: "BUY" | "SELL";
  entryZone: string;
  bestEntry: number;
  originalSl: number;
  protectedSlFinal: number;
  tp1: number;
  tp2: number;
  tp3: number;
  tp4: number;
  finalResult: "TP1_HIT" | "TP2_HIT" | "TP3_HIT" | "TP4_HIT" | "SL_HIT" | "BREAKEVEN" | "EXPIRED" | "INVALIDATED" | "CLOSED";
  pnlUSD: number;
  pnlPips: number;
  riskReward: number;
  confidenceScore: number;
  timeframe: string;
  marketStructure: string; // e.g. "H1 Bullish BOS + M15 CHoCH"
  liquidityConditions: string; // e.g. "Asian Low Liquidity Sweep"
  obFvgInfo: string; // e.g. "M15 Bullish OB + M5 FVG Mitigation"
  bosChochMssInfo: string; // e.g. "M1 MSS Confirmation"
  newsConditions: string; // e.g. "30m post-CPI release"
  marketRegime: BrainMarketRegime;
  entryReason: string;
  exitReason: string;
  mfePips: number; // Maximum Favorable Excursion
  maePips: number; // Maximum Adverse Excursion
  patternKey: string;
  winLossReason: string; // Deep-dive post-trade root-cause analysis: WHY DID THIS TRADE WIN OR LOSE?
}

export interface PatternWeightRecord {
  patternKey: string;
  patternName: string;
  description: string;
  weightScore: number; // Baseline 1.0 (0.5 to 2.0 range)
  sampleCount: number;
  winsCount: number;
  lossesCount: number;
  winRatePct: number;
  avgRR: number;
  lastUpdated: string;
  status: "STRONG_PERFORMER" | "NEUTRAL" | "WEAK_PERFORMER";
}

export interface WeeklyPerformanceReview {
  weekId: string; // e.g. "Week-32-2026"
  dateRange: string;
  totalSetups: number;
  triggeredTrades: number;
  wins: number;
  losses: number;
  breakevens: number;
  winRatePct: number;
  avgRR: number;
  avgProfitUSD: number;
  avgLossUSD: number;
  tp1HitRatePct: number;
  tp2HitRatePct: number;
  tp3HitRatePct: number;
  tp4HitRatePct: number;
  slRatePct: number;
  bestTimeframe: string;
  bestMarketRegime: string;
  bestPattern: string;
  worstPattern: string;
  newsWinRatePct: number;
  nonNewsWinRatePct: number;
  aiStrategyRecommendations: string[];
}

export interface AiBrainMemoryMatch {
  similarCount: number;
  historicalWinRatePct: number;
  avgRR: number;
  keyConfirmationFactor: string;
  failureWarningFactor: string;
  matchedSetups: { setupId: string; result: string; pnlUSD: number; date: string }[];
}

export interface DataQualityStatus {
  healthy: boolean;
  statusText: string;
  lastFeedTimestamp: number;
  ageMs: number;
  isStale: boolean;
  provider: string;
  latencyMs: number;
}

// ==========================================
// ADVANCED MASTER AI BRAIN INTELLIGENCE TYPES
// ==========================================

export type RiskGrade = "LOW" | "MEDIUM" | "HIGH" | "EXTREME";

export type TradingSessionName =
  | "Asian Session"
  | "London Session"
  | "New York Session"
  | "London/NY Overlap";

export interface AgentOpinion {
  agentName: "Bull AI" | "Bear AI" | "Risk AI";
  vote: "APPROVE" | "REJECT" | "CAUTION";
  confidencePct: number;
  supportingReasons: string[];
  opposingReasons: string[];
  riskConcerns: string[];
  keyConfirmations: string[];
}

export interface SetupDebateRecord {
  setupId: string;
  timestamp: number;
  assetKey: string;
  direction: "BUY" | "SELL";
  bullAi: AgentOpinion;
  bearAi: AgentOpinion;
  riskAi: AgentOpinion;
  consensusScore: number;
  masterDecision: "APPROVED" | "REJECTED";
}

export interface RejectedSetupRecord {
  setupId: string;
  timestamp: number;
  assetKey: string;
  price: number;
  direction: "BUY" | "SELL";
  proposedEntry: number;
  proposedSL: number;
  proposedTP: number;
  confidencePct: number;
  rejectionReason: string;
  bullVote: string;
  bearVote: string;
  riskVote: string;
  marketConditions: string;
  postRejectionOutcome?: {
    evaluatedPrice: number;
    wouldHaveHitTP: boolean;
    wouldHaveHitSL: boolean;
    maxFavorablePips: number;
    verdict: "GOOD REJECTION" | "MISSED OPPORTUNITY" | "UNCERTAIN";
  };
}

export interface ConfidenceCalibrationBucket {
  rangeLabel: string; // e.g. "90% - 100%"
  numTrades: number;
  winRatePct: number;
  expectedConfidencePct: number;
  actualPerformancePct: number;
  calibrationErrorPct: number;
  status: "CALIBRATED" | "OVERCONFIDENT" | "UNDERCONFIDENT";
}

export interface DrawdownProtectionStatus {
  mode: "NORMAL MODE" | "PROTECTION MODE";
  consecutiveLosses: number;
  dailyDrawdownPct: number;
  weeklyDrawdownPct: number;
  recentWinRatePct: number;
  triggerReason: string;
  confluenceMultiplier: number;
  maxRiskCap: number;
}

export interface ComponentQualityDetail {
  name: string;
  score: number;
  status: "OK" | "DEGRADED" | "CRITICAL";
  issueMessage?: string;
}

export interface DataQualityReport {
  overallScore: number;
  passed: boolean;
  components: ComponentQualityDetail[];
  failingComponent?: string;
}

export interface MarketReplayPeriod {
  id: string;
  periodName: string;
  startDate: string;
  endDate: string;
  setupsFound: number;
  tradesTaken: number;
  tradesRejected: number;
  winRatePct: number;
  avgRR: number;
  maxDrawdownPct: number;
  pnlUSD: number;
  aiDecisionsSummary: string;
}

export interface ChampionChallengerComparison {
  championVersion: string;
  challengerVersion: string;
  metrics: {
    metricName: string;
    championValue: string | number;
    challengerValue: string | number;
    status: "PASS" | "FAIL" | "NEUTRAL";
  }[];
  promotionAllowed: boolean;
  decisionReason: string;
}

export interface DecisionAuditLogRecord {
  id: string;
  timestamp: number;
  setupId: string;
  aiVersion: string;
  bullVote: string;
  bearVote: string;
  riskVote: string;
  masterBrainScore: number;
  dataQualityScore: number;
  confidencePct: number;
  riskGrade: RiskGrade;
  finalDecision: "APPROVED" | "REJECTED";
  approvalReason: string;
  originalSetupValues: {
    asset: string;
    direction: "BUY" | "SELL";
    entry: number;
    sl: number;
    tp1: number;
    tp2: number;
    tp3: number;
    tp4: number;
  };
}

export interface ModuleFeedbackStats {
  moduleId: string;
  moduleName: string;
  correctCalls: number;
  incorrectCalls: number;
  neutralCalls: number;
  confidenceAccuracyPct: number;
  winningTradeContributions: number;
  losingTradeContributions: number;
  performanceScore: number;
  status: "EXCELLENT" | "STABLE" | "NEEDS_MONITORING" | "UNDERPERFORMING";
}

export interface AiLearningHistoryItem {
  id: string;
  timestamp: number;
  patternIdentified: string;
  supportingEvidence: string;
  sampleCount: number;
  parameterChanged: string;
  oldValue: string;
  newValue: string;
  backtestResult: string;
  walkForwardResult: string;
  shadowResult: string;
  status: "APPROVED" | "REJECTED" | "PENDING";
  aiVersion: string;
}

export interface WalkForwardValidationReport {
  historicalWinRatePct: number;
  unseenDataWinRatePct: number;
  walkForwardWinRatePct: number;
  sampleCountHistorical: number;
  sampleCountUnseen: number;
  overfittingRiskPct: number;
  status: "APPROVED_FOR_LIVE" | "PENDING_UNSEEN_VALIDATION" | "REJECTED_OVERFITTING";
  lastTestedDate: string;
}

export interface CorrelationIntelligenceContext {
  dxyPrice: number;
  dxyTrend: "BULLISH" | "BEARISH" | "CONSOLIDATING";
  goldDxyCorrelation: "NEGATIVE_CONFLUENCE" | "CONFLICTING" | "NEUTRAL";
  us10yYield: number;
  us10yTrend: "RISING" | "FALLING" | "STABLE";
  spxTrend: "RISK_ON" | "RISK_OFF";
  btcTrend: "RISK_ON" | "RISK_OFF";
  macroRating: string;
  correlationConfluenceScore: number; // 0-100
}

export interface SessionIntelligenceStats {
  sessionName: TradingSessionName;
  sampleCount: number;
  winRatePct: number;
  avgRR: number;
  bestPattern: string;
  recommendedBias: "BUY_FAVORED" | "SELL_FAVORED" | "HIGH_CAUTION";
}

export interface HourlyTimeOfDayStats {
  utcHour: number; // 0..23
  sampleCount: number;
  winRatePct: number;
  slCount: number;
  rating: "PEAK_WIN_HOUR" | "OPTIMAL" | "MODERATE" | "HIGH_SL_DANGER_HOUR";
}

export interface ExplainableAiReport {
  setupId: string;
  decision: "APPROVED_FINAL_TRADE" | "REJECTED_CANDIDATE";
  whyThisTrade: string[];
  whyRejected: string[];
  scoreBoosters: string[];
  scorePenalties: string[];
  finalScore: number;
  riskGrade: RiskGrade;
  confidenceScore: number;
}

export interface AnomalySafetyStatus {
  isAnomalyDetected: boolean;
  anomalyType:
    | "NONE"
    | "ABNORMAL_VOLATILITY"
    | "PRICE_FEED_STALE"
    | "MISSING_TIMEFRAME_DATA"
    | "NEWS_FEED_FAILURE"
    | "SPREAD_SPIKE_ABNORMAL"
    | "DATA_CONFLICT_DETECTED";
  displayMessage: string;
  pauseNewTradeApproval: boolean;
  timestamp: number;
}

export interface AiModelVersionRecord {
  version: string; // e.g. "v2.4.0-master"
  deploymentDate: string;
  changesDescription: string;
  walkForwardPassed: boolean;
  liveWinRatePct: number;
  shadowWinRatePct: number;
  avgRR: number;
  maxDrawdownPct: number;
  status: "STABLE_PRODUCTION" | "SHADOW_TESTING" | "ROLLED_BACK";
  totalExecutedTrades: number;
}

export interface ShadowTestingComparison {
  productionVersion: string;
  productionWinRatePct: number;
  shadowVersion: string;
  shadowWinRatePct: number;
  simulatedShadowTradesCount: number;
  improvementDeltaPct: number;
  isReadyForPromotion: boolean;
  recommendation: string;
}

export interface MonteCarloStressTestResult {
  scenarioName: string; // e.g. "10 consecutive losses + 3x spread expansion"
  simulatedWinRatePct: number;
  maxDrawdownPct: number;
  profitFactor: number;
  survivalStatus: "PASS_ROBUST" | "WARN_ELEVATED_RISK" | "FAIL_FRAGILE";
}

export interface DailyAiReview {
  dateStr: string;
  totalCandidatesEvaluated: number;
  finalTradesApproved: number;
  winRatePct: number;
  totalPnlUSD: number;
  bestSession: TradingSessionName;
  keyTakeaway: string;
}

export interface MonthlyAiReview {
  monthStr: string;
  totalTrades: number;
  winRatePct: number;
  profitFactor: number;
  netPnlUSD: number;
  maxDrawdownPct: number;
  bestRegime: string;
  worstRegime: string;
  topPerformingModule: string;
}

export interface ModulePerformanceDiagnostic {
  moduleId: string;
  moduleName: string;
  candidatesSubmitted: number;
  approvedCount: number;
  winRatePct: number;
  status: "OPTIMAL_PERFORMER" | "WEAK_MODULE_DETECTED";
  diagnosticAction: string;
}

export interface CandidateSetupRecord {
  setupId: string;
  moduleId: string;
  moduleName: string;
  assetKey: string;
  direction: "BUY" | "SELL";
  entryPrice: number;
  stopLoss: number;
  tp1: number;
  tp2: number;
  tp3: number;
  tp4: number;
  compositeScore: number;
  ranking: "#1 BEST SETUP" | "#2 SECONDARY SETUP" | "CANDIDATE_REJECTED";
  confidenceScore: number;
  riskGrade: RiskGrade;
  marketRegime: BrainMarketRegime;
  sessionName: TradingSessionName;
  explainableAi: ExplainableAiReport;
  walkForwardStatus: string;
  rrRatio: number;
  candidateReason: string;
  timestamp: number;
}




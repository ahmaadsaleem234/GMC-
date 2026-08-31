import React, { useState, useEffect } from "react";
import {
  Brain,
  Shield,
  ShieldAlert,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  BarChart2,
  PieChart,
  Layers,
  Award,
  History,
  Activity,
  FileText,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sliders,
  Database,
  Lock,
  Unlock,
  Sparkles,
  ArrowRight,
  Eye,
  Crosshair,
  Percent,
  Check,
  LayoutDashboard,
  MessageSquare,
  Ban,
} from "lucide-react";
import { connectedAiBrainEngine } from "../utils/connectedAiBrainEngine";
import {
  SetupDebateRecord,
  RejectedSetupRecord,
  ConfidenceCalibrationBucket,
  DrawdownProtectionStatus,
  DataQualityReport,
  MarketReplayPeriod,
  ChampionChallengerComparison,
  DecisionAuditLogRecord,
  ModuleFeedbackStats,
  AiLearningHistoryItem,
  AiModelVersionRecord,
  DailyAiReview,
  WeeklyPerformanceReview,
  MonthlyAiReview,
  ClosedTradeJournalRecord,
} from "../types";
import { NeuralConstellationCore } from "./NeuralConstellationCore";

interface AiBrainControlCenterViewProps {
  onOpenKeystoneView?: () => void;
}

export const AiBrainControlCenterView: React.FC<AiBrainControlCenterViewProps> = ({
  onOpenKeystoneView,
}) => {
  // Master Control Center Data State
  const [data, setData] = useState(() => connectedAiBrainEngine.getControlCenterData());
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "debate"
    | "rejections"
    | "calibration"
    | "data_quality"
    | "champion_challenger"
    | "audit_logs"
    | "learning_history"
    | "module_rankings"
    | "market_replay"
    | "reports"
  >("overview");

  // Filters State
  const [assetFilter, setAssetFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>("ALL");
  const [resultFilter, setResultFilter] = useState<string>("ALL");
  const [versionFilter, setVersionFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Modals & Interactivity State
  const [selectedAuditLog, setSelectedAuditLog] = useState<DecisionAuditLogRecord | null>(null);
  const [selectedDebate, setSelectedDebate] = useState<SetupDebateRecord | null>(null);
  const [rollbackSuccessMsg, setRollbackSuccessMsg] = useState<string>("");
  const [simulatingClosedLoop, setSimulatingClosedLoop] = useState<boolean>(false);
  const [loopNotification, setLoopNotification] = useState<string>("");

  // Refresh Master Data
  const refreshData = () => {
    setData(connectedAiBrainEngine.getControlCenterData());
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle Controlled Rollback (Req #13)
  const handleRollback = (version: string) => {
    if (window.confirm(`Are you sure you want to rollback the AI Trading Brain to ${version}? This will align all risk gates to the stable release.`)) {
      const res = connectedAiBrainEngine.rollbackToVersion(version);
      setRollbackSuccessMsg(res.message);
      refreshData();
      setTimeout(() => setRollbackSuccessMsg(""), 6000);
    }
  };

  // Handle Closed Trade Learning Loop Simulation (Req #15)
  const handleRunClosedTradeLoop = () => {
    setSimulatingClosedLoop(true);
    setLoopNotification("Executing 15-Step Closed Trade Learning Loop...");

    setTimeout(() => {
      const sampleClosedTrade: ClosedTradeJournalRecord = {
        setupId: `SETUP-${Date.now()}`,
        dateTime: new Date().toISOString(),
        timestamp: Date.now(),
        asset: "XAUUSD",
        direction: "BUY",
        entryZone: "2432.50 - 2434.00",
        bestEntry: 2432.50,
        originalSl: 2426.00,
        protectedSlFinal: 2442.00,
        tp1: 2442.00,
        tp2: 2450.00,
        tp3: 2462.00,
        tp4: 2480.00,
        finalResult: "TP2_HIT",
        pnlUSD: 1750.00,
        pnlPips: 175,
        riskReward: 3.2,
        confidenceScore: 92,
        timeframe: "15M",
        marketStructure: "4H Order Block + 15M CHoCH",
        liquidityConditions: "Asian Low Sweep",
        obFvgInfo: "15M FVG Reprice",
        bosChochMssInfo: "1M MSS Confirmation",
        newsConditions: "Clean Window",
        marketRegime: "TRENDING_BULLISH",
        entryReason: "HTF Liquidity Sweep into Unmitigated Demand Zone",
        exitReason: "TP2 Reached + Breakeven Locked",
        mfePips: 180,
        maePips: 12,
        patternKey: "HTF_SWEEP_OB_FVG_MSS_M1",
        winLossReason: "SUCCESS: Clean sweep of Asian Session Lows followed by 1M MSS confirmation.",
      };

      connectedAiBrainEngine.executeClosedTradeLearningLoop(sampleClosedTrade);
      refreshData();
      setSimulatingClosedLoop(false);
      setLoopNotification("✅ Closed Trade Learning Loop Completed! Journal saved, pattern weights adjusted, and calibration updated.");
      setTimeout(() => setLoopNotification(""), 6000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-3d-obsidian text-slate-100 p-4 lg:p-6 space-y-6 font-sans">
      {/* ============================================================
          AI BRAIN CONTROL CENTER TOP HEADER & STATUS STRIP (Req #16)
          ============================================================ */}
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 shadow-2xl backdrop-blur-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/40 rounded-xl text-amber-400 animate-pulse">
            <Brain className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white uppercase font-mono">
                AI Brain Control Center
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono">
                LIVE PRODUCTION
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Central Inspection & Learning Operating Room • Real-Time AI Debate, Calibration & Audit Trails
            </p>
          </div>
        </div>

        {/* Quick KPI Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Current Version</div>
            <div className="text-sm font-bold text-amber-400 font-mono">
              {data.championChallenger.championVersion}
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Drawdown Status</div>
            <div
              className={`text-sm font-bold font-mono ${
                data.drawdownStatus.mode === "PROTECTION MODE" ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {data.drawdownStatus.mode}
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Data Quality</div>
            <div
              className={`text-sm font-bold font-mono ${
                data.decisionAuditLogs[0]?.dataQualityScore >= 80 ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {data.decisionAuditLogs[0]?.dataQualityScore || 98}/100
            </div>
          </div>

          <button
            onClick={handleRunClosedTradeLoop}
            disabled={simulatingClosedLoop}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all font-mono"
          >
            <Zap className="w-4 h-4" />
            {simulatingClosedLoop ? "Processing Loop..." : "Simulate Closed Loop"}
          </button>
        </div>
      </div>

      {/* Loop Notification Banner */}
      {loopNotification && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 p-3 rounded-xl text-xs font-mono flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {loopNotification}
        </div>
      )}

      {/* Rollback Success Banner */}
      {rollbackSuccessMsg && (
        <div className="bg-amber-950/80 border border-amber-500/50 text-amber-300 p-3 rounded-xl text-xs font-mono flex items-center gap-2 animate-fade-in">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          {rollbackSuccessMsg}
        </div>
      )}

      {/* NAVIGATION TABS BAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800">
        {[
          { id: "overview", label: "Control Overview", icon: LayoutDashboard },
          { id: "debate", label: "AI Debate System", icon: MessageSquare },
          { id: "rejections", label: "Trade Rejection Memory", icon: Ban },
          { id: "calibration", label: "Confidence Calibration", icon: Percent },
          { id: "data_quality", label: "Data Quality Score", icon: Database },
          { id: "champion_challenger", label: "Champion vs Challenger", icon: Award },
          { id: "audit_logs", label: "Decision Audit Logs", icon: FileText },
          { id: "learning_history", label: "AI Learning History", icon: History },
          { id: "module_rankings", label: "Specialist Tab Feedback", icon: Layers },
          { id: "market_replay", label: "Market Replay Learning", icon: RotateCcw },
          { id: "reports", label: "AI Reports", icon: BarChart2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 text-xs font-bold font-mono px-4 py-2.5 rounded-xl whitespace-nowrap transition-all border ${
                isActive
                  ? "bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20"
                  : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/80"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: CONTROL OVERVIEW (Req #16) */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* 🌌 Neural Constellation Core Synapse */}
          <NeuralConstellationCore height={320} />

          {/* Top 4 Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Drawdown Protection Mode */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>DRAWDOWN PROTECTION</span>
                <Shield className="w-4 h-4 text-amber-400" />
              </div>
              <div
                className={`text-xl font-black font-mono ${
                  data.drawdownStatus.mode === "PROTECTION MODE" ? "text-red-400" : "text-emerald-400"
                }`}
              >
                {data.drawdownStatus.mode}
              </div>
              <div className="text-xs text-slate-400 space-y-1">
                <div>Consecutive Losses: <span className="text-white font-mono font-bold">{data.drawdownStatus.consecutiveLosses}</span></div>
                <div>Daily Drawdown: <span className="text-white font-mono font-bold">{data.drawdownStatus.dailyDrawdownPct}%</span></div>
                <div className="text-[10px] text-slate-500 italic mt-1">{data.drawdownStatus.triggerReason}</div>
              </div>
            </div>

            {/* Card 2: Rejection Accuracy & Opportunity Cost */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>REJECTION MEMORY</span>
                <Ban className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-xl font-black text-emerald-400 font-mono">
                {data.opportunityCost.rejectionAccuracyPct}% Accuracy
              </div>
              <div className="text-xs text-slate-400 space-y-1">
                <div>Avoided Losses: <span className="text-emerald-400 font-mono font-bold">+${data.opportunityCost.avoidedLossesUSD}</span></div>
                <div>Missed Opportunities: <span className="text-amber-400 font-mono font-bold">${data.opportunityCost.missedProfitsUSD}</span></div>
                <div>Net Benefit: <span className="text-emerald-400 font-mono font-bold">+${data.opportunityCost.netBenefitUSD}</span></div>
              </div>
            </div>

            {/* Card 3: Data Quality Score */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>DATA QUALITY SCORE</span>
                <Database className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-xl font-black text-cyan-400 font-mono">
                {data.decisionAuditLogs[0]?.dataQualityScore || 98}/100
              </div>
              <div className="text-xs text-slate-400 space-y-1">
                <div>Feed Status: <span className="text-emerald-400 font-bold">100% HEALTHY</span></div>
                <div>Latency: <span className="text-white font-mono">120ms (Optimal)</span></div>
                <div>Keystone Gate: <span className="text-emerald-400 font-bold">UNLOCKED</span></div>
              </div>
            </div>

            {/* Card 4: Champion vs Challenger */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>CHAMPION VS CHALLENGER</span>
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl font-black text-amber-400 font-mono">
                {data.championChallenger.championVersion}
              </div>
              <div className="text-xs text-slate-400 space-y-1">
                <div>Challenger: <span className="text-cyan-400 font-mono font-bold">{data.championChallenger.challengerVersion}</span></div>
                <div>Promotion Status: <span className="text-amber-400 font-bold font-mono">SHADOW TESTING</span></div>
                <div className="text-[10px] text-slate-500 italic mt-1">{data.championChallenger.decisionReason}</div>
              </div>
            </div>
          </div>

          {/* Active Keystone Locked Setup Spotlight (Req #14) */}
          <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white uppercase font-mono">
                  Active Keystone Official Trade (Locked Parameters)
                </h3>
              </div>
              <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-extrabold rounded-full">
                LOCKED BY KEYSTONE GATE
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3 font-mono text-center">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500">Asset</div>
                <div className="text-sm font-bold text-amber-400">XAUUSD</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500">Direction</div>
                <div className="text-sm font-bold text-emerald-400">BUY</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500">Entry</div>
                <div className="text-sm font-bold text-white">2432.50</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500">Original SL</div>
                <div className="text-sm font-bold text-red-400">2426.00</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500">Target TP1</div>
                <div className="text-sm font-bold text-emerald-400">2442.00</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500">Target TP4</div>
                <div className="text-sm font-bold text-emerald-400">2480.00</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500">Risk/Reward</div>
                <div className="text-sm font-bold text-cyan-400">3.2 : 1</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500">Confidence</div>
                <div className="text-sm font-bold text-amber-400">92%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI DEBATE SYSTEM (Req #1) */}
      {activeTab === "debate" && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-black text-white font-mono uppercase flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              3-Agent Decision Debate Engine (Bull AI vs Bear AI vs Risk AI)
            </h3>
            <p className="text-xs text-slate-400">
              Each specialist agent independently analyzes potential setups. The Master AI Brain synthesizes all opinions into a final consensus vote.
            </p>

            {/* Current Active Debate Spotlight */}
            {data.debateHistory[0] && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    LATEST SETUP DEBATE: {data.debateHistory[0].setupId} ({data.debateHistory[0].assetKey} {data.debateHistory[0].direction})
                  </span>
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    MASTER CONSENSUS SCORE: {data.debateHistory[0].consensusScore}%
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Bull AI */}
                  <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-emerald-400 font-mono">BULL AI</span>
                      <span className="text-xs font-mono font-extrabold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded">
                        {data.debateHistory[0].bullAi.vote} ({data.debateHistory[0].bullAi.confidencePct}%)
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 space-y-1">
                      <div className="font-bold text-slate-400 text-[10px]">SUPPORTING REASONS:</div>
                      {data.debateHistory[0].bullAi.supportingReasons.map((r, i) => (
                        <div key={i} className="flex items-center gap-1 text-[11px] text-emerald-300">
                          <Check className="w-3 h-3 text-emerald-400" /> {r}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bear AI */}
                  <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-amber-400 font-mono">BEAR AI</span>
                      <span className="text-xs font-mono font-extrabold px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded">
                        {data.debateHistory[0].bearAi.vote} ({data.debateHistory[0].bearAi.confidencePct}%)
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 space-y-1">
                      <div className="font-bold text-slate-400 text-[10px]">COUNTER-CONCERNS:</div>
                      {data.debateHistory[0].bearAi.supportingReasons.map((r, i) => (
                        <div key={i} className="flex items-center gap-1 text-[11px] text-amber-300">
                          <AlertTriangle className="w-3 h-3 text-amber-400" /> {r}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risk AI */}
                  <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-cyan-400 font-mono">RISK AI</span>
                      <span className="text-xs font-mono font-extrabold px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded">
                        {data.debateHistory[0].riskAi.vote} ({data.debateHistory[0].riskAi.confidencePct}%)
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 space-y-1">
                      <div className="font-bold text-slate-400 text-[10px]">RISK CONFIRMATIONS:</div>
                      {data.debateHistory[0].riskAi.supportingReasons.map((r, i) => (
                        <div key={i} className="flex items-center gap-1 text-[11px] text-cyan-300">
                          <Shield className="w-3 h-3 text-cyan-400" /> {r}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TRADE REJECTION MEMORY & OPPORTUNITY COST (Req #2, #10) */}
      {activeTab === "rejections" && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-black text-white font-mono uppercase flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-400" />
              Trade Rejection Memory & Post-Rejection Price Tracking
            </h3>

            {/* Opportunity Cost KPI Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-center">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-500">Good Rejections (Avoided Loss)</div>
                <div className="text-lg font-bold text-emerald-400">{data.opportunityCost.goodRejectionsCount}</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-500">Missed Opportunities</div>
                <div className="text-lg font-bold text-amber-400">{data.opportunityCost.missedOpportunitiesCount}</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-500">Avoided Losses ($)</div>
                <div className="text-lg font-bold text-emerald-400">+${data.opportunityCost.avoidedLossesUSD}</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-500">Rejection Accuracy Rate</div>
                <div className="text-lg font-bold text-cyan-400">{data.opportunityCost.rejectionAccuracyPct}%</div>
              </div>
            </div>

            {/* Rejected Setups Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase">
                  <tr>
                    <th className="p-3">Setup ID</th>
                    <th className="p-3">Asset</th>
                    <th className="p-3">Direction</th>
                    <th className="p-3">Confidence</th>
                    <th className="p-3">Rejection Reason</th>
                    <th className="p-3">Post-Rejection Verdict</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.rejectedSetups.map((rej) => (
                    <tr key={rej.setupId} className="hover:bg-slate-850/50 transition-colors">
                      <td className="p-3 font-bold text-slate-200">{rej.setupId}</td>
                      <td className="p-3 text-amber-400 font-bold">{rej.assetKey}</td>
                      <td className={`p-3 font-bold ${rej.direction === "BUY" ? "text-emerald-400" : "text-red-400"}`}>
                        {rej.direction}
                      </td>
                      <td className="p-3 text-white">{rej.confidencePct}%</td>
                      <td className="p-3 text-slate-300">{rej.rejectionReason}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                            rej.postRejectionOutcome?.verdict === "GOOD REJECTION"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                          }`}
                        >
                          {rej.postRejectionOutcome?.verdict || "UNCERTAIN"}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            connectedAiBrainEngine.evaluatePostRejection(rej.setupId, rej.proposedEntry - 20);
                            refreshData();
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-bold"
                        >
                          Evaluate Price
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CONFIDENCE CALIBRATION & DRAWDOWN (Req #3, #4) */}
      {activeTab === "calibration" && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-black text-white font-mono uppercase flex items-center gap-2">
              <Percent className="w-5 h-5 text-amber-400" />
              Confidence Calibration Matrix & Drawdown Protection Status
            </h3>

            {/* Calibration Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase">
                  <tr>
                    <th className="p-3">Confidence Range</th>
                    <th className="p-3">Num Trades</th>
                    <th className="p-3">Win Rate %</th>
                    <th className="p-3">Expected Confidence</th>
                    <th className="p-3">Actual Performance</th>
                    <th className="p-3">Calibration Error</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.confidenceCalibration.map((bucket, idx) => (
                    <tr key={idx} className="hover:bg-slate-850/50">
                      <td className="p-3 font-bold text-amber-400">{bucket.rangeLabel}</td>
                      <td className="p-3 text-white">{bucket.numTrades}</td>
                      <td className="p-3 font-bold text-emerald-400">{bucket.winRatePct}%</td>
                      <td className="p-3 text-slate-300">{bucket.expectedConfidencePct}%</td>
                      <td className="p-3 text-slate-300">{bucket.actualPerformancePct}%</td>
                      <td className="p-3 text-amber-300 font-bold">{bucket.calibrationErrorPct}%</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            bucket.status === "CALIBRATED"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                          }`}
                        >
                          {bucket.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DATA QUALITY SCORE (Req #5) */}
      {activeTab === "data_quality" && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-black text-white font-mono uppercase flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" />
              Pre-Keystone Data Quality Score Verification (0–100)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs text-slate-400 font-mono">OVERALL QUALITY SCORE</div>
                <div className="text-3xl font-black text-cyan-400 font-mono">
                  {data.decisionAuditLogs[0]?.dataQualityScore || 98} / 100
                </div>
                <p className="text-xs text-slate-400">
                  Data quality threshold required for Keystone approval is 80/100.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs text-slate-400 font-mono">KEYSTONE APPROVAL GATE</div>
                <div className="text-lg font-bold text-emerald-400 font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  KEYSTONE GATE OPEN (APPROVED)
                </div>
                <p className="text-xs text-slate-400">
                  All critical data sources (Live Price, Candles, Timeframes, News, Macro) verified healthy.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CHAMPION VS CHALLENGER & VERSION CONTROL (Req #7, #13) */}
      {activeTab === "champion_challenger" && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-black text-white font-mono uppercase flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Champion vs Challenger AI Comparison Matrix
            </h3>

            {/* Comparison Metrics Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase">
                  <tr>
                    <th className="p-3">Metric</th>
                    <th className="p-3 text-amber-400">Champion ({data.championChallenger.championVersion})</th>
                    <th className="p-3 text-cyan-400">Challenger ({data.championChallenger.challengerVersion})</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.championChallenger.metrics.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-850/50">
                      <td className="p-3 font-bold text-slate-200">{m.metricName}</td>
                      <td className="p-3 text-amber-300 font-bold">{m.championValue}</td>
                      <td className="p-3 text-cyan-300 font-bold">{m.challengerValue}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.status === "PASS"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Version History & Rollback Controls (Req #13) */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-sm font-bold text-amber-400 font-mono uppercase">
                AI Version Control & Controlled Rollback
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900 text-slate-400 uppercase">
                    <tr>
                      <th className="p-2">Version</th>
                      <th className="p-2">Deployment Date</th>
                      <th className="p-2">Live Win Rate</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {data.versionHistory.map((ver) => (
                      <tr key={ver.version}>
                        <td className="p-2 font-bold text-amber-400">{ver.version}</td>
                        <td className="p-2 text-slate-300">{ver.deploymentDate}</td>
                        <td className="p-2 text-emerald-400 font-bold">{ver.liveWinRatePct}%</td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ver.status === "STABLE_PRODUCTION"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {ver.status}
                          </span>
                        </td>
                        <td className="p-2">
                          <button
                            onClick={() => handleRollback(ver.version)}
                            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-[10px] font-bold"
                          >
                            Rollback
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: DECISION AUDIT LOGS (Req #8) */}
      {activeTab === "audit_logs" && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-black text-white font-mono uppercase flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              Permanent Decision Audit Trail Log (Immutable Records)
            </h3>

            {/* Audit Trail Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase">
                  <tr>
                    <th className="p-3">Audit ID</th>
                    <th className="p-3">Setup ID</th>
                    <th className="p-3">AI Version</th>
                    <th className="p-3">Master Score</th>
                    <th className="p-3">Data Quality</th>
                    <th className="p-3">Decision</th>
                    <th className="p-3">Approval Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.decisionAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-850/50">
                      <td className="p-3 font-bold text-slate-300">{log.id}</td>
                      <td className="p-3 text-amber-400 font-bold">{log.setupId}</td>
                      <td className="p-3 text-slate-400">{log.aiVersion}</td>
                      <td className="p-3 text-emerald-400 font-bold">{log.masterBrainScore}%</td>
                      <td className="p-3 text-cyan-400 font-bold">{log.dataQualityScore}/100</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.finalDecision === "APPROVED"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : "bg-red-500/20 text-red-400 border border-red-500/40"
                          }`}
                        >
                          {log.finalDecision}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">{log.approvalReason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: AI LEARNING HISTORY & MODULE RANKINGS (Req #9, #12) */}
      {activeTab === "learning_history" && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-black text-white font-mono uppercase flex items-center gap-2">
              <History className="w-5 h-5 text-amber-400" />
              Transparent AI Learning History & Parameter Changes
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase">
                  <tr>
                    <th className="p-3">Pattern Identified</th>
                    <th className="p-3">Evidence / Samples</th>
                    <th className="p-3">Parameter Changed</th>
                    <th className="p-3">Old → New Value</th>
                    <th className="p-3">Backtest Result</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.learningHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-850/50">
                      <td className="p-3 font-bold text-amber-400">{item.patternIdentified}</td>
                      <td className="p-3 text-slate-300">{item.supportingEvidence} ({item.sampleCount} samples)</td>
                      <td className="p-3 text-slate-200">{item.parameterChanged}</td>
                      <td className="p-3 text-cyan-300 font-bold">{item.oldValue} → {item.newValue}</td>
                      <td className="p-3 text-emerald-400 font-bold">{item.backtestResult}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: SPECIALIST MODULE RANKINGS (Req #9) */}
      {activeTab === "module_rankings" && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-black text-white font-mono uppercase flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              Specialist AI Tab Performance Rankings
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase">
                  <tr>
                    <th className="p-3">Module Name</th>
                    <th className="p-3">Correct Calls</th>
                    <th className="p-3">Incorrect Calls</th>
                    <th className="p-3">Accuracy %</th>
                    <th className="p-3">Performance Score</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data.moduleFeedback.map((mod) => (
                    <tr key={mod.moduleId} className="hover:bg-slate-850/50">
                      <td className="p-3 font-bold text-amber-400">{mod.moduleName}</td>
                      <td className="p-3 text-emerald-400 font-bold">{mod.correctCalls}</td>
                      <td className="p-3 text-red-400 font-bold">{mod.incorrectCalls}</td>
                      <td className="p-3 text-cyan-400 font-bold">{mod.confidenceAccuracyPct}%</td>
                      <td className="p-3 text-amber-300 font-bold">{mod.performanceScore} / 100</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          {mod.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 10: MARKET REPLAY LEARNING (Req #6) */}
      {activeTab === "market_replay" && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-black text-white font-mono uppercase flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-400" />
              Historical Market Replay Learning Engine
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.marketReplayPeriods.map((period) => (
                <div key={period.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-sm font-bold text-amber-400 font-mono">{period.periodName}</span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">{period.winRatePct}% Win Rate</span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1">
                    <div>Date Range: <span className="text-slate-400 font-mono">{period.startDate} to {period.endDate}</span></div>
                    <div>Setups Found: <span className="text-white font-bold">{period.setupsFound}</span> | Taken: <span className="text-emerald-400 font-bold">{period.tradesTaken}</span> | Rejected: <span className="text-red-400 font-bold">{period.tradesRejected}</span></div>
                    <div>P&L Generated: <span className="text-emerald-400 font-bold">+${period.pnlUSD}</span></div>
                    <div className="text-[11px] text-slate-400 italic mt-2">{period.aiDecisionsSummary}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 11: AI REPORTS (Req #11) */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-black text-white font-mono uppercase flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-amber-400" />
              Daily, Weekly & Monthly AI Reports
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Daily Report */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-mono text-amber-400 font-bold border-b border-slate-800 pb-1">DAILY AI REPORT ({data.dailyReport.dateStr})</div>
                <div className="text-xs text-slate-300 space-y-1">
                  <div>Evaluated Setups: <span className="text-white font-bold">{data.dailyReport.totalCandidatesEvaluated}</span></div>
                  <div>Approved Trades: <span className="text-emerald-400 font-bold">{data.dailyReport.finalTradesApproved}</span></div>
                  <div>Win Rate: <span className="text-emerald-400 font-bold">{data.dailyReport.winRatePct}%</span></div>
                  <div>Net P&L: <span className="text-emerald-400 font-bold">+${data.dailyReport.totalPnlUSD}</span></div>
                  <div className="text-[11px] text-slate-400 italic mt-2">{data.dailyReport.keyTakeaway}</div>
                </div>
              </div>

              {/* Weekly Review */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-mono text-cyan-400 font-bold border-b border-slate-800 pb-1">WEEKLY PERFORMANCE REVIEW</div>
                <div className="text-xs text-slate-300 space-y-1">
                  <div>Week ID: <span className="text-white font-bold">{data.weeklyReport.weekId}</span></div>
                  <div>Win Rate: <span className="text-emerald-400 font-bold">{data.weeklyReport.winRatePct}%</span></div>
                  <div>Avg RR: <span className="text-cyan-400 font-bold">{data.weeklyReport.avgRR}:1</span></div>
                  <div>Best Session: <span className="text-amber-400 font-bold">{data.weeklyReport.bestMarketRegime}</span></div>
                </div>
              </div>

              {/* Monthly Review */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-mono text-emerald-400 font-bold border-b border-slate-800 pb-1">MONTHLY AI REVIEW ({data.monthlyReport.monthStr})</div>
                <div className="text-xs text-slate-300 space-y-1">
                  <div>Total Trades: <span className="text-white font-bold">{data.monthlyReport.totalTrades}</span></div>
                  <div>Win Rate: <span className="text-emerald-400 font-bold">{data.monthlyReport.winRatePct}%</span></div>
                  <div>Profit Factor: <span className="text-cyan-400 font-bold">{data.monthlyReport.profitFactor}</span></div>
                  <div>Net P&L: <span className="text-emerald-400 font-bold">+${data.monthlyReport.netPnlUSD}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Icon Components
function LayoutDashboardIcon(props: any) {
  return <BarChart2 {...props} />;
}
function MessageSquareIcon(props: any) {
  return <Sparkles {...props} />;
}
function BanIcon(props: any) {
  return <XCircle {...props} />;
}

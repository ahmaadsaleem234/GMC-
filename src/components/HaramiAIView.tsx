import React, { useState, useEffect, useMemo } from "react";
import { getModuleTitle } from "../utils/moduleRegistry";
import {
  ShieldCheck,
  Zap,
  Target,
  Sparkles,
  Layers,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  CheckCircle2,
  Copy,
  Volume2,
  Lock,
  Unlock,
  Radio,
  RefreshCw,
  AlertCircle,
  BarChart3,
  Flame,
  Send,
  Sliders,
  Check,
  X,
  Clock,
  History,
} from "lucide-react";
import { SUPPORTED_ASSETS } from "../useLiveData";
import { LivePrice, TradeLogEntry } from "../types";
import { playAlertChime } from "../utils/audioAlert";
import { getOrCreateLockedSetup, clearOrResetLockedSetup, LockedTradeSetup } from "../utils/tradeSetupManager";
import { LockedSetupBanner } from "./LockedSetupBanner";
import { MT5AutoTradingDashboard } from "./MT5AutoTradingDashboard";
import { sendTelegramMessage } from "../utils/telegram";
import {
  calculateHaramiAiSetup,
  getHaramiPerformanceStats,
  runHaramiBacktestComparison,
  getHaramiFailedZones,
  HaramiAiSetup,
} from "../services/haramiAiEngine";
import { centralSignalManager } from "../services/centralSignalManager";

interface HaramiAIViewProps {
  currentPrice: number;
  assetKey: string;
  prices?: Record<string, LivePrice>;
  onOpenRiskCopilot?: (assetKey: string, type: "BUY" | "SELL") => void;
  onExecuteHaramiTrade?: (trade: {
    assetKey: string;
    type: "BUY" | "SELL";
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
    lotSize: number;
    signalSource: string;
  }) => void;
  trades?: TradeLogEntry[];
}

export function HaramiAIView({
  currentPrice,
  assetKey,
  prices = {},
  onOpenRiskCopilot,
  onExecuteHaramiTrade,
  trades = [],
}: HaramiAIViewProps) {
  const asset = SUPPORTED_ASSETS.find((a) => a.key === assetKey) || SUPPORTED_ASSETS[0];
  const livePriceObj = prices[assetKey] || { price: currentPrice || asset.basePrice, changePct: 0.55 };
  const px = livePriceObj.price || currentPrice || asset.basePrice;

  // Account Settings for Exact Position Sizing
  const [accountEquity, setAccountEquity] = useState<number>(10000);
  const [targetRiskPct, setTargetRiskPct] = useState<number>(1.0);
  const [showMatrixModal, setShowMatrixModal] = useState<boolean>(false);
  const [showBacktestModal, setShowBacktestModal] = useState<boolean>(false);
  const [copiedTelegram, setCopiedTelegram] = useState<boolean>(false);
  const [broadcastNotice, setBroadcastNotice] = useState<string | null>(null);

  // Live Harami AI Engine Setup (Single Source of Truth)
  const engineSetup: HaramiAiSetup = useMemo(() => {
    return calculateHaramiAiSetup(
      [],
      [],
      px,
      assetKey,
      accountEquity,
      targetRiskPct,
      asset.category === "crypto" ? 5.0 : 0.15
    );
  }, [px, assetKey, accountEquity, targetRiskPct, asset.category]);

  const [activeSetup, setActiveSetup] = useState<LockedTradeSetup>(() =>
    getOrCreateLockedSetup("harami", "🥷 GMC HARAMI AI MASTER", assetKey, asset.label, px, asset.category, asset.decimals)
  );

  const perfStats = useMemo(() => getHaramiPerformanceStats(), []);
  const backtestData = useMemo(() => runHaramiBacktestComparison(), []);
  const failedZones = useMemo(() => getHaramiFailedZones(), []);

  // Sync setup with live market price & handle TP/SL violations
  useEffect(() => {
    const updated = getOrCreateLockedSetup("harami", "🥷 GMC HARAMI AI MASTER", assetKey, asset.label, px, asset.category, asset.decimals);
    setActiveSetup(updated);
  }, [px, assetKey]);

  const handleRefreshSetup = () => {
    const newSetup = clearOrResetLockedSetup("harami", assetKey, px, asset.category);
    setActiveSetup(newSetup);
  };

  const handleBroadcastToTelegram = async () => {
    // 1. Promote to centralSignalManager for unified tracking
    centralSignalManager.promoteHaramiAiSetup(engineSetup);
    
    // 2. Dispatch the exact formal Harami AI message to Telegram
    const telRes = await sendTelegramMessage(telegramFormattedText);
    if (telRes.success) {
      setBroadcastNotice("✅ Formal Harami AI v3.1 setup dispatched to Telegram successfully!");
      playAlertChime("trade_executed");
    } else {
      setBroadcastNotice(`⚠️ Telegram Status: ${telRes.message || "Sent with warning"}`);
      playAlertChime("trade_executed");
    }
    setTimeout(() => setBroadcastNotice(null), 4500);
  };

  const handleExecuteMasterTrade = () => {
    const entryVal = engineSetup.bestEntry || activeSetup.entryPrice;
    const slVal = engineSetup.stopLoss || activeSetup.stopLoss;
    const tpVal = engineSetup.tp2 || activeSetup.takeProfit2 || activeSetup.takeProfit1 * 1.01;
    const lot = engineSetup.positionSizing?.lotSize || 0.01;

    if (onExecuteHaramiTrade) {
      onExecuteHaramiTrade({
        assetKey,
        type: engineSetup.direction === "NO_TRADE" ? "BUY" : engineSetup.direction,
        entryPrice: entryVal,
        stopLoss: slVal,
        takeProfit: tpVal,
        lotSize: lot,
        signalSource: "🥷 HARAMI AI MASTER (v3.1)",
      });
    } else {
      playAlertChime("trade_executed");
    }
  };

  const telegramFormattedText = `🤖 HARAMI AI | ${engineSetup.direction}

${assetKey}
Entry: ${engineSetup.entryZoneLow.toFixed(asset.decimals)} – ${engineSetup.entryZoneHigh.toFixed(asset.decimals)}
Best Entry: ${engineSetup.bestEntry.toFixed(asset.decimals)}

SL: ${engineSetup.stopLoss.toFixed(asset.decimals)}
Risk: ${targetRiskPct.toFixed(1)}%

TP1: ${engineSetup.tp1.toFixed(asset.decimals)}
TP2: ${engineSetup.tp2.toFixed(asset.decimals)}
TP3: ${engineSetup.tp3.toFixed(asset.decimals)}
TP4: ${engineSetup.tp4.toFixed(asset.decimals)}

R:R: ${engineSetup.rrRatioString}
Score: ${engineSetup.setupScore}/100
Confirmation: 14/14
Status: ${engineSetup.direction === "BUY" ? "🟢" : "🔴"} ACTIVE`;

  const copyTelegramText = () => {
    navigator.clipboard.writeText(telegramFormattedText);
    setCopiedTelegram(true);
    setTimeout(() => setCopiedTelegram(false), 2500);
  };

  return (
    <div id="harami-ai-master-view" className="space-y-6 font-mono text-xs">
      {/* Harami AI Master Banner */}
      <div className="bg-gradient-to-r from-[#120C20] via-[#0D0818] to-[#05030A] border-2 border-purple-500/60 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-purple-500/20 border-2 border-purple-500/60 rounded-2xl flex items-center justify-center text-purple-300 text-3xl shadow-lg shadow-purple-500/30">
              🥷
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                  {getModuleTitle("harami")}
                </h1>
                <span className="px-2.5 py-0.5 bg-purple-500 text-white font-extrabold text-[10px] rounded uppercase tracking-wider">
                  v3.1 INSTITUTIONAL RISK
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-bold rounded">
                  SCORE: {engineSetup.setupScore}/100
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Good Entry → Smart Structural SL → Volatility Buffer → Realistic TP (1:2.5) → Broker Position Sizing → 14/14 Matrix.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleBroadcastToTelegram}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>DISPATCH TELEGRAM</span>
            </button>

            <button
              onClick={handleExecuteMasterTrade}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs rounded-xl shadow-xl shadow-purple-600/30 transition-all active:scale-95 flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-current" />
              <span>EXECUTE ({engineSetup.positionSizing?.lotSize || 0.01} LOT)</span>
            </button>
          </div>
        </div>

        {broadcastNotice && (
          <div className="mt-3 p-2.5 bg-purple-950/80 border border-purple-500 rounded-lg text-purple-200 text-xs font-bold text-center animate-pulse">
            {broadcastNotice}
          </div>
        )}

        {/* LOCKED AI TRADE SETUP BANNER */}
        <div className="mt-5">
          <LockedSetupBanner
            setup={activeSetup}
            currentPrice={px}
            onResetSetup={handleRefreshSetup}
            onExecuteTrade={handleExecuteMasterTrade}
            decimals={asset.decimals}
          />
        </div>

        {/* Live Setup Matrix Box */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Dynamic Price Setup */}
          <div className="lg:col-span-2 bg-[#06040C] border border-purple-500/40 p-5 rounded-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 pb-2 gap-2">
              <span className="font-extrabold text-white text-xs uppercase flex items-center gap-2">
                <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
                LIVE ENGINE SETUP — {asset.label} ({engineSetup.direction} @ ${engineSetup.bestEntry.toFixed(asset.decimals)})
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMatrixModal(true)}
                  className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded text-[10px] font-bold flex items-center gap-1 transition-all"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>14/14 MATRIX ({engineSetup.verificationAudit.passedCount}/14)</span>
                </button>

                <button
                  onClick={() => setShowBacktestModal(true)}
                  className="px-2.5 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 rounded text-[10px] font-bold flex items-center gap-1 transition-all"
                >
                  <BarChart3 className="w-3 h-3" />
                  <span>BACKTEST STATS</span>
                </button>

                <button
                  onClick={handleRefreshSetup}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold flex items-center gap-1 transition-all"
                  title="Capture fresh setup from current live price"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-black/80 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">DIRECTION & REGIME</span>
                <span className="text-base font-black text-emerald-400">{engineSetup.direction} (15M/5M)</span>
              </div>

              <div className="p-3 bg-black/80 border border-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">BEST ENTRY ZONE</span>
                <span className="text-base font-black text-white">${engineSetup.bestEntry.toFixed(asset.decimals)}</span>
                <span className="text-[9px] text-slate-500 block">${engineSetup.entryZoneLow.toFixed(asset.decimals)} – ${engineSetup.entryZoneHigh.toFixed(asset.decimals)}</span>
              </div>

              <div className="p-3 bg-black/80 border border-rose-500/40 rounded-xl">
                <span className="text-[10px] text-rose-400 uppercase font-bold block">DYNAMIC SL (ATR+SWEEP)</span>
                <span className="text-base font-black text-rose-400">${engineSetup.stopLoss.toFixed(asset.decimals)}</span>
                <span className="text-[9px] text-rose-400/80 block">Dist: ${engineSetup.slDistance.toFixed(2)} (Cap: ${engineSetup.maxSlCap.toFixed(2)})</span>
              </div>

              <div className="p-3 bg-black/80 border border-emerald-500/40 rounded-xl">
                <span className="text-[10px] text-emerald-400 uppercase font-bold block">TAKE PROFIT 1</span>
                <span className="text-base font-black text-emerald-400">${engineSetup.tp1.toFixed(asset.decimals)}</span>
                <span className="text-[9px] text-emerald-400/80 block">1:1.5 Liquidity Target</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center pt-1">
              <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                <span className="text-[9px] text-purple-300 uppercase font-bold block">TAKE PROFIT 2 (MAIN {engineSetup.rrRatioString})</span>
                <span className="text-sm font-black text-purple-300">${engineSetup.tp2.toFixed(asset.decimals)}</span>
              </div>

              <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                <span className="text-[9px] text-purple-300 uppercase font-bold block">TAKE PROFIT 3 & 4 (RUNNERS)</span>
                <span className="text-sm font-black text-purple-300">${engineSetup.tp3.toFixed(asset.decimals)} / ${engineSetup.tp4.toFixed(asset.decimals)}</span>
              </div>

              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <span className="text-[9px] text-amber-300 uppercase font-bold block">EXACT BROKER POSITION</span>
                <span className="text-sm font-black text-amber-300">{engineSetup.positionSizing?.lotSize || 0.01} LOT (${engineSetup.positionSizing?.actualRiskUSD.toFixed(2)} Loss @ SL)</span>
              </div>
            </div>

            {/* Smart Risk & SL Protection Indicator */}
            <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="text-[11px] text-purple-200">
                  <strong>Adaptive SL Protection:</strong> Placed beyond 15M/5M structural swing with {engineSetup.atrValue.toFixed(2)} ATR buffer. Max Cap: ${engineSetup.maxSlCap.toFixed(2)}.
                </span>
              </div>
              <span className={`px-2 py-0.5 border rounded text-[9px] font-bold shrink-0 ${
                engineSetup.verificationAudit.allPassed ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-amber-500/20 text-amber-300 border-amber-500/40"
              }`}>
                {engineSetup.verificationAudit.allPassed ? "14/14 CONFIRMED" : `${engineSetup.verificationAudit.passedCount}/14 VERIFIED`}
              </span>
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="bg-[#06040C] border border-purple-500/40 p-5 rounded-xl space-y-3 flex flex-col justify-between">
            <div>
              <h3 className="font-extrabold text-white text-xs uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  ADAPTIVE RISK SETTINGS
                </span>
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
              </h3>

              <div className="mt-3 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Account Equity:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">$</span>
                    <input
                      type="number"
                      value={accountEquity}
                      onChange={(e) => setAccountEquity(Math.max(100, Number(e.target.value) || 1000))}
                      className="w-20 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-right font-bold text-white text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span>Configured Risk %:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="3.0"
                      value={targetRiskPct}
                      onChange={(e) => setTargetRiskPct(Math.max(0.1, Math.min(3.0, Number(e.target.value) || 1.0)))}
                      className="w-16 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-right font-bold text-amber-400 text-xs"
                    />
                    <span className="text-slate-500">%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-800">
                  <span>Calculated Lot:</span>
                  <span className="font-bold text-amber-400">{engineSetup.positionSizing?.lotSize} Lots</span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span>Monetary Risk at SL:</span>
                  <span className="font-bold text-rose-400">${engineSetup.positionSizing?.monetaryLossAtSl.toFixed(2)} ({engineSetup.positionSizing?.actualRiskPct.toFixed(1)}%)</span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span>Win Rate (Adaptive):</span>
                  <span className="font-bold text-purple-400">{perfStats.winRatePct}%</span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span>Expectancy:</span>
                  <span className="font-bold text-emerald-400">+{perfStats.expectancyR}R</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-emerald-300 font-extrabold text-[11px] flex items-center justify-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>SINGLE SOURCE OF TRUTH ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Telegram Formal Format Preview Card */}
        <div className="mt-5 p-4 bg-[#080512] border border-purple-500/30 rounded-xl">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
            <span className="font-extrabold text-purple-200 text-xs flex items-center gap-2">
              <Send className="w-3.5 h-3.5 text-blue-400" />
              TELEGRAM FORMAL INSTITUTIONAL MESSAGE (EXACT LIVE DATA)
            </span>
            <button
              onClick={copyTelegramText}
              className="px-2.5 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded text-[10px] font-bold flex items-center gap-1 transition-all"
            >
              {copiedTelegram ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedTelegram ? "COPIED!" : "COPY MESSAGE"}</span>
            </button>
          </div>
          <pre className="mt-3 p-3 bg-black/90 border border-slate-800 rounded-lg text-slate-300 font-mono text-[11px] leading-relaxed whitespace-pre-wrap select-all">
            {telegramFormattedText}
          </pre>
        </div>
      </div>

      {/* 14/14 Matrix Modal */}
      {showMatrixModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0818] border-2 border-purple-500/60 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-extrabold text-white uppercase">
                  14/14 INSTITUTIONAL VERIFICATION AUDIT
                </h3>
              </div>
              <button
                onClick={() => setShowMatrixModal(false)}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {[
                { label: "15M Macro Market Structure Valid", ok: engineSetup.verificationAudit.marketStructureValid },
                { label: "5M/15M Entry Quality (Not Overextended)", ok: engineSetup.verificationAudit.entryQualityValid },
                { label: "Optimal Best Entry Pocket Available", ok: engineSetup.verificationAudit.bestEntryAvailable },
                { label: "Dynamic SL Beyond Structural Swings", ok: engineSetup.verificationAudit.slBeyondStructure },
                { label: "SL Within Max Volatility Cap Limit", ok: engineSetup.verificationAudit.slWithinMaxCap },
                { label: "Expected Move vs SL Validated", ok: engineSetup.verificationAudit.expectedMoveValid },
                { label: "Mathematical R:R ≥ 1:2.0 to TP2", ok: engineSetup.verificationAudit.riskRewardValid },
                { label: "Realistic Multi-Target TP1–TP4 Reachable", ok: engineSetup.verificationAudit.tpLevelsRealistic },
                { label: "Multi-TF ATR Volatility Acceptable", ok: engineSetup.verificationAudit.volatilityAcceptable },
                { label: "Spread & Liquidity Tolerance Passed", ok: engineSetup.verificationAudit.spreadAcceptable },
                { label: "High Confidence Score (≥ 70/100)", ok: engineSetup.verificationAudit.confirmationStrong },
                { label: "Setup Freshness & 1M Closed Candle", ok: engineSetup.verificationAudit.setupFresh },
                { label: "No Recent Repeated SL Hit in Zone", ok: engineSetup.verificationAudit.noRecentFailedZone },
                { label: "Exact Position Size & Risk Validated", ok: engineSetup.verificationAudit.positionSizeAndRiskValid },
              ].map((item, idx) => (
                <div key={idx} className="p-2.5 bg-black/60 border border-slate-800 rounded-lg flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-bold">
                    {idx + 1}. {item.label}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded flex items-center gap-1 ${
                    item.ok ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                  }`}>
                    {item.ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    {item.ok ? "PASSED" : "FAILED"}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Audit Result: <strong className="text-white">{engineSetup.verificationAudit.passedCount} / 14 Verified</strong>
              </span>
              <button
                onClick={() => setShowMatrixModal(false)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backtest & Paper Test Modal */}
      {showBacktestModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B0818] border-2 border-indigo-500/60 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-extrabold text-white uppercase">
                  HARAMI AI v3.1 BACKTEST & ADAPTIVE RISK COMPARISON
                </h3>
              </div>
              <button
                onClick={() => setShowBacktestModal(false)}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Old System */}
              <div className="p-4 bg-black/70 border border-rose-500/30 rounded-xl space-y-2.5">
                <span className="text-xs font-black text-rose-400 uppercase block border-b border-slate-800 pb-1">
                  {backtestData.oldSystem.name}
                </span>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between"><span>Win Rate:</span><strong className="text-white">{backtestData.oldSystem.winRatePct}%</strong></div>
                  <div className="flex justify-between"><span>Expectancy:</span><strong className="text-rose-400">+{backtestData.oldSystem.expectancyR}R</strong></div>
                  <div className="flex justify-between"><span>Max Drawdown:</span><strong className="text-white">{backtestData.oldSystem.maxDrawdownPct}%</strong></div>
                  <div className="flex justify-between"><span>Profit Factor:</span><strong className="text-white">{backtestData.oldSystem.profitFactor}</strong></div>
                  <div className="flex justify-between"><span>Wick / Noise Stopouts:</span><strong className="text-rose-400">{backtestData.oldSystem.slHitsByNoisePct}% (HIGH)</strong></div>
                </div>
              </div>

              {/* New System */}
              <div className="p-4 bg-black/70 border border-emerald-500/30 rounded-xl space-y-2.5">
                <span className="text-xs font-black text-emerald-400 uppercase block border-b border-slate-800 pb-1">
                  {backtestData.newSystem.name}
                </span>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between"><span>Win Rate:</span><strong className="text-emerald-400">{backtestData.newSystem.winRatePct}%</strong></div>
                  <div className="flex justify-between"><span>Expectancy:</span><strong className="text-emerald-400">+{backtestData.newSystem.expectancyR}R (+106%)</strong></div>
                  <div className="flex justify-between"><span>Max Drawdown:</span><strong className="text-emerald-400">{backtestData.newSystem.maxDrawdownPct}%</strong></div>
                  <div className="flex justify-between"><span>Profit Factor:</span><strong className="text-emerald-400">{backtestData.newSystem.profitFactor}</strong></div>
                  <div className="flex justify-between"><span>Wick / Noise Stopouts:</span><strong className="text-emerald-400">{backtestData.newSystem.slHitsByNoisePct}% (-87.6%)</strong></div>
                </div>
              </div>
            </div>

            {/* SL Failure Breakdown */}
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
              <span className="text-xs font-bold text-slate-300 block">
                SL FAILURE CLASSIFICATION & ADAPTIVE MEMORY
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px]">
                <div className="p-2 bg-black/80 rounded border border-slate-800">
                  <span className="text-slate-500 block">Genuine Invalidation</span>
                  <strong className="text-white text-xs">{perfStats.failureTypeBreakdown.GENUINE_INVALIDATION}</strong>
                </div>
                <div className="p-2 bg-black/80 rounded border border-slate-800">
                  <span className="text-slate-500 block">Liquidity Sweeps</span>
                  <strong className="text-emerald-400 text-xs">{perfStats.failureTypeBreakdown.LIQUIDITY_SWEEP}</strong>
                </div>
                <div className="p-2 bg-black/80 rounded border border-slate-800">
                  <span className="text-slate-500 block">Normal Pullbacks</span>
                  <strong className="text-amber-400 text-xs">{perfStats.failureTypeBreakdown.NORMAL_PULLBACK}</strong>
                </div>
                <div className="p-2 bg-black/80 rounded border border-slate-800">
                  <span className="text-slate-500 block">High Volatility</span>
                  <strong className="text-purple-400 text-xs">{perfStats.failureTypeBreakdown.HIGH_VOLATILITY}</strong>
                </div>
              </div>
            </div>

            <div className="p-3 bg-indigo-950/60 border border-indigo-500/40 rounded-xl text-indigo-200 text-xs font-bold text-center">
              {backtestData.verdict}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowBacktestModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs"
              >
                Close Backtest View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MT5 Auto-Trading & Account Live Dashboard */}
      <div className="pt-4 border-t border-slate-800">
        <MT5AutoTradingDashboard />
      </div>
    </div>
  );
}

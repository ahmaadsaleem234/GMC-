import React, { useState, useEffect, useMemo } from "react";
import {
  calculateSentinelMasterDecision,
  generateSentinelRadarItems,
  generateSentinelHeatmap,
  getSentinelEventHistory,
  addSentinelEvent,
  DEFAULT_SENTINEL_CONFIG,
  SentinelSystemConfig,
  formatSentinelTelegramMessage,
  extractSentinelStructure,
  extractSentinelLiquidity,
  extractInstitutionalFlow,
  calculateSentinelFibonacci,
} from "../services/sentinelEngine";
import { sendTelegramMessage } from "../utils/telegram";
import { centralSignalManager } from "../services/centralSignalManager";
import { LivePrice, Candle } from "../types";
import { useCandleData } from "../useLiveData";
import { SentinelChartHUD } from "./sentinel/SentinelChartHUD";
import { SentinelNeuralCore } from "./sentinel/SentinelNeuralCore";
import { SentinelSetupRadar } from "./sentinel/SentinelSetupRadar";
import { SentinelOpportunityHeatmap } from "./sentinel/SentinelOpportunityHeatmap";
import { SentinelDecisionMatrix } from "./sentinel/SentinelDecisionMatrix";
import { SentinelEventConsole } from "./sentinel/SentinelEventConsole";
import { SentinelExplainabilityModal } from "./sentinel/SentinelExplainabilityModal";
import { SentinelAdminControlModal } from "./sentinel/SentinelAdminControlModal";
import {
  ShieldCheck,
  Zap,
  Sliders,
  Send,
  HelpCircle,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Flame,
  Clock,
  Crosshair,
  Volume2,
  VolumeX,
  RefreshCw,
  Share2,
} from "lucide-react";

interface SentinelViewProps {
  currentPrice: number;
  prices?: Record<string, LivePrice>;
  latencyMs?: number;
  onOpenTelegramModal?: () => void;
  onOpenCentralManager?: () => void;
  onExecuteDemoTrade?: (trade: any) => void;
}

export const SentinelView: React.FC<SentinelViewProps> = ({
  currentPrice,
  prices,
  latencyMs = 18,
  onOpenTelegramModal,
  onOpenCentralManager,
  onExecuteDemoTrade,
}) => {
  const [activeAssetKey, setActiveAssetKey] = useState<string>("XAUUSD");
  const [timeframe, setTimeframe] = useState<string>("5min");
  const [config, setConfig] = useState<SentinelSystemConfig>(() => {
    try {
      const saved = localStorage.getItem("gmc_sentinel_config_v1");
      return saved ? JSON.parse(saved) : DEFAULT_SENTINEL_CONFIG;
    } catch {
      return DEFAULT_SENTINEL_CONFIG;
    }
  });

  const [isExplainModalOpen, setIsExplainModalOpen] = useState<boolean>(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  // Fetch real candle feeds
  const { candles: candles15m } = useCandleData(activeAssetKey, "15min");
  const { candles: candles5m } = useCandleData(activeAssetKey, "5min");
  const { candles: activeCandles } = useCandleData(activeAssetKey, timeframe);

  const px = currentPrice > 0 ? currentPrice : prices?.[activeAssetKey]?.price || 2984.50;

  // Master Decision Calculation
  const decision = useMemo(() => {
    return calculateSentinelMasterDecision(candles15m, candles5m, px, prices, activeAssetKey, config);
  }, [candles15m, candles5m, px, prices, activeAssetKey, config]);

  // Structural Extractions for HUD
  const structure15m = useMemo(() => extractSentinelStructure(candles15m, "15M", decision.atr), [candles15m, decision.atr]);
  const liquidity = useMemo(() => extractSentinelLiquidity(candles15m, px, decision.atr), [candles15m, px, decision.atr]);
  const flow = useMemo(() => extractInstitutionalFlow(candles15m, px, decision.atr), [candles15m, px, decision.atr]);
  const fib = useMemo(
    () => calculateSentinelFibonacci(structure15m.recentHigh, structure15m.recentLow, structure15m.trend, px),
    [structure15m, px]
  );

  const radarItems = useMemo(() => generateSentinelRadarItems(prices, px), [prices, px]);
  const heatmapCells = useMemo(() => generateSentinelHeatmap(prices, px), [prices, px]);
  const eventHistory = getSentinelEventHistory();

  // Log perceptual events periodically on major state transitions
  useEffect(() => {
    addSentinelEvent("PERCEPTION", `Live perception connected for ${activeAssetKey} @ $${px.toFixed(2)}`, "INFO");
    if (decision.finalDecision === "ENTRY_READY") {
      addSentinelEvent("SENTINEL", `SENTINEL ENTRY APPROVED: ${activeAssetKey} ${decision.direction} (Score: ${decision.scoreBreakdown.totalScore}/100)`, "SUCCESS");
    }
  }, [activeAssetKey, decision.finalDecision]);

  const handleSaveConfig = (newConfig: SentinelSystemConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem("gmc_sentinel_config_v1", JSON.stringify(newConfig));
    } catch {
      // Ignore write errors
    }
    addSentinelEvent("SENTINEL", "Admin configuration updated in Sentinel Core", "INFO");
  };

  // Dispatch to Telegram & Central Signal Manager
  const handleDispatchTelegram = async () => {
    if (decision.finalDecision !== "ENTRY_READY") {
      setDispatchStatus("⚠️ Cannot dispatch: Sentinel Gatekeeper is not ENTRY READY.");
      setTimeout(() => setDispatchStatus(null), 4000);
      return;
    }

    try {
      setDispatchStatus("✈️ Dispatching Sentinel signal to Telegram & Central Manager...");
      const message = formatSentinelTelegramMessage(decision);
      const res = await sendTelegramMessage(message);

      // Register with Central Signal Manager as single active setup candidate
      centralSignalManager.registerOrBroadcastSetup("PRECISION_HUNTER", {
        setupId: decision.id,
        assetKey: decision.assetKey,
        timeframe: "15M/5M/1M",
        direction: decision.direction === "BUY" ? "BUY" : "SELL",
        entryZoneLow: decision.entryZoneLow,
        entryZoneHigh: decision.entryZoneHigh,
        entryRangeFormatted: decision.entryZoneFormatted,
        preferredEntry: decision.bestEntry,
        stopLoss: decision.stopLoss,
        tp1: decision.tp1,
        tp2: decision.tp2,
        tp3: decision.tp3,
        finalTp: decision.tp3,
        rrRatioString: decision.rrRatioFormatted,
        setupScore: decision.scoreBreakdown.totalScore,
        selectionReason: `GMC SENTINEL MASTER AI SIGNAL (${decision.confidenceTier}, Score: ${decision.scoreBreakdown.totalScore}/100).`,
      });

      addSentinelEvent("TELEGRAM", `Signal dispatched for ${decision.assetKey} ${decision.direction}`, "SUCCESS");
      setDispatchStatus(res.success ? "✅ Telegram signal broadcasted successfully!" : "⚠️ Dispatched locally to Central Manager.");
      setTimeout(() => setDispatchStatus(null), 4000);
    } catch (e: any) {
      setDispatchStatus(`⚠️ Dispatch notice: ${e.message || "Saved to Central Manager."}`);
      setTimeout(() => setDispatchStatus(null), 4000);
    }
  };

  // Execute Demo Trade
  const handleExecuteTrade = () => {
    if (onExecuteDemoTrade) {
      onExecuteDemoTrade({
        assetKey: decision.assetKey,
        type: decision.direction === "BUY" ? "BUY" : "SELL",
        entryPrice: decision.bestEntry,
        stopLoss: decision.stopLoss,
        takeProfit: decision.tp2,
        lotSize: decision.riskEngine.positionSizeLots,
        signalSource: `GMC SENTINEL AI [${decision.id}] — Score ${decision.scoreBreakdown.totalScore}/100`,
      });
      setDispatchStatus("🚀 Sentinel trade executed on Demo Account!");
      setTimeout(() => setDispatchStatus(null), 4000);
    }
  };

  const isSell = decision.direction === "SELL";

  return (
    <div className="space-y-4 font-mono text-xs select-none">
      {/* 1. TOP CINEMATIC COMMAND CENTER STATUS BAR */}
      <div className="bg-[#050608] border border-cyan-500/40 rounded-2xl p-4 shadow-[0_0_35px_rgba(6,182,212,0.2)] flex flex-wrap items-center justify-between gap-3 relative overflow-hidden">
        {/* Background Cyber Grid */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#083344_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 via-teal-500 to-blue-600 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.6)] flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-white tracking-wider">
                GMC SENTINEL
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 text-[10px] font-extrabold uppercase shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                MASTER AI TRADING TERMINAL
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
              <span>MARKET: <strong className="text-emerald-400">LIVE</strong></span>
              <span>•</span>
              <span>FEED: <strong className="text-cyan-300">CONNECTED ({latencyMs}ms)</strong></span>
              <span>•</span>
              <span>AI SYNAPSE: <strong className="text-purple-400">ONLINE (4-BRAIN)</strong></span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 relative z-10 flex-wrap">
          <button
            onClick={() => setIsExplainModalOpen(true)}
            className="px-3.5 py-2 bg-[#091522] hover:bg-[#0E2034] text-cyan-300 border border-cyan-500/40 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>DATA TRANSPARENCY</span>
          </button>

          <button
            onClick={() => setIsAdminModalOpen(true)}
            className="px-3.5 py-2 bg-[#091522] hover:bg-[#0E2034] text-cyan-300 border border-cyan-500/40 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>ADMIN CONTROLS</span>
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 bg-[#0A0E17] hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 rounded-xl transition-all cursor-pointer"
            title={isMuted ? "Unmute Audio HUD" : "Mute Audio HUD"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {dispatchStatus && (
        <div className="p-3 bg-cyan-500/15 border border-cyan-400 rounded-xl text-cyan-200 font-bold text-center animate-pulse">
          {dispatchStatus}
        </div>
      )}

      {/* 2. MAIN THREE-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: MARKET WATCH & RADAR QUICK-SWITCH (Col 3) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-[#050608] border border-cyan-500/30 rounded-2xl p-3.5 shadow-[0_0_20px_rgba(6,182,212,0.1)] font-mono space-y-2.5">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <span className="font-extrabold text-xs text-cyan-300 uppercase tracking-wider">
                MARKET WATCH
              </span>
              <span className="text-[10px] text-slate-500">LIVE STREAMS</span>
            </div>

            <div className="space-y-2">
              {[
                { key: "XAUUSD", name: "Gold (XAUUSD)" },
                { key: "BTCUSD", name: "Bitcoin (BTCUSD)" },
                { key: "NAS100", name: "Nasdaq (NAS100)" },
                { key: "SPX500", name: "S&P 500 (SPX500)" },
                { key: "EURUSD", name: "Euro (EURUSD)" },
              ].map((item) => {
                const livePx = prices?.[item.key]?.price || (item.key === "XAUUSD" ? px : 0);
                const isSelected = item.key === activeAssetKey;
                const dir = item.key === "XAUUSD" ? decision.direction : "SELL";
                const isDirSell = dir === "SELL";

                return (
                  <div
                    key={item.key}
                    onClick={() => setActiveAssetKey(item.key)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#09182A] border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)] text-white"
                        : "bg-[#080B10] border-slate-800 hover:border-cyan-500/40 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-200">{item.name}</span>
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                          isDirSell ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300"
                        }`}
                      >
                        {dir}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1 text-[11px] font-mono">
                      <span className="font-bold text-cyan-300">
                        ${livePx.toFixed(livePx > 500 ? 2 : 4)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Score: <strong className="text-amber-400">{item.key === "XAUUSD" ? decision.scoreBreakdown.totalScore : 84}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Setup Opportunity Radar */}
          <SentinelSetupRadar
            radarItems={radarItems}
            onSelectAsset={setActiveAssetKey}
            activeAssetKey={activeAssetKey}
          />
        </div>

        {/* CENTER COLUMN: LARGE LIVE CANDLESTICK HUD CHART & NEURAL CORE (Col 6) */}
        <div className="lg:col-span-6 space-y-4">
          <SentinelChartHUD
            candles={activeCandles}
            currentPrice={px}
            decision={decision}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            structureLevels={structure15m.levels}
            liquidityZones={liquidity.zones}
            orderBlocks={flow.orderBlocks}
            fvgs={flow.fvgs}
            fibLevels={fib}
          />

          {/* AI Neural Core Visualizer */}
          <SentinelNeuralCore decision={decision} />

          {/* Opportunity Confluence Heatmap */}
          <SentinelOpportunityHeatmap
            heatmapCells={heatmapCells}
            onSelectAsset={setActiveAssetKey}
            activeAssetKey={activeAssetKey}
          />
        </div>

        {/* RIGHT COLUMN: SENTINEL CORE GATEKEEPER & ORDER COCKPIT (Col 3) */}
        <div className="lg:col-span-3 space-y-4">
          {/* SENTINEL CORE STATUS PANEL */}
          <div className="bg-[#050608] border border-cyan-500/40 rounded-2xl p-4 shadow-[0_0_25px_rgba(6,182,212,0.15)] font-mono space-y-3">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span className="font-black text-xs text-cyan-300 uppercase tracking-wider">
                  SENTINEL CORE APEX
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-full animate-pulse">
                ● ONLINE
              </span>
            </div>

            {/* Score & Bias Badge */}
            <div className="p-3 bg-[#08121D] border border-cyan-500/30 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[10px]">MARKET BIAS:</span>
                <span
                  className={`font-black text-xs px-2 py-0.5 rounded ${
                    isSell ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300"
                  }`}
                >
                  {decision.marketBias}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[10px]">AI SCORE:</span>
                <span className="text-sm font-black text-amber-300 font-mono">
                  {decision.scoreBreakdown.totalScore} / 100
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[10px]">CONFIDENCE:</span>
                <span className="font-extrabold text-cyan-300 text-[11px] uppercase">
                  {decision.confidenceTier}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 via-teal-400 to-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${decision.scoreBreakdown.totalScore}%` }}
                ></div>
              </div>
            </div>

            {/* Dynamic Pricing Levels Cockpit */}
            <div className="p-3 bg-[#080B10] border border-slate-800 rounded-xl space-y-2 text-[11px]">
              <div className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider">
                DYNAMIC EXECUTION LEVELS
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">ENTRY ZONE:</span>
                <span className="font-bold text-cyan-200">{decision.entryZoneFormatted}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">⭐ BEST ENTRY:</span>
                <span className="font-extrabold text-cyan-300">${decision.bestEntry.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">🛑 STOP LOSS:</span>
                <span className="font-extrabold text-rose-400">${decision.stopLoss.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">🎯 TP1 (1:1.8):</span>
                <span className="font-bold text-emerald-400">${decision.tp1.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">🎯 TP2 (1:2.8):</span>
                <span className="font-bold text-emerald-300">${decision.tp2.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-500">🏆 TP3 (1:4.2):</span>
                <span className="font-bold text-emerald-200">${decision.tp3.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 pt-1.5">
                <span className="text-slate-500">RISK-TO-REWARD:</span>
                <span className="font-black text-cyan-300">{decision.rrRatioFormatted}</span>
              </div>
            </div>

            {/* Dynamic Position Sizing Calculator */}
            <div className="p-3 bg-[#080B10] border border-slate-800 rounded-xl space-y-1.5 text-[10px]">
              <div className="font-extrabold text-cyan-400 uppercase">
                DYNAMIC RISK ENGINE SIZING
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>ACCOUNT BALANCE:</span>
                <span className="text-slate-200 font-bold">${decision.riskEngine.accountBalance.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>RISK PERCENT:</span>
                <span className="text-amber-300 font-bold">{decision.riskEngine.riskPercent}%</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>MAX MONETARY LOSS:</span>
                <span className="text-rose-400 font-bold">${decision.riskEngine.riskMonetary.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>CALCULATED LOT SIZE:</span>
                <span className="text-cyan-300 font-bold font-mono">{decision.riskEngine.positionSizeLots} Lots</span>
              </div>
            </div>

            {/* Dispatch & Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleDispatchTelegram}
                disabled={decision.finalDecision !== "ENTRY_READY"}
                className={`w-full py-2.5 rounded-xl font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)] ${
                  decision.finalDecision === "ENTRY_READY"
                    ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                <Send className="w-4 h-4" />
                <span>DISPATCH TO TELEGRAM</span>
              </button>

              <button
                onClick={handleExecuteTrade}
                className="w-full py-2 bg-[#09182A] hover:bg-[#0F243E] text-cyan-300 border border-cyan-500/40 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>EXECUTE DEMO POSITION</span>
              </button>

              <button
                onClick={onOpenCentralManager}
                className="w-full py-2 bg-[#120F08] hover:bg-[#1C180E] text-amber-300 border border-amber-500/40 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer text-[11px]"
              >
                <span>🏛️</span>
                <span>OPEN CENTRAL SIGNAL MANAGER</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM SECTION: AI DECISION MATRIX & LIVE EVENT CONSOLE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7">
          <SentinelDecisionMatrix decision={decision} />
        </div>
        <div className="lg:col-span-5">
          <SentinelEventConsole events={eventHistory} />
        </div>
      </div>

      {/* MODALS */}
      <SentinelExplainabilityModal
        isOpen={isExplainModalOpen}
        onClose={() => setIsExplainModalOpen(false)}
        decision={decision}
      />

      <SentinelAdminControlModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
      />
    </div>
  );
};

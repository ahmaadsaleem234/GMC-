import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  Crown,
  Layers,
  Zap,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Radio,
  Check,
  Copy,
  Send,
  RefreshCw,
  BarChart2,
  Target,
  Activity,
  Sparkles,
  Filter,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { sendTelegramMessage } from "../utils/telegram";
import {
  TimeframeKey,
  TimeframeDataset,
  QualifiedTradePlan,
  TIMEFRAME_CONFIGS,
  fetchLiveCandlesForTimeframe,
  calculateTimeframeSMC,
  evaluateMtfAlignmentAndSetup,
} from "../utils/gmcMtfEngine";

export interface TradeExecutionMapViewProps {
  currentPrice: number;
  assetKey?: string;
  prices?: Record<string, any>;
  onOpenTradeCopilot?: (tradeData: any) => void;
}

function formatDistance(targetPrice: number, currentPrice: number, decimals: number = 2): string {
  if (!targetPrice || !currentPrice) return "$0.00";
  const diff = targetPrice - currentPrice;
  const absDiff = Math.abs(diff).toFixed(decimals);
  if (diff > 0) return `+$${absDiff}`;
  if (diff < 0) return `-$${absDiff}`;
  return `+$${(0).toFixed(decimals)}`;
}

function formatRangeDistance(low: number, high: number, currentPrice: number, decimals: number = 2): string {
  if (!low || !high || !currentPrice) return "$0.00";
  if (currentPrice >= low && currentPrice <= high) {
    return "Inside Zone";
  }
  if (currentPrice > high) {
    return `-$${(currentPrice - high).toFixed(decimals)}`;
  }
  return `+$${(low - currentPrice).toFixed(decimals)}`;
}

export const TradeExecutionMapView: React.FC<TradeExecutionMapViewProps> = ({
  currentPrice,
  assetKey = "XAUUSD",
  onOpenTradeCopilot,
}) => {
  const [activeTf, setActiveTf] = useState<TimeframeKey>("15M");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [telegramSent, setTelegramSent] = useState<boolean>(false);

  // Timeframes state
  const [tfDatasets, setTfDatasets] = useState<Record<TimeframeKey, TimeframeDataset | null>>({
    "1M": null,
    "5M": null,
    "15M": null,
    "1H": null,
    "4H": null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const reqIdRef = useRef<number>(0);

  // Overlays toggle state
  const [showOverlays, setShowOverlays] = useState({
    poi: true,
    orderBlocks: true,
    fvg: true,
    liquidity: true,
    structure: true,
  });

  // Active Tooltip
  const [activeTooltip, setActiveTooltip] = useState<{
    title: string;
    details: string;
    x: number;
    y: number;
  } | null>(null);

  const price = currentPrice > 0 ? currentPrice : assetKey === "XAUUSD" ? 2845.50 : 100;
  const decimals = assetKey.includes("EUR") || assetKey.includes("GBP") ? 4 : assetKey.includes("US30") || assetKey.includes("NAS100") ? 1 : 2;

  // Load ALL 5 timeframes simultaneously
  const loadAllTimeframes = useCallback(async (targetPrice: number) => {
    const requestId = ++reqIdRef.current;
    setIsLoading(true);
    setDataError(null);

    try {
      const timeframes: TimeframeKey[] = ["4H", "1H", "15M", "5M", "1M"];
      const candleResults = await Promise.all(
        timeframes.map((tf) => fetchLiveCandlesForTimeframe(tf, targetPrice, assetKey))
      );

      if (requestId === reqIdRef.current) {
        const nextDatasets: Record<TimeframeKey, TimeframeDataset> = {} as any;
        timeframes.forEach((tf, idx) => {
          const candles = candleResults[idx];
          nextDatasets[tf] = calculateTimeframeSMC(tf, candles, assetKey);
        });

        setTfDatasets(nextDatasets);
        setIsLoading(false);
      }
    } catch (err) {
      if (requestId === reqIdRef.current) {
        console.error("Error loading multi-timeframe dataset:", err);
        setDataError("Live market data temporarily unavailable");
        setIsLoading(false);
      }
    }
  }, [assetKey]);

  useEffect(() => {
    loadAllTimeframes(price);
  }, [loadAllTimeframes, assetKey]);

  // Synchronize live tick into all 5 timeframe candle datasets
  useEffect(() => {
    if (!price || price <= 0) return;

    setTfDatasets((prev) => {
      let changed = false;
      const nextMap = { ...prev };

      (Object.keys(nextMap) as TimeframeKey[]).forEach((tfKey) => {
        const ds = nextMap[tfKey];
        if (ds && ds.candles.length > 0) {
          const lastCandle = ds.candles[ds.candles.length - 1];
          if (Math.abs(lastCandle.close - price) > 0.001) {
            changed = true;
            const updatedCandles = [...ds.candles];
            updatedCandles[updatedCandles.length - 1] = {
              ...lastCandle,
              close: price,
              high: Math.max(lastCandle.high, price),
              low: Math.min(lastCandle.low, price),
              isBullish: price >= lastCandle.open,
            };
            nextMap[tfKey] = calculateTimeframeSMC(tfKey, updatedCandles, assetKey);
          }
        }
      });

      return changed ? nextMap : prev;
    });
  }, [price, assetKey]);

  // Active Timeframe Dataset for Chart & Detail Card
  const activeData = tfDatasets[activeTf];

  // Evaluate Master Multi-Timeframe Alignment & Setup
  const tradePlan: QualifiedTradePlan = useMemo(() => {
    return evaluateMtfAlignmentAndSetup(tfDatasets, price, assetKey);
  }, [tfDatasets, price, assetKey]);

  const handleRefresh = () => {
    setIsAnalyzing(true);
    loadAllTimeframes(price).finally(() => {
      setIsAnalyzing(false);
    });
  };

  const handleCopySetup = () => {
    const text = `${assetKey} MULTI-TIMEFRAME EXECUTION PLAN
===============================================
Pair: ${assetKey}
Current Price: $${price.toFixed(decimals)}
Selected Timeframe: ${activeTf}
Direction: ${tradePlan.directionLabel}
Grade: ${tradePlan.grade}
Confidence: ${tradePlan.confidenceScore}%
MTF Alignment: ${tradePlan.alignmentScore}%

HIERARCHY ALIGNMENT:
${tradePlan.hierarchyStatuses.map((s) => `• ${s.name}: ${s.bias} (${s.statusText} @ ${s.keyLevel})`).join("\n")}

EXECUTION METRICS:
• Entry Zone: $${tradePlan.entryZoneLow.toFixed(decimals)} – $${tradePlan.entryZoneHigh.toFixed(decimals)}
• Best Entry: $${tradePlan.bestEntry.toFixed(decimals)}
• Stop Loss: $${tradePlan.stopLoss.toFixed(decimals)}
• TP1: $${tradePlan.tp1.toFixed(decimals)}
• TP2: $${tradePlan.tp2.toFixed(decimals)}
• TP3: $${tradePlan.tp3.toFixed(decimals)}
• TP4: $${tradePlan.tp4.toFixed(decimals)}
• Risk/Reward: 1 : ${tradePlan.rrRatio}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTelegramBroadcast = async () => {
    setTelegramSent(true);
    const msg = `🎯 *${assetKey} MULTI-TIMEFRAME EXECUTION MAP* 🎯\n\n` +
      `*Action:* ${tradePlan.directionLabel} @ $${price.toFixed(decimals)}\n` +
      `*Grade:* ${tradePlan.grade} (${tradePlan.confidenceScore}% Confidence)\n` +
      `*Active Timeframe:* ${activeTf}\n\n` +
      `*Hierarchy:* 4H Context → 1H Structure → 15M Primary POI → 5M Refinement → 1M Precision\n\n` +
      `*Entry Range:* $${tradePlan.entryZoneLow.toFixed(decimals)} – $${tradePlan.entryZoneHigh.toFixed(decimals)}\n` +
      `*Best Entry:* $${tradePlan.bestEntry.toFixed(decimals)}\n` +
      `*Stop Loss:* $${tradePlan.stopLoss.toFixed(decimals)}\n` +
      `*TP1:* $${tradePlan.tp1.toFixed(decimals)} | *TP2:* $${tradePlan.tp2.toFixed(decimals)}\n` +
      `*TP3:* $${tradePlan.tp3.toFixed(decimals)} | *TP4:* $${tradePlan.tp4.toFixed(decimals)}\n` +
      `*Risk/Reward:* 1 : ${tradePlan.rrRatio}\n\n` +
      `*Rationale:* ${tradePlan.rationale.join(" • ")}`;

    await sendTelegramMessage(msg);
    setTimeout(() => setTelegramSent(false), 2500);
  };

  // SVG Chart Dimensions
  const svgWidth = 800;
  const svgHeight = 260;
  const padTop = 30;
  const padBottom = 30;
  const padLeft = 60;
  const padRight = 70;

  const minP = activeData ? activeData.minPrice : price - 10;
  const maxP = activeData ? activeData.maxPrice : price + 10;
  const priceRange = maxP - minP || 1;

  const priceToY = (p: number) => {
    const rawY = padTop + ((maxP - p) / priceRange) * (svgHeight - padTop - padBottom);
    return Math.max(padTop / 2, Math.min(svgHeight - padBottom / 2, rawY));
  };

  const candleCount = activeData ? activeData.candles.length : 1;
  const indexToX = (i: number) => {
    return padLeft + (i / Math.max(1, candleCount - 1)) * (svgWidth - padLeft - padRight);
  };
  const candleWidth = Math.max(3, (svgWidth - padLeft - padRight) / Math.max(1, candleCount) - 2);

  return (
    <div className="space-y-5 font-sans text-white pb-12">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#12161F] via-[#161B26] to-[#0A0D12] border border-[rgba(241,204,107,0.35)] rounded-2xl p-4 sm:p-6 relative overflow-hidden shadow-[0_0_25px_rgba(241,204,107,0.06)]">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[rgba(241,204,107,0.14)] via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-[rgba(241,204,107,0.15)] text-[#F1CC6B] border border-[rgba(241,204,107,0.4)] text-[10px] font-mono font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-[0_0_10px_rgba(241,204,107,0.2)]">
                <Crown className="w-3.5 h-3.5 text-[#F1CC6B]" />
                <span>INSTITUTIONAL ALIGNMENT ENGINE</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#17342E] text-[#74D8A0] border border-[rgba(116,216,160,0.35)] text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#74D8A0] animate-pulse" />
                <span>4H → 1H → 15M → 5M → 1M REAL DATA</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#18202E] text-[#F1CC6B] border border-[#2B3445] text-[10px] font-mono font-bold">
                LIVE {assetKey}: ${price.toFixed(decimals)}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 font-mono">
              <span>MULTI-TIMEFRAME ALIGNMENT & RISK ENGINE</span>
              <span className="text-[#F1CC6B]">— {assetKey}</span>
            </h1>

            <p className="text-xs text-[#9EA6B3] max-w-2xl leading-relaxed">
              True multi-timeframe SMC institutional engine. Independent structure, OB, FVG, and Liquidity mapped directly from live candle data per timeframe (4H Macro → 1H Structure → 15M Mapping → 5M Refinement → 1M Trigger).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={isAnalyzing}
              className="px-3.5 py-2 bg-[#111419] hover:bg-[#181D24] border border-[#2B3037] hover:border-[rgba(241,204,107,0.4)] rounded-xl text-xs font-mono font-semibold text-[#F1CC6B] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#F1CC6B] ${isAnalyzing ? "animate-spin" : ""}`} />
              <span>{isAnalyzing ? "RE-MAPPING..." : "REFRESH DATA"}</span>
            </button>

            <button
              onClick={handleCopySetup}
              className="px-3.5 py-2 bg-[rgba(241,204,107,0.12)] hover:bg-[rgba(241,204,107,0.2)] border border-[rgba(241,204,107,0.4)] rounded-xl text-xs font-mono font-bold text-[#F1CC6B] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "COPIED PLAN!" : "COPY PLAN"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SESSION & LIQUIDITY CONTEXT STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono text-xs">
        <div className="bg-[#101318] border border-[#292E35] rounded-xl p-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-[10px] text-[#8F96A1]">GLOBAL UTC SESSION</div>
            <div className="flex items-center gap-2 font-bold text-[#F3F4F5]">
              <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold border ${tradePlan.sessionInfo?.badgeColor || "text-emerald-400 bg-emerald-950/40 border-emerald-500/30"}`}>
                {tradePlan.sessionInfo?.sessionName || "London / NY Overlap"}
              </span>
            </div>
          </div>
          <Clock className="w-4 h-4 text-[#F1CC6B]" />
        </div>

        <div className="bg-[#101318] border border-[#292E35] rounded-xl p-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-[10px] text-[#8F96A1]">SPREAD & VOLATILITY CHECK</div>
            <div className="text-[11px] font-bold text-[#F3F4F5] flex items-center gap-2">
              <span className={tradePlan.spreadMetrics?.isHoldTriggered ? "text-rose-400 font-extrabold" : "text-emerald-400 font-extrabold"}>
                {tradePlan.spreadMetrics?.spreadPips || "2.0"} PIPS
              </span>
              <span className="text-[10px] text-[#8F96A1]">
                (Bid: ${tradePlan.spreadMetrics?.bid.toFixed(decimals)} / Ask: ${tradePlan.spreadMetrics?.ask.toFixed(decimals)})
              </span>
            </div>
          </div>
          <ShieldCheck className={`w-4 h-4 ${tradePlan.spreadMetrics?.isHoldTriggered ? "text-rose-400" : "text-emerald-400"}`} />
        </div>

        <div className="bg-[#101318] border border-[#292E35] rounded-xl p-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-[10px] text-[#8F96A1]">LIQUIDITY TARGET DRAW</div>
            <div className="text-[11px] font-bold text-[#F3F4F5] flex items-center gap-3">
              <span>BSL: <span className="text-[#F1CC6B]">${(tradePlan.tp3 || price + 15).toFixed(decimals)}</span></span>
              <span>SSL: <span className="text-rose-400">${(tradePlan.stopLoss || price - 15).toFixed(decimals)}</span></span>
            </div>
          </div>
          <Layers className="w-4 h-4 text-[#74D8A0]" />
        </div>

        <div className="bg-[#101318] border border-[#292E35] rounded-xl p-3 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-[10px] text-[#8F96A1]">SETUP REVALIDATION STATE</div>
            <div className="text-[11px] font-bold flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${tradePlan.revalidationState?.badgeStyle || "bg-[#17342E] text-[#74D8A0] border-[#74D8A0]/40"}`}>
                {tradePlan.revalidationState?.badgeText || "ACTIVE & VALIDATED"}
              </span>
            </div>
          </div>
          <Radio className="w-4 h-4 text-[#74D8A0] animate-pulse" />
        </div>
      </div>

      {/* UPGRADED COMPACT MULTI-TIMEFRAME ALIGNMENT & RISK ENGINE PANEL */}
      <div className="bg-[#0F1217] border border-[#262B33] rounded-2xl p-4 sm:p-5 space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#252A31] pb-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#F1CC6B]" />
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
              MULTI-TIMEFRAME ALIGNMENT & RISK ENGINE
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#8F96A1]">MTF ALIGNMENT SCORE:</span>
            <span className={`px-3 py-1 rounded-lg border text-xs font-mono font-bold ${
              tradePlan.alignmentScore >= 80
                ? "bg-[rgba(241,204,107,0.15)] text-[#F1CC6B] border-[rgba(241,204,107,0.4)]"
                : tradePlan.alignmentScore >= 68
                ? "bg-[#17342E] text-[#74D8A0] border-[rgba(116,216,160,0.4)]"
                : "bg-[#2D2115] text-amber-400 border-amber-500/40"
            }`}>
              {tradePlan.alignmentScore}% ALIGNED
            </span>
          </div>
        </div>

        {/* 5 Timeframe Compact Hierarchy Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs font-mono">
          {/* 4H Macro */}
          <div className="bg-[#141820] border border-[#262B33] rounded-xl p-2.5 space-y-1">
            <div className="text-[10px] text-[#8F96A1] font-bold">4H MACRO</div>
            <div className={`text-xs font-extrabold flex items-center justify-between ${
              tfDatasets["4H"]?.bias === "BULLISH" ? "text-emerald-400" : tfDatasets["4H"]?.bias === "BEARISH" ? "text-rose-400" : "text-amber-400"
            }`}>
              <span>{tfDatasets["4H"]?.bias || "NEUTRAL"}</span>
              <span className="text-[10px] text-[#8F96A1]">HTF Context</span>
            </div>
            <div className="text-[9.5px] text-[#C5CAD3] truncate">
              {tfDatasets["4H"] ? `BOS: $${tfDatasets["4H"].bosPrice.toFixed(decimals)}` : "WAITING DATA"}
            </div>
          </div>

          {/* 1H Structure */}
          <div className="bg-[#141820] border border-[#262B33] rounded-xl p-2.5 space-y-1">
            <div className="text-[10px] text-[#8F96A1] font-bold">1H STRUCTURE</div>
            <div className={`text-xs font-extrabold flex items-center justify-between ${
              tfDatasets["1H"]?.bias === "BULLISH" ? "text-emerald-400" : tfDatasets["1H"]?.bias === "BEARISH" ? "text-rose-400" : "text-amber-400"
            }`}>
              <span>{tfDatasets["1H"]?.bias || "NEUTRAL"}</span>
              <span className="text-[10px] text-[#8F96A1]">Intermediate</span>
            </div>
            <div className="text-[9.5px] text-[#C5CAD3] truncate">
              {tfDatasets["1H"] ? `OB: $${tfDatasets["1H"].primaryOrderBlock?.low.toFixed(decimals)}` : "WAITING DATA"}
            </div>
          </div>

          {/* 15M Primary Mapping */}
          <div className="bg-[#141820] border border-[rgba(241,204,107,0.3)] rounded-xl p-2.5 space-y-1 bg-[#181D27]">
            <div className="text-[10px] text-[#F1CC6B] font-bold">15M PRIMARY MAPPING</div>
            <div className="text-xs font-extrabold text-[#F1CC6B] flex items-center justify-between">
              <span>{tradePlan.isQualified ? "QUALIFIED" : "WAITING"}</span>
              <span className="text-[10px] text-[#8F96A1]">Trade POI</span>
            </div>
            <div className="text-[9.5px] text-white truncate font-bold">
              {tfDatasets["15M"] ? `$${tfDatasets["15M"].poi.low.toFixed(decimals)} – $${tfDatasets["15M"].poi.high.toFixed(decimals)}` : "WAITING DATA"}
            </div>
          </div>

          {/* 5M Refinement */}
          <div className="bg-[#141820] border border-[#262B33] rounded-xl p-2.5 space-y-1">
            <div className="text-[10px] text-[#8F96A1] font-bold">5M REFINEMENT</div>
            <div className={`text-xs font-extrabold flex items-center justify-between ${
              tfDatasets["5M"]?.bias === "BULLISH" ? "text-emerald-400" : tfDatasets["5M"]?.bias === "BEARISH" ? "text-rose-400" : "text-amber-400"
            }`}>
              <span>{tfDatasets["5M"]?.bias === "BULLISH" || tfDatasets["5M"]?.bias === "BEARISH" ? "CONFIRMED" : "WAITING"}</span>
              <span className="text-[10px] text-[#8F96A1]">MSS/CHOCH</span>
            </div>
            <div className="text-[9.5px] text-[#C5CAD3] truncate">
              {tfDatasets["5M"] ? `MSS: $${tfDatasets["5M"].chochPrice.toFixed(decimals)}` : "WAITING DATA"}
            </div>
          </div>

          {/* 1M Execution */}
          <div className="bg-[#141820] border border-[#262B33] rounded-xl p-2.5 space-y-1">
            <div className="text-[10px] text-[#8F96A1] font-bold">1M PRECISION</div>
            <div className="text-xs font-extrabold text-[#F1CC6B] flex items-center justify-between animate-pulse">
              <span>{tradePlan.isQualified ? "TRIGGER READY" : "WAITING"}</span>
              <span className="text-[10px] text-[#8F96A1]">Trigger</span>
            </div>
            <div className="text-[9.5px] text-emerald-400 truncate font-bold">
              {tradePlan.isQualified ? `@ $${tradePlan.bestEntry.toFixed(decimals)}` : "WAITING CONFIRMATION"}
            </div>
          </div>
        </div>
      </div>

      {/* CORE TIMEFRAME INDEPENDENT DATASET CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {(["4H", "1H", "15M", "5M", "1M"] as TimeframeKey[]).map((tfKey) => {
          const cfg = TIMEFRAME_CONFIGS[tfKey];
          const ds = tfDatasets[tfKey];
          const isSelectedTab = activeTf === tfKey;

          if (!ds) {
            return (
              <div
                key={tfKey}
                onClick={() => setActiveTf(tfKey)}
                className="bg-[#111419] border border-[#272D36] rounded-2xl p-4 space-y-2 flex flex-col justify-center items-center text-center font-mono cursor-pointer"
              >
                <div className="text-xs font-bold text-[#F1CC6B]">{tfKey} — {cfg.intervalName}</div>
                <div className="text-xs text-rose-400 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>DATA UNAVAILABLE / WAITING FOR LIVE DATA</span>
                </div>
              </div>
            );
          }

          const bias = ds.bias;

          return (
            <div
              key={tfKey}
              onClick={() => setActiveTf(tfKey)}
              className={`bg-[#111419] border cursor-pointer ${
                isSelectedTab
                  ? "border-[#F1CC6B] shadow-[0_0_15px_rgba(241,204,107,0.15)] bg-[#151922]"
                  : "border-[#272D36] hover:border-[rgba(241,204,107,0.35)]"
              } rounded-2xl p-3.5 space-y-2 flex flex-col justify-between font-mono text-xs transition-all`}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#232830] pb-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      isSelectedTab ? "bg-[#F1CC6B] text-[#0B0E11]" : "bg-[#1A1F28] text-white"
                    }`}
                  >
                    {tfKey}
                  </span>
                  <span className="font-extrabold text-white text-[11px] truncate">
                    {cfg.intervalName.split(" ")[0]}
                  </span>
                </div>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold flex items-center gap-1 ${
                    bias === "BULLISH"
                      ? "bg-[#17342E] text-[#74D8A0] border border-[rgba(116,216,160,0.35)]"
                      : bias === "BEARISH"
                      ? "bg-[#33181C] text-[#FB7185] border border-rose-500/35"
                      : "bg-[#2B2616] text-[#F1CC6B] border border-amber-500/35"
                  }`}
                >
                  <span>{bias}</span>
                </span>
              </div>

              {/* Market Structure */}
              <div className="space-y-1 text-[10.5px] border-b border-[#232830] pb-2">
                <div className="text-[9.5px] text-[#8F96A1] font-semibold flex items-center justify-between">
                  <span>MARKET STRUCTURE</span>
                  <span className="text-[9px] text-purple-300">
                    🟣 {ds.structureCondition}
                  </span>
                </div>
                <div className="text-white font-bold text-[10.5px] flex items-center justify-between">
                  <span>BOS: <strong className="text-purple-300">${ds.bosPrice.toFixed(decimals)}</strong></span>
                  <span className="text-[9px] text-[#8F96A1]">({formatDistance(ds.bosPrice, ds.latestPrice, decimals)})</span>
                </div>
                <div className="text-white font-semibold text-[10px] flex items-center justify-between">
                  <span>CHOCH: <strong className="text-purple-400">${ds.chochPrice.toFixed(decimals)}</strong></span>
                  <span className="text-[9px] text-[#8F96A1]">({formatDistance(ds.chochPrice, ds.latestPrice, decimals)})</span>
                </div>
              </div>

              {/* Order Block */}
              <div className="space-y-1 text-[10.5px] border-b border-[#232830] pb-2">
                <div className="text-[9.5px] text-[#8F96A1] font-semibold flex items-center justify-between">
                  <span>ORDER BLOCK (OB)</span>
                  <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-emerald-950/70 text-emerald-400 border border-emerald-800/40">
                    {ds.primaryOrderBlock?.status || "FRESH"}
                  </span>
                </div>
                <div className="text-emerald-400 font-bold text-[11px]">
                  ${ds.primaryOrderBlock?.low.toFixed(decimals)} – ${ds.primaryOrderBlock?.high.toFixed(decimals)}
                </div>
                <div className="text-[9px] text-[#8F96A1]">
                  Distance: <strong className="text-white">{formatRangeDistance(ds.primaryOrderBlock?.low || 0, ds.primaryOrderBlock?.high || 0, ds.latestPrice, decimals)}</strong>
                </div>
              </div>

              {/* Fair Value Gap */}
              <div className="space-y-1 text-[10.5px] border-b border-[#232830] pb-2">
                <div className="text-[9.5px] text-[#8F96A1] font-semibold flex items-center justify-between">
                  <span>FAIR VALUE GAP (FVG)</span>
                  <span className="px-1 py-0.2 rounded bg-sky-950/70 text-sky-400 border border-sky-800/40 text-[9px]">
                    🔵 {ds.primaryFVG?.status || "FRESH"}
                  </span>
                </div>
                <div className="text-sky-300 font-bold text-[11px]">
                  ${ds.primaryFVG?.bottom.toFixed(decimals)} – ${ds.primaryFVG?.top.toFixed(decimals)}
                </div>
              </div>

              {/* Liquidity */}
              <div className="space-y-1 text-[10.5px] border-b border-[#232830] pb-2">
                <div className="text-[9.5px] text-[#8F96A1] font-semibold flex items-center justify-between">
                  <span>LIQUIDITY POOLS</span>
                  <span className="text-[9px] text-amber-300">🟡 {ds.liquidityStatus}</span>
                </div>
                <div className="text-[9.5px] text-[#F1CC6B]">BSL: ${ds.bslPrice.toFixed(decimals)}</div>
                <div className="text-[9.5px] text-rose-400">SSL: ${ds.sslPrice.toFixed(decimals)}</div>
              </div>

              {/* Price Location & Score */}
              <div className="flex items-center justify-between text-[9.5px] pt-1">
                <span className="text-[#8F96A1]">LOCATION:</span>
                <span className="font-bold text-[#F1CC6B]">{ds.priceLocation} Zone</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* DYNAMIC SMC CHART CANVAS */}
      <div className="bg-[#0D1015] border border-[#272D36] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222730] pb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-mono font-bold text-sm text-white">
              <span className="text-[#F1CC6B]">{assetKey}</span>
              <span className="text-[#8F96A1] text-xs">| {activeTf} SMC Smart Mapping Chart</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#17342E] text-[#74D8A0] text-[10px] font-mono font-bold">
              ${price.toFixed(decimals)}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-[#141820] p-1 rounded-xl border border-[#282E37]">
            {(["1M", "5M", "15M", "1H", "4H"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => {
                  setActiveTf(tf);
                  setActiveTooltip(null);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeTf === tf
                    ? "bg-[#F1CC6B] text-[#0B0E11] shadow-[0_0_10px_rgba(241,204,107,0.3)]"
                    : "text-[#8F96A1] hover:text-white hover:bg-[#1C222D]"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* OVERLAYS TOGGLE */}
        <div className="flex items-center justify-between flex-wrap gap-3 text-[11px] font-mono text-[#8F96A1] bg-[#101319] p-2.5 rounded-xl border border-[#1E232E]">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[#F1CC6B] font-bold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>OVERLAYS:</span>
            </span>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={showOverlays.poi}
                onChange={() => setShowOverlays((p) => ({ ...p, poi: !p.poi }))}
                className="accent-[#F1CC6B] rounded cursor-pointer"
              />
              <span className={showOverlays.poi ? "text-[#F1CC6B] font-bold" : ""}>POI</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={showOverlays.orderBlocks}
                onChange={() => setShowOverlays((p) => ({ ...p, orderBlocks: !p.orderBlocks }))}
                className="accent-[#F1CC6B] rounded cursor-pointer"
              />
              <span className={showOverlays.orderBlocks ? "text-emerald-400 font-bold" : ""}>ORDER BLOCKS</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={showOverlays.fvg}
                onChange={() => setShowOverlays((p) => ({ ...p, fvg: !p.fvg }))}
                className="accent-[#F1CC6B] rounded cursor-pointer"
              />
              <span className={showOverlays.fvg ? "text-cyan-400 font-bold" : ""}>FVG</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={showOverlays.liquidity}
                onChange={() => setShowOverlays((p) => ({ ...p, liquidity: !p.liquidity }))}
                className="accent-[#F1CC6B] rounded cursor-pointer"
              />
              <span className={showOverlays.liquidity ? "text-amber-300 font-bold" : ""}>LIQUIDITY</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={showOverlays.structure}
                onChange={() => setShowOverlays((p) => ({ ...p, structure: !p.structure }))}
                className="accent-[#F1CC6B] rounded cursor-pointer"
              />
              <span className={showOverlays.structure ? "text-purple-300 font-bold" : ""}>STRUCTURE</span>
            </label>
          </div>

          <div className="text-[10px] text-[#8F96A1]">
            ATR ({activeTf}): <strong className="text-white">${activeData?.atr.toFixed(decimals) || "0.00"}</strong>
          </div>
        </div>

        {/* CHART SVG CANVAS */}
        <div className="relative w-full h-[320px] bg-[#07090C] border border-[#222730] rounded-xl overflow-hidden p-2 flex flex-col justify-between font-mono select-none">
          <div className="flex items-center justify-between text-[11px] text-[#8F96A1] z-10 px-3 pt-2">
            <div className="flex items-center gap-3">
              <span>Timeframe: <strong className="text-[#F1CC6B]">{activeTf}</strong></span>
              {activeData && (
                <span>
                  {activeTf} POI Zone:{" "}
                  <strong className="text-white font-bold">
                    ${activeData.poi.low.toFixed(decimals)} – ${activeData.poi.high.toFixed(decimals)}
                  </strong>
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="text-[#F1CC6B] font-bold flex items-center gap-1.5 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 text-[#F1CC6B] animate-spin" />
                <span>FETCHING & MAPPING LIVE {activeTf}...</span>
              </div>
            ) : dataError ? (
              <div className="text-rose-400 font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>DATA TEMPORARILY UNAVAILABLE</span>
              </div>
            ) : (
              <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>LIVE RECALCULATED FEED</span>
              </div>
            )}
          </div>

          {/* SVG RENDERING */}
          {activeData && (
            <div className="absolute inset-0 pt-8 pb-6 px-12">
              <svg
                className="w-full h-full overflow-visible"
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                preserveAspectRatio="none"
              >
                {/* Grid lines */}
                {[0.2, 0.4, 0.6, 0.8].map((ratio, idx) => {
                  const pVal = maxP - ratio * priceRange;
                  const yVal = priceToY(pVal);
                  return (
                    <g key={`grid-${idx}`}>
                      <line x1={padLeft} y1={yVal} x2={svgWidth - padRight} y2={yVal} stroke="#1A202A" strokeDasharray="3 3" />
                      <text x={svgWidth - padRight + 6} y={yVal + 3} fill="#8F96A1" fontSize="9" fontFamily="monospace">
                        ${pVal.toFixed(decimals)}
                      </text>
                    </g>
                  );
                })}

                {/* POI Overlay */}
                {showOverlays.poi && (
                  <g>
                    <rect
                      x={padLeft}
                      y={priceToY(activeData.poi.high)}
                      width={svgWidth - padLeft - padRight}
                      height={Math.max(12, priceToY(activeData.poi.low) - priceToY(activeData.poi.high))}
                      fill="rgba(241, 204, 107, 0.12)"
                      stroke="#F1CC6B"
                      strokeWidth="1"
                      strokeDasharray="4 2"
                    />
                  </g>
                )}

                {/* Order Blocks */}
                {showOverlays.orderBlocks &&
                  activeData.orderBlocks.map((ob) => {
                    const yTop = priceToY(ob.high);
                    const yBot = priceToY(ob.low);
                    const height = Math.max(8, yBot - yTop);
                    const x1 = indexToX(ob.startIndex);
                    const width = Math.max(40, svgWidth - padRight - x1);

                    return (
                      <g key={ob.id}>
                        <rect
                          x={x1}
                          y={yTop}
                          width={width}
                          height={height}
                          fill={ob.type === "BULLISH" ? "rgba(116, 216, 160, 0.15)" : "rgba(251, 113, 133, 0.15)"}
                          stroke={ob.type === "BULLISH" ? "#74D8A0" : "#FB7185"}
                          strokeWidth="0.8"
                        />
                      </g>
                    );
                  })}

                {/* Candlesticks */}
                {activeData.candles.map((c) => {
                  const x = indexToX(c.index);
                  const yOpen = priceToY(c.open);
                  const yClose = priceToY(c.close);
                  const yHigh = priceToY(c.high);
                  const yLow = priceToY(c.low);

                  const bodyTop = Math.min(yOpen, yClose);
                  const bodyHeight = Math.max(2, Math.abs(yOpen - yClose));
                  const color = c.isBullish ? "#74D8A0" : "#FB7185";

                  return (
                    <g key={`candle-${c.index}`}>
                      <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={color} strokeWidth="1" />
                      <rect x={x - candleWidth / 2} y={bodyTop} width={candleWidth} height={bodyHeight} fill={color} />
                    </g>
                  );
                })}

                {/* Live Price Line */}
                <g>
                  <line x1={padLeft} y1={priceToY(price)} x2={svgWidth - padRight} y2={priceToY(price)} stroke="#F1CC6B" strokeWidth="1.5" />
                  <rect x={svgWidth - padRight + 2} y={priceToY(price) - 8} width="65" height="16" fill="#F1CC6B" rx="3" />
                  <text x={svgWidth - padRight + 6} y={priceToY(price) + 3} fill="#0B0E11" fontSize="9" fontFamily="monospace" fontWeight="bold">
                    ${price.toFixed(decimals)}
                  </text>
                </g>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* QUALIFIED TRADE EXECUTION PLAN OUTPUT */}
      <div className="bg-[#111419] border border-[rgba(241,204,107,0.35)] rounded-2xl p-5 sm:p-6 space-y-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#252A31] pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold font-mono border ${
              tradePlan.direction === "BUY"
                ? "bg-[#17342E] text-[#74D8A0] border-[#74D8A0]"
                : tradePlan.direction === "SELL"
                ? "bg-[#33181C] text-[#FB7185] border-rose-500"
                : "bg-[#2B2616] text-[#F1CC6B] border-amber-500"
            }`}>
              {tradePlan.direction === "BUY" ? "🟢" : tradePlan.direction === "SELL" ? "🔴" : "🟡"}
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#F1CC6B] uppercase font-bold tracking-wider flex items-center gap-1">
                <span>{assetKey} — QUALIFIED TRADE EXECUTION PLAN</span>
              </div>
              <h2 className="text-lg font-bold font-mono text-white">
                {tradePlan.directionLabel}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-[rgba(241,204,107,0.12)] border border-[rgba(241,204,107,0.35)] text-[#F1CC6B] text-xs font-mono font-bold">
              GRADE: {tradePlan.grade}
            </span>
            <span className="px-3 py-1 rounded-lg bg-[#17342E] border border-[rgba(116,216,160,0.4)] text-[#74D8A0] text-xs font-mono font-bold">
              CONFIDENCE: {tradePlan.confidenceScore}%
            </span>
          </div>
        </div>

        {tradePlan.isQualified ? (
          /* QUALIFIED SETUP METRICS */
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2.5 font-mono">
            <div className="bg-[#0A0C0E] border border-[#252A31] rounded-xl p-3">
              <div className="text-[10px] text-[#8F96A1]">DIRECTION</div>
              <div className={`text-sm font-bold ${tradePlan.direction === "BUY" ? "text-[#74D8A0]" : "text-[#FB7185]"}`}>
                {tradePlan.directionLabel}
              </div>
            </div>

            <div className="bg-[#0A0C0E] border border-[rgba(241,204,107,0.3)] rounded-xl p-3">
              <div className="text-[10px] text-[#F1CC6B]">ENTRY ZONE</div>
              <div className="text-xs font-bold text-white">
                ${tradePlan.entryZoneLow.toFixed(decimals)} – ${tradePlan.entryZoneHigh.toFixed(decimals)}
              </div>
            </div>

            <div className="bg-[#0A0C0E] border border-[#252A31] rounded-xl p-3">
              <div className="text-[10px] text-[#8F96A1]">BEST ENTRY</div>
              <div className="text-sm font-bold text-[#F1CC6B]">${tradePlan.bestEntry.toFixed(decimals)}</div>
            </div>

            <div className="bg-[#0A0C0E] border border-rose-500/30 rounded-xl p-3">
              <div className="text-[10px] text-rose-400">STOP LOSS</div>
              <div className="text-sm font-bold text-rose-400">${tradePlan.stopLoss.toFixed(decimals)}</div>
            </div>

            <div className="bg-[#0A0C0E] border border-emerald-500/30 rounded-xl p-3">
              <div className="text-[10px] text-emerald-400">TARGET 1</div>
              <div className="text-sm font-bold text-emerald-400">${tradePlan.tp1.toFixed(decimals)}</div>
            </div>

            <div className="bg-[#0A0C0E] border border-emerald-500/30 rounded-xl p-3">
              <div className="text-[10px] text-emerald-400">TARGET 2</div>
              <div className="text-sm font-bold text-emerald-300">${tradePlan.tp2.toFixed(decimals)}</div>
            </div>

            <div className="bg-[#0A0C0E] border border-emerald-500/30 rounded-xl p-3">
              <div className="text-[10px] text-emerald-400">TARGET 3 & 4</div>
              <div className="text-xs font-bold text-emerald-300">
                ${tradePlan.tp3.toFixed(decimals)} / ${tradePlan.tp4.toFixed(decimals)}
              </div>
            </div>

            <div className="bg-[#0A0C0E] border border-[rgba(241,204,107,0.3)] rounded-xl p-3">
              <div className="text-[10px] text-[#F1CC6B]">RISK / REWARD</div>
              <div className="text-sm font-bold text-[#F1CC6B]">1 : {tradePlan.rrRatio}</div>
            </div>
          </div>
        ) : (
          /* UNQUALIFIED / NO TRADE BANNER */
          <div className="bg-[#181B22] border border-amber-500/40 rounded-xl p-4 text-center space-y-2 font-mono">
            <div className="text-amber-400 font-bold text-sm flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>NO QUALIFIED SETUP — WAITING FOR CONFIRMATION</span>
            </div>
            <p className="text-xs text-[#9EA6B3] max-w-xl mx-auto">
              {tradePlan.unqualifiedReason || "Multi-timeframe market structure is currently conflicting across 4H, 1H, 15M, 5M, or 1M. The engine will automatically qualify a setup when alignment score reaches requirement."}
            </p>
          </div>
        )}

        {/* SETUP RATIONALE BOX */}
        <div className="bg-[#0B0D10] border border-[#272C33] rounded-xl p-4 space-y-2 font-mono">
          <div className="text-xs font-bold text-[#F1CC6B] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#F1CC6B]" />
            <span>TRACEABLE MULTI-TIMEFRAME RATIONALE</span>
          </div>
          <div className="space-y-1 text-xs text-[#C5CAD3] leading-relaxed font-sans">
            {tradePlan.rationale.map((line, idx) => (
              <div key={idx} className="flex items-start gap-1.5">
                <span className="text-[#F1CC6B] font-bold">•</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs font-mono text-[#8F96A1]">
            <Radio className="w-3.5 h-3.5 text-[#F1CC6B] animate-pulse" />
            <span>Live Price: <strong className="text-white">${price.toFixed(decimals)}</strong></span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleTelegramBroadcast}
              disabled={!tradePlan.isQualified}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                tradePlan.isQualified
                  ? "bg-[#17342E] hover:bg-[#1f453d] border border-[rgba(116,216,160,0.4)] text-[#74D8A0]"
                  : "bg-[#161B22] border border-[#2B3038] text-slate-500 cursor-not-allowed"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{telegramSent ? "SENT TO TELEGRAM!" : "TELEGRAM SIGNAL"}</span>
            </button>

            {onOpenTradeCopilot && (
              <button
                onClick={() =>
                  onOpenTradeCopilot({
                    assetKey,
                    type: tradePlan.direction === "SELL" ? "SELL" : "BUY",
                    entryPrice: tradePlan.bestEntry,
                    stopLoss: tradePlan.stopLoss,
                    takeProfit: tradePlan.tp1,
                    lotSize: 0.1,
                    signalSource: `🎯 MULTI-TIMEFRAME ALIGNMENT & RISK ENGINE — ${assetKey}`,
                  })
                }
                disabled={!tradePlan.isQualified}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer ${
                  tradePlan.isQualified
                    ? "bg-gradient-to-r from-[#F1CC6B] to-[#D4A638] hover:from-[#f5d785] hover:to-[#dfb242] text-[#0B0E11] shadow-[0_0_15px_rgba(241,204,107,0.3)]"
                    : "bg-[#161B22] border border-[#2B3038] text-slate-500 cursor-not-allowed"
                }`}
              >
                <Crown className="w-4 h-4" />
                <span>EXECUTE TRADE COPILOT</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

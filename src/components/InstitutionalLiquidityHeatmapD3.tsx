import React, { useState, useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "motion/react";
import {
  Activity,
  Droplets,
  Layers,
  Zap,
  Target,
  Shield,
  X,
  Maximize2,
  Minimize2,
  RefreshCw,
  Eye,
  Info,
  Sliders,
  Globe,
  Flame,
  BarChart2,
  AlertTriangle,
} from "lucide-react";
import { SUPPORTED_ASSETS } from "../useLiveData";
import { LivePrice } from "../types";

interface InstitutionalLiquidityHeatmapD3Props {
  currentPrice: number;
  assetKey: string;
  prices: Record<string, LivePrice>;
  onCloseOverlay?: () => void;
  isOverlay?: boolean;
}

export const InstitutionalLiquidityHeatmapD3: React.FC<InstitutionalLiquidityHeatmapD3Props> = ({
  currentPrice: propPrice,
  assetKey: propAssetKey,
  prices = {},
  onCloseOverlay,
  isOverlay = false,
}) => {
  const [selectedAssetKey, setSelectedAssetKey] = useState<string>(propAssetKey || "XAUUSD");
  const [filterType, setFilterType] = useState<"ALL" | "BSL" | "SSL" | "ZONE" | "IMBALANCE">("ALL");
  const [heatIntensity, setHeatIntensity] = useState<number>(1.2);
  const [hoveredLevel, setHoveredLevel] = useState<{
    price: number;
    volume: number;
    type: string;
    distance: number;
    imbalancePct: number;
    isStopHunt: boolean;
  } | null>(null);

  // Active Sweep Alert State (Triggers Framer Motion pulse effect)
  const [activeSweep, setActiveSweep] = useState<{
    type: "BSL_SWEEP" | "SSL_SWEEP";
    price: number;
    label: string;
    vol: number;
    timestamp: string;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const asset = useMemo(() => {
    return SUPPORTED_ASSETS.find((a) => a.key === selectedAssetKey) || SUPPORTED_ASSETS[0];
  }, [selectedAssetKey]);

  const livePriceObj = prices[selectedAssetKey] || { price: propPrice || asset.basePrice, changePct: 0.35 };
  const basePrice = livePriceObj.price || asset.basePrice;
  const decimals = asset.decimals || 2;

  // Generate dynamic institutional orderbook depth, order flow imbalance, and liquidity heatmap grid data
  const heatmapData = useMemo(() => {
    const numRows = 28;
    const numTimeSlots = 18;
    const step = basePrice * 0.0018;
    const minP = basePrice - (numRows / 2) * step;
    const maxP = basePrice + (numRows / 2) * step;

    const rows: {
      price: number;
      priceStr: string;
      type: "BSL" | "SSL" | "EQUILIBRIUM" | "DEMAND_ZONE" | "SUPPLY_ZONE";
      label: string;
      totalVol: number;
      timeVols: number[];
      intensity: number;
      distPts: number;
      bidVol: number;
      askVol: number;
      imbalancePct: number;
      isStopHuntCluster: boolean;
    }[] = [];

    for (let r = 0; r < numRows; r++) {
      const price = maxP - r * step;
      const isAbove = price > basePrice;

      let type: "BSL" | "SSL" | "EQUILIBRIUM" | "DEMAND_ZONE" | "SUPPLY_ZONE" = "EQUILIBRIUM";
      let label = "Interbank Flow";

      const distFromPrice = Math.abs(price - basePrice);

      if (r === 2 || r === 5) {
        type = "BSL";
        label = r === 2 ? "MAJOR BSL SWEEP (SHORT STOPS)" : "BUY-SIDE LIQUIDITY CLUSTER";
      } else if (r === 1 || r === 3) {
        type = "SUPPLY_ZONE";
        label = "INSTITUTIONAL SUPPLY BLOCK";
      } else if (r === 22 || r === 25) {
        type = "SSL";
        label = r === 25 ? "EXTREME SSL SWEEP (LONG STOPS)" : "SELL-SIDE LIQUIDITY CLUSTER";
      } else if (r === 23 || r === 26) {
        type = "DEMAND_ZONE";
        label = "INSTITUTIONAL DEMAND BLOCK";
      }

      // Generate time-slot volume progression
      const timeVols: number[] = [];
      let rowTotal = 0;
      for (let t = 0; t < numTimeSlots; t++) {
        const seedVol = Math.abs(Math.sin(r * 12.3 + t * 0.75 + basePrice * 0.1)) * 45 + 5;
        const multiplier = (type === "BSL" || type === "SSL") ? 2.2 : (type.includes("ZONE") ? 1.8 : 0.8);
        const slotVol = parseFloat((seedVol * multiplier * heatIntensity).toFixed(1));
        timeVols.push(slotVol);
        rowTotal += slotVol;
      }

      const distPts = parseFloat(((price - basePrice) * (decimals >= 4 ? 10000 : 10)).toFixed(1));

      // Calculate Order Flow Imbalances & Stop-Hunt Cluster Status
      const imbalanceBias = isAbove ? -0.45 : 0.45;
      const seedImbalance = Math.sin(r * 8.7 + basePrice * 0.05) * 0.4 + imbalanceBias;
      const imbalancePct = Math.round(Math.max(-95, Math.min(95, seedImbalance * 100)));
      const bidVol = parseFloat((rowTotal * ((50 + imbalancePct / 2) / 100)).toFixed(1));
      const askVol = parseFloat((rowTotal - bidVol).toFixed(1));
      const isStopHuntCluster = type === "BSL" || type === "SSL" || rowTotal > 320 * heatIntensity;

      rows.push({
        price: parseFloat(price.toFixed(decimals)),
        priceStr: price.toFixed(decimals),
        type,
        label,
        totalVol: parseFloat(rowTotal.toFixed(1)),
        timeVols,
        intensity: Math.min(100, Math.round((rowTotal / 450) * 100)),
        distPts,
        bidVol,
        askVol,
        imbalancePct,
        isStopHuntCluster,
      });
    }

    return { rows, minP, maxP, numTimeSlots };
  }, [basePrice, decimals, heatIntensity]);

  // Monitor Live Price interactions with Liquidity Sweep Zones to trigger Framer Motion pulse effect
  useEffect(() => {
    const sweepRow = heatmapData.rows.find((r) => {
      const diff = Math.abs(r.price - basePrice);
      const tol = basePrice * 0.0006;
      return (r.type === "BSL" || r.type === "SSL") && diff <= tol;
    });

    if (sweepRow) {
      setActiveSweep({
        type: sweepRow.type === "BSL" ? "BSL_SWEEP" : "SSL_SWEEP",
        price: sweepRow.price,
        label: sweepRow.label,
        vol: sweepRow.totalVol,
        timestamp: new Date().toLocaleTimeString(),
      });
    }
  }, [basePrice, heatmapData.rows]);

  // Render D3 SVG Heatmap Visualization
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = Math.max(480, Math.min(620, window.innerHeight * 0.55));
    const margin = { top: 35, right: 140, bottom: 40, left: 85 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous rendering

    svg.attr("width", width).attr("height", height);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // D3 Scales
    const xScale = d3
      .scaleLinear()
      .domain([0, heatmapData.numTimeSlots - 1])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([heatmapData.minP, heatmapData.maxP])
      .range([innerHeight, 0]);

    // Color Scales for Liquidity Heat Map
    const colorScaleBSL = d3
      .scaleSequential(d3.interpolateReds)
      .domain([0, 120 * heatIntensity]);

    const colorScaleSSL = d3
      .scaleSequential(d3.interpolateGreens)
      .domain([0, 120 * heatIntensity]);

    const colorScaleNormal = d3
      .scaleSequential(d3.interpolateYlOrRd)
      .domain([0, 90 * heatIntensity]);

    // Grid Background
    g.append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "#03060D")
      .attr("rx", 6);

    // Draw Heatmap Cells
    const cellWidth = innerWidth / heatmapData.numTimeSlots;
    const cellHeight = innerHeight / heatmapData.rows.length;

    const filteredRows = heatmapData.rows.filter((r) => {
      if (filterType === "BSL") return r.type === "BSL" || r.type === "SUPPLY_ZONE";
      if (filterType === "SSL") return r.type === "SSL" || r.type === "DEMAND_ZONE";
      if (filterType === "ZONE") return r.type.includes("ZONE");
      if (filterType === "IMBALANCE") return Math.abs(r.imbalancePct) >= 35;
      return true;
    });

    filteredRows.forEach((row) => {
      const yPos = yScale(row.price) - cellHeight / 2;

      row.timeVols.forEach((vol, tIdx) => {
        const xPos = xScale(tIdx);

        let fillColor = colorScaleNormal(vol);
        if (row.type === "BSL" || row.type === "SUPPLY_ZONE") {
          fillColor = colorScaleBSL(vol);
        } else if (row.type === "SSL" || row.type === "DEMAND_ZONE") {
          fillColor = colorScaleSSL(vol);
        }

        const cell = g.append("rect")
          .attr("x", xPos)
          .attr("y", yPos)
          .attr("width", cellWidth - 1)
          .attr("height", cellHeight - 1)
          .attr("fill", fillColor)
          .attr("opacity", 0.88)
          .attr("rx", 2)
          .style("cursor", "pointer")
          .on("mouseenter", () => {
            setHoveredLevel({
              price: row.price,
              volume: vol,
              type: row.label,
              distance: row.distPts,
              imbalancePct: row.imbalancePct,
              isStopHunt: row.isStopHuntCluster,
            });
          })
          .on("mouseleave", () => setHoveredLevel(null));

        if (row.isStopHuntCluster && tIdx === heatmapData.numTimeSlots - 1) {
          cell.attr("stroke", "#F59E0B").attr("stroke-width", 1.5);
        }
      });

      // Special Stop-Hunt Cluster Tag inside D3 canvas
      if (row.isStopHuntCluster) {
        g.append("text")
          .attr("x", 5)
          .attr("y", yPos + cellHeight / 2 + 3)
          .attr("fill", row.type === "BSL" ? "#FCA5A5" : row.type === "SSL" ? "#6EE7B7" : "#FDE047")
          .attr("font-size", "8px")
          .attr("font-weight", "900")
          .attr("font-family", "monospace")
          .text(row.type === "BSL" ? "🎯 STOP-HUNT BSL" : row.type === "SSL" ? "🎯 STOP-HUNT SSL" : "⚡ HIGH IMBALANCE");
      }

      // Order flow imbalance indicator badge on left of row
      if (Math.abs(row.imbalancePct) > 40) {
        g.append("text")
          .attr("x", innerWidth - 75)
          .attr("y", yPos + cellHeight / 2 + 3)
          .attr("fill", row.imbalancePct > 0 ? "#10B981" : "#EF4444")
          .attr("font-size", "8px")
          .attr("font-weight", "bold")
          .attr("font-family", "monospace")
          .text(`${row.imbalancePct > 0 ? "+" : ""}${row.imbalancePct}% IMB`);
      }

      // Special Liquidity Pool Highlight Outline
      if (row.type === "BSL" || row.type === "SSL") {
        g.append("rect")
          .attr("x", 0)
          .attr("y", yPos)
          .attr("width", innerWidth)
          .attr("height", cellHeight)
          .attr("fill", "none")
          .attr("stroke", row.type === "BSL" ? "#EF4444" : "#10B981")
          .attr("stroke-width", 1.5)
          .attr("stroke-dasharray", "4 2")
          .attr("opacity", 0.95);
      }
    });

    // Right Side Cumulative Orderbook Depth Histogram
    const maxRowVol: number = d3.max(heatmapData.rows, (d: { totalVol: number }) => d.totalVol) ?? 500;
    const histoWidth = margin.right - 15;

    const histoScale = d3
      .scaleLinear()
      .domain([0, maxRowVol] as [number, number])
      .range([0, histoWidth]);

    heatmapData.rows.forEach((row) => {
      const yPos = yScale(row.price) - cellHeight / 2;
      const barLen = histoScale(row.totalVol);
      const isSell = row.price > basePrice;

      g.append("rect")
        .attr("x", innerWidth + 5)
        .attr("y", yPos + 1)
        .attr("width", barLen)
        .attr("height", cellHeight - 2)
        .attr("fill", isSell ? "#EF4444" : "#10B981")
        .attr("opacity", 0.75)
        .attr("rx", 2);

      // Label on Histogram
      g.append("text")
        .attr("x", innerWidth + 10 + barLen)
        .attr("y", yPos + cellHeight / 2 + 3)
        .attr("fill", "#94A3B8")
        .attr("font-size", "9px")
        .attr("font-weight", "bold")
        .text(`$${(row.totalVol / 10).toFixed(1)}M`);
    });

    // Current Price Pulsing Horizontal Indicator Line
    const liveY = yScale(basePrice);

    g.append("line")
      .attr("x1", 0)
      .attr("y1", liveY)
      .attr("x2", innerWidth + histoWidth)
      .attr("y2", liveY)
      .attr("stroke", "#EAB308")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4 2");

    // Price Tag Box
    const tagGroup = g
      .append("g")
      .attr("transform", `translate(${innerWidth + 2}, ${liveY - 10})`);

    tagGroup
      .append("rect")
      .attr("width", 75)
      .attr("height", 20)
      .attr("fill", "#EAB308")
      .attr("rx", 4);

    tagGroup
      .append("text")
      .attr("x", 8)
      .attr("y", 14)
      .attr("fill", "#000000")
      .attr("font-size", "10px")
      .attr("font-weight", "900")
      .attr("font-family", "monospace")
      .text(basePrice.toFixed(decimals));

    // Y-Axis Price Labels
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(10)
      .tickFormat((d) => Number(d).toFixed(decimals));

    g.append("g")
      .call(yAxis)
      .attr("color", "#64748B")
      .selectAll("text")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("font-family", "monospace");

    // X-Axis Time Labels
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(6)
      .tickFormat((d) => `- ${(heatmapData.numTimeSlots - Number(d)) * 2}m`);

    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(xAxis)
      .attr("color", "#64748B")
      .selectAll("text")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("font-family", "monospace");
  }, [heatmapData, basePrice, filterType, heatIntensity, decimals]);

  return (
    <div
      className={`${
        isOverlay
          ? "fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          : "w-full"
      }`}
    >
      <div
        className={`bg-[#060913] border border-emerald-500/40 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 max-w-7xl w-full font-mono text-slate-200 relative ${
          isOverlay ? "animate-in fade-in zoom-in duration-200" : ""
        }`}
      >
        {/* FRAMER MOTION PULSE ANIMATION ALERT FOR LIQUIDITY SWEEPS */}
        <AnimatePresence>
          {activeSweep && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 shadow-2xl relative overflow-hidden ${
                activeSweep.type === "BSL_SWEEP"
                  ? "bg-rose-950/90 border-rose-500/80 text-rose-200 shadow-rose-500/20"
                  : "bg-emerald-950/90 border-emerald-500/80 text-emerald-200 shadow-emerald-500/20"
              }`}
            >
              {/* Repeating Background Pulse Glow Effect */}
              <motion.div
                animate={{
                  scale: [1, 1.03, 1],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className={`absolute inset-0 pointer-events-none ${
                  activeSweep.type === "BSL_SWEEP" ? "bg-rose-500/10" : "bg-emerald-500/10"
                }`}
              />

              <div className="flex items-center gap-3 relative z-10">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border font-black ${
                    activeSweep.type === "BSL_SWEEP"
                      ? "bg-rose-500/20 border-rose-400 text-rose-400"
                      : "bg-emerald-500/20 border-emerald-400 text-emerald-400"
                  }`}
                >
                  <Target className="w-5 h-5 animate-spin" />
                </motion.div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                      🚨 LIQUIDITY SWEEP INTERACTION DETECTED
                    </span>
                    <span className="text-[10px] bg-black/60 px-2 py-0.5 rounded font-mono border border-white/10">
                      {activeSweep.timestamp}
                    </span>
                  </div>
                  <p className="text-xs font-sans mt-0.5">
                    Live price <strong className="font-mono text-amber-300">${activeSweep.price.toFixed(decimals)}</strong> interacting with <strong className="underline">{activeSweep.label}</strong> (Liquidity Volume: ${activeSweep.vol}M).
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveSweep(null)}
                className="p-1.5 hover:bg-black/40 rounded-lg text-slate-300 transition-colors relative z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/15 border border-emerald-500/40 rounded-xl flex items-center justify-center text-emerald-400">
              <Flame className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                D3 INSTITUTIONAL LIQUIDITY HEATMAP
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-bold">
                  ORDER FLOW & STOP-HUNT CLUSTERS
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Real-Time Order Flow Imbalances • Stop-Hunt Clusters • Liquidity Sweep Pulsing Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Asset Switcher */}
            <div className="flex items-center bg-[#03060C] border border-slate-800 p-1 rounded-lg">
              {SUPPORTED_ASSETS.slice(0, 5).map((a) => (
                <button
                  key={a.key}
                  onClick={() => setSelectedAssetKey(a.key)}
                  className={`px-2.5 py-1 text-xs font-bold rounded transition-all ${
                    selectedAssetKey === a.key
                      ? "bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {a.short}
                </button>
              ))}
            </div>

            {isOverlay && onCloseOverlay && (
              <button
                onClick={onCloseOverlay}
                className="w-9 h-9 bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-xl flex items-center justify-center text-slate-300 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Control Bar & Live Price Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#03060C] border border-slate-800/90 p-3 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold uppercase">LIVE TICK:</span>
            <span className="text-amber-400 font-black text-sm">${basePrice.toLocaleString("en-US", { minimumFractionDigits: decimals })}</span>
          </div>

          {/* Filter Type */}
          <div className="flex items-center gap-1.5 col-span-2 flex-wrap">
            <span className="text-slate-400 font-bold uppercase">FILTER:</span>
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all ${
                filterType === "ALL" ? "bg-amber-500/20 text-amber-300 border-amber-500/50" : "text-slate-500 border-slate-800"
              }`}
            >
              ALL POOLS
            </button>
            <button
              onClick={() => setFilterType("BSL")}
              className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all ${
                filterType === "BSL" ? "bg-rose-500/20 text-rose-300 border-rose-500/50" : "text-slate-500 border-slate-800"
              }`}
            >
              BSL (SUPPLY)
            </button>
            <button
              onClick={() => setFilterType("SSL")}
              className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all ${
                filterType === "SSL" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50" : "text-slate-500 border-slate-800"
              }`}
            >
              SSL (DEMAND)
            </button>
            <button
              onClick={() => setFilterType("IMBALANCE")}
              className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-all ${
                filterType === "IMBALANCE" ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50" : "text-slate-500 border-slate-800"
              }`}
            >
              ⚡ IMBALANCES
            </button>
          </div>

          {/* Heat Intensity Slider */}
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400 font-bold uppercase">INTENSITY:</span>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={heatIntensity}
              onChange={(e) => setHeatIntensity(parseFloat(e.target.value))}
              className="w-20 accent-amber-500 cursor-pointer"
            />
            <span className="text-amber-300 font-bold">{heatIntensity}x</span>
          </div>
        </div>

        {/* D3 SVG Canvas Display */}
        <div ref={containerRef} className="relative bg-[#020409] border border-slate-800/90 rounded-xl overflow-hidden p-2">
          <svg ref={svgRef} className="w-full h-auto select-none" />

          {/* Hover Crosshair Info Box */}
          {hoveredLevel && (
            <div className="absolute top-4 left-24 bg-slate-900/95 border border-emerald-500/60 px-3 py-2 rounded-lg text-xs font-mono shadow-xl space-y-0.5">
              <div className="text-amber-400 font-black">{hoveredLevel.type}</div>
              <div className="text-white font-bold">
                Price: ${hoveredLevel.price.toFixed(decimals)} ({hoveredLevel.distance >= 0 ? "+" : ""}{hoveredLevel.distance} pts)
              </div>
              <div className="text-emerald-400 text-[11px]">
                Order Volume: ${hoveredLevel.volume.toFixed(1)} Million
              </div>
            </div>
          )}
        </div>

        {/* Legend Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 pt-1 border-t border-slate-800">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-rose-500/80 inline-block" />
              <span>BSL / Short Stops (Supply)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500/80 inline-block" />
              <span>SSL / Long Stops (Demand)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-400 inline-block" />
              <span>Live Tick Level</span>
            </div>
          </div>

          <div className="text-slate-500 text-[10px] uppercase">
            Powered by D3.js Order Flow Engine • Real-Time Orderbook Analytics
          </div>
        </div>
      </div>
    </div>
  );
};

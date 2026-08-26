import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  DynamicMarketLevel,
  AiReactionZone,
  LevelStrength,
  MarketRegime,
} from "../../services/khatarnak3dMarketEngine";
import {
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Sparkles,
  Zap,
  Target,
  Shield,
  Eye,
  Volume2,
  VolumeX,
  Crosshair,
  TrendingDown,
} from "lucide-react";

interface Khatarnak3DMarketRadarProps {
  currentPrice: number;
  levels: DynamicMarketLevel[];
  reactionZones: AiReactionZone[];
  regime: MarketRegime;
  assetKey?: string;
  confluenceScore?: number;
  onLevelClick?: (level: DynamicMarketLevel) => void;
  audioEnabled?: boolean;
}

export type RadarViewMode = "3D_PERSPECTIVE" | "FRONTAL_2_5D" | "TOP_DOWN" | "EXPANDED_HORIZON";

export const Khatarnak3DMarketRadar: React.FC<Khatarnak3DMarketRadarProps> = ({
  currentPrice,
  levels,
  reactionZones,
  regime,
  assetKey = "XAUUSD",
  confluenceScore = 85,
  onLevelClick,
  audioEnabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Camera & View Settings
  const [viewMode, setViewMode] = useState<RadarViewMode>("3D_PERSPECTIVE");
  const [zoomScale, setZoomScale] = useState<number>(1.0); // 0.6x to 2.0x
  const [filterMode, setFilterMode] = useState<"ALL" | "CONFLUENCE_ONLY" | "STRONG_ONLY" | "FIB_26_ONLY">("ALL");
  const [hoveredLevelId, setHoveredLevelId] = useState<string | null>(null);
  const [soundMuted, setSoundMuted] = useState<boolean>(!audioEnabled);

  // Smooth lerp state refs
  const smoothPriceRef = useRef<number>(currentPrice);
  const prevPriceRef = useRef<number>(currentPrice);
  const tickDirectionRef = useRef<"UP" | "DOWN" | "NEUTRAL">("NEUTRAL");
  const lastTickTimeRef = useRef<number>(Date.now());
  const radarSweepAngleRef = useRef<number>(0);
  const particlesRef = useRef<
    { x: number; y: number; speed: number; size: number; alpha: number; color: string; life: number }[]
  >([]);

  // Track hover coordinate on canvas
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);
  const renderedHitBoxesRef = useRef<
    { id: string; level: DynamicMarketLevel; x: number; y: number; width: number; height: number }[]
  >([]);

  // Update tick direction on price change
  useEffect(() => {
    if (currentPrice > prevPriceRef.current) {
      tickDirectionRef.current = "UP";
    } else if (currentPrice < prevPriceRef.current) {
      tickDirectionRef.current = "DOWN";
    }
    prevPriceRef.current = currentPrice;
    lastTickTimeRef.current = Date.now();
  }, [currentPrice]);

  // Filter levels based on selected filter
  const filteredLevels = useMemo(() => {
    return levels.filter((lvl) => {
      if (filterMode === "CONFLUENCE_ONLY") return lvl.confluences.length >= 2;
      if (filterMode === "STRONG_ONLY") return lvl.strength === "STRONG" || lvl.strength === "EXTREME";
      if (filterMode === "FIB_26_ONLY") return lvl.type === "FIB_2_6" || lvl.type === "GOLDEN_ZONE_62" || lvl.type === "GOLDEN_ZONE_81";
      return true;
    });
  }, [levels, filterMode]);

  // Main 60fps / 120fps Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    // Initialize particles
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 40; i++) {
        particlesRef.current.push({
          x: Math.random(),
          y: Math.random(),
          speed: 0.001 + Math.random() * 0.002,
          size: 1 + Math.random() * 2.5,
          alpha: 0.2 + Math.random() * 0.6,
          color: Math.random() > 0.5 ? "#06b6d4" : "#f43f5e",
          life: Math.random() * 100,
        });
      }
    }

    const render = () => {
      // 1. Resize handling for sharp retina display
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width;
      const height = rect.height;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // 2. Smooth Lerp Price Movement (Physics spring / lerp)
      const lerpSpeed = 0.12;
      smoothPriceRef.current += (currentPrice - smoothPriceRef.current) * lerpSpeed;
      const displayPrice = smoothPriceRef.current;

      // 3. Clear Background & Draw Dark Cyber Grid
      ctx.fillStyle = "#070b14";
      ctx.fillRect(0, 0, width, height);

      // Perspective Grid Lines
      const centerY = height * 0.5;
      const centerX = width * 0.5;

      // Radial Radar Background Ring & Glow
      const bgGrad = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, width * 0.55);
      bgGrad.addColorStop(0, "rgba(15, 23, 42, 0.95)");
      bgGrad.addColorStop(0.5, "rgba(10, 15, 30, 0.85)");
      bgGrad.addColorStop(1, "rgba(7, 11, 20, 0.98)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 3D Perspective Tilt Grid Transformation
      const tiltFactor =
        viewMode === "3D_PERSPECTIVE" ? 0.35 : viewMode === "TOP_DOWN" ? 0.0 : viewMode === "EXPANDED_HORIZON" ? 0.55 : 0.15;

      // Draw Grid Matrix
      ctx.strokeStyle = "rgba(30, 41, 59, 0.4)";
      ctx.lineWidth = 1;

      // Vertical perspective lines
      const verticalLines = 14;
      for (let i = -verticalLines / 2; i <= verticalLines / 2; i++) {
        const xOffset = i * (width / (verticalLines + 2));
        const topX = centerX + xOffset * (1 - tiltFactor);
        const botX = centerX + xOffset * (1 + tiltFactor);

        ctx.beginPath();
        ctx.moveTo(topX, 0);
        ctx.lineTo(botX, height);
        ctx.stroke();
      }

      // Horizontal depth rings / grid lines
      const horizontalRings = 10;
      for (let i = 1; i <= horizontalRings; i++) {
        const yPos = (height / (horizontalRings + 1)) * i;
        ctx.beginPath();
        ctx.moveTo(width * 0.05, yPos);
        ctx.lineTo(width * 0.95, yPos);
        ctx.strokeStyle = "rgba(51, 65, 85, 0.25)";
        ctx.stroke();
      }

      // Radar Concentric Circles in Center
      const radarMaxRadius = Math.min(width, height) * 0.42;
      for (let r = 0.25; r <= 1.0; r += 0.25) {
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radarMaxRadius * r, (radarMaxRadius * r) * (1 - tiltFactor * 0.5), 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(14, 165, 233, ${0.08 + r * 0.04})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 4. Live Radar Sweep Laser Line
      radarSweepAngleRef.current += 0.018;
      const sweepAngle = radarSweepAngleRef.current;
      const sweepX = centerX + Math.cos(sweepAngle) * radarMaxRadius;
      const sweepY = centerY + Math.sin(sweepAngle) * (radarMaxRadius * (1 - tiltFactor * 0.5));

      const sweepGrad = ctx.createLinearGradient(centerX, centerY, sweepX, sweepY);
      sweepGrad.addColorStop(0, "rgba(56, 189, 248, 0.6)");
      sweepGrad.addColorStop(0.7, "rgba(56, 189, 248, 0.15)");
      sweepGrad.addColorStop(1, "rgba(56, 189, 248, 0)");

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(sweepX, sweepY);
      ctx.strokeStyle = sweepGrad;
      ctx.lineWidth = 2;
      ctx.stroke();

      // 5. Floating Quantum Particles (Stream)
      particlesRef.current.forEach((p) => {
        p.y -= p.speed;
        if (p.y < 0) {
          p.y = 1;
          p.x = Math.random();
        }
        const px = p.x * width;
        const py = p.y * height;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * (0.5 + Math.sin(p.life) * 0.5);
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
        p.life += 0.02;
      });

      // 6. Draw AI Clustered Reaction Zones (Luminous Multi-Ring Shrouds)
      reactionZones.forEach((zone) => {
        const delta = zone.medianPrice - displayPrice;
        // Map delta to Y coordinate: Above price = Top half (Y < centerY), Below price = Bottom half (Y > centerY)
        // Zoom scaling factor: base 25 pixels per 1.0 price point
        const pps = 24 * zoomScale;
        const zoneY = centerY - delta * pps;

        if (zoneY > -50 && zoneY < height + 50) {
          const isAbove = zone.side === "ABOVE";
          const zoneColor = isAbove ? "rgba(244, 63, 94, 0.12)" : "rgba(16, 185, 129, 0.12)";
          const borderColor = isAbove ? "rgba(244, 63, 94, 0.4)" : "rgba(16, 185, 129, 0.4)";

          const zoneHeight = Math.max(28, (zone.highPrice - zone.lowPrice) * pps);
          const zoneWidth = width * 0.72;
          const zoneX = centerX - zoneWidth / 2;

          ctx.fillStyle = zoneColor;
          ctx.beginPath();
          ctx.roundRect(zoneX, zoneY - zoneHeight / 2, zoneWidth, zoneHeight, 8);
          ctx.fill();

          ctx.strokeStyle = borderColor;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Zone Title Badge
          ctx.fillStyle = isAbove ? "#f43f5e" : "#10b981";
          ctx.font = "bold 9px sans-serif";
          ctx.fillText(`⚡ ${zone.label} • ${zone.compositeScore}% INTENSITY`, zoneX + 12, zoneY - zoneHeight / 2 + 12);
        }
      });

      // Clear Hitboxes for interactive clicks
      renderedHitBoxesRef.current = [];

      // 7. Render 3D Curved Arc Level Indicators
      const pps = 24 * zoomScale;

      filteredLevels.forEach((level) => {
        const priceDelta = level.price - displayPrice;
        const levelY = centerY - priceDelta * pps;

        // Clip levels too far out of screen
        if (levelY < -40 || levelY > height + 40) return;

        const isAbove = level.side === "ABOVE";
        const isHovered = hoveredLevelId === level.id;
        const isFib26 = level.type === "FIB_2_6";
        const isGz = level.type === "GOLDEN_ZONE_62" || level.type === "GOLDEN_ZONE_81";
        const isFirstTouch = level.isFirstTouch;

        // Arc Dimensions & 3D Curvature
        const arcSpread = width * (level.strength === "EXTREME" ? 0.82 : level.strength === "STRONG" ? 0.74 : 0.65);
        const arcXStart = centerX - arcSpread / 2;
        const arcXEnd = centerX + arcSpread / 2;
        const curveDepth = isAbove ? -10 * tiltFactor : 10 * tiltFactor;

        // Colors based on level type & side
        let mainColor = level.activeGlowColor || (isAbove ? "#f43f5e" : "#10b981");
        if (isFib26) mainColor = "#f59e0b"; // Gold amber for 2.6
        if (isGz) mainColor = "#ec4899"; // Pink purple for Golden Zone

        // Arc Glow Shadow
        ctx.shadowColor = mainColor;
        ctx.shadowBlur = isHovered ? 18 : isFirstTouch ? 22 : level.strength === "EXTREME" ? 12 : 6;

        // Draw Curved Arc
        ctx.beginPath();
        ctx.moveTo(arcXStart, levelY);
        ctx.quadraticCurveTo(centerX, levelY + curveDepth, arcXEnd, levelY);
        ctx.strokeStyle = isHovered ? "#ffffff" : mainColor;
        ctx.lineWidth = isHovered ? 3.5 : level.strength === "EXTREME" ? 2.8 : level.strength === "STRONG" ? 2.0 : 1.4;
        ctx.stroke();
        ctx.shadowBlur = 0; // reset

        // Left Data Badge (Price & Distance)
        const leftBadgeWidth = 140;
        const leftBadgeX = arcXStart - 10;
        const leftBadgeY = levelY - 14;

        ctx.fillStyle = isHovered ? "rgba(30, 41, 59, 0.95)" : "rgba(15, 23, 42, 0.88)";
        ctx.beginPath();
        ctx.roundRect(leftBadgeX, leftBadgeY, leftBadgeWidth, 28, 6);
        ctx.fill();
        ctx.strokeStyle = isHovered ? "#38bdf8" : mainColor;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Level Price Text
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px monospace";
        ctx.fillText(`${level.price.toFixed(2)}`, leftBadgeX + 8, leftBadgeY + 13);

        // Distance Tag ($ / pts)
        const distSign = priceDelta >= 0 ? `+${priceDelta.toFixed(2)}$` : `${priceDelta.toFixed(2)}$`;
        ctx.fillStyle = priceDelta >= 0 ? "#fda4af" : "#6ee7b7";
        ctx.font = "bold 10px monospace";
        ctx.fillText(distSign, leftBadgeX + 68, leftBadgeY + 13);

        // Strength Chip (WEAK • MEDIUM • STRONG • EXTREME)
        let strengthText = level.strength;
        let strengthColor =
          level.strength === "EXTREME" ? "#f43f5e" : level.strength === "STRONG" ? "#f59e0b" : "#38bdf8";
        ctx.fillStyle = strengthColor;
        ctx.font = "bold 8px sans-serif";
        ctx.fillText(`${strengthText} • ${level.confluences[0] || level.label}`, leftBadgeX + 8, leftBadgeY + 24);

        // Right Confluence & First Touch Badge
        const rightBadgeWidth = 160;
        const rightBadgeX = arcXEnd - rightBadgeWidth + 10;
        const rightBadgeY = levelY - 14;

        ctx.fillStyle = isHovered ? "rgba(30, 41, 59, 0.95)" : "rgba(15, 23, 42, 0.88)";
        ctx.beginPath();
        ctx.roundRect(rightBadgeX, rightBadgeY, rightBadgeWidth, 28, 6);
        ctx.fill();
        ctx.strokeStyle = isFirstTouch ? "#eab308" : mainColor;
        ctx.lineWidth = isFirstTouch ? 1.5 : 1;
        ctx.stroke();

        // Label Text
        ctx.fillStyle = isFirstTouch ? "#facc15" : "#e2e8f0";
        ctx.font = "bold 9px sans-serif";
        const touchText = isFirstTouch ? "🔥 FIRST TOUCH" : level.label;
        ctx.fillText(touchText, rightBadgeX + 8, rightBadgeY + 12);

        // Confluence string
        ctx.fillStyle = "#94a3b8";
        ctx.font = "8px sans-serif";
        const confStr = level.confluences.slice(0, 2).join(" • ");
        ctx.fillText(confStr.length > 28 ? confStr.slice(0, 26) + "..." : confStr, rightBadgeX + 8, rightBadgeY + 23);

        // Save hitbox for interaction
        renderedHitBoxesRef.current.push({
          id: level.id,
          level,
          x: leftBadgeX,
          y: leftBadgeY,
          width: arcSpread + 30,
          height: 32,
        });

        // Connection energy beam to central price if very close (< 1.5 pts)
        if (Math.abs(priceDelta) < 1.5) {
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(centerX, levelY);
          ctx.strokeStyle = mainColor;
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // 8. Central Live Price Core (The Pulsating Glowing Beacon)
      // Pulse animation
      const pulseTime = Date.now() * 0.003;
      const pulseRadius = 8 + Math.sin(pulseTime) * 3;

      // Glow Aura
      const priceColor = tickDirectionRef.current === "UP" ? "#10b981" : tickDirectionRef.current === "DOWN" ? "#f43f5e" : "#38bdf8";
      const coreGrad = ctx.createRadialGradient(centerX, centerY, 4, centerX, centerY, 38);
      coreGrad.addColorStop(0, priceColor);
      coreGrad.addColorStop(0.3, "rgba(56, 189, 248, 0.4)");
      coreGrad.addColorStop(1, "rgba(56, 189, 248, 0)");

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 38, 0, Math.PI * 2);
      ctx.fill();

      // Central Expanding Radar Shockwave
      const waveRadius = ((Date.now() % 2000) / 2000) * 80;
      ctx.beginPath();
      ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(56, 189, 248, ${1.0 - waveRadius / 80})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Central Solid Node
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Horizontal Laser Scan Line across center
      const laserGrad = ctx.createLinearGradient(0, centerY, width, centerY);
      laserGrad.addColorStop(0, "rgba(56, 189, 248, 0)");
      laserGrad.addColorStop(0.3, "rgba(56, 189, 248, 0.3)");
      laserGrad.addColorStop(0.5, priceColor);
      laserGrad.addColorStop(0.7, "rgba(56, 189, 248, 0.3)");
      laserGrad.addColorStop(1, "rgba(56, 189, 248, 0)");

      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.strokeStyle = laserGrad;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Central Digital Live Price Floating HUD Box
      const hudWidth = 200;
      const hudHeight = 36;
      const hudX = centerX - hudWidth / 2;
      const hudY = centerY - hudHeight / 2;

      ctx.fillStyle = "rgba(10, 15, 30, 0.92)";
      ctx.beginPath();
      ctx.roundRect(hudX, hudY, hudWidth, hudHeight, 8);
      ctx.fill();

      ctx.strokeStyle = priceColor;
      ctx.lineWidth = 2;
      ctx.shadowColor = priceColor;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // HUD Text - Live Price
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`● ${assetKey} ${displayPrice.toFixed(2)}`, centerX, centerY + 5);

      // HUD Small Indicator (LIVE TICKING)
      ctx.fillStyle = priceColor;
      ctx.font = "bold 8px sans-serif";
      const tickText =
        tickDirectionRef.current === "UP" ? "▲ TICK UP • BUY VOLUME" : tickDirectionRef.current === "DOWN" ? "▼ TICK DOWN • SELL PRESSURE" : "SCANNING RADAR...";
      ctx.fillText(tickText, centerX, centerY + 14);
      ctx.textAlign = "left"; // reset

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentPrice, filteredLevels, reactionZones, viewMode, zoomScale, hoveredLevelId, assetKey, filterMode]);

  // Mouse Move Interaction Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mousePosRef.current = { x, y };

    // Check hitboxes
    const hit = renderedHitBoxesRef.current.find(
      (b) => x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height
    );

    if (hit) {
      setHoveredLevelId(hit.id);
    } else {
      setHoveredLevelId(null);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!hoveredLevelId) return;
    const hit = renderedHitBoxesRef.current.find((b) => b.id === hoveredLevelId);
    if (hit && onLevelClick) {
      onLevelClick(hit.level);
    }
  };

  return (
    <div
      ref={containerRef}
      id="khatarnak-3d-market-radar"
      className="relative w-full h-[540px] bg-[#070b14] rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl flex flex-col"
    >
      {/* Top Floating Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 bg-slate-900/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800/80">
        {/* Left: View Modes */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            3D Mode:
          </span>
          <button
            id="radar-mode-3d"
            onClick={() => setViewMode("3D_PERSPECTIVE")}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
              viewMode === "3D_PERSPECTIVE"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            3D Tilt
          </button>
          <button
            id="radar-mode-25d"
            onClick={() => setViewMode("FRONTAL_2_5D")}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
              viewMode === "FRONTAL_2_5D"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Frontal 2.5D
          </button>
          <button
            id="radar-mode-topdown"
            onClick={() => setViewMode("TOP_DOWN")}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
              viewMode === "TOP_DOWN"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Top-Down
          </button>
        </div>

        {/* Center: Filter Controls */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Layers className="w-3.5 h-3.5 text-pink-400" />
            Filter:
          </span>
          {(["ALL", "CONFLUENCE_ONLY", "STRONG_ONLY", "FIB_26_ONLY"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterMode(f)}
              className={`px-2 py-0.5 text-[9px] font-bold rounded transition-all ${
                filterMode === f
                  ? "bg-pink-500/20 text-pink-300 border border-pink-500/40"
                  : "bg-slate-800/60 text-slate-400 hover:text-slate-200"
              }`}
            >
              {f === "ALL"
                ? "All"
                : f === "CONFLUENCE_ONLY"
                ? "Confluences"
                : f === "STRONG_ONLY"
                ? "Strong"
                : "Fib 2.6 & GZ"}
            </button>
          ))}
        </div>

        {/* Right: Zoom & Audio Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              id="zoom-out-btn"
              onClick={() => setZoomScale((prev) => Math.max(0.6, prev - 0.2))}
              className="p-1 text-slate-400 hover:text-white rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono font-bold text-cyan-300 px-1.5">
              {zoomScale.toFixed(1)}x
            </span>
            <button
              id="zoom-in-btn"
              onClick={() => setZoomScale((prev) => Math.min(2.0, prev + 0.2))}
              className="p-1 text-slate-400 hover:text-white rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            id="sound-toggle-btn"
            onClick={() => setSoundMuted(!soundMuted)}
            className={`p-1.5 rounded-lg border transition-all ${
              !soundMuted
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-slate-800 text-slate-400 border-slate-700"
            }`}
            title={soundMuted ? "Unmute Radar Chime" : "Mute Radar Chime"}
          >
            {!soundMuted ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas */}
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredLevelId(null)}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-crosshair block"
      />

      {/* Bottom Status / Legend HUD */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 text-[10px]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Upper Resistance / Sell LQ</span>
          </div>
          <div className="flex items-center gap-1 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Fib 2.6 Dynamic Level</span>
          </div>
          <div className="flex items-center gap-1 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Lower Support / Buy Targets</span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-slate-400">
          <span>Active Levels: <strong className="text-cyan-300">{filteredLevels.length}</strong></span>
          <span>•</span>
          <span>Clusters: <strong className="text-pink-300">{reactionZones.length}</strong></span>
          <span>•</span>
          <span>Score: <strong className="text-emerald-400">{confluenceScore}/100</strong></span>
        </div>
      </div>
    </div>
  );
};

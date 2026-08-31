import React, { useMemo } from "react";
import {
  CentralSignalManagerState,
  centralSignalManager,
  AiBrainSource,
} from "../services/centralSignalManager";

export interface BrainNodeState {
  key: "HARAMI_AI" | "KHATARNAK_JUGAAD" | "WAR_ROOM";
  name: string;
  shortName: string;
  emoji: string;
  isOn: boolean;
  direction: "BUY" | "SELL" | "NEUTRAL";
  score: number;
  grade?: string;
  statusLabel: string;
}

export interface NeuralConstellationCoreProps {
  managerState?: CentralSignalManagerState;
  className?: string;
  height?: number | string;
  onBrainClick?: (brainKey: "HARAMI_AI" | "KHATARNAK_JUGAAD" | "WAR_ROOM") => void;
}

export const NeuralConstellationCore: React.FC<NeuralConstellationCoreProps> = ({
  managerState,
  className = "",
  height = 320,
  onBrainClick,
}) => {
  // 1. Resolve live state from props or fallback to singleton instance
  const liveState = useMemo(() => {
    return managerState || centralSignalManager.getState();
  }, [managerState]);

  // 2. Extract state for the 3 AI brains
  const haramiCandidate = liveState.candidates?.HARAMI_AI;
  const khatarnakCandidate = liveState.candidates?.KHATARNAK_JUGAAD;
  const warRoomCandidate = liveState.candidates?.WAR_ROOM;

  const haramiOn = liveState.haramiEnabled ?? true;
  const khatarnakOn = liveState.khatarnakEnabled ?? true;
  const warRoomOn = liveState.warRoomEnabled ?? true;

  const brains: Record<"HARAMI_AI" | "KHATARNAK_JUGAAD" | "WAR_ROOM", BrainNodeState> = {
    HARAMI_AI: {
      key: "HARAMI_AI",
      name: "Harami AI",
      shortName: "Harami AI",
      emoji: "🤖",
      isOn: haramiOn,
      direction: haramiCandidate?.direction || "NEUTRAL",
      score: haramiCandidate?.setupScore || 0,
      grade: haramiCandidate?.qualityGrade || "VALID",
      statusLabel: !haramiOn ? "DISABLED" : haramiCandidate?.direction || "STANDBY",
    },
    KHATARNAK_JUGAAD: {
      key: "KHATARNAK_JUGAAD",
      name: "Khatarnak Jugaad",
      shortName: "Khatarnak",
      emoji: "💀",
      isOn: khatarnakOn,
      direction: khatarnakCandidate?.direction || "NEUTRAL",
      score: khatarnakCandidate?.setupScore || 0,
      grade: khatarnakCandidate?.qualityGrade || "VALID",
      statusLabel: !khatarnakOn ? "DISABLED" : khatarnakCandidate?.direction || "STANDBY",
    },
    WAR_ROOM: {
      key: "WAR_ROOM",
      name: "War Room Supreme",
      shortName: "War Room",
      emoji: "⚔️",
      isOn: warRoomOn,
      direction: warRoomCandidate?.direction || "NEUTRAL",
      score: warRoomCandidate?.setupScore || 0,
      grade: warRoomCandidate?.qualityGrade || "VALID",
      statusLabel: !warRoomOn ? "DISABLED" : warRoomCandidate?.direction || "STANDBY",
    },
  };

  // 3. Determine consensus calculations among the 3 active brains
  const activeBrains = Object.values(brains).filter((b) => b.isOn);
  const totalActive = activeBrains.length;
  const buyCount = activeBrains.filter((b) => b.direction === "BUY").length;
  const sellCount = activeBrains.filter((b) => b.direction === "SELL").length;

  const hasBuyConsensus = buyCount >= 2;
  const hasSellConsensus = sellCount >= 2;
  const hasConsensus = (hasBuyConsensus || hasSellConsensus) && totalActive >= 2;
  const consensusDirection: "BUY" | "SELL" | "NONE" = hasBuyConsensus
    ? "BUY"
    : hasSellConsensus
    ? "SELL"
    : "NONE";

  // Consensus ratio & label formatted consistently with AI BRAIN CONSENSUS card
  const consensusText = useMemo(() => {
    if (liveState.consensus && liveState.consensus.consensusLabel) {
      return liveState.consensus.consensusLabel;
    }
    if (totalActive === 0) {
      return "0/0 Engines Active — Standby";
    }
    if (hasBuyConsensus) {
      const pct = Math.round((buyCount / totalActive) * 100);
      return `${buyCount}/${totalActive} BUY — ${pct}% Consensus`;
    }
    if (hasSellConsensus) {
      const pct = Math.round((sellCount / totalActive) * 100);
      return `${sellCount}/${totalActive} SELL — ${pct}% Consensus`;
    }
    if (buyCount > 0 && sellCount > 0) {
      return `${buyCount} BUY vs ${sellCount} SELL — Divergent Bias`;
    }
    if (buyCount === 1) {
      return `1/${totalActive} BUY — Institutional Edge (Scanning)`;
    }
    if (sellCount === 1) {
      return `1/${totalActive} SELL — Institutional Edge (Scanning)`;
    }
    return `${totalActive}/${totalActive} AI Engines Active — Analyzing Flux`;
  }, [liveState.consensus, totalActive, buyCount, sellCount, hasBuyConsensus, hasSellConsensus]);

  // Geometric coordinates for Triangle Nodes (viewBox: 0 0 600 280)
  // Top: Harami AI (300, 52)
  // Bottom Left: Khatarnak (140, 202)
  // Bottom Right: War Room (460, 202)
  // Center / Centroid: (300, 152)
  const coords = {
    HARAMI_AI: { x: 300, y: 52 },
    KHATARNAK_JUGAAD: { x: 140, y: 202 },
    WAR_ROOM: { x: 460, y: 202 },
    CENTER: { x: 300, y: 152 },
  };

  // Helper for node styling
  const getNodeColor = (b: BrainNodeState) => {
    if (!b.isOn) {
      return {
        primary: "#64748b", // slate-500
        glow: "rgba(100, 116, 139, 0.25)",
        fill: "#1e293b",
        border: "#475569",
        text: "text-slate-400",
        badgeBg: "bg-slate-800/80 border-slate-700 text-slate-400",
        auraClass: "opacity-30",
      };
    }
    if (b.direction === "BUY") {
      return {
        primary: "#10b981", // emerald-500
        glow: "rgba(16, 185, 129, 0.75)",
        fill: "#064e3b",
        border: "#34d399",
        text: "text-emerald-300",
        badgeBg: "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.3)]",
        auraClass: "opacity-100",
      };
    }
    if (b.direction === "SELL") {
      return {
        primary: "#ef4444", // red-500
        glow: "rgba(239, 68, 68, 0.75)",
        fill: "#7f1d1d",
        border: "#f87171",
        text: "text-rose-300",
        badgeBg: "bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-[0_0_8px_rgba(239,68,68,0.3)]",
        auraClass: "opacity-100",
      };
    }
    return {
      primary: "#06b6d4", // cyan-500 standby
      glow: "rgba(6, 182, 212, 0.4)",
      fill: "#164e63",
      border: "#22d3ee",
      text: "text-cyan-300",
      badgeBg: "bg-cyan-500/20 border-cyan-500/40 text-cyan-300",
      auraClass: "opacity-70",
    };
  };

  // Helper for connecting lines
  const getLineStyle = (b1: BrainNodeState, b2: BrainNodeState) => {
    const bothActive = b1.isOn && b2.isOn;
    if (!bothActive) {
      return {
        active: false,
        stroke: "#334155",
        strokeWidth: 1,
        dashArray: "3 6",
        opacity: 0.18,
        animationClass: "",
      };
    }

    const agree = b1.direction !== "NEUTRAL" && b1.direction === b2.direction;
    const color =
      agree && b1.direction === "BUY"
        ? "#10b981"
        : agree && b1.direction === "SELL"
        ? "#ef4444"
        : "#06b6d4";

    return {
      active: true,
      stroke: color,
      strokeWidth: hasConsensus && agree ? 2.5 : 1.5,
      dashArray: hasConsensus && agree ? "6 6" : "4 8",
      opacity: hasConsensus && agree ? 0.95 : 0.45,
      filter: hasConsensus && agree ? "url(#glow-line-strong)" : "url(#glow-line-soft)",
      animationClass: hasConsensus ? "animate-synapse-fast" : "animate-synapse-slow",
      color,
    };
  };

  const lineHaramiKhatarnak = getLineStyle(brains.HARAMI_AI, brains.KHATARNAK_JUGAAD);
  const lineHaramiWarRoom = getLineStyle(brains.HARAMI_AI, brains.WAR_ROOM);
  const lineKhatarnakWarRoom = getLineStyle(brains.KHATARNAK_JUGAAD, brains.WAR_ROOM);

  return (
    <div
      id="neural-constellation-core"
      className={`relative w-full rounded-2xl bg-[#0a0e17] border border-slate-800/90 overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.6)] flex flex-col justify-between select-none ${className}`}
      style={{ minHeight: typeof height === "number" ? `${height}px` : height }}
    >
      {/* Scoped CSS Keyframes for lightweight 60fps animations */}
      <style>{`
        @keyframes constellation-pulse {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.04); opacity: 1; }
        }
        @keyframes halo-expand {
          0% { r: 24px; opacity: 0.8; }
          100% { r: 42px; opacity: 0; }
        }
        @keyframes halo-expand-fast {
          0% { r: 24px; opacity: 0.95; }
          100% { r: 48px; opacity: 0; }
        }
        @keyframes synapse-flow-fast {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -48; }
        }
        @keyframes synapse-flow-slow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -32; }
        }
        @keyframes core-fusion {
          0%, 100% { transform: scale(0.92); opacity: 0.9; }
          50% { transform: scale(1.18); opacity: 1; filter: drop-shadow(0 0 14px currentColor); }
        }
        @keyframes core-orbit-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes float-badge {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        .animate-constellation-pulse {
          animation: constellation-pulse 3.8s ease-in-out infinite;
          transform-origin: center;
        }
        .animate-halo {
          animation: halo-expand 2.6s cubic-bezier(0.25, 1, 0.5, 1) infinite;
          transform-origin: center;
        }
        .animate-halo-fast {
          animation: halo-expand-fast 1.3s cubic-bezier(0.25, 1, 0.5, 1) infinite;
          transform-origin: center;
        }
        .animate-synapse-fast {
          animation: synapse-flow-fast 1.1s linear infinite;
        }
        .animate-synapse-slow {
          animation: synapse-flow-slow 3.2s linear infinite;
        }
        .animate-core-fusion {
          animation: core-fusion 1.5s ease-in-out infinite;
          transform-origin: 300px 152px;
        }
        .animate-core-spin {
          animation: core-orbit-spin 6s linear infinite;
          transform-origin: 300px 152px;
        }
      `}</style>

      {/* Ambient Neural Background Grid & Depth Radiance */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Radial ambient glow centered behind triangle */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-72 rounded-full blur-3xl transition-all duration-700 pointer-events-none"
          style={{
            background: hasConsensus
              ? consensusDirection === "BUY"
                ? "radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(6,182,212,0.06) 50%, transparent 80%)"
                : "radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(245,158,11,0.06) 50%, transparent 80%)"
              : "radial-gradient(circle, rgba(51,65,85,0.18) 0%, transparent 75%)",
          }}
        />

        {/* Subtle coordinate grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(#94a3b8 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      {/* Header Tag Bar */}
      <div className="relative z-10 px-4 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                hasConsensus
                  ? consensusDirection === "BUY"
                    ? "bg-emerald-400"
                    : "bg-rose-400"
                  : "bg-cyan-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                hasConsensus
                  ? consensusDirection === "BUY"
                    ? "bg-emerald-500"
                    : "bg-rose-500"
                  : "bg-cyan-500"
              }`}
            />
          </span>
          <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-300">
            Neural Constellation Synapse
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-md border border-slate-800">
          <span className="text-slate-500">Active Nodes:</span>
          <span
            className={`font-bold ${
              totalActive === 3
                ? "text-emerald-400"
                : totalActive >= 1
                ? "text-amber-400"
                : "text-slate-500"
            }`}
          >
            {totalActive}/3
          </span>
        </div>
      </div>

      {/* SVG Canvas for 3 Nodes, Connecting Synapse Lines & Central Core */}
      <div className="relative w-full flex-1 flex items-center justify-center">
        <svg
          viewBox="0 0 600 280"
          className="w-full h-full max-h-[260px] overflow-visible"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Soft Glow Filter */}
            <filter id="glow-soft" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* High-intensity Glow Filter for Consensus lines */}
            <filter id="glow-line-strong" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur1" />
              <feGaussianBlur stdDeviation="1.5" result="blur2" />
              <feMerge>
                <feMergeNode in="blur1" />
                <feMergeNode in="blur2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Soft Line Glow Filter */}
            <filter id="glow-line-soft" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Supercharged Core Fusion Filter */}
            <filter id="glow-core-fusion" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="7" result="blurBig" />
              <feGaussianBlur stdDeviation="3" result="blurMed" />
              <feMerge>
                <feMergeNode in="blurBig" />
                <feMergeNode in="blurMed" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Gradients for Nodes */}
            <radialGradient id="grad-buy" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#059669" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#064e3b" stopOpacity="0.95" />
            </radialGradient>

            <radialGradient id="grad-sell" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f87171" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#dc2626" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.95" />
            </radialGradient>

            <radialGradient id="grad-off" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#64748b" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#1e293b" stopOpacity="0.8" />
            </radialGradient>

            <radialGradient id="grad-core-buy" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="35%" stopColor="#34d399" stopOpacity="0.9" />
              <stop offset="75%" stopColor="#059669" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="grad-core-sell" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="35%" stopColor="#f87171" stopOpacity="0.9" />
              <stop offset="75%" stopColor="#dc2626" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#991b1b" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 1. Base Inactive / Faint Structural Wireframe between all 3 nodes */}
          <g opacity="0.15" stroke="#475569" strokeWidth="1" strokeDasharray="3 4">
            <line x1={coords.HARAMI_AI.x} y1={coords.HARAMI_AI.y} x2={coords.KHATARNAK_JUGAAD.x} y2={coords.KHATARNAK_JUGAAD.y} />
            <line x1={coords.HARAMI_AI.x} y1={coords.HARAMI_AI.y} x2={coords.WAR_ROOM.x} y2={coords.WAR_ROOM.y} />
            <line x1={coords.KHATARNAK_JUGAAD.x} y1={coords.KHATARNAK_JUGAAD.y} x2={coords.WAR_ROOM.x} y2={coords.WAR_ROOM.y} />
          </g>

          {/* 2. Active Animated Connecting Synaptic Lines */}
          {/* Harami AI <-> Khatarnak */}
          {lineHaramiKhatarnak.active && (
            <line
              x1={coords.HARAMI_AI.x}
              y1={coords.HARAMI_AI.y}
              x2={coords.KHATARNAK_JUGAAD.x}
              y2={coords.KHATARNAK_JUGAAD.y}
              stroke={lineHaramiKhatarnak.stroke}
              strokeWidth={lineHaramiKhatarnak.strokeWidth}
              strokeDasharray={lineHaramiKhatarnak.dashArray}
              opacity={lineHaramiKhatarnak.opacity}
              filter={lineHaramiKhatarnak.filter}
              className={lineHaramiKhatarnak.animationClass}
            />
          )}

          {/* Harami AI <-> War Room */}
          {lineHaramiWarRoom.active && (
            <line
              x1={coords.HARAMI_AI.x}
              y1={coords.HARAMI_AI.y}
              x2={coords.WAR_ROOM.x}
              y2={coords.WAR_ROOM.y}
              stroke={lineHaramiWarRoom.stroke}
              strokeWidth={lineHaramiWarRoom.strokeWidth}
              strokeDasharray={lineHaramiWarRoom.dashArray}
              opacity={lineHaramiWarRoom.opacity}
              filter={lineHaramiWarRoom.filter}
              className={lineHaramiWarRoom.animationClass}
            />
          )}

          {/* Khatarnak <-> War Room */}
          {lineKhatarnakWarRoom.active && (
            <line
              x1={coords.KHATARNAK_JUGAAD.x}
              y1={coords.KHATARNAK_JUGAAD.y}
              x2={coords.WAR_ROOM.x}
              y2={coords.WAR_ROOM.y}
              stroke={lineKhatarnakWarRoom.stroke}
              strokeWidth={lineKhatarnakWarRoom.strokeWidth}
              strokeDasharray={lineKhatarnakWarRoom.dashArray}
              opacity={lineKhatarnakWarRoom.opacity}
              filter={lineKhatarnakWarRoom.filter}
              className={lineKhatarnakWarRoom.animationClass}
            />
          )}

          {/* 3. Central Convergence Beams & Nexus Core (Appears when 2 or more brains agree on consensus) */}
          {hasConsensus && (
            <g id="consensus-central-nexus">
              {/* Converging Rays to Centroid */}
              <g
                opacity="0.8"
                stroke={consensusDirection === "BUY" ? "#34d399" : "#f87171"}
                strokeWidth="1.8"
                strokeDasharray="4 4"
                className="animate-synapse-fast"
                filter="url(#glow-line-strong)"
              >
                {brains.HARAMI_AI.isOn && brains.HARAMI_AI.direction === consensusDirection && (
                  <line x1={coords.HARAMI_AI.x} y1={coords.HARAMI_AI.y} x2={coords.CENTER.x} y2={coords.CENTER.y} />
                )}
                {brains.KHATARNAK_JUGAAD.isOn && brains.KHATARNAK_JUGAAD.direction === consensusDirection && (
                  <line x1={coords.KHATARNAK_JUGAAD.x} y1={coords.KHATARNAK_JUGAAD.y} x2={coords.CENTER.x} y2={coords.CENTER.y} />
                )}
                {brains.WAR_ROOM.isOn && brains.WAR_ROOM.direction === consensusDirection && (
                  <line x1={coords.WAR_ROOM.x} y1={coords.WAR_ROOM.y} x2={coords.CENTER.x} y2={coords.CENTER.y} />
                )}
              </g>

              {/* Central Core Outer Radiant Orb */}
              <circle
                cx={coords.CENTER.x}
                cy={coords.CENTER.y}
                r="24"
                fill={consensusDirection === "BUY" ? "url(#grad-core-buy)" : "url(#grad-core-sell)"}
                className="animate-core-fusion"
                filter="url(#glow-core-fusion)"
              />

              {/* Rotating Energy Orbit Ring */}
              <g className="animate-core-spin">
                <circle
                  cx={coords.CENTER.x}
                  cy={coords.CENTER.y}
                  r="14"
                  fill="none"
                  stroke={consensusDirection === "BUY" ? "#a7f3d0" : "#fecdd3"}
                  strokeWidth="1.5"
                  strokeDasharray="3 4"
                  opacity="0.9"
                />
                <circle
                  cx={coords.CENTER.x + 14}
                  cy={coords.CENTER.y}
                  r="2.5"
                  fill={consensusDirection === "BUY" ? "#ffffff" : "#ffffff"}
                />
                <circle
                  cx={coords.CENTER.x - 14}
                  cy={coords.CENTER.y}
                  r="2.5"
                  fill={consensusDirection === "BUY" ? "#ffffff" : "#ffffff"}
                />
              </g>

              {/* Central Intense Particle Core */}
              <circle
                cx={coords.CENTER.x}
                cy={coords.CENTER.y}
                r="5"
                fill="#ffffff"
                filter="url(#glow-soft)"
              />
            </g>
          )}

          {/* 4. Render The 3 Brain Nodes */}
          {/* --- NODE 1: Harami AI (Top Center) --- */}
          {(() => {
            const b = brains.HARAMI_AI;
            const c = coords.HARAMI_AI;
            const style = getNodeColor(b);
            return (
              <g
                id="node-harami-ai"
                className="cursor-pointer group"
                onClick={() => onBrainClick && onBrainClick("HARAMI_AI")}
              >
                {/* Continuous Pulse Breathing Halo */}
                {b.isOn && (
                  <circle
                    cx={c.x}
                    cy={c.y}
                    className={hasConsensus && b.direction === consensusDirection ? "animate-halo-fast" : "animate-halo"}
                    fill="none"
                    stroke={style.primary}
                    strokeWidth="1.5"
                    opacity="0.6"
                  />
                )}

                {/* Outer Breathing Glow Ring */}
                <circle
                  cx={c.x}
                  cy={c.y}
                  r="24"
                  fill={b.isOn ? (b.direction === "BUY" ? "url(#grad-buy)" : b.direction === "SELL" ? "url(#grad-sell)" : "url(#grad-off)") : "url(#grad-off)"}
                  stroke={style.border}
                  strokeWidth={b.isOn ? 2 : 1.2}
                  filter={b.isOn ? "url(#glow-soft)" : undefined}
                  className="animate-constellation-pulse"
                />

                {/* Inner Icon / Emoji */}
                <text
                  x={c.x}
                  y={c.y + 5}
                  textAnchor="middle"
                  fontSize="16"
                  className="pointer-events-none select-none"
                >
                  {b.emoji}
                </text>

                {/* Node Title & State Tag */}
                <text
                  x={c.x}
                  y={c.y - 30}
                  textAnchor="middle"
                  className="text-[12px] font-black tracking-wide font-mono fill-slate-200 uppercase pointer-events-none select-none"
                >
                  Harami AI
                </text>

                {/* Direction Pill Badge */}
                <g transform={`translate(${c.x - 34}, ${c.y + 28})`}>
                  <rect
                    width="68"
                    height="17"
                    rx="8.5"
                    fill={!b.isOn ? "#1e293b" : b.direction === "BUY" ? "#064e3b" : b.direction === "SELL" ? "#7f1d1d" : "#0f172a"}
                    stroke={style.primary}
                    strokeWidth="1"
                    opacity="0.95"
                  />
                  <text
                    x="34"
                    y="12"
                    textAnchor="middle"
                    className={`text-[9px] font-extrabold font-mono uppercase select-none ${
                      !b.isOn ? "fill-slate-400" : b.direction === "BUY" ? "fill-emerald-300" : b.direction === "SELL" ? "fill-rose-300" : "fill-cyan-300"
                    }`}
                  >
                    {!b.isOn ? "OFF" : `${b.direction} • ${b.score}`}
                  </text>
                </g>
              </g>
            );
          })()}

          {/* --- NODE 2: Khatarnak Jugaad (Bottom Left) --- */}
          {(() => {
            const b = brains.KHATARNAK_JUGAAD;
            const c = coords.KHATARNAK_JUGAAD;
            const style = getNodeColor(b);
            return (
              <g
                id="node-khatarnak-jugaad"
                className="cursor-pointer group"
                onClick={() => onBrainClick && onBrainClick("KHATARNAK_JUGAAD")}
              >
                {/* Continuous Pulse Breathing Halo */}
                {b.isOn && (
                  <circle
                    cx={c.x}
                    cy={c.y}
                    className={hasConsensus && b.direction === consensusDirection ? "animate-halo-fast" : "animate-halo"}
                    fill="none"
                    stroke={style.primary}
                    strokeWidth="1.5"
                    opacity="0.6"
                  />
                )}

                {/* Outer Breathing Glow Ring */}
                <circle
                  cx={c.x}
                  cy={c.y}
                  r="24"
                  fill={b.isOn ? (b.direction === "BUY" ? "url(#grad-buy)" : b.direction === "SELL" ? "url(#grad-sell)" : "url(#grad-off)") : "url(#grad-off)"}
                  stroke={style.border}
                  strokeWidth={b.isOn ? 2 : 1.2}
                  filter={b.isOn ? "url(#glow-soft)" : undefined}
                  className="animate-constellation-pulse"
                />

                {/* Inner Icon / Emoji */}
                <text
                  x={c.x}
                  y={c.y + 5}
                  textAnchor="middle"
                  fontSize="16"
                  className="pointer-events-none select-none"
                >
                  {b.emoji}
                </text>

                {/* Node Title */}
                <text
                  x={c.x}
                  y={c.y + 36}
                  textAnchor="middle"
                  className="text-[11px] font-black tracking-wide font-mono fill-slate-200 uppercase pointer-events-none select-none"
                >
                  Khatarnak Jugaad
                </text>

                {/* Direction Pill Badge */}
                <g transform={`translate(${c.x - 34}, ${c.y + 42})`}>
                  <rect
                    width="68"
                    height="17"
                    rx="8.5"
                    fill={!b.isOn ? "#1e293b" : b.direction === "BUY" ? "#064e3b" : b.direction === "SELL" ? "#7f1d1d" : "#0f172a"}
                    stroke={style.primary}
                    strokeWidth="1"
                    opacity="0.95"
                  />
                  <text
                    x="34"
                    y="12"
                    textAnchor="middle"
                    className={`text-[9px] font-extrabold font-mono uppercase select-none ${
                      !b.isOn ? "fill-slate-400" : b.direction === "BUY" ? "fill-emerald-300" : b.direction === "SELL" ? "fill-rose-300" : "fill-cyan-300"
                    }`}
                  >
                    {!b.isOn ? "OFF" : `${b.direction} • ${b.score}`}
                  </text>
                </g>
              </g>
            );
          })()}

          {/* --- NODE 3: War Room Supreme (Bottom Right) --- */}
          {(() => {
            const b = brains.WAR_ROOM;
            const c = coords.WAR_ROOM;
            const style = getNodeColor(b);
            return (
              <g
                id="node-war-room-supreme"
                className="cursor-pointer group"
                onClick={() => onBrainClick && onBrainClick("WAR_ROOM")}
              >
                {/* Continuous Pulse Breathing Halo */}
                {b.isOn && (
                  <circle
                    cx={c.x}
                    cy={c.y}
                    className={hasConsensus && b.direction === consensusDirection ? "animate-halo-fast" : "animate-halo"}
                    fill="none"
                    stroke={style.primary}
                    strokeWidth="1.5"
                    opacity="0.6"
                  />
                )}

                {/* Outer Breathing Glow Ring */}
                <circle
                  cx={c.x}
                  cy={c.y}
                  r="24"
                  fill={b.isOn ? (b.direction === "BUY" ? "url(#grad-buy)" : b.direction === "SELL" ? "url(#grad-sell)" : "url(#grad-off)") : "url(#grad-off)"}
                  stroke={style.border}
                  strokeWidth={b.isOn ? 2 : 1.2}
                  filter={b.isOn ? "url(#glow-soft)" : undefined}
                  className="animate-constellation-pulse"
                />

                {/* Inner Icon / Emoji */}
                <text
                  x={c.x}
                  y={c.y + 5}
                  textAnchor="middle"
                  fontSize="16"
                  className="pointer-events-none select-none"
                >
                  {b.emoji}
                </text>

                {/* Node Title */}
                <text
                  x={c.x}
                  y={c.y + 36}
                  textAnchor="middle"
                  className="text-[11px] font-black tracking-wide font-mono fill-slate-200 uppercase pointer-events-none select-none"
                >
                  War Room Supreme
                </text>

                {/* Direction Pill Badge */}
                <g transform={`translate(${c.x - 34}, ${c.y + 42})`}>
                  <rect
                    width="68"
                    height="17"
                    rx="8.5"
                    fill={!b.isOn ? "#1e293b" : b.direction === "BUY" ? "#064e3b" : b.direction === "SELL" ? "#7f1d1d" : "#0f172a"}
                    stroke={style.primary}
                    strokeWidth="1"
                    opacity="0.95"
                  />
                  <text
                    x="34"
                    y="12"
                    textAnchor="middle"
                    className={`text-[9px] font-extrabold font-mono uppercase select-none ${
                      !b.isOn ? "fill-slate-400" : b.direction === "BUY" ? "fill-emerald-300" : b.direction === "SELL" ? "fill-rose-300" : "fill-cyan-300"
                    }`}
                  >
                    {!b.isOn ? "OFF" : `${b.direction} • ${b.score}`}
                  </text>
                </g>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Floating Consensus State Footer Text Bar */}
      <div className="relative z-10 pb-3 pt-1 flex items-center justify-center px-4">
        <div
          id="constellation-consensus-pill"
          className={`px-4 py-1.5 rounded-full border backdrop-blur-md transition-all duration-500 flex items-center gap-2 text-xs font-mono shadow-lg ${
            hasConsensus
              ? consensusDirection === "BUY"
                ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                : "bg-rose-950/80 border-rose-500/50 text-rose-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
              : "bg-slate-900/80 border-slate-700/80 text-slate-300"
          }`}
        >
          {/* Animated Glow Dot */}
          <span
            className={`w-2 h-2 rounded-full ${
              hasConsensus
                ? consensusDirection === "BUY"
                  ? "bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]"
                  : "bg-rose-400 animate-pulse shadow-[0_0_6px_#f87171]"
                : "bg-amber-400"
            }`}
          />

          <span className="font-bold tracking-wide">
            {consensusText}
          </span>
        </div>
      </div>
    </div>
  );
};

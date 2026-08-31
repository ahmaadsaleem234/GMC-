import React, { useState, useEffect } from "react";
import { CooldownState } from "../services/centralSignalManager";

interface CooldownRadialRingProps {
  cooldown: CooldownState;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
}

export const CooldownRadialRing: React.FC<CooldownRadialRingProps> = ({
  cooldown,
  size = 54,
  strokeWidth = 4,
  showLabel = true,
  className = "",
}) => {
  const [now, setNow] = useState<number>(Date.now());

  // Real-time 1-second ticker to ensure smooth fill/depletion and no jank
  useEffect(() => {
    if (!cooldown.isActive || !cooldown.expiresAt) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown.isActive, cooldown.expiresAt]);

  const totalSeconds = (cooldown.durationMinutes || 30) * 60;
  
  let remainingSeconds = cooldown.remainingSeconds;
  if (cooldown.isActive && cooldown.expiresAt) {
    remainingSeconds = Math.max(0, Math.ceil((cooldown.expiresAt - now) / 1000));
  }

  const isActuallyActive = cooldown.isActive && remainingSeconds > 0;

  // Fraction: 1.0 (cooldown just started) -> 0.0 (cooldown finished/ready)
  const fraction = isActuallyActive ? Math.max(0, Math.min(1, remainingSeconds / totalSeconds)) : 0;

  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  // Full circle = fraction 1 (offset 0), Empty = fraction 0 (offset circumference)
  const strokeDashoffset = circumference * (1 - fraction);

  // Format remaining time MM:SS
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const timeText = `${mins}:${secs < 10 ? "0" : ""}${secs}`;

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90 overflow-visible"
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <linearGradient id="cooldownActiveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
          <linearGradient id="cooldownReadyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
          <filter id="cooldownReadyGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isActuallyActive ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)"}
          strokeWidth={strokeWidth}
        />

        {/* Active Cooldown Progress Ring (depletes smoothly as time passes) */}
        {isActuallyActive ? (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#cooldownActiveGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.95s linear",
              filter: "drop-shadow(0 0 3px rgba(245, 158, 11, 0.5))",
            }}
          />
        ) : (
          /* Ready Ring with subtle emerald glow */
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#cooldownReadyGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={0}
            style={{
              filter: "drop-shadow(0 0 4px rgba(16, 185, 129, 0.6))",
            }}
          />
        )}
      </svg>

      {/* Center Text Display */}
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center font-mono pointer-events-none">
          {isActuallyActive ? (
            <span
              className="font-bold text-amber-300 tracking-tighter leading-none"
              style={{ fontSize: size <= 48 ? "9px" : size <= 64 ? "11px" : "13px" }}
            >
              {timeText}
            </span>
          ) : (
            <span
              className="font-extrabold text-emerald-400 tracking-wider leading-none uppercase"
              style={{ fontSize: size <= 48 ? "8px" : size <= 64 ? "9px" : "11px" }}
            >
              READY
            </span>
          )}
        </div>
      )}
    </div>
  );
};

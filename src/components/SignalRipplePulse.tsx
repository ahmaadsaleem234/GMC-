import React, { useEffect, useState, useRef } from "react";

interface SignalRipplePulseProps {
  triggerKey?: any; // Changes when a new event occurs (e.g., setupId or latest event timestamp)
  active?: boolean; // Or boolean flag
  accentColor?: "emerald" | "amber" | "cyan" | "purple" | "orange";
  className?: string;
}

export const SignalRipplePulse: React.FC<SignalRipplePulseProps> = ({
  triggerKey,
  active = false,
  accentColor = "emerald",
  className = "",
}) => {
  const [isRippling, setIsRippling] = useState<boolean>(false);
  const prevTriggerRef = useRef<any>(triggerKey);
  const prevActiveRef = useRef<boolean>(active);

  const colorConfig = {
    emerald: {
      borderRing: "rgba(16, 185, 129, 0.8)",
      glowColor: "rgba(16, 185, 129, 0.5)",
    },
    amber: {
      borderRing: "rgba(245, 158, 11, 0.85)",
      glowColor: "rgba(245, 158, 11, 0.5)",
    },
    cyan: {
      borderRing: "rgba(6, 182, 212, 0.85)",
      glowColor: "rgba(6, 182, 212, 0.5)",
    },
    purple: {
      borderRing: "rgba(168, 85, 247, 0.85)",
      glowColor: "rgba(168, 85, 247, 0.5)",
    },
    orange: {
      borderRing: "rgba(249, 115, 22, 0.85)",
      glowColor: "rgba(249, 115, 22, 0.5)",
    },
  };

  const currentTheme = colorConfig[accentColor] || colorConfig.emerald;

  useEffect(() => {
    // When triggerKey changes and is truthy, or when active flips from false to true:
    const isNewTrigger =
      triggerKey &&
      prevTriggerRef.current !== undefined &&
      prevTriggerRef.current !== triggerKey;
    const isBecameActive = !prevActiveRef.current && active;

    if (isNewTrigger || isBecameActive) {
      setIsRippling(true);
      const timer = setTimeout(() => {
        setIsRippling(false);
      }, 1400);
      return () => clearTimeout(timer);
    }

    prevTriggerRef.current = triggerKey;
    prevActiveRef.current = active;
  }, [triggerKey, active]);

  if (!isRippling) return null;

  return (
    <div className={`absolute inset-0 pointer-events-none rounded-[inherit] overflow-visible z-30 ${className}`}>
      {/* 1. Border Expanding Ripple (Card boundary) */}
      <div
        className="absolute inset-0 rounded-[inherit] pointer-events-none"
        style={{
          border: `2px solid ${currentTheme.borderRing}`,
          animation: "cardBorderRipple 1.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          boxShadow: `0 0 20px ${currentTheme.glowColor}`,
        }}
      />

      {/* 2. Secondary Soft Dissolving Outer Wave */}
      <div
        className="absolute -inset-1 rounded-[inherit] pointer-events-none opacity-60"
        style={{
          border: `1.5px solid ${currentTheme.borderRing}`,
          animation: "cardOuterWave 1.4s cubic-bezier(0.1, 0.9, 0.2, 1) forwards",
        }}
      />

      {/* 3. Origin Point Corner Flare */}
      <div
        className="absolute -top-1 -right-1 w-6 h-6 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${currentTheme.borderRing} 0%, transparent 80%)`,
          animation: "originFlare 1.2s ease-out forwards",
        }}
      />
    </div>
  );
};

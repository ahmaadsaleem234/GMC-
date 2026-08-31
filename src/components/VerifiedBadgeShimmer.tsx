import React, { useState, useEffect, useRef } from "react";

interface VerifiedBadgeShimmerProps {
  children: React.ReactNode;
  isVerified: boolean;
  triggerKey?: any;
  className?: string;
  shimmerColor?: "gold-white" | "emerald-white";
}

export const VerifiedBadgeShimmer: React.FC<VerifiedBadgeShimmerProps> = ({
  children,
  isVerified,
  triggerKey,
  className = "",
  shimmerColor = "gold-white",
}) => {
  const [isShimmering, setIsShimmering] = useState<boolean>(false);
  const prevTriggerRef = useRef<any>(triggerKey);
  const prevVerifiedRef = useRef<boolean>(isVerified);

  useEffect(() => {
    // Trigger shimmer once when verified is true on mount or whenever isVerified / triggerKey changes
    if (isVerified && (!prevVerifiedRef.current || prevTriggerRef.current !== triggerKey)) {
      setIsShimmering(true);
      const timer = setTimeout(() => {
        setIsShimmering(false);
      }, 1300);
      return () => clearTimeout(timer);
    }
    prevVerifiedRef.current = isVerified;
    prevTriggerRef.current = triggerKey;
  }, [isVerified, triggerKey]);

  // Initial trigger on mount if already verified
  useEffect(() => {
    if (isVerified) {
      setIsShimmering(true);
      const timer = setTimeout(() => {
        setIsShimmering(false);
      }, 1300);
      return () => clearTimeout(timer);
    }
  }, []);

  const gradientStyle =
    shimmerColor === "gold-white"
      ? "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.7) 45%, rgba(245, 204, 107, 0.85) 60%, transparent 100%)"
      : "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.7) 45%, rgba(52, 211, 153, 0.85) 60%, transparent 100%)";

  return (
    <div className={`relative inline-flex items-center overflow-hidden rounded-[inherit] ${className}`}>
      {children}

      {/* Shimmer sweep overlay (plays once, then goes idle) */}
      {isShimmering && (
        <div
          className="absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden z-20"
          style={{ mixBlendMode: "screen" }}
        >
          <div
            className="w-full h-full transform"
            style={{
              background: gradientStyle,
              animation: "verifiedBadgeSweep 1.25s cubic-bezier(0.25, 1, 0.5, 1) forwards",
              filter: "drop-shadow(0 0 4px rgba(255, 255, 255, 0.6))",
            }}
          />
        </div>
      )}
    </div>
  );
};

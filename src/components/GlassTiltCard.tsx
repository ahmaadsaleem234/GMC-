import React, { useRef, useState, useCallback, useEffect } from "react";

export interface GlassTiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // Maximum tilt angle in degrees (6-8 deg, default: 7)
  perspective?: number; // Perspective in px (default: 600)
  glowColor?: string; // Optional glow accent color
  isActiveWinner?: boolean; // Highlight active winner card
  isSiblingDimmed?: boolean; // Sibling dim/blur depth effect (2-4px blur, opacity ~0.7)
  liftScale?: number; // Scale factor when lifting
  noTilt?: boolean;
}

export const GlassTiltCard: React.FC<GlassTiltCardProps> = ({
  children,
  className = "",
  maxTilt = 7,
  perspective = 600,
  glowColor,
  isActiveWinner = false,
  isSiblingDimmed = false,
  liftScale = 1.015,
  noTilt = false,
  style,
  onPointerMove,
  onPointerEnter,
  onPointerLeave,
  onTouchStart,
  onTouchEnd,
  onTouchCancel,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });

  const calculateTilt = useCallback(
    (clientX: number, clientY: number) => {
      if (!cardRef.current || noTilt) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const clampedX = Math.max(0, Math.min(rect.width, x));
      const clampedY = Math.max(0, Math.min(rect.height, y));

      const normX = (clampedX / rect.width) * 2 - 1; // -1 to 1
      const normY = (clampedY / rect.height) * 2 - 1; // -1 to 1

      // Tilt angles: moving pointer down tilts top forward, moving right tilts right away
      const rotX = -normY * maxTilt;
      const rotY = normX * maxTilt;

      setTilt({ x: rotX, y: rotY });
      setGlarePos({
        x: (clampedX / rect.width) * 100,
        y: (clampedY / rect.height) * 100,
      });
    },
    [maxTilt, noTilt]
  );

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    calculateTilt(e.clientX, e.clientY);
    if (!isInteracting) setIsInteracting(true);
    if (onPointerMove) onPointerMove(e);
  };

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsInteracting(true);
    calculateTilt(e.clientX, e.clientY);
    if (onPointerEnter) onPointerEnter(e);
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsInteracting(false);
    setTilt({ x: 0, y: 0 });
    if (onPointerLeave) onPointerLeave(e);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      setIsInteracting(true);
      calculateTilt(e.touches[0].clientX, e.touches[0].clientY);
    }
    if (onTouchStart) onTouchStart(e);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      calculateTilt(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsInteracting(false);
    setTilt({ x: 0, y: 0 });
    if (onTouchEnd) onTouchEnd(e);
  };

  const handleTouchCancel = (e: React.TouchEvent<HTMLDivElement>) => {
    setIsInteracting(false);
    setTilt({ x: 0, y: 0 });
    if (onTouchCancel) onTouchCancel(e);
  };

  // Dynamic 3D transform
  const transformStyle = isInteracting && !noTilt
    ? `perspective(${perspective}px) rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg) scale3d(${liftScale}, ${liftScale}, 1.01)`
    : `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;

  // Soft diffused drop shadow for depth + lifting on press
  const shadowStyle = isInteracting
    ? glowColor
      ? `0 24px 44px -8px rgba(0, 0, 0, 0.8), 0 0 26px ${glowColor}`
      : "0 22px 42px -8px rgba(0, 0, 0, 0.85), 0 0 18px rgba(255, 255, 255, 0.09)"
    : isActiveWinner
    ? "0 16px 36px -6px rgba(245, 158, 11, 0.35), 0 0 24px rgba(245, 158, 11, 0.22)"
    : "0 12px 32px -5px rgba(0, 0, 0, 0.58), 0 1px 3px rgba(255, 255, 255, 0.04)";

  // Depth-blur focus effect: when active winner is in view, siblings get 2.5px blur and ~0.7 opacity
  const depthBlurFilter = isSiblingDimmed && !isInteracting
    ? "blur(2.5px) brightness(0.85)"
    : isInteracting
    ? "brightness(1.06)"
    : "none";

  const depthOpacity = isSiblingDimmed && !isInteracting ? 0.7 : 1;

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      className={`glass-tilt-card relative transition-all ${className}`}
      style={{
        transform: transformStyle,
        boxShadow: shadowStyle,
        filter: depthBlurFilter,
        opacity: depthOpacity,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        transition: isInteracting
          ? "transform 80ms ease-out, box-shadow 80ms ease-out, filter 150ms ease-out, opacity 180ms ease-out"
          : "transform 180ms ease-out, box-shadow 180ms ease-out, filter 180ms ease-out, opacity 180ms ease-out",
        willChange: isInteracting ? "transform, box-shadow" : "auto",
        transformStyle: "preserve-3d",
        ...style,
      }}
      {...props}
    >
      {/* Specular glare overlay for 3D realism */}
      {isInteracting && !noTilt && (
        <div
          className="absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden transition-opacity duration-150"
          style={{
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.08) 0%, transparent 65%)`,
          }}
        />
      )}

      {children}
    </div>
  );
};

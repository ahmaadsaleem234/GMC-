import React from "react";

interface TactileToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  id?: string;
  accentColor?: "emerald" | "purple" | "orange" | "amber" | "cyan";
  onLabel?: string;
  offLabel?: string;
  disabled?: boolean;
  className?: string;
  title?: string;
}

export const TactileToggleSwitch: React.FC<TactileToggleSwitchProps> = ({
  checked,
  onChange,
  id,
  accentColor = "emerald",
  onLabel = "ON",
  offLabel = "OFF",
  disabled = false,
  className = "",
  title,
}) => {
  // Color configuration
  const colorMap = {
    emerald: {
      activeBg: "bg-emerald-500/25 border-emerald-400/50 text-emerald-300",
      activeThumb: "bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.9)]",
      activeGlowTrail: "rgba(16, 185, 129, 0.4)",
      activeRing: "active:ring-emerald-400/50",
    },
    purple: {
      activeBg: "bg-purple-500/25 border-purple-400/50 text-purple-300",
      activeThumb: "bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.9)]",
      activeGlowTrail: "rgba(168, 85, 247, 0.4)",
      activeRing: "active:ring-purple-400/50",
    },
    orange: {
      activeBg: "bg-orange-500/25 border-orange-400/50 text-orange-300",
      activeThumb: "bg-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.9)]",
      activeGlowTrail: "rgba(249, 115, 22, 0.4)",
      activeRing: "active:ring-orange-400/50",
    },
    amber: {
      activeBg: "bg-amber-500/25 border-amber-400/50 text-amber-300",
      activeThumb: "bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.9)]",
      activeGlowTrail: "rgba(245, 158, 11, 0.4)",
      activeRing: "active:ring-amber-400/50",
    },
    cyan: {
      activeBg: "bg-cyan-500/25 border-cyan-400/50 text-cyan-300",
      activeThumb: "bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.9)]",
      activeGlowTrail: "rgba(6, 182, 212, 0.4)",
      activeRing: "active:ring-cyan-400/50",
    },
  };

  const currentTheme = colorMap[accentColor] || colorMap.emerald;

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={`relative inline-flex items-center justify-between w-14 h-7 px-1 rounded-full border transition-all duration-150 ease-out cursor-pointer select-none outline-none active:scale-[0.94] ${
        checked
          ? `${currentTheme.activeBg} shadow-[inset_0_1px_3px_rgba(0,0,0,0.5),0_0_12px_${currentTheme.activeGlowTrail}]`
          : "bg-slate-900/90 border-slate-700/80 text-slate-400 hover:border-slate-600 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""} ${className}`}
    >
      {/* Background Directional Glow Trail */}
      <span
        className={`absolute inset-0 rounded-full transition-opacity duration-200 pointer-events-none ${
          checked ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: `radial-gradient(ellipse at ${checked ? "70%" : "30%"} 50%, ${
            currentTheme.activeGlowTrail
          } 0%, transparent 70%)`,
        }}
      />

      {/* Label Text Behind Thumb */}
      <span
        className={`text-[9px] font-mono font-black uppercase transition-all duration-150 z-0 pl-1 ${
          checked ? "opacity-100 text-white translate-x-0" : "opacity-0 -translate-x-1"
        }`}
      >
        {onLabel}
      </span>

      <span
        className={`text-[9px] font-mono font-bold uppercase transition-all duration-150 z-0 pr-1 ml-auto ${
          !checked ? "opacity-100 text-slate-400 translate-x-0" : "opacity-0 translate-x-1"
        }`}
      >
        {offLabel}
      </span>

      {/* Tactile Sliding Thumb */}
      <span
        className={`absolute top-1 w-5 h-5 rounded-full transition-transform duration-200 cubic-bezier(0.34, 1.56, 0.64, 1) flex items-center justify-center z-10 ${
          checked
            ? `translate-x-7 ${currentTheme.activeThumb}`
            : "translate-x-0 bg-slate-400/90 shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
        }`}
      >
        {/* Subtle center tactile pip */}
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            checked ? "bg-slate-950/70" : "bg-slate-800/80"
          }`}
        />
      </span>
    </button>
  );
};

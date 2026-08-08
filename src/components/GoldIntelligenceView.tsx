import React, { useState, useMemo } from "react";
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Clock,
  Send,
  AlertTriangle,
  Globe,
  Calendar,
  BarChart2,
  Compass,
  Database,
  Sliders,
  Layers,
  Activity,
  Award,
  FileText,
} from "lucide-react";
import {
  generateHaramiSingleSetup,
  TimezoneMode,
  formatEventTime,
  HaramiSingleSetup,
} from "../services/goldIntelligenceService";

import { OneFinalSetupCard } from "./goldIntelligence/OneFinalSetupCard";
import { NewsCommandCenter } from "./goldIntelligence/NewsCommandCenter";
import { Intelligence25YView } from "./goldIntelligence/Intelligence25YView";
import { FutureOutlookView } from "./goldIntelligence/FutureOutlookView";
import { SignalHistoryView } from "./goldIntelligence/SignalHistoryView";
import { SourceHealthView } from "./goldIntelligence/SourceHealthView";
import { EventReactionLabView } from "./goldIntelligence/EventReactionLabView";
import { DriverMatrixView } from "./goldIntelligence/DriverMatrixView";

interface GoldIntelligenceViewProps {
  currentPrice: number;
  assetKey?: string;
  prices?: Record<string, any>;
  onOpenTradeCopilot?: (assetKey?: string, type?: "BUY" | "SELL") => void;
}

export const GoldIntelligenceView: React.FC<GoldIntelligenceViewProps> = ({
  currentPrice,
  onOpenTradeCopilot,
}) => {
  // Navigation Tabs for Gold Intelligence Engine
  const [activeTab, setActiveTab] = useState<
    | "ONE_SETUP"
    | "NEWS_COMMAND"
    | "FUTURE_OUTLOOK"
    | "HISTORICAL_25Y"
    | "SIGNAL_HISTORY"
    | "SOURCE_HEALTH"
    | "REACTION_LAB"
    | "DRIVER_MATRIX"
  >("ONE_SETUP");

  // Timezone selector state (Dubai GST default)
  const [timezoneMode, setTimezoneMode] = useState<TimezoneMode>("DUBAI");

  // Single Setup Generator calculation
  const singleSetup: HaramiSingleSetup = useMemo(
    () => generateHaramiSingleSetup(currentPrice),
    [currentPrice]
  );

  return (
    <div className="space-y-6 selection:bg-amber-500 selection:text-black">
      {/* 🌟 Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#070A10] via-[#101726] to-[#070A10] border border-[#D4AF37]/40 p-6 md:p-8 shadow-[0_0_50px_rgba(212,175,55,0.15)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-[0_0_12px_rgba(234,179,8,0.3)]">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                HARAMI AI — 25-YEAR GOLD NEWS ENGINE
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
                FOREX.com Realtime Spot Feed
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Gold Intelligence <span className="text-[#D4AF37]">(XAUUSD)</span>
            </h1>

            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed font-mono">
              High-impact Gold news-trade system powered by 25 years of historical data (2001–2026), 4 independent data sources, Dubai GST timezone integration, and strict single-setup execution gating.
            </p>
          </div>

          {/* Live Price Box */}
          <div className="flex flex-col items-start md:items-end gap-1.5 bg-[#05080E]/90 backdrop-blur-md p-4 rounded-2xl border border-[#D4AF37]/30 min-w-[220px]">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Spot Gold Rate</span>
            <div className="text-3xl font-mono font-black text-amber-300 drop-shadow-[0_0_12px_rgba(212,175,55,0.4)]">
              ${currentPrice.toFixed(2)}
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-300">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Realtime Feed</span>
              <span className="text-slate-500">•</span>
              <span className="text-amber-400">ATR: $28.40</span>
            </div>
          </div>
        </div>
      </div>

      {/* 📌 Main Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800 font-mono text-xs">
        {[
          { id: "ONE_SETUP", label: "🎯 One Final Setup", icon: Zap },
          { id: "NEWS_COMMAND", label: "⚡ News Command Center", icon: Globe },
          { id: "FUTURE_OUTLOOK", label: "🔮 Future Gold Outlook", icon: Compass },
          { id: "HISTORICAL_25Y", label: "📊 25-Year Intelligence", icon: BarChart2 },
          { id: "SIGNAL_HISTORY", label: "📜 Signal Audit History", icon: Award },
          { id: "SOURCE_HEALTH", label: "🛡️ 4-Source Data Health", icon: Database },
          { id: "REACTION_LAB", label: "🧪 Event Reaction Lab", icon: Activity },
          { id: "DRIVER_MATRIX", label: "⚖️ Macro Driver Matrix", icon: Layers },
        ].map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-[#D4AF37] text-black shadow-[0_0_18px_rgba(212,175,55,0.4)] font-black scale-102"
                  : "bg-[#090E17] hover:bg-[#121A28] text-slate-300 border border-slate-800 hover:border-[#D4AF37]/40"
              }`}
            >
              <IconComponent className={`w-3.5 h-3.5 ${isActive ? "text-black" : "text-amber-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Render Active View */}
      {activeTab === "ONE_SETUP" && (
        <OneFinalSetupCard
          setup={singleSetup}
          currentPrice={currentPrice}
          timezoneMode={timezoneMode}
          setTimezoneMode={setTimezoneMode}
          onExecuteTrade={(type) => {
            if (onOpenTradeCopilot) onOpenTradeCopilot("XAUUSD", type);
          }}
        />
      )}

      {activeTab === "NEWS_COMMAND" && (
        <NewsCommandCenter
          currentPrice={currentPrice}
          timezoneMode={timezoneMode}
          setTimezoneMode={setTimezoneMode}
        />
      )}

      {activeTab === "FUTURE_OUTLOOK" && (
        <FutureOutlookView
          currentPrice={currentPrice}
          timezoneMode={timezoneMode}
        />
      )}

      {activeTab === "HISTORICAL_25Y" && <Intelligence25YView />}

      {activeTab === "SIGNAL_HISTORY" && (
        <SignalHistoryView timezoneMode={timezoneMode} />
      )}

      {activeTab === "SOURCE_HEALTH" && (
        <SourceHealthView timezoneMode={timezoneMode} />
      )}

      {activeTab === "REACTION_LAB" && <EventReactionLabView />}

      {activeTab === "DRIVER_MATRIX" && <DriverMatrixView />}
    </div>
  );
};

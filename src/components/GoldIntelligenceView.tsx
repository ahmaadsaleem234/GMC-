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
import { ServerEngineStatusPanel } from "./ServerEngineStatusPanel";
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
      <div className="relative overflow-hidden rounded-2xl bg-[#080A0D] border border-[#292E35] p-5 md:p-6 shadow-none">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded bg-[rgba(241,204,107,0.08)] border border-[rgba(241,204,107,0.3)] text-[#F1CC6B] text-xs font-mono font-semibold tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F1CC6B]" />
                HARAMI AI — 25-YEAR GOLD NEWS ENGINE
              </span>
              <span className="px-3 py-1 rounded bg-[#101318] border border-[#2C3239] text-[#74D8A0] text-xs font-mono font-medium">
                Realtime Spot Feed
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Gold Intelligence <span className="text-[#F1CC6B]">(XAUUSD)</span>
            </h1>

            <p className="text-xs text-[#9299A3] max-w-3xl leading-relaxed font-mono">
              High-impact Gold news-trade system powered by 25 years of historical data (2001–2026), 4 independent data sources, Dubai GST timezone integration, and strict single-setup execution gating.
            </p>
          </div>

          {/* Live Price Box */}
          <div className="flex flex-col items-start md:items-end gap-1 bg-[#111419] p-4 rounded-xl border border-[#292E35] min-w-[220px]">
            <span className="text-[11px] font-mono text-[#9299A3] uppercase tracking-wider">Spot Gold Rate</span>
            <div className="text-2xl font-mono font-bold text-[#F1CC6B]">
              ${currentPrice.toFixed(2)}
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-[#9299A3]">
              <span className="inline-block w-2 h-2 rounded-full bg-[#74D8A0]" />
              <span>Realtime Feed</span>
              <span className="text-[#646C77]">•</span>
              <span className="text-[#F1CC6B]">ATR: $28.40</span>
            </div>
          </div>
        </div>
      </div>

      {/* 24/7 Autonomous Backend Engine Telemetry */}
      <ServerEngineStatusPanel />

      {/* 📌 Main Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#272C32] font-mono text-xs">
        {[
          { id: "ONE_SETUP", label: "One Final Setup", icon: Zap },
          { id: "NEWS_COMMAND", label: "News Command Center", icon: Globe },
          { id: "FUTURE_OUTLOOK", label: "Future Gold Outlook", icon: Compass },
          { id: "HISTORICAL_25Y", label: "25-Year Intelligence", icon: BarChart2 },
          { id: "SIGNAL_HISTORY", label: "Signal Audit History", icon: Award },
          { id: "SOURCE_HEALTH", label: "4-Source Data Health", icon: Database },
          { id: "REACTION_LAB", label: "Event Reaction Lab", icon: Activity },
          { id: "DRIVER_MATRIX", label: "Macro Driver Matrix", icon: Layers },
        ].map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "pill-filter-active"
                  : "pill-filter-inactive"
              }`}
            >
              <IconComponent className={`w-3.5 h-3.5 ${isActive ? "text-[#111111]" : "text-[#F1CC6B]"}`} />
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

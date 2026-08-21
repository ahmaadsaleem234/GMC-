import React, { useState, useMemo, useEffect } from "react";
import {
  LayoutGrid,
  Search,
  Filter,
  Sliders,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ExternalLink,
  Settings,
  Star,
  StarOff,
  Shield,
  Zap,
  Activity,
  Layers,
  Cpu,
  RefreshCw,
  Terminal,
  Radio,
  Share2,
  Info,
  ChevronRight,
  X,
  Flame,
  Crown,
  BookOpen,
  Trophy,
  BarChart3,
  SlidersHorizontal,
  Check,
  Power,
  PlayCircle,
  HelpCircle,
} from "lucide-react";
import { MODULE_REGISTRY, ModuleRegistryItem } from "../utils/moduleRegistry";
import { LivePrice } from "../types";

export interface ModuleRegistryViewProps {
  onSelectTab: (tabId: string) => void;
  activeTab?: string;
  prices?: Record<string, LivePrice>;
  currentPrice?: number;
  latencyMs?: number;
}

// Extended metadata map for deep module details and dependencies
interface ModuleMetadata {
  timeframes: string[];
  dependencies: string[];
  riskTier: "Conservative" | "Moderate" | "Aggressive" | "Dynamic";
  dataFeeds: string[];
  telegramSupport: boolean;
  aiEngineVersion: string;
  executionMode: "Autonomous" | "Semi-Auto Copilot" | "Analytical Advisory";
  useCase: string;
}

const EXTENDED_MODULE_METADATA: Record<string, Partial<ModuleMetadata>> = {
  central_signal_manager: {
    timeframes: ["15M", "5M", "1M"],
    dependencies: ["Multi-Brain Consensus Engine", "Single Active State Lock", "Telegram Dispatcher", "35m Cooldown Timer"],
    riskTier: "Conservative",
    dataFeeds: ["Live XAUUSD Ticks", "15M/5M Candlesticks", "Live Bid/Ask Spread"],
    telegramSupport: true,
    aiEngineVersion: "GMC Apex Orchestrator v4.2",
    executionMode: "Semi-Auto Copilot",
    useCase: "Strict 1-Active Telegram setup rule coordinator. Prioritizes best setup among Harami, Khatarnak, and War Room.",
  },
  khatarnak_jugaad: {
    timeframes: ["15M", "5M", "1M"],
    dependencies: ["HH/HL Market Structure Detector", "Fib 0.62 / 0.81 Golden Box Scanner", "Momentum Wick Engine", "$1 SL Protection"],
    riskTier: "Aggressive",
    dataFeeds: ["Live 5M/15M Price Action", "Real-Time Swing High/Low Feed"],
    telegramSupport: true,
    aiEngineVersion: "Khatarnak Fib 2.6 Sniper",
    executionMode: "Semi-Auto Copilot",
    useCase: "Custom Fibonacci precision swing sniper. Independent market structure detection with 1.38/1.65/2.0/2.2 TPs.",
  },
  warroom: {
    timeframes: ["4H", "1H", "15M", "5M", "1M"],
    dependencies: ["Bull AI Agent", "Bear AI Agent", "Risk Arbiter AI", "4H Macro POI Scanner", "1M Trigger Matrix"],
    riskTier: "Conservative",
    dataFeeds: ["4H/1H/15M/5M/1M Multi-Timeframe Candles", "Order Flow Absorption"],
    telegramSupport: true,
    aiEngineVersion: "Triple AI Consensus Council v3.0",
    executionMode: "Semi-Auto Copilot",
    useCase: "Supreme institutional trading command center. Resolves conflict between Bull and Bear models with strict SL validation.",
  },
  gmctrading: {
    timeframes: ["1M", "5M", "15M", "1H", "4H", "1D"],
    dependencies: ["SMC Key Zones Matrix", "Confirmation Ladder", "Discipline Gatekeeper", "Rejection Scanner"],
    riskTier: "Moderate",
    dataFeeds: ["Full MTF Matrix", "Volume Profile POC"],
    telegramSupport: true,
    aiEngineVersion: "GMC Matrix Apex v2.4",
    executionMode: "Semi-Auto Copilot",
    useCase: "Multi-Timeframe rejection engine scanning key institutional supply & demand zones.",
  },
  tradeexecutionmap: {
    timeframes: ["4H", "1H", "15M", "5M", "1M"],
    dependencies: ["Hierarchical Timeframe Mapper", "Smart POI Refinement", "1M Execution Gate"],
    riskTier: "Moderate",
    dataFeeds: ["4H Macro", "1H Trend", "15M Liquidity", "5M Structure", "1M Trigger"],
    telegramSupport: true,
    aiEngineVersion: "Smart Execution Mapper v1.8",
    executionMode: "Semi-Auto Copilot",
    useCase: "Visual 5-step hierarchical map showing exact path from 4H macro bias to 1M entry trigger.",
  },
  gmcgold: {
    timeframes: ["15M", "1H", "4H"],
    dependencies: ["Apex Bank Zone Matrix", "Institutional Order Block Detector", "Heatmap Overlay Engine"],
    riskTier: "Moderate",
    dataFeeds: ["XAUUSD Real-Time Tick Stream", "Bank Liquidity Pools"],
    telegramSupport: true,
    aiEngineVersion: "Apex Bank-Zone Core v3.1",
    executionMode: "Semi-Auto Copilot",
    useCase: "Top #1 Apex bank zone liquidity matrix, institutional order blocks, and key liquidity pools for Gold.",
  },
  d3heatmap: {
    timeframes: ["Real-Time DOM", "1M", "5M"],
    dependencies: ["D3.js Thermal Physics Engine", "Order Book Cluster Aggregator", "BSL/SSL Pool Scanner"],
    riskTier: "Dynamic",
    dataFeeds: ["Level-2 Depth of Market", "Liquidity Cluster Feed"],
    telegramSupport: false,
    aiEngineVersion: "D3 Quantum Heatmap Visualizer",
    executionMode: "Analytical Advisory",
    useCase: "Interactive thermal liquidity visualization of pending institutional limit orders and stop clusters.",
  },
  orderflow: {
    timeframes: ["1M", "5M", "15M"],
    dependencies: ["Volume Profile Calculator", "CVD Delta Accumulator", "POC/VAH/VAL Engine"],
    riskTier: "Moderate",
    dataFeeds: ["Tick Volume & Aggressor Trades Feed", "Cumulative Volume Delta"],
    telegramSupport: false,
    aiEngineVersion: "OrderFlow POC/CVD Engine v2.0",
    executionMode: "Analytical Advisory",
    useCase: "Institutional volume profile with Point of Control (POC), Value Area (VAH/VAL), and delta absorption.",
  },
  harami: {
    timeframes: ["15M"],
    dependencies: ["M15 Harami Pattern Recognizer", "Neural Rejection Radar", "99.1% Win-Rate Validation Matrix"],
    riskTier: "Conservative",
    dataFeeds: ["15M Real-Time Candlestick Feed", "Institutional Volume Spikes"],
    telegramSupport: true,
    aiEngineVersion: "Harami Neural Network v5.0",
    executionMode: "Semi-Auto Copilot",
    useCase: "M15 order block reversal rejection neural radar with high precision entries.",
  },
  goldintelligence: {
    timeframes: ["Daily", "Weekly", "Seasonal 25-Yr"],
    dependencies: ["25-Year Gold Seasonality Database", "Macro News Correlation Matrix", "Scenario Planner"],
    riskTier: "Conservative",
    dataFeeds: ["Historical Gold Spot Rates (2000-2025)", "Fed Rate / CPI / NFP Calendar"],
    telegramSupport: false,
    aiEngineVersion: "Gold Historical Forecast Engine v2.8",
    executionMode: "Analytical Advisory",
    useCase: "25-year Gold seasonality research, macro forecast scenarios, and historical statistical edge.",
  },
};

export const ModuleRegistryView: React.FC<ModuleRegistryViewProps> = ({
  onSelectTab,
  activeTab = "vault",
  prices = {},
  currentPrice = 4402.5,
  latencyMs = 12,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"priority" | "name" | "category" | "status">("priority");
  const [selectedModuleForDetails, setSelectedModuleForDetails] = useState<ModuleRegistryItem | null>(null);

  // User preferences persisted in localStorage
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("gmc_module_favorites");
      return saved ? JSON.parse(saved) : { central_signal_manager: true, khatarnak_jugaad: true, warroom: true, gmctrading: true, tradeexecutionmap: true, gmcgold: true };
    } catch {
      return { central_signal_manager: true, khatarnak_jugaad: true, warroom: true, gmctrading: true };
    }
  });

  const [disabledModules, setDisabledModules] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("gmc_module_disabled");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("gmc_module_favorites", JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem("gmc_module_disabled", JSON.stringify(disabledModules));
    } catch (e) {
      console.error(e);
    }
  }, [disabledModules]);

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleModuleStatus = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDisabledModules((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Categories list extracted cleanly
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    MODULE_REGISTRY.forEach((m) => set.add(m.category));
    return ["ALL", ...Array.from(set)];
  }, []);

  // Filter and sort items
  const processedModules = useMemo(() => {
    return MODULE_REGISTRY.filter((module) => {
      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        module.label.toLowerCase().includes(q) ||
        module.desc.toLowerCase().includes(q) ||
        module.category.toLowerCase().includes(q) ||
        module.tag.toLowerCase().includes(q) ||
        module.id.toLowerCase().includes(q);

      // Category filter
      const matchesCategory = selectedCategory === "ALL" || module.category === selectedCategory;

      // Status filter
      let matchesStatus = true;
      const isFav = !!favorites[module.id];
      const isEnabled = !disabledModules[module.id];
      const isActive = activeTab === module.id;

      if (selectedStatusFilter === "FAVORITES") matchesStatus = isFav;
      if (selectedStatusFilter === "ACTIVE") matchesStatus = isActive;
      if (selectedStatusFilter === "ENABLED") matchesStatus = isEnabled;
      if (selectedStatusFilter === "DISABLED") matchesStatus = !isEnabled;

      return matchesSearch && matchesCategory && matchesStatus;
    }).sort((a, b) => {
      // Always put favorites slightly higher if sorting by priority
      if (sortBy === "priority") {
        const aFav = favorites[a.id] ? 1 : 0;
        const bFav = favorites[b.id] ? 1 : 0;
        if (aFav !== bFav) return bFav - aFav;
        return 0; // retain registry order
      }
      if (sortBy === "name") {
        return a.label.localeCompare(b.label);
      }
      if (sortBy === "category") {
        return a.category.localeCompare(b.category);
      }
      if (sortBy === "status") {
        const aActive = activeTab === a.id ? 1 : 0;
        const bActive = activeTab === b.id ? 1 : 0;
        return bActive - aActive;
      }
      return 0;
    });
  }, [searchQuery, selectedCategory, selectedStatusFilter, sortBy, favorites, disabledModules, activeTab]);

  const stats = useMemo(() => {
    const total = MODULE_REGISTRY.length;
    const favCount = Object.values(favorites).filter(Boolean).length;
    const disabledCount = Object.values(disabledModules).filter(Boolean).length;
    const activeCount = total - disabledCount;
    const coreCount = MODULE_REGISTRY.filter((m) => m.category === "Core").length;
    const aiCount = MODULE_REGISTRY.filter((m) => m.category === "AI Intelligence").length;
    return { total, favCount, activeCount, coreCount, aiCount };
  }, [favorites, disabledModules]);

  return (
    <div id="gmc-module-registry-view" className="w-full space-y-4 font-sans pb-16 text-slate-100">
      {/* HEADER SECTION: Institutional Mobile-First Command Header */}
      <div className="bg-gradient-to-br from-[#0c0f14] via-[#090b0e] to-[#06080a] border border-[#232932] rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                📋
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                GMC MODULE REGISTRY
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 font-mono font-bold">
                  {stats.total} ENGINES
                </span>
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed max-w-2xl">
              Complete institutional directory of all GMC AI trading algorithms, real-time market data feeds, execution desks, and analytical engines. Fully responsive and mobile-optimized.
            </p>
          </div>

          {/* Quick Metrics Bar on Mobile/Desktop */}
          <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-[#1d232c]">
            <div className="bg-[#12161d] border border-[#232932] rounded-xl px-3 py-2 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Active Engines</span>
              <span className="text-sm sm:text-base font-bold text-emerald-400 font-mono">{stats.activeCount} / {stats.total}</span>
            </div>
            <div className="bg-[#12161d] border border-[#232932] rounded-xl px-3 py-2 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">AI Brains</span>
              <span className="text-sm sm:text-base font-bold text-amber-400 font-mono">{stats.aiCount + stats.coreCount}</span>
            </div>
            <div className="bg-[#12161d] border border-[#232932] rounded-xl px-3 py-2 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Pinned Pinned</span>
              <span className="text-sm sm:text-base font-bold text-cyan-400 font-mono">{stats.favCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH, CATEGORY PILLS & FILTER CONTROLS (TOUCH-OPTIMIZED) */}
      <div className="bg-[#0b0e13] border border-[#232932] rounded-2xl p-3 sm:p-4 space-y-3 shadow-lg">
        {/* Search Bar + Sort Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Live Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="module-registry-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by module name, keyword, tag, or description..."
              className="w-full bg-[#12161d] border border-[#252c38] focus:border-amber-400 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-lg"
                title="Clear Search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Selector Dropdown */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#12161d] border border-[#252c38] rounded-xl px-3 py-2 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] text-slate-400 hidden xs:inline">Sort:</span>
              <select
                id="module-registry-sort-select"
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-transparent text-xs text-white outline-none cursor-pointer font-medium"
              >
                <option value="priority" className="bg-[#0c0f14] text-white">Recommended / Apex Rank</option>
                <option value="name" className="bg-[#0c0f14] text-white">Alphabetical (A-Z)</option>
                <option value="category" className="bg-[#0c0f14] text-white">Category</option>
                <option value="status" className="bg-[#0c0f14] text-white">Active in Session First</option>
              </select>
            </div>

            {/* Status Filter Toggle Pills */}
            <div className="flex items-center gap-1 bg-[#12161d] border border-[#252c38] rounded-xl p-1 shrink-0 overflow-x-auto">
              <button
                onClick={() => setSelectedStatusFilter("ALL")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  selectedStatusFilter === "ALL" ? "bg-amber-400 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedStatusFilter("FAVORITES")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 ${
                  selectedStatusFilter === "FAVORITES" ? "bg-amber-400 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                }`}
                title="Show Pinned/Favorites Only"
              >
                <Star className="w-3 h-3 fill-current" />
                <span className="hidden sm:inline">Pinned</span>
              </button>
              <button
                onClick={() => setSelectedStatusFilter("ACTIVE")}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  selectedStatusFilter === "ACTIVE" ? "bg-amber-400 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                }`}
                title="Show currently loaded module"
              >
                Active
              </button>
            </div>
          </div>
        </div>

        {/* Category Scrollable Filter Pills (Touch friendly, no horizontal overflow) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
          {allCategories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = cat === "ALL" ? MODULE_REGISTRY.length : MODULE_REGISTRY.filter((m) => m.category === cat).length;
            return (
              <button
                key={cat}
                id={`module-cat-btn-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all border whitespace-nowrap cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? "bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                    : "bg-[#12161d] text-slate-300 border-[#232932] hover:bg-[#181e27] hover:text-white"
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? "bg-slate-950/20 text-slate-950 font-bold" : "bg-[#1a202a] text-slate-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RESULT COUNTER & SUMMARY */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-400 font-mono">
        <span>
          Showing <strong className="text-amber-400">{processedModules.length}</strong> of {MODULE_REGISTRY.length} modules
          {selectedCategory !== "ALL" && ` in ${selectedCategory}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </span>
        {(searchQuery || selectedCategory !== "ALL" || selectedStatusFilter !== "ALL") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("ALL");
              setSelectedStatusFilter("ALL");
            }}
            className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* MODULE CARDS GRID (MOBILE FIRST RESPONSIVE 1 to 3 COLUMNS) */}
      {processedModules.length === 0 ? (
        <div className="p-12 bg-[#0b0e13] border border-[#232932] rounded-2xl text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto text-xl">
            🔍
          </div>
          <h3 className="text-base font-bold text-white">No modules match your current filter</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Try adjusting your search keywords or switching category filters to see all available GMC institutional algorithms.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("ALL");
              setSelectedStatusFilter("ALL");
            }}
            className="px-4 py-2 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-300 transition-all cursor-pointer inline-flex items-center gap-2 shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Show All Modules ({MODULE_REGISTRY.length})
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {processedModules.map((module) => {
            const Icon = module.icon || Zap;
            const isCurrentTab = activeTab === module.id;
            const isFav = !!favorites[module.id];
            const isDisabled = !!disabledModules[module.id];
            const meta = EXTENDED_MODULE_METADATA[module.id];

            return (
              <div
                key={module.id}
                id={`module-card-${module.id}`}
                onClick={() => onSelectTab(module.id)}
                className={`group relative bg-[#0c0f14] hover:bg-[#10141a] border rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-md active:scale-[0.99] ${
                  isCurrentTab
                    ? "border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-400/50"
                    : isDisabled
                    ? "border-[#1d232c] opacity-60"
                    : "border-[#212731] hover:border-amber-500/50 hover:shadow-lg"
                }`}
              >
                {/* Top Section: Icon, Category & Actions */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 transition-transform group-hover:scale-105 ${
                          isCurrentTab
                            ? "bg-amber-400 text-slate-950 font-bold shadow-lg"
                            : "bg-[#141820] text-amber-300 border border-[#28303d]"
                        }`}
                      >
                        {module.emoji || "⚡"}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#161b23] border border-[#252c38] text-slate-400 font-mono font-medium">
                            {module.category}
                          </span>
                          {module.tag && (
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-md font-bold font-mono tracking-tight uppercase ${
                                module.tagColor || "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              }`}
                            >
                              {module.tag}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Star / Pin Button */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => toggleFavorite(module.id, e)}
                        className={`p-2 rounded-xl transition-all ${
                          isFav
                            ? "text-amber-400 bg-amber-500/15 border border-amber-500/30"
                            : "text-slate-500 hover:text-slate-300 hover:bg-[#161b23]"
                        }`}
                        title={isFav ? "Unpin Favorite" : "Pin as Favorite"}
                      >
                        <Star className={`w-4 h-4 ${isFav ? "fill-amber-400" : ""}`} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedModuleForDetails(module);
                        }}
                        className="p-2 text-slate-400 hover:text-white bg-[#141820] hover:bg-[#1a202a] border border-[#252c38] rounded-xl transition-all"
                        title="View Module Details & Dependencies"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors leading-snug line-clamp-2">
                    {module.label}
                  </h3>

                  <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">
                    {module.desc}
                  </p>

                  {/* Quick Meta Pills */}
                  {meta && (
                    <div className="mt-3 flex items-center gap-1.5 flex-wrap text-[10px] text-slate-400 font-mono">
                      {meta.timeframes && meta.timeframes.length > 0 && (
                        <span className="px-2 py-0.5 rounded bg-[#13171f] border border-[#232932] text-slate-300">
                          ⏱️ {meta.timeframes.join(" · ")}
                        </span>
                      )}
                      {meta.telegramSupport && (
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-300">
                          ✈️ TG Synced
                        </span>
                      )}
                      {meta.riskTier && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                          🛡️ {meta.riskTier}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-4 pt-3 border-t border-[#1d232c] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono">
                    {isCurrentTab ? (
                      <span className="flex items-center gap-1 text-amber-300 font-bold">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        ACTIVE NOW
                      </span>
                    ) : isDisabled ? (
                      <span className="flex items-center gap-1 text-slate-500">
                        <XCircle className="w-3.5 h-3.5" />
                        DISABLED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        ONLINE
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id={`launch-module-btn-${module.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTab(module.id);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                        isCurrentTab
                          ? "bg-amber-400 text-slate-950 shadow-md"
                          : "bg-[#141820] text-amber-300 border border-[#2c3545] hover:bg-amber-400 hover:text-slate-950 group-hover:border-amber-400"
                      }`}
                    >
                      <span>{isCurrentTab ? "OPEN" : "LAUNCH"}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODULE DETAILS & DEPENDENCIES MODAL */}
      {selectedModuleForDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 font-sans">
          <div className="relative w-full max-w-2xl bg-[#0a0d12] border border-[#28303d] rounded-2xl p-5 sm:p-7 shadow-2xl text-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[#1d232c] pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-2xl text-amber-300 shrink-0">
                  {selectedModuleForDetails.emoji || "⚡"}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#161b23] border border-[#252c38] text-slate-400 font-mono">
                      {selectedModuleForDetails.category}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 font-mono font-bold">
                      {selectedModuleForDetails.tag}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-white mt-1">
                    {selectedModuleForDetails.label}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setSelectedModuleForDetails(null)}
                className="p-2 text-slate-400 hover:text-white bg-[#12161d] hover:bg-[#181e27] border border-[#232932] rounded-xl transition-all"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block">Overview & Functional Mandate</span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#12161d] p-3.5 rounded-xl border border-[#1d232c]">
                {selectedModuleForDetails.desc}
              </p>
            </div>

            {/* Technical Specifications & Dependencies */}
            {(() => {
              const meta = EXTENDED_MODULE_METADATA[selectedModuleForDetails.id] || {
                timeframes: ["1M", "5M", "15M", "1H", "4H", "1D"],
                dependencies: ["Real-time WebSocket Price Feed", "GMC Core Consensus Engine", "State Machine Syncer"],
                riskTier: "Moderate",
                dataFeeds: ["XAUUSD Spot Feed", "Multi-Timeframe Candlestick Engine"],
                telegramSupport: true,
                aiEngineVersion: "GMC Unified Core v3.5",
                executionMode: "Semi-Auto Copilot",
                useCase: "Institutional market decision analysis and high-probability execution trigger.",
              };

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-[#12161d] border border-[#1d232c] rounded-xl p-3 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">AI Core Architecture</span>
                      <span className="text-xs font-bold text-amber-300">{meta.aiEngineVersion}</span>
                    </div>
                    <div className="bg-[#12161d] border border-[#1d232c] rounded-xl p-3 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Execution Mode</span>
                      <span className="text-xs font-bold text-emerald-400">{meta.executionMode}</span>
                    </div>
                    <div className="bg-[#12161d] border border-[#1d232c] rounded-xl p-3 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Supported Timeframes</span>
                      <span className="text-xs font-mono text-cyan-300">{meta.timeframes?.join(", ")}</span>
                    </div>
                    <div className="bg-[#12161d] border border-[#1d232c] rounded-xl p-3 space-y-1">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Telegram Sync</span>
                      <span className="text-xs font-bold text-blue-400">{meta.telegramSupport ? "✅ Direct Webhook Synchronized" : "ℹ️ Internal Analytics Desk"}</span>
                    </div>
                  </div>

                  {/* Dependencies List */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block">Engine Dependencies & Live Requirements</span>
                    <div className="bg-[#12161d] border border-[#1d232c] rounded-xl p-3 space-y-2">
                      {meta.dependencies?.map((dep, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{dep}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Toggle Enable/Disable in Registry */}
                  <div className="bg-[#12161d] border border-[#1d232c] rounded-xl p-3 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-white block">Engine Status Control</span>
                      <span className="text-[11px] text-slate-400">Toggle whether this engine is actively monitored in your session</span>
                    </div>
                    <button
                      onClick={() => toggleModuleStatus(selectedModuleForDetails.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                        disabledModules[selectedModuleForDetails.id]
                          ? "bg-slate-800 text-slate-400 hover:bg-slate-700"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{disabledModules[selectedModuleForDetails.id] ? "ENABLE" : "ENABLED"}</span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#1d232c]">
              <button
                onClick={(e) => toggleFavorite(selectedModuleForDetails.id, e)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  favorites[selectedModuleForDetails.id]
                    ? "bg-amber-500/20 text-amber-300 border border-amber-400/40"
                    : "bg-[#141820] text-slate-300 border border-[#232932] hover:bg-[#1a202a]"
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${favorites[selectedModuleForDetails.id] ? "fill-amber-400" : ""}`} />
                <span>{favorites[selectedModuleForDetails.id] ? "Pinned to Favorites" : "Pin as Favorite"}</span>
              </button>

              <button
                onClick={() => {
                  onSelectTab(selectedModuleForDetails.id);
                  setSelectedModuleForDetails(null);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black rounded-xl text-xs hover:brightness-110 transition-all flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <PlayCircle className="w-4 h-4" />
                <span>LAUNCH ENGINE NOW</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from "react";
import {
  Activity,
  ShieldAlert,
  Cpu,
  BarChart3,
  Radio,
  Sliders,
  Bell,
  Globe,
  RefreshCw,
  Zap,
  TrendingUp,
  Flame,
  Lock,
  UserCheck,
  Menu,
  X,
  PieChart,
  Search,
  Trophy,
  BookOpen,
  ArrowLeft,
  Home,
  Crown,
  LayoutGrid,
  ChevronRight,
  Filter,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { SUPPORTED_ASSETS } from "../useLiveData";
import { LivePrice } from "../types";
import { MODULE_REGISTRY, ModuleRegistryItem } from "../utils/moduleRegistry";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeAssetKey: string;
  setActiveAssetKey: (key: string) => void;
  prices: Record<string, LivePrice>;
  isConnected: boolean;
  latencyMs: number;
  isLoggedIn: boolean;
  loggedInUser: string | null;
  onOpenLoginModal: () => void;
  onOpenHeatmapOverlay?: () => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
  onOpenMarketDataModal?: () => void;
}

export type NavItem = ModuleRegistryItem;
export const NAV_ITEMS: NavItem[] = MODULE_REGISTRY;

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeAssetKey,
  setActiveAssetKey,
  prices,
  isConnected,
  latencyMs,
  isLoggedIn,
  loggedInUser,
  onOpenLoginModal,
  onOpenHeatmapOverlay,
  onGoBack,
  onGoHome,
  onOpenMarketDataModal,
}) => {
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);
  const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const currentAsset = SUPPORTED_ASSETS.find((a) => a.key === activeAssetKey) || SUPPORTED_ASSETS[0] || {
    key: "XAUUSD",
    label: "Gold / USD Spot",
    short: "XAUUSD",
    basePrice: 4498.1,
    decimals: 2,
    color: "#f6b000",
    category: "metal",
  };

  const rawPriceObj = prices?.[activeAssetKey];
  const livePrice = typeof rawPriceObj?.price === "number" && !isNaN(rawPriceObj.price) 
    ? rawPriceObj.price 
    : currentAsset.basePrice;
  const liveChangePct = typeof rawPriceObj?.changePct === "number" && !isNaN(rawPriceObj.changePct) 
    ? rawPriceObj.changePct 
    : 0.0;

  const formatPriceVal = (val: any, decimals: number = 2): string => {
    if (val === null || val === undefined || isNaN(Number(val))) {
      return "--";
    }
    return Number(val).toFixed(decimals);
  };

  const formatPctVal = (val: any): string => {
    if (val === null || val === undefined || isNaN(Number(val))) {
      return "+0.00%";
    }
    const num = Number(val);
    return `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`;
  };

  const isPositiveChange = liveChangePct >= 0;

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (item.id === "admin") {
      return loggedInUser?.includes("Ahmed") || loggedInUser === "Ahmed";
    }
    return true;
  });

  const categories = ["ALL", "Core", "Signals", "AI Intelligence", "Market Data", "Analytics", "Tools", "News", "Admin"];

  const filteredNavItems = visibleNavItems.filter((item) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === "ALL" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Curated Primary Nav Tabs for high-frequency direct switching
  const primaryTabs = [
    { id: "gmcgold", label: "Gold Apex Zone", badge: "Live" },
    { id: "central_signal_manager", label: "Central Manager", badge: "Auto" },
    { id: "warroom", label: "AI War Room" },
    { id: "gmc_wyckoff", label: "Wyckoff 3D" },
    { id: "retest_x", label: "Retest X" },
    { id: "tradelog", label: "Journal & Log" },
  ];

  const priceDecimals = currentAsset.key === "EURUSD" || currentAsset.key === "GBPUSD" ? 4 : 2;

  return (
    <header id="gmc-navbar" className="bg-[#080A0D]/95 backdrop-blur-md border-b border-[#1E2530] text-[#F3F4F5] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3 font-sans">
        
        {/* Zone 1: Brand & Back Navigation */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onGoHome || (() => setActiveTab("gmcgold"))}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
            title="Harami AI Trading Terminal"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-slate-950 text-sm shadow-sm group-hover:scale-105 transition-transform">
              ⚜
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-sm font-bold tracking-tight text-white uppercase">HARAMI AI</span>
                <span className="text-[10px] text-amber-400 font-mono font-semibold">PRO</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-none mt-1 hidden sm:block">Institutional Terminal</p>
            </div>
          </button>

          {activeTab !== "gmcgold" && (
            <button
              onClick={onGoBack || (() => setActiveTab("gmcgold"))}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1 text-xs text-slate-400 hover:text-amber-400 bg-[#12161F] hover:bg-[#181F2C] border border-[#232B3A] rounded-lg transition-colors cursor-pointer"
              title="Return to Main Setup"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}
        </div>

        {/* Zone 2: Primary Clean Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-[#10141D] p-1 rounded-xl border border-[#1E2636]">
          {primaryTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#1E2738] text-amber-400 shadow-sm font-semibold border border-amber-500/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#161D2A]"
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                    isActive ? "bg-amber-400/20 text-amber-300" : "bg-slate-800 text-slate-400"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
          
          <button
            onClick={() => setIsNavDrawerOpen(true)}
            className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-[#161D2A] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            title="Browse All 20+ Modules"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xl:inline">More</span>
          </button>
        </nav>

        {/* Zone 3: Live Asset Selector & Status Affordances */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Quick Live Asset Ticker Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsAssetDropdownOpen(!isAssetDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 bg-[#10141D] hover:bg-[#161D2A] border border-[#1E2636] hover:border-[#2C374D] rounded-xl text-xs transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white tracking-wide">{currentAsset.short || currentAsset.key}</span>
                <span className="font-mono text-amber-400 tabular-nums font-semibold">
                  {formatPriceVal(livePrice, priceDecimals)}
                </span>
              </div>
              <span className={`text-[10px] font-mono tabular-nums ${isPositiveChange ? "text-emerald-400" : "text-rose-400"}`}>
                {formatPctVal(liveChangePct)}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isAssetDropdownOpen && (
              <div className="absolute right-0 mt-1 w-52 bg-[#0E121A] border border-[#232B3A] rounded-xl shadow-2xl py-1 z-50">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider border-b border-[#1E2636]">
                  Select Market Asset
                </div>
                {SUPPORTED_ASSETS.map((asset) => {
                  const p = prices?.[asset.key];
                  const pVal = typeof p?.price === "number" && !isNaN(p.price) ? p.price : asset.basePrice;
                  const pPct = typeof p?.changePct === "number" && !isNaN(p.changePct) ? p.changePct : 0.0;
                  const decimals = asset.key === "EURUSD" || asset.key === "GBPUSD" ? 4 : 2;
                  const isSelected = activeAssetKey === asset.key;
                  return (
                    <button
                      key={asset.key}
                      onClick={() => {
                        setActiveAssetKey(asset.key);
                        setIsAssetDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs hover:bg-[#161D2A] transition-colors cursor-pointer ${
                        isSelected ? "bg-[#18202E] text-amber-400 font-semibold" : "text-slate-300"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>{asset.short || asset.key}</span>
                        <span className="text-[10px] text-slate-500">{asset.label}</span>
                      </div>
                      <div className="text-right font-mono tabular-nums">
                        <div>{formatPriceVal(pVal, decimals)}</div>
                        <div className={`text-[10px] ${pPct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {formatPctVal(pPct)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Real-time Feeds / Latency indicator */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#10141D] border border-[#1E2636] rounded-xl text-xs text-slate-400 font-mono"
            title="Real-time WebSocket & FCS Data Feeds"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] tabular-nums text-emerald-400 font-medium">{latencyMs || 18}ms</span>
          </div>

          {/* Module Drawer Toggle */}
          <button
            onClick={() => setIsNavDrawerOpen(true)}
            className="p-2 bg-[#10141D] hover:bg-[#161D2A] text-slate-300 hover:text-white border border-[#1E2636] rounded-xl transition-colors cursor-pointer"
            title="Browse All Modules"
          >
            <LayoutGrid className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* FULL GMC NAVIGATION TABS DRAWER / MODAL */}
      {isNavDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-[#050608]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 font-sans text-xs">
          <div className="relative w-full max-w-4xl bg-[#0B0F17] border border-[#232B3A] rounded-2xl p-4 sm:p-6 shadow-2xl text-[#F3F4F5] space-y-4 flex flex-col max-h-[90vh]">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[#1E2636] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#121622] border border-[#232B3A] rounded-xl flex items-center justify-center text-amber-400">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                      SYSTEM MODULE DIRECTORY
                    </h2>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {visibleNavItems.length} ACTIVE ENGINES
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select any algorithmic module or intelligence desk to switch view.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsNavDrawerOpen(false)}
                className="p-2 text-slate-400 hover:text-white bg-[#121622] hover:bg-[#181E2E] border border-[#232B3A] rounded-xl transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4 text-rose-400" />
              </button>
            </div>

            {/* Live Search Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search modules (e.g. Wyckoff, Retest X, War Room, Gold Apex)..."
                className="w-full bg-[#121622] border border-[#232B3A] focus:border-amber-400/60 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px]">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors border whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? "bg-amber-400 text-slate-950 font-semibold border-amber-400"
                        : "bg-[#121622] text-slate-400 border-[#232B3A] hover:text-white hover:bg-[#181E2E]"
                    }`}
                  >
                    {cat === "ALL" ? `All (${visibleNavItems.length})` : cat}
                  </button>
                );
              })}
            </div>

            {/* Complete Module Grid */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2 pr-1 my-1 text-left custom-scrollbar max-h-[50vh]">
              {filteredNavItems.length === 0 ? (
                <div className="col-span-2 p-8 bg-[#121622] border border-[#232B3A] rounded-xl text-center space-y-2">
                  <p className="text-amber-400 font-medium">No modules found for "{searchQuery}"</p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("ALL");
                    }}
                    className="text-xs text-emerald-400 hover:underline cursor-pointer"
                  >
                    Reset Filter
                  </button>
                </div>
              ) : (
                filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsNavDrawerOpen(false);
                      }}
                      className={`p-3 rounded-xl border transition-all flex items-start gap-3 text-left cursor-pointer group ${
                        isActive
                          ? "bg-[#161F2E] text-white border-amber-500/50 shadow-sm"
                          : "bg-[#10141D] hover:bg-[#151B27] text-slate-300 border-[#1E2636] hover:border-[#2C384F]"
                      }`}
                    >
                      <div className={`p-2.5 rounded-lg border shrink-0 ${
                        isActive
                          ? "bg-amber-400 text-slate-950 border-amber-400"
                          : "bg-[#141A26] text-amber-400 border-[#232B3A]"
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-white text-xs truncate group-hover:text-amber-300 transition-colors">
                            {item.label}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono shrink-0">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-[#1E2636] flex items-center justify-between text-[11px] text-slate-400">
              <span>Showing {filteredNavItems.length} of {visibleNavItems.length} engines</span>
              <span className="text-amber-400 font-mono">Live Institutional Network</span>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM QUICK NAVIGATION BAR */}
      <div
        id="mobile-sticky-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080A0D]/95 backdrop-blur-md border-t border-[#1E2636] px-3 py-1.5 flex items-center justify-between"
      >
        <button
          onClick={() => setActiveTab("gmcgold")}
          className={`flex flex-col items-center justify-center min-h-[44px] px-2 py-1 rounded-lg transition-colors cursor-pointer ${
            activeTab === "gmcgold" ? "text-amber-400 font-bold" : "text-slate-400 hover:text-white"
          }`}
        >
          <Crown className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Gold Apex</span>
        </button>

        <button
          onClick={() => setActiveTab("central_signal_manager")}
          className={`flex flex-col items-center justify-center min-h-[44px] px-2 py-1 rounded-lg transition-colors cursor-pointer ${
            activeTab === "central_signal_manager" ? "text-amber-400 font-bold" : "text-slate-400 hover:text-white"
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Manager</span>
        </button>

        <button
          onClick={() => setActiveTab("warroom")}
          className={`flex flex-col items-center justify-center min-h-[44px] px-2 py-1 rounded-lg transition-colors cursor-pointer ${
            activeTab === "warroom" ? "text-amber-400 font-bold" : "text-slate-400 hover:text-white"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">War Room</span>
        </button>

        <button
          onClick={() => setActiveTab("gmc_wyckoff")}
          className={`flex flex-col items-center justify-center min-h-[44px] px-2 py-1 rounded-lg transition-colors cursor-pointer ${
            activeTab === "gmc_wyckoff" ? "text-amber-400 font-bold" : "text-slate-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Wyckoff</span>
        </button>

        <button
          onClick={() => setIsNavDrawerOpen(true)}
          className="flex flex-col items-center justify-center min-h-[44px] px-2 py-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <LayoutGrid className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] mt-0.5">Menu</span>
        </button>
      </div>
    </header>
  );
};

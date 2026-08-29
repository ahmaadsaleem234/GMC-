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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const currentAsset = SUPPORTED_ASSETS.find((a) => a.key === activeAssetKey) || SUPPORTED_ASSETS[0];
  const livePriceObj = prices[activeAssetKey] || { price: currentAsset.basePrice, changePct: 0.25 };

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

  const activeItemLabel = NAV_ITEMS.find((i) => i.id === activeTab)?.label || "Dashboard";

  return (
    <header id="gmc-navbar" className="bg-[#080A0D] border-b border-[#292E35] text-[#F3F4F5] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 font-sans">
        {/* Left: Back & Home & Top Apex Zone Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="header-nav-back-btn"
            onClick={onGoBack || (() => setActiveTab("vault"))}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#101318] hover:bg-[#161A21] text-[#E2BA57] border border-[#2C3239] hover:border-[rgba(241,204,107,0.5)] rounded-xl font-medium text-xs transition-all active:scale-95 cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4 text-[#F1CC6B]" />
            <span>Back</span>
          </button>

          <button
            id="header-nav-home-btn"
            onClick={onGoHome || (() => setActiveTab("vault"))}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#101318] hover:bg-[#161A21] text-[#E2BA57] border border-[#2C3239] hover:border-[rgba(241,204,107,0.5)] rounded-xl font-medium text-xs transition-all active:scale-95 cursor-pointer"
            title="Go Home (Vault)"
          >
            <Home className="w-4 h-4 text-[#F1CC6B]" />
            <span className="hidden sm:inline">Home</span>
          </button>

          {/* ⚡ RETEST X 15M ENGINE APEX SHORTCUT BUTTON */}
          <button
            id="header-nav-retest-x-btn"
            onClick={() => setActiveTab("retest_x")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-black text-xs transition-all active:scale-95 cursor-pointer ${
              activeTab === "retest_x"
                ? "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 text-slate-950 border border-cyan-300 shadow-[0_0_18px_rgba(6,182,212,0.85)] animate-pulse"
                : "bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 hover:bg-cyan-500/30"
            }`}
            title="Launch ⚡ RETEST X — 15M Red Doji Reference & Breakout Retest Engine"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="tracking-wide font-black">RETEST X</span>
          </button>

          {/* 🇬🇧 GBPUSD 3D AI SNIPER APEX SHORTCUT BUTTON */}
          <button
            id="header-nav-gbpusd-sniper-btn"
            onClick={() => setActiveTab("gbpusd_sniper")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-black text-xs transition-all active:scale-95 cursor-pointer ${
              activeTab === "gbpusd_sniper" || activeTab === "gbpusd" || activeTab === "gbpusd_3d_ai_sniper"
                ? "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 text-slate-950 border border-cyan-300 shadow-[0_0_18px_rgba(6,182,212,0.85)] animate-pulse"
                : "bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 hover:bg-cyan-500/30"
            }`}
            title="Launch 🇬🇧 GBPUSD 3D AI SNIPER — Live 3D Market Universe"
          >
            <span className="text-sm">🇬🇧</span>
            <span className="tracking-wide font-black">GBPUSD 3D SNIPER</span>
          </button>

          {/* 🇺🇸 S&P 500 AI HUNTER APEX SHORTCUT BUTTON */}
          <button
            id="header-nav-sp500-ai-hunter-btn"
            onClick={() => setActiveTab("sp500_ai_hunter")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-black text-xs transition-all active:scale-95 cursor-pointer ${
              activeTab === "sp500_ai_hunter" || activeTab === "sp500"
                ? "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 text-slate-950 border border-cyan-300 shadow-[0_0_18px_rgba(6,182,212,0.85)] animate-pulse"
                : "bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 hover:bg-cyan-500/30"
            }`}
            title="Launch 🇺🇸 S&P 500 AI HUNTER — Real-Time AI Market Intelligence"
          >
            <span className="text-sm">🇺🇸</span>
            <span className="tracking-wide font-black">S&P 500 HUNTER</span>
          </button>

          {/* 🪐 GMC WYCKOFF 3D LIVE MARKET ENGINE APEX SHORTCUT BUTTON */}
          <button
            id="header-nav-gmc-wyckoff-btn"
            onClick={() => setActiveTab("gmc_wyckoff")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-black text-xs transition-all active:scale-95 cursor-pointer ${
              activeTab === "gmc_wyckoff"
                ? "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 text-slate-950 border border-cyan-300 shadow-[0_0_18px_rgba(6,182,212,0.85)] animate-pulse"
                : "bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 hover:bg-cyan-500/30"
            }`}
            title="Launch 🪐 GMC WYCKOFF 3D Live AI Market Engine"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-200 fill-current animate-spin" />
            <span className="tracking-wide">GMC WYCKOFF</span>
          </button>

          {/* ⚡ GMC SENTINEL MASTER AI TERMINAL APEX SHORTCUT BUTTON */}
          <button
            id="header-nav-gmc-sentinel-btn"
            onClick={() => setActiveTab("sentinel")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-black text-xs transition-all active:scale-95 cursor-pointer ${
              activeTab === "sentinel"
                ? "bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 text-slate-950 border border-cyan-300 shadow-[0_0_18px_rgba(6,182,212,0.8)] animate-pulse"
                : "bg-cyan-500/20 text-cyan-300 border border-cyan-400/60 hover:bg-cyan-500/30"
            }`}
            title="Launch ⚡ GMC SENTINEL Master AI Trading Terminal"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="tracking-wide">GMC SENTINEL</span>
          </button>

          {/* 📋 GMC MODULE REGISTRY APEX SHORTCUT BUTTON */}
          <button
            id="header-nav-module-registry-btn"
            onClick={() => setActiveTab("module_registry")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-extrabold text-xs transition-all active:scale-95 cursor-pointer ${
              activeTab === "module_registry"
                ? "bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-400 text-slate-950 border border-cyan-300 shadow-[0_0_16px_rgba(6,182,212,0.7)]"
                : "bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/25"
            }`}
            title="Open GMC Module Registry (Complete Directory)"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">MODULE</span> REGISTRY
          </button>

          {/* 🏛️ CENTRAL SIGNAL MANAGER APEX SHORTCUT BUTTON */}
          <button
            id="header-nav-central-signal-manager-btn"
            onClick={() => setActiveTab("central_signal_manager")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-extrabold text-xs transition-all active:scale-95 cursor-pointer ${
              activeTab === "central_signal_manager"
                ? "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 text-slate-950 border border-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.7)] animate-pulse"
                : "bg-amber-500/15 text-amber-300 border border-amber-500/50 hover:bg-amber-500/25"
            }`}
            title="Launch 🏛️ Central Signal Manager (Telegram 1-Active System)"
          >
            <span>🏛️</span>
            <span>CENTRAL MANAGER</span>
          </button>

          {/* 💀 KHATARNAK JUGAAD SUPREME SHORTCUT BUTTON */}
          <button
            id="header-nav-khatarnak-jugaad-btn"
            onClick={() => setActiveTab("khatarnak_jugaad")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-extrabold text-xs transition-all active:scale-95 cursor-pointer ${
              activeTab === "khatarnak_jugaad"
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 border border-orange-400 shadow-[0_0_14px_rgba(249,115,22,0.6)]"
                : "bg-orange-500/10 text-orange-300 border border-orange-500/40 hover:bg-orange-500/20"
            }`}
            title="Launch 💀 Khatarnak Jugaad Sniper Engine"
          >
            <span>💀</span>
            <span>KHATARNAK JUGAAD</span>
          </button>

          {/* ⚔️ GMC AI WAR ROOM SUPREME SHORTCUT BUTTON */}
          <button
            id="header-nav-warroom-btn"
            onClick={() => setActiveTab("warroom")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-extrabold text-xs transition-all active:scale-95 cursor-pointer ${
              activeTab === "warroom"
                ? "bg-amber-400 text-slate-950 border border-amber-400 shadow-[0_0_14px_rgba(245,158,11,0.5)]"
                : "bg-amber-500/10 text-amber-300 border border-amber-500/40 hover:bg-amber-500/20"
            }`}
            title="Launch GMC AI War Room Supreme Decision Center"
          >
            <span>⚔️</span>
            <span>WAR ROOM</span>
          </button>

          {/* TOP #1 TRADE EXECUTION MAP SHORTCUT BUTTON */}
          <button
            id="header-nav-[#1-execution-map-btn]"
            onClick={() => setActiveTab("tradeexecutionmap")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer ${
              activeTab === "tradeexecutionmap"
                ? "bg-[#F1CC6B] text-[#111111] border border-[#F1CC6B] shadow-[0_0_12px_rgba(241,204,107,0.3)]"
                : "bg-[rgba(241,204,107,0.08)] text-[#F1CC6B] border border-[rgba(241,204,107,0.4)] hover:bg-[rgba(241,204,107,0.18)]"
            }`}
            title="Launch Top #1 Trade Execution Map"
          >
            <span>🎯</span>
            <span className="hidden md:inline">EXECUTION MAP</span>
          </button>

          {/* TOP #1 APEX BANK ZONE TAB SHORTCUT BUTTON */}
          <button
            id="header-nav-apexzone-btn"
            onClick={() => setActiveTab("gmcgold")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold text-xs transition-all active:scale-95 cursor-pointer ${
              activeTab === "gmcgold"
                ? "bg-[#F1CC6B] text-[#111111] border border-[#F1CC6B]"
                : "bg-rgba(241,204,107,0.04) text-[#E2BA57] border border-[rgba(241,204,107,0.38)] hover:bg-[rgba(241,204,107,0.12)]"
            }`}
            title="Launch Top #1 GMC Gold Apex Bank Zone Matrix"
          >
            <Crown className="w-4 h-4 text-[#F1CC6B]" />
            <span>TOP 1 APEX ZONE</span>
          </button>
        </div>

        {/* Center: GMC Brand Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#111419] border border-[#292E35] flex items-center justify-center font-bold text-[#F1CC6B] text-xs">
            👑
          </div>
          <span className="text-sm sm:text-base font-semibold tracking-wide text-[#F3F4F5] uppercase hidden xs:inline">
            GMC <span className="text-[#F1CC6B]">TRADING AI</span>
          </span>
        </div>

        {/* Right: Module Drawer & Feeds */}
        <div className="flex items-center gap-2">
          {onOpenMarketDataModal && (
            <button
              onClick={onOpenMarketDataModal}
              id="open-market-data-hub-btn"
              className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-medium px-3 py-2 rounded-xl transition-all bg-[#101318] hover:bg-[#161A21] text-[#74D8A0] border border-[#2C3239] cursor-pointer"
              title="View Institutional Market Data Feeds"
            >
              <Radio className="w-3.5 h-3.5 text-[#74D8A0]" />
              <span>FEEDS ({latencyMs}ms)</span>
            </button>
          )}

          <button
            id="open-gmc-nav-drawer-btn"
            onClick={() => setIsNavDrawerOpen(!isNavDrawerOpen)}
            className="px-3.5 py-2 bg-[#101318] hover:bg-[#161A21] text-[#F3F4F5] border border-[#2C3239] hover:border-[#383F48] rounded-xl font-medium text-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            title="Browse All GMC AI Modules"
          >
            <LayoutGrid className="w-4 h-4 text-[#F1CC6B]" />
            <span className="hidden md:inline uppercase">MODULES</span>
          </button>
        </div>
      </div>

      {/* FULL VERTICAL GMC NAVIGATION TABS DRAWER / MODAL */}
      {isNavDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-[#050608]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 font-sans text-xs">
          <div className="relative w-full max-w-4xl bg-[#080A0D] border border-[#292E35] rounded-2xl p-4 sm:p-6 shadow-2xl text-[#F3F4F5] space-y-4 flex flex-col max-h-[90vh]">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[#292E35] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#111419] border border-[#292E35] rounded-xl flex items-center justify-center text-[#F1CC6B]">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-semibold text-white uppercase tracking-tight">
                      GMC MODULE REGISTRY
                    </h2>
                    <span className="px-2 py-0.5 rounded bg-[rgba(241,204,107,0.1)] text-[#F1CC6B] border border-[rgba(241,204,107,0.3)] text-[10px] font-mono font-bold">
                      {visibleNavItems.length} MODULES
                    </span>
                  </div>
                  <p className="text-xs text-[#9299A3] mt-0.5">
                    Browse all active GMC AI analytics desks and execution engines.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsNavDrawerOpen(false)}
                className="p-2 text-[#9299A3] hover:text-white bg-[#101318] hover:bg-[#161A21] border border-[#2C3239] rounded-xl transition-all cursor-pointer"
                title="Close Navigation Menu"
              >
                <X className="w-4 h-4 text-[#EE777F]" />
              </button>
            </div>

            {/* Live Search Input Bar */}
            <div className="space-y-2">
              <button
                id="drawer-open-full-registry-cta"
                onClick={() => {
                  setActiveTab("module_registry");
                  setIsNavDrawerOpen(false);
                }}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-cyan-500/20 via-teal-500/20 to-cyan-500/20 hover:from-cyan-500/30 hover:to-cyan-500/30 border border-cyan-500/50 rounded-xl text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
              >
                <LayoutGrid className="w-4 h-4 text-cyan-400" />
                <span>📋 OPEN FULL INTERACTIVE MODULE REGISTRY ({visibleNavItems.length} ENGINES)</span>
              </button>

              <div className="relative">
                <Search className="w-4 h-4 text-[#F1CC6B] absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search modules..."
                  className="w-full bg-[#111419] border border-[#292E35] focus:border-[#F1CC6B] rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-[#646C77] outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-2.5 text-[#646C77] hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px]">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-xl font-medium transition-all border whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? "bg-[#F1CC6B] text-[#111111] border-[#F1CC6B]"
                        : "bg-[#101318] text-[#9299A3] border-[#2C3239] hover:text-white"
                    }`}
                  >
                    {cat === "ALL" ? `SHOW ALL (${visibleNavItems.length})` : cat}
                  </button>
                );
              })}
            </div>

            {/* COMPLETE VERTICAL MODULE LIST */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-1 text-left custom-scrollbar">
              {filteredNavItems.length === 0 ? (
                <div className="p-8 bg-[#111419] border border-[#292E35] rounded-xl text-center space-y-2">
                  <p className="text-[#F1CC6B] font-medium">No modules matched your search filter "{searchQuery}"</p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("ALL");
                    }}
                    className="text-xs text-[#74D8A0] hover:underline"
                  >
                    Reset Search &amp; Show All Tools
                  </button>
                </div>
              ) : (
                filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      id={`drawer-item-${item.id}`}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsNavDrawerOpen(false);
                      }}
                      className={`w-full p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left cursor-pointer group ${
                        isActive
                          ? "bg-[#111419] text-white border-[#F1CC6B]"
                          : "bg-[#0E1115] hover:bg-[#111419] text-[#9299A3] border-[#252A31] hover:border-[#383F48]"
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className={`p-2.5 rounded-xl border shrink-0 ${
                          isActive
                            ? "bg-[#F1CC6B] text-[#111111] border-[#F1CC6B]"
                            : "bg-[#101318] text-[#F1CC6B] border-[#2C3239]"
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-white text-xs sm:text-sm group-hover:text-[#F1CC6B] transition-colors">
                              {item.label}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-[#101318] border border-[#2C3239] text-[10px] text-[#646C77] font-mono">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#858C96] mt-1 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 self-end sm:self-center">
                        {isActive ? (
                          <span className="px-3 py-1.5 rounded-xl bg-[rgba(241,204,107,0.15)] border border-[rgba(241,204,107,0.4)] text-[#F1CC6B] font-medium text-[10px] flex items-center gap-1">
                            <span>ACTIVE</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1.5 rounded-xl bg-[#101318] group-hover:bg-[#161A21] border border-[#2C3239] text-[#9299A3] group-hover:text-[#F3F4F5] font-medium text-[10px] flex items-center gap-1 transition-all">
                            <span>LAUNCH</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-[#292E35] flex flex-wrap items-center justify-between text-[10px] text-[#646C77] gap-2">
              <span>Showing {filteredNavItems.length} of {visibleNavItems.length} available tools</span>
              <span className="text-[#F1CC6B] font-mono">Select any module to switch view</span>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM QUICK NAVIGATION BAR (iPhone & Android Optimized) */}
      <div
        id="mobile-sticky-bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080a0e]/95 backdrop-blur-md border-t border-[#232932] px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.6)]"
      >
        <button
          id="mobile-nav-home-btn"
          onClick={onGoHome || (() => setActiveTab("vault"))}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === "vault" || activeTab === "landing"
              ? "text-amber-400 font-bold bg-amber-500/15"
              : "text-slate-400 hover:text-white"
          }`}
          title="Home Dashboard"
        >
          <Home className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 font-medium">Home</span>
        </button>

        <button
          id="mobile-nav-module-registry-btn"
          onClick={() => setActiveTab("module_registry")}
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === "module_registry"
              ? "text-cyan-300 font-black bg-cyan-500/20 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.4)]"
              : "text-cyan-400 hover:text-cyan-200"
          }`}
          title="Open GMC Module Registry"
        >
          <LayoutGrid className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 font-bold uppercase tracking-tight">Registry</span>
        </button>

        <button
          id="mobile-nav-central-signal-manager-btn"
          onClick={() => setActiveTab("central_signal_manager")}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === "central_signal_manager"
              ? "text-amber-400 font-bold bg-amber-500/15 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]"
              : "text-slate-400 hover:text-white"
          }`}
          title="Central Signal Manager"
        >
          <span className="text-sm leading-none">🏛️</span>
          <span className="text-[10px] mt-0.5 font-medium">Central</span>
        </button>

        <button
          id="mobile-nav-khatarnak-btn"
          onClick={() => setActiveTab("khatarnak_jugaad")}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === "khatarnak_jugaad"
              ? "text-orange-400 font-bold bg-orange-500/15 border border-orange-500/40"
              : "text-slate-400 hover:text-white"
          }`}
          title="Khatarnak Jugaad Sniper"
        >
          <span className="text-sm leading-none">💀</span>
          <span className="text-[10px] mt-0.5 font-medium">Jugaad</span>
        </button>

        <button
          id="mobile-nav-warroom-btn"
          onClick={() => setActiveTab("warroom")}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] px-2 py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === "warroom"
              ? "text-amber-400 font-bold bg-amber-500/15 border border-amber-500/40"
              : "text-slate-400 hover:text-white"
          }`}
          title="GMC War Room"
        >
          <span className="text-sm leading-none">⚔️</span>
          <span className="text-[10px] mt-0.5 font-medium">War Room</span>
        </button>

        <button
          id="mobile-nav-drawer-menu-btn"
          onClick={() => setIsNavDrawerOpen(true)}
          className="flex flex-col items-center justify-center min-w-[50px] min-h-[44px] px-2 py-1 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
          title="Open All Modules Menu"
        >
          <Menu className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] mt-0.5 font-medium">Menu</span>
        </button>
      </div>
    </header>
  );
};

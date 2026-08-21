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
    </header>
  );
};

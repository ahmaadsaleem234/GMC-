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
    <header id="gmc-navbar" className="bg-[#070A10]/95 backdrop-blur-2xl border-b border-[#D4AF37]/30 text-slate-200 sticky top-0 z-50 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 font-mono">
        {/* Left: Gold Outlined Back & Home Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="header-nav-back-btn"
            onClick={onGoBack || (() => setActiveTab("vault"))}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#070A10] hover:bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/60 hover:border-[#D4AF37] rounded-xl font-mono font-bold text-xs uppercase transition-all shadow-[0_0_12px_rgba(212,175,55,0.2)] active:scale-95 cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4 text-[#D4AF37]" />
            <span>Back</span>
          </button>

          <button
            id="header-nav-home-btn"
            onClick={onGoHome || (() => setActiveTab("vault"))}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#070A10] hover:bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/60 hover:border-[#D4AF37] rounded-xl font-mono font-bold text-xs uppercase transition-all shadow-[0_0_12px_rgba(212,175,55,0.2)] active:scale-95 cursor-pointer"
            title="Go Home (Vault)"
          >
            <Home className="w-4 h-4 text-[#D4AF37]" />
            <span className="hidden sm:inline">Home</span>
          </button>

          {/* TOP #1 APEX BANK ZONE TAB SHORTCUT BUTTON */}
          <button
            id="header-nav-apexzone-btn"
            onClick={() => setActiveTab("gmcgold")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-mono font-extrabold text-xs uppercase transition-all shadow-md active:scale-95 cursor-pointer ${
              activeTab === "gmcgold"
                ? "bg-amber-400 text-black border-2 border-amber-300 shadow-[0_0_16px_rgba(234,179,8,0.6)]"
                : "bg-gradient-to-r from-amber-500/20 via-amber-600/20 to-amber-950/40 text-amber-300 hover:text-white border-2 border-amber-500/70 hover:border-amber-400 shadow-[0_0_12px_rgba(212,175,55,0.3)] animate-pulse"
            }`}
            title="Launch Top #1 GMC Gold Apex Bank Zone Matrix"
          >
            <Crown className="w-4 h-4 text-amber-300" />
            <span>🥇 TOP 1 APEX ZONE</span>
          </button>
        </div>

        {/* Center: GMC Brand Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4AF37] to-amber-800 flex items-center justify-center font-black text-black text-xs shadow-[0_0_10px_rgba(212,175,55,0.4)]">
            👑
          </div>
          <span className="text-sm sm:text-base font-black tracking-wider text-white uppercase hidden xs:inline">
            GMC <span className="text-[#D4AF37]">TRADING AI</span>
          </span>
        </div>

        {/* Right: Module Drawer & Account Terminal Status */}
        <div className="flex items-center gap-2">
          {onOpenMarketDataModal && (
            <button
              onClick={onOpenMarketDataModal}
              id="open-market-data-hub-btn"
              className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-2 rounded-xl transition-all bg-[#070A10] hover:bg-[#131821] text-emerald-400 border border-emerald-500/40 shadow-sm cursor-pointer"
              title="View Institutional Market Data Feeds"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>FEEDS ({latencyMs}ms)</span>
            </button>
          )}

          <button
            id="open-gmc-nav-drawer-btn"
            onClick={() => setIsNavDrawerOpen(!isNavDrawerOpen)}
            className="px-3 py-2 bg-[#070A10] hover:bg-[#131821] text-amber-300 border border-[#D4AF37]/40 hover:border-[#D4AF37] rounded-xl font-mono font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Browse All GMC AI Modules"
          >
            <LayoutGrid className="w-4 h-4 text-[#D4AF37]" />
            <span className="hidden md:inline uppercase">MODULES</span>
          </button>
        </div>
      </div>

      {/* FULL VERTICAL GMC NAVIGATION TABS DRAWER / MODAL (DESKTOP & MOBILE) */}
      {isNavDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-[#04060E]/90 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 font-mono text-xs animate-fade-in">
          <div className="relative w-full max-w-4xl bg-[#080B14] border-2 border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-200 space-y-4 flex flex-col max-h-[90vh]">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/20 border border-amber-500/50 rounded-2xl flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                      GMC NAVIGATION TABS &amp; ALL MODULES
                    </h2>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                      {visibleNavItems.length} MODULES
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                    Browse and search through all available GMC AI trading tools, strategy engines &amp; analytics desks in one vertical view.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsNavDrawerOpen(false)}
                className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all cursor-pointer"
                title="Close Navigation Menu"
              >
                <X className="w-5 h-5 text-rose-400" />
              </button>
            </div>

            {/* Live Search Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search all tools (e.g. Harami, D3 Heatmap, Gold, SMC, Vault, Admin)..."
                className="w-full bg-[#04060E] border-2 border-slate-800 focus:border-amber-500/80 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-2.5 text-slate-500 hover:text-white"
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
                    className={`px-3 py-1 rounded-xl font-bold transition-all border whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-md"
                        : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200"
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
                <div className="p-8 bg-[#04060E] border border-slate-800 rounded-2xl text-center space-y-2">
                  <p className="text-amber-400 font-bold">No modules matched your search filter "{searchQuery}"</p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("ALL");
                    }}
                    className="text-xs text-blue-400 hover:underline"
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
                      className={`w-full p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left cursor-pointer group ${
                        isActive
                          ? "bg-gradient-to-r from-amber-500/20 via-amber-600/10 to-amber-950/30 text-white border-amber-500/80 shadow-lg shadow-amber-500/10 scale-[1.005]"
                          : "bg-[#05070E] hover:bg-[#0A0E1A] text-slate-300 border-slate-800/80 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className={`p-2.5 rounded-xl border shrink-0 ${
                          isActive
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-md shadow-amber-500/20"
                            : "bg-slate-900 text-amber-400 border-slate-800 group-hover:border-amber-500/30"
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-xs sm:text-sm group-hover:text-amber-300 transition-colors">
                              {item.label}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-bold">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-sans mt-1 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 self-end sm:self-center">
                        {isActive ? (
                          <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/60 text-amber-300 font-bold text-[10px] flex items-center gap-1">
                            <span>ACTIVE MODULE</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1.5 rounded-xl bg-slate-900 group-hover:bg-amber-500/20 border border-slate-800 group-hover:border-amber-500/40 text-slate-300 group-hover:text-amber-300 font-bold text-[10px] flex items-center gap-1 transition-all">
                            <span>LAUNCH MODULE</span>
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
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-[10px] text-slate-500 font-sans gap-2">
              <span>Showing {filteredNavItems.length} of {visibleNavItems.length} available tools</span>
              <span className="text-amber-400 font-mono">💡 Click any tool to switch immediately without reloading</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

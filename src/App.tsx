import React, { useState, useEffect, useRef } from "react";
import { Navbar, NAV_ITEMS } from "./components/Navbar";
import { BlackSharkDashboard } from "./components/BlackSharkDashboard";
import { InteractiveChart } from "./components/InteractiveChart";
import { SniperEntry } from "./components/SniperEntry";
import { BacktesterView } from "./components/BacktesterView";
import { SignalScanner } from "./components/SignalScanner";
import { RiskCalculator } from "./components/RiskCalculator";
import { WhaleRadar } from "./components/WhaleRadar";
import { EconomicNews } from "./components/EconomicNews";
import { PriceAlerts } from "./components/PriceAlerts";
import { PerformanceMetricsView } from "./components/PerformanceMetricsView";
import { WhatsAppButton } from "./components/WhatsAppButton";
import { WhatsAppChannelModal } from "./components/WhatsAppChannelModal";
import { GmcWhatsAppCommunityModal } from "./components/GmcWhatsAppCommunityModal";
import { BrainVaultGrid } from "./components/BrainVaultGrid";
import { Bond007View } from "./components/Bond007View";
import { MarketSentimentGauge } from "./components/MarketSentimentGauge";
import { LiquidityHeatmap } from "./components/LiquidityHeatmap";
import { ComparativeTerminal } from "./components/ComparativeTerminal";
import { MasterAIBrainSynthesizer } from "./components/MasterAIBrainSynthesizer";
import { CommandCenterView } from "./components/CommandCenterView";
import { LeoFusionView } from "./components/LeoFusionView";
import { DemoLeaderboardView } from "./components/DemoLeaderboardView";
import { InstitutionalHubView } from "./components/InstitutionalHubView";
import { LiveEquityTrackerView } from "./components/LiveEquityTrackerView";
import { HaramiAIView } from "./components/HaramiAIView";
import { GmcCap1HAIBrainView } from "./components/GmcCap1HAIBrainView";
import { GmcTradingAnalysisView } from "./components/GmcTradingAnalysisView";
import { GmcGoldZoneCardView } from "./components/GmcGoldZoneCardView";
import { GoldIntelligenceView } from "./components/GoldIntelligenceView";
import { LevelKeystoneView } from "./components/LevelKeystoneView";
import { TradeExecutionMapView } from "./components/TradeExecutionMapView";
import { GmcAiWarRoomView } from "./components/warroom/GmcAiWarRoomView";
import { KhatarnakJugaadView } from "./components/KhatarnakJugaadView";
import { CentralSignalManagerView } from "./components/CentralSignalManagerView";
import { PrecisionHunterView } from "./components/PrecisionHunterView";
import { ModuleRegistryView } from "./components/ModuleRegistryView";
import { SentinelView } from "./components/SentinelView";
import { GmcWyckoffView } from "./components/GmcWyckoffView";
import { Sp500HunterView } from "./components/sp500/Sp500HunterView";
import { GbpusdSniperView } from "./components/gbpusd/GbpusdSniperView";
import { useCentralSignalManagerWatcher } from "./services/useCentralSignalManagerWatcher";
import { InstitutionalLiquidityHeatmapD3 } from "./components/InstitutionalLiquidityHeatmapD3";
import { OrderFlowVolumeProfile } from "./components/OrderFlowVolumeProfile";
import { GmcLandingPage } from "./components/GmcLandingPage";
import { EnterpriseAccessModal } from "./components/EnterpriseAccessModal";
import { InstitutionalMarketDataHubModal } from "./components/InstitutionalMarketDataHubModal";
import { AIBrainJournalView } from "./components/AIBrainJournalView";
import { AdminDashboardView } from "./components/AdminDashboardView";
import { TabDemoBanner } from "./components/TabDemoBanner";
import { UniversalInstitutionalTabHeader } from "./components/UniversalInstitutionalTabHeader";
import { useDemoAccounts } from "./useDemoAccounts";
import { safeSessionStorage, safeLocalStorage } from "./utils/safeStorage";
import { ArrowLeft, Home, ChevronRight } from "lucide-react";
import {
  MTFDojiView,
  CipherView,
  NexusView,
  CandleEdgeView,
  SMCView,
  MomentumEdgeView,
  FalconView,
  AIBrainView,
  BrainsProView,
  SatoshiView,
  LiquidityMapView,
  MultiTFView,
  CryptoHubView,
  FundingPulseView,
  OrderPressureView,
  AINewsDeskView,
  PredictionEngineView,
  SignalHistoryView,
  SessionClockView,
  AIMasterEntryView,
} from "./components/ExtraViews";
import { LiveTerminalAuthModal } from "./components/LiveTerminalAuthModal";
import { TelegramBotModal } from "./components/TelegramBotModal";
import { QuickSwitchAssetStrip } from "./components/QuickSwitchAssetStrip";
import { RiskManagementCopilotModal } from "./components/RiskManagementCopilotModal";
import { TradeExecutionLog } from "./components/TradeExecutionLog";
import { sendTelegramMessage, dispatchTradeAlertToTelegram } from "./utils/telegram";
import { TradeLogEntry } from "./types";
import { useLiveData, useCandleData } from "./useLiveData";
import { useAutoTelegramBroadcaster } from "./useAutoTelegramBroadcaster";
import { getModuleTitle } from "./utils/moduleRegistry";
import { InstitutionalTelegramBroadcaster } from "./components/InstitutionalTelegramBroadcaster";
import { RetestXDashboardView } from "./components/RetestXDashboardView";
import { getValidSession, createSession, clearSession } from "./utils/sessionManager";

const INITIAL_TRADES: TradeLogEntry[] = [
  {
    id: "trd-101",
    timestamp: "2026-08-30T14:32:05Z",
    assetKey: "XAUUSD",
    type: "BUY",
    entryPrice: 4344.5,
    currentPrice: 4348.5,
    stopLoss: 4315.0,
    takeProfit: 4390.0,
    lotSize: 0.25,
    status: "TARGET_1_HIT",
    pnlUSD: 825.0,
    pnlPips: 33,
    signalSource: "BATMAN Master AI Brain",
  },
  {
    id: "trd-102",
    timestamp: "2026-08-30T13:15:40Z",
    assetKey: "BTCUSD",
    type: "BUY",
    entryPrice: 94200.0,
    currentPrice: 95450.0,
    stopLoss: 93500.0,
    takeProfit: 96800.0,
    lotSize: 0.1,
    status: "IN_PROGRESS",
    pnlUSD: 1250.0,
    pnlPips: 125,
    signalSource: "BATMAN Black Shark DOM",
  },
  {
    id: "trd-103",
    timestamp: "2026-08-30T11:04:12Z",
    assetKey: "EURUSD",
    type: "SELL",
    entryPrice: 1.0845,
    currentPrice: 1.0812,
    stopLoss: 1.088,
    takeProfit: 1.079,
    lotSize: 1.0,
    status: "TARGET_2_HIT",
    pnlUSD: 330.0,
    pnlPips: 33,
    signalSource: "BATMAN Bond 007 Command",
  },
  {
    id: "trd-104",
    timestamp: "2026-08-30T09:45:00Z",
    assetKey: "GBPUSD",
    type: "BUY",
    entryPrice: 1.291,
    currentPrice: 1.2942,
    stopLoss: 1.287,
    takeProfit: 1.298,
    lotSize: 0.5,
    status: "CLOSED_PROFIT",
    pnlUSD: 160.0,
    pnlPips: 32,
    signalSource: "BATMAN LEO Fusion",
  },
  {
    id: "trd-105",
    timestamp: "2026-08-30T08:12:18Z",
    assetKey: "US30",
    type: "SELL",
    entryPrice: 43850.0,
    currentPrice: 43840.0,
    stopLoss: 44000.0,
    takeProfit: 43500.0,
    lotSize: 0.05,
    status: "AI_GUARD_EXIT",
    pnlUSD: 50.0,
    pnlPips: 10,
    signalSource: "BATMAN Zone Reactor ML",
  },
];

export function App() {
  const [activeTab, setActiveTab] = useState<string>("gmcgold");
  const [tabHistory, setTabHistory] = useState<string[]>([]);
  const [activeAssetKey, setActiveAssetKey] = useState<string>("XAUUSD");
  const [timeframe, setTimeframe] = useState<string>("15min");

  // Trade Journal Log & Copilot Modal State
  const [trades, setTrades] = useState<TradeLogEntry[]>(INITIAL_TRADES);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [copilotAssetKey, setCopilotAssetKey] = useState<string>("XAUUSD");
  const [copilotType, setCopilotType] = useState<"BUY" | "SELL">("BUY");

  // Terminal Auth & Enterprise Access State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isEnterpriseModalOpen, setIsEnterpriseModalOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [loggedInUser, setLoggedInUser] = useState<string | null>("GMC Trader");

  // Telegram Integration Modal State
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState<boolean>(false);

  // Institutional Market Data Feeds Modal State
  const [isMarketDataModalOpen, setIsMarketDataModalOpen] = useState<boolean>(false);

  // Institutional D3 Heatmap Overlay State
  const [isHeatmapOverlayOpen, setIsHeatmapOverlayOpen] = useState<boolean>(false);

  // 1. Restore Persistent Session automatically on page load / revisit
  useEffect(() => {
    const validSession = getValidSession();
    if (validSession) {
      setIsLoggedIn(true);
      setLoggedInUser(validSession.username);
    }
  }, []);

  const handleLoginSuccess = (username: string, rememberMe: boolean = true) => {
    // Save secure session (14 days if rememberMe is true)
    createSession(username, rememberMe, 14);
    setIsLoggedIn(true);
    setLoggedInUser(username);
    setIsLoginModalOpen(false);
    setIsEnterpriseModalOpen(false);
  };

  const handleLogout = () => {
    clearSession();
    setIsLoggedIn(true);
    setLoggedInUser("GMC Trader");
    setIsLoginModalOpen(false);
  };

  // 30-Minute Inactivity Tracker
  useEffect(() => {
    if (!isLoggedIn) return;

    let inactivityTimer: any;
    const INACTIVITY_LIMIT_MS = 30 * 60 * 1000; // 30 minutes

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        const session = getValidSession();
        if (!session?.rememberMe) {
          handleLogout();
        } else {
          // Keep persistent session intact, open login/lock modal to re-affirm session
          setIsLoginModalOpen(true);
        }
      }, INACTIVITY_LIMIT_MS);
    };

    const activityEvents = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    activityEvents.forEach((ev) => window.addEventListener(ev, resetInactivityTimer));

    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimer);
      activityEvents.forEach((ev) => window.removeEventListener(ev, resetInactivityTimer));
    };
  }, [isLoggedIn]);

  // WhatsApp Modals State (Open only on user intent)
  const [isFirstPopupOpen, setIsFirstPopupOpen] = useState<boolean>(false);
  const [isCommunityPopupOpen, setIsCommunityPopupOpen] = useState<boolean>(false);

  const handleCloseFirstPopup = () => {
    setIsFirstPopupOpen(false);
  };

  const handleCloseCommunityPopup = () => {
    setIsCommunityPopupOpen(false);
  };

  const handleJoinWhatsApp = () => {
    setIsFirstPopupOpen(false);
    setIsCommunityPopupOpen(false);
  };

  const { prices, currentPrice, isConnected, latencyMs } = useLiveData(activeAssetKey);
  const { candles, loading, appendTick } = useCandleData(activeAssetKey, timeframe);
  const { candles: candles15m } = useCandleData(activeAssetKey, "15min");
  const { candles: candles5m } = useCandleData(activeAssetKey, "5min");
  const { accounts, executeTabTrade, refillTabAccount, resetDemoAccounts } = useDemoAccounts();

  // Central Signal Manager State & Watcher (1 Active Telegram Setup Rule)
  const {
    managerState: centralManagerState,
    forceRefresh: refreshCentralManager,
    forceCloseActiveSetup: closeCentralActiveSetup,
    resetCooldownManually: resetCentralCooldown,
    setConfig: updateCentralConfig,
    toggleAiSource: toggleCentralAiSource,
  } = useCentralSignalManagerWatcher(candles15m, candles5m, currentPrice, prices, activeAssetKey);

  // Continuously update forming candle with live real-time price
  const lastAppTickPriceRef = useRef<number>(0);
  useEffect(() => {
    if (currentPrice && appendTick && currentPrice !== lastAppTickPriceRef.current) {
      lastAppTickPriceRef.current = currentPrice;
      appendTick(currentPrice);
    }
  }, [currentPrice, appendTick]);

  // Activate Hands-Free Automatic Telegram Trade Signal Broadcaster
  useAutoTelegramBroadcaster();

  const handleOpenRiskCopilot = (assetKey?: string, type?: "BUY" | "SELL") => {
    if (assetKey) setCopilotAssetKey(assetKey);
    if (type) setCopilotType(type);
    setIsCopilotOpen(true);
  };

  const handleExecuteTrade = (newTrade: Omit<TradeLogEntry, "id" | "timestamp">) => {
    const trade: TradeLogEntry = {
      ...newTrade,
      id: `trd-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
    };
    setTrades((prev) => [trade, ...prev]);
  };

  const handleCloseTrade = (tradeId: string) => {
    setTrades((prev) =>
      prev.map((t) => (t.id === tradeId ? { ...t, status: "CLOSED_PROFIT" as const } : t))
    );
  };

  const handleClearLog = () => {
    setTrades([]);
  };

  const handleSelectTab = (newTab: string) => {
    if (newTab !== activeTab) {
      setTabHistory((prev) => [...prev, activeTab]);
      setActiveTab(newTab);
    }
  };

  const handleGoBack = () => {
    if (tabHistory.length > 0) {
      const prevTab = tabHistory[tabHistory.length - 1];
      setTabHistory((prev) => prev.slice(0, prev.length - 1));
      setActiveTab(prevTab);
    } else {
      setActiveTab("vault");
    }
  };

  const handleGoHome = () => {
    if (activeTab !== "vault") {
      setTabHistory((prev) => [...prev, activeTab]);
      setActiveTab("vault");
    }
  };

  // 🟢 UNLOCKED PROFESSIONAL AI DASHBOARD WITH ALL MODULES AND TABS ACCESSIBLE
  return (
    <div className="min-h-screen bg-3d-obsidian text-slate-300 font-sans flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Main Top Navigation & Ticker Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
        activeAssetKey={activeAssetKey}
        setActiveAssetKey={setActiveAssetKey}
        prices={prices}
        isConnected={isConnected}
        latencyMs={latencyMs}
        isLoggedIn={isLoggedIn}
        loggedInUser={loggedInUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenHeatmapOverlay={() => setIsHeatmapOverlayOpen(true)}
        onGoBack={handleGoBack}
        onGoHome={handleGoHome}
        onOpenMarketDataModal={() => setIsMarketDataModalOpen(true)}
      />

      {/* Institutional Market Data Feeds Control Modal */}
      <InstitutionalMarketDataHubModal
        isOpen={isMarketDataModalOpen}
        onClose={() => setIsMarketDataModalOpen(false)}
        latencyMs={latencyMs}
        isConnected={isConnected}
      />

      {/* Live Terminal Authentication Modal */}
      <LiveTerminalAuthModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        isLoggedIn={isLoggedIn}
        loggedInUser={loggedInUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        onContactWhatsApp={() => {
          window.open("https://chat.whatsapp.com/sample-gmc-trading-ai", "_blank");
        }}
      />

      {/* Telegram Signal Bot Integration Modal */}
      <TelegramBotModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
      />

      {/* Floating Risk Management Copilot Modal */}
      <RiskManagementCopilotModal
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        initialAssetKey={copilotAssetKey}
        initialType={copilotType}
        currentPrice={currentPrice}
        onExecuteTrade={handleExecuteTrade}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4 space-y-4">
        {/* Invisible Background Broadcaster */}
        <InstitutionalTelegramBroadcaster
          currentPrice={currentPrice}
          assetKey={activeAssetKey}
        />

        {activeTab === "retest_x" && (
          <RetestXDashboardView
            currentPrice={currentPrice}
            assetKey={activeAssetKey}
            prices={prices}
            latencyMs={latencyMs}
            onOpenTelegramModal={() => setIsTelegramModalOpen(true)}
          />
        )}

        {(activeTab === "gbpusd_sniper" || activeTab === "gbpusd" || activeTab === "gbpusd_3d_ai_sniper") && (
          <GbpusdSniperView />
        )}

        {(activeTab === "sp500_ai_hunter" || activeTab === "sp500") && (
          <Sp500HunterView
            prices={prices}
            onOpenTelegramModal={() => setIsTelegramModalOpen(true)}
            onExecuteDemoTrade={(tradeData) => executeTabTrade("sp500_ai_hunter", tradeData)}
          />
        )}

        {(activeTab === "gmc_wyckoff" || activeTab === "wyckoff") && (
          <GmcWyckoffView
            currentPrice={currentPrice}
            prices={prices}
            latencyMs={latencyMs}
            onOpenTelegramModal={() => setIsTelegramModalOpen(true)}
          />
        )}

        {(activeTab === "sentinel" || activeTab === "gmc_sentinel") && (
          <SentinelView
            currentPrice={currentPrice}
            prices={prices}
            latencyMs={latencyMs}
            onOpenTelegramModal={() => setIsTelegramModalOpen(true)}
            onOpenCentralManager={() => setActiveTab("central_signal_manager")}
            onExecuteDemoTrade={(tradeData) => executeTabTrade("sentinel", tradeData)}
          />
        )}

        {(activeTab === "module_registry" || activeTab === "registry") && (
          <ModuleRegistryView
            onSelectTab={(tabId) => setActiveTab(tabId)}
            activeTab={activeTab}
            prices={prices}
            currentPrice={currentPrice}
            latencyMs={latencyMs}
          />
        )}

        {activeTab === "precision_hunter" && (
          <PrecisionHunterView
            currentPrice={currentPrice}
            prices={prices}
            latencyMs={latencyMs}
            onOpenTelegramModal={() => setIsTelegramModalOpen(true)}
            onOpenCentralManager={() => setActiveTab("central_signal_manager")}
          />
        )}

        {activeTab === "central_signal_manager" && (
          <CentralSignalManagerView
            managerState={centralManagerState}
            onRefresh={refreshCentralManager}
            onForceCloseActiveSetup={closeCentralActiveSetup}
            onResetCooldownManually={resetCentralCooldown}
            onUpdateConfig={updateCentralConfig}
            onToggleAiSource={toggleCentralAiSource}
            currentPrice={currentPrice}
            prices={prices}
            assetKey={activeAssetKey}
          />
        )}

        {activeTab === "khatarnak_jugaad" && (
          <KhatarnakJugaadView
            currentPrice={currentPrice}
            assetKey={activeAssetKey}
            prices={prices}
            onOpenTradeCopilot={handleOpenRiskCopilot}
            onExecuteTrade={(tradeData) => executeTabTrade("khatarnak_jugaad", tradeData)}
          />
        )}

        {activeTab === "landing" && (
          <GmcLandingPage
            currentGoldPrice={currentPrice}
            prices={prices}
            onOpenLiveTerminal={() => {
              if (!isLoggedIn) {
                setIsLoginModalOpen(true);
              } else {
                handleSelectTab("gmcgold");
              }
            }}
            onOpenWhatsApp={() => {
              setIsCommunityPopupOpen(true);
            }}
            onOpenTelegram={() => {
              setIsTelegramModalOpen(true);
            }}
            onNavigateTab={(tab) => {
              if (!isLoggedIn) {
                setIsLoginModalOpen(true);
              } else {
                handleSelectTab(tab);
              }
            }}
          />
        )}

        {activeTab === "gmctrading" && (
          <GmcTradingAnalysisView
            currentPrice={currentPrice}
            assetKey={activeAssetKey}
            prices={prices}
            onOpenTradeCopilot={handleOpenRiskCopilot}
            onExecuteTrade={(tradeData) => executeTabTrade("gmctrading", tradeData)}
          />
        )}

        {activeTab === "tradeexecutionmap" && (
          <TradeExecutionMapView
            currentPrice={currentPrice}
            assetKey={activeAssetKey}
            prices={prices}
            onOpenTradeCopilot={handleOpenRiskCopilot}
          />
        )}

        {activeTab === "levelkeystone" && (
          <LevelKeystoneView
            currentPrice={currentPrice}
            assetKey={activeAssetKey}
            prices={prices}
            onOpenTradeCopilot={handleOpenRiskCopilot}
          />
        )}

        {activeTab === "goldintelligence" && (
          <GoldIntelligenceView
            currentPrice={currentPrice}
            assetKey={activeAssetKey}
            prices={prices}
            onOpenTradeCopilot={handleOpenRiskCopilot}
          />
        )}

        {activeTab === "gmcgold" && (
          <GmcGoldZoneCardView
            currentPrice={currentPrice}
            assetKey={activeAssetKey}
            prices={prices}
            onOpenTradeCopilot={handleOpenRiskCopilot}
            onOpenHeatmapOverlay={() => setIsHeatmapOverlayOpen(true)}
          />
        )}

        {activeTab === "d3heatmap" && (
          <InstitutionalLiquidityHeatmapD3
            currentPrice={currentPrice}
            assetKey={activeAssetKey}
            prices={prices}
            isOverlay={false}
          />
        )}

        {activeTab === "orderflow" && (
          <OrderFlowVolumeProfile
            currentPrice={currentPrice}
            assetKey={activeAssetKey}
          />
        )}

        {activeTab === "gmccap" && (
          <GmcCap1HAIBrainView
            currentPrice={currentPrice}
            assetKey={activeAssetKey}
            prices={prices}
            onOpenRiskCopilot={handleOpenRiskCopilot}
            onExecuteCapTrade={(trade) => executeTabTrade("gmccap", trade)}
            onGoBack={handleGoBack}
            onGoHome={() => setActiveTab("vault")}
            trades={trades}
            account={accounts["gmccap"]}
          />
        )}

        {activeTab === "harami" && (
          <HaramiAIView
            currentPrice={currentPrice}
            assetKey={activeAssetKey}
            prices={prices}
            onOpenRiskCopilot={handleOpenRiskCopilot}
            onExecuteHaramiTrade={(trade) => executeTabTrade("harami", trade)}
            trades={trades}
          />
        )}

        {activeTab === "admin" && (
          <AdminDashboardView
            isLoggedIn={isLoggedIn}
            loggedInUser={loggedInUser}
            onLogout={() => {
              setIsLoggedIn(false);
              setLoggedInUser(null);
              setActiveTab("landing");
            }}
            onForceLogoutUser={() => {
              setIsLoggedIn(false);
              setLoggedInUser(null);
              setActiveTab("landing");
            }}
          />
        )}

        {activeTab === "journal" && (
          <AIBrainJournalView
            accounts={accounts}
            onResetAllAccounts={resetDemoAccounts}
            onRefillTabAccount={refillTabAccount}
          />
        )}

        {activeTab === "demoleaderboard" && (
          <DemoLeaderboardView
            accounts={accounts}
            onExecuteDemoTrade={(tabId) =>
              executeTabTrade(tabId, {
                assetKey: activeAssetKey,
                type: "BUY",
                entryPrice: currentPrice,
                stopLoss: currentPrice * 0.992,
                takeProfit: currentPrice * 1.018,
              })
            }
            onResetAccounts={resetDemoAccounts}
            onSelectTab={handleSelectTab}
          />
        )}

        {activeTab === "institutional" && (
          <InstitutionalHubView
            currentPrice={currentPrice}
            assetKey={activeAssetKey}
            prices={prices}
            onOpenRiskCopilot={handleOpenRiskCopilot}
          />
        )}

        {activeTab === "warroom" && (
          <GmcAiWarRoomView onBackToDashboard={() => setActiveTab("vault")} />
        )}

        {activeTab === "equitytracker" && (
          <LiveEquityTrackerView trades={trades} />
        )}

        {activeTab === "vault" && (
          <BrainVaultGrid
            onSelectTab={handleSelectTab}
            isLoggedIn={isLoggedIn}
            loggedInUser={loggedInUser}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            prices={prices}
            currentPrice={currentPrice}
            latencyMs={latencyMs}
          />
        )}

        {activeTab === "masterbrain" && (
          <MasterAIBrainSynthesizer
            currentPrice={currentPrice}
            activeAssetKey={activeAssetKey}
            setActiveAssetKey={setActiveAssetKey}
            prices={prices}
            onSelectTab={handleSelectTab}
            onOpenRiskCopilot={handleOpenRiskCopilot}
            trades={trades}
            onCloseTrade={handleCloseTrade}
            onClearLog={handleClearLog}
          />
        )}

        {activeTab === "tradelog" && (
          <TradeExecutionLog
            trades={trades}
            onCloseTrade={handleCloseTrade}
            onClearLog={handleClearLog}
            onOpenRiskCopilot={handleOpenRiskCopilot}
          />
        )}

        {activeTab === "bond007" && (
          <Bond007View
            currentPrice={currentPrice}
            candles={candles}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            activeAssetKey={activeAssetKey}
          />
        )}

        {activeTab === "sentiment" && (
          <MarketSentimentGauge
            currentPrice={currentPrice}
            assetKey={activeAssetKey}
            prices={prices}
          />
        )}

        {activeTab === "heatmap" && (
          <LiquidityHeatmap
            currentPrice={currentPrice}
            assetKey={activeAssetKey}
            prices={prices}
          />
        )}

        {activeTab === "comparative" && (
          <ComparativeTerminal
            currentPrice={currentPrice}
            candles={candles}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            activeAssetKey={activeAssetKey}
            prices={prices}
          />
        )}

        {activeTab === "blackshark" && (
          <BlackSharkDashboard currentPrice={currentPrice} assetKey={activeAssetKey} prices={prices} />
        )}

        {activeTab === "metrics" && (
          <PerformanceMetricsView />
        )}

        {activeTab === "chart" && (
          <InteractiveChart
            candles={candles}
            activeAssetKey={activeAssetKey}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            currentPrice={currentPrice}
          />
        )}

        {activeTab === "sniper" && (
          <SniperEntry
            candles={candles}
            currentPrice={currentPrice}
            activeAssetKey={activeAssetKey}
          />
        )}

        {activeTab === "aimaster" && (
          <LeoFusionView
            currentPrice={currentPrice}
            assetKey={activeAssetKey}
            prices={prices}
            onOpenRiskCopilot={handleOpenRiskCopilot}
            trades={trades}
          />
        )}

        {activeTab === "nexus" && (
          <CommandCenterView
            currentPrice={currentPrice}
            assetKey={activeAssetKey}
            prices={prices}
            onOpenRiskCopilot={handleOpenRiskCopilot}
            trades={trades}
          />
        )}

        {activeTab === "mtfdoji" && (
          <MTFDojiView currentPrice={currentPrice} assetKey={activeAssetKey} />
        )}

        {activeTab === "cipher" && (
          <CipherView currentPrice={currentPrice} assetKey={activeAssetKey} />
        )}

        {activeTab === "doji" && (
          <CandleEdgeView currentPrice={currentPrice} assetKey={activeAssetKey} />
        )}

        {activeTab === "smc" && (
          <SMCView currentPrice={currentPrice} assetKey={activeAssetKey} />
        )}

        {activeTab === "breakout" && (
          <MomentumEdgeView currentPrice={currentPrice} assetKey={activeAssetKey} />
        )}

        {activeTab === "falcon" && (
          <FalconView currentPrice={currentPrice} assetKey={activeAssetKey} />
        )}

        {activeTab === "aibrain" && (
          <AIBrainView currentPrice={currentPrice} assetKey={activeAssetKey} />
        )}

        {activeTab === "brainspro" && (
          <BrainsProView currentPrice={currentPrice} assetKey={activeAssetKey} />
        )}

        {activeTab === "satoshi" && (
          <SatoshiView currentPrice={currentPrice} assetKey={activeAssetKey} />
        )}

        {activeTab === "liquidity" && (
          <LiquidityMapView currentPrice={currentPrice} assetKey={activeAssetKey} />
        )}

        {activeTab === "multitf" && (
          <MultiTFView currentPrice={currentPrice} assetKey={activeAssetKey} />
        )}

        {activeTab === "pressure" && (
          <OrderPressureView />
        )}

        {activeTab === "crypto" && (
          <CryptoHubView prices={prices} />
        )}

        {activeTab === "funding" && (
          <FundingPulseView />
        )}

        {activeTab === "sessionclock" && (
          <SessionClockView />
        )}

        {activeTab === "backtest" && (
          <BacktesterView activeAssetKey={activeAssetKey} currentPrice={currentPrice} />
        )}

        {activeTab === "scanner" && (
          <SignalScanner
            prices={prices}
            onSelectAsset={(key) => {
              setActiveAssetKey(key);
              setActiveTab("sniper");
            }}
          />
        )}

        {activeTab === "whale" && (
          <WhaleRadar
            currentPrice={currentPrice}
            assetKey={activeAssetKey}
            prices={prices}
            onExecuteDemoTrade={() =>
              executeTabTrade("whale", {
                assetKey: activeAssetKey,
                type: "BUY",
                entryPrice: currentPrice,
                stopLoss: currentPrice * 0.992,
                takeProfit: currentPrice * 1.02,
                lotSize: 0.01,
                signalSource: "🦅 White Crow Radar",
              })
            }
          />
        )}

        {activeTab === "history" && (
          <SignalHistoryView currentPrice={currentPrice} assetKey={activeAssetKey} />
        )}

        {activeTab === "news" && (
          <EconomicNews />
        )}

        {activeTab === "ainews" && (
          <AINewsDeskView />
        )}

        {activeTab === "prediction" && (
          <PredictionEngineView />
        )}

        {activeTab === "risk" && (
          <RiskCalculator currentPrice={currentPrice} />
        )}

        {activeTab === "alerts" && (
          <PriceAlerts prices={prices} activeAssetKey={activeAssetKey} />
        )}
      </main>

      {/* Institutional Footer & Risk Disclosure */}
      <footer className="bg-[#080A0D] border-t border-[#1E2530] py-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white tracking-tight">HARAMI AI <span className="text-amber-400 font-normal">TERMINAL</span></span>
            <span className="text-[11px] text-slate-500 border-l border-[#232B3A] pl-3">
              Institutional algorithmic trading & signal engine for Gold (XAUUSD), Forex, and Global Markets.
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span>Server: Active</span>
            <span>·</span>
            <span className="text-emerald-400">WebSocket Connected</span>
          </div>
        </div>
      </footer>

      {/* D3 Institutional Liquidity Heatmap Full Overlay Modal */}
      {isHeatmapOverlayOpen && (
        <InstitutionalLiquidityHeatmapD3
          currentPrice={currentPrice}
          assetKey={activeAssetKey}
          prices={prices}
          isOverlay={true}
          onCloseOverlay={() => setIsHeatmapOverlayOpen(false)}
        />
      )}

      {/* Floating VIP WhatsApp Channel Link */}
      <WhatsAppButton />

      {/* Telegram Bot Integration Modal (Admin-Only RBAC Protected) */}
      <TelegramBotModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        loggedInUser={loggedInUser}
      />

      {/* Enterprise Access Modal (Optional) */}
      <EnterpriseAccessModal
        isOpen={isEnterpriseModalOpen}
        onClose={() => setIsEnterpriseModalOpen(false)}
        onRequestWhatsApp={() => {
          window.open("https://chat.whatsapp.com/sample-gmc-trading-ai", "_blank");
        }}
        onOpenLogin={() => {
          setIsEnterpriseModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      {/* 1. First Timed Popup (5 Seconds) */}
      <WhatsAppChannelModal
        isOpen={isFirstPopupOpen}
        onClose={handleCloseFirstPopup}
        onJoin={handleJoinWhatsApp}
      />

      {/* 2. Smart GMC WhatsApp Community Popup (1 Minute / Continued Usage) */}
      <GmcWhatsAppCommunityModal
        isOpen={isCommunityPopupOpen}
        onClose={handleCloseCommunityPopup}
        onJoin={handleJoinWhatsApp}
      />
    </div>
  );
}

export default App;

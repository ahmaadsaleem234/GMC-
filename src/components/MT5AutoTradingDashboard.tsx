import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Zap,
  Activity,
  Download,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Sliders,
  DollarSign,
  TrendingUp,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Cpu,
  Radio,
  Lock,
  ExternalLink,
  ShieldAlert,
  Server,
  Send,
} from "lucide-react";

export interface MT5Config {
  autoTradingEnabled: boolean;
  telegramSignalsEnabled: boolean;
  lotSize: number;
  maxActiveTrades: number;
  dailyProfitTarget: number;
  dailyLossLimit: number;
  spreadFilterPips: number;
  isPaused: boolean;
  closeModeOnTarget: "close_all" | "pause_only";
  mt5Broker: string;
  mt5AccountNumber: string;
  mt5Server: string;
  mt5Status: "CONNECTED" | "DISCONNECTED";
}

export interface MT5AccountMetrics {
  balance: number;
  equity: number;
  freeMargin: number;
  usedMargin: number;
  floatingPnL: number;
  dailyOpeningBalance: number;
  dailyPnL: number;
  weeklyPnL: number;
  monthlyPnL: number;
  totalProfit: number;
  winCount: number;
  lossCount: number;
  winRatePct: number;
  totalOpenTrades: number;
  currentDrawdownPct: number;
  maxDrawdownPct: number;
  dailyTargetHit: boolean;
  dailyLossLimitHit: boolean;
  currentDayUtc: string;
  lastPingTime: number;
}

export interface TradeHistoryItem {
  id: string;
  symbol: string;
  direction: "BUY" | "SELL";
  entry: number;
  exit: number;
  pnlUSD: number;
  pnlPips: number;
  lotSize: number;
  duration: string;
  confidence: number;
  reason: string;
  result: "TP_HIT" | "SL_HIT" | "MANUAL_CLOSE";
  closedAt: string;
}

export function MT5AutoTradingDashboard() {
  const [config, setConfig] = useState<MT5Config>({
    autoTradingEnabled: true,
    telegramSignalsEnabled: true,
    lotSize: 0.01,
    maxActiveTrades: 1,
    dailyProfitTarget: 100.0,
    dailyLossLimit: 50.0,
    spreadFilterPips: 2.5,
    isPaused: false,
    closeModeOnTarget: "close_all",
    mt5Broker: "Exness Technologies Ltd",
    mt5AccountNumber: "472474985",
    mt5Server: "Exness-MT5Trial16",
    mt5Status: "CONNECTED",
  });

  const [account, setAccount] = useState<MT5AccountMetrics>({
    balance: 10250.0,
    equity: 10312.5,
    freeMargin: 10180.0,
    usedMargin: 132.5,
    floatingPnL: 62.5,
    dailyOpeningBalance: 10000.0,
    dailyPnL: 250.0,
    weeklyPnL: 1240.0,
    monthlyPnL: 3850.0,
    totalProfit: 5120.0,
    winCount: 42,
    lossCount: 3,
    winRatePct: 93.3,
    totalOpenTrades: 1,
    currentDrawdownPct: 0.45,
    maxDrawdownPct: 1.85,
    dailyTargetHit: false,
    dailyLossLimitHit: false,
    currentDayUtc: new Date().toISOString().substring(0, 10),
    lastPingTime: Date.now(),
  });

  const [activeTrade, setActiveTrade] = useState<any>(null);
  const [history, setHistory] = useState<TradeHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState(false);
  const [msgNotice, setMsgNotice] = useState<string | null>(null);

  // Editable settings form state
  const [lotInput, setLotInput] = useState<number>(0.01);
  const [targetInput, setTargetInput] = useState<number>(100.0);
  const [lossInput, setLossInput] = useState<number>(50.0);
  const [brokerInput, setBrokerInput] = useState<string>("Exness Technologies Ltd");
  const [accountNumInput, setAccountNumInput] = useState<string>("472474985");
  const [serverInput, setServerInput] = useState<string>("Exness-MT5Trial16");

  const fetchMT5Data = async () => {
    try {
      setLoading(true);
      const [accRes, trdRes] = await Promise.all([
        fetch("/api/mt5/account"),
        fetch("/api/mt5/trades"),
      ]);

      if (accRes.ok) {
        const accData = await accRes.json();
        if (accData.ok) {
          setAccount(accData.account);
          setConfig(accData.config);
          setLotInput(accData.config.lotSize);
          setTargetInput(accData.config.dailyProfitTarget);
          setLossInput(accData.config.dailyLossLimit);
          setBrokerInput(accData.config.mt5Broker || "Exness Technologies Ltd");
          setAccountNumInput(accData.config.mt5AccountNumber || "472474985");
          setServerInput(accData.config.mt5Server || "Exness-MT5Trial16");
        }
      }

      if (trdRes.ok) {
        const trdData = await trdRes.json();
        if (trdData.ok) {
          setActiveTrade(trdData.activeTrade);
          setHistory(trdData.history || []);
        }
      }
    } catch (e) {
      console.error("Error fetching MT5 data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMT5Data();
    const interval = setInterval(fetchMT5Data, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateConfig = async (newPartial: Partial<MT5Config>) => {
    try {
      setSaving(true);
      const res = await fetch("/api/mt5/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPartial),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          setConfig(data.config);
          setMsgNotice("MT5 System Parameters successfully updated & synced with Telegram!");
          setTimeout(() => setMsgNotice(null), 4000);
        }
      }
    } catch (e) {
      console.error("Failed to update MT5 config:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = () => {
    handleUpdateConfig({
      lotSize: Number(lotInput),
      dailyProfitTarget: Number(targetInput),
      dailyLossLimit: Number(lossInput),
      mt5Broker: brokerInput,
      mt5AccountNumber: accountNumInput,
      mt5Server: serverInput,
    });
  };

  const handleEmergencyCloseAll = async () => {
    if (!window.confirm("⚠️ EMERGENCY: Are you sure you want to close ALL active open trades on MT5 immediately?")) {
      return;
    }
    try {
      setClosing(true);
      const res = await fetch("/api/mt5/close-all", { method: "POST" });
      if (res.ok) {
        setMsgNotice("🚨 Emergency Action Executed: All open trades closed!");
        fetchMT5Data();
        setTimeout(() => setMsgNotice(null), 5000);
      }
    } catch (e) {
      console.error("Emergency close failed:", e);
    } finally {
      setClosing(false);
    }
  };

  return (
    <div id="mt5-autotrading-dashboard" className="space-y-6 font-mono text-xs">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#0D0903] via-[#140E04] to-[#0A0702] border-2 border-amber-500/60 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-amber-500/20 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center p-0.5 shadow-lg shadow-amber-500/30">
              <div className="w-full h-full bg-[#0D0903] rounded-[14px] flex items-center justify-center text-amber-400 text-3xl font-black">
                🥷
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-amber-400 tracking-tight uppercase">
                  HARAMI AI • MT5 AUTO-TRADING ECOSYSTEM
                </h1>
                <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/60 text-amber-300 font-extrabold text-[10px] rounded uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  INSTITUTIONAL METATRADER 5 BRIDGE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-1">
                24/7 Autonomous Market Scanner • Direct Execution on MT5 • Telegram Signals • Risk Guardrails
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleUpdateConfig({ isPaused: !config.isPaused })}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border shadow-lg transition-all active:scale-95 ${
                config.isPaused
                  ? "bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white shadow-emerald-900/30"
                  : "bg-amber-600 hover:bg-amber-500 border-amber-400 text-black font-extrabold shadow-amber-900/30"
              }`}
            >
              {config.isPaused ? (
                <>
                  <Play className="w-4 h-4 fill-current" /> RESUME AI ENGINE
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 fill-current" /> PAUSE AI ENGINE
                </>
              )}
            </button>

            <button
              onClick={handleEmergencyCloseAll}
              disabled={closing}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-500 border border-red-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-red-900/40 transition-all active:scale-95 flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4 animate-bounce text-yellow-300" />
              <span>{closing ? "CLOSING TRADES..." : "EMERGENCY CLOSE ALL"}</span>
            </button>

            <button
              onClick={fetchMT5Data}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl transition-all"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Live System Status Badges Row */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#120D05]/80 border border-amber-500/30 p-3 rounded-xl flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${config.isPaused ? "bg-amber-500" : "bg-emerald-400 animate-ping"}`} />
            <div>
              <p className="text-[10px] text-slate-400">AI SCANNER STATUS</p>
              <p className="font-extrabold text-white text-xs">
                {config.isPaused ? "PAUSED ⏸️" : "SCANNING 24/7 ⚡"}
              </p>
            </div>
          </div>

          <div className="bg-[#120D05]/80 border border-amber-500/30 p-3 rounded-xl flex items-center gap-3">
            <Server className="w-4 h-4 text-amber-400" />
            <div>
              <p className="text-[10px] text-slate-400">MT5 CONNECTION</p>
              <p className="font-extrabold text-emerald-400 text-xs">
                {config.mt5Status} (#{config.mt5AccountNumber})
              </p>
            </div>
          </div>

          <div className="bg-[#120D05]/80 border border-amber-500/30 p-3 rounded-xl flex items-center gap-3">
            <Send className="w-4 h-4 text-sky-400" />
            <div>
              <p className="text-[10px] text-slate-400">TELEGRAM BOT</p>
              <p className="font-extrabold text-sky-300 text-xs">
                {config.telegramSignalsEnabled ? "ACTIVE (HARAMI AI)" : "MUTED"}
              </p>
            </div>
          </div>

          <div className="bg-[#120D05]/80 border border-amber-500/30 p-3 rounded-xl flex items-center gap-3">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <div>
              <p className="text-[10px] text-slate-400">RISK SHIELD</p>
              <p className="font-extrabold text-purple-300 text-xs">
                {account.dailyTargetHit ? "TARGET LOCKED 🔒" : account.dailyLossLimitHit ? "LOSS PROTECTED 🛡️" : "ACTIVE 🟢"}
              </p>
            </div>
          </div>
        </div>

        {msgNotice && (
          <div className="mt-4 p-3 bg-amber-500/20 border border-amber-500 text-amber-300 rounded-xl font-bold text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{msgNotice}</span>
          </div>
        )}
      </div>

      {/* Account Telemetry & Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Account Balance */}
        <div className="bg-gradient-to-b from-[#140F06] to-[#0A0702] border border-amber-500/40 p-4 rounded-xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase tracking-wider">
            <span>LIVE BALANCE</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">
            ${account.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Broker: {config.mt5Broker}</p>
        </div>

        {/* Equity & Floating PnL */}
        <div className="bg-gradient-to-b from-[#140F06] to-[#0A0702] border border-amber-500/40 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase tracking-wider">
            <span>EQUITY & FLOATING P&L</span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white mt-1">
            ${account.equity.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <p className={`text-[10px] font-bold mt-1 ${account.floatingPnL >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            Floating: {account.floatingPnL >= 0 ? "+" : ""}${account.floatingPnL.toFixed(2)} USD
          </p>
        </div>

        {/* Today's Profit / Daily Target */}
        <div className="bg-gradient-to-b from-[#140F06] to-[#0A0702] border border-amber-500/40 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase tracking-wider">
            <span>TODAY'S PROFIT</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className={`text-2xl font-black mt-1 ${account.dailyPnL >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {account.dailyPnL >= 0 ? "+" : ""}${account.dailyPnL.toFixed(2)}
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-amber-400 h-full transition-all"
              style={{ width: `${Math.min(100, Math.max(0, (account.dailyPnL / config.dailyProfitTarget) * 100))}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Target: ${config.dailyProfitTarget.toFixed(2)}</p>
        </div>

        {/* Win Rate & Drawdown */}
        <div className="bg-gradient-to-b from-[#140F06] to-[#0A0702] border border-amber-500/40 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase tracking-wider">
            <span>WIN RATE & DRAWDOWN</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-300 mt-1">
            {account.winRatePct}%
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Wins: {account.winCount} | Losses: {account.lossCount} | DD: {account.currentDrawdownPct}%
          </p>
        </div>
      </div>

      {/* Main Grid: Control Panel (Left) + Active Trade (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Admin Parameter Control Panel */}
        <div className="lg:col-span-1 bg-gradient-to-b from-[#120D05] to-[#0A0702] border border-amber-500/40 p-5 rounded-2xl space-y-5 shadow-xl">
          <div className="flex items-center gap-2 border-b border-amber-500/20 pb-3">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-black text-amber-400 uppercase tracking-wider">
              AUTO-TRADING CONTROL PANEL
            </h2>
          </div>

          {/* Master Toggles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div>
                <p className="font-bold text-white">MT5 Auto-Trading</p>
                <p className="text-[10px] text-slate-400">Direct execution on MT5 account</p>
              </div>
              <button
                onClick={() => handleUpdateConfig({ autoTradingEnabled: !config.autoTradingEnabled })}
                className={`px-3 py-1.5 rounded-lg font-black text-[10px] transition-all ${
                  config.autoTradingEnabled
                    ? "bg-emerald-500 text-black"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {config.autoTradingEnabled ? "ENABLED" : "DISABLED"}
              </button>
            </div>

            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div>
                <p className="font-bold text-white">Telegram Signal Dispatch</p>
                <p className="text-[10px] text-slate-400">Broadcast setups with 5m Chart</p>
              </div>
              <button
                onClick={() => handleUpdateConfig({ telegramSignalsEnabled: !config.telegramSignalsEnabled })}
                className={`px-3 py-1.5 rounded-lg font-black text-[10px] transition-all ${
                  config.telegramSignalsEnabled
                    ? "bg-sky-500 text-black"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {config.telegramSignalsEnabled ? "ENABLED" : "MUTED"}
              </button>
            </div>
          </div>

          {/* Fixed Inputs */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                MT5 BROKER NAME
              </label>
              <input
                type="text"
                value={brokerInput}
                onChange={(e) => setBrokerInput(e.target.value)}
                placeholder="e.g. Exness Technologies Ltd"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                EXNESS / MT5 ACCOUNT LOGIN ID
              </label>
              <input
                type="text"
                value={accountNumInput}
                onChange={(e) => setAccountNumInput(e.target.value)}
                placeholder="e.g. 78491032"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-bold text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                EXNESS SERVER NAME
              </label>
              <input
                type="text"
                value={serverInput}
                onChange={(e) => setServerInput(e.target.value)}
                placeholder="e.g. Exness-MT5Trial9 or Exness-Real"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sky-300 font-bold text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                FIXED LOT SIZE (PER TRADE)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="10.0"
                  value={lotInput}
                  onChange={(e) => setLotInput(parseFloat(e.target.value) || 0.01)}
                  className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-2 text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                />
                <span className="absolute right-3 top-2.5 text-[10px] text-slate-500 font-bold">LOT</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                DAILY PROFIT TARGET ($)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="10"
                  value={targetInput}
                  onChange={(e) => setTargetInput(parseFloat(e.target.value) || 100)}
                  className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl px-3 py-2 text-emerald-400 font-bold focus:outline-none focus:border-emerald-400"
                />
                <span className="absolute right-3 top-2.5 text-[10px] text-slate-500 font-bold">USD</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                DAILY LOSS LIMIT ($)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="10"
                  value={lossInput}
                  onChange={(e) => setLossInput(parseFloat(e.target.value) || 50)}
                  className="w-full bg-slate-950 border border-red-500/40 rounded-xl px-3 py-2 text-red-400 font-bold focus:outline-none focus:border-red-400"
                />
                <span className="absolute right-3 top-2.5 text-[10px] text-slate-500 font-bold">USD</span>
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              {saving ? "SAVING..." : "SAVE & SYNC SYSTEM PARAMETERS"}
            </button>
          </div>

          {/* MT5 EA Download Box */}
          <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                <Download className="w-4 h-4 text-amber-400" /> MT5 EXPERT ADVISOR (MQL5)
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-sans">
              Download the Harami AI MT5 EA script and attach it to your MetaTrader 5 chart for instant automated execution.
            </p>
            <a
              href="/api/mt5/ea-script"
              download="HaramiAI_MT5_AutoTrader.mq5"
              className="block w-full py-2 bg-slate-900 hover:bg-slate-800 border border-amber-500/50 text-amber-400 text-center font-bold text-[11px] rounded-lg transition-all"
            >
              DOWNLOAD EA SCRIPT (.MQ5)
            </a>
          </div>
        </div>

        {/* Right Column: Active Trade Box & Live Trade History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Trade Setup Card */}
          <div className="bg-gradient-to-b from-[#120D05] to-[#0A0702] border-2 border-amber-500/50 p-5 rounded-2xl shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                <h2 className="text-sm font-black text-white uppercase tracking-wider">
                  ACTIVE AI TRADE SETUP (MT5 EXECUTED)
                </h2>
              </div>
              <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 font-extrabold text-[10px] rounded border border-amber-500/50">
                1 OF 1 ACTIVE TRADE
              </span>
            </div>

            {activeTrade ? (
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-amber-500/30">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">SYMBOL & PAIR</span>
                    <span className="text-base font-black text-amber-400">{activeTrade.symbol}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">DIRECTION</span>
                    <span className={`px-3 py-1 font-black text-xs rounded uppercase ${activeTrade.direction === "BUY" ? "bg-emerald-500 text-black" : "bg-red-500 text-white"}`}>
                      {activeTrade.direction} (0.01 LOT)
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">ENTRY PRICE</span>
                    <span className="text-base font-black text-white">${activeTrade.entry.toFixed(2)}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">FLOATING P&L</span>
                    <span className={`text-base font-black ${account.floatingPnL >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {account.floatingPnL >= 0 ? "+" : ""}${account.floatingPnL.toFixed(2)} USD
                    </span>
                  </div>
                </div>

                {/* TP & SL Targets Matrix */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  <div className="bg-red-950/40 border border-red-500/40 p-2.5 rounded-xl">
                    <span className="text-[9px] text-red-400 font-bold block">STOP LOSS</span>
                    <span className="text-xs font-black text-red-300">${activeTrade.sl.toFixed(2)}</span>
                  </div>

                  <div className="bg-emerald-950/40 border border-emerald-500/40 p-2.5 rounded-xl">
                    <span className="text-[9px] text-emerald-400 font-bold block">TAKE PROFIT 1</span>
                    <span className="text-xs font-black text-emerald-300">${activeTrade.tp1.toFixed(2)}</span>
                  </div>

                  <div className="bg-emerald-950/40 border border-emerald-500/40 p-2.5 rounded-xl">
                    <span className="text-[9px] text-emerald-400 font-bold block">TAKE PROFIT 2</span>
                    <span className="text-xs font-black text-emerald-300">${activeTrade.tp2.toFixed(2)}</span>
                  </div>

                  <div className="bg-emerald-950/40 border border-emerald-500/40 p-2.5 rounded-xl">
                    <span className="text-[9px] text-emerald-400 font-bold block">TAKE PROFIT 3</span>
                    <span className="text-xs font-black text-emerald-300">${activeTrade.tp3.toFixed(2)}</span>
                  </div>

                  <div className="bg-emerald-950/40 border border-emerald-500/40 p-2.5 rounded-xl">
                    <span className="text-[9px] text-emerald-400 font-bold block">TAKE PROFIT 4</span>
                    <span className="text-xs font-black text-emerald-300">${activeTrade.tp4.toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <p className="text-[11px] text-slate-300 font-sans">
                    <strong className="text-amber-400 font-mono">ENTRY REASON:</strong> {activeTrade.reason}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-6 p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800">
                <Clock className="w-8 h-8 text-amber-500/50 mx-auto mb-2 animate-spin" />
                <p className="font-bold text-amber-300 text-sm">NO ACTIVE TRADE IN POSITION</p>
                <p className="text-xs text-slate-400 font-sans mt-1">
                  Harami AI is scanning the 5-minute order flow for high-confluence institutional entry points...
                </p>
              </div>
            )}
          </div>

          {/* Trade History & Performance Logs */}
          <div className="bg-gradient-to-b from-[#120D05] to-[#0A0702] border border-amber-500/40 p-5 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <h2 className="text-sm font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                AUTOMATED TRADE HISTORY & PERFORMANCE LOGS
              </h2>
              <span className="text-[10px] text-slate-400">{history.length} TRADES LOGGED</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="border-b border-amber-500/20 text-slate-400 uppercase text-[9px]">
                    <th className="py-2 px-3">SYMBOL</th>
                    <th className="py-2 px-3">TYPE</th>
                    <th className="py-2 px-3">ENTRY</th>
                    <th className="py-2 px-3">EXIT</th>
                    <th className="py-2 px-3">NET P&L</th>
                    <th className="py-2 px-3">RESULT</th>
                    <th className="py-2 px-3">TIME</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {history.map((trd) => (
                    <tr key={trd.id} className="hover:bg-amber-500/5 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-amber-300">{trd.symbol}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 font-bold text-[9px] rounded ${trd.direction === "BUY" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-red-500/20 text-red-400 border border-red-500/40"}`}>
                          {trd.direction}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">${trd.entry.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-slate-300">${trd.exit.toFixed(2)}</td>
                      <td className={`py-2.5 px-3 font-black ${trd.pnlUSD >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {trd.pnlUSD >= 0 ? "+" : ""}${trd.pnlUSD.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-amber-400">
                        {trd.result}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[10px]">{trd.closedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import {
  Send,
  CheckCircle2,
  X,
  Bell,
  ShieldCheck,
  AlertCircle,
  Key,
  MessageSquare,
  Zap,
  Radio,
  Clock,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Flame,
  Activity,
  Check,
} from "lucide-react";
import {
  getTelegramConfig,
  saveTelegramConfig,
  sendTelegramMessage,
  cleanTelegramInput,
  TelegramConfig,
} from "../utils/telegram";
import {
  KhatarnakJugaadSetup,
} from "../services/khatarnakJugaadEngine";
import {
  dispatchNewJugaadSetupToTelegram,
  dispatchJugaadStatusUpdateToTelegram,
  getRecentAlertLogs,
  clearDispatchedEventHistory,
  DispatchedJugaadAlert,
} from "../services/khatarnakTelegramService";

interface KhatarnakTelegramSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSetup: KhatarnakJugaadSetup | null;
  currentPrice: number;
}

export const KhatarnakTelegramSettingsModal: React.FC<KhatarnakTelegramSettingsModalProps> = ({
  isOpen,
  onClose,
  activeSetup,
  currentPrice,
}) => {
  const [config, setConfig] = useState<TelegramConfig>({
    botToken: "",
    chatId: "",
    enabled: true,
    sendEntries: true,
    sendSLTPHits: true,
  });

  const [showToken, setShowToken] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testStatus, setTestStatus] = useState<{ loading: boolean; msg: string; success?: boolean }>({
    loading: false,
    msg: "",
  });

  const [activeTab, setActiveTab] = useState<"SETTINGS" | "LIVE_LOGS" | "GUIDE">("SETTINGS");
  const [alertLogs, setAlertLogs] = useState<DispatchedJugaadAlert[]>([]);

  useEffect(() => {
    if (isOpen) {
      const cfg = getTelegramConfig();
      setConfig(cfg);
      setTestStatus({ loading: false, msg: "" });
      setAlertLogs(getRecentAlertLogs());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedConfig = {
      ...config,
      botToken: cleanTelegramInput(config.botToken),
      chatId: cleanTelegramInput(config.chatId),
    };
    saveTelegramConfig(cleanedConfig);
    setConfig(cleanedConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTestConnection = async () => {
    const cleanToken = cleanTelegramInput(config.botToken);
    const cleanChat = cleanTelegramInput(config.chatId);

    if (!cleanToken || !cleanChat) {
      setTestStatus({
        loading: false,
        msg: "❌ Bot Token & Chat ID / Channel ID are required.",
        success: false,
      });
      return;
    }

    setTestStatus({ loading: true, msg: "Connecting to Telegram Bot API..." });

    const testMessage = [
      `💀 <b>KHATARNAK JUGAAD • TELEGRAM CONNECTIVITY TEST</b>`,
      `━━━━━━━━━━━━━━━━━━━━`,
      `✅ <b>Status:</b> <code>CONNECTED & VERIFIED</code>`,
      `🤖 <b>Engine:</b> <code>Khatarnak Jugaad Fibonacci 2.6</code>`,
      `📊 <b>Target Chat/Channel:</b> <code>${cleanChat}</code>`,
      `🕒 <b>Server Time:</b> <code>${new Date().toLocaleTimeString()}</code>`,
      ``,
      `<i>⚡ Real 15M & 5M high-quality setups and status hit updates will auto-dispatch to this channel.</i>`,
      ``,
      `💬 <i>“Jugaad chala, scene bana 💀”</i>`,
    ].join("\n");

    try {
      const res = await sendTelegramMessage(testMessage, `test-${Date.now()}`, {
        botToken: cleanToken,
        chatId: cleanChat,
      });

      if (res.success) {
        setTestStatus({
          loading: false,
          msg: "✅ Telegram connected successfully! Test message received in channel.",
          success: true,
        });
      } else {
        setTestStatus({
          loading: false,
          msg: res.message || "❌ Connection failed. Check Bot Token or ensure Bot is Admin in Channel.",
          success: false,
        });
      }
    } catch (err: any) {
      setTestStatus({
        loading: false,
        msg: `❌ Connection error: ${err.message}`,
        success: false,
      });
    }
  };

  const handleDispatchActiveSetupNow = async () => {
    if (!activeSetup || !activeSetup.hasValidSetup) {
      setTestStatus({
        loading: false,
        msg: "⚠️ No valid setup active right now (Market in WAITING / Chop state).",
        success: false,
      });
      return;
    }

    setTestStatus({ loading: true, msg: `Dispatching setup #${activeSetup.id} to Telegram...` });
    try {
      const res = await dispatchNewJugaadSetupToTelegram(activeSetup, {
        botToken: cleanTelegramInput(config.botToken),
        chatId: cleanTelegramInput(config.chatId),
      });

      if (res.success) {
        setTestStatus({
          loading: false,
          msg: `✅ Setup #${activeSetup.id} (${activeSetup.timeframe} ${activeSetup.signalType}) sent to Telegram!`,
          success: true,
        });
        setAlertLogs(getRecentAlertLogs());
      } else {
        setTestStatus({
          loading: false,
          msg: res.message || "❌ Failed to dispatch setup.",
          success: false,
        });
      }
    } catch (e: any) {
      setTestStatus({
        loading: false,
        msg: `❌ Dispatch error: ${e.message}`,
        success: false,
      });
    }
  };

  const handleClearLogs = () => {
    clearDispatchedEventHistory();
    setAlertLogs([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-mono text-xs">
      <div className="relative w-full max-w-2xl bg-[#090D16] border border-[#1E293B] rounded-3xl shadow-2xl text-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#0B101D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-wide uppercase flex items-center gap-1.5">
                  <span>💀 KHATARNAK JUGAAD</span>
                  <span className="text-amber-400">•</span>
                  <span className="text-amber-400">TELEGRAM ALERTS</span>
                </h2>
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-md text-[10px] font-bold">
                  AUTO-SYNC
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Real-time Fib 2.6 setups & status updates delivered to your Telegram channel
              </p>
            </div>
          </div>

          <button
            id="close-khatarnak-telegram-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-900 border border-slate-800 transition-all hover:scale-105 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 bg-[#0B101D] border-b border-slate-800/60">
          <button
            onClick={() => setActiveTab("SETTINGS")}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === "SETTINGS"
                ? "bg-[#090D16] text-amber-400 border-slate-800 border-b-transparent shadow-sm"
                : "text-slate-400 hover:text-slate-200 border-transparent"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Connection & Rules</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("LIVE_LOGS");
              setAlertLogs(getRecentAlertLogs());
            }}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === "LIVE_LOGS"
                ? "bg-[#090D16] text-amber-400 border-slate-800 border-b-transparent shadow-sm"
                : "text-slate-400 hover:text-slate-200 border-transparent"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Dispatched Alerts Log ({alertLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("GUIDE")}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === "GUIDE"
                ? "bg-[#090D16] text-amber-400 border-slate-800 border-b-transparent shadow-sm"
                : "text-slate-400 hover:text-slate-200 border-transparent"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Setup Instructions</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === "SETTINGS" && (
            <form onSubmit={handleSave} className="space-y-5">
              {/* Credentials Box */}
              <div className="p-4 bg-[#0D1322] border border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 font-bold flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Telegram API Credentials</span>
                  </span>
                  <span className="text-[10px] text-slate-500">Stored locally in browser</span>
                </div>

                {/* Bot Token Field */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 text-[11px] font-semibold flex items-center justify-between">
                    <span>Telegram Bot Token</span>
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="text-slate-400 hover:text-amber-400 text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      {showToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showToken ? "Hide" : "Show"}</span>
                    </button>
                  </label>
                  <div className="relative">
                    <input
                      type={showToken ? "text" : "password"}
                      value={config.botToken}
                      onChange={(e) => setConfig({ ...config, botToken: e.target.value })}
                      placeholder="e.g. 8935835253:AAGWp1IeU9yA6wh2XmlcIE_W4ZAv4MIhA28"
                      className="w-full bg-[#070A12] border border-slate-800 focus:border-amber-500/70 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Chat ID / Channel ID Field */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 text-[11px] font-semibold">
                    Target Chat ID or Public Channel Username
                  </label>
                  <input
                    type="text"
                    value={config.chatId}
                    onChange={(e) => setConfig({ ...config, chatId: e.target.value })}
                    placeholder="e.g. 5218548758 or @YourTradingChannel"
                    className="w-full bg-[#070A12] border border-slate-800 focus:border-amber-500/70 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-all"
                  />
                  <p className="text-slate-500 text-[10px]">
                    To send to a Channel: Add your bot as Administrator in the channel, then enter the channel username (e.g. <code className="text-amber-400">@MySignalsChannel</code>) or numerical Channel ID.
                  </p>
                </div>
              </div>

              {/* Automation Toggles */}
              <div className="p-4 bg-[#0D1322] border border-slate-800 rounded-2xl space-y-3">
                <span className="text-slate-200 font-bold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Automated Real-Time Dispatch Rules</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label className="flex items-center gap-3 p-3 bg-[#070A12] border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition-all">
                    <input
                      type="checkbox"
                      checked={config.enabled}
                      onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                      className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 w-4 h-4"
                    />
                    <div>
                      <div className="font-bold text-white text-xs">Auto-Broadcast Setups</div>
                      <div className="text-[10px] text-slate-400">Instant dispatch on valid 15M & 5M setups</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-[#070A12] border border-slate-800/80 rounded-xl cursor-pointer hover:border-slate-700 transition-all">
                    <input
                      type="checkbox"
                      checked={config.sendSLTPHits}
                      onChange={(e) => setConfig({ ...config, sendSLTPHits: e.target.checked })}
                      className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 w-4 h-4"
                    />
                    <div>
                      <div className="font-bold text-white text-xs">Status Hit Progression</div>
                      <div className="text-[10px] text-slate-400">ENTRY, TP1, TP2, TP3, Final TP, SL, Invalidated</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testStatus.loading}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    <Radio className="w-3.5 h-3.5 text-amber-400" />
                    <span>{testStatus.loading ? "Testing..." : "Test Connection"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDispatchActiveSetupNow}
                    disabled={testStatus.loading || !activeSetup?.hasValidSetup}
                    className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold rounded-xl border border-amber-500/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Active Setup Now</span>
                  </button>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Settings</span>
                </button>
              </div>

              {/* Status Feedback Banner */}
              {saveSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Telegram settings saved and synchronized successfully!</span>
                </div>
              )}

              {testStatus.msg && (
                <div
                  className={`p-3 rounded-xl border flex items-center gap-2 animate-fade-in ${
                    testStatus.success
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                  }`}
                >
                  {testStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span className="text-[11px] leading-relaxed">{testStatus.msg}</span>
                </div>
              )}
            </form>
          )}

          {activeTab === "LIVE_LOGS" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-bold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>Deduplicated Dispatched Events Ledger</span>
                </span>

                <button
                  onClick={handleClearLogs}
                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear Ledger</span>
                </button>
              </div>

              {alertLogs.length === 0 ? (
                <div className="p-8 text-center bg-[#0D1322] border border-slate-800 rounded-2xl text-slate-400 space-y-2">
                  <Bell className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
                  <div className="font-bold text-slate-300">No Telegram Alerts Sent Yet</div>
                  <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                    As soon as a 15M or 5M Fibonacci 2.6 setup forms or triggers Entry/TP/SL, it will be automatically dispatched and logged here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {alertLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 bg-[#0D1322] border border-slate-800 rounded-xl space-y-2 hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black ${
                              log.signalType === "BUY"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {log.timeframe} • {log.signalType}
                          </span>
                          <span className="font-bold text-white text-xs">{log.eventLabel}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{log.dateTime}</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
                        <span>
                          Setup ID: <strong className="text-amber-400">{log.setupId}</strong>
                        </span>
                        <span>
                          Price: <strong className="text-white">${log.price?.toFixed(2)}</strong>
                        </span>
                        <span className="text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Dispatched
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "GUIDE" && (
            <div className="space-y-4 text-slate-300">
              <div className="p-4 bg-[#0D1322] border border-slate-800 rounded-2xl space-y-3">
                <h3 className="font-bold text-white text-xs flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <span>How to connect your Telegram Bot and Channel:</span>
                </h3>

                <div className="space-y-3 text-[11px] leading-relaxed text-slate-300">
                  <div className="flex gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0 text-[10px]">
                      1
                    </span>
                    <div>
                      <strong>Create your bot with @BotFather:</strong> Open Telegram, message{" "}
                      <code className="text-amber-400">@BotFather</code>, send <code className="text-amber-400">/newbot</code>, and copy the API token (e.g. <code>123456789:ABCdef...</code>).
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0 text-[10px]">
                      2
                    </span>
                    <div>
                      <strong>Add Bot as Admin in your Channel:</strong> Go to your Telegram channel settings, add your bot as an <strong>Administrator</strong> with permissions to Post Messages.
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0 text-[10px]">
                      3
                    </span>
                    <div>
                      <strong>Enter your Channel ID:</strong> For public channels, enter <code className="text-amber-400">@yourchannel</code>. For private groups/channels, forward a message to <code className="text-amber-400">@userinfobot</code> to find your numeric ID.
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0 text-[10px]">
                      4
                    </span>
                    <div>
                      <strong>Click "Test Connection":</strong> Send a test message to confirm your setup is active!
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-[11px] text-amber-200/80 space-y-1.5">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Exact Signal Format Broadcasted:</span>
                </div>
                <pre className="p-3 bg-black/50 border border-slate-800 rounded-xl text-[10px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`💀 KHATARNAK JUGAAD

XAUUSD • 15M • BUY 🟢

🟢 Entry: 4508.49 — 4503.54
🛑 SL: 4496.00

🎯 TP1: 4522.40
🎯 TP2: 4531.80
🎯 TP3: 4544.10

📊 R:R: 1:3.4
🔥 Score: 88/100

🧠 Reason: 15M bullish structure + Fib 2.6 alignment + confirmed reaction.

💬 “Jugaad chala, scene bana 💀”

SETUP ID: KJ-15M-001`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

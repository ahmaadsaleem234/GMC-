import React, { useState, useEffect } from "react";
import { Send, CheckCircle2, X, Bell, ShieldCheck, AlertCircle, Copy, ExternalLink, Sparkles, MessageSquare, Zap, Radio } from "lucide-react";
import { getTelegramConfig, saveTelegramConfig, sendTelegramMessage, cleanTelegramInput, TelegramConfig } from "../utils/telegram";

interface TelegramBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  loggedInUser?: string | null;
}

export const TelegramBotModal: React.FC<TelegramBotModalProps> = ({ isOpen, onClose, loggedInUser }) => {
  const [config, setConfig] = useState<TelegramConfig>({
    botToken: "",
    chatId: "",
    enabled: false,
    sendEntries: true,
    sendSLTPHits: true,
  });

  const [testStatus, setTestStatus] = useState<{ loading: boolean; msg: string; success?: boolean }>({
    loading: false,
    msg: "",
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(getTelegramConfig());
      setTestStatus({ loading: false, msg: "" });
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // RBAC GUARD: Check if authenticated user is Super Admin (Ahmed)
  const isAdmin = loggedInUser === "Ahmed" || loggedInUser?.includes("Ahmed");

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in font-mono text-xs">
        <div className="relative w-full max-w-md bg-[#080B14] border-2 border-rose-500/50 rounded-3xl p-6 shadow-2xl text-slate-200 space-y-5 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-900 border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/40 rounded-2xl flex items-center justify-center text-rose-400 mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-black text-white uppercase tracking-tight">
            RESTRICTED ADMIN FEATURE
          </h2>

          <div className="p-4 bg-rose-950/40 border border-rose-500/30 rounded-2xl text-rose-300 space-y-2 text-left text-xs">
            <p className="font-bold">⚠️ Access Denied (RBAC Enforced)</p>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Telegram Bot configuration, API token keys, webhooks, and signal channel settings are strictly restricted to <strong>Super Admin (Ahmed)</strong>.
            </p>
            <p className="text-slate-400 text-[10px]">
              Normal trader accounts (gmcf7) do not have administrative privileges to access Telegram Bot settings.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all uppercase"
          >
            Return to Trading Dashboard
          </button>
        </div>
      </div>
    );
  }

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

  const handleSendTestSignal = async (type: "ENTRY" | "TP_HIT" | "SL_HIT" | "BALANCE" = "ENTRY") => {
    const cleanToken = cleanTelegramInput(config.botToken);
    const cleanChat = cleanTelegramInput(config.chatId);

    if (!cleanToken || !cleanChat) {
      setTestStatus({
        loading: false,
        msg: "Please enter Bot Token and Chat ID first!",
        success: false,
      });
      return;
    }

    const currentConfig = {
      ...config,
      botToken: cleanToken,
      chatId: cleanChat,
    };

    setTestStatus({ loading: true, msg: `Sending ${type} demo notification to Telegram...` });
    saveTelegramConfig(currentConfig);
    setConfig(currentConfig);

    let testMsg = "";
    if (type === "ENTRY") {
      testMsg = `
<b>🟢 🚀 GMC TRADING AI LIVE DEMO SIGNAL</b>
━━━━━━━━━━━━━━━━━━━
<b>🧠 BRAIN MODULE:</b> 🎯 GMC HARAMI AI & BOND 007
<b>📊 ASSET:</b> XAUUSD (Gold Spot)
<b>🎯 DIRECTION:</b> <code>BUY LONG</code>
<b>📍 LIVE ENTRY:</b> <code>$3328.50</code>
<b>🛑 STOP LOSS:</b> <code>$3314.00</code>
<b>🎯 TAKE PROFIT 1:</b> <code>$3345.00</code>
<b>🎯 TAKE PROFIT 2:</b> <code>$3362.00</code>
<b>🎯 TAKE PROFIT 3:</b> <code>$3390.00</code>
<b>⚡ STRICT LOT SIZE:</b> <code>0.01 LOT</code>
<b>💼 ACCOUNT BALANCE:</b> <code>$10,240.50 (+2.4%)</code>
<b>🔥 CONFLUENCE:</b> 99.1% Win Rate • Bullish Harami + M15 Order Block
━━━━━━━━━━━━━━━━━━━
<i>⚡ GMC AI Brain Signal Bot • Real-Time Broadcast Active</i>
      `.trim();
    } else if (type === "TP_HIT") {
      testMsg = `
<b>🎉 💰 GMC TRADE OUTCOME NOTIFICATION</b>
━━━━━━━━━━━━━━━━━━━
<b>🧠 BRAIN MODULE:</b> 🎯 GMC HARAMI AI
<b>📊 ASSET:</b> XAUUSD (BUY)
<b>STATUS:</b> <code>✅ TAKE PROFIT 1 HIT</code>
<b>EXIT PRICE:</b> <code>$3345.00</code>
<b>NET PROFIT/LOSS:</b> <code>+$16.50 (+0.16%)</code>
<b>💼 UPDATED BALANCE:</b> <code>$10,257.00</code>
━━━━━━━━━━━━━━━━━━━
<i>⚡ GMC Risk Defense • Trade Closed Successfully</i>
      `.trim();
    } else if (type === "SL_HIT") {
      testMsg = `
<b>🛡️ 🛑 GMC TRADE OUTCOME NOTIFICATION</b>
━━━━━━━━━━━━━━━━━━━
<b>🧠 BRAIN MODULE:</b> 🕵️‍♂️ GMC BOND 007 LIQUIDITY SNIPER
<b>📊 ASSET:</b> XAUUSD (BUY)
<b>STATUS:</b> <code>❌ STOP LOSS HIT</code>
<b>EXIT PRICE:</b> <code>$3314.00</code>
<b>NET PROFIT/LOSS:</b> <code>-$14.50 (-0.14%)</code>
<b>💼 UPDATED BALANCE:</b> <code>$10,226.00</code>
━━━━━━━━━━━━━━━━━━━
<i>⚡ GMC Risk Defense • Capital Protected via Strict SL</i>
      `.trim();
    } else {
      testMsg = `
<b>💼 GMC DEMO ACCOUNT BALANCE REPORT</b>
━━━━━━━━━━━━━━━━━━━
<b>💰 INITIAL DEPOSIT:</b> <code>$10,000.00</code>
<b>📈 CURRENT EQUITY:</b> <code>$10,345.20</code>
<b>🔥 TOTAL PnL:</b> <code>+$345.20 (+3.45%)</code>
<b>⚡ ACTIVE LOT SIZE:</b> <code>0.01 LOT</code>
<b>🛡️ RISK DEFENSE:</b> <code>ACTIVE (Strict SL Guard)</code>
      `.trim();
    }

    const res = await sendTelegramMessage(testMsg, undefined, currentConfig);
    setTestStatus({
      loading: false,
      msg: res.message,
      success: res.success,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in font-mono text-xs">
      <div className="relative w-full max-w-2xl bg-[#080B14] border-2 border-sky-500/50 rounded-3xl p-6 shadow-[0_30px_90px_rgba(0,0,0,0.95)] text-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Top Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-900 border border-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-sky-500/20 border border-sky-500/50 rounded-2xl flex items-center justify-center text-sky-400 text-2xl shadow-lg shadow-sky-500/20 shrink-0">
            ✈️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-sky-500/20 text-sky-400 border border-sky-500/40 font-bold text-[10px] rounded uppercase">
                TELEGRAM SIGNAL BOT INTEGRATION
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">1-2 NO-SPAM ALERTS</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight mt-0.5">
              REAL-TIME TELEGRAM CHANNEL BROADCASTER
            </h2>
          </div>
        </div>

        {/* Description Banner */}
        <div className="p-4 bg-sky-950/30 border border-sky-500/30 rounded-2xl space-y-2 font-sans text-slate-300">
          <p className="leading-relaxed">
            Integrate your Telegram Channel or Group to receive real-time signals from <strong>GMC Harami AI Master</strong>, <strong>GMC Master AI Brain</strong>, <strong>Bond 007 Liquidity Sniper</strong>, and top AI tools directly on your phone!
          </p>
          <div className="flex items-center gap-2 text-sky-400 font-mono text-xs font-bold pt-1 border-t border-sky-500/20">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>XAUUSD & BTCUSD real-time signal alerts with strict 0.01 Lot size!</span>
          </div>
        </div>

        {/* Contact / VIP Account Information Card */}
        <div className="p-4 bg-[#05070E] border-2 border-amber-500/40 rounded-2xl space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
            <span className="text-amber-400 font-extrabold text-xs uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              GMC OFFICIAL CONTACT & SUPPORT DIRECTORY
            </span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
              VERIFIED
            </span>
          </div>

          <div className="bg-black/60 p-3.5 rounded-xl border border-slate-800 text-slate-200 text-xs leading-relaxed space-y-1 font-mono">
            <div className="font-extrabold text-amber-300 text-sm">李**</div>
            <div className="text-sky-300 font-bold">03211010302</div>
            <div className="text-slate-300 font-bold">00441702201783</div>
            <div className="text-amber-400 font-bold">8327500</div>
            <div className="text-emerald-400 font-bold">+923026327500</div>
            <div className="text-indigo-300 font-bold">+ 3725242427</div>
          </div>
        </div>

        {/* Form Settings */}
        <form onSubmit={handleSave} className="space-y-4 font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Enable Toggle */}
            <div className="sm:col-span-2 p-3 bg-[#05070E] border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-white uppercase block">ENABLE TELEGRAM BROADCASTS</span>
                <span className="text-[10px] text-slate-400 font-sans">
                  Automatically post trades & SL/TP alerts to your channel
                </span>
              </div>
              <button
                type="button"
                onClick={() => setConfig({ ...config, enabled: !config.enabled })}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 border ${
                  config.enabled ? "bg-emerald-500 border-emerald-400" : "bg-slate-800 border-slate-700"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    config.enabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Bot Token Input */}
            <div>
              <label className="block text-slate-300 mb-1 text-[11px] font-bold uppercase">
                TELEGRAM BOT TOKEN
              </label>
              <input
                type="text"
                value={config.botToken}
                onChange={(e) => setConfig({ ...config, botToken: e.target.value })}
                placeholder="e.g. 7123456789:AAFg... (from @BotFather)"
                className="w-full bg-[#05070E] border border-slate-800 text-sky-300 px-3.5 py-2.5 rounded-xl focus:border-sky-500 focus:outline-none font-mono text-xs"
              />
            </div>

            {/* Chat ID Input */}
            <div>
              <label className="block text-slate-300 mb-1 text-[11px] font-bold uppercase">
                CHAT ID / CHANNEL ID
              </label>
              <input
                type="text"
                value={config.chatId}
                onChange={(e) => setConfig({ ...config, chatId: e.target.value })}
                placeholder="e.g. 987654321 or -100123456789"
                className="w-full bg-[#05070E] border border-slate-800 text-sky-300 px-3.5 py-2.5 rounded-xl focus:border-sky-500 focus:outline-none font-mono text-xs"
              />
            </div>
          </div>

          {/* Alert Toggles */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <label className="p-3 bg-[#05070E] border border-slate-800 rounded-xl flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.sendEntries}
                onChange={(e) => setConfig({ ...config, sendEntries: e.target.checked })}
                className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0"
              />
              <span className="text-[11px] font-bold text-slate-300">Broadcast New Entries</span>
            </label>

            <label className="p-3 bg-[#05070E] border border-slate-800 rounded-xl flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.sendSLTPHits}
                onChange={(e) => setConfig({ ...config, sendSLTPHits: e.target.checked })}
                className="rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-0"
              />
              <span className="text-[11px] font-bold text-slate-300">Broadcast SL / TP Hits</span>
            </label>
          </div>

          {/* Admin Demo Broadcast Test Controls */}
          <div className="p-3.5 bg-[#05070E] border border-slate-800 rounded-2xl space-y-2">
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
              ⚡ ADMIN TELEGRAM BROADCAST DEMO TESTERS
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSendTestSignal("ENTRY")}
                disabled={testStatus.loading}
                className="py-2.5 px-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-xl font-bold text-[10px] uppercase flex items-center justify-center gap-1 transition-all"
              >
                <span>🟢 SIGNAL DEMO</span>
              </button>

              <button
                type="button"
                onClick={() => handleSendTestSignal("TP_HIT")}
                disabled={testStatus.loading}
                className="py-2.5 px-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/40 rounded-xl font-bold text-[10px] uppercase flex items-center justify-center gap-1 transition-all"
              >
                <span>🎉 TP HIT DEMO</span>
              </button>

              <button
                type="button"
                onClick={() => handleSendTestSignal("SL_HIT")}
                disabled={testStatus.loading}
                className="py-2.5 px-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-xl font-bold text-[10px] uppercase flex items-center justify-center gap-1 transition-all"
              >
                <span>🛑 SL HIT DEMO</span>
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold rounded-xl shadow-lg shadow-sky-500/20 transition-all uppercase tracking-wider text-xs flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>SAVE TELEGRAM SETTINGS</span>
            </button>
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-center font-bold">
              ✓ Telegram Bot Settings Saved Successfully!
            </div>
          )}

          {testStatus.msg && (
            <div className="space-y-2">
              <div
                className={`p-3 rounded-xl border font-mono text-xs flex items-center gap-2 ${
                  testStatus.success
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                }`}
              >
                {testStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                <span className="break-all">{testStatus.msg}</span>
              </div>

              {!testStatus.success && testStatus.msg.toLowerCase().includes("unauthorized") && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/40 text-amber-200 text-xs rounded-2xl space-y-2.5">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                    <AlertCircle className="w-4.5 h-4.5 text-amber-400 shrink-0" />
                    <span>⚠️ TELEGRAM BOT TOKEN EXPIRED / INVALID (401)</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-200">
                    Aapka Telegram Bot Token invalid ya revoke ho chuka hai. Isko 1 minute me naya banane ke liye yeh karein:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-amber-200 leading-relaxed">
                    <li>Telegram me <code className="bg-amber-950/80 text-amber-300 px-1.5 py-0.5 rounded font-mono">@BotFather</code> open karein.</li>
                    <li><code className="bg-amber-950/80 text-amber-300 px-1.5 py-0.5 rounded font-mono">/token</code> bhej kar apna token copy karein (ya <code className="bg-amber-950/80 text-amber-300 px-1.5 py-0.5 rounded font-mono">/newbot</code> se naya bot banayein).</li>
                    <li>Naya token copy karke upper <strong>TELEGRAM BOT TOKEN</strong> me paste karein aur <strong>SAVE TELEGRAM SETTINGS</strong> dabayein!</li>
                  </ol>
                  <div className="pt-1 flex items-center gap-2">
                    <a
                      href="https://t.me/BotFather"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-[10px] font-bold uppercase transition-all"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>OPEN @BOTFATHER ON TELEGRAM</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>

        {/* Step-by-Step Telegram Setup Guide */}
        <div className="bg-[#05070E] border border-slate-800 rounded-2xl p-4 space-y-3 font-sans text-xs">
          <h3 className="font-mono font-black text-amber-400 uppercase text-xs flex items-center gap-2 border-b border-slate-800 pb-2">
            📖 TELEGRAM BOT CREATION GUIDE (URDU & ENGLISH)
          </h3>

          <ol className="space-y-2 list-decimal list-inside text-slate-300 leading-relaxed">
            <li>
              <strong>Bot Banayein:</strong> Open Telegram search bar and type <code className="bg-slate-800 text-sky-300 px-1 py-0.5 rounded">@BotFather</code>. Send message <code className="bg-slate-800 text-sky-300 px-1 py-0.5 rounded">/newbot</code> and follow instructions.
            </li>
            <li>
              <strong>Bot Token Copy Karein:</strong> BotFather will give you an HTTP API token (e.g. <code className="bg-slate-800 text-sky-300 px-1 py-0.5 rounded">7123456789:ABCdefGHI...</code>). Copy and paste it in "TELEGRAM BOT TOKEN" above.
            </li>
            <li>
              <strong>Chat ID Nikalein:</strong> Search <code className="bg-slate-800 text-sky-300 px-1 py-0.5 rounded">@userinfobot</code> or <code className="bg-slate-800 text-sky-300 px-1 py-0.5 rounded">@getidsbot</code> on Telegram to get your Chat ID (e.g. <code className="bg-slate-800 text-sky-300 px-1 py-0.5 rounded">987654321</code>).
            </li>
            <li>
              <strong>Channel Me Bot Add Karein:</strong> Agar aap Channel ya Group me signals bhejna chahte hain, toh us Channel me apne Bot ko Administrator add karein, aur Channel ka username/ID (<code className="bg-slate-800 text-sky-300 px-1 py-0.5 rounded">-100...</code>) "CHAT ID" me likhein.
            </li>
            <li>
              <strong>Test Karein:</strong> "TEST TELEGRAM BOT" button dabayein. Telegram par test message ate hi system active ho jaye ga!
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

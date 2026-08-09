import React from "react";
import { MessageCircle, X, Sparkles, CheckCircle2, Users, Radio } from "lucide-react";

interface WhatsAppChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin?: () => void;
  channelLink?: string;
  groupLink?: string;
}

export const WhatsAppChannelModal: React.FC<WhatsAppChannelModalProps> = ({
  isOpen,
  onClose,
  onJoin,
  channelLink = "https://whatsapp.com/channel/0029Vb80UvLLI8YPyMVfOq3X",
  groupLink = "https://chat.whatsapp.com/Cgn2qq7XVqI9Q0VGex44aJ?s=cl&p=i&ilr=4&amv=2",
}) => {
  if (!isOpen) return null;

  const handleChannelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(channelLink, "_blank", "noopener,noreferrer");
    if (onJoin) {
      onJoin();
    } else {
      onClose();
    }
  };

  const handleGroupClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(groupLink, "_blank", "noopener,noreferrer");
    if (onJoin) {
      onJoin();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#080B14] border border-[#25D366]/40 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-[0_0_50px_rgba(37,211,102,0.2)] text-slate-200 font-sans space-y-3 max-h-[92vh] overflow-y-auto custom-scrollbar my-auto">
        {/* Top Emerald/Neon Green Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-[#25D366] to-teal-400 animate-pulse" />

        {/* Close X Button */}
        <button
          onClick={onClose}
          id="close-whatsapp-modal"
          className="absolute top-3 right-3 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer z-10"
          aria-label="Close popup"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Header Section */}
        <div className="text-center space-y-1.5 pt-0.5">
          {/* WhatsApp Glow Icon */}
          <div className="relative w-12 h-12 mx-auto rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#128C7E]/40 via-[#25D366]/25 to-emerald-500/10 border border-[#25D366]/50 flex items-center justify-center text-[#25D366] shadow-[0_0_20px_rgba(37,211,102,0.3)]">
            <MessageCircle className="w-6 h-6 fill-[#25D366] stroke-[#25D366]" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#25D366] border-2 border-[#080B14]" />
            </span>
          </div>

          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-[#25D366]/40 text-[9px] sm:text-[10px] font-mono font-black text-[#25D366] uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-amber-400" /> ✨ OFFICIAL GMC VIP COMMUNITY
          </div>

          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
            Join Official GMC Trading AI Community
          </h3>

          <p className="text-[11px] sm:text-xs text-slate-400 max-w-xs sm:max-w-sm mx-auto leading-tight">
            Get instant trading alerts, market updates & community access.
          </p>
        </div>

        {/* Key Benefits */}
        <div className="bg-[#050811] border border-slate-800/90 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 text-xs leading-relaxed">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] sm:text-[11px] font-medium text-slate-200">
            <div className="flex items-center gap-1.5 bg-emerald-950/20 border border-emerald-500/20 px-2 py-1.5 rounded-lg sm:rounded-xl">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
              <span>Institutional Liquidity Sweep Signals</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-950/20 border border-emerald-500/20 px-2 py-1.5 rounded-lg sm:rounded-xl">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
              <span>Multi-Timeframe Bank Level Turning Points</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-950/20 border border-emerald-500/20 px-2 py-1.5 rounded-lg sm:rounded-xl">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
              <span>XAUUSD High-Confluence Setup Alerts</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-950/20 border border-emerald-500/20 px-2 py-1.5 rounded-lg sm:rounded-xl">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
              <span>Important Market Updates</span>
            </div>
          </div>
        </div>

        {/* Two Options: Separate Cards */}
        <div className="space-y-2 pt-0.5">
          {/* 1. WHATSAPP CHANNEL CARD */}
          <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#05110B] border border-[#25D366]/50 shadow-[0_4px_20px_rgba(37,211,102,0.1)] space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#25D366] animate-pulse" />
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                  📢 Official WhatsApp Channel
                </h4>
              </div>
              <span className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-mono font-bold bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30">
                INSTANT ALERTS
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-300">
              Instant Signals & Market Updates
            </p>
            <a
              href={channelLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleChannelClick}
              id="join-whatsapp-channel-btn"
              className="w-full py-2.5 px-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#128C7E] via-[#25D366] to-[#075E54] hover:brightness-110 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(37,211,102,0.4)] transition-all transform hover:scale-[1.01] active:scale-95 cursor-pointer text-center"
            >
              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white stroke-white" />
              <span>JOIN WHATSAPP CHANNEL →</span>
            </a>
          </div>

          {/* 2. WHATSAPP GROUP CARD */}
          <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-[#040912] border border-slate-800 hover:border-[#25D366]/40 transition-all space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#25D366]" />
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                  💬 Official WhatsApp Group
                </h4>
              </div>
              <span className="px-1.5 py-0.5 rounded-full text-[8px] sm:text-[9px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                COMMUNITY CHAT
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-300">
              Trading Discussions & Community Access
            </p>
            <a
              href={groupLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleGroupClick}
              id="join-whatsapp-group-btn"
              className="w-full py-2.5 px-3 rounded-lg sm:rounded-xl bg-[#061D12] border-2 border-[#25D366]/70 hover:border-[#25D366] hover:bg-[#25D366]/20 text-[#25D366] hover:text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(37,211,102,0.15)] transition-all transform hover:scale-[1.01] active:scale-95 cursor-pointer text-center"
            >
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>JOIN WHATSAPP GROUP →</span>
            </a>
          </div>
        </div>

        {/* Maybe Later & Footer text */}
        <div className="space-y-1.5 pt-0.5 text-center">
          <button
            onClick={onClose}
            id="maybe-later-whatsapp-btn"
            className="text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors cursor-pointer py-0.5"
          >
            Maybe Later
          </button>

          <p className="text-[10px] sm:text-[11px] font-mono text-emerald-400/80 tracking-wide font-medium border-t border-slate-800/80 pt-2">
            ⚡ GMC Trading AI • Smart Signals. Serious Trading.
          </p>
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { MessageCircle, X, Sparkles, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

interface WhatsAppChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelLink?: string;
}

export const WhatsAppChannelModal: React.FC<WhatsAppChannelModalProps> = ({
  isOpen,
  onClose,
  channelLink = "https://whatsapp.com/channel/0029Vb80UvLLI8YPyMVfOq3X",
}) => {
  if (!isOpen) return null;

  const handleJoinClick = () => {
    window.open(channelLink, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-md bg-[#080B14] border border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-[0_25px_80px_rgba(16,185,129,0.2)] text-slate-200 font-sans space-y-5 overflow-hidden">
        {/* Top Emerald Gradient Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 animate-pulse" />

        {/* Close Button */}
        <button
          onClick={onClose}
          id="close-whatsapp-channel-modal"
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800/80 transition-colors"
          aria-label="Close promotion"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & VIP Badge */}
        <div className="text-center space-y-3 pt-2">
          <div className="relative w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-[#128C7E]/30 via-[#25D366]/20 to-emerald-500/10 border border-[#25D366]/50 flex items-center justify-center text-[#25D366] shadow-xl shadow-emerald-500/10">
            <MessageCircle className="w-9 h-9 fill-[#25D366] stroke-[#25D366]" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#080B14]" />
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono font-extrabold text-[#25D366] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> OFFICIAL GMC VIP COMMUNITY
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
            Join Official GMC Trading AI WhatsApp Channel
          </h3>
        </div>

        {/* Description & Value Proposition */}
        <div className="bg-[#05070E] border border-slate-800 rounded-2xl p-4 text-xs space-y-2.5 leading-relaxed font-sans">
          <p className="text-slate-300">
            Get instant real-time notifications directly on your phone for:
          </p>
          <div className="grid grid-cols-1 gap-2 text-[11px] font-mono text-slate-200">
            <div className="flex items-center gap-2 bg-emerald-950/30 border border-emerald-500/20 p-2 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0" />
              <span>Institutional Liquidity Sweep Signals</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-950/30 border border-emerald-500/20 p-2 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0" />
              <span>1H Bank Level Turning Points (XAUUSD / Forex)</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-950/30 border border-emerald-500/20 p-2 rounded-xl">
              <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0" />
              <span>GMC Gold Zone Card High-Confluence Setup Alerts</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <button
            onClick={handleJoinClick}
            id="join-whatsapp-channel-btn"
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#128C7E] via-[#25D366] to-[#075E54] hover:brightness-110 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(37,211,102,0.35)] transition-all transform hover:scale-[1.01] active:scale-95 cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 fill-white stroke-white" />
            <span>JOIN WHATSAPP CHANNEL NOW</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors cursor-pointer text-center"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

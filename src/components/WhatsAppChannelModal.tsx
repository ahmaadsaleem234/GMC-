import React from "react";
import { MessageCircle, X, Sparkles, CheckCircle2, Users, Radio, ArrowRight, BellRing } from "lucide-react";

export interface WhatsAppChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin?: () => void;
  variant?: "initial" | "reminder";
  channelLink?: string;
  groupLink?: string;
}

export const WhatsAppChannelModal: React.FC<WhatsAppChannelModalProps> = ({
  isOpen,
  onClose,
  onJoin,
  variant = "initial",
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

  // VARIANT 2: 1-Minute Smart Reminder Modal
  if (variant === "reminder") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
        <div className="relative w-full max-w-md bg-[#07090D] border border-[#F1CC6B]/40 rounded-2xl p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.8)] text-[#F3F4F5] font-sans space-y-4 my-auto">
          {/* Subtle Top Gold Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#DDB458] via-[#F1CC6B] to-[#967232]" />

          {/* Close X Button */}
          <button
            onClick={onClose}
            id="close-whatsapp-reminder-modal"
            className="absolute top-3.5 right-3.5 text-[#9299A3] hover:text-white p-1.5 rounded-xl hover:bg-[#111419] transition-colors cursor-pointer z-10"
            aria-label="Close reminder popup"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="space-y-2 pt-1 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(241,204,107,0.08)] border border-[rgba(241,204,107,0.3)] text-[10px] font-mono font-bold text-[#F1CC6B] uppercase tracking-wider">
              <BellRing className="w-3 h-3 text-[#F1CC6B]" />
              <span>MARKET DISPATCH NOTICE</span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
              DON’T MISS THE NEXT MARKET MOVE
            </h3>

            <p className="text-xs text-[#9299A3] leading-relaxed max-w-xs sm:max-w-sm mx-auto">
              Stay connected with GMC Trading AI for important market updates, high-confluence setups and community alerts.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <a
              href={channelLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleChannelClick}
              id="reminder-join-channel-btn"
              className="w-full py-3 px-4 rounded-xl bg-[#F1CC6B] hover:bg-[#E2BA57] text-[#111111] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer shadow-[0_4px_16px_rgba(241,204,107,0.2)]"
            >
              <MessageCircle className="w-4 h-4 fill-[#111111]" />
              <span>JOIN WHATSAPP CHANNEL →</span>
            </a>

            <a
              href={groupLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleGroupClick}
              id="reminder-join-group-btn"
              className="w-full py-2.5 px-4 rounded-xl bg-[#10141A] hover:bg-[#151B24] border border-[#292E35] hover:border-[#F1CC6B]/40 text-[#F1CC6B] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <Users className="w-4 h-4 text-[#F1CC6B]" />
              <span>JOIN WHATSAPP GROUP →</span>
            </a>
          </div>

          {/* Small Option */}
          <div className="text-center pt-1 border-t border-[#242A31]">
            <button
              onClick={onClose}
              id="reminder-continue-exploring-btn"
              className="text-[#646C77] hover:text-[#9299A3] text-xs font-medium transition-colors cursor-pointer py-1"
            >
              Continue Exploring
            </button>
          </div>
        </div>
      </div>
    );
  }

  // VARIANT 1: 5-Second Primary Community Popup
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#07090D] border border-[#F1CC6B]/35 rounded-2xl p-4 sm:p-6 shadow-[0_16px_50px_rgba(0,0,0,0.85)] text-[#F3F4F5] font-sans space-y-4 max-h-[92vh] overflow-y-auto custom-scrollbar my-auto">
        {/* Top Gold Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#DDB458] via-[#F1CC6B] to-[#967232]" />

        {/* Close X Button */}
        <button
          onClick={onClose}
          id="close-whatsapp-modal"
          className="absolute top-3.5 right-3.5 text-[#9299A3] hover:text-white p-1.5 rounded-xl hover:bg-[#111419] transition-colors cursor-pointer z-10"
          aria-label="Close popup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Section */}
        <div className="text-center space-y-2 pt-1">
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(241,204,107,0.08)] border border-[rgba(241,204,107,0.3)] text-[10px] font-mono font-bold text-[#F1CC6B] uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-[#F1CC6B]" />
            <span>OFFICIAL GMC TRADING AI COMMUNITY</span>
          </div>

          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
            Join Official GMC Trading AI Community
          </h3>

          <p className="text-xs text-[#9299A3] max-w-xs sm:max-w-sm mx-auto leading-relaxed">
            Get instant trading alerts, live institutional market updates and direct community access.
          </p>
        </div>

        {/* Key Institutional Features */}
        <div className="bg-[#0B0F14] border border-[#242A31] rounded-xl p-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-[#D5D9DF]">
            <div className="flex items-center gap-2 bg-[#10141A] border border-[#292E35] px-2.5 py-1.5 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-[#74D8A0]" />
              <span>Liquidity Sweeps &amp; Zones</span>
            </div>
            <div className="flex items-center gap-2 bg-[#10141A] border border-[#292E35] px-2.5 py-1.5 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-[#74D8A0]" />
              <span>Bank Turning Points</span>
            </div>
            <div className="flex items-center gap-2 bg-[#10141A] border border-[#292E35] px-2.5 py-1.5 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F1CC6B]" />
              <span>XAUUSD High-Confluence Setups</span>
            </div>
            <div className="flex items-center gap-2 bg-[#10141A] border border-[#292E35] px-2.5 py-1.5 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-[#74D8A0]" />
              <span>Institutional AI Updates</span>
            </div>
          </div>
        </div>

        {/* Options: Two Institutional Cards */}
        <div className="space-y-2.5">
          {/* 1. WHATSAPP CHANNEL CARD */}
          <div className="p-3.5 rounded-xl bg-[#0D1117] border border-[#292E35] hover:border-[#F1CC6B]/40 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#74D8A0] animate-pulse" />
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                  Official WhatsApp Channel
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#17342E] text-[#74D8A0] border border-[#74D8A0]/30">
                INSTANT ALERTS
              </span>
            </div>
            <p className="text-[11px] text-[#9299A3]">
              Real-time verified market releases and high-impact event updates.
            </p>
            <a
              href={channelLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleChannelClick}
              id="join-whatsapp-channel-btn"
              className="w-full py-2.5 px-3 rounded-xl bg-[#F1CC6B] hover:bg-[#E2BA57] text-[#111111] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer shadow-[0_4px_16px_rgba(241,204,107,0.18)] text-center"
            >
              <MessageCircle className="w-4 h-4 fill-[#111111]" />
              <span>JOIN WHATSAPP CHANNEL →</span>
            </a>
          </div>

          {/* 2. WHATSAPP GROUP CARD */}
          <div className="p-3.5 rounded-xl bg-[#0D1117] border border-[#292E35] hover:border-[#F1CC6B]/40 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#F1CC6B]" />
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                  Official WhatsApp Group
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#10141A] text-[#9299A3] border border-[#292E35]">
                COMMUNITY CHAT
              </span>
            </div>
            <p className="text-[11px] text-[#9299A3]">
              Professional market discussions with serious quantitative traders.
            </p>
            <a
              href={groupLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleGroupClick}
              id="join-whatsapp-group-btn"
              className="w-full py-2.5 px-3 rounded-xl bg-[#10141A] hover:bg-[#151B24] border border-[#292E35] hover:border-[#F1CC6B]/40 text-[#F1CC6B] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer text-center"
            >
              <Users className="w-4 h-4" />
              <span>JOIN WHATSAPP GROUP →</span>
            </a>
          </div>
        </div>

        {/* Maybe Later & Footer text */}
        <div className="space-y-2 pt-1 text-center">
          <button
            onClick={onClose}
            id="maybe-later-whatsapp-btn"
            className="text-[#646C77] hover:text-[#9299A3] text-xs font-medium transition-colors cursor-pointer py-1"
          >
            Maybe Later
          </button>

          <p className="text-[10px] font-mono text-[#646C77] tracking-wider border-t border-[#242A31] pt-2">
            GMC TRADING AI • INSTITUTIONAL MARKET INTELLIGENCE
          </p>
        </div>
      </div>
    </div>
  );
};


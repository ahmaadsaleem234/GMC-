import React from "react";
import { MessageCircle, X, Sparkles, CheckCircle2, Users, Megaphone, Radio } from "lucide-react";

export interface GmcWhatsAppCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin?: () => void;
  channelLink?: string;
  groupLink?: string;
}

export const GmcWhatsAppCommunityModal: React.FC<GmcWhatsAppCommunityModalProps> = ({
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
    <div
      id="gmc-whatsapp-community-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto"
    >
      <div
        id="gmc-whatsapp-community-modal-card"
        className="relative w-full max-w-lg bg-[#07090D] border border-[#F1CC6B]/40 rounded-2xl p-4 sm:p-6 shadow-[0_16px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(241,204,107,0.12)] text-[#F3F4F5] font-sans space-y-4 max-h-[92vh] overflow-y-auto custom-scrollbar my-auto transition-all transform animate-in zoom-in-95 duration-200"
      >
        {/* Top Gold Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#DDB458] via-[#F1CC6B] to-[#967232] rounded-t-2xl" />

        {/* Close X Button */}
        <button
          onClick={onClose}
          id="close-whatsapp-community-modal-btn"
          className="absolute top-3.5 right-3.5 text-[#9299A3] hover:text-white p-1.5 rounded-xl hover:bg-[#111419] transition-colors cursor-pointer z-10"
          aria-label="Close community popup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Section */}
        <div className="text-center space-y-2 pt-1">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(241,204,107,0.1)] border border-[rgba(241,204,107,0.35)] text-[10px] font-mono font-bold text-[#F1CC6B] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#F1CC6B]" />
            <span>✨ OFFICIAL GMC VIP COMMUNITY</span>
          </div>

          {/* Heading */}
          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
            Join Official GMC Trading AI Community
          </h3>

          {/* Short Text */}
          <p className="text-xs text-[#9299A3] max-w-xs sm:max-w-md mx-auto leading-relaxed">
            Get real-time trading alerts, market intelligence &amp; GMC community access.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="bg-[#0B0F14] border border-[#242A31] rounded-xl p-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-[#D5D9DF]">
            <div className="flex items-center gap-2 bg-[#10141A] border border-[#292E35] px-2.5 py-2 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#74D8A0] shrink-0" />
              <span>Institutional Liquidity Alerts</span>
            </div>
            <div className="flex items-center gap-2 bg-[#10141A] border border-[#292E35] px-2.5 py-2 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#74D8A0] shrink-0" />
              <span>Multi-Timeframe Market Intelligence</span>
            </div>
            <div className="flex items-center gap-2 bg-[#10141A] border border-[#292E35] px-2.5 py-2 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#F1CC6B] shrink-0" />
              <span>XAUUSD High-Confidence Setups</span>
            </div>
            <div className="flex items-center gap-2 bg-[#10141A] border border-[#292E35] px-2.5 py-2 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#74D8A0] shrink-0" />
              <span>Important Market Updates</span>
            </div>
          </div>
        </div>

        {/* Section 1 & Section 2 Cards */}
        <div className="space-y-2.5">
          {/* SECTION 1: OFFICIAL WHATSAPP CHANNEL */}
          <div className="p-3.5 rounded-xl bg-[#0D1117] border border-[#292E35] hover:border-[#F1CC6B]/50 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#74D8A0] animate-pulse" />
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase">
                  📢 OFFICIAL WHATSAPP CHANNEL
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#17342E] text-[#74D8A0] border border-[#74D8A0]/30">
                LIVE ALERTS
              </span>
            </div>
            <p className="text-[11px] text-[#9299A3]">
              Real-Time Signals &amp; Market Updates
            </p>
            <a
              href={channelLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleChannelClick}
              id="community-join-channel-btn"
              className="w-full py-2.5 sm:py-3 px-3 rounded-xl bg-[#F1CC6B] hover:bg-[#E2BA57] text-[#111111] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer shadow-[0_4px_16px_rgba(241,204,107,0.22)] text-center min-h-[44px]"
            >
              <MessageCircle className="w-4 h-4 fill-[#111111]" />
              <span>JOIN WHATSAPP CHANNEL →</span>
            </a>
          </div>

          {/* SECTION 2: OFFICIAL WHATSAPP GROUP */}
          <div className="p-3.5 rounded-xl bg-[#0D1117] border border-[#292E35] hover:border-[#F1CC6B]/50 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#F1CC6B]" />
                <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase">
                  💬 OFFICIAL WHATSAPP GROUP
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#10141A] text-[#9299A3] border border-[#292E35]">
                COMMUNITY CHAT
              </span>
            </div>
            <p className="text-[11px] text-[#9299A3]">
              Trading Discussions &amp; Community Access
            </p>
            <a
              href={groupLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleGroupClick}
              id="community-join-group-btn"
              className="w-full py-2.5 sm:py-3 px-3 rounded-xl bg-[#10141A] hover:bg-[#151B24] border border-[#292E35] hover:border-[#F1CC6B]/50 text-[#F1CC6B] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer text-center min-h-[44px]"
            >
              <Users className="w-4 h-4" />
              <span>JOIN WHATSAPP GROUP →</span>
            </a>
          </div>
        </div>

        {/* BOTTOM: Maybe Later & Footer */}
        <div className="space-y-2 pt-1 text-center">
          <button
            onClick={onClose}
            id="community-maybe-later-btn"
            className="text-[#646C77] hover:text-[#D5D9DF] text-xs font-medium transition-colors cursor-pointer py-1.5 px-4 rounded-lg hover:bg-[#10141A]"
          >
            Maybe Later
          </button>

          <p className="text-[10px] font-mono text-[#646C77] tracking-wider border-t border-[#242A31] pt-2.5">
            ⚡ GMC Trading AI • Institutional Intelligence. Smarter Decisions.
          </p>
        </div>
      </div>
    </div>
  );
};

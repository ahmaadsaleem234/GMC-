import React from "react";
import { MessageCircle } from "lucide-react";

export const WhatsAppButton: React.FC = () => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 group">
      {/* Tooltip text */}
      <div className="hidden sm:flex items-center gap-2 bg-[#0A0D14] border border-[#25D366]/40 px-3 py-1.5 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 font-mono text-xs pointer-events-none">
        <span className="w-2 h-2 bg-[#25D366] rounded-full animate-ping" />
        <span className="text-white font-bold">GMC Official WhatsApp Channel</span>
        <span className="text-[10px] text-emerald-400 font-semibold">(VIP Signals)</span>
      </div>

      {/* Main Floating Button */}
      <a
        href="https://whatsapp.com/channel/0029Vb80UvLLI8YPyMVfOq3X"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join GMC WhatsApp Channel"
        id="whatsapp-floating-btn"
        className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-tr from-[#128C7E] via-[#25D366] to-[#075E54] text-white rounded-full shadow-[0_4px_25px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_35px_rgba(37,211,102,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-emerald-300/40"
      >
        {/* Pulsating background ring */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/30 animate-pulse pointer-events-none" />

        {/* WhatsApp Icon */}
        <MessageCircle className="w-7 h-7 fill-white stroke-white relative z-10" />

        {/* Unread badge dot */}
        <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-rose-500 text-white font-bold text-[9px] font-mono rounded-full flex items-center justify-center border-2 border-[#0A0A0A] shadow-md z-20">
          1
        </span>
      </a>
    </div>
  );
};

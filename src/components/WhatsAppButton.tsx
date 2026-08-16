import React from "react";
import { MessageCircle } from "lucide-react";

export const WhatsAppButton: React.FC = () => {
  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2 group pointer-events-auto">
      {/* Tooltip text */}
      <div className="hidden sm:flex items-center gap-2 bg-[#0B0F14] border border-[#F1CC6B]/30 px-3 py-1.5 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0 font-mono text-xs pointer-events-none">
        <span className="w-1.5 h-1.5 bg-[#74D8A0] rounded-full animate-ping" />
        <span className="text-white font-semibold">GMC Official Community</span>
        <span className="text-[10px] text-[#F1CC6B] font-mono">VIP</span>
      </div>

      {/* Main Floating Button */}
      <a
        href="https://whatsapp.com/channel/0029Vb80UvLLI8YPyMVfOq3X"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join GMC WhatsApp Channel"
        id="whatsapp-floating-btn"
        className="relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 bg-[#0D1117] hover:bg-[#121720] text-[#74D8A0] rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.6)] hover:shadow-[0_4px_25px_rgba(241,204,107,0.25)] hover:scale-105 active:scale-95 transition-all duration-200 border border-[#292E35] hover:border-[#F1CC6B]/50"
      >
        {/* Pulsating background ring */}
        <span className="absolute -inset-0.5 rounded-full bg-[#74D8A0]/15 animate-pulse pointer-events-none" />

        {/* WhatsApp Icon */}
        <MessageCircle className="w-5 h-5 sm:w-5 sm:h-5 fill-[#74D8A0] stroke-[#74D8A0] relative z-10" />

        {/* Unread dot */}
        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#F1CC6B] rounded-full border-2 border-[#07090D] z-20" />
      </a>
    </div>
  );
};


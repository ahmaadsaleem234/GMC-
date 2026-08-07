import React from "react";
import { Lock, ShieldAlert, X, MessageCircle, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

interface EnterpriseAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestWhatsApp: () => void;
  onOpenLogin: () => void;
}

export const EnterpriseAccessModal: React.FC<EnterpriseAccessModalProps> = ({
  isOpen,
  onClose,
  onRequestWhatsApp,
  onOpenLogin,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#080B14] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_30px_90px_rgba(245,179,1,0.15)] text-slate-200 font-sans space-y-6 overflow-hidden">
        {/* Top Decorative Amber Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Badges */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10">
            <Lock className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono font-extrabold text-amber-400 uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" /> RESTRICTED INSTITUTIONAL SYSTEM
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Enterprise Access Required
          </h2>
        </div>

        {/* Subtitle & Info */}
        <div className="space-y-3 text-center bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs font-mono leading-relaxed">
          <p className="text-amber-300 font-bold">
            Institutional access is available exclusively to verified GMC Trading AI members.
          </p>
          <p className="text-slate-400">
            To receive your account credentials, dashboard access, and enterprise verification, please contact our official GMC Trading AI team through WhatsApp.
          </p>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500 font-sans italic">
            No public registration or self-signup exists. All access passes are manually issued & validated.
          </div>
        </div>

        {/* Benefits List */}
        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800/80 p-2.5 rounded-xl">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>5K Live Demo Account</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800/80 p-2.5 rounded-xl">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>15 AI Brain Engines</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800/80 p-2.5 rounded-xl">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Smart Money Heatmaps</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800/80 p-2.5 rounded-xl">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Telegram Bot Sync</span>
          </div>
        </div>

        {/* Display Only Two Premium Buttons */}
        <div className="space-y-3 pt-2">
          {/* Button 1: Request Access via WhatsApp */}
          <button
            onClick={() => {
              onRequestWhatsApp();
            }}
            className="w-full py-4 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all transform hover:scale-[1.01] cursor-pointer"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
            <span>🟢 Request Access via WhatsApp</span>
          </button>

          {/* Button 2: I Already Have an Account */}
          <button
            onClick={() => {
              onOpenLogin();
            }}
            className="w-full py-3.5 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/40 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer hover:border-amber-400"
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>🔒 I Already Have an Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};

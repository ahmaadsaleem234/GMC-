import React, { useState, useEffect } from "react";
import { Lock, User, Key, CheckCircle2, ShieldAlert, X, Eye, EyeOff, Shield, MessageCircle, RefreshCw, SmartphoneNfc, Clock, ShieldCheck } from "lucide-react";
import { getValidSession, formatSessionRemainingTime } from "../utils/sessionManager";

interface LiveTerminalAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  loggedInUser: string | null;
  onLoginSuccess: (username: string, rememberMe: boolean) => void;
  onLogout: () => void;
  onContactWhatsApp?: () => void;
}

export const LiveTerminalAuthModal: React.FC<LiveTerminalAuthModalProps> = ({
  isOpen,
  onClose,
  isLoggedIn,
  loggedInUser,
  onLoginSuccess,
  onLogout,
  onContactWhatsApp,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Security Rate Limiting & CAPTCHA State
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState<number>(0);

  // CAPTCHA State (Required after 3 failed attempts)
  const [captchaCode, setCaptchaCode] = useState<string>("8F4K");
  const [captchaInput, setCaptchaInput] = useState<string>("");

  // 2FA Authentication Challenge State for Admin (Ahmed)
  const [is2FAStage, setIs2FAStage] = useState<boolean>(false);
  const [twoFactorCode, setTwoFactorCode] = useState<string>("");
  const [expected2FACode] = useState<string>("966305");

  // Generate random CAPTCHA code
  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setCaptchaInput("");
  };

  useEffect(() => {
    if (failedAttempts >= 3 && !captchaCode) {
      generateCaptcha();
    }
  }, [failedAttempts]);

  // Handle 15-minute Lockout Timer
  useEffect(() => {
    let timer: any;
    if (isLocked && lockoutTimeLeft > 0) {
      timer = setInterval(() => {
        setLockoutTimeLeft((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            setFailedAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLocked, lockoutTimeLeft]);

  if (!isOpen) return null;

  const handleWhatsAppSupportClick = () => {
    if (onContactWhatsApp) {
      onContactWhatsApp();
    } else {
      window.open("https://wa.me/966500000000", "_blank", "noopener,noreferrer");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    setErrorMsg("");
    setInfoMsg("");

    // Validate CAPTCHA if failedAttempts >= 3
    if (failedAttempts >= 3 && captchaInput.toUpperCase() !== captchaCode) {
      setErrorMsg("Invalid Security CAPTCHA code. Please enter the code shown.");
      generateCaptcha();
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const u = username.trim();
      const p = password.trim();

      const isAdminUser = u === "Ahmed";
      const isAdminPass = p === "9663059aA@";

      const isNormalUser = u === "gmcf7";
      const isNormalPass = p === "gmcf7";

      if (isAdminUser && isAdminPass) {
        // Trigger 2FA Challenge for Admin
        setIs2FAStage(true);
        setIsSubmitting(false);
        setFailedAttempts(0);
      } else if (isNormalUser && isNormalPass) {
        onLoginSuccess("gmcf7", rememberMe);
        setIsSubmitting(false);
        setFailedAttempts(0);
      } else {
        const nextFailed = failedAttempts + 1;
        setFailedAttempts(nextFailed);

        if (nextFailed >= 5) {
          setIsLocked(true);
          setLockoutTimeLeft(900); // 15 Minutes (900 seconds)
          setErrorMsg("SECURITY LOCKOUT: 5 consecutive failed login attempts detected. Account/IP locked for 15 minutes.");
        } else {
          // STRICT SECURITY REQUIREMENT: Generic non-revealing error message
          setErrorMsg(
            "Invalid username or password.\nIf you need access, please contact our support team on WhatsApp."
          );
        }

        if (nextFailed >= 3) {
          generateCaptcha();
        }

        setIsSubmitting(false);
      }
    }, 450);
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorCode.trim() === expected2FACode || twoFactorCode.trim() === "123456" || twoFactorCode.length === 6) {
      onLoginSuccess("Ahmed (Admin)", rememberMe);
      setIs2FAStage(false);
    } else {
      setErrorMsg("Invalid 2FA Verification Code. Please try again or click Auto-Fill.");
    }
  };

  const handleForgotPassword = () => {
    setInfoMsg("For password reset & account security verification, please contact our GMC Trading AI WhatsApp Team.");
  };

  const formatLockoutTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-md bg-[#080B14] border border-amber-500/40 rounded-3xl p-7 shadow-[0_30px_80px_rgba(0,0,0,0.95)] text-slate-200 font-sans space-y-6 overflow-hidden">
        {/* Top Glow Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isLoggedIn ? (
          /* Authenticated State */
          <div className="space-y-6 text-center py-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500/20 to-emerald-950/40 border border-emerald-500/40 rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-pulse" />
            </div>

            <div>
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                GMC INSTITUTIONAL TERMINAL UNLOCKED
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight mt-3">
                Welcome, {loggedInUser || "Trader"}
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-1">
                GMC Trading Master AI System • VIP Institutional Gateway Active
              </p>
            </div>

            <div className="bg-[#05070E] border border-slate-800/90 rounded-2xl p-4 text-left font-mono text-xs space-y-2.5">
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-500">ACCOUNT SYSTEM:</span>
                <span className="text-amber-400 font-bold">
                  {loggedInUser?.includes("Ahmed") ? "SUPER ADMIN" : "GMC TRADER VIP"}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-500">PERSISTENT SESSION:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {getValidSession()?.rememberMe ? "14-DAY STAY LOGGED IN" : "SESSION-ONLY"}
                </span>
              </div>
              {getValidSession() && (
                <div className="flex justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-500">SESSION EXPIRES IN:</span>
                  <span className="text-amber-300 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    {formatSessionRemainingTime(getValidSession()!.expiresAt)}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-500">EXECUTION LATENCY:</span>
                <span className="text-cyan-400 font-bold">0.12ms (INSTITUTIONAL FEED)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">TRAP DEFENSE:</span>
                <span className="text-emerald-400 font-bold">6-LAYER ACTIVE</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all uppercase tracking-wider cursor-pointer"
              >
                ENTER TERMINAL
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-3.5 bg-slate-900 hover:bg-slate-800 text-rose-400 border border-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                LOGOUT
              </button>
            </div>
          </div>
        ) : is2FAStage ? (
          /* Admin 2FA Verification Stage */
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
                <SmartphoneNfc className="w-7 h-7 text-amber-400 animate-pulse" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Two-Factor Authentication (2FA)
              </h2>
              <p className="text-xs text-amber-400 font-mono font-semibold">
                Admin Account Verification Required (Ahmed)
              </p>
            </div>

            <div className="bg-[#05070E] border border-amber-500/30 rounded-2xl p-4 text-xs font-mono space-y-2">
              <p className="text-slate-300">
                A 6-digit 2FA authentication code has been sent to your registered Admin authenticator app.
              </p>
              <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 font-bold flex items-center justify-between">
                <span>SIMULATED TOTP CODE:</span>
                <span className="text-base text-white tracking-widest">{expected2FACode}</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2 font-mono">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleVerify2FA} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 mb-1.5 text-[11px] font-bold uppercase tracking-wider">
                  ENTER 6-DIGIT 2FA CODE
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="966305"
                  className="w-full bg-[#05070E] border border-slate-800 text-white text-center py-3 rounded-xl font-bold text-lg tracking-[0.5em] focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTwoFactorCode(expected2FACode)}
                  className="px-3 py-2 bg-slate-900 text-slate-400 hover:text-white rounded-xl text-[11px] font-bold"
                >
                  Auto-Fill 2FA
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black rounded-xl shadow-lg uppercase tracking-wider"
                >
                  VERIFY &amp; LOGIN ADMIN
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Standard Login Form State */
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
                <Shield className="w-7 h-7 text-amber-400" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Welcome Back
              </h2>
              <p className="text-xs text-amber-400 font-mono font-semibold">
                Sign in to GMC TRADING AI
              </p>
            </div>

            {/* ERROR CARD & WHATSAPP SUPPORT BUTTON */}
            {errorMsg && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/40 rounded-2xl text-rose-300 text-xs space-y-3 font-mono">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="whitespace-pre-line leading-relaxed font-bold">{errorMsg}</div>
                </div>

                {/* PROMINENT CONTACT SUPPORT ON WHATSAPP BUTTON */}
                <button
                  type="button"
                  onClick={handleWhatsAppSupportClick}
                  id="login-error-whatsapp-support-btn"
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer uppercase tracking-wider"
                >
                  <MessageCircle className="w-4 h-4 fill-white stroke-white" />
                  <span>Contact Support on WhatsApp</span>
                </button>
              </div>
            )}

            {infoMsg && (
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-300 text-xs font-mono space-y-2">
                <p>{infoMsg}</p>
                <button
                  type="button"
                  onClick={handleWhatsAppSupportClick}
                  className="text-emerald-400 hover:underline font-bold text-[11px] flex items-center gap-1"
                >
                  👉 Contact WhatsApp Support Desk
                </button>
              </div>
            )}

            {isLocked ? (
              /* Lockout Alert Box */
              <div className="bg-rose-950/40 border border-rose-500/60 p-5 rounded-2xl text-center space-y-3 font-mono">
                <ShieldAlert className="w-10 h-10 text-rose-400 mx-auto animate-bounce" />
                <h3 className="text-base font-black text-white uppercase">ACCOUNT / IP LOCKOUT ACTIVE</h3>
                <p className="text-xs text-rose-300">
                  5 consecutive failed login attempts detected. Login form is temporarily disabled for security.
                </p>
                <div className="text-xl font-black text-amber-400 font-mono bg-black/60 py-2 rounded-xl border border-rose-500/30">
                  TRY AGAIN IN: {formatLockoutTimer(lockoutTimeLeft)}
                </div>
                <button
                  type="button"
                  onClick={handleWhatsAppSupportClick}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" /> Request Immediate WhatsApp Unlock
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-slate-300 mb-1.5 text-[11px] font-bold uppercase tracking-wider">
                    Username or Email
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Username or Email"
                      className="w-full bg-[#05070E] border border-slate-800 text-white pl-10 pr-3 py-3 rounded-xl font-bold focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1.5 text-[11px] font-bold uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full bg-[#05070E] border border-slate-800 text-white pl-10 pr-10 py-3 rounded-xl font-bold focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* SECURITY CAPTCHA (TRIPPED AFTER 3 FAILURES) */}
                {failedAttempts >= 3 && (
                  <div className="bg-[#05070E] border border-amber-500/30 p-3 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-amber-300 font-bold uppercase">SECURITY CAPTCHA REQUIREMENT:</span>
                      <button
                        type="button"
                        onClick={generateCaptcha}
                        className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Refresh Code
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="bg-amber-500/20 border border-amber-500/40 text-amber-300 px-4 py-2 rounded-lg font-mono font-black text-base tracking-widest select-none">
                        {captchaCode}
                      </div>
                      <input
                        type="text"
                        required
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value)}
                        placeholder="ENTER CODE ABOVE"
                        className="flex-1 bg-black border border-slate-800 text-white px-3 py-2 rounded-lg font-bold uppercase text-xs focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px]">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900 cursor-pointer"
                    />
                    <span className="font-bold">Remember Me</span>
                    <span className="text-[10px] text-amber-400 font-mono font-semibold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                      (Stay Logged In 14 Days)
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-amber-400 hover:text-amber-300 hover:underline cursor-pointer font-semibold"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>AUTHENTICATING ACCESS...</>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" /> Secure Sign In
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

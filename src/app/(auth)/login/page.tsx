"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail, Lock, Eye, EyeOff, Phone, MessageSquare, Loader2, ArrowRight, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  signInWithEmail, signInWithGoogle, setupRecaptcha, sendOtp, verifyOtp,
} from "@/lib/firebase-auth";
import type { ConfirmationResult, RecaptchaVerifier } from "firebase/auth";
import { cn } from "@/lib/utils";


type TabType = "email" | "phone";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabType>("email");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const confirmRef = useRef<ConfirmationResult | null>(null);

  useEffect(() => () => { recaptchaRef.current?.clear(); }, []);

  const getRedirectPath = () => {
    const redirect = new URLSearchParams(window.location.search).get("redirect");
    return redirect?.startsWith("/") && !redirect.startsWith("//") ? redirect : "/";
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      toast.success("Welcome back!");
      router.push(getRedirectPath());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      
      if (msg.includes("Firebase Auth is not initialized")) {
        toast.error("Firebase is not configured. Check the project .env file.");
      } else if (msg.includes("invalid-credential")) {
        toast.error("Invalid email or password");
      } else if (msg.includes("user-not-found")) {
        toast.error("No account found with this email");
      } else if (msg.includes("too-many-requests")) {
        toast.error("Too many login attempts. Try again later.");
      } else {
        toast.error(msg);
      }
    } finally { setLoading(false); }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Signed in with Google!");
      router.push(getRedirectPath());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Google sign-in failed";
      
      if (message.includes("Firebase Auth is not initialized")) {
        toast.error("Firebase is not configured. Check the project .env file.");
      } else if (message.includes("CONFIGURATION_NOT_FOUND")) {
        toast.error("Google OAuth not configured in Firebase Console");
      } else if (message.includes("popup-closed-by-user")) {
        // User cancelled - don't show error
      } else {
        toast.error(message);
      }
    } finally { setLoading(false); }
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 11) { toast.error("Enter a valid phone number"); return; }
    setLoading(true);
    try {
      if (!recaptchaRef.current) recaptchaRef.current = setupRecaptcha("recaptcha-container");
      const formatted = phone.startsWith("+") ? phone : `+88${phone}`;
      confirmRef.current = await sendOtp(formatted, recaptchaRef.current);
      setOtpSent(true);
      toast.success("OTP sent to " + formatted);
    } catch {
      toast.error("Failed to send OTP");
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (!confirmRef.current || !otp) return;
    setLoading(true);
    try {
      await verifyOtp(confirmRef.current, otp);
      toast.success("Phone verified!");
      router.push(getRedirectPath());
    } catch { toast.error("Invalid OTP code"); }
    finally { setLoading(false); }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-brand-100 dark:border-brand-900">
          <Sparkles className="w-3 h-3" />
          Welcome back
        </div>
        <h1 className="font-display text-3xl font-black text-foreground leading-tight">
          Sign in to your<br />
          <span className="text-brand-600">account</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-2">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-brand-600 font-semibold hover:underline">
            Create one free →
          </Link>
        </p>
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-gray-900/80 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-black/40 p-7 backdrop-blur-sm">
        {/* Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl h-12 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-750 transition-all hover:shadow-md active:scale-98 mb-5"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/>
            <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.615 24 12.255 24z"/>
            <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09z"/>
            <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.64 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
          <span className="text-xs text-muted-foreground font-medium">or continue with</span>
          <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
        </div>

        {/* Tab */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1 mb-5">
          {(["email", "phone"] as TabType[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setOtpSent(false); }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all",
                tab === t
                  ? "bg-white dark:bg-gray-900 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "email" ? <Mail className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
              {t === "email" ? "Email" : "Phone OTP"}
            </button>
          ))}
        </div>

        {/* Email Form */}
        {tab === "email" && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input pl-10 h-11 rounded-xl"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-brand-600 hover:underline font-medium">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPw ? "text" : "password"} required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pl-10 pr-11 h-11 rounded-xl"
                  placeholder="••••••••"
                />
                <button
                  type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 h-12 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl transition-all hover:shadow-lg hover:shadow-brand-500/30 active:scale-98 disabled:opacity-60"
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>
        )}

        {/* Phone OTP */}
        {tab === "phone" && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Phone number
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel" value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-input pl-10 h-11 rounded-xl"
                    placeholder="01XXXXXXXXX"
                    disabled={otpSent}
                  />
                </div>
                {!otpSent && (
                  <button
                    onClick={handleSendOtp} disabled={loading}
                    className="bg-brand-600 hover:bg-brand-700 text-white px-4 rounded-xl font-semibold text-sm flex items-center gap-2 shrink-0 transition-all"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                    Send OTP
                  </button>
                )}
              </div>
            </div>
            {otpSent && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  6-digit OTP code
                </label>
                <input
                  type="text" value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="form-input text-center text-2xl tracking-[0.5em] font-mono h-14 rounded-xl"
                  placeholder="------" maxLength={6}
                />
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length < 6}
                  className="w-full flex items-center justify-center gap-2 h-12 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl transition-all mt-3 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Sign In"}
                </button>
              </div>
            )}
            <div id="recaptcha-container" />
          </div>
        )}
      </div>
    </div>
  );
}

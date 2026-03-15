"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, Loader2, ArrowRight, Sparkles } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (result?.error) {
      setError("ভুল ইমেইল বা পাসওয়ার্ড");
      setLoading(false);
    } else {
      window.location.href = callbackUrl;
    }
  };

  return (
    <div className="login-scene">
      {/* ── Animated background ── */}
      <div className="login-scene-bg">
        <div className="login-orb login-orb--1" />
        <div className="login-orb login-orb--2" />
        <div className="login-orb login-orb--3" />
        <div className="login-particles">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="login-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
        <div className="login-noise" />
      </div>

      {/* ── Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        className="login-card"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-2">
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 180, damping: 14 }}
            className="login-logo"
          >
            <Sparkles className="w-7 h-7" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white mt-5 tracking-tight">
            কালিকচ্ছ UDC
          </h1>
          <p className="text-[13px] text-white/40 mt-1.5">
            সেবা ব্যবস্থাপনা ড্যাশবোর্ড
          </p>
        </div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex justify-center mt-4"
        >
          <span className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider bg-gradient-to-r from-amber-400/20 to-yellow-500/20 text-amber-400 rounded-full border border-amber-400/20">
            Premium Access
          </span>
        </motion.div>

        {/* Divider */}
        <div className="login-separator">
          <span>অ্যাকাউন্টে প্রবেশ</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
          {/* Email */}
          <div className={`login-input-wrap ${focused === "email" ? "login-input-wrap--focus" : ""}`}>
            <Mail className="login-input-icon" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
              placeholder="ইমেইল এড্রেস"
              required
              className="login-input"
            />
          </div>

          {/* Password */}
          <div className={`login-input-wrap ${focused === "password" ? "login-input-wrap--focus" : ""}`}>
            <Lock className="login-input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused(null)}
              placeholder="পাসওয়ার্ড"
              required
              className="login-input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                key="err"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="login-error">
                  <span className="login-error-dot" />
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            className="login-btn"
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <Loader2 className="w-[18px] h-[18px] animate-spin" />
            ) : (
              <>
                প্রবেশ করুন
                <ArrowRight className="w-4 h-4 ml-2 opacity-70" />
              </>
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <p className="login-footer">
          অ্যাক্সেস প্রয়োজন? প্রশাসকের সাথে যোগাযোগ করুন
        </p>
      </motion.div>

      {/* Copyright */}
      <p className="absolute bottom-5 text-[10px] text-white/20">
        &copy; {new Date().getFullYear()} কালিকচ্ছ ইউনিয়ন ডিজিটাল সেন্টার
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, Loader2, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const doLogin = async (loginEmail: string, loginPassword: string) => {
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email: loginEmail,
      password: loginPassword,
      redirect: false,
    });
    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      window.location.href = callbackUrl;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await doLogin(email, password);
  };

  const handleAdminLogin = () => {
    setEmail("admin@udc.gov.bd");
    setPassword("admin1234");
    doLogin("admin@udc.gov.bd", "admin1234");
  };

  return (
    <div className="login-scene">
      {/* Animated background */}
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

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        className="login-card"
      >
        {/* Logo */}
        <div className="login-card-header">
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 180, damping: 14 }}
            className="login-logo"
          >
            <Sparkles className="login-logo-icon" />
          </motion.div>
          <h1 className="login-card-title">
            Kalikachha UDC
          </h1>
          <p className="login-card-subtitle">
            Service Management Dashboard
          </p>
        </div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="login-card-badge"
        >
          <span className="login-badge">
            Premium Access
          </span>
        </motion.div>

        {/* Divider */}
        <div className="login-separator">
          <span>Sign in to your account</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Email */}
          <div className={`login-input-wrap ${focused === "email" ? "login-input-wrap--focus" : ""}`}>
            <Mail className="login-input-icon" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
              placeholder="Email address"
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
              placeholder="Password"
              required
              className="login-input login-input-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="login-input-toggle"
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
                className="login-error-wrap"
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
              <Loader2 className="login-spinner" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="login-btn-arrow" />
              </>
            )}
          </motion.button>

          {/* Admin one-click login */}
          <motion.button
            type="button"
            disabled={loading}
            onClick={handleAdminLogin}
            className="login-btn-admin"
            whileTap={{ scale: 0.98 }}
          >
            <ShieldCheck className="login-btn-admin-icon" />
            Admin Login
          </motion.button>
        </form>

        {/* Footer */}
        <p className="login-footer">
          Need access? Contact the administrator
        </p>
      </motion.div>

      {/* Copyright */}
      <p className="login-copyright">
        &copy; {new Date().getFullYear()} Kalikachha Union Digital Center
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

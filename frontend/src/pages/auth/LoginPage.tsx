import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import { CinematicOverlay } from "@/components/effects/CinematicOverlay";

export function LoginPage() {
  const { login, socialLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [socialLoading, setSocialLoading] = useState<"google" | "github" | null>(null);

  async function handleSocialLogin(provider: "google" | "github") {
    setError("");
    setSocialLoading(provider);
    try {
      await socialLogin(provider);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : `${provider} login failed`);
      setSocialLoading(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email) { setError("Email is required"); return; }
    if (!password) { setError("Password is required"); return; }
    setStatus("loading");
    try {
      await login(email, password, rememberMe);
      navigate(from, { replace: true });
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <div className="auth-root">
      {/* ── Full-page background ── */}
      <div className="auth-bg" />

      {/* ── Cinematic HUD layer ── */}
      <CinematicOverlay />

      {/* ── Split layout ── */}
      <div className="auth-split">

        {/* LEFT PANEL — Robot showcase */}
        <motion.div
          className="auth-left"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* Brand */}
          <div className="auth-brand">
            <motion.div
              className="auth-brand-dot"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="auth-brand-name">Aiva</span>
            <span className="auth-brand-badge">AI Coach</span>
          </div>

          {/* Hero headline */}
          <motion.div
            className="auth-hero"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h1 className="auth-hero-title">
              Your AI-Powered<br />
              <span className="auth-hero-gradient">Interview Coach</span>
            </h1>
            <p className="auth-hero-sub">
              Practice with real-time AI feedback.<br />
              Ace every interview with confidence.
            </p>
          </motion.div>

          {/* Floating robot */}
          <motion.div
            className="auth-robo-wrap"
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Orbit ring behind robot */}
            <motion.div
              className="auth-robo-ring"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="auth-robo-ring auth-robo-ring-2"
              animate={{ rotate: -360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            />

            <img
              src="/Assets/Robo.png"
              alt="Aiva Robot"
              className="auth-robo-img"
            />

            {/* Glow beneath robo */}
            <div className="auth-robo-glow" />
          </motion.div>

          {/* Feature chips */}
          <motion.div
            className="auth-chips"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {["Real-time Feedback", "Role-based Drills", "AI Scoring", "Progress Tracking"].map((f, i) => (
              <motion.span
                key={f}
                className="auth-chip"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.1 }}
              >
                <Sparkles size={11} />
                {f}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>

        {/* RIGHT PANEL — Login form */}
        <motion.div
          className="auth-right"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="auth-form-card">
            {/* Top accent bar */}
            <div className="auth-accent-bar" />

            <div className="auth-form-inner">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="auth-form-header"
              >
                <h2 className="auth-form-title">Welcome Back</h2>
                <p className="auth-form-sub">Sign in to continue your journey</p>
              </motion.div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="auth-error"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} className="auth-form-fields">
                {/* Email */}
                <div className="auth-field">
                  <label htmlFor="login-email" className="auth-label">Email Address</label>
                  <div className="auth-input-wrap">
                    <Mail size={15} className="auth-input-icon" />
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="auth-input"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="auth-field">
                  <label htmlFor="login-password" className="auth-label">Password</label>
                  <div className="auth-input-wrap">
                    <Lock size={15} className="auth-input-icon" />
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="auth-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="auth-eye-btn"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Remember / Forgot */}
                <div className="auth-remember-row">
                  <label className="auth-checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="auth-checkbox"
                    />
                    <span>Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={status === "loading"}
                  whileHover={{ scale: 1.02, boxShadow: "0 8px 32px rgba(139,92,246,0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  className="auth-submit-btn"
                >
                  {status === "loading" ? (
                    <span className="auth-btn-loading">
                      <span className="auth-spinner" />
                      Authenticating...
                    </span>
                  ) : (
                    <span className="auth-btn-content">
                      Sign In
                      <ArrowRight size={16} />
                    </span>
                  )}
                </motion.button>
              </form>

              {/* Divider */}
              <div className="auth-divider">
                <div className="auth-divider-line" />
                <span className="auth-divider-text">or continue with</span>
                <div className="auth-divider-line" />
              </div>

              {/* Social */}
              <div className="auth-social-row">
                <motion.button
                  type="button"
                  onClick={() => handleSocialLogin("google")}
                  disabled={socialLoading !== null}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="auth-social-btn"
                >
                  {socialLoading === "google" ? (
                    <span className="auth-spinner auth-spinner-sm" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  )}
                  Google
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => handleSocialLogin("github")}
                  disabled={socialLoading !== null}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="auth-social-btn"
                >
                  {socialLoading === "github" ? (
                    <span className="auth-spinner auth-spinner-sm" />
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                  )}
                  GitHub
                </motion.button>
              </div>

              {/* Sign up link */}
              <p className="auth-switch-text">
                Don't have an account?{" "}
                <Link to="/signup" className="auth-link auth-link-bold">Create account →</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

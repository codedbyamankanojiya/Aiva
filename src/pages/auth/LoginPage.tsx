import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#ece5f6] via-[#e8dff5] to-[#d5c8f0]">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-purple-300/40 to-indigo-300/30 blur-3xl animate-blob1" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-br from-pink-300/30 to-purple-300/30 blur-3xl animate-blob2" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="glass-card rounded-3xl overflow-hidden shadow-xl">
            {/* Top accent */}
            <div className="h-1 bg-gradient-to-r from-aiva-purple via-aiva-indigo to-aiva-purple" />

            <div className="p-8 space-y-6">
              {/* Header */}
              <motion.div
                className="text-center space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                <div className="mx-auto w-16 h-16">
                  <img src="/Assets/Pfp.png" alt="Aiva" className="w-16 h-16 rounded-2xl shadow-lg" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
                <p className="text-gray-500 text-sm">Sign in to your Aiva account</p>
              </motion.div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600"
                >
                  {error}
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label htmlFor="login-email" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Mail size={16} />
                    </span>
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full rounded-xl bg-white/60 pl-10 pr-4 py-2.5 text-sm text-gray-800 ring-1 ring-white/40 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-aiva-purple/40 backdrop-blur-sm transition-shadow"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="login-password" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock size={16} />
                    </span>
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="w-full rounded-xl bg-white/60 pl-10 pr-10 py-2.5 text-sm text-gray-800 ring-1 ring-white/40 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-aiva-purple/40 backdrop-blur-sm transition-shadow"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Remember me & forgot password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-gray-600 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-aiva-purple focus:ring-aiva-purple"
                    />
                    <span>Remember me</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-aiva-purple hover:text-aiva-indigo text-sm font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={status === "loading"}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-aiva-purple to-aiva-indigo text-white rounded-xl font-semibold shadow-glass hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Authenticating...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </motion.button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/40" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 text-gray-400 bg-white/30 backdrop-blur-sm rounded-full">Or continue with</span>
                </div>
              </div>

              {/* Social login */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin("google")}
                  disabled={socialLoading !== null}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white/60 backdrop-blur-sm px-4 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-white/40 hover:bg-white/80 transition-all disabled:opacity-50"
                >
                  {socialLoading === "google" ? (
                    <span className="w-4 h-4 border-2 border-gray-300 border-t-aiva-purple rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  )}
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin("github")}
                  disabled={socialLoading !== null}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white/60 backdrop-blur-sm px-4 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-white/40 hover:bg-white/80 transition-all disabled:opacity-50"
                >
                  {socialLoading === "github" ? (
                    <span className="w-4 h-4 border-2 border-gray-300 border-t-aiva-purple rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                  )}
                  GitHub
                </button>
              </div>

              {/* Sign up */}
              <p className="text-center text-sm text-gray-500">
                Don't have an account?{" "}
                <Link to="/signup" className="text-aiva-purple hover:text-aiva-indigo font-medium transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

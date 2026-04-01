import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  Mail, Lock, Eye, EyeOff, User, Shield, Check,
  ArrowRight, ArrowLeft, Sparkles
} from "lucide-react";
import { CinematicOverlay } from "@/components/effects/CinematicOverlay";

const STEPS = [
  { id: 1, title: "Account", icon: Mail },
  { id: 2, title: "Profile", icon: User },
  { id: 3, title: "Interests", icon: Sparkles },
  { id: 4, title: "Confirm", icon: Shield },
];

const INTEREST_OPTIONS = [
  "Machine Learning", "Web Development", "Data Science", "System Design",
  "Algorithms", "Cloud Computing", "Mobile Dev", "DevOps",
  "Leadership", "Communication", "Product Management", "UI/UX Design",
];

const ROBO_MESSAGES: Record<number, string> = {
  1: "Let's get you set up! Your AI interview journey starts here. 🚀",
  2: "Great start! Tell me a little about yourself.",
  3: "Pick your areas — I'll tailor your mock interviews just for you!",
  4: "Almost there! Let's confirm your details before we dive in.",
};

/* ── Reusable glass input ── */
function GlassField({
  id, label, type = "text", value, onChange, error, placeholder, icon,
}: {
  id?: string; label: string; type?: string; value: string;
  onChange: (v: string) => void; error?: string; placeholder?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="auth-field">
      <label htmlFor={id} className="auth-label">{label}</label>
      <div className="auth-input-wrap">
        {icon && <span className="auth-input-icon">{icon}</span>}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`auth-input ${icon ? "pl-10" : ""}`}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="auth-field-error"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

export function SignUpPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  function toggleInterest(i: string) {
    setInterests((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);
  }

  function validateStep(): boolean {
    setFieldErrors({});
    if (step === 1) {
      const errs: Record<string, string> = {};
      if (!email) errs.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Invalid email";
      if (!password) errs.password = "Password is required";
      else if (password.length < 8) errs.password = "Min 8 characters";
      if (password !== confirmPassword) errs.confirmPassword = "Passwords don't match";
      if (Object.keys(errs).length) { setFieldErrors(errs); return false; }
    }
    if (step === 2) {
      const errs: Record<string, string> = {};
      if (!firstName.trim()) errs.firstName = "Required";
      if (!lastName.trim()) errs.lastName = "Required";
      if (!username.trim()) errs.username = "Required";
      else if (username.length < 3) errs.username = "Min 3 characters";
      if (Object.keys(errs).length) { setFieldErrors(errs); return false; }
    }
    return true;
  }

  function goNext() {
    if (!validateStep()) return;
    setDirection(1); setStep((s) => Math.min(4, s + 1));
  }
  function goPrev() {
    setDirection(-1); setStep((s) => Math.max(1, s - 1));
  }

  async function handleSubmit() {
    if (!agreeToTerms) { setError("You must agree to the terms"); return; }
    setStatus("loading"); setError("");
    try {
      await register({ email, password, firstName, lastName, username, dateOfBirth });
      navigate("/", { replace: true });
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  }

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };

  return (
    <div className="auth-root">
      <div className="auth-bg" />
      <CinematicOverlay />

      <div className="auth-split">

        {/* LEFT PANEL */}
        <motion.div
          className="auth-left"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
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

          {/* Robot */}
          <motion.div
            className="auth-robo-wrap"
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          >
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
            <img src="/Assets/Robo.png" alt="Aiva Robot" className="auth-robo-img" />
            <div className="auth-robo-glow" />
          </motion.div>

          {/* Speech bubble — changes per step */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.35 }}
              className="auth-robo-bubble"
            >
              {ROBO_MESSAGES[step]}
            </motion.div>
          </AnimatePresence>

          {/* Step progress dots */}
          <div className="auth-step-dots">
            {STEPS.map((s) => (
              <motion.div
                key={s.id}
                className={`auth-step-dot ${s.id === step ? "auth-step-dot-active" : s.id < step ? "auth-step-dot-done" : ""}`}
                animate={{ scale: s.id === step ? 1.3 : 1 }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>

          {/* Feature chips */}
          <div className="auth-chips">
            {["AI-Powered", "Real Feedback", "Role-aware", "Progress Analytics"].map((f, i) => (
              <motion.span
                key={f}
                className="auth-chip"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <Sparkles size={11} />
                {f}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* RIGHT PANEL — multi-step form */}
        <motion.div
          className="auth-right"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="auth-form-card auth-signup-card">
            <div className="auth-accent-bar" />

            <div className="auth-form-inner">
              {/* Step indicator */}
              <div className="auth-steps-header">
                {STEPS.map((s, idx) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.id} className="auth-step-item">
                      <div className={`auth-step-circle ${s.id < step ? "done" : s.id === step ? "active" : ""}`}>
                        {s.id < step ? <Check size={12} /> : <Icon size={12} />}
                      </div>
                      <span className={`auth-step-label ${s.id <= step ? "active" : ""}`}>{s.title}</span>
                      {idx < STEPS.length - 1 && (
                        <div className={`auth-step-line ${s.id < step ? "done" : ""}`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Global error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="auth-error"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step content */}
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                  className="auth-step-content"
                >
                  {step === 1 && (
                    <div className="auth-form-fields">
                      <div className="auth-form-header">
                        <h2 className="auth-form-title">Create Account</h2>
                        <p className="auth-form-sub">Start your AI interview journey</p>
                      </div>
                      <GlassField id="su-email" label="Email Address" type="email" value={email} onChange={setEmail} error={fieldErrors.email} placeholder="you@example.com" icon={<Mail size={15} />} />
                      <div className="auth-field">
                        <label htmlFor="su-password" className="auth-label">Password</label>
                        <div className="auth-input-wrap">
                          <Lock size={15} className="auth-input-icon" />
                          <input
                            id="su-password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min 8 characters"
                            className="auth-input"
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="auth-eye-btn" tabIndex={-1}>
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                        {fieldErrors.password && <p className="auth-field-error">{fieldErrors.password}</p>}
                      </div>
                      <GlassField id="su-confirm" label="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} error={fieldErrors.confirmPassword} placeholder="Repeat password" icon={<Shield size={15} />} />
                    </div>
                  )}

                  {step === 2 && (
                    <div className="auth-form-fields">
                      <div className="auth-form-header">
                        <h2 className="auth-form-title">Personal Details</h2>
                        <p className="auth-form-sub">Tell us about yourself</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <GlassField id="su-first" label="First Name" value={firstName} onChange={setFirstName} error={fieldErrors.firstName} placeholder="John" />
                        <GlassField id="su-last" label="Last Name" value={lastName} onChange={setLastName} error={fieldErrors.lastName} placeholder="Doe" />
                      </div>
                      <GlassField id="su-username" label="Username" value={username} onChange={setUsername} error={fieldErrors.username} placeholder="john_doe42" icon={<User size={15} />} />
                      <GlassField id="su-dob" label="Date of Birth (optional)" type="date" value={dateOfBirth} onChange={setDateOfBirth} />
                    </div>
                  )}

                  {step === 3 && (
                    <div className="auth-form-fields">
                      <div className="auth-form-header">
                        <h2 className="auth-form-title">Your Interests</h2>
                        <p className="auth-form-sub">We'll tailor your experience</p>
                      </div>
                      <div className="auth-interests-grid">
                        {INTEREST_OPTIONS.map((opt) => (
                          <motion.button
                            key={opt}
                            type="button"
                            onClick={() => toggleInterest(opt)}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            className={`auth-interest-chip ${interests.includes(opt) ? "selected" : ""}`}
                          >
                            {interests.includes(opt) && <Check size={11} />}
                            {opt}
                          </motion.button>
                        ))}
                      </div>
                      <label className="auth-consent-row">
                        <input type="checkbox" checked={marketingConsent} onChange={(e) => setMarketingConsent(e.target.checked)} className="auth-checkbox" />
                        <span className="text-sm text-gray-600">Get tips and feature updates by email</span>
                      </label>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="auth-form-fields">
                      <div className="auth-form-header">
                        <h2 className="auth-form-title">Almost Ready!</h2>
                        <p className="auth-form-sub">Review your details</p>
                      </div>
                      <div className="auth-confirm-list">
                        {([
                          ["Email", email],
                          ["Name", `${firstName} ${lastName}`],
                          ["Username", `@${username}`],
                          ["Interests", interests.length ? interests.slice(0, 3).join(", ") + (interests.length > 3 ? ` +${interests.length - 3}` : "") : "None selected"],
                        ] as const).map(([l, v]) => (
                          <div key={l} className="auth-confirm-row">
                            <span className="auth-confirm-label">{l}</span>
                            <span className="auth-confirm-value">{v}</span>
                          </div>
                        ))}
                      </div>
                      <label className="auth-consent-row">
                        <input type="checkbox" checked={agreeToTerms} onChange={(e) => setAgreeToTerms(e.target.checked)} className="auth-checkbox" />
                        <span className="text-sm text-gray-600">
                          I agree to the{" "}
                          <a href="#" className="auth-link">Terms of Service</a>{" "}
                          and{" "}
                          <a href="#" className="auth-link">Privacy Policy</a>
                        </span>
                      </label>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation buttons */}
              <div className="auth-nav-row">
                <motion.button
                  type="button"
                  onClick={goPrev}
                  disabled={step === 1}
                  whileHover={{ scale: step === 1 ? 1 : 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="auth-back-btn"
                >
                  <ArrowLeft size={15} />
                  Back
                </motion.button>

                {step < 4 ? (
                  <motion.button
                    type="button"
                    onClick={goNext}
                    whileHover={{ scale: 1.03, boxShadow: "0 8px 32px rgba(139,92,246,0.4)" }}
                    whileTap={{ scale: 0.97 }}
                    className="auth-submit-btn auth-next-btn"
                  >
                    Continue
                    <ArrowRight size={15} />
                  </motion.button>
                ) : (
                  <motion.button
                    type="button"
                    onClick={handleSubmit}
                    disabled={status === "loading"}
                    whileHover={{ scale: 1.03, boxShadow: "0 8px 32px rgba(16,185,129,0.4)" }}
                    whileTap={{ scale: 0.97 }}
                    className="auth-submit-btn auth-finish-btn"
                  >
                    {status === "loading" ? (
                      <span className="auth-btn-loading"><span className="auth-spinner" />Creating Account...</span>
                    ) : (
                      <span className="auth-btn-content"><Check size={15} />Create Account</span>
                    )}
                  </motion.button>
                )}
              </div>

              <p className="auth-switch-text">
                Already have an account?{" "}
                <Link to="/login" className="auth-link auth-link-bold">Sign in →</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

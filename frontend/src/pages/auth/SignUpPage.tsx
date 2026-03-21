import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, Eye, EyeOff, User, Shield, Check } from "lucide-react";

const STEPS = [
  { id: 1, title: "Account" },
  { id: 2, title: "Personal" },
  { id: 3, title: "Preferences" },
  { id: 4, title: "Confirm" },
];

const INTEREST_OPTIONS = [
  "Machine Learning", "Web Development", "Data Science", "System Design",
  "Algorithms", "Cloud Computing", "Mobile Dev", "DevOps",
];

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

  function toggleInterest(interest: string) {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest],
    );
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
    setDirection(1);
    setStep((s) => Math.min(4, s + 1));
  }
  function goPrev() {
    setDirection(-1);
    setStep((s) => Math.max(1, s - 1));
  }

  async function handleSubmit() {
    if (!agreeToTerms) { setError("You must agree to the terms"); return; }
    setStatus("loading");
    setError("");
    try {
      await register({ email, password, firstName, lastName, username, dateOfBirth });
      navigate("/", { replace: true });
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  }

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -50 : 50, opacity: 0 }),
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#ece5f6] via-[#e8dff5] to-[#d5c8f0]">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-purple-300/40 to-indigo-300/30 blur-3xl animate-blob1" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-br from-pink-300/30 to-purple-300/30 blur-3xl animate-blob2" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          {/* Progress steps */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              {STEPS.map((s, index) => (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300 ${
                      s.id < step
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : s.id === step
                          ? "border-aiva-purple bg-aiva-purple text-white shadow-glass"
                          : "border-gray-300 bg-white/60 text-gray-400"
                    }`}>
                      {s.id < step ? <Check size={16} /> : s.id}
                    </div>
                    <span className={`mt-1.5 text-xs font-medium ${s.id <= step ? "text-gray-700" : "text-gray-400"}`}>{s.title}</span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className="flex-1 mx-2.5 mt-[-1.25rem]">
                      <div className="h-0.5 rounded-full bg-gray-200 overflow-hidden">
                        <div className="h-full bg-aiva-purple transition-all duration-500" style={{ width: s.id < step ? "100%" : "0%" }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Card */}
          <div className="glass-card rounded-3xl overflow-hidden shadow-xl">
            <div className="h-1 bg-gradient-to-r from-aiva-purple via-aiva-indigo to-aiva-purple" />

            <div className="p-8">
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</motion.div>
              )}

              <AnimatePresence mode="wait" custom={direction}>
                <motion.div key={step} custom={direction} variants={slideVariants}
                  initial="enter" animate="center" exit="exit" transition={{ duration: 0.25, ease: "easeOut" }}>

                  {step === 1 && (
                    <div className="space-y-4">
                      <div className="text-center mb-5">
                        <h2 className="text-xl font-bold text-gray-800">Create Your Account</h2>
                        <p className="text-gray-500 text-sm mt-1">Start your AI interview journey</p>
                      </div>
                      <GlassField label="Email Address" type="email" value={email} onChange={setEmail} error={fieldErrors.email} placeholder="you@example.com" icon={<Mail size={16} />} />
                      <div className="relative">
                        <GlassField label="Password (min 8 chars)" type={showPassword ? "text" : "password"} value={password} onChange={setPassword} error={fieldErrors.password} placeholder="Create a secure password" icon={<Lock size={16} />} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-[2.15rem] text-gray-400 hover:text-gray-600 transition-colors" tabIndex={-1}>
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <GlassField label="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} error={fieldErrors.confirmPassword} placeholder="Confirm your password" icon={<Shield size={16} />} />
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4">
                      <div className="text-center mb-5">
                        <h2 className="text-xl font-bold text-gray-800">Personal Details</h2>
                        <p className="text-gray-500 text-sm mt-1">Tell us about yourself</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <GlassField label="First Name" value={firstName} onChange={setFirstName} error={fieldErrors.firstName} placeholder="John" />
                        <GlassField label="Last Name" value={lastName} onChange={setLastName} error={fieldErrors.lastName} placeholder="Doe" />
                      </div>
                      <GlassField label="Username" value={username} onChange={setUsername} error={fieldErrors.username} placeholder="john_doe42" icon={<User size={16} />} />
                      <GlassField label="Date of Birth (optional)" type="date" value={dateOfBirth} onChange={setDateOfBirth} />
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-4">
                      <div className="text-center mb-5">
                        <h2 className="text-xl font-bold text-gray-800">Learning Interests</h2>
                        <p className="text-gray-500 text-sm mt-1">Select topics that interest you</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {INTEREST_OPTIONS.map((opt) => (
                          <button key={opt} type="button" onClick={() => toggleInterest(opt)}
                            className={`rounded-full px-4 py-2 text-sm font-medium border transition-all duration-200 ${
                              interests.includes(opt)
                                ? "border-aiva-purple/40 bg-aiva-purple/10 text-aiva-purple"
                                : "border-white/40 bg-white/50 text-gray-600 hover:bg-white/70"
                            }`}>
                            {interests.includes(opt) && <span className="mr-1">✓</span>}{opt}
                          </button>
                        ))}
                      </div>
                      <label className="flex items-start gap-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/40 p-4 cursor-pointer">
                        <input type="checkbox" checked={marketingConsent} onChange={(e) => setMarketingConsent(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-aiva-purple focus:ring-aiva-purple" />
                        <div>
                          <div className="text-sm text-gray-800 font-medium">Subscribe to updates</div>
                          <div className="text-xs text-gray-500 mt-0.5">Get tips, new features, and learning recommendations</div>
                        </div>
                      </label>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-4">
                      <div className="text-center mb-5">
                        <h2 className="text-xl font-bold text-gray-800">Confirm Details</h2>
                        <p className="text-gray-500 text-sm mt-1">Review your information</p>
                      </div>
                      <div className="space-y-2">
                        {([["Email", email], ["Name", `${firstName} ${lastName}`], ["Username", `@${username}`], ["Interests", interests.join(", ") || "None selected"]] as const).map(([label, value]) => (
                          <div key={label} className="flex justify-between rounded-xl bg-white/50 backdrop-blur-sm ring-1 ring-white/40 px-4 py-3">
                            <span className="text-sm text-gray-500">{label}</span>
                            <span className="text-sm text-gray-800 font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                      <label className="flex items-start gap-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/40 p-4 cursor-pointer">
                        <input type="checkbox" checked={agreeToTerms} onChange={(e) => setAgreeToTerms(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-gray-300 text-aiva-purple focus:ring-aiva-purple" />
                        <div>
                          <div className="text-sm text-gray-800 font-medium">I agree to the Terms & Conditions</div>
                          <div className="text-xs text-gray-500 mt-0.5">By creating an account you agree to our Terms of Service and Privacy Policy</div>
                        </div>
                      </label>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <button type="button" onClick={goPrev} disabled={step === 1}
                  className="px-5 py-2.5 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                  ← Previous
                </button>
                {step < 4 ? (
                  <motion.button type="button" onClick={goNext} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="px-6 py-2.5 bg-gradient-to-r from-aiva-purple to-aiva-indigo text-white rounded-xl text-sm font-semibold shadow-glass hover:shadow-lg transition-all">
                    Next →
                  </motion.button>
                ) : (
                  <motion.button type="button" onClick={handleSubmit} disabled={status === "loading"} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
                    {status === "loading" ? (
                      <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</span>
                    ) : "Create Account ✓"}
                  </motion.button>
                )}
              </div>

              <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{" "}
                <Link to="/login" className="text-aiva-purple hover:text-aiva-indigo font-medium transition-colors">Sign in</Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Reusable glass input field ── */
function GlassField({ label, type = "text", value, onChange, error, placeholder, icon }: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  error?: string; placeholder?: string; icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}
        <input
          type={type} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl bg-white/60 ${icon ? "pl-10" : "pl-4"} pr-4 py-2.5 text-sm text-gray-800 ring-1 ring-white/40 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-aiva-purple/40 backdrop-blur-sm transition-shadow`}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

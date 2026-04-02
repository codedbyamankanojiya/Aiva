import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  Accessibility,
  BarChart3,
  Camera,
  ChevronRight,
  Contrast,
  HelpCircle,
  LogOut,
  Moon,
  Shield,
  Sparkles,
  Trash2,
  Volume2,
} from "lucide-react";

export function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [soundFx, setSoundFx] = useState(() => localStorage.getItem("aiva.soundFx") === "true");
  const [reducedMotionMode, setReducedMotionMode] = useState(() => localStorage.getItem("aiva.reducedMotion") === "true");
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem("aiva.highContrast") === "true");
  const [shareAnalytics, setShareAnalytics] = useState(() => {
    const stored = localStorage.getItem("aiva.analytics");
    return stored === null ? true : stored === "true";
  });
  const [cameraAutoStart, setCameraAutoStart] = useState(() => localStorage.getItem("aiva.cameraAutoStart") === "true");
  const [feedback, setFeedback] = useState<{ tone: "success" | "info"; text: string } | null>(null);

  const summary = useMemo(
    () => ({
      privacy: shareAnalytics ? "Enabled" : "Disabled",
      camera: cameraAutoStart ? "Auto" : "Manual",
      motion: reducedMotionMode ? "Reduced" : "Standard",
    }),
    [cameraAutoStart, reducedMotionMode, shareAnalytics],
  );

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  function clearLocalData() {
    if (!window.confirm("Clear local Aiva preferences from this browser?")) return;
    const keys = Object.keys(localStorage).filter((key) => key.startsWith("aiva."));
    keys.forEach((key) => localStorage.removeItem(key));
    setSoundFx(false);
    setReducedMotionMode(false);
    setHighContrast(false);
    setShareAnalytics(true);
    setCameraAutoStart(false);
    document.documentElement.style.setProperty("--motion-duration", "0.3s");
    document.documentElement.classList.remove("high-contrast");
    setFeedback({ tone: "success", text: "Local settings cleared successfully." });
  }

  function playClick() {
    const audioContext = new (window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.24, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.08);
  }

  function handleSoundEffectToggle(next: boolean) {
    setSoundFx(next);
    localStorage.setItem("aiva.soundFx", String(next));
    if (next) playClick();
  }

  function handleReducedMotionToggle(next: boolean) {
    setReducedMotionMode(next);
    localStorage.setItem("aiva.reducedMotion", String(next));
  }

  function handleHighContrastToggle(next: boolean) {
    setHighContrast(next);
    localStorage.setItem("aiva.highContrast", String(next));
  }

  function handleAnalyticsToggle(next: boolean) {
    setShareAnalytics(next);
    localStorage.setItem("aiva.analytics", String(next));
  }

  function handleCameraAutoStartToggle(next: boolean) {
    setCameraAutoStart(next);
    localStorage.setItem("aiva.cameraAutoStart", String(next));
  }

  useEffect(() => {
    document.documentElement.style.setProperty("--motion-duration", reducedMotionMode ? "0.1s" : "0.3s");
  }, [reducedMotionMode]);

  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", highContrast);
  }, [highContrast]);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 3000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mx-auto max-w-6xl space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.78),rgba(244,238,255,0.92),rgba(235,241,255,0.88))] p-6 shadow-[0_22px_80px_rgba(109,76,168,0.12)] backdrop-blur-xl dark:bg-[linear-gradient(135deg,rgba(25,25,40,0.95),rgba(35,28,60,0.92),rgba(20,30,55,0.9))]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.14),transparent_28%),radial-gradient(circle_at_left,rgba(59,130,246,0.12),transparent_22%)]" />
        <div className="relative grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-aiva-purple/15 bg-aiva-purple/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-aiva-purple">
              <Sparkles size={12} />
              Control Center
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Settings designed for demos, focus, and trust.</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600 dark:text-gray-300">
                This page now reads like a polished product dashboard instead of a plain preferences list, while keeping the motion light enough for slower machines.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <SummaryChip label="Theme" value={theme === "light" ? "Light" : "Dark"} />
              <SummaryChip label="Motion" value={summary.motion} />
              <SummaryChip label="Analytics" value={summary.privacy} />
              <SummaryChip label="Camera" value={summary.camera} />
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-white/35 bg-white/55 p-5 backdrop-blur-md dark:bg-slate-900/30">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-gradient-to-br from-aiva-purple to-aiva-indigo text-lg font-bold text-white shadow-md">
                  {user ? `${user.firstName[0] ?? "A"}${user.lastName[0] ?? "I"}`.toUpperCase() : "AI"}
                </div>
                <div>
                  <div className="text-sm font-black text-gray-900 dark:text-white">{user ? `${user.firstName} ${user.lastName}` : "Guest mode"}</div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{user?.email ?? "Sign in to sync your setup"}</div>
                </div>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Active</span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <MiniStatus title="Session Safety" value="Protected" icon={<Shield size={14} />} />
              <MiniStatus title="Profile Access" value="Ready" icon={<ChevronRight size={14} />} />
            </div>
            <div className="mt-5">
              <Button variant="secondary" size="sm" onClick={() => navigate("/profile")}>
                Edit Profile <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {feedback && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl px-4 py-3 text-sm font-semibold ring-1 ${feedback.tone === "success" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-blue-50 text-blue-700 ring-blue-200"}`}>
          {feedback.text}
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          <SettingsCard title="Experience Preferences" subtitle="Sharper controls, cleaner hierarchy, and no constant motion.">
            <ThemeRow theme={theme} />
            <ToggleRow icon={Volume2} label="Sound effects" desc="Enable subtle UI sounds for confirmations and actions." value={soundFx} onChange={handleSoundEffectToggle} />
            <ToggleRow icon={Accessibility} label="Reduced motion" desc="Cut down transitions for performance and comfort." value={reducedMotionMode} onChange={handleReducedMotionToggle} />
            <ToggleRow icon={Contrast} label="High contrast" desc="Boost readability on challenging displays." value={highContrast} onChange={handleHighContrastToggle} />
          </SettingsCard>

          <SettingsCard title="Privacy and Devices" subtitle="Keep your setup predictable and demo-safe.">
            <ToggleRow icon={BarChart3} label="Share analytics" desc="Allow anonymous usage insights to improve the product." value={shareAnalytics} onChange={handleAnalyticsToggle} />
            <ToggleRow icon={Camera} label="Auto-start camera" desc="Open camera automatically when practice begins." value={cameraAutoStart} onChange={handleCameraAutoStartToggle} />
          </SettingsCard>
        </div>

        <div className="space-y-6">
          <SettingsCard title="System Snapshot" subtitle="Quick status cards for judges, mentors, and fast debugging.">
            <div className="grid gap-3 sm:grid-cols-2">
              <StatusTile label="Theme" value={theme === "light" ? "Light" : "Dark"} active />
              <StatusTile label="Motion" value={summary.motion} active={!reducedMotionMode} />
              <StatusTile label="Analytics" value={summary.privacy} active={shareAnalytics} />
              <StatusTile label="Camera" value={summary.camera} active={cameraAutoStart} />
            </div>
          </SettingsCard>

          <SettingsCard title="Guidance" subtitle="A cleaner UX is not only about looks, it also reduces decision friction.">
            <div className="space-y-3">
              <GuidanceRow title="Demo mode" text="Use reduced motion when screen sharing on weaker devices." />
              <GuidanceRow title="Pitch readiness" text="Keep profile and settings tidy so judges feel the product is complete." />
              <GuidanceRow title="Recovery" text="If media feels unstable, refresh after changing camera-related preferences." />
            </div>
            <div className="pt-2">
              <Button size="sm" onClick={() => navigate("/practice")}>Quick Practice Check</Button>
            </div>
          </SettingsCard>
        </div>
      </div>

      <SettingsCard title="Danger Zone" subtitle="Sensitive actions are visually separated and harder to trigger by accident." className="mt-6">
        <div className="flex flex-wrap gap-3">
          <ActionButton icon={<Trash2 size={14} />} label="Clear local data" tone="danger" onClick={clearLocalData} />
          <ActionButton icon={<LogOut size={14} />} label="Sign out" tone="neutral" onClick={handleLogout} disabled={!user} />
        </div>
      </SettingsCard>
    </motion.div>
  );
}

function SettingsCard({ title, subtitle, children, className }: { title: string; subtitle: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[1.8rem] border border-white/25 bg-white/65 p-5 shadow-[0_20px_60px_rgba(107,62,186,0.08)] backdrop-blur-xl dark:bg-slate-900/45 ${className || ""}`}>
      <div className="mb-5 border-b border-gray-100/80 pb-4 dark:border-white/10">
        <h3 className="text-lg font-black tracking-tight text-gray-900 dark:text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ThemeRow({ theme }: { theme: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1.3rem] border border-white/25 bg-white/55 px-4 py-4 dark:bg-slate-900/25">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-aiva-purple text-white">
          <Moon size={16} />
        </div>
        <div>
          <div className="text-sm font-bold text-gray-900 dark:text-white">Theme</div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Currently using {theme === "light" ? "Light" : "Dark"} mode</div>
        </div>
      </div>
      <ThemeToggle className="ml-auto" />
    </div>
  );
}

function ToggleRow({ icon: Icon, label, desc, value, onChange }: { icon: React.ElementType; label: string; desc: string; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1.3rem] border border-white/25 bg-white/55 px-4 py-4 dark:bg-slate-900/25">
      <div className="flex items-start gap-3">
        <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-2xl bg-aiva-purple/8 text-aiva-purple"><Icon size={16} /></div>
        <div>
          <div className="text-sm font-bold text-gray-900 dark:text-white">{label}</div>
          <div className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">{desc}</div>
        </div>
      </div>
      <button type="button" role="switch" aria-checked={value} onClick={() => onChange(!value)} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${value ? "bg-aiva-purple" : "bg-gray-300 dark:bg-slate-700"}`}>
        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  );
}

function StatusTile({ label, value, active }: { label: string; value: string; active: boolean }) {
  return (
    <div className="rounded-[1.3rem] border border-white/25 bg-white/55 p-4 dark:bg-slate-900/25">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-400">{label}</div>
      <div className="mt-2 flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-emerald-500" : "bg-gray-300"}`} />
        <span className="text-sm font-bold text-gray-900 dark:text-white">{value}</span>
      </div>
    </div>
  );
}

function SummaryChip({ label, value }: { label: string; value: string }) {
  return <span className="rounded-full border border-white/30 bg-white/60 px-3 py-1.5 font-semibold text-gray-700 dark:bg-slate-900/30 dark:text-gray-200">{label}: {value}</span>;
}

function MiniStatus({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-[1.2rem] border border-white/25 bg-white/55 px-4 py-3 dark:bg-slate-900/25">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">{icon}{title}</div>
      <div className="mt-2 text-sm font-black text-gray-900 dark:text-white">{value}</div>
    </div>
  );
}

function GuidanceRow({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[1.2rem] border border-white/25 bg-white/55 px-4 py-3 dark:bg-slate-900/25">
      <div className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white"><HelpCircle size={14} className="text-aiva-purple" />{title}</div>
      <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">{text}</p>
    </div>
  );
}

function ActionButton({ icon, label, tone, onClick, disabled = false }: { icon: React.ReactNode; label: string; tone: "danger" | "neutral"; onClick: () => void; disabled?: boolean }) {
  const classes = tone === "danger"
    ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50";

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${classes}`}>
      {icon}
      {label}
    </button>
  );
}

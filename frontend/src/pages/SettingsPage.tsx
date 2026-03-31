import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/common/GlassCard";
import { Button } from "@/components/common/Button";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  Volume2, Accessibility, Contrast, Camera, BarChart3,
  HelpCircle, Trash2, LogOut, ChevronRight, Zap, Moon,
} from "lucide-react";

export function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [soundFx, setSoundFx] = useState(false);
  const [reducedMotionMode, setReducedMotionMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [shareAnalytics, setShareAnalytics] = useState(true);
  const [cameraAutoStart, setCameraAutoStart] = useState(false);

  const summary = useMemo(() => ({
    privacy: shareAnalytics ? "Enabled" : "Disabled",
    camera: cameraAutoStart ? "Auto" : "Manual",
  }), [cameraAutoStart, shareAnalytics]);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  function clearLocalData() {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("aiva."));
    keys.forEach((k) => localStorage.removeItem(k));
    // Show success animation
    const successElement = document.createElement('div');
    successElement.className = 'fixed top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    successElement.textContent = 'Local data cleared successfully!';
    document.body.appendChild(successElement);
    setTimeout(() => document.body.removeChild(successElement), 3000);
  }

  function handleSoundEffectToggle() {
    setSoundFx(!soundFx);
    // Play sound effect if enabled
    if (!soundFx) {
      // Create a simple click sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  }

  function handleReducedMotionToggle() {
    setReducedMotionMode(!reducedMotionMode);
    // Apply reduced motion preference globally
    if (reducedMotionMode) {
      document.documentElement.style.setProperty('--motion-duration', '0.1s');
    } else {
      document.documentElement.style.setProperty('--motion-duration', '0.3s');
    }
  }

  function handleHighContrastToggle() {
    setHighContrast(!highContrast);
    // Apply high contrast mode
    if (highContrast) {
      document.documentElement.classList.remove('high-contrast');
    } else {
      document.documentElement.classList.add('high-contrast');
    }
  }

  function handleAnalyticsToggle() {
    setShareAnalytics(!shareAnalytics);
    // Save analytics preference
    localStorage.setItem('aiva.analytics', shareAnalytics.toString());
  }

  function handleCameraAutoStartToggle() {
    setCameraAutoStart(!cameraAutoStart);
    // Save camera preference
    localStorage.setItem('aiva.cameraAutoStart', cameraAutoStart.toString());
  }

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-6 lg:grid-cols-12 max-w-5xl mx-auto"
    >
      {/* ── Main column ── */}
      <div className="lg:col-span-8 space-y-6">

        {/* Account card */}
        <motion.div variants={item}>
          <motion.div 
            className="rounded-3xl bg-white/60 backdrop-blur-xl shadow-lg ring-1 ring-white/40 overflow-hidden"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {user && (
                    <motion.div 
                      className="w-12 h-12 rounded-xl bg-gradient-to-br from-aiva-purple to-aiva-indigo flex items-center justify-center text-white text-lg font-bold shadow-md"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 0.3 }}
                    >
                      {`${user.firstName[0] ?? "A"}${user.lastName[0] ?? "I"}`.toUpperCase()}
                    </motion.div>
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">{user ? `${user.firstName} ${user.lastName}` : "Not signed in"}</h3>
                    <p className="text-xs text-gray-500">{user?.email ?? "Sign in to sync data"}</p>
                  </div>
                </div>
                {user && (
                  <motion.span 
                    className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-600 font-bold ring-1 ring-emerald-200/50"
                    animate={{ scale: [0.9, 1.1, 1] }}
                    transition={{ duration: 0.3 }}
                  >
                    Active
                  </motion.span>
                )}
              </div>
              <div className="mt-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="secondary" size="sm" onClick={() => navigate("/profile")}>
                    Edit Profile <ChevronRight size={14} />
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Preferences */}
        <motion.div variants={item}>
          <SettingsCard title="Preferences" subtitle="Customize how Aiva feels on your device">
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Moon size={18} className="text-white" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Theme</div>
                  <div className="text-xs text-gray-500">{theme === 'light' ? 'Light mode' : 'Dark mode'}</div>
                </div>
              </div>
              <ThemeToggle className="ml-auto" />
            </div>
            <ToggleRow icon={Volume2} label="Sound effects" desc="Enable subtle UI sounds for interactions" value={soundFx} onChange={handleSoundEffectToggle} />
            <ToggleRow icon={Accessibility} label="Reduced motion" desc="Minimize animations for accessibility" value={reducedMotionMode} onChange={handleReducedMotionToggle} />
            <ToggleRow icon={Contrast} label="High contrast" desc="Increase contrast for better readability" value={highContrast} onChange={handleHighContrastToggle} />
          </SettingsCard>
        </motion.div>

        {/* Privacy & Devices */}
        <motion.div variants={item}>
          <SettingsCard title="Privacy & Devices" subtitle="Control your data sharing and hardware preferences">
            <ToggleRow icon={BarChart3} label="Share analytics" desc="Help improve Aiva with anonymous usage data" value={shareAnalytics} onChange={handleAnalyticsToggle} />
            <ToggleRow icon={Camera} label="Auto-start camera" desc="Automatically open camera when starting practice" value={cameraAutoStart} onChange={handleCameraAutoStartToggle} />
          </SettingsCard>
        </motion.div>

        {/* Danger zone */}
        <motion.div variants={item}>
          <div className="rounded-3xl bg-white/60 backdrop-blur-xl shadow-lg ring-1 ring-red-200/30 overflow-hidden">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-1">
                <motion.div 
                  className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center"
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Trash2 size={13} className="text-red-500" />
                </motion.div>
                <h3 className="text-sm font-bold text-gray-800">Danger Zone</h3>
              </div>
              <p className="text-xs text-gray-500 mb-4">These actions cannot be easily undone</p>
              <div className="flex flex-wrap gap-2">
                <motion.button
                  onClick={clearLocalData}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 text-sm font-semibold transition-colors ring-1 ring-red-200/50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Trash2 size={14} /> Clear local data
                </motion.button>
                <motion.button
                  onClick={handleLogout}
                  disabled={!user}
                  className="inline-flex items-center gap-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 px-4 py-2.5 text-sm font-semibold transition-colors ring-1 ring-gray-200/50 disabled:opacity-40 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <LogOut size={14} /> Sign out
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Sidebar column ── */}
      <div className="lg:col-span-4 space-y-6">
        {/* Quick Status */}
        <motion.div variants={item}>
          <motion.div 
            className="rounded-3xl bg-white/60 backdrop-blur-xl shadow-lg ring-1 ring-white/40 p-5"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <motion.div 
                className="w-6 h-6 rounded-lg bg-aiva-purple/10 flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.1, 1], 
                  rotate: [0, 360, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap size={13} className="text-aiva-purple" />
              </motion.div>
              <h3 className="text-sm font-bold text-gray-800">Quick Status</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <StatusBadge label="Camera" value={summary.camera} active={cameraAutoStart} />
              <StatusBadge label="Analytics" value={summary.privacy} active={shareAnalytics} />
              <StatusBadge label="Motion" value={reducedMotionMode ? "Reduced" : "System"} active={!reducedMotionMode} />
              <StatusBadge label="Contrast" value={highContrast ? "High" : "Normal"} active={highContrast} />
              <StatusBadge label="Theme" value={theme === 'light' ? 'Light' : 'Dark'} active={true} />
            </div>
          </motion.div>
        </motion.div>

        {/* Help */}
        <motion.div variants={item}>
          <motion.div 
            className="rounded-3xl bg-gradient-to-br from-aiva-purple/5 to-aiva-indigo/5 backdrop-blur-xl shadow-lg ring-1 ring-aiva-purple/10 p-5"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <motion.div 
                className="w-6 h-6 rounded-lg bg-aiva-purple/10 flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.2, 1], 
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <HelpCircle size={13} className="text-aiva-purple" />
              </motion.div>
              <h3 className="text-sm font-bold text-gray-800">Need Help?</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              If camera, audio, or animations feel off, try adjusting your preferences above and refresh the page.
            </p>
            <div className="mt-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="sm" onClick={() => navigate("/practice")}>
                  Quick Practice Check
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ── Helper components ── */

function SettingsCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      className="rounded-3xl bg-white/60 backdrop-blur-xl shadow-lg ring-1 ring-white/40 p-5 hover:shadow-2xl transition-all duration-300"
    >
      <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      <p className="text-xs text-gray-500 mt-0.5 mb-4">{subtitle}</p>
      <div className="space-y-3">{children}</div>
    </motion.div>
  );
}

function ToggleRow({ icon: Icon, label, desc, value, onChange }: {
  icon: React.ElementType; label: string; desc: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <motion.div 
      className="flex items-center justify-between gap-4 rounded-xl bg-white/70 backdrop-blur-sm p-4 ring-1 ring-gray-200/40 hover:ring-gray-300/50 transition-all group"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-3">
        <motion.div 
          className="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-aiva-purple/5 flex items-center justify-center text-gray-400 group-hover:text-aiva-purple transition-colors"
          whileHover={{ rotate: 15 }}
        >
          <Icon size={16} />
        </motion.div>
        <div>
          <div className="text-sm font-semibold text-gray-800">{label}</div>
          <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
        </div>
      </div>
      <motion.button
        type="button" 
        role="switch" 
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 flex-shrink-0 ${
          value ? "bg-gradient-to-r from-aiva-purple to-aiva-indigo shadow-lg shadow-aiva-purple/25" : "bg-gray-300"
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span 
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
            value ? "translate-x-6" : "translate-x-1"
          }`}
          animate={{
            x: value ? 6 : 1,
            backgroundColor: value ? ['#fbbf24', '#f3f4f6'] : ['#9ca3af', '#e5e7eb']
          }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        />
      </motion.button>
    </motion.div>
  );
}

function StatusBadge({ label, value, active }: { label: string; value: string; active: boolean }) {
  return (
    <motion.div 
      className="rounded-xl bg-white/70 backdrop-blur-sm p-3 ring-1 ring-gray-200/40"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="flex items-center gap-1.5 mt-1">
        <motion.div 
          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
            active ? "bg-emerald-500 shadow-lg shadow-emerald-500/30" : "bg-gray-300"
          }`}
          animate={{
            scale: active ? [1, 1.2, 1] : [1, 0.9, 1],
            backgroundColor: active ? ['#10b981', '#059669', '#10b981'] : ['#9ca3af', '#6b7280', '#9ca3af']
          }}
        />
        <motion.span 
          className="text-sm font-bold text-gray-800"
          key={value}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {value}
        </motion.span>
      </div>
    </motion.div>
  );
}

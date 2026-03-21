import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/common/GlassCard";
import { Button } from "@/components/common/Button";
import { TrendingUp } from "lucide-react";

/* ── Tiny SVG area chart for the Analytics mini-card ────── */
function MiniChart() {
  return (
    <svg viewBox="0 0 300 120" className="w-full h-28 mt-2">
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path
        d="M0,100 C30,95 60,85 90,80 C120,75 140,60 180,50 C220,40 250,20 300,15 L300,120 L0,120 Z"
        fill="url(#chartFill)"
      />
      <path
        d="M0,100 C30,95 60,85 90,80 C120,75 140,60 180,50 C220,40 250,20 300,15"
        fill="none"
        stroke="#8B5CF6"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="300" cy="15" r="4" fill="#8B5CF6" />
    </svg>
  );
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function Dashboard() {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 lg:grid-cols-12 gap-5"
    >
      {/* ── Left column ────────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        className="lg:col-span-5 flex flex-col gap-5"
      >
        {/* Analytics mini card */}
        <GlassCard variant="purple" className="relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-semibold text-gray-700 flex items-center gap-2">
              <TrendingUp size={18} className="text-aiva-purple" />
              Analytics
            </h3>
            <span className="text-xs text-gray-500">Mar 16</span>
          </div>
          <span className="text-3xl font-bold text-aiva-purple">100</span>
          <MiniChart />
          <span className="absolute bottom-4 left-5 text-xs text-gray-500">
            Mar 12
          </span>
        </GlassCard>

        {/* Daily tasks */}
        <GlassCard variant="blue" className="space-y-4">
          <h3 className="text-base font-semibold text-gray-700">Daily tasks</h3>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Communication
              </p>
              <p className="text-xs text-gray-500">in any language</p>
            </div>
            <span className="text-lg font-bold text-gray-700">10/25</span>
          </div>

          <div className="h-px bg-white/30" />

          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">Mock test</p>
            <span className="text-lg font-bold text-gray-700">10/25</span>
          </div>
        </GlassCard>
      </motion.div>

      {/* ── Right column ───────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        className="lg:col-span-7 flex flex-col gap-5"
      >
        {/* Hero card - Start Section */}
        <GlassCard variant="blue" className="flex flex-col sm:flex-row items-center gap-5">
          <div className="flex-1 space-y-3">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">
              Hello! im{" "}
              <span className="text-aiva-purple text-3xl lg:text-4xl">
                Aiva
              </span>
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Your intelligent AI mentor for interview and viva preparation.
              Enhance your responses and speak with confidence.
            </p>
            <Button size="lg" onClick={() => navigate("/practice")}>Start Section</Button>
          </div>
          <div className="w-36 h-36 lg:w-44 lg:h-44 rounded-2xl flex items-center justify-center overflow-hidden">
            <img
              src="/Assets/Interview-amico.png"
              alt="Aiva introduction"
              className="w-full h-full object-contain"
            />
          </div>
        </GlassCard>

        {/* Chat with Aiva card */}
        <GlassCard variant="blue" className="flex flex-col sm:flex-row items-center gap-5">
          <div className="flex-1 space-y-3">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">
              Hello! im{" "}
              <span className="text-aiva-purple text-3xl lg:text-4xl">
                Aiva
              </span>
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Get all the right resources of your learning need with AIVA
            </p>
            <Button variant="primary" size="lg">
              Chat with Aiva
            </Button>
          </div>
          <div className="w-36 h-36 lg:w-44 lg:h-44 rounded-2xl flex items-center justify-center overflow-hidden">
            <img
              src="/Assets/DashChat.png"
              alt="Chat with Aiva"
              className="w-full h-full object-contain"
            />
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

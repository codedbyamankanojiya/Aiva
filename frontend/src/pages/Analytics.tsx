import { motion } from "framer-motion";
import { GlassCard } from "@/components/common/GlassCard";
import { ProgressBar } from "@/components/common/ProgressBar";
import {
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronDown,
} from "lucide-react";

/* ── Area chart ─────────────────────────────────────────── */
function AnalyticsChart() {
  return (
    <svg viewBox="0 0 400 140" className="w-full h-36">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.30" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.03" />
        </linearGradient>
      </defs>
      <path
        d="M0,120 C40,110 60,100 100,90 C140,80 160,70 200,55 C240,40 280,50 320,35 C360,20 380,25 400,15 L400,140 L0,140 Z"
        fill="url(#areaFill)"
      />
      <path
        d="M0,120 C40,110 60,100 100,90 C140,80 160,70 200,55 C240,40 280,50 320,35 C360,20 380,25 400,15"
        fill="none"
        stroke="#8B5CF6"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

/* ── Insight pill ───────────────────────────────────────── */
function InsightPill({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="glass-card p-3 text-center min-w-[120px]">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-gray-800">{value}</p>
      {sub && <p className="text-[11px] text-gray-500">{sub}</p>}
    </div>
  );
}

export function Analytics() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      {/* ── Header row ─────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="flex items-center gap-3">
        <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-aiva-purple/15 text-aiva-purple border border-aiva-purple/25">
          Progress Report
        </span>
        <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-white/30 text-gray-600 border border-white/40 flex items-center gap-1 cursor-pointer">
          Interview <ChevronDown size={14} />
        </span>
      </motion.div>

      {/* ── Top grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Chart + score */}
        <motion.div variants={fadeUp} className="lg:col-span-4 flex flex-col gap-5">
          <GlassCard variant="purple" className="overflow-hidden pb-2">
            <AnalyticsChart />
          </GlassCard>
          <GlassCard variant="purple" className="text-center">
            <p className="text-sm font-medium text-gray-500 mb-1">
              Today's total score&nbsp;:
            </p>
            <p className="text-4xl font-extrabold text-gray-800">78</p>
          </GlassCard>
          <GlassCard variant="blue" className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-700">
                Last interview session
              </h4>
              <ChevronDown size={16} className="text-gray-400" />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-gray-200/60 rounded-full overflow-hidden">
                <div className="h-full w-[70%] bg-aiva-purple rounded-full" />
              </div>
              <span className="text-lg font-bold text-gray-700">10 / 9</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Score 45</span>
              <span className="flex items-center gap-1">
                <Clock size={12} /> 5min
              </span>
            </div>
          </GlassCard>
        </motion.div>

        {/* Session insights + Today's */}
        <motion.div variants={fadeUp} className="lg:col-span-4 flex flex-col gap-5">
          <div>
            <h3 className="text-base font-semibold text-gray-700 mb-3">
              Session insights
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <InsightPill label="Avg pause" value="0.78s" sub="Clear thinking" />
              <InsightPill
                label="speaking speed"
                value="148 wpm"
                sub="ideal 130-160"
              />
              <InsightPill label="focus" value="37 %" sub="Distracted" />
              <InsightPill
                label="speech clarity"
                value=""
                sub="voice 56% words 77%"
              />
            </div>
          </div>

          <GlassCard variant="purple" className="space-y-3">
            <h4 className="text-xs font-bold text-aiva-purple uppercase tracking-wide">
              Today's
            </h4>
            <div className="glass-card p-2.5 text-sm text-gray-700">
              Growth : impressive
            </div>
            <div className="glass-card p-2.5 text-sm text-gray-700">
              Tone : nervous
            </div>
            <div className="mt-2 p-3 rounded-lg bg-yellow-50/40 border border-yellow-200/40">
              <p className="text-xs font-semibold text-gray-700 mb-1">
                Focus for Improvement
              </p>
              <p className="text-xs text-gray-500">✕ Improve eye contact</p>
              <p className="text-xs text-gray-500">✕ Reduce nervous tone</p>
            </div>
          </GlassCard>
        </motion.div>

        {/* Strengths */}
        <motion.div variants={fadeUp} className="lg:col-span-4">
          <GlassCard variant="blue" className="space-y-5 h-full">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-500" />
              <div>
                <h3 className="text-base font-bold text-gray-800">Strengths</h3>
                <p className="text-xs text-gray-500">areas where you excel</p>
              </div>
            </div>
            <ProgressBar
              value={89}
              label="Technical Knowledge"
              percentLabel="89%"
              color="blue"
            />
            <ProgressBar
              value={65}
              label="Problem Decomposition"
              percentLabel="65%"
              color="blue"
            />
            <ProgressBar
              value={77}
              label="Clear Explanation"
              percentLabel="77%"
              color="blue"
            />
            <ProgressBar
              value={90}
              label="Code Quality"
              percentLabel="90%"
              color="blue"
            />
          </GlassCard>
        </motion.div>
      </div>

      {/* ── Bottom grid ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Areas to Improve */}
        <motion.div variants={fadeUp} className="lg:col-span-6">
          <GlassCard variant="default" className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-amber-500" />
              <div>
                <h3 className="font-bold text-gray-800">Areas to Improve</h3>
                <p className="text-xs text-gray-500">Focus on these to level up</p>
              </div>
            </div>
            <ProgressBar
              value={68}
              label="Time Management"
              percentLabel="68%"
              status="Improving"
              statusColor="text-emerald-600"
              color="blue"
            />
            <ProgressBar
              value={68}
              label="Handling Pressure"
              percentLabel="68%"
              status="Improving"
              statusColor="text-emerald-600"
              color="blue"
            />
            <ProgressBar
              value={77}
              label="Follow-up Questions"
              percentLabel="77%"
              status="Stable"
              statusColor="text-amber-600"
              color="amber"
            />
            <ProgressBar
              value={50}
              label="Body Language"
              percentLabel="50%"
              status="Improving"
              statusColor="text-emerald-600"
              color="blue"
            />
          </GlassCard>
        </motion.div>

        {/* Stats grid */}
        <motion.div variants={fadeUp} className="lg:col-span-6">
          <div className="grid grid-cols-2 gap-4 h-full">
            <GlassCard variant="blue" className="flex flex-col items-center justify-center text-center">
              <p className="text-xs text-gray-500 mb-1">Average Score</p>
              <p className="text-4xl font-extrabold text-gray-800">84%</p>
              <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                <TrendingUp size={12} /> +12% from last month
              </p>
            </GlassCard>
            <GlassCard variant="blue" className="flex flex-col items-center justify-center text-center">
              <p className="text-xs text-gray-500 mb-1">Sessions Completed</p>
              <p className="text-4xl font-extrabold text-gray-800">41</p>
              <p className="text-xs text-gray-500 mt-1">22 interview 19 vivas</p>
            </GlassCard>
            <GlassCard variant="blue" className="flex flex-col items-center justify-center text-center">
              <p className="text-xs text-gray-500 mb-1">Total Practice Hours</p>
              <p className="text-4xl font-extrabold text-gray-800">28h</p>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </GlassCard>
            <GlassCard variant="blue" className="flex flex-col items-center justify-center text-center">
              <p className="text-xs text-gray-500 mb-1">Readiness Level</p>
              <p className="text-3xl font-extrabold text-gray-800">HIGH</p>
              <p className="text-xs text-gray-500 mt-1">ready for interviews</p>
            </GlassCard>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

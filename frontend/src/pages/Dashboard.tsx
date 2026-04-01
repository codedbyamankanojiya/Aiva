import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/common/GlassCard";
import { Button } from "@/components/common/Button";
import { GlitchReveal } from "@/components/animations/GlitchReveal";

/* ── Custom SVG for the Analytics mini-card to match screenshot ────── */
function MiniChart() {
  return (
    <svg viewBox="0 0 400 160" className="w-full h-auto mt-4 drop-shadow-md z-10 relative">
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6755a5" stopOpacity="1" />
          <stop offset="100%" stopColor="#41396a" stopOpacity="1" />
        </linearGradient>
      </defs>
      
      {/* Background fill shape */}
      <path
        d="M0,120 C40,110 80,140 120,130 C180,110 240,70 280,50 C320,30 360,30 400,30 L400,160 L0,160 Z"
        fill="url(#chartFill)"
      />
      {/* Solid line stroke on top edge */}
      <path
        d="M0,120 C40,110 80,140 120,130 C180,110 240,70 280,50 C320,30 360,30 400,30"
        fill="none"
        stroke="#8b71d9"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Circle dot near right peak */}
      <line x1="280" y1="50" x2="280" y2="20" stroke="#8b71d9" strokeWidth="2" opacity="0.5" />
      <circle cx="280" cy="20" r="5" fill="#8b71d9" />
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
      className="grid grid-cols-1 lg:grid-cols-[1.05fr_1.95fr] gap-4 max-w-6xl mx-auto px-2"
    >
      {/* ── Left column: Unified Tall Card ────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="flex flex-col h-full">
        <GlitchReveal delay={0.1} variant="both">
          <GlassCard variant="blue" className="flex flex-col h-full relative overflow-hidden p-0 pt-4">
            
            {/* Top Analytics Section */}
            <div className="px-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-800">Analytics</h3>
                  <p className="text-xs text-gray-600 mt-0.5">Last 7 days performance</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-gray-700 block">Mar 16</span>
                  <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-[#a28dc7] to-[#bdaadf]">
                    100
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="rounded-xl bg-white/35 border border-white/25 px-3 py-2">
                  <p className="text-[11px] font-semibold text-gray-700">Streak</p>
                  <p className="text-base font-bold text-gray-900 leading-tight">6 days</p>
                </div>
                <div className="rounded-xl bg-white/35 border border-white/25 px-3 py-2">
                  <p className="text-[11px] font-semibold text-gray-700">This week</p>
                  <p className="text-base font-bold text-gray-900 leading-tight">+24%</p>
                </div>
                <div className="rounded-xl bg-white/35 border border-white/25 px-3 py-2">
                  <p className="text-[11px] font-semibold text-gray-700">Practice</p>
                  <p className="text-base font-bold text-gray-900 leading-tight">48h</p>
                </div>
              </div>
            </div>

            <div className="relative mt-3 px-4">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                <span>Mar 12</span>
                <span className="text-gray-500 font-medium">Trend</span>
              </div>
              <div className="mt-2 h-[145px] rounded-2xl bg-white/20 border border-white/20 overflow-hidden flex items-center">
                <div className="w-full -mx-2">
                  <MiniChart />
                </div>
              </div>
            </div>

            {/* Bottom Tasks Section */}
            <div className="px-4 flex-1 flex flex-col justify-end pb-5 pt-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[17px] font-bold text-gray-800">Daily tasks</h3>
                <span className="text-xs font-semibold text-gray-600">2 active</span>
              </div>

              <div className="space-y-5 w-full">
                <div className="rounded-2xl bg-white/25 border border-white/20 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800 leading-tight">Communication</p>
                      <p className="text-xs font-medium text-gray-700 mt-0.5">in any language</p>
                    </div>
                    <span className="text-sm font-bold text-gray-800">10/25</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/40 overflow-hidden">
                    <div className="h-full w-[40%] rounded-full bg-gradient-to-r from-[#6d28d9] to-[#8b5cf6]" />
                  </div>
                </div>

                <div className="rounded-2xl bg-white/25 border border-white/20 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-800">Mock test</p>
                    <span className="text-sm font-bold text-gray-800">10/25</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/40 overflow-hidden">
                    <div className="h-full w-[40%] rounded-full bg-gradient-to-r from-[#6d28d9] to-[#8b5cf6]" />
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <Button
                  variant="secondary"
                  className="w-full rounded-2xl py-2.5 text-sm font-semibold"
                  onClick={() => navigate("/practice")}
                >
                  Continue today’s plan
                </Button>
              </div>
            </div>

          </GlassCard>
        </GlitchReveal>
      </motion.div>

      {/* ── Right column: Stacked Cards ───────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        className="grid grid-rows-2 gap-3.5 h-full"
      >
        {/* Hello Aiva Card 1 */}
        <GlitchReveal delay={0.2} variant="chromatic">
          <GlassCard variant="blue" className="relative flex flex-col sm:flex-row items-center overflow-hidden h-full min-h-[210px]">
            {/* Text Content */}
            <div className="flex-1 space-y-2 pr-4 sm:pr-[205px] lg:pr-[230px] z-10 w-full">
              <h2 className="text-[22px] font-bold text-gray-800 flex items-center gap-2">
                Hello! im{" "}
                <span className="text-[#967abc] text-3xl">
                  Aiva
                </span>
              </h2>
              <p className="text-[14px] font-medium text-gray-800 leading-snug max-w-[340px]">
                Your intelligent AI mentor for interview and viva preparation. <br className="hidden sm:block" />
                Enhance your responses and speak with confidence.
              </p>
              <div className="pt-0.5">
                <Button 
                  variant="primary"
                  className="rounded-full px-5 py-2 w-36 font-semibold bg-[#674bb1] hover:bg-[#7a5bc9]" 
                  onClick={() => navigate("/practice")}
                  data-cursor="interactive"
                >
                  Start Section
                </Button>
              </div>
            </div>
            
            {/* Jumbo Image Right */}
            <div className="absolute right-0 bottom-0 sm:right-0 h-full w-full sm:w-[42%] lg:w-[42%] flex items-end justify-end pointer-events-none z-0 pr-2 pb-2">
              <img
                src="/Assets/Interview-amico.png"
                alt="Aiva introduction"
                className="max-h-[84%] w-auto object-contain object-right-bottom drop-shadow-sm"
              />
            </div>
          </GlassCard>
        </GlitchReveal>

        {/* Hello Aiva Card 2 */}
        <GlitchReveal delay={0.35} variant="chromatic">
          <GlassCard variant="blue" className="relative flex flex-col sm:flex-row items-center overflow-hidden h-full min-h-[210px]" data-cursor="ai">
            {/* Text Content */}
            <div className="flex-1 space-y-2 pr-4 sm:pr-[205px] lg:pr-[230px] z-10 w-full">
              <h2 className="text-[22px] font-bold text-gray-800 flex items-center gap-2">
                Hello! im{" "}
                <span className="text-[#967abc] text-3xl">
                  Aiva
                </span>
              </h2>
              <p className="text-[14px] font-medium text-gray-800 leading-snug max-w-[340px]">
                Get all the right resources of your learning need with AIVA
              </p>
              <div className="pt-0.5">
                <Button 
                  variant="primary" 
                  className="rounded-full px-5 py-2 w-36 font-semibold bg-[#674bb1] hover:bg-[#7a5bc9]"
                  data-cursor="ai"
                >
                  Chat with Aiva
                </Button>
              </div>
            </div>
            
            {/* Jumbo Image Right */}
            <div className="absolute right-0 bottom-0 h-full w-full sm:w-[40%] lg:w-[40%] flex items-end justify-end pointer-events-none z-0">
              <img
                src="/Assets/DashChat.png"
                alt="Chat with Aiva"
                className="max-h-[88%] w-auto object-contain object-right-bottom drop-shadow-sm"
              />
            </div>
          </GlassCard>
        </GlitchReveal>
      </motion.div>
    </motion.div>
  );
}

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/common/GlassCard";
import { Button } from "@/components/common/Button";

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
      className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.9fr] gap-6"
    >
      {/* ── Left column: Unified Tall Card ────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="flex flex-col h-full">
        <GlassCard variant="blue" className="flex flex-col h-full relative overflow-hidden p-0 pt-6">
          
          {/* Top Analytics Section */}
          <div className="flex justify-between items-start px-6">
            <h3 className="text-lg font-semibold text-gray-800">Analytics</h3>
            <div className="text-right">
              <span className="text-sm font-semibold text-gray-800 block">Mar 16</span>
              <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-[#a28dc7] to-[#bdaadf]">
                100
              </span>
            </div>
          </div>

          <div className="relative mt-2">
            <span className="absolute left-6 top-8 text-sm font-semibold text-gray-800 z-20">
              Mar 12
            </span>
            {/* Extended right edge slightly to bleed like screenshot */}
            <div className="-mx-2"> 
              <MiniChart />
            </div>
          </div>

          {/* Bottom Tasks Section */}
          <div className="px-6 flex-1 flex flex-col justify-end pb-8 pt-8">
            <h3 className="text-[17px] font-bold text-gray-800 mb-5">Daily tasks</h3>

            <div className="space-y-6 w-full pr-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-semibold text-gray-800 leading-tight">
                    Communication
                  </p>
                  <p className="text-[15px] font-medium text-gray-700 mt-0.5">
                    in any language
                  </p>
                </div>
                <span className="text-base font-bold text-gray-800">10/25</span>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-base font-semibold text-gray-800">Mock test</p>
                <span className="text-base font-bold text-gray-800">10/25</span>
              </div>
            </div>
          </div>

        </GlassCard>
      </motion.div>

      {/* ── Right column: Stacked Cards ───────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col gap-6"
      >
        {/* Hello Aiva Card 1 */}
        <GlassCard variant="blue" className="relative flex flex-col sm:flex-row items-center overflow-hidden min-h-[300px]">
          {/* Text Content */}
          <div className="flex-1 space-y-4 pr-4 sm:pr-[250px] lg:pr-[300px] z-10 w-full">
            <h2 className="text-[28px] font-bold text-gray-800 flex items-center gap-2">
              Hello! im{" "}
              <span className="text-[#967abc] text-4xl">
                Aiva
              </span>
            </h2>
            <p className="text-[15px] font-medium text-gray-800 leading-snug max-w-[340px]">
              Your intelligent AI mentor for interview and viva preparation. <br className="hidden sm:block" />
              Enhance your responses and speak with confidence.
            </p>
            <div className="pt-2">
              <Button 
                variant="primary"
                className="rounded-full px-8 py-3 w-48 font-semibold bg-[#674bb1] hover:bg-[#7a5bc9]" 
                onClick={() => navigate("/practice")}
              >
                Start Section
              </Button>
            </div>
          </div>
          
          {/* Jumbo Image Right */}
          <div className="absolute right-0 bottom-0 sm:right-0 h-full w-full sm:w-[50%] lg:w-[50%] flex items-end justify-end pointer-events-none z-0 pr-2 pb-2">
            <img
              src="/Assets/Interview-amico.png"
              alt="Aiva introduction"
              className="max-h-[90%] w-auto object-contain object-right-bottom drop-shadow-sm"
            />
          </div>
        </GlassCard>

        {/* Hello Aiva Card 2 */}
        <GlassCard variant="blue" className="relative flex flex-col sm:flex-row items-center overflow-hidden min-h-[300px]">
          {/* Text Content */}
          <div className="flex-1 space-y-4 pr-4 sm:pr-[250px] lg:pr-[300px] z-10 w-full">
            <h2 className="text-[28px] font-bold text-gray-800 flex items-center gap-2">
              Hello! im{" "}
              <span className="text-[#967abc] text-4xl">
                Aiva
              </span>
            </h2>
            <p className="text-[15px] font-medium text-gray-800 leading-snug max-w-[340px]">
              Get all the right resources of your learning need with AIVA
            </p>
            <div className="pt-2">
              <Button 
                variant="primary" 
                className="rounded-full px-8 py-3 w-48 font-semibold bg-[#674bb1] hover:bg-[#7a5bc9]"
              >
                Chat with Aiva
              </Button>
            </div>
          </div>
          
          {/* Jumbo Image Right */}
          <div className="absolute right-0 bottom-0 h-full w-full sm:w-[45%] lg:w-[45%] flex items-end justify-end pointer-events-none z-0">
            <img
              src="/Assets/DashChat.png"
              alt="Chat with Aiva"
              className="max-h-[95%] w-auto object-contain object-right-bottom drop-shadow-sm"
            />
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

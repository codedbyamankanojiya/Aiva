import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/common/GlassCard";
import { Button } from "@/components/common/Button";
import { GlitchReveal } from "@/components/animations/GlitchReveal";
import { Calendar, Target, Brain, Zap, TrendingUp, Users } from "lucide-react";

interface QuestionTranscript {
  questionId: string;
  question: string;
  transcript: string;
  role: string;
  level: string;
  mentioned: string[];
  notMentioned: string[];
  ai_analysis: string;
}

interface SectionData {
  role: string;
  level: string;
  questionsAnswered: number;
  totalQuestions: number;
  timeSpent: string;
  completedAt: string;
  sectionCode: string;
  averageTimePerQuestion: string;
  averageWordsPerMinute: number;
  answerQuality: number;
  questionTranscripts: QuestionTranscript[];
}

interface AnalyticsData {
  sections: SectionData[];
}

/* ── Dynamic Mini Chart Component ────── */
function MiniChart({ data }: { data: number[] }) {
  if (data.length === 0) {
    return (
      <div className="h-[145px] rounded-2xl bg-white/20 border border-white/20 overflow-hidden flex items-center justify-center">
        <p className="text-sm text-gray-500">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data);
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - (value / maxValue) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-full h-[145px]">
      <defs>
        <linearGradient id="chartFill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      
      {/* Area fill */}
      <path
        d={`M ${points} L 100,100 L 0,100 Z`}
        fill="url(#chartFill)"
      />
      
      {/* Line */}
      <path
        d={`M ${points}`}
        fill="none"
        stroke="#8B5CF6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Data points */}
      {data.map((value, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - (value / maxValue) * 100;
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r="2"
            fill="#8B5CF6"
          />
        );
      })}
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
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/section-data');
        const data: AnalyticsData = await response.json();
        setAnalyticsData(data);
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  // Calculate real metrics
  const sections = analyticsData?.sections || [];
  const totalSessions = sections.length;
  const avgAnswerQuality = totalSessions > 0 
    ? Math.round(sections.reduce((sum, s) => sum + s.answerQuality, 0) / totalSessions)
    : 0;
  const totalQuestions = sections.reduce((sum, s) => sum + s.questionsAnswered, 0);
  const avgWPM = totalSessions > 0
    ? Math.round(sections.reduce((sum, s) => sum + s.averageWordsPerMinute, 0) / totalSessions)
    : 0;

  // Get last 7 days performance data
  const last7DaysData = sections.slice(-7).map(s => s.answerQuality);
  
  // Calculate streak (consecutive days with sessions)
  const calculateStreak = () => {
    if (sections.length === 0) return 0;
    
    const today = new Date();
    let streak = 0;
    
    for (let i = sections.length - 1; i >= 0; i--) {
      const sessionDate = new Date(sections[i].completedAt);
      const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const streak = calculateStreak();
  
  // Calculate weekly improvement
  const calculateWeeklyImprovement = () => {
    if (sections.length < 2) return 0;
    
    const recent = sections.slice(-7);
    const older = sections.slice(-14, -7);
    
    if (older.length === 0) return 0;
    
    const recentAvg = recent.reduce((sum, s) => sum + s.answerQuality, 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + s.answerQuality, 0) / older.length;
    
    return Math.round(((recentAvg - olderAvg) / olderAvg) * 100);
  };

  const weeklyImprovement = calculateWeeklyImprovement();
  
  // Calculate total practice time
  const calculatePracticeTime = () => {
    const totalMinutes = sections.reduce((sum, s) => {
      const [hours, minutes] = s.timeSpent.split(':').map(Number);
      return sum + (hours * 60) + minutes;
    }, 0);
    
    return totalMinutes;
  };

  const totalPracticeMinutes = calculatePracticeTime();
  const practiceHours = Math.floor(totalPracticeMinutes / 60);
  const practiceMinutes = totalPracticeMinutes % 60;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 lg:grid-cols-[0.9fr_2.1fr] gap-4 max-w-6xl mx-auto px-2"
    >
      {/* ── Left column: Unified Tall Card ────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="flex flex-col h-full">
        <GlitchReveal delay={0.1} variant="both">
          <GlassCard variant="blue" className="relative flex flex-col h-full p-0 pt-4 overflow-hidden">
            
            {/* Top Analytics Section */}
            <div className="px-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-gray-800">Analytics</h3>
                  <p className="text-xs text-gray-600 mt-0.5">Last 7 days performance</p>
                </div>
                <div className="text-right">
                  <span className="block text-xs font-semibold text-gray-700">
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-[#a28dc7] to-[#bdaadf]">
                    {avgAnswerQuality}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="px-3 py-2 border rounded-xl bg-white/35 border-white/25">
                  <p className="text-[11px] font-semibold text-gray-700">Streak</p>
                  <p className="text-base font-bold leading-tight text-gray-900">{streak} days</p>
                </div>
                <div className="px-3 py-2 border rounded-xl bg-white/35 border-white/25">
                  <p className="text-[11px] font-semibold text-gray-700">This week</p>
                  <p className="text-base font-bold leading-tight text-gray-900">
                    {weeklyImprovement > 0 ? '+' : ''}{weeklyImprovement}%
                  </p>
                </div>
                <div className="px-3 py-2 border rounded-xl bg-white/35 border-white/25">
                  <p className="text-[11px] font-semibold text-gray-700">Practice</p>
                  <p className="text-base font-bold leading-tight text-gray-900">
                    {practiceHours > 0 ? `${practiceHours}h` : ''}{practiceMinutes > 0 ? `${practiceMinutes}m` : '0m'}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative px-4 mt-3">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
                <span>
                  {sections.length > 0 
                    ? new Date(sections[0].completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : 'No data'
                  }
                </span>
                <span className="font-medium text-gray-500">Trend</span>
              </div>
              <div className="mt-2 h-[145px] rounded-2xl bg-white/20 border border-white/20 overflow-hidden flex items-center">
                <div className="w-full">
                  <MiniChart data={last7DaysData} />
                </div>
              </div>
            </div>

            {/* Bottom Tasks Section */}
            <div className="flex flex-col justify-end flex-1 px-4 pt-5 pb-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[17px] font-bold text-gray-800">Daily Progress</h3>
                <span className="text-xs font-semibold text-gray-600">{totalSessions} sessions</span>
              </div>

              <div className="w-full space-y-5">
                <div className="px-4 py-3 border rounded-2xl bg-white/25 border-white/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="text-aiva-purple" size={16} />
                      <p className="text-sm font-semibold leading-tight text-gray-800">Response Accuracy</p>
                    </div>
                    <span className="text-sm font-bold text-gray-800">{avgAnswerQuality}%</span>
                  </div>
                  <div className="h-2 mt-3 overflow-hidden rounded-full bg-white/40">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-[#6d28d9] to-[#8b5cf6]" 
                      style={{ width: `${avgAnswerQuality}%` }}
                    />
                  </div>
                </div>

                <div className="px-4 py-3 border rounded-2xl bg-white/25 border-white/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="text-aiva-purple" size={16} />
                      <p className="text-sm font-semibold leading-tight text-gray-800">Interview Sessions</p>
                    </div>
                    <span className="text-sm font-bold text-gray-800">{totalSessions}</span>
                  </div>
                  <div className="h-2 mt-3 overflow-hidden rounded-full bg-white/40">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-[#6d28d9] to-[#8b5cf6]" 
                      style={{ width: `${Math.min(totalSessions * 10, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <Button
                  variant="secondary"
                  className="w-full rounded-2xl py-2.5 text-sm font-semibold"
                  onClick={() => navigate("/practice")}
                >
                  {totalSessions > 0 ? 'Continue Practice' : 'Start Interview'}
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
            <div className="flex-1 space-y-2 pr-4 sm:pr-[180px] lg:pr-[200px] z-10 w-full">
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
            <div className="absolute right-0 bottom-0 sm:right-0 h-full w-full sm:w-[38%] lg:w-[38%] flex items-end justify-end pointer-events-none z-0 pr-2 pb-2">
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
            <div className="flex-1 space-y-2 pr-4 sm:pr-[180px] lg:pr-[200px] z-10 w-full">
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
                  onClick={() => navigate("/resources")}
                  data-cursor="ai"
                >
                  Chat with Aiva
                </Button>
              </div>
            </div>
            
            {/* Jumbo Image Right */}
            <div className="absolute right-0 bottom-0 h-full w-full sm:w-[36%] lg:w-[36%] flex items-end justify-end pointer-events-none z-0">
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

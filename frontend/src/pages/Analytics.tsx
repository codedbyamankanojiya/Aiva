import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/common/GlassCard";
import { ProgressBar } from "@/components/common/ProgressBar";
import {
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  Target,
  Brain,
  Zap,
  Users,
  Award,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
} from "lucide-react";

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

// Simple Bar Chart Component
function BarChart({ data, labels, title }: { data: number[]; labels: string[]; title: string }) {
  const maxValue = Math.max(...data);
  
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
      <div className="space-y-2">
        {data.map((value, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-xs text-gray-600 w-20 truncate">{labels[index]}</span>
            <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-aiva-purple rounded-full transition-all duration-500"
                style={{ width: `${(value / maxValue) * 100}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-700 w-8 text-right">{value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Simple Line Chart Component
function LineChart({ data, labels, title }: { data: number[]; labels: string[]; title: string }) {
  const maxValue = Math.max(...data);
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - (value / maxValue) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
      <div className="h-32 w-full">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0" y1={y} x2="100" y2={y}
              stroke="#E5E7EB"
              strokeWidth="0.5"
            />
          ))}
          
          {/* Area fill */}
          <path
            d={`M ${points} L 100,100 L 0,100 Z`}
            fill="url(#lineGradient)"
            fillOpacity="0.1"
          />
          
          {/* Line */}
          <path
            d={`M ${points}`}
            fill="none"
            stroke="url(#lineGradient)"
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
                className="hover:r-3 transition-all"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// Pie Chart Component
function PieChart({ data, labels, title }: { data: number[]; labels: string[]; title: string }) {
  const total = data.reduce((sum, value) => sum + value, 0);
  let currentAngle = 0;
  
  const colors = ['#8B5CF6', '#6366F1', '#10B981', '#F59E0B', '#EF4444'];
  
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
      <div className="flex items-center gap-4">
        <div className="w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {data.map((value, index) => {
              const percentage = (value / total) * 100;
              const angle = (percentage / 100) * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              
              const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
              const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              const pathData = [
                `M 50 50`,
                `L ${x1} ${y1}`,
                `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');
              
              currentAngle = endAngle;
              
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={colors[index % colors.length]}
                  stroke="white"
                  strokeWidth="1"
                />
              );
            })}
          </svg>
        </div>
        <div className="flex-1 space-y-1">
          {data.map((value, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-xs text-gray-600">{labels[index]}</span>
              <span className="text-xs font-medium text-gray-700 ml-auto">
                {Math.round((value / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
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

export function Analytics() {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aiva-purple mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData || analyticsData.sections.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No data available</h3>
          <p className="text-gray-600">Complete some interview sessions to see analytics</p>
        </div>
      </div>
    );
  }

  // Calculate analytics metrics
  const sections = analyticsData.sections;
  const totalSessions = sections.length;
  const totalQuestions = sections.reduce((sum, s) => sum + s.questionsAnswered, 0);
  const avgAnswerQuality = Math.round(sections.reduce((sum, s) => sum + s.answerQuality, 0) / totalSessions);
  const avgWPM = Math.round(sections.reduce((sum, s) => sum + s.averageWordsPerMinute, 0) / totalSessions);
  
  // Role distribution
  const roleCounts: { [key: string]: number } = {};
  sections.forEach(section => {
    roleCounts[section.role] = (roleCounts[section.role] || 0) + 1;
  });
  
  // Level distribution
  const levelCounts: { [key: string]: number } = {};
  sections.forEach(section => {
    levelCounts[section.level] = (levelCounts[section.level] || 0) + 1;
  });
  
  // Performance over time (last 6 sessions)
  const recentSessions = sections.slice(-6);
  const performanceOverTime = recentSessions.map(s => s.answerQuality);
  const sessionLabels = recentSessions.map((_, i) => `Session ${i + 1}`);
  
  // Top performing roles
  const rolePerformance: { [key: string]: number[] } = {};
  sections.forEach(section => {
    if (!rolePerformance[section.role]) {
      rolePerformance[section.role] = [];
    }
    rolePerformance[section.role].push(section.answerQuality);
  });
  
  const avgRolePerformance = Object.entries(rolePerformance).map(([role, scores]) => ({
    role,
    avgScore: Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
  })).sort((a, b) => b.avgScore - a.avgScore);

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interview Analytics</h1>
          <p className="text-gray-600">Track your interview performance over time</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar size={16} />
          <span>Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={fadeUp}>
          <GlassCard variant="purple" className="text-center">
            <Target className="mx-auto mb-2 text-aiva-purple" size={24} />
            <p className="text-2xl font-bold text-gray-900">{totalSessions}</p>
            <p className="text-sm text-gray-600">Total Sessions</p>
          </GlassCard>
        </motion.div>
        
        <motion.div variants={fadeUp}>
          <GlassCard variant="blue" className="text-center">
            <Brain className="mx-auto mb-2 text-blue-600" size={24} />
            <p className="text-2xl font-bold text-gray-900">{avgAnswerQuality}%</p>
            <p className="text-sm text-gray-600">Avg Response Accuracy</p>
          </GlassCard>
        </motion.div>
        
        <motion.div variants={fadeUp}>
          <GlassCard variant="blue" className="text-center">
            <Zap className="mx-auto mb-2 text-blue-600" size={24} />
            <p className="text-2xl font-bold text-gray-900">{totalQuestions}</p>
            <p className="text-sm text-gray-600">Questions Answered</p>
          </GlassCard>
        </motion.div>
        
        <motion.div variants={fadeUp}>
          <GlassCard variant="purple" className="text-center">
            <Activity className="mx-auto mb-2 text-aiva-purple" size={24} />
            <p className="text-2xl font-bold text-gray-900">{avgWPM}</p>
            <p className="text-sm text-gray-600">Avg WPM</p>
          </GlassCard>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={fadeUp}>
          <GlassCard className="p-6">
            <LineChart 
              data={performanceOverTime} 
              labels={sessionLabels}
              title="Response Accuracy Trend"
            />
          </GlassCard>
        </motion.div>
        
        <motion.div variants={fadeUp}>
          <GlassCard className="p-6">
            <PieChart 
              data={Object.values(roleCounts)} 
              labels={Object.keys(roleCounts)}
              title="Sessions by Role"
            />
          </GlassCard>
        </motion.div>
      </div>

      {/* Performance by Role */}
      <motion.div variants={fadeUp}>
        <GlassCard className="p-6">
          <BarChart 
            data={avgRolePerformance.map(r => r.avgScore)} 
            labels={avgRolePerformance.map(r => r.role)}
            title="Average Performance by Role"
          />
        </GlassCard>
      </motion.div>

      {/* Recent Sessions */}
      <motion.div variants={fadeUp}>
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h3>
          <div className="space-y-3">
            {sections.slice(-5).reverse().map((section, index) => (
              <div key={section.sectionCode} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-aiva-purple/10 flex items-center justify-center">
                    <Users className="text-aiva-purple" size={16} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{section.role}</p>
                    <p className="text-sm text-gray-600">{section.level}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    section.answerQuality >= 70 ? 'text-green-600' :
                    section.answerQuality >= 40 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {section.answerQuality}%
                  </p>
                  <p className="text-xs text-gray-500">{section.questionsAnswered}/{section.totalQuestions} Q</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

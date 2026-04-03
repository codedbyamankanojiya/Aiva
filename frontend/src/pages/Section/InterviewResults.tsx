import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { ChevronLeft, Clock, CheckCircle, Award, Users, TrendingUp, PlayCircle, Timer } from "lucide-react";

interface SectionData {
  role: string;
  level: string;
  questionsAnswered: number;
  totalQuestions: number;
  timeSpent: string;
  completedAt: string;
  sectionCode: string;
  sessionStartTime: string;
  sessionEndTime: string;
  totalAttendanceTime: string;
  averageTimePerQuestion: string;
}

interface SectionDataResponse {
  sections: SectionData[];
}

export function InterviewResults() {
  const [sectionData, setSectionData] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSectionData = async () => {
      console.log('Fetching section data...');
      try {
        const response = await fetch('http://localhost:8000/api/section-data');
        console.log('Response status:', response.status);
        const data: SectionDataResponse = await response.json();
        console.log('Fetched data:', data);
        setSectionData(data.sections || []);
      } catch (error) {
        console.error('Failed to fetch section data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSectionData();
  }, []);

  const calculateCompletionRate = (answered: number, total: number) => {
    return Math.round((answered / total) * 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aiva-purple mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-400">Loading interview results...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-0 bg-white dark:bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.16),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.14),_transparent_32%)] opacity-0 dark:opacity-100" />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white/90 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/85">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/practice')}
                  className="flex items-center gap-2 text-gray-700 hover:bg-white/70 dark:text-slate-200 dark:hover:bg-slate-800/70"
                >
                  <ChevronLeft size={20} />
                  Back to Practice
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Interview Results</h1>
                  <p className="text-gray-600 dark:text-slate-400">View all completed interview sessions</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {sectionData.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800">
                <Award className="text-gray-400 dark:text-slate-500" size={40} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-slate-100">No interview results yet</h3>
              <p className="mb-6 text-gray-600 dark:text-slate-400">Complete an interview session to see your results here</p>
              <Button onClick={() => navigate('/practice')}>
                Start Interview
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sectionData.map((section, index) => (
                <div
                  key={index}
                  className="rounded-[1.6rem] border border-white/35 bg-white/70 p-6 shadow-[0_20px_60px_rgba(107,62,186,0.10)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(107,62,186,0.14)] dark:border-white/10 dark:bg-slate-900/70 dark:shadow-[0_18px_50px_rgba(0,0,0,0.32)]"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{section.role}</h3>
                      <p className="text-sm text-gray-600 dark:text-slate-400">{section.level}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-aiva-purple/10 dark:bg-aiva-purple/20">
                      <CheckCircle className="text-aiva-purple" size={24} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                        <Users size={16} />
                        <span>Progress</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                        {section.questionsAnswered}/{section.totalQuestions}
                      </span>
                    </div>

                    <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-slate-700">
                      <div 
                        className="bg-aiva-purple h-2 rounded-full transition-all duration-300"
                        style={{ width: `${calculateCompletionRate(section.questionsAnswered, section.totalQuestions)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                        <PlayCircle size={16} />
                        <span>Session Time</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{section.totalAttendanceTime}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                        <Timer size={16} />
                        <span>Avg per Question</span>
                      </div>
                      <span className="text-sm font-medium text-aiva-purple">{section.averageTimePerQuestion}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                        <Clock size={16} />
                        <span>Timer</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-slate-100">{section.timeSpent}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                        <TrendingUp size={16} />
                        <span>Completion</span>
                      </div>
                      <span className="text-sm font-medium text-aiva-purple">
                        {calculateCompletionRate(section.questionsAnswered, section.totalQuestions)}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-gray-100 pt-4 dark:border-white/10">
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Completed: {formatDate(section.completedAt)}
                    </p>
                    {section.sectionCode && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                        Section: {section.sectionCode}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-aiva-purple mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interview results...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Light background */}
      <div className="fixed inset-0 bg-white z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-gray-50" />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/practice')}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft size={20} />
                  Back to Practice
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Interview Results</h1>
                  <p className="text-gray-600">View all completed interview sessions</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {sectionData.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-gray-400" size={40} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No interview results yet</h3>
              <p className="text-gray-600 mb-6">Complete an interview session to see your results here</p>
              <Button onClick={() => navigate('/practice')}>
                Start Interview
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sectionData.map((section, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{section.role}</h3>
                      <p className="text-sm text-gray-600">{section.level}</p>
                    </div>
                    <div className="w-12 h-12 bg-aiva-purple/10 rounded-full flex items-center justify-center">
                      <CheckCircle className="text-aiva-purple" size={24} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users size={16} />
                        <span>Progress</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {section.questionsAnswered}/{section.totalQuestions}
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-aiva-purple h-2 rounded-full transition-all duration-300"
                        style={{ width: `${calculateCompletionRate(section.questionsAnswered, section.totalQuestions)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <PlayCircle size={16} />
                        <span>Session Time</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{section.totalAttendanceTime}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Timer size={16} />
                        <span>Avg per Question</span>
                      </div>
                      <span className="text-sm font-medium text-aiva-purple">{section.averageTimePerQuestion}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={16} />
                        <span>Timer</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{section.timeSpent}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <TrendingUp size={16} />
                        <span>Completion</span>
                      </div>
                      <span className="text-sm font-medium text-aiva-purple">
                        {calculateCompletionRate(section.questionsAnswered, section.totalQuestions)}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Completed: {formatDate(section.completedAt)}
                    </p>
                    {section.sectionCode && (
                      <p className="text-xs text-gray-500 mt-1">
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

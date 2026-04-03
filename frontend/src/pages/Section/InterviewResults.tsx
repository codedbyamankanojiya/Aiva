import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/common/Button";
import { ChevronLeft, Clock, CheckCircle, Award, Users, TrendingUp, PlayCircle, Timer, MessageSquare, Brain, Zap } from "lucide-react";

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

interface SectionDataResponse {
  sections: SectionData[];
}

export function InterviewResults() {
  const [sectionData, setSectionData] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<SectionData | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentSectionCode = searchParams.get('section');

  useEffect(() => {
    const fetchSectionData = async () => {
      console.log('Fetching section data...');
      try {
        const response = await fetch('http://localhost:8000/api/section-data');
        console.log('Response status:', response.status);
        const data: SectionDataResponse = await response.json();
        console.log('Fetched data:', data);
        
        // Sort sections in descending order by completion date
        const sortedSections = (data.sections || []).sort((a, b) => {
          const dateA = new Date(a.completedAt).getTime();
          const dateB = new Date(b.completedAt).getTime();
          return dateB - dateA; // Descending order (newest first)
        });
        
        setSectionData(sortedSections);
        
        // If current section code exists, find and set it as selected
        if (currentSectionCode) {
          const currentSection = sortedSections.find(section => section.sectionCode === currentSectionCode);
          if (currentSection) {
            setSelectedSection(currentSection);
          }
        }
      } catch (error) {
        console.error('Failed to fetch section data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSectionData();
  }, [currentSectionCode]);

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
                        <Brain size={16} />
                        <span>Response Accuracy</span>
                      </div>
                      <span className={`text-sm font-medium ${
                        section.answerQuality >= 70 ? 'text-green-600 dark:text-green-400' :
                        section.answerQuality >= 40 ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {section.answerQuality || 0}%
                      </span>
                    </div>

                    {/* Response Accuracy Progress Bar */}
                    <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-slate-700">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          section.answerQuality >= 70 ? 'bg-green-500' :
                          section.answerQuality >= 40 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${section.answerQuality || 0}%` }}
                      />
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
                        <Zap size={16} />
                        <span>Speaking Pace</span>
                      </div>
                      <span className="text-sm font-medium text-aiva-purple">{section.averageWordsPerMinute} WPM</span>
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
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        Completed: {formatDate(section.completedAt)}
                      </p>
                      {section.sectionCode && (
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                          Section: {section.sectionCode}
                        </p>
                      )}
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => setSelectedSection(section)}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={16} />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Section Modal */}
      {selectedSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl dark:bg-slate-900">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 dark:bg-slate-900 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                    {selectedSection.role} - {selectedSection.level}
                  </h2>
                  <p className="text-gray-600 dark:text-slate-400">
                    Section Code: {selectedSection.sectionCode}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedSection(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  ×
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Performance Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 dark:bg-slate-800">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400 mb-1">
                    <Users size={16} />
                    <span className="text-sm">Progress</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                    {selectedSection.questionsAnswered}/{selectedSection.totalQuestions}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 dark:bg-slate-800">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400 mb-1">
                    <Clock size={16} />
                    <span className="text-sm">Time</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                    {selectedSection.timeSpent}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 dark:bg-slate-800">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400 mb-1">
                    <Timer size={16} />
                    <span className="text-sm">Avg/Q</span>
                  </div>
                  <p className="text-2xl font-bold text-aiva-purple">
                    {selectedSection.averageTimePerQuestion}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 dark:bg-slate-800">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400 mb-1">
                    <Zap size={16} />
                    <span className="text-sm">WPM</span>
                  </div>
                  <p className="text-2xl font-bold text-aiva-purple">
                    {selectedSection.averageWordsPerMinute}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 dark:bg-slate-800">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400 mb-1">
                    <Brain size={16} />
                    <span className="text-sm">Response Accuracy</span>
                  </div>
                  <p className={`text-2xl font-bold mb-2 ${
                    selectedSection.answerQuality >= 70 ? 'text-green-600 dark:text-green-400' :
                    selectedSection.answerQuality >= 40 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {selectedSection.answerQuality || 0}%
                  </p>
                  <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-slate-600">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        selectedSection.answerQuality >= 70 ? 'bg-green-500' :
                        selectedSection.answerQuality >= 40 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${selectedSection.answerQuality || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Question Transcripts */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                  <MessageSquare size={20} />
                  Question Responses & AI Feedback
                </h3>
                
                {selectedSection.questionTranscripts.map((transcript, index) => (
                  <div key={transcript.questionId} className="border border-gray-200 rounded-lg p-4 dark:border-white/10">
                    <div className="mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-2">
                        Question {index + 1}: {transcript.question}
                      </h4>
                      <div className="bg-blue-50 rounded-lg p-3 dark:bg-blue-900/20">
                        <p className="text-sm text-gray-800 dark:text-slate-200">
                          <strong>Your Response:</strong> {transcript.transcript}
                        </p>
                      </div>
                    </div>
                    
                    {transcript.ai_analysis && (
                      <div className="bg-green-50 rounded-lg p-3 dark:bg-green-900/20">
                        <p className="text-sm text-gray-800 dark:text-slate-200">
                          <strong className="flex items-center gap-2">
                            <Brain size={16} />
                            AI Coach Feedback:
                          </strong>
                          <br />
                          {transcript.ai_analysis}
                        </p>
                      </div>
                    )}
                    
                    {/* Keywords Analysis */}
                    {(transcript.mentioned.length > 0 || transcript.notMentioned.length > 0) && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {transcript.mentioned.map((keyword, i) => (
                          <span key={i} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full dark:bg-green-900/30 dark:text-green-300">
                            ✓ {keyword}
                          </span>
                        ))}
                        {transcript.notMentioned.map((keyword, i) => (
                          <span key={i} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full dark:bg-red-900/30 dark:text-red-300">
                            ✗ {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

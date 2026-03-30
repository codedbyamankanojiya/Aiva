import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/common/GlassCard";
import { Button } from "@/components/common/Button";
import { useInterview } from "@/context/InterviewContext";
import { useTimer } from "@/hooks/useTimer";
import { Mic, Video, VideoOff, Hand, ChevronRight, Phone, MessageSquare } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

/* ── Active session phase (screenshot 6) ─────────────────── */
export function Session() {
  const { state, setQuestions } = useInterview();
  const { formatted } = useTimer({ autoStart: true });
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false); // Start with chat hidden
  const [isMobile, setIsMobile] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get section code from URL
  const sectionCode = searchParams.get('section') || '';

  // Handle refresh - redirect back to setup if no role/level data
  useEffect(() => {
    // Check if we have the required interview data
    if (!state.role || !state.level || !state.roleId) {
      // Redirect back to setup page
      navigate(`/interview?section=${sectionCode}`);
      return;
    }
  }, [state.role, state.level, state.roleId, navigate, sectionCode]);

  // Handle browser refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Save current state to sessionStorage for recovery
      sessionStorage.setItem('interviewState', JSON.stringify({
        role: state.role,
        level: state.level,
        roleId: state.roleId,
        currentQuestionIndex,
        sectionCode
      }));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.role, state.level, state.roleId, currentQuestionIndex, sectionCode]);

  // Current question with navigation
  const currentQuestion = state.questions[currentQuestionIndex] || null;
  const isLastQuestion = currentQuestionIndex === state.questions.length - 1;

  // Navigate to next question
  const handleNextQuestion = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Always fetch fresh questions when component mounts
  useEffect(() => {
    const fetchQuestions = async () => {
      if (state.roleId) {
        setLoading(true);
        try {
          // Fetch from FastAPI backend
          const response = await fetch(`http://localhost:8000/api/questions/${state.roleId}?level=${state.level}`);
          const data = await response.json();
          
          if (data.questions) {
            setQuestions(data.questions);
          } else {
            setQuestions([]);
          }
        } catch (error) {
          console.error('Failed to fetch questions:', error);
          setQuestions([]);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchQuestions();
  }, [state.roleId, state.level]);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      // Mobile breakpoint
      setIsMobile(width < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Simplified end interview function
  const handleEndInterview = () => {
    // Calculate results
    const results = {
      role: state.role,
      level: state.level,
      questionsAnswered: currentQuestionIndex + 1,
      totalQuestions: state.questions.length,
      timeSpent: formatted,
      completedAt: new Date().toISOString()
    };
    
    // Save results and mark as completed
    localStorage.setItem('interviewResults', JSON.stringify(results));
    localStorage.setItem('interviewCompleted', 'true');
    
    // Navigate back to practice
    navigate('/practice');
  };


  return (
    <>
      {/* Light background */}
      <div className="fixed inset-0 bg-white z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-gray-50" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Top bar - Light theme */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-aiva-purple flex items-center justify-center text-white text-sm font-semibold shadow-sm">
              A
            </div>
            <div>
              <h1 className="text-gray-900 text-sm font-medium">Aiva Interview Session</h1>
              <p className="text-gray-600 text-xs">{state.role || "Software Development"} · {state.level} · Section: {sectionCode}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-500 hover:text-gray-700 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Video grid area */}
        <div className="flex-1 p-4 overflow-hidden">
          <div className={`w-full h-full transition-all duration-300 ${
            showAIPanel && !isMobile 
              ? "grid grid-cols-1 lg:grid-cols-3 gap-4" 
              : "grid grid-cols-1 gap-4"
          }`}>
            {/* Main video feed */}
            <div className={`${showAIPanel && !isMobile ? 'lg:col-span-2' : ''} relative`}>
              <div className="relative w-full h-full bg-gray-100 rounded-xl overflow-hidden border border-gray-300 shadow-lg">
                {/* Video placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                      <Video size={isMobile ? 32 : 40} className="text-gray-500" />
                    </div>
                    <p className="text-gray-600 text-sm font-medium">Camera is off</p>
                    <p className="text-gray-500 text-xs mt-1">Click to start video</p>
                  </div>
                </div>
                
                {/* User info overlay */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-gray-200">
                  <p className="text-gray-900 text-sm font-medium">You</p>
                </div>

                {/* Question overlay - Show when chat is hidden */}
                {!showAIPanel && currentQuestion && (
                  <div className="absolute top-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg border border-gray-200">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-aiva-purple flex items-center justify-center text-white text-xs font-semibold shadow-sm flex-shrink-0">
                        A
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 text-sm font-medium">{currentQuestion.question}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-gray-600 text-xs">
                            Question {currentQuestionIndex + 1} of {state.questions.length}
                          </span>
                          <Button
                            size="sm"
                            onClick={handleNextQuestion}
                            disabled={isLastQuestion}
                            className="flex items-center gap-1 bg-aiva-purple hover:bg-aiva-purple/90 text-white shadow-sm"
                          >
                            Next
                            <ChevronRight size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AI Panel - Desktop only in grid */}
            {showAIPanel && !isMobile && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-lg h-full flex flex-col">
                {/* AI Panel Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-aiva-purple to-aiva-indigo flex items-center justify-center text-white font-semibold shadow-sm">
                      AI
                    </div>
                    <div>
                      <h3 className="text-gray-900 text-sm font-semibold">Aiva Assistant</h3>
                      <p className="text-gray-600 text-xs">Interview Coach</p>
                    </div>
                  </div>
                </div>

                {/* Chat messages area */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50">
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-aiva-purple/20 flex items-center justify-center">
                        <div className="w-2 h-2 bg-aiva-purple rounded-full animate-pulse" />
                      </div>
                      <div className="bg-white rounded-lg px-3 py-2 max-w-[80%] shadow-sm border border-gray-200">
                        <p className="text-gray-700 text-sm">Loading questions...</p>
                      </div>
                    </div>
                  ) : currentQuestion ? (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-aiva-purple flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                        A
                      </div>
                      <div className="bg-white rounded-lg px-3 py-2 max-w-[80%] shadow-sm border border-gray-200">
                        <p className="text-gray-900 text-sm font-medium">{currentQuestion.question}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                        A
                      </div>
                      <div className="bg-white rounded-lg px-3 py-2 max-w-[80%] shadow-sm border border-gray-200">
                        <p className="text-gray-600 text-sm">No questions available</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Question navigation */}
                {currentQuestion && (
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-600 text-xs">
                        Question {currentQuestionIndex + 1} of {state.questions.length}
                      </span>
                      <Button
                        size="sm"
                        onClick={handleNextQuestion}
                        disabled={isLastQuestion}
                        className="flex items-center gap-1 bg-aiva-purple hover:bg-aiva-purple/90 text-white shadow-sm"
                      >
                        Next
                        <ChevronRight size={14} />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2 border border-gray-200">
                        <p className="text-gray-600 text-xs">Listening...</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile AI Panel - Full screen overlay */}
        {showAIPanel && isMobile && (
          <div className="fixed inset-0 bg-white z-50 flex flex-col">
            {/* AI Panel Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-aiva-purple to-aiva-indigo flex items-center justify-center text-white font-semibold shadow-sm">
                    AI
                  </div>
                  <div>
                    <h3 className="text-gray-900 text-sm font-semibold">Aiva Assistant</h3>
                    <p className="text-gray-600 text-xs">Interview Coach</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIPanel(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Chat messages area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/50">
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-aiva-purple/20 flex items-center justify-center">
                    <div className="w-2 h-2 bg-aiva-purple rounded-full animate-pulse" />
                  </div>
                  <div className="bg-white rounded-lg px-3 py-2 max-w-[80%] shadow-sm border border-gray-200">
                    <p className="text-gray-700 text-sm">Loading questions...</p>
                  </div>
                </div>
              ) : currentQuestion ? (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-aiva-purple flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                    A
                  </div>
                  <div className="bg-white rounded-lg px-3 py-2 max-w-[80%] shadow-sm border border-gray-200">
                    <p className="text-gray-900 text-sm font-medium">{currentQuestion.question}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                    A
                  </div>
                  <div className="bg-white rounded-lg px-3 py-2 max-w-[80%] shadow-sm border border-gray-200">
                    <p className="text-gray-600 text-sm">No questions available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Question navigation */}
            {currentQuestion && (
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-600 text-xs">
                    Question {currentQuestionIndex + 1} of {state.questions.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2 border border-gray-200">
                    <p className="text-gray-600 text-xs">Listening...</p>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile bottom controls */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
                    isMuted 
                      ? "bg-red-500 hover:bg-red-600 text-white shadow-red-200" 
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
                  }`}
                >
                  <Mic size={20} />
                </button>
                
                <button
                  onClick={handleEndInterview}
                  className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200 shadow-md shadow-red-200"
                >
                  <Phone size={20} />
                </button>

                {currentQuestion && !isLastQuestion && (
                  <Button
                    size="sm"
                    onClick={handleNextQuestion}
                    className="flex items-center gap-1 bg-aiva-purple hover:bg-aiva-purple/90 text-white shadow-sm"
                  >
                    Next
                    <ChevronRight size={14} />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bottom controls - Light theme */}
        <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200 shadow-lg">
          <div className="flex items-center justify-center gap-2 p-4">
            {/* All controls centered */}
            <button
              onClick={() => setShowAIPanel(!showAIPanel)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
                showAIPanel 
                  ? "bg-aiva-purple hover:bg-aiva-purple/90 text-white shadow-purple-200" 
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
              }`}
            >
              <MessageSquare size={20} />
            </button>
            
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
                isMuted 
                  ? "bg-red-500 hover:bg-red-600 text-white shadow-red-200" 
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
              }`}
            >
              <Mic size={20} />
            </button>
            
            <button
              className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 transition-all duration-200 shadow-md"
            >
              <VideoOff size={20} />
            </button>

            {/* Center - Join info */}
            {!isMobile && (
              <div className="flex items-center gap-2 px-6 bg-gray-100 rounded-lg py-2">
                <span className="text-gray-600 text-sm">Press</span>
                <kbd className="px-2 py-1 bg-white text-gray-700 text-xs rounded border border-gray-300 shadow-sm">Space</kbd>
                <span className="text-gray-600 text-sm">to speak</span>
              </div>
            )}

            <span className="text-gray-700 text-sm font-mono bg-gray-100 px-3 py-1.5 rounded border border-gray-300 shadow-sm">
              {formatted}
            </span>
            
            <button
              onClick={handleEndInterview}
              className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-200 shadow-md shadow-red-200"
            >
              <Phone size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

import { useState, useEffect, useRef } from "react";

import { motion, AnimatePresence } from "framer-motion";

import { GlassCard } from "@/components/common/GlassCard";

import { Button } from "@/components/common/Button";

import { useInterview } from "@/context/InterviewContext";

import { useTimer } from "@/hooks/useTimer";

import { Mic, MicOff, Video, VideoOff, Hand, ChevronRight, Phone, MessageSquare } from "lucide-react";

import { useNavigate, useSearchParams } from "react-router-dom";



/* ── Active session phase (screenshot 6) ─────────────────── */

export function Session() {

  const { state, setQuestions } = useInterview();

  const { formatted } = useTimer({ autoStart: true });

  const [isMuted, setIsMuted] = useState(false);

  const [isCameraOn, setIsCameraOn] = useState(false);

  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const [loading, setLoading] = useState(false);

  const [showAIPanel, setShowAIPanel] = useState(false); // Start with chat hidden

  const [isMobile, setIsMobile] = useState(false);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const [isSpeaking, setIsSpeaking] = useState(false);

  const [hasPlayedFirstQuestion, setHasPlayedFirstQuestion] = useState(false);

  const hasInitialized = useRef(false);

  

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

  const handleNextQuestion = async () => {

    if (!isLastQuestion) {

      const nextIndex = currentQuestionIndex + 1;

      setCurrentQuestionIndex(nextIndex);

      

      // Play TTS for the next question

      const nextQuestion = state.questions[nextIndex];

      if (nextQuestion) {

        await playQuestionAudio(nextQuestion.question);

      }

    }

  };



  // Always fetch fresh questions when component mounts

  useEffect(() => {

    // Prevent multiple initializations using ref

    if (hasInitialized.current) {

      console.log('Already initialized, skipping...');

      return;

    }



    console.log('Initializing questions fetch...');



    const fetchQuestions = async () => {

      if (state.roleId) {

        setLoading(true);

        try {

          // Fetch from FastAPI backend

          const response = await fetch(`http://localhost:8000/api/questions/${state.roleId}?level=${state.level}`);

          const data = await response.json();

          

          if (data.questions) {

            setQuestions(data.questions);

            

            // Play TTS for first question only once

            if (data.questions.length > 0 && !hasPlayedFirstQuestion) {

              console.log('Playing first question TTS...');

              await playQuestionAudio(data.questions[0].question);

              setHasPlayedFirstQuestion(true);

            }

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

    hasInitialized.current = true;

  }, [state.roleId, state.level]); 



  // Function to play question audio using TTS

  const playQuestionAudio = async (questionText: string) => {

    // Prevent multiple simultaneous TTS calls

    if (isSpeaking) {

      console.log('TTS already in progress, skipping...');

      return;

    }



    setIsSpeaking(true);

    

    // Use browser's built-in speech synthesis directly

    console.log('Using browser TTS for question:', questionText);

    await playBrowserTTS(questionText);

  };



  // Fallback function using browser's built-in speech synthesis

  const playBrowserTTS = (text: string): Promise<void> => {

    return new Promise((resolve, reject) => {

      if ('speechSynthesis' in window) {

        // Cancel any ongoing speech

        window.speechSynthesis.cancel();

        

        // Small delay to ensure cancellation completes

        setTimeout(() => {

          const utterance = new SpeechSynthesisUtterance(text);

          utterance.rate = 0.9; // Slightly slower for better comprehension

          utterance.pitch = 1.0;

          utterance.volume = 1.0;

          

          utterance.onend = () => {

            setIsSpeaking(false);

            resolve();

          };

          

          utterance.onerror = (event) => {

            console.error('Browser TTS error:', event);

            setIsSpeaking(false);

            reject(event);

          };

          

          window.speechSynthesis.speak(utterance);

        }, 100);

      } else {

        console.warn('Speech synthesis not supported in this browser');

        setIsSpeaking(false);

        resolve(); // Resolve silently if TTS is not supported

      }

    });

  };



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



  const stopTracks = (stream: MediaStream | null) => {

    if (!stream) return;

    stream.getTracks().forEach((t) => t.stop());

  };



  const startCamera = async () => {

    try {

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });

      setMediaStream(stream);

      setIsCameraOn(true);

    } catch (e) {

      console.error("Failed to access camera", e);

      setIsCameraOn(false);

    }

  };



  const stopCamera = () => {

    stopTracks(mediaStream);

    setMediaStream(null);

    setIsCameraOn(false);

  };



  const toggleCamera = async () => {

    if (isCameraOn) {

      stopCamera();

      return;

    }

    await startCamera();

  };



  useEffect(() => {

    return () => {

      stopTracks(mediaStream);

    };

  }, [mediaStream]);





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

                {/* Video */}

                {isCameraOn && mediaStream ? (

                  <video

                    className="absolute inset-0 w-full h-full object-cover"

                    autoPlay

                    playsInline

                    muted

                    ref={(el) => {

                      if (!el) return;

                      if (el.srcObject !== mediaStream) el.srcObject = mediaStream;

                    }}

                  />

                ) : (

                  <button

                    type="button"

                    onClick={startCamera}

                    className="absolute inset-0 flex items-center justify-center w-full h-full"

                  >

                    <div className="text-center group">

                      <div className="w-24 h-24 rounded-full bg-white shadow-md flex items-center justify-center mb-6 mx-auto group-hover:scale-105 transition-transform duration-300">

                        <VideoOff size={isMobile ? 36 : 44} className="text-gray-400 group-hover:text-aiva-purple transition-colors" />

                      </div>

                      <p className="text-gray-800 text-lg font-semibold tracking-wide">Camera is off</p>

                      <p className="text-gray-500 text-sm mt-2 font-medium">Click to start video</p>

                    </div>

                  </button>

                )}

                

                {/* User info overlay */}

                <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md rounded-lg px-4 py-2 shadow-lg border border-white/10">

                  <p className="text-white text-sm font-medium tracking-wide">You</p>

                </div>



                {/* Question overlay - Show when chat is hidden */}

                {!showAIPanel && currentQuestion && (

                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-full max-w-2xl bg-white/95 backdrop-blur-md rounded-2xl px-6 py-5 shadow-2xl border border-gray-200/60 transition-all duration-300 z-10">

                    <div className="flex items-start gap-4">

                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-aiva-purple to-aiva-indigo flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0">

                        AI

                      </div>

                      <div className="flex-1 pt-1">

                        <p className="text-gray-900 text-base font-medium leading-relaxed">{currentQuestion.question}</p>

                        <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">

                          <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">

                            Question {currentQuestionIndex + 1} of {state.questions.length}

                          </span>

                          <Button

                            size="sm"

                            onClick={handleNextQuestion}

                            disabled={isLastQuestion}

                            className="flex items-center gap-2 bg-aiva-purple hover:bg-aiva-purple/90 text-white rounded-full px-4 shadow-sm transition-all"

                          >

                            Next Question

                            <ChevronRight size={16} />

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



        {/* Bottom controls - Professional Layout */}

        <div className="bg-white border-t border-gray-200 z-20 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">

          <div className="flex items-center justify-between px-6 py-4">

            {/* Left: Time & Status */}

            <div className="flex items-center gap-4 w-1/3">

              <span className="text-gray-800 text-base font-semibold font-mono tracking-tight">

                {formatted}

              </span>

              <div className="h-4 w-px bg-gray-300"></div>

              <span className="text-gray-500 text-sm font-medium hidden sm:inline-block">Session Active</span>

            </div>



            {/* Center: Core Controls */}

            <div className="flex items-center justify-center gap-4 w-1/3">

              <button

                onClick={() => setIsMuted(!isMuted)}

                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${

                  isMuted 

                    ? "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200" 

                    : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"

                }`}

                aria-label={isMuted ? "Unmute" : "Mute"}

              >

                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}

              </button>



              <button

                onClick={toggleCamera}

                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${

                  !isCameraOn

                    ? "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"

                    : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"

                }`}

                aria-label={isCameraOn ? "Turn camera off" : "Turn camera on"}

              >

                {isCameraOn ? <Video size={24} /> : <VideoOff size={24} />}

              </button>



              <button

                onClick={handleEndInterview}

                className="w-16 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-300 shadow-md shadow-red-200 flex items-center justify-center group"

                aria-label="End call"

              >

                <div className="group-hover:scale-110 transition-transform">

                  <Phone size={22} className="transform rotate-[135deg]" />

                </div>

              </button>

            </div>



            {/* Right: Auxiliary Controls */}

            <div className="flex items-center justify-end gap-3 w-1/3">

              <button

                onClick={() => setShowAIPanel(!showAIPanel)}

                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${

                  showAIPanel 

                    ? "bg-aiva-purple/10 text-aiva-purple border border-aiva-purple/20 shadow-purple-100" 

                    : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"

                }`}

                aria-label="Toggle chat panel"

              >

                <MessageSquare size={20} />

              </button>

            </div>

          </div>

        </div>

      </div>

    </>

  );

}


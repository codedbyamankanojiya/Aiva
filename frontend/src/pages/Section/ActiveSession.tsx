import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/common/GlassCard";
import { Button } from "@/components/common/Button";
import { useInterview } from "@/context/InterviewContext";
import { useTimer } from "@/hooks/useTimer";
import { Mic, MicOff, Video, VideoOff, Hand, ChevronRight, Phone, MessageSquare } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AIPanel } from "./sectionComponent/AIPanel";
import { useVisionSystem } from "@/hooks/useVisionSystem";
import { FaceTrackingOverlay } from "@/components/vision/FaceTrackingOverlay";
import { VisionHUD } from "@/components/vision/VisionHUD";

/* ── Active session phase (screenshot 6) ─────────────────── */
export function Session() {
  const { state, setQuestions } = useInterview();
  const { formatted } = useTimer({ autoStart: true });
  const [isMuted, setIsMuted] = useState(true); // Start with mic muted
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [videoDimensions, setVideoDimensions] = useState({ w: 1280, h: 720 });
  const [loading, setLoading] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false); // Start with chat hidden
  const [isMobile, setIsMobile] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasPlayedFirstQuestion, setHasPlayedFirstQuestion] = useState(false);
  const hasInitialized = useRef(false);
  const sttSocketRef = useRef<WebSocket | null>(null);
  const sttAudioContextRef = useRef<AudioContext | null>(null);
  const sttWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const sttStreamRef = useRef<MediaStream | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [finalTranscripts, setFinalTranscripts] = useState<string[]>([]);
  const [sttError, setSttError] = useState<string>("");
  const [isSTTConnecting, setIsSTTConnecting] = useState(false);
  const [sttLatency, setSttLatency] = useState<number | null>(null);

  // Silence detection state
  const [lastTranscriptLength, setLastTranscriptLength] = useState<number>(0);
  const [hasSpoken, setHasSpoken] = useState<boolean>(false);
  const [isSilenceDetected, setIsSilenceDetected] = useState<boolean>(false);
  const [isMicDisabled, setIsMicDisabled] = useState<boolean>(false);
  const silenceTimerRef = useRef<number | null>(null);

  // AI Analysis state
  const [aiAnalysis, setAiAnalysis] = useState<string>(""); // Add AI analysis state

  // Fetch AI analysis from backend
  const fetchAIAnalysis = async (question: any, transcript: string, mentioned: string[], notMentioned: string[]) => {
    try {
      const response = await fetch(`http://localhost:8000/api/ai-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.question,
          transcript: transcript,
          mentioned: mentioned,
          notMentioned: notMentioned
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiAnalysis(data.analysis || 'AI analysis not available');
        console.log('✅ AI Analysis received:', data.analysis);
      } else {
        console.error('❌ Failed to fetch AI analysis');
        setAiAnalysis('AI analysis failed');
      }
    } catch (error) {
      console.error('❌ Error fetching AI analysis:', error);
      setAiAnalysis('AI analysis error');
    }
  };

  // Fetch semantic analysis and then AI analysis
  const fetchSemanticAnalysisAndAI = async (question: any, transcript: string) => {
    try {
      // First get semantic analysis from backend
      const response = await fetch(`http://localhost:8000/api/semantic-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: currentQuestion?.id || '',
          transcript: transcript
        })
      });

      if (response.ok) {
        const data = await response.json();
        const mentioned = data.mentioned || [];
        const notMentioned = data.notMentioned || [];
        
        console.log('✅ Semantic Analysis:', { mentioned, notMentioned });
        
        // Then fetch AI analysis with semantic context
        await fetchAIAnalysis(question, transcript, mentioned, notMentioned);
      } else {
        console.error('❌ Failed to fetch semantic analysis');
        // Fallback to AI analysis without semantic context
        await fetchAIAnalysis(question, transcript, [], []);
      }
    } catch (error) {
      console.error('❌ Error in semantic analysis:', error);
      // Fallback to AI analysis without semantic context
      await fetchAIAnalysis(question, transcript, [], []);
    }
  };

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

  // Session ID for persistence
  const sessionId = useMemo(() => {
    const base = `${state.roleId}-${state.level}-${sectionCode}`;
    const stored = sessionStorage.getItem('interviewSessionId');
    if (stored && stored.startsWith(base)) {
      return stored;
    }
    const id = `${base}-${Date.now()}`;
    sessionStorage.setItem('interviewSessionId', id);
    return id;
  }, [state.roleId, state.level, sectionCode]);

  // Track video container dimensions safely
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    setVideoDimensions({ w: el.clientWidth, h: el.clientHeight });

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        setVideoDimensions((prev) => {
          const nw = Math.round(width);
          const nh = Math.round(height);
          if (prev.w === nw && prev.h === nh) return prev;
          return { w: nw, h: nh };
        });
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Vision monitoring system ─────────────────────────────────────────────
  const visionState = useVisionSystem({
    videoRef,
    sessionId,
    enabled: isCameraOn,
  });

  // Load persisted transcripts on mount
  useEffect(() => {
    const stored = localStorage.getItem(`transcripts-${sessionId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFinalTranscripts(parsed);
        }
      } catch {
        localStorage.removeItem(`transcripts-${sessionId}`);
      }
    }
  }, [sessionId]);

  // Save transcripts to localStorage on change
  useEffect(() => {
    if (finalTranscripts.length > 0) {
      localStorage.setItem(`transcripts-${sessionId}`, JSON.stringify(finalTranscripts));
    }
  }, [finalTranscripts, sessionId]);

  // Clear transcripts when starting new session
  useEffect(() => {
    const handleNewSession = () => {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('transcripts-') && !key.includes(sessionId)) {
          localStorage.removeItem(key);
        }
      });
    };

    window.addEventListener('beforeunload', handleNewSession);
    return () => window.removeEventListener('beforeunload', handleNewSession);
  }, [sessionId]);

  // Current question with navigation
  const currentQuestion = state.questions[currentQuestionIndex] || null;
  const isLastQuestion = currentQuestionIndex === state.questions.length - 1;

  // Navigate to next question
  const handleNextQuestion = async () => {
    if (!isLastQuestion && !isSpeaking) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      
      // Clear transcripts for new question
      setFinalTranscripts([]);
      setLiveTranscript('');
      
      // Clear AI analysis for new question
      setAiAnalysis('');
      
      // Reset silence detection state for new question
      setHasSpoken(false);
      setLastTranscriptLength(0);
      setIsSilenceDetected(false);
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      
      // Play TTS for the next question
      const nextQuestion = state.questions[nextIndex];
      if (nextQuestion) {
        await playQuestionAudio(nextQuestion.question);
        
        // Wait for TTS to complete before re-enabling mic
        // The playQuestionAudio function already waits for TTS completion
        // So we can safely re-enable mic here
        setIsMuted(false);
        setIsMicDisabled(false);
      }
    }
  };

  // Fetch questions once when component mounts
  useEffect(() => {
    // Debug: Log initial state
    console.log('🔍 ACTIVE SESSION MOUNT - Initial State:');
    console.log('🔍 state.role:', state.role);
    console.log('🔍 state.level:', state.level);
    console.log('🔍 state.roleId:', state.roleId);
    console.log('🔍 sectionCode:', sectionCode);
    
    if (hasInitialized.current || !state.roleId) return;
    
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/api/questions/${state.roleId}?level=${state.level}`);
        const data = await response.json();
        
        if (data.questions?.length > 0 && !hasPlayedFirstQuestion) {
          setQuestions(data.questions);
          setLoading(false);
          setHasPlayedFirstQuestion(true);
          
          // Clear AI analysis when starting new session
          setAiAnalysis('');
          
          // Play first question and wait for TTS to complete before enabling mic
          await playQuestionAudio(data.questions[0].question);
          setIsMuted(false);
          setIsMicDisabled(false);
        }
      } catch (error) {
        console.error('Failed to fetch questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
    hasInitialized.current = true;
  }, [state.roleId, state.level]); 

  // Simplified TTS function
  const playQuestionAudio = async (questionText: string) => {
    if (isSpeaking) return;
    
    setIsSpeaking(true);
    await playBrowserTTS(questionText);
  };

  // Simplified browser TTS
  const playBrowserTTS = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        setIsSpeaking(false);
        return resolve();
      }

      window.speechSynthesis.cancel();
      
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.volume = 1.0;
        
        utterance.onend = () => {
          setIsSpeaking(false);
          resolve();
        };
        
        utterance.onerror = () => {
          setIsSpeaking(false);
          resolve();
        };
        
        window.speechSynthesis.speak(utterance);
      }, 100);
    });
  };

  // Silence detection logic
  const handleSilenceDetected = async () => {
    if (isSilenceDetected || !currentQuestion) return;
    
    // Debug: Check current state values
    console.log('🔍 SILENCE DETECTED - Current State Analysis:');
    console.log('🔍 state.role:', state.role);
    console.log('🔍 state.level:', state.level);
    console.log('🔍 state.roleId:', state.roleId);
    console.log('🔍 state.questions.length:', state.questions.length);
    console.log('🔍 currentQuestion:', currentQuestion);
    console.log('🔍 sectionCode:', sectionCode);
    console.log('🔍 sessionId:', sessionId);
    
    setIsSilenceDetected(true);
    
    // Combine all transcripts for complete answer
    const completeAnswer = [...finalTranscripts, liveTranscript].join(' ').trim();
    
    if (completeAnswer) {
      try {
        // Debug: Log the session data being sent
        const transcriptPayload = {
          sessionId: sessionId,
          questionId: currentQuestion.id,
          question: currentQuestion.question,
          transcript: completeAnswer,
          timestamp: new Date().toISOString(),
          sectionCode: sectionCode,
          // Include current session data to avoid empty fields
          role: state.role,
          level: state.level,
          totalQuestions: state.questions.length
        };
        
        console.log('🔍 Frontend sending transcript data:', transcriptPayload);
        console.log('🔍 State role:', state.role);
        console.log('🔍 State level:', state.level);
        console.log('🔍 State questions length:', state.questions.length);
        
        // Save question transcript to backend with session data
        await fetch('http://localhost:8000/api/question-transcript', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transcriptPayload),
        });
      } catch (error) {
        console.error('Failed to save question transcript:', error);
      }
    }
    
    // Stop STT and turn off mic
    stopSTT();
    setIsMuted(true);
    
    // Disable mic button completely
    setIsMicDisabled(true);
    
    // Keep transcripts in AI panel (don't clear them)
    // setFinalTranscripts([]);
    // setLiveTranscript('');
    
    // Reset silence detection state after a delay
    setTimeout(() => {
      setIsSilenceDetected(false);
      setHasSpoken(false);
      setLastTranscriptLength(0);
      
      // Get semantic analysis first, then fetch AI analysis
      fetchSemanticAnalysisAndAI(currentQuestion, finalTranscripts.join(' '));
    }, 2000); // Show "Analyzing your response" for 2 seconds
    
    // Auto-advance to next question (COMMENTED OUT)
    // if (!isLastQuestion) {
    //   setTimeout(() => {
    //     handleNextQuestion();
    //     setIsSilenceDetected(false);
    //   }, 1000);
    // }
  };

  // Clear AI analysis when question changes
  useEffect(() => {
    // Clear AI analysis when moving to a new question
    setAiAnalysis('');
  }, [currentQuestionIndex]);

  // Silence detection useEffect
  useEffect(() => {
    // Clear existing timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    const currentLength = liveTranscript.length;
    
    // Check if user has spoken (transcript length > 0)
    if (currentLength > 0) {
      setHasSpoken(true);
    }
    
    // Check for silence conditions
    const isSilenceCondition = 
      (hasSpoken && currentLength === 0) || // Empty transcript after speaking
      (hasSpoken && currentLength === lastTranscriptLength && currentLength > 0); // Same length for 5 seconds
    
    if (isSilenceCondition) {
      // Set timer for 5 seconds
      silenceTimerRef.current = window.setTimeout(() => {
        handleSilenceDetected();
      }, 5000);
    } else {
      // Update last transcript length when it changes
      setLastTranscriptLength(currentLength);
    }

    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [liveTranscript, hasSpoken, lastTranscriptLength, isSilenceDetected, currentQuestion, isLastQuestion]);

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

  // Auto-start camera on mount
  useEffect(() => {
    if (!isCameraOn) {
      startCamera();
    }
  }, []);

  // Simplified end interview function
  const handleEndInterview = async () => {
    // Calculate results
    const results = {
      role: state.role,
      level: state.level,
      questionsAnswered: currentQuestionIndex + 1,
      totalQuestions: state.questions.length,
      timeSpent: formatted,
      completedAt: new Date().toISOString(),
      sectionCode: sectionCode,
      transcripts: finalTranscripts,
      sessionId: sessionId,
      // Add questionTranscripts field for merging
      questionTranscripts: finalTranscripts.map((transcript, index) => ({
        questionId: state.questions[index]?.id || `q-${index}`,
        question: state.questions[index]?.question || "Question not available",
        transcript: transcript,
        timestamp: new Date().toISOString()
      }))
    };
    
    // Save to localStorage for compatibility
    localStorage.setItem('interviewResults', JSON.stringify(results));
    localStorage.setItem('interviewCompleted', 'true');
    
    // Save to backend SectionData.json
    try {
      const response = await fetch('http://localhost:8000/api/section-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(results),
      });
      
      if (response.ok) {
        console.log('Section data saved successfully');
      } else {
        console.error('Failed to save section data to backend');
      }
    } catch (error) {
      console.error('Error saving section data:', error);
    }
    
    // Navigate to results page instead of practice
    navigate('/results');
  };

  const stopTracks = (stream: MediaStream | null) => {
    if (!stream) return;
    stream.getTracks().forEach((t) => t.stop());
  };

  const stopSTT = () => {
    // Clear silence detection timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    try {
      if (sttWorkletNodeRef.current) {
        sttWorkletNodeRef.current.port.close();
        sttWorkletNodeRef.current.disconnect();
      }
    } catch {
    }

    try {
      if (sttAudioContextRef.current && sttAudioContextRef.current.state !== 'closed') {
        sttAudioContextRef.current.close();
      }
    } catch {
    }

    sttWorkletNodeRef.current = null;
    sttAudioContextRef.current = null;

    if (sttSocketRef.current) {
      try {
        sttSocketRef.current.close();
      } catch {
      }
    }
    sttSocketRef.current = null;

    stopTracks(sttStreamRef.current);
    sttStreamRef.current = null;
    setLiveTranscript("");
    setSttError("");
    setIsSTTConnecting(false);
    setSttLatency(null);
    
    // Reset silence detection state
    setHasSpoken(false);
    setLastTranscriptLength(0);
  };

  const startSTT = async () => {
    // Prevent multiple simultaneous connections
    if (sttSocketRef.current || sttAudioContextRef.current) {
      console.log('STT already running, skipping...');
      return;
    }

    setIsSTTConnecting(true);
    setSttError("");
    setSttLatency(null);

    try {
      console.log('Starting STT connection...');
      // Step 1: Connect WebSocket
      const wsUrl = "ws://localhost:8000/ws/stt";
      const socket = new WebSocket(wsUrl);
      socket.binaryType = "arraybuffer";
      sttSocketRef.current = socket;

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(String(event.data));
          if (msg?.type === "error") {
            setSttError(msg.message || "STT service error");
            stopSTT();
            return;
          }
          if (msg?.type === "transcript") {
            // Calculate latency if we have a timestamp
            if (msg.metadata?.start_time) {
              const latency = Date.now() - msg.metadata.start_time;
              setSttLatency(latency);
            }
            
            if (msg.is_final) {
              setFinalTranscripts((prev) => [...prev, msg.transcript]);
              setLiveTranscript("");
            } else {
              setLiveTranscript(msg.transcript);
            }
          }
        } catch {
        }
      };

      socket.onerror = () => {
        setSttError("STT connection failed");
        stopSTT();
      };

      socket.onclose = (event) => {
        sttSocketRef.current = null;
        if (!event.wasClean && sttError === "") {
          setSttError("STT connection lost");
        }
      };

      await new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(() => {
          reject(new Error("STT socket timeout"));
        }, 5000);
        socket.onopen = () => {
          window.clearTimeout(timeout);
          resolve();
        };
        socket.onerror = () => {
          window.clearTimeout(timeout);
          reject(new Error("STT socket error"));
        };
      });

      // Step 2: Setup AudioWorklet
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
        latencyHint: 'interactive'
      });
      sttAudioContextRef.current = audioContext;

      // Load AudioWorklet processor
      await audioContext.audioWorklet.addModule('/audio-processor.js');

      // Get microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }, 
        video: false 
      });
      sttStreamRef.current = stream;

      // Create audio source and worklet node
      const source = audioContext.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(audioContext, 'audio-processor', {
        processorOptions: {
          sampleRate: 16000
        }
      });
      sttWorkletNodeRef.current = workletNode;

      // Connect audio pipeline
      source.connect(workletNode);
      workletNode.connect(audioContext.destination);

      // Handle PCM data from AudioWorklet
      workletNode.port.onmessage = (event) => {
        if (socket.readyState === WebSocket.OPEN && !isMuted) {
          const pcmBuffer = event.data;
          socket.send(pcmBuffer);
        }
      };

      setIsSTTConnecting(false);
      console.log('✅ AudioWorklet STT initialized successfully');
      
    } catch (error) {
      console.error("STT setup failed:", error);
      setSttError("Failed to start speech recognition");
      stopSTT();
    }
  };

  useEffect(() => {
    if (isMuted) {
      stopSTT();
      return;
    }

    // Add a small delay to ensure proper initialization
    const timer = setTimeout(() => {
      void startSTT();
    }, 500);

    return () => {
      clearTimeout(timer);
      stopSTT();
    };
  }, [isMuted]);

  useEffect(() => {
    return () => {
      stopSTT();
    };
  }, []);

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
    // Stop all tracks immediately — this kills the hardware camera light
    stopTracks(mediaStream);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
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
      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && !hasPlayedFirstQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white"
          >
            <div className="relative mb-8">
              <div className="w-20 h-20 rounded-2xl bg-aiva-purple/10 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-aiva-purple border-t-transparent rounded-full animate-spin" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -inset-4 bg-aiva-purple/5 rounded-full blur-xl"
              />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Preparing Your Interview</h2>
            <p className="text-gray-500 text-sm">Aiva is crafting personalized questions for you...</p>
          </motion.div>
        )}
      </AnimatePresence>

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
        <div className="flex-1 min-h-0 p-4 lg:p-6 overflow-hidden">
          <div className={`w-full h-full transition-all duration-300 ease-in-out ${
            showAIPanel && !isMobile 
              ? "grid grid-cols-1 lg:grid-cols-3 gap-6" 
              : "grid grid-cols-1 gap-6"
          }`}>
            {/* Main video feed */}
            <div className={`${showAIPanel && !isMobile ? 'lg:col-span-2' : ''} relative h-full min-h-[300px]`}>
              <div
                className="relative w-full h-full bg-gray-900 rounded-3xl overflow-hidden border border-gray-200/50 shadow-2xl transition-all duration-500"
                ref={containerRef}
              >
                {/* Layer 1: Video feed */}
                {isCameraOn && mediaStream ? (
                  <video
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    playsInline
                    muted
                    ref={(el) => {
                      videoRef.current = el;
                      if (el && el.srcObject !== mediaStream) {
                        el.srcObject = mediaStream;
                      }
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

                {/* Layer 2: Landmark canvas overlay */}
                {isCameraOn && (
                  <FaceTrackingOverlay
                    faceResult={visionState.faceResult}
                    poseResult={visionState.poseResult}
                    width={videoDimensions.w}
                    height={videoDimensions.h}
                  />
                )}

                {/* Layer 3: Vision HUD (glass overlay) */}
                {isCameraOn && (
                  <VisionHUD
                    faceMetrics={visionState.faceMetrics}
                    movementMetrics={visionState.movementMetrics}
                    systemStatus={visionState.systemStatus}
                    inferenceLatencyMs={visionState.inferenceLatencyMs}
                    videoEl={videoRef.current}
                  />
                )}

                {/* User info overlay */}
                <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md rounded-lg px-4 py-2 shadow-lg border border-white/10" style={{ zIndex: 30 }}>
                  <p className="text-white text-sm font-medium tracking-wide">You</p>
                </div>

                {/* Question overlay - Show when chat is hidden */}
                {!showAIPanel && (
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-full max-w-2xl bg-white/95 backdrop-blur-md rounded-2xl px-6 py-5 shadow-2xl border border-gray-200/60 transition-all duration-300" style={{ zIndex: 40 }}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-aiva-purple to-aiva-indigo flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0">
                        AI
                      </div>
                      <div className="flex-1 pt-1">
                        {currentQuestion ? (
                          <>
                            <p className="text-gray-900 text-base font-medium leading-relaxed">{currentQuestion.question}</p>
                            <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
                                Question {currentQuestionIndex + 1} of {state.questions.length}
                              </span>
                              <Button
                                size="sm"
                                onClick={handleNextQuestion}
                                disabled={isLastQuestion || isSpeaking}
                                className="flex items-center gap-2 bg-aiva-purple hover:bg-aiva-purple/90 text-white rounded-full px-4 shadow-sm transition-all"
                              >
                                Next Question
                                <ChevronRight size={16} />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <p className="text-gray-500 text-base font-medium leading-relaxed">Preparing your interview questions...</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AI Panel - Desktop only in grid */}
            {!isMobile && (
              <AIPanel
                showAIPanel={showAIPanel}
                isMobile={isMobile}
                loading={loading}
                currentQuestion={currentQuestion}
                currentQuestionIndex={currentQuestionIndex}
                totalQuestions={state.questions.length}
                isLastQuestion={isLastQuestion}
                isSpeaking={isSpeaking}
                isSilenceDetected={isSilenceDetected}
                onClose={() => setShowAIPanel(false)}
                onNextQuestion={handleNextQuestion}
                liveTranscript={liveTranscript}
                finalTranscripts={finalTranscripts}
                sttError={sttError}
                isSTTConnecting={isSTTConnecting}
                sttLatency={sttLatency}
                aiAnalysis={aiAnalysis} // Pass AI analysis to component
              />
            )}
          </div>
        </div>

        {/* Mobile AI Panel - Full screen overlay */}
        {isMobile && (
          <AIPanel
            showAIPanel={showAIPanel}
            isMobile={isMobile}
            loading={loading}
            currentQuestion={currentQuestion}
            liveTranscript={liveTranscript}
            finalTranscripts={finalTranscripts}
            sttError={sttError}
            isSTTConnecting={isSTTConnecting}
            sttLatency={sttLatency}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={state.questions.length}
            isLastQuestion={isLastQuestion}
            isSpeaking={isSpeaking}
            isSilenceDetected={isSilenceDetected}
            onClose={() => setShowAIPanel(false)}
            onNextQuestion={handleNextQuestion}
          />
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
                onClick={() => !isMicDisabled && setIsMuted(!isMuted)}
                disabled={isMicDisabled}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                  isMicDisabled
                    ? "bg-gray-300 text-gray-400 border border-gray-300 cursor-not-allowed"
                    : isMuted 
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

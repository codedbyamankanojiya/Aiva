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
  const [sessionStartTime] = useState<number>(Date.now());
  const [isSTTConnecting, setIsSTTConnecting] = useState(false);
  const [sttLatency, setSttLatency] = useState<number | null>(null);
  
  // Words per minute tracking
  const [wordsPerMinute, setWordsPerMinute] = useState<number>(0);
  const transcriptStartTimeRef = useRef<number | null>(null);
  const totalWordsRef = useRef<number>(0);

  // Silence detection state
  const [lastTranscriptLength, setLastTranscriptLength] = useState<number>(0);
  const [hasSpoken, setHasSpoken] = useState<boolean>(false);
  const [isSilenceDetected, setIsSilenceDetected] = useState<boolean>(false);
  const [isMicDisabled, setIsMicDisabled] = useState<boolean>(false);
  const silenceTimerRef = useRef<number | null>(null);

  // AI Analysis state - fetched from SectionData.json
  const [aiAnalysis, setAiAnalysis] = useState<string>("");

  // Fetch AI analysis from SectionData.json for current question
  const fetchAIAnalysisFromSectionData = async (questionId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/section-data`);
      if (response.ok) {
        const data = await response.json();
        const sections = data.sections || [];
        
        // Find current section by sectionCode
        const currentSection = sections.find((section: any) => section.sectionCode === sectionCode);
        if (currentSection && currentSection.questionTranscripts) {
          // Find transcript for current question
          const transcript = currentSection.questionTranscripts.find(
            (t: any) => t.questionId === questionId
          );
          if (transcript && transcript.ai_analysis) {
            console.log('✅ AI Analysis fetched from SectionData.json:', transcript.ai_analysis);
            setAiAnalysis(transcript.ai_analysis);
          } else {
            console.log('⚠️ No AI analysis found for question:', questionId);
            console.log('📝 Available transcripts:', currentSection.questionTranscripts.map((t: any) => ({ id: t.questionId, hasAI: !!t.ai_analysis })));
          }
        } else {
          console.log('⚠️ No section found or no transcripts for sectionCode:', sectionCode);
        }
      } else {
        console.log('❌ Failed to fetch section data, status:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching AI analysis from SectionData.json:', error);
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
    if (state.status === 'active') {
      setFinalTranscripts([]);
      setLiveTranscript('');
      setWordsPerMinute(0);
      transcriptStartTimeRef.current = null;
      totalWordsRef.current = 0;
    }
  }, [state.status]);

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
        
        // After saving, fetch AI analysis from SectionData.json
        await fetchAIAnalysisFromSectionData(transcriptPayload.questionId);
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
    setTimeout(async () => {
      setIsSilenceDetected(false);
      setHasSpoken(false);
      setLastTranscriptLength(0);
      
      // Backend handles all processing internally
      console.log('🔍 Final transcript ready:', finalTranscripts.join(' '));
      
      // Fetch AI analysis from SectionData.json after processing
      setTimeout(async () => {
        await fetchAIAnalysisFromSectionData(currentQuestion.id);
      }, 1000); // Wait for backend to save data
    }, 2000); // Show "Analyzing your response" for 2 seconds
    
    // Auto-advance to next question (COMMENTED OUT)
    // if (!isLastQuestion) {
    //   setTimeout(() => {
    //     handleNextQuestion();
    //     setIsSilenceDetected(false);
    //   }, 1000);
    // }
  };

  // Clear transcripts when question changes and fetch from SectionData.json
  useEffect(() => {
    // Clear AI analysis when moving to a new question
    setAiAnalysis('');
    
    // Reset WPM tracking for new question
    setWordsPerMinute(0);
    transcriptStartTimeRef.current = null;
    totalWordsRef.current = 0;
    
    // Fetch AI analysis for current question from SectionData.json
    if (currentQuestion) {
      fetchAIAnalysisFromSectionData(currentQuestion.id);
    }
  }, [currentQuestionIndex]);

  // FIXED Silence detection useEffect - 5 second same length detection
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
    
    // FIXED LOGIC: Better silence detection
    const isSilenceCondition = 
      hasSpoken && (
        // Condition 1: Empty transcript after speaking
        currentLength === 0 ||
        // Condition 2: Same length for 5 seconds (with content)
        (currentLength === lastTranscriptLength && currentLength > 0)
      );
    
    if (isSilenceCondition) {
      console.log('🔍 SILENCE CONDITION MET:', {
        currentLength,
        lastTranscriptLength,
        hasSpoken,
        condition: currentLength === 0 ? 'empty' : 'same length'
      });
      
      // 5 seconds timer for silence detection
      silenceTimerRef.current = window.setTimeout(() => {
        console.log('🔍 SILENCE DETECTED AFTER 5 SECONDS');
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
    // Calculate final WPM - average across all questions
    const totalWords = finalTranscripts.join(' ').split(' ').filter((word: string) => word.length > 0).length;
    const totalMinutes = Math.floor((Date.now() - sessionStartTime) / 1000 / 60);
    const finalWPM = totalMinutes > 0 ? Math.round(totalWords / totalMinutes) : 0;
    
    console.log('📊 WPM Calculation:');
    console.log('- Total words:', totalWords);
    console.log('- Total minutes:', totalMinutes);
    console.log('- Final WPM:', finalWPM);
    console.log('- Current WPM state:', wordsPerMinute);
    
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
      averageWordsPerMinute: finalWPM, // Use calculated final WPM
      // Add questionTranscripts field - only save actual questions answered
      questionTranscripts: finalTranscripts.map((transcript, index) => {
        // Only include transcripts for questions that were actually answered and have valid content
        if (index < currentQuestionIndex && transcript && transcript.trim() && transcript !== "see.") {
          return {
            questionId: state.questions[index]?.id || `se-${index + 1}`,
            question: state.questions[index]?.question || "Question not available",
            transcript: transcript,
            timestamp: new Date().toISOString()
          };
        }
        return null; // Skip unanswered or invalid question entries
      }).filter(Boolean) // Remove null entries
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

  const startSTT = async () => {
    if (sttSocketRef.current) {
      console.warn("STT already started");
      return;
    }

    setIsSTTConnecting(true);
    setSttError("");
    setSttLatency(null);
    
    // Reset silence detection state
    setHasSpoken(false);
    setLastTranscriptLength(0);

    try {
      console.log('Starting STT connection...');
      
      // OPTIMIZED: Parallel initialization to reduce delay
      const [socket, audioContext, stream] = await Promise.all([
        // Parallel WebSocket connection
        new Promise<WebSocket>((resolve, reject) => {
          const wsUrl = "ws://localhost:8000/ws/stt";
          const socket = new WebSocket(wsUrl);
          socket.binaryType = "arraybuffer";
          sttSocketRef.current = socket;

          const timeout = setTimeout(() => {
            reject(new Error("STT socket timeout"));
          }, 3000); // Reduced timeout

          socket.onopen = () => {
            clearTimeout(timeout);
            console.log('✅ WebSocket connected');
            resolve(socket);
          };
          socket.onerror = () => {
            clearTimeout(timeout);
            reject(new Error("STT socket error"));
          };
        }),
        
        // Parallel AudioContext setup
        new Promise<AudioContext>((resolve) => {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
            sampleRate: 16000,
            latencyHint: 'interactive'
          });
          sttAudioContextRef.current = audioContext;
          console.log('✅ AudioContext created');
          resolve(audioContext);
        }),
        
        // Parallel microphone access
        navigator.mediaDevices.getUserMedia({ 
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }, 
          video: false 
        }).then(stream => {
          sttStreamRef.current = stream;
          console.log('✅ Microphone access granted');
          return stream;
        })
      ]);

      // Setup WebSocket handlers
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
              
              // Update words per minute calculation
              const words = msg.transcript.split(' ').filter((word: string) => word.length > 0).length;
              totalWordsRef.current += words;
              
              if (!transcriptStartTimeRef.current) {
                transcriptStartTimeRef.current = Date.now();
              }
              
              const elapsedTime = (Date.now() - (transcriptStartTimeRef.current || Date.now())) / 1000 / 60; // in minutes
              if (elapsedTime > 0) {
                const wpm = Math.round(totalWordsRef.current / elapsedTime);
                setWordsPerMinute(wpm);
              }
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

      // Load AudioWorklet processor
      await audioContext.audioWorklet.addModule('/audio-processor.js');

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
      // Note: stopSTT will be defined below
    }
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
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-slate-950"
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
            <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-slate-100">Preparing Your Interview</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400">Aiva is crafting personalized questions for you...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 z-0 bg-white dark:bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.16),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.14),_transparent_32%)] opacity-0 dark:opacity-100" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Top bar - Light theme */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/85">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 overflow-hidden rounded-full ring-2 ring-white/70 shadow-md shadow-aiva-purple/20 dark:ring-white/10">
              <img src="/Assets/Laadla.png" alt="Aiva Assistant" className="h-full w-full object-contain" />
            </div>
            <div>
              <h1 className="text-sm font-medium text-gray-900 dark:text-slate-100">Aiva Interview Session</h1>
              <p className="text-xs text-gray-600 dark:text-slate-400">{state.role || "Software Development"} · {state.level} · Section: {sectionCode}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100">
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
                className="relative h-full w-full overflow-hidden rounded-3xl border border-gray-200/50 bg-gray-900 shadow-2xl transition-all duration-500 dark:border-white/10"
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
                    className="absolute inset-0 flex h-full w-full items-center justify-center bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950"
                  >
                    <div className="text-center group">
                      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 group-hover:scale-105 dark:bg-slate-800 dark:shadow-black/20">
                        <VideoOff size={isMobile ? 36 : 44} className="text-gray-400 transition-colors group-hover:text-aiva-purple dark:text-slate-500" />
                      </div>
                      <p className="text-lg font-semibold tracking-wide text-gray-800 dark:text-slate-100">Camera is off</p>
                      <p className="mt-2 text-sm font-medium text-gray-500 dark:text-slate-400">Click to start video</p>
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
                  <div className="absolute left-1/2 top-6 w-full max-w-2xl -translate-x-1/2 rounded-2xl border border-gray-200/60 bg-white/95 px-6 py-5 shadow-2xl transition-all duration-300 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/92" style={{ zIndex: 40 }}>
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-white/70 shadow-md shadow-aiva-purple/25 dark:ring-white/10">
                        <img src="/Assets/Laadla.png" alt="Aiva Assistant" className="h-full w-full object-contain" />
                      </div>
                      <div className="flex-1 pt-1">
                        {currentQuestion ? (
                          <>
                            <p className="text-base font-medium leading-relaxed text-gray-900 dark:text-slate-100">{currentQuestion.question}</p>
                            <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-white/10">
                              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                                Question {currentQuestionIndex + 1} of {state.questions.length}
                              </span>
                              <Button
                                size="sm"
                                onClick={handleNextQuestion}
                                disabled={isLastQuestion || isSpeaking}
                                className="flex items-center gap-2 rounded-full bg-aiva-purple px-4 text-white shadow-md shadow-aiva-purple/30 transition-all hover:bg-aiva-purple/90 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
                              >
                                Next Question
                                <ChevronRight size={16} />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <p className="text-base font-medium leading-relaxed text-gray-500 dark:text-slate-400">Preparing your interview questions...</p>
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
                aiAnalysis={aiAnalysis}
                wordsPerMinute={wordsPerMinute}
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
            aiAnalysis={aiAnalysis}
          />
        )}

        {/* Bottom controls - Professional Layout */}
        <div className="z-20 border-t border-gray-200 bg-white shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] dark:border-white/10 dark:bg-slate-950 dark:shadow-[0_-10px_30px_-20px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left: Time & Status */}
            <div className="flex items-center gap-4 w-1/3">
              <span className="text-base font-semibold tracking-tight text-gray-800 font-mono dark:text-slate-100">
                {formatted}
              </span>
              <div className="h-4 w-px bg-gray-300 dark:bg-white/10"></div>
              <span className="hidden text-sm font-medium text-gray-500 dark:text-slate-400 sm:inline-block">Session Active</span>
            </div>

            {/* Center: Core Controls */}
            <div className="flex items-center justify-center gap-4 w-1/3">
              <button
                onClick={() => !isMicDisabled && setIsMuted(!isMuted)}
                disabled={isMicDisabled}
                className={`flex h-14 w-14 items-center justify-center rounded-full border transition-all duration-300 shadow-md ${
                  isMicDisabled
                    ? "cursor-not-allowed border-gray-300 bg-gray-300 text-gray-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500"
                    : isMuted 
                      ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/15 dark:text-red-300 dark:hover:bg-red-500/20" 
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                }`}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </button>

              <button
                onClick={toggleCamera}
                className={`flex h-14 w-14 items-center justify-center rounded-full border transition-all duration-300 shadow-md ${
                  !isCameraOn
                    ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/15 dark:text-red-300 dark:hover:bg-red-500/20"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                }`}
                aria-label={isCameraOn ? "Turn camera off" : "Turn camera on"}
              >
                {isCameraOn ? <Video size={24} /> : <VideoOff size={24} />}
              </button>

              <button
                onClick={handleEndInterview}
                className="group flex h-12 w-16 items-center justify-center rounded-full bg-red-500 text-white transition-all duration-300 shadow-lg shadow-red-500/30 hover:bg-red-600"
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
                className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-300 shadow-md ${
                  showAIPanel 
                    ? "border-aiva-purple/30 bg-aiva-purple text-white shadow-aiva-purple/30 hover:bg-aiva-purple/90" 
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
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

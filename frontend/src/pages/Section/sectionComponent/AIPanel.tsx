import { Button } from "@/components/common/Button";
import { ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";

interface AIPanelProps {
  showAIPanel: boolean;
  isMobile: boolean;
  loading: boolean;
  currentQuestion: any;
  currentQuestionIndex: number;
  totalQuestions: number;
  isLastQuestion: boolean;
  isSpeaking: boolean;
  isSilenceDetected?: boolean;
  onClose: () => void;
  onNextQuestion: () => void;
  liveTranscript?: string;
  finalTranscripts?: string[];
  sttError?: string;
  isSTTConnecting?: boolean;
  sttLatency?: number | null;
  aiAnalysis?: string;
}

function AivaAvatar({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses =
    size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10";

  return (
    <div
      className={`${sizeClasses} overflow-hidden rounded-2xl bg-gradient-to-br from-aiva-purple/20 to-aiva-indigo/20 shadow-lg shadow-aiva-purple/20 ring-1 ring-white/40 dark:ring-white/10 ${className}`}
    >
      <img
        src="/Assets/Laadla.png"
        alt="Aiva Assistant"
        className="h-full w-full object-contain"
      />
    </div>
  );
}

export function AIPanel({
  showAIPanel,
  isMobile,
  loading,
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  isLastQuestion,
  isSpeaking,
  isSilenceDetected = false,
  onClose,
  onNextQuestion,
  liveTranscript = "",
  finalTranscripts = [],
  sttError = "",
  isSTTConnecting = false,
  sttLatency = null,
  aiAnalysis = "", // Add AI analysis prop
}: AIPanelProps) {
  // TTS functionality
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSpeakingRef = useRef(false);

  // TTS function
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Create new speech utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.0; // Natural pitch
      utterance.volume = 0.8; // Moderate volume
      
      // Get available voices and prefer English
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(voice => 
        voice.lang.includes('en') || voice.lang.includes('US') || voice.lang.includes('UK')
      );
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      
      utterance.onstart = () => {
        isSpeakingRef.current = true;
        console.log('🔊 TTS started speaking AI response');
      };
      
      utterance.onend = () => {
        isSpeakingRef.current = false;
        console.log('🔊 TTS finished speaking AI response');
      };
      
      utterance.onerror = (event) => {
        isSpeakingRef.current = false;
        console.error('🔊 TTS error:', event);
      };
      
      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('🔊 Speech synthesis not supported in this browser');
    }
  };

  // Load voices and trigger TTS when aiAnalysis changes
  useEffect(() => {
    // Load voices (needed for some browsers)
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  useEffect(() => {
    // Trigger TTS when AI analysis is available
    if (aiAnalysis && aiAnalysis.trim()) {
      // Small delay to ensure UI is ready
      setTimeout(() => {
        speakText(aiAnalysis);
      }, 500);
    }
    
    // Cleanup on unmount
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [aiAnalysis]);

  if (!showAIPanel) return null;

  if (isMobile) {
    // Mobile version - Full screen overlay
    return (
      <div className="fixed inset-0 z-[60] flex flex-col bg-white text-gray-900 dark:bg-slate-950 dark:text-slate-100">
        {/* AI Panel Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-white/80 p-4 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <AivaAvatar size="lg" />
            <div>
              <h3 className="text-sm font-bold tracking-tight text-gray-900 dark:text-slate-100">Aiva Assistant</h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400">Interview Coach</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Chat messages area */}
        <div className="flex-1 space-y-5 overflow-y-auto bg-gray-50/60 p-5 dark:bg-slate-900/60">
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-aiva-purple/10 dark:bg-aiva-purple/20">
                <div className="w-2 h-2 bg-aiva-purple rounded-full animate-pulse" />
              </div>
              <div className="max-w-[85%] rounded-xl border border-gray-100 bg-white px-4 py-2.5 shadow-sm dark:border-white/10 dark:bg-slate-800">
                <p className="text-xs font-medium text-gray-700 dark:text-slate-200">Preparing your next challenge...</p>
              </div>
            </div>
          ) : currentQuestion ? (
            <>
              <div className="flex items-start gap-3">
                <AivaAvatar size="sm" className="rounded-lg" />
                <div className="max-w-[85%] rounded-xl rounded-tl-none border border-gray-100 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-slate-800">
                  <p className="text-sm font-semibold leading-relaxed text-gray-900 dark:text-slate-100">{currentQuestion.question}</p>
                </div>
              </div>

              {/* User response */}
              {(liveTranscript || finalTranscripts.length > 0) && (
                <div className="flex items-start gap-3 justify-end">
                  <div className="max-w-[85%] rounded-xl rounded-tr-none border border-aiva-purple/15 bg-aiva-purple/10 px-4 py-3 shadow-sm dark:border-aiva-purple/25 dark:bg-aiva-purple/15">
                    <p className="text-sm font-medium leading-relaxed text-gray-900 dark:text-slate-100">
                      {finalTranscripts.join(' ')}
                      {liveTranscript && (
                        <span className="ml-1 text-gray-800 dark:text-slate-200">
                          {finalTranscripts.length > 0 && ' '}
                          {liveTranscript}
                          <span className="ml-1 animate-pulse text-[10px] text-aiva-purple">|</span>
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-[10px] font-bold text-white shadow-lg shadow-indigo-500/20">
                    U
                  </div>
                </div>
              )}

              {/* AI Coach Response - Display below user response */}
              {aiAnalysis && (
                <div className="flex items-start gap-3">
                  <AivaAvatar size="sm" className="rounded-full" />
                  <div className="max-w-[80%] rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-white/10 dark:bg-slate-800">
                    <p className="text-gray-900 text-sm font-medium mb-1">🤖 Aiva Coach</p>
                    <p className="text-xs text-gray-700 dark:text-slate-200">{aiAnalysis}</p>
                  </div>
                </div>
              )}

              {sttError && (
                <div className="flex items-start gap-3 justify-end">
                  <div className="max-w-[80%] rounded-lg border border-red-200 bg-red-50 px-3 py-2 shadow-sm dark:border-red-500/20 dark:bg-red-500/10">
                    <p className="text-xs font-medium text-red-700 dark:text-red-300">{sttError}</p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white shadow-sm">
                    !
                  </div>
                </div>
              )}

              {isSTTConnecting && (
                <div className="flex items-start gap-3 justify-end">
                  <div className="max-w-[80%] rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 opacity-80 shadow-sm dark:border-white/10 dark:bg-slate-800">
                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400">Connecting to speech recognition...</p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-400 text-xs font-semibold text-white shadow-sm">
                    ...
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-start gap-3">
              <AivaAvatar size="sm" className="rounded-full" />
              <div className="max-w-[80%] rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-white/10 dark:bg-slate-800">
                <p className="text-sm text-gray-600 dark:text-slate-300">No questions available</p>
              </div>
            </div>
          )}
        </div>

        {/* Question navigation */}
        {currentQuestion && (
          <div className="border-t border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-600 dark:text-slate-300">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 dark:border-white/10 dark:bg-slate-800">
                <p className="text-xs text-gray-600 dark:text-slate-300">
                  {isSilenceDetected 
                    ? "Analyzing your response..." 
                    : isSTTConnecting 
                      ? "Connecting..." 
                      : sttError 
                        ? "Speech recognition unavailable" 
                        : "Listening..."
                  }
                  {sttLatency && !sttError && !isSTTConnecting && !isSilenceDetected && (
                    <span className="ml-2 text-green-600 dark:text-emerald-400">{sttLatency}ms</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop version - Side panel
  return (
    <div className={`h-full overflow-hidden rounded-3xl border border-gray-200/60 bg-white shadow-2xl transition-all duration-500 dark:border-white/10 dark:bg-slate-900 ${showAIPanel ? 'flex scale-100 flex-col opacity-100' : 'pointer-events-none hidden scale-95 opacity-0'}`}>
      {/* AI Panel Header */}
      <div className="border-b border-gray-100 bg-white/60 p-5 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/90">
        <div className="flex items-center gap-4">
          <AivaAvatar size="lg" />
          <div>
            <h3 className="text-base font-bold tracking-tight text-gray-900 dark:text-slate-100">Aiva Assistant</h3>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-medium uppercase tracking-widest text-gray-500 dark:text-slate-400">Interview Coach</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat messages area */}
      <div className="flex-1 space-y-6 overflow-y-auto bg-gray-50/60 p-6 dark:bg-slate-950/40">
        {loading ? (
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-aiva-purple/10 dark:bg-aiva-purple/20">
              <div className="w-3 h-3 bg-aiva-purple rounded-full animate-pulse" />
            </div>
            <div className="max-w-[85%] rounded-2xl border border-gray-100 bg-white px-5 py-3 shadow-sm dark:border-white/10 dark:bg-slate-800">
              <p className="text-sm font-medium text-gray-700 dark:text-slate-200">Preparing your next challenge...</p>
            </div>
          </div>
        ) : currentQuestion ? (
          <>
            <div className="flex items-start gap-4">
              <AivaAvatar size="md" className="rounded-xl" />
              <div className="max-w-[85%] rounded-2xl rounded-tl-none border border-gray-100 bg-white px-5 py-4 shadow-md dark:border-white/10 dark:bg-slate-800">
                <p className="text-sm font-semibold leading-relaxed text-gray-900 dark:text-slate-100">{currentQuestion.question}</p>
              </div>
            </div>

            {/* User response */}
            {(liveTranscript || finalTranscripts.length > 0) && (
              <div className="flex items-start gap-4 justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-tr-none border border-aiva-purple/15 bg-aiva-purple/10 px-5 py-4 shadow-sm dark:border-aiva-purple/25 dark:bg-aiva-purple/15">
                  <p className="text-sm font-medium leading-relaxed text-gray-900 dark:text-slate-100">
                    {finalTranscripts.join(' ')}
                    {liveTranscript && (
                      <span className="ml-1 text-gray-800 dark:text-slate-200">
                        {finalTranscripts.length > 0 && ' '}
                        {liveTranscript}
                        <span className="ml-1 animate-pulse text-xs text-aiva-purple">|</span>
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/20">
                  U
                </div>
              </div>
            )}

            {/* AI Coach Response - Display below user response */}
            {aiAnalysis && (
              <div className="flex items-start gap-4">
                <AivaAvatar size="md" className="rounded-xl" />
                <div className="max-w-[85%] rounded-2xl rounded-tl-none border border-gray-100 bg-white px-5 py-4 shadow-md dark:border-white/10 dark:bg-slate-800">
                  <p className="text-gray-900 text-sm font-semibold mb-1">🤖 Aiva Coach</p>
                  <p className="text-sm font-semibold leading-relaxed text-gray-900 dark:text-slate-100">{aiAnalysis}</p>
                </div>
              </div>
            )}

            {sttError && (
              <div className="flex items-start gap-3 justify-end">
                <div className="max-w-[80%] rounded-lg border border-red-200 bg-red-50 px-3 py-2 shadow-sm dark:border-red-500/20 dark:bg-red-500/10">
                  <p className="text-xs font-medium text-red-700 dark:text-red-300">{sttError}</p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white shadow-sm">
                  !
                </div>
              </div>
            )}

            {isSTTConnecting && (
              <div className="flex items-start gap-3 justify-end">
                <div className="max-w-[80%] rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 opacity-80 shadow-sm dark:border-white/10 dark:bg-slate-800">
                  <p className="text-xs font-medium text-gray-500 dark:text-slate-400">Connecting to speech recognition...</p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-400 text-xs font-semibold text-white shadow-sm">
                  ...
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-start gap-3">
            <AivaAvatar size="sm" className="rounded-full" />
            <div className="max-w-[80%] rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-white/10 dark:bg-slate-800">
              <p className="text-sm text-gray-600 dark:text-slate-300">No questions available</p>
            </div>
          </div>
        )}
      </div>

      {/* Question navigation */}
      {currentQuestion && (
        <div className="border-t border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-600 dark:text-slate-300">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <Button
              size="sm"
              onClick={onNextQuestion}
              disabled={isLastQuestion || isSpeaking}
              className="flex items-center gap-1 bg-aiva-purple text-white shadow-md shadow-aiva-purple/30 hover:bg-aiva-purple/90 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
            >
              Next
              <ChevronRight size={14} />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 dark:border-white/10 dark:bg-slate-800">
              <p className="text-xs text-gray-600 dark:text-slate-300">
                {isSilenceDetected 
                  ? "Analyzing your response..." 
                  : isSTTConnecting 
                    ? "Connecting..." 
                    : sttError 
                      ? "Speech recognition unavailable" 
                      : "Listening..."
                }
                {sttLatency && !sttError && !isSTTConnecting && !isSilenceDetected && (
                  <span className="ml-2 text-green-600 dark:text-emerald-400">{sttLatency}ms</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

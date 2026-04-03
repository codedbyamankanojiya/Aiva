import { Button } from "@/components/common/Button";
import { ChevronRight } from "lucide-react";

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
  aiAnalysis?: string; // Add AI analysis prop
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
  if (!showAIPanel) return null;

  if (isMobile) {
    // Mobile version - Full screen overlay
    return (
      <div className="fixed inset-0 bg-white z-[60] flex flex-col">
        {/* AI Panel Header */}
        <div className="p-4 border-b border-gray-100 bg-white/80 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-aiva-purple to-aiva-indigo flex items-center justify-center text-white font-bold shadow-lg shadow-purple-100">
              AI
            </div>
            <div>
              <h3 className="text-gray-900 text-sm font-bold tracking-tight">Aiva Assistant</h3>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Interview Coach</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Chat messages area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-gray-50/30">
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-aiva-purple/10 flex items-center justify-center">
                <div className="w-2 h-2 bg-aiva-purple rounded-full animate-pulse" />
              </div>
              <div className="bg-white rounded-xl px-4 py-2.5 max-w-[85%] shadow-sm border border-gray-100">
                <p className="text-gray-700 text-xs font-medium">Preparing your next challenge...</p>
              </div>
            </div>
          ) : currentQuestion ? (
            <>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-aiva-purple flex items-center justify-center text-white text-[10px] font-bold shadow-lg shadow-purple-100">
                  A
                </div>
                <div className="bg-white rounded-xl rounded-tl-none px-4 py-3 max-w-[85%] shadow-sm border border-gray-100">
                  <p className="text-gray-900 text-sm font-semibold leading-relaxed">{currentQuestion.question}</p>
                </div>
              </div>

              {/* User response */}
              {(liveTranscript || finalTranscripts.length > 0) && (
                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-aiva-purple/5 rounded-xl rounded-tr-none px-4 py-3 max-w-[85%] shadow-sm border border-aiva-purple/10">
                    <p className="text-gray-900 text-sm font-medium leading-relaxed">
                      {finalTranscripts.join(' ')}
                      {liveTranscript && (
                        <span className="ml-1 text-gray-800">
                          {finalTranscripts.length > 0 && ' '}
                          {liveTranscript}
                          <span className="text-aiva-purple text-[10px] ml-1 animate-pulse">▌</span>
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold shadow-lg shadow-indigo-100">
                    U
                  </div>
                </div>
              )}

              {/* AI Coach Response - Display below user response */}
              {aiAnalysis && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-aiva-purple to-aiva-indigo flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                    AI
                  </div>
                  <div className="bg-white rounded-lg px-3 py-2 max-w-[80%] shadow-sm border border-gray-200">
                    {/* <p className="text-gray-900 text-sm font-medium mb-1">🤖 Aiva Coach</p> */}
                    <p className="text-gray-700 text-xs">{aiAnalysis}</p>
                  </div>
                </div>
              )}

              {sttError && (
                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-red-50 rounded-lg px-3 py-2 max-w-[80%] shadow-sm border border-red-200">
                    <p className="text-red-700 text-xs font-medium">{sttError}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                    !
                  </div>
                </div>
              )}

              {isSTTConnecting && (
                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-gray-100 rounded-lg px-3 py-2 max-w-[80%] shadow-sm border border-gray-200 opacity-60">
                    <p className="text-gray-500 text-xs font-medium">Connecting to speech recognition...</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                    ...
                  </div>
                </div>
              )}
            </>
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
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2 border border-gray-200">
                <p className="text-gray-600 text-xs">
                  {isSilenceDetected 
                    ? "Analyzing your response..." 
                    : isSTTConnecting 
                      ? "Connecting..." 
                      : sttError 
                        ? "Speech recognition unavailable" 
                        : "Listening..."
                  }
                  {sttLatency && !sttError && !isSTTConnecting && !isSilenceDetected && (
                    <span className="ml-2 text-green-600">{sttLatency}ms</span>
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
    <div className={`bg-white rounded-3xl border border-gray-200/50 shadow-2xl h-full flex flex-col overflow-hidden transition-all duration-500 ${showAIPanel ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
      {/* AI Panel Header */}
      <div className="p-5 border-b border-gray-100 bg-white/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-aiva-purple to-aiva-indigo flex items-center justify-center text-white font-bold shadow-lg shadow-purple-100">
            AI
          </div>
          <div>
            <h3 className="text-gray-900 text-base font-bold tracking-tight">Aiva Assistant</h3>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">Interview Coach</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat messages area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gray-50/30">
        {loading ? (
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-aiva-purple/10 flex items-center justify-center">
              <div className="w-3 h-3 bg-aiva-purple rounded-full animate-pulse" />
            </div>
            <div className="bg-white rounded-2xl px-5 py-3 max-w-[85%] shadow-sm border border-gray-100">
              <p className="text-gray-700 text-sm font-medium">Preparing your next challenge...</p>
            </div>
          </div>
        ) : currentQuestion ? (
          <>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-aiva-purple flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-purple-100">
                A
              </div>
              <div className="bg-white rounded-2xl rounded-tl-none px-5 py-4 max-w-[85%] shadow-md border border-gray-100">
                <p className="text-gray-900 text-sm font-semibold leading-relaxed">{currentQuestion.question}</p>
              </div>
            </div>

            {/* User response */}
            {(liveTranscript || finalTranscripts.length > 0) && (
              <div className="flex items-start gap-4 justify-end">
                <div className="bg-aiva-purple/5 rounded-2xl rounded-tr-none px-5 py-4 max-w-[85%] shadow-sm border border-aiva-purple/10">
                  <p className="text-gray-900 text-sm font-medium leading-relaxed">
                    {finalTranscripts.join(' ')}
                    {liveTranscript && (
                      <span className="ml-1 text-gray-800">
                        {finalTranscripts.length > 0 && ' '}
                        {liveTranscript}
                        <span className="text-aiva-purple text-xs ml-1 animate-pulse">▌</span>
                      </span>
                    )}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-indigo-100">
                  U
                </div>
              </div>
            )}

            {/* AI Coach Response - Display below user response */}
            {aiAnalysis && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-aiva-purple to-aiva-indigo flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                  AI
                </div>
                <div className="bg-white rounded-lg px-3 py-2 max-w-[80%] shadow-sm border border-gray-200">
                  <p className="text-gray-900 text-sm font-medium mb-1">🤖 Aiva Coach</p>
                  <p className="text-gray-700 text-xs">{aiAnalysis}</p>
                </div>
              </div>
            )}

            {sttError && (
              <div className="flex items-start gap-3 justify-end">
                <div className="bg-red-50 rounded-lg px-3 py-2 max-w-[80%] shadow-sm border border-red-200">
                  <p className="text-red-700 text-xs font-medium">{sttError}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                  !
                </div>
              </div>
            )}

            {isSTTConnecting && (
              <div className="flex items-start gap-3 justify-end">
                <div className="bg-gray-100 rounded-lg px-3 py-2 max-w-[80%] shadow-sm border border-gray-200 opacity-60">
                  <p className="text-gray-500 text-xs font-medium">Connecting to speech recognition...</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                  ...
                </div>
              </div>
            )}
          </>
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
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
            <Button
              size="sm"
              onClick={onNextQuestion}
              disabled={isLastQuestion || isSpeaking}
              className="flex items-center gap-1 bg-aiva-purple hover:bg-aiva-purple/90 text-white shadow-sm"
            >
              Next
              <ChevronRight size={14} />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2 border border-gray-200">
              <p className="text-gray-600 text-xs">
                {isSilenceDetected 
                  ? "Analyzing your response..." 
                  : isSTTConnecting 
                    ? "Connecting..." 
                    : sttError 
                      ? "Speech recognition unavailable" 
                      : "Listening..."
                }
                {sttLatency && !sttError && !isSTTConnecting && !isSilenceDetected && (
                  <span className="ml-2 text-green-600">{sttLatency}ms</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

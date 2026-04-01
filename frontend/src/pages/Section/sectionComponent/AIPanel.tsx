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
  onClose: () => void;
  onNextQuestion: () => void;
  liveTranscript?: string;
  finalTranscripts?: string[];
  sttError?: string;
  isSTTConnecting?: boolean;
  sttLatency?: number | null;
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
  onClose,
  onNextQuestion,
  liveTranscript = "",
  finalTranscripts = [],
  sttError = "",
  isSTTConnecting = false,
  sttLatency = null,
}: AIPanelProps) {
  if (!showAIPanel) return null;

  if (isMobile) {
    // Mobile version - Full screen overlay
    return (
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
              onClick={onClose}
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
            <>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-aiva-purple flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                  A
                </div>
                <div className="bg-white rounded-lg px-3 py-2 max-w-[80%] shadow-sm border border-gray-200">
                  <p className="text-gray-900 text-sm font-medium">{currentQuestion.question}</p>
                </div>
              </div>

              {/* Single user response box with complete transcription */}
              {(liveTranscript || finalTranscripts.length > 0) && (
                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-gray-100 rounded-lg px-3 py-2 max-w-[80%] shadow-sm border border-gray-200">
                    <p className="text-gray-900 text-sm font-medium">
                      {/* Show all final transcripts combined */}
                      {finalTranscripts.join(' ')}
                      {/* Append live transcript if available */}
                      {liveTranscript && (
                        <>
                          {finalTranscripts.length > 0 && ' '}
                          {liveTranscript}
                          <span className="text-gray-400 text-xs ml-1 animate-pulse">▌</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                    You
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
                  {isSTTConnecting ? "Connecting..." : sttError ? "Speech recognition unavailable" : "Listening..."}
                  {sttLatency && !sttError && !isSTTConnecting && (
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
          <>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-aiva-purple flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                A
              </div>
              <div className="bg-white rounded-lg px-3 py-2 max-w-[80%] shadow-sm border border-gray-200">
                <p className="text-gray-900 text-sm font-medium">{currentQuestion.question}</p>
              </div>
            </div>

            {/* Single user response box with complete transcription */}
            {(liveTranscript || finalTranscripts.length > 0) && (
              <div className="flex items-start gap-3 justify-end">
                <div className="bg-gray-100 rounded-lg px-3 py-2 max-w-[80%] shadow-sm border border-gray-200">
                  <p className="text-gray-900 text-sm font-medium">
                    {/* Show all final transcripts combined */}
                    {finalTranscripts.join(' ')}
                    {/* Append live transcript if available */}
                    {liveTranscript && (
                      <>
                        {finalTranscripts.length > 0 && ' '}
                        {liveTranscript}
                        <span className="text-gray-400 text-xs ml-1 animate-pulse">▌</span>
                      </>
                    )}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                  You
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
                {isSTTConnecting ? "Connecting..." : sttError ? "Speech recognition unavailable" : "Listening..."}
                {sttLatency && !sttError && !isSTTConnecting && (
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

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/common/GlassCard";
import { Button } from "@/components/common/Button";
import { useInterview } from "@/context/InterviewContext";
import { useTimer } from "@/hooks/useTimer";
import { Mic, Video, VideoOff, Hand, ChevronRight } from "lucide-react";

/* ── Active session phase (screenshot 6) ─────────────────── */
export function ActiveSession() {
  const { state, nextQuestion, setQuestions } = useInterview();
  const { formatted } = useTimer({ autoStart: true });
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentQuestion = state.questions[state.currentQuestionIndex];
  const isLastQuestion = state.currentQuestionIndex === state.questions.length - 1;

  useEffect(() => {
    const fetchQuestions = async () => {
      console.log('ActiveSession state:', {
        roleId: state.roleId,
        role: state.role,
        level: state.level,
        questionsLength: state.questions.length
      });
      
      if (state.roleId && state.questions.length === 0) {
        setLoading(true);
        try {
          const response = await fetch(`http://localhost:8000/api/questions/${state.roleId}?level=${state.level}`);
          const data = await response.json();
          console.log('Fetched data:', data);
          if (data.questions) {
            setQuestions(data.questions);
          }
        } catch (error) {
          console.error('Failed to fetch questions:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchQuestions();
  }, [state.roleId, state.level, state.questions.length, setQuestions]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Video feed */}
      <div className="lg:col-span-2 space-y-4">
        <div className="aspect-video bg-gray-800/80 rounded-2xl border border-white/10 flex items-center justify-center">
          <Video size={56} className="text-gray-500" />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <span className="glass-card px-4 py-2 text-xs text-gray-600 font-medium flex items-center gap-2">
            <Hand size={14} />
            Push to talk · Hold "Space"
          </span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMuted(!isMuted)}
            className={`w-11 h-11 rounded-full flex items-center justify-center text-white shadow-glass cursor-pointer ${
              isMuted ? "bg-red-500" : "bg-aiva-indigo"
            }`}
          >
            <Mic size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-11 h-11 rounded-full bg-red-500 flex items-center justify-center text-white shadow-glass cursor-pointer"
          >
            <VideoOff size={18} />
          </motion.button>
          <span className="glass-card px-3 py-1.5 text-sm font-mono font-semibold text-gray-700">
            {formatted}
          </span>
        </div>
      </div>

      {/* AI Panel */}
      <GlassCard variant="purple" className="flex flex-col h-full">
        <h3 className="text-lg font-bold text-gray-800 mb-3">
          Aiva Interview
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Role: {state.role || "Software Development"} · {state.level}
        </p>
        <div className="flex-1 space-y-3 overflow-y-auto">
          {loading ? (
            <div className="glass-card p-3 text-sm text-gray-700">
              <p className="text-xs text-aiva-purple font-semibold mb-1">
                Aiva:
              </p>
              Loading questions...
            </div>
          ) : currentQuestion ? (
            <div className="glass-card p-3 text-sm text-gray-700">
              <p className="text-xs text-aiva-purple font-semibold mb-1">
                Aiva:
              </p>
              {currentQuestion.question}
            </div>
          ) : (
            <div className="glass-card p-3 text-sm text-gray-700">
              <p className="text-xs text-aiva-purple font-semibold mb-1">
                Aiva:
              </p>
              No questions available for this role and level.
              <br />
              <small className="text-gray-500">
                Debug: roleId={state.roleId}, level={state.level}, questionsCount={state.questions.length}
              </small>
            </div>
          )}
        </div>
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 glass-card px-3 py-2 text-sm text-gray-500">
              Listening...
            </div>
          </div>
          {currentQuestion && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Question {state.currentQuestionIndex + 1} of {state.questions.length}
              </span>
              <Button
                size="sm"
                onClick={nextQuestion}
                disabled={isLastQuestion}
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight size={16} />
              </Button>
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
}

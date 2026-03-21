import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/common/GlassCard";
import { Button } from "@/components/common/Button";
import { useInterview } from "@/context/InterviewContext";
import { useTimer } from "@/hooks/useTimer";
import { Mic, Video, VideoOff, Hand } from "lucide-react";

/* ── Setup phase (screenshot 5) ──────────────────────────── */
function InterviewSetup({ onJoin }: { onJoin: () => void }) {
  const { state, setLanguage, setLevel } = useInterview();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
    >
      {/* Camera preview */}
      <div className="space-y-4">
        <div className="aspect-video bg-gray-800/80 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden">
          <Video size={48} className="text-gray-500" />
        </div>

        {/* Controls bar */}
        <div className="flex items-center gap-3">
          <span className="glass-card px-4 py-2 text-xs text-gray-600 font-medium">
            Push to talk is active
            <br />
            Hold "Space" or click
          </span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-full bg-aiva-indigo flex items-center justify-center text-white shadow-glass cursor-pointer"
          >
            <Mic size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white shadow-glass cursor-pointer"
          >
            <VideoOff size={18} />
          </motion.button>
        </div>
      </div>

      {/* Right - Info + settings */}
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-800 mb-3">
            Interview For{" "}
            <span className="text-aiva-purple">
              {state.role || "Software Development"}
            </span>
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            This interview section conducts questions based on real world
            experience. Here you will be asked questions — use your IQ to solve
            any quiz. If you can't, don't worry, Aiva will explain it to you.
            When you are done press next to go further in the section.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            (Questions asked here are not guaranteed to be the same in your real
            experience, but it will help build better logical thinking for future
            interviews)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-aiva-purple mb-1.5 block">
              Language
            </label>
            <select
              value={state.language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-gray-700/80 text-white rounded-lg px-4 py-2.5 text-sm border-none focus:ring-2 focus:ring-aiva-purple/50 outline-none cursor-pointer"
            >
              <option>English</option>
              <option>Hindi</option>
              <option>Spanish</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-aiva-purple mb-1.5 block">
              Level
            </label>
            <select
              value={state.level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full bg-gray-700/80 text-white rounded-lg px-4 py-2.5 text-sm border-none focus:ring-2 focus:ring-aiva-purple/50 outline-none cursor-pointer"
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
        </div>

        <Button size="lg" fullWidth onClick={onJoin}>
          Join Interview
        </Button>
      </div>
    </motion.div>
  );
}

/* ── Active session phase (screenshot 6) ─────────────────── */
function ActiveSession() {
  const { state } = useInterview();
  const { formatted } = useTimer({ autoStart: true });
  const [isMuted, setIsMuted] = useState(false);

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
          <div className="glass-card p-3 text-sm text-gray-700">
            <p className="text-xs text-aiva-purple font-semibold mb-1">
              Aiva:
            </p>
            Tell me about a challenging project you worked on recently. What was
            your role and what technologies did you use?
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 glass-card px-3 py-2 text-sm text-gray-500">
            Listening...
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

/* ── Page wrapper ────────────────────────────────────────── */
export function Interview() {
  const { state, setStatus } = useInterview();
  const isActive = state.status === "active";

  const handleJoin = () => setStatus("active");

  return (
    <AnimatePresence mode="wait">
      {isActive ? (
        <ActiveSession key="session" />
      ) : (
        <InterviewSetup key="setup" onJoin={handleJoin} />
      )}
    </AnimatePresence>
  );
}

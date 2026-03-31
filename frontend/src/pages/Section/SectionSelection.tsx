import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { GlassCard } from "@/components/common/GlassCard";
import { Button } from "@/components/common/Button";
import { useInterview } from "@/context/InterviewContext";
import { Mic, Video, VideoOff, ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

/* ── Setup phase (screenshot 5) ──────────────────────────── */
function InterviewSetup() {
  const { state, setLanguage, setLevel, setStatus, setRole, setRoleId } = useInterview();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  
  // Get section code from URL
  const sectionCode = searchParams.get('section') || '';

  const stopTracks = (stream: MediaStream | null) => {
    if (!stream) return;
    stream.getTracks().forEach((t) => t.stop());
  };

  const startMicrophone = async () => {
    try {
      if (audioStream) {
        stopTracks(audioStream);
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }, 
        video: false 
      });
      setAudioStream(stream);
      setIsMuted(false);
    } catch (e) {
      console.error("Failed to access microphone", e);
      setIsMuted(true);
      alert("Unable to access microphone. Please check your microphone permissions.");
    }
  };

  const stopMicrophone = () => {
    stopTracks(audioStream);
    setAudioStream(null);
    setIsMuted(true);
  };

  const toggleMicrophone = async () => {
    if (!isMuted) {
      stopMicrophone();
      return;
    }
    await startMicrophone();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }, 
        audio: false 
      });
      setMediaStream(stream);
      setIsCameraOn(true);
    } catch (e) {
      console.error("Failed to access camera", e);
      setIsCameraOn(false);
      alert("Unable to access camera. Please check your camera permissions.");
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
      stopTracks(audioStream);
    };
  }, [mediaStream, audioStream]);

  // Handle refresh recovery
  useEffect(() => {
    const savedState = sessionStorage.getItem('interviewState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        
        // Check if we have saved interview data
        if (parsedState.role && parsedState.level && parsedState.roleId) {
          // Restore the interview context
          setRole(parsedState.role);
          setRoleId(parsedState.roleId);
          setLevel(parsedState.level);
          
          // Clear the saved state
          sessionStorage.removeItem('interviewState');
        }
      } catch (error) {
        console.error('Failed to restore interview state:', error);
        sessionStorage.removeItem('interviewState');
      }
    }
  }, [setRole, setRoleId, setLevel]);

  const handleJoin = async () => {
    setIsJoining(true);
    
    try {
      // Start camera before joining interview
      await startCamera();
      
      setStatus("active");
      // Navigate with section code
      navigate(`/active-section/session?section=${sectionCode}`);
    } catch (error) {
      console.error("Failed to start camera:", error);
      // Still allow joining even if camera fails
      setStatus("active");
      navigate(`/active-section/session?section=${sectionCode}`);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <>
      {/* Animated gradient background */}
      <div className="aiva-bg" aria-hidden="true">
        <div className="blob blob-pink" />
        <div className="blob blob-purple" />
        <div className="blob blob-blue" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-8">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/practice")}
          className="absolute top-8 left-8 flex items-center gap-2 glass-card px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Practice
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start w-full max-w-7xl"
        >
          {/* Camera preview */}
          <div className="space-y-4">
            <div className="aspect-video bg-gray-800/80 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden relative">
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
                <Video size={48} className="text-gray-500" />
              )}
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
                onClick={toggleMicrophone}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-glass cursor-pointer transition-colors ${
                  isMuted ? 'bg-red-500' : 'bg-aiva-indigo'
                }`}
              >
                {isMuted ? <VideoOff size={18} /> : <Mic size={18} />}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={toggleCamera}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-glass cursor-pointer transition-colors ${
                  isCameraOn ? 'bg-aiva-indigo' : 'bg-red-500'
                }`}
              >
                {isCameraOn ? <Video size={18} /> : <VideoOff size={18} />}
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

            <Button size="lg" fullWidth onClick={handleJoin} disabled={isJoining}>
              {isJoining ? 'Starting Camera...' : 'Join Interview'}
            </Button>
          </div>
        </motion.div>
      </div>
    </>
  );
}

/* ── Page wrapper ────────────────────────────────────────── */
export default function Interview() {
  return <InterviewSetup />;
}

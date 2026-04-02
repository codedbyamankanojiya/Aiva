import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Search, Mic, ArrowLeft, Edit3, Sparkles, Send, X, MoreVertical, Trash2, Pencil } from "lucide-react";

/* ── Resource categories data ─────────────────────────────── */
const CATEGORIES = [
  // Tech Roles from Practice Section
  {
    id: "software-engineer",
    title: "Software Engineering",
    subtitle: "Interview prep & coding questions",
    topics: ["DSA", "System Design", "OOP", "Design Patterns", "Testing", "Algorithms"],
    type: "tech"
  },
  {
    id: "web-developer",
    title: "Web Development",
    subtitle: "Frontend & backend development",
    topics: ["React", "Node.js", "HTML/CSS", "JavaScript", "APIs"],
    type: "tech"
  },
  {
    id: "backend-developer",
    title: "Backend Developer",
    subtitle: "Server-side development",
    topics: ["APIs", "Databases", "Authentication", "Microservices", "Caching"],
    type: "tech"
  },
  {
    id: "ui-ux-designer",
    title: "UI/UX Designer",
    subtitle: "Design principles & tools",
    topics: ["Figma", "User Research", "Prototyping", "Wireframing", "Design Systems"],
    type: "tech"
  },
  {
    id: "app-developer",
    title: "App Development",
    subtitle: "Mobile app development",
    topics: ["React Native", "Flutter", "iOS", "Android", "Mobile UI"],
    type: "tech"
  },
  {
    id: "devops-engineer",
    title: "DevOps Engineer",
    subtitle: "Deployment & operations",
    topics: ["Docker", "Kubernetes", "CI/CD", "Cloud Services", "Monitoring"],
    type: "tech"
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    subtitle: "Data analysis & machine learning",
    topics: ["Statistics", "ML Models", "Python", "Data Viz", "NLP"],
    type: "tech"
  },
  {
    id: "product-manager",
    title: "Product Manager",
    subtitle: "Product strategy & management",
    topics: ["Product Strategy", "Roadmapping", "User Stories", "Analytics", "Stakeholder Management"],
    type: "tech"
  },
  {
    id: "hr-recruiter",
    title: "HR Recruiter",
    subtitle: "Recruitment & talent management",
    topics: ["Sourcing", "Interviewing", "Onboarding", "Compensation", "Employer Branding"],
    type: "tech"
  },
  
  // Skill Development from Practice Section
  {
    id: "behavioral-upskilling",
    title: "Behavioral Skills",
    subtitle: "Professional behavior development",
    topics: ["Leadership", "Teamwork", "Problem Solving", "Adaptability", "Communication"],
    type: "skill"
  },
  {
    id: "presentation-skills",
    title: "Presentation Skills",
    subtitle: "Public speaking & presentations",
    topics: ["Public Speaking", "Slide Design", "Body Language", "Storytelling", "Q&A Handling"],
    type: "skill"
  },
  {
    id: "communication-boost",
    title: "Communication",
    subtitle: "Effective communication techniques",
    topics: ["Active Listening", "Written Communication", "Verbal Skills", "Non-verbal Cues", "Empathy"],
    type: "skill"
  },
  {
    id: "leadership-skills",
    title: "Leadership",
    subtitle: "Leadership development",
    topics: ["Team Management", "Decision Making", "Strategic Thinking", "Motivation", "Conflict Resolution"],
    type: "skill"
  },
  {
    id: "negotiation-skills",
    title: "Negotiation Skills",
    subtitle: "Negotiation techniques",
    topics: ["Salary Negotiation", "Contract Terms", "Win-Win Solutions", "Persuasion", "BATNA"],
    type: "skill"
  },
  {
    id: "time-management",
    title: "Time Management",
    subtitle: "Productivity & time optimization",
    topics: ["Prioritization", "Goal Setting", "Delegation", "Focus Techniques", "Work-Life Balance"],
    type: "skill"
  },
  {
    id: "stress-management",
    title: "Stress Management",
    subtitle: "Stress reduction techniques",
    topics: ["Mindfulness", "Work-Life Balance", "Coping Strategies", "Relaxation Techniques", "Resilience"],
    type: "skill"
  },
  {
    id: "networking-skills",
    title: "Networking Skills",
    subtitle: "Professional networking",
    topics: ["Building Connections", "LinkedIn", "Informational Interviews", "Follow-up", "Personal Branding"],
    type: "skill"
  },
  {
    id: "critical-thinking",
    title: "Critical Thinking",
    subtitle: "Analytical thinking skills",
    topics: ["Logical Reasoning", "Problem Analysis", "Decision Making", "Creative Thinking", "Evaluation"],
    type: "skill"
  },
  
  // Academic Subjects
  {
    id: "chemistry",
    title: "Chemistry",
    subtitle: "Periodic table & chemical reactions",
    topics: ["Organic", "Inorganic", "Physical", "Analytical"],
    type: "academic"
  },
  {
    id: "biology",
    title: "Biology",
    subtitle: "Life sciences & organisms",
    topics: ["Cell Biology", "Genetics", "Ecology", "Microbiology"],
    type: "academic"
  },
  {
    id: "physics",
    title: "Physics",
    subtitle: "Laws of nature & matter",
    topics: ["Mechanics", "Thermodynamics", "Electromagnetism", "Quantum Physics"],
    type: "academic"
  },
  {
    id: "mathematics",
    title: "Mathematics",
    subtitle: "Mathematical concepts & problems",
    topics: ["Calculus", "Algebra", "Geometry", "Statistics", "Probability"],
    type: "academic"
  },
  {
    id: "commerce",
    title: "Commerce",
    subtitle: "Business studies & economics",
    topics: ["Accounting", "Business Studies", "Economics", "Finance", "Marketing", "Entrepreneurship"],
    type: "academic"
  },
  {
    id: "accounting",
    title: "Accounting",
    subtitle: "Financial accounting & bookkeeping",
    topics: ["Financial Accounting", "Cost Accounting", "Taxation", "Auditing", "Bookkeeping"],
    type: "academic"
  },
  {
    id: "economics",
    title: "Economics",
    subtitle: "Economic principles & theories",
    topics: ["Microeconomics", "Macroeconomics", "International Trade", "Monetary Policy", "Market Analysis"],
    type: "academic"
  },
  {
    id: "business-studies",
    title: "Business Studies",
    subtitle: "Business management & organization",
    topics: ["Business Management", "Organizational Behavior", "Strategic Planning", "Operations Management", "Business Ethics"],
    type: "academic"
  },
  {
    id: "finance",
    title: "Finance",
    subtitle: "Financial management & investment",
    topics: ["Corporate Finance", "Investment Analysis", "Financial Markets", "Risk Management", "Portfolio Management"],
    type: "academic"
  },
  {
    id: "marketing",
    title: "Marketing",
    subtitle: "Marketing strategies & branding",
    topics: ["Digital Marketing", "Brand Management", "Market Research", "Consumer Behavior", "Advertising"],
    type: "academic"
  },
  {
    id: "entrepreneurship",
    title: "Entrepreneurship",
    subtitle: "Starting & running businesses",
    topics: ["Business Planning", "Startup Funding", "Business Models", "Innovation", "Venture Capital"],
    type: "academic"
  },
];

/* ── Animations ───────────────────────────────────────────── */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] as const } },
};
const slideIn = {
  hidden: { opacity: 0, x: 30 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const } },
};

/* ── Main Component ───────────────────────────────────────── */
export function Resources() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "tech" | "skill" | "academic">("all");
  const [askQuery, setAskQuery] = useState("");
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [chatMessages, setChatMessages] = useState<{ id: string; role: "user" | "aiva"; text: string }[]>([]);
  const [chatMenuOpen, setChatMenuOpen] = useState(false);

  const supportsSpeechRecognition = useMemo(() => {
    const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
    return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
  }, []);

  const firstName = user?.firstName || "there";
  const selected = CATEGORIES.find((c) => c.id === selectedCategory);

  const filteredCategories = CATEGORIES.filter(
    (c) =>
      (activeFilter === "all" || c.type === activeFilter) &&
      (c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  useEffect(() => {
    if (!isVoiceOpen) {
      setIsListening(false);
      setVoiceTranscript("");
    }
  }, [isVoiceOpen]);

  function handleAskSend() {
    const trimmed = askQuery.trim();
    if (!trimmed) return;
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setChatMessages((prev) => [
      ...prev,
      { id, role: "user", text: trimmed },
      {
        id: `${id}-aiva`,
        role: "aiva",
        text: "Got it. Pick a subject on the left or search for a topic — I’ll help you navigate resources.",
      },
    ]);
    setAskQuery("");
  }

  function handleOpenVoice() {
    setIsVoiceOpen(true);
  }

  function handleCloseVoice() {
    setIsVoiceOpen(false);
  }

  function handleClearChat() {
    setChatMessages([]);
    setChatMenuOpen(false);
  }

  function handleDeleteLast() {
    setChatMessages((prev) => prev.slice(0, -2));
    setChatMenuOpen(false);
  }

  function toggleListening() {
    if (!supportsSpeechRecognition) {
      setIsListening((prev) => !prev);
      return;
    }
    setIsListening((prev) => !prev);
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto pb-12">
      <AnimatePresence mode="wait">
        {!selectedCategory ? (
          /* ═══════════════════════════════════════════════════════
             VIEW 1 — Category Listing + Robo Assistant
             ═══════════════════════════════════════════════════════ */
          <motion.div
            key="listing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="flex gap-8"
          >
            {/* ── Left: Filter + Search + Category List ── */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="flex-1 min-w-0 space-y-4"
            >
              {/* Filter buttons */}
              <motion.div variants={fadeUp} className="flex gap-2 flex-wrap">
                {([
                  { key: "all" as const, label: "All Subjects", activeClass: "bg-aiva-purple" },
                  { key: "tech" as const, label: "Tech Roles", activeClass: "bg-blue-500" },
                  { key: "skill" as const, label: "Skill Development", activeClass: "bg-green-500" },
                  { key: "academic" as const, label: "Academic", activeClass: "bg-orange-500" },
                ] as const).map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setActiveFilter(f.key)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      activeFilter === f.key
                        ? `${f.activeClass} text-white shadow-lg`
                        : "bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/70 ring-1 ring-gray-200/30 dark:ring-gray-700/30"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </motion.div>

              {/* Search bar */}
              <motion.div variants={fadeUp} className="relative max-w-sm">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="search notes"
                  className="w-full pl-5 pr-12 py-3 rounded-full bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 ring-1 ring-gray-200/40 dark:ring-gray-700/40 focus:outline-none focus:ring-2 focus:ring-aiva-purple/30 transition-all shadow-sm"
                />
                <Search
                  size={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-aiva-purple"
                />
              </motion.div>

              {/* Results counter */}
              {filteredCategories.length !== CATEGORIES.length && (
                <motion.div variants={fadeUp} className="text-xs font-medium text-gray-500 dark:text-gray-400 -mt-1">
                  Showing {filteredCategories.length} of {CATEGORIES.length} subjects
                </motion.div>
              )}

              {/* Category cards */}
              {filteredCategories.map((cat, i) => (
                <motion.button
                  key={cat.id}
                  variants={fadeUp}
                  whileHover={{ scale: 1.012, x: 4 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="w-full text-left group"
                >
                  <div
                    className="relative overflow-hidden rounded-2xl px-6 py-4 backdrop-blur-xl shadow-md ring-1 ring-white/20 dark:ring-white/10 transition-all duration-300 group-hover:shadow-lg group-hover:ring-aiva-purple/20"
                    style={{
                      background: `linear-gradient(135deg, 
                        rgba(165, 148, 249, ${0.18 + (i % 8) * 0.03}) 0%, 
                        rgba(129, 140, 248, ${0.12 + (i % 8) * 0.02}) 50%, 
                        rgba(196, 181, 253, ${0.15 + (i % 8) * 0.02}) 100%)`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -skew-x-12" />
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white relative z-10">
                      {cat.title}
                    </h3>
                    {cat.subtitle && (
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 relative z-10">
                        {cat.subtitle}
                      </p>
                    )}
                  </div>
                </motion.button>
              ))}

              {filteredCategories.length === 0 && (
                <motion.p
                  variants={fadeUp}
                  className="text-sm text-gray-400 dark:text-gray-500 text-center py-8"
                >
                  No categories match "{searchQuery}"
                </motion.p>
              )}
            </motion.div>

            {/* ── Right: Robo Assistant Panel ── */}
            <motion.div
              variants={slideIn}
              initial="hidden"
              animate="show"
              className="w-[360px] flex-shrink-0 hidden lg:block mt-40"
            >
              <div className="sticky top-40">
                <div className="w-full rounded-3xl bg-white/55 dark:bg-gray-800/55 backdrop-blur-xl shadow-xl ring-1 ring-white/30 dark:ring-gray-700/30 overflow-hidden flex flex-col">
                  {/* Header with greeting + 3-dot menu */}
                  <div className="px-5 pt-5 pb-2 flex items-start justify-between">
                    <div className="text-center flex-1">
                      <p className="text-base font-bold text-aiva-purple leading-relaxed">
                        Hello {firstName},
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mt-0.5">
                        Aiva here to assist you
                      </p>
                    </div>
                    {/* 3-dot chat menu */}
                    <div className="relative">
                      <button
                        onClick={() => setChatMenuOpen(!chatMenuOpen)}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-xl text-gray-400 hover:text-aiva-purple hover:bg-white/60 dark:hover:bg-gray-800/60 transition-colors"
                        aria-label="Chat options"
                      >
                        <MoreVertical size={16} />
                      </button>
                      <AnimatePresence>
                        {chatMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -4 }}
                            transition={{ duration: 0.12 }}
                            className="absolute right-0 top-full mt-1 w-40 rounded-xl bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 py-1 z-30"
                          >
                            <button
                              onClick={handleClearChat}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/60 transition-colors"
                            >
                              <Trash2 size={13} className="text-red-400" />
                              Clear Chat
                            </button>
                            <button
                              onClick={handleDeleteLast}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/60 transition-colors"
                            >
                              <Pencil size={13} className="text-amber-400" />
                              Delete Last Reply
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Robo image — centered */}
                  <div className="flex justify-center px-4 py-2">
                    <motion.img
                      src="/Assets/Robo.png"
                      alt="Aiva AI Assistant"
                      className="w-36 h-36 object-contain drop-shadow-xl"
                      animate={{ y: [0, -8, 0] }}
                      transition={{
                        duration: 3.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </div>

                  {/* Chat messages */}
                  {chatMessages.length > 0 && (
                    <div className="mx-4 mb-2 max-h-40 space-y-2 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-aiva-purple/20 scrollbar-track-transparent">
                      {chatMessages.slice(-6).map((m) => (
                        <div
                          key={m.id}
                          className={`rounded-2xl px-3 py-2 text-xs leading-5 ring-1 ${
                            m.role === "user"
                              ? "ml-auto max-w-[85%] bg-aiva-purple/10 text-gray-800 ring-aiva-purple/15 dark:text-gray-100"
                              : "mr-auto max-w-[90%] bg-white/70 text-gray-700 ring-white/30 dark:bg-slate-900/35 dark:text-gray-200"
                          }`}
                        >
                          {m.text}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Ask anything input */}
                  <div className="px-4 pb-5 mt-auto">
                    <div className="relative">
                      <input
                        type="text"
                        value={askQuery}
                        onChange={(e) => setAskQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAskSend();
                        }}
                        placeholder="Ask Anything"
                        className="w-full pl-4 pr-[76px] py-2.5 rounded-full bg-white/70 dark:bg-gray-900/50 backdrop-blur-sm text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 ring-1 ring-gray-200/50 dark:ring-gray-700/50 focus:outline-none focus:ring-2 focus:ring-aiva-purple/30 shadow-sm transition-all"
                      />
                      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={handleOpenVoice}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-full text-gray-400 hover:text-aiva-purple transition-colors"
                          aria-label="Voice assistant"
                        >
                          <Mic size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={handleAskSend}
                          className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-aiva-purple text-white shadow-sm hover:opacity-90 transition-opacity"
                          aria-label="Send"
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <AnimatePresence>
              {isVoiceOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
                  role="dialog"
                  aria-modal="true"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 18, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 18, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="w-[min(520px,92vw)] rounded-[1.8rem] border border-white/25 bg-white/80 p-5 shadow-[0_22px_90px_rgba(35,18,90,0.18)] backdrop-blur-xl dark:bg-slate-900/70"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-gray-400">Voice Assistant</div>
                        <div className="mt-1 text-lg font-black tracking-tight text-gray-900 dark:text-white">Talk to Aiva</div>
                        <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {supportsSpeechRecognition ? "Click the mic to start listening." : "Voice recognition not supported in this browser."}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCloseVoice}
                        className="h-10 w-10 inline-flex items-center justify-center rounded-2xl border border-white/30 bg-white/60 text-gray-600 hover:bg-white/80 transition-colors dark:bg-slate-900/40 dark:text-gray-200"
                        aria-label="Close"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="mt-5 rounded-3xl border border-white/25 bg-white/60 p-4 dark:bg-slate-900/35">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${isListening ? "bg-rose-500" : "bg-aiva-purple"} text-white shadow-sm`}>
                            <Mic size={18} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                              {isListening ? "Listening…" : "Ready"}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {isListening ? "Speak now" : "Tap to start voice input"}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={toggleListening}
                          className={`rounded-2xl px-4 py-2 text-sm font-semibold transition-colors ${isListening ? "bg-rose-50 text-rose-600 border border-rose-200" : "bg-aiva-purple text-white"}`}
                        >
                          {isListening ? "Stop" : "Start"}
                        </button>
                      </div>

                      <div className="mt-4 rounded-2xl border border-white/25 bg-white/70 px-4 py-3 text-sm text-gray-700 dark:bg-slate-900/40 dark:text-gray-200">
                        {voiceTranscript || "Your transcript will appear here…"}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleCloseVoice}
                        className="rounded-2xl border border-white/25 bg-white/60 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-white/80 transition-colors dark:bg-slate-900/40 dark:text-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!voiceTranscript.trim()) return;
                          setAskQuery(voiceTranscript);
                          setIsVoiceOpen(false);
                        }}
                        className="rounded-2xl bg-aiva-purple px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-95 transition-opacity"
                      >
                        Use Transcript
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        ) : (
          /* ═══════════════════════════════════════════════════════
             VIEW 2 — Category Detail + Topic Chips
             ═══════════════════════════════════════════════════════ */
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.35 }}
            className="flex gap-8"
          >
            {/* ── Left: Content area ── */}
            <div className="flex-1 min-w-0">
              {/* Back button */}
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ x: -4 }}
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-aiva-purple dark:hover:text-aiva-purple mb-4 transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Resources
              </motion.button>

              {/* Content card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative rounded-3xl overflow-hidden shadow-xl ring-1 ring-white/20 dark:ring-white/10"
                style={{ minHeight: "500px" }}
              >
                {/* Gradient background */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(145deg, rgba(196,181,253,0.35) 0%, rgba(165,148,249,0.2) 30%, rgba(129,140,248,0.15) 60%, rgba(224,231,255,0.3) 100%)",
                  }}
                />
                <div className="absolute inset-0 backdrop-blur-sm bg-white/20 dark:bg-gray-900/20" />

                {/* Title */}
                <div className="relative z-10 p-8">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selected?.title}
                  </h2>
                  {selected?.subtitle && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {selected.subtitle}
                    </p>
                  )}

                  {/* Placeholder content area */}
                  <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500">
                      <Sparkles size={20} className="text-aiva-purple/50" />
                      <span className="text-sm">
                        Notes and materials will appear here
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* ── Right: Customize + Topic chips ── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="w-[280px] flex-shrink-0 hidden lg:block pt-10"
            >
              <div className="sticky top-28 rounded-3xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl shadow-xl ring-1 ring-white/30 dark:ring-gray-700/30 p-5 space-y-4">
                {/* Customize input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="customize notes"
                    className="w-full pl-4 pr-11 py-2.5 rounded-full bg-white/70 dark:bg-gray-900/50 backdrop-blur-sm text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 ring-1 ring-gray-200/50 dark:ring-gray-700/50 focus:outline-none focus:ring-2 focus:ring-aiva-purple/30 shadow-sm transition-all"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-aiva-purple transition-colors">
                    <Edit3 size={15} />
                  </button>
                </div>

                {/* Topic chips */}
                <div className="space-y-2.5 pt-1">
                  {selected?.topics.map((topic) => (
                    <TopicChip key={topic} label={topic} />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Topic Chip ───────────────────────────────────────────── */
function TopicChip({ label }: { label: string }) {
  const [active, setActive] = useState(false);

  return (
    <motion.button
      whileHover={{ scale: 1.03, x: 4 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => setActive(!active)}
      className={`block w-max px-5 py-2 rounded-full text-sm font-semibold shadow-sm transition-all duration-200 ${
        active
          ? "bg-aiva-purple text-white shadow-aiva-glow ring-1 ring-aiva-purple/40"
          : "bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 ring-1 ring-gray-200/50 dark:ring-gray-700/50 hover:ring-aiva-purple/20 hover:bg-white dark:hover:bg-gray-700/80"
      }`}
    >
      {label}
    </motion.button>
  );
}

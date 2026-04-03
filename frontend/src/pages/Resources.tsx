import { useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { 
  Search, Mic, ArrowLeft, Edit3, Sparkles, Send, X, 
  MoreVertical, Trash2, Pencil, FileText, Video, Link as LinkIcon, 
  Download, ExternalLink, Bookmark, BookOpen, Zap, Users, ChevronRight
} from "lucide-react";

/* ── Resource categories data ─────────────────────────────── */
const CATEGORIES = [
  // Tech Roles
  {
    id: "software-engineer",
    title: "Software Engineering",
    subtitle: "Interview prep & coding questions",
    topics: ["DSA", "System Design", "OOP", "Design Patterns", "Testing", "Algorithms"],
    type: "tech",
    icon: "💻",
    status: "coming-soon"
  },
  {
    id: "ethical-hacking",
    title: "Ethical Hacking",
    subtitle: "Security protocols & penetration testing",
    topics: ["Network Security", "Cryptography", "Exploits", "Vulnerability Assessment"],
    type: "tech",
    icon: "🛡️",
    status: "active",
    resourceFile: "/Resources/Ethical Hacking.txt"
  },
  {
    id: "dsa",
    title: "DSA",
    subtitle: "Data Structures and Algorithms",
    topics: ["Arrays", "Linked Lists", "Trees", "Graphs", "Dynamic Programming"],
    type: "tech",
    icon: "🧩",
    status: "active",
    resourceFile: "/Resources/Data Structures And Algorithms.txt"
  },
  {
    id: "dbms",
    title: "DBMS",
    subtitle: "Database systems & SQL programming",
    topics: ["SQL Queries", "Normalization", "Database Design", "Transaction Management"],
    type: "academic",
    icon: "🗄️",
    status: "active",
    hasResources: true,
    resourceFile: "/Resources/Database Management System.txt"
  },
  {
    id: "web-developer",
    title: "Web Development",
    subtitle: "Frontend & backend development",
    topics: ["React", "Node.js", "HTML/CSS", "JavaScript", "APIs"],
    type: "tech",
    icon: "🌐",
    status: "coming-soon"
  },
  {
    id: "backend-developer",
    title: "Backend Developer",
    subtitle: "Server-side development",
    topics: ["APIs", "Databases", "Authentication", "Microservices", "Caching"],
    type: "tech",
    icon: "⚙️",
    status: "coming-soon"
  },
  {
    id: "ui-ux-designer",
    title: "UI/UX Designer",
    subtitle: "Design principles & tools",
    topics: ["Figma", "User Research", "Prototyping", "Wireframing", "Design Systems"],
    type: "tech",
    icon: "🎨",
    status: "coming-soon"
  },
  {
    id: "app-developer",
    title: "App Development",
    subtitle: "Mobile app development",
    topics: ["React Native", "Flutter", "iOS", "Android", "Mobile UI"],
    type: "tech",
    icon: "📱",
    status: "coming-soon"
  },
  {
    id: "devops-engineer",
    title: "DevOps Engineer",
    subtitle: "Deployment & operations",
    topics: ["Docker", "Kubernetes", "CI/CD", "Cloud Services", "Monitoring"],
    type: "tech",
    icon: "🚀",
    status: "coming-soon"
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    subtitle: "Data analysis & machine learning",
    topics: ["Statistics", "ML Models", "Python", "Data Viz", "NLP"],
    type: "tech",
    icon: "📊",
    status: "coming-soon"
  },
  {
    id: "product-manager",
    title: "Product Manager",
    subtitle: "Product strategy & management",
    topics: ["Product Strategy", "Roadmapping", "User Stories", "Analytics", "Stakeholder Management"],
    type: "tech",
    icon: "📋",
    status: "coming-soon"
  },
  {
    id: "hr-recruiter",
    title: "Human Resources",
    subtitle: "People management & organizational development",
    topics: ["Recruitment", "Training", "Performance Management", "Employee Relations"],
    type: "academic",
    icon: "👔",
    status: "active",
    hasResources: true,
    resourceFile: "/Resources/Human Resources.txt"
  },
  
  // Skill Development
  {
    id: "behavioral-upskilling",
    title: "Behavioral Skills",
    subtitle: "Professional behavior development",
    topics: ["Leadership", "Teamwork", "Problem Solving", "Adaptability", "Communication"],
    type: "skill",
    icon: "🤝",
    status: "coming-soon"
  },
  {
    id: "presentation-skills",
    title: "Presentation Skills",
    subtitle: "Public speaking & presentations",
    topics: ["Public Speaking", "Slide Design", "Body Language", "Storytelling", "Q&A Handling"],
    type: "skill",
    icon: "🎤",
    status: "coming-soon"
  },
  {
    id: "communication-boost",
    title: "Communication",
    subtitle: "Effective communication techniques",
    topics: ["Active Listening", "Written Communication", "Verbal Skills", "Non-verbal Cues", "Empathy"],
    type: "skill",
    icon: "💬",
    status: "coming-soon"
  },
  {
    id: "leadership-skills",
    title: "Leadership",
    subtitle: "Leadership development",
    topics: ["Team Management", "Decision Making", "Strategic Thinking", "Motivation", "Conflict Resolution"],
    type: "skill",
    icon: "👑",
    status: "coming-soon"
  },
  {
    id: "negotiation-skills",
    title: "Negotiation Skills",
    subtitle: "Negotiation techniques",
    topics: ["Salary Negotiation", "Contract Terms", "Win-Win Solutions", "Persuasion", "BATNA"],
    type: "skill",
    icon: "🤝",
    status: "coming-soon"
  },
  {
    id: "time-management",
    title: "Time Management",
    subtitle: "Productivity & time optimization",
    topics: ["Prioritization", "Goal Setting", "Delegation", "Focus Techniques", "Work-Life Balance"],
    type: "skill",
    icon: "⏰",
    status: "coming-soon"
  },
  {
    id: "stress-management",
    title: "Stress Management",
    subtitle: "Stress reduction techniques",
    topics: ["Mindfulness", "Work-Life Balance", "Coping Strategies", "Relaxation Techniques", "Resilience"],
    type: "skill",
    icon: "🧘",
    status: "coming-soon"
  },
  {
    id: "networking-skills",
    title: "Networking Skills",
    subtitle: "Professional networking",
    topics: ["Building Connections", "LinkedIn", "Informational Interviews", "Follow-up", "Personal Branding"],
    type: "skill",
    icon: "🕸️",
    status: "coming-soon"
  },
  {
    id: "critical-thinking",
    title: "Critical Thinking",
    subtitle: "Analytical thinking skills",
    topics: ["Logical Reasoning", "Problem Analysis", "Decision Making", "Creative Thinking", "Evaluation"],
    type: "skill",
    icon: "🧠",
    status: "coming-soon"
  },
  
  // Academic Subjects
  {
    id: "chemistry",
    title: "Chemistry",
    subtitle: "Periodic table & chemical reactions",
    topics: ["Organic", "Inorganic", "Physical", "Analytical"],
    type: "academic",
    icon: "🧪",
    status: "active",
    resourceFile: "/Resources/Chemistry Chemistry.txt"
  },
  {
    id: "biology",
    title: "Biology",
    subtitle: "Life sciences & organisms",
    topics: ["Cell Biology", "Genetics", "Ecology", "Microbiology"],
    type: "academic",
    icon: "🧬",
    status: "coming-soon"
  },
  {
    id: "physics",
    title: "Physics",
    subtitle: "Laws of nature & matter",
    topics: ["Mechanics", "Thermodynamics", "Electromagnetism", "Quantum Physics"],
    type: "academic",
    icon: "⚛️",
    status: "active",
    resourceFile: "/Resources/Physics.txt"
  },
  {
    id: "mathematics",
    title: "Mathematics",
    subtitle: "Mathematical concepts & problems",
    topics: ["Calculus", "Algebra", "Geometry", "Statistics", "Probability"],
    type: "academic",
    icon: "📐",
    status: "coming-soon"
  },
  {
    id: "commerce",
    title: "Commerce",
    subtitle: "Business studies & economics",
    topics: ["Accounting", "Business Studies", "Economics", "Finance", "Marketing", "Entrepreneurship"],
    type: "academic",
    icon: "💹",
    status: "coming-soon"
  },
  {
    id: "accounting",
    title: "Financial Accounting",
    subtitle: "Financial accounting & bookkeeping",
    topics: ["Financial Accounting", "Cost Accounting", "Taxation", "Auditing", "Bookkeeping"],
    type: "academic",
    icon: "📖",
    status: "active",
    resourceFile: "/Resources/Financial Accounting And Management.txt"
  },
  {
    id: "economics",
    title: "Economics",
    subtitle: "Economic principles & theories",
    topics: ["Microeconomics", "Macroeconomics", "International Trade", "Monetary Policy", "Market Analysis"],
    type: "academic",
    icon: "📉",
    status: "active",
    resourceFile: "/Resources/Economics.txt"
  },
  {
    id: "business-studies",
    title: "Business Studies",
    subtitle: "Business management & organization",
    topics: ["Business Management", "Organizational Behavior", "Strategic Planning", "Operations Management", "Business Ethics"],
    type: "academic",
    icon: "🏢",
    status: "coming-soon"
  },
  {
    id: "finance",
    title: "Finance",
    subtitle: "Financial management & investment",
    topics: ["Corporate Finance", "Investment Analysis", "Financial Markets", "Risk Management", "Portfolio Management"],
    type: "academic",
    icon: "💰",
    status: "coming-soon"
  },
  {
    id: "marketing",
    title: "Marketing",
    subtitle: "Marketing strategies & branding",
    topics: ["Digital Marketing", "Brand Management", "Market Research", "Consumer Behavior", "Advertising"],
    type: "academic",
    icon: "📢",
    status: "coming-soon"
  },
  {
    id: "entrepreneurship",
    title: "Entrepreneurship",
    subtitle: "Starting & running businesses",
    topics: ["Business Planning", "Startup Funding", "Business Models", "Innovation", "Venture Capital"],
    type: "academic",
    icon: "💡",
    status: "coming-soon"
  },
];

/* ── Animations ───────────────────────────────────────────── */
const stagger: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 15,
      mass: 1
    } 
  },
};

const slideIn: Variants = {
  hidden: { opacity: 0, x: 40, scale: 0.95 },
  show: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 80,
      damping: 20,
      duration: 0.6
    } 
  },
};

const categoryCardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 15
    } 
  },
  hover: { 
    scale: 1.02, 
    y: -4,
    transition: { 
      type: "spring",
      stiffness: 400,
      damping: 25
    }
  },
  tap: { scale: 0.98 }
};


/* ── Main Component ───────────────────────────────────────── */
export function Resources() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "tech" | "skill" | "academic" | "upcoming">("all");
  const [askQuery, setAskQuery] = useState("");
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [chatMessages, setChatMessages] = useState<{ id: string; role: "user" | "aiva"; text: string }[]>([]);
  const [chatMenuOpen, setChatMenuOpen] = useState(false);
  const [isAivaThinking, setIsAivaThinking] = useState(false);
  
  // New filtering states
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<string[]>([]);
  const [isApplying, setIsApplying] = useState(false);

  const supportsSpeechRecognition = useMemo(() => {
    const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
    return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
  }, []);

  const firstName = user?.firstName || "there";
  const selected = CATEGORIES.find((c) => c.id === selectedCategory);

  // Content loading state
  const [resourceContent, setResourceContent] = useState<string | null>(null);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [viewingMaterialId, setViewingMaterialId] = useState<string | null>(null);
  const [personalizeQuery, setPersonalizeQuery] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  // Fetch content when category changes
  useEffect(() => {
    if (selected?.resourceFile) {
      setIsContentLoading(true);
      fetch(selected.resourceFile)
        .then(res => res.text())
        .then(text => {
          setResourceContent(text);
          setIsContentLoading(false);
        })
        .catch(err => {
          console.error("Failed to load resource:", err);
          setIsContentLoading(false);
        });
    } else {
      setResourceContent(null);
    }
    setViewingMaterialId(null); // Reset when category changes
  }, [selectedCategory, selected]);

  // Updated filter categories with "Upcoming Notes"
  const filterTabs = [
    { key: "all" as const, label: "All Subjects", activeClass: "bg-aiva-purple" },
    { key: "tech" as const, label: "Tech Roles", activeClass: "bg-blue-500" },
    { key: "skill" as const, label: "Skill Development", activeClass: "bg-emerald-500" },
    { key: "academic" as const, label: "Academic", activeClass: "bg-orange-500" },
    { key: "upcoming" as const, label: "Upcoming Notes", activeClass: "bg-rose-500" },
  ];

  const filteredCategories = CATEGORIES.filter(
    (c) => {
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           c.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // If upcoming is selected, show only coming-soon
      if (activeFilter === "upcoming") {
        return c.status === "coming-soon" && matchesSearch;
      }
      
      // If any other filter is selected, only show active subjects
      const isActive = c.status === "active";
      if (!isActive) return false;

      if (activeFilter === "all") return matchesSearch;
      return c.type === activeFilter && matchesSearch;
    }
  );

  useEffect(() => {
    if (!isVoiceOpen) {
      setIsListening(false);
      setVoiceTranscript("");
    }
  }, [isVoiceOpen]);

  // Reset filters when switching categories
  useEffect(() => {
    setSelectedTopics([]);
    setAppliedFilters([]);
  }, [selectedCategory]);

  function handleTopicToggle(topic: string) {
    setSelectedTopics(prev => 
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    );
  }

  function handleApplyFilters() {
    setIsApplying(true);
    setTimeout(() => {
      setAppliedFilters(selectedTopics);
      setIsApplying(false);
      
      // Auto-scroll to section if content is visible
      if (selectedTopics.length > 0 && resourceContent && contentRef.current) {
        const text = resourceContent.toLowerCase();
        const firstTopic = selectedTopics[0].toLowerCase();
        
        // Very basic "jump to" logic: find first occurrence of topic in text
        const index = text.indexOf(firstTopic);
        if (index !== -1) {
          // If viewing material isn't set, set it to Notes by default
          if (!viewingMaterialId) setViewingMaterialId("notes");
          
          // Small delay to ensure content is rendered
          setTimeout(() => {
            const preElement = contentRef.current?.querySelector('pre');
            if (preElement) {
              const fullText = preElement.textContent || "";
              const linesBefore = fullText.substring(0, index).split('\n').length;
              const lineHeight = 20; // estimate
              preElement.scrollTo({
                top: (linesBefore - 2) * lineHeight,
                behavior: 'smooth'
              });
            }
          }, 100);
        }
      }
    }, 400);
  }

  // Content generation functions for cheat sheets and practice assessments
  const generateCheatSheet = (categoryId: string) => {
    const cheatSheets: Record<string, string> = {
      "ethical-hacking": "🔒 ETHICAL HACKING CHEAT SHEET v2.0\n\n🛡️ SECURITY INCIDENT RESPONSE FRAMEWORK\n1. DETECTION\n   • Antivirus scans\n   • SIEM monitoring\n   • Employee reports\n   • Unusual behavior analysis\n\n2. CONTAINMENT\n   • Short-term: Disconnect affected systems\n   • Long-term: Take servers offline\n   • Preserve evidence for investigation",
      "human-resources": "👥 HUMAN RESOURCES CHEAT SHEET v2.0\n\n📊 HR LIFECYCLE MANAGEMENT\nRECRUITMENT → ONBOARDING → TRAINING → PERFORMANCE → COMPENSATION → OFFBOARDING\n\n🔑 KEY HR METRICS\n• Turnover Rate: (Employees Left ÷ Total Employees) × 100\n• Time to Hire: Days from job posting to acceptance",
      "dsa": "💻 DATA STRUCTURES & ALGORITHMS CHEAT SHEET v2.0\n\n⚡ TIME COMPLEXITY BIG-O\nO(1) - Constant: Array access\nO(log n) - Logarithmic: Binary search\nO(n) - Linear: Linear search\nO(n log n) - Linearithmic: Merge sort, quicksort\nO(n²) - Quadratic: Bubble sort, nested loops",
      "physics": "⚛️ PHYSICS CHEAT SHEET v2.0\n\n💡 LAWS OF THERMODYNAMICS\nZeroth Law: Thermal equilibrium → Temperature measurement\nFirst Law: ΔU = Q - W (Energy conservation)\nSecond Law: Entropy always increases (ΔS > 0)\nThird Law: Absolute zero (0K) is unattainable",
      "chemistry": "🧪 CHEMISTRY CHEAT SHEET v2.0\n\n⚗️ pH SCALE & CALCULATIONS\npH Scale: 0 (acidic) ← 7 (neutral) → 14 (basic)\npH = -log[H⁺]\n[H⁺] = 10^(-pH)\n\nStrong Acids: Complete dissociation (HCl, HNO₃)\nWeak Acids: Partial dissociation (CH₃COOH)",
      "dbms": "🗃️ DATABASE MANAGEMENT CHEAT SHEET v2.0\n\n🔤 SQL COMMANDS QUICK REFERENCE\n-- DDL (Data Definition)\nCREATE TABLE table_name (column1 datatype, column2 datatype);\nALTER TABLE table_name ADD column_name datatype;\nDROP TABLE table_name;\n\n-- DML (Data Manipulation)\nSELECT * FROM table_name WHERE condition;",
      "financial-accounting": "💰 FINANCIAL ACCOUNTING CHEAT SHEET v2.0\n\n💵 TIME VALUE OF MONEY\nFuture Value: FV = PV × (1 + r)ⁿ\nPresent Value: PV = FV ÷ (1 + r)ⁿ\nAnnuity FV: PMT × [((1+r)ⁿ - 1) ÷ r]\nAnnuity PV: PMT × [(1 - (1+r)⁻ⁿ) ÷ r]"
    };
    
    return cheatSheets[categoryId] || "Cheat sheet not available for this subject.";
  };

  const generatePracticeAssessment = (categoryId: string) => {
    const assessments: Record<string, string> = {
      "ethical-hacking": "🔒 ETHICAL HACKING PRACTICE ASSESSMENT\n\n📝 MULTIPLE CHOICE QUESTIONS\n1. What's the first step in incident response?\n   a) Eradication\n   b) Detection ✓\n   c) Recovery\n   d) Containment\n\n2. Which tool is best for network scanning?\n   a) Wireshark\n   b) Nmap ✓\n   c) Metasploit\n   d) Burp Suite",
      "human-resources": "👥 HUMAN RESOURCES PRACTICE ASSESSMENT\n\n📝 MULTIPLE CHOICE QUESTIONS\n1. What's the primary purpose of onboarding?\n   a) Salary negotiation\n   b) Cultural integration and role clarity ✓\n   c) Performance evaluation\n   d) Compliance training\n\n2. Which metric measures employee retention?\n   a) Time to hire\n   b) Turnover rate ✓\n   c) Cost per hire\n   d) Engagement score",
      "dsa": "💻 DSA PRACTICE ASSESSMENT\n\n📝 MULTIPLE CHOICE QUESTIONS\n1. What's the time complexity of binary search?\n   a) O(n)\n   b) O(log n) ✓\n   c) O(n log n)\n   d) O(n²)\n\n2. Which data structure uses LIFO principle?\n   a) Queue\n   b) Stack ✓\n   c) Array\n   d) Linked List",
      "physics": "⚛️ PHYSICS PRACTICE ASSESSMENT\n\n📝 MULTIPLE CHOICE QUESTIONS\n1. Which law states energy cannot be created or destroyed?\n   a) Zeroth Law\n   b) First Law ✓\n   c) Second Law\n   d) Third Law\n\n2. What happens to entropy in an isolated system?\n   a) Always decreases\n   b) Remains constant\n   c) Always increases ✓\n   d) Fluctuates randomly",
      "chemistry": "🧪 CHEMISTRY PRACTICE ASSESSMENT\n\n📝 MULTIPLE CHOICE QUESTIONS\n1. What's the pH of 0.001M HCl solution?\n   a) 1\n   b) 2\n   c) 3 ✓\n   d) 4\n\n2. Which is a strong acid?\n   a) CH₃COOH\n   b) HCl ✓\n   c) NH₄OH\n   d) H₂CO₃",
      "dbms": "🗃️ DATABASE MANAGEMENT PRACTICE ASSESSMENT\n\n📝 MULTIPLE CHOICE QUESTIONS\n1. Which normal form eliminates partial dependencies?\n   a) 1NF\n   b) 2NF ✓\n   c) 3NF\n   d) BCNF\n\n2. What does SQL stand for?\n   a) Structured Query Language ✓\n   b) Simple Query Language\n   c) Standard Query Logic\n   d) System Query Language",
      "financial-accounting": "💰 FINANCIAL ACCOUNTING PRACTICE ASSESSMENT\n\n📝 MULTIPLE CHOICE QUESTIONS\n1. What's the formula for Present Value?\n   a) FV × (1 + r)ⁿ\n   b) FV ÷ (1 + r)ⁿ ✓\n   c) FV + r × n\n   d) FV - r × n\n\n2. Current Ratio of 1.5 indicates:\n   a) Liquidity issues\n   b) Good liquidity ✓\n   c) Excessive liquidity\n   d) Insufficient data"
    };
    
    return assessments[categoryId] || "Practice assessment not available for this subject.";
  };

  const allMaterials = useMemo(() => [
    { 
      id: "notes", 
      title: "Notes", 
      type: "pdf", 
      size: "2.4 MB", 
      description: "Foundational concepts and overview of the subject.",
      icon: <BookOpen size={20} />
    },
    { 
      id: "cheat-sheet", 
      title: "Cheat Sheet v2.0", 
      type: "pdf", 
      size: "1.1 MB", 
      description: "Condensed quick-reference with formulas and key concepts.",
      icon: <Zap size={20} />
    },
    { 
      id: "practice-assessment", 
      title: "Practice Assessment", 
      type: "video", 
      duration: "08:20", 
      description: "Interactive MCQs and problems to test your knowledge.",
      icon: <FileText size={20} />
    }
  ], []);

  const displayedMaterials = useMemo(() => {
    // Only show materials for subjects that have resources
    if (!selected?.status || selected.status === "coming-soon") {
      return [];
    }
    return allMaterials;
  }, [selected, allMaterials]);

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

  function handleAskSend() {
    const trimmed = askQuery.trim();
    if (!trimmed) return;
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setChatMessages((prev) => [
      ...prev,
      { id, role: "user", text: trimmed },
    ]);
    setAskQuery("");
    setIsAivaThinking(true);

    // Simulate AI response delay
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `${id}-aiva`,
          role: "aiva",
          text: "Got it. Pick a subject on the left or search for a topic — I’ll help you navigate resources.",
        },
      ]);
      setIsAivaThinking(false);
    }, 1500);
  }

  return (
    <div className="w-full max-w-[1450px] mx-auto pb-20 px-6 lg:px-12">
      <AnimatePresence mode="wait">
        {!selectedCategory ? (
          /* ═══════════════════════════════════════════════════════
             VIEW 1 — Category Listing + Robo Assistant
             ═══════════════════════════════════════════════════════ */
          <motion.div
            key="listing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start"
          >
            {/* ── Left: Filter + Search + Category List ── */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="flex-1 min-w-0 space-y-8"
            >
              <div className="space-y-6">
                {/* Header & Filter buttons */}
                <div className="space-y-4">
                  <motion.div variants={fadeUp} className="flex gap-2 flex-wrap">
                    {filterTabs.map((f) => (
                      <button
                        key={f.key}
                        onClick={() => setActiveFilter(f.key as any)}
                        className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                          activeFilter === f.key
                            ? `${f.activeClass} text-white shadow-[0_10px_20px_-5px_rgba(139,92,246,0.3)] scale-105`
                            : "bg-white/40 dark:bg-gray-800/40 text-gray-600 dark:text-gray-400 hover:bg-white/60 dark:hover:bg-gray-700/60 ring-1 ring-black/5 dark:ring-white/5"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </motion.div>

                  {/* Search bar */}
                  <motion.div variants={fadeUp} className="relative group max-w-md">
                    <div className="absolute inset-0 bg-aiva-purple/20 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search resources, topics, or skills..."
                        className="w-full pl-12 pr-12 py-4 rounded-[2rem] bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 border border-white/20 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-aiva-purple/30 transition-all shadow-sm group-hover:shadow-md"
                      />
                      <Search
                        size={20}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-aiva-purple group-focus-within:scale-110 transition-transform"
                      />
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery("")}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Results counter */}
                {filteredCategories.length !== CATEGORIES.length && (
                  <motion.div variants={fadeUp} className="text-sm font-medium text-gray-500 dark:text-gray-400 pl-2">
                    Found {filteredCategories.length} matching subjects
                  </motion.div>
                )}
              </div>

                {/* Category List Stack */}
              <motion.div 
                layout
                className="flex flex-col gap-5 w-full max-w-2xl"
              >
                {filteredCategories.map((cat, i) => (
                  <motion.button
                    key={cat.id}
                    layout
                    variants={categoryCardVariants}
                    initial="hidden"
                    animate="show"
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => setSelectedCategory(cat.id)}
                    className="w-full text-left group relative"
                  >
                    {/* Coming Soon Ribbon - High-precision diagonal design */}
                    {cat.status === "coming-soon" && (
                      <div className="absolute top-0 right-0 z-20 pointer-events-none overflow-hidden w-28 h-28">
                        <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-rose-500 text-white text-[9px] font-black uppercase tracking-tighter py-1.5 w-[160px] text-center rotate-45 translate-x-10 translate-y-4 shadow-xl border-y border-white/20">
                          Upcoming
                        </div>
                      </div>
                    )}

                    <div
                      className={`relative overflow-hidden rounded-[3.5rem] px-10 py-8 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border transition-all duration-500 ${
                        cat.status === "coming-soon" 
                          ? "border-white/20 dark:border-white/5 opacity-80 grayscale-[0.3]" 
                          : "border-white/40 dark:border-white/5 group-hover:border-aiva-purple/30 group-hover:shadow-[0_15px_35px_-10px_rgba(139,92,246,0.1)]"
                      }`}
                      style={{
                        background: cat.status === "coming-soon"
                          ? `linear-gradient(135deg, rgba(244, 244, 245, 0.4) 0%, rgba(228, 228, 231, 0.3) 100%)`
                          : `linear-gradient(135deg, 
                              rgba(165, 148, 249, ${0.25 + (i % 3) * 0.05}) 0%, 
                              rgba(129, 140, 248, ${0.15 + (i % 3) * 0.03}) 50%, 
                              rgba(196, 181, 253, ${0.2 + (i % 3) * 0.04}) 100%)`,
                      }}
                    >
                      {/* Decorative background element */}
                      {cat.status !== "coming-soon" && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                      )}
                      
                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-2">
                          <span className="text-3xl filter drop-shadow-md">{cat.icon}</span>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-aiva-purple transition-colors">
                            {cat.title}
                          </h3>
                        </div>
                        {cat.subtitle && (
                          <p className="text-sm text-gray-500/80 dark:text-gray-400/80 font-medium mt-1 leading-relaxed pl-1">
                            {cat.subtitle}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-4 pl-1">
                          {cat.topics.slice(0, 3).map(topic => (
                            <span key={topic} className="px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                              {topic}
                            </span>
                          ))}
                          {cat.topics.length > 3 && (
                            <span className="text-[10px] font-bold text-gray-400">+{cat.topics.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>

              {filteredCategories.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Search size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">No resources found</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                    We couldn't find any categories matching "{searchQuery}". Try a different search term.
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* ── Right: Robo Assistant Panel ── */}
            <motion.div
              variants={slideIn}
              initial="hidden"
              animate="show"
              className="w-full lg:w-[380px] lg:sticky lg:top-48 flex-shrink-0"
            >
              <div className="w-full rounded-[2.5rem] bg-white/40 dark:bg-gray-800/40 backdrop-blur-2xl shadow-2xl border border-white/40 dark:border-white/5 overflow-hidden flex flex-col group/panel">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-aiva-purple/10 to-transparent opacity-0 group-hover/panel:opacity-100 transition-opacity duration-700 pointer-events-none" />

                {/* Header with greeting + 3-dot menu */}
                <div className="px-6 pt-8 pb-2 flex items-start justify-between relative z-10">
                  <div className="text-left">
                    <motion.p 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-lg font-black text-aiva-purple tracking-tight"
                    >
                      Hello {firstName},
                    </motion.p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-0.5">
                      I'm here to help you learn
                    </p>
                  </div>
                  
                  <div className="relative">
                    <button
                      onClick={() => setChatMenuOpen(!chatMenuOpen)}
                      className="h-10 w-10 inline-flex items-center justify-center rounded-2xl text-gray-400 hover:text-aiva-purple hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all"
                    >
                      <MoreVertical size={20} />
                    </button>
                    <AnimatePresence>
                      {chatMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: -4 }}
                          className="absolute right-0 top-full mt-2 w-44 rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl border border-black/5 dark:border-white/10 py-2 z-30"
                        >
                          <button
                            onClick={handleClearChat}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={14} />
                            Clear History
                          </button>
                          <button
                            onClick={handleDeleteLast}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/60 transition-colors"
                          >
                            <Pencil size={14} />
                            Undo Last Message
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Robo image */}
                <div className="flex justify-center px-4 py-4 relative z-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-aiva-purple/20 blur-3xl rounded-full scale-75 animate-pulse" />
                    <motion.img
                      src="/Assets/Robo.png"
                      alt="Aiva AI Assistant"
                      className="w-44 h-44 object-contain drop-shadow-2xl relative z-10"
                      animate={{ 
                        y: [0, -12, 0],
                        rotate: [0, 2, -2, 0]
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </div>
                </div>

                {/* Chat area */}
                <div className="flex-1 flex flex-col min-h-[300px] max-h-[450px] px-4 relative z-10">
                  <div className="flex-1 overflow-y-auto space-y-4 pb-4 px-2 scrollbar-thin scrollbar-thumb-aiva-purple/20 scrollbar-track-transparent">
                    {chatMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-50">
                        <div className="w-12 h-12 rounded-2xl bg-aiva-purple/10 flex items-center justify-center">
                          <Sparkles size={20} className="text-aiva-purple" />
                        </div>
                        <p className="text-xs font-medium text-gray-500 max-w-[200px]">
                          Ask me anything about subjects or career paths!
                        </p>
                      </div>
                    ) : (
                      chatMessages.map((m) => (
                        <motion.div
                          key={m.id}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[85%] shadow-sm ${
                              m.role === "user"
                                ? "bg-aiva-purple text-white rounded-tr-none"
                                : "bg-white/80 dark:bg-gray-900/80 text-gray-800 dark:text-gray-100 border border-white/20 dark:border-white/5 rounded-tl-none"
                            }`}
                          >
                            {m.text}
                          </div>
                        </motion.div>
                      ))
                    )}
                    
                    {isAivaThinking && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="bg-white/80 dark:bg-gray-900/80 rounded-2xl rounded-tl-none px-4 py-3 border border-white/20 dark:border-white/5">
                          <div className="flex gap-1">
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                              className="w-1.5 h-1.5 rounded-full bg-aiva-purple"
                            />
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                              className="w-1.5 h-1.5 rounded-full bg-aiva-purple"
                            />
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                              className="w-1.5 h-1.5 rounded-full bg-aiva-purple"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Input area */}
                  <div className="pt-2 pb-6">
                    <div className="relative group/input">
                      <div className="absolute inset-0 bg-aiva-purple/10 blur-lg rounded-full opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                      <input
                        type="text"
                        value={askQuery}
                        onChange={(e) => setAskQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAskSend();
                        }}
                        placeholder="Ask Aiva..."
                        className="w-full pl-5 pr-20 py-3.5 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 border border-white/20 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-aiva-purple/30 shadow-inner relative z-10"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 z-20">
                        <button
                          type="button"
                          onClick={handleOpenVoice}
                          className="h-9 w-9 inline-flex items-center justify-center rounded-xl text-gray-400 hover:text-aiva-purple hover:bg-aiva-purple/10 transition-all"
                        >
                          <Mic size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={handleAskSend}
                          disabled={!askQuery.trim()}
                          className="h-9 w-9 inline-flex items-center justify-center rounded-xl bg-aiva-purple text-white shadow-lg shadow-aiva-purple/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
                        >
                          <Send size={16} />
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
            initial={{ opacity: 0, x: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 40, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start"
          >
            {/* ── Left: Content area ── */}
            <div className="flex-1 min-w-0 w-full pt-10">
              {/* Back button */}
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ x: -4 }}
                onClick={() => setSelectedCategory(null)}
                className="group flex items-center gap-2 text-xs font-bold text-gray-500/80 dark:text-gray-400/80 hover:text-aiva-purple dark:hover:text-aiva-purple mb-10 transition-all ml-4"
              >
                <div className="w-8 h-8 rounded-full bg-white/40 dark:bg-gray-800/40 flex items-center justify-center ring-1 ring-black/5 dark:ring-white/5 group-hover:bg-aiva-purple/10 transition-all">
                  <ArrowLeft size={14} />
                </div>
                Back to Resources
              </motion.button>

              {/* Header Info */}
              <div className="mb-12 ml-4">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-6"
                >
                  <div className="w-20 h-20 rounded-[2rem] bg-white/30 dark:bg-gray-800/30 backdrop-blur-md flex items-center justify-center text-5xl shadow-sm ring-1 ring-white/20">
                    {selected?.icon}
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                      {selected?.title}
                    </h2>
                    <p className="text-base text-gray-500/80 dark:text-gray-400/80 font-medium mt-1">
                      {selected?.subtitle}
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Content Grid with Purple Layer */}
              <div className="relative ml-4 mt-8 min-h-[400px]" ref={contentRef}>
                {/* Purple glassmorphic layer behind boxes */}
                <div className="absolute inset-0 -m-6 rounded-[3rem] bg-gradient-to-br from-aiva-purple/15 to-blue-500/10 backdrop-blur-3xl ring-1 ring-white/10 pointer-events-none" />
                
                <AnimatePresence mode="popLayout">
                  {isApplying ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center z-20"
                    >
                      <div className="flex gap-2">
                        <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 rounded-full bg-aiva-purple" />
                        <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 rounded-full bg-aiva-purple" />
                        <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 rounded-full bg-aiva-purple" />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="grid"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="relative"
                    >
                      {/* Material Grid */}
                      {!viewingMaterialId ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {displayedMaterials.map((item, idx) => (
                            <motion.button
                              key={item.title}
                              layout
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.04 }}
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setViewingMaterialId(item.id)}
                              className="group relative text-left rounded-[2rem] p-6 bg-white/60 dark:bg-gray-900/50 backdrop-blur-xl border border-white/40 dark:border-white/5 transition-all duration-300 hover:shadow-2xl hover:shadow-aiva-purple/10 hover:border-aiva-purple/30"
                            >
                              <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-aiva-purple/10 text-aiva-purple flex items-center justify-center shrink-0 group-hover:bg-aiva-purple group-hover:text-white transition-all duration-500">
                                  {item.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-aiva-purple transition-colors truncate">
                                    {item.title}
                                  </h4>
                                  <p className="text-[11px] text-gray-500/80 dark:text-gray-400/80 mt-1 line-clamp-1">
                                    {item.description}
                                  </p>
                                </div>
                                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:bg-aiva-purple group-hover:text-white transition-all">
                                  <ChevronRight size={16} />
                                </div>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      ) : (
                        /* Detailed Material Content View */
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="w-full"
                        >
                          <button 
                            onClick={() => setViewingMaterialId(null)}
                            className="flex items-center gap-2 text-xs font-bold text-aiva-purple mb-6 hover:underline"
                          >
                            <ArrowLeft size={14} />
                            Back to {selected?.title} Materials
                          </button>
                          
                          <div className="p-8 rounded-[2.5rem] bg-white/70 dark:bg-gray-900/60 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-2xl">
                            <div className="flex items-center gap-4 mb-8">
                              <div className="w-12 h-12 rounded-2xl bg-aiva-purple text-white flex items-center justify-center">
                                {allMaterials.find(m => m.id === viewingMaterialId)?.icon}
                              </div>
                              <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                                  {allMaterials.find(m => m.id === viewingMaterialId)?.title}
                                </h3>
                                <p className="text-xs text-gray-500 font-medium">Aiva Curated Resource</p>
                              </div>
                            </div>

                            {isContentLoading ? (
                              <div className="py-20 flex flex-col items-center justify-center gap-4">
                                <motion.div 
                                  animate={{ rotate: 360 }}
                                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                  className="w-10 h-10 border-4 border-aiva-purple border-t-transparent rounded-full"
                                />
                                <p className="text-sm font-bold text-gray-400 animate-pulse">Aiva is preparing your notes...</p>
                              </div>
                            ) : viewingMaterialId === "notes" && resourceContent ? (
                              <div className="prose prose-sm dark:prose-invert max-w-none">
                                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-black/5 dark:bg-white/5 p-6 rounded-2xl border border-black/5 dark:border-white/5">
                                  {resourceContent}
                                </pre>
                              </div>
                            ) : viewingMaterialId === "cheat-sheet" ? (
                              <div className="prose prose-sm dark:prose-invert max-w-none">
                                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-black/5 dark:bg-white/5 p-6 rounded-2xl border border-black/5 dark:border-white/5">
                                  {generateCheatSheet(selected?.id || "")}
                                </pre>
                              </div>
                            ) : viewingMaterialId === "practice-assessment" ? (
                              <div className="prose prose-sm dark:prose-invert max-w-none">
                                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-black/5 dark:bg-white/5 p-6 rounded-2xl border border-black/5 dark:border-white/5">
                                  {generatePracticeAssessment(selected?.id || "")}
                                </pre>
                              </div>
                            ) : (
                              <div className="py-20 text-center">
                                <p className="text-gray-400 font-medium italic">This resource is currently being updated by Aiva.</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                      
                      {displayedMaterials.length === 0 && !viewingMaterialId && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="py-20 text-center"
                        >
                          <p className="text-gray-400 font-medium italic">No materials found for the selected filters.</p>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ── Right: Customize + Topic chips ── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full lg:w-[320px] lg:sticky lg:top-48 flex-shrink-0"
            >
              <div className="rounded-[2.5rem] bg-white/40 dark:bg-gray-800/40 backdrop-blur-2xl shadow-xl border border-white/40 dark:border-white/5 p-6 space-y-8">
                {/* Customize input */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Personalize</h4>
                  <div className="relative group">
                    <input
                      type="text"
                      value={personalizeQuery}
                      onChange={(e) => setPersonalizeQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          // Search for query in text and scroll
                          if (resourceContent && contentRef.current) {
                            const index = resourceContent.toLowerCase().indexOf(personalizeQuery.toLowerCase());
                            if (index !== -1) {
                              if (!viewingMaterialId) setViewingMaterialId("notes");
                              setTimeout(() => {
                                const preElement = contentRef.current?.querySelector('pre');
                                if (preElement) {
                                  const fullText = preElement.textContent || "";
                                  const linesBefore = fullText.substring(0, index).split('\n').length;
                                  preElement.scrollTo({ top: (linesBefore - 2) * 20, behavior: 'smooth' });
                                }
                              }, 100);
                            }
                          }
                        }
                      }}
                      placeholder="Jump to a topic..."
                      className="w-full pl-5 pr-12 py-3.5 rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 border border-white/20 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-aiva-purple/30 transition-all"
                    />
                    <button 
                      onClick={() => {
                        if (resourceContent && contentRef.current) {
                          const index = resourceContent.toLowerCase().indexOf(personalizeQuery.toLowerCase());
                          if (index !== -1) {
                            if (!viewingMaterialId) setViewingMaterialId("notes");
                            setTimeout(() => {
                              const preElement = contentRef.current?.querySelector('pre');
                              if (preElement) {
                                const fullText = preElement.textContent || "";
                                const linesBefore = fullText.substring(0, index).split('\n').length;
                                preElement.scrollTo({ top: (linesBefore - 2) * 20, behavior: 'smooth' });
                              }
                            }, 100);
                          }
                        }
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-xl bg-aiva-purple/10 text-aiva-purple hover:bg-aiva-purple hover:text-white transition-all"
                    >
                      <Search size={15} />
                    </button>
                  </div>
                </div>

                {/* Topic chips */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between ml-1">
                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Quick Filters</h4>
                    {selectedTopics.length > 0 && (
                      <button 
                        onClick={() => setSelectedTopics([])}
                        className="text-[10px] font-bold text-rose-500 hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selected?.topics.map((topic, i) => (
                      <TopicChip 
                        key={topic} 
                        label={topic} 
                        index={i} 
                        isActive={selectedTopics.includes(topic)}
                        onToggle={() => handleTopicToggle(topic)}
                      />
                    ))}
                  </div>
                  
                  {/* Apply Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleApplyFilters}
                    disabled={selectedTopics.length === 0 && appliedFilters.length === 0}
                    className="w-full py-3 rounded-2xl bg-aiva-purple text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-aiva-purple/20 disabled:opacity-50 disabled:grayscale transition-all mt-2"
                  >
                    Apply Filters
                  </motion.button>
                </div>

                {/* Action card */}
                <div className="p-5 rounded-[2rem] bg-aiva-purple/5 border border-aiva-purple/10">
                  <h5 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Want a custom plan?</h5>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                    Ask Aiva to create a personalized learning schedule for {selected?.title}.
                  </p>
                  <button 
                    onClick={() => {
                      setSelectedCategory(null);
                      // In a real app we'd set the chat query here
                    }}
                    className="w-full py-2.5 rounded-xl bg-aiva-purple text-white text-xs font-bold shadow-lg shadow-aiva-purple/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Ask Aiva
                  </button>
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
interface TopicChipProps {
  label: string;
  index: number;
  isActive: boolean;
  onToggle: () => void;
}

function TopicChip({ label, index, isActive, onToggle }: TopicChipProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 + 0.4 }}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onToggle}
      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
        isActive
          ? "bg-aiva-purple text-white shadow-[0_8px_20px_-5px_rgba(139,92,246,0.4)] ring-2 ring-aiva-purple/20"
          : "bg-white/60 dark:bg-gray-900/60 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 ring-1 ring-black/5 dark:ring-white/5"
      }`}
    >
      {label}
    </motion.button>
  );
}

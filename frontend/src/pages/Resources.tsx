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
  // (moved to category click handler to avoid setState inside effect)

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
      "ethical-hacking": `🔒 ETHICAL HACKING CHEAT SHEET v2.0

═══════════════════════════════════════════════════════

🛡️ SECURITY INCIDENT RESPONSE FRAMEWORK

═══════════════════════════════════════════════════════

1️⃣ DETECTION & IDENTIFICATION
─────────────────────────────
• Antivirus/Antimalware alerts
• SIEM (Security Information & Event Management) monitoring
• IDS/IPS anomaly detection
• Employee reports & help desk tickets
• Log analysis & unusual behavior patterns

2️⃣ CONTAINMENT
─────────────────────────────
• Short-term: Isolate affected systems (disconnect from network)
• Long-term: Quarantine at network level
• Preserve forensic evidence (don't power off!)
• Document timeline of events

3️⃣ ERADICATION
─────────────────────────────
• Remove malware & backdoors
• Patch vulnerabilities exploited
• Reset compromised credentials
• Close attack vectors

4️⃣ RECOVERY
─────────────────────────────
• Restore from clean backups
• Rebuild compromised systems
• Restore services gradually
• Monitor for re-infection

5️⃣ LESSONS LEARNED
─────────────────────────────
• Conduct post-incident review
• Update incident response plan
• Implement preventive controls

═══════════════════════════════════════════════════════

🔐 COMMON ATTACK VECTORS

═══════════════════════════════════════════════════════

PHISHING ATTACKS:
• Email phishing - deceptive emails
• Spear phishing - targeted individuals
• Whaling - targeting executives
• Smishing - SMS phishing
• Vishing - voice phishing

PREVENTION: Email filtering, MFA, user training

───────────────────────────────────────────────────────

SQL INJECTION:
• Code injection via user input
• Types: In-band, Blind, Out-of-band
• Payloads: ' OR '1'='1, UNION SELECT, etc.

PREVENTION: Input validation, parameterized queries

───────────────────────────────────────────────────────

XSS (Cross-Site Scripting):
• Stored XSS - persistent in database
• Reflected XSS - via URL parameters
• DOM-based XSS - client-side execution

PREVENTION: Output encoding, Content Security Policy

───────────────────────────────────────────────────────

MAN-IN-THE-MIDDLE (MITM):
• ARP spoofing
• SSL stripping
• Session hijacking

PREVENTION: HTTPS, HSTS, certificate pinning

═══════════════════════════════════════════════════════

🛠️ ESSENTIAL TOOLS

═══════════════════════════════════════════════════════

RECONNAISSANCE:
• Nmap - port scanning & network mapping
• Maltego - OSINT & data mining
• theHarvester - email harvesting
• WHOIS - domain registration info

VULNERABILITY SCANNING:
• Nessus - comprehensive vulnerability scanner
• OpenVAS - open-source vulnerability scanner
• Nikto - web server scanner

EXPLOITATION:
• Metasploit - penetration testing framework
• Burp Suite - web application testing
• Wireshark - packet analysis
• John the Ripper - password cracking

DEFENSE:
• firewall-cmd / iptables - Linux firewall
• ClamAV - antivirus
• OSSEC - HIDS
• Snort - intrusion detection`,

      "human-resources": `👥 HUMAN RESOURCES CHEAT SHEET v2.0

═══════════════════════════════════════════════════════

📊 HR LIFECYCLE FRAMEWORK

═══════════════════════════════════════════════════════

RECRUITMENT          ONBOARDING           DEVELOPMENT
    │                    │                     │
    ▼                    ▼                     ▼
┌─────────┐         ┌─────────┐          ┌─────────┐
│ Sourcing│         │ Orientation      │ Training │
│ Screening│         │ Integration      │Mentoring │
│Interview│         │ Compliance      │Performance│
└────┬────┘         └─────────┘          └────┬────┘
     │                                       │
     ▼                                       ▼
┌─────────┐         COMPENSATION          ┌─────────┐
│Selection│◄─────── & BENEFITS ──────────►│Growth   │
└─────────┘                               └─────────┘
                                              │
                                              ▼
                                       OFFBOARDING
                                          (Exit)

═══════════════════════════════════════════════════════

📈 KEY HR METRICS

═══════════════════════════════════════════════════════

TURNOVER RATE:
Formula: (Employees Left ÷ Average Headcount) × 100

• Industry benchmark: 10-15% annually
• High turnover = culture/management issues
• Track by department, tenure, reason

───────────────────────────────────────────────────────

TIME TO HIRE (TTH):
Formula: Days from job posting → Offer accepted

• Competitive: 25-35 days
• Senior roles: 40-60 days
• Impacted by: market, hiring process efficiency

───────────────────────────────────────────────────────

COST PER HIRE (CPH):
Formula: Total Recruitment Costs ÷ Number of Hires

• Includes: Recruiting, interviewing, onboarding
• Average: $4,000-5,000 per hire (US)
• Reduces with employee referrals

───────────────────────────────────────────────────────

EMPLOYEE ENGAGEMENT SCORE:
Measured via surveys (quarterly/annual)

Categories:
• Satisfaction
• Motivation
• Commitment
• Advocacy (eNPS)

───────────────────────────────────────────────────────

PRODUCTIVITY RATIO:
Output per employee = Revenue ÷ Headcount

Tracks: Individual, team, department, company-wide

═══════════════════════════════════════════════════════

⚖️ LEGAL COMPLIANCE CHECKLIST

═══════════════════════════════════════════════════════

☑ I-9 Employment Eligibility Verification
☑ W-4 Tax Withholding Forms
☑ EEO-1 Pay Data Reporting
☑ OSHA Workplace Safety
☑ FMLA (Family & Medical Leave)
☑ FLSA Overtime Rules
☑ ADA (Americans with Disabilities Act)
☑ Workers' Compensation Insurance

═══════════════════════════════════════════════════════

🎯 PERFORMANCE MANAGEMENT CYCLE

═══════════════════════════════════════════════════════

PLANNING          MONITORING           REVIEW
   │                  │                  │
   ▼                  ▼                  ▼
┌─────────┐      ┌─────────┐       ┌─────────┐
│Goal     │◄────►│Weekly   │◄─────►│Annual   │
│Setting  │      │Check-ins│       │Review   │
└─────────┘      └─────────┘       └────┬────┘
                                        │
                                   ┌────▼────┐
                                   │Rating & │
                                   │Feedback │
                                   └─────────┘

GOAL SETTING (SMART Framework):
• Specific - Clear, well-defined
• Measurable - Quantifiable metrics
• Achievable - Realistic targets
• Relevant - Aligned to business
• Time-bound - Deadlines

FEEDBACK FRAMEWORKS:
• SBI: Situation → Behavior → Impact
• STAR: Situation → Task → Action → Result
• COIN: Context → Observation → Impact → Next Steps`,

      "dsa": `💻 DATA STRUCTURES & ALGORITHMS CHEAT SHEET v2.0

═══════════════════════════════════════════════════════

⚡ TIME COMPLEXITY BIG-O NOTATION

═══════════════════════════════════════════════════════

O(1)        Constant      Array access [i]
O(log n)    Logarithmic   Binary search
O(n)        Linear        Linear search, iteration
O(n log n)  Linearithmic  Merge sort, QuickSort
O(n²)       Quadratic     Bubble sort, nested loops
O(n³)       Cubic         3 nested loops
O(2ⁿ)       Exponential   Recursive Fibonacci
O(n!)       Factorial     Permutations

───────────────────────────────────────────────────────

SPACE COMPLEXITY QUICK REFERENCE:

• Array: O(n) space
• Linked List: O(n) space
• Binary Tree: O(n) space
• Hash Table: O(n) space
• Recursion stack: O(depth)

═══════════════════════════════════════════════════════

📦 DATA STRUCTURES

═══════════════════════════════════════════════════════

ARRAYS:
• Access: O(1) | Search: O(n) | Insert/Delete: O(n)
• Types: 1D, 2D (Matrix), Dynamic (ArrayList)
• Contiguous memory, cache-friendly

───────────────────────────────────────────────────────

LINKED LISTS:
• Singly: next pointer only
• Doubly: prev + next pointers
• Circular: tail→head connection

Operations:
• Access: O(n) | Search: O(n)
• Insert at head: O(1) | At tail: O(n)
• Delete: O(1) if node given (no search)

───────────────────────────────────────────────────────

STACKS (LIFO):
• Push: O(1) | Pop: O(1) | Peek: O(1)
• Applications: Function calls, undo, expression eval
• Implementation: Array or Linked List

───────────────────────────────────────────────────────

QUEUES (FIFO):
• Enqueue: O(1) | Dequeue: O(1)
• Types: Simple, Circular, Priority, Deque
• Applications: BFS, scheduling, buffering

───────────────────────────────────────────────────────

HASH TABLES:
• Insert: O(1) avg | Delete: O(1) avg | Search: O(1) avg
• Collision handling: Chaining, Open addressing
• Load factor (α) = n/k (threshold ~0.7)

───────────────────────────────────────────────────────

TREES:
• Binary Search Tree: O(log n) avg for all ops
• AVL Trees: Self-balancing, O(log n) guaranteed
• Red-Black Trees: Less strict balancing
• B-Trees: For databases (multiple keys per node)
• Trie: String operations, prefix search

───────────────────────────────────────────────────────

GRAPHS:
• Adjacency Matrix: O(V²) space, O(1) edge check
• Adjacency List: O(V+E) space, O(V) edge check
• Traversal: BFS (queue), DFS (stack/recursion)
• Shortest paths: Dijkstra, Bellman-Ford
• MST: Prim's, Kruskal's

═══════════════════════════════════════════════════════

🔍 SORTING ALGORITHMS

═══════════════════════════════════════════════════════

ALGORITHM      BEST        AVG         WORST       SPACE    STABLE
─────────────────────────────────────────────────────────────
Bubble Sort    O(n)        O(n²)       O(n²)       O(1)     ✅
Selection Sort O(n²)       O(n²)       O(n²)       O(1)     ❌
Insertion Sort O(n)        O(n²)       O(n²)       O(1)     ✅
Merge Sort     O(n log n)  O(n log n)  O(n log n)  O(n)     ✅
Quick Sort     O(n log n)  O(n log n)  O(n²)       O(log n) ❌
Heap Sort      O(n log n)  O(n log n)  O(n log n)  O(1)     ❌

───────────────────────────────────────────────────────

QUICKSORT PARTITIONING:
• Choose pivot (last element)
• Partition: < pivot → left, > pivot → right
• Recursively sort left and right

MERGESORT:
• Divide array in half
• Recursively sort both halves
• Merge sorted halves

═══════════════════════════════════════════════════════

🧠 ALGORITHM PATTERNS

═══════════════════════════════════════════════════════

TWO POINTERS:
for i in range(n):
    while j < n and condition:
        j += 1
    # process

Used in: Pairs sum, palindrome, trapping rain water

───────────────────────────────────────────────────────

SLIDING WINDOW:
while r < len(nums):
    # expand window
    while condition violated:
        # shrink from left
    # update answer

Types: Fixed size, variable size

───────────────────────────────────────────────────────

BINARY SEARCH:
lo, hi = 0, len(arr)-1
while lo <= hi:
    mid = (lo+hi)//2
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        lo = mid + 1
    else:
        hi = mid - 1

───────────────────────────────────────────────────────

DYNAMIC PROGRAMMING:
1. Identify optimal substructure
2. Define state: dp[i] or dp[i][j]
3. Recurrence relation
4. Base case
5. Bottom-up (tabulation) or Top-down (memoization)

───────────────────────────────────────────────────────

BFS (Breadth-First Search):
from collections import deque
queue = deque([start])
while queue:
    node = queue.popleft()
    for neighbor in graph[node]:
        if not visited[neighbor]:
            visited[neighbor] = True
            queue.append(neighbor)

Use: Shortest path (unweighted), level order

───────────────────────────────────────────────────────

DFS (Depth-First Search):
stack = [start]
while stack:
    node = stack.pop()
    if not visited[node]:
        visited[node] = True
        for neighbor in graph[node]:
            if not visited[neighbor]:
                stack.append(neighbor)

Use: Path finding, cycle detection, topological sort`,

      "physics": `⚛️ PHYSICS CHEAT SHEET v2.0

═══════════════════════════════════════════════════════

🔬 CORE UNITS & CONSTANTS

═══════════════════════════════════════════════════════

SI BASE UNITS:
• Length: meter (m)
• Mass: kilogram (kg)
• Time: second (s)
• Electric current: ampere (A)
• Temperature: kelvin (K)
• Amount of substance: mole (mol)
• Luminous intensity: candela (cd)

───────────────────────────────────────────────────────

DERIVED UNITS:
• Force: Newton (N) = kg·m/s²
• Energy: Joule (J) = N·m = kg·m²/s²
• Power: Watt (W) = J/s = kg·m²/s³
• Pressure: Pascal (Pa) = N/m²
• Frequency: Hertz (Hz) = 1/s

───────────────────────────────────────────────────────

KEY CONSTANTS:
• Speed of light: c = 3×10⁸ m/s
• Gravitational constant: G = 6.67×10⁻¹¹ N·m²/kg²
• Planck's constant: h = 6.63×10⁻³⁴ J·s
• Avogadro's number: Nₐ = 6.02×10²³ mol⁻¹
• Gas constant: R = 8.314 J/(mol·K)

═══════════════════════════════════════════════════════

⚡ MECHANICS

═══════════════════════════════════════════════════════

KINEMATICS:
• v = u + at (velocity-time)
• s = ut + ½at² (displacement)
• v² = u² + 2as (velocity-displacement)

Where: u = initial velocity, v = final velocity
       a = acceleration, t = time, s = displacement

───────────────────────────────────────────────────────

NEWTON'S LAWS:
1st (Inertia): Objects remain at rest/motion unless acted upon
2nd (F=ma): Force = mass × acceleration
3rd (Action-Reaction): Every action has equal & opposite reaction

───────────────────────────────────────────────────────

WORK, ENERGY, POWER:
• W = F·d·cos(θ) [Joules]
• KE = ½mv² [Joules]
• PE = mgh (gravitational) [Joules]
• Power = W/t = F·v [Watts]

Conservation of Energy:
Total Energy = KE + PE = constant (closed system)

───────────────────────────────────────────────────────

MOMENTUM:
• p = mv [kg·m/s]
• Impulse: J = F·Δt = Δp
• Conservation: Σp_initial = Σp_final (isolated system)

═══════════════════════════════════════════════════════

🌡️ THERMODYNAMICS

═══════════════════════════════════════════════════════

LAWS OF THERMODYNAMICS:

ZEROTH LAW:
If A≈B and B≈C, then A≈C
→ Basis for temperature measurement

FIRST LAW (Energy Conservation):
ΔU = Q - W
• ΔU = change in internal energy
• Q = heat added to system
• W = work done by system

SECOND LAW:
Entropy always increases in isolated system
• ΔS ≥ 0 for isolated system
• Heat flows spontaneously: hot → cold

THIRD LAW:
Absolute zero (0 K) is unattainable

───────────────────────────────────────────────────────

IDEAL GAS LAW:
PV = nRT
• P = pressure, V = volume
• n = moles, R = gas constant
• T = temperature (K)

Combined Gas Law: P₁V₁/T₁ = P₂V₂/T₂

═══════════════════════════════════════════════════════

⚡ ELECTROMAGNETISM

═══════════════════════════════════════════════════════

ELECTRIC FIELDS:
• F = kq₁q₂/r² (Coulomb's Law)
• E = F/q = kQ/r² (Electric field)
• V = kQ/r (Electric potential)

CIRCUITS:
• V = IR (Ohm's Law)
• P = IV = I²R = V²/R (Power)
• Series: R_total = R₁ + R₂ + ...
• Parallel: 1/R_total = 1/R₁ + 1/R₂ + ...

Kirchhoff's Laws:
• Current (KCL): ΣI_in = ΣI_out
• Voltage (KVL): ΣV = 0 (closed loop)

───────────────────────────────────────────────────────

MAGNETIC FIELDS:
• F = qvB sin(θ) (force on moving charge)
• F = BIL sin(θ) (force on wire)
• B = μ₀I/(2πr) (wire)
• B = μ₀NI/L (solenoid)

Faraday's Law: ε = -dΦ/dt
Lenz's Law: Direction opposes change

═══════════════════════════════════════════════════════

🌊 WAVES & OPTICS

═══════════════════════════════════════════════════════

WAVE EQUATION:
v = fλ
• v = wave speed, f = frequency, λ = wavelength

INTERFERENCE:
• Constructive: Path diff = nλ (bright)
• Destructive: Path diff = (n+½)λ (dark)

REFLECTION & REFRACTION:
• Law of reflection: θᵢ = θᵣ
• Snell's Law: n₁sin(θ₁) = n₂sin(θ₂)
• Critical angle: sin(θc) = n₂/n₁

LENSES & MIRRORS:
• 1/f = 1/do + 1/di (thin lens equation)
• Magnification: M = -di/do = hi/ho

═══════════════════════════════════════════════════════

⚛️ MODERN PHYSICS

═══════════════════════════════════════════════════════

RELATIVITY:
• E = mc² (mass-energy equivalence)
• γ = 1/√(1 - v²/c²)
• Time dilation: Δt' = γΔt
• Length contraction: L' = L/γ

PHOTOELECTRIC EFFECT:
• E = hf - φ (Einstein's equation)
• h = Planck's constant, f = frequency
• φ = work function (minimum energy needed)

DE BROGLIE WAVELENGTH:
• λ = h/p = h/(mv)

NUCLEAR PHYSICS:
• Half-life: N = N₀(½)^(t/t½)
• Radioactive decay: A = λN
• E = Δmc² (mass defect → energy)`,

      "chemistry": `🧪 CHEMISTRY CHEAT SHEET v2.0

═══════════════════════════════════════════════════════

⚗️ pH SCALE & CALCULATIONS

═══════════════════════════════════════════════════════

pH SCALE:
0 ←─────── 7 ───────→ 14
 acidic    neutral     basic

Strong Acid: pH 0-3      Weak Acid: pH 4-6
Strong Base: pH 11-14    Weak Base: pH 8-10

───────────────────────────────────────────────────────

KEY EQUATIONS:
• pH = -log₁₀[H⁺]
• [H⁺] = 10^(-pH)
• pOH = -log₁₀[OH⁻]
• pH + pOH = 14 (at 25°C)
• [H⁺][OH⁻] = 10^(-14) = Kw

───────────────────────────────────────────────────────

ACID-BASE STRENGTH:
Strong Acids: HCl, HBr, HI, HNO₃, HClO₄, H₂SO₄
→ Complete dissociation in water

Weak Acids: CH₃COOH, HF, H₂CO₃, H₃PO₄
→ Partial dissociation (Ka < 1)

Strong Bases: NaOH, KOH, Ca(OH)₂ (soluble)
→ Complete dissociation

Weak Bases: NH₃, amines, carbonate salts
→ Partial dissociation (Kb < 1)

Ka × Kb = Kw (at given temperature)

═══════════════════════════════════════════════════════

⚛️ ATOMIC STRUCTURE

═══════════════════════════════════════════════════════

SUBATOMIC PARTICLES:
• Proton: +1, 1 amu, in nucleus
• Neutron: 0, 1 amu, in nucleus
• Electron: -1, ~0 amu, in orbitals

ATOMIC NUMBER (Z) = protons
MASS NUMBER (A) = protons + neutrons
Isotopes: Same Z, different A

───────────────────────────────────────────────────────

ELECTRON CONFIGURATION:
Aufbau Principle: Fill from lowest energy
Hund's Rule: Maximize unpaired electrons first
Pauli Exclusion: 2 electrons per orbital (opposite spin)

Notation: 1s² 2s² 2p⁶ 3s² 3p⁶...
Orbital order: 1s→2s→2p→3s→3p→4s→3d→4p→5s→4d→5p→6s→4f→5d→6p

═══════════════════════════════════════════════════════

🔗 CHEMICAL BONDING

═══════════════════════════════════════════════════════

IONIC BONDING:
• Metal + Non-metal
• Electron transfer → cations & anions
• Strong electrostatic forces
• High melting/boiling points

COVALENT BONDING:
• Non-metal + Non-metal
• Electron sharing
• Types: Single (σ), Double (σ+π), Triple (σ+2π)
• Polar vs Non-polar

VSEPR GEOMETRIES:
• Linear: 180° (sp hybridized)
• Trigonal planar: 120° (sp²)
• Tetrahedral: 109.5° (sp³)
• Trigonal bipyramidal: 90°, 120°
• Octahedral: 90°

═══════════════════════════════════════════════════════

⚖️ STOICHIOMETRY

═══════════════════════════════════════════════════════

MOLAR MASS: Mass of 1 mole (6.02×10²³ particles)

MOLES CALCULATIONS:
• n = mass / molar mass
• n = concentration × volume (L)
• n = PV / RT (ideal gas)

MOLARITY (M):
M = moles of solute / liters of solution

DILUTION:
M₁V₁ = M₂V₂

═══════════════════════════════════════════════════════

⚗️ REDOX REACTIONS

═══════════════════════════════════════════════════════

OXIDATION: Loss of electrons (LEO)
REDUCTION: Gain of electrons (GER)

OIL RIG: Oxidation Is Loss, Reduction Is Gain

GALVANIC CELLS (Voltaic):
• Spontaneous reaction
• Anode (oxidation) = negative
• Cathode (reduction) = positive
• E°cell = E°cathode - E°anode

ELECTROLYTIC CELLS:
• Non-spontaneous
• Requires external power
• Anode = positive, Cathode = negative`,

      "dbms": `🗃️ DATABASE MANAGEMENT CHEAT SHEET v2.0

═══════════════════════════════════════════════════════

🔤 SQL COMMANDS QUICK REFERENCE

═══════════════════════════════════════════════════════

📌 DDL (Data Definition Language):
───────────────────────────────────────────────────────

CREATE:
CREATE TABLE table_name (
    column1 datatype PRIMARY KEY,
    column2 datatype NOT NULL,
    column3 datatype DEFAULT value,
    FOREIGN KEY (col) REFERENCES other_table(col)
);

ALTER:
ALTER TABLE table_name ADD column_name datatype;
ALTER TABLE table_name DROP COLUMN column_name;

DROP vs TRUNCATE:
• DROP: Removes table structure + data (DDL)
• TRUNCATE: Removes all data, keeps structure (DDL)
• DELETE: Removes rows one by one (DML)

───────────────────────────────────────────────────────

📌 DML (Data Manipulation Language):
───────────────────────────────────────────────────────

SELECT with JOIN:
SELECT t1.col, t2.col
FROM table1 t1
INNER JOIN table2 t2 ON t1.id = t2.foreign_id;

SUBQUERIES:
• Scalar: Returns single value
• Column: Returns single column
• Table: Returns complete table
• Correlated: References outer query

UNION / INTERSECT / EXCEPT:
• UNION: Combine, remove duplicates
• UNION ALL: Combine, keep duplicates
• INTERSECT: Common rows only
• EXCEPT: Rows in first but not second

═══════════════════════════════════════════════════════

📊 AGGREGATE & WINDOW FUNCTIONS

═══════════════════════════════════════════════════════

AGGREGATE FUNCTIONS:
SELECT
    COUNT(*) AS total_rows,
    SUM(salary) AS total_salary,
    AVG(salary) AS avg_salary,
    MIN(salary) AS min_salary,
    MAX(salary) AS max_salary
FROM employees;

GROUP BY with HAVING:
SELECT department, COUNT(*) as count
FROM employees
GROUP BY department
HAVING COUNT(*) > 5;

WINDOW FUNCTIONS:
SELECT
    name,
    department,
    AVG(salary) OVER (PARTITION BY department) as dept_avg,
    RANK() OVER (ORDER BY salary DESC) as salary_rank
FROM employees;

• ROW_NUMBER(): Unique sequential integers
• RANK(): Gaps in ranking for ties
• DENSE_RANK(): No gaps in ranking
• LEAD/LAG(): Access adjacent rows

═══════════════════════════════════════════════════════

🔒 CONSTRAINTS

═══════════════════════════════════════════════════════

PRIMARY KEY:
• Uniquely identifies each row
• Only one per table
• Cannot be NULL
• Automatically creates unique index

FOREIGN KEY:
• References PRIMARY KEY of another table
• Enforces referential integrity
• Can have multiple per table

OTHER CONSTRAINTS:
• UNIQUE: No duplicate values (multiple allowed)
• NOT NULL: Cannot be empty
• CHECK: User-defined condition
• DEFAULT: Value if not specified

═══════════════════════════════════════════════════════

🏗️ NORMALIZATION FORMS

═══════════════════════════════════════════════════════

1NF (First Normal Form):
✓ Atomic values (no repeating groups)
✓ Unique column names
✓ Each row uniquely identifiable

2NF (Second Normal Form):
✓ In 1NF
✓ No partial dependencies
✓ (All non-key columns depend on entire PK)

3NF (Third Normal Form):
✓ In 2NF
✓ No transitive dependencies

BCNF (Boyce-Codd):
✓ In 3NF
✓ Every determinant must be a candidate key

NORMALIZATION CHECKLIST:
┌────────┬─────────────────────────────────────┐
│ 1NF    │ Atomic values, no arrays/lists        │
│ 2NF    │ No partial dependencies (1NF + ...)   │
│ 3NF    │ No transitive dependencies (2NF + ...) │
│ BCNF   │ Every determinant is a candidate key │
└────────┴─────────────────────────────────────┘

═══════════════════════════════════════════════════════

⚡ TRANSACTION MANAGEMENT (ACID)

═══════════════════════════════════════════════════════

ATOMICITY:
• All operations succeed OR all fail
• No partial commits

CONSISTENCY:
• Database moves from one valid state to another
• All constraints must be satisfied

ISOLATION:
• Concurrent transactions don't interfere
• Each transaction appears to run alone

DURABILITY:
• Committed changes persist permanently
• Survives system failures

───────────────────────────────────────────────────────

ISOLATION LEVELS (Least → Most Strict):

READ UNCOMMITTED: No isolation, dirty reads possible
READ COMMITTED: Only committed data visible
REPEATABLE READ: Same query returns same result
SERIALIZABLE: Full isolation, slowest

═══════════════════════════════════════════════════════

🔍 INDEXING

═══════════════════════════════════════════════════════

TYPES OF INDEXES:

B-Tree Index (Default):
• Balanced tree structure
• O(log n) search
• Supports: =, >, <, BETWEEN, LIKE 'prefix%'

Bitmap Index:
• Bits for each value
• Fast for low-cardinality columns

Hash Index:
• O(1) exact match
• No range queries

Composite Index:
• Multiple columns in one index
• Leftmost prefix rule applies

CREATE INDEX:
CREATE [UNIQUE] INDEX idx_name
ON table_name (column1, column2);`,

      "financial-accounting": `💰 FINANCIAL ACCOUNTING CHEAT SHEET v2.0

═══════════════════════════════════════════════════════

💵 TIME VALUE OF MONEY

═══════════════════════════════════════════════════════

CORE FORMULAS:

Future Value (Single Sum):
FV = PV × (1 + r)ⁿ

Present Value (Single Sum):
PV = FV ÷ (1 + r)ⁿ

Future Value of Annuity:
FVA = PMT × [((1+r)ⁿ - 1) ÷ r]

Present Value of Annuity:
PVA = PMT × [(1 - (1+r)⁻ⁿ) ÷ r]

Where: PMT = payment, r = rate per period, n = periods

───────────────────────────────────────────────────────

COMPOUNDING VS DISCOUNTING:

Compound: PV → FV (multiply by growth factor)
Discount: FV → PV (divide by growth factor)

Example:
PV = $1,000, r = 10%, n = 5 years
FV = 1000 × (1.10)⁵ = $1,610.51

═══════════════════════════════════════════════════════

📊 FINANCIAL STATEMENTS

═══════════════════════════════════════════════════════

INCOME STATEMENT (P&L):
Revenue
- Cost of Goods Sold (COGS)
= Gross Profit
- Operating Expenses
= Operating Income (EBIT)
+/- Interest & Taxes
= Net Income

BALANCE SHEET:
Assets = Liabilities + Equity

ASSETS (Ordered by Liquidity):
• Current: Cash, Accounts Receivable, Inventory
• Non-Current: Property/Equipment, Investments

LIABILITIES:
• Current: AP, Short-term Debt, Accruals
• Non-Current: Long-term Debt, Deferred Tax

EQUITY:
• Common Stock, Additional Paid-in Capital
• Retained Earnings - Treasury Stock

═══════════════════════════════════════════════════════

📈 KEY RATIO ANALYSIS

═══════════════════════════════════════════════════════

LIQUIDITY RATIOS:

Current Ratio = Current Assets ÷ Current Liabilities
• > 1.5 generally acceptable

Quick Ratio = (Current Assets - Inventory) ÷ Current Liabilities
• > 1.0 generally acceptable

───────────────────────────────────────────────────────

SOLVENCY RATIOS:

Debt-to-Equity = Total Debt ÷ Total Equity
• < 1.0 considered healthy

Interest Coverage = EBIT ÷ Interest Expense
• > 2.5 generally considered safe

───────────────────────────────────────────────────────

PROFITABILITY RATIOS:

Gross Margin = (Revenue - COGS) ÷ Revenue
Operating Margin = Operating Income ÷ Revenue
Net Profit Margin = Net Income ÷ Revenue

ROA = Net Income ÷ Average Total Assets
ROE = Net Income ÷ Average Equity

═══════════════════════════════════════════════════════

⚖️ ACCOUNTING PRINCIPLES

═══════════════════════════════════════════════════════

GAAP (Generally Accepted Accounting Principles):

1. Revenue Recognition:
   Revenue earned when realized/earned

2. Matching Principle:
   Expenses matched to revenues they generate

3. Cost Principle:
   Assets recorded at historical cost

4. Going Concern:
   Assumes business will continue indefinitely

5. Materiality:
   Significant items disclosed separately

───────────────────────────────────────────────────────

DOUBLE-ENTRY BOOKKEEPING:

Every transaction affects TWO accounts:
• Debits must equal Credits
• Assets ↑ = Debit
• Liabilities ↑ = Credit
• Equity ↑ = Credit
• Revenue ↑ = Credit
• Expenses ↑ = Debit

═══════════════════════════════════════════════════════

📋 WORKING CAPITAL

═══════════════════════════════════════════════════════

WORKING CAPITAL = Current Assets - Current Liabilities

Cash Conversion Cycle:
Days Inventory Outstanding (DIO)
+ Days Sales Outstanding (DSO)
- Days Payable Outstanding (DPO)
= Cash Conversion Cycle (CCC)

GOAL: Minimize CCC (faster cash regeneration)`,

      "economics": `📈 ECONOMICS CHEAT SHEET v2.0

═══════════════════════════════════════════════════════

📊 DEMAND & SUPPLY

═══════════════════════════════════════════════════════

DEMAND:
• Law of Demand: Price ↑, Quantity Demanded ↓ (inverse)
• Factors affecting demand: Income, tastes, price of related goods,
  expectations, number of buyers

SUPPLY:
• Law of Supply: Price ↑, Quantity Supplied ↑ (direct)
• Factors affecting supply: Costs, technology, expectations,
  number of sellers

───────────────────────────────────────────────────────

MARKET EQUILIBRIUM:
• Equilibrium: Quantity Demanded = Quantity Supplied
• Surplus (excess supply): Price tends to fall
• Shortage (excess demand): Price tends to rise

ELASTICITY:
• Price Elasticity of Demand (PED):
  PED = % Change in Quantity / % Change in Price
• |PED| > 1: Elastic (luxury goods)
• |PED| < 1: Inelastic (necessities)
• |PED| = 1: Unit elastic

═══════════════════════════════════════════════════════

💰 GDP & NATIONAL INCOME

═══════════════════════════════════════════════════════

GDP (Gross Domestic Product):
Total monetary value of all final goods & services produced
within a country's borders in a given period.

EXPENDITURE APPROACH:
GDP = C + I + G + (X - M)
• C = Consumer Spending
• I = Investment
• G = Government Spending
• X = Exports, M = Imports

───────────────────────────────────────────────────────

OTHER NATIONAL INCOME CONCEPTS:

GNP (Gross National Product):
GDP + Net Factor Income from Abroad

NNP (Net National Product):
GNP - Depreciation

NDP (Net Domestic Product):
GDP - Depreciation

PER CAPITA INCOME:
National Income / Population

REAL vs NOMINAL GDP:
• Nominal: Measured at current prices
• Real: Inflation-adjusted (base year prices)
• GDP Deflator = (Nominal / Real) × 100

═══════════════════════════════════════════════════════

🏭 TYPES OF ECONOMIC SYSTEMS

═══════════════════════════════════════════════════════

1. CAPITALISM (Market Economy):
✓ Private ownership of means of production
✓ Profit motive drives production
✓ Prices determined by supply & demand
✓ Minimal government intervention
✗ Can lead to inequality
✗ Market failures possible

2. SOCIALISM (Planned Economy):
✓ Government ownership of major resources
✓ Central planning for allocation
✓ More equitable distribution
✗ May lack innovation incentives
✗ Inefficient resource allocation

3. MIXED ECONOMY:
✓ Private sector + Government regulation
✓ Social welfare programs
✓ Public goods provision
→ Most common today (India, France, Canada)

BASIC ECONOMIC QUESTIONS:
• What to produce?
• How to produce?
• For whom to produce?

═══════════════════════════════════════════════════════

📉 INFLATION & MONETARY POLICY

═══════════════════════════════════════════════════════

INFLATION:
Sustained increase in general price level over time.

TYPES OF INFLATION:
1. Demand-Pull Inflation:
   → Aggregate demand > Aggregate supply
   → "Too much money chasing too few goods"

2. Cost-Push Inflation:
   → Rising production costs
   → Higher wages, raw materials, supply disruptions

3. Built-in Inflation:
   → Expectations of future inflation
   → Wage-price spiral

───────────────────────────────────────────────────────

MEASURING INFLATION:
• CPI (Consumer Price Index): Basket of consumer goods
• WPI (Wholesale Price Index): Wholesale prices
• GDP Deflator: Overall price changes

CONTROLLING INFLATION:
MONETARY POLICY (Central Bank):
• Raise interest rates
• Increase reserve requirements
• Sell government securities (OMO)
• Tighten credit

FISCAL POLICY (Government):
• Reduce government spending
• Increase taxes

═══════════════════════════════════════════════════════

🏦 MONETARY POLICY TOOLS

═══════════════════════════════════════════════════════

QUANTITATIVE TOOLS:
• Repo Rate: Rate at which RBI lends to banks
• Reverse Repo Rate: Rate at which RBI borrows
• Cash Reserve Ratio (CRR): % deposits banks must keep
• Statutory Liquidity Ratio (SLR): % assets in liquid form

QUALITATIVE TOOLS:
• Moral Suasion: Requests to banks
• Selective Credit Control
• Fair Practice Code
•窗口指导 (Window Guidance)

KEY RATES (India):
• Repo Rate: ~6.5% (as of recent)
• CRR: ~4.5%
• SLR: ~18%

═══════════════════════════════════════════════════════

📊 MACROECONOMIC INDICATORS

═══════════════════════════════════════════════════════

UNEMPLOYMENT:
• Unemployment Rate = Unemployed / Labor Force × 100
• Types: Frictional, Structural, Cyclical, Seasonal
• Natural Rate of Unemployment: ~4-6%

POVERTY:
• Absolute Poverty: Cannot meet basic needs
• Relative Poverty: Lower than average living standards
• Poverty Line: Income threshold for basic needs

INEQUALITY:
• Gini Coefficient: 0 (perfect equality) to 1 (perfect inequality)
• Lorenz Curve: Visual representation of income distribution

HDI (Human Development Index):
• Health (life expectancy)
• Education (literacy, school enrollment)
• Standard of living (income per capita)

═══════════════════════════════════════════════════════

🌐 INTERNATIONAL TRADE

═══════════════════════════════════════════════════════

TRADE CONCEPTS:
• Absolute Advantage: Lower cost of production
• Comparative Advantage: Lower opportunity cost
• Terms of Trade: Export price / Import price

PROTECTIONISM vs FREE TRADE:
• Tariffs: Taxes on imports
• Quotas: Quantity limits on imports
• Subsidies: Government support to domestic producers
• Free Trade: No restrictions (benefits consumers)

BALANCE OF PAYMENTS:
Current Account + Capital Account = Overall Balance

• Current Account: Trade in goods, services, income
• Capital Account: Capital transfers, investments`
    };

    return cheatSheets[categoryId] || "📝 Cheat sheet coming soon for this subject! Aiva is working on it.";
  };

  const generatePracticeAssessment = (categoryId: string) => {
    const assessments: Record<string, string> = {
      "ethical-hacking": `🔒 ETHICAL HACKING PRACTICE ASSESSMENT v2.0

═══════════════════════════════════════════════════════
SECTION 1: MULTIPLE CHOICE QUESTIONS
═══════════════════════════════════════════════════════

1. What is the FIRST step in the incident response framework?
   a) Containment
   b) Detection & Identification ✓
   c) Eradication
   d) Recovery

2. Which Nmap command performs a stealth scan using SYN flags?
   a) nmap -sT
   b) nmap -sS ✓
   c) nmap -sU
   d) nmap -sF

3. What type of attack exploits the trust relationship between
   two systems?
   a) SQL Injection
   b) Cross-Site Scripting
   c) Man-in-the-Middle (MITM) ✓
   d) Brute Force

4. Which protocol does FTP use for data transfer?
   a) TCP Port 21
   b) TCP Port 20 ✓
   c) UDP Port 21
   d) UDP Port 20

5. What is the main purpose of a DMZ in network security?
   a) Store sensitive data
   b) Isolate internal networks from public traffic ✓
   c) Speed up network performance
   d) Host email servers

═══════════════════════════════════════════════════════
SECTION 2: TRUE OR FALSE
═══════════════════════════════════════════════════════

1. T / F: A vulnerability scan can exploit weaknesses it finds.

2. T / F: Social engineering attacks target human psychology,
   not technical vulnerabilities. ✓

3. T / F: SIEM systems collect and analyze security events
   from multiple sources. ✓

4. T / F: A zero-day vulnerability has a patch available.

5. T / F: Network segmentation reduces the blast radius of
   a security breach. ✓

═══════════════════════════════════════════════════════
SECTION 3: MATCH THE ATTACK TYPE
═══════════════════════════════════════════════════════

Column A                    Column B
─────────────────────────────────────────────
1. Phishing              A. Exploits web app input fields
2. SQL Injection         B. Deceptive emails to steal data
3. DDoS                  C. Overwhelming systems with traffic
4. MITM                  D. Intercepting communications
5. XSS                   E. Injecting malicious scripts

ANSWERS: 1-B, 2-A, 3-C, 4-D, 5-E

═══════════════════════════════════════════════════════
SECTION 4: SCENARIO-BASED QUESTIONS
═══════════════════════════════════════════════════════

SCENARIO 1:
An employee reports they cannot access their email. Investigation
shows their credentials were used to send 500 spam emails at 3 AM.

Questions:
a) What is the immediate first step?
b) What evidence should be preserved?
c) Which team should be notified?
d) How would you prevent future compromise?

SCENARIO 2:
A web server is returning slow response times. Traffic analysis
shows 10,000 requests per second from thousands of different IPs.

a) What type of attack is this?
b) What defensive measures would you implement?
c) How would you identify the source IPs vs. botnet nodes?

═══════════════════════════════════════════════════════
SCORING GUIDE
═══════════════════════════════════════════════════════

Section 1 (MCQ): ___/25 points
Section 2 (T/F):  ___/10 points
Section 3 (Match): ___/10 points
Section 4 (Case):  ___/25 points

TOTAL:            ___/70 points

Grade Thresholds:
• 60-70: Expert Security Analyst
• 45-59: Security Practitioner
• 30-44: Security Foundations
• Below 30: Needs Review`,

      "human-resources": `👥 HUMAN RESOURCES PRACTICE ASSESSMENT v2.0

═══════════════════════════════════════════════════════
SECTION 1: MULTIPLE CHOICE QUESTIONS
═══════════════════════════════════════════════════════

1. What is the primary purpose of the onboarding process?
   a) Negotiate salary
   b) Cultural integration & role clarity ✓
   c) Performance evaluation
   d) Assign mentors only

2. Which metric BEST measures employee retention?
   a) Time to Hire
   b) Turnover Rate ✓
   c) Cost per Hire
   d) Engagement Score

3. In the employee lifecycle, what comes AFTER recruitment?
   a) Training
   b) Onboarding ✓
   c) Performance Review
   d) Offboarding

4. What does the acronym SMART stand for in goal setting?
   a) Simple, Meaningful, Achievable, Realistic, Timely
   b) Specific, Measurable, Achievable, Relevant, Time-bound ✓
   c) Strategic, Milestone-based, Aligned, Result-driven, Tracked
   d) Structured, Monitored, Assessed, Reviewed, Timed

5. Which law requires employers to track employee hours for
   overtime pay?
   a) ADA
   b) FMLA
   c) FLSA ✓
   d) OSHA

═══════════════════════════════════════════════════════
SECTION 2: CALCULATIONS
═══════════════════════════════════════════════════════

SCENARIO: ABC Corp has 150 employees. 12 employees left
during the past year. 3 additional employees left mid-year
but were replaced.

Calculate:
a) Turnover Rate = (Employees Left ÷ Average Headcount) × 100
b) If total recruitment costs were $48,000, what is Cost Per Hire?
c) If the average time to fill a position is 30 days, and there
   were 8 open positions, calculate total vacancy days.

ANSWERS:
a) Turnover Rate = (12 ÷ 150) × 100 = 8%
b) Cost Per Hire = $48,000 ÷ 8 hires = $6,000
c) Total Vacancy Days = 30 days × 8 positions = 240 days

═══════════════════════════════════════════════════════
SECTION 3: SCENARIO ANALYSIS
═══════════════════════════════════════════════════════

SCENARIO 1:
An employee has been underperforming for 3 months. Their
manager has not provided any feedback yet.

Questions:
a) What is the first step the HR partner should take?
b) Which feedback framework would you recommend?
c) What documentation is needed?
d) If performance doesn't improve, what are the options?

SCENARIO 2:
Two employees have filed complaints about workplace harassment.
Both accused the same team lead.

Questions:
a) What immediate action should HR take?
b) Who should be involved in the investigation?
c) How should confidentiality be maintained?
d) What are the potential outcomes?

═══════════════════════════════════════════════════════
SECTION 4: MATCH THE HR TERM
═══════════════════════════════════════════════════════

Column A                    Column B
─────────────────────────────────────────────────────
1. Attrition              A. Formal complaint process
2. Redeployment           B. Moving employees to new roles
3. PIP                    C. Unexpected departure
4. Grievance              D. Performance improvement plan
5. Reskilling             E. Training for new skills

ANSWERS: 1-C, 2-B, 3-D, 4-A, 5-E

═══════════════════════════════════════════════════════
SCORING GUIDE
═══════════════════════════════════════════════════════

Section 1 (MCQ):      ___/25 points
Section 2 (Calculations): ___/25 points
Section 3 (Scenarios): ___/25 points
Section 4 (Matching):  ___/10 points

TOTAL:               ___/85 points

Grade Thresholds:
• 75-85: Expert HR Business Partner
• 60-74: Senior HR Practitioner
• 45-59: HR Foundations
• Below 45: Needs Review`,

      "dsa": `💻 DATA STRUCTURES & ALGORITHMS PRACTICE ASSESSMENT v2.0

═══════════════════════════════════════════════════════
SECTION 1: MULTIPLE CHOICE QUESTIONS
═══════════════════════════════════════════════════════

1. What is the time complexity of accessing an element in an
   array by index?
   a) O(n)
   b) O(log n)
   c) O(1) ✓
   d) O(n²)

2. Which data structure uses the LIFO (Last In First Out) principle?
   a) Queue
   b) Stack ✓
   c) Array
   d) Linked List

3. What is the worst-case time complexity of QuickSort?
   a) O(n log n)
   b) O(n²) ✓
   c) O(n)
   d) O(log n)

4. In a Binary Search Tree, what is the time complexity of
   searching for an element (average case)?
   a) O(1)
   b) O(n)
   c) O(log n) ✓
   d) O(n log n)

5. Which sorting algorithm is NOT stable?
   a) Merge Sort
   b) Quick Sort ✓
   c) Insertion Sort
   d) Bubble Sort

6. What data structure is used in BFS (Breadth-First Search)?
   a) Stack
   b) Queue ✓
   c) Array
   d) Heap

7. Which of the following has O(log n) time complexity?
   a) Linear Search
   b) Binary Search ✓
   c) Bubble Sort
   d) Selection Sort

8. What is the space complexity of Merge Sort?
   a) O(1)
   b) O(log n)
   c) O(n) ✓
   d) O(n²)

═══════════════════════════════════════════════════════
SECTION 2: TRACE THE ALGORITHM
═══════════════════════════════════════════════════════

Question 1: Binary Search Trace
Array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
Target: 23

Step through binary search and find:
a) First mid index and value
b) Which half do we search next?
c) Final index of target

ANSWER:
a) mid = 4 (0-indexed), value = 16
b) Right half (23 > 16)
c) Index 5

───────────────────────────────────────────────────────

Question 2: Bubble Sort Trace
Array: [64, 34, 25, 12, 22, 11, 90]

Show the array after:
a) Pass 1
b) Pass 2
c) Is the array sorted after Pass 2?

ANSWER:
a) [34, 25, 12, 22, 11, 64, 90]
b) [25, 12, 22, 11, 34, 64, 90]
c) No - two more passes needed

═══════════════════════════════════════════════════════
SECTION 3: CODING CONCEPTS (Mental)
═══════════════════════════════════════════════════════

Question 1: Identify the Pattern
What algorithm pattern is this?

function findPair(nums, target):
    seen = {}
    for num in nums:
        complement = target - num
        if complement in seen:
            return [seen[complement], num]
        seen[num] = num
    return []

Answer: Two Sum Pattern (Hash Map)

───────────────────────────────────────────────────────

Question 2: Recurrence Relation
What is the time complexity of this recursive function?

function fib(n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)

a) O(n)
b) O(n²)
c) O(2ⁿ) ✓
d) O(n!)

How would you optimize it?

Answer: Use memoization or dynamic programming → O(n)

═══════════════════════════════════════════════════════
SECTION 4: COMPLEXITY ANALYSIS
═══════════════════════════════════════════════════════

Question 1: For each code snippet, give time & space complexity:

a) for i in range(n):
       for j in range(n):
           print(i, j)
   Answer: Time O(n²), Space O(1)

b) i = n
   while i > 0:
       i = i // 2
   Answer: Time O(log n), Space O(1)

c) def recurse(n):
       if n <= 0: return
       print(n)
       recurse(n-1)
   Answer: Time O(n), Space O(n) [call stack]

═══════════════════════════════════════════════════════
SCORING GUIDE
═══════════════════════════════════════════════════════

Section 1 (MCQ):      ___/40 points (5 pts each)
Section 2 (Trace):    ___/20 points
Section 3 (Concepts):  ___/15 points
Section 4 (Analysis): ___/15 points

TOTAL:               ___/90 points

Grade Thresholds:
• 80-90: Expert Software Engineer
• 65-79: Senior Developer
• 50-64: Mid-Level Developer
• 35-49: Junior Developer
• Below 35: Needs Foundation Review`,

      "physics": `⚛️ PHYSICS PRACTICE ASSESSMENT v2.0

═══════════════════════════════════════════════════════
SECTION 1: MULTIPLE CHOICE QUESTIONS
═══════════════════════════════════════════════════════

1. Which law states that energy cannot be created or destroyed?
   a) Zeroth Law
   b) First Law of Thermodynamics ✓
   c) Second Law
   d) Third Law

2. What happens to entropy in an isolated system?
   a) Always decreases
   b) Remains constant
   c) Always increases ✓
   d) Fluctuates randomly

3. What is the SI unit of force?
   a) Joule
   b) Newton ✓
   c) Watt
   d) Pascal

4. In the equation F = ma, what does 'm' represent?
   a) Momentum
   b) Mass ✓
   c) Velocity
   d) Acceleration

5. Which color of light has the longest wavelength?
   a) Blue
   b) Green
   c) Yellow
   d) Red ✓

6. What is the specific heat capacity of water (approx)?
   a) 1 J/kg·K
   b) 4.18 J/kg·K ✓
   c) 10 J/kg·K
   d) 100 J/kg·K

7. What type of lens is used to correct myopia (nearsightedness)?
   a) Convex
   b) Concave ✓
   c) Plano
   d) Cylindrical

8. What is the speed of light in vacuum (approx)?
   a) 3 × 10⁶ m/s
   b) 3 × 10⁷ m/s
   c) 3 × 10⁸ m/s ✓
   d) 3 × 10⁹ m/s

═══════════════════════════════════════════════════════
SECTION 2: CALCULATIONS
═══════════════════════════════════════════════════════

Question 1: Kinematics
A car accelerates from rest at 2 m/s². Calculate:
a) Velocity after 10 seconds
b) Distance traveled in 10 seconds

Given: u = 0, a = 2 m/s², t = 10 s

Answers:
a) v = u + at = 0 + (2)(10) = 20 m/s
b) s = ut + ½at² = 0 + ½(2)(100) = 100 m

───────────────────────────────────────────────────────

Question 2: Heat Transfer
How much heat is needed to raise 500g of water from 20°C to 70°C?
(Specific heat of water = 4.18 J/g·K)

Given: m = 500g, c = 4.18 J/g·K, ΔT = 50°C

Answer:
Q = mcΔT = (500)(4.18)(50) = 104,500 J = 104.5 kJ

───────────────────────────────────────────────────────

Question 3: Ohm's Law
A circuit has 12V battery and 4Ω resistor. Calculate:
a) Current flowing
b) Power dissipated

Answers:
a) I = V/R = 12/4 = 3A
b) P = IV = (3)(12) = 36W

═══════════════════════════════════════════════════════
SECTION 3: CONCEPTUAL QUESTIONS
═══════════════════════════════════════════════════════

Question 1: Explain with example
"Why does a metal spoon feel colder than a wooden spoon
at the same temperature?"

Answer: Thermal conductivity difference. Metal conducts heat
faster from your hand, making it feel colder despite being
at the same temperature.

───────────────────────────────────────────────────────

Question 2: Laws of Thermodynamics
For each scenario, identify which law applies:

a) Heat flows from hot coffee to cold milk when mixed
   → Second Law (heat flows spontaneously hot→cold)

b) A perpetual motion machine is impossible
   → First Law (energy conservation)

c) Absolute zero cannot be reached
   → Third Law

d) Your body warms up cold hands
   → First Law (energy transfer)

═══════════════════════════════════════════════════════
SECTION 4: WAVES & OPTICS
═══════════════════════════════════════════════════════

Question 1: Refraction Problem
Light travels from air (n=1) into water (n=1.33) at 45°.
Calculate the angle of refraction.

Using Snell's Law: n₁ sin(θ₁) = n₂ sin(θ₂)
(1)(sin 45°) = (1.33)(sin θ₂)
sin θ₂ = 0.707 / 1.33 = 0.532
θ₂ = 32.1°

───────────────────────────────────────────────────────

Question 2: Wave Equation
A wave has frequency 256 Hz and wavelength 1.29 m.
What is the wave speed?

Answer: v = fλ = (256)(1.29) = 330.24 m/s

═══════════════════════════════════════════════════════
SCORING GUIDE
═══════════════════════════════════════════════════════

Section 1 (MCQ):      ___/40 points (5 pts each)
Section 2 (Calculations): ___/30 points (10 pts each)
Section 3 (Conceptual): ___/20 points
Section 4 (Waves/Optics): ___/20 points

TOTAL:               ___/110 points

Grade Thresholds:
• 95-110: Expert Physicist
• 80-94: Advanced Physics
• 60-79: Intermediate Physics
• 40-59: Introductory Physics
• Below 40: Foundation Review Needed`,

      "chemistry": `🧪 CHEMISTRY PRACTICE ASSESSMENT v2.0

═══════════════════════════════════════════════════════
SECTION 1: MULTIPLE CHOICE QUESTIONS
═══════════════════════════════════════════════════════

1. What is the pH of a 0.001 M HCl solution?
   a) 1
   b) 2
   c) 3 ✓
   d) 4

2. Which of the following is a STRONG acid?
   a) CH₃COOH (acetic acid)
   b) HCl ✓
   c) NH₄OH (ammonium hydroxide)
   d) H₂CO₃ (carbonic acid)

3. What is the oxidation number of oxygen in most compounds?
   a) +1
   b) -1
   c) -2 ✓
   d) 0

4. How many moles are in 36 grams of water (H₂O)?
   Molar mass of H₂O = 18 g/mol
   a) 1 mol ✓
   b) 2 mol
   c) 0.5 mol
   d) 18 mol

5. Which gas law states P₁V₁ = P₂V₂ at constant temperature?
   a) Charles's Law
   b) Boyle's Law ✓
   c) Avogadro's Law
   d) Gay-Lussac's Law

6. In a redox reaction, what happens at the anode?
   a) Reduction
   b) Oxidation ✓
   c) No change
   d) Formation of metal deposits

7. What type of bond forms between Na and Cl in NaCl?
   a) Covalent
   b) Ionic ✓
   c) Metallic
   d) Hydrogen

8. What is the electron configuration of Neon (atomic #10)?
   a) 1s² 2s² 2p⁶
   b) 1s² 2s² 2p⁶ ✓
   c) 1s² 2s² 2p⁴
   d) 1s² 2s² 2p⁶ 3s²

═══════════════════════════════════════════════════════
SECTION 2: pH & CALCULATIONS
═══════════════════════════════════════════════════════

Question 1: pH Calculations

a) If [H⁺] = 1 × 10⁻⁴ M, calculate pH
   Answer: pH = -log(10⁻⁴) = 4

b) If pH = 9.3, calculate [H⁺]
   Answer: [H⁺] = 10⁻⁹·³ = 5.01 × 10⁻¹⁰ M

c) Is this solution acidic or basic?
   Answer: Basic (pH > 7)

───────────────────────────────────────────────────────

Question 2: Molarity Calculation

Calculate the molarity of a solution made by dissolving
5.85 g of NaCl in 500 mL of water.
(Molar mass of NaCl = 58.5 g/mol)

Steps:
1. Calculate moles: 5.85 g ÷ 58.5 g/mol = 0.1 mol
2. Convert volume: 500 mL = 0.5 L
3. Calculate molarity: 0.1 mol ÷ 0.5 L = 0.2 M

Answer: 0.2 M

═══════════════════════════════════════════════════════
SECTION 3: BALANCING & REACTIONS
═══════════════════════════════════════════════════════

Question 1: Balance the equation
___ Fe + ___ O₂ → ___ Fe₂O₃

Answer: 4 Fe + 3 O₂ → 2 Fe₂O₃

───────────────────────────────────────────────────────

Question 2: Identify the reaction type

a) 2H₂ + O₂ → 2H₂O
   Answer: Combination (synthesis)

b) 2KMnO₄ → K₂MnO₄ + MnO₂ + O₂
   Answer: Decomposition

c) Zn + CuSO₄ → ZnSO₄ + Cu
   Answer: Single displacement

d) HCl + NaOH → NaCl + H₂O
   Answer: Double displacement (neutralization)

═══════════════════════════════════════════════════════
SECTION 4: ORGANIC CHEMISTRY
═══════════════════════════════════════════════════════

Question 1: Functional Groups

Identify the functional group in each compound:

a) CH₃-CH₂-OH (ethanol)
   Answer: Alcohol (-OH)

b) CH₃-CO-CH₃ (acetone)
   Answer: Ketone (C=O)

c) CH₃-CHO (acetaldehyde)
   Answer: Aldehyde (-CHO)

d) CH₃-COOH (acetic acid)
   Answer: Carboxylic acid (-COOH)

───────────────────────────────────────────────────────

Question 2: Naming

What is the IUPAC name of:
CH₃-CH₂-CH₂-CH₃ (a 4-carbon straight chain alkane)

Answer: Butane

CH₃-CH=CH-CH₃ (a 4-carbon alkene with double bond)

Answer: But-2-ene (or 2-butene)

═══════════════════════════════════════════════════════
SCORING GUIDE
═══════════════════════════════════════════════════════

Section 1 (MCQ):          ___/40 points (5 pts each)
Section 2 (Calculations): ___/30 points
Section 3 (Reactions):    ___/20 points
Section 4 (Organic):      ___/20 points

TOTAL:                   ___/110 points

Grade Thresholds:
• 95-110: Expert Chemist
• 80-94: Advanced Chemistry
• 60-79: Intermediate Chemistry
• 40-59: Introductory Chemistry
• Below 40: Foundation Review Needed`,

      "dbms": `🗃️ DATABASE MANAGEMENT PRACTICE ASSESSMENT v2.0

═══════════════════════════════════════════════════════
SECTION 1: MULTIPLE CHOICE QUESTIONS
═══════════════════════════════════════════════════════

1. Which normal form eliminates partial dependencies?
   a) 1NF
   b) 2NF ✓
   c) 3NF
   d) BCNF

2. What does SQL stand for?
   a) Simple Query Language
   b) Structured Query Language ✓
   c) Standard Query Logic
   d) System Query Language

3. Which JOIN returns only matching rows from both tables?
   a) LEFT JOIN
   b) RIGHT JOIN
   c) INNER JOIN ✓
   d) FULL OUTER JOIN

4. What is the primary purpose of an index in a database?
   a) Store data
   b) Speed up queries ✓
   c) Enforce relationships
   d) Delete records

5. In a transaction, what does ACID property ensure?
   a) Data size
   b) Query speed
   c) Data integrity ✓
   d) User permissions

6. Which command is used to remove all rows from a table
   while keeping the structure?
   a) DELETE
   b) DROP
   c) TRUNCATE ✓
   d) REMOVE

7. What type of key references a primary key in another table?
   a) Primary Key
   b) Candidate Key
   c) Foreign Key ✓
   d) Alternate Key

8. Which isolation level prevents dirty reads?
   a) READ UNCOMMITTED
   b) READ COMMITTED ✓
   c) REPEATABLE READ
   d) SERIALIZABLE

═══════════════════════════════════════════════════════
SECTION 2: SQL QUERY WRITING
═══════════════════════════════════════════════════════

Given Tables:

EMPLOYEES
┌────┬────────┬────────┬────────────┐
│ ID │ Name   │ Dept   │ Salary    │
├────┼────────┼────────┼────────────┤
│ 1  │ Alice  │ IT     │ 75,000    │
│ 2  │ Bob    │ HR     │ 65,000    │
│ 3  │ Carol  │ IT     │ 80,000    │
│ 4  │ Dave   │ Sales  │ 60,000    │
└────┴────────┴────────┴────────────┘

DEPARTMENTS
┌──────┬──────────┐
│ Dept │ Manager  │
├──────┼──────────┤
│ IT   │ Carol    │
│ HR   │ Bob      │
│ Sales│ Dave     │
└──────┴──────────┘

Write SQL for:

1. Find all employees in IT department with salary > 70,000
   SELECT * FROM employees
   WHERE Dept = 'IT' AND Salary > 70000;
   Answer: Alice, Carol

2. Find total salary by department
   SELECT Dept, SUM(Salary) as Total
   FROM employees
   GROUP BY Dept;

3. Find employees earning above average
   SELECT * FROM employees
   WHERE Salary > (SELECT AVG(Salary) FROM employees);
   Answer: Carol (80,000)

═══════════════════════════════════════════════════════
SECTION 3: NORMALIZATION
═══════════════════════════════════════════════════════

Question 1: Identify the Problem

Table: ORDERS
┌──────┬──────────┬────────────┬────────────┐
│Order#│ Customer │ Product    │ CustomerAddr│
├──────┼──────────┼────────────┼────────────┤
│ 101  │ John     │ Laptop     │ 123 Main   │
│ 102  │ Mary     │ Mouse      │ 456 Oak    │
│ 103  │ John     │ Keyboard   │ 123 Main   │
└──────┴──────────┴────────────┴────────────┘

Problems:
a) Data redundancy (John's address repeated)
b) Update anomaly (if John moves, must update multiple rows)
c) Insert anomaly (can't add customer without order)
d) Delete anomaly (deleting order deletes customer)

───────────────────────────────────────────────────────

Question 2: Normalize to 3NF

The unnormalized table has:
• Order# (primary key)
• Customer Name
• Customer Address
• Product Name
• Product Price
• Order Quantity

Which normal form is violated?
• 1NF: ✓ (atomic values needed - OK)
• 2NF: ✗ (partial dependency - Customer Name depends on
        Customer Address which doesn't depend on Order#)
• 3NF: ✗ (transitive dependency possible)

Proposed 3NF decomposition:
ORDERS (Order#, CustomerID FK, ProductID FK, Quantity)
CUSTOMERS (CustomerID PK, Name, Address)
PRODUCTS (ProductID PK, Name, Price)

═══════════════════════════════════════════════════════
SECTION 4: TRANSACTION SCENARIOS
═══════════════════════════════════════════════════════

Scenario: Bank Transfer
Account A: $1000 → Account B: $500

Question 1: What can go wrong without transaction management?
a) If debit succeeds but credit fails, A loses $500
b) If both succeed but system crashes mid-write, unknown state
c) If concurrent transfers happen, balance might be incorrect

───────────────────────────────────────────────────────

Question 2: How would you ensure ACID properties?

BEGIN TRANSACTION;
  UPDATE accounts SET balance = balance - 500 WHERE id = 'A';
  UPDATE accounts SET balance = balance + 500 WHERE id = 'B';
  IF error THEN ROLLBACK;
  ELSE COMMIT;
END TRANSACTION;

Atomicity: All or nothing (rollback on error)
Consistency: Check constraints, triggers enforced
Isolation: Lock rows during transaction
Durability: Commit writes to disk before returning

═══════════════════════════════════════════════════════
SCORING GUIDE
═══════════════════════════════════════════════════════

Section 1 (MCQ):          ___/40 points (5 pts each)
Section 2 (SQL Queries):   ___/30 points (10 pts each)
Section 3 (Normalization): ___/20 points
Section 4 (Transactions): ___/20 points

TOTAL:                   ___/110 points

Grade Thresholds:
• 95-110: Expert Database Administrator
• 80-94: Senior Database Developer
• 60-79: Mid-Level Database Developer
• 40-59: Junior Database Developer
• Below 40: Foundation Review Needed`,

      "financial-accounting": `💰 FINANCIAL ACCOUNTING PRACTICE ASSESSMENT v2.0

═══════════════════════════════════════════════════════
SECTION 1: MULTIPLE CHOICE QUESTIONS
═══════════════════════════════════════════════════════

1. What is the formula for Present Value?
   a) FV × (1 + r)ⁿ
   b) FV ÷ (1 + r)ⁿ ✓
   c) FV + r × n
   d) FV - r × n

2. A Current Ratio of 1.5 indicates:
   a) Liquidity issues
   b) Good liquidity ✓
   c) Excessive liquidity
   d) Insolvency

3. Which financial statement shows a company's performance
   over a period of time?
   a) Balance Sheet
   b) Income Statement ✓
   c) Cash Flow Statement
   d) Statement of Equity

4. In double-entry bookkeeping, what increases with a Debit?
   a) Liabilities
   b) Revenue
   c) Expenses ✓
   d) Equity

5. What does ROE stand for?
   a) Return on Equity ✓
   b) Rate of Earnings
   c) Revenue over Expenses
   d) Return on Exchange

6. Which accounting principle states that expenses should be
   matched to revenues they help generate?
   a) Revenue Recognition
   b) Matching Principle ✓
   c) Cost Principle
   d) Materiality

7. What is the accounting equation?
   a) Assets = Liabilities - Equity
   b) Assets = Liabilities + Equity ✓
   c) Assets + Liabilities = Equity
   d) Assets - Liabilities = Equity

8. If a company has $100,000 in current assets and $50,000
   in current liabilities, what is the working capital?
   a) $50,000 ✓
   b) $150,000
   c) $2
   d) $0

═══════════════════════════════════════════════════════
SECTION 2: CALCULATIONS
═══════════════════════════════════════════════════════

Question 1: Time Value of Money

If you invest $5,000 at 8% annual interest, compounded annually,
what will be the Future Value after 3 years?

Formula: FV = PV × (1 + r)ⁿ
FV = 5,000 × (1.08)³
FV = 5,000 × 1.2597
FV = $6,298.56

───────────────────────────────────────────────────────

Question 2: Ratio Analysis

Given:
Current Assets: $200,000
Current Liabilities: $125,000
Inventory: $50,000
Net Income: $80,000
Total Assets: $500,000
Total Equity: $300,000

Calculate:
a) Current Ratio = 200,000 / 125,000 = 1.6
b) Quick Ratio = (200,000 - 50,000) / 125,000 = 1.2
c) ROA = 80,000 / 500,000 = 16%
d) ROE = 80,000 / 300,000 = 26.67%

───────────────────────────────────────────────────────

Question 3: Depreciation (Straight-Line)

A machine costs $50,000 with a salvage value of $5,000
and useful life of 5 years.

Calculate annual depreciation:
Depreciation = (Cost - Salvage) / Useful Life
Depreciation = (50,000 - 5,000) / 5
Depreciation = $9,000 per year

═══════════════════════════════════════════════════════
SECTION 3: JOURNAL ENTRIES
═══════════════════════════════════════════════════════

Record the following transactions using debits and credits:

1. Purchased equipment for $20,000 cash

   Debit: Equipment $20,000
   Credit: Cash $20,000

2. Collected $5,000 from customers on account

   Debit: Cash $5,000
   Credit: Accounts Receivable $5,000

3. Paid rent expense of $2,000

   Debit: Rent Expense $2,000
   Credit: Cash $2,000

4. Recorded revenue of $10,000, received $7,000 in cash,
   $3,000 on account

   Debit: Cash $7,000
   Debit: Accounts Receivable $3,000
   Credit: Service Revenue $10,000

═══════════════════════════════════════════════════════
SECTION 4: FINANCIAL STATEMENT ANALYSIS
═══════════════════════════════════════════════════════

Given Income Statement:
Revenue: $500,000
Cost of Goods Sold: $300,000
Operating Expenses: $100,000
Interest Expense: $20,000
Tax Rate: 25%

Calculate:
a) Gross Profit = Revenue - COGS = $200,000
b) Operating Income (EBIT) = GP - Operating Exp = $100,000
c) Net Income before Tax = EBIT - Interest = $80,000
d) Tax Expense = $80,000 × 0.25 = $20,000
e) Net Income = $80,000 - $20,000 = $60,000

Margin Analysis:
f) Gross Margin = 200,000 / 500,000 = 40%
g) Net Profit Margin = 60,000 / 500,000 = 12%

═══════════════════════════════════════════════════════
SCORING GUIDE
═══════════════════════════════════════════════════════

Section 1 (MCQ):          ___/40 points (5 pts each)
Section 2 (Calculations):  ___/30 points (10 pts each)
Section 3 (Journal Entries):___/20 points (5 pts each)
Section 4 (Statements):    ___/20 points

TOTAL:                    ___/110 points

Grade Thresholds:
• 95-110: Expert Financial Analyst
• 80-94: Senior Accountant
• 60-79: Intermediate Accountant
• 40-59: Basic Accounting Knowledge
• Below 40: Foundation Review Needed`,

      "economics": `📈 ECONOMICS PRACTICE ASSESSMENT v2.0

═══════════════════════════════════════════════════════
SECTION 1: MULTIPLE CHOICE QUESTIONS
═══════════════════════════════════════════════════════

1. According to the Law of Demand, when price increases:
   a) Quantity demanded increases
   b) Quantity demanded decreases ✓
   c) Demand increases
   d) Supply decreases

2. Market equilibrium occurs when:
   a) Supply exceeds demand
   b) Demand exceeds supply
   c) Quantity demanded equals quantity supplied ✓
   d) Price is at its highest

3. GDP calculated using C + I + G + (X-M) represents which method?
   a) Income approach
   b) Production approach
   c) Expenditure approach ✓
   d) Value-added approach

4. Inflation caused by "too much money chasing too few goods" is:
   a) Cost-push inflation
   b) Demand-pull inflation ✓
   c) Stagflation
   d) Hyperinflation

5. Which type of unemployment occurs due to technological changes?
   a) Frictional unemployment
   b) Seasonal unemployment
   c) Structural unemployment ✓
   d) Cyclical unemployment

6. The Cash Reserve Ratio (CRR) is a tool of:
   a) Fiscal policy
   b) Monetary policy ✓
   c) Trade policy
   d) Income policy

7. Gini Coefficient measures:
   a) Economic growth
   b) Inflation
   c) Income inequality ✓
   d) Unemployment

8. A country has Absolute Advantage when:
   a) It can produce a good at lower opportunity cost
   b) It can produce a good using fewer resources ✓
   c) It has more natural resources
   d) It has better technology

═══════════════════════════════════════════════════════
SECTION 2: CALCULATIONS
═══════════════════════════════════════════════════════

Question 1: Price Elasticity of Demand
If price increases from $10 to $12, and quantity demanded
decreases from 100 to 80 units, calculate PED.

Formula: PED = (% Change in Qd) / (% Change in P)

% Change in Qd = (80-100)/100 × 100 = -20%
% Change in P = (12-10)/10 × 100 = 20%

PED = -20% / 20% = -1

Interpretation: Unit elastic (|PED| = 1)

───────────────────────────────────────────────────────

Question 2: GDP Calculation
Given: C = $500B, I = $150B, G = $200B, X = $100B, M = $80B
Calculate GDP using expenditure approach.

GDP = C + I + G + (X - M)
GDP = 500 + 150 + 200 + (100 - 80)
GDP = 500 + 150 + 200 + 20
GDP = $870 billion

───────────────────────────────────────────────────────

Question 3: Inflation Rate
If nominal GDP = $1,200B and real GDP = $1,000B,
calculate the inflation rate (GDP deflator).

GDP Deflator = (Nominal GDP / Real GDP) × 100
GDP Deflator = (1200 / 1000) × 100 = 120

Inflation Rate = (120 - 100) = 20%

═══════════════════════════════════════════════════════
SECTION 3: MATCHING
═══════════════════════════════════════════════════════

Column A                    Column B
─────────────────────────────────────────────────────
1. CPI                   A. Government borrowing
2. Repo Rate             B. Price of one currency in another
3. Deflation             C. General price level decrease
4. Exchange Rate         D. Consumer goods basket cost
5. Budget Deficit        E. Rate RBI lends to banks

ANSWERS: 1-D, 2-E, 3-C, 4-B, 5-A

═══════════════════════════════════════════════════════
SECTION 4: CONCEPTUAL QUESTIONS
═══════════════════════════════════════════════════════

Question 1: Fiscal vs Monetary Policy
Explain the difference between fiscal and monetary policy.
What are their respective tools?

Answer:
FISCAL POLICY (Government):
• Direct control over spending and taxation
• Tools: Government expenditure, taxes, deficits
• Implemented by government

MONETARY POLICY (Central Bank):
• Control over money supply and interest rates
• Tools: Repo rate, CRR, SLR, OMO
• Implemented by central bank (RBI)

───────────────────────────────────────────────────────

Question 2: Inflation Effects
Who are the winners and losers during inflation?

WINNERS (受益者):
• Borrowers (repaying debt with cheaper money)
• Asset owners (property, stocks appreciate)
• Debtors

LOSERS (受害者):
• Fixed-income earners (pensioners, salaried)
• Savers (real value of savings decreases)
• Lenders (receiving repaid debt with less value)
• Creditors

═══════════════════════════════════════════════════════
SCORING GUIDE
═══════════════════════════════════════════════════════

Section 1 (MCQ):          ___/40 points (5 pts each)
Section 2 (Calculations):  ___/30 points (10 pts each)
Section 3 (Matching):      ___/10 points (2 pts each)
Section 4 (Conceptual):    ___/20 points (10 pts each)

TOTAL:                    ___/100 points

Grade Thresholds:
• 85-100: Expert Economist
• 70-84: Advanced Economics
• 55-69: Intermediate Economics
• 40-54: Introductory Economics
• Below 40: Foundation Review Needed`
    };

    return assessments[categoryId] || "📝 Practice assessment coming soon for this subject!";
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
      type: "quiz",
      questions: "10 Questions",
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
                        onClick={() => setActiveFilter(f.key)}
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
                    onClick={() => {
                      setSelectedTopics([]);
                      setAppliedFilters([]);
                      setSelectedCategory(cat.id);
                    }}
                    className="w-full text-left group relative"
                  >
                    {/* Professional Coming Soon Ribbon */}
                    {cat.status === "coming-soon" && (
                      <div className="absolute -top-1 -right-1 z-20">
                        <div className="relative">
                          {/* Ribbon body */}
                          <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white text-[9px] font-bold uppercase tracking-wider px-4 py-1.5 shadow-lg shadow-orange-500/30">
                            {/* Animated pulse dot */}
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                            </span>
                            Coming Soon
                          </div>
                          {/* Ribbon tail */}
                          <div className="absolute -bottom-2 left-0 w-0 h-0 border-l-[10px] border-l-amber-500 border-b-[8px] border-b-transparent"></div>
                        </div>
                      </div>
                    )}

                    <div
                      className={`relative overflow-hidden rounded-[3.5rem] px-6 sm:px-10 py-8 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border transition-all duration-500 ${
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

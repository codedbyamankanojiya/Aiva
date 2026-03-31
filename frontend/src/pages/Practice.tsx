import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/common/GlassCard";
import { AnimatedButton } from "@/components/common/AnimatedButton";
import { InteractiveCard } from "@/components/common/InteractiveCard";
import { TagBadge } from "@/components/common/TagBadge";
import { Input } from "@/components/common/Input";
import { useInterview } from "@/context/InterviewContext";
import { Search, Briefcase, Users, TrendingUp, Star, Clock, ArrowRight, Sparkles } from "lucide-react";

/* ── Data ────────────────────────────────────────────────── */
interface Role {
  id: string;
  title: string;
  description: string;
  tags: string[];
}

const categories = [
  {
    id: "interview",
    label: "Job Interview Preparation",
    sub: "Role-based mock interviews and domain-specific drills",
    icon: Briefcase,
    color: "from-blue-500 to-indigo-600"
  },
  {
    id: "viva",
    label: "Viva & Communication",
    sub: "Behavioral, communication, leadership, and productivity coaching",
    icon: Users,
    color: "from-purple-500 to-pink-600"
  },
];

/* ── Role card component ─────────────────────────────────── */
function RoleCard({ role }: { role: Role }) {
  const navigate = useNavigate();
  const { setRole, setRoleId } = useInterview();

  const handleStart = () => {
    setRole(role.title);
    setRoleId(role.id);
    
    // Generate random section code
    const sectionCode = generateSectionCode();
    
    // Navigate with random section code
    navigate(`/interview?section=${sectionCode}`);
  };

  return (
    <InteractiveCard hover={true} scale={true} glow={true} tilt={false}>
      <GlassCard variant="blue" className="flex flex-col justify-between h-full group">
        <div>
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-800 group-hover:text-aiva-purple transition-colors">
              {role.title}
            </h3>
            <motion.div 
              className="w-10 h-10 rounded-lg bg-aiva-purple/10 flex items-center justify-center group-hover:bg-aiva-purple/20 transition-colors"
              whileHover={{ rotate: 5 }}
            >
              <Briefcase size={18} className="text-aiva-purple" />
            </motion.div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
            {role.description}
          </p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {role.tags.slice(0, 3).map((tag) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <TagBadge label={tag} variant="purple" />
              </motion.div>
            ))}
            {role.tags.length > 3 && (
              <motion.span 
                className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                +{role.tags.length - 3} more
              </motion.span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <motion.div 
            className="flex items-center gap-2 text-xs text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Clock size={12} />
            </motion.div>
            <span>15-30 min</span>
          </motion.div>
          <AnimatedButton 
            size="sm" 
            onClick={handleStart}
            className="group-hover:bg-aiva-purple transition-colors flex items-center gap-2"
            icon={<ArrowRight size={14} />}
          >
            Start
          </AnimatedButton>
        </div>
      </GlassCard>
    </InteractiveCard>
  );
}

/* ── Random Section Code Generator ────────────────────────── */
function generateSectionCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/* ── Page ─────────────────────────────────────────────────── */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function Practice() {
  const [activeTab, setActiveTab] = useState("interview");
  const [search, setSearch] = useState("");
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        // Fetch from FastAPI backend
        const response = await fetch("http://localhost:8000/api/roles");
        const data = await response.json();
        
        if (data.roles) {
          setAllRoles(data.roles);
        } else {
          setAllRoles([]);
        }
      } catch (error) {
        console.error('Failed to fetch roles:', error);
        setAllRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  // Filter roles based on active tab
  const currentTopics = allRoles.filter((role: Role) => {
    if (activeTab === "interview") {
      // Technical roles (first 9 roles)
      const interviewRoleIds = [
        "software-engineer", "web-developer", "backend-developer", "ui-ux-designer",
        "app-developer", "devops-engineer", "data-scientist", "product-manager", "hr-recruiter"
      ];
      return interviewRoleIds.includes(role.id);
    } else {
      // Skill development roles (remaining roles)
      const vivaRoleIds = [
        "behavioral-upskilling", "presentation-skills", "communication-boost", "leadership-skills",
        "negotiation-skills", "time-management", "stress-management", "networking-skills", "critical-thinking"
      ];
      return vivaRoleIds.includes(role.id);
    }
  });

  const filtered = currentTopics.filter(
    (r: Role) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.tags.some((t: string) => t.toLowerCase().includes(search.toLowerCase())),
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <motion.div 
          className="w-12 h-12 rounded-full bg-aiva-purple/20 flex items-center justify-center"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-6 bg-aiva-purple rounded-full" />
        </motion.div>
        <motion.div 
          className="text-gray-500"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Loading amazing roles...
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >

      {/* Search */}
      <motion.div variants={fadeUp} className="max-w-md mx-auto">
        <div className="relative">
          <motion.div
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            animate={{ x: [0, 3, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Search size={18} />
          </motion.div>
          <Input
            placeholder="Search roles, skills, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 input-interactive"
          />
        </div>
      </motion.div>

      {/* Category tabs */}
      <motion.div variants={fadeUp} className="flex gap-4 overflow-x-auto justify-center">
        {categories.map((cat, index) => {
          const Icon = cat.icon;
          return (
            <InteractiveCard key={cat.id} hover={true} scale={true} glow={false} tilt={false}>
              <button
                onClick={() => setActiveTab(cat.id)}
                className={`flex-shrink-0 px-6 py-4 rounded-2xl text-sm font-medium transition-all duration-300 btn-interactive ${
                  activeTab === cat.id
                    ? `bg-gradient-to-r ${cat.color} text-white shadow-lg transform scale-105`
                    : "glass-card text-gray-600 hover:bg-white/40 cursor-pointer border border-white/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={activeTab === cat.id ? { rotate: [0, 10, -10, 0] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon size={20} />
                  </motion.div>
                  <div className="text-left">
                    <div className="font-semibold">{cat.label}</div>
                    <div className="text-xs opacity-80 mt-0.5">{cat.sub}</div>
                  </div>
                </div>
              </button>
            </InteractiveCard>
          );
        })}
      </motion.div>

      {/* Results count and filter */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <motion.h2 
          className="text-2xl font-bold text-gray-800"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {activeTab === "interview" ? "Tech Roles" : "Skill Development"}
        </motion.h2>
        <motion.div 
          className="text-sm text-gray-500"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.span
            key={filtered.length}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {filtered.length} {filtered.length === 1 ? 'role' : 'roles'} found
          </motion.span>
        </motion.div>
      </motion.div>

      {/* Role cards grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab + search}
          variants={stagger}
          initial="hidden"
          animate="show"
          exit="hidden"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filtered.map((role: Role) => (
            <motion.div key={role.id} variants={fadeUp}>
              <RoleCard role={role} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty state */}
      {filtered.length === 0 && (
        <motion.div 
          variants={fadeUp}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <InteractiveCard hover={true} scale={true} glow={true} tilt={true}>
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Search className="w-8 h-8 text-gray-400" />
              </motion.div>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No roles found</h3>
            <p className="text-gray-500">Try adjusting your search or browse different categories</p>
          </InteractiveCard>
        </motion.div>
      )}
    </motion.div>
  );
}

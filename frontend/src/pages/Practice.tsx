import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/common/GlassCard";
import { Button } from "@/components/common/Button";
import { TagBadge } from "@/components/common/TagBadge";
import { Input } from "@/components/common/Input";
import { useInterview } from "@/context/InterviewContext";

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
  },
  {
    id: "viva",
    label: "Viva / communication",
    sub: "Behavioral, communication, leadership, and productivity coaching",
  },
];

/* ── Role card component ─────────────────────────────────── */
function RoleCard({ role }: { role: Role }) {
  const navigate = useNavigate();
  const { setRole, setRoleId } = useInterview();

  const handleStart = () => {
    setRole(role.title);
    setRoleId(role.id);
    navigate("/interview");
  };

  return (
    <GlassCard variant="blue" className="flex flex-col justify-between h-full">
      <div>
        <h3 className="text-base font-bold text-gray-800 mb-2">{role.title}</h3>
        <p className="text-xs text-gray-500 leading-relaxed mb-4">
          {role.description}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {role.tags.map((tag) => (
            <TagBadge key={tag} label={tag} variant="purple" />
          ))}
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button size="sm" onClick={handleStart}>
          Start
        </Button>
      </div>
    </GlassCard>
  );
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
        const response = await fetch("http://localhost:8000/api/roles");
        const data = await response.json();
        if (data.roles) {
          setAllRoles(data.roles);
        }
      } catch (error) {
        console.error('Failed to fetch roles:', error);
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
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading roles...</div>
      </div>
    );
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Search */}
      <motion.div variants={fadeUp} className="max-w-md">
        <Input
          icon
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </motion.div>

      {/* Category tabs */}
      <motion.div variants={fadeUp} className="flex gap-3 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`flex-shrink-0 px-5 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === cat.id
                ? "bg-gradient-to-r from-aiva-purple to-aiva-indigo text-white shadow-glass"
                : "glass-card text-gray-600 hover:bg-white/30 cursor-pointer"
            }`}
          >
            <span className="font-semibold">{cat.label}</span>
            <br />
            <span className="text-[11px] opacity-80">{cat.sub}</span>
          </button>
        ))}
      </motion.div>

      {/* Section label */}
      <motion.h2 variants={fadeUp} className="text-xl font-bold text-gray-800">
        {activeTab === "interview" ? "Tech Roles" : "Skill Development"}
      </motion.h2>

      {/* Role cards grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab + search}
          variants={stagger}
          initial="hidden"
          animate="show"
          exit="hidden"
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
        >
          {filtered.map((role: Role) => (
            <motion.div key={role.id} variants={fadeUp}>
              <RoleCard role={role} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

import { useState } from "react";
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

const jobInterviewRoles: Role[] = [
  {
    id: "software-engineer",
    title: "Software Engineer (SDE)",
    description:
      "You will solve coding problems and demonstrate strong logical thinking. This section measures your problem solving and coding efficiency.",
    tags: ["DSA", "Logic", "Optimization", "Complexity", "Coding", "JavaScript"],
  },
  {
    id: "web-developer",
    title: "Web Developer",
    description:
      "Frontend/backend development, frameworks, APIs, and web technologies. Focuses on UI/UX, responsiveness, and performance.",
    tags: ["HTML/CSS", "JavaScript", "React", "Node.js"],
  },
  {
    id: "backend-developer",
    title: "Backend Developer",
    description:
      "You will work on server logic, APIs, and database handling in real scenarios. This section evaluates your ability to build secure and scalable systems.",
    tags: ["APIs", "Databases", "Security", "Performance", "Logic"],
  },
  {
    id: "ui-ux-designer",
    title: "UI/UX Designer",
    description:
      "Design principles, portfolio review, user research, and design thinking for modern product teams.",
    tags: ["Design Systems", "User Research", "Prototyping", "Visual Design"],
  },
  {
    id: "app-developer",
    title: "App Developer",
    description:
      "Mobile development, platform-specific features, and app deployment across iOS and Android platforms.",
    tags: ["React Native", "Flutter", "iOS", "Android"],
  },
  {
    id: "devops-engineer",
    title: "DevOps Engineer",
    description:
      "CI/CD pipelines, cloud infrastructure, monitoring, and automation for scalable production systems.",
    tags: ["Docker", "Kubernetes", "AWS", "CI/CD"],
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    description:
      "Machine learning, statistical analysis, data visualization, and modeling for data-driven decisions.",
    tags: ["Python", "Machine Learning", "Statistics", "Data Visualization"],
  },
  {
    id: "product-manager",
    title: "Product Manager",
    description:
      "Product strategy, user stories, roadmap planning, and stakeholder management for tech products.",
    tags: ["Strategy", "Analytics", "Communication", "Leadership"],
  },
  {
    id: "hr-recruiter",
    title: "HR / Recruiter",
    description:
      "Screening interviews, candidate evaluation, and behavioral probing with structured notes.",
    tags: ["Behavioral Questions", "Evaluation", "Communication", "Decision Making"],
  },
];

const vivaSkillTopics: Role[] = [
  {
    id: "behavioral-upskilling",
    title: "Behavioral Upskilling",
    description:
      "Improve workplace behavior, professional conduct, and interpersonal skills for better team dynamics.",
    tags: ["Team Collaboration", "Professional Etiquette", "Conflict Resolution"],
  },
  {
    id: "presentation-skills",
    title: "Presentation Skills",
    description:
      "Master public speaking, slide design, and audience engagement for impactful presentations.",
    tags: ["Confident Speaking", "Engaging Delivery", "Visual Storytelling"],
  },
  {
    id: "communication-boost",
    title: "Communication Boost",
    description:
      "Enhance verbal and non-verbal communication for professional settings and interviews.",
    tags: ["Clear Expression", "Active Listening", "Body Language"],
  },
  {
    id: "leadership-skills",
    title: "Leadership Skills",
    description:
      "Develop leadership qualities, team management, and decision-making abilities.",
    tags: ["Team Motivation", "Strategic Thinking", "Decision Making"],
  },
  {
    id: "negotiation-skills",
    title: "Negotiation Skills",
    description:
      "Learn effective negotiation techniques for business and career advancement.",
    tags: ["Win-Win Outcomes", "Persuasion", "Conflict Management"],
  },
  {
    id: "time-management",
    title: "Time Management",
    description:
      "Master productivity techniques and efficient work habits for peak performance.",
    tags: ["Prioritization", "Focus Techniques", "Work-Life Balance"],
  },
  {
    id: "stress-management",
    title: "Stress Management",
    description:
      "Develop coping strategies and maintain mental well-being under pressure.",
    tags: ["Resilience", "Mindfulness", "Work-Life Balance"],
  },
  {
    id: "networking-skills",
    title: "Networking Skills",
    description:
      "Build professional relationships and expand your network for career growth.",
    tags: ["Relationship Building", "Professional Connections", "Opportunity Creation"],
  },
  {
    id: "critical-thinking",
    title: "Critical Thinking",
    description:
      "Sharpen reasoning, assumptions checking, and decision clarity under pressure.",
    tags: ["Clear Reasoning", "Better Decisions", "Stronger Arguments"],
  },
];

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
  const { setRole } = useInterview();

  const handleStart = () => {
    setRole(role.title);
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

  const currentTopics =
    activeTab === "interview" ? jobInterviewRoles : vivaSkillTopics;

  const filtered = currentTopics.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())),
  );

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
          {filtered.map((role) => (
            <motion.div key={role.id} variants={fadeUp}>
              <RoleCard role={role} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

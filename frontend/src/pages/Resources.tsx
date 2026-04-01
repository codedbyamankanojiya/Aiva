import { motion } from "framer-motion";
import { GlassCard } from "@/components/common/GlassCard";
import {
  BookOpen, Download, Video, FileText, Headphones, Globe,
  Award, Clock, Users, Star, ChevronDown,
} from "lucide-react";
import { useState } from "react";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function Resources() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-8 pb-16"
    >
      {/* ── RESOURCES OVERVIEW ── */}
      <motion.div variants={fadeUp}>
        <GlassCard variant="blue" className="p-6 sm:p-8">
          <SectionTitle>RESOURCES OVERVIEW</SectionTitle>
          <div className="mt-4 space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>
              Welcome to the AIVA Resources Hub — your <strong>comprehensive learning center</strong> designed to support your journey toward{" "}
              <strong>interview excellence and communication mastery.</strong> This curated collection of materials provides you with everything you need to{" "}
              <strong>prepare, practice, and succeed</strong> in various professional and academic scenarios.
            </p>
            <p>
              Our resources are carefully selected and organized to help you build <strong>confidence, improve technical knowledge,</strong> and{" "}
              <strong>master communication skills</strong> essential for modern workplace success. Whether you're preparing for technical vivas, job interviews, or looking to enhance your professional presence, you'll find valuable materials here.
            </p>
          </div>
        </GlassCard>
      </motion.div>

      {/* ── LEARNING MATERIALS ── */}
      <motion.div variants={fadeUp}>
        <GlassCard variant="default" className="p-6 sm:p-8">
          <SectionTitle>LEARNING MATERIALS</SectionTitle>
          <div className="mt-4 space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>
              Access our comprehensive library of <strong>study materials, guides, and references</strong> designed to support your learning journey across various domains and skill levels.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ResourceCard icon={BookOpen} title="Interview Guides" desc="Comprehensive guides covering various interview types and preparation strategies." />
            <ResourceCard icon={FileText} title="Study Notes" desc="Organized study materials for technical and non-technical topics." />
            <ResourceCard icon={Video} title="Video Tutorials" desc="Visual learning resources covering key concepts and best practices." />
            <ResourceCard icon={Headphones} title="Audio Lessons" desc="Podcast-style lessons for improving listening and communication skills." />
          </div>
        </GlassCard>
      </motion.div>

      {/* ── PRACTICE TOOLS ── */}
      <motion.div variants={fadeUp}>
        <GlassCard variant="purple" className="p-6 sm:p-8">
          <SectionTitle>PRACTICE TOOLS</SectionTitle>
          <div className="mt-4 space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>
              Enhance your preparation with our <strong>interactive practice tools</strong> designed to simulate real-world scenarios and provide immediate feedback for continuous improvement.
            </p>
            <p>
              These tools are built to help you <strong>apply your knowledge</strong> in practical situations, identify areas for improvement, and build the confidence needed to excel in actual interviews and assessments.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatBadge icon={Clock} label="Practice Hours" value="1000+" />
            <StatBadge icon={Users} label="Active Learners" value="5K+" />
            <StatBadge icon={Award} label="Success Rate" value="92%" />
          </div>
        </GlassCard>
      </motion.div>

      {/* ── DOWNLOADABLE CONTENT ── */}
      <motion.div variants={fadeUp}>
        <GlassCard variant="default" className="p-6 sm:p-8">
          <SectionTitle>DOWNLOADABLE CONTENT</SectionTitle>
          <div className="mt-4 space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>
              Access our collection of <strong>premium downloadable resources</strong> including templates, checklists, cheat sheets, and comprehensive study materials that you can use offline.
            </p>
          </div>

          <div className="mt-6 rounded-2xl bg-gradient-to-r from-aiva-purple/5 to-aiva-indigo/5 p-5 ring-1 ring-aiva-purple/10">
            <h4 className="text-sm font-bold text-gray-800 mb-3">Available Downloads</h4>
            <ul className="space-y-2">
              {[
                "Interview preparation checklist template",
                "Resume and cover letter templates",
                "Technical viva question banks",
                "Communication skills workbook",
                "Mock interview assessment rubric",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <Download size={14} className="mt-0.5 text-aiva-purple flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </GlassCard>
      </motion.div>

      {/* ── COMMUNITY RESOURCES ── */}
      <motion.div variants={fadeUp}>
        <GlassCard variant="blue" className="p-6 sm:p-8">
          <SectionTitle>COMMUNITY RESOURCES</SectionTitle>
          <div className="mt-4 space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>
              Connect with fellow learners and access <strong>community-contributed content</strong> including shared experiences, success stories, and collaborative learning materials.
            </p>
            <p>
              Our community platform enables you to <strong>learn from peers</strong>, share your own insights, and participate in group study sessions that enhance your preparation journey.
            </p>
          </div>
        </GlassCard>
      </motion.div>

      {/* ── EXTERNAL LINKS ── */}
      <motion.div variants={fadeUp}>
        <GlassCard variant="default" className="p-6 sm:p-8">
          <SectionTitle>EXTERNAL LINKS</SectionTitle>
          <div className="mt-4 space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>
              Explore our curated list of <strong>external resources</strong> from reputable sources that complement our in-house materials and provide additional perspectives on interview preparation and skill development.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ResourceCard icon={Globe} title="Industry Blogs" desc="Latest insights from industry experts and thought leaders." />
            <ResourceCard icon={Video} title="YouTube Channels" desc="Educational channels focused on interview preparation." />
          </div>
        </GlassCard>
      </motion.div>

      {/* ── FAQ ── */}
      <motion.div variants={fadeUp}>
        <GlassCard variant="purple" className="p-6 sm:p-8">
          <SectionTitle>RESOURCES FAQ</SectionTitle>
          <div className="mt-4 space-y-2">
            {[
              { q: "How often are resources updated?", a: "We update our resources weekly to ensure you have access to the latest and most relevant materials." },
              { q: "Can I download resources for offline use?", a: "Yes! Most of our resources are available for download to support offline learning." },
              { q: "Are the resources free to access?", a: "Basic resources are free for all users. Premium content is available for pro members." },
              { q: "How do I suggest new resources?", a: "You can suggest resources through our community forum or contact form." },
              { q: "Can I contribute to the resource library?", a: "Absolutely! We welcome community contributions that meet our quality standards." },
            ].map((faq) => (
              <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

/* ── Helper components ── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-1 h-7 rounded-full bg-gradient-to-b from-aiva-purple to-aiva-indigo" />
      <h2 className="text-xl font-bold text-gray-900 tracking-tight">{children}</h2>
    </div>
  );
}

function ResourceCard({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="rounded-xl bg-white/60 backdrop-blur-sm p-4 ring-1 ring-gray-200/40 hover:ring-aiva-purple/20 transition-all group">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-aiva-purple/10 group-hover:bg-aiva-purple/15 flex items-center justify-center text-aiva-purple transition-colors flex-shrink-0">
          <Icon size={18} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-800">{title}</h4>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  );
}

function StatBadge({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/60 backdrop-blur-sm p-4 ring-1 ring-gray-200/30 text-center">
      <Icon size={20} className="text-aiva-purple mx-auto" />
      <div className="mt-2 text-lg font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 font-medium">{label}</div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl bg-white/60 backdrop-blur-sm ring-1 ring-gray-200/40 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left"
      >
        <span className="text-sm font-semibold text-gray-800">{question}</span>
        <ChevronDown
          size={16}
          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 -mt-1">
          <p className="text-sm text-gray-600 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

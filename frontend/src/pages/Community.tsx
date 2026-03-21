import { motion } from "framer-motion";
import { GlassCard } from "@/components/common/GlassCard";
import {
  Mic, Brain, BarChart3, Users, Shield, Star,
  MessageSquare, Zap, HelpCircle, ChevronDown,
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

export function Community() {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto space-y-8 pb-16"
    >
      {/* ── ABOUT US ── */}
      <motion.div variants={fadeUp}>
        <GlassCard variant="blue" className="p-6 sm:p-8">
          <SectionTitle>ABOUT US</SectionTitle>
          <div className="mt-4 space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>
              AIVA is an AI-powered platform designed to <strong>revolutionize how students prepare</strong> for high-stakes skill assessments like{" "}
              <strong>viva voce examinations, job interviews,</strong> and <strong>communication training.</strong> Unlike
              conventional preparation tools, AIVA provides a fully interactive experience that simulates real-world
              evaluation scenarios using <strong>Artificial Intelligence.</strong>
            </p>
            <p>
              Through <strong>intelligent speech generation</strong> and <strong>real-time interaction,</strong> AIVA allows users to experience multiple role-play scenarios across
              various disciplines — from technical engineering vivas to behavioral job interviews — all within a safe,
              on-device environment. It features an <strong>AI-powered conversational skills, confidence hints,</strong> and{" "}
              <strong>instant scoring</strong> — helping users continuously improve their delivery.
            </p>
            <p>
              We understand that many students struggle with <strong>exam fear, lack of knowledge, low exam confidence,</strong> and{" "}
              <strong>limited guidance</strong>, especially in areas like <strong>spoken English, professional communication, project viva defense,</strong> and{" "}
              <strong>entry-level interviews</strong>. AIVA is here to bridge that gap. It helps a <strong>holistic confidence-building tool</strong> that adapts to the user's
              level and assists them in being <strong>better prepared for high-pressure situations.</strong>
            </p>
          </div>
        </GlassCard>
      </motion.div>

      {/* ── WHAT WE DO ── */}
      <motion.div variants={fadeUp}>
        <GlassCard variant="default" className="p-6 sm:p-8">
          <SectionTitle>WHAT WE DO</SectionTitle>
          <div className="mt-4 space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>
              AIVA provides an <strong>AI-powered environment</strong> where users can practice <strong>real-time interviews</strong> and simulations in a{" "}
              <strong>structured, feedback-driven format.</strong> It smartly adjusts question difficulty level, topics, and conversation style based on the user's
              responses — simulating an <strong>intelligent evaluator.</strong>
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FeatureCard icon={Mic} title="Mock Interviews" desc="Conduct practice sessions with instant, detailed feedback on responses." />
            <FeatureCard icon={Brain} title="AI-Powered Feedback" desc="Get real-time insights on your communication, confidence, clarity, and accuracy." />
            <FeatureCard icon={BarChart3} title="Adaptive Difficulty" desc="Questions adjust to your level, allowing you to scale from easy to interview-ready." />
            <FeatureCard icon={MessageSquare} title="Conversational AI" desc="Natural conversation flow that simulates real evaluators and interviewers." />
          </div>
        </GlassCard>
      </motion.div>

      {/* ── WHY CHOOSE US ── */}
      <motion.div variants={fadeUp}>
        <GlassCard variant="purple" className="p-6 sm:p-8">
          <SectionTitle>WHY CHOOSE US</SectionTitle>
          <div className="mt-4 space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>
              AIVA is built with a deep focus on <strong>practical interview readiness,</strong> not just theoretical knowledge-sharing platforms. It provides{" "}
              <strong>hands-on simulations</strong> combined with <strong>AI analytics</strong> that tell users exactly where they stand and how to improve across{" "}
              <strong>communication, technical knowledge, confidence,</strong> and <strong>clarity.</strong>
            </p>
            <p>
              Our platform stands out by offering <strong>instant, personalized feedback</strong> after every session. Instead of generic results, users receive{" "}
              <strong>granular analysis</strong> of their pacing, vocabulary usage, filler detection, response structure, and relevance — something a traditional
              classroom or mock interview cannot provide consistently.
            </p>
            <p>
              AIVA also provides a <strong>structured</strong> and <strong>guided experience.</strong> Users are not left without clear advice on what to study or how to
              improve. The system provides <strong>learning resources, feedback, and guidance,</strong> and links users directly towards areas that need improvement.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatBadge icon={Star} label="User Rating" value="4.9/5" />
            <StatBadge icon={Users} label="Active Users" value="10K+" />
            <StatBadge icon={Zap} label="Sessions/Day" value="5K+" />
          </div>
        </GlassCard>
      </motion.div>

      {/* ── WHAT MAKES US DIFFERENT ── */}
      <motion.div variants={fadeUp}>
        <GlassCard variant="default" className="p-6 sm:p-8">
          <SectionTitle>WHAT MAKES US DIFFERENT</SectionTitle>
          <div className="mt-4 space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>
              AIVA goes beyond traditional learning platforms by focusing on <strong>real-time behavioral analysis</strong> rather than passive learning. Unlike other platforms
              that focus on video lectures or static question banks, AIVA provides a <strong>dynamic, responsive, and personalized experience.</strong>
            </p>
            <p>
              One of our core strengths is the ability to <strong>analyze how users respond,</strong> not just what they answer. The platform evaluates <strong>communication
              style, clarity, confidence, and response structure,</strong> providing actionable feedback that helps users improve with each session. The
              AI-powered engine adapts in real time to provide progressively harder or more targeted questions.
            </p>
          </div>

          <div className="mt-6 rounded-2xl bg-gradient-to-r from-aiva-purple/5 to-aiva-indigo/5 p-5 ring-1 ring-aiva-purple/10">
            <h4 className="text-sm font-bold text-gray-800 mb-3">Key Differentiators</h4>
            <ul className="space-y-2">
              {[
                "Real-time AI behavior analysis during practice sessions",
                "Adaptive difficulty that scales with your progress",
                "Instant, granular feedback — not just pass/fail scores",
                "Multi-domain coverage: viva, interviews, soft skills, and more",
                "Privacy-first: all processing happens on-device",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-aiva-purple flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </GlassCard>
      </motion.div>

      {/* ── OUR MISSION ── */}
      <motion.div variants={fadeUp}>
        <GlassCard variant="blue" className="p-6 sm:p-8">
          <SectionTitle>OUR MISSION</SectionTitle>
          <div className="mt-4 space-y-4 text-sm text-gray-700 leading-relaxed">
            <p>
              Our mission is to make <strong>interview and oral examination preparation</strong> more <strong>accessible, affordable, and effective</strong> for every learner by leveraging AI's potential. We
              aim to help users build <strong>confidence, clarity, and strong communication</strong> skills by providing <strong>real-time practice and meaningful
              feedback</strong> — anytime, anywhere.
            </p>
            <p>
              We believe that every student and job seeker deserves access to <strong>world-class preparation tools,</strong> regardless of where they are or what
              resources they have. AIVA levels the playing field by providing <strong>intelligent, personalized coaching</strong> that was previously only available to those
              who could afford expensive tutors or coaching programs.
            </p>
          </div>
        </GlassCard>
      </motion.div>

      {/* ── PRIVACY POLICY ── */}
      <motion.div variants={fadeUp}>
        <GlassCard variant="default" className="p-6 sm:p-8">
          <SectionTitle>PRIVACY POLICY</SectionTitle>
          <div className="mt-4 space-y-5">
            {[
              { title: "Your Privacy Matters", desc: "We are committed to protecting your personal information and ensuring a safe, secure, and transparent experience. Your data is handled with the utmost care and integrity." },
              { title: "Information We Collect", desc: "We collect limited information that is necessary to provide and improve our services, including basic account information such as name and email, usage data to personalize your experience, and optional survey responses or session recordings (only with explicit consent)." },
              { title: "Audio & Video Data Protection", desc: "Recordings or live audio/video data are highly sensitive. Therefore, we never store audio/video recordings without explicit user consent. We do not use your data for advertising or sharing without consent." },
              { title: "Data Security", desc: "We implement strong security measures to protect your data. Encrypted connections are used for data transmission at all times. Our servers use cloud-grade protection strategies to ensure data safety." },
              { title: "No Data Sharing Policy", desc: "Your personal data remains yours. It is not surveyed or recaptured in third-parties without your consent. Your data is used exclusively to improve your experience on the platform." },
              { title: "Transparency & Updates", desc: "We value transparency. Any updates to this policy reflect recent changes/features. Among other commitments, ensuring users are always informed." },
            ].map((item) => (
              <div key={item.title}>
                <h4 className="text-sm font-bold text-gray-800">{item.title}</h4>
                <p className="mt-1 text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* ── FAQ ── */}
      <motion.div variants={fadeUp}>
        <GlassCard variant="purple" className="p-6 sm:p-8">
          <SectionTitle>FAQ</SectionTitle>
          <div className="mt-4 space-y-2">
            {[
              { q: "Who can use this platform?", a: "Anyone preparing for interviews, viva, or improving communication skills — students, job seekers, and professionals." },
              { q: "Do I need prior knowledge to start?", a: "Not at all! AIVA adapts to your level, from beginner to advanced." },
              { q: "Is this different from other platforms?", a: "Yes. Unlike static question banks and boring prep tools, AIVA provides real-time, AI-powered interactive practice sessions." },
              { q: "Does it help improve communication skills?", a: "Absolutely! AIVA provides detailed feedback on clarity, confidence, articulation, and overall speech quality." },
              { q: "Is my data safe?", a: "Yes. We follow strong security practices including encryption and secure data handling, ensuring your information remains private." },
              { q: "How does the voice practice feature work?", a: "The real-time voice practice allows you to simulate live interviews and feedback in real time, improving your conversational skills." },
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

function FeatureCard({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
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

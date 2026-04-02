import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/common/Button";
import { AnimatedButton } from "@/components/common/AnimatedButton";
import { ProfilePictureUpload } from "@/components/common/ProfilePictureUpload";
import { authService } from "@/services/authService";
import {
  Award,
  Bell,
  Briefcase,
  Calendar,
  Check,
  Clock,
  Flame,
  Github,
  Globe,
  Linkedin,
  Lock,
  MapPin,
  Plus,
  Shield,
  Sparkles,
  User as UserIcon,
  X,
} from "lucide-react";

const TABS = [
  { id: "general", label: "Identity", icon: UserIcon },
  { id: "professional", label: "Career", icon: Briefcase },
  { id: "preferences", label: "Preferences", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
] as const;

export function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>("general");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveTone, setSaveTone] = useState<"success" | "error">("success");

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [location, setLocation] = useState(user?.location ?? "");
  const [website, setWebsite] = useState(user?.website ?? "");
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || "");

  const [jobTitle, setJobTitle] = useState(user?.jobTitle ?? "");
  const [company, setCompany] = useState(user?.company ?? "");
  const [experience, setExperience] = useState(user?.experience ?? "");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>(user?.skills ?? []);
  const [linkedin, setLinkedin] = useState(user?.linkedin ?? "");
  const [github, setGithub] = useState(user?.github ?? "");

  const [emailNotifications, setEmailNotifications] = useState(user?.preferences.notifications.email ?? true);
  const [pushNotifications, setPushNotifications] = useState(user?.preferences.notifications.push ?? true);
  const [practiceReminders, setPracticeReminders] = useState(user?.preferences.notifications.practice ?? true);
  const [achievementAlerts, setAchievementAlerts] = useState(user?.preferences.notifications.achievements ?? true);
  const [publicProfile, setPublicProfile] = useState(user?.preferences.privacy.profileVisibility === "public");
  const [showProgress, setShowProgress] = useState(user?.preferences.privacy.showProgress ?? true);
  const [showAchievements, setShowAchievements] = useState(user?.preferences.privacy.showAchievements ?? true);

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [sessions, setSessions] = useState(() => (user ? authService.getSessions(user.id) : []));

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setUsername(user.username ?? "");
    setBio(user.bio ?? "");
    setLocation(user.location ?? "");
    setWebsite(user.website ?? "");
    setProfilePicture(user.profilePicture || "");
    setJobTitle(user.jobTitle ?? "");
    setCompany(user.company ?? "");
    setExperience(user.experience ?? "");
    setSkills(user.skills ?? []);
    setLinkedin(user.linkedin ?? "");
    setGithub(user.github ?? "");
    setEmailNotifications(user.preferences.notifications.email ?? true);
    setPushNotifications(user.preferences.notifications.push ?? true);
    setPracticeReminders(user.preferences.notifications.practice ?? true);
    setAchievementAlerts(user.preferences.notifications.achievements ?? true);
    setPublicProfile(user.preferences.privacy.profileVisibility === "public");
    setShowProgress(user.preferences.privacy.showProgress ?? true);
    setShowAchievements(user.preferences.privacy.showAchievements ?? true);
    setSessions(authService.getSessions(user.id));
  }, [user]);

  function showSaveState(tone: "success" | "error", message: string) {
    setSaveTone(tone);
    setSaveMsg(message);
    window.setTimeout(() => setSaveMsg(""), 3200);
  }

  async function saveGeneral() {
    setSaving(true);
    try {
      await updateProfile({ firstName, lastName, username, bio, location, website, profilePicture });
      showSaveState("success", "Profile identity updated.");
    } catch {
      showSaveState("error", "Could not save profile changes.");
    } finally {
      setSaving(false);
    }
  }

  async function saveProfessional() {
    setSaving(true);
    try {
      await updateProfile({ jobTitle, company, experience, skills, linkedin, github });
      showSaveState("success", "Professional details updated.");
    } catch {
      showSaveState("error", "Could not save professional details.");
    } finally {
      setSaving(false);
    }
  }

  async function savePreferences() {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile({
        preferences: {
          ...user.preferences,
          notifications: {
            email: emailNotifications,
            push: pushNotifications,
            practice: practiceReminders,
            achievements: achievementAlerts,
          },
          privacy: {
            profileVisibility: publicProfile ? "public" : "private",
            showProgress,
            showAchievements,
          },
        },
      });
      showSaveState("success", "Preferences updated.");
    } catch {
      showSaveState("error", "Could not save preferences.");
    } finally {
      setSaving(false);
    }
  }

  function addSkill() {
    const nextSkill = skillInput.trim();
    if (!nextSkill || skills.includes(nextSkill) || skills.length >= 20) return;
    setSkills([...skills, nextSkill]);
    setSkillInput("");
  }

  async function handleChangePassword() {
    setPwdError("");
    setPwdSuccess("");
    if (newPwd.length < 8) {
      setPwdError("Use at least 8 characters.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdError("Passwords do not match.");
      return;
    }
    try {
      await changePassword(currentPwd, newPwd);
      setPwdSuccess("Password updated.");
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch (err) {
      setPwdError(err instanceof Error ? err.message : "Failed to update password.");
    }
  }

  function handleRevokeSession(sessionId: string) {
    if (!user) return;
    authService.revokeSession(user.id, sessionId);
    setSessions(authService.getSessions(user.id));
  }

  function handleRevokeAllSessions() {
    if (!user) return;
    authService.revokeAllSessions(user.id);
    setSessions(authService.getSessions(user.id));
  }

  if (!user) return null;

  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  const profileStrength = Math.min(
    100,
    [bio, location, website, jobTitle, company, skills.length ? "skills" : "", profilePicture].filter(Boolean).length * 14 + 16,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="max-w-6xl mx-auto space-y-6"
    >
      <section className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-[linear-gradient(135deg,rgba(107,62,186,0.98),rgba(128,77,222,0.95),rgba(89,99,237,0.94))] shadow-[0_30px_90px_rgba(66,34,127,0.32)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_left,rgba(255,255,255,0.1),transparent_30%)]" />
        <div className="relative grid gap-6 px-5 py-6 sm:px-7 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-8">
          <div className="space-y-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
              <ProfilePictureUpload currentImage={profilePicture} onImageChange={setProfilePicture} size="lg" className="shrink-0" />
              <div className="min-w-0 text-white">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/80">
                  <Sparkles size={12} />
                  Speaker Identity
                </div>
                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  {firstName || user.firstName} {lastName || user.lastName}
                </h1>
                <p className="mt-2 text-sm text-white/75">@{username || user.username}</p>
                <p className="max-w-2xl mt-4 text-sm leading-7 text-white/78">
                  {bio || "Shape your presence so judges instantly understand who you are, what you build, and why your product deserves attention."}
                </p>
                <div className="flex flex-wrap gap-2 mt-4 text-xs text-white/82">
                  <MetaBadge icon={Calendar} label={`Joined ${joinedDate}`} />
                  <MetaBadge icon={MapPin} label={location || "Location not set"} />
                  <MetaBadge icon={Globe} label={website || "Portfolio pending"} />
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <HeroStat icon={Clock} label="Practice Hours" value={String(user.stats.practiceHours)} />
              <HeroStat icon={Award} label="Achievements" value={String(user.stats.achievements)} />
              <HeroStat icon={Flame} label="Current Streak" value={`${user.stats.streak} days`} />
            </div>
          </div>

          <div className="grid self-stretch gap-3">
            <InfoPanel
              eyebrow="Profile Strength"
              title={`${profileStrength}% complete`}
              description="A fuller profile makes your story feel intentional and credible."
            >
              <div className="h-2 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#f7b3ff_0%,#ffd7b7_50%,#fff3ce_100%)]"
                  style={{ width: `${profileStrength}%` }}
                />
              </div>
            </InfoPanel>
            <InfoPanel
              eyebrow="Current Focus"
              title={jobTitle || "Position your role"}
              description={company ? `Currently building at ${company}.` : "Add your role and company to strengthen your pitch."}
            >
              <div className="flex flex-wrap gap-2">
                {(skills.slice(0, 4).length ? skills.slice(0, 4) : ["Communication", "Confidence", "Pitching"]).map((skill) => (
                  <span key={skill} className="px-3 py-1 text-xs font-semibold border rounded-full border-white/15 bg-white/10 text-white/85">
                    {skill}
                  </span>
                ))}
              </div>
            </InfoPanel>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/20 bg-white/60 p-3 shadow-[0_20px_70px_rgba(108,72,167,0.08)] backdrop-blur-xl dark:bg-slate-900/50">
        <div className="grid gap-2 sm:grid-cols-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-[1.25rem] px-4 py-3 text-left transition-all ${
                activeTab === tab.id
                  ? "bg-[linear-gradient(135deg,rgba(124,58,237,0.16),rgba(99,102,241,0.12))] text-aiva-purple shadow-[inset_0_0_0_1px_rgba(124,58,237,0.18)]"
                  : "text-gray-500 hover:bg-white/70 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-slate-800/55 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${activeTab === tab.id ? "bg-white/80 text-aiva-purple" : "bg-white/50 text-gray-400 dark:bg-slate-800/60"}`}>
                  <tab.icon size={17} />
                </div>
                <div>
                  <div className="text-sm font-bold">{tab.label}</div>
                  <div className="text-[11px] uppercase tracking-[0.22em] text-current/60">
                    {tab.id === "general" && "Core"}
                    {tab.id === "professional" && "Growth"}
                    {tab.id === "preferences" && "Signals"}
                    {tab.id === "security" && "Trust"}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <AnimatePresence mode="wait">
        <motion.section
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.24 }}
          className="space-y-5"
        >
          {saveMsg && (
            <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
              saveTone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}>
              {saveMsg}
            </div>
          )}

          {activeTab === "general" && (
            <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <SurfaceCard title="Profile Identity" description="Tight, clear, and presentation-ready information for judges and teammates.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <GlassField label="First Name" value={firstName} onChange={setFirstName} />
                  <GlassField label="Last Name" value={lastName} onChange={setLastName} />
                  <GlassField label="Username" value={username} onChange={setUsername} />
                  <GlassField label="Email" value={user.email} onChange={() => {}} disabled />
                </div>
                <TextAreaField label="Bio" value={bio} onChange={setBio} placeholder="Tell judges what you build, your angle, and the confidence you bring." />
                <div className="grid gap-4 sm:grid-cols-2">
                  <GlassField label="Location" value={location} onChange={setLocation} placeholder="City, Country" icon={<MapPin size={14} />} />
                  <GlassField label="Website" value={website} onChange={setWebsite} placeholder="https://portfolio.com" icon={<Globe size={14} />} />
                </div>
                <AnimatedButton onClick={saveGeneral} disabled={saving} loading={saving} icon={<Check size={16} />}>
                  {saving ? "Saving..." : "Save Identity"}
                </AnimatedButton>
              </SurfaceCard>

              <SurfaceCard title="Judge Snapshot" description="The first-glance summary that makes your profile feel intentional.">
                <SpotlightRow label="Profile Visibility" value={publicProfile ? "Public" : "Private"} />
                <SpotlightRow label="Current Role" value={jobTitle || "Not added yet"} />
                <SpotlightRow label="Company" value={company || "Independent builder"} />
                <SpotlightRow label="Top Skills" value={skills.length ? skills.slice(0, 3).join(", ") : "Add your strongest stack"} />
              </SurfaceCard>
            </div>
          )}

          {activeTab === "professional" && (
            <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              <SurfaceCard title="Professional Story" description="Give your experience a crisp, pitch-ready structure.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <GlassField label="Job Title" value={jobTitle} onChange={setJobTitle} placeholder="Founding Engineer" icon={<Briefcase size={14} />} />
                  <GlassField label="Company" value={company} onChange={setCompany} placeholder="Aiva Labs" />
                </div>
                <GlassField label="Experience Level" value={experience} onChange={setExperience} placeholder="3+ years in product and frontend" />
                <SkillEditor
                  skills={skills}
                  skillInput={skillInput}
                  onSkillInputChange={setSkillInput}
                  onAddSkill={addSkill}
                  onRemoveSkill={(skill) => setSkills(skills.filter((item) => item !== skill))}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <GlassField label="LinkedIn" value={linkedin} onChange={setLinkedin} placeholder="https://linkedin.com/in/..." icon={<Linkedin size={14} />} />
                  <GlassField label="GitHub" value={github} onChange={setGithub} placeholder="https://github.com/..." icon={<Github size={14} />} />
                </div>
                <AnimatedButton onClick={saveProfessional} disabled={saving} loading={saving} icon={<Check size={16} />}>
                  {saving ? "Saving..." : "Save Career Story"}
                </AnimatedButton>
              </SurfaceCard>

              <SurfaceCard title="Presentation Notes" description="What makes this section feel stronger to a hackathon judge.">
                <BulletPoint text="Lead with the role you want to be remembered for." />
                <BulletPoint text="Keep only the skills that support your product story." />
                <BulletPoint text="Link to a portfolio, GitHub, or case study if you have one." />
              </SurfaceCard>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="grid gap-5 lg:grid-cols-2">
              <SurfaceCard title="Notification Design" description="Keep signal high and noise low.">
                <ToggleRow label="Email notifications" desc="Receive progress updates and tips by email." checked={emailNotifications} onChange={setEmailNotifications} />
                <ToggleRow label="Push notifications" desc="Enable quick reminders inside the browser." checked={pushNotifications} onChange={setPushNotifications} />
                <ToggleRow label="Practice reminders" desc="Daily nudges to keep your speaking streak active." checked={practiceReminders} onChange={setPracticeReminders} />
                <ToggleRow label="Achievement alerts" desc="Celebrate milestones and score improvements." checked={achievementAlerts} onChange={setAchievementAlerts} />
              </SurfaceCard>

              <SurfaceCard title="Privacy Controls" description="Show only what strengthens your public presence.">
                <ToggleRow label="Public profile" desc="Allow others to discover your profile page." checked={publicProfile} onChange={setPublicProfile} />
                <ToggleRow label="Show progress" desc="Display your measurable learning journey." checked={showProgress} onChange={setShowProgress} />
                <ToggleRow label="Show achievements" desc="Surface badges and milestone wins." checked={showAchievements} onChange={setShowAchievements} />
                <AnimatedButton onClick={savePreferences} disabled={saving} loading={saving} icon={<Check size={16} />}>
                  {saving ? "Saving..." : "Save Preferences"}
                </AnimatedButton>
              </SurfaceCard>
            </div>
          )}

          {activeTab === "security" && (
            <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
              <SurfaceCard title="Password Security" description="Keep your account protected without clutter.">
                <AnimatePresence>
                  {pwdError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 py-3 text-sm font-medium border rounded-2xl border-rose-200 bg-rose-50 text-rose-600">
                      {pwdError}
                    </motion.div>
                  )}
                  {pwdSuccess && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 py-3 text-sm font-medium border rounded-2xl border-emerald-200 bg-emerald-50 text-emerald-600">
                      {pwdSuccess}
                    </motion.div>
                  )}
                </AnimatePresence>
                <GlassField label="Current Password" value={currentPwd} onChange={setCurrentPwd} type="password" icon={<Lock size={14} />} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <GlassField label="New Password" value={newPwd} onChange={setNewPwd} type="password" icon={<Shield size={14} />} />
                  <GlassField label="Confirm Password" value={confirmPwd} onChange={setConfirmPwd} type="password" icon={<Shield size={14} />} />
                </div>
                <AnimatedButton onClick={handleChangePassword} icon={<Shield size={16} />}>
                  Update Password
                </AnimatedButton>
              </SurfaceCard>

              <SurfaceCard title="Active Sessions" description="Clean, readable device management with immediate actions.">
                {sessions.length > 1 && (
                  <div className="flex justify-end">
                    <button type="button" onClick={handleRevokeAllSessions} className="text-sm font-semibold transition-colors text-rose-500 hover:text-rose-600">
                      Revoke all others
                    </button>
                  </div>
                )}
                {sessions.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-gray-500 border border-gray-200 border-dashed rounded-2xl bg-white/40">
                    No active sessions found.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <div key={session.id} className="flex flex-col gap-3 rounded-[1.4rem] border border-white/30 bg-white/55 p-4 shadow-[0_12px_35px_rgba(107,62,186,0.06)] backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between dark:bg-slate-900/35">
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 h-2.5 w-2.5 rounded-full ${session.isCurrent ? "bg-emerald-500" : "bg-gray-300"}`} />
                          <div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                              {session.browser} � {session.device}
                            </div>
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {session.ip} � Last active {new Date(session.lastActive).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        {session.isCurrent ? (
                          <span className="inline-flex items-center px-3 py-1 text-xs font-bold border rounded-full border-emerald-200 bg-emerald-50 text-emerald-700">
                            This device
                          </span>
                        ) : (
                          <button type="button" onClick={() => handleRevokeSession(session.id)} className="text-sm font-semibold transition-colors text-rose-500 hover:text-rose-600">
                            Revoke
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </SurfaceCard>
            </div>
          )}
        </motion.section>
      </AnimatePresence>
    </motion.div>
  );
}

function MetaBadge({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
      <Icon size={12} />
      {label}
    </span>
  );
}

function HeroStat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/15 bg-white/10 px-4 py-4 text-white backdrop-blur-sm">
      <div className="flex items-center justify-center w-10 h-10 mb-3 rounded-2xl bg-white/14">
        <Icon size={18} />
      </div>
      <div className="text-2xl font-black tracking-tight">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-[0.22em] text-white/62">{label}</div>
    </div>
  );
}

function InfoPanel({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.6rem] border border-white/15 bg-slate-950/18 p-4 text-white backdrop-blur-md">
      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/62">{eyebrow}</div>
      <div className="mt-2 text-xl font-black tracking-tight">{title}</div>
      <div className="mt-1 text-sm leading-6 text-white/72">{description}</div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function SurfaceCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.8rem] border border-white/25 bg-white/65 p-5 shadow-[0_20px_60px_rgba(107,62,186,0.08)] backdrop-blur-xl dark:bg-slate-900/45">
      <div className="flex flex-col gap-2 pb-4 mb-5 border-b border-gray-100/80 dark:border-white/10">
        <h3 className="text-lg font-black tracking-tight text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SpotlightRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm border rounded-2xl border-white/20 bg-white/55 dark:bg-slate-900/25">
      <span className="font-semibold text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-bold text-right text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}

function SkillEditor({
  skills,
  skillInput,
  onSkillInputChange,
  onAddSkill,
  onRemoveSkill,
}: {
  skills: string[];
  skillInput: string;
  onSkillInputChange: (value: string) => void;
  onAddSkill: () => void;
  onRemoveSkill: (skill: string) => void;
}) {
  return (
    <div className="space-y-3">
      <label className="block text-xs font-bold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
        Key Skills
      </label>
      <div className="flex flex-wrap gap-2">
        {skills.length === 0 && (
          <span className="px-3 py-2 text-xs text-gray-400 border border-gray-200 border-dashed rounded-full dark:border-white/10">
            No skills added yet
          </span>
        )}
        {skills.map((skill) => (
          <span key={skill} className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,rgba(124,58,237,0.13),rgba(99,102,241,0.11))] px-3 py-2 text-xs font-semibold text-aiva-purple ring-1 ring-aiva-purple/15">
            {skill}
            <button type="button" onClick={() => onRemoveSkill(skill)} className="transition-colors text-aiva-purple/60 hover:text-aiva-purple">
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={skillInput}
          onChange={(e) => onSkillInputChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onAddSkill())}
          placeholder="Add skill and press Enter"
          className="flex-1 px-4 py-3 text-sm text-gray-800 transition-colors border outline-none rounded-2xl border-gray-200/70 bg-white/80 focus:border-aiva-purple/35 dark:border-white/10 dark:bg-slate-950/30 dark:text-white"
        />
        <Button variant="secondary" size="sm" onClick={onAddSkill}>
          <Plus size={14} /> Add
        </Button>
      </div>
    </div>
  );
}

function BulletPoint({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 text-sm border rounded-2xl border-white/20 bg-white/55 dark:bg-slate-900/25">
      <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-aiva-purple" />
      <p className="leading-6 text-gray-600 dark:text-gray-300">{text}</p>
    </div>
  );
}

function GlassField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  icon,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">{label}</label>
      <div className="relative">
        {icon && <span className="absolute text-gray-400 -translate-y-1/2 pointer-events-none left-4 top-1/2">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-2xl border border-gray-200/70 bg-white/80 py-3 text-sm text-gray-800 outline-none transition-colors focus:border-aiva-purple/35 dark:border-white/10 dark:bg-slate-950/30 dark:text-white ${
            icon ? "pl-11 pr-4" : "px-4"
          } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
        />
      </div>
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="block text-xs font-bold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">{label}</label>
        <span className="text-[11px] font-semibold text-gray-400">{value.length}/280</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={280}
        rows={4}
        placeholder={placeholder}
        className="w-full px-4 py-3 text-sm text-gray-800 transition-colors border outline-none resize-none rounded-2xl border-gray-200/70 bg-white/80 focus:border-aiva-purple/35 dark:border-white/10 dark:bg-slate-950/30 dark:text-white"
      />
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1.3rem] border border-white/25 bg-white/55 px-4 py-4 dark:bg-slate-900/25">
      <div className="max-w-[75%]">
        <div className="text-sm font-bold text-gray-900 dark:text-white">{label}</div>
        <div className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">{desc}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${checked ? "bg-aiva-purple" : "bg-gray-300 dark:bg-slate-700"}`}
      >
        <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  );
}

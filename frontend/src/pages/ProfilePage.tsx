import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { GlassCard } from "@/components/common/GlassCard";
import { Button } from "@/components/common/Button";
import { AnimatedButton } from "@/components/common/AnimatedButton";
import { InteractiveCard } from "@/components/common/InteractiveCard";
import { ProfilePictureUpload } from "@/components/common/ProfilePictureUpload";
import { authService } from "@/services/authService";
import {
  User as UserIcon, Briefcase, Settings, Shield,
  MapPin, Globe, Calendar, Award, Flame, Clock,
  Plus, X, Linkedin, Github, Camera, Upload, Check,
} from "lucide-react";

const TABS = [
  { id: "general", label: "General", icon: UserIcon },
  { id: "professional", label: "Professional", icon: Briefcase },
  { id: "preferences", label: "Preferences", icon: Settings },
  { id: "security", label: "Security", icon: Shield },
];

export function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // General
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [location, setLocation] = useState(user?.location ?? "");
  const [website, setWebsite] = useState(user?.website ?? "");
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || "");

  // Professional
  const [jobTitle, setJobTitle] = useState(user?.jobTitle ?? "");
  const [company, setCompany] = useState(user?.company ?? "");
  const [experience, setExperience] = useState(user?.experience ?? "");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>(user?.skills ?? []);
  const [linkedin, setLinkedin] = useState(user?.linkedin ?? "");
  const [github, setGithub] = useState(user?.github ?? "");

  // Update local state when user context changes (e.g. after save or initial load)
  useEffect(() => {
    if (user) {
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
    }
  }, [user]);

  // General

  // Security
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");

  const sessions = user ? authService.getSessions(user.id) : [];
  const initials = `${(user?.firstName ?? "A")[0]}${(user?.lastName ?? "I")[0]}`.toUpperCase();

  async function saveGeneral() {
    setSaving(true);
    await updateProfile({ firstName, lastName, username, bio, location, website, profilePicture });
    setSaveMsg("Changes saved successfully!");
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  }

  async function saveProfessional() {
    setSaving(true);
    await updateProfile({ jobTitle, company, experience, skills, linkedin, github });
    setSaveMsg("Professional details updated!");
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  }

  function addSkill() {
    const s = skillInput.trim();
    if (s && !skills.includes(s) && skills.length < 20) {
      setSkills([...skills, s]);
      setSkillInput("");
    }
  }

  async function handleChangePassword() {
    setPwdError(""); setPwdSuccess("");
    if (newPwd.length < 8) { setPwdError("Minimum 8 characters required"); return; }
    if (newPwd !== confirmPwd) { setPwdError("Passwords don't match"); return; }
    try {
      await changePassword(currentPwd, newPwd);
      setPwdSuccess("Password updated successfully!");
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    } catch (err) {
      setPwdError(err instanceof Error ? err.message : "Failed to update password");
    }
  }

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      {/* ── Hero profile header ── */}
      <div className="relative rounded-3xl overflow-hidden">
        {/* Gradient banner */}
        <div className="h-36 bg-gradient-to-r from-aiva-purple via-purple-500 to-aiva-indigo relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMwMDAub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        </div>

        {/* Profile info card overlapping banner */}
        <InteractiveCard hover={true} scale={true} glow={true} tilt={false}>
          <div className="relative -mt-16 mx-4 sm:mx-6 rounded-2xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-lg ring-1 ring-white/40 dark:ring-gray-700/40 p-5">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              {/* Avatar section */}
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 15 }}
                className="-mt-14 sm:-mt-16 relative"
              >
                <ProfilePictureUpload
                  currentImage={profilePicture}
                  onImageChange={setProfilePicture}
                  size="lg"
                />
                <div className="absolute bottom-1 right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 z-10 shadow-sm" title="Online" />
              </motion.div>

              {/* Info section */}
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      {user.firstName} {user.lastName}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">@{user.username}</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1.5 self-start sm:self-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-aiva-purple/10 to-aiva-indigo/10 dark:from-aiva-purple/20 dark:to-aiva-indigo/20 px-4 py-1.5 text-sm font-bold text-aiva-purple dark:text-aiva-purple ring-1 ring-aiva-purple/20">
                      <Award size={14} />
                      Level {user.level}
                    </span>
                    {/* Level Progress Bar */}
                    <div className="w-32 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "65%" }} 
                        className="h-full bg-gradient-to-r from-aiva-purple to-aiva-indigo"
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Mastery 65%</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5"><Calendar size={12} className="text-aiva-purple" /> Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                  {user.location && <span className="flex items-center gap-1.5"><MapPin size={12} className="text-aiva-purple" /> {user.location}</span>}
                  {user.website && <span className="flex items-center gap-1.5"><Globe size={12} className="text-aiva-purple" /> {user.website}</span>}
                </div>
              </div>
            </div>

          {/* Stats row */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <StatCard 
              icon={Clock} 
              label="Practice Hours" 
              value={user.stats.practiceHours} 
              color="from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20" 
              iconColor="text-blue-500" 
            />
            <StatCard 
              icon={Award} 
              label="Achievements" 
              value={user.stats.achievements} 
              color="from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20" 
              iconColor="text-amber-500" 
            />
            <StatCard 
              icon={Flame} 
              label="Day Streak" 
              value={user.stats.streak} 
              color="from-rose-500/10 to-pink-500/10 dark:from-rose-500/20 dark:to-pink-500/20" 
              iconColor="text-rose-500" 
            />
          </div>
          </div>
        </InteractiveCard>
      </div>

      {/* ── Tab content ── */}
      <InteractiveCard hover={false} scale={false} glow={true} tilt={false}>
        <div className="rounded-3xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl shadow-lg ring-1 ring-white/40 dark:ring-gray-700/40 overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-gray-200/50 dark:border-gray-700/50 bg-white/30 dark:bg-gray-900/10">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? "text-aiva-purple"
                    : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                }`}
              >
                <tab.icon size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="profile-tab-indicator"
                    className="absolute bottom-0 inset-x-6 h-0.5 rounded-full bg-aiva-purple"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="p-5 sm:p-6">
            {/* Save message */}
            <AnimatePresence>
              {saveMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mb-5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 font-medium flex items-center gap-2"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">✓</span>
                  {saveMsg}
                </motion.div>
              )}
            </AnimatePresence>

          {/* ── General ── */}
          {activeTab === "general" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlassField label="First Name" value={firstName} onChange={setFirstName} />
                <GlassField label="Last Name" value={lastName} onChange={setLastName} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlassField label="Username" value={username} onChange={setUsername} />
                <GlassField label="Email" value={user.email} onChange={() => {}} disabled />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 block uppercase tracking-wider">Bio</label>
                <textarea
                  value={bio} onChange={(e) => setBio(e.target.value)}
                  maxLength={280} rows={3}
                  className="w-full rounded-xl bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm px-4 py-3 text-sm text-gray-800 dark:text-gray-200 ring-1 ring-gray-200/60 dark:ring-gray-700/60 focus:outline-none focus:ring-2 focus:ring-aiva-purple/30 resize-none transition-shadow"
                  placeholder="Write something about yourself..."
                />
                <div className="text-right text-[10px] text-gray-400 mt-1 font-semibold">{bio.length}/280</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlassField label="Location" value={location} onChange={setLocation} placeholder="City, Country" icon={<MapPin size={14} />} />
                <GlassField label="Website" value={website} onChange={setWebsite} placeholder="https://yoursite.com" icon={<Globe size={14} />} />
              </div>
              <div className="pt-2">
                <AnimatedButton 
                  onClick={saveGeneral} 
                  disabled={saving}
                  loading={saving}
                  icon={<Check size={16} />}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </AnimatedButton>
              </div>
            </motion.div>
          )}

          {/* ── Professional ── */}
          {activeTab === "professional" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlassField label="Job Title" value={jobTitle} onChange={setJobTitle} placeholder="Software Engineer" icon={<Briefcase size={14} />} />
                <GlassField label="Company" value={company} onChange={setCompany} placeholder="Acme Corp" />
              </div>
              <GlassField label="Experience Level" value={experience} onChange={setExperience} placeholder="e.g. 3+ years" />

              {/* Skills */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">Skills</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {skills.map((s) => (
                    <motion.span
                      key={s}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-aiva-purple/10 to-aiva-indigo/10 px-3 py-1.5 text-xs text-aiva-purple font-semibold ring-1 ring-aiva-purple/15"
                    >
                      {s}
                      <button type="button" onClick={() => setSkills(skills.filter((x) => x !== s))}
                        className="text-aiva-purple/50 hover:text-aiva-purple transition-colors">
                        <X size={12} />
                      </button>
                    </motion.span>
                  ))}
                  {skills.length === 0 && <span className="text-xs text-gray-400 italic">No skills added yet</span>}
                </div>
                <div className="flex gap-2">
                  <input
                    value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                    placeholder="Type a skill and press Enter..."
                    className="flex-1 rounded-xl bg-white/60 backdrop-blur-sm px-4 py-2.5 text-sm ring-1 ring-gray-200/60 focus:outline-none focus:ring-2 focus:ring-aiva-purple/30 transition-shadow"
                  />
                  <Button variant="secondary" size="sm" onClick={addSkill}>
                    <Plus size={14} /> Add
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <GlassField label="LinkedIn" value={linkedin} onChange={setLinkedin} placeholder="https://linkedin.com/in/..." icon={<Linkedin size={14} />} />
                <GlassField label="GitHub" value={github} onChange={setGithub} placeholder="https://github.com/..." icon={<Github size={14} />} />
              </div>

              <div className="pt-2">
                <AnimatedButton 
                  onClick={saveProfessional} 
                  disabled={saving}
                  loading={saving}
                  icon={<Check size={16} />}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </AnimatedButton>
              </div>
            </motion.div>
          )}

          {/* ── Preferences ── */}
          {activeTab === "preferences" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <SettingsSection title="Notifications" description="Choose how you want to be notified">
                <ToggleRow label="Email notifications" desc="Receive updates and tips via email" defaultChecked />
                <ToggleRow label="Push notifications" desc="Get browser push notifications" defaultChecked />
                <ToggleRow label="Practice reminders" desc="Daily reminders to keep your streak" defaultChecked />
                <ToggleRow label="Achievement alerts" desc="Celebrate milestones and badges" defaultChecked />
              </SettingsSection>
              <SettingsSection title="Privacy" description="Control who sees your information">
                <ToggleRow label="Public profile" desc="Let others discover your profile" defaultChecked />
                <ToggleRow label="Show progress" desc="Display learning progress publicly" defaultChecked />
                <ToggleRow label="Show achievements" desc="Show earned badges on your profile" defaultChecked />
              </SettingsSection>
            </motion.div>
          )}

          {/* ── Security ── */}
          {activeTab === "security" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {/* Change password */}
              <SettingsSection title="Change Password" description="Update your password regularly for security">
                <AnimatePresence>
                  {pwdError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600">{pwdError}</motion.div>
                  )}
                  {pwdSuccess && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm text-emerald-600">✓ {pwdSuccess}</motion.div>
                  )}
                </AnimatePresence>
                <GlassField label="Current Password" value={currentPwd} onChange={setCurrentPwd} type="password" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <GlassField label="New Password" value={newPwd} onChange={setNewPwd} type="password" />
                  <GlassField label="Confirm New Password" value={confirmPwd} onChange={setConfirmPwd} type="password" />
                </div>
                <div>
                  <AnimatedButton onClick={handleChangePassword} icon={<Shield size={16} />}>
                    Update Password
                  </AnimatedButton>
                </div>
              </SettingsSection>

              {/* Sessions */}
              <SettingsSection title="Active Sessions" description="Manage your login sessions across devices">
                {sessions.length > 1 && (
                  <div className="flex justify-end -mt-2">
                    <button onClick={() => authService.revokeAllSessions(user.id)}
                      className="text-xs text-red-500 hover:text-red-600 font-semibold transition-colors">
                      Revoke all others
                    </button>
                  </div>
                )}
                {sessions.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No active sessions found</p>
                ) : (
                  <div className="space-y-2">
                    {sessions.map((s) => (
                      <div key={s.id} className="flex items-center justify-between rounded-xl bg-white/60 backdrop-blur-sm p-4 ring-1 ring-gray-200/50">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${s.isCurrent ? "bg-emerald-500" : "bg-gray-300"}`} />
                          <div>
                            <div className="text-sm font-semibold text-gray-800">{s.browser} · {s.device}</div>
                            <div className="text-xs text-gray-500">{s.ip} · Last active {new Date(s.lastActive).toLocaleDateString()}</div>
                          </div>
                        </div>
                        {s.isCurrent ? (
                          <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full">This device</span>
                        ) : (
                          <button onClick={() => authService.revokeSession(user.id, s.id)}
                            className="text-xs text-red-500 hover:text-red-600 font-semibold transition-colors">Revoke</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </SettingsSection>
            </motion.div>
          )}
        </div>
      </div>
    </InteractiveCard>
    </motion.div>
  );
}

/* ── Helper components ── */

function StatCard({ icon: Icon, label, value, color, iconColor }: {
  icon: React.ElementType; label: string; value: number; color: string; iconColor: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`rounded-2xl bg-gradient-to-br ${color} p-4 ring-1 ring-gray-200/30 dark:ring-white/10 shadow-sm`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-white/90 dark:bg-gray-800/90 flex items-center justify-center ${iconColor} shadow-sm`}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-black text-gray-900 dark:text-white leading-none"
          >
            {value}
          </motion.div>
          <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-tight">{label}</div>
        </div>
      </div>
    </motion.div>
  );
}

function GlassField({ label, type = "text", value, onChange, placeholder, disabled = false, icon }: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; disabled?: boolean; icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block uppercase tracking-wider">{label}</label>
      <div className="relative">
        {icon && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">{icon}</span>}
        <input
          type={type} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} disabled={disabled}
          className={`w-full rounded-xl bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm ${icon ? "pl-11" : "px-4"} pr-4 py-3 text-sm text-gray-800 dark:text-gray-200 ring-1 ring-gray-200/60 dark:ring-gray-700/60 focus:outline-none focus:ring-2 focus:ring-aiva-purple/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
        />
      </div>
    </div>
  );
}

function SettingsSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">{title}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ToggleRow({ label, desc, defaultChecked = false }: { label: string; desc: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-white/60 dark:bg-gray-900/40 backdrop-blur-sm p-4 ring-1 ring-gray-200/40 dark:ring-gray-700/40 hover:ring-gray-200/60 dark:hover:ring-gray-700/60 transition-all">
      <div>
        <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{label}</div>
        <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{desc}</div>
      </div>
      <button
        type="button" role="switch" aria-checked={checked}
        onClick={() => setChecked(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
          checked ? "bg-aiva-purple" : "bg-gray-300 dark:bg-gray-700"
        }`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`} />
      </button>
    </div>
  );
}

/**
 * Simulated authentication service for Aiva.
 * All data is persisted in localStorage — no backend required.
 */

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar: string | null;
  bio: string;
  location: string;
  website: string;
  jobTitle: string;
  company: string;
  experience: string;
  skills: string[];
  linkedin: string;
  github: string;
  createdAt: string;
  level: number;
  stats: {
    practiceHours: number;
    achievements: number;
    streak: number;
  };
  twoFactorEnabled: boolean;
  preferences: {
    theme: "auto" | "light" | "dark";
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      practice: boolean;
      achievements: boolean;
    };
    privacy: {
      profileVisibility: "public" | "private" | "friends";
      showProgress: boolean;
      showAchievements: boolean;
    };
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface SessionInfo {
  id: string;
  device: string;
  browser: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

/* ── Helpers ── */

const STORAGE_KEYS = {
  users: "aiva.users",
  tokens: "aiva.tokens",
  currentUser: "aiva.currentUser",
  sessions: "aiva.sessions",
  legacyAuth: "aiva.auth",
} as const;

function delay(ms = 400): Promise<void> {
  return new Promise((r) => setTimeout(r, ms + Math.random() * 400));
}

function uid(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function fakeJwt(): string {
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({ sub: uid(), iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 900 }),
  );
  const sig = btoa(
    Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join(""),
  );
  return `${header}.${payload}.${sig}`;
}

function getAllUsers(): Record<string, User & { passwordHash: string }> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.users) ?? "{}");
  } catch {
    return {};
  }
}

function saveUsers(users: Record<string, User & { passwordHash: string }>) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

/* ── Rate limiter (in-memory) ── */
const attempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxAttempts: number, windowMs: number): void {
  const now = Date.now();
  const entry = attempts.get(key);
  if (entry && now < entry.resetAt) {
    if (entry.count >= maxAttempts) {
      const secs = Math.ceil((entry.resetAt - now) / 1000);
      throw new Error(`Too many attempts. Please wait ${secs}s.`);
    }
    entry.count++;
  } else {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
  }
}

/* ── Device fingerprint ── */
async function getDeviceFingerprint(): Promise<string> {
  const components = [
    navigator.userAgent,
    navigator.language,
    `${screen.width}x${screen.height}`,
    String(new Date().getTimezoneOffset()),
    String(navigator.hardwareConcurrency ?? ""),
  ];
  const msgBuffer = new TextEncoder().encode(components.join("|"));
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/* Simple "hash" for demo */
async function simpleHash(password: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(password + "aiva-salt-2024");
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/* ── Service ── */

class AuthenticationService {
  /* ---------- Login ---------- */
  async login(email: string, password: string, rememberMe = false): Promise<{ user: User; tokens: AuthTokens }> {
    checkRateLimit(`login:${email}`, 5, 15 * 60 * 1000);
    await delay();

    const users = getAllUsers();
    const hash = await simpleHash(password);
    const entry = Object.values(users).find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!entry || entry.passwordHash !== hash) {
      throw new Error("Invalid email or password");
    }

    const tokens = this.generateTokens(rememberMe);
    this.setTokens(tokens);
    this.setCurrentUser(entry);

    const fp = await getDeviceFingerprint();
    const session: SessionInfo = {
      id: uid(),
      device: /Mobile|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
      browser: this.getBrowserName(),
      ip: "192.168.1." + Math.floor(Math.random() * 255),
      lastActive: new Date().toISOString(),
      isCurrent: true,
    };
    this.addSession(entry.id, session, fp);

    return { user: this.stripPassword(entry), tokens };
  }

  /* ---------- Register ---------- */
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    username: string;
    dateOfBirth?: string;
  }): Promise<{ user: User; tokens: AuthTokens }> {
    checkRateLimit("register", 3, 15 * 60 * 1000);
    await delay(600);

    const users = getAllUsers();

    const emailTaken = Object.values(users).some((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (emailTaken) throw new Error("Email already registered");

    const usernameTaken = Object.values(users).some((u) => u.username.toLowerCase() === data.username.toLowerCase());
    if (usernameTaken) throw new Error("Username already taken");

    const hash = await simpleHash(data.password);
    const id = uid();

    const newUser: User & { passwordHash: string } = {
      id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      avatar: null,
      bio: "",
      location: "",
      website: "",
      jobTitle: "",
      company: "",
      experience: "",
      skills: [],
      linkedin: "",
      github: "",
      createdAt: new Date().toISOString(),
      level: 1,
      stats: { practiceHours: 0, achievements: 0, streak: 0 },
      twoFactorEnabled: false,
      preferences: {
        theme: "auto",
        language: "en",
        notifications: { email: true, push: true, practice: true, achievements: true },
        privacy: { profileVisibility: "public", showProgress: true, showAchievements: true },
      },
      passwordHash: hash,
    };

    users[id] = newUser;
    saveUsers(users);

    const tokens = this.generateTokens(false);
    this.setTokens(tokens);
    this.setCurrentUser(newUser);

    return { user: this.stripPassword(newUser), tokens };
  }

  /* ---------- Social / OAuth Login (simulated) ---------- */
  async socialLogin(provider: "google" | "github"): Promise<{ user: User; tokens: AuthTokens }> {
    await delay(800);

    const socialEmail =
      provider === "google" ? "demo.user@gmail.com" : "demo-user@github.com";
    const socialName =
      provider === "google"
        ? { first: "Demo", last: "User", username: "demo_google" }
        : { first: "Demo", last: "Dev", username: "demo_github" };

    const users = getAllUsers();
    let entry = Object.values(users).find(
      (u) => u.email.toLowerCase() === socialEmail.toLowerCase(),
    );

    if (!entry) {
      const hash = await simpleHash(`social-${provider}-${Date.now()}`);
      const id = uid();
      entry = {
        id,
        email: socialEmail,
        firstName: socialName.first,
        lastName: socialName.last,
        username: socialName.username,
        avatar: null,
        bio: `Signed up via ${provider === "google" ? "Google" : "GitHub"}`,
        location: "",
        website: "",
        jobTitle: "",
        company: "",
        experience: "",
        skills: [],
        linkedin: "",
        github: provider === "github" ? "https://github.com/demo-user" : "",
        createdAt: new Date().toISOString(),
        level: 1,
        stats: { practiceHours: 0, achievements: 0, streak: 0 },
        twoFactorEnabled: false,
        preferences: {
          theme: "auto",
          language: "en",
          notifications: { email: true, push: true, practice: true, achievements: true },
          privacy: { profileVisibility: "public", showProgress: true, showAchievements: true },
        },
        passwordHash: hash,
      };
      users[id] = entry;
      saveUsers(users);
    }

    const tokens = this.generateTokens(true);
    this.setTokens(tokens);
    this.setCurrentUser(entry);

    const fp = await getDeviceFingerprint();
    const session: SessionInfo = {
      id: uid(),
      device: /Mobile|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
      browser: this.getBrowserName(),
      ip: "192.168.1." + Math.floor(Math.random() * 255),
      lastActive: new Date().toISOString(),
      isCurrent: true,
    };
    this.addSession(entry.id, session, fp);

    return { user: this.stripPassword(entry), tokens };
  }

  /* ---------- Logout ---------- */
  async logout(): Promise<void> {
    await delay(200);
    localStorage.removeItem(STORAGE_KEYS.tokens);
    localStorage.removeItem(STORAGE_KEYS.currentUser);
    localStorage.removeItem(STORAGE_KEYS.sessions);
    localStorage.removeItem(STORAGE_KEYS.legacyAuth);
  }

  /* ---------- Get current user ---------- */
  async getCurrentUser(): Promise<User | null> {
    const tokens = this.getTokens();
    if (!tokens || Date.now() > tokens.expiresAt) {
      this.clearTokens();
      return null;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEYS.currentUser);
      if (!raw) return null;
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  /* ---------- Update profile ---------- */
  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    await delay(300);
    const users = getAllUsers();
    const entry = users[userId];
    if (!entry) throw new Error("User not found");

    Object.assign(entry, {
      ...data,
      preferences: { ...entry.preferences, ...(data.preferences ?? {}) },
      stats: { ...entry.stats, ...(data.stats ?? {}) },
      id: entry.id,
      passwordHash: entry.passwordHash,
    });

    users[userId] = entry;
    saveUsers(users);
    this.setCurrentUser(entry);

    return this.stripPassword(entry);
  }

  /* ---------- Change password ---------- */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    await delay(400);
    const users = getAllUsers();
    const entry = users[userId];
    if (!entry) throw new Error("User not found");

    const currentHash = await simpleHash(currentPassword);
    if (currentHash !== entry.passwordHash) throw new Error("Current password is incorrect");

    entry.passwordHash = await simpleHash(newPassword);
    users[userId] = entry;
    saveUsers(users);
  }

  /* ---------- Forgot / Reset password (simulated) ---------- */
  async requestPasswordReset(email: string): Promise<void> {
    checkRateLimit(`reset:${email}`, 3, 15 * 60 * 1000);
    await delay(600);
  }

  async resetPassword(_token: string, newPassword: string): Promise<void> {
    await delay(500);
    void newPassword;
  }

  /* ---------- Sessions ---------- */
  getSessions(userId: string): SessionInfo[] {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.sessions) ?? "{}") as Record<string, SessionInfo[]>;
      return all[userId] ?? [];
    } catch {
      return [];
    }
  }

  revokeSession(userId: string, sessionId: string): void {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.sessions) ?? "{}") as Record<string, SessionInfo[]>;
      if (all[userId]) {
        all[userId] = all[userId].filter((s) => s.id !== sessionId);
        localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(all));
      }
    } catch {
      /* ignore */
    }
  }

  revokeAllSessions(userId: string): void {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.sessions) ?? "{}") as Record<string, SessionInfo[]>;
      if (all[userId]) {
        all[userId] = all[userId].filter((s) => s.isCurrent);
        localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(all));
      }
    } catch {
      /* ignore */
    }
  }

  /* ---------- Private helpers ---------- */
  private addSession(userId: string, session: SessionInfo, _fingerprint: string) {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.sessions) ?? "{}") as Record<string, SessionInfo[]>;
      if (!all[userId]) all[userId] = [];
      all[userId] = all[userId].map((s) => ({ ...s, isCurrent: false }));
      all[userId].push(session);
      if (all[userId].length > 10) all[userId] = all[userId].slice(-10);
      localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(all));
    } catch {
      /* ignore */
    }
  }

  private generateTokens(longLived: boolean): AuthTokens {
    return {
      accessToken: fakeJwt(),
      refreshToken: fakeJwt(),
      expiresAt: Date.now() + (longLived ? 7 * 24 * 60 * 60 * 1000 : 15 * 60 * 1000),
    };
  }

  private setTokens(tokens: AuthTokens) {
    localStorage.setItem(STORAGE_KEYS.tokens, JSON.stringify(tokens));
  }

  private getTokens(): AuthTokens | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.tokens);
      return raw ? (JSON.parse(raw) as AuthTokens) : null;
    } catch {
      return null;
    }
  }

  private clearTokens() {
    localStorage.removeItem(STORAGE_KEYS.tokens);
    localStorage.removeItem(STORAGE_KEYS.currentUser);
  }

  private setCurrentUser(user: User | (User & { passwordHash: string })) {
    const clean = this.stripPassword(user as User & { passwordHash: string });
    localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(clean));
    localStorage.setItem(
      STORAGE_KEYS.legacyAuth,
      JSON.stringify({ name: `${clean.firstName} ${clean.lastName}`.trim(), email: clean.email }),
    );
  }

  private stripPassword(user: User & { passwordHash?: string }): User {
    const { passwordHash: _, ...clean } = user;
    return clean as User;
  }

  private getBrowserName(): string {
    const ua = navigator.userAgent;
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Edg")) return "Edge";
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Safari")) return "Safari";
    return "Unknown";
  }
}

export const authService = new AuthenticationService();

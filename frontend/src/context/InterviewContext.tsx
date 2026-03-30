import { createContext, useContext, useState, type ReactNode } from "react";

export type SessionStatus = "idle" | "setup" | "active" | "completed";

interface Question {
  id: string;
  level: string;
  question: string;
  type: string;
}

interface InterviewState {
  role: string;
  language: string;
  level: string;
  status: SessionStatus;
  elapsedSeconds: number;
  questions: Question[];
  roleId: string;
}

interface InterviewContextValue {
  state: InterviewState;
  setRole: (role: string) => void;
  setRoleId: (roleId: string) => void;
  setLanguage: (lang: string) => void;
  setLevel: (level: string) => void;
  setStatus: (status: SessionStatus) => void;
  setElapsed: (seconds: number) => void;
  setQuestions: (questions: Question[]) => void;
  reset: () => void;
  resetForNewSession: () => void;
}

const defaults: InterviewState = {
  role: "",
  language: "English",
  level: "Intermediate",
  status: "idle",
  elapsedSeconds: 0,
  questions: [],
  roleId: "",
};

const InterviewContext = createContext<InterviewContextValue | null>(null);

export function InterviewProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InterviewState>(defaults);

  const ctx: InterviewContextValue = {
    state,
    setRole: (role) => setState((s) => ({ ...s, role })),
    setRoleId: (roleId) => setState((s) => ({ ...s, roleId })),
    setLanguage: (language) => setState((s) => ({ ...s, language })),
    setLevel: (level) => setState((s) => ({ ...s, level })),
    setStatus: (status) => setState((s) => ({ ...s, status })),
    setElapsed: (elapsedSeconds) =>
      setState((s) => ({ ...s, elapsedSeconds })),
    setQuestions: (questions) => setState((s) => ({ ...s, questions })),
    reset: () => setState(defaults),
    resetForNewSession: () => setState((s) => ({
      ...defaults,
      role: s.role,
      roleId: s.roleId,
      level: s.level,
      language: s.language
    })),
  };

  return (
    <InterviewContext.Provider value={ctx}>
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterview() {
  const ctx = useContext(InterviewContext);
  if (!ctx) throw new Error("useInterview must be used within InterviewProvider");
  return ctx;
}


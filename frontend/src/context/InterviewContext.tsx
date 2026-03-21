import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type SessionStatus = "idle" | "setup" | "active" | "completed";

interface InterviewState {
  role: string;
  language: string;
  level: string;
  status: SessionStatus;
  elapsedSeconds: number;
}

interface InterviewContextValue {
  state: InterviewState;
  setRole: (role: string) => void;
  setLanguage: (lang: string) => void;
  setLevel: (level: string) => void;
  setStatus: (status: SessionStatus) => void;
  setElapsed: (seconds: number) => void;
  reset: () => void;
}

const defaults: InterviewState = {
  role: "",
  language: "English",
  level: "Intermediate",
  status: "idle",
  elapsedSeconds: 0,
};

const InterviewContext = createContext<InterviewContextValue | null>(null);

export function InterviewProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InterviewState>(defaults);

  const ctx: InterviewContextValue = {
    state,
    setRole: (role) => setState((s) => ({ ...s, role })),
    setLanguage: (language) => setState((s) => ({ ...s, language })),
    setLevel: (level) => setState((s) => ({ ...s, level })),
    setStatus: (status) => setState((s) => ({ ...s, status })),
    setElapsed: (elapsedSeconds) =>
      setState((s) => ({ ...s, elapsedSeconds })),
    reset: () => setState(defaults),
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

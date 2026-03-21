import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authService, type User } from "@/services/authService";

/* ── Context type ── */
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    username: string;
    dateOfBirth?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  socialLogin: (provider: "google" | "github") => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

/* ── Provider ── */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    let cancelled = false;
    authService
      .getCurrentUser()
      .then((u) => {
        if (!cancelled) {
          setUser(u);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    const { user: u } = await authService.login(email, password, rememberMe);
    setUser(u);
  }, []);

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      username: string;
      dateOfBirth?: string;
    }) => {
      const { user: u } = await authService.register(data);
      setUser(u);
    },
    [],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const socialLogin = useCallback(async (provider: "google" | "github") => {
    const { user: u } = await authService.socialLogin(provider);
    setUser(u);
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<User>) => {
      if (!user) return;
      const updated = await authService.updateProfile(user.id, data);
      setUser(updated);
    },
    [user],
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      if (!user) return;
      await authService.changePassword(user.id, currentPassword, newPassword);
    },
    [user],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        socialLogin,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ── Hook ── */
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  AuthApiError,
  type AuthUser,
} from "@/lib/auth/auth-types";
import {
  getSession,
  login,
  logout,
} from "@/lib/auth/auth-service";

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  error: string | null;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<AuthUser | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const currentUser = await getSession();
      if (!currentUser) {
        setUser(null);
        setStatus("unauthenticated");
        return null;
      }
      setUser(currentUser);
      setStatus("authenticated");
      return currentUser;
    } catch (sessionError) {
      if (sessionError instanceof AuthApiError && sessionError.status === 401) {
        setUser(null);
        setStatus("unauthenticated");
        return null;
      }

      setUser(null);
      setStatus("error");
      setError(
        sessionError instanceof Error
          ? sessionError.message
          : "Your session could not be verified.",
      );
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function initializeSession() {
      try {
        const currentUser = await getSession();
        if (!active) return;
        if (!currentUser) {
          setUser(null);
          setStatus("unauthenticated");
          return;
        }
        setUser(currentUser);
        setStatus("authenticated");
      } catch (sessionError) {
        if (!active) return;
        if (sessionError instanceof AuthApiError && sessionError.status === 401) {
          setUser(null);
          setStatus("unauthenticated");
          return;
        }

        setUser(null);
        setStatus("error");
        setError(
          sessionError instanceof Error
            ? sessionError.message
            : "Your session could not be verified.",
        );
      }
    }

    void initializeSession();
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const authenticatedUser = await login(email, password);
    setUser(authenticatedUser);
    setStatus("authenticated");
    setError(null);
    return authenticatedUser;
  }, []);

  const signOut = useCallback(async () => {
    await logout();
    setUser(null);
    setStatus("unauthenticated");
    setError(null);
  }, []);

  const value = useMemo(
    () => ({ user, status, error, signIn, signOut, refreshSession }),
    [user, status, error, signIn, signOut, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider.");
  return context;
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { api, setApiToken } from "@/lib/api";
import type { User, Workspace } from "@/types/api";

const TOKEN_KEY = "clientflow.token";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  workspace: Workspace | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);

  // On launch: restore a saved token and confirm it's still valid.
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);

        if (!token) {
          if (active) setStatus("unauthenticated");
          return;
        }

        setApiToken(token);
        const session = await api.me();

        if (!active) return;
        setUser(session.user);
        setWorkspace(session.workspace);
        setStatus("authenticated");
      } catch {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        setApiToken(null);
        if (active) setStatus("unauthenticated");
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await api.login(email, password);
    await SecureStore.setItemAsync(TOKEN_KEY, result.token);
    setApiToken(result.token);
    setUser(result.user);
    setWorkspace(result.workspace);
    setStatus("authenticated");
  }, []);

  const signOut = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setApiToken(null);
    setUser(null);
    setWorkspace(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, workspace, signIn, signOut }),
    [status, user, workspace, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}

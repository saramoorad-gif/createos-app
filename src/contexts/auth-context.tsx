"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getSupabase,
  isSupabaseConfigured,
  setAuthCookie,
  clearAuthCookie,
  type Profile,
} from "@/lib/supabase";
import { logError } from "@/lib/error-logger";
import type { User } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // No Supabase configured — show empty state, redirect to login
      setLoading(false);
      return;
    }

    const sb = getSupabase();

    sb.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Set cookie so middleware can detect auth
        if (session.access_token) {
          setAuthCookie(session.access_token);
        }
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Update cookie on every auth change
        if (session.access_token) {
          setAuthCookie(session.access_token);
        }
        fetchProfile(session.user.id);
      } else {
        clearAuthCookie();
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const sb = getSupabase();
      const { data, error } = await sb
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        // PGRST116 = "no rows" — expected during the signup race where
        // Supabase auth state updates before /api/signup/create-profile
        // has finished inserting the profile row. A subsequent
        // refreshProfile() call will pick it up. Don't pollute error logs.
        if (error.code !== "PGRST116") {
          console.error("Profile fetch error:", error);
          logError({
            source: "auth-context.fetchProfile",
            message: error.message,
            metadata: { userId, code: error.code },
          });
        }
      }
      setProfile(data as Profile | null);
    } catch (e) {
      console.error("Failed to fetch profile:", e);
      logError({
        source: "auth-context.fetchProfile",
        message: e instanceof Error ? e.message : "Unknown error",
        stack: e instanceof Error ? e.stack : undefined,
        metadata: { userId },
      });
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    const sb = getSupabase();
    await sb.auth.signOut();
    clearAuthCookie();
    setUser(null);
    setProfile(null);
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile: async () => { if (user) await fetchProfile(user.id); } }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

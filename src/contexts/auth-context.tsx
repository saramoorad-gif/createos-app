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
import type { User } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
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
    const sb = getSupabase();
    const { data } = await sb
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    setProfile(data as Profile | null);
    setLoading(false);
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
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

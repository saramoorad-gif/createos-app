import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  if (!supabaseUrl || !supabaseAnonKey) {
    _supabase = createClient(
      "https://placeholder.supabase.co",
      "placeholder-key"
    );
  } else {
    _supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Store in both localStorage (for client) and cookies (for middleware)
        flowType: "pkce",
        detectSessionInUrl: true,
        persistSession: true,
        storageKey: "sb-auth-token",
      },
    });
  }

  return _supabase;
}

// Helper: set auth cookie after sign-in so middleware can read it
export function setAuthCookie(accessToken: string) {
  if (typeof document !== "undefined") {
    document.cookie = `sb-auth-token=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax; Secure`;
  }
}

export function clearAuthCookie() {
  if (typeof document !== "undefined") {
    document.cookie = "sb-auth-token=; path=/; max-age=0";
  }
}

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  account_type: "free" | "ugc" | "ugc_influencer" | "agency";
  agency_name: string | null;
  agency_plan: "starter" | "growth" | null;
  roster_size: string | null;
  agency_role: string | null;
  has_agency: boolean;
  linked_agency_id: string | null;
  avatar_url: string | null;
  created_at: string;
  google_connected?: boolean;
  google_access_token?: string | null;
  google_refresh_token?: string | null;
  docusign_connected?: boolean;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  subscription_status?: "active" | "past_due" | "cancelled" | "trialing" | null;
  referral_code?: string | null;
  referred_by_code?: string | null;
  referral_applied?: boolean;
};

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Lazy-initialize to avoid crashing during SSR when env vars aren't set
let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a dummy client that won't crash — auth calls will fail gracefully
    _supabase = createClient(
      "https://placeholder.supabase.co",
      "placeholder-key"
    );
  } else {
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  return _supabase;
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
};

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

"use client";

import { useState, useEffect } from "react";
import { getSupabase, isSupabaseConfigured } from "./supabase";

// Generic hook to fetch data from Supabase
export function useSupabaseQuery<T>(
  table: string,
  options?: {
    select?: string;
    eq?: { column: string; value: string };
    order?: { column: string; ascending?: boolean };
    limit?: number;
  }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stringify options so the effect only re-runs when actual values change
  // (prevents infinite loops from new object references each render)
  const optionsKey = JSON.stringify(options || {});

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetch() {
      const sb = getSupabase();
      const opts = JSON.parse(optionsKey);
      let query = sb.from(table).select(opts?.select || "*");

      if (opts?.eq) {
        query = query.eq(opts.eq.column, opts.eq.value);
      }
      if (opts?.order) {
        query = query.order(opts.order.column, { ascending: opts.order.ascending ?? false });
      }
      if (opts?.limit) {
        query = query.limit(opts.limit);
      }

      const { data: result, error: err } = await query;

      if (cancelled) return;

      if (err) {
        setError(err.message);
      } else {
        setData(result as T[]);
      }
      setLoading(false);
    }

    fetch();

    return () => {
      cancelled = true;
    };
  }, [table, optionsKey]);

  return { data, loading, error, setData };
}

// Mutation hook
export function useSupabaseMutation(table: string) {
  const [loading, setLoading] = useState(false);

  async function insert(data: Record<string, unknown>) {
    if (!isSupabaseConfigured()) return null;
    setLoading(true);
    const sb = getSupabase();
    const { data: result, error } = await sb.from(table).insert(data).select().single();
    setLoading(false);
    if (error) throw error;
    return result;
  }

  async function update(id: string, data: Record<string, unknown>) {
    if (!isSupabaseConfigured()) return null;
    setLoading(true);
    const sb = getSupabase();
    const { data: result, error } = await sb.from(table).update(data).eq("id", id).select().single();
    setLoading(false);
    if (error) throw error;
    return result;
  }

  async function remove(id: string) {
    if (!isSupabaseConfigured()) return;
    setLoading(true);
    const sb = getSupabase();
    const { error } = await sb.from(table).delete().eq("id", id);
    setLoading(false);
    if (error) throw error;
  }

  return { insert, update, remove, loading };
}

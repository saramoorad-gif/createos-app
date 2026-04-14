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

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    async function fetch() {
      const sb = getSupabase();
      let query = sb.from(table).select(options?.select || "*");

      if (options?.eq) {
        query = query.eq(options.eq.column, options.eq.value);
      }
      if (options?.order) {
        query = query.order(options.order.column, { ascending: options.order.ascending ?? false });
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data: result, error: err } = await query;

      if (err) {
        setError(err.message);
      } else {
        setData(result as T[]);
      }
      setLoading(false);
    }

    fetch();
  }, [table]);

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

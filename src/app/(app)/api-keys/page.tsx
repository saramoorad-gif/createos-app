"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/global/toast";
import { hasFeatureAccess } from "@/lib/feature-gates";
import { PageHeader } from "@/components/layout/page-header";

type Key = {
  id: string;
  label: string;
  prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

export default function ApiKeysPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [keys, setKeys] = useState<Key[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [revealed, setRevealed] = useState<{ key: string; label: string } | null>(null);

  // Gate UI to Agency Growth. Server enforces this too — this is just
  // the friendly "you can't use this" panel for Starter/creator users.
  const canUse = hasFeatureAccess(
    profile?.account_type,
    "api-access",
    (profile as any)?.agency_plan
  );

  async function getToken(): Promise<string | null> {
    const { getSupabase } = await import("@/lib/supabase");
    const sb = getSupabase();
    const { data: { session } } = await sb.auth.getSession();
    return session?.access_token ?? null;
  }

  async function load() {
    setLoading(true);
    const token = await getToken();
    if (!token) { setLoading(false); return; }
    const res = await fetch("/api/api-keys", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setKeys(data.keys || []);
    } else if (res.status !== 403) {
      toast("error", "Could not load keys");
    }
    setLoading(false);
  }

  useEffect(() => { if (canUse) load(); else setLoading(false); }, [canUse]); // eslint-disable-line

  async function createKey() {
    if (!newLabel.trim()) { toast("error", "Give the key a label first"); return; }
    setCreating(true);
    try {
      const token = await getToken();
      if (!token) { toast("error", "Please sign in again"); return; }
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ label: newLabel.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { toast("error", data.error || "Failed to create"); return; }
      setRevealed({ key: data.key, label: data.label });
      setNewLabel("");
      load();
    } finally {
      setCreating(false);
    }
  }

  async function revoke(id: string) {
    if (!confirm("Revoke this API key? Anything using it will start getting 401s immediately.")) return;
    const token = await getToken();
    if (!token) return;
    const res = await fetch(`/api/api-keys?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) { toast("error", "Could not revoke"); return; }
    toast("success", "Key revoked");
    load();
  }

  if (!canUse) {
    return (
      <div>
        <PageHeader headline={<>API <em className="italic text-[#7BAFC8]">Access</em></>} subheading="Programmatic access for Agency Growth." />
        <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-8 max-w-2xl">
          <p className="text-[14px] font-sans text-[#1A2C38] mb-4">
            API access is included with <strong>Agency Growth</strong>. Generate keys, pull deals,
            commissions, and roster data into your CRM, BI tool, or accounting system.
          </p>
          <Link
            href="/checkout?plan=agency_growth"
            className="inline-block bg-[#1A2C38] text-white text-[13px] font-sans font-600 px-4 py-2.5 rounded-[8px] hover:bg-[#0F1E28]"
          >
            Upgrade to Growth — $249/mo
          </Link>
          <p className="text-[12px] font-sans text-[#8AAABB] mt-4">
            <Link href="/docs/api" className="underline underline-offset-2 text-[#3D6E8A]">Read the API docs →</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader headline={<>API <em className="italic text-[#7BAFC8]">Access</em></>} subheading={
        <>Read-only API for deals, commissions, and roster.{" "}
          <Link href="/docs/api" className="underline underline-offset-2">Docs →</Link>
        </>
      } />

      <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-5 mb-6 max-w-2xl">
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#8AAABB] mb-2">Generate a key</p>
        <div className="flex gap-2">
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Label (e.g. Notion sync, Looker)"
            className="flex-1 h-[40px] rounded-[8px] border border-[#D8E8EE] px-3 text-[13px] font-sans text-[#1A2C38]"
          />
          <button
            onClick={createKey}
            disabled={creating || !newLabel.trim()}
            className="px-4 h-[40px] rounded-[8px] bg-[#1A2C38] text-white text-[13px] font-sans hover:bg-[#0F1E28] disabled:opacity-50"
            style={{ fontWeight: 600 }}
          >
            {creating ? "Creating…" : "Generate"}
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#D8E8EE] rounded-[10px] overflow-hidden max-w-2xl">
        <table className="w-full text-[13px] font-sans">
          <thead className="bg-[#FAF8F4] text-[11px] font-mono uppercase tracking-[0.14em] text-[#8AAABB]">
            <tr>
              <th className="text-left px-4 py-2.5">Label</th>
              <th className="text-left px-4 py-2.5">Prefix</th>
              <th className="text-left px-4 py-2.5">Last used</th>
              <th className="text-left px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-[#8AAABB]">Loading…</td></tr>
            )}
            {!loading && keys && keys.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-[#8AAABB]">No keys yet. Generate one above.</td></tr>
            )}
            {!loading && keys && keys.map((k) => (
              <tr key={k.id} className="border-t border-[#F0EAE0]">
                <td className="px-4 py-3 text-[#1A2C38]">{k.label}</td>
                <td className="px-4 py-3 font-mono text-[12px] text-[#3D6E8A]">{k.prefix}…</td>
                <td className="px-4 py-3 text-[#4A6070]">
                  {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3">
                  {k.revoked_at ? (
                    <span className="text-[11px] font-mono uppercase text-red-700">revoked</span>
                  ) : (
                    <span className="text-[11px] font-mono uppercase text-emerald-700">active</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {!k.revoked_at && (
                    <button
                      onClick={() => revoke(k.id)}
                      className="text-[12px] text-red-700 underline underline-offset-2"
                    >
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {revealed && (
        <div
          className="fixed inset-0 z-50 bg-[#0F1E28]/50 flex items-center justify-center px-4"
          onClick={() => setRevealed(null)}
        >
          <div
            className="bg-white border border-[#D8E8EE] rounded-[12px] p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#8AAABB] mb-2">New key</p>
            <h3 className="font-serif text-[22px] text-[#0F1E28] mb-2">{revealed.label}</h3>
            <p className="text-[13px] font-sans text-[#4A6070] mb-3">
              Copy this now — we don’t store the plaintext, so you can’t see it again. Store it in
              your secret manager.
            </p>
            <div className="flex gap-2 mb-4">
              <input
                readOnly
                value={revealed.key}
                onFocus={(e) => e.currentTarget.select()}
                className="flex-1 h-[40px] rounded-[8px] border border-[#D8E8EE] px-3 text-[12px] font-mono"
              />
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(revealed.key);
                  toast("success", "Copied");
                }}
                className="px-3 h-[40px] rounded-[8px] bg-[#0F1E28] text-white text-[12px]"
                style={{ fontWeight: 600 }}
              >
                Copy
              </button>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setRevealed(null)}
                className="text-[12px] font-sans text-[#8AAABB]"
              >
                I’ve saved it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

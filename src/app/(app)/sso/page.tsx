"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/global/toast";
import { hasFeatureAccess } from "@/lib/feature-gates";
import { PageHeader } from "@/components/layout/page-header";

type SsoConfig = {
  id: string;
  domain: string;
  idp_type: string;
  idp_metadata_url: string;
  status: "pending_review" | "active" | "rejected";
  created_at: string;
  activated_at: string | null;
};

const idpOptions = [
  { value: "okta", label: "Okta" },
  { value: "google", label: "Google Workspace" },
  { value: "entra", label: "Microsoft Entra ID (Azure AD)" },
  { value: "onelogin", label: "OneLogin" },
  { value: "jumpcloud", label: "JumpCloud" },
  { value: "other", label: "Other SAML 2.0 IdP" },
];

export default function SsoPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [config, setConfig] = useState<SsoConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [domain, setDomain] = useState("");
  const [idpType, setIdpType] = useState("okta");
  const [metadataUrl, setMetadataUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canUse = hasFeatureAccess(
    profile?.account_type,
    "sso",
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
    const res = await fetch("/api/sso/config", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setConfig(data.config);
      if (data.config) {
        setDomain(data.config.domain);
        setIdpType(data.config.idp_type);
        setMetadataUrl(data.config.idp_metadata_url);
      }
    }
    setLoading(false);
  }

  useEffect(() => { if (canUse) load(); else setLoading(false); }, [canUse]); // eslint-disable-line

  async function submit() {
    if (!domain.trim() || !metadataUrl.trim()) { toast("error", "Domain and metadata URL are required"); return; }
    setSubmitting(true);
    try {
      const token = await getToken();
      if (!token) { toast("error", "Please sign in again"); return; }
      const res = await fetch("/api/sso/config", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ domain: domain.trim(), idp_type: idpType, idp_metadata_url: metadataUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { toast("error", data.error || "Submission failed"); return; }
      toast("success", "Submitted — we’ll email you within 1 business day");
      load();
    } finally {
      setSubmitting(false);
    }
  }

  if (!canUse) {
    return (
      <div>
        <PageHeader headline={<>SSO <em className="italic text-[#7BAFC8]">/ SAML</em></>} subheading="Single sign-on for your agency team." />
        <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-8 max-w-2xl">
          <p className="text-[14px] font-sans text-[#1A2C38] mb-4">
            SSO is included with <strong>Agency Growth</strong>. Authenticate your team through
            Okta, Google Workspace, Microsoft Entra ID, or any SAML 2.0 IdP.
          </p>
          <Link
            href="/checkout?plan=agency_growth"
            className="inline-block bg-[#1A2C38] text-white text-[13px] font-sans font-600 px-4 py-2.5 rounded-[8px] hover:bg-[#0F1E28]"
          >
            Upgrade to Growth — $249/mo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader headline={<>SSO <em className="italic text-[#7BAFC8]">/ SAML</em></>} subheading="Configure SAML 2.0 single sign-on for your agency team." />

      {config && config.status === "active" && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-[10px] p-4 mb-6 max-w-2xl">
          <p className="text-[13px] font-sans text-emerald-900" style={{ fontWeight: 600 }}>
            ✓ SSO active for <span className="font-mono">{config.domain}</span>
          </p>
          <p className="text-[12px] font-sans text-emerald-800 mt-1">
            Team members at this domain can sign in via your IdP from <Link href="/login" className="underline">the login page</Link>.
          </p>
        </div>
      )}

      {config && config.status === "pending_review" && (
        <div className="bg-amber-50 border border-amber-200 rounded-[10px] p-4 mb-6 max-w-2xl">
          <p className="text-[13px] font-sans text-amber-900" style={{ fontWeight: 600 }}>
            Submitted — pending activation
          </p>
          <p className="text-[12px] font-sans text-amber-800 mt-1">
            We received your IdP metadata for <span className="font-mono">{config.domain}</span>.
            We’ll email you within 1 business day after activation. SAML SSO requires manual setup
            on our identity provider; we don’t auto-provision.
          </p>
        </div>
      )}

      <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-6 max-w-2xl">
        <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-[#8AAABB] mb-4">
          IdP Configuration
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-[12px] font-sans font-600 text-[#1A2C38] block mb-1.5">Email domain</label>
            <input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="acme.co"
              className="w-full h-[40px] rounded-[8px] border border-[#D8E8EE] px-3 text-[13px] font-sans"
            />
            <p className="text-[11px] font-sans text-[#8AAABB] mt-1">
              Team members signing in with email addresses at this domain will route through your IdP.
            </p>
          </div>

          <div>
            <label className="text-[12px] font-sans font-600 text-[#1A2C38] block mb-1.5">Identity provider</label>
            <select
              value={idpType}
              onChange={(e) => setIdpType(e.target.value)}
              className="w-full h-[40px] rounded-[8px] border border-[#D8E8EE] px-3 text-[13px] font-sans bg-white"
            >
              {idpOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[12px] font-sans font-600 text-[#1A2C38] block mb-1.5">Metadata URL</label>
            <input
              value={metadataUrl}
              onChange={(e) => setMetadataUrl(e.target.value)}
              placeholder="https://acme.okta.com/app/.../sso/saml/metadata"
              className="w-full h-[40px] rounded-[8px] border border-[#D8E8EE] px-3 text-[13px] font-mono"
            />
            <p className="text-[11px] font-sans text-[#8AAABB] mt-1">
              The IdP metadata XML URL from your provider. We’ll mirror this into our auth backend on activation.
            </p>
          </div>
        </div>

        <button
          onClick={submit}
          disabled={submitting || loading}
          className="mt-6 px-4 h-[40px] rounded-[8px] bg-[#1A2C38] text-white text-[13px] font-sans hover:bg-[#0F1E28] disabled:opacity-50"
          style={{ fontWeight: 600 }}
        >
          {submitting ? "Submitting…" : config ? "Update configuration" : "Submit for activation"}
        </button>
      </div>

      <div className="mt-8 max-w-2xl text-[12px] font-sans text-[#4A6070]">
        <p>
          <strong>How it works:</strong> SAML 2.0 SSO requires a one-time configuration on our auth
          backend. Submit your IdP metadata above; we email you within 1 business day after we’ve
          enabled SSO for your domain. From that point on, anyone signing in with an email at your
          domain is redirected to your IdP automatically.
        </p>
      </div>
    </div>
  );
}

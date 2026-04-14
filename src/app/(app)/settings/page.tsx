// @ts-nocheck
"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/contexts/auth-context";
import { useSupabaseMutation } from "@/lib/hooks";
import { Shield, Check, Lock, CreditCard, Users, Bell, Settings as SettingsIcon } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { profile, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("account");

  if (authLoading) {
    return <div className="pt-20 text-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-[#D8E8EE] border-t-[#7BAFC8] mx-auto" /></div>;
  }

  if (!profile) {
    return <div className="pt-20 text-center"><p className="text-[14px] font-sans text-[#8AAABB]">Please sign in to access settings.</p></div>;
  }

  const isAgency = profile.account_type === "agency";
  const tabs = isAgency
    ? [{ key: "account", label: "Account", icon: SettingsIcon }, { key: "billing", label: "Billing", icon: CreditCard }, { key: "notifications", label: "Notifications", icon: Bell }, { key: "team", label: "Team", icon: Users }, { key: "agency", label: "Agency Access", icon: Shield }]
    : [{ key: "account", label: "Account", icon: SettingsIcon }, { key: "billing", label: "Billing", icon: CreditCard }, { key: "notifications", label: "Notifications", icon: Bell }, { key: "agency", label: "Agency Access", icon: Shield }];

  const inputClass = "w-full rounded-[8px] border-[1.5px] border-[#D8E8EE] px-3 py-2.5 text-[14px] font-sans text-[#1A2C38] bg-white focus:outline-none focus:border-[#7BAFC8]";
  const labelStyle = { fontWeight: 600 };
  const labelClass = "text-[11px] font-sans text-[#8AAABB] uppercase tracking-[1.5px] block mb-1.5";
  const sectionClass = "text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-4";

  return (
    <div>
      <PageHeader headline={<><em className="italic text-[#7BAFC8]">Settings</em></>} subheading="Manage your account and preferences." />
      <div className="flex gap-8">
        <div className="w-48 flex-shrink-0 space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-[13px] font-sans text-left transition-colors ${isActive ? "bg-white border-[1.5px] border-[#D8E8EE] text-[#1A2C38]" : "text-[#8AAABB] hover:text-[#4A6070] border-[1.5px] border-transparent"}`} style={{ fontWeight: isActive ? 600 : 400 }}>
                <Icon className={`h-4 w-4 ${isActive ? "text-[#7BAFC8]" : "text-[#8AAABB]"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="flex-1 min-w-0">
          {activeTab === "account" && <AccountSection profile={profile} inputClass={inputClass} labelClass={labelClass} labelStyle={labelStyle} sectionClass={sectionClass} />}
          {activeTab === "billing" && <BillingSection profile={profile} />}
          {activeTab === "notifications" && <NotificationsSection />}
          {activeTab === "team" && isAgency && <TeamSection />}
          {activeTab === "agency" && <AgencySection profile={profile} />}
        </div>
      </div>
    </div>
  );
}

function AccountSection({ profile, inputClass, labelClass, labelStyle, sectionClass }) {
  const mutation = useSupabaseMutation("profiles");
  const [form, setForm] = useState({
    full_name: profile?.full_name || "", phone: profile?.phone || "", pronouns: profile?.pronouns || "",
    bio: profile?.bio || "", location: profile?.location || "", website: profile?.website || "",
    tiktok_handle: profile?.tiktok_handle || "", instagram_handle: profile?.instagram_handle || "", youtube_handle: profile?.youtube_handle || "",
    tiktok_followers: profile?.tiktok_followers || "", instagram_followers: profile?.instagram_followers || "", youtube_followers: profile?.youtube_followers || "",
    primary_niche: profile?.primary_niche || "", content_style: profile?.content_style || "", gender: profile?.gender || "",
    rate_ugc_video: profile?.rate_ugc_video || "", rate_ig_reel: profile?.rate_ig_reel || "", rate_tiktok: profile?.rate_tiktok || "", rate_youtube: profile?.rate_youtube || "", rate_ig_story: profile?.rate_ig_story || "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function save() {
    setSaving(true);
    try { await mutation.update(profile.id, form); alert("Saved!"); } catch (e) { console.error(e); }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <p className={sectionClass} style={{ fontWeight: 600 }}>PROFILE</p>
      <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass} style={labelStyle}>Full Name</label><input type="text" value={form.full_name} onChange={e => set("full_name", e.target.value)} className={inputClass} /></div>
          <div><label className={labelClass} style={labelStyle}>Email</label><input type="email" value={profile?.email || ""} disabled className={`${inputClass} bg-[#F7F4F0] text-[#8AAABB]`} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass} style={labelStyle}>Phone</label><input type="text" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="(555) 123-4567" className={inputClass} /></div>
          <div><label className={labelClass} style={labelStyle}>Pronouns</label><select value={form.pronouns} onChange={e => set("pronouns", e.target.value)} className={inputClass}><option value="">Select...</option><option>She/Her</option><option>He/Him</option><option>They/Them</option><option>Other</option></select></div>
        </div>
        <div><label className={labelClass} style={labelStyle}>Bio</label><textarea value={form.bio} onChange={e => set("bio", e.target.value)} rows={3} placeholder="Tell brands about yourself..." className={`${inputClass} resize-none`} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass} style={labelStyle}>Location</label><input type="text" value={form.location} onChange={e => set("location", e.target.value)} placeholder="Los Angeles, CA" className={inputClass} /></div>
          <div><label className={labelClass} style={labelStyle}>Website</label><input type="url" value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://..." className={inputClass} /></div>
        </div>
      </div>

      <p className={sectionClass} style={{ fontWeight: 600 }}>SOCIAL HANDLES</p>
      <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-6 space-y-4">
        {[["TikTok", "tiktok_handle", "tiktok_followers"], ["Instagram", "instagram_handle", "instagram_followers"], ["YouTube", "youtube_handle", "youtube_followers"]].map(([label, hk, fk]) => (
          <div key={label} className="grid grid-cols-2 gap-4">
            <div><label className={labelClass} style={labelStyle}>{label} Handle</label><input type="text" value={form[hk]} onChange={e => set(hk, e.target.value)} placeholder={`@${label.toLowerCase()}`} className={inputClass} /></div>
            <div><label className={labelClass} style={labelStyle}>{label} Followers</label><input type="number" value={form[fk]} onChange={e => set(fk, e.target.value)} placeholder="0" className={inputClass} /></div>
          </div>
        ))}
      </div>

      <p className={sectionClass} style={{ fontWeight: 600 }}>NICHE & CONTENT</p>
      <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass} style={labelStyle}>Primary Niche</label><select value={form.primary_niche} onChange={e => set("primary_niche", e.target.value)} className={inputClass}><option value="">Select...</option>{["Beauty","Fashion","Lifestyle","Fitness","Food","Tech","Gaming","Travel","Wellness","Parenting"].map(n => <option key={n}>{n}</option>)}</select></div>
          <div><label className={labelClass} style={labelStyle}>Content Style</label><select value={form.content_style} onChange={e => set("content_style", e.target.value)} className={inputClass}><option value="">Select...</option>{["Educational","Entertainment","Lifestyle","Tutorial","Vlog","Review","GRWM"].map(n => <option key={n}>{n}</option>)}</select></div>
        </div>
        <div><label className={labelClass} style={labelStyle}>Gender</label><select value={form.gender} onChange={e => set("gender", e.target.value)} className={inputClass}><option value="">Prefer not to say</option><option>Female</option><option>Male</option><option>Non-binary</option></select></div>
      </div>

      <p className={sectionClass} style={{ fontWeight: 600 }}>RATE CARD</p>
      <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-6">
        <div className="grid grid-cols-2 gap-4">
          {[["UGC Video","rate_ugc_video"],["IG Reel","rate_ig_reel"],["TikTok","rate_tiktok"],["YouTube","rate_youtube"],["IG Story","rate_ig_story"]].map(([l,k]) => (
            <div key={k}><label className={labelClass} style={labelStyle}>{l}</label><input type="text" value={form[k]} onChange={e => set(k, e.target.value)} placeholder="$0 - $0" className={inputClass} /></div>
          ))}
        </div>
      </div>

      <button onClick={save} disabled={saving} className="bg-[#1E3F52] text-white rounded-[8px] px-6 py-3 text-[14px] font-sans disabled:opacity-50 hover:bg-[#2a5269]" style={{ fontWeight: 600 }}>{saving ? "Saving..." : "Save changes"}</button>
    </div>
  );
}

function BillingSection({ profile }) {
  async function manage() {
    const cid = profile?.stripe_customer_id;
    if (!cid) { window.location.href = "/pricing"; return; }
    try { const r = await fetch("/api/stripe/portal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customerId: cid, returnUrl: window.location.href }) }); const d = await r.json(); if (d.url) window.location.href = d.url; else window.location.href = "/pricing"; } catch { window.location.href = "/pricing"; }
  }
  return (
    <div className="space-y-6">
      <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-4" style={{ fontWeight: 600 }}>SUBSCRIPTION</p>
      <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-6 flex items-center justify-between">
        <div><p className="text-[15px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>Plan: {profile?.account_type || "Free"}</p><p className="text-[13px] font-sans text-[#8AAABB] mt-1">Manage subscription, payment method, and invoices</p></div>
        <button onClick={manage} className="bg-[#1E3F52] text-white rounded-[8px] px-5 py-2.5 text-[13px] font-sans hover:bg-[#2a5269]" style={{ fontWeight: 600 }}>Manage billing</button>
      </div>
      <Link href="/pricing" className="text-[13px] font-sans text-[#7BAFC8] hover:underline" style={{ fontWeight: 500 }}>View all plans →</Link>
    </div>
  );
}

function NotificationsSection() {
  const events = ["Deal stage changes", "New brand inquiry", "Invoice overdue", "Contract expiring", "Creator message", "Weekly digest"];
  const [prefs, setPrefs] = useState(Object.fromEntries(events.map(e => [e, { email: true, inApp: true }])));
  return (
    <div className="space-y-6">
      <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-4" style={{ fontWeight: 600 }}>NOTIFICATIONS</p>
      <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] overflow-hidden">
        <div className="grid grid-cols-3 gap-4 px-5 py-3 bg-[#F0EAE0] text-[9px] font-sans uppercase tracking-[2px] text-[#8AAABB] border-b border-[#D8E8EE]" style={{ fontWeight: 600 }}><span>Event</span><span className="text-center">Email</span><span className="text-center">In-App</span></div>
        {events.map(ev => (
          <div key={ev} className="grid grid-cols-3 gap-4 px-5 py-3 border-b border-[#EEE8E0] last:border-b-0 items-center">
            <span className="text-[13px] font-sans text-[#1A2C38]">{ev}</span>
            {["email", "inApp"].map(type => (
              <div key={type} className="text-center">
                <button onClick={() => setPrefs(p => ({ ...p, [ev]: { ...p[ev], [type]: !p[ev][type] } }))} className={`h-6 w-11 rounded-full transition-colors inline-flex ${prefs[ev]?.[type] ? "bg-[#7BAFC8]" : "bg-[#D8E8EE]"}`}>
                  <div className={`h-5 w-5 rounded-full bg-white shadow transition-transform mt-0.5 ${prefs[ev]?.[type] ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamSection() {
  return (
    <div className="space-y-6">
      <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-4" style={{ fontWeight: 600 }}>TEAM</p>
      <div className="text-center py-12 bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px]">
        <p className="text-[16px] font-serif italic text-[#8AAABB] mb-3">No team members yet</p>
        <button className="bg-[#1E3F52] text-white rounded-[8px] px-5 py-2.5 text-[13px] font-sans" style={{ fontWeight: 600 }}>Invite team member</button>
      </div>
    </div>
  );
}

function AgencySection({ profile }) {
  if (!profile?.has_agency) {
    return (
      <div className="space-y-6">
        <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-4" style={{ fontWeight: 600 }}>AGENCY ACCESS</p>
        <div className="text-center py-12 bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px]">
          <p className="text-[16px] font-serif italic text-[#8AAABB] mb-3">Not connected to an agency</p>
          <p className="text-[13px] font-sans text-[#4A6070]">If your agency uses Create Suite, they can send you an invite link.</p>
        </div>
      </div>
    );
  }
  const canDo = ["Create and edit deals", "Create invoices", "Upload contracts", "Add notes to deals", "Move deal stages", "Message you directly"];
  const yours = ["Your profile and bio", "Your media kit", "Your rate card", "Your billing", "Your email inbox", "Your payment details"];
  return (
    <div className="space-y-6">
      <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-4" style={{ fontWeight: 600 }}>AGENCY ACCESS</p>
      <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#D8E8EE] flex items-center gap-3">
          <Shield className="h-5 w-5 text-[#7BAFC8]" />
          <div><p className="text-[14px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>Agency Connected</p><p className="text-[12px] font-sans italic text-[#4A6070]">Your agency helps manage deals — your profile, rates, and media kit stay yours.</p></div>
        </div>
        <div className="grid grid-cols-2 divide-x divide-[#D8E8EE]">
          <div className="p-5 bg-[#F2F8FB]">
            <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#7BAFC8] mb-3" style={{ fontWeight: 600 }}>WHAT THEY CAN DO</p>
            {canDo.map(i => <div key={i} className="flex items-start gap-2 mb-2"><Check className="h-3.5 w-3.5 text-[#7BAFC8] mt-0.5 flex-shrink-0" /><span className="text-[12px] font-sans text-[#1A2C38]">{i}</span></div>)}
          </div>
          <div className="p-5 bg-[#F0EAE0]">
            <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-3" style={{ fontWeight: 600 }}>ALWAYS YOURS 🔒</p>
            {yours.map(i => <div key={i} className="flex items-start gap-2 mb-2"><Lock className="h-3.5 w-3.5 text-[#6A5040] mt-0.5 flex-shrink-0" /><span className="text-[12px] font-sans text-[#6A5040]">{i}</span></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

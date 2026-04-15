// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/contexts/auth-context";
import { useSupabaseMutation, useSupabaseQuery } from "@/lib/hooks";
import { Shield, Check, Lock, CreditCard, Users, Bell, Settings as SettingsIcon, FileText, Star, Plug, Copy } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/global/toast";

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
    ? [{ key: "account", label: "Account", icon: SettingsIcon }, { key: "billing", label: "Billing", icon: CreditCard }, { key: "integrations", label: "Integrations", icon: Plug }, { key: "notifications", label: "Notifications", icon: Bell }, { key: "team", label: "Team", icon: Users }, { key: "deals", label: "Deal Defaults", icon: FileText }, { key: "brands", label: "Brands", icon: Star }, { key: "legal", label: "Legal", icon: Shield }, { key: "agency", label: "Agency Access", icon: Shield }]
    : [{ key: "account", label: "Account", icon: SettingsIcon }, { key: "billing", label: "Billing", icon: CreditCard }, { key: "refer", label: "Refer Friends", icon: Star }, { key: "integrations", label: "Integrations", icon: Plug }, { key: "notifications", label: "Notifications", icon: Bell }, { key: "agency", label: "Agency Access", icon: Shield }];

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
          {activeTab === "account" && <AccountSection profile={profile} isAgency={isAgency} inputClass={inputClass} labelClass={labelClass} labelStyle={labelStyle} sectionClass={sectionClass} />}
          {activeTab === "billing" && <BillingSection profile={profile} />}
          {activeTab === "refer" && !isAgency && <ReferralSection profile={profile} />}
          {activeTab === "integrations" && <IntegrationsSection />}
          {activeTab === "notifications" && <NotificationsSection />}
          {activeTab === "team" && isAgency && <TeamSection />}
          {activeTab === "deals" && isAgency && <DealDefaultsSection inputClass={inputClass} labelClass={labelClass} labelStyle={labelStyle} sectionClass={sectionClass} />}
          {activeTab === "brands" && isAgency && <BrandsSection inputClass={inputClass} labelClass={labelClass} labelStyle={labelStyle} sectionClass={sectionClass} />}
          {activeTab === "legal" && isAgency && <LegalSection inputClass={inputClass} labelClass={labelClass} labelStyle={labelStyle} sectionClass={sectionClass} />}
          {activeTab === "agency" && <AgencySection profile={profile} />}
        </div>
      </div>
    </div>
  );
}

function AccountSection({ profile, isAgency, inputClass, labelClass, labelStyle, sectionClass }) {
  const { refreshProfile } = useAuth();
  const { toast } = useToast();
  const mutation = useSupabaseMutation("profiles");
  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    bio: profile?.bio || "", location: profile?.location || "", website: profile?.website || "",
    tiktok_handle: profile?.tiktok_handle || "", instagram_handle: profile?.instagram_handle || "", youtube_handle: profile?.youtube_handle || "",
    tiktok_followers: profile?.tiktok_followers || null, instagram_followers: profile?.instagram_followers || null, youtube_followers: profile?.youtube_followers || null,
    primary_niche: profile?.primary_niche || "", content_style: profile?.content_style || "", gender: profile?.gender || "",
    rate_ugc_video: profile?.rate_ugc_video || "", rate_ig_reel: profile?.rate_ig_reel || "", rate_tiktok: profile?.rate_tiktok || "", rate_youtube: profile?.rate_youtube || "", rate_ig_story: profile?.rate_ig_story || "",
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function save() {
    setSaving(true);
    try {
      // Clean data — convert empty follower strings to null for integer columns
      const cleanData = { ...form };
      if (!cleanData.tiktok_followers) cleanData.tiktok_followers = null;
      if (!cleanData.instagram_followers) cleanData.instagram_followers = null;
      if (!cleanData.youtube_followers) cleanData.youtube_followers = null;
      // Convert follower counts to integers if they're strings
      if (cleanData.tiktok_followers) cleanData.tiktok_followers = parseInt(String(cleanData.tiktok_followers)) || null;
      if (cleanData.instagram_followers) cleanData.instagram_followers = parseInt(String(cleanData.instagram_followers)) || null;
      if (cleanData.youtube_followers) cleanData.youtube_followers = parseInt(String(cleanData.youtube_followers)) || null;

      await mutation.update(profile.id, cleanData);
      await refreshProfile();
      toast("success", "Settings saved");
    } catch (e) {
      console.error("Save error:", e);
      toast("error", "Failed to save — check that all fields are valid");
    }
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
        </div>
        <div><label className={labelClass} style={labelStyle}>Bio</label><textarea value={form.bio} onChange={e => set("bio", e.target.value)} rows={3} placeholder="Tell brands about yourself..." className={`${inputClass} resize-none`} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass} style={labelStyle}>Location</label><input type="text" value={form.location} onChange={e => set("location", e.target.value)} placeholder="Los Angeles, CA" className={inputClass} /></div>
          <div><label className={labelClass} style={labelStyle}>Website</label><input type="url" value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://..." className={inputClass} /></div>
        </div>
      </div>

      {!isAgency && <><p className={sectionClass} style={{ fontWeight: 600 }}>SOCIAL HANDLES</p>
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
      </>}

      {isAgency && <>
      <p className={sectionClass} style={{ fontWeight: 600 }}>AGENCY INFO</p>
      <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-6 space-y-4">
        <div><label className={labelClass} style={labelStyle}>Agency Name</label><input type="text" value={profile?.agency_name || ""} disabled className={`${inputClass} bg-[#F7F4F0] text-[#8AAABB]`} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelClass} style={labelStyle}>Plan</label><input type="text" value={profile?.agency_plan || "Starter"} disabled className={`${inputClass} bg-[#F7F4F0] text-[#8AAABB]`} /></div>
          <div><label className={labelClass} style={labelStyle}>Account Type</label><input type="text" value="Agency" disabled className={`${inputClass} bg-[#F7F4F0] text-[#8AAABB]`} /></div>
        </div>
      </div>
      </>}

      <button onClick={save} disabled={saving} className="bg-[#1E3F52] text-white rounded-[8px] px-6 py-3 text-[14px] font-sans disabled:opacity-50 hover:bg-[#2a5269]" style={{ fontWeight: 600 }}>{saving ? "Saving..." : "Save changes"}</button>
    </div>
  );
}

function BillingSection({ profile }) {
  const { toast } = useToast();
  const [upgrading, setUpgrading] = useState(false);

  async function manage() {
    const cid = profile?.stripe_customer_id;
    if (!cid) {
      // No Stripe customer — show upgrade flow inline
      setUpgrading(true);
      return;
    }
    try {
      const r = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: cid, returnUrl: window.location.href }),
      });
      const d = await r.json();
      if (d.url) {
        window.location.href = d.url;
      } else {
        toast("error", "Could not open billing portal — please try again");
      }
    } catch {
      toast("error", "Could not open billing portal — please try again");
    }
  }

  async function handleUpgrade(priceKey) {
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceKey,
          userId: profile?.id,
          email: profile?.email,
          successUrl: window.location.origin + "/settings?checkout=success",
          cancelUrl: window.location.origin + "/settings",
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast("error", "Could not start checkout — please try again");
      }
    } catch {
      toast("error", "Checkout failed — please try again");
    }
  }

  const plans = [
    { key: "ugc_monthly", name: "UGC Creator", price: "$27/mo", features: ["Unlimited deals", "AI contracts", "Rate calculator", "Media kit"] },
    { key: "ugc_influencer_monthly", name: "UGC + Influencer", price: "$39/mo", features: ["Everything in UGC", "Audience analytics", "Campaign recaps"], recommended: true },
  ];

  const agencyPlans = [
    { key: "agency_starter_monthly", name: "Agency Starter", price: "$149/mo", features: ["Up to 15 creators", "Pipeline + campaigns", "Commission tracking"] },
    { key: "agency_growth_monthly", name: "Agency Growth", price: "$249/mo", features: ["Up to 40 creators", "Everything in Starter", "Priority support"] },
  ];

  const isAgency = profile?.account_type === "agency";
  const currentPlans = isAgency ? agencyPlans : plans;

  return (
    <div className="space-y-6">
      <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-4" style={{ fontWeight: 600 }}>SUBSCRIPTION</p>

      {!upgrading ? (
        <>
          <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[15px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>
                  Current plan: <span className="text-[#7BAFC8] capitalize">{profile?.account_type?.replace(/_/g, " ") || "Free"}</span>
                </p>
                <p className="text-[13px] font-sans text-[#8AAABB] mt-1">
                  {profile?.stripe_customer_id ? "Manage your subscription, payment method, and invoices" : "Upgrade to unlock all features"}
                </p>
              </div>
              <button onClick={manage} className="bg-[#1E3F52] text-white rounded-[8px] px-5 py-2.5 text-[13px] font-sans hover:bg-[#2a5269]" style={{ fontWeight: 600 }}>
                {profile?.stripe_customer_id ? "Manage billing" : "Upgrade plan"}
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <button onClick={() => setUpgrading(false)} className="text-[13px] font-sans text-[#7BAFC8] hover:underline mb-2" style={{ fontWeight: 500 }}>← Back</button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentPlans.map(plan => (
              <div key={plan.key} className={`bg-white border-[1.5px] rounded-[10px] p-5 ${plan.recommended ? "border-[#7BAFC8] ring-1 ring-[#7BAFC8]/20" : "border-[#D8E8EE]"}`}>
                {plan.recommended && <span className="text-[9px] font-sans uppercase tracking-[4px] text-[#7BAFC8] mb-2 block" style={{ fontWeight: 700 }}>RECOMMENDED</span>}
                <h3 className="text-[15px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>{plan.name}</h3>
                <p className="text-[22px] font-serif text-[#3D6E8A] my-2">{plan.price}</p>
                <div className="space-y-1.5 mb-4">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-start gap-2">
                      <span className="text-[#3D7A58] text-xs mt-0.5">✓</span>
                      <span className="text-[12px] font-sans text-[#1A2C38]">{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => handleUpgrade(plan.key)} className="w-full bg-[#1E3F52] text-white rounded-[8px] py-2.5 text-[13px] font-sans hover:bg-[#2a5269]" style={{ fontWeight: 600 }}>
                  Subscribe
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function IntegrationsSection() {
  const integrations = [
    { name: "Gmail", desc: "Import brand emails", status: "available", href: "/integrations" },
    { name: "Google Calendar", desc: "Sync deal deadlines", status: "available", href: "/integrations" },
    { name: "DocuSign", desc: "E-signatures on contracts", status: "available", href: "/integrations" },
    { name: "Stripe", desc: "Payment processing", status: "connected", href: "/integrations" },
    { name: "iCal Export", desc: "Download .ics file", status: "available", href: "/integrations" },
    { name: "TikTok", desc: "Follower & engagement data", status: "coming_soon", href: "/integrations" },
    { name: "Instagram", desc: "Stats for media kit", status: "coming_soon", href: "/integrations" },
    { name: "YouTube", desc: "Subscriber analytics", status: "coming_soon", href: "/integrations" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB]" style={{ fontWeight: 600 }}>INTEGRATIONS</p>
        <Link href="/integrations" className="text-[12px] font-sans text-[#7BAFC8] hover:underline" style={{ fontWeight: 500 }}>Manage all →</Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {integrations.map(int => (
          <Link key={int.name} href={int.href} className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-4 hover:border-[#7BAFC8] transition-colors flex items-center justify-between">
            <div>
              <p className="text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>{int.name}</p>
              <p className="text-[12px] font-sans text-[#8AAABB]">{int.desc}</p>
            </div>
            <span className={`text-[9px] font-sans uppercase tracking-[4px] px-2 py-0.5 rounded ${
              int.status === "connected" ? "bg-[#E8F4EE] text-[#3D7A58]" :
              int.status === "available" ? "bg-[#F2F8FB] text-[#3D6E8A]" :
              "bg-[#F0EAE0] text-[#8AAABB]"
            }`} style={{ fontWeight: 700 }}>
              {int.status === "connected" ? "Connected" : int.status === "available" ? "Available" : "Soon"}
            </span>
          </Link>
        ))}
      </div>
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
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  return (
    <div className="space-y-6">
      <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-4" style={{ fontWeight: 600 }}>TEAM</p>
      <div className="text-center py-12 bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] px-6">
        <p className="text-[16px] font-serif italic text-[#8AAABB] mb-3">No team members yet</p>
        {showInvite ? (
          <div className="max-w-sm mx-auto space-y-3">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="team@example.com" className="w-full rounded-[8px] border-[1.5px] border-[#D8E8EE] px-3 py-2.5 text-[14px] font-sans text-[#1A2C38] focus:outline-none focus:border-[#7BAFC8]" />
            <div className="flex gap-2">
              <button onClick={() => { if (email) { toast("success", `Invite sent to ${email}`); setEmail(""); setShowInvite(false); } }} className="flex-1 bg-[#1E3F52] text-white rounded-[8px] px-4 py-2.5 text-[13px] font-sans hover:bg-[#2a5269] transition-colors" style={{ fontWeight: 600 }}>Send invite</button>
              <button onClick={() => setShowInvite(false)} className="border-[1.5px] border-[#D8E8EE] text-[#8AAABB] rounded-[8px] px-4 py-2.5 text-[13px] font-sans hover:border-[#7BAFC8] transition-colors" style={{ fontWeight: 500 }}>Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowInvite(true)} className="bg-[#1E3F52] text-white rounded-[8px] px-5 py-2.5 text-[13px] font-sans hover:bg-[#2a5269] transition-colors" style={{ fontWeight: 600 }}>Invite team member</button>
        )}
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

function DealDefaultsSection({ inputClass, labelClass, labelStyle, sectionClass }) {
  const [paymentTerms, setPaymentTerms] = useState("net_30");
  const [autoCreateInvoice, setAutoCreateInvoice] = useState(true);
  const [expiryAlertDays, setExpiryAlertDays] = useState("3");
  const [exclusivityCheck, setExclusivityCheck] = useState(false);
  const [saving, setSaving] = useState(false);

  return (
    <div className="space-y-6">
      <p className={sectionClass} style={{ fontWeight: 600 }}>DEAL DEFAULTS</p>
      <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-6 space-y-4">
        <div>
          <label className={labelClass} style={labelStyle}>Default Payment Terms</label>
          <select value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} className={inputClass}>
            <option value="net_15">Net 15</option>
            <option value="net_30">Net 30</option>
            <option value="net_45">Net 45</option>
            <option value="net_60">Net 60</option>
            <option value="on_delivery">On Delivery</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <label className={labelClass} style={labelStyle}>Auto-Create Invoice</label>
            <p className="text-[12px] font-sans text-[#8AAABB]">Automatically create an invoice when a deal moves to Complete</p>
          </div>
          <button onClick={() => setAutoCreateInvoice(!autoCreateInvoice)} className={`h-6 w-11 rounded-full transition-colors inline-flex flex-shrink-0 ${autoCreateInvoice ? "bg-[#7BAFC8]" : "bg-[#D8E8EE]"}`}>
            <div className={`h-5 w-5 rounded-full bg-white shadow transition-transform mt-0.5 ${autoCreateInvoice ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Deal Expiry Alert (days)</label>
          <input type="number" value={expiryAlertDays} onChange={e => setExpiryAlertDays(e.target.value)} min="1" max="30" className={inputClass} style={{ maxWidth: 120 }} />
          <p className="text-[12px] font-sans text-[#8AAABB] mt-1">Alert this many days before a deal expires</p>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <label className={labelClass} style={labelStyle}>Exclusivity Check on New Deal</label>
            <p className="text-[12px] font-sans text-[#8AAABB]">Warn if a creator already has an active exclusive deal with another brand</p>
          </div>
          <button onClick={() => setExclusivityCheck(!exclusivityCheck)} className={`h-6 w-11 rounded-full transition-colors inline-flex flex-shrink-0 ${exclusivityCheck ? "bg-[#7BAFC8]" : "bg-[#D8E8EE]"}`}>
            <div className={`h-5 w-5 rounded-full bg-white shadow transition-transform mt-0.5 ${exclusivityCheck ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>
      </div>
      <button onClick={() => { setSaving(true); setTimeout(() => { setSaving(false); toast("success", "Saved"); }, 500); }} disabled={saving} className="bg-[#1E3F52] text-white rounded-[8px] px-6 py-3 text-[14px] font-sans disabled:opacity-50 hover:bg-[#2a5269]" style={{ fontWeight: 600 }}>{saving ? "Saving..." : "Save defaults"}</button>
    </div>
  );
}

function BrandsSection({ inputClass, labelClass, labelStyle, sectionClass }) {
  const { data: brands, loading, refetch } = useSupabaseQuery("agency_brands");
  const mutation = useSupabaseMutation("agency_brands");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", contact_name: "", contact_email: "", status: "Active" });
  const [submitting, setSubmitting] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const statusColors = { Active: "bg-green-100 text-green-700", Warm: "bg-amber-100 text-amber-700", Cold: "bg-gray-100 text-gray-500", Blacklisted: "bg-red-100 text-red-700" };

  async function addBrand() {
    if (!form.name) return;
    setSubmitting(true);
    try {
      await mutation.insert(form);
      setForm({ name: "", category: "", contact_name: "", contact_email: "", status: "Active" });
      setShowForm(false);
      refetch();
    } catch (e) { console.error(e); }
    setSubmitting(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className={sectionClass} style={{ fontWeight: 600 }}>BRANDS</p>
        <button onClick={() => setShowForm(!showForm)} className="bg-[#1E3F52] text-white rounded-[8px] px-4 py-2 text-[13px] font-sans hover:bg-[#2a5269]" style={{ fontWeight: 600 }}>{showForm ? "Cancel" : "Add Brand"}</button>
      </div>

      {showForm && (
        <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass} style={labelStyle}>Brand Name</label><input type="text" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Acme Corp" className={inputClass} /></div>
            <div><label className={labelClass} style={labelStyle}>Category</label>
              <select value={form.category} onChange={e => set("category", e.target.value)} className={inputClass}>
                <option value="">Select...</option>
                {["Beauty", "Fashion", "Tech", "Food & Beverage", "Fitness", "Lifestyle", "Travel", "Finance", "Health", "Entertainment", "Other"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass} style={labelStyle}>Contact Name</label><input type="text" value={form.contact_name} onChange={e => set("contact_name", e.target.value)} placeholder="Jane Doe" className={inputClass} /></div>
            <div><label className={labelClass} style={labelStyle}>Contact Email</label><input type="email" value={form.contact_email} onChange={e => set("contact_email", e.target.value)} placeholder="jane@acme.com" className={inputClass} /></div>
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Status</label>
            <select value={form.status} onChange={e => set("status", e.target.value)} className={inputClass} style={{ maxWidth: 200 }}>
              <option>Active</option><option>Warm</option><option>Cold</option><option>Blacklisted</option>
            </select>
          </div>
          <button onClick={addBrand} disabled={submitting || !form.name} className="bg-[#1E3F52] text-white rounded-[8px] px-5 py-2.5 text-[13px] font-sans disabled:opacity-50 hover:bg-[#2a5269]" style={{ fontWeight: 600 }}>{submitting ? "Adding..." : "Add Brand"}</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8"><div className="h-6 w-6 animate-spin rounded-full border-2 border-[#D8E8EE] border-t-[#7BAFC8] mx-auto" /></div>
      ) : !brands || brands.length === 0 ? (
        <div className="text-center py-12 bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px]">
          <p className="text-[16px] font-serif italic text-[#8AAABB]">No brands tracked yet</p>
        </div>
      ) : (
        <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] overflow-hidden">
          <div className="grid grid-cols-5 gap-4 px-5 py-3 bg-[#F0EAE0] text-[9px] font-sans uppercase tracking-[2px] text-[#8AAABB] border-b border-[#D8E8EE]" style={{ fontWeight: 600 }}>
            <span>Name</span><span>Category</span><span>Status</span><span>Contact</span><span>Notes</span>
          </div>
          {brands.map(brand => (
            <div key={brand.id} className="grid grid-cols-5 gap-4 px-5 py-3 border-b border-[#EEE8E0] last:border-b-0 items-center">
              <span className="text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>{brand.name}</span>
              <span className="text-[13px] font-sans text-[#4A6070]">{brand.category || "—"}</span>
              <span><span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-sans ${statusColors[brand.status] || "bg-gray-100 text-gray-500"}`} style={{ fontWeight: 500 }}>{brand.status}</span></span>
              <span className="text-[13px] font-sans text-[#4A6070]">{brand.contact_name || brand.contact_email || "—"}</span>
              <span className="text-[13px] font-sans text-[#8AAABB]">{brand.notes || "—"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LegalSection({ inputClass, labelClass, labelStyle, sectionClass }) {
  const [representationAgreement, setRepresentationAgreement] = useState(
    `This Representation Agreement ("Agreement") is entered into between the Agency and the Creator ("Talent"). The Agency agrees to act as Talent's exclusive representative for brand partnership opportunities, subject to the terms outlined herein.\n\n1. Scope of Representation: The Agency shall negotiate, manage, and facilitate brand deals on behalf of Talent.\n2. Commission: The Agency shall receive an agreed-upon percentage of gross deal revenue.\n3. Term: This Agreement shall remain in effect for the duration specified in the signed contract.\n4. Termination: Either party may terminate with 30 days written notice.`
  );
  const [gdprNotice, setGdprNotice] = useState(
    `We collect and process personal data in accordance with GDPR and applicable data protection laws. Data collected includes contact information, content metrics, and payment details necessary for managing brand partnerships. You have the right to access, rectify, or delete your personal data at any time by contacting us.`
  );
  const [ftcCompliance, setFtcCompliance] = useState(true);
  const [contractExpiryPolicy, setContractExpiryPolicy] = useState("flag_review");
  const [saving, setSaving] = useState(false);

  return (
    <div className="space-y-6">
      <p className={sectionClass} style={{ fontWeight: 600 }}>LEGAL</p>
      <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-6 space-y-4">
        <div>
          <label className={labelClass} style={labelStyle}>Representation Agreement Template</label>
          <textarea value={representationAgreement} onChange={e => setRepresentationAgreement(e.target.value)} rows={8} className={`${inputClass} resize-none`} />
        </div>
      </div>
      <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-6 space-y-4">
        <div>
          <label className={labelClass} style={labelStyle}>GDPR / Data Notice</label>
          <textarea value={gdprNotice} onChange={e => setGdprNotice(e.target.value)} rows={4} className={`${inputClass} resize-none`} />
        </div>
      </div>
      <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className={labelClass} style={labelStyle}>FTC Compliance Enforcement</label>
            <p className="text-[12px] font-sans text-[#8AAABB]">Require #ad or #sponsored disclosure on all sponsored content</p>
          </div>
          <button onClick={() => setFtcCompliance(!ftcCompliance)} className={`h-6 w-11 rounded-full transition-colors inline-flex flex-shrink-0 ${ftcCompliance ? "bg-[#7BAFC8]" : "bg-[#D8E8EE]"}`}>
            <div className={`h-5 w-5 rounded-full bg-white shadow transition-transform mt-0.5 ${ftcCompliance ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>
        <div>
          <label className={labelClass} style={labelStyle}>Contract Expiry Policy</label>
          <select value={contractExpiryPolicy} onChange={e => setContractExpiryPolicy(e.target.value)} className={inputClass}>
            <option value="archive">Archive</option>
            <option value="flag_review">Flag for Review</option>
            <option value="auto_renew">Auto-Renew</option>
          </select>
        </div>
      </div>
      <button onClick={() => { setSaving(true); setTimeout(() => { setSaving(false); toast("success", "Saved"); }, 500); }} disabled={saving} className="bg-[#1E3F52] text-white rounded-[8px] px-6 py-3 text-[14px] font-sans disabled:opacity-50 hover:bg-[#2a5269]" style={{ fontWeight: 600 }}>{saving ? "Saving..." : "Save legal settings"}</button>
    </div>
  );
}

function ReferralSection({ profile }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Use the profile's referral code, or generate a fallback one if missing
  const referralCode = profile?.referral_code || "";
  const referralLink = referralCode
    ? `https://createsuite.co/signup?ref=${referralCode}`
    : "";

  // Fetch referral stats
  useEffect(() => {
    async function fetchReferrals() {
      if (!profile?.id) { setLoading(false); return; }
      try {
        const sb = (await import("@/lib/supabase")).getSupabase();
        const { data } = await sb
          .from("referrals")
          .select("*")
          .eq("referrer_id", profile.id)
          .order("created_at", { ascending: false });
        setReferrals(data || []);
      } catch (e) {
        console.error("Failed to fetch referrals:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchReferrals();
  }, [profile?.id]);

  function copyLink() {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast("success", "Link copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  function shareViaSocial(platform) {
    const text = `I've been using Create Suite to manage my creator business and it's been a game-changer! Sign up with my link and get your first month of UGC + Influencer at the UGC price ($27 instead of $39):`;
    const url = referralLink;
    let shareUrl = "";

    if (platform === "twitter") {
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    } else if (platform === "email") {
      shareUrl = `mailto:?subject=${encodeURIComponent("Try Create Suite with my link")}&body=${encodeURIComponent(text + " " + url)}`;
    } else if (platform === "sms") {
      shareUrl = `sms:?body=${encodeURIComponent(text + " " + url)}`;
    }

    if (shareUrl) window.open(shareUrl, "_blank");
  }

  const signupCount = referrals.length;
  const convertedCount = referrals.filter(r => r.status === "converted").length;

  return (
    <div className="space-y-6">
      <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-4" style={{ fontWeight: 600 }}>REFER FRIENDS</p>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1E3F52] to-[#2a5269] rounded-[12px] p-6 text-white">
        <div className="flex items-start gap-3 mb-3">
          <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-[20px]">🎁</div>
          <div>
            <h3 className="text-[20px] font-serif text-white">Give your followers a discount</h3>
            <p className="text-[13px] font-sans text-white/70 mt-1">
              Share your link and anyone who signs up gets their first month of UGC + Influencer for just $27 (normally $39).
            </p>
          </div>
        </div>
      </div>

      {/* Link card */}
      <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-6">
        <p className="text-[11px] font-sans uppercase tracking-[1.5px] text-[#8AAABB] mb-2" style={{ fontWeight: 600 }}>YOUR AFFILIATE LINK</p>

        {referralLink ? (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 bg-[#F2F8FB] border border-[#D8E8EE] rounded-[8px] px-3 py-2.5 font-mono text-[12px] text-[#1A2C38] truncate">
              {referralLink}
            </div>
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 bg-[#1E3F52] text-white rounded-[8px] px-4 py-2.5 text-[12px] font-sans hover:bg-[#2a5269] transition-colors"
              style={{ fontWeight: 600 }}
            >
              {copied ? <><Check className="h-3.5 w-3.5" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy link</>}
            </button>
          </div>
        ) : (
          <div className="bg-[#FFF8E8] border border-[#A07830]/20 rounded-[8px] p-3 mb-4">
            <p className="text-[12px] font-sans text-[#A07830]">Run the referral SQL migration to generate your referral code.</p>
          </div>
        )}

        {/* Quick share buttons */}
        {referralLink && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-sans text-[#8AAABB]" style={{ fontWeight: 500 }}>Share via:</span>
            <button onClick={() => shareViaSocial("twitter")} className="text-[11px] font-sans text-[#7BAFC8] hover:underline" style={{ fontWeight: 500 }}>Twitter</button>
            <span className="text-[#D8E8EE]">·</span>
            <button onClick={() => shareViaSocial("email")} className="text-[11px] font-sans text-[#7BAFC8] hover:underline" style={{ fontWeight: 500 }}>Email</button>
            <span className="text-[#D8E8EE]">·</span>
            <button onClick={() => shareViaSocial("sms")} className="text-[11px] font-sans text-[#7BAFC8] hover:underline" style={{ fontWeight: 500 }}>Text</button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5">
          <p className="text-[11px] font-sans uppercase tracking-[1.5px] text-[#8AAABB] mb-2" style={{ fontWeight: 600 }}>SIGNUPS</p>
          <p className="text-[32px] font-serif text-[#1A2C38]">{signupCount}</p>
          <p className="text-[11px] font-sans text-[#8AAABB] mt-1">People signed up via your link</p>
        </div>
        <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5">
          <p className="text-[11px] font-sans uppercase tracking-[1.5px] text-[#8AAABB] mb-2" style={{ fontWeight: 600 }}>CONVERTED</p>
          <p className="text-[32px] font-serif text-[#3D7A58]">{convertedCount}</p>
          <p className="text-[11px] font-sans text-[#8AAABB] mt-1">Upgraded to a paid plan</p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-6">
        <p className="text-[11px] font-sans uppercase tracking-[1.5px] text-[#8AAABB] mb-4" style={{ fontWeight: 600 }}>HOW IT WORKS</p>
        <div className="space-y-3">
          {[
            { num: "1", title: "Share your link", desc: "Post on social, email, or text your followers your unique signup link." },
            { num: "2", title: "They sign up", desc: "When they create an account using your link, they see your name and the special offer." },
            { num: "3", title: "They save $12", desc: "At checkout, they get $12 off their first month of UGC + Influencer — $27 instead of $39." },
            { num: "4", title: "Track results", desc: "See how many have signed up and converted right here in your dashboard." },
          ].map(step => (
            <div key={step.num} className="flex items-start gap-3">
              <div className="h-7 w-7 rounded-full bg-[#F2F8FB] border border-[#D8E8EE] flex items-center justify-center flex-shrink-0">
                <span className="text-[12px] font-serif text-[#7BAFC8]" style={{ fontWeight: 600 }}>{step.num}</span>
              </div>
              <div>
                <p className="text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>{step.title}</p>
                <p className="text-[12px] font-sans text-[#8AAABB]">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

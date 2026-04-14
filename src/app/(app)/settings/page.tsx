// @ts-nocheck
"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/contexts/auth-context";
import { useSupabaseQuery, useSupabaseMutation } from "@/lib/hooks";
import { hasPermission, type Permission } from "@/lib/permissions";
import { timeAgo } from "@/lib/utils";
import {
  Shield, Check, Lock, Unlink, Clock, CreditCard, Users, Building2,
  Bell, Plug, FileText, Briefcase, Scale, Settings, Mail, Send,
  Plus, Trash2, ChevronRight, Globe,
  Instagram, Linkedin, X as XIcon, ToggleLeft, ToggleRight, Calendar,
  DollarSign, CheckCircle2, XCircle, Loader2, Eye,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AgencyLink {
  id: string;
  agency_id: string;
  creator_id: string;
  creator_name?: string;
  creator_email?: string;
  commission_rate: number;
  status: string;
  linked_at: string;
}

interface ActivityEntry {
  id: string;
  actor_id: string;
  actor_type: string;
  action: string;
  target_id: string;
  target_type: string;
  metadata: Record<string, string>;
  created_at: string;
}

interface TeamMember {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  joined_at: string;
  avatar_url: string | null;
}

interface AgencySetting {
  id: string;
  agency_name: string;
  bio: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  instagram: string;
  linkedin: string;
  tiktok: string;
  agency_type: string;
  niche_tags: string[];
  founded_year: string;
  headquarters: string;
  timezone: string;
}

interface AgencyBrand {
  id: string;
  name: string;
  category: string;
  contact: string;
  status: string;
  notes: string;
  total_value: number;
  deal_count: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const actionDots: Record<string, string> = {
  created_deal: "bg-[#3D7A58]",
  updated_deal: "bg-[#7BAFC8]",
  uploaded_contract: "bg-[#3D6E8A]",
  created_invoice: "bg-[#3D7A58]",
  added_note: "bg-[#8AAABB]",
  moved_stage: "bg-[#A07830]",
  invited_member: "bg-[#7BAFC8]",
  removed_member: "bg-[#A03D3D]",
  updated_settings: "bg-[#3D6E8A]",
};

const canDo = [
  "Create and edit deals on your behalf",
  "Create and send invoices for your deals",
  "Upload and review contracts",
  "Add notes and comments to deals",
  "Move deals between pipeline stages",
  "Message you directly inside the platform",
];

const alwaysYours = [
  "Your profile and bio",
  "Your media kit and photos",
  "Your rate card",
  "Your subscription and billing",
  "Your email inbox access",
  "Your Stripe/Helcim payment details",
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-4" style={{ fontWeight: 600 }}>
      {children}
    </p>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] ${className}`}>
      {children}
    </div>
  );
}

function InputField({
  label, value, onChange, type = "text", placeholder = "", mono = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; mono?: boolean;
}) {
  return (
    <div>
      <label className="text-[12px] font-sans text-[#8AAABB] block mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-[8px] border-[1.5px] border-[#D8E8EE] focus:border-[#7BAFC8] outline-none px-3 py-2 text-[13px] text-[#1A2C38] placeholder:text-[#8AAABB]/50 ${mono ? "font-mono" : "font-sans"}`}
      />
    </div>
  );
}

function TextAreaField({
  label, value, onChange, rows = 4, placeholder = "",
}: {
  label: string; value: string; onChange: (v: string) => void;
  rows?: number; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[12px] font-sans text-[#8AAABB] block mb-1.5">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-[8px] border-[1.5px] border-[#D8E8EE] focus:border-[#7BAFC8] outline-none px-3 py-2 text-[13px] font-sans text-[#1A2C38] placeholder:text-[#8AAABB]/50 resize-none"
      />
    </div>
  );
}

function SelectField({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="text-[12px] font-sans text-[#8AAABB] block mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-[8px] border-[1.5px] border-[#D8E8EE] focus:border-[#7BAFC8] outline-none px-3 py-2 text-[13px] font-sans text-[#1A2C38] bg-white"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function Toggle({
  enabled, onToggle, label, description,
}: {
  enabled: boolean; onToggle: () => void; label: string; description?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>{label}</p>
        {description && <p className="text-[11px] font-sans text-[#8AAABB] mt-0.5">{description}</p>}
      </div>
      <button onClick={onToggle} className="flex-shrink-0">
        {enabled ? (
          <ToggleRight className="h-6 w-6 text-[#7BAFC8]" />
        ) : (
          <ToggleLeft className="h-6 w-6 text-[#D8E8EE]" />
        )}
      </button>
    </div>
  );
}

function PrimaryButton({
  children, onClick, loading = false, disabled = false, danger = false,
}: {
  children: React.ReactNode; onClick: () => void;
  loading?: boolean; disabled?: boolean; danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`${danger ? "bg-[#A03D3D]" : "bg-[#1E3F52]"} text-white rounded-[8px] px-4 py-2 text-[12px] font-sans disabled:opacity-50 flex items-center gap-2`}
      style={{ fontWeight: 600 }}
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  );
}

function SecondaryButton({
  children, onClick, disabled = false,
}: {
  children: React.ReactNode; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="border-[1.5px] border-[#D8E8EE] rounded-[8px] px-4 py-2 text-[12px] font-sans text-[#1A2C38] hover:bg-[#FAF8F4] disabled:opacity-50"
      style={{ fontWeight: 500 }}
    >
      {children}
    </button>
  );
}

function RolePill({ role }: { role: string }) {
  const colors: Record<string, string> = {
    owner: "bg-[#1E3F52] text-white",
    manager: "bg-[#E8F4EE] text-[#3D7A58]",
    assistant: "bg-[#F2F8FB] text-[#7BAFC8]",
  };
  return (
    <span className={`text-[10px] font-sans uppercase tracking-[2px] px-2 py-0.5 rounded ${colors[role] || "bg-[#F2F8FB] text-[#8AAABB]"}`} style={{ fontWeight: 700 }}>
      {role}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-[#E8F4EE] text-[#3D7A58]",
    pending: "bg-[#FFF8E8] text-[#A07830]",
    inactive: "bg-[#F5F5F5] text-[#8AAABB]",
    blacklisted: "bg-[#FDEAEA] text-[#A03D3D]",
    connected: "bg-[#E8F4EE] text-[#3D7A58]",
    disconnected: "bg-[#F5F5F5] text-[#8AAABB]",
  };
  return (
    <span className={`text-[10px] font-sans uppercase tracking-[2px] px-2 py-0.5 rounded ${colors[status] || "bg-[#F2F8FB] text-[#8AAABB]"}`} style={{ fontWeight: 700 }}>
      {status}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center gap-2 py-8 justify-center">
      <Loader2 className="h-4 w-4 animate-spin text-[#7BAFC8]" />
      <span className="text-[13px] font-sans text-[#8AAABB]">Loading...</span>
    </div>
  );
}

function Initials({ name }: { name: string }) {
  const parts = (name || "?").trim().split(" ").filter(Boolean);
  const initials = parts.length > 1 ? `${parts[0]?.[0] || ""}${parts[1]?.[0] || ""}` : parts[0]?.[0] || "?";
  return (
    <div className="h-8 w-8 rounded-full bg-[#F2F8FB] border border-[#D8E8EE] flex items-center justify-center text-[11px] font-sans text-[#7BAFC8] flex-shrink-0" style={{ fontWeight: 700 }}>
      {initials.toUpperCase()}
    </div>
  );
}

// ─── Agency Tabs ──────────────────────────────────────────────────────────────

const agencyTabs = [
  { key: "profile", label: "Agency Profile", icon: Building2 },
  { key: "team", label: "Team Members", icon: Users },
  { key: "roster", label: "Creator Roster", icon: Briefcase },
  { key: "deals", label: "Deal Defaults", icon: FileText },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "integrations", label: "Integrations", icon: Plug },
  { key: "billing", label: "Billing", icon: CreditCard },
  { key: "brands", label: "Brand Relationships", icon: Globe },
  { key: "legal", label: "Legal & Compliance", icon: Scale },
];

const creatorTabs = [
  { key: "account", label: "Account", icon: Settings },
  { key: "billing", label: "Billing", icon: CreditCard },
  { key: "agency", label: "Agency Access", icon: Shield },
];

// ─── Tab 1: Agency Profile ────────────────────────────────────────────────────

function AgencyProfileTab() {
  const { profile } = useAuth();
  const { data: settings, loading } = useSupabaseQuery<AgencySetting>("agency_settings", {
    eq: profile?.id ? { column: "agency_id", value: profile.id } : undefined,
  });
  const mutation = useSupabaseMutation("agency_settings");

  const s = settings && settings.length > 0 ? settings[0] : null;
  const [form, setForm] = useState({
    agency_name: "", bio: "", contact_name: "", contact_email: "", contact_phone: "",
    website: "", instagram: "", linkedin: "", tiktok: "", agency_type: "talent_management",
    niche_tags: [] as string[], founded_year: "", headquarters: "", timezone: "America/New_York",
  });
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");

  if (!initialized && s) {
    setForm({
      agency_name: s.agency_name || "",
      bio: s.bio || "",
      contact_name: s.contact_name || "",
      contact_email: s.contact_email || "",
      contact_phone: s.contact_phone || "",
      website: s.website || "",
      instagram: s.instagram || "",
      linkedin: s.linkedin || "",
      tiktok: s.tiktok || "",
      agency_type: s.agency_type || "talent_management",
      niche_tags: s.niche_tags || [],
      founded_year: s.founded_year || "",
      headquarters: s.headquarters || "",
      timezone: s.timezone || "America/New_York",
    });
    setInitialized(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (s?.id) {
        await mutation.update(s.id, form as unknown as Record<string, unknown>);
      } else {
        await mutation.insert(form as unknown as Record<string, unknown>);
      }
    } catch { /* handled by hook */ }
    setSaving(false);
  }

  function addTag() {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.niche_tags.includes(tag)) {
      setForm({ ...form, niche_tags: [...form.niche_tags, tag] });
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setForm({ ...form, niche_tags: form.niche_tags.filter((t) => t !== tag) });
  }

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <SectionLabel>General Information</SectionLabel>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <InputField label="Agency Name" value={form.agency_name} onChange={(v) => setForm({ ...form, agency_name: v })} placeholder="Your agency name" />
          </div>
          <div className="col-span-2">
            <TextAreaField label="Bio" value={form.bio} onChange={(v) => setForm({ ...form, bio: v })} placeholder="Tell brands about your agency..." rows={3} />
          </div>
          <SelectField label="Agency Type" value={form.agency_type} onChange={(v) => setForm({ ...form, agency_type: v })} options={[
            { value: "talent_management", label: "Talent Management" },
            { value: "influencer_marketing", label: "Influencer Marketing" },
            { value: "creator_economy", label: "Creator Economy" },
            { value: "digital_media", label: "Digital Media" },
            { value: "full_service", label: "Full Service" },
          ]} />
          <InputField label="Founded Year" value={form.founded_year} onChange={(v) => setForm({ ...form, founded_year: v })} placeholder="2020" />
          <InputField label="Headquarters" value={form.headquarters} onChange={(v) => setForm({ ...form, headquarters: v })} placeholder="Los Angeles, CA" />
          <SelectField label="Timezone" value={form.timezone} onChange={(v) => setForm({ ...form, timezone: v })} options={[
            { value: "America/New_York", label: "Eastern (ET)" },
            { value: "America/Chicago", label: "Central (CT)" },
            { value: "America/Denver", label: "Mountain (MT)" },
            { value: "America/Los_Angeles", label: "Pacific (PT)" },
            { value: "Europe/London", label: "GMT" },
            { value: "Europe/Paris", label: "CET" },
          ]} />
        </div>
      </Card>

      <Card className="p-6">
        <SectionLabel>Contact Details</SectionLabel>
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Contact Name" value={form.contact_name} onChange={(v) => setForm({ ...form, contact_name: v })} placeholder="Jane Smith" />
          <InputField label="Contact Email" value={form.contact_email} onChange={(v) => setForm({ ...form, contact_email: v })} type="email" placeholder="jane@agency.com" />
          <InputField label="Phone" value={form.contact_phone} onChange={(v) => setForm({ ...form, contact_phone: v })} placeholder="+1 (555) 123-4567" />
          <InputField label="Website" value={form.website} onChange={(v) => setForm({ ...form, website: v })} placeholder="https://agency.com" />
        </div>
      </Card>

      <Card className="p-6">
        <SectionLabel>Social Handles</SectionLabel>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-end gap-2">
            <Instagram className="h-4 w-4 text-[#8AAABB] mb-2.5" />
            <div className="flex-1">
              <InputField label="Instagram" value={form.instagram} onChange={(v) => setForm({ ...form, instagram: v })} placeholder="@handle" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <Linkedin className="h-4 w-4 text-[#8AAABB] mb-2.5" />
            <div className="flex-1">
              <InputField label="LinkedIn" value={form.linkedin} onChange={(v) => setForm({ ...form, linkedin: v })} placeholder="company-name" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <XIcon className="h-4 w-4 text-[#8AAABB] mb-2.5" />
            <div className="flex-1">
              <InputField label="TikTok" value={form.tiktok} onChange={(v) => setForm({ ...form, tiktok: v })} placeholder="@handle" />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <SectionLabel>Niche Tags</SectionLabel>
        <div className="flex gap-2 mb-3">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            placeholder="Add a niche tag..."
            className="flex-1 rounded-[8px] border-[1.5px] border-[#D8E8EE] focus:border-[#7BAFC8] outline-none px-3 py-2 text-[13px] font-sans text-[#1A2C38] placeholder:text-[#8AAABB]/50"
          />
          <SecondaryButton onClick={addTag}>Add</SecondaryButton>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.niche_tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F2F8FB] text-[11px] font-sans text-[#7BAFC8]" style={{ fontWeight: 600 }}>
              {tag}
              <button onClick={() => removeTag(tag)} className="hover:text-[#A03D3D]">
                <XCircle className="h-3 w-3" />
              </button>
            </span>
          ))}
          {form.niche_tags.length === 0 && (
            <span className="text-[12px] font-sans text-[#8AAABB]">No tags yet</span>
          )}
        </div>
      </Card>

      <div className="flex justify-end">
        <PrimaryButton onClick={handleSave} loading={saving}>Save Changes</PrimaryButton>
      </div>
    </div>
  );
}

// ─── Tab 2: Team Members ──────────────────────────────────────────────────────

function TeamMembersTab() {
  const { profile } = useAuth();
  const userRole = profile?.agency_role || "assistant";
  const { data: members, loading, setData: setMembers } = useSupabaseQuery<TeamMember>("agency_team", {
    order: { column: "joined_at", ascending: true },
  });
  const mutation = useSupabaseMutation("agency_team");

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("assistant");
  const [inviting, setInviting] = useState(false);

  async function handleInvite() {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const result = await mutation.insert({ email: inviteEmail, role: inviteRole, status: "pending" });
      if (result) setMembers([...members, result as unknown as TeamMember]);
      setInviteEmail("");
    } catch { /* handled */ }
    setInviting(false);
  }

  async function handleRemove(id: string) {
    if (!hasPermission(userRole, "canRemoveTeam")) return;
    try {
      await mutation.remove(id);
      setMembers(members.filter((m) => m.id !== id));
    } catch { /* handled */ }
  }

  if (loading) return <LoadingState />;

  const permissionRows: { label: string; key: string }[] = [
    { label: "Edit deals", key: "canEditDeals" },
    { label: "Edit contracts", key: "canEditContracts" },
    { label: "Edit invoices", key: "canEditInvoices" },
    { label: "See financials", key: "canSeeFinancials" },
    { label: "Invite team", key: "canInviteTeam" },
    { label: "Remove team", key: "canRemoveTeam" },
    { label: "Change roles", key: "canChangeRoles" },
    { label: "Access billing", key: "canAccessBilling" },
    { label: "Edit campaigns", key: "canEditCampaigns" },
    { label: "See audit log", key: "canSeeAuditLog" },
    { label: "Send messages", key: "canSendMessages" },
    { label: "Add notes", key: "canAddNotes" },
  ];

  return (
    <div className="space-y-6">
      {hasPermission(userRole, "canInviteTeam") && (
        <Card className="p-5">
          <SectionLabel>Invite Team Member</SectionLabel>
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@agency.com"
                className="w-full rounded-[8px] border-[1.5px] border-[#D8E8EE] focus:border-[#7BAFC8] outline-none px-3 py-2 text-[13px] font-sans text-[#1A2C38] placeholder:text-[#8AAABB]/50"
              />
            </div>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="rounded-[8px] border-[1.5px] border-[#D8E8EE] focus:border-[#7BAFC8] outline-none px-3 py-2 text-[13px] font-sans text-[#1A2C38] bg-white"
            >
              <option value="manager">Manager</option>
              <option value="assistant">Assistant</option>
            </select>
            <PrimaryButton onClick={handleInvite} loading={inviting}>
              <Send className="h-3.5 w-3.5" /> Send Invite
            </PrimaryButton>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b border-[#D8E8EE] bg-[#FAF8F4]">
          <SectionLabel>Team ({members.length})</SectionLabel>
        </div>
        {members.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="h-8 w-8 text-[#D8E8EE] mx-auto mb-2" />
            <p className="text-[13px] font-sans text-[#8AAABB]">No team members yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-[10px] font-sans uppercase tracking-[2px] text-[#8AAABB] border-b border-[#D8E8EE]">
                <th className="text-left px-5 py-2.5" style={{ fontWeight: 600 }}>Member</th>
                <th className="text-left px-3 py-2.5" style={{ fontWeight: 600 }}>Role</th>
                <th className="text-left px-3 py-2.5" style={{ fontWeight: 600 }}>Joined</th>
                <th className="text-left px-3 py-2.5" style={{ fontWeight: 600 }}>Status</th>
                {hasPermission(userRole, "canRemoveTeam") && (
                  <th className="px-3 py-2.5" style={{ fontWeight: 600 }}></th>
                )}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-[#D8E8EE] last:border-b-0 hover:bg-[#FAF8F4]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Initials name={m.full_name} />
                      <div>
                        <p className="text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>{m.full_name}</p>
                        <p className="text-[11px] font-sans text-[#8AAABB]">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3"><RolePill role={m.role} /></td>
                  <td className="px-3 py-3">
                    <span className="text-[11px] font-mono text-[#8AAABB]">{m.joined_at ? timeAgo(m.joined_at) : "---"}</span>
                  </td>
                  <td className="px-3 py-3"><StatusPill status={m.status} /></td>
                  {hasPermission(userRole, "canRemoveTeam") && (
                    <td className="px-3 py-3 text-right">
                      {m.role !== "owner" && (
                        <button onClick={() => handleRemove(m.id)} className="text-[#A03D3D]/50 hover:text-[#A03D3D]">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card className="p-5">
        <SectionLabel>Role Permissions</SectionLabel>
        <table className="w-full">
          <thead>
            <tr className="text-[10px] font-sans uppercase tracking-[2px] text-[#8AAABB] border-b border-[#D8E8EE]">
              <th className="text-left py-2" style={{ fontWeight: 600 }}>Permission</th>
              <th className="text-center py-2" style={{ fontWeight: 600 }}>Owner</th>
              <th className="text-center py-2" style={{ fontWeight: 600 }}>Manager</th>
              <th className="text-center py-2" style={{ fontWeight: 600 }}>Assistant</th>
            </tr>
          </thead>
          <tbody>
            {permissionRows.map((row) => (
              <tr key={row.key} className="border-b border-[#D8E8EE] last:border-b-0">
                <td className="py-2 text-[12px] font-sans text-[#4A6070]">{row.label}</td>
                {(["owner", "manager", "assistant"] as const).map((role) => (
                  <td key={role} className="py-2 text-center">
                    {hasPermission(role, row.key as keyof Permission) ? (
                      <CheckCircle2 className="h-4 w-4 text-[#3D7A58] inline-block" />
                    ) : (
                      <XCircle className="h-4 w-4 text-[#D8E8EE] inline-block" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── Tab 3: Creator Roster Settings ───────────────────────────────────────────

function CreatorRosterTab() {
  const { data: links, loading, setData: setLinks } = useSupabaseQuery<AgencyLink>("agency_creator_links", {
    order: { column: "linked_at", ascending: false },
  });
  const mutation = useSupabaseMutation("agency_creator_links");

  const [defaultRate, setDefaultRate] = useState("15");
  const [autoApprove, setAutoApprove] = useState(false);
  const [rosterCapacity] = useState(50);
  const [checklist, setChecklist] = useState({
    contract_signed: true,
    media_kit_uploaded: true,
    rate_card_set: false,
    bank_details_added: true,
    intro_call_done: false,
  });

  async function handleRateChange(linkId: string, rate: string) {
    try {
      await mutation.update(linkId, { commission_rate: parseFloat(rate) });
      setLinks(links.map((l) => l.id === linkId ? { ...l, commission_rate: parseFloat(rate) } : l));
    } catch { /* handled */ }
  }

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <SectionLabel>Default Settings</SectionLabel>
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Default Commission Rate (%)" value={defaultRate} onChange={setDefaultRate} type="number" placeholder="15" mono />
          <div>
            <label className="text-[12px] font-sans text-[#8AAABB] block mb-1.5">Roster Capacity</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-[#D8E8EE] rounded-full overflow-hidden">
                <div className="h-full bg-[#7BAFC8] rounded-full" style={{ width: `${(links.length / rosterCapacity) * 100}%` }} />
              </div>
              <span className="text-[12px] font-mono text-[#4A6070]">{links.length}/{rosterCapacity}</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Toggle enabled={autoApprove} onToggle={() => setAutoApprove(!autoApprove)} label="Auto-approve creator requests" description="Automatically approve incoming creator link requests" />
        </div>
      </Card>

      <Card className="p-5">
        <SectionLabel>Onboarding Checklist</SectionLabel>
        <div className="space-y-1">
          {Object.entries(checklist).map(([key, value]) => (
            <Toggle
              key={key}
              enabled={value}
              onToggle={() => setChecklist({ ...checklist, [key]: !value })}
              label={key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            />
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b border-[#D8E8EE] bg-[#FAF8F4]">
          <SectionLabel>Per-Creator Commission Rates</SectionLabel>
        </div>
        {links.length === 0 ? (
          <div className="p-8 text-center">
            <Briefcase className="h-8 w-8 text-[#D8E8EE] mx-auto mb-2" />
            <p className="text-[13px] font-sans text-[#8AAABB]">No creators on your roster yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-[10px] font-sans uppercase tracking-[2px] text-[#8AAABB] border-b border-[#D8E8EE]">
                <th className="text-left px-5 py-2.5" style={{ fontWeight: 600 }}>Creator</th>
                <th className="text-left px-3 py-2.5" style={{ fontWeight: 600 }}>Commission %</th>
                <th className="text-left px-3 py-2.5" style={{ fontWeight: 600 }}>Status</th>
                <th className="text-left px-3 py-2.5" style={{ fontWeight: 600 }}>Linked</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id} className="border-b border-[#D8E8EE] last:border-b-0 hover:bg-[#FAF8F4]">
                  <td className="px-5 py-3">
                    <p className="text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>{link.creator_name || link.creator_id}</p>
                    {link.creator_email && <p className="text-[11px] font-sans text-[#8AAABB]">{link.creator_email}</p>}
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="number"
                      value={link.commission_rate}
                      onChange={(e) => handleRateChange(link.id, e.target.value)}
                      className="w-20 rounded-[8px] border-[1.5px] border-[#D8E8EE] focus:border-[#7BAFC8] outline-none px-2 py-1 text-[13px] font-mono text-[#1A2C38]"
                    />
                  </td>
                  <td className="px-3 py-3"><StatusPill status={link.status} /></td>
                  <td className="px-3 py-3">
                    <span className="text-[11px] font-mono text-[#8AAABB]">{link.linked_at ? timeAgo(link.linked_at) : "---"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

// ─── Tab 4: Deal & Campaign Defaults ──────────────────────────────────────────

function DealDefaultsTab() {
  const [paymentTerms, setPaymentTerms] = useState("net_30");
  const [contractTemplate, setContractTemplate] = useState("standard");
  const [deliverables, setDeliverables] = useState("1x Instagram Post\n1x Instagram Story\n1x TikTok Video");
  const [autoInvoice, setAutoInvoice] = useState(true);
  const [expiryDays, setExpiryDays] = useState("14");
  const [exclusivityCheck, setExclusivityCheck] = useState(true);
  const [saving, setSaving] = useState(false);
  const mutation = useSupabaseMutation("agency_settings");

  async function handleSave() {
    setSaving(true);
    try {
      await mutation.insert({
        payment_terms: paymentTerms,
        contract_template: contractTemplate,
        default_deliverables: deliverables,
        auto_create_invoice: autoInvoice,
        deal_expiry_days: parseInt(expiryDays),
        exclusivity_check: exclusivityCheck,
      });
    } catch { /* handled */ }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <SectionLabel>Payment & Contracts</SectionLabel>
        <div className="grid grid-cols-2 gap-4">
          <SelectField label="Payment Terms" value={paymentTerms} onChange={setPaymentTerms} options={[
            { value: "net_15", label: "Net 15" },
            { value: "net_30", label: "Net 30" },
            { value: "net_45", label: "Net 45" },
            { value: "net_60", label: "Net 60" },
            { value: "upon_completion", label: "Upon Completion" },
            { value: "50_50", label: "50/50 Split" },
          ]} />
          <SelectField label="Default Contract Template" value={contractTemplate} onChange={setContractTemplate} options={[
            { value: "standard", label: "Standard Agreement" },
            { value: "exclusive", label: "Exclusive Partnership" },
            { value: "ugc_only", label: "UGC Only" },
            { value: "ambassador", label: "Brand Ambassador" },
            { value: "custom", label: "Custom Template" },
          ]} />
        </div>
      </Card>

      <Card className="p-5">
        <SectionLabel>Default Deliverables</SectionLabel>
        <TextAreaField label="Default Deliverable List (one per line)" value={deliverables} onChange={setDeliverables} rows={5} placeholder="1x Instagram Post&#10;1x Instagram Story" />
      </Card>

      <Card className="p-5">
        <SectionLabel>Automation</SectionLabel>
        <div className="space-y-1">
          <Toggle enabled={autoInvoice} onToggle={() => setAutoInvoice(!autoInvoice)} label="Auto-create invoice when deal closes" description="Automatically generate an invoice when a deal moves to Closed Won" />
          <Toggle enabled={exclusivityCheck} onToggle={() => setExclusivityCheck(!exclusivityCheck)} label="Exclusivity conflict check" description="Warn when creating deals that may conflict with existing exclusivity agreements" />
        </div>
        <div className="mt-4">
          <InputField label="Deal Expiry Alert (days)" value={expiryDays} onChange={setExpiryDays} type="number" placeholder="14" mono />
          <p className="text-[11px] font-sans text-[#8AAABB] mt-1">Notify when a deal has been inactive for this many days</p>
        </div>
      </Card>

      <div className="flex justify-end">
        <PrimaryButton onClick={handleSave} loading={saving}>Save Defaults</PrimaryButton>
      </div>
    </div>
  );
}

// ─── Tab 5: Notifications ─────────────────────────────────────────────────────

function NotificationsTab() {
  const [prefs, setPrefs] = useState<Record<string, { email: boolean; inApp: boolean }>>({
    deal_stage: { email: true, inApp: true },
    new_creator_request: { email: true, inApp: true },
    contract_expiring: { email: true, inApp: true },
    invoice_overdue: { email: true, inApp: true },
    conflict_detected: { email: false, inApp: true },
    creator_message: { email: false, inApp: true },
    commission_received: { email: true, inApp: true },
    team_note: { email: false, inApp: true },
  });
  const [dailyDigest, setDailyDigest] = useState(true);
  const [digestTime, setDigestTime] = useState("09:00");
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [saving, setSaving] = useState(false);
  const mutation = useSupabaseMutation("agency_settings");

  const labels: Record<string, string> = {
    deal_stage: "Deal stage changes",
    new_creator_request: "New creator request",
    contract_expiring: "Contract expiring",
    invoice_overdue: "Invoice overdue",
    conflict_detected: "Conflict detected",
    creator_message: "Creator message",
    commission_received: "Commission received",
    team_note: "Team note added",
  };

  function togglePref(key: string, channel: "email" | "inApp") {
    setPrefs({
      ...prefs,
      [key]: { ...prefs[key], [channel]: !prefs[key][channel] },
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      await mutation.insert({
        notification_prefs: prefs,
        daily_digest: dailyDigest,
        digest_time: digestTime,
        weekly_report: weeklyReport,
      });
    } catch { /* handled */ }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b border-[#D8E8EE] bg-[#FAF8F4]">
          <div className="flex items-center">
            <span className="flex-1 text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB]" style={{ fontWeight: 600 }}>Event Type</span>
            <span className="w-20 text-center text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB]" style={{ fontWeight: 600 }}>Email</span>
            <span className="w-20 text-center text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB]" style={{ fontWeight: 600 }}>In-App</span>
          </div>
        </div>
        {Object.entries(prefs).map(([key, val]) => (
          <div key={key} className="flex items-center px-5 py-3 border-b border-[#D8E8EE] last:border-b-0 hover:bg-[#FAF8F4]">
            <span className="flex-1 text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>{labels[key]}</span>
            <div className="w-20 flex justify-center">
              <button onClick={() => togglePref(key, "email")}>
                {val.email ? <ToggleRight className="h-5 w-5 text-[#7BAFC8]" /> : <ToggleLeft className="h-5 w-5 text-[#D8E8EE]" />}
              </button>
            </div>
            <div className="w-20 flex justify-center">
              <button onClick={() => togglePref(key, "inApp")}>
                {val.inApp ? <ToggleRight className="h-5 w-5 text-[#7BAFC8]" /> : <ToggleLeft className="h-5 w-5 text-[#D8E8EE]" />}
              </button>
            </div>
          </div>
        ))}
      </Card>

      <Card className="p-5">
        <SectionLabel>Digests & Reports</SectionLabel>
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Toggle enabled={dailyDigest} onToggle={() => setDailyDigest(!dailyDigest)} label="Daily digest email" description="Receive a summary of the day's activity" />
            </div>
            {dailyDigest && (
              <input
                type="time"
                value={digestTime}
                onChange={(e) => setDigestTime(e.target.value)}
                className="rounded-[8px] border-[1.5px] border-[#D8E8EE] focus:border-[#7BAFC8] outline-none px-3 py-1.5 text-[13px] font-mono text-[#1A2C38]"
              />
            )}
          </div>
          <Toggle enabled={weeklyReport} onToggle={() => setWeeklyReport(!weeklyReport)} label="Weekly performance report" description="Get a weekly summary of deals, revenue, and creator activity" />
        </div>
      </Card>

      <div className="flex justify-end">
        <PrimaryButton onClick={handleSave} loading={saving}>Save Notification Preferences</PrimaryButton>
      </div>
    </div>
  );
}

// ─── Tab 6: Integrations ──────────────────────────────────────────────────────

function IntegrationsTab() {
  const integrations = [
    { id: "gmail", name: "Gmail", description: "Sync emails with deal conversations", icon: Mail, status: "connected" as const },
    { id: "gcal", name: "Google Calendar", description: "Sync deadlines and meeting dates", icon: Calendar, status: "connected" as const },
    { id: "docusign", name: "DocuSign", description: "Send and track contract signatures", icon: FileText, status: "available" as const },
    { id: "stripe", name: "Stripe", description: "Process payments and track invoices", icon: DollarSign, status: "available" as const },
    { id: "quickbooks", name: "QuickBooks", description: "Sync invoices and financial data", icon: CreditCard, status: "coming_soon" as const },
    { id: "xero", name: "Xero", description: "Accounting and bookkeeping integration", icon: CreditCard, status: "coming_soon" as const },
    { id: "zapier", name: "Zapier", description: "Connect with 5,000+ apps", icon: Plug, status: "coming_soon" as const },
    { id: "slack", name: "Slack", description: "Get notifications in your workspace", icon: Bell, status: "coming_soon" as const },
  ];

  return (
    <div className="space-y-6">
      <SectionLabel>Connected Services</SectionLabel>
      <div className="grid grid-cols-2 gap-4">
        {integrations.map((int) => {
          const Icon = int.icon;
          return (
            <Card key={int.id} className="p-5">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-[8px] bg-[#F2F8FB] border border-[#D8E8EE] flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-[#7BAFC8]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>{int.name}</p>
                    {int.status === "connected" && <div className="h-2 w-2 rounded-full bg-[#3D7A58]" />}
                  </div>
                  <p className="text-[11px] font-sans text-[#8AAABB] mt-0.5">{int.description}</p>
                </div>
              </div>
              <div className="mt-4">
                {int.status === "connected" ? (
                  <button className="w-full border-[1.5px] border-[#3D7A58] text-[#3D7A58] rounded-[8px] px-3 py-1.5 text-[12px] font-sans" style={{ fontWeight: 600 }}>
                    Connected
                  </button>
                ) : int.status === "available" ? (
                  <button className="w-full bg-[#1E3F52] text-white rounded-[8px] px-3 py-1.5 text-[12px] font-sans" style={{ fontWeight: 600 }}>
                    Connect
                  </button>
                ) : (
                  <button disabled className="w-full border-[1.5px] border-[#D8E8EE] text-[#8AAABB] rounded-[8px] px-3 py-1.5 text-[12px] font-sans opacity-60 cursor-not-allowed" style={{ fontWeight: 600 }}>
                    Coming Soon
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── Tab 7: Billing ───────────────────────────────────────────────────────────

function AgencyBillingTab() {
  const { profile } = useAuth();
  const plan = profile?.agency_plan || "starter";
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [cancelInput, setCancelInput] = useState("");
  const [showCancel, setShowCancel] = useState(false);

  const plans: Record<string, { name: string; price: { monthly: number; annual: number } }> = {
    starter: { name: "Starter", price: { monthly: 149, annual: 1490 } },
    growth: { name: "Growth", price: { monthly: 249, annual: 2490 } },
  };

  const currentPlan = plans[plan] || plans.starter;

  async function handleManageBilling() {
    const customerId = (profile as Record<string, unknown>)?.stripe_customer_id;
    if (!customerId) { window.location.href = "/pricing"; return; }
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, returnUrl: window.location.href }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else window.location.href = "/pricing";
    } catch { window.location.href = "/pricing"; }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <SectionLabel>Current Plan</SectionLabel>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[24px] font-serif text-[#1A2C38]">{currentPlan.name}</h3>
            <p className="text-[14px] font-sans text-[#8AAABB] mt-1">
              ${billingCycle === "monthly" ? currentPlan.price.monthly : currentPlan.price.annual}
              <span className="text-[12px]">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
            </p>
          </div>
          <div className="flex items-center gap-1 bg-[#F2F8FB] rounded-[8px] p-1">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-3 py-1.5 rounded-[6px] text-[12px] font-sans ${billingCycle === "monthly" ? "bg-white text-[#1A2C38] shadow-sm" : "text-[#8AAABB]"}`}
              style={{ fontWeight: 500 }}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-3 py-1.5 rounded-[6px] text-[12px] font-sans ${billingCycle === "annual" ? "bg-white text-[#1A2C38] shadow-sm" : "text-[#8AAABB]"}`}
              style={{ fontWeight: 500 }}
            >
              Annual
            </button>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <PrimaryButton onClick={handleManageBilling}>
            {plan === "starter" ? "Upgrade to Growth" : "Manage Plan"}
          </PrimaryButton>
          <SecondaryButton onClick={handleManageBilling}>View Invoices</SecondaryButton>
        </div>
      </Card>

      <Card className="p-5">
        <SectionLabel>Billing Details</SectionLabel>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-[12px] font-sans text-[#8AAABB]">Next billing date</span>
            <span className="text-[13px] font-mono text-[#1A2C38]">---</span>
          </div>
          <div className="flex justify-between border-t border-[#D8E8EE] pt-3">
            <span className="text-[12px] font-sans text-[#8AAABB]">Payment method</span>
            <span className="text-[13px] font-mono text-[#1A2C38]">---- ---- ---- ----</span>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <SectionLabel>Invoice History</SectionLabel>
        <div className="text-center py-6">
          <CreditCard className="h-8 w-8 text-[#D8E8EE] mx-auto mb-2" />
          <p className="text-[13px] font-sans text-[#8AAABB]">Invoice history will appear here</p>
          <SecondaryButton onClick={handleManageBilling}>View in Stripe</SecondaryButton>
        </div>
      </Card>

      <Card className="p-5 border-[#A03D3D]/20">
        <SectionLabel>Cancel Subscription</SectionLabel>
        {!showCancel ? (
          <button
            onClick={() => setShowCancel(true)}
            className="text-[12px] font-sans text-[#A03D3D]/60 hover:text-[#A03D3D]"
            style={{ fontWeight: 500 }}
          >
            Cancel my subscription...
          </button>
        ) : (
          <div>
            <p className="text-[13px] font-sans text-[#4A6070] mb-3">
              Type <span className="font-mono text-[#A03D3D]" style={{ fontWeight: 700 }}>CANCEL</span> to confirm cancellation. This will take effect at the end of your current billing period.
            </p>
            <div className="flex gap-3">
              <input
                value={cancelInput}
                onChange={(e) => setCancelInput(e.target.value)}
                placeholder="Type CANCEL"
                className="flex-1 rounded-[8px] border-[1.5px] border-[#A03D3D]/30 focus:border-[#A03D3D] outline-none px-3 py-2 text-[13px] font-mono text-[#A03D3D] placeholder:text-[#A03D3D]/30"
              />
              <PrimaryButton onClick={() => { /* cancellation logic */ }} disabled={cancelInput !== "CANCEL"} danger>
                Confirm Cancel
              </PrimaryButton>
              <SecondaryButton onClick={() => { setShowCancel(false); setCancelInput(""); }}>
                Never mind
              </SecondaryButton>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Tab 8: Brand Relationships ───────────────────────────────────────────────

function BrandRelationshipsTab() {
  const { data: brands, loading, setData: setBrands } = useSupabaseQuery<AgencyBrand>("agency_brands", {
    order: { column: "name", ascending: true },
  });
  const mutation = useSupabaseMutation("agency_brands");

  const [showAddForm, setShowAddForm] = useState(false);
  const [newBrand, setNewBrand] = useState({ name: "", category: "", contact: "", status: "active", notes: "" });
  const [adding, setAdding] = useState(false);
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null);

  async function handleAddBrand() {
    if (!newBrand.name.trim()) return;
    setAdding(true);
    try {
      const result = await mutation.insert(newBrand as unknown as Record<string, unknown>);
      if (result) setBrands([...brands, result as unknown as AgencyBrand]);
      setNewBrand({ name: "", category: "", contact: "", status: "active", notes: "" });
      setShowAddForm(false);
    } catch { /* handled */ }
    setAdding(false);
  }

  if (loading) return <LoadingState />;

  const activeBrands = brands.filter((b) => b.status !== "blacklisted");
  const blacklisted = brands.filter((b) => b.status === "blacklisted");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionLabel>Brands ({brands.length})</SectionLabel>
        <SecondaryButton onClick={() => setShowAddForm(!showAddForm)}>
          <span className="flex items-center gap-1.5"><Plus className="h-3.5 w-3.5" /> Add Brand</span>
        </SecondaryButton>
      </div>

      {showAddForm && (
        <Card className="p-5">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Brand Name" value={newBrand.name} onChange={(v) => setNewBrand({ ...newBrand, name: v })} placeholder="Acme Corp" />
            <InputField label="Category" value={newBrand.category} onChange={(v) => setNewBrand({ ...newBrand, category: v })} placeholder="Fashion, Beauty, Tech..." />
            <InputField label="Contact" value={newBrand.contact} onChange={(v) => setNewBrand({ ...newBrand, contact: v })} placeholder="contact@brand.com" />
            <SelectField label="Status" value={newBrand.status} onChange={(v) => setNewBrand({ ...newBrand, status: v })} options={[
              { value: "active", label: "Active" },
              { value: "pending", label: "Pending" },
              { value: "inactive", label: "Inactive" },
              { value: "blacklisted", label: "Blacklisted" },
            ]} />
            <div className="col-span-2">
              <TextAreaField label="Notes" value={newBrand.notes} onChange={(v) => setNewBrand({ ...newBrand, notes: v })} rows={2} placeholder="Any notes about this brand..." />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <SecondaryButton onClick={() => setShowAddForm(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleAddBrand} loading={adding}>Add Brand</PrimaryButton>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        {activeBrands.length === 0 ? (
          <div className="p-8 text-center">
            <Globe className="h-8 w-8 text-[#D8E8EE] mx-auto mb-2" />
            <p className="text-[13px] font-sans text-[#8AAABB]">No brands added yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-[10px] font-sans uppercase tracking-[2px] text-[#8AAABB] border-b border-[#D8E8EE]">
                <th className="text-left px-5 py-2.5" style={{ fontWeight: 600 }}>Name</th>
                <th className="text-left px-3 py-2.5" style={{ fontWeight: 600 }}>Category</th>
                <th className="text-left px-3 py-2.5" style={{ fontWeight: 600 }}>Deals</th>
                <th className="text-left px-3 py-2.5" style={{ fontWeight: 600 }}>Total Value</th>
                <th className="text-left px-3 py-2.5" style={{ fontWeight: 600 }}>Status</th>
                <th className="text-left px-3 py-2.5" style={{ fontWeight: 600 }}>Notes</th>
                <th className="px-3 py-2.5" style={{ fontWeight: 600 }}></th>
              </tr>
            </thead>
            <tbody>
              {activeBrands.map((brand) => (
                <>
                  <tr key={brand.id} className="border-b border-[#D8E8EE] last:border-b-0 hover:bg-[#FAF8F4] cursor-pointer" onClick={() => setExpandedBrand(expandedBrand === brand.id ? null : brand.id)}>
                    <td className="px-5 py-3 text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>{brand.name}</td>
                    <td className="px-3 py-3 text-[12px] font-sans text-[#4A6070]">{brand.category || "---"}</td>
                    <td className="px-3 py-3 text-[12px] font-mono text-[#4A6070]">{brand.deal_count || 0}</td>
                    <td className="px-3 py-3 text-[12px] font-mono text-[#4A6070]">${(brand.total_value || 0).toLocaleString()}</td>
                    <td className="px-3 py-3"><StatusPill status={brand.status} /></td>
                    <td className="px-3 py-3 text-[11px] font-sans text-[#8AAABB] max-w-[120px] truncate">{brand.notes || "---"}</td>
                    <td className="px-3 py-3">
                      <ChevronRight className={`h-4 w-4 text-[#8AAABB] transition-transform ${expandedBrand === brand.id ? "rotate-90" : ""}`} />
                    </td>
                  </tr>
                  {expandedBrand === brand.id && (
                    <tr key={`${brand.id}-detail`}>
                      <td colSpan={7} className="px-5 py-4 bg-[#FAF8F4] border-b border-[#D8E8EE]">
                        <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-2" style={{ fontWeight: 600 }}>Deal History</p>
                        <p className="text-[12px] font-sans text-[#8AAABB]">Deal history with {brand.name} will appear here once deals are linked.</p>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {blacklisted.length > 0 && (
        <>
          <SectionLabel>Blacklisted Brands</SectionLabel>
          <Card className="overflow-hidden border-[#A03D3D]/20">
            {blacklisted.map((brand) => (
              <div key={brand.id} className="flex items-center justify-between px-5 py-3 border-b border-[#D8E8EE] last:border-b-0 bg-[#FDEAEA]/30">
                <div>
                  <p className="text-[13px] font-sans text-[#A03D3D]" style={{ fontWeight: 500 }}>{brand.name}</p>
                  <p className="text-[11px] font-sans text-[#A03D3D]/60">{brand.notes || "No reason given"}</p>
                </div>
                <StatusPill status="blacklisted" />
              </div>
            ))}
          </Card>
        </>
      )}
    </div>
  );
}

// ─── Tab 9: Legal & Compliance ────────────────────────────────────────────────

function LegalComplianceTab() {
  const { data: auditLog, loading } = useSupabaseQuery<ActivityEntry>("agency_activity_log", {
    order: { column: "created_at", ascending: false },
    limit: 50,
  });

  const [repAgreement, setRepAgreement] = useState("");
  const [gdprNotice, setGdprNotice] = useState("");
  const [ftcCompliance, setFtcCompliance] = useState(true);
  const [expiryPolicy, setExpiryPolicy] = useState("30_day_notice");
  const [saving, setSaving] = useState(false);
  const mutation = useSupabaseMutation("agency_settings");

  async function handleSave() {
    setSaving(true);
    try {
      await mutation.insert({
        representation_agreement: repAgreement,
        gdpr_notice: gdprNotice,
        ftc_compliance: ftcCompliance,
        contract_expiry_policy: expiryPolicy,
      });
    } catch { /* handled */ }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <SectionLabel>Representation Agreement Template</SectionLabel>
        <TextAreaField
          label="Default representation agreement text"
          value={repAgreement}
          onChange={setRepAgreement}
          rows={8}
          placeholder="Enter your standard representation agreement template here..."
        />
      </Card>

      <Card className="p-5">
        <SectionLabel>Privacy & Compliance</SectionLabel>
        <TextAreaField
          label="GDPR / Privacy Notice"
          value={gdprNotice}
          onChange={setGdprNotice}
          rows={5}
          placeholder="Enter your GDPR or privacy notice text..."
        />
        <div className="mt-4 space-y-1">
          <Toggle enabled={ftcCompliance} onToggle={() => setFtcCompliance(!ftcCompliance)} label="FTC compliance mode" description="Require sponsored content disclosure on all deals" />
        </div>
      </Card>

      <Card className="p-5">
        <SectionLabel>Contract Policies</SectionLabel>
        <SelectField label="Contract Expiry Policy" value={expiryPolicy} onChange={setExpiryPolicy} options={[
          { value: "30_day_notice", label: "30-day notice before expiry" },
          { value: "60_day_notice", label: "60-day notice before expiry" },
          { value: "90_day_notice", label: "90-day notice before expiry" },
          { value: "auto_renew", label: "Auto-renew" },
          { value: "manual", label: "Manual review required" },
        ]} />
      </Card>

      <div className="flex justify-end">
        <PrimaryButton onClick={handleSave} loading={saving}>Save Legal Settings</PrimaryButton>
      </div>

      <Card className="overflow-hidden">
        <div className="px-5 py-3 border-b border-[#D8E8EE] bg-[#FAF8F4]">
          <SectionLabel>Audit Log</SectionLabel>
        </div>
        {loading ? (
          <LoadingState />
        ) : auditLog.length === 0 ? (
          <div className="p-8 text-center">
            <Eye className="h-8 w-8 text-[#D8E8EE] mx-auto mb-2" />
            <p className="text-[13px] font-sans text-[#8AAABB]">No activity recorded yet</p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {auditLog.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 px-5 py-2.5 border-b border-[#D8E8EE] last:border-b-0 hover:bg-[#FAF8F4]">
                <div className={`h-2 w-2 rounded-full flex-shrink-0 ${actionDots[entry.action] || "bg-[#8AAABB]"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-sans text-[#1A2C38]">
                    <span style={{ fontWeight: 500 }}>{entry.actor_type}</span>
                    <span className="text-[#8AAABB]"> {entry.action.replace(/_/g, " ")} </span>
                    <span className="text-[#4A6070]">{entry.target_type}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Clock className="h-3 w-3 text-[#8AAABB]" />
                  <span className="text-[10px] font-mono text-[#8AAABB]">{timeAgo(entry.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Creator Tabs ─────────────────────────────────────────────────────────────

function CreatorAccountTab() {
  const { profile } = useAuth();
  return (
    <div>
      <SectionLabel>Account</SectionLabel>
      <Card className="p-5 space-y-3">
        <div className="flex justify-between">
          <span className="text-[12px] font-sans text-[#8AAABB]">Name</span>
          <span className="text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>{profile?.full_name || "---"}</span>
        </div>
        <div className="flex justify-between border-t border-[#D8E8EE] pt-3">
          <span className="text-[12px] font-sans text-[#8AAABB]">Email</span>
          <span className="text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>{profile?.email || "---"}</span>
        </div>
        <div className="flex justify-between border-t border-[#D8E8EE] pt-3">
          <span className="text-[12px] font-sans text-[#8AAABB]">Plan</span>
          <span className="text-[13px] font-sans text-[#3D6E8A]" style={{ fontWeight: 500 }}>{profile?.account_type || "Free"}</span>
        </div>
      </Card>
    </div>
  );
}

function CreatorBillingTab() {
  const { profile } = useAuth();

  async function handleManageBilling() {
    const customerId = (profile as Record<string, unknown>)?.stripe_customer_id;
    if (!customerId) { window.location.href = "/pricing"; return; }
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, returnUrl: window.location.href }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else window.location.href = "/pricing";
    } catch { window.location.href = "/pricing"; }
  }

  return (
    <div>
      <SectionLabel>Billing</SectionLabel>
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#F2F8FB] flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-[#7BAFC8]" />
            </div>
            <div>
              <p className="text-[14px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>Manage subscription</p>
              <p className="text-[12px] font-sans text-[#8AAABB]">Update payment method, view invoices, or change plan</p>
            </div>
          </div>
          <PrimaryButton onClick={handleManageBilling}>Manage billing</PrimaryButton>
        </div>
      </Card>
    </div>
  );
}

function CreatorAgencyAccessTab() {
  const { profile } = useAuth();
  const [disconnecting, setDisconnecting] = useState(false);

  const { data: agencyLinks, loading: linksLoading } = useSupabaseQuery<AgencyLink>("agency_creator_links", {
    eq: profile?.id ? { column: "creator_id", value: profile.id } : undefined,
  });

  const { data: activityLog, loading: activityLoading } = useSupabaseQuery<ActivityEntry>("activity_log", {
    order: { column: "created_at", ascending: false },
    limit: 30,
  });

  const agencyLink = agencyLinks.find((l) => l.status === "active");
  const hasAgency = Boolean(agencyLink);

  if (linksLoading) return <LoadingState />;

  if (!hasAgency) {
    return (
      <div>
        <SectionLabel>Agency Access</SectionLabel>
        <Card className="p-8 text-center">
          <Shield className="h-10 w-10 text-[#D8E8EE] mx-auto mb-3" />
          <h3 className="text-[18px] font-serif text-[#1A2C38] mb-1">Not connected to an agency</h3>
          <p className="text-[13px] font-sans text-[#8AAABB] max-w-sm mx-auto">
            When an agency invites you, their connection will appear here. You will be able to manage permissions and disconnect at any time.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionLabel>Agency Access</SectionLabel>

      <Card className="overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-[#D8E8EE]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#F2F8FB] flex items-center justify-center">
              <Shield className="h-4 w-4 text-[#7BAFC8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[14px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>Agency Connected</p>
                <StatusPill status="active" />
              </div>
              <p className="text-[12px] font-sans text-[#8AAABB]">
                Connected {agencyLink ? timeAgo(agencyLink.linked_at) : ""} · {agencyLink?.commission_rate}% commission
              </p>
            </div>
          </div>
          <button onClick={() => setDisconnecting(true)} className="flex items-center gap-1.5 text-[12px] font-sans text-[#A03D3D]/60 hover:text-[#A03D3D]" style={{ fontWeight: 500 }}>
            <Unlink className="h-3.5 w-3.5" /> Disconnect
          </button>
        </div>

        <div className="px-5 py-3 border-b border-[#D8E8EE]">
          <p className="text-[14px] font-sans italic text-[#4A6070]">
            Your agency can help manage your deals — but your profile, rates, and media kit always stay yours.
          </p>
        </div>

        <div className="grid grid-cols-2 divide-x divide-[#D8E8EE]">
          <div className="p-5 bg-[#F2F8FB]">
            <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#7BAFC8] mb-3" style={{ fontWeight: 600 }}>What They Can Do</p>
            <div className="space-y-2.5">
              {canDo.map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-[#7BAFC8] mt-0.5 flex-shrink-0" />
                  <span className="text-[12px] font-sans text-[#1A2C38]">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-5 bg-[#F0EAE0]">
            <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-3" style={{ fontWeight: 600 }}>Always Yours</p>
            <div className="space-y-2.5">
              {alwaysYours.map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <Lock className="h-3.5 w-3.5 text-[#6A5040] mt-0.5 flex-shrink-0" />
                  <span className="text-[12px] font-sans text-[#6A5040]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {activityLog.length > 0 && (
        <Card className="overflow-hidden">
          <div className="px-5 py-3 border-b border-[#D8E8EE] bg-[#FAF8F4]">
            <SectionLabel>Recent Activity</SectionLabel>
          </div>
          {activityLoading ? (
            <LoadingState />
          ) : (
            <div className="max-h-[300px] overflow-y-auto">
              {activityLog.slice(0, 10).map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 px-5 py-3 border-b border-[#D8E8EE] last:border-b-0 hover:bg-[#FAF8F4]">
                  <div className={`h-2 w-2 rounded-full flex-shrink-0 ${actionDots[entry.action] || "bg-[#8AAABB]"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-sans text-[#1A2C38]">
                      <span style={{ fontWeight: 500 }}>{entry.actor_type}</span>
                      <span className="text-[#8AAABB]"> {entry.action.replace(/_/g, " ")} </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Clock className="h-3 w-3 text-[#8AAABB]" />
                    <span className="text-[11px] font-mono text-[#8AAABB]">{timeAgo(entry.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {disconnecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(26,44,56,.4)", backdropFilter: "blur(4px)" }}>
          <div className="relative bg-white rounded-[10px] border-[1.5px] border-[#D8E8EE] w-full max-w-sm overflow-hidden">
            <div className="bg-[#F2F8FB] px-6 py-4 border-b border-[#D8E8EE]">
              <h3 className="text-[18px] font-serif text-[#1A2C38]">Disconnect agency?</h3>
            </div>
            <div className="p-6">
              <p className="text-[13px] font-sans text-[#4A6070] mb-5">
                Your agency will lose access to create or edit deals, invoices, and contracts on your account. Existing records will not be deleted.
              </p>
              <div className="flex gap-2">
                <SecondaryButton onClick={() => setDisconnecting(false)}>Cancel</SecondaryButton>
                <PrimaryButton onClick={() => setDisconnecting(false)} danger>Disconnect</PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { profile, loading: authLoading } = useAuth();
  const isAgency = profile?.account_type === "agency";
  const tabs = isAgency ? agencyTabs : creatorTabs;
  const [activeTab, setActiveTab] = useState("profile");

  if (authLoading) {
    return <div className="pt-20 text-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-[#D8E8EE] border-t-[#7BAFC8] mx-auto" /></div>;
  }

  if (!profile) {
    return <div className="pt-20 text-center"><p className="text-[14px] font-sans text-[#8AAABB]">Please sign in to access settings.</p></div>;
  }

  function renderAgencyTab() {
    switch (activeTab) {
      case "profile": return <AgencyProfileTab />;
      case "team": return <TeamMembersTab />;
      case "roster": return <CreatorRosterTab />;
      case "deals": return <DealDefaultsTab />;
      case "notifications": return <NotificationsTab />;
      case "integrations": return <IntegrationsTab />;
      case "billing": return <AgencyBillingTab />;
      case "brands": return <BrandRelationshipsTab />;
      case "legal": return <LegalComplianceTab />;
      default: return <AgencyProfileTab />;
    }
  }

  function renderCreatorTab() {
    switch (activeTab) {
      case "account": return <CreatorAccountTab />;
      case "billing": return <CreatorBillingTab />;
      case "agency": return <CreatorAgencyAccessTab />;
      default: return <CreatorAccountTab />;
    }
  }

  return (
    <div>
      <PageHeader
        headline={<><em className="italic text-[#7BAFC8]">Settings</em></>}
        subheading={isAgency ? "Manage your agency profile, team, billing, and more." : "Manage your account, billing, and agency access."}
      />

      <div className="flex gap-8">
        {/* Sidebar tabs */}
        <div className="w-52 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-[13px] font-sans text-left transition-colors ${
                    isActive
                      ? "bg-white border-[1.5px] border-[#D8E8EE] text-[#1A2C38] shadow-sm"
                      : "text-[#8AAABB] hover:text-[#4A6070] hover:bg-[#FAF8F4] border-[1.5px] border-transparent"
                  }`}
                  style={{ fontWeight: isActive ? 600 : 400 }}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-[#7BAFC8]" : "text-[#8AAABB]"}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab content */}
        <div className="flex-1 min-w-0 max-w-3xl">
          {isAgency ? renderAgencyTab() : renderCreatorTab()}
        </div>
      </div>
    </div>
  );
}

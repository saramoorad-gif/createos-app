"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/contexts/auth-context";
import { useSupabaseMutation } from "@/lib/hooks";
import { useToast } from "@/components/global/toast";
import { UpgradeGate } from "@/components/global/upgrade-gate";
import { Copy, Check, ExternalLink, Edit3 } from "lucide-react";

export default function MediaKitPage() {
  return (
    <UpgradeGate feature="media-kit">
      <MediaKitPageContent />
    </UpgradeGate>
  );
}

function MediaKitPageContent() {
  const { profile, loading, refreshProfile } = useAuth();
  const { toast } = useToast();
  const { update } = useSupabaseMutation("profiles");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [niche, setNiche] = useState("");
  const [tiktokHandle, setTiktokHandle] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [youtubeHandle, setYoutubeHandle] = useState("");

  // Populate from profile
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setBio((profile as any).bio || "");
      setNiche((profile as any).primary_niche || "");
      setTiktokHandle((profile as any).tiktok_handle || "");
      setInstagramHandle((profile as any).instagram_handle || "");
      setYoutubeHandle((profile as any).youtube_handle || "");
    }
  }, [profile]);

  async function handleSave() {
    if (!profile?.id) return;
    setSaving(true);
    try {
      await update(profile.id, {
        full_name: fullName,
        bio,
        primary_niche: niche,
        tiktok_handle: tiktokHandle,
        instagram_handle: instagramHandle,
        youtube_handle: youtubeHandle,
      });
      await refreshProfile();
      toast("success", "Media kit saved");
    } catch (err) {
      console.error("Failed to save media kit:", err);
      toast("error", "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="pt-20 text-center"><p className="text-[14px] font-sans text-[#8AAABB]">Loading...</p></div>;

  if (!profile) {
    return (
      <div>
        <PageHeader headline={<>Your media <em className="italic text-[#7BAFC8]">kit</em></>} subheading="Edit and share your public-facing creator profile." />
        <div className="text-center py-16">
          <p className="text-[22px] font-serif italic text-[#8AAABB] mb-3">Sign in to set up your media kit</p>
        </div>
      </div>
    );
  }

  const displayName = fullName || profile.full_name || "Creator";
  const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const slug = displayName.toLowerCase().replace(/\s+/g, "");
  const inputClass = "w-full rounded-btn border-[1.5px] border-[#D8E8EE] px-3 py-2.5 text-[14px] font-sans text-[#1A2C38] bg-white focus:outline-none focus:border-[#7BAFC8]";
  const labelClass = "text-[11px] font-sans text-[#8AAABB] uppercase tracking-[1.5px] block mb-1.5";

  return (
    <div>
      <PageHeader headline={<>Your media <em className="italic text-[#7BAFC8]">kit</em></>} subheading="Edit and share your public-facing creator profile." />

      {/* Share bar */}
      <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-card p-4 flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <ExternalLink className="h-4 w-4 text-[#8AAABB]" />
          <code className="text-[12px] font-mono text-[#8AAABB]">createsuite.co/kit/{slug}</code>
        </div>
        <button onClick={() => { navigator.clipboard.writeText("https://createsuite.co/kit/" + slug); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="flex items-center gap-1.5 text-[12px] font-sans text-[#7BAFC8] hover:underline" style={{ fontWeight: 500 }}>
          {copied ? <><Check className="h-3.5 w-3.5" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy link</>}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Editor */}
        <div className="space-y-5">
          <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB]" style={{ fontWeight: 600 }}>EDITOR</p>

          <div>
            <label className={labelClass} style={{ fontWeight: 600 }}>Full Name</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className={labelClass} style={{ fontWeight: 600 }}>Bio</label>
            <textarea className={`${inputClass} resize-none`} rows={3} value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell brands about yourself, your content style, and what you're known for..." />
          </div>

          <div>
            <label className={labelClass} style={{ fontWeight: 600 }}>Primary Niche</label>
            <input type="text" value={niche} onChange={e => setNiche(e.target.value)} placeholder="e.g., Lifestyle, Beauty, Wellness" className={inputClass} />
          </div>

          <div>
            <label className={labelClass} style={{ fontWeight: 600 }}>TikTok Handle</label>
            <input type="text" value={tiktokHandle} onChange={e => setTiktokHandle(e.target.value)} placeholder="@yourhandle" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} style={{ fontWeight: 600 }}>Instagram Handle</label>
            <input type="text" value={instagramHandle} onChange={e => setInstagramHandle(e.target.value)} placeholder="@yourhandle" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} style={{ fontWeight: 600 }}>YouTube Channel</label>
            <input type="text" value={youtubeHandle} onChange={e => setYoutubeHandle(e.target.value)} placeholder="@yourchannel" className={inputClass} />
          </div>

          <button onClick={handleSave} disabled={saving} className="w-full bg-[#1E3F52] text-white rounded-btn px-4 py-2.5 text-[13px] font-sans hover:bg-[#2a5269] transition-colors disabled:opacity-50" style={{ fontWeight: 600 }}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>

        {/* Live Preview */}
        <div>
          <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-4" style={{ fontWeight: 600 }}>PREVIEW</p>
          <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-card overflow-hidden">
            <div className="bg-[#FAF8F4] px-6 py-8 text-center border-b border-[#D8E8EE]">
              <div className="h-16 w-16 rounded-full bg-[#F2F8FB] border border-[#D8E8EE] mx-auto mb-3 flex items-center justify-center text-[18px] font-serif text-[#7BAFC8]">
                {initials}
              </div>
              <h3 className="text-[20px] font-serif text-[#1A2C38]">{displayName}</h3>
              {bio && <p className="text-[13px] font-sans text-[#4A6070] mt-2 max-w-sm mx-auto">{bio}</p>}
              {niche && (
                <div className="flex justify-center gap-2 mt-3">
                  {niche.split(",").map(t => t.trim()).filter(Boolean).map(t => (
                    <span key={t} className="text-[10px] font-sans px-2 py-0.5 rounded-full border border-[#D8E8EE] text-[#8AAABB]">{t}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-5 text-center border-b border-[#D8E8EE]">
              <p className="text-[13px] font-sans text-[#8AAABB] italic">Add your platform handles above to show your stats here</p>
            </div>

            <div className="px-6 py-5 text-center">
              <button onClick={() => toast("info", "This button links to your inbound inquiry form on your public media kit page")} className="bg-[#7BAFC8] text-white rounded-btn px-6 py-2.5 text-[13px] font-sans" style={{ fontWeight: 500 }}>Work with me</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

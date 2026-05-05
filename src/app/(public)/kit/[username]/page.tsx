"use client";

import { useState, useEffect } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { useParams } from "next/navigation";
import { Send, CheckCircle2 } from "lucide-react";

interface PublicProfile {
  id: string;
  full_name: string;
  email: string;
  account_type: string;
  bio?: string;
  primary_niche?: string;
  tiktok_handle?: string;
  instagram_handle?: string;
  youtube_handle?: string;
}

function InquiryForm({ profile, onSubmit }: { profile: PublicProfile; onSubmit: () => void }) {
  const creatorName = profile.full_name;
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [emailAddr, setEmailAddr] = useState("");
  const [budget, setBudget] = useState("Under $1,000");
  const [platform, setPlatform] = useState("TikTok");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!name.trim() || !emailAddr.trim() || !message.trim()) {
      setError("Please fill in your name, email, and message.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: profile.email,
          subject: `New brand inquiry from ${brand || name} via your Create Suite media kit`,
          html: `
            <p><strong>From:</strong> ${name} (${emailAddr})</p>
            <p><strong>Brand / Company:</strong> ${brand || "—"}</p>
            <p><strong>Budget:</strong> ${budget}</p>
            <p><strong>Platform:</strong> ${platform}</p>
            <hr />
            <p>${message.replace(/\n/g, "<br/>")}</p>
            <hr />
            <p style="color:#8AAABB;font-size:12px">Sent via <a href="https://createsuite.co">Create Suite</a> media kit</p>
          `,
          recipientName: creatorName,
        }),
      });
      if (!res.ok) throw new Error("Send failed");
      onSubmit();
    } catch {
      setError("Something went wrong. Please try emailing the creator directly.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-[20px] font-serif text-center text-[#1A2C38]">
        Work with <em className="italic text-[#7BAFC8]">{creatorName.split(" ")[0]}</em>
      </h3>
      <p className="text-[13px] font-sans text-[#8AAABB] text-center">
        Fill out this form and {creatorName.split(" ")[0]} will respond within 24 hours.
      </p>

      {error && (
        <p className="text-[12px] font-sans text-red-600 text-center">{error}</p>
      )}

      {[
        { label: "Your Name", value: name, onChange: setName, placeholder: "Jane Smith", type: "text" },
        { label: "Brand / Company", value: brand, onChange: setBrand, placeholder: "Your brand name", type: "text" },
        { label: "Email", value: emailAddr, onChange: setEmailAddr, placeholder: "you@brand.com", type: "email" },
      ].map((field) => (
        <div key={field.label}>
          <label className="text-[12px] font-sans text-[#1A2C38] block mb-1.5" style={{ fontWeight: 500 }}>{field.label}</label>
          <input
            type={field.type}
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            placeholder={field.placeholder}
            className="w-full rounded-[8px] border-[1.5px] border-[#D8E8EE] px-3 py-2.5 text-[13px] font-sans focus:outline-none focus:border-[#7BAFC8]"
          />
        </div>
      ))}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[12px] font-sans text-[#1A2C38] block mb-1.5" style={{ fontWeight: 500 }}>Budget</label>
          <select value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full rounded-[8px] border-[1.5px] border-[#D8E8EE] px-3 py-2.5 text-[13px] font-sans bg-white focus:outline-none focus:border-[#7BAFC8]">
            <option>Under $1,000</option>
            <option>$1,000 – $2,500</option>
            <option>$2,500 – $5,000</option>
            <option>$5,000+</option>
          </select>
        </div>
        <div>
          <label className="text-[12px] font-sans text-[#1A2C38] block mb-1.5" style={{ fontWeight: 500 }}>Platform</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full rounded-[8px] border-[1.5px] border-[#D8E8EE] px-3 py-2.5 text-[13px] font-sans bg-white focus:outline-none focus:border-[#7BAFC8]">
            <option>TikTok</option>
            <option>Instagram</option>
            <option>YouTube</option>
            <option>Multiple</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-[12px] font-sans text-[#1A2C38] block mb-1.5" style={{ fontWeight: 500 }}>Message</label>
        <textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Tell ${creatorName.split(" ")[0]} about your campaign...`}
          className="w-full rounded-[8px] border-[1.5px] border-[#D8E8EE] px-3 py-2.5 text-[13px] font-sans resize-none focus:outline-none focus:border-[#7BAFC8]"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={sending}
        className="w-full flex items-center justify-center gap-2 bg-[#1E3F52] text-white rounded-[8px] px-4 py-2.5 text-[13px] font-sans hover:bg-[#2a5269] transition-colors disabled:opacity-50"
        style={{ fontWeight: 600 }}
      >
        <Send className="h-4 w-4" />
        {sending ? "Sending..." : "Send inquiry"}
      </button>
    </div>
  );
}

export default function PublicMediaKitPage() {
  const params = useParams();
  const kitId = params.username as string; // now a profile UUID
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!isSupabaseConfigured()) { setLoading(false); return; }
      const sb = getSupabase();
      // Look up by UUID first (new URL format). Fall back to name-slug
      // matching for any old shared links.
      const isUuid = /^[0-9a-f-]{36}$/.test(kitId);
      if (isUuid) {
        const { data } = await sb
          .from("profiles")
          .select("id, full_name, email, account_type, bio, primary_niche, tiktok_handle, instagram_handle, youtube_handle")
          .eq("id", kitId)
          .single();
        if (data) setProfile(data as PublicProfile);
      } else {
        // Legacy name-slug fallback — fetch by name pattern
        const { data } = await sb
          .from("profiles")
          .select("id, full_name, email, account_type, bio, primary_niche, tiktok_handle, instagram_handle, youtube_handle")
          .limit(200);
        if (data) {
          const match = data.find(
            (p: PublicProfile) => p.full_name?.toLowerCase().replace(/\s+/g, "") === kitId?.toLowerCase()
          );
          if (match) setProfile(match as PublicProfile);
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, [kitId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#D8E8EE] border-t-[#7BAFC8]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-[24px] font-serif text-[#1A2C38] mb-2">Creator not found</h1>
          <p className="text-[14px] font-sans text-[#8AAABB]">This media kit doesn&apos;t exist or hasn&apos;t been set up yet.</p>
          <a href="/" className="text-[14px] font-sans text-[#7BAFC8] hover:underline mt-4 inline-block" style={{ fontWeight: 500 }}>← Back to Create Suite</a>
        </div>
      </div>
    );
  }

  const displayName = profile.full_name;
  const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const handles = [
    profile.tiktok_handle && `TikTok: ${profile.tiktok_handle}`,
    profile.instagram_handle && `Instagram: ${profile.instagram_handle}`,
    profile.youtube_handle && `YouTube: ${profile.youtube_handle}`,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] overflow-hidden">
          {/* Header */}
          <div className="bg-[#FAF8F4] px-8 py-10 text-center border-b border-[#D8E8EE]">
            <div className="h-20 w-20 rounded-full bg-[#F2F8FB] border border-[#D8E8EE] mx-auto mb-4 flex items-center justify-center text-[22px] font-serif text-[#7BAFC8]">{initials}</div>
            <h1 className="text-[28px] font-serif text-[#1A2C38]">{displayName}</h1>
            {profile.primary_niche && (
              <p className="text-[12px] font-mono uppercase tracking-[2px] text-[#8AAABB] mt-1">{profile.primary_niche}</p>
            )}
            {handles.length > 0 && (
              <p className="text-[12px] font-sans text-[#8AAABB] mt-2">{handles.join(" · ")}</p>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="px-8 py-5 border-b border-[#D8E8EE]">
              <p className="text-[13px] font-sans text-[#4A6070] text-center leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {!profile.bio && (
            <div className="px-8 py-5 border-b border-[#D8E8EE] text-center">
              <p className="text-[13px] font-sans text-[#4A6070]">
                {displayName} uses Create Suite to manage brand partnerships. Reach out below to discuss a collaboration.
              </p>
            </div>
          )}

          {/* CTA / Form */}
          <div className="px-8 py-8">
            {!showForm && !submitted && (
              <div className="text-center">
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-[#1E3F52] text-white rounded-[8px] px-8 py-3 text-[14px] font-sans hover:bg-[#2a5269] transition-colors"
                  style={{ fontWeight: 600 }}
                >
                  Work with me
                </button>
              </div>
            )}
            {showForm && !submitted && (
              <InquiryForm profile={profile} onSubmit={() => { setShowForm(false); setSubmitted(true); }} />
            )}
            {submitted && (
              <div className="text-center py-4">
                <CheckCircle2 className="h-10 w-10 text-[#3D7A58] mx-auto mb-3" />
                <h3 className="text-[20px] font-serif text-[#1A2C38]">Inquiry sent!</h3>
                <p className="text-[13px] font-sans text-[#8AAABB] mt-1">{displayName.split(" ")[0]} will respond within 24 hours.</p>
              </div>
            )}
          </div>
        </div>

        <p className="text-center mt-6 text-[11px] font-sans text-[#8AAABB]">
          Powered by <a href="/" className="text-[#7BAFC8] hover:underline">Create Suite</a>
        </p>
      </div>
    </div>
  );
}

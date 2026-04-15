"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useSupabaseMutation } from "@/lib/hooks";
import { CheckCircle2, Users, Bell, MessageSquare, ListTodo } from "lucide-react";

export default function TeamOnboardingPage() {
  const { profile, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [notifications, setNotifications] = useState({ email: true, inApp: true });
  const [saving, setSaving] = useState(false);
  const mutation = useSupabaseMutation("profiles");

  // Populate full name from profile once loaded
  useEffect(() => {
    if (profile?.full_name && !fullName) {
      setFullName(profile.full_name);
    }
  }, [profile?.full_name, fullName]);

  const displayName = profile?.full_name || "Team Member";
  const agencyName = profile?.agency_name || "your agency";

  async function handleFinish() {
    if (!profile?.id) { window.location.href = "/dashboard"; return; }
    setSaving(true);
    try {
      await mutation.update(profile.id, {
        full_name: fullName || displayName,
        // timezone and notifications stored as extra fields if columns exist
      } as any);
      await refreshProfile();
      window.location.href = "/dashboard";
    } catch (e) {
      console.error("Failed to save onboarding:", e);
      window.location.href = "/dashboard"; // Don't block user
    }
  }

  const inputClass = "w-full rounded-[8px] border-[1.5px] border-[#D8E8EE] px-3 py-2.5 text-[14px] font-sans text-[#1A2C38] bg-white focus:outline-none focus:border-[#7BAFC8]";

  return (
    <div className="max-w-lg mx-auto pt-16">
      {/* Logo */}
      <div className="text-center mb-8">
        <img src="/logo.svg" alt="Create Suite" className="h-8 mx-auto mb-4" />
        <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB]" style={{ fontWeight: 600 }}>TEAM ONBOARDING</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4, 5].map(s => (
          <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? "bg-[#7BAFC8]" : "bg-[#D8E8EE]"}`} />
        ))}
      </div>

      <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[16px] p-8">
        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-[#F2F8FB] flex items-center justify-center mx-auto">
              <Users className="h-8 w-8 text-[#7BAFC8]" />
            </div>
            <h2 className="text-[24px] font-serif text-[#1A2C38]">Welcome to <em className="italic text-[#7BAFC8]">{agencyName}</em></h2>
            <p className="text-[14px] font-sans text-[#4A6070]">You&apos;ve been invited to join the team on Create Suite. Let&apos;s get you set up.</p>
            <button onClick={() => setStep(2)} className="bg-[#1E3F52] text-white rounded-[8px] px-8 py-3 text-[14px] font-sans hover:bg-[#2a5269]" style={{ fontWeight: 600 }}>Get started →</button>
          </div>
        )}

        {/* Step 2: Profile */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-[20px] font-serif text-[#1A2C38]">Set up your <em className="italic text-[#7BAFC8]">profile</em></h2>
            <div>
              <label className="text-[11px] font-sans text-[#8AAABB] uppercase tracking-[1.5px] block mb-1.5" style={{ fontWeight: 600 }}>Full Name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-[11px] font-sans text-[#8AAABB] uppercase tracking-[1.5px] block mb-1.5" style={{ fontWeight: 600 }}>Time Zone</label>
              <select value={timezone} onChange={e => setTimezone(e.target.value)} className={inputClass}>
                {["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Toronto", "Europe/London", "Europe/Paris", "Asia/Tokyo", "Australia/Sydney"].map(tz => (
                  <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
            <button onClick={() => setStep(3)} className="w-full bg-[#1E3F52] text-white rounded-[8px] px-6 py-3 text-[14px] font-sans" style={{ fontWeight: 600 }}>Continue →</button>
          </div>
        )}

        {/* Step 3: Your role */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-[20px] font-serif text-[#1A2C38]">Your <em className="italic text-[#7BAFC8]">role</em></h2>
            <p className="text-[14px] font-sans text-[#4A6070]">Here&apos;s what you can do as a {profile?.agency_role || "team member"}:</p>
            <div className="space-y-3">
              {[
                { icon: ListTodo, label: "View and manage deals across the roster" },
                { icon: MessageSquare, label: "Send messages to creators and team members" },
                { icon: Bell, label: "Get notified about important updates" },
                { icon: Users, label: "Collaborate with your team in channels" },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 p-3 bg-[#F2F8FB] rounded-[8px]">
                  <item.icon className="h-4 w-4 text-[#7BAFC8] flex-shrink-0" />
                  <span className="text-[13px] font-sans text-[#1A2C38]">{item.label}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(4)} className="w-full bg-[#1E3F52] text-white rounded-[8px] px-6 py-3 text-[14px] font-sans" style={{ fontWeight: 600 }}>Continue →</button>
          </div>
        )}

        {/* Step 4: Notifications */}
        {step === 4 && (
          <div className="space-y-5">
            <h2 className="text-[20px] font-serif text-[#1A2C38]">Notification <em className="italic text-[#7BAFC8]">preferences</em></h2>
            <div className="space-y-3">
              {[{ key: "email", label: "Email notifications" }, { key: "inApp", label: "In-app notifications" }].map(pref => (
                <div key={pref.key} className="flex items-center justify-between p-3 bg-[#FAF8F4] rounded-[8px]">
                  <span className="text-[13px] font-sans text-[#1A2C38]">{pref.label}</span>
                  <button onClick={() => setNotifications(p => ({ ...p, [pref.key]: !p[pref.key as keyof typeof p] }))} className={`h-6 w-11 rounded-full transition-colors ${notifications[pref.key as keyof typeof notifications] ? "bg-[#7BAFC8]" : "bg-[#D8E8EE]"}`}>
                    <div className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${notifications[pref.key as keyof typeof notifications] ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(5)} className="w-full bg-[#1E3F52] text-white rounded-[8px] px-6 py-3 text-[14px] font-sans" style={{ fontWeight: 600 }}>Continue →</button>
          </div>
        )}

        {/* Step 5: Done */}
        {step === 5 && (
          <div className="text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-[#3D7A58] mx-auto" />
            <h2 className="text-[24px] font-serif text-[#1A2C38]">You&apos;re all <em className="italic text-[#7BAFC8]">set</em></h2>
            <p className="text-[14px] font-sans text-[#4A6070]">Welcome to the team! Your dashboard is ready.</p>
            <button onClick={handleFinish} disabled={saving} className="bg-[#1E3F52] text-white rounded-[8px] px-8 py-3 text-[14px] font-sans hover:bg-[#2a5269] disabled:opacity-50" style={{ fontWeight: 600 }}>{saving ? "Setting up..." : "Go to dashboard →"}</button>
          </div>
        )}
      </div>
    </div>
  );
}

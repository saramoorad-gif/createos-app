"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Copy, Check } from "lucide-react";

// ─── Creator Onboarding (4 steps) ────────────────────────────────

function CreatorOnboarding() {
  const [step, setStep] = useState(1);
  const [tiktok, setTiktok] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [niche, setNiche] = useState("");
  const [hasAgency, setHasAgency] = useState<boolean | null>(null);
  const [agencyCode, setAgencyCode] = useState("");

  const totalSteps = 4;
  const inputClass =
    "w-full rounded-[10px] border border-[#D8E8EE] px-3 py-2.5 text-[13px] font-sans text-[#1A2C38] bg-white focus:outline-none focus:ring-2 focus:ring-[#7BAFC8]/20 focus:border-[#7BAFC8]";

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-6">
        <h1 className="text-[22px] font-serif text-[#1A2C38]">
          create<em className="italic text-[#7BAFC8]">OS</em>
        </h1>
      </div>

      <div className="flex items-center gap-2 mb-6">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${i < step ? "bg-[#7BAFC8]" : "bg-[#D8E8EE]"}`} />
        ))}
      </div>

      <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-6">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-[18px] font-serif text-[#1A2C38]">Connect your <em className="italic text-[#7BAFC8]">platforms</em></h2>
              <p className="text-[13px] font-sans text-[#8AAABB] mt-1">Add your social handles.</p>
            </div>
            <div>
              <label className="text-[12px] font-sans font-medium text-[#1A2C38] block mb-1.5">TikTok</label>
              <input type="text" className={inputClass} value={tiktok} onChange={e => setTiktok(e.target.value)} placeholder="@briannacole" />
            </div>
            <div>
              <label className="text-[12px] font-sans font-medium text-[#1A2C38] block mb-1.5">Instagram</label>
              <input type="text" className={inputClass} value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@brianna.cole" />
            </div>
            <div>
              <label className="text-[12px] font-sans font-medium text-[#1A2C38] block mb-1.5">YouTube</label>
              <input type="text" className={inputClass} value={youtube} onChange={e => setYoutube(e.target.value)} placeholder="@BriannaColeCreates" />
            </div>
            <button onClick={() => setStep(2)} className="w-full bg-[#7BAFC8] text-white font-sans font-medium text-[13px] py-2.5 rounded-[10px] hover:bg-[#6AA0BB]">Continue &rarr;</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-[18px] font-serif text-[#1A2C38]">Your primary <em className="italic text-[#7BAFC8]">niche</em></h2>
              <p className="text-[13px] font-sans text-[#8AAABB] mt-1">This helps us match you with brands.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {["Lifestyle", "Beauty", "Skincare", "Fashion", "Fitness", "Food", "Tech", "Travel", "Wellness", "Parenting"].map(n => (
                <button key={n} onClick={() => setNiche(n)} className={`rounded-[10px] border px-3 py-2.5 text-[13px] font-sans font-medium transition-colors ${niche === n ? "border-[#7BAFC8] bg-[#7BAFC8]/5 text-[#7BAFC8]" : "border-[#D8E8EE] bg-white text-[#8AAABB] hover:border-[#1A2C38]/20"}`}>{n}</button>
              ))}
            </div>
            <button onClick={() => setStep(3)} className="w-full bg-[#7BAFC8] text-white font-sans font-medium text-[13px] py-2.5 rounded-[10px] hover:bg-[#6AA0BB]">Continue &rarr;</button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-[18px] font-serif text-[#1A2C38]">Represented by an <em className="italic text-[#7BAFC8]">agency</em>?</h2>
              <p className="text-[13px] font-sans text-[#8AAABB] mt-1">If your agency uses CreateOS, link your accounts.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setHasAgency(true)} className={`rounded-[10px] border px-3 py-3 text-[13px] font-sans font-medium ${hasAgency === true ? "border-[#7BAFC8] bg-[#7BAFC8]/5 text-[#7BAFC8]" : "border-[#D8E8EE] text-[#8AAABB]"}`}>Yes</button>
              <button onClick={() => setHasAgency(false)} className={`rounded-[10px] border px-3 py-3 text-[13px] font-sans font-medium ${hasAgency === false ? "border-[#7BAFC8] bg-[#7BAFC8]/5 text-[#7BAFC8]" : "border-[#D8E8EE] text-[#8AAABB]"}`}>Not yet</button>
            </div>
            {hasAgency && (
              <div>
                <label className="text-[12px] font-sans font-medium text-[#1A2C38] block mb-1.5">Agency invite code</label>
                <input type="text" className={inputClass} value={agencyCode} onChange={e => setAgencyCode(e.target.value)} placeholder="e.g., BRIGHT-TALENT-2026" />
              </div>
            )}
            <button onClick={() => setStep(4)} className="w-full bg-[#7BAFC8] text-white font-sans font-medium text-[13px] py-2.5 rounded-[10px] hover:bg-[#6AA0BB]">{hasAgency === false ? "Skip & continue" : "Continue"} &rarr;</button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 text-center py-4">
            <div className="w-12 h-12 rounded-full bg-[#E8F4EE] flex items-center justify-center mx-auto mb-2"><span className="text-[#3D7A58] text-xl">&#10003;</span></div>
            <h2 className="text-[20px] font-serif text-[#1A2C38]">You&apos;re all <em className="italic text-[#7BAFC8]">set</em></h2>
            <p className="text-[13px] font-sans text-[#8AAABB]">Your creator dashboard is ready.</p>
            <button onClick={() => { window.location.href = "/dashboard"; }} className="w-full bg-[#7BAFC8] text-white font-sans font-medium text-[13px] py-2.5 rounded-[10px] hover:bg-[#6AA0BB]">Launch my CreateOS &rarr;</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Agency Onboarding (3 steps) ─────────────────────────────────

function AgencyOnboarding() {
  const [step, setStep] = useState(1);
  const [agencyName, setAgencyName] = useState("");
  const [role, setRole] = useState("");
  const [rosterSize, setRosterSize] = useState("");
  const [emails, setEmails] = useState("");
  const [copied, setCopied] = useState(false);
  const [agencyPlan, setAgencyPlan] = useState<"starter" | "growth" | null>(null);

  const inviteLink = "createsuite.co/join/BRIGHT-2026";
  const inputClass =
    "w-full rounded-[10px] border border-[#D8E8EE] px-3 py-2.5 text-[13px] font-sans text-[#1A2C38] bg-white focus:outline-none focus:ring-2 focus:ring-[#7BAFC8]/20 focus:border-[#7BAFC8]";

  return (
    <div className="w-full max-w-lg">
      <div className="text-center mb-6">
        <h1 className="text-[22px] font-serif text-[#1A2C38]">create<em className="italic text-[#7BAFC8]">OS</em></h1>
        <p className="text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#8AAABB] mt-2">AGENCY SETUP</p>
      </div>
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map(s => (<div key={s} className={`flex-1 h-1.5 rounded-full ${s <= step ? "bg-[#7BAFC8]" : "bg-[#D8E8EE]"}`} />))}
      </div>
      <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-6">
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-[18px] font-serif text-[#1A2C38]">Agency <em className="italic text-[#7BAFC8]">profile</em></h2>
              <p className="text-[13px] font-sans text-[#8AAABB] mt-1">Tell us about your agency.</p>
            </div>
            <div>
              <label className="text-[12px] font-sans font-medium text-[#1A2C38] block mb-1.5">Agency name</label>
              <input type="text" className={inputClass} value={agencyName} onChange={e => setAgencyName(e.target.value)} placeholder="Bright Talent Mgmt" />
            </div>
            <div>
              <label className="text-[12px] font-sans font-medium text-[#1A2C38] block mb-1.5">Your role</label>
              <div className="grid grid-cols-3 gap-2">
                {["Owner", "Manager", "Assistant"].map(r => (
                  <button key={r} onClick={() => setRole(r)} className={`rounded-[10px] border px-3 py-2.5 text-[13px] font-sans font-medium ${role === r ? "border-[#7BAFC8] bg-[#7BAFC8]/5 text-[#7BAFC8]" : "border-[#D8E8EE] text-[#8AAABB]"}`}>{r}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[12px] font-sans font-medium text-[#1A2C38] block mb-1.5">Roster size</label>
              <div className="grid grid-cols-2 gap-2">
                {["1-5", "6-15", "16-40", "40+"].map(s => (
                  <button key={s} onClick={() => setRosterSize(s)} className={`rounded-[10px] border px-3 py-2.5 text-[13px] font-sans font-medium ${rosterSize === s ? "border-[#7BAFC8] bg-[#7BAFC8]/5 text-[#7BAFC8]" : "border-[#D8E8EE] text-[#8AAABB]"}`}>{s} creators</button>
                ))}
              </div>
            </div>
            <button onClick={() => setStep(2)} className="w-full bg-[#7BAFC8] text-white font-sans font-medium text-[13px] py-2.5 rounded-[10px] hover:bg-[#6AA0BB]">Continue &rarr;</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-[18px] font-serif text-[#1A2C38]">Invite your <em className="italic text-[#7BAFC8]">roster</em></h2>
              <p className="text-[13px] font-sans text-[#8AAABB] mt-1">Share your invite link or enter emails. You can skip this.</p>
            </div>
            <div>
              <label className="text-[12px] font-sans font-medium text-[#1A2C38] block mb-1.5">Your invite link</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-[10px] bg-[#FAF8F4] border border-[#D8E8EE] px-3 py-2.5 text-[12px] font-mono text-[#8AAABB]">{inviteLink}</code>
                <button onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="flex items-center gap-1.5 px-3 py-2.5 border border-[#D8E8EE] rounded-[10px] text-[12px] font-sans font-500 text-[#7BAFC8] hover:bg-[#F2F8FB]">
                  {copied ? <><Check className="h-3.5 w-3.5" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                </button>
              </div>
            </div>
            <div>
              <label className="text-[12px] font-sans font-medium text-[#1A2C38] block mb-1.5">Or enter creator emails</label>
              <textarea className={`${inputClass} resize-none`} rows={3} value={emails} onChange={e => setEmails(e.target.value)} placeholder={"brianna@example.com\nmaya@example.com"} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(3)} className="flex-1 border border-[#D8E8EE] rounded-[10px] px-4 py-2.5 text-[13px] font-sans font-500 text-[#8AAABB] hover:bg-[#FAF8F4]">Skip for now</button>
              <button onClick={() => setStep(3)} className="flex-1 bg-[#7BAFC8] text-white font-sans font-medium text-[13px] py-2.5 rounded-[10px] hover:bg-[#6AA0BB]">Send invites &rarr;</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-[18px] font-serif text-[#1A2C38]">Choose your <em className="italic text-[#7BAFC8]">plan</em></h2>
              <p className="text-[13px] font-sans text-[#8AAABB] mt-1">Select the plan that fits your roster.</p>
            </div>
            <div className="space-y-3">
              {([
                { key: "starter" as const, name: "Starter", price: "$149", desc: "Up to 15 creators", features: ["Roster dashboard", "Commission tracking", "Conflict manager", "Campaign builder", "Brand reports", "Deal management"] },
                { key: "growth" as const, name: "Growth", price: "$249", desc: "Up to 40 creators — everything in Starter", features: ["Everything in Starter", "Up to 40 creators", "Priority support", "Custom reporting", "API access", "Advanced analytics"] },
              ]).map(plan => (
                <button key={plan.key} onClick={() => setAgencyPlan(plan.key)} className={`w-full text-left rounded-[10px] border p-5 transition-colors ${agencyPlan === plan.key ? "border-[#7BAFC8] ring-1 ring-[#7BAFC8]/20" : "border-[#D8E8EE] hover:border-[#1A2C38]/20"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[14px] font-sans font-600 text-[#1A2C38]">{plan.name}</span>
                    <span className="text-[20px] font-serif text-[#7BAFC8]">{plan.price}<span className="text-[12px] font-sans text-[#8AAABB]">/mo</span></span>
                  </div>
                  <p className="text-[12px] font-sans text-[#8AAABB] mb-2">{plan.desc}</p>
                  <div className="grid grid-cols-2 gap-1">
                    {plan.features.map(f => (<div key={f} className="flex items-start gap-1.5"><span className="text-[#3D7A58] text-[10px] mt-0.5">&#10003;</span><span className="text-[11px] font-sans text-[#1A2C38]">{f}</span></div>))}
                  </div>
                </button>
              ))}
            </div>
            <button disabled={!agencyPlan} onClick={() => { window.location.href = "/dashboard"; }} className="w-full bg-[#7BAFC8] text-white font-sans font-medium text-[13px] py-2.5 rounded-[10px] hover:bg-[#6AA0BB] disabled:opacity-50">Launch agency dashboard &rarr;</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Router ──────────────────────────────────────────────────────

function OnboardingContent() {
  const searchParams = useSearchParams();
  const flow = searchParams.get("flow");
  return (
    <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center px-4 py-8">
      {flow === "agency" ? <AgencyOnboarding /> : <CreatorOnboarding />}
    </div>
  );
}

export default function OnboardingPage() {
  return (<Suspense><OnboardingContent /></Suspense>);
}

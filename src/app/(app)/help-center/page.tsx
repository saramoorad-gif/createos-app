"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/global/toast";
import { Mail, MessageSquare, ChevronDown, Search, ExternalLink, BookOpen, Zap, CreditCard, Shield, Users, FileText, HelpCircle } from "lucide-react";

// ─── FAQ Data ────────────────────────────────────────────────────

const faqSections = [
  {
    title: "Getting Started",
    icon: Zap,
    items: [
      { q: "How do I create my first deal?", a: "Go to the Deals page and click '+ New deal'. Enter the brand name, deal value, deliverables, and due date. Your deal will appear in your pipeline immediately." },
      { q: "How do I set up my media kit?", a: "Go to Media Kit in the nav. Fill in your bio, social handles, follower counts, and rate card. Your public media kit will be available at createsuite.co/kit/yourname." },
      { q: "How do I import deals from a spreadsheet?", a: "Go to the Import page (accessible from your dashboard). Download the CSV template, fill in your existing deals, then upload or paste the data. We'll import everything automatically." },
      { q: "How do I connect my social accounts?", a: "Go to Settings → Integrations. You can connect Gmail, Google Calendar, and DocuSign. TikTok, Instagram, and YouTube integrations are coming soon." },
    ],
  },
  {
    title: "Deals & Pipeline",
    icon: FileText,
    items: [
      { q: "What are the deal stages?", a: "Deals move through: Lead → Pitched → Negotiating → Contracted → In Progress → Delivered → Paid. You can change the stage by clicking the stage pill on any deal." },
      { q: "How do I create an invoice from a deal?", a: "Open any deal, then click 'Create Invoice'. The invoice will be pre-filled with the deal's brand name, value, and due date." },
      { q: "Can my agency manage my deals?", a: "Yes — if you're connected to an agency, they can create, edit, and move deals on your behalf. You'll see an 'Added by agency' badge on any deal they create." },
    ],
  },
  {
    title: "Billing & Subscription",
    icon: CreditCard,
    items: [
      { q: "How do I upgrade my plan?", a: "Go to Settings → Billing → Manage billing. This opens your Stripe billing portal where you can upgrade, downgrade, or change your payment method." },
      { q: "Can I cancel my subscription?", a: "Yes — you can cancel anytime from Settings → Billing. You'll keep access until the end of your current billing period." },
      { q: "What happens if my payment fails?", a: "Stripe will retry the payment automatically. If it fails multiple times, your account will be downgraded to the Free plan. You won't lose any data." },
    ],
  },
  {
    title: "Agency & Teams",
    icon: Users,
    items: [
      { q: "How do I connect to an agency?", a: "Your agency will send you an invite link or invite code. Go to Settings → Agency Access to enter it. Once connected, they can help manage your deals." },
      { q: "What can my agency see?", a: "Your agency can see and edit your deals, invoices, and contracts. They cannot access your profile, media kit, rate card, billing, or email inbox." },
      { q: "How do I disconnect from my agency?", a: "Go to Settings → Agency Access and click 'Disconnect'. Your agency will lose access immediately. Your existing deals and data won't be deleted." },
    ],
  },
  {
    title: "Privacy & Security",
    icon: Shield,
    items: [
      { q: "Is my data secure?", a: "Yes — we use Supabase with row-level security, which means your data is only accessible to you and anyone you explicitly grant access to (like your agency)." },
      { q: "Who can see my rate card?", a: "Only you can see your rate card. Your agency cannot view or modify it. It's displayed on your public media kit only if you choose to publish it." },
      { q: "Can I delete my account?", a: "Yes — contact us at hello@createsuite.co and we'll delete your account and all associated data within 24 hours." },
    ],
  },
];

// ─── AI Troubleshooter ──────────────────────────────────────────

const troubleshootOptions = [
  { issue: "I can't log in", steps: ["Clear your browser cookies and try again.", "Make sure you're using the same email you signed up with.", "Try the 'Magic link' option on the login page — we'll email you a secure login link.", "If nothing works, email hello@createsuite.co and we'll reset your account."] },
  { issue: "My deals aren't saving", steps: ["Check your internet connection.", "Make sure all required fields are filled in (brand name is required).", "Try refreshing the page and creating the deal again.", "If the issue persists, try from a different browser or clear your cache."] },
  { issue: "I can't connect to my agency", steps: ["Ask your agency for a new invite link — links expire after 7 days.", "Make sure you're logged into the correct account.", "Check Settings → Agency Access to see if you're already connected.", "Contact your agency directly to verify they've sent the invite."] },
  { issue: "My invoice isn't sending", steps: ["Make sure the brand's email address is correct.", "Check that your email integration (Gmail/Outlook) is connected in Settings → Integrations.", "Try sending a test invoice to your own email first.", "If email sending fails, the invoice is still saved — you can download it as PDF and send manually."] },
  { issue: "Something else", steps: ["Try refreshing the page.", "Clear your browser cache and cookies.", "Try from a different browser (Chrome, Safari, Firefox).", "If the issue persists, email hello@createsuite.co with a description of the problem and a screenshot."] },
];

export default function HelpCenterPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"faq" | "troubleshoot" | "contact">("faq");
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({ subject: "", message: "" });
  const [sending, setSending] = useState(false);

  // Filter FAQs by search
  const filteredSections = searchQuery
    ? faqSections.map(s => ({
        ...s,
        items: s.items.filter(
          i => i.q.toLowerCase().includes(searchQuery.toLowerCase()) || i.a.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(s => s.items.length > 0)
    : faqSections;

  async function handleContactSubmit() {
    if (!contactForm.subject || !contactForm.message) {
      toast("warning", "Please fill in both subject and message");
      return;
    }
    setSending(true);
    try {
      await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "hello@createsuite.co",
          subject: `[Support] ${contactForm.subject}`,
          body: `<p><strong>From:</strong> ${profile?.full_name || "Unknown"} (${profile?.email || "Unknown"})</p><p><strong>Account type:</strong> ${profile?.account_type || "Unknown"}</p><hr/><p>${contactForm.message.replace(/\n/g, "<br/>")}</p>`,
        }),
      });
      toast("success", "Message sent — we'll get back to you within 1 business day");
      setContactForm({ subject: "", message: "" });
    } catch {
      toast("error", "Failed to send — please email hello@createsuite.co directly");
    }
    setSending(false);
  }

  const inputClass = "w-full rounded-[8px] border-[1.5px] border-[#D8E8EE] px-3 py-2.5 text-[14px] font-sans text-[#1A2C38] bg-white focus:outline-none focus:border-[#7BAFC8]";

  return (
    <div>
      <PageHeader
        headline={<>How can we <em className="italic text-[#7BAFC8]">help</em>?</>}
        subheading="Search FAQs, troubleshoot issues, or contact our team."
      />

      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-6">
        {([
          { key: "faq" as const, label: "FAQs", icon: BookOpen },
          { key: "troubleshoot" as const, label: "Troubleshoot", icon: Zap },
          { key: "contact" as const, label: "Contact Support", icon: Mail },
        ]).map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`flex items-center gap-2 px-4 py-2 text-[12px] font-sans rounded-[8px] transition-colors ${activeTab === t.key ? "bg-[#1E3F52] text-white" : "text-[#8AAABB] hover:bg-[#F2F8FB]"}`} style={{ fontWeight: 500 }}>
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* FAQ Tab */}
      {activeTab === "faq" && (
        <div className="max-w-3xl">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#8AAABB]" />
            <input type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setOpenFaq(null); }} placeholder="Search for help..." className={`${inputClass} pl-10`} />
          </div>

          {/* FAQ sections */}
          {filteredSections.map(section => (
            <div key={section.title} className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <section.icon className="h-4 w-4 text-[#7BAFC8]" />
                <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB]" style={{ fontWeight: 600 }}>{section.title}</p>
              </div>
              <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] overflow-hidden">
                {section.items.map(item => {
                  const isOpen = openFaq === item.q;
                  return (
                    <div key={item.q} className="border-b border-[#EEE8E0] last:border-b-0">
                      <button onClick={() => setOpenFaq(isOpen ? null : item.q)} className="w-full text-left flex items-center justify-between px-5 py-4 hover:bg-[#FAF8F4] transition-colors">
                        <span className="text-[14px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>{item.q}</span>
                        <ChevronDown className={`h-4 w-4 text-[#8AAABB] transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4">
                          <p className="text-[13px] font-sans text-[#4A6070] leading-relaxed">{item.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredSections.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[16px] font-serif italic text-[#8AAABB] mb-2">No results for &ldquo;{searchQuery}&rdquo;</p>
              <p className="text-[13px] font-sans text-[#4A6070]">Try a different search or <button onClick={() => setActiveTab("contact")} className="text-[#7BAFC8] hover:underline" style={{ fontWeight: 500 }}>contact support</button>.</p>
            </div>
          )}
        </div>
      )}

      {/* Troubleshoot Tab */}
      {activeTab === "troubleshoot" && (
        <div className="max-w-2xl">
          <p className="text-[14px] font-sans text-[#4A6070] mb-6">Select the issue you&apos;re experiencing and we&apos;ll walk you through the fix.</p>

          {!selectedIssue ? (
            <div className="space-y-2">
              {troubleshootOptions.map(opt => (
                <button key={opt.issue} onClick={() => setSelectedIssue(opt.issue)} className="w-full text-left bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] px-5 py-4 hover:border-[#7BAFC8] hover:shadow-card transition-all flex items-center justify-between">
                  <span className="text-[14px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>{opt.issue}</span>
                  <ChevronDown className="h-4 w-4 text-[#8AAABB] -rotate-90" />
                </button>
              ))}
            </div>
          ) : (
            <div>
              <button onClick={() => setSelectedIssue(null)} className="text-[13px] font-sans text-[#7BAFC8] hover:underline mb-4" style={{ fontWeight: 500 }}>← Back to issues</button>
              <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-6">
                <h3 className="text-[16px] font-serif text-[#1A2C38] mb-4">{selectedIssue}</h3>
                <div className="space-y-3">
                  {troubleshootOptions.find(o => o.issue === selectedIssue)?.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-[#F2F8FB] flex items-center justify-center flex-shrink-0">
                        <span className="text-[11px] font-sans text-[#7BAFC8]" style={{ fontWeight: 700 }}>{i + 1}</span>
                      </div>
                      <p className="text-[13px] font-sans text-[#1A2C38] pt-0.5">{step}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-[#D8E8EE]">
                  <p className="text-[13px] font-sans text-[#8AAABB]">Still stuck? <button onClick={() => setActiveTab("contact")} className="text-[#7BAFC8] hover:underline" style={{ fontWeight: 500 }}>Contact support</button></p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contact Tab */}
      {activeTab === "contact" && (
        <div className="max-w-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <a href="mailto:hello@createsuite.co" className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5 hover:border-[#7BAFC8] hover:shadow-card transition-all flex items-start gap-3">
              <div className="h-10 w-10 rounded-[10px] bg-[#F2F8FB] flex items-center justify-center flex-shrink-0">
                <Mail className="h-5 w-5 text-[#7BAFC8]" />
              </div>
              <div>
                <h3 className="text-[14px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>Email us</h3>
                <p className="text-[13px] font-sans text-[#7BAFC8] mt-0.5">hello@createsuite.co</p>
                <p className="text-[12px] font-sans text-[#8AAABB] mt-1">Typically respond within 1 business day</p>
              </div>
            </a>
            <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5 flex items-start gap-3">
              <div className="h-10 w-10 rounded-[10px] bg-[#F2F8FB] flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-5 w-5 text-[#7BAFC8]" />
              </div>
              <div>
                <h3 className="text-[14px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>In-app support</h3>
                <p className="text-[13px] font-sans text-[#8AAABB] mt-0.5">Send a message below and we&apos;ll reply to your email</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-6 space-y-4">
            <h3 className="text-[16px] font-serif text-[#1A2C38]">Send us a message</h3>
            <div>
              <label className="text-[11px] font-sans text-[#8AAABB] uppercase tracking-[1.5px] block mb-1.5" style={{ fontWeight: 600 }}>Subject</label>
              <input type="text" value={contactForm.subject} onChange={e => setContactForm(p => ({ ...p, subject: e.target.value }))} placeholder="What do you need help with?" className={inputClass} />
            </div>
            <div>
              <label className="text-[11px] font-sans text-[#8AAABB] uppercase tracking-[1.5px] block mb-1.5" style={{ fontWeight: 600 }}>Message</label>
              <textarea value={contactForm.message} onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))} rows={5} placeholder="Describe the issue or question..." className={`${inputClass} resize-none`} />
            </div>
            <p className="text-[12px] font-sans text-[#8AAABB]">
              We&apos;ll reply to <span className="text-[#1A2C38]" style={{ fontWeight: 500 }}>{profile?.email || "your email"}</span> within 1 business day.
            </p>
            <button onClick={handleContactSubmit} disabled={sending} className="w-full bg-[#1E3F52] text-white rounded-[8px] px-6 py-3 text-[14px] font-sans disabled:opacity-50 hover:bg-[#2a5269] transition-colors" style={{ fontWeight: 600 }}>
              {sending ? "Sending..." : "Send message"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

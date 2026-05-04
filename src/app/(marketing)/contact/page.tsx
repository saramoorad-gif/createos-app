"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

type AccountType = "" | "creator" | "agency" | "other";

function ContactContent() {
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Pre-fill subject and account type from query param
  useEffect(() => {
    if (topic === "demo") {
      setSubject("Demo request");
      setAccountType("agency");
      setMessage("Hi! I'd like to book a demo to see how Create Suite can work for my agency.\n\nAgency name: \nTeam size: \nPreferred demo time: ");
    }
  }, [topic]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Escape HTML to prevent injection via user input
  function escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "hello@createsuite.co",
          subject: `[Contact Form] ${escapeHtml(subject)}`,
          body: `
            <h3>New contact form submission</h3>
            <p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>
            <p><strong>Account type:</strong> ${escapeHtml(accountType)}</p>
            <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
            <p><strong>Message:</strong></p>
            <p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
          `,
          replyTo: email,
        }),
      });
      if (!res.ok) throw new Error("Failed to send");
      setSubmitted(true);
    } catch (err) {
      console.error("Contact form error:", err);
      setError("Failed to send message. Please email us directly at hello@createsuite.co");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="pt-20 pb-6 px-6">
        <div className="max-w-[900px] mx-auto text-center">
          <p className="text-[12px] font-sans font-600 uppercase tracking-[3px] text-[#7BAFC8] mb-3">
            CONTACT
          </p>
          <h1 className="text-[48px] md:text-[56px] font-serif font-normal leading-[1.1] text-[#1A2C38] mb-4">
            We&apos;d love to hear from{" "}
            <em className="italic text-[#3D6E8A]">you</em>
          </h1>
          <p className="text-[17px] font-sans text-[#4A6070] max-w-[480px] mx-auto leading-relaxed">
            Have a question, feedback, or want to learn more? Drop us a message
            and we&apos;ll get back to you quickly.
          </p>
        </div>
      </section>

      {/* Two-column layout */}
      <section className="py-12 px-6">
        <div className="max-w-[1000px] mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Left: Contact Form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-10 text-center">
                <div className="h-14 w-14 rounded-full bg-[#F2F8FB] flex items-center justify-center mx-auto mb-4">
                  <span className="text-[#3D6E8A] text-2xl">&#10003;</span>
                </div>
                <h3 className="text-[22px] font-serif text-[#1A2C38] mb-2">
                  Message sent
                </h3>
                <p className="text-[14px] font-sans text-[#4A6070]">
                  Thanks for reaching out. We&apos;ll get back to you within 24
                  hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-[13px] font-sans font-500 text-[#1A2C38] mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full rounded-[10px] border border-[#D8E8EE] bg-white px-4 py-3 text-[14px] font-sans text-[#1A2C38] placeholder:text-[#8AAABB] focus:border-[#7BAFC8] focus:outline-none transition-colors"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[13px] font-sans font-500 text-[#1A2C38] mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-[10px] border border-[#D8E8EE] bg-white px-4 py-3 text-[14px] font-sans text-[#1A2C38] placeholder:text-[#8AAABB] focus:border-[#7BAFC8] focus:outline-none transition-colors"
                  />
                </div>

                {/* Account Type */}
                <div>
                  <label className="block text-[13px] font-sans font-500 text-[#1A2C38] mb-1.5">
                    Account type
                  </label>
                  <select
                    required
                    value={accountType}
                    onChange={(e) =>
                      setAccountType(e.target.value as AccountType)
                    }
                    className="w-full rounded-[10px] border border-[#D8E8EE] bg-white px-4 py-3 text-[14px] font-sans text-[#1A2C38] focus:border-[#7BAFC8] focus:outline-none transition-colors appearance-none"
                  >
                    <option value="" disabled>
                      Select one
                    </option>
                    <option value="creator">Creator</option>
                    <option value="agency">Agency</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-[13px] font-sans font-500 text-[#1A2C38] mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="What is this about?"
                    className="w-full rounded-[10px] border border-[#D8E8EE] bg-white px-4 py-3 text-[14px] font-sans text-[#1A2C38] placeholder:text-[#8AAABB] focus:border-[#7BAFC8] focus:outline-none transition-colors"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-[13px] font-sans font-500 text-[#1A2C38] mb-1.5">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us more..."
                    className="w-full rounded-[10px] border border-[#D8E8EE] bg-white px-4 py-3 text-[14px] font-sans text-[#1A2C38] placeholder:text-[#8AAABB] focus:border-[#7BAFC8] focus:outline-none transition-colors resize-none"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-[10px]">
                    <p className="text-[13px] font-sans text-red-700">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1E3F52] text-white text-[15px] font-sans font-500 py-3.5 rounded-[10px] hover:bg-[#2a5269] transition-colors disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send message"}
                </button>
              </form>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Book a Demo card */}
            <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-6">
              <p className="text-[12px] font-sans font-600 uppercase tracking-[3px] text-[#7BAFC8] mb-3">
                FOR AGENCIES
              </p>
              <h3 className="text-[20px] font-serif text-[#1A2C38] mb-2">
                Book a <em className="italic text-[#3D6E8A]">demo</em>
              </h3>
              <p className="text-[13px] font-sans text-[#4A6070] leading-relaxed mb-5">
                See how Create Suite can replace your existing stack. Get a
                personalized walkthrough with our team, tailored to your
                agency&apos;s size and workflow.
              </p>
              <a
                href="https://calendly.com/createsuite/demo"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-[#1E3F52] text-white text-[14px] font-sans font-500 py-3 rounded-[10px] hover:bg-[#2a5269] transition-colors"
              >
                Schedule a demo
              </a>
            </div>

            {/* Response time */}
            <div className="bg-[#F2F8FB] border border-[#D8E8EE] rounded-[10px] p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center">
                  <svg
                    className="h-4 w-4 text-[#3D6E8A]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-[14px] font-sans font-600 text-[#1A2C38]">
                    Fast response time
                  </p>
                  <p className="text-[12px] font-sans text-[#4A6070]">
                    We typically reply within 24 hours on business days.
                  </p>
                </div>
              </div>
            </div>

            {/* Social links */}
            <div className="bg-white border border-[#D8E8EE] rounded-[10px] p-5">
              <p className="text-[13px] font-sans font-600 text-[#1A2C38] mb-3">
                Follow us
              </p>
              <div className="space-y-3">
                <a
                  href="https://instagram.com/createsuite"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-[13px] font-sans text-[#4A6070] hover:text-[#3D6E8A] transition-colors"
                >
                  <div className="h-8 w-8 rounded-lg bg-[#F2F8FB] flex items-center justify-center flex-shrink-0">
                    <svg
                      className="h-4 w-4 text-[#3D6E8A]"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </div>
                  Instagram
                </a>
                <a
                  href="https://tiktok.com/@createsuite"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-[13px] font-sans text-[#4A6070] hover:text-[#3D6E8A] transition-colors"
                >
                  <div className="h-8 w-8 rounded-lg bg-[#F2F8FB] flex items-center justify-center flex-shrink-0">
                    <svg
                      className="h-4 w-4 text-[#3D6E8A]"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13a8.28 8.28 0 005.58 2.15V11.7a4.83 4.83 0 01-3.77-1.24V6.69h3.77z" />
                    </svg>
                  </div>
                  TikTok
                </a>
                <a
                  href="https://linkedin.com/company/createsuite"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-[13px] font-sans text-[#4A6070] hover:text-[#3D6E8A] transition-colors"
                >
                  <div className="h-8 w-8 rounded-lg bg-[#F2F8FB] flex items-center justify-center flex-shrink-0">
                    <svg
                      className="h-4 w-4 text-[#3D6E8A]"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </div>
                  LinkedIn
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="text-center">
              <p className="text-[12px] font-sans text-[#8AAABB] mb-1">
                Or email us directly
              </p>
              <a
                href="mailto:hello@createsuite.co"
                className="text-[14px] font-sans font-500 text-[#3D6E8A] hover:underline"
              >
                hello@createsuite.co
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center"><p className="text-[14px] font-sans text-[#8AAABB]">Loading...</p></div>}>
      <ContactContent />
    </Suspense>
  );
}

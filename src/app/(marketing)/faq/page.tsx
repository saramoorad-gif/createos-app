"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const creatorFAQs: FAQItem[] = [
  {
    question: "What is Create Suite?",
    answer:
      "Create Suite is the business operating system built specifically for content creators. It brings your deals, contracts, invoices, audience analytics, rate benchmarking, and media kit into a single dashboard so you can run your creator business without juggling a dozen different tools.",
  },
  {
    question: "How is this different from a spreadsheet or Notion template?",
    answer:
      "Spreadsheets and Notion templates require you to manually update every field, have no built-in logic, and break as your deal volume grows. Create Suite automates deal tracking, calculates your rates against real market data, analyzes contracts with AI, and generates invoices — all connected in one system that actually understands the creator workflow.",
  },
  {
    question: "Does it automatically pull my Instagram or TikTok data?",
    answer:
      "Currently, you can enter your social metrics manually or import them via CSV. We are actively building direct API integrations with Instagram, TikTok, and YouTube that will automatically sync your follower counts, engagement rates, and audience demographics into your dashboard.",
  },
  {
    question: "What does the AI contract analysis actually check for?",
    answer:
      "When you upload a brand contract, our AI scans for red flags like unlimited usage rights, exclusivity clauses without adequate compensation, unreasonable content revision terms, and missing payment timelines. It highlights risky clauses, compares terms against industry standards, and suggests counter-language you can bring back to the brand.",
  },
  {
    question: "What is the Brand Radar and how does it work?",
    answer:
      "Brand Radar monitors active campaigns and brand partnerships across the creator economy to surface brands that are currently hiring creators in your niche. It shows you which brands are spending, what types of creators they are working with, and typical deal sizes — so you can pitch proactively with real data instead of guessing.",
  },
  {
    question: "How does the Rate Calculator know what to recommend?",
    answer:
      "The Rate Calculator factors in your follower count, engagement rate, content vertical, platform, and deliverable type, then benchmarks those inputs against aggregated market data from thousands of creator deals. It produces a recommended rate range so you can confidently quote brands without leaving money on the table.",
  },
  {
    question: "Can my agency also see my account?",
    answer:
      "Yes. If you are represented by an agency that uses Create Suite, you can link your account to their workspace. Your agency will see your deal pipeline, contracts, and earnings, while you maintain control over your personal settings and data. You can unlink at any time from your account settings.",
  },
  {
    question: "Can I connect to an agency if I don't have one yet?",
    answer:
      "Absolutely. Create Suite works as a standalone tool for independent creators. If you sign with an agency in the future that also uses Create Suite, you can link your existing account to their workspace without losing any of your historical data, deals, or contracts.",
  },
  {
    question:
      "How does invoicing work — do brands pay through the platform?",
    answer:
      "Create Suite lets you generate professional invoices and send them directly to brands via email. The platform tracks invoice status (sent, viewed, paid, overdue) and sends automatic payment reminders. Payments are handled between you and the brand through your preferred method — we do not process brand payments directly.",
  },
  {
    question: "What is the Creator Health Score?",
    answer:
      "The Creator Health Score is a composite metric that evaluates the overall strength of your creator business. It factors in deal frequency, average deal value, audience engagement trends, invoice payment timeliness, and contract quality to give you a single score you can track over time and use to benchmark your growth.",
  },
  {
    question: "Is there a mobile app?",
    answer:
      "Not yet, but Create Suite is fully responsive and works well on mobile browsers. A dedicated iOS and Android app is on our roadmap and will include push notifications for deal updates, contract alerts, and invoice activity.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. You can cancel your subscription at any time from your account settings. When you cancel, you keep access to your paid features until the end of your current billing period, after which your account reverts to the Free plan. There are no cancellation fees or long-term commitments.",
  },
];

const agencyFAQs: FAQItem[] = [
  {
    question: "What is Create Suite for agencies?",
    answer:
      "Create Suite for agencies is a centralized workspace for managing your entire creator roster, brand campaigns, contracts, commissions, and internal communications. It replaces the patchwork of spreadsheets, Slack channels, and shared drives with a purpose-built platform designed for how talent agencies actually operate.",
  },
  {
    question: "How do I invite creators to link their accounts?",
    answer:
      "From your agency dashboard, navigate to the Roster tab and click \"Invite Creator.\" You can send an email invitation with a unique link. When the creator accepts, their account is linked to your workspace, giving you visibility into their deals, contracts, and earnings while they retain control of their personal settings.",
  },
  {
    question:
      "Can I edit deals and contracts on behalf of my creators?",
    answer:
      "Yes. Agency team members with the appropriate permissions can create, edit, and manage deals and contracts within linked creator profiles. All edits are logged with timestamps and the team member who made them, so you have a complete audit trail for accountability.",
  },
  {
    question: "How does the exclusivity conflict detector work?",
    answer:
      "The conflict detector continuously scans all active contracts across your roster for overlapping exclusivity clauses. If a new deal would conflict with an existing exclusivity agreement — for example, two competing brands in the same category — the system flags it immediately so you can resolve the conflict before signing.",
  },
  {
    question: "Can multiple team members access the agency account?",
    answer:
      "Yes. Agency plans support multiple team seats with role-based permissions. You can assign roles such as Admin, Manager, and Coordinator, each with different access levels for viewing, editing, and managing creator accounts, contracts, and financial data.",
  },
  {
    question: "How is commission tracked and calculated?",
    answer:
      "Commissions are automatically calculated based on the commission rate you set per creator or per deal. The system tracks earned commissions against deal payments, shows you outstanding versus collected amounts, and lets you export monthly commission reports for accounting purposes.",
  },
  {
    question: "What does the campaign builder do?",
    answer:
      "The campaign builder lets you organize multi-creator brand campaigns with deliverable tracking, content approval workflows, deadline management, and a shared timeline. You can assign creators to specific deliverables, track completion status, and generate campaign recap reports to share directly with brand partners.",
  },
  {
    question: "Can I generate reports to share with brands?",
    answer:
      "Yes. Create Suite includes a reporting module that generates polished campaign reports with metrics, deliverable summaries, and performance data. Reports can be exported as PDFs or shared via a secure link, making it easy to keep brand partners informed without building presentations from scratch.",
  },
  {
    question: "What is the internal messaging system?",
    answer:
      "The internal messaging system is a built-in communication tool for your agency team and linked creators. It supports threaded conversations, file sharing, and task assignment — so you can coordinate on deals and campaigns without switching to email or Slack. All messages are searchable and organized by creator or campaign.",
  },
  {
    question:
      "How does AI contract analysis work for uploaded contracts?",
    answer:
      "When you upload a contract to any creator profile, the AI engine scans the document for key clauses including payment terms, exclusivity windows, usage rights, content ownership, and termination conditions. It highlights potential issues, compares terms to industry benchmarks, and suggests negotiation points — saving your team hours of manual review.",
  },
  {
    question: "What happens if a creator leaves my agency?",
    answer:
      "If a creator unlinks their account from your agency workspace, they retain full ownership of their personal data and account. Your agency keeps a read-only archive of the deals and contracts that were managed during the relationship for your records. Active deals can be transitioned or closed as needed before the unlink is finalized.",
  },
  {
    question:
      "What is the difference between Starter and Growth plans?",
    answer:
      "The Starter plan is designed for smaller agencies managing up to 15 creators, with core features like roster management, deal tracking, and commission calculations. The Growth plan supports unlimited creators and adds advanced features including the campaign builder, conflict detection, custom reporting, and priority support.",
  },
];

function FAQSection({
  title,
  items,
  openIndex,
  onToggle,
}: {
  title: string;
  items: FAQItem[];
  openIndex: number | null;
  onToggle: (index: number) => void;
}) {
  return (
    <div>
      <h2 className="font-serif text-[28px] text-[#1A2C38] mb-8">{title}</h2>
      <div>
        {items.map((item, index) => (
          <div key={index} className="border-b border-[#D8E8EE]">
            <button
              onClick={() => onToggle(index)}
              className="w-full flex items-center justify-between py-5 text-left gap-4"
            >
              <span className="text-[15px] font-sans font-medium text-[#1A2C38]">
                {item.question}
              </span>
              <ChevronDown
                size={18}
                className={`text-[#7BAFC8] shrink-0 transition-transform duration-200 ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-200 ${
                openIndex === index
                  ? "max-h-[500px] opacity-100 pb-5"
                  : "max-h-0 opacity-0"
              }`}
            >
              <p className="text-[14px] font-sans text-[#4A6070] leading-relaxed pr-8">
                {item.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FAQPage() {
  const [creatorOpen, setCreatorOpen] = useState<number | null>(null);
  const [agencyOpen, setAgencyOpen] = useState<number | null>(null);

  return (
    <section className="py-24 px-6">
      <div className="max-w-[800px] mx-auto">
        {/* Header */}
        <div className="mb-16">
          <p className="text-[12px] font-sans font-semibold uppercase tracking-[3px] text-[#7BAFC8] mb-4">
            Support
          </p>
          <h1 className="font-serif text-[40px] leading-tight text-[#1A2C38] mb-4">
            Frequently Asked{" "}
            <em className="text-[#3D6E8A]">Questions</em>
          </h1>
          <p className="text-[15px] font-sans text-[#4A6070] max-w-[600px]">
            Everything you need to know about Create Suite, whether you are an
            independent creator or managing a roster of talent.
          </p>
        </div>

        {/* For Creators */}
        <div className="mb-20">
          <FAQSection
            title="For Creators"
            items={creatorFAQs}
            openIndex={creatorOpen}
            onToggle={(i) => setCreatorOpen(creatorOpen === i ? null : i)}
          />
        </div>

        {/* For Agencies */}
        <div>
          <FAQSection
            title="For Agencies"
            items={agencyFAQs}
            openIndex={agencyOpen}
            onToggle={(i) => setAgencyOpen(agencyOpen === i ? null : i)}
          />
        </div>
      </div>
    </section>
  );
}

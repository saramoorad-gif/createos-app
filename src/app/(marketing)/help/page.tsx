import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Help Center — Create Suite",
  description:
    "Find answers to common questions about Create Suite. Learn how to manage deals, invoices, contracts, and agency tools.",
};

const categories = [
  {
    name: "Getting Started",
    count: 5,
    description:
      "Set up your account, connect platforms, and start managing your creator business.",
    color: "#7BAFC8",
  },
  {
    name: "Deal Pipeline",
    count: 5,
    description:
      "Track brand deals from first contact to final payment with stages, notes, and timelines.",
    color: "#3D6E8A",
  },
  {
    name: "Invoicing & Payments",
    count: 4,
    description:
      "Create invoices, set up automatic reminders, and get paid on time.",
    color: "#7BAFC8",
  },
  {
    name: "Contracts & AI Analysis",
    count: 4,
    description:
      "Upload contracts for instant AI review, spot red flags, and use templates.",
    color: "#3D6E8A",
  },
  {
    name: "Agency Tools",
    count: 5,
    description:
      "Manage your roster, build campaigns, detect conflicts, and generate brand reports.",
    color: "#7BAFC8",
  },
  {
    name: "Account & Billing",
    count: 4,
    description:
      "Manage your subscription, understand billing, and configure account settings.",
    color: "#3D6E8A",
  },
];

const articleGroups: {
  category: string;
  articles: { slug: string; title: string }[];
}[] = [
  {
    category: "Getting Started",
    articles: [
      { slug: "getting-started", title: "Welcome to Create Suite" },
      { slug: "connect-platforms", title: "How to set up your creator profile" },
      { slug: "invite-team", title: "Inviting creators to your agency" },
      { slug: "choosing-your-plan", title: "Which plan is right for you?" },
      { slug: "creator-onboarding", title: "Creator onboarding checklist" },
    ],
  },
  {
    category: "Deal Pipeline",
    articles: [
      { slug: "create-a-deal", title: "How to log your first brand deal" },
      { slug: "deal-stages", title: "Understanding deal stages" },
      { slug: "deal-slide-over", title: "Using the deal detail panel" },
      { slug: "exclusivity-tracking", title: "How exclusivity is tracked" },
      {
        slug: "agency-deal-management",
        title: "How agencies manage creator deals",
      },
    ],
  },
  {
    category: "Invoicing & Payments",
    articles: [
      { slug: "create-invoice", title: "Creating and sending an invoice" },
      { slug: "invoice-reminders", title: "Automatic payment reminders" },
      { slug: "payment-methods", title: "How creators receive payment" },
      { slug: "commission-invoices", title: "How agency commissions work" },
    ],
  },
  {
    category: "Contracts & AI Analysis",
    articles: [
      {
        slug: "upload-contract",
        title: "Uploading a contract for AI analysis",
      },
      {
        slug: "reading-ai-analysis",
        title: "How to read your analysis report",
      },
      { slug: "red-flags", title: "What red flags does the AI look for?" },
      { slug: "contract-templates", title: "Using contract templates" },
    ],
  },
  {
    category: "Agency Tools",
    articles: [
      { slug: "roster-overview", title: "Understanding the roster dashboard" },
      { slug: "campaign-builder", title: "Building multi-creator campaigns" },
      { slug: "conflict-detection", title: "How conflict detection works" },
      { slug: "messaging-system", title: "Using internal messaging" },
      { slug: "brand-reports", title: "Generating brand reports" },
    ],
  },
  {
    category: "Account & Billing",
    articles: [
      { slug: "manage-subscription", title: "Managing your subscription" },
      { slug: "billing-faq", title: "Billing frequently asked questions" },
      { slug: "agency-vs-creator", title: "Agency vs creator accounts" },
      { slug: "delete-account", title: "How to delete your account" },
    ],
  },
];

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      {/* Hero */}
      <section className="px-6 pt-32 pb-20 text-center">
        <p className="text-[12px] font-sans font-semibold uppercase tracking-[3px] text-[#7BAFC8] mb-6">
          Help Center
        </p>
        <h1 className="text-[48px] font-serif text-[#1A2C38] leading-tight mb-8">
          How can we <em className="text-[#3D6E8A]">help</em>?
        </h1>

        {/* Decorative search bar */}
        <div className="max-w-[520px] mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8AAABB]" />
          <input
            type="text"
            placeholder="Search articles, guides, and FAQs..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-[#D8E8EE] rounded-[10px] text-[15px] font-sans text-[#4A6070] placeholder:text-[#8AAABB] focus:outline-none focus:border-[#7BAFC8] transition-colors"
            readOnly
          />
        </div>
      </section>

      {/* Category cards */}
      <section className="max-w-[880px] mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {categories.map((cat) => (
            <a
              key={cat.name}
              href={`#${cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              className="bg-white border border-[#D8E8EE] rounded-[10px] p-6 hover:border-[#7BAFC8] transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-[16px] font-serif text-[#1A2C38] group-hover:text-[#3D6E8A] transition-colors">
                      {cat.name}
                    </h3>
                    <span className="text-[12px] font-sans font-medium text-[#8AAABB]">
                      {cat.count} articles
                    </span>
                  </div>
                  <p className="text-[14px] font-sans text-[#4A6070] leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* All articles grouped by category */}
      <section className="max-w-[880px] mx-auto px-6 pb-32">
        <p className="text-[12px] font-sans font-semibold uppercase tracking-[3px] text-[#7BAFC8] mb-10">
          All Articles
        </p>

        <div className="space-y-14">
          {articleGroups.map((group) => (
            <div
              key={group.category}
              id={group.category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
            >
              <h2 className="text-[22px] font-serif text-[#1A2C38] mb-5">
                {group.category}
              </h2>
              <ul className="space-y-3">
                {group.articles.map((article) => (
                  <li key={article.slug}>
                    <Link
                      href={`/help/${article.slug}`}
                      className="text-[14px] font-sans font-medium text-[#3D6E8A] hover:underline"
                    >
                      {article.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

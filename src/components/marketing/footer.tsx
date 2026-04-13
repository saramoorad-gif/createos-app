import Link from "next/link";

const columns = [
  {
    title: "Product",
    links: [
      { name: "Features", href: "/features" },
      { name: "Pricing", href: "/pricing" },
      { name: "For Creators", href: "/for-creators" },
      { name: "For Agencies", href: "/for-agencies" },
      { name: "Help Center", href: "/help" },
    ],
  },
  {
    title: "For Creators",
    links: [
      { name: "Deal Pipeline", href: "/features" },
      { name: "AI Contracts", href: "/features" },
      { name: "Rate Calculator", href: "/features" },
      { name: "Brand Radar", href: "/features" },
      { name: "Media Kit", href: "/features" },
      { name: "Invoicing", href: "/features" },
    ],
  },
  {
    title: "For Agencies",
    links: [
      { name: "Roster Dashboard", href: "/features" },
      { name: "Campaign Builder", href: "/features" },
      { name: "Conflict Detection", href: "/features" },
      { name: "Commission Tracking", href: "/features" },
      { name: "Brand Reports", href: "/features" },
      { name: "Internal Messaging", href: "/features" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Contact", href: "/contact" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="bg-[#F0EAE0] border-t border-[#DDD6C8]">
      <div className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-[12px] font-sans font-600 uppercase tracking-[2px] text-[#4A6070] mb-4">
                {col.title}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.name}>
                    <Link href={l.href} className="text-[14px] font-sans text-[#4A6070] hover:text-[#1A2C38] transition-colors">
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[#DDD6C8] pt-6 flex items-center justify-between">
          <span className="text-[18px] font-serif italic text-[#3D6E8A]">Create Suite</span>
          <p className="text-[13px] font-sans text-[#8AAABB]">
            &copy; 2026 Create Suite. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";

const columns = [
  {
    title: "Product",
    links: [
      { name: "Features", href: "/features" },
      { name: "Pricing", href: "/pricing" },
      { name: "Referral program", href: "/referral-program" },
      { name: "Help center", href: "/help" },
    ],
  },
  {
    title: "For",
    links: [
      { name: "Creators", href: "/for-creators" },
      { name: "Agencies", href: "/for-agencies" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "Contact", href: "/contact" },
      { name: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Terms", href: "/terms" },
      { name: "Privacy", href: "/privacy" },
      { name: "Affiliate Agreement", href: "/affiliate-agreement" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="bg-[#FAF8F4] border-t border-[#E3DED2] pt-14 pb-6">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)] gap-8 pb-10 border-b border-[#E3DED2]">
          <div className="col-span-2 lg:col-span-1">
            <div className="font-serif font-normal text-[40px] lg:text-[56px] tracking-[-0.02em] leading-[0.95] text-[#0F1E28]">
              Create<em className="italic text-[#3D6E8A]">Suite.</em>
            </div>
            <p className="max-w-[32ch] text-[#4A6070] text-[13px] mt-2.5 leading-[1.5]">
              The operating system for creators. Deals, contracts, invoices, and your roster — all in one place.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h5 className="font-mono text-[10.5px] uppercase tracking-widest text-[#8AAABB] font-medium m-0 mb-3">
                {col.title}
              </h5>
              <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[13.5px] text-[#4A6070] hover:text-[#0F1E28]">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Giant outlined brand mark */}
        <div className="foot-mark">
          Create<em>Suite.</em>
        </div>

        <div className="flex justify-between items-center pt-5 font-mono text-[11px] text-[#8AAABB] tracking-wider">
          <span>© 2026 CREATE SUITE LLC</span>
          <span>MADE FOR CREATORS</span>
        </div>
      </div>
    </footer>
  );
}

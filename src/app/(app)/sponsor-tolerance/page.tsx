import { PageHeader } from "@/components/layout/page-header";

export default function SponsorTolerancePage() {
  return (
    <div>
      <PageHeader
        headline={<>Sponsor <em className="italic text-[#C4714A]">tolerance</em></>}
        subheading="Monitor your posting frequency and audience fatigue."
      />
      <div className="text-center py-16">
        <p className="text-[20px] font-serif italic text-[#9A9088]">Nothing here yet</p>
        <button className="mt-4 text-[13px] font-sans font-500 text-[#C4714A] hover:underline">Get started →</button>
      </div>
    </div>
  );
}

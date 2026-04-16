import { PageHeader } from "@/components/layout/page-header";
import { UpgradeGate } from "@/components/global/upgrade-gate";

export default function SponsorTolerancePage() {
  return (
    <UpgradeGate feature="sponsor-tolerance">
      <SponsorTolerancePageContent />
    </UpgradeGate>
  );
}

function SponsorTolerancePageContent() {
  return (
    <div>
      <PageHeader
        headline={<>Sponsor <em className="italic text-[#7BAFC8]">tolerance</em></>}
        subheading="Monitor your posting frequency and audience fatigue."
      />
      <div className="text-center py-16">
        <p className="text-[20px] font-serif italic text-[#8AAABB]">Nothing here yet</p>
        <a href="/integrations" className="mt-4 text-[13px] inline-block font-sans font-500 text-[#7BAFC8] hover:underline">Connect integrations →</a>
      </div>
    </div>
  );
}

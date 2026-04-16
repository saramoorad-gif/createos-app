import { PageHeader } from "@/components/layout/page-header";
import { UpgradeGate } from "@/components/global/upgrade-gate";

export default function ExclusivityPage() {
  return (
    <UpgradeGate feature="exclusivity">
      <ExclusivityPageContent />
    </UpgradeGate>
  );
}

function ExclusivityPageContent() {
  return (
    <div>
      <PageHeader
        headline={<>Exclusivity <em className="italic text-[#7BAFC8]">tracker</em></>}
        subheading="Track exclusivity clauses across your deals."
      />
      <div className="text-center py-16">
        <p className="text-[20px] font-serif italic text-[#8AAABB]">Nothing here yet</p>
        <a href="/integrations" className="mt-4 text-[13px] inline-block font-sans font-500 text-[#7BAFC8] hover:underline">Connect integrations →</a>
      </div>
    </div>
  );
}

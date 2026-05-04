import { PageHeader } from "@/components/layout/page-header";
import { UpgradeGate } from "@/components/global/upgrade-gate";

export default function CalendarPage() {
  return (
    <UpgradeGate feature="integrations">
      <CalendarPageContent />
    </UpgradeGate>
  );
}

function CalendarPageContent() {
  return (
    <div>
      <PageHeader
        headline={<>Your <em className="italic text-[#7BAFC8]">calendar</em></>}
        subheading="Your upcoming events and deadlines."
      />
      <div className="text-center py-16">
        <p className="text-[20px] font-serif italic text-[#8AAABB]">Nothing here yet</p>
        <a href="/integrations" className="mt-4 text-[13px] inline-block font-sans font-500 text-[#7BAFC8] hover:underline">Connect Google Calendar →</a>
      </div>
    </div>
  );
}

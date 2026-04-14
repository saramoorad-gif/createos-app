import { PageHeader } from "@/components/layout/page-header";

export default function AudiencePage() {
  return (
    <div>
      <PageHeader
        headline={<>Audience <em className="italic text-[#7BAFC8]">insights</em></>}
        subheading="Audience demographics and analytics."
      />
      <div className="text-center py-16">
        <p className="text-[20px] font-serif italic text-[#8AAABB]">Nothing here yet</p>
        <button className="mt-4 text-[13px] font-sans font-500 text-[#7BAFC8] hover:underline">Connect your platforms →</button>
      </div>
    </div>
  );
}

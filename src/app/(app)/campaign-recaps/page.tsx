import { PageHeader } from "@/components/layout/page-header";

export default function CampaignRecapsPage() {
  return (
    <div>
      <PageHeader
        headline={<>Campaign <em className="italic text-[#7BAFC8]">recaps</em></>}
        subheading="Review performance of completed campaigns."
      />
      <div className="text-center py-16">
        <p className="text-[20px] font-serif italic text-[#8AAABB]">Nothing here yet</p>
        <button className="mt-4 text-[13px] font-sans font-500 text-[#7BAFC8] hover:underline">Get started →</button>
      </div>
    </div>
  );
}

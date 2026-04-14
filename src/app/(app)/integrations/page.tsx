import { PageHeader } from "@/components/layout/page-header";

export default function IntegrationsPage() {
  return (
    <div>
      <PageHeader
        headline={<><em className="italic text-[#7BAFC8]">Integrations</em></>}
        subheading="Connect your tools and platforms."
      />
      <div className="text-center py-16">
        <p className="text-[20px] font-serif italic text-[#8AAABB]">Nothing here yet</p>
        <button className="mt-4 text-[13px] font-sans font-500 text-[#7BAFC8] hover:underline">Connect a platform →</button>
      </div>
    </div>
  );
}

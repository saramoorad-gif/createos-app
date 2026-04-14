import { PageHeader } from "@/components/layout/page-header";

export default function ContractsPage() {
  return (
    <div>
      <PageHeader
        headline={<>Your <em className="italic text-[#7BAFC8]">contracts</em></>}
        subheading="Manage contracts from your deals."
      />
      <div className="text-center py-16">
        <p className="text-[20px] font-serif italic text-[#8AAABB]">Nothing here yet</p>
        <a href="/integrations" className="mt-4 text-[13px] inline-block font-sans font-500 text-[#7BAFC8] hover:underline">Connect integrations →</a>
      </div>
    </div>
  );
}

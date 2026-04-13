import { PageHeader } from "@/components/layout/page-header";

export default function ExclusivityPage() {
  return (
    <div>
      <PageHeader
        headline={<>Exclusivity <em className="italic text-[#C4714A]">tracker</em></>}
        subheading="Track exclusivity clauses across your deals."
      />
      <div className="text-center py-16">
        <p className="text-[20px] font-serif italic text-[#9A9088]">Nothing here yet</p>
        <button className="mt-4 text-[13px] font-sans font-500 text-[#C4714A] hover:underline">Get started →</button>
      </div>
    </div>
  );
}

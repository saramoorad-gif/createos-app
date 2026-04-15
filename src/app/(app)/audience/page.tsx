"use client";

import { PageHeader } from "@/components/layout/page-header";
import { UpgradeGate } from "@/components/global/upgrade-gate";

export default function AudiencePage() {
  return (
    <UpgradeGate feature="audience">
      <div>
        <PageHeader
          headline={<>Audience <em className="italic text-[#7BAFC8]">insights</em></>}
          subheading="Audience demographics and analytics."
        />
        <div className="text-center py-16">
          <p className="text-[20px] font-serif italic text-[#8AAABB]">Nothing here yet</p>
          <a href="/integrations" className="mt-4 text-[13px] inline-block font-sans font-500 text-[#7BAFC8] hover:underline">Connect your platforms →</a>
        </div>
      </div>
    </UpgradeGate>
  );
}

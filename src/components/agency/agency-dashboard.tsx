"use client";

import { useState, useEffect } from "react";
import { PipelineTab } from "./pipeline-tab";
import { RosterTab } from "./roster-tab";
import { CampaignsTab } from "./campaigns-tab";
import { ContractsTab } from "./contracts-tab";
import { CommissionsTab } from "./commissions-tab";
import { InboxTab } from "./inbox-tab";
import { ConflictsTab } from "./conflicts-tab";
import { ReportsTab } from "./reports-tab";

type AgencyTab = "pipeline" | "roster" | "campaigns" | "contracts" | "commissions" | "inbox" | "conflicts" | "reports";

const tabs: { key: AgencyTab; label: string }[] = [
  { key: "pipeline", label: "Pipeline" },
  { key: "roster", label: "Roster" },
  { key: "campaigns", label: "Campaigns" },
  { key: "contracts", label: "Contracts" },
  { key: "commissions", label: "Commissions" },
  { key: "inbox", label: "Inbox" },
  { key: "conflicts", label: "Conflicts" },
  { key: "reports", label: "Reports" },
];

export function AgencyDashboard() {
  const [activeTab, setActiveTab] = useState<AgencyTab>("pipeline");

  // Listen for nav bar tab switches
  useEffect(() => {
    function handleTabSwitch(e: Event) {
      const tab = (e as CustomEvent).detail as AgencyTab;
      if (tabs.some((t) => t.key === tab)) setActiveTab(tab);
    }
    window.addEventListener("agency-tab", handleTabSwitch);
    return () => window.removeEventListener("agency-tab", handleTabSwitch);
  }, []);

  return (
    <div>
      {/* Mobile tab bar (visible below lg) */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto lg:hidden pb-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-3 py-1.5 text-[10px] font-sans font-500 uppercase tracking-[1.5px] rounded-full whitespace-nowrap transition-colors ${
              activeTab === t.key
                ? "bg-[#1C1714] text-[#F7F4EF]"
                : "text-[#9A9088] hover:text-[#1C1714] hover:bg-[#F2EEE8]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "pipeline" && <PipelineTab />}
      {activeTab === "roster" && <RosterTab />}
      {activeTab === "campaigns" && <CampaignsTab />}
      {activeTab === "contracts" && <ContractsTab />}
      {activeTab === "commissions" && <CommissionsTab />}
      {activeTab === "inbox" && <InboxTab />}
      {activeTab === "conflicts" && <ConflictsTab />}
      {activeTab === "reports" && <ReportsTab />}
    </div>
  );
}

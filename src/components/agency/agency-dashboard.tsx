"use client";

import { useState, useEffect } from "react";
import { AgencyHome } from "./agency-home";
import { PipelineTab } from "./pipeline-tab";
import { RosterTab } from "./roster-tab";
import { CampaignsTab } from "./campaigns-tab";
import { ContractsTab } from "./contracts-tab";
import { CommissionsTab } from "./commissions-tab";
import { InboxTab } from "./inbox-tab";
import { ConflictsTab } from "./conflicts-tab";
import { ReportsTab } from "./reports-tab";
import { TeamTab } from "./team-tab";

type AgencyTab = "home" | "pipeline" | "roster" | "campaigns" | "contracts" | "commissions" | "inbox" | "conflicts" | "reports" | "team";

const tabs: { key: AgencyTab; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "pipeline", label: "Pipeline" },
  { key: "roster", label: "Roster" },
  { key: "campaigns", label: "Campaigns" },
  { key: "contracts", label: "Contracts" },
  { key: "commissions", label: "Commissions" },
  { key: "inbox", label: "Inbox" },
  { key: "conflicts", label: "Conflicts" },
  { key: "reports", label: "Reports" },
  { key: "team", label: "Team" },
];

export function AgencyDashboard() {
  const [activeTab, setActiveTab] = useState<AgencyTab>("home");

  useEffect(() => {
    // If the NavBar queued a tab while on another page (so the event
    // fired before this component was mounted), pick it up here.
    try {
      const queued = sessionStorage.getItem("cs:agency-tab");
      if (queued && tabs.some((t) => t.key === queued)) {
        setActiveTab(queued as AgencyTab);
        sessionStorage.removeItem("cs:agency-tab");
      }
    } catch {
      /* sessionStorage unavailable — no-op */
    }

    function handleTabSwitch(e: Event) {
      const tab = (e as CustomEvent).detail as AgencyTab;
      if (tabs.some((t) => t.key === tab)) setActiveTab(tab);
    }
    window.addEventListener("agency-tab", handleTabSwitch);
    return () => window.removeEventListener("agency-tab", handleTabSwitch);
  }, []);

  function navigateTo(tab: string) {
    setActiveTab(tab as AgencyTab);
    // Broadcast so NavBar keeps its active-tab underline in sync when
    // the switch is triggered from inside the dashboard.
    window.dispatchEvent(new CustomEvent("agency-tab", { detail: tab }));
  }

  return (
    <div>
      {/* Mobile tab bar */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto lg:hidden pb-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-3 py-1.5 text-[10px] font-sans uppercase tracking-[1.5px] rounded-full whitespace-nowrap transition-colors ${
              activeTab === t.key ? "bg-[#1E3F52] text-white" : "text-[#8AAABB] hover:text-[#1A2C38] hover:bg-[#F2F8FB]"
            }`}
            style={{ fontWeight: 500 }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "home" && <AgencyHome onNavigate={navigateTo} />}
      {activeTab === "pipeline" && <PipelineTab />}
      {activeTab === "roster" && <RosterTab />}
      {activeTab === "campaigns" && <CampaignsTab />}
      {activeTab === "contracts" && <ContractsTab />}
      {activeTab === "commissions" && <CommissionsTab />}
      {activeTab === "inbox" && <InboxTab />}
      {activeTab === "conflicts" && <ConflictsTab />}
      {activeTab === "reports" && <ReportsTab />}
      {activeTab === "team" && <TeamTab />}
    </div>
  );
}

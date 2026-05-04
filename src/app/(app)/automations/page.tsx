"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useToast } from "@/components/global/toast";
import { UpgradeGate } from "@/components/global/upgrade-gate";
import { Zap } from "lucide-react";

interface Automation {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  category: "active" | "available";
}

// System-defined automations — not user data, but defined by the platform
const systemAutomations: Automation[] = [
  { id: "a1", title: "Deal delivered → generate recap", description: "When a deal is marked as delivered, automatically generate a campaign recap and send a rebook prompt to the brand.", enabled: false, category: "available" },
  { id: "a2", title: "Invoice unpaid 7 days → reminder", description: "Send a friendly payment reminder when an invoice hasn't been paid after 7 days.", enabled: false, category: "available" },
  { id: "a3", title: "Invoice unpaid 14 days → demand letter", description: "Escalate to a formal demand letter when an invoice remains unpaid for 14+ days.", enabled: false, category: "available" },
  { id: "a4", title: "Brand email detected → alert", description: "Instantly alert you when a brand deal email is detected in your inbox with a quick-add button.", enabled: false, category: "available" },
  { id: "a5", title: "Inbound inquiry → notify instantly", description: "Push a notification the moment a new inquiry comes through your Work With Me page.", enabled: false, category: "available" },
  { id: "a6", title: "Deadline reminder", description: "Get reminded 48 hours before any deal deliverable is due.", enabled: false, category: "available" },
  { id: "a7", title: "Weekly digest", description: "Receive a weekly summary of pipeline changes, new inquiries, and income earned.", enabled: false, category: "available" },
  { id: "a8", title: "Exclusivity expiring alert", description: "Get notified when an exclusivity window on a deal is about to expire.", enabled: false, category: "available" },
];

function ToggleSwitch({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${enabled ? "bg-[#7BAFC8]" : "bg-[#D8E8EE]"}`}>
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${enabled ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

export default function AutomationsPage() {
  return (
    <UpgradeGate feature="automations">
      <AutomationsPageContent />
    </UpgradeGate>
  );
}

function AutomationsPageContent() {
  const [items, setItems] = useState<Automation[]>(systemAutomations);
  const { toast } = useToast();

  const active = items.filter(a => a.enabled);
  const available = items.filter(a => !a.enabled);

  function toggle(id: string) {
    const item = items.find(a => a.id === id);
    const newEnabled = item ? !item.enabled : false;
    setItems(prev => prev.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));
    toast("success", newEnabled ? "Automation enabled" : "Automation disabled");
  }

  return (
    <div>
      <PageHeader
        headline={<><em className="italic text-[#7BAFC8]">Automations</em></>}
        subheading="Set up workflows that run automatically so you can focus on creating."
      />

      {active.length > 0 && (
        <div className="flex items-center gap-3 border-[1.5px] border-[#D8E8EE] bg-[#F2F8FB] rounded-card px-4 py-3 mb-6">
          <Zap className="h-4 w-4 text-[#7BAFC8] flex-shrink-0" />
          <p className="text-[13px] font-sans text-[#3D6E8A]"><span style={{ fontWeight: 600 }}>{active.length} automations active</span> — saving you time on repetitive tasks</p>
        </div>
      )}

      {active.length > 0 && (
        <div className="mb-8">
          <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-4" style={{ fontWeight: 600 }}>ACTIVE</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {active.map(auto => (
              <div key={auto.id} className="bg-white border-[1.5px] border-[#D8E8EE] rounded-card p-5">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 flex-shrink-0 rounded-[10px] bg-[#F2F8FB] flex items-center justify-center">
                    <Zap className="h-5 w-5 text-[#7BAFC8]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-[14px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>{auto.title}</h3>
                      <ToggleSwitch enabled={auto.enabled} onToggle={() => toggle(auto.id)} />
                    </div>
                    <p className="text-[12px] font-sans text-[#4A6070] leading-relaxed">{auto.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-4" style={{ fontWeight: 600 }}>
          {active.length > 0 ? "AVAILABLE TO ENABLE" : "ALL AUTOMATIONS"}
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {available.map(auto => (
            <div key={auto.id} className="bg-white border-[1.5px] border-[#D8E8EE] rounded-card p-5 opacity-80">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 flex-shrink-0 rounded-[10px] bg-[#FAF8F4] flex items-center justify-center">
                  <Zap className="h-5 w-5 text-[#8AAABB]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-[14px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>{auto.title}</h3>
                    <ToggleSwitch enabled={auto.enabled} onToggle={() => toggle(auto.id)} />
                  </div>
                  <p className="text-[12px] font-sans text-[#4A6070] leading-relaxed">{auto.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

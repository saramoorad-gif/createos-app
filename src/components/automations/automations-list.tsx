"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { automations, type Automation } from "@/lib/placeholder-data";
import { timeAgo } from "@/lib/utils";
import {
  PackageCheck,
  Bell,
  AlertTriangle,
  MailCheck,
  MessageSquarePlus,
  Clock,
  Newspaper,
  ShieldOff,
  Zap,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  "package-check": PackageCheck,
  bell: Bell,
  "alert-triangle": AlertTriangle,
  "mail-check": MailCheck,
  "message-square-plus": MessageSquarePlus,
  clock: Clock,
  newspaper: Newspaper,
  "shield-off": ShieldOff,
};

function ToggleSwitch({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        enabled ? "bg-terra-500" : "bg-muted"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function AutomationCard({ automation: initial }: { automation: Automation }) {
  const [enabled, setEnabled] = useState(initial.enabled);
  const Icon = iconMap[initial.icon] || Zap;

  return (
    <Card className={!enabled ? "opacity-60" : ""}>
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
              enabled ? "bg-terra-50" : "bg-muted"
            }`}
          >
            <Icon
              className={`h-5 w-5 ${
                enabled ? "text-terra-500" : "text-muted-foreground"
              }`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-foreground">
                {initial.title}
              </h3>
              <ToggleSwitch
                enabled={enabled}
                onToggle={() => setEnabled(!enabled)}
              />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {initial.description}
            </p>
            {initial.last_fired && enabled && (
              <p className="text-[11px] text-muted-foreground/70 mt-2">
                Last fired: {timeAgo(initial.last_fired)}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AutomationsList() {
  const activeAutomations = automations.filter((a) => a.category === "active");
  const availableAutomations = automations.filter(
    (a) => a.category === "available"
  );

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="flex items-center gap-3 rounded-lg border border-terra-200 bg-terra-50/50 px-4 py-3">
        <Zap className="h-4 w-4 text-terra-600 flex-shrink-0" />
        <p className="text-sm text-terra-800">
          <span className="font-semibold">{activeAutomations.filter(a => a.enabled).length} automations active</span>{" "}
          — saving you ~3 hours/week on repetitive tasks
        </p>
      </div>

      {/* Active */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-serif font-semibold">Active</h2>
          <Badge variant="success" className="text-xs">
            {activeAutomations.length}
          </Badge>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {activeAutomations.map((auto) => (
            <AutomationCard key={auto.id} automation={auto} />
          ))}
        </div>
      </div>

      {/* Available */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-serif font-semibold">Available to enable</h2>
          <Badge variant="muted" className="text-xs">
            {availableAutomations.length}
          </Badge>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {availableAutomations.map((auto) => (
            <AutomationCard key={auto.id} automation={auto} />
          ))}
        </div>
      </div>
    </div>
  );
}

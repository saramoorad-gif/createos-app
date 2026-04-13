import { DealPipeline } from "@/components/dashboard/deal-pipeline";
import { InvoiceSummary } from "@/components/dashboard/invoice-summary";
import { PlatformStats } from "@/components/dashboard/platform-stats";
import { HealthScore } from "@/components/dashboard/health-score";
import { StatCards } from "@/components/dashboard/stat-cards";
import { AlertStrip } from "@/components/dashboard/alert-strip";
import { InsightStrip } from "@/components/dashboard/insight-strip";
import { FoundingBanner, ReferralCard } from "@/components/dashboard/founding-banner";

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-5">
      {/* Founding Creator Banner */}
      <FoundingBanner />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">
          Good morning, Brianna
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your creator business today.
        </p>
      </div>

      {/* Alert + Insight Strips */}
      <AlertStrip />
      <InsightStrip />

      {/* 5 Stat Cards Row */}
      <StatCards />

      {/* Two-column: Pipeline + Invoices | Platform + Health + Referral */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left — Pipeline + Invoices */}
        <div className="xl:col-span-2 space-y-5">
          <DealPipeline />
          <InvoiceSummary />
        </div>

        {/* Right — Platform Stats + Health Score + Referral */}
        <div className="space-y-5">
          <PlatformStats />
          <HealthScore />
          <ReferralCard />
        </div>
      </div>
    </div>
  );
}

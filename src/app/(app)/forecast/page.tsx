"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { UpgradeGate } from "@/components/global/upgrade-gate";
import { useSupabaseQuery } from "@/lib/hooks";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/global/toast";
import { useAuth } from "@/contexts/auth-context";
import { TableSkeleton } from "@/components/global/skeleton";
import { TrendingUp, TrendingDown, Minus, Calculator } from "lucide-react";

interface Deal {
  id: string;
  brand_name: string;
  value: number;
  stage: string;
  due_date: string | null;
  created_at: string;
}

interface Invoice {
  id: string;
  brand_name: string;
  amount: number;
  status: string;
  due_date: string | null;
  paid_date: string | null;
  created_at: string;
}

function monthLabel(offset: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function monthKey(date: string): string {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function isThisMonth(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return monthKey(dateStr) === currentMonthKey();
}

function ForecastContent() {
  useAuth();
  const { toast } = useToast();
  const { data: deals, loading: dealsLoading } = useSupabaseQuery<Deal>(
    "deals",
    { order: { column: "created_at", ascending: false } }
  );
  const { data: invoices, loading: invoicesLoading } =
    useSupabaseQuery<Invoice>("invoices", {
      order: { column: "created_at", ascending: false },
    });

  const [targetIncome, setTargetIncome] = useState("");

  const loading = dealsLoading || invoicesLoading;

  // Calculations
  const stats = useMemo(() => {
    const now = new Date();
    const curMonth = currentMonthKey();

    // This month earned (paid invoices this month)
    const thisMonthEarned = invoices
      .filter(
        (inv) =>
          inv.status === "paid" &&
          inv.paid_date &&
          monthKey(inv.paid_date) === curMonth
      )
      .reduce((s, inv) => s + (inv.amount || 0), 0);

    // Pipeline: deals not yet paid
    const pipeline = deals
      .filter((d) => !["paid", "delivered"].includes(d.stage))
      .reduce((s, d) => s + (d.value || 0), 0);

    // Monthly avg from last 3 months of paid invoices
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const recentPaid = invoices.filter(
      (inv) =>
        inv.status === "paid" &&
        inv.paid_date &&
        new Date(inv.paid_date) >= threeMonthsAgo
    );
    const recentTotal = recentPaid.reduce(
      (s, inv) => s + (inv.amount || 0),
      0
    );
    // Divide by number of distinct months in the recent paid data, not a fixed 3
    const distinctMonths = new Set(
      recentPaid.map(inv => {
        const d = new Date(inv.paid_date || inv.created_at);
        return `${d.getFullYear()}-${d.getMonth()}`;
      })
    ).size;
    const monthlyAvg = distinctMonths > 0 ? recentTotal / distinctMonths : 0;
    const annualProjected = monthlyAvg * 12;

    return { thisMonthEarned, pipeline, monthlyAvg, annualProjected };
  }, [deals, invoices]);

  // Track indicator
  const trackStatus = useMemo(() => {
    if (stats.monthlyAvg === 0) return "neutral";
    if (stats.thisMonthEarned > stats.monthlyAvg * 1.1) return "ahead";
    if (stats.thisMonthEarned < stats.monthlyAvg * 0.9) return "behind";
    return "on-track";
  }, [stats]);

  // 6-month forecast
  const forecastBars = useMemo(() => {
    const curMonth = currentMonthKey();
    const bars: { label: string; value: number; isCurrent: boolean }[] = [];
    for (let i = 0; i < 6; i++) {
      const label = monthLabel(i);
      if (i === 0) {
        // Current month: earned + pipeline closing this month
        const pipelineThisMonth = deals
          .filter(
            (d) =>
              !["paid", "delivered"].includes(d.stage) &&
              isThisMonth(d.due_date)
          )
          .reduce((s, d) => s + (d.value || 0), 0);
        bars.push({
          label,
          value: stats.thisMonthEarned + pipelineThisMonth,
          isCurrent: true,
        });
      } else {
        // Future months: pipeline value distributed + historical average
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + i);
        const futureKey = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, "0")}`;
        const pipelineForMonth = deals
          .filter(
            (d) =>
              !["paid", "delivered"].includes(d.stage) &&
              d.due_date &&
              monthKey(d.due_date) === futureKey
          )
          .reduce((s, d) => s + (d.value || 0), 0);
        bars.push({
          label,
          value: pipelineForMonth > 0 ? pipelineForMonth : stats.monthlyAvg,
          isCurrent: false,
        });
      }
    }
    return bars;
  }, [deals, stats]);

  const maxBarValue = Math.max(...forecastBars.map((b) => b.value), 1);

  // Deals expected to close this month (not yet paid)
  const closingThisMonth = useMemo(() => {
    return deals.filter(
      (d) =>
        !["paid", "delivered"].includes(d.stage) && isThisMonth(d.due_date)
    );
  }, [deals]);

  // "To reach $X" calculator
  const targetCalc = useMemo(() => {
    const target = Number(targetIncome.replace(/[^0-9.]/g, "")) || 0;
    if (target <= 0) return null;
    const avgDealSize =
      deals.length > 0
        ? deals.reduce((s, d) => s + (d.value || 0), 0) / deals.length
        : 0;
    if (avgDealSize <= 0) return null;
    const gap = Math.max(0, target - stats.thisMonthEarned);
    const dealsNeeded = Math.ceil(gap / avgDealSize);
    return { target, avgDealSize, gap, dealsNeeded };
  }, [targetIncome, deals, stats]);

  if (loading) return <TableSkeleton rows={6} cols={4} />;

  const statCards = [
    { label: "This month", value: formatCurrency(stats.thisMonthEarned) },
    { label: "Pipeline", value: formatCurrency(stats.pipeline) },
    {
      label: "Projected monthly",
      value: formatCurrency(stats.monthlyAvg),
    },
    {
      label: "Projected annual",
      value: formatCurrency(stats.annualProjected),
    },
  ];

  const trackConfig: Record<
    string,
    { label: string; color: string; Icon: typeof TrendingUp }
  > = {
    ahead: { label: "Ahead", color: "#3D7A58", Icon: TrendingUp },
    "on-track": { label: "On track", color: "#7BAFC8", Icon: Minus },
    behind: { label: "Behind", color: "#A03D3D", Icon: TrendingDown },
    neutral: { label: "No data yet", color: "#8AAABB", Icon: Minus },
  };
  const track = trackConfig[trackStatus];

  return (
    <div>
      <PageHeader
        headline={
          <>
            Revenue <em className="italic text-[#7BAFC8]">forecast</em>
          </>
        }
        subheading="See where your income is headed based on your pipeline and history."
      />

      {deals.length === 0 && invoices.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[22px] font-serif italic text-[#8AAABB] mb-3">
            No data yet
          </p>
          <p className="text-[14px] font-sans text-[#4A6070] mb-6">
            Add deals and invoices to see your revenue forecast.
          </p>
        </div>
      ) : (
        <>
          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statCards.map((s) => (
              <div
                key={s.label}
                className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5"
              >
                <p className="text-[11px] font-sans text-[#8AAABB] uppercase tracking-[1.5px] mb-2" style={{ fontWeight: 600 }}>
                  {s.label}
                </p>
                <p className="text-[24px] font-serif text-[#1A2C38]">
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* ── Track Indicator ── */}
          <div className="flex items-center gap-3 mb-8">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full border-[1.5px]"
              style={{
                borderColor: track.color,
                color: track.color,
              }}
            >
              <track.Icon className="h-4 w-4" />
              <span
                className="text-[13px] font-sans"
                style={{ fontWeight: 600 }}
              >
                {track.label}
              </span>
            </div>
            <span className="text-[13px] font-sans text-[#8AAABB]">
              {trackStatus === "ahead"
                ? "You're earning above your 3-month average"
                : trackStatus === "behind"
                  ? "You're below your 3-month average this month"
                  : trackStatus === "on-track"
                    ? "You're matching your 3-month average"
                    : "Track more income to see your status"}
            </span>
          </div>

          {/* ── 6-Month Forecast Chart ── */}
          <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-6 mb-8">
            <h3 className="text-[13px] font-serif italic text-[#7BAFC8] mb-6">
              6-month forecast
            </h3>
            <div className="flex items-end gap-3 h-[200px]">
              {forecastBars.map((bar) => {
                const pct = maxBarValue > 0 ? (bar.value / maxBarValue) * 100 : 0;
                return (
                  <div
                    key={bar.label}
                    className="flex-1 flex flex-col items-center justify-end h-full"
                  >
                    <p
                      className="text-[11px] font-sans text-[#1A2C38] mb-1"
                      style={{ fontWeight: 500 }}
                    >
                      {formatCurrency(bar.value)}
                    </p>
                    <div
                      className="w-full rounded-t-[6px] transition-all"
                      style={{
                        height: `${Math.max(pct, 4)}%`,
                        backgroundColor: bar.isCurrent
                          ? "#1E3F52"
                          : "#D8E8EE",
                      }}
                    />
                    <p className="text-[11px] font-sans text-[#8AAABB] mt-2">
                      {bar.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Closing This Month ── */}
          <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-6 mb-8">
            <h3 className="text-[13px] font-serif italic text-[#7BAFC8] mb-4">
              Expected to close this month
            </h3>
            {closingThisMonth.length === 0 ? (
              <p className="text-[14px] font-sans text-[#8AAABB]">
                No deals due this month.
              </p>
            ) : (
              <div className="space-y-3">
                {closingThisMonth.map((deal) => (
                  <div
                    key={deal.id}
                    className="flex items-center justify-between py-2 border-b border-[#D8E8EE] last:border-b-0"
                  >
                    <div>
                      <p
                        className="text-[14px] font-sans text-[#1A2C38]"
                        style={{ fontWeight: 500 }}
                      >
                        {deal.brand_name}
                      </p>
                      <p className="text-[12px] font-sans text-[#8AAABB]">
                        {deal.stage}
                        {deal.due_date &&
                          ` · Due ${new Date(deal.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                      </p>
                    </div>
                    <p className="text-[16px] font-serif text-[#1A2C38]">
                      {formatCurrency(deal.value)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Target Calculator ── */}
          <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="h-4 w-4 text-[#7BAFC8]" />
              <h3 className="text-[13px] font-serif italic text-[#7BAFC8]">
                Goal calculator
              </h3>
            </div>
            <div className="flex gap-3 items-end mb-4">
              <div className="flex-1">
                <label
                  className="text-[11px] font-sans text-[#8AAABB] uppercase tracking-[1.5px] block mb-1.5"
                  style={{ fontWeight: 600 }}
                >
                  Target monthly income
                </label>
                <input
                  type="text"
                  value={targetIncome}
                  onChange={(e) => setTargetIncome(e.target.value)}
                  placeholder="e.g. $10,000"
                  className="w-full rounded-[8px] border-[1.5px] border-[#D8E8EE] px-3 py-2.5 text-[14px] font-sans text-[#1A2C38] bg-white focus:outline-none focus:border-[#7BAFC8]"
                />
              </div>
            </div>
            {targetCalc && (
              <div className="bg-[#FAF8F4] rounded-[8px] p-4">
                <p className="text-[14px] font-sans text-[#1A2C38] leading-relaxed">
                  To reach{" "}
                  <span style={{ fontWeight: 600 }}>
                    {formatCurrency(targetCalc.target)}
                  </span>{" "}
                  this month, you need{" "}
                  <span style={{ fontWeight: 600 }}>
                    {formatCurrency(targetCalc.gap)}
                  </span>{" "}
                  more in revenue.
                </p>
                <p className="text-[14px] font-sans text-[#1A2C38] mt-2 leading-relaxed">
                  At your average deal size of{" "}
                  <span style={{ fontWeight: 600 }}>
                    {formatCurrency(targetCalc.avgDealSize)}
                  </span>
                  , that&apos;s roughly{" "}
                  <span
                    className="text-[#1E3F52]"
                    style={{ fontWeight: 700 }}
                  >
                    {targetCalc.dealsNeeded} more deal
                    {targetCalc.dealsNeeded !== 1 ? "s" : ""}
                  </span>
                  .
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function ForecastPage() {
  return (
    <UpgradeGate feature="forecast">
      <ForecastContent />
    </UpgradeGate>
  );
}

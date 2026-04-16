"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { UpgradeGate } from "@/components/global/upgrade-gate";
import { useSupabaseQuery, useSupabaseMutation } from "@/lib/hooks";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/global/toast";
import { useAuth } from "@/contexts/auth-context";
import { TableSkeleton } from "@/components/global/skeleton";
import { Download, Plus, X, Printer, FileText } from "lucide-react";

interface Deal {
  id: string;
  brand_name: string;
  value: number;
  stage: string;
  deal_type: string;
  paid_date?: string | null;
  created_at: string;
}

interface Invoice {
  id: string;
  brand_name: string;
  amount: number;
  status: string;
  paid_date: string | null;
  created_at: string;
}

interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  // DB column is `description`. We keep a legacy `note` alias on the local
  // state for form-binding purposes but the display paths read `description`
  // with a `note` fallback for any old rows.
  description?: string;
  note?: string;
}

type DateRange = "this-year" | "last-year" | "custom";

const expenseCategories = [
  "Equipment",
  "Software",
  "Travel",
  "Office",
  "Education",
  "Other",
];

function TaxExportContent() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: deals, loading: dealsLoading } = useSupabaseQuery<Deal>(
    "deals",
    {
      order: { column: "created_at", ascending: false },
    }
  );
  const { data: invoices, loading: invoicesLoading } =
    useSupabaseQuery<Invoice>("invoices", {
      order: { column: "created_at", ascending: false },
    });
  const {
    data: expenses,
    loading: expensesLoading,
    setData: setExpenses,
  } = useSupabaseQuery<Expense>("expenses", {
    order: { column: "date", ascending: false },
  });
  const { insert: insertExpense, remove: removeExpense } =
    useSupabaseMutation("expenses");

  const [dateRange, setDateRange] = useState<DateRange>("this-year");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [taxRate, setTaxRate] = useState(25);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: "Equipment",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    note: "",
  });

  const loading = dealsLoading || invoicesLoading || expensesLoading;

  // Date filtering
  const dateFilter = useMemo(() => {
    const now = new Date();
    if (dateRange === "this-year") {
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now.getFullYear(), 11, 31),
      };
    }
    if (dateRange === "last-year") {
      return {
        start: new Date(now.getFullYear() - 1, 0, 1),
        end: new Date(now.getFullYear() - 1, 11, 31),
      };
    }
    return {
      start: customStart ? new Date(customStart) : new Date(now.getFullYear(), 0, 1),
      end: customEnd ? new Date(customEnd) : new Date(now.getFullYear(), 11, 31),
    };
  }, [dateRange, customStart, customEnd]);

  function inRange(dateStr: string | null | undefined): boolean {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d >= dateFilter.start && d <= dateFilter.end;
  }

  // Income calculations
  const incomeData = useMemo(() => {
    const paidDeals = deals.filter(
      (d) =>
        d.stage === "paid" &&
        inRange(d.paid_date || d.created_at)
    );
    const brandDealIncome = paidDeals.reduce(
      (s, d) => s + (d.value || 0),
      0
    );

    const paidInvoices = invoices.filter(
      (inv) =>
        inv.status === "paid" &&
        inRange(inv.paid_date || inv.created_at)
    );
    const invoiceIncome = paidInvoices.reduce(
      (s, inv) => s + (inv.amount || 0),
      0
    );

    // Use the higher of deal income or invoice income to avoid double-counting
    const totalIncome = Math.max(brandDealIncome, invoiceIncome) || brandDealIncome + invoiceIncome;

    return {
      brandDealIncome,
      affiliateIncome: 0, // Placeholder — would come from affiliate_earnings table
      stanStoreIncome: 0, // Placeholder — would come from stan_store_earnings table
      totalIncome,
      paidDeals,
      paidInvoices,
    };
  }, [deals, invoices, dateFilter]);

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => inRange(e.date));
  }, [expenses, dateFilter]);

  const totalExpenses = filteredExpenses.reduce(
    (s, e) => s + (e.amount || 0),
    0
  );
  const estimatedTax = (incomeData.totalIncome - totalExpenses) * (taxRate / 100);

  const inputClass =
    "w-full rounded-[8px] border-[1.5px] border-[#D8E8EE] px-3 py-2.5 text-[14px] font-sans text-[#1A2C38] bg-white focus:outline-none focus:border-[#7BAFC8]";
  const labelClass =
    "text-[11px] font-sans text-[#8AAABB] uppercase tracking-[1.5px] block mb-1.5";

  async function handleAddExpense() {
    const amount = Number(newExpense.amount) || 0;
    if (amount <= 0) {
      toast("warning", "Enter an expense amount.");
      return;
    }
    if (!user?.id) {
      toast("error", "You must be signed in.");
      return;
    }
    try {
      const result = await insertExpense({
        creator_id: user.id,
        category: newExpense.category,
        amount,
        date: newExpense.date,
        // DB column is `description`, not `note`.
        description: newExpense.note,
      });
      if (result) {
        setExpenses((prev) => [result as Expense, ...prev]);
        toast("success", "Expense added");
      }
      setNewExpense({
        category: "Equipment",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        note: "",
      });
      setShowAddExpense(false);
    } catch {
      toast("error", "Failed to add expense");
    }
  }

  async function handleDeleteExpense(id: string) {
    try {
      await removeExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      toast("success", "Expense removed");
    } catch {
      toast("error", "Failed to remove expense");
    }
  }

  function exportCSV() {
    const rows: string[][] = [
      ["Date", "Type", "Brand/Source", "Amount", "Category"],
    ];

    // Add paid deals
    incomeData.paidDeals.forEach((d) => {
      rows.push([
        d.paid_date || d.created_at?.split("T")[0] || "",
        "Brand Deal",
        d.brand_name,
        String(d.value || 0),
        d.deal_type || "Brand Deal",
      ]);
    });

    // Add paid invoices not already captured by deals
    incomeData.paidInvoices.forEach((inv) => {
      rows.push([
        inv.paid_date || inv.created_at?.split("T")[0] || "",
        "Invoice",
        inv.brand_name,
        String(inv.amount || 0),
        "Income",
      ]);
    });

    // Add expenses
    filteredExpenses.forEach((e) => {
      rows.push([
        e.date,
        "Expense",
        e.description || e.note || e.category,
        String(-e.amount),
        e.category,
      ]);
    });

    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `create-suite-tax-export-${dateRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast("success", "CSV exported");
  }

  function exportPDF() {
    window.print();
  }

  if (loading) return <TableSkeleton rows={6} cols={4} />;

  return (
    <div className="print:bg-white">
      <PageHeader
        headline={
          <>
            Tax <em className="italic text-[#7BAFC8]">prep</em>
          </>
        }
        subheading="Export your income data for tax season."
      />

      {/* ── Date Range Selector ── */}
      <div className="flex items-center gap-2 mb-8 print:hidden">
        {(
          [
            { key: "this-year", label: "This Year" },
            { key: "last-year", label: "Last Year" },
            { key: "custom", label: "Custom" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.key}
            onClick={() => setDateRange(opt.key)}
            className={`px-4 py-2 text-[12px] font-sans uppercase tracking-[1px] rounded-full transition-colors ${
              dateRange === opt.key
                ? "bg-[#1E3F52] text-white"
                : "text-[#8AAABB] hover:text-[#1A2C38] hover:bg-[#F2F8FB] border-[1.5px] border-[#D8E8EE]"
            }`}
            style={{ fontWeight: 500 }}
          >
            {opt.label}
          </button>
        ))}
        {dateRange === "custom" && (
          <div className="flex items-center gap-2 ml-2">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="rounded-[8px] border-[1.5px] border-[#D8E8EE] px-3 py-2 text-[13px] font-sans text-[#1A2C38] bg-white focus:outline-none focus:border-[#7BAFC8]"
            />
            <span className="text-[#8AAABB]">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="rounded-[8px] border-[1.5px] border-[#D8E8EE] px-3 py-2 text-[13px] font-sans text-[#1A2C38] bg-white focus:outline-none focus:border-[#7BAFC8]"
            />
          </div>
        )}
      </div>

      {/* ── Income Summary Card ── */}
      <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-6 mb-8">
        <h3 className="text-[13px] font-serif italic text-[#7BAFC8] mb-4">
          Income summary
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-[#D8E8EE]">
            <span className="text-[14px] font-sans text-[#1A2C38]">
              Brand deal income
            </span>
            <span
              className="text-[16px] font-serif text-[#1A2C38]"
            >
              {formatCurrency(incomeData.brandDealIncome)}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[#D8E8EE]">
            <span className="text-[14px] font-sans text-[#1A2C38]">
              Affiliate income
            </span>
            <span className="text-[16px] font-serif text-[#8AAABB]">
              {formatCurrency(incomeData.affiliateIncome)}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[#D8E8EE]">
            <span className="text-[14px] font-sans text-[#1A2C38]">
              Stan Store income
            </span>
            <span className="text-[16px] font-serif text-[#8AAABB]">
              {formatCurrency(incomeData.stanStoreIncome)}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span
              className="text-[14px] font-sans text-[#1A2C38]"
              style={{ fontWeight: 600 }}
            >
              Total
            </span>
            <span
              className="text-[20px] font-serif text-[#1E3F52]"
            >
              {formatCurrency(incomeData.totalIncome)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Expense Tracking ── */}
      <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[13px] font-serif italic text-[#7BAFC8]">
            Expenses
          </h3>
          <button
            onClick={() => setShowAddExpense(true)}
            className="flex items-center gap-1.5 text-[12px] font-sans text-[#7BAFC8] hover:text-[#1E3F52] print:hidden"
            style={{ fontWeight: 500 }}
          >
            <Plus className="h-3.5 w-3.5" /> Add expense
          </button>
        </div>

        {/* Add expense form */}
        {showAddExpense && (
          <div className="bg-[#FAF8F4] rounded-[8px] p-4 mb-4 print:hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div>
                <label className={labelClass} style={{ fontWeight: 600 }}>
                  Category
                </label>
                <select
                  value={newExpense.category}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, category: e.target.value })
                  }
                  className={inputClass}
                >
                  {expenseCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass} style={{ fontWeight: 600 }}>
                  Amount
                </label>
                <input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, amount: e.target.value })
                  }
                  placeholder="0"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} style={{ fontWeight: 600 }}>
                  Date
                </label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, date: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} style={{ fontWeight: 600 }}>
                  Note
                </label>
                <input
                  type="text"
                  value={newExpense.note}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, note: e.target.value })
                  }
                  placeholder="Optional"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddExpense(false)}
                className="border-[1.5px] border-[#D8E8EE] rounded-[8px] px-4 py-2 text-[13px] font-sans text-[#1A2C38]"
                style={{ fontWeight: 500 }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddExpense}
                className="bg-[#1E3F52] text-white rounded-[8px] px-4 py-2 text-[13px] font-sans"
                style={{ fontWeight: 600 }}
              >
                Save expense
              </button>
            </div>
          </div>
        )}

        {/* Expense list */}
        {filteredExpenses.length === 0 ? (
          <p className="text-[14px] font-sans text-[#8AAABB]">
            No expenses recorded for this period.
          </p>
        ) : (
          <div className="space-y-2">
            {filteredExpenses.map((e) => (
              <div
                key={e.id}
                className="flex items-center justify-between py-2 border-b border-[#D8E8EE] last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="text-[10px] font-sans uppercase tracking-[1px] px-2 py-0.5 rounded bg-[#F2F8FB] text-[#7BAFC8]"
                    style={{ fontWeight: 700 }}
                  >
                    {e.category}
                  </span>
                  <span className="text-[14px] font-sans text-[#1A2C38]">
                    {e.description || e.note || e.category}
                  </span>
                  <span className="text-[12px] font-sans text-[#8AAABB]">
                    {formatDate(e.date)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="text-[14px] font-sans text-[#A03D3D]"
                    style={{ fontWeight: 500 }}
                  >
                    -{formatCurrency(e.amount)}
                  </span>
                  <button
                    onClick={() => handleDeleteExpense(e.id)}
                    className="text-[#8AAABB] hover:text-[#A03D3D] print:hidden"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-3">
              <span
                className="text-[13px] font-sans text-[#1A2C38]"
                style={{ fontWeight: 600 }}
              >
                Total expenses
              </span>
              <span
                className="text-[16px] font-serif text-[#A03D3D]"
              >
                -{formatCurrency(totalExpenses)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Tax Estimate ── */}
      <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-6 mb-8">
        <h3 className="text-[13px] font-serif italic text-[#7BAFC8] mb-4">
          Estimated tax
        </h3>
        <div className="flex items-center gap-4 mb-4 print:hidden">
          <label
            className="text-[12px] font-sans text-[#8AAABB]"
            style={{ fontWeight: 500 }}
          >
            Tax rate
          </label>
          <input
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
            min={0}
            max={100}
            className="w-20 rounded-[8px] border-[1.5px] border-[#D8E8EE] px-3 py-2 text-[14px] font-sans text-[#1A2C38] bg-white focus:outline-none focus:border-[#7BAFC8] text-center"
          />
          <span className="text-[12px] font-sans text-[#8AAABB]">%</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-2 border-b border-[#D8E8EE]">
            <span className="text-[14px] font-sans text-[#1A2C38]">
              Net income
            </span>
            <span className="text-[16px] font-serif text-[#1A2C38]">
              {formatCurrency(incomeData.totalIncome - totalExpenses)}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span
              className="text-[14px] font-sans text-[#1A2C38]"
              style={{ fontWeight: 600 }}
            >
              Estimated tax owed ({taxRate}%)
            </span>
            <span
              className="text-[20px] font-serif text-[#1E3F52]"
            >
              {formatCurrency(Math.max(0, estimatedTax))}
            </span>
          </div>
        </div>
      </div>

      {/* ── Export Buttons ── */}
      <div className="flex gap-3 mb-6 print:hidden">
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 bg-[#1E3F52] text-white rounded-[8px] px-5 py-3 text-[14px] font-sans"
          style={{ fontWeight: 600 }}
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
        <button
          onClick={exportPDF}
          className="flex items-center gap-2 border-[1.5px] border-[#D8E8EE] rounded-[8px] px-5 py-3 text-[14px] font-sans text-[#1A2C38] hover:bg-[#FAF8F4]"
          style={{ fontWeight: 500 }}
        >
          <Printer className="h-4 w-4" /> Export PDF
        </button>
      </div>

      {/* ── 1099 Note ── */}
      <div className="flex items-start gap-3 bg-[#FAF8F4] rounded-[10px] p-4 mb-8">
        <FileText className="h-4 w-4 text-[#7BAFC8] mt-0.5 flex-shrink-0" />
        <p className="text-[13px] font-sans text-[#4A6070] leading-relaxed">
          This export includes all income that would appear on a 1099-NEC.
          Consult a tax professional for filing guidance specific to your
          situation.
        </p>
      </div>
    </div>
  );
}

export default function TaxExportPage() {
  return (
    <UpgradeGate feature="tax-export">
      <TaxExportContent />
    </UpgradeGate>
  );
}

"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { invoices, type Invoice } from "@/lib/placeholder-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { X, Send, Bell, CheckCircle2 } from "lucide-react";

const statusStyles: Record<string, { bg: string; text: string; label: string; rowBg?: string }> = {
  paid: { bg: "bg-[#E8F4EE]", text: "text-[#3D7A58]", label: "Paid" },
  sent: { bg: "bg-[#F4EEE0]", text: "text-[#A07830]", label: "Pending" },
  draft: { bg: "bg-[#F2F8FB]", text: "text-[#8AAABB]", label: "Draft" },
  overdue: { bg: "bg-[#F4EAEA]", text: "text-[#A03D3D]", label: "Overdue", rowBg: "bg-[#F4EAEA]/40" },
};

function InvoicePanel({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const status = statusStyles[invoice.status];
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative w-full max-w-[440px] bg-white border-l border-[#D8E8EE] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[#D8E8EE] px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-[20px] font-serif text-[#1A2C38]">Invoice</h2>
          <button onClick={onClose} className="text-[#8AAABB] hover:text-[#1A2C38]"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-6">
          <div className="border border-[#D8E8EE] rounded-[10px] p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-mono text-[#8AAABB] uppercase">{invoice.id.replace("inv_", "INV-")}</p>
              <span className={`text-[10px] font-sans font-500 uppercase tracking-[1.5px] px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>{status.label}</span>
            </div>
            <p className="text-[28px] font-serif text-[#1A2C38] mb-4">{formatCurrency(invoice.amount)}</p>
            <div className="space-y-2 divide-y divide-[#D8E8EE]">
              <div className="flex justify-between pt-2"><span className="text-[12px] font-sans text-[#8AAABB]">Brand</span><span className="text-[13px] font-sans font-500">{invoice.brand_name}</span></div>
              <div className="flex justify-between pt-2"><span className="text-[12px] font-sans text-[#8AAABB]">Due</span><span className="text-[13px] font-mono">{formatDate(invoice.due_date)}</span></div>
              {invoice.paid_date && <div className="flex justify-between pt-2"><span className="text-[12px] font-sans text-[#8AAABB]">Paid</span><span className="text-[13px] font-mono text-[#3D7A58]">{formatDate(invoice.paid_date)}</span></div>}
            </div>
          </div>
          {invoice.status === "sent" && (
            <button className="w-full flex items-center justify-center gap-2 bg-[#7BAFC8] text-white rounded-[10px] px-4 py-2.5 text-[13px] font-sans font-500">
              <Send className="h-4 w-4" /> Send reminder
            </button>
          )}
          {invoice.status === "overdue" && (
            <button className="w-full flex items-center justify-center gap-2 bg-[#A03D3D] text-white rounded-[10px] px-4 py-2.5 text-[13px] font-sans font-500">
              <Bell className="h-4 w-4" /> Send final reminder
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InvoicesPage() {
  const [selected, setSelected] = useState<Invoice | null>(null);
  const outstanding = invoices.filter(i => i.status === "sent" || i.status === "overdue").reduce((s, i) => s + i.amount, 0);
  const paid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const overdueCount = invoices.filter(i => i.status === "overdue").length;

  return (
    <div>
      <PageHeader
        headline={<>Invoice <em className="italic text-[#7BAFC8]">tracker</em></>}
        subheading="Send, track, and collect payment for your work."
        stats={[
          { value: formatCurrency(outstanding), label: "Outstanding" },
          { value: formatCurrency(paid), label: "Paid this month", change: "+$2,800" },
          { value: String(overdueCount), label: "Overdue" },
        ]}
      />

      {overdueCount > 0 && (
        <div className="flex items-center gap-3 border border-[#A03D3D]/20 bg-[#F4EAEA]/50 rounded-[10px] px-4 py-3 mb-6">
          <div className="w-[3px] h-6 rounded-full bg-[#A03D3D]" />
          <p className="text-[13px] font-sans text-[#A03D3D]"><span className="font-600">{overdueCount} overdue</span> — consider sending a follow-up or escalating</p>
        </div>
      )}

      <div className="bg-white border border-[#D8E8EE] rounded-[10px] overflow-hidden">
        <div className="grid grid-cols-6 gap-4 px-5 py-3 text-[10px] font-sans font-600 uppercase tracking-[2px] text-[#8AAABB] border-b border-[#D8E8EE]">
          <span>Brand</span><span>Amount</span><span>Sent</span><span>Due</span><span>Status</span><span className="text-right">Action</span>
        </div>
        {invoices.map((inv) => {
          const status = statusStyles[inv.status];
          return (
            <div key={inv.id} className={`grid grid-cols-6 gap-4 px-5 py-3.5 items-center border-b border-[#D8E8EE] last:border-b-0 cursor-pointer hover:bg-[#FAF8F4]/50 ${status.rowBg || ""}`} onClick={() => setSelected(inv)}>
              <span className="text-[13px] font-sans font-500 text-[#1A2C38]">{inv.brand_name}</span>
              <span className="text-[14px] font-serif text-[#1A2C38]">{formatCurrency(inv.amount)}</span>
              <span className="text-[11px] font-mono text-[#8AAABB]">{formatDate(inv.created_at)}</span>
              <span className="text-[11px] font-mono text-[#8AAABB]">{formatDate(inv.due_date)}</span>
              <span className={`text-[10px] font-sans font-500 uppercase tracking-[1.5px] px-2 py-0.5 rounded-full w-fit ${status.bg} ${status.text}`}>{status.label}</span>
              <div className="flex justify-end gap-1">
                {(inv.status === "sent" || inv.status === "overdue") && (
                  <button className="p-1.5 rounded-md hover:bg-[#F2F8FB]" onClick={e => e.stopPropagation()}><Bell className="h-3.5 w-3.5 text-[#8AAABB]" /></button>
                )}
                {(inv.status === "sent" || inv.status === "overdue") && (
                  <button className="p-1.5 rounded-md hover:bg-[#F2F8FB]" onClick={e => e.stopPropagation()}><CheckCircle2 className="h-3.5 w-3.5 text-[#8AAABB]" /></button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selected && <InvoicePanel invoice={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

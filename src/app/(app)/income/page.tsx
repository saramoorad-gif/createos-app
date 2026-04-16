"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/contexts/auth-context";
import { useSupabaseQuery, useSupabaseMutation } from "@/lib/hooks";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/global/toast";
import { TableSkeleton } from "@/components/global/skeleton";
import { UpgradeGate } from "@/components/global/upgrade-gate";
import {
  Plus,
  DollarSign,
  TrendingUp,
  Edit2,
  Archive,
  X,
  Link as LinkIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AffiliateLink {
  id: string;
  platform: string;
  nickname: string;
  url: string;
  category: string;
  archived: boolean;
  created_at: string;
}

interface AffiliateEarning {
  id: string;
  link_id: string;
  month: string; // YYYY-MM
  amount: number;
  notes: string;
  logged_at: string;
}

interface StanStoreEarning {
  id: string;
  product_name: string;
  price: number;
  units_sold: number;
  revenue: number;
  month: string;
  created_at: string;
}

interface Invoice {
  id: string;
  status: string;
  amount: number;
  paid_date: string | null;
  created_at: string;
}

type Tab = "affiliate" | "stan" | "summary";

const PLATFORMS = [
  "Amazon",
  "LTK",
  "ShopMy",
  "RewardStyle",
  "ShareASale",
  "Impact",
  "Rakuten",
  "Custom",
];

const CATEGORIES = [
  "Beauty",
  "Fashion",
  "Home",
  "Wellness",
  "Tech",
  "Food",
  "Other",
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function prevMonth(m: string) {
  const [y, mo] = m.split("-").map(Number);
  const d = new Date(y, mo - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function last6Months(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    );
  }
  return months;
}

function monthLabel(m: string) {
  const [y, mo] = m.split("-").map(Number);
  return new Date(y, mo - 1, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

/* ------------------------------------------------------------------ */
/*  Modal shell                                                        */
/* ------------------------------------------------------------------ */

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(26,44,56,.4)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />
      <div className="relative bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] w-full max-w-[480px] mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D8E8EE]">
          <h2 className="text-[18px] font-serif text-[#1A2C38]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#8AAABB] hover:text-[#1A2C38]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Form field                                                         */
/* ------------------------------------------------------------------ */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-1.5 block"
        style={{ fontWeight: 600 }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full border-[1.5px] border-[#D8E8EE] rounded-[8px] px-3 py-2 text-[13px] font-sans text-[#1A2C38] focus:outline-none focus:border-[#7BAFC8]";

/* ------------------------------------------------------------------ */
/*  Tab 1 — Affiliate Links                                            */
/* ------------------------------------------------------------------ */

function AffiliateTab() {
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    data: links,
    loading: linksLoading,
    setData: setLinks,
  } = useSupabaseQuery<AffiliateLink>("affiliate_links", {
    order: { column: "created_at", ascending: false },
  });
  const {
    data: earnings,
    loading: earningsLoading,
    setData: setEarnings,
  } = useSupabaseQuery<AffiliateEarning>("affiliate_earnings");
  const { insert: insertLink } = useSupabaseMutation("affiliate_links");
  const { update: updateLink } = useSupabaseMutation("affiliate_links");
  const { insert: insertEarning } = useSupabaseMutation("affiliate_earnings");

  const [showAddLink, setShowAddLink] = useState(false);
  const [showLogEarning, setShowLogEarning] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<AffiliateLink | null>(null);

  // Add link form
  const [platform, setPlatform] = useState("Amazon");
  const [nickname, setNickname] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("Beauty");

  // Log earning form
  const [earningMonth, setEarningMonth] = useState(currentMonth());
  const [earningAmount, setEarningAmount] = useState("");
  const [earningNotes, setEarningNotes] = useState("");

  const cm = currentMonth();
  const pm = prevMonth(cm);

  function earningsForLink(linkId: string, month?: string) {
    return earnings
      .filter(
        (e) => e.link_id === linkId && (!month || e.month === month)
      )
      .reduce((s, e) => s + e.amount, 0);
  }

  function resetLinkForm() {
    setPlatform("Amazon");
    setNickname("");
    setUrl("");
    setCategory("Beauty");
    setEditingLink(null);
  }

  async function handleSaveLink() {
    if (!nickname.trim() || !url.trim()) return;
    if (editingLink) {
      const updated = await updateLink(editingLink.id, {
        platform,
        nickname,
        url,
        category,
      });
      if (updated) {
        setLinks(
          links.map((l) => (l.id === editingLink.id ? (updated as AffiliateLink) : l))
        );
      }
    } else {
      if (!user?.id) {
        toast("error", "You must be signed in.");
        return;
      }
      const created = await insertLink({
        platform,
        nickname,
        url,
        category,
        archived: false,
        creator_id: user.id,
      });
      if (created) { setLinks([created as AffiliateLink, ...links]); toast("success", "Affiliate link created"); }
    }
    setShowAddLink(false);
    resetLinkForm();
  }

  async function handleLogEarning() {
    if (!showLogEarning || !earningAmount) return;
    const parsedAmount = parseFloat(earningAmount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      toast("error", "Please enter a valid amount");
      return;
    }
    if (!user?.id) {
      toast("error", "You must be signed in.");
      return;
    }
    const created = await insertEarning({
      link_id: showLogEarning,
      month: earningMonth,
      amount: parsedAmount,
      notes: earningNotes,
      creator_id: user.id,
    });
    if (created) { setEarnings([...earnings, created as AffiliateEarning]); toast("success", "Earnings logged"); }
    setShowLogEarning(null);
    setEarningAmount("");
    setEarningNotes("");
    setEarningMonth(currentMonth());
  }

  async function handleArchive(link: AffiliateLink) {
    const updated = await updateLink(link.id, { archived: !link.archived });
    if (updated)
      setLinks(
        links.map((l) => (l.id === link.id ? (updated as AffiliateLink) : l))
      );
  }

  const loading = linksLoading || earningsLoading;
  const activeLinks = links.filter((l) => !l.archived);

  if (loading) {
    return <TableSkeleton rows={5} cols={7} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p
          className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB]"
          style={{ fontWeight: 600 }}
        >
          Affiliate Links
        </p>
        <button
          onClick={() => {
            resetLinkForm();
            setShowAddLink(true);
          }}
          className="flex items-center gap-1.5 bg-[#1E3F52] text-white rounded-[8px] px-3.5 py-2 text-[12px] font-sans"
          style={{ fontWeight: 600 }}
        >
          <Plus className="h-3.5 w-3.5" /> Add Link
        </button>
      </div>

      {activeLinks.length === 0 ? (
        <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-10 text-center">
          <LinkIcon className="h-8 w-8 text-[#D8E8EE] mx-auto mb-3" />
          <p className="text-[14px] font-sans text-[#4A6070]">
            No affiliate links yet — add your first link to start tracking
            passive income.
          </p>
        </div>
      ) : (
        <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F0EAE0]">
                {[
                  "Platform",
                  "Nickname",
                  "Category",
                  "This Month",
                  "Last Month",
                  "All Time",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[9px] font-sans uppercase tracking-[3px] text-[#8AAABB] px-4 py-3"
                    style={{ fontWeight: 600 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeLinks.map((link) => (
                <tr
                  key={link.id}
                  className="border-b border-[#EEE8E0] hover:bg-[#F7F4F0] transition-colors"
                >
                  <td className="px-4 py-3 text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>
                    {link.platform}
                  </td>
                  <td className="px-4 py-3 text-[13px] font-sans text-[#1A2C38]">
                    {link.nickname}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] font-sans uppercase tracking-[2px] px-2 py-0.5 rounded bg-[#F2F8FB] text-[#3D6E8A]" style={{ fontWeight: 600 }}>
                      {link.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[13px] font-mono text-[#1A2C38]">
                    {formatCurrency(earningsForLink(link.id, cm))}
                  </td>
                  <td className="px-4 py-3 text-[13px] font-mono text-[#4A6070]">
                    {formatCurrency(earningsForLink(link.id, pm))}
                  </td>
                  <td className="px-4 py-3 text-[13px] font-mono text-[#1A2C38]" style={{ fontWeight: 500 }}>
                    {formatCurrency(earningsForLink(link.id))}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setShowLogEarning(link.id)}
                        className="flex items-center gap-1 border-[1.5px] border-[#D8E8EE] rounded-[8px] px-2 py-1 text-[11px] font-sans text-[#1A2C38] hover:bg-[#FAF8F4]"
                        style={{ fontWeight: 500 }}
                      >
                        <DollarSign className="h-3 w-3" /> Log
                      </button>
                      <button
                        onClick={() => {
                          setEditingLink(link);
                          setPlatform(link.platform);
                          setNickname(link.nickname);
                          setUrl(link.url);
                          setCategory(link.category);
                          setShowAddLink(true);
                        }}
                        className="p-1.5 text-[#8AAABB] hover:text-[#1A2C38]"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleArchive(link)}
                        className="p-1.5 text-[#8AAABB] hover:text-[#A07830]"
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Link Modal */}
      {showAddLink && (
        <Modal
          title={editingLink ? "Edit Affiliate Link" : "Add Affiliate Link"}
          onClose={() => {
            setShowAddLink(false);
            resetLinkForm();
          }}
        >
          <Field label="Platform">
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className={inputClass}
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Nickname">
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g. Summer skincare roundup"
              className={inputClass}
            />
          </Field>
          <Field label="Affiliate URL">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </Field>
          <Field label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <button
            onClick={handleSaveLink}
            className="w-full bg-[#1E3F52] text-white rounded-[8px] px-4 py-2.5 text-[13px] font-sans mt-2"
            style={{ fontWeight: 600 }}
          >
            {editingLink ? "Save Changes" : "Add Link"}
          </button>
        </Modal>
      )}

      {/* Log Earnings Modal */}
      {showLogEarning && (
        <Modal
          title="Log Earnings"
          onClose={() => {
            setShowLogEarning(null);
            setEarningAmount("");
            setEarningNotes("");
          }}
        >
          <Field label="Month">
            <input
              type="month"
              value={earningMonth}
              onChange={(e) => setEarningMonth(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Amount">
            <input
              type="number"
              value={earningAmount}
              onChange={(e) => setEarningAmount(e.target.value)}
              placeholder="0.00"
              className={inputClass}
            />
          </Field>
          <Field label="Notes">
            <input
              value={earningNotes}
              onChange={(e) => setEarningNotes(e.target.value)}
              placeholder="Optional notes..."
              className={inputClass}
            />
          </Field>
          <button
            onClick={handleLogEarning}
            className="w-full bg-[#1E3F52] text-white rounded-[8px] px-4 py-2.5 text-[13px] font-sans mt-2"
            style={{ fontWeight: 600 }}
          >
            Save
          </button>
        </Modal>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 — Stan Store                                                 */
/* ------------------------------------------------------------------ */

function StanTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    data: earnings,
    loading,
    setData: setEarnings,
  } = useSupabaseQuery<StanStoreEarning>("stan_store_earnings", {
    order: { column: "created_at", ascending: false },
  });
  const { insert } = useSupabaseMutation("stan_store_earnings");

  const [showConnect, setShowConnect] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [connected, setConnected] = useState(false);

  // Connect form
  const [username, setUsername] = useState("");
  const [apiKey, setApiKey] = useState("");

  // Manual entry
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [unitsSold, setUnitsSold] = useState("");
  const [manualMonth, setManualMonth] = useState(currentMonth());

  const cm = currentMonth();
  const pm = prevMonth(cm);

  const currentMonthEarnings = earnings.filter((e) => e.month === cm);
  const prevMonthEarnings = earnings.filter((e) => e.month === pm);

  // Aggregate by product for current month
  const productMap = useMemo(() => {
    const map: Record<
      string,
      { name: string; price: number; units: number; revenue: number }
    > = {};
    currentMonthEarnings.forEach((e) => {
      if (!map[e.product_name]) {
        map[e.product_name] = {
          name: e.product_name,
          price: e.price,
          units: 0,
          revenue: 0,
        };
      }
      map[e.product_name].units += e.units_sold;
      map[e.product_name].revenue += e.revenue;
    });
    return Object.values(map);
  }, [currentMonthEarnings]);

  const currentTotal = currentMonthEarnings.reduce(
    (s, e) => s + e.revenue,
    0
  );
  const prevTotal = prevMonthEarnings.reduce((s, e) => s + e.revenue, 0);

  async function handleManualEntry() {
    if (!productName.trim() || !price || !unitsSold) return;
    if (!user?.id) {
      toast("error", "You must be signed in.");
      return;
    }
    const p = parseFloat(price);
    const u = parseInt(unitsSold);
    const created = await insert({
      product_name: productName,
      price: p,
      units_sold: u,
      revenue: p * u,
      month: manualMonth,
      creator_id: user.id,
    });
    if (created) setEarnings([created as StanStoreEarning, ...earnings]);
    setShowManual(false);
    setProductName("");
    setPrice("");
    setUnitsSold("");
  }

  if (loading) {
    return <TableSkeleton rows={5} cols={4} />;
  }

  const hasData = earnings.length > 0 || connected;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p
          className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB]"
          style={{ fontWeight: 600 }}
        >
          Stan Store
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowManual(true)}
            className="flex items-center gap-1.5 border-[1.5px] border-[#D8E8EE] rounded-[8px] px-3.5 py-2 text-[12px] font-sans text-[#1A2C38] hover:bg-[#FAF8F4]"
            style={{ fontWeight: 500 }}
          >
            <Plus className="h-3.5 w-3.5" /> Log Manually
          </button>
          <button
            onClick={() => setShowConnect(true)}
            className="flex items-center gap-1.5 bg-[#1E3F52] text-white rounded-[8px] px-3.5 py-2 text-[12px] font-sans"
            style={{ fontWeight: 600 }}
          >
            <LinkIcon className="h-3.5 w-3.5" /> Connect Stan Store
          </button>
        </div>
      </div>

      {!hasData ? (
        <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-10 text-center">
          <DollarSign className="h-8 w-8 text-[#D8E8EE] mx-auto mb-3" />
          <p className="text-[14px] font-sans text-[#4A6070]">
            Connect your Stan Store or log earnings manually.
          </p>
        </div>
      ) : (
        <>
          {/* Monthly comparison */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5">
              <p
                className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-1"
                style={{ fontWeight: 600 }}
              >
                This Month
              </p>
              <p className="text-[24px] font-serif text-[#1A2C38]">
                {formatCurrency(currentTotal)}
              </p>
            </div>
            <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5">
              <p
                className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-1"
                style={{ fontWeight: 600 }}
              >
                Last Month
              </p>
              <p className="text-[24px] font-serif text-[#4A6070]">
                {formatCurrency(prevTotal)}
              </p>
            </div>
          </div>

          {/* Product table */}
          <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F0EAE0]">
                  {["Product Name", "Price", "Units Sold", "Revenue"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left text-[9px] font-sans uppercase tracking-[3px] text-[#8AAABB] px-4 py-3"
                        style={{ fontWeight: 600 }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {productMap.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-[13px] font-sans text-[#8AAABB]"
                    >
                      No product data for this month.
                    </td>
                  </tr>
                ) : (
                  productMap.map((p) => (
                    <tr
                      key={p.name}
                      className="border-b border-[#EEE8E0] hover:bg-[#F7F4F0] transition-colors"
                    >
                      <td className="px-4 py-3 text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 500 }}>
                        {p.name}
                      </td>
                      <td className="px-4 py-3 text-[13px] font-mono text-[#4A6070]">
                        {formatCurrency(p.price)}
                      </td>
                      <td className="px-4 py-3 text-[13px] font-mono text-[#4A6070]">
                        {p.units}
                      </td>
                      <td className="px-4 py-3 text-[13px] font-mono text-[#1A2C38]" style={{ fontWeight: 500 }}>
                        {formatCurrency(p.revenue)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Connect Modal */}
      {showConnect && (
        <Modal title="Connect Stan Store" onClose={() => setShowConnect(false)}>
          <Field label="Stan Store Username">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="yourstore"
              className={inputClass}
            />
          </Field>
          <Field label="API Key">
            <input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk_live_..."
              className={inputClass}
              type="password"
            />
          </Field>
          <button
            onClick={() => {
              setConnected(true);
              setShowConnect(false);
            }}
            className="w-full bg-[#1E3F52] text-white rounded-[8px] px-4 py-2.5 text-[13px] font-sans mt-2"
            style={{ fontWeight: 600 }}
          >
            Connect
          </button>
          <button
            onClick={() => {
              setShowConnect(false);
              setShowManual(true);
            }}
            className="w-full border-[1.5px] border-[#D8E8EE] rounded-[8px] px-4 py-2.5 text-[13px] font-sans text-[#4A6070] hover:bg-[#FAF8F4]"
            style={{ fontWeight: 500 }}
          >
            Or enter earnings manually
          </button>
        </Modal>
      )}

      {/* Manual Entry Modal */}
      {showManual && (
        <Modal title="Log Stan Store Earnings" onClose={() => setShowManual(false)}>
          <Field label="Product Name">
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Content Calendar Template"
              className={inputClass}
            />
          </Field>
          <Field label="Price">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="29.00"
              className={inputClass}
            />
          </Field>
          <Field label="Units Sold">
            <input
              type="number"
              value={unitsSold}
              onChange={(e) => setUnitsSold(e.target.value)}
              placeholder="10"
              className={inputClass}
            />
          </Field>
          <Field label="Month">
            <input
              type="month"
              value={manualMonth}
              onChange={(e) => setManualMonth(e.target.value)}
              className={inputClass}
            />
          </Field>
          <button
            onClick={handleManualEntry}
            className="w-full bg-[#1E3F52] text-white rounded-[8px] px-4 py-2.5 text-[13px] font-sans mt-2"
            style={{ fontWeight: 600 }}
          >
            Save
          </button>
        </Modal>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 — Summary                                                    */
/* ------------------------------------------------------------------ */

function SummaryTab() {
  const { data: invoices, loading: invLoading } = useSupabaseQuery<Invoice>(
    "invoices",
    { eq: { column: "status", value: "paid" } }
  );
  const { data: affiliateEarnings, loading: affLoading } =
    useSupabaseQuery<AffiliateEarning>("affiliate_earnings");
  const { data: stanEarnings, loading: stanLoading } =
    useSupabaseQuery<StanStoreEarning>("stan_store_earnings");

  const [taxRate, setTaxRate] = useState(25);

  const loading = invLoading || affLoading || stanLoading;

  const brandTotal = invoices.reduce((s, i) => s + (i.amount || 0), 0);
  const affiliateTotal = affiliateEarnings.reduce(
    (s, e) => s + e.amount,
    0
  );
  const stanTotal = stanEarnings.reduce((s, e) => s + e.revenue, 0);
  const grandTotal = brandTotal + affiliateTotal + stanTotal;

  const months = last6Months();

  // Build month-by-month data
  const monthlyData = useMemo(() => {
    return months.map((m) => {
      const brand = invoices
        .filter((i) => i.paid_date && i.paid_date.startsWith(m))
        .reduce((s, i) => s + (i.amount || 0), 0);
      const aff = affiliateEarnings
        .filter((e) => e.month === m)
        .reduce((s, e) => s + e.amount, 0);
      const stan = stanEarnings
        .filter((e) => e.month === m)
        .reduce((s, e) => s + e.revenue, 0);
      return { month: m, brand, affiliate: aff, stan, total: brand + aff + stan };
    });
  }, [invoices, affiliateEarnings, stanEarnings, months]);

  const maxMonthTotal = Math.max(...monthlyData.map((d) => d.total), 1);

  // Projected annual: average of last 3 months * 12
  const last3 = monthlyData.slice(-3);
  const avg3 = last3.reduce((s, d) => s + d.total, 0) / 3;
  const projectedAnnual = avg3 * 12;

  // YTD: sum all months in current year
  const currentYear = String(new Date().getFullYear());
  const ytdBrand = invoices
    .filter((i) => i.paid_date && i.paid_date.startsWith(currentYear))
    .reduce((s, i) => s + (i.amount || 0), 0);
  const ytdAffiliate = affiliateEarnings
    .filter((e) => e.month.startsWith(currentYear))
    .reduce((s, e) => s + e.amount, 0);
  const ytdStan = stanEarnings
    .filter((e) => e.month.startsWith(currentYear))
    .reduce((s, e) => s + e.revenue, 0);
  const ytdTotal = ytdBrand + ytdAffiliate + ytdStan;

  const taxSetAside = grandTotal * (taxRate / 100);

  if (loading) {
    return <TableSkeleton rows={4} cols={4} />;
  }

  const hasAnyData = invoices.length > 0 || affiliateEarnings.length > 0 || stanEarnings.length > 0;

  if (!hasAnyData) {
    return (
      <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-10 text-center">
        <TrendingUp className="h-8 w-8 text-[#D8E8EE] mx-auto mb-3" />
        <p className="text-[14px] font-sans text-[#4A6070]">
          No income data yet. Start logging brand deals, affiliate income, or
          Stan Store earnings to see your summary.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Brand Deals",
            value: formatCurrency(brandTotal),
            icon: DollarSign,
            color: "#1E3F52",
          },
          {
            label: "Affiliate Income",
            value: formatCurrency(affiliateTotal),
            icon: LinkIcon,
            color: "#7BAFC8",
          },
          {
            label: "Stan Store",
            value: formatCurrency(stanTotal),
            icon: DollarSign,
            color: "#8AAABB",
          },
          {
            label: "Total",
            value: formatCurrency(grandTotal),
            icon: TrendingUp,
            color: "#3D7A58",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <p
                className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB]"
                style={{ fontWeight: 600 }}
              >
                {card.label}
              </p>
              <card.icon
                className="h-4 w-4"
                style={{ color: card.color }}
              />
            </div>
            <p className="text-[24px] font-serif text-[#1A2C38]">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* 6-month bar chart */}
      <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-6">
        <p
          className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-6"
          style={{ fontWeight: 600 }}
        >
          6-Month Income
        </p>
        <div className="flex items-end gap-3" style={{ height: 200 }}>
          {monthlyData.map((d) => {
            const totalPct = (d.total / maxMonthTotal) * 100;
            const brandPct =
              d.total > 0 ? (d.brand / d.total) * totalPct : 0;
            const affPct =
              d.total > 0 ? (d.affiliate / d.total) * totalPct : 0;
            const stanPct =
              d.total > 0 ? (d.stan / d.total) * totalPct : 0;
            return (
              <div
                key={d.month}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <span className="text-[10px] font-mono text-[#4A6070] mb-1">
                  {d.total > 0 ? formatCurrency(d.total) : ""}
                </span>
                <div
                  className="w-full rounded-t-[4px] overflow-hidden flex flex-col justify-end"
                  style={{ height: 160 }}
                >
                  {d.total > 0 ? (
                    <>
                      <div
                        style={{
                          height: `${stanPct}%`,
                          backgroundColor: "#8AAABB",
                        }}
                      />
                      <div
                        style={{
                          height: `${affPct}%`,
                          backgroundColor: "#7BAFC8",
                        }}
                      />
                      <div
                        style={{
                          height: `${brandPct}%`,
                          backgroundColor: "#1E3F52",
                        }}
                        className="rounded-t-[4px]"
                      />
                    </>
                  ) : (
                    <div className="w-full h-[2px] bg-[#EEE8E0] mt-auto" />
                  )}
                </div>
                <span className="text-[10px] font-sans text-[#8AAABB] mt-1">
                  {monthLabel(d.month)}
                </span>
              </div>
            );
          })}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-5 mt-4 pt-4 border-t border-[#EEE8E0]">
          {[
            { label: "Brand Deals", color: "#1E3F52" },
            { label: "Affiliate", color: "#7BAFC8" },
            { label: "Stan Store", color: "#8AAABB" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-[2px]"
                style={{ backgroundColor: l.color }}
              />
              <span className="text-[11px] font-sans text-[#4A6070]">
                {l.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tax estimate strip */}
      <div className="bg-[#FFF8E8] border-[1.5px] border-[#E8D8B0] rounded-[10px] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="h-5 w-5 text-[#A07830]" />
          <div>
            <p className="text-[13px] font-sans text-[#1A2C38]" style={{ fontWeight: 600 }}>
              Set aside for taxes
            </p>
            <p className="text-[12px] font-sans text-[#A07830]">
              {taxRate}% of total income
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-[20px] font-serif text-[#A07830]" style={{ fontWeight: 500 }}>
            {formatCurrency(taxSetAside)}
          </p>
          <input
            type="number"
            value={taxRate}
            onChange={(e) =>
              setTaxRate(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))
            }
            className="w-16 border-[1.5px] border-[#E8D8B0] rounded-[6px] px-2 py-1 text-[13px] font-mono text-[#A07830] text-center bg-white focus:outline-none"
          />
          <span className="text-[12px] font-sans text-[#A07830]">%</span>
        </div>
      </div>

      {/* Annual summary */}
      <div className="bg-white border-[1.5px] border-[#D8E8EE] rounded-[10px] p-6">
        <p
          className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-5"
          style={{ fontWeight: 600 }}
        >
          Annual Summary
        </p>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-[12px] font-sans text-[#8AAABB] mb-1">
              Year-to-Date Total
            </p>
            <p className="text-[28px] font-serif text-[#1A2C38]">
              {formatCurrency(ytdTotal)}
            </p>
          </div>
          <div>
            <p className="text-[12px] font-sans text-[#8AAABB] mb-1">
              Projected Annual
            </p>
            <p className="text-[28px] font-serif text-[#7BAFC8]">
              {formatCurrency(projectedAnnual)}
            </p>
            <p className="text-[11px] font-sans text-[#8AAABB] mt-0.5">
              Based on 3-month average
            </p>
          </div>
        </div>
        <div className="mt-5 pt-5 border-t border-[#EEE8E0] space-y-2">
          <p
            className="text-[10px] font-sans uppercase tracking-[3px] text-[#8AAABB] mb-3"
            style={{ fontWeight: 600 }}
          >
            YTD by Stream
          </p>
          {[
            { label: "Brand Deals", value: ytdBrand, color: "#1E3F52" },
            { label: "Affiliate Income", value: ytdAffiliate, color: "#7BAFC8" },
            { label: "Stan Store", value: ytdStan, color: "#8AAABB" },
          ].map((stream) => (
            <div
              key={stream.label}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: stream.color }}
                />
                <span className="text-[13px] font-sans text-[#4A6070]">
                  {stream.label}
                </span>
              </div>
              <span className="text-[13px] font-mono text-[#1A2C38]" style={{ fontWeight: 500 }}>
                {formatCurrency(stream.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function IncomePage() {
  return (
    <UpgradeGate feature="income">
      <IncomePageContent />
    </UpgradeGate>
  );
}

function IncomePageContent() {
  const [tab, setTab] = useState<Tab>("affiliate");

  const tabs: { key: Tab; label: string }[] = [
    { key: "affiliate", label: "Affiliate Links" },
    { key: "stan", label: "Stan Store" },
    { key: "summary", label: "Summary" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F4]">
      <div className="max-w-[1100px] mx-auto px-6">
        <PageHeader
          headline={
            <>
              Your <em className="text-[#7BAFC8]">income</em>
            </>
          }
        />

        {/* Tab buttons */}
        <div className="flex items-center gap-2 mb-8">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-[8px] text-[13px] font-sans transition-colors ${
                tab === t.key
                  ? "bg-[#1E3F52] text-white"
                  : "border-[1.5px] border-[#D8E8EE] text-[#4A6070] hover:bg-[#F7F4F0]"
              }`}
              style={{ fontWeight: tab === t.key ? 600 : 500 }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "affiliate" && <AffiliateTab />}
        {tab === "stan" && <StanTab />}
        {tab === "summary" && <SummaryTab />}
      </div>
    </div>
  );
}

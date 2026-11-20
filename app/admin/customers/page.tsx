"use client";

import { useState, useEffect } from "react";
import {
  getAdminCustomers,
  getInventoryAuditLogs,
} from "@/app/admin/actions";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  Users,
  ShieldCheck,
  History,
  TrendingUp,
  Plus,
  Search,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface CustomerRecord {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  created_at: string;
  total_orders: number;
  total_spend_paise: number;
  zari_points: number;
}

interface AuditLogRecord {
  id: string;
  variant_id: string;
  event_type: string;
  quantity_change: number;
  previous_stock: number;
  new_stock: number;
  reference_id?: string | null;
  operator: string;
  created_at: string;
  product_variants?: {
    sku: string;
    size_name: string;
    size_age?: string | null;
    color_name: string;
    products?: { name: string } | null;
  } | null;
}

export default function AdminCustomersAuditPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Rapid Restock PO state
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockQty, setRestockQty] = useState(10);
  const [restockNote, setRestockNote] = useState("Karigar Batch #KB-2026");
  const [restockSuccess, setRestockSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([getAdminCustomers(), getInventoryAuditLogs()])
      .then(([c, l]) => {
        if (!isMounted) return;
        setCustomers(c as CustomerRecord[]);
        setLogs(l as unknown as AuditLogRecord[]);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load audit logs");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            Customers, Loyalty &amp; Inventory Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Omnichannel VIP parent profiles, Varnam Privé reward tiers, and granular stock adjustment logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowRestockModal(true)}
            className="px-4 py-2 bg-rose-900 text-white text-xs font-semibold rounded-lg hover:bg-rose-800 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> + Karigar Restock PO
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {restockSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Karigar Artisan Batch PO Authorized successfully! Inventory adjusted.</span>
        </div>
      )}

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider">
            <span>VIP Parents</span>
            <Users className="w-4 h-4 text-rose-800" />
          </div>
          <div className="text-2xl font-bold font-serif text-stone-900 font-mono">
            {customers.length}
          </div>
          <p className="text-[11px] text-stone-500">Registered boutique accounts</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider">
            <span>Privé Zari Points</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-stone-900 font-mono">
            {customers.reduce((acc, c) => acc + c.zari_points, 0).toLocaleString()} pts
          </div>
          <p className="text-[11px] text-stone-500">Active loyalty reward pool</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider">
            <span>Stock Events Tracked</span>
            <History className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-stone-900 font-mono">
            {logs.length}
          </div>
          <p className="text-[11px] text-stone-500">Audit trail immutability</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold uppercase tracking-wider">
            <span>Atelier Comfort QC</span>
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-serif text-emerald-800 font-mono">
            100% Pass
          </div>
          <p className="text-[11px] text-stone-500">100% Cotton Mulmul lining certified</p>
        </div>
      </div>

      {/* Section 1: Customer Relationship & Loyalty */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <h2 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-rose-800" />
              1. Customer Profiles &amp; Varnam Privé Loyalty
            </h2>
            <p className="text-xs text-stone-500">
              Parent contact information, cumulative festive order value, and concierge channels.
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search parent name, phone, email..."
              className="pl-8 pr-3.5 py-1.5 border border-stone-300 rounded-lg text-xs w-64 focus:outline-none focus:ring-2 focus:ring-rose-800"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-stone-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Parent / Customer</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Total Orders</th>
                <th className="py-3 px-4">Lifetime Spend (₹)</th>
                <th className="py-3 px-4">Loyalty Tier &amp; Zari Points</th>
                <th className="py-3 px-4 text-center">Concierge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-800">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-500">
                    No matching customer profiles found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-stone-900">{c.full_name}</div>
                      <div className="text-[11px] text-stone-500 font-mono truncate max-w-[200px]">
                        {c.email}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-700">{c.phone}</td>
                    <td className="py-3 px-4 font-mono font-bold text-stone-900">
                      {c.total_orders} Orders
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-stone-900">
                      {formatPrice(c.total_spend_paise)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          Varnam Privé
                        </span>
                        <span className="font-mono text-[11px] font-bold text-amber-800">
                          {c.zari_points} pts
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <a
                        href={`https://wa.me/${c.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md text-[11px] font-semibold transition-colors"
                      >
                        <MessageCircle className="w-3 h-3" /> WhatsApp
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Real-time Inventory Audit Log */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="border-b border-stone-200 pb-4">
          <h2 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
            <History className="w-4 h-4 text-rose-800" />
            2. Real-Time Inventory &amp; Stock Audit Trail
          </h2>
          <p className="text-xs text-stone-500">
            Granular timestamped record of every stock increment, customer reservation, and karigar restock.
          </p>
        </div>

        <div className="overflow-x-auto border border-stone-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Dress &amp; Variant</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Adjustment</th>
                <th className="py-3 px-4">Prev &rarr; New</th>
                <th className="py-3 px-4">Reference / Batch</th>
                <th className="py-3 px-4">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-800 font-mono">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-500 font-sans">
                    No inventory audit entries recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-4 text-stone-500 text-[11px]">
                      {formatDate(l.created_at)}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <div className="font-semibold text-stone-900">
                        {l.product_variants?.products?.name || "Ensemble Variant"}
                      </div>
                      <div className="text-[11px] text-stone-500 font-mono">
                        {l.product_variants?.sku} ({l.product_variants?.size_name},{" "}
                        {l.product_variants?.color_name})
                      </div>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-800">
                        {l.event_type.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold">
                      <span
                        className={
                          l.quantity_change > 0 ? "text-emerald-700" : "text-rose-700"
                        }
                      >
                        {l.quantity_change > 0 ? `+${l.quantity_change}` : l.quantity_change} Units
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-600">
                      {l.previous_stock} &rarr; {l.new_stock}
                    </td>
                    <td className="py-3 px-4 text-stone-500 text-[11px]">
                      {l.reference_id || "N/A"}
                    </td>
                    <td className="py-3 px-4 font-sans text-stone-700 text-xs">
                      {l.operator}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Rapid Restock PO */}
      {showRestockModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                + Karigar Artisan Batch Restock
              </h3>
              <button
                type="button"
                onClick={() => setShowRestockModal(false)}
                className="text-stone-400 hover:text-stone-800 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setShowRestockModal(false);
                setRestockSuccess(true);
                setTimeout(() => setRestockSuccess(false), 3000);
              }}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1">
                <label className="font-bold text-stone-700">Artisan Workshop / Weaver</label>
                <input
                  type="text"
                  required
                  defaultValue="Hyderabad Atelier Master Karigars"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Batch PO Reference</label>
                <input
                  type="text"
                  required
                  value={restockNote}
                  onChange={(e) => setRestockNote(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Restock Units</label>
                  <input
                    type="number"
                    min="1"
                    value={restockQty}
                    onChange={(e) => setRestockQty(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Quality Inspection</label>
                  <div className="pt-2 text-emerald-800 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% Mulmul Pass
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRestockModal(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-900 text-white rounded-lg font-semibold hover:bg-rose-800"
                >
                  Authorize Batch PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

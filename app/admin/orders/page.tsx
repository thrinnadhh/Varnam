"use client";

import { useState, useEffect, useTransition } from "react";
import { getAdminOrders, updateAdminOrderStatus } from "@/app/admin/actions";
import { formatPrice, formatDate } from "@/lib/utils";

interface ShippingAddressJson {
  name?: string;
  phone?: string;
  address_line1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
}

interface OrderItemSummary {
  id: string;
  product_name: string;
  size_age: string;
  quantity: number;
}

interface AdminOrder {
  id: string;
  order_number: string;
  status: "pending" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled";
  payment_method: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  carrier?: string | null;
  tracking_number?: string | null;
  tracking_url?: string | null;
  notes?: string | null;
  shipping_address?: ShippingAddressJson | null;
  profiles?: { full_name?: string; phone?: string } | null;
  order_items?: OrderItemSummary[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isPending, startTransition] = useTransition();

  // Status update form states
  const [updateStatus, setUpdateStatus] = useState<AdminOrder["status"]>("pending");
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadOrders = async (filter: string) => {
    try {
      const data = await getAdminOrders(filter);
      setOrders(data as unknown as AdminOrder[]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    let isCancelled = false;
    getAdminOrders(statusFilter)
      .then((data) => {
        if (!isCancelled) {
          setOrders(data as unknown as AdminOrder[]);
        }
      })
      .catch(console.error);

    return () => {
      isCancelled = true;
    };
  }, [statusFilter]);

  const handleOpenUpdate = (ord: AdminOrder) => {
    setSelectedOrder(ord);
    setUpdateStatus(ord.status);
    setCarrier(ord.carrier || "");
    setTrackingNumber(ord.tracking_number || "");
    setTrackingUrl(ord.tracking_url || "");
    setNotes(ord.notes || "");
    setStatusMessage(null);
  };

  const handleSaveUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    startTransition(async () => {
      // STRICT COLUMN BOUNDARY: Mutates ONLY status, carrier, tracking_number, tracking_url, notes
      const res = await updateAdminOrderStatus({
        order_id: selectedOrder.id,
        status: updateStatus,
        carrier: carrier || undefined,
        tracking_number: trackingNumber || undefined,
        tracking_url: trackingUrl || undefined,
        notes: notes || undefined,
      });

      if (res.success) {
        setStatusMessage("Order status updated successfully.");
        await loadOrders(statusFilter);
        setTimeout(() => setSelectedOrder(null), 1200);
      } else {
        setStatusMessage(res.error || "Failed to update order status.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
          Order Fulfillment Management
        </h1>
        <p className="text-xs sm:text-sm text-stone-600">
          Update tailoring stages, assign tracking numbers, and manage carrier logistics.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {[
          { key: "all", label: "All Orders" },
          { key: "pending", label: "Pending" },
          { key: "confirmed", label: "Confirmed" },
          { key: "packed", label: "Packed" },
          { key: "shipped", label: "Shipped" },
          { key: "delivered", label: "Delivered" },
          { key: "cancelled", label: "Cancelled" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === tab.key
                ? "bg-stone-900 text-white"
                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-600 uppercase font-semibold border-b border-stone-200">
              <tr>
                <th className="py-3 px-3">Order Number</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Items</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Total</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-stone-50/50">
                  <td className="py-3.5 px-3 font-mono font-bold text-stone-900">
                    {ord.order_number}
                  </td>
                  <td className="py-3.5 px-3">
                    <p className="font-semibold text-stone-900">
                      {ord.shipping_address?.name || ord.profiles?.full_name || "Customer"}
                    </p>
                    <p className="text-[11px] text-stone-500 font-mono">
                      {ord.shipping_address?.phone || ord.profiles?.phone || ""}
                    </p>
                  </td>
                  <td className="py-3.5 px-3">
                    {ord.order_items?.map((it) => (
                      <p key={it.id} className="text-[11px] text-stone-600">
                        {it.quantity}x {it.product_name} ({it.size_age})
                      </p>
                    ))}
                  </td>
                  <td className="py-3.5 px-3 text-stone-500">
                    {formatDate(ord.created_at)}
                  </td>
                  <td className="py-3.5 px-3 capitalize">
                    <span className="font-semibold">{ord.payment_method}</span>
                    <span className="block text-[10px] text-stone-500 uppercase">
                      {ord.payment_status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        ord.status === "delivered"
                          ? "bg-emerald-100 text-emerald-800"
                          : ord.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-stone-900">
                    {formatPrice(ord.total_amount)}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenUpdate(ord)}
                      className="px-3 py-1.5 bg-stone-900 text-white rounded-md text-[11px] font-semibold hover:bg-stone-800 transition-colors"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Order Status Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-stone-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h2 className="text-base font-bold text-stone-900 font-serif">
                  Fulfillment Update
                </h2>
                <p className="text-xs font-mono text-stone-500">
                  {selectedOrder.order_number}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-stone-400 hover:text-stone-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

            {statusMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg">
                {statusMessage}
              </div>
            )}

            <form onSubmit={handleSaveUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Order Status *
                </label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value as AdminOrder["status"])}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="packed">Packed (Tailoring Complete)</option>
                  <option value="shipped">Shipped (In Transit)</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Courier / Carrier
                  </label>
                  <input
                    type="text"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    placeholder="e.g. Express Air Courier"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Tracking / Waybill #
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. BLD12345678"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Public Tracking URL
                </label>
                <input
                  type="url"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder="https://track.bluedart.com/..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Internal Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Extra seam margin added upon parent request"
                  rows={2}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 disabled:opacity-50"
                >
                  {isPending ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

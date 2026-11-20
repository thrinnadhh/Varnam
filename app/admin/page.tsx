import Link from "next/link";
import { getAdminMetrics, getAdminOrders } from "@/app/admin/actions";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  DollarSign,
  Package,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface RecentOrderSummary {
  id: string;
  order_number: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  status: string;
  created_at: string;
  profiles?: { full_name?: string } | null;
  shipping_address?: { name?: string } | null;
  order_items?: { id: string }[];
}

export default async function AdminDashboardPage() {
  let metrics = {
    totalRevenuePaise: 0,
    totalOrders: 0,
    pendingOrders: 0,
    lowStockVariants: 0,
    totalProducts: 0,
  };
  let recentOrders: RecentOrderSummary[] = [];
  let errorMsg = null;

  try {
    const [m, o] = await Promise.all([
      getAdminMetrics(),
      getAdminOrders(),
    ]);
    metrics = m;
    recentOrders = o.slice(0, 5) as unknown as RecentOrderSummary[];
  } catch (err: unknown) {
    errorMsg = err instanceof Error ? err.message : "Failed to load dashboard metrics";
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
            Operational Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Real-time business performance, inventory health, and fulfillment pipeline.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/orders"
            className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors"
          >
            Manage Orders &rarr;
          </Link>
          <Link
            href="/admin/products"
            className="px-4 py-2 bg-rose-900 text-white rounded-lg text-xs font-semibold hover:bg-rose-800 transition-colors"
          >
            + Add Dress
          </Link>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs sm:text-sm">
          <strong>Notice:</strong> {errorMsg} (Ensure your admin user has profiles.role = &apos;admin&apos;).
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Paid Revenue
            </span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-stone-900">
            {formatPrice(metrics.totalRevenuePaise)}
          </div>
          <p className="text-[11px] text-stone-500">
            From settled Cashfree & COD orders
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total Orders
            </span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-stone-900">
            {metrics.totalOrders}
          </div>
          <p className="text-[11px] text-stone-500">
            Lifetime orders recorded
          </p>
        </div>

        {/* Pending Fulfillment */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Fulfillment Queue
            </span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700">
            {metrics.pendingOrders}
          </div>
          <p className="text-[11px] text-stone-500">
            Awaiting tailoring / dispatch
          </p>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Low Stock Alerts
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-700">
            {metrics.lowStockVariants}
          </div>
          <p className="text-[11px] text-stone-500">
            SKUs with &le; 5 units remaining
          </p>
        </div>
      </div>

      {/* Recent Orders Overview Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-900 font-serif">
            Recent Orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-rose-900 hover:underline flex items-center gap-1"
          >
            View all orders &rarr;
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-xs text-stone-500 py-4">No orders placed yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 uppercase font-semibold border-y border-stone-200">
                <tr>
                  <th className="py-2.5 px-3">Order Number</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-stone-50/50">
                    <td className="py-3 px-3 font-mono font-bold text-stone-900">
                      {ord.order_number}
                    </td>
                    <td className="py-3 px-3">
                      {ord.profiles?.full_name || ord.shipping_address?.name || "Customer"}
                    </td>
                    <td className="py-3 px-3 text-stone-500">
                      {formatDate(ord.created_at)}
                    </td>
                    <td className="py-3 px-3">
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
                    <td className="py-3 px-3 capitalize">
                      {ord.payment_method} ({ord.payment_status})
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-stone-900 font-mono">
                      {formatPrice(ord.total_amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

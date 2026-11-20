"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getUserOrders } from "@/lib/db/actions";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  Package,
  Truck,
  ArrowLeft,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

interface OrderItem {
  id: string;
  product_name: string;
  size_name: string;
  size_age?: string | null;
  color_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total_amount: number;
  carrier?: string | null;
  tracking_number?: string | null;
  tracking_url?: string | null;
  created_at: string;
  order_items: OrderItem[];
}

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "in_progress" | "delivered">("all");

  useEffect(() => {
    let isMounted = true;
    getUserOrders()
      .then((data) => {
        if (!isMounted) return;
        setOrders((data as unknown as Order[]) || []);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (filter === "in_progress") {
      return ["pending", "confirmed", "packed", "shipped"].includes(o.status);
    }
    if (filter === "delivered") {
      return o.status === "delivered";
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Back button & Title */}
      <div className="space-y-2">
        <Link
          href="/account"
          className="text-text-muted hover:text-text-heading text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Account Overview
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-text-heading">
              My Festive Orders &amp; Live Tracking
            </h1>
            <p className="text-xs sm:text-sm text-text-muted">
              Live atelier tailoring updates, Blue Dart air transit tracking, and tax invoices.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-surface-raised border border-border rounded-full text-brand-primary">
            {orders.length} Total Orders
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-xl transition-all ${
            filter === "all"
              ? "bg-brand-primary text-white shadow-warm-sm"
              : "bg-surface text-text-muted hover:text-text-heading border border-border"
          }`}
        >
          All Orders ({orders.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("in_progress")}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            filter === "in_progress"
              ? "bg-brand-primary text-white shadow-warm-sm"
              : "bg-surface text-text-muted hover:text-text-heading border border-border"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          In Progress ({orders.filter((o) => ["pending", "confirmed", "packed", "shipped"].includes(o.status)).length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("delivered")}
          className={`px-4 py-2 rounded-xl transition-all ${
            filter === "delivered"
              ? "bg-brand-primary text-white shadow-warm-sm"
              : "bg-surface text-text-muted hover:text-text-heading border border-border"
          }`}
        >
          Delivered ({orders.filter((o) => o.status === "delivered").length})
        </button>
      </div>

      {/* Order Cards List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-text-muted">
          Loading your heirloom orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-surface border border-border rounded-2xl space-y-4">
          <Package className="w-12 h-12 text-text-muted mx-auto" />
          <h3 className="font-serif text-lg font-bold text-text-heading">No Orders in this View</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Explore our curated collections of festive lehengas, pure silk pattu pavadais, and cotton twirl frocks.
          </p>
          <Link
            href="/collections"
            className="inline-block px-6 py-2.5 bg-brand-primary text-white text-xs font-semibold rounded-xl hover:bg-brand-primary-hover shadow-warm-sm"
          >
            Explore Collections
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const isInProgress = ["pending", "confirmed", "packed", "shipped"].includes(order.status);
            const isDelivered = order.status === "delivered";

            return (
              <div
                key={order.id}
                className="bg-surface border border-border rounded-2xl overflow-hidden shadow-warm-sm hover:border-brand-primary/40 transition-all"
              >
                {/* Order Card Header */}
                <div className="p-4 sm:p-6 bg-surface-raised border-b border-border flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-text-heading text-sm">
                        #{order.order_number}
                      </span>
                      <span className="text-text-muted">• Placed {formatDate(order.created_at)}</span>
                    </div>
                    <div className="text-text-muted">
                      Payment:{" "}
                      <span className="font-semibold text-text-heading uppercase">
                        {order.payment_method}
                      </span>{" "}
                      ({order.payment_status})
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-serif text-lg font-bold text-text-heading font-mono">
                      {formatPrice(order.total_amount)}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold capitalize flex items-center gap-1.5 ${
                        isDelivered
                          ? "bg-emerald-100 text-emerald-800"
                          : isInProgress
                          ? "bg-amber-100 text-amber-900 border border-amber-200"
                          : "bg-stone-100 text-stone-800"
                      }`}
                    >
                      {isInProgress && (
                        <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                      )}
                      {order.status === "confirmed"
                        ? "Master Tailoring in Progress"
                        : order.status === "shipped"
                        ? "Dispatched via Air"
                        : order.status}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="p-4 sm:p-6 divide-y divide-border/60">
                  {order.order_items.map((item) => (
                    <div
                      key={item.id}
                      className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0 text-xs"
                    >
                      <div className="space-y-1">
                        <h4 className="font-serif text-sm font-bold text-text-heading">
                          {item.product_name}
                        </h4>
                        <div className="flex items-center gap-2 text-text-muted">
                          <span className="px-2 py-0.5 rounded bg-canvas border border-border font-medium">
                            Age / Size: {item.size_name || item.size_age}
                          </span>
                          <span>Qty: {item.quantity}</span>
                          {item.color_name && <span>Color: {item.color_name}</span>}
                        </div>
                      </div>

                      <div className="text-right font-mono font-bold text-text-heading">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Courier & Tracking Banner (if shipped or active) */}
                {(order.carrier || order.tracking_number) && (
                  <div className="mx-4 sm:mx-6 mb-4 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-amber-950">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-brand-secondary shrink-0" />
                      <span>
                        Courier: <strong>{order.carrier || "Blue Dart Air"}</strong> | AWB:{" "}
                        <strong className="font-mono">{order.tracking_number}</strong>
                      </span>
                    </div>
                    {order.tracking_url && (
                      <a
                        href={order.tracking_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-brand-primary hover:text-brand-primary-hover flex items-center gap-1"
                      >
                        Track Courier Live <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}

                {/* Card Action Buttons */}
                <div className="p-4 sm:p-6 bg-surface-raised/40 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-text-muted">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>100% Cotton Mulmul Lining • 7-Day Doorstep Fit Exchange</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/orders/${order.order_number}`}
                      className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-lg hover:bg-brand-primary-hover transition-colors flex items-center gap-1"
                    >
                      View Live Tracker &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Concierge Reassurance Footer */}
      <div className="p-6 rounded-2xl bg-surface border border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-serif text-sm font-bold text-text-heading">
            Need Sizing Adjustments or Exchange Assistance?
          </h3>
          <p className="text-text-muted">
            Our Hyderabad atelier master drapers offer complimentary seam guidance within 7 days of delivery.
          </p>
        </div>
        <a
          href="https://wa.me/919876543210"
          target="_blank"
          rel="noreferrer"
          className="px-5 py-2.5 bg-emerald-800 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 shrink-0 shadow-sm"
        >
          <MessageCircle className="w-4 h-4" /> WhatsApp Stylist Concierge
        </a>
      </div>
    </div>
  );
}

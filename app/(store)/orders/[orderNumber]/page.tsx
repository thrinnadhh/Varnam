import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getOrderByNumber } from "@/lib/db/actions";
import { createServerSupabaseClient } from "@/lib/db/supabase";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Home,
  ExternalLink,
  ShieldCheck,
  ShoppingBag,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface OrderPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function OrderConfirmationPage({ params }: OrderPageProps) {
  const { orderNumber } = await params;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/orders/${orderNumber}`);
  }

  const order = await getOrderByNumber(orderNumber);

  if (!order) {
    notFound();
  }

  // Security Ownership Check: Customer must own the order or be an admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const isOwner = order.user_id === user.id;

  if (!isOwner && !isAdmin) {
    notFound();
  }

  const shippingAddr = (order.shipping_address as any) || {};

  // 4-Stage Fulfillment Tracker
  const stages = [
    { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
    { key: "packed", label: "Tailored & Packed", icon: Package },
    { key: "shipped", label: "In Transit", icon: Truck },
    { key: "delivered", label: "Delivered", icon: Home },
  ];

  const statusMap: Record<string, number> = {
    pending: 0,
    confirmed: 0,
    packed: 1,
    shipped: 2,
    delivered: 3,
    cancelled: -1,
  };

  const currentStageIdx = statusMap[order.status] ?? 0;
  const isCancelled = order.status === "cancelled";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Celebration Header */}
      <div className="text-center space-y-3 bg-surface border border-border rounded-2xl p-6 sm:p-10 shadow-warm-sm">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-secondary bg-brand-secondary-subtle px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Order Confirmed & Tailoring Queued</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-text-heading">
            Thank You For Trusting Varnam
          </h1>
          <p className="text-text-muted text-xs sm:text-sm max-w-md mx-auto">
            We are preparing your daughter's handcrafted apparel with 100% breathable cotton linings.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-text-muted">
          <span>Order #: <strong className="text-text-heading">{order.order_number}</strong></span>
          <span>•</span>
          <span>Date: {formatDate(order.created_at)}</span>
          <span>•</span>
          <span className="capitalize">
            Payment:{" "}
            <strong className="text-text-heading">
              {order.payment_method === "cod" ? "Cash on Delivery" : "Cashfree (UPI/Card)"}
            </strong>
          </span>
        </div>
      </div>

      {/* 4-Stage Fulfillment Progress Bar */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-warm-sm">
        <h2 className="font-serif text-lg font-bold text-text-heading">
          Fulfillment & Delivery Status
        </h2>

        {isCancelled ? (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            This order has been cancelled. If any payment was captured, our automated refund protocol has been triggered.
          </div>
        ) : (
          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute top-5 left-6 right-6 h-0.5 bg-border -z-0 hidden sm:block" />
            <div
              className="absolute top-5 left-6 h-0.5 bg-brand-primary transition-all duration-500 -z-0 hidden sm:block"
              style={{
                width: `${(currentStageIdx / (stages.length - 1)) * 100}%`,
              }}
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
              {stages.map((stage, idx) => {
                const Icon = stage.icon;
                const isPassed = idx <= currentStageIdx;
                const isCurrent = idx === currentStageIdx;

                return (
                  <div
                    key={stage.key}
                    className="flex flex-col items-center text-center space-y-2"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isPassed
                          ? "bg-brand-primary text-white shadow-warm-sm"
                          : "bg-surface border-2 border-border text-text-muted"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p
                        className={`text-xs sm:text-sm font-bold ${
                          isCurrent
                            ? "text-brand-primary"
                            : isPassed
                            ? "text-text-heading"
                            : "text-text-muted"
                        }`}
                      >
                        {stage.label}
                      </p>
                      {isCurrent && (
                        <p className="text-[10px] text-brand-secondary font-medium uppercase tracking-wider">
                          Active Stage
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tracking Carrier details if shipped */}
        {order.carrier && order.tracking_number && (
          <div className="p-4 rounded-xl bg-brand-primary-subtle/50 border border-brand-primary-border flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
            <div>
              <p className="text-text-muted">Shipped via:</p>
              <p className="font-bold text-text-heading">
                {order.carrier} — Waybill #{order.tracking_number}
              </p>
              {order.estimated_delivery_date && (
                <p className="text-xs text-text-muted">
                  Estimated Arrival: {formatDate(order.estimated_delivery_date)}
                </p>
              )}
            </div>

            {order.tracking_url && (
              <a
                href={order.tracking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-brand-primary text-white rounded-lg text-xs font-semibold hover:bg-brand-primary-hover flex items-center gap-1.5"
              >
                Track Shipment <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Order Items & Shipping Address Split */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Items List */}
        <div className="md:col-span-7 bg-surface border border-border rounded-2xl p-6 space-y-4 shadow-warm-sm">
          <h2 className="font-serif text-lg font-bold text-text-heading border-b border-border pb-3">
            Handcrafted Items ({order.order_items.length})
          </h2>

          <div className="divide-y divide-border">
            {order.order_items.map((item: any) => (
              <div key={item.id} className="py-3 flex justify-between items-start text-xs sm:text-sm">
                <div className="space-y-0.5">
                  <p className="font-bold text-text-heading">
                    {item.product_name}
                  </p>
                  <p className="text-text-muted">
                    Age Milestone: <span className="font-medium text-text-heading">{item.size_age}</span> • Qty: {item.quantity}
                  </p>
                  <p className="text-[11px] text-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-700" /> 100% Breathable Cotton Lining
                  </p>
                </div>
                <div className="font-semibold text-text-heading">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4 space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between text-text-muted">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal_amount)}</span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>Express Shipping</span>
              <span>
                {order.shipping_amount === 0 ? "FREE" : formatPrice(order.shipping_amount)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-text-heading text-base pt-2 border-t border-border">
              <span>Total Paid / Payable</span>
              <span className="text-lg text-brand-primary font-serif">
                {formatPrice(order.total_amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping Address & Support */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-surface border border-border rounded-2xl p-6 space-y-3 shadow-warm-sm text-xs sm:text-sm">
            <h2 className="font-serif text-lg font-bold text-text-heading border-b border-border pb-3">
              Delivery Address
            </h2>
            <div className="space-y-1 text-text-body">
              <p className="font-bold text-text-heading">{shippingAddr.name}</p>
              <p>{shippingAddr.address_line1}</p>
              {shippingAddr.address_line2 && <p>{shippingAddr.address_line2}</p>}
              <p>
                {shippingAddr.city}, {shippingAddr.state} - {shippingAddr.postal_code}
              </p>
              <p className="text-text-muted font-mono pt-1">📱 {shippingAddr.phone}</p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-6 space-y-3 shadow-warm-sm text-xs">
            <h3 className="font-bold text-text-heading">Parent Support & Exchanges</h3>
            <p className="text-text-muted">
              Need assistance with age sizing or garment alterations? Our parent support team is available on WhatsApp & email.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/account?tab=orders"
                className="w-full py-2.5 bg-surface text-text-heading border border-border rounded-xl text-center font-semibold hover:bg-canvas transition-colors"
              >
                View in My Account
              </Link>
              <Link
                href="/collections"
                className="w-full py-2.5 bg-brand-primary text-white rounded-xl text-center font-semibold hover:bg-brand-primary-hover transition-colors"
              >
                Continue Shopping &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

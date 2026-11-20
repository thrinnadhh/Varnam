import { Metadata } from "next";
import Link from "next/link";
import { Truck, Clock, ShieldCheck, MapPin, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy | Varnam",
  description:
    "Express delivery across 19,000+ Indian pin codes. Free shipping on orders above ₹999.",
};

export default function ShippingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-secondary hover:text-brand-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Storefront</span>
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary-subtle text-brand-primary text-xs font-bold">
          <Truck className="w-4 h-4" />
          <span>Pan-India Logistics</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-heading">
          Shipping & Delivery Policy
        </h1>
        <p className="text-xs sm:text-sm text-text-muted">
          Fast, tamper-proof packaging and tracked dispatches across all Indian states.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-surface border border-border shadow-warm-sm space-y-2">
          <div className="p-2.5 w-fit rounded-xl bg-amber-50 text-amber-800">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-base text-text-heading">
            24-Hour Dispatch
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">
            All in-stock couture pieces and twirl dresses are steam-pressed, hand-inspected, and dispatched within 24 business hours.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border shadow-warm-sm space-y-2">
          <div className="p-2.5 w-fit rounded-xl bg-emerald-50 text-emerald-800">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-base text-text-heading">
            Free Express Above ₹999
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Complimentary express courier on all carts above ₹999. A flat nominal shipping fee of ₹99 applies for smaller orders.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border shadow-warm-sm space-y-2">
          <div className="p-2.5 w-fit rounded-xl bg-blue-50 text-blue-800">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-base text-text-heading">
            19,000+ Pin Codes
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Servicing metros, Tier 1, 2, and 3 towns via Blue Dart, Delhivery, and DTDC with end-to-end SMS & WhatsApp tracking.
          </p>
        </div>
      </div>

      <div className="prose prose-stone max-w-none text-text-body text-sm space-y-8 leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-text-heading">
            1. Estimated Delivery Timelines
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-border rounded-xl overflow-hidden">
              <thead className="bg-canvas border-b border-border text-text-heading font-semibold">
                <tr>
                  <th className="py-3 px-4">Region</th>
                  <th className="py-3 px-4">Estimated Transit Time</th>
                  <th className="py-3 px-4">Courier Partner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-3 px-4 font-medium">Metros (Bengaluru, Mumbai, Delhi-NCR, Hyderabad, Chennai)</td>
                  <td className="py-3 px-4">2 – 3 Business Days</td>
                  <td className="py-3 px-4">Blue Dart Air Express</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Tier 1 & Tier 2 State Capitals</td>
                  <td className="py-3 px-4">3 – 4 Business Days</td>
                  <td className="py-3 px-4">Delhivery Express</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Rest of India & Rural Outposts</td>
                  <td className="py-3 px-4">4 – 6 Business Days</td>
                  <td className="py-3 px-4">Delhivery / Speed Post</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-text-heading">
            2. Live Order Tracking
          </h2>
          <p>
            The moment your dress is handed over to our carrier, your unique AWB tracking number and real-time live link are generated and accessible anytime under <Link href="/account" className="text-brand-primary underline">My Orders</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}

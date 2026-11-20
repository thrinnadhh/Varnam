import { Metadata } from "next";
import Link from "next/link";
import { Scale, CheckCircle2, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Varnam",
  description:
    "Terms and conditions governing purchases, order reservations, and delivery on Varnam.",
};

export default function TermsPage() {
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
          <Scale className="w-4 h-4" />
          <span>Legal Transparency</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-heading">
          Terms of Service
        </h1>
        <p className="text-xs sm:text-sm text-text-muted">
          Last Updated: November 2026 • Varnam Apparel Private Limited
        </p>
      </div>

      <div className="prose prose-stone max-w-none text-text-body text-sm space-y-8 leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-text-heading">
            1. Agreement to Terms
          </h2>
          <p>
            By accessing or ordering through Varnam (&quot;varnam.com&quot;), you agree to be bound by these Terms of Service, all applicable Indian consumer protection laws, and our Return &amp; Shipping policies.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-text-heading">
            2. Product Sizing &amp; Fabric Disclosure
          </h2>
          <p>
            Varnam specializes in celebratory and daily couture across three demographic segments: Women (Sizes XS–XXL), Teens (Ages 13–18Y), and Girls (Ages 2–12Y).
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>Mandatory Lining Specification:</strong> Every dress features explicit inner lining transparency (e.g. 100% Breathable Malmal Cotton) so parents and shoppers are fully informed before ordering.</li>
            <li><strong>Measurement Archetypes:</strong> Sizing charts provide dual-unit measurements (Inches and Centimeters) for bust/chest, waist, hips, and garment length with standard +2&quot; tailor ease.</li>
            <li><strong>Model Fit Transparency:</strong> Where displayed, model height and size worn reflect unpinned, true garment samples.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-text-heading">
            3. Pricing &amp; Currency
          </h2>
          <p>
            All prices displayed on Varnam are in Indian Rupees (INR) and inclusive of all applicable Goods and Services Tax (GST). All internal transactions and authorizations are processed with integer paise precision to eliminate rounding drift.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-text-heading">
            4. Order Placement &amp; Reservation TTL
          </h2>
          <p>
            Placing an item in your shopping bag does not guarantee reservation. When an order is placed:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>Online Payment (CashFree):</strong> Inventory is held under a strict 15-minute reservation time-to-live (TTL). If payment confirmation is not received within 15 minutes, the reservation expires and stock is automatically restored to the atelier.</li>
            <li><strong>Cash on Delivery (COD):</strong> Stock is immediately committed and confirmed upon order submission without reservation TTL expiration.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-text-heading">
            5. Payment Methods
          </h2>
          <p>
            Varnam supports two primary payment methods:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>CashFree Gateway:</strong> Instant authorization via UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit cards (Visa, Mastercard, RuPay), and Net Banking.</li>
            <li><strong>Cash on Delivery (COD):</strong> Payable in cash or delivery-agent QR code scanner at your doorstep. We reserve the right to verify high-value COD orders via phone confirmation prior to tailoring.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

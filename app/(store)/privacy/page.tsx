import { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Lock, Eye, FileText, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Varnam",
  description:
    "How Varnam protects your personal data, parental sizing details, and transaction security.",
};

export default function PrivacyPage() {
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
          <ShieldCheck className="w-4 h-4" />
          <span>Parent Trust & Data Safety</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-heading">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-text-muted">
          Last Updated: November 2026 • Varnam Apparel Private Limited
        </p>
      </div>

      <div className="prose prose-stone max-w-none text-text-body text-sm space-y-8 leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-text-heading">
            1. Our Commitment to Families & Shoppers
          </h2>
          <p>
            At Varnam, we understand that you are often shopping for children, daughters, and loved ones. We treat the privacy of our customers and their families with the highest standard of care, transparency, and data minimization.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-text-heading">
            2. Information We Collect
          </h2>
          <p>We collect only the essential information needed to fulfill your couture dress orders:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>Account & Contact Info:</strong> Full name, verified email address, and 10-digit mobile number for order confirmations and carrier tracking.</li>
            <li><strong>Delivery Addresses:</strong> Street address, apartment/house number, city, state, and postal code for Blue Dart / courier delivery.</li>
            <li><strong>Apparel Sizing Preferences:</strong> Sizing selections across Women (XS–XXL), Teens (13–18Y), and Girls (2–12Y) saved in your bag or order history. We never collect or store birth dates or personal child identifiers.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-text-heading">
            3. Zero Card Data Storage (CashFree Gateway Security)
          </h2>
          <p>
            Varnam operates under a strict Zero Card Data architecture. All digital payment transactions (UPI QR, Credit/Debit cards, Net Banking) are securely captured and encrypted directly by <strong>CashFree Payments India Private Limited</strong> (RBI-licensed Payment Aggregator, PCI-DSS Level 1 compliant).
          </p>
          <p>
            Your payment card numbers, CVVs, expiry dates, and UPI PINs never pass through or touch Varnam servers or databases.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-text-heading">
            4. How We Use Your Information
          </h2>
          <p>Your information is used solely for:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>Tailoring, packaging, and dispatching your couture orders.</li>
            <li>Sending transactional SMS and email updates regarding shipment tracking and delivery status.</li>
            <li>Facilitating doorstep size exchanges and return pickups.</li>
            <li>Detecting and preventing fraudulent orders and payment tampering.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-text-heading">
            5. Data Retention & Deletion Rights
          </h2>
          <p>
            You have full ownership of your data. You may review your saved addresses, past orders, and wishlist at any time in your <Link href="/account" className="text-brand-primary underline">My Account</Link> atelier. To request permanent deletion of your account and customer data, email our data protection officer at <span className="font-mono text-xs">care@varnam.com</span>.
          </p>
        </section>
      </div>
    </div>
  );
}

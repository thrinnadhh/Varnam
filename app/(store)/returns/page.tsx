import { Metadata } from "next";
import Link from "next/link";
import { RefreshCw, CheckCircle2, ArrowLeft, HeartHandshake } from "lucide-react";
import { POLICY_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Returns & Size Exchanges | Varnam",
  description:
    `${POLICY_CONFIG.EXCHANGE_RETURN_DAYS} doorstep size exchange guarantee. Hassle-free pickups for Women, Teens, and Girls dresses.`,
};

export default function ReturnsPage() {
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
          <HeartHandshake className="w-4 h-4" />
          <span>Parent &amp; Customer Guarantee</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-heading">
          Returns &amp; {POLICY_CONFIG.EXCHANGE_RETURN_DAYS} Size Exchanges
        </h1>
        <p className="text-xs sm:text-sm text-text-muted">
          We want your celebration to be joyful and perfectly fitted. If the dress does not fit like a dream, we make exchanging it effortless.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-surface border border-border shadow-warm-sm space-y-3">
          <div className="p-3 w-fit rounded-xl bg-brand-primary-subtle text-brand-primary">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-lg text-text-heading">
            {POLICY_CONFIG.EXCHANGE_RETURN_WINDOW}
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Need a larger size for growth room or a more tailored fit for an upcoming wedding? Request a complimentary size exchange within {POLICY_CONFIG.EXCHANGE_RETURN_DAYS} of delivery directly through your account dashboard.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-surface border border-border shadow-warm-sm space-y-3">
          <div className="p-3 w-fit rounded-xl bg-emerald-50 text-emerald-800">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-lg text-text-heading">
            Prompt 100% Refunds
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">
            If you prefer a return instead of an exchange, our courier partner ({POLICY_CONFIG.COURIER_PARTNERS}) will collect the unworn garment from your doorstep. Refunds are credited within {POLICY_CONFIG.REFUND_CREDIT_TIMELINE} directly to your original payment method.
          </p>
        </div>
      </div>

      <div className="prose prose-stone max-w-none text-text-body text-sm space-y-8 leading-relaxed">
        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-text-heading">
            1. Return Conditions for Couture Dresses
          </h2>
          <p>
            To maintain our child-safety and hygienic standards for inner cotton linings, garments must satisfy the following:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>Unworn, unwashed, and undamaged with no perfume, stains, or makeup marks.</li>
            <li>Original Varnam artisanal tags and inner labels intact and attached.</li>
            <li>Returned in the original protective box and dust cover.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-serif text-xl font-bold text-text-heading">
            2. How to Request an Exchange or Return
          </h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>Go to <Link href="/account" className="text-brand-primary underline font-medium">My Orders</Link> and select your delivered order.</li>
            <li>Click <strong>&quot;Request Exchange / Return&quot;</strong> and choose your desired replacement size or return reason.</li>
            <li>Our courier partner will schedule a doorstep pickup within {POLICY_CONFIG.RETURN_PICKUP_TIMELINE}.</li>
            <li>Your replacement size is dispatched immediately upon pickup scan!</li>
          </ol>
        </section>
      </div>
    </div>
  );
}

import { Metadata } from "next";
import Link from "next/link";
import { RefreshCw, CheckCircle2, AlertCircle, ArrowLeft, HeartHandshake } from "lucide-react";

export const metadata: Metadata = {
  title: "Returns & Size Exchanges | Varnam",
  description:
    "7-day doorstep size exchange guarantee. Hassle-free pickups for Women, Teens, and Girls dresses.",
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
          <span>Parent & Customer Guarantee</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-heading">
          Returns & 7-Day Size Exchanges
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
            7-Day Doorstep Size Exchange
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Need a larger size for growth room or a more tailored fit for an upcoming wedding? Request a complimentary size exchange within 7 days of delivery directly through your account dashboard.
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
            If you prefer a return instead of an exchange, our courier partner will collect the unworn garment from your doorstep. Refunds are credited within 5 to 7 business days directly to your original payment method.
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
            <li>Our courier partner will schedule a doorstep pickup within 24–48 hours.</li>
            <li>Your replacement size is dispatched immediately upon pickup scan!</li>
          </ol>
        </section>
      </div>
    </div>
  );
}

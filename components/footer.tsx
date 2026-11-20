import Link from "next/link";
import { ShieldCheck, HeartHandshake, RefreshCw, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-auto">
      {/* Trust Highlights for Parents */}
      <div className="border-b border-border-subtle bg-canvas/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="flex items-start space-x-4 p-4 rounded-xl bg-surface border border-border/80 shadow-warm-sm">
              <div className="p-3 bg-brand-primary-subtle text-brand-primary rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-text-heading text-base">
                  100% Breathable Cotton Linings
                </h4>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Every celebration dress has child-safe, soft inner lining so your girl stays comfortable with zero scratchy seams.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 rounded-xl bg-surface border border-border/80 shadow-warm-sm">
              <div className="p-3 bg-brand-secondary-subtle text-brand-secondary rounded-xl">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-text-heading text-base">
                  Parent-Approved Sizing (2–14Y)
                </h4>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Milestone-based sizing with hidden +2 inch side margins for easy letting out as your child grows.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 rounded-xl bg-surface border border-border/80 shadow-warm-sm">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-text-heading text-base">
                  Hassle-Free 7-Day Exchange
                </h4>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Doorstep pickup and swift size exchanges across all Indian pin codes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-serif text-2xl font-bold text-brand-primary">
              Varnam
            </Link>
            <p className="text-xs text-text-muted mt-3 leading-relaxed">
              Curated celebrations and daily twirls for girls aged 2 to 14. Combining the grandeur of Indian textiles with skin-safe cotton comfort.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-brand-secondary font-medium">
              <Sparkles className="w-3.5 h-3.5" /> Handcrafted with love in India
            </div>
          </div>

          <div>
            <h5 className="font-sans font-semibold text-xs tracking-wider uppercase text-text-heading mb-3">
              Collections
            </h5>
            <ul className="space-y-2 text-xs text-text-body">
              <li>
                <Link href="/collections/festive-ethnic" className="hover:text-brand-primary transition-colors">
                  Festive & Ethnic Lehengas
                </Link>
              </li>
              <li>
                <Link href="/collections/party-dresses" className="hover:text-brand-primary transition-colors">
                  Party Gowns & Tulle
                </Link>
              </li>
              <li>
                <Link href="/collections/daily-frocks" className="hover:text-brand-primary transition-colors">
                  Pure Cotton Twirl Frocks
                </Link>
              </li>
              <li>
                <Link href="/collections/comfort-casuals" className="hover:text-brand-primary transition-colors">
                  Casual Sets & Coords
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-sans font-semibold text-xs tracking-wider uppercase text-text-heading mb-3">
              Parent Assistance
            </h5>
            <ul className="space-y-2 text-xs text-text-body">
              <li>
                <Link href="/account" className="hover:text-brand-primary transition-colors">
                  Order Tracking
                </Link>
              </li>
              <li>
                <span className="text-text-muted">Size & Growth Guide</span>
              </li>
              <li>
                <span className="text-text-muted">Wash & Fabric Care Guide</span>
              </li>
              <li>
                <span className="text-text-muted">Shipping & Delivery Info</span>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-sans font-semibold text-xs tracking-wider uppercase text-text-heading mb-3">
              Store & Security
            </h5>
            <ul className="space-y-2 text-xs text-text-body">
              <li>
                <span className="text-text-muted">Cashfree 256-bit SSL Secure</span>
              </li>
              <li>
                <span className="text-text-muted">Cash on Delivery Available</span>
              </li>
              <li>
                <Link href="/admin" className="text-brand-secondary hover:underline font-medium">
                  Merchant Admin Access
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border-subtle mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-3">
          <p>© {new Date().getFullYear()} Varnam Apparel Private Limited. All rights reserved.</p>
          <p className="flex items-center gap-3">
            <span>Prices inclusive of all taxes (INR)</span>
            <span>•</span>
            <span>Made for Girls 2–14Y</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

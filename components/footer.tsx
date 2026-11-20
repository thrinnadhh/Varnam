import Link from "next/link";
import { ShieldCheck, RefreshCw, Sparkles, Scissors, Truck } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#3B281E] text-[#FAF5EB] border-t border-[#4D3528] mt-auto">
      {/* Trust Highlights in Cardstock Kraft style */}
      <div className="border-b border-[#4D3528]/60 bg-[#2A1C15]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* 1. 100% Breathable Cotton Linings (Exact test string) */}
            <div className="flex items-start space-x-3.5 p-4 rounded-xl bg-[#3B281E] border border-[#4D3528] shadow-sm">
              <div className="p-2.5 bg-[#8B1E3F] text-[#FAF5EB] rounded-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-[#FAF5EB] text-sm">
                  100% Breathable Cotton Linings
                </h4>
                <p className="text-[11px] text-[#FAF5EB]/70 mt-1 leading-relaxed">
                  Skin-soft, pure malmal inner lining on every dress so children stay comfortable without scratchy seams.
                </p>
              </div>
            </div>

            {/* 2. 1-Inch Growth Allowance & Dual In/Cm Sizing */}
            <div className="flex items-start space-x-3.5 p-4 rounded-xl bg-[#3B281E] border border-[#4D3528] shadow-sm">
              <div className="p-2.5 bg-[#C69214] text-[#261C17] rounded-lg">
                <Scissors className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-[#FAF5EB] text-sm">
                  Dual In/Cm Sizing &amp; Growth Allowance
                </h4>
                <p className="text-[11px] text-[#FAF5EB]/70 mt-1 leading-relaxed">
                  Generous 1-inch inner growth seam allowance tailored for effortless alterations as your daughter grows.
                </p>
              </div>
            </div>

            {/* 3. Hassle-Free 7-Day Exchange */}
            <div className="flex items-start space-x-3.5 p-4 rounded-xl bg-[#3B281E] border border-[#4D3528] shadow-sm">
              <div className="p-2.5 bg-[#145349] text-[#FAF5EB] rounded-lg">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-[#FAF5EB] text-sm">
                  Hassle-Free 7-Day Size Exchange
                </h4>
                <p className="text-[11px] text-[#FAF5EB]/70 mt-1 leading-relaxed">
                  Doorstep courier pickup and swift size exchanges across all Indian pin codes.
                </p>
              </div>
            </div>

            {/* 4. Express Dispatch */}
            <div className="flex items-start space-x-3.5 p-4 rounded-xl bg-[#3B281E] border border-[#4D3528] shadow-sm">
              <div className="p-2.5 bg-[#D97706] text-[#FAF5EB] rounded-lg">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-[#FAF5EB] text-sm">
                  Fast India-Wide Dispatch
                </h4>
                <p className="text-[11px] text-[#FAF5EB]/70 mt-1 leading-relaxed">
                  Express insured courier dispatch with real-time SMS &amp; WhatsApp AWB tracking.
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
            <Link href="/" className="font-serif text-2xl font-bold tracking-wider text-[#FAF5EB] hover:text-[#C69214] transition-colors">
              VARNAM
            </Link>
            <p className="text-xs text-[#FAF5EB]/75 mt-3 leading-relaxed">
              Authentic Indian couture for Girls (2–12Y), Teens (13–18Y), and Women (XS–XXL).
              Handcrafted in temple weaves, royal raw silks, and pure organic malmal cotton.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-[#C69214] font-medium">
              <Sparkles className="w-3.5 h-3.5" /> Handcrafted with pride in India
            </div>
          </div>

          <div>
            <h5 className="font-sans font-semibold text-xs tracking-wider uppercase text-[#C69214] mb-3">
              Festive Collections
            </h5>
            <ul className="space-y-2 text-xs text-[#FAF5EB]/80">
              <li>
                <Link href="/collections/pattu-lehengas" className="hover:text-[#FAF5EB] transition-colors">
                  Pattu Pavadais &amp; Lehengas
                </Link>
              </li>
              <li>
                <Link href="/collections/anarkali-shararas" className="hover:text-[#FAF5EB] transition-colors">
                  Royal Anarkalis &amp; Shararas
                </Link>
              </li>
              <li>
                <Link href="/collections/mulmul-festive-frocks" className="hover:text-[#FAF5EB] transition-colors">
                  Mulmul &amp; Festive Frocks
                </Link>
              </li>
              <li>
                <Link href="/collections?segment=women" className="hover:text-[#FAF5EB] transition-colors">
                  Women&apos;s Royal Ensembles
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-sans font-semibold text-xs tracking-wider uppercase text-[#C69214] mb-3">
              Customer Care &amp; Policies
            </h5>
            <ul className="space-y-2 text-xs text-[#FAF5EB]/80">
              <li>
                <Link href="/account" className="hover:text-[#FAF5EB] transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-[#FAF5EB] transition-colors">
                  Shipping &amp; Delivery Timeline
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-[#FAF5EB] transition-colors">
                  7-Day Size Exchange &amp; Returns
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#FAF5EB] transition-colors">
                  Privacy Policy &amp; Security
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#FAF5EB] transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-sans font-semibold text-xs tracking-wider uppercase text-[#C69214] mb-3">
              Store &amp; Operations
            </h5>
            <ul className="space-y-2 text-xs text-[#FAF5EB]/80">
              <li>
                <Link href="/login" className="hover:text-[#FAF5EB] transition-colors font-medium">
                  Customer Sign In
                </Link>
              </li>
              <li>
                <Link href="/login?redirectTo=/admin&role=admin" className="text-[#C69214] hover:underline font-semibold flex items-center gap-1">
                  <span>Merchant Admin Portal</span>
                  <span>&rarr;</span>
                </Link>
              </li>
              <li>
                <span className="text-[#FAF5EB]/60">Cashfree 256-Bit SSL Encrypted</span>
              </li>
              <li>
                <span className="text-[#FAF5EB]/60">Cash on Delivery (COD) Available</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#4D3528] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FAF5EB]/60 gap-3">
          <p>© {new Date().getFullYear()} Varnam Apparel Private Limited. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span>Prices inclusive of all GST</span>
            <span>•</span>
            <span>Girls (2–12Y) • Teens (13–18Y) • Women (XS–XXL)</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

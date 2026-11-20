import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
  ShieldAlert,
} from "lucide-react";

export const metadata = {
  title: "Admin Portal | Varnam",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row font-sans">
      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-stone-900 text-stone-200 flex flex-col justify-between shrink-0 border-r border-stone-800">
        <div>
          {/* Admin Header */}
          <div className="p-6 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl font-bold text-white tracking-wide">
                Varnam
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-rose-900/80 text-rose-200 px-2 py-0.5 rounded">
                Admin
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Store Operations & Fulfillment
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 text-xs font-semibold">
            <Link
              href="/admin"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-stone-400" />
              <span>Metrics Overview</span>
            </Link>

            <Link
              href="/admin/orders"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <Package className="w-4 h-4 text-stone-400" />
              <span>Order Fulfillment</span>
            </Link>

            <Link
              href="/admin/products"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-stone-400" />
              <span>Catalog & Inventory</span>
            </Link>
          </nav>
        </div>

        {/* Footer / Storefront Return */}
        <div className="p-4 border-t border-stone-800 text-xs">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <Store className="w-4 h-4" />
            <span>&larr; Return to Storefront</span>
          </Link>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/db/supabase";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
  Sparkles,
  Users,
  PlusCircle,
} from "lucide-react";

export const metadata = {
  title: "Admin Portal | Varnam",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side Admin Guard
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/?error=unauthorized");
  }

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
              <ShoppingBag className="w-4 h-4 text-stone-400" />
              <span>Orders & Fulfillment</span>
            </Link>

            <Link
              href="/admin/products"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <Package className="w-4 h-4 text-stone-400" />
              <span>Catalog & Sizing</span>
            </Link>

            <Link
              href="/admin/products/new"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-rose-400" />
              <span>+ Add New Dress</span>
            </Link>

            <Link
              href="/admin/banners"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Hero Banners & Timer</span>
            </Link>

            <Link
              href="/admin/categories"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <Store className="w-4 h-4 text-rose-400" />
              <span>Navigation Subheadings</span>
            </Link>

            <Link
              href="/admin/merchandising"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Merchandising & Banners</span>
            </Link>

            <Link
              href="/admin/customers"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Customers & Audit Log</span>
            </Link>
          </nav>
        </div>

        {/* Footer info & Link back to store */}
        <div className="p-4 border-t border-stone-800 space-y-2 text-xs">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <Store className="w-4 h-4" />
            <span>Storefront View</span>
          </Link>
          <div className="px-3 py-2 bg-stone-950/50 rounded-lg text-[11px] text-stone-400 space-y-0.5 border border-stone-800">
            <p className="font-semibold text-stone-300">Admin Mode Active</p>
            <p className="text-[10px] text-stone-500 font-mono truncate">{user.email}</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}

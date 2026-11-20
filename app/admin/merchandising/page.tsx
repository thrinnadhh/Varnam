"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  getAdminBanners,
  saveAdminBanner,
  deleteAdminBanner,
  getAdminCoupons,
  saveAdminCoupon,
  deleteAdminCoupon,
} from "@/app/admin/actions";
import { formatPrice } from "@/lib/utils";
import {
  Sparkles,
  Plus,
  Trash2,
  Tag,
  Layers,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  cta_label: string;
  cta_link: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
}

interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  usage_count: number;
  is_active: boolean;
  expires_at?: string | null;
}

export default function AdminMerchandisingPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Banner Form State
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [bTitle, setBTitle] = useState("");
  const [bSubtitle, setBSubtitle] = useState("");
  const [bCtaLabel, setBCtaLabel] = useState("Shop Collection");
  const [bCtaLink, setBCtaLink] = useState("/collections/festive-wedding");
  const [bImageUrl, setBImageUrl] = useState(
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80"
  );
  const [bSortOrder, setBSortOrder] = useState(1);

  // New Coupon Form State
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [cCode, setCCode] = useState("");
  const [cType, setCType] = useState<"percentage" | "fixed">("fixed");
  const [cValue, setCValue] = useState(500); // In rupees or %
  const [cMinOrder, setCMinOrder] = useState(2999); // In rupees

  const loadData = async () => {
    try {
      const [b, c] = await Promise.all([getAdminBanners(), getAdminCoupons()]);
      setBanners(b as Banner[]);
      setCoupons(c as Coupon[]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load merchandising data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getAdminBanners()
      .then((b) => {
        if (!isMounted) return;
        setBanners(b as Banner[]);
        return getAdminCoupons();
      })
      .then((c) => {
        if (!isMounted || !c) return;
        setCoupons(c as Coupon[]);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load merchandising data");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await saveAdminBanner({
        title: bTitle,
        subtitle: bSubtitle || null,
        cta_label: bCtaLabel,
        cta_link: bCtaLink,
        image_url: bImageUrl,
        is_active: true,
        sort_order: bSortOrder,
      });
      if (!res.success) throw new Error(res.error);
      setShowBannerModal(false);
      setBTitle("");
      setBSubtitle("");
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save banner");
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("Are you sure you want to remove this banner?")) return;
    try {
      const res = await deleteAdminBanner(id);
      if (!res.success) throw new Error(res.error);
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete banner");
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await saveAdminCoupon({
        code: cCode.toUpperCase().trim(),
        discount_type: cType,
        discount_value: cType === "fixed" ? Math.round(cValue * 100) : cValue,
        min_order_amount: Math.round(cMinOrder * 100),
        is_active: true,
      });
      if (!res.success) throw new Error(res.error);
      setShowCouponModal(false);
      setCCode("");
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save coupon");
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const res = await deleteAdminCoupon(id);
      if (!res.success) throw new Error(res.error);
      loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete coupon");
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            Merchandising, Banners &amp; Promo Hub
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Manage storefront hero carousels, promotional discount codes, and occasion collections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowBannerModal(true)}
            className="px-4 py-2 bg-rose-900 text-white text-xs font-semibold rounded-lg hover:bg-rose-800 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> + Add New Banner
          </button>
          <button
            type="button"
            onClick={() => setShowCouponModal(true)}
            className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Tag className="w-3.5 h-3.5" /> + Create Coupon
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Section 1: Hero Carousel Banners */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div>
            <h2 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-800" />
              1. Storefront Hero Banners &amp; Festive Sliders
            </h2>
            <p className="text-xs text-stone-500">
              Active promotional cards displayed on the homepage hero carousel.
            </p>
          </div>
          <span className="text-xs font-bold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full">
            {banners.length} Banners Configured
          </span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-stone-500">Loading banners...</div>
        ) : banners.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-500">
            No banners found. Click &apos;+ Add New Banner&apos; above to configure your first hero slider.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {banners.map((b) => (
              <div
                key={b.id}
                className="border border-stone-200 rounded-xl overflow-hidden bg-stone-50 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="relative h-44 w-full bg-stone-200">
                  <Image
                    src={b.image_url}
                    alt={b.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-900/80 text-white backdrop-blur-sm">
                      Sort #{b.sort_order}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-700 text-white">
                      Active
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-base font-bold text-stone-900">{b.title}</h3>
                    {b.subtitle && (
                      <p className="text-xs text-stone-600 line-clamp-2 mt-0.5">{b.subtitle}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-stone-200/80 flex items-center justify-between text-xs">
                    <span className="text-stone-500 font-mono text-[11px] truncate max-w-[180px]">
                      CTA: {b.cta_label} &rarr; {b.cta_link}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteBanner(b.id)}
                      className="p-1.5 text-stone-400 hover:text-red-700 transition-colors"
                      aria-label="Delete banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Promotional Coupons & Discount Engine */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <div>
            <h2 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-rose-800" />
              2. Promotional Coupons &amp; Discount Engine
            </h2>
            <p className="text-xs text-stone-500">
              Manage vouchers for welcome offers, festive sales, and sister twinning bundles.
            </p>
          </div>
          <span className="text-xs font-bold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full">
            {coupons.length} Active Coupons
          </span>
        </div>

        <div className="overflow-x-auto border border-stone-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Discount Rule</th>
                <th className="py-3 px-4">Min. Order Value</th>
                <th className="py-3 px-4">Usage Count</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-800">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-rose-900 text-sm">
                    {c.code}
                  </td>
                  <td className="py-3 px-4 font-medium">
                    {c.discount_type === "fixed"
                      ? `${formatPrice(c.discount_value)} Flat Off`
                      : `${c.discount_value}% Percentage Off`}
                  </td>
                  <td className="py-3 px-4 font-mono text-stone-600">
                    {c.min_order_amount > 0 ? formatPrice(c.min_order_amount) : "No minimum"}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-stone-900">
                    {c.usage_count} times
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteCoupon(c.id)}
                      className="p-1 text-stone-400 hover:text-red-700 transition-colors"
                      aria-label="Delete coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Occasion Collections Manager */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="border-b border-stone-200 pb-4">
          <h2 className="text-lg font-bold font-serif text-stone-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-rose-800" />
            3. Occasion Collections &amp; Sort Order
          </h2>
          <p className="text-xs text-stone-500">
            Storefront occasion curation cards displayed on the homepage navigation strip.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Festive & Wedding",
              slug: "festive-wedding",
              count: "24 Ensembles",
              order: 1,
            },
            {
              title: "Party & Evening Gowns",
              slug: "party-gowns",
              count: "18 Ensembles",
              order: 2,
            },
            {
              title: "Cotton Twirl Frocks",
              slug: "cotton-dresses",
              count: "32 Ensembles",
              order: 3,
            },
            {
              title: "Casuals & Co-ords",
              slug: "casuals-coords",
              count: "14 Ensembles",
              order: 4,
            },
          ].map((col) => (
            <div
              key={col.slug}
              className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span className="font-mono text-[10px] font-bold uppercase">Order #{col.order}</span>
                  <span className="text-emerald-700 font-semibold">{col.count}</span>
                </div>
                <h3 className="font-serif text-sm font-bold text-stone-900 mt-1">{col.title}</h3>
              </div>
              <div className="pt-2 flex items-center justify-between text-xs">
                <Link
                  href={`/collections/${col.slug}`}
                  className="text-rose-900 hover:text-rose-700 font-semibold flex items-center gap-1"
                  target="_blank"
                >
                  View <ExternalLink className="w-3 h-3" />
                </Link>
                <span className="text-[10px] text-stone-400 font-mono">Live</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Add New Banner */}
      {showBannerModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                + Add Storefront Hero Banner
              </h3>
              <button
                type="button"
                onClick={() => setShowBannerModal(false)}
                className="text-stone-400 hover:text-stone-800 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBanner} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-700">Banner Title *</label>
                <input
                  type="text"
                  required
                  value={bTitle}
                  onChange={(e) => setBTitle(e.target.value)}
                  placeholder="e.g. Diwali & Wedding Couture 2026"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Subtitle / Tagline</label>
                <input
                  type="text"
                  value={bSubtitle}
                  onChange={(e) => setBSubtitle(e.target.value)}
                  placeholder="e.g. Pure Kanchipuram Silks, Velvet Lehengas..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">CTA Label *</label>
                  <input
                    type="text"
                    required
                    value={bCtaLabel}
                    onChange={(e) => setBCtaLabel(e.target.value)}
                    placeholder="Shop Festive Lehengas"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">CTA Target URL *</label>
                  <input
                    type="text"
                    required
                    value={bCtaLink}
                    onChange={(e) => setBCtaLink(e.target.value)}
                    placeholder="/collections/festive-wedding"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Image URL (Unsplash or CDN) *</label>
                <input
                  type="url"
                  required
                  value={bImageUrl}
                  onChange={(e) => setBImageUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Sort Order (1 = First Slide)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={bSortOrder}
                  onChange={(e) => setBSortOrder(Number(e.target.value))}
                  className="w-24 px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBannerModal(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-900 text-white rounded-lg font-semibold hover:bg-rose-800"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Coupon */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900">+ Create Promo Coupon</h3>
              <button
                type="button"
                onClick={() => setShowCouponModal(false)}
                className="text-stone-400 hover:text-stone-800 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-700">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={cCode}
                  onChange={(e) => setCCode(e.target.value.toUpperCase())}
                  placeholder="e.g. DIWALI500"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Discount Type *</label>
                  <select
                    value={cType}
                    onChange={(e) => setCType(e.target.value as "percentage" | "fixed")}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs bg-white"
                  >
                    <option value="fixed">Flat Rupee Off (₹)</option>
                    <option value="percentage">Percentage Off (%)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">
                    {cType === "fixed" ? "Discount Value (₹) *" : "Discount Rate (%) *"}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={cValue}
                    onChange={(e) => setCValue(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Minimum Order Value (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={cMinOrder}
                  onChange={(e) => setCMinOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 text-white rounded-lg font-semibold hover:bg-stone-800"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

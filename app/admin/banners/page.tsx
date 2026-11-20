"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import {
  getStoreSettings,
  updateBannerDuration,
  getHeroBanners,
  upsertHeroBanner,
  deleteHeroBanner,
  toggleHeroBannerActive,
  reorderHeroBanners,
} from "@/lib/db/actions";
import {
  Sparkles,
  Clock,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Edit,
} from "lucide-react";

interface HeroBannerItem {
  id: string;
  eyebrow_text: string | null;
  title: string;
  subtitle: string | null;
  cta_label: string | null;
  cta_href: string | null;
  desktop_image_url: string;
  mobile_image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

const PRESET_BANNER_IMAGES = [
  {
    name: "Golden Zari Pattu Twirl",
    url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=85",
  },
  {
    name: "Royal Kumkum Velvet Anarkali",
    url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1600&q=85",
  },
  {
    name: "Handloom Soft Cotton Frocks",
    url: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=1600&q=85",
  },
];

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<HeroBannerItem[]>([]);
  const [durationSec, setDurationSec] = useState<number>(3);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [eyebrowText, setEyebrowText] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaHref, setCtaHref] = useState("");
  const [desktopImageUrl, setDesktopImageUrl] = useState(PRESET_BANNER_IMAGES[0].url);
  const [mobileImageUrl, setMobileImageUrl] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const loadData = () => {
    Promise.all([getStoreSettings(), getHeroBanners(true)])
      .then(([settings, bList]) => {
        setDurationSec(settings.hero_banner_duration_sec ?? 3);
        setBanners((bList as unknown as HeroBannerItem[]) || []);
      })
      .catch((err) => {
        console.error("Failed to load banner settings:", err);
        setFeedback({ type: "error", message: "Failed to load banner data." });
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveDuration = () => {
    startTransition(async () => {
      const res = await updateBannerDuration(durationSec);
      if (res.success) {
        setFeedback({
          type: "success",
          message: `Hero banner rotation duration saved to ${durationSec} seconds. Storefront carousels now auto-advance every ${durationSec}s!`,
        });
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to update duration." });
      }
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setEyebrowText("");
    setTitle("");
    setSubtitle("");
    setCtaLabel("");
    setCtaHref("");
    setDesktopImageUrl(PRESET_BANNER_IMAGES[0].url);
    setMobileImageUrl("");
    setSortOrder(banners.length);
    setIsActive(true);
    setIsFormOpen(false);
  };

  const handleEdit = (banner: HeroBannerItem) => {
    setEditingId(banner.id);
    setEyebrowText(banner.eyebrow_text || "");
    setTitle(banner.title);
    setSubtitle(banner.subtitle || "");
    setCtaLabel(banner.cta_label || "");
    setCtaHref(banner.cta_href || "");
    setDesktopImageUrl(banner.desktop_image_url);
    setMobileImageUrl(banner.mobile_image_url || "");
    setSortOrder(banner.sort_order);
    setIsActive(banner.is_active);
    setIsFormOpen(true);
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desktopImageUrl.trim()) {
      setFeedback({ type: "error", message: "Title and Desktop Image URL are mandatory." });
      return;
    }

    startTransition(async () => {
      const res = await upsertHeroBanner({
        id: editingId || undefined,
        eyebrow_text: eyebrowText.trim() || undefined,
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        cta_label: ctaLabel.trim() || "Explore Collection",
        cta_href: ctaHref.trim() || "/collections",
        desktop_image_url: desktopImageUrl.trim(),
        mobile_image_url: mobileImageUrl.trim() || undefined,
        sort_order: sortOrder,
        is_active: isActive,
      });

      if (res.success) {
        setFeedback({
          type: "success",
          message: editingId
            ? "Banner updated successfully!"
            : "New hero banner published to storefront carousel!",
        });
        resetForm();
        loadData();
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to save banner." });
      }
    });
  };

  const handleToggleActive = (id: string, current: boolean) => {
    startTransition(async () => {
      const res = await toggleHeroBannerActive(id, !current);
      if (res.success) {
        setBanners((prev) =>
          prev.map((b) => (b.id === id ? { ...b, is_active: !current } : b))
        );
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to toggle status." });
      }
    });
  };

  const handleDelete = (id: string, bannerTitle: string) => {
    if (!confirm(`Are you sure you want to permanently delete banner "${bannerTitle}"?`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteHeroBanner(id);
      if (res.success) {
        setFeedback({ type: "success", message: `Banner "${bannerTitle}" deleted.` });
        setBanners((prev) => prev.filter((b) => b.id !== id));
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to delete banner." });
      }
    });
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= banners.length) return;

    const newBanners = [...banners];
    const [moved] = newBanners.splice(index, 1);
    newBanners.splice(targetIdx, 0, moved);

    const reorderedIds = newBanners.map((b) => b.id);
    setBanners(newBanners);

    startTransition(async () => {
      const res = await reorderHeroBanners(reorderedIds);
      if (!res.success) {
        setFeedback({ type: "error", message: res.error || "Failed to save banner order." });
        loadData();
      }
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-900/10 text-rose-900 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Storefront Merchandising</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
            Hero Banners &amp; Rotation Duration Manager
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Configure full-width rotating hero showcases, CTA links, and the auto-advance rotation timer.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (isFormOpen) {
              resetForm();
            } else {
              resetForm();
              setIsFormOpen(true);
            }
          }}
          className="px-4 py-2.5 bg-rose-900 text-white rounded-xl text-xs font-semibold hover:bg-rose-800 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{isFormOpen ? "Close Form" : "Add New Hero Banner"}</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 font-medium ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
              : "bg-red-50 text-red-900 border border-red-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* ROTATION TIMER CONTROL MODULE */}
      <div className="p-6 bg-white border border-stone-200 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-800">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-stone-900">
                Hero Carousel Auto-Advance Timer
              </h2>
              <p className="text-xs text-stone-500">
                Sets the rotation speed across all storefront hero banners. Default is 3 seconds.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
            Active: {durationSec} Seconds
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
          <div className="md:col-span-8 space-y-2">
            <div className="flex justify-between text-xs font-medium text-stone-700">
              <span>Fast (1 sec)</span>
              <span className="font-bold text-rose-900 font-mono text-sm">
                {durationSec}s Interval
              </span>
              <span>Slow (30 sec)</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              value={durationSec}
              onChange={(e) => setDurationSec(Number(e.target.value))}
              className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-rose-900"
            />
            <p className="text-[11px] text-stone-500">
              Tip: The carousel automatically pauses when customers hover their mouse over a banner, giving them time to read.
            </p>
          </div>

          <div className="md:col-span-4 flex items-center gap-3">
            <div className="w-24">
              <input
                type="number"
                min={1}
                max={30}
                value={durationSec}
                onChange={(e) => setDurationSec(Math.min(30, Math.max(1, Number(e.target.value))))}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-center font-mono font-bold text-sm bg-stone-50 focus:ring-2 focus:ring-rose-800 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleSaveDuration}
              disabled={isPending}
              className="flex-1 py-2 px-4 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-800 transition-colors disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save Duration"}
            </button>
          </div>
        </div>
      </div>

      {/* ADD / EDIT BANNER FORM */}
      {isFormOpen && (
        <form
          onSubmit={handleSaveBanner}
          className="p-6 sm:p-8 bg-white border border-stone-200 rounded-2xl shadow-sm space-y-6 text-xs"
        >
          <div className="border-b border-stone-200 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900 font-serif">
              {editingId ? "Edit Hero Banner" : "Publish New Hero Banner"}
            </h2>
            <button
              type="button"
              onClick={resetForm}
              className="text-stone-500 hover:text-stone-800 text-xs font-semibold"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="font-bold text-stone-700">
                Eyebrow Text (Small Tagline)
              </label>
              <input
                type="text"
                value={eyebrowText}
                onChange={(e) => setEyebrowText(e.target.value)}
                placeholder="e.g. Festive Deepavali &amp; Wedding Collection 2026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-rose-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-stone-700">
                Main Headline / Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Pure Pattu Pavadais &amp; Heritage Lehengas"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-rose-800"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="font-bold text-stone-700">
                Subtitle / Craft Description
              </label>
              <textarea
                rows={2}
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Woven from authentic Kanchipuram silk with 100% breathable cotton mulmul inner lining."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-rose-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-stone-700">Call-to-Action Label</label>
              <input
                type="text"
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                placeholder="e.g. Explore Pattu Collection"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-rose-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-stone-700">Call-to-Action Link Destination</label>
              <input
                type="text"
                value={ctaHref}
                onChange={(e) => setCtaHref(e.target.value)}
                placeholder="e.g. /collections/pattu-lehengas or /collections"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-rose-800"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="font-bold text-stone-700">Desktop Image URL *</label>
              <input
                type="url"
                required
                value={desktopImageUrl}
                onChange={(e) => setDesktopImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-rose-800"
              />
              <div className="flex items-center gap-2 pt-1 text-[11px] text-stone-500">
                <span>Presets:</span>
                {PRESET_BANNER_IMAGES.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setDesktopImageUrl(p.url)}
                    className="underline hover:text-stone-900"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-stone-700">Mobile Image URL (Optional)</label>
              <input
                type="url"
                value={mobileImageUrl}
                onChange={(e) => setMobileImageUrl(e.target.value)}
                placeholder="https://... (Uses desktop image if blank)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-rose-800"
              />
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-900 focus:ring-rose-800"
                />
                <label htmlFor="isActiveToggle" className="font-bold text-stone-700 cursor-pointer">
                  Display in Storefront Rotation (Active)
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-stone-100 text-stone-700 rounded-xl font-semibold hover:bg-stone-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2 bg-rose-900 text-white rounded-xl font-semibold hover:bg-rose-800 transition-colors shadow-sm disabled:opacity-50"
            >
              {isPending ? "Saving..." : editingId ? "Update Banner" : "Publish Banner"}
            </button>
          </div>
        </form>
      )}

      {/* BANNERS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-lg text-stone-900">
            Active &amp; Scheduled Banners ({banners.length})
          </h2>
          <span className="text-xs text-stone-500">
            Use up/down arrows to adjust display sequence.
          </span>
        </div>

        {banners.length === 0 ? (
          <div className="p-12 text-center bg-white border border-stone-200 rounded-2xl text-stone-500 text-sm">
            No hero banners currently uploaded. Click &ldquo;Add New Hero Banner&rdquo; to launch your first banner.
          </div>
        ) : (
          <div className="space-y-3">
            {banners.map((banner, idx) => (
              <div
                key={banner.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white ${
                  banner.is_active
                    ? "border-stone-200 shadow-sm"
                    : "border-stone-200 opacity-60 bg-stone-50"
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Sequence Reorder Controls */}
                  <div className="flex flex-col gap-1 text-stone-400 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, "up")}
                      className="p-1 hover:text-stone-900 hover:bg-stone-100 rounded disabled:opacity-30"
                      title="Move Up in Carousel"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] text-center font-mono font-bold text-stone-600">
                      {idx + 1}
                    </span>
                    <button
                      type="button"
                      disabled={idx === banners.length - 1}
                      onClick={() => handleMove(idx, "down")}
                      className="p-1 hover:text-stone-900 hover:bg-stone-100 rounded disabled:opacity-30"
                      title="Move Down in Carousel"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div className="relative w-28 h-16 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                    <Image
                      src={banner.desktop_image_url}
                      alt={banner.title}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="space-y-1 min-w-0">
                    {banner.eyebrow_text && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-900 bg-rose-50 px-2 py-0.5 rounded">
                        {banner.eyebrow_text}
                      </span>
                    )}
                    <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 truncate">
                      {banner.title}
                    </h3>
                    {banner.subtitle && (
                      <p className="text-xs text-stone-500 line-clamp-1 max-w-md">
                        {banner.subtitle}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-[11px] text-stone-400">
                      {banner.cta_label && (
                        <span>
                          CTA: <strong className="text-stone-700">{banner.cta_label}</strong> &rarr;{" "}
                          <span className="font-mono">{banner.cta_href || "#"}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(banner.id, banner.is_active)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      banner.is_active
                        ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-300"
                    }`}
                  >
                    {banner.is_active ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-stone-500" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEdit(banner)}
                    className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors border border-stone-200"
                    title="Edit Banner"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(banner.id, banner.title)}
                    className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
                    title="Delete Banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

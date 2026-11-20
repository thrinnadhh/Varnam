"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useTransition } from "react";
import { Heart, ShoppingBag, Check } from "lucide-react";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { toggleWishlist, addToCart } from "@/lib/db/actions";
import { motion } from "motion/react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    segment?: "girls" | "teens" | "women" | string;
    fabric: string;
    lining: string;
    categories?: { name: string; slug: string } | null;
    product_variants: Array<{
      id: string;
      size_group?: string;
      size_name?: string;
      size_age?: string | null;
      color_name: string;
      price: number;
      mrp: number;
      stock: number;
    }>;
    product_images?: Array<{
      image_url: string;
      alt_text?: string;
      is_primary?: boolean;
    }>;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const [isPending, startTransition] = useTransition();
  const [isFavorited, setIsFavorited] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const primaryImage =
    product.product_images?.find((img) => img.is_primary)?.image_url ||
    product.product_images?.[0]?.image_url ||
    "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80";

  // Find lowest price and highest MRP for display
  const prices = product.product_variants.map((v) => v.price);
  const mrps = product.product_variants.map((v) => v.mrp);
  const minPrice = Math.min(...(prices.length ? prices : [0]));
  const maxMrp = Math.max(...(mrps.length ? mrps : [0]));
  const discountPercent = calculateDiscount(minPrice, maxMrp);

  // Available size tags
  const sizeTags = Array.from(
    new Set(product.product_variants.map((v) => v.size_name || v.size_age || ""))
  ).filter(Boolean);

  const segmentLabel =
    product.segment === "women"
      ? "Women (XS–XXL)"
      : product.segment === "teens"
      ? "Teens (13–18Y)"
      : product.segment === "girls"
      ? "Girls (2–12Y)"
      : null;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      const res = await toggleWishlist(product.id);
      if (res.success && typeof res.isFavorited === "boolean") {
        setIsFavorited(res.isFavorited);
      }
    });
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const firstAvailableVariant = product.product_variants.find((v) => v.stock > 0);
    if (!firstAvailableVariant) return;

    startTransition(async () => {
      // Also update client guest cart in localStorage for guest visitors
      try {
        const guestCart = JSON.parse(localStorage.getItem("varnam_guest_cart") || "[]");
        const existingIdx = guestCart.findIndex((i: { variant_id?: string }) => i.variant_id === firstAvailableVariant.id);
        if (existingIdx >= 0) {
          guestCart[existingIdx].quantity += 1;
        } else {
          guestCart.push({
            variant_id: firstAvailableVariant.id,
            product_id: product.id,
            product_name: product.name,
            product_slug: product.slug,
            size_name: firstAvailableVariant.size_name || firstAvailableVariant.size_age || "Standard",
            size_age: firstAvailableVariant.size_age || firstAvailableVariant.size_name,
            color_name: firstAvailableVariant.color_name,
            price: firstAvailableVariant.price,
            mrp: firstAvailableVariant.mrp,
            image_url: primaryImage,
            quantity: 1,
          });
        }
        localStorage.setItem("varnam_guest_cart", JSON.stringify(guestCart));
        window.dispatchEvent(new Event("varnam_cart_updated"));
      } catch (err) {
        console.error("Local cart error:", err);
      }

      await addToCart(firstAvailableVariant.id, 1);
      setAddedFeedback(true);
      setTimeout(() => setAddedFeedback(false), 2000);
    });
  };

  return (
    <div className="group relative bg-surface rounded-2xl border border-border hover:border-brand-primary/30 overflow-hidden shadow-warm-sm hover:shadow-warm-md transition-all duration-300 flex flex-col">
      {/* Image Container with high-contrast segment and size pills */}
      <Link href={`/products/${product.slug}`} className="relative aspect-[3/4] w-full overflow-hidden bg-canvas">
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* High-contrast badges on top-left */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1 z-10">
          {segmentLabel && (
            <span className="bg-stone-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm shadow-sm">
              {segmentLabel}
            </span>
          )}
          {sizeTags.length > 0 && (
            <span className="bg-surface/90 text-text-heading text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm shadow-sm border border-border/80">
              {product.segment === "girls" ? "Ages " : "Sizes "}
              {sizeTags[0]}
              {sizeTags.length > 1 ? `–${sizeTags[sizeTags.length - 1]}` : ""}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-brand-secondary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Heart on top-right */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.85 }}
          whileHover={{ scale: 1.1 }}
          onClick={handleWishlistClick}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            isFavorited
              ? "bg-brand-primary text-white"
              : "bg-surface/80 text-text-heading hover:bg-surface hover:text-brand-primary"
          }`}
          aria-label="Add to favorites"
        >
          <Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
        </motion.button>

        {/* Cotton Lining Indicator Tag */}
        {product.lining && (
          <div className="absolute bottom-2 left-2 right-2">
            <span className="inline-block bg-surface/95 backdrop-blur-sm text-brand-primary text-[10px] font-semibold px-2 py-0.5 rounded-md border border-border/80 shadow-sm">
              🌿 {product.lining}
            </span>
          </div>
        )}
      </Link>

      {/* Product Content Details */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-secondary">
          {product.fabric}
        </p>

        <h3 className="font-serif font-bold text-text-heading text-sm sm:text-base mt-1 line-clamp-2 group-hover:text-brand-primary transition-colors">
          <Link href={`/products/${product.slug}`}>
            {product.name}
          </Link>
        </h3>

        {/* Pricing */}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base sm:text-lg font-bold text-text-heading">
            {formatPrice(minPrice)}
          </span>
          {maxMrp > minPrice && (
            <span className="text-xs text-text-muted line-through">
              {formatPrice(maxMrp)}
            </span>
          )}
        </div>

        {/* Quick Add Button */}
        <div className="mt-3 pt-3 border-t border-border-subtle flex items-center justify-between">
          <span className="text-[11px] text-text-muted">
            {sizeTags.length} sizes available
          </span>

          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            disabled={isPending}
            onClick={handleQuickAdd}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              addedFeedback
                ? "bg-emerald-600 text-white"
                : "bg-brand-primary-subtle text-brand-primary hover:bg-brand-primary hover:text-white"
            }`}
          >
            {addedFeedback ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added!
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" /> Quick Add
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

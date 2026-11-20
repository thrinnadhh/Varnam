"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useTransition } from "react";
import { Heart, ShoppingBag, Check, Eye, Minus, Plus } from "lucide-react";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { toggleWishlist, addToCart } from "@/lib/db/actions";
import { QuickViewModal } from "@/components/quick-view-modal";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    segment?: "girls" | "teens" | "women" | string;
    fabric: string;
    lining: string;
    craft_work?: string | null;
    set_includes?: string | null;
    wash_care?: string | null;
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
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [cardQuantity, setCardQuantity] = useState(1);

  const primaryImage =
    product.product_images?.find((img) => img.is_primary)?.image_url ||
    product.product_images?.[0]?.image_url ||
    "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80";

  // Calculate pricing
  const prices = product.product_variants.map((v) => v.price);
  const mrps = product.product_variants.map((v) => v.mrp);
  const minPrice = Math.min(...(prices.length ? prices : [0]));
  const maxMrp = Math.max(...(mrps.length ? mrps : [0]));
  const discountPercent = calculateDiscount(minPrice, maxMrp);

  // Available size tags
  const sizeTags = Array.from(
    new Set(product.product_variants.map((v) => v.size_name || v.size_age || ""))
  ).filter(Boolean);

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
    const firstAvailable = product.product_variants.find((v) => v.stock > 0);
    if (!firstAvailable) {
      setIsQuickViewOpen(true);
      return;
    }

    startTransition(async () => {
      try {
        const guestCart = JSON.parse(localStorage.getItem("varnam_guest_cart") || "[]");
        const existingIdx = guestCart.findIndex((i: { variant_id?: string }) => i.variant_id === firstAvailable.id);
        if (existingIdx >= 0) {
          guestCart[existingIdx].quantity += cardQuantity;
        } else {
          guestCart.push({
            variant_id: firstAvailable.id,
            product_id: product.id,
            product_name: product.name,
            product_slug: product.slug,
            size_name: firstAvailable.size_name || firstAvailable.size_age || "Standard",
            size_age: firstAvailable.size_age || firstAvailable.size_name,
            color_name: firstAvailable.color_name,
            price: firstAvailable.price,
            mrp: firstAvailable.mrp,
            image_url: primaryImage,
            quantity: cardQuantity,
          });
        }
        localStorage.setItem("varnam_guest_cart", JSON.stringify(guestCart));
        window.dispatchEvent(new Event("varnam_cart_updated"));
      } catch (err) {
        console.warn("Local cart save error:", err);
      }

      await addToCart(firstAvailable.id, cardQuantity);
      setAddedFeedback(true);
      setTimeout(() => setAddedFeedback(false), 2000);
    });
  };

  return (
    <>
      <div className="group relative flex flex-col rounded-2xl bg-[#FAF5EB] border border-[#D8C7AE] shadow-[0_8px_24px_-6px_rgba(59,40,30,0.12)] hover:shadow-[0_16px_36px_-8px_rgba(59,40,30,0.18)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
        {/* Boutique Hang-Tag Perforation Header */}
        <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#FAF5EB] border-b border-[#D8C7AE]/60 text-[10px] text-[#6B574B] font-semibold tracking-wider">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full border border-[#C69214] bg-[#EFE6D5]" />
            <span className="uppercase text-[#8B1E3F] truncate max-w-[140px]">{product.fabric}</span>
          </div>
          <span className="text-[#C69214] font-medium">1-Inch Growth Seam</span>
        </div>

        {/* Product Image Stage */}
        <div className="relative aspect-[3/4] w-full bg-[#EFE6D5] overflow-hidden">
          <Link href={`/products/${product.slug}`} className="block h-full w-full">
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </Link>

          {/* Kumkum Crimson Discount Tag */}
          {discountPercent > 0 && (
            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-[#8B1E3F] text-[#FAF5EB] text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
              {discountPercent}% OFF
            </div>
          )}

          {/* Action Buttons: Wishlist & Quick View */}
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
            <button
              type="button"
              onClick={handleWishlistClick}
              disabled={isPending}
              className={`p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
                isFavorited
                  ? "bg-[#8B1E3F] text-white"
                  : "bg-[#FAF5EB]/90 text-[#3B281E] hover:bg-[#FAF5EB] hover:text-[#8B1E3F]"
              }`}
              aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsQuickViewOpen(true);
              }}
              className="p-2 rounded-full bg-[#FAF5EB]/90 text-[#3B281E] hover:bg-[#FAF5EB] hover:text-[#C69214] backdrop-blur-md transition-all shadow-sm opacity-90 group-hover:opacity-100"
              aria-label="Quick preview dress details"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Malmal Lining Transparency Pill */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 pointer-events-none">
            <div className="px-2.5 py-1 rounded-md bg-[#3B281E]/85 backdrop-blur-sm text-[#FAF5EB] text-[10px] font-medium flex items-center justify-between">
              <span className="truncate">Lining: {product.lining}</span>
              <span className="text-[#C69214] text-[9px] font-bold uppercase shrink-0 ml-1">100% Cotton</span>
            </div>
          </div>
        </div>

        {/* Card Body: Name, Sizes, Pricing, Quick Add */}
        <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3 bg-[#FAF5EB]">
          <div>
            <Link href={`/products/${product.slug}`} className="block group-hover:text-[#8B1E3F] transition-colors">
              <h3 className="font-serif text-sm sm:text-base font-bold text-[#261C17] line-clamp-1 leading-snug">
                {product.name}
              </h3>
            </Link>

            {/* Size Chips */}
            {sizeTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {sizeTags.slice(0, 5).map((size) => (
                  <span
                    key={size}
                    className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#EFE6D5] text-[#3B281E] border border-[#D8C7AE]/60"
                  >
                    {size}
                  </span>
                ))}
                {sizeTags.length > 5 && (
                  <span className="px-1 py-0.5 text-[10px] text-[#6B574B] font-medium">
                    +{sizeTags.length - 5}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-[#D8C7AE]/50 flex items-center justify-between gap-2">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-sans font-bold text-sm sm:text-base text-[#261C17] price-tabular">
                  {formatPrice(minPrice)}
                </span>
                {maxMrp > minPrice && (
                  <span className="text-[11px] text-[#6B574B] line-through price-tabular">
                    {formatPrice(maxMrp)}
                  </span>
                )}
              </div>
            </div>

            {/* Quantity Stepper & Quick Add CTA */}
            <div className="flex items-center gap-1.5">
              <div
                className="flex items-center border border-[#D8C7AE] rounded-lg bg-[#EFE6D5] overflow-hidden shadow-xs"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <button
                  type="button"
                  onClick={() => setCardQuantity((q) => Math.max(1, q - 1))}
                  disabled={cardQuantity <= 1 || isPending}
                  className="px-1.5 py-1 text-[#3B281E] hover:bg-[#FAF5EB] disabled:opacity-30 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={cardQuantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      setCardQuantity(Math.max(1, Math.min(50, val)));
                    }
                  }}
                  className="w-6 text-center text-xs font-bold font-mono bg-transparent text-[#261C17] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  aria-label="Item quantity"
                />
                <button
                  type="button"
                  onClick={() => setCardQuantity((q) => Math.min(50, q + 1))}
                  disabled={cardQuantity >= 50 || isPending}
                  className="px-1.5 py-1 text-[#3B281E] hover:bg-[#FAF5EB] disabled:opacity-30 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleQuickAdd}
                disabled={isPending}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                  addedFeedback
                    ? "bg-[#145349] text-white"
                    : "bg-[#8B1E3F] text-[#FAF5EB] hover:bg-[#721531] active:scale-95"
                }`}
                aria-label={`Quick add ${cardQuantity} of ${product.name} to bag`}
              >
                {addedFeedback ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{cardQuantity > 1 ? `Added (${cardQuantity})` : "Added"}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{cardQuantity > 1 ? `Add (${cardQuantity})` : "Quick Add"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {isQuickViewOpen && (
        <QuickViewModal
          product={product}
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
        />
      )}
    </>
  );
}

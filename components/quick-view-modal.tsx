"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { addToCart } from "@/lib/db/actions";
import {
  X,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Check,
  Ruler,
  Plus,
  Minus,
  Scissors,
} from "lucide-react";

export interface QuickViewProduct {
  id: string;
  name: string;
  slug: string;
  fabric: string;
  lining: string;
  craft_work?: string | null;
  set_includes?: string | null;
  wash_care?: string | null;
  model_height?: string | null;
  model_size_worn?: string | null;
  product_images?: { image_url: string; alt_text?: string }[];
  product_variants: {
    id: string;
    size_name?: string;
    size_age?: string | null;
    color_name: string;
    price: number;
    mrp: number;
    stock: number;
  }[];
}

interface QuickViewModalProps {
  product: QuickViewProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenSizeGuide?: () => void;
}

export function QuickViewModal({
  product,
  isOpen,
  onClose,
  onOpenSizeGuide,
}: QuickViewModalProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  if (!isOpen || !product) return null;

  const variants = product.product_variants || [];
  const activeVariant =
    variants.find((v) => v.id === selectedVariantId) ||
    variants.find((v) => v.stock > 0) ||
    variants[0];

  const images = product.product_images?.length
    ? product.product_images
    : [
        {
          image_url:
            "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
          alt_text: product.name,
        },
      ];

  const price = activeVariant?.price || 0;
  const mrp = activeVariant?.mrp || 0;
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const handleAddToCart = async () => {
    if (!activeVariant || activeVariant.stock <= 0) return;
    setIsAdding(true);
    try {
      try {
        const guestCart = JSON.parse(localStorage.getItem("varnam_guest_cart") || "[]");
        const existingIdx = guestCart.findIndex((i: { variant_id?: string }) => i.variant_id === activeVariant.id);
        if (existingIdx >= 0) {
          guestCart[existingIdx].quantity += quantity;
        } else {
          guestCart.push({
            variant_id: activeVariant.id,
            product_id: product.id,
            product_name: product.name,
            product_slug: product.slug,
            size_name: activeVariant.size_name || activeVariant.size_age || "Standard",
            size_age: activeVariant.size_age || activeVariant.size_name,
            color_name: activeVariant.color_name,
            price: activeVariant.price,
            mrp: activeVariant.mrp,
            image_url: images[0]?.image_url,
            quantity: quantity,
          });
        }
        localStorage.setItem("varnam_guest_cart", JSON.stringify(guestCart));
        window.dispatchEvent(new Event("varnam_cart_updated"));
      } catch (err) {
        console.warn("Guest cart update error:", err);
      }

      await addToCart(activeVariant.id, quantity);
      setAdded(true);
      setTimeout(() => {
        setAdded(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Add to cart error:", err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
    >
      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-[#FAF5EB] border-2 border-[#D8C7AE] shadow-2xl text-[#261C17]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-[#FAF5EB]/90 hover:bg-[#EFE6D5] text-[#3B281E] border border-[#D8C7AE] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[85vh] overflow-y-auto">
          {/* Left: Product Images */}
          <div className="p-4 sm:p-6 bg-[#EFE6D5]/60 flex flex-col justify-between">
            <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border border-[#D8C7AE] shadow-sm bg-[#EFE6D5]">
              <Image
                src={images[activeImageIdx]?.image_url || images[0].image_url}
                alt={product.name}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 400px"
              />
              {discount > 0 && (
                <div className="absolute top-3 left-3 px-2 py-1 rounded bg-[#8B1E3F] text-[#FAF5EB] text-[10px] font-extrabold uppercase">
                  {discount}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail switcher */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-12 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImageIdx === idx ? "border-[#8B1E3F] scale-105" : "border-[#D8C7AE] opacity-70"
                    }`}
                  >
                    <Image src={img.image_url} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details & Size Selector */}
          <div className="p-5 sm:p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EFE6D5] text-[#8B1E3F] text-[10px] font-bold uppercase tracking-wider mb-2 border border-[#D8C7AE]">
                <Sparkles className="w-3 h-3 text-[#C69214]" />
                <span>{product.fabric}</span>
              </div>

              <h2 id="quick-view-title" className="font-serif text-xl sm:text-2xl font-bold text-[#261C17] leading-tight">
                {product.name}
              </h2>

              {/* Price Row */}
              <div className="flex items-baseline gap-2.5 mt-2">
                <span className="font-sans font-extrabold text-xl sm:text-2xl text-[#261C17] price-tabular">
                  {formatPrice(price)}
                </span>
                {mrp > price && (
                  <span className="text-sm text-[#6B574B] line-through price-tabular">
                    {formatPrice(mrp)}
                  </span>
                )}
                <span className="text-xs text-[#145349] font-bold">Inclusive of all taxes</span>
              </div>

              {/* Garment Transparency Pills */}
              <div className="mt-3 p-3 rounded-xl bg-[#EFE6D5]/60 border border-[#D8C7AE] space-y-1.5 text-xs text-[#3B281E]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#145349] shrink-0" />
                  <span><strong>Lining:</strong> {product.lining}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-[#C69214] shrink-0" />
                  <span><strong>Growth Margin:</strong> 1-Inch Inner Growth Seam</span>
                </div>
              </div>

              {/* Size Selector */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#261C17] uppercase tracking-wider">
                    Select Size
                  </span>
                  {onOpenSizeGuide && (
                    <button
                      type="button"
                      onClick={onOpenSizeGuide}
                      className="text-[11px] font-semibold text-[#8B1E3F] hover:underline flex items-center gap-1"
                    >
                      <Ruler className="w-3 h-3" /> Size Guide
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => {
                    const isSelected = activeVariant?.id === v.id;
                    const isOutOfStock = v.stock <= 0;
                    const label = v.size_name || v.size_age || "Standard";

                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setSelectedVariantId(v.id)}
                        disabled={isOutOfStock}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          isSelected
                            ? "bg-[#8B1E3F] text-[#FAF5EB] border-[#8B1E3F] shadow-sm"
                            : isOutOfStock
                            ? "bg-stone-100 text-stone-400 border-stone-200 line-through cursor-not-allowed"
                            : "bg-[#FAF5EB] text-[#3B281E] border-[#D8C7AE] hover:border-[#8B1E3F]"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-[#261C17] uppercase tracking-wider">
                  Quantity:
                </span>
                <div className="inline-flex items-center border border-[#D8C7AE] rounded-lg bg-[#FAF5EB] shadow-xs">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-1.5 text-[#3B281E] hover:bg-[#EFE6D5] disabled:opacity-30 rounded-l-lg transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={activeVariant?.stock || 50}
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        setQuantity(Math.max(1, Math.min(activeVariant?.stock || 50, val)));
                      }
                    }}
                    className="w-8 text-center text-xs font-bold font-mono bg-transparent text-[#261C17] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    aria-label="Quantity"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(activeVariant?.stock || 50, quantity + 1))}
                    disabled={quantity >= (activeVariant?.stock || 50)}
                    className="p-1.5 text-[#3B281E] hover:bg-[#EFE6D5] disabled:opacity-30 rounded-r-lg transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuantity(Math.min(activeVariant?.stock || 50, num))}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono transition-all ${
                        quantity === num
                          ? "bg-[#8B1E3F] text-[#FAF5EB]"
                          : "bg-[#EFE6D5] text-[#3B281E] hover:bg-[#FAF5EB] border border-[#D8C7AE]/60"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 border-t border-[#D8C7AE] space-y-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding || !activeVariant || activeVariant.stock <= 0}
                className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                  added
                    ? "bg-[#145349] text-white"
                    : activeVariant?.stock <= 0
                    ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                    : "bg-[#8B1E3F] text-[#FAF5EB] hover:bg-[#721531] active:scale-[0.99]"
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Bag!
                  </>
                ) : activeVariant?.stock <= 0 ? (
                  "Sold Out"
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Shopping Bag
                  </>
                )}
              </button>

              <Link
                href={`/products/${product.slug}`}
                onClick={onClose}
                className="block text-center text-xs font-bold text-[#8B1E3F] hover:underline py-1"
              >
                View Complete Garment Details &amp; Measurement Table &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

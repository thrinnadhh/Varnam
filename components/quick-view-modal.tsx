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
  product_images?: { image_url: string; alt_text?: string }[];
  product_variants: {
    id: string;
    size_name: string;
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
    variants.find((v) => v.id === selectedVariantId) || variants[0];

  const images = product.product_images?.length
    ? product.product_images
    : [
        {
          image_url:
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
          alt_text: product.name,
        },
      ];

  const price = activeVariant?.price || 385000;
  const mrp = activeVariant?.mrp || 520000;
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  const handleAddToCart = async () => {
    if (!activeVariant || activeVariant.stock <= 0) return;
    setIsAdding(true);
    try {
      // Sync with client guest cart for instant responsiveness
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
        console.error("Guest cart error in modal:", err);
      }

      await addToCart(activeVariant.id, quantity);
      setAdded(true);
      setTimeout(() => {
        setAdded(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface rounded-3xl max-w-2xl w-full border border-border shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-surface/90 hover:bg-surface text-text-heading border border-border shadow-sm transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Product Image Gallery */}
          <div className="relative aspect-[3/4] bg-surface-raised overflow-hidden">
            <Image
              src={images[activeImageIdx]?.image_url || images[0].image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {discount > 0 && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold bg-brand-primary text-white shadow-sm">
                {discount}% OFF
              </span>
            )}

            {/* Thumbnail dots if multiple images */}
            {images.length > 1 && (
              <div className="absolute bottom-4 inset-x-0 flex justify-center gap-1.5 z-10">
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImageIdx(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      activeImageIdx === i
                        ? "bg-brand-primary w-5"
                        : "bg-white/80 hover:bg-white"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: Details & Variant Selection */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              {/* Collection breadcrumb & badges */}
              <div className="flex items-center gap-2 text-[11px] font-semibold text-brand-secondary">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Festive &amp; Wedding Couture</span>
              </div>

              <h2 className="font-serif text-xl sm:text-2xl font-bold text-text-heading leading-snug">
                {product.name}
              </h2>

              {/* Price */}
              <div className="flex items-baseline gap-2.5">
                <span className="font-serif text-2xl font-bold text-brand-primary font-mono">
                  {formatPrice(price)}
                </span>
                {mrp > price && (
                  <span className="text-text-muted line-through text-sm font-mono">
                    {formatPrice(mrp)}
                  </span>
                )}
                <span className="text-[11px] text-text-muted">Incl. of all taxes</span>
              </div>

              {/* Craft Specifications Badges */}
              <div className="space-y-1.5 pt-1 text-xs">
                {product.fabric && (
                  <div className="text-text-muted">
                    <strong className="text-text-heading">Fabric:</strong> {product.fabric}
                  </div>
                )}
                {product.craft_work && (
                  <div className="text-text-muted">
                    <strong className="text-text-heading">Craft:</strong> {product.craft_work}
                  </div>
                )}
                {product.set_includes && (
                  <div className="text-text-muted">
                    <strong className="text-text-heading">Set Includes:</strong> {product.set_includes}
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-emerald-800 font-semibold pt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{product.lining || "100% Breathable Soft Cotton Mul Lining"}</span>
                </div>
              </div>

              {/* Size Selector */}
              <div className="pt-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-text-heading">Select Age / Size:</span>
                  {onOpenSizeGuide && (
                    <button
                      type="button"
                      onClick={onOpenSizeGuide}
                      className="text-brand-primary font-semibold hover:underline flex items-center gap-1"
                    >
                      <Ruler className="w-3.5 h-3.5" /> Size Guide
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => {
                    const isSelected = activeVariant?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setSelectedVariantId(v.id);
                          setQuantity(1);
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all font-mono ${
                          isSelected
                            ? "bg-brand-primary text-white border-brand-primary shadow-sm"
                            : "bg-surface hover:bg-canvas text-text-heading border-border"
                        }`}
                      >
                        {v.size_name || v.size_age}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quantity Selector & Actions */}
            <div className="pt-4 space-y-3 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-text-heading">Quantity:</span>
                  {activeVariant?.stock && activeVariant.stock <= 5 && (
                    <span className="ml-2 text-[10px] text-amber-700 font-semibold">
                      (Only {activeVariant.stock} left)
                    </span>
                  )}
                </div>
                <div className="flex items-center border border-border rounded-xl bg-canvas overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-1 text-text-heading hover:bg-surface disabled:opacity-30 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3.5 py-1 text-xs font-bold font-mono text-text-heading min-w-[28px] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(activeVariant?.stock || 10, q + 1))}
                    disabled={quantity >= (activeVariant?.stock || 10)}
                    className="px-3 py-1 text-text-heading hover:bg-surface disabled:opacity-30 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding || added || (activeVariant?.stock || 0) <= 0}
                className="w-full py-3.5 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-primary-hover shadow-warm-md hover:shadow-warm-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    Added {quantity > 1 ? `${quantity} items ` : ""}to Bag!
                  </>
                ) : (activeVariant?.stock || 0) <= 0 ? (
                  "Sold Out in This Size"
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    {isAdding ? "Adding..." : `Add ${quantity > 1 ? `${quantity} ` : ""}to Bag • ${formatPrice(price * quantity)}`}
                  </>
                )}
              </button>

              <Link
                href={`/products/${product.slug}`}
                onClick={onClose}
                className="block text-center text-xs font-semibold text-text-muted hover:text-brand-primary transition-colors pt-1"
              >
                View Full Product Details &amp; Artisan Story &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

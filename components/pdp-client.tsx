"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { addToCart, toggleWishlist } from "@/lib/db/actions";
import { SizeGuideModal } from "@/components/size-guide-modal";
import {
  Heart,
  ShoppingBag,
  Check,
  ShieldCheck,
  Truck,
  Sparkles,
  Info,
  Clock,
  Ruler,
} from "lucide-react";

interface PDPClientProps {
  product: {
    id: string;
    segment?: "girls" | "teens" | "women" | string;
    name: string;
    slug: string;
    description: string;
    fabric: string;
    lining: string;
    care_instructions: string;
    model_height?: string | null;
    model_size_worn?: string | null;
    size_chart?: any;
    categories: { name: string; slug: string; segment?: string | null };
    product_variants: Array<{
      id: string;
      size_group?: string;
      size_name: string;
      size_age?: string | null;
      bust_inches?: number | null;
      bust_cm?: number | null;
      waist_inches?: number | null;
      waist_cm?: number | null;
      hip_inches?: number | null;
      hip_cm?: number | null;
      length_inches?: number | null;
      length_cm?: number | null;
      color_name: string;
      color_hex: string;
      sku: string;
      price: number;
      mrp: number;
      stock: number;
    }>;
    product_images: Array<{
      id: string;
      image_url: string;
      alt_text: string;
      is_primary: boolean;
    }>;
  };
}

export function PDPClient({ product }: PDPClientProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.product_variants[0]?.id || ""
  );
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

  const selectedVariant =
    product.product_variants.find((v) => v.id === selectedVariantId) ||
    product.product_variants[0];

  const images = product.product_images.length
    ? product.product_images
    : [
        {
          id: "default",
          image_url:
            "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=1000&q=80",
          alt_text: product.name,
          is_primary: true,
        },
      ];

  const currentImage = images[selectedImageIdx] || images[0];
  const discount = calculateDiscount(
    selectedVariant?.price || 0,
    selectedVariant?.mrp || 0
  );

  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stock <= 0) return;

    startTransition(async () => {
      // Sync with client guest cart for instant responsiveness
      try {
        const guestCart = JSON.parse(localStorage.getItem("varnam_guest_cart") || "[]");
        const existingIdx = guestCart.findIndex((i: any) => i.variant_id === selectedVariant.id);
        if (existingIdx >= 0) {
          guestCart[existingIdx].quantity += 1;
        } else {
          guestCart.push({
            variant_id: selectedVariant.id,
            product_id: product.id,
            product_name: product.name,
            product_slug: product.slug,
            size_name: selectedVariant.size_name,
            size_age: selectedVariant.size_age || selectedVariant.size_name,
            size_group: selectedVariant.size_group,
            color_name: selectedVariant.color_name,
            price: selectedVariant.price,
            mrp: selectedVariant.mrp,
            image_url: currentImage.image_url,
            quantity: 1,
          });
        }
        localStorage.setItem("varnam_guest_cart", JSON.stringify(guestCart));
        window.dispatchEvent(new Event("varnam_cart_updated"));
      } catch (err) {
        console.error("Local cart error:", err);
      }

      await addToCart(selectedVariant.id, 1);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
    });
  };

  const handleWishlist = () => {
    startTransition(async () => {
      const res = await toggleWishlist(product.id);
      if (res.success && typeof res.isFavorited === "boolean") {
        setIsFavorited(res.isFavorited);
      }
    });
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length === 6 && /^\d+$/.test(pincode)) {
      setPincodeStatus("Delivery available in 3-4 business days. Cash on Delivery supported.");
    } else {
      setPincodeStatus("Please enter a valid 6-digit Indian postal code.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
      {/* Left Column: Image Gallery Carousel */}
      <div className="lg:col-span-7 space-y-4">
        {/* Main Image with LCP Optimization (priority, static) */}
        <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-border bg-surface shadow-warm-sm">
          <Image
            src={currentImage.image_url}
            alt={currentImage.alt_text || product.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 600px"
            className="object-cover object-center"
          />

          {/* Demographic segment and comfort badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            <span className="bg-stone-900/90 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm capitalize">
              {product.segment || "Couture"}
            </span>
            <span className="bg-emerald-800 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
              🌿 {product.lining || "100% Breathable Cotton"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleWishlist}
            className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all z-10 ${
              isFavorited
                ? "bg-brand-primary text-white"
                : "bg-surface/85 text-text-heading hover:text-brand-primary"
            }`}
            aria-label="Add to favorites"
          >
            <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Thumbnails Row */}
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {images.map((img, idx) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setSelectedImageIdx(idx)}
                className={`relative w-20 h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                  selectedImageIdx === idx
                    ? "border-brand-primary shadow-sm"
                    : "border-border opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={img.image_url}
                  alt={img.alt_text || "Thumbnail"}
                  fill
                  sizes="80px"
                  className="object-cover object-center"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Column: Garment Details & Sizing */}
      <div className="lg:col-span-5 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-secondary">
              {product.categories?.name}
            </span>
            <span className="text-text-muted text-xs">•</span>
            <span className="text-xs font-semibold text-text-muted capitalize">
              {product.segment} Edition
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-heading">
            {product.name}
          </h1>

          {/* Model Height & Size Worn Callout */}
          {product.model_height && product.model_size_worn && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border text-xs text-text-heading shadow-warm-sm">
              <span className="font-bold text-brand-primary">Model Fit:</span>
              <span>Model is {product.model_height} wearing {product.model_size_worn}</span>
            </div>
          )}

          <p className="text-xs text-text-muted">SKU: {selectedVariant?.sku}</p>
        </div>

        {/* Price & Scarcity */}
        <div className="p-4 bg-surface rounded-xl border border-border shadow-warm-sm space-y-2">
          <div className="flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-bold text-text-heading">
              {formatPrice(selectedVariant?.price || 0)}
            </span>
            {selectedVariant?.mrp > selectedVariant?.price && (
              <span className="text-sm text-text-muted line-through">
                {formatPrice(selectedVariant.mrp)}
              </span>
            )}
            {discount > 0 && (
              <span className="bg-brand-secondary text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {discount}% OFF
              </span>
            )}
          </div>
          <p className="text-[11px] text-text-muted">
            Inclusive of all taxes • Free express shipping on orders above ₹999
          </p>

          {/* Stock Scarcity Indicator */}
          {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 5 && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
              <Clock className="w-3.5 h-3.5 text-brand-secondary" />
              <span>Limited Stock: Only {selectedVariant.stock} left in this size!</span>
            </div>
          )}
        </div>

        {/* Size Selection Chips */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-text-heading uppercase tracking-wider">
              {product.segment === "women"
                ? "Select Alpha / Numeric Size:"
                : product.segment === "teens"
                ? "Select Youth Size:"
                : "Select Age Milestone:"}
            </label>
            <SizeGuideModal segment={product.segment as any} sizeChart={product.size_chart} />
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {product.product_variants.map((v) => {
              const isSelected = v.id === selectedVariantId;
              const isOutOfStock = v.stock <= 0;

              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => setSelectedVariantId(v.id)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center flex flex-col items-center justify-center ${
                    isSelected
                      ? "bg-brand-primary text-white border-brand-primary shadow-sm"
                      : isOutOfStock
                      ? "bg-canvas text-stone-300 border-border line-through cursor-not-allowed"
                      : "bg-surface text-text-heading border-border hover:border-brand-primary/50"
                  }`}
                >
                  <span>{v.size_name || v.size_age}</span>
                  {v.stock <= 3 && v.stock > 0 && (
                    <span className={`text-[9px] font-normal ${isSelected ? "text-amber-200" : "text-amber-700"}`}>
                      {v.stock} left
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Size Measurements Callout */}
          {selectedVariant && (selectedVariant.bust_inches || selectedVariant.waist_inches) && (
            <div className="p-3 bg-surface rounded-xl border border-border text-xs space-y-1">
              <div className="font-semibold text-text-heading">
                Measurements for Size {selectedVariant.size_name || selectedVariant.size_age}:
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-text-muted font-mono text-[11px]">
                {selectedVariant.bust_inches && (
                  <span>
                    {product.segment === "girls" ? "Chest" : "Bust"}:{" "}
                    <strong className="text-text-heading">{selectedVariant.bust_inches}" ({selectedVariant.bust_cm} cm)</strong>
                  </span>
                )}
                {selectedVariant.waist_inches && (
                  <span>
                    Waist:{" "}
                    <strong className="text-text-heading">{selectedVariant.waist_inches}" ({selectedVariant.waist_cm} cm)</strong>
                  </span>
                )}
                {selectedVariant.hip_inches && (
                  <span>
                    Hip:{" "}
                    <strong className="text-text-heading">{selectedVariant.hip_inches}" ({selectedVariant.hip_cm} cm)</strong>
                  </span>
                )}
                {selectedVariant.length_inches && (
                  <span>
                    Length:{" "}
                    <strong className="text-text-heading">{selectedVariant.length_inches}" ({selectedVariant.length_cm} cm)</strong>
                  </span>
                )}
              </div>
            </div>
          )}

          <p className="text-[11px] text-brand-secondary font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Includes concealed +2 to 3 inch side margins for easy alterations.
          </p>
        </div>

        {/* Add to Bag CTA */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            disabled={isPending || selectedVariant?.stock <= 0}
            onClick={handleAddToCart}
            className={`w-full py-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-warm-md hover:shadow-warm-lg transition-all ${
              selectedVariant?.stock <= 0
                ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                : addedSuccess
                ? "bg-emerald-600 text-white"
                : "bg-brand-primary text-white hover:bg-brand-primary-hover"
            }`}
          >
            {addedSuccess ? (
              <>
                <Check className="w-5 h-5" /> Added to Shopping Bag!
              </>
            ) : selectedVariant?.stock <= 0 ? (
              "Sold Out in This Size"
            ) : (
              <>
                <ShoppingBag className="w-5 h-5" /> Add to Bag • {formatPrice(selectedVariant?.price || 0)}
              </>
            )}
          </button>
        </div>

        {/* Pincode Delivery Estimator */}
        <div className="p-4 bg-surface rounded-xl border border-border space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-text-heading uppercase tracking-wider">
            <Truck className="w-4 h-4 text-brand-primary" />
            <span>Check Estimated Delivery & COD</span>
          </div>
          <form onSubmit={handleCheckPincode} className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="Enter 6-digit postal code"
              className="flex-1 px-3 py-2 text-xs rounded-lg border border-border bg-canvas focus:outline-none focus:ring-2 focus:ring-brand-primary font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-surface text-brand-primary border border-brand-primary text-xs font-bold rounded-lg hover:bg-brand-primary hover:text-white transition-colors"
            >
              Verify
            </button>
          </form>
          {pincodeStatus && (
            <p className="text-xs text-emerald-800 font-medium pt-1">
              {pincodeStatus}
            </p>
          )}
        </div>

        {/* Fabric & Lining Disclosures */}
        <div className="p-4 rounded-xl bg-surface border border-border space-y-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-text-heading border-b border-border pb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Garment Transparency & Fabric Disclosures</span>
          </div>
          <div className="space-y-1.5 text-text-body">
            <p>
              <strong className="text-text-heading">Outer Shell:</strong> {product.fabric}
            </p>
            <p className="text-emerald-900 font-medium">
              <strong className="text-emerald-950">Inner Lining:</strong> {product.lining} (Skin-Safe & Breathable)
            </p>
            <p>
              <strong className="text-text-heading">Care & Maintenance:</strong> {product.care_instructions}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

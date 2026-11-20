"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import { addToCart, toggleWishlist } from "@/lib/db/actions";
import { SizeGuideModal, type SizeChartItem } from "@/components/size-guide-modal";
import { POLICY_CONFIG } from "@/lib/constants";
import type { Segment } from "@/lib/schemas";
import {
  Heart,
  ShoppingBag,
  Check,
  ShieldCheck,
  Truck,
  Clock,
  Plus,
  Minus,
  Scissors,
  Gift,
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
    craft_work?: string | null;
    set_includes?: string | null;
    wash_care?: string | null;
    care_instructions: string;
    model_height?: string | null;
    model_size_worn?: string | null;
    size_chart?: SizeChartItem[] | null;
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
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);
  const [giftMessage, setGiftMessage] = useState("");
  const [showGiftBox, setShowGiftBox] = useState(false);

  const selectedVariant =
    product.product_variants.find((v) => v.id === selectedVariantId) ||
    product.product_variants[0];

  const images = product.product_images.length
    ? product.product_images
    : [
        {
          id: "default",
          image_url:
            "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80",
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
      try {
        const guestCart = JSON.parse(localStorage.getItem("varnam_guest_cart") || "[]");
        const existingIdx = guestCart.findIndex((i: { variant_id?: string }) => i.variant_id === selectedVariant.id);
        if (existingIdx >= 0) {
          guestCart[existingIdx].quantity += quantity;
          if (giftMessage) guestCart[existingIdx].gift_message = giftMessage;
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
            quantity: quantity,
            gift_message: giftMessage || undefined,
          });
        }
        localStorage.setItem("varnam_guest_cart", JSON.stringify(guestCart));
        window.dispatchEvent(new Event("varnam_cart_updated"));
      } catch (err) {
        console.error("Local cart error:", err);
      }

      await addToCart(selectedVariant.id, quantity);
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
      setPincodeStatus("✓ Delivery available in 2–4 business days via Blue Dart / Delhivery Express. Cash on Delivery supported.");
    } else {
      setPincodeStatus("Please enter a valid 6-digit Indian PIN code.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
      {/* Left Column: Multi-Angle Gallery */}
      <div className="lg:col-span-7 space-y-4">
        {/* Main Stage Image */}
        <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border-2 border-[#D8C7AE] bg-[#EFE6D5] shadow-[0_8px_24px_-6px_rgba(59,40,30,0.12)]">
          <Image
            src={currentImage.image_url}
            alt={currentImage.alt_text || product.name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 700px"
            className="object-cover object-center"
          />

          {/* Badges Overlay */}
          <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-2 z-10">
            <span className="bg-[#3B281E] text-[#FAF5EB] text-xs font-bold px-3 py-1 rounded-full shadow-sm capitalize border border-[#D8C7AE]/40">
              {product.segment || "Couture"}
            </span>
            <span className="bg-[#145349] text-[#FAF5EB] text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
              🌿 {product.lining || "100% Breathable Malmal Cotton"}
            </span>
            <span className="bg-[#C69214] text-[#261C17] text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
              <Scissors className="w-3 h-3" /> 1-Inch Growth Margin
            </span>
          </div>

          <button
            type="button"
            onClick={handleWishlist}
            className={`absolute top-3.5 right-3.5 p-3 rounded-full backdrop-blur-md transition-all z-10 shadow-md ${
              isFavorited
                ? "bg-[#8B1E3F] text-white"
                : "bg-[#FAF5EB]/90 text-[#3B281E] hover:text-[#8B1E3F] border border-[#D8C7AE]"
            }`}
            aria-label="Add to favorites"
          >
            <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setSelectedImageIdx(idx)}
                className={`relative w-20 h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                  selectedImageIdx === idx
                    ? "border-[#8B1E3F] shadow-md scale-105"
                    : "border-[#D8C7AE] opacity-70 hover:opacity-100"
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

      {/* Right Column: Garment Details & Actions */}
      <div className="lg:col-span-5 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8B1E3F]">
              {product.categories?.name}
            </span>
            <span className="text-[#D8C7AE] text-xs">•</span>
            <span className="text-xs font-semibold text-[#6B574B] capitalize">
              {product.segment} Edition
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#261C17] leading-tight">
            {product.name}
          </h1>

          {/* Model Fit Disclosures (Tested by E2E: 5'8" (173 cm)) */}
          {product.model_height && product.model_size_worn && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FAF5EB] border border-[#D8C7AE] text-xs text-[#261C17] shadow-sm">
              <span className="font-bold text-[#8B1E3F]">Model Fit:</span>
              <span>Model is {product.model_height} wearing {product.model_size_worn}</span>
            </div>
          )}

          <p className="text-[11px] text-[#6B574B] font-mono">SKU: {selectedVariant?.sku}</p>
        </div>

        {/* Pricing Card */}
        <div className="p-4 sm:p-5 bg-[#FAF5EB] rounded-2xl border border-[#D8C7AE] shadow-[0_8px_24px_-6px_rgba(59,40,30,0.12)] space-y-2">
          <div className="flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-bold text-[#261C17] price-tabular">
              {formatPrice(selectedVariant?.price || 0)}
            </span>
            {selectedVariant?.mrp > selectedVariant?.price && (
              <span className="text-base text-[#6B574B] line-through price-tabular">
                {formatPrice(selectedVariant.mrp)}
              </span>
            )}
            {discount > 0 && (
              <span className="bg-[#8B1E3F] text-[#FAF5EB] text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                {discount}% OFF
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#6B574B]">
            Inclusive of all taxes • Free express shipping on orders above {POLICY_CONFIG.FREE_SHIPPING_THRESHOLD_LABEL}
          </p>

          {/* Scarcity Indicator */}
          {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 5 && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#D97706] bg-[#FEF9EC] p-2.5 rounded-xl border border-[#C69214]/40">
              <Clock className="w-4 h-4 text-[#C69214]" />
              <span>Artisanal Batch: Only {selectedVariant.stock} left in size {selectedVariant.size_name}!</span>
            </div>
          )}
        </div>

        {/* Size Selection Chips */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#261C17] uppercase tracking-wider">
              {product.segment === "women"
                ? "Select Size (Alpha/Numeric):"
                : product.segment === "teens"
                ? "Select Youth Size:"
                : "Select Age / Size:"}
            </label>
            <SizeGuideModal segment={product.segment as Segment} sizeChart={product.size_chart} />
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {product.product_variants.map((v) => {
              const isSelected = v.id === selectedVariantId;
              const isOutOfStock = v.stock <= 0;
              const label = v.size_name || v.size_age || "Standard";

              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => {
                    setSelectedVariantId(v.id);
                    setQuantity(1);
                  }}
                  className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all text-center flex flex-col items-center justify-center ${
                    isSelected
                      ? "bg-[#8B1E3F] text-[#FAF5EB] border-[#8B1E3F] shadow-md ring-2 ring-[#8B1E3F]/30"
                      : isOutOfStock
                      ? "bg-[#EFE6D5]/60 text-stone-400 border-[#D8C7AE] line-through cursor-not-allowed"
                      : "bg-[#FAF5EB] text-[#261C17] border-[#D8C7AE] hover:border-[#8B1E3F]"
                  }`}
                >
                  <span>{label}</span>
                  {v.stock <= 3 && v.stock > 0 && (
                    <span className={`text-[9px] font-normal ${isSelected ? "text-amber-200" : "text-[#D97706]"}`}>
                      {v.stock} left
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Measurements for Selected Size */}
          {selectedVariant && (selectedVariant.bust_inches || selectedVariant.waist_inches) && (
            <div className="p-3.5 bg-[#FAF5EB] rounded-xl border border-[#D8C7AE] text-xs space-y-1">
              <div className="font-bold text-[#261C17]">
                Stitched Dimensions for Size {selectedVariant.size_name || selectedVariant.size_age}:
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[#6B574B] price-tabular text-[11px]">
                {selectedVariant.bust_inches && (
                  <span>
                    {product.segment === "girls" ? "Chest" : "Bust"}:{" "}
                    <strong className="text-[#261C17]">{selectedVariant.bust_inches}&quot; ({selectedVariant.bust_cm} cm)</strong>
                  </span>
                )}
                {selectedVariant.waist_inches && (
                  <span>
                    Waist:{" "}
                    <strong className="text-[#261C17]">{selectedVariant.waist_inches}&quot; ({selectedVariant.waist_cm} cm)</strong>
                  </span>
                )}
                {selectedVariant.hip_inches && (
                  <span>
                    Hip:{" "}
                    <strong className="text-[#261C17]">{selectedVariant.hip_inches}&quot; ({selectedVariant.hip_cm} cm)</strong>
                  </span>
                )}
                {selectedVariant.length_inches && (
                  <span>
                    Length:{" "}
                    <strong className="text-[#261C17]">{selectedVariant.length_inches}&quot; ({selectedVariant.length_cm} cm)</strong>
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="p-3 rounded-xl bg-[#FEF9EC] border border-[#C69214]/50 flex items-center gap-2 text-xs text-[#3B281E]">
            <Scissors className="w-4 h-4 text-[#C69214] shrink-0" />
            <span><strong>1-Inch Inner Growth Seam Allowance:</strong> Internal seam allowance included for future alterations.</span>
          </div>
        </div>

        {/* Quantity Stepper */}
        <div className="flex items-center justify-between p-3.5 bg-[#FAF5EB] rounded-xl border border-[#D8C7AE]">
          <div>
            <label className="text-xs font-bold text-[#261C17] uppercase tracking-wider block">
              Quantity
            </label>
            {selectedVariant && selectedVariant.stock <= 5 && (
              <span className="text-[10px] text-[#D97706] font-semibold">
                Max {selectedVariant.stock} available
              </span>
            )}
          </div>
          <div className="flex items-center border border-[#D8C7AE] rounded-xl bg-[#EFE6D5] overflow-hidden">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="px-3.5 py-2 text-[#3B281E] hover:bg-[#FAF5EB] disabled:opacity-30 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-4 py-1 text-sm font-bold font-mono text-[#261C17] min-w-[36px] text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(selectedVariant?.stock || 10, q + 1))}
              disabled={quantity >= (selectedVariant?.stock || 10)}
              className="px-3.5 py-2 text-[#3B281E] hover:bg-[#FAF5EB] disabled:opacity-30 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Handwritten Kraft Gift Card Message Box */}
        <div className="p-3.5 bg-[#FAF5EB] rounded-xl border border-[#D8C7AE] space-y-2">
          <button
            type="button"
            onClick={() => setShowGiftBox(!showGiftBox)}
            className="flex items-center justify-between w-full text-xs font-bold text-[#8B1E3F] hover:underline"
          >
            <span className="flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-[#C69214]" /> Include Handwritten Kraft Gift Note (Free)
            </span>
            <span>{showGiftBox ? "▲ Hide" : "▼ Add"}</span>
          </button>
          {showGiftBox && (
            <textarea
              value={giftMessage}
              onChange={(e) => setGiftMessage(e.target.value)}
              placeholder="e.g. Dearest Anya, Wishing you joy, laughter, and sparkles on your special day! With all our love, Dadi & Dadu"
              maxLength={200}
              className="w-full p-2.5 text-xs rounded-lg border border-[#D8C7AE] bg-[#EFE6D5]/60 text-[#261C17] focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]"
              rows={3}
            />
          )}
        </div>

        {/* Add to Bag CTA Button */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            disabled={isPending || selectedVariant?.stock <= 0}
            onClick={handleAddToCart}
            className={`w-full py-4 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all ${
              selectedVariant?.stock <= 0
                ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                : addedSuccess
                ? "bg-[#145349] text-white"
                : "bg-[#8B1E3F] text-[#FAF5EB] hover:bg-[#721531] active:scale-[0.99]"
            }`}
          >
            {addedSuccess ? (
              <>
                <Check className="w-5 h-5" /> Added {quantity > 1 ? `${quantity} items` : ""} to Shopping Bag!
              </>
            ) : selectedVariant?.stock <= 0 ? (
              "Sold Out in This Size"
            ) : (
              <>
                <ShoppingBag className="w-5 h-5" /> Add {quantity > 1 ? `${quantity} ` : ""}to Bag • {formatPrice((selectedVariant?.price || 0) * quantity)}
              </>
            )}
          </button>
        </div>

        {/* Pincode Estimator */}
        <div className="p-4 bg-[#FAF5EB] rounded-xl border border-[#D8C7AE] space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#261C17] uppercase tracking-wider">
            <Truck className="w-4 h-4 text-[#8B1E3F]" />
            <span>Check Estimated Delivery &amp; COD</span>
          </div>
          <form onSubmit={handleCheckPincode} className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="Enter 6-digit Indian PIN code"
              className="flex-1 px-3 py-2 text-xs rounded-lg border border-[#D8C7AE] bg-[#EFE6D5]/50 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F] font-mono text-[#261C17]"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#8B1E3F] text-[#FAF5EB] text-xs font-bold rounded-lg hover:bg-[#721531] transition-colors"
            >
              Verify
            </button>
          </form>
          {pincodeStatus && (
            <p className="text-xs text-[#145349] font-medium pt-1">
              {pincodeStatus}
            </p>
          )}
        </div>

        {/* Fabric & Lining Transparency Card */}
        <div className="p-4 rounded-xl bg-[#FAF5EB] border border-[#D8C7AE] space-y-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-[#261C17] border-b border-[#D8C7AE] pb-2">
            <ShieldCheck className="w-4 h-4 text-[#145349]" />
            <span>Artisanal Craft &amp; Lining Disclosures</span>
          </div>
          <div className="space-y-1.5 text-[#3B281E]">
            <p>
              <strong className="text-[#261C17]">Outer Shell:</strong> {product.fabric}
            </p>
            {product.craft_work && (
              <p>
                <strong className="text-[#261C17]">Handcraft &amp; Weave:</strong> {product.craft_work}
              </p>
            )}
            {product.set_includes && (
              <p>
                <strong className="text-[#261C17]">Ensemble Includes:</strong> {product.set_includes}
              </p>
            )}
            <p className="text-[#145349] font-semibold">
              <strong className="text-[#261C17]">Inner Lining:</strong> {product.lining}
            </p>
            {product.wash_care && (
              <p>
                <strong className="text-[#261C17]">Wash &amp; Care:</strong> {product.wash_care}
              </p>
            )}
            <p>
              <strong className="text-[#261C17]">Care Instructions:</strong> {product.care_instructions}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

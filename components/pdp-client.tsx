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
    name: string;
    slug: string;
    description: string;
    fabric: string;
    lining: string;
    care_instructions: string;
    size_chart?: any;
    categories: { name: string; slug: string };
    product_variants: Array<{
      id: string;
      size_age: string;
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
            size_age: selectedVariant.size_age,
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

          {/* Age and comfort badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            <span className="bg-stone-900/90 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              Ages {selectedVariant?.size_age || "2–14Y"}
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
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-secondary">
            {product.categories?.name}
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-heading mt-1">
            {product.name}
          </h1>
          <p className="text-xs text-text-muted mt-1">SKU: {selectedVariant?.sku}</p>
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
            Inclusive of all taxes • Free shipping on orders above ₹999
          </p>

          {/* Stock Scarcity Indicator */}
          {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 5 && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
              <Clock className="w-3.5 h-3.5 text-brand-secondary" />
              <span>Limited Stock: Only {selectedVariant.stock} left in this size!</span>
            </div>
          )}
        </div>

        {/* Age & Size Selection Chips */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-text-heading uppercase tracking-wider">
              Select Age / Size:
            </label>
            <SizeGuideModal sizeChart={product.size_chart} />
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
                  <span>{v.size_age}</span>
                  {v.stock <= 3 && v.stock > 0 && (
                    <span className={`text-[9px] font-normal ${isSelected ? "text-amber-200" : "text-amber-700"}`}>
                      {v.stock} left
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-brand-secondary font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Includes hidden +2 inch side margins for easy letting out as she grows.
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
                <Check className="w-5 h-5" /> Added to Bag!
              </>
            ) : selectedVariant?.stock <= 0 ? (
              "Out of Stock"
            ) : (
              <>
                <ShoppingBag className="w-5 h-5" /> Add to Bag • {formatPrice(selectedVariant?.price || 0)}
              </>
            )}
          </button>
        </div>

        {/* Fabric & Kid-Comfort Trust Box */}
        <div className="p-4 rounded-2xl bg-canvas border border-border space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-heading flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" /> Child-Comfort & Fabric Transparency
          </h4>

          <div className="space-y-2 text-xs text-text-body">
            <div className="flex items-start gap-2">
              <span className="font-semibold text-text-heading w-24 shrink-0">Inner Lining:</span>
              <span className="text-emerald-800 font-medium">🌿 {product.lining} (Zero Scratch Guarantee)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-text-heading w-24 shrink-0">Outer Fabric:</span>
              <span>{product.fabric}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold text-text-heading w-24 shrink-0">Wash Care:</span>
              <span>{product.care_instructions}</span>
            </div>
          </div>
        </div>

        {/* Pincode Delivery Estimator */}
        <div className="p-4 rounded-2xl bg-surface border border-border space-y-2">
          <label className="text-xs font-bold text-text-heading uppercase tracking-wider flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-brand-secondary" /> Delivery Availability & Pincode
          </label>
          <form onSubmit={handleCheckPincode} className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="Enter 6-digit PIN code (e.g. 560038)"
              className="flex-1 bg-canvas border border-border rounded-xl px-3 py-2 text-xs text-text-heading focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-text-heading text-white text-xs font-semibold rounded-xl hover:bg-stone-800"
            >
              Check
            </button>
          </form>
          {pincodeStatus && (
            <p className="text-xs font-medium text-emerald-700 mt-1">{pincodeStatus}</p>
          )}
        </div>
      </div>
    </div>
  );
}

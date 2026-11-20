"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getWishlist, toggleWishlist, addToCart } from "@/lib/db/actions";
import { formatPrice } from "@/lib/utils";
import {
  Heart,
  ShoppingBag,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  fabric: string;
  lining: string;
  product_images?: { image_url: string; is_primary?: boolean | null }[];
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

interface WishlistItem {
  id: string;
  product_id: string;
  products: WishlistProduct;
}

export default function CustomerWishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    getWishlist()
      .then((data) => {
        if (!isMounted) return;
        setItems((data as unknown as WishlistItem[]) || []);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRemove = async (productId: string) => {
    try {
      await toggleWishlist(productId);
      setItems((prev) => prev.filter((i) => i.product_id !== productId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveToBag = async (item: WishlistItem) => {
    const variant = item.products.product_variants[0];
    if (!variant) return;

    setMovingId(item.id);
    try {
      try {
        const guestCart = JSON.parse(localStorage.getItem("varnam_guest_cart") || "[]");
        const existingIdx = guestCart.findIndex((i: { variant_id?: string }) => i.variant_id === variant.id);
        if (existingIdx >= 0) {
          guestCart[existingIdx].quantity += 1;
        } else {
          guestCart.push({
            variant_id: variant.id,
            product_id: item.products.id,
            product_name: item.products.name,
            product_slug: item.products.slug,
            size_name: variant.size_name || variant.size_age || "Standard",
            size_age: variant.size_age || variant.size_name,
            color_name: variant.color_name,
            price: variant.price,
            mrp: variant.mrp,
            image_url: item.products.product_images?.[0]?.image_url || "",
            quantity: 1,
          });
        }
        localStorage.setItem("varnam_guest_cart", JSON.stringify(guestCart));
      } catch (e) {
        console.error(e);
      }

      await addToCart(variant.id, 1);
      // Remove from wishlist
      await toggleWishlist(item.product_id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));

      // Trigger cart event for header count
      window.dispatchEvent(new Event("varnam_cart_updated"));

      setSuccessMessage(`Moved "${item.products.name}" to your shopping bag!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setMovingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Link
          href="/account"
          className="text-text-muted hover:text-text-heading text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Account Overview
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-text-heading">
              Festive Wishlist ({items.length} Items)
            </h1>
            <p className="text-xs sm:text-sm text-text-muted">
              Saved heirloom ensembles, pattu pavadais, and twirl frocks for your daughters.
            </p>
          </div>
          <Link
            href="/cart"
            className="text-xs font-bold text-brand-primary hover:text-brand-primary-hover flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" /> View Shopping Bag &rarr;
          </Link>
        </div>
      </div>

      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-xs text-text-muted">
          Loading your saved festive wishlists...
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center bg-surface border border-border rounded-2xl space-y-4">
          <Heart className="w-12 h-12 text-text-muted mx-auto stroke-1" />
          <h3 className="font-serif text-lg font-bold text-text-heading">Your Wishlist is Empty</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Discover handcrafted royal anarkalis, festive pattu pavadais, and organic mulmul frocks.
          </p>
          <Link
            href="/collections"
            className="inline-block px-6 py-2.5 bg-brand-primary text-white text-xs font-semibold rounded-xl hover:bg-brand-primary-hover shadow-warm-sm"
          >
            Explore Collections
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item) => {
            const product = item.products;
            const primaryImg =
              product.product_images?.find((i) => i.is_primary)?.image_url ||
              product.product_images?.[0]?.image_url ||
              "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80";

            const primaryVariant = product.product_variants[0];
            const price = primaryVariant?.price || 299900;
            const mrp = primaryVariant?.mrp || 399900;
            const discountPercent =
              mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

            return (
              <div
                key={item.id}
                className="bg-surface border border-border rounded-2xl overflow-hidden shadow-warm-sm hover:shadow-warm-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Image with Heart remove button */}
                  <div className="relative aspect-[3/4] w-full bg-surface-raised overflow-hidden">
                    <Image
                      src={primaryImg}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => handleRemove(item.product_id)}
                      className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 backdrop-blur-sm text-brand-primary hover:bg-white shadow-sm transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <Heart className="w-4 h-4 fill-brand-primary" />
                    </button>

                    {discountPercent > 0 && (
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-primary text-white shadow-sm">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="p-3.5 space-y-2">
                    <Link
                      href={`/products/${product.slug}`}
                      className="font-serif text-sm font-bold text-text-heading hover:text-brand-primary transition-colors line-clamp-1"
                    >
                      {product.name}
                    </Link>

                    <div className="flex items-baseline gap-2 text-xs">
                      <span className="font-bold text-text-heading font-mono text-sm">
                        {formatPrice(price)}
                      </span>
                      {mrp > price && (
                        <span className="text-text-muted line-through font-mono text-[11px]">
                          {formatPrice(mrp)}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-text-muted pt-1">
                      <span className="px-1.5 py-0.5 bg-canvas border border-border rounded">
                        {product.fabric?.split("&")[0]?.trim() || "Handloom"}
                      </span>
                      <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded font-medium flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" /> 100% Cotton Mul
                      </span>
                    </div>
                  </div>
                </div>

                {/* Move to Bag Button */}
                <div className="p-3.5 pt-0">
                  <button
                    type="button"
                    onClick={() => handleMoveToBag(item)}
                    disabled={movingId === item.id}
                    className="w-full py-2 bg-brand-primary text-white text-xs font-semibold rounded-xl hover:bg-brand-primary-hover shadow-warm-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    {movingId === item.id ? "Moving..." : "Move to Bag"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assurance Strip */}
      <div className="p-5 bg-surface border border-border rounded-2xl flex flex-wrap items-center justify-around gap-4 text-xs text-text-muted text-center">
        <div className="flex items-center gap-1.5 font-medium text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Zero-Itch Mulmul Lining</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <Sparkles className="w-4 h-4 text-brand-primary" />
          <span>7-Day Doorstep Fit Exchange</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium text-brand-secondary">
          <span>+2&quot; Growth Margin in Every Choli &amp; Gown</span>
        </div>
      </div>
    </div>
  );
}

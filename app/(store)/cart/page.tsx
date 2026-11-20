"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Truck,
} from "lucide-react";

interface CartDisplayItem {
  variant_id: string;
  product_id?: string;
  product_name: string;
  product_slug: string;
  size_age: string;
  color_name: string;
  price: number;
  mrp: number;
  image_url: string;
  quantity: number;
  stock?: number;
}

export default function CartPage() {
  const [items, setItems] = useState<CartDisplayItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15-minute reservation timer
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // Read cart from local storage
    try {
      const stored = localStorage.getItem("varnam_guest_cart");
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse cart", e);
    }
    setIsLoaded(true);

    // Reservation timer logic
    const timerKey = "varnam_cart_timer_expires";
    let expiresAt = localStorage.getItem(timerKey);
    if (!expiresAt) {
      expiresAt = String(Date.now() + 15 * 60 * 1000);
      localStorage.setItem(timerKey, expiresAt);
    }

    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor((Number(expiresAt) - Date.now()) / 1000)
      );
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const syncCart = (updated: CartDisplayItem[]) => {
    setItems(updated);
    try {
      localStorage.setItem("varnam_guest_cart", JSON.stringify(updated));
      window.dispatchEvent(new Event("varnam_cart_updated"));
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateQuantity = (variantId: string, delta: number) => {
    const updated = items
      .map((item) => {
        if (item.variant_id === variantId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as CartDisplayItem[];

    syncCart(updated);
  };

  const handleRemove = (variantId: string) => {
    const updated = items.filter((item) => item.variant_id !== variantId);
    syncCart(updated);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const subtotalPaise = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const freeShippingThresholdPaise = 99900; // ₹999.00
  const isFreeShipping = subtotalPaise >= freeShippingThresholdPaise;
  const shippingPaise = items.length === 0 ? 0 : isFreeShipping ? 0 : 9900; // ₹99
  const totalPaise = subtotalPaise + shippingPaise;

  const freeShippingDiff = freeShippingThresholdPaise - subtotalPaise;
  const progressPercent = Math.min(
    100,
    Math.round((subtotalPaise / freeShippingThresholdPaise) * 100)
  );

  if (!isLoaded) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-text-muted">
        Loading your shopping bag...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-brand-primary-subtle text-brand-primary rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-bold text-text-heading">
            Your Shopping Bag is Empty
          </h1>
          <p className="text-text-muted text-sm sm:text-base max-w-sm mx-auto">
            Discover our handcrafted zari lehengas, twirl frocks, and festive dresses with child-safe cotton linings.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/collections"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-primary-hover shadow-warm-md transition-all text-sm"
          >
            Explore Collections <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Reservation Countdown Alert */}
      <div className="mb-8 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-2 font-medium">
          <Clock className="w-4 h-4 text-amber-700 animate-spin" />
          <span>
            High Demand: Items in your bag are reserved for you for{" "}
            <span className="font-bold text-amber-950 font-mono">
              {formatTimer(timeLeft)}
            </span>
          </span>
        </div>
        <span className="hidden sm:inline-block text-xs font-semibold uppercase text-amber-800">
          Stock Guaranteed
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Items List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-text-heading">
              Shopping Bag ({items.reduce((acc, i) => acc + i.quantity, 0)})
            </h1>
            <span className="text-xs text-text-muted">
              Prices include GST
            </span>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-semibold text-text-heading flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-brand-primary" />
                {isFreeShipping ? (
                  <span className="text-emerald-700 font-bold">
                    🎉 You have unlocked Free Express Delivery!
                  </span>
                ) : (
                  <span>
                    Add{" "}
                    <strong className="text-brand-primary">
                      {formatPrice(freeShippingDiff)}
                    </strong>{" "}
                    more for Free Delivery
                  </span>
                )}
              </span>
              <span className="text-text-muted font-mono text-xs">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full bg-border-subtle h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand-primary h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Item Cards */}
          <div className="divide-y divide-border border-y border-border">
            {items.map((item) => (
              <div
                key={item.variant_id}
                className="py-5 flex gap-4 sm:gap-6 items-start"
              >
                {/* Image */}
                <div className="relative w-24 h-32 sm:w-28 sm:h-36 rounded-xl overflow-hidden border border-border bg-surface shrink-0">
                  <Image
                    src={item.image_url}
                    alt={item.product_name}
                    fill
                    sizes="112px"
                    className="object-cover object-center"
                  />
                </div>

                {/* Info & Actions */}
                <div className="flex-1 flex flex-col justify-between self-stretch">
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/products/${item.product_slug}`}
                        className="font-serif text-base sm:text-lg font-bold text-text-heading hover:text-brand-primary transition-colors"
                      >
                        {item.product_name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.variant_id)}
                        className="p-1.5 text-text-muted hover:text-red-700 rounded-md transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                      <span className="inline-block px-2 py-0.5 rounded bg-surface border border-border font-medium text-text-heading">
                        Ages: {item.size_age}
                      </span>
                      <span>Color: {item.color_name}</span>
                    </div>

                    <div className="pt-1 flex items-center gap-1.5 text-xs text-emerald-800 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>100% Breathable Cotton Lining</span>
                    </div>
                  </div>

                  {/* Quantity and Price */}
                  <div className="flex items-center justify-between pt-3 mt-auto">
                    {/* Stepper */}
                    <div className="flex items-center border border-border rounded-lg bg-surface overflow-hidden">
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.variant_id, -1)}
                        className="p-2 text-text-body hover:bg-canvas transition-colors disabled:opacity-40"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs sm:text-sm font-semibold font-mono text-text-heading">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.variant_id, 1)}
                        className="p-2 text-text-body hover:bg-canvas transition-colors disabled:opacity-40"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Total for SKU */}
                    <div className="text-right">
                      <div className="font-bold text-sm sm:text-base text-text-heading">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      {item.mrp > item.price && (
                        <div className="text-xs text-text-muted line-through">
                          {formatPrice(item.mrp * item.quantity)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              href="/collections"
              className="text-xs sm:text-sm font-semibold text-brand-primary hover:text-brand-primary-hover flex items-center gap-1.5"
            >
              &larr; Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-warm-sm sticky top-28">
          <h2 className="font-serif text-xl font-bold text-text-heading border-b border-border pb-4">
            Order Summary
          </h2>

          <div className="space-y-3 text-sm text-text-body">
            <div className="flex justify-between">
              <span className="text-text-muted">Subtotal</span>
              <span className="font-semibold text-text-heading">
                {formatPrice(subtotalPaise)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="text-text-muted">Express Delivery</span>
                {isFreeShipping && (
                  <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                    Free
                  </span>
                )}
              </div>
              <span className="font-semibold text-text-heading">
                {isFreeShipping ? "FREE" : formatPrice(shippingPaise)}
              </span>
            </div>

            <div className="flex justify-between text-xs text-text-muted">
              <span>Estimated Taxes & Packaging</span>
              <span>Included</span>
            </div>

            <div className="border-t border-border pt-4 flex justify-between items-baseline text-base sm:text-lg font-bold text-text-heading">
              <span>Total Amount</span>
              <span className="text-xl sm:text-2xl text-brand-primary font-serif">
                {formatPrice(totalPaise)}
              </span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="w-full py-4 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-primary-hover shadow-warm-md hover:shadow-warm-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base group"
          >
            Proceed to Checkout
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Micro assurances */}
          <div className="space-y-2.5 pt-4 border-t border-border text-xs text-text-muted">
            <div className="flex items-center gap-2 font-medium text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Certified Child-Safe Fabrics & Stitching</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-secondary shrink-0" />
              <span>Fast 3–4 Day Delivery via Express Couriers</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-primary shrink-0" />
              <span>Cash on Delivery & Instant UPI Available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

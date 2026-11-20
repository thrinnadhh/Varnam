"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { POLICY_CONFIG } from "@/lib/constants";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Truck,
  Gift,
  Scissors,
} from "lucide-react";

interface CartDisplayItem {
  variant_id: string;
  product_id?: string;
  product_name: string;
  product_slug: string;
  size_name?: string;
  size_age?: string;
  color_name: string;
  price: number;
  mrp: number;
  image_url: string;
  quantity: number;
  gift_message?: string;
}

export default function CartPage() {
  const [items, setItems] = useState<CartDisplayItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [globalGiftMessage, setGlobalGiftMessage] = useState("");
  const [includeGiftBox, setIncludeGiftBox] = useState(false);

  useEffect(() => {
    let isMounted = true;
    queueMicrotask(() => {
      if (!isMounted) return;
      try {
        const stored = localStorage.getItem("varnam_guest_cart");
        if (stored) {
          setItems(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
      setIsLoaded(true);
    });

    const handleCartUpdate = () => {
      try {
        const stored = localStorage.getItem("varnam_guest_cart");
        if (stored) setItems(JSON.parse(stored));
      } catch {}
    };

    window.addEventListener("varnam_cart_updated", handleCartUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener("varnam_cart_updated", handleCartUpdate);
    };
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

  const handleRemoveItem = (variantId: string) => {
    const updated = items.filter((item) => item.variant_id !== variantId);
    syncCart(updated);
  };

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const threshold = POLICY_CONFIG.FREE_SHIPPING_THRESHOLD_PAISE;
  const isFreeShipping = subtotal >= threshold;
  const amountToFreeShipping = Math.max(0, threshold - subtotal);
  const shippingFee = isFreeShipping ? 0 : POLICY_CONFIG.STANDARD_SHIPPING_FEE_PAISE;
  const total = subtotal + shippingFee;

  if (!isLoaded) {
    return (
      <div className="py-20 text-center text-[#6B574B]">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#8B1E3F]" />
        <p className="mt-3 text-xs font-semibold">Loading your festive shopping bag...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="rounded-2xl bg-[#FAF5EB] border border-[#D8C7AE] p-6 shadow-[0_8px_24px_-6px_rgba(59,40,30,0.12)]">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-[#8B1E3F] text-[#FAF5EB]">
            <ShoppingBag className="w-5 h-5 text-[#C69214]" />
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#261C17]">
            Shopping Bag
          </h1>
        </div>
        <p className="text-xs text-[#6B574B] mt-1.5">
          Review your handcrafted couture, alterations margin, and complimentary gift packaging.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl bg-[#FAF5EB] border border-[#D8C7AE] p-12 text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#EFE6D5] flex items-center justify-center mx-auto text-[#8B1E3F]">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#261C17]">
              Your Shopping Bag is Empty
            </h2>
            <p className="text-xs text-[#6B574B] max-w-md mx-auto mt-1">
              Explore our celebratory collection of handloom zari pavadais, flared anarkalis, and pure cotton twirl frocks.
            </p>
          </div>
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#8B1E3F] text-[#FAF5EB] text-xs font-bold hover:bg-[#721531] shadow-md transition-all"
          >
            <span>Explore Collections</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {/* Free Shipping Progress Indicator */}
            <div className="p-4 rounded-xl bg-[#FAF5EB] border border-[#D8C7AE] shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-[#261C17]">
                  <Truck className="w-4 h-4 text-[#145349]" />
                  {isFreeShipping ? (
                    <span className="text-[#145349]">Congratulations! You unlocked Free Shipping across India!</span>
                  ) : (
                    <span>Add {formatPrice(amountToFreeShipping)} more to qualify for Free Shipping</span>
                  )}
                </span>
                <span className="text-[#8B1E3F]">{isFreeShipping ? "FREE" : formatPrice(POLICY_CONFIG.STANDARD_SHIPPING_FEE_PAISE)}</span>
              </div>
              <div className="w-full bg-[#EFE6D5] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#145349] h-full transition-all duration-500 rounded-full"
                  style={{
                    width: `${Math.min(100, (subtotal / threshold) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.variant_id}
                  className="flex gap-4 p-4 rounded-2xl bg-[#FAF5EB] border border-[#D8C7AE] shadow-[0_8px_24px_-6px_rgba(59,40,30,0.12)]"
                >
                  <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden border border-[#D8C7AE] bg-[#EFE6D5] shrink-0">
                    <Image
                      src={item.image_url}
                      alt={item.product_name}
                      fill
                      className="object-cover object-center"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${item.product_slug}`}
                          className="font-serif font-bold text-sm sm:text-base text-[#261C17] hover:text-[#8B1E3F] transition-colors line-clamp-1"
                        >
                          {item.product_name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.variant_id)}
                          className="text-[#6B574B] hover:text-[#8B1E3F] p-1 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#6B574B]">
                        <span className="px-2 py-0.5 rounded bg-[#EFE6D5] font-semibold text-[#261C17]">
                          Size: {item.size_name || item.size_age || "Standard"}
                        </span>
                        <span>•</span>
                        <span>Color: {item.color_name}</span>
                        <span>•</span>
                        <span className="text-[#145349] font-medium flex items-center gap-1">
                          <Scissors className="w-3 h-3 text-[#C69214]" /> +1&quot; Growth Margin
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#D8C7AE]/50">
                      <div className="flex items-center border border-[#D8C7AE] rounded-lg bg-[#EFE6D5] shadow-xs">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.variant_id, -1)}
                          disabled={item.quantity <= 1}
                          className="p-1.5 text-[#3B281E] hover:bg-[#FAF5EB] disabled:opacity-30 rounded-l-lg transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val > 0) {
                              const diff = Math.min(50, val) - item.quantity;
                              if (diff !== 0) handleUpdateQuantity(item.variant_id, diff);
                            }
                          }}
                          className="w-9 text-center text-xs font-bold font-mono bg-transparent text-[#261C17] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          aria-label="Item quantity in bag"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.variant_id, 1)}
                          disabled={item.quantity >= 50}
                          className="p-1.5 text-[#3B281E] hover:bg-[#FAF5EB] disabled:opacity-30 rounded-r-lg transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="font-sans font-bold text-sm sm:text-base text-[#261C17] price-tabular">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Complimentary Handwritten Kraft Gift Card Option */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF5EB] border border-[#D8C7AE] shadow-sm space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeGiftBox}
                  onChange={(e) => setIncludeGiftBox(e.target.checked)}
                  className="rounded border-[#D8C7AE] text-[#8B1E3F] focus:ring-[#8B1E3F] w-4 h-4"
                />
                <span className="font-serif font-bold text-sm text-[#261C17] flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-[#C69214]" /> Include Complimentary Handwritten Kraft Gift Card
                </span>
              </label>

              {includeGiftBox && (
                <div className="pt-2 animate-in fade-in duration-200">
                  <textarea
                    value={globalGiftMessage}
                    onChange={(e) => setGlobalGiftMessage(e.target.value)}
                    placeholder="Compose your personalized festive note. Our team will handwrite this in gold ink onto unbleached cardstock..."
                    maxLength={250}
                    className="w-full p-3 text-xs rounded-xl border border-[#D8C7AE] bg-[#EFE6D5]/60 text-[#261C17] focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]"
                    rows={3}
                  />
                  <p className="text-[10px] text-[#6B574B] mt-1 text-right">
                    {250 - globalGiftMessage.length} characters remaining
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 sm:p-6 rounded-2xl bg-[#FAF5EB] border border-[#D8C7AE] shadow-[0_8px_24px_-6px_rgba(59,40,30,0.12)] space-y-4">
              <h2 className="font-serif text-lg font-bold text-[#261C17] border-b border-[#D8C7AE] pb-3">
                Order Summary
              </h2>

              <div className="space-y-2.5 text-xs text-[#3B281E]">
                <div className="flex justify-between">
                  <span>Bag Subtotal ({items.length} designs)</span>
                  <span className="font-bold price-tabular">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-bold price-tabular">
                    {isFreeShipping ? (
                      <span className="text-[#145349]">FREE</span>
                    ) : (
                      formatPrice(shippingFee)
                    )}
                  </span>
                </div>
                {includeGiftBox && (
                  <div className="flex justify-between text-[#8B1E3F]">
                    <span>Handwritten Kraft Card</span>
                    <span className="font-bold">FREE</span>
                  </div>
                )}
                <div className="pt-3 border-t border-[#D8C7AE] flex justify-between text-base font-bold text-[#261C17]">
                  <span>Total Payable</span>
                  <span className="price-tabular text-[#8B1E3F]">{formatPrice(total)}</span>
                </div>
                <p className="text-[10px] text-[#6B574B]">Inclusive of all GST &amp; Handcraft Levies</p>
              </div>

              <Link
                href="/checkout"
                className="w-full py-3.5 rounded-xl bg-[#8B1E3F] text-[#FAF5EB] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-[#721531] shadow-md hover:shadow-lg transition-all"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="pt-2 border-t border-[#D8C7AE]/60 space-y-2 text-[11px] text-[#6B574B]">
                <div className="flex items-center gap-1.5 text-[#145349] font-semibold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Doorstep 7-Day Size Exchange Across India</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#C69214] shrink-0" />
                  <span>Cash on Delivery (COD) &amp; UPI Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

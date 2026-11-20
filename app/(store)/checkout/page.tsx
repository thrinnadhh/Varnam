"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { formatPrice } from "@/lib/utils";
import {
  getAddresses,
  saveAddress,
  createOrderAction,
  createCashfreeSessionAction,
} from "@/lib/db/actions";
import { createBrowserSupabaseClient } from "@/lib/db/client";
import { POLICY_CONFIG } from "@/lib/constants";
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Lock,
  AlertCircle,
} from "lucide-react";

interface SavedAddress {
  id: string;
  name: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default?: boolean;
}

interface CheckoutCartItem {
  variant_id: string;
  product_name: string;
  product_slug: string;
  size_age: string;
  color_name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Auth Form State (for guests who need to sign in / create account)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthPending, setIsAuthPending] = useState(false);

  // Cart & Order State
  const [cartItems, setCartItems] = useState<CheckoutCartItem[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");

  // Address Form State
  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    is_default: true,
  });

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<"cashfree" | "cod">("cashfree");
  const [orderError, setOrderError] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Load auth state and cart
  useEffect(() => {
    async function init() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
          const addrs = await getAddresses();
          setSavedAddresses(addrs as SavedAddress[]);
          if (addrs.length > 0) {
            setSelectedAddressId(addrs[0].id);
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setIsLoadingAuth(false);
      }

      try {
        const storedCart = JSON.parse(localStorage.getItem("varnam_guest_cart") || "[]");
        setCartItems(storedCart);
      } catch {
        setCartItems([]);
      }
    }

    init();
  }, [supabase]);

  // Handle Authentication for guest
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthPending(true);

    try {
      if (authMode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: {
            data: { full_name: authName },
          },
        });
        if (error) throw error;
        setUser(data.user);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        setUser(data.user);
      }

      // Refresh addresses
      const addrs = await getAddresses();
      setSavedAddresses(addrs);
      if (addrs.length > 0) {
        setSelectedAddressId(addrs[0].id);
      }
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Authentication failed. Please try again.");
    } finally {
      setIsAuthPending(false);
    }
  };

  // Calculations
  const subtotalPaise = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const isFreeShipping = subtotalPaise >= POLICY_CONFIG.FREE_SHIPPING_THRESHOLD_PAISE;
  const shippingPaise = cartItems.length === 0 ? 0 : isFreeShipping ? 0 : POLICY_CONFIG.STANDARD_SHIPPING_FEE_PAISE;
  const totalPaise = subtotalPaise + shippingPaise;

  const handlePlaceOrder = async () => {
    setOrderError(null);

    if (cartItems.length === 0) {
      setOrderError("Your cart is empty.");
      return;
    }

    // Determine shipping address
    let finalAddress: SavedAddress | typeof addressForm | null = null;
    if (selectedAddressId !== "new") {
      finalAddress = savedAddresses.find((a) => a.id === selectedAddressId) || null;
    } else {
      // Validate address form
      if (
        !addressForm.name ||
        !addressForm.phone ||
        !addressForm.address_line1 ||
        !addressForm.city ||
        !addressForm.state ||
        !addressForm.postal_code
      ) {
        setOrderError("Please complete all required shipping address fields.");
        return;
      }
      finalAddress = addressForm;
    }

    if (!finalAddress) {
      setOrderError("Please select or provide a valid shipping address.");
      return;
    }

    setIsPlacingOrder(true);

    try {
      // Save address if new
      if (selectedAddressId === "new") {
        await saveAddress(finalAddress as Parameters<typeof saveAddress>[0]);
      }

      const checkoutPayload = {
        items: cartItems.map((item) => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
        })),
        shipping_address: {
          ...finalAddress,
          country: finalAddress.country || "India",
          is_default: finalAddress.is_default ?? false,
        },
        payment_method: paymentMethod,
      };

      const result = await createOrderAction(checkoutPayload);

      if (!result.success || !result.order) {
        setOrderError(result.error || "Failed to create order. Please try again.");
        setIsPlacingOrder(false);
        return;
      }

      // Order created successfully! Clear guest cart
      try {
        localStorage.removeItem("varnam_guest_cart");
        window.dispatchEvent(new Event("varnam_cart_updated"));
      } catch (e) {
        console.error(e);
      }

      if (paymentMethod === "cod") {
        router.push(`/orders/${result.order.order_number}`);
        return;
      }

      // CashFree Flow
      const sessionResult = await createCashfreeSessionAction(result.order.order_id);
      if (sessionResult.success) {
        // In local/sandbox simulation or production:
        router.push(`/orders/${result.order.order_number}?session_id=${sessionResult.payment_session_id}`);
      } else {
        setOrderError(sessionResult.error || "Payment gateway connection error.");
        setIsPlacingOrder(false);
      }
    } catch (err: unknown) {
      setOrderError(err instanceof Error ? err.message : "An unexpected error occurred.");
      setIsPlacingOrder(false);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-text-muted">
        Preparing secure checkout...
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-serif text-2xl font-bold text-text-heading">
          Your Bag is Empty
        </h1>
        <p className="text-text-muted text-sm">
          Please select your favorite handcrafted dresses before checking out.
        </p>
        <Link
          href="/collections"
          className="inline-block px-6 py-3 bg-brand-primary text-white font-semibold rounded-xl text-sm"
        >
          Browse Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-text-heading">
          Secure Checkout
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-emerald-700" />
          <span>256-bit Encrypted SSL & Safe Child Apparel Guarantee</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Checkout Stages */}
        <div className="lg:col-span-7 space-y-8">
          {/* STEP 1: Identification / Account */}
          <div className="p-6 bg-surface border border-border rounded-2xl shadow-warm-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-primary text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="font-serif text-lg font-bold text-text-heading">
                  Customer Information
                </h2>
              </div>
              {user && (
                <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Verified
                </span>
              )}
            </div>

            {user ? (
              <div className="text-sm space-y-1">
                <p className="font-medium text-text-heading">
                  Signed in as: <span className="font-bold">{user.email}</span>
                </p>
                <p className="text-xs text-text-muted">
                  Order notifications and tracking links will be sent to this email.
                </p>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <p className="text-xs text-text-muted">
                  Log in or create a quick account so you can track your daughter&apos;s order in real-time.
                </p>

                {authError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-3">
                  {authMode === "signup" && (
                    <div>
                      <label className="block text-xs font-semibold text-text-heading mb-1">
                        Parent Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="e.g. Ananya Sharma"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-text-heading mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="parent@example.com"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-text-heading mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="submit"
                      disabled={isAuthPending}
                      className="px-5 py-2.5 bg-brand-primary text-white rounded-lg text-xs font-semibold hover:bg-brand-primary-hover transition-colors disabled:opacity-50"
                    >
                      {isAuthPending
                        ? "Verifying..."
                        : authMode === "signup"
                        ? "Continue to Shipping"
                        : "Sign In"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setAuthMode(authMode === "signup" ? "signin" : "signup")
                      }
                      className="text-xs font-semibold text-brand-primary hover:underline"
                    >
                      {authMode === "signup"
                        ? "Already have an account? Sign In"
                        : "New parent? Create Account"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* STEP 2: Shipping Delivery Address */}
          <div className="p-6 bg-surface border border-border rounded-2xl shadow-warm-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <span className="w-6 h-6 rounded-full bg-brand-primary text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="font-serif text-lg font-bold text-text-heading">
                Delivery Address
              </h2>
            </div>

            {/* Saved Addresses list if any */}
            {savedAddresses.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Select a Saved Address
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedAddresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between text-xs space-y-1 ${
                        selectedAddressId === addr.id
                          ? "border-brand-primary bg-brand-primary-subtle/40"
                          : "border-border hover:border-border-subtle"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-text-heading">
                          {addr.name}
                        </span>
                        <input
                          type="radio"
                          name="addressSelection"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="accent-brand-primary"
                        />
                      </div>
                      <p className="text-text-body line-clamp-2">
                        {addr.address_line1}, {addr.city}, {addr.state} - {addr.postal_code}
                      </p>
                      <p className="text-text-muted font-mono">📱 {addr.phone}</p>
                    </label>
                  ))}

                  <label
                    className={`p-3.5 rounded-xl border-2 border-dashed cursor-pointer transition-all flex items-center justify-center text-xs font-semibold ${
                      selectedAddressId === "new"
                        ? "border-brand-primary bg-brand-primary-subtle/30 text-brand-primary"
                        : "border-border text-text-muted hover:text-text-heading"
                    }`}
                  >
                    <input
                      type="radio"
                      name="addressSelection"
                      checked={selectedAddressId === "new"}
                      onChange={() => setSelectedAddressId("new")}
                      className="sr-only"
                    />
                    <span>+ Add New Address</span>
                  </label>
                </div>
              </div>
            )}

            {/* Address Form if 'new' selected or no saved addresses */}
            {(selectedAddressId === "new" || savedAddresses.length === 0) && (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-text-heading mb-1">
                      Recipient Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.name}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, name: e.target.value })
                      }
                      placeholder="e.g. Radhika V."
                      className="w-full px-3 py-2 rounded-lg border border-border bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-heading mb-1">
                      10-Digit Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={addressForm.phone}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                        })
                      }
                      placeholder="9876543210"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-canvas text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-heading mb-1">
                    Flat / House No., Apartment, Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.address_line1}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        address_line1: e.target.value,
                      })
                    }
                    placeholder="e.g. 402, Lotus Towers, 14th Cross"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-text-heading mb-1">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={addressForm.postal_code}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          postal_code: e.target.value.replace(/\D/g, ""),
                        })
                      }
                      placeholder="560034"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-canvas text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-heading mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.city}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, city: e.target.value })
                      }
                      placeholder="Bengaluru"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-heading mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.state}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, state: e.target.value })
                      }
                      placeholder="Karnataka"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: Payment Method */}
          <div className="p-6 bg-surface border border-border rounded-2xl shadow-warm-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <span className="w-6 h-6 rounded-full bg-brand-primary text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h2 className="font-serif text-lg font-bold text-text-heading">
                Payment Method
              </h2>
            </div>

            <div className="space-y-3">
              {/* Option A: CashFree (UPI, Cards, NetBanking) */}
              <label
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                  paymentMethod === "cashfree"
                    ? "border-brand-primary bg-brand-primary-subtle/30"
                    : "border-border hover:border-border-subtle"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cashfree"
                  checked={paymentMethod === "cashfree"}
                  onChange={() => setPaymentMethod("cashfree")}
                  className="mt-1 accent-brand-primary"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-text-heading">
                      Cashfree Secure Payments (UPI, Cards, NetBanking)
                    </span>
                    <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                      Fastest
                    </span>
                  </div>
                  <p className="text-xs text-text-muted">
                    Pay securely via Google Pay, PhonePe, Paytm, Any UPI QR, Debit/Credit Cards, or NetBanking.
                  </p>
                </div>
              </label>

              {/* Option B: Cash on Delivery (COD) */}
              <label
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-4 ${
                  paymentMethod === "cod"
                    ? "border-brand-primary bg-brand-primary-subtle/30"
                    : "border-border hover:border-border-subtle"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="mt-1 accent-brand-primary"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-text-heading">
                      Cash on Delivery (COD)
                    </span>
                  </div>
                  <p className="text-xs text-text-muted">
                    Pay in cash or through delivery-agent UPI scanner upon doorstep delivery.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Place Order Button */}
        <div className="lg:col-span-5 bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-warm-sm sticky top-28">
          <h2 className="font-serif text-xl font-bold text-text-heading border-b border-border pb-4">
            Items in Order ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
          </h2>

          <div className="divide-y divide-border max-h-72 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item.variant_id} className="py-3 flex gap-3 text-xs">
                <div className="relative w-14 h-18 rounded-lg overflow-hidden border border-border bg-canvas shrink-0">
                  <Image
                    src={item.image_url || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80"}
                    alt={item.product_name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="font-bold text-text-heading line-clamp-1">
                    {item.product_name}
                  </p>
                  <p className="text-text-muted">
                    Ages: {item.size_age} • Qty: {item.quantity}
                  </p>
                  <p className="font-semibold text-text-heading">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-text-muted">
              <span>Subtotal</span>
              <span className="font-medium text-text-heading">
                {formatPrice(subtotalPaise)}
              </span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>Express Delivery</span>
              <span className="font-medium text-text-heading">
                {isFreeShipping ? "FREE" : formatPrice(shippingPaise)}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-text-heading pt-2 border-t border-border">
              <span>Total Payable</span>
              <span className="text-xl text-brand-primary font-serif">
                {formatPrice(totalPaise)}
              </span>
            </div>
          </div>

          {orderError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{orderError}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder || !user}
            className="w-full py-4 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-primary-hover shadow-warm-md hover:shadow-warm-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50"
          >
            {isPlacingOrder ? (
              <span>Confirming Reservation...</span>
            ) : !user ? (
              <span>Please Sign In Above to Complete Order</span>
            ) : paymentMethod === "cashfree" ? (
              <span>Pay {formatPrice(totalPaise)} Securely</span>
            ) : (
              <span>Place Cash on Delivery Order</span>
            )}
          </button>

          <div className="space-y-2 pt-2 text-xs text-text-muted">
            <div className="flex items-center gap-1.5 font-medium text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>{POLICY_CONFIG.EXCHANGE_RETURN_WINDOW}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-brand-secondary" />
              <span>Dispatches within {POLICY_CONFIG.DISPATCH_TIMELINE}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

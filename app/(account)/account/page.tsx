"use client";

import { useState, useEffect, useTransition, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/db/client";
import {
  getUserOrders,
  getAddresses,
  getWishlist,
  saveAddress,
  addToCart,
  toggleWishlist,
} from "@/lib/db/actions";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  User,
  Package,
  MapPin,
  Heart,
  LogOut,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  Plus,
  AlertCircle,
} from "lucide-react";

function AccountContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "orders";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [user, setUser] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Auth form states (for unauthenticated parents)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthPending, setIsAuthPending] = useState(false);

  // Tab Data States
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // New Address Modal / Form State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    is_default: false,
  });

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function checkUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
          loadUserData();
        }
      } catch (err) {
        console.error("Auth check error:", err);
      } finally {
        setIsLoadingAuth(false);
      }
    }
    checkUser();
  }, [supabase]);

  const loadUserData = async () => {
    setIsDataLoading(true);
    try {
      const [userOrders, userAddresses, userWishlist] = await Promise.all([
        getUserOrders(),
        getAddresses(),
        getWishlist(),
      ]);
      setOrders(userOrders);
      setAddresses(userAddresses);
      setWishlist(userWishlist);
    } catch (err) {
      console.error("Error loading account data:", err);
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthPending(true);

    try {
      if (authMode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        setUser(data.user);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setUser(data.user);
      }
      loadUserData();
    } catch (err: any) {
      setAuthError(err.message || "Failed to authenticate.");
    } finally {
      setIsAuthPending(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setOrders([]);
    setAddresses([]);
    setWishlist([]);
  };

  const handleSaveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveAddress(newAddr);
      if (res.success) {
        setIsAddingAddress(false);
        const updated = await getAddresses();
        setAddresses(updated);
        setNewAddr({
          name: "",
          phone: "",
          address_line1: "",
          address_line2: "",
          city: "",
          state: "",
          postal_code: "",
          country: "India",
          is_default: false,
        });
      } else {
        alert(res.error || "Failed to save address");
      }
    });
  };

  const handleMoveToCart = async (item: any) => {
    const variant = item.products.product_variants[0];
    if (!variant) return;

    startTransition(async () => {
      // Add to local guest cart too for immediate sync
      try {
        const local = JSON.parse(localStorage.getItem("varnam_guest_cart") || "[]");
        local.push({
          variant_id: variant.id,
          product_id: item.products.id,
          product_name: item.products.name,
          product_slug: item.products.slug,
          size_age: variant.size_age,
          color_name: "Original",
          price: variant.price,
          mrp: variant.mrp || variant.price,
          image_url:
            item.products.product_images?.[0]?.image_url ||
            "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=600&q=80",
          quantity: 1,
        });
        localStorage.setItem("varnam_guest_cart", JSON.stringify(local));
        window.dispatchEvent(new Event("varnam_cart_updated"));
      } catch (e) {
        console.error(e);
      }

      await addToCart(variant.id, 1);
      await toggleWishlist(item.product_id);
      const updatedWishlist = await getWishlist();
      setWishlist(updatedWishlist);
    });
  };

  if (isLoadingAuth) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-text-muted">
        Loading parent account portal...
      </div>
    );
  }

  // Not logged in: Show elegant parent login/signup
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
        <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-warm-sm">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-brand-primary-subtle text-brand-primary rounded-full flex items-center justify-center mx-auto">
              <User className="w-6 h-6" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-text-heading">
              {authMode === "signin" ? "Parent Portal Sign In" : "Create Parent Account"}
            </h1>
            <p className="text-xs text-text-muted">
              Access your orders, track shipments in real time, and manage saved sizes.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === "signup" && (
              <div>
                <label className="block text-xs font-semibold text-text-heading mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Radhika Verma"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-text-heading mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg border border-border bg-canvas text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <button
              type="submit"
              disabled={isAuthPending}
              className="w-full py-3 bg-brand-primary text-white font-semibold rounded-xl text-sm hover:bg-brand-primary-hover transition-colors disabled:opacity-50"
            >
              {isAuthPending
                ? "Processing..."
                : authMode === "signin"
                ? "Sign In to Account"
                : "Create Account"}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() =>
                setAuthMode(authMode === "signin" ? "signup" : "signin")
              }
              className="text-xs font-semibold text-brand-primary hover:underline"
            >
              {authMode === "signin"
                ? "First time shopping for your daughter? Create an account"
                : "Already registered? Sign in"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Account Header */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-warm-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-brand-primary-subtle text-brand-primary font-bold font-serif text-xl flex items-center justify-center border border-brand-primary-border">
            {user.email?.[0].toUpperCase()}
          </div>
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-text-heading">
              {user.user_metadata?.full_name || "Parent Account"}
            </h1>
            <p className="text-xs sm:text-sm text-text-muted">{user.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="px-4 py-2 text-xs font-semibold text-text-muted hover:text-red-700 border border-border hover:border-red-200 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="md:col-span-3 bg-surface border border-border rounded-2xl p-3 space-y-1 shadow-warm-sm">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "orders"
                ? "bg-brand-primary text-white"
                : "text-text-body hover:bg-canvas"
            }`}
          >
            <span className="flex items-center gap-2">
              <Package className="w-4 h-4" /> My Orders
            </span>
            <span className="font-mono text-xs">{orders.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("addresses")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "addresses"
                ? "bg-brand-primary text-white"
                : "text-text-body hover:bg-canvas"
            }`}
          >
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Saved Addresses
            </span>
            <span className="font-mono text-xs">{addresses.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("wishlist")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "wishlist"
                ? "bg-brand-primary text-white"
                : "text-text-body hover:bg-canvas"
            }`}
          >
            <span className="flex items-center gap-2">
              <Heart className="w-4 h-4" /> Favourites
            </span>
            <span className="font-mono text-xs">{wishlist.length}</span>
          </button>
        </div>

        {/* Content Pane */}
        <div className="md:col-span-9 space-y-6">
          {/* TAB: ORDERS */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <h2 className="font-serif text-xl font-bold text-text-heading">
                Order History & Live Tracking
              </h2>

              {orders.length === 0 ? (
                <div className="p-8 bg-surface border border-border rounded-2xl text-center space-y-3">
                  <Package className="w-10 h-10 text-text-muted mx-auto" />
                  <p className="text-text-muted text-sm">You haven't placed any orders yet.</p>
                  <Link
                    href="/collections"
                    className="inline-block px-5 py-2.5 bg-brand-primary text-white text-xs font-semibold rounded-xl"
                  >
                    Browse Collections
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-5 sm:p-6 bg-surface border border-border rounded-2xl shadow-warm-sm space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 text-xs">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-text-heading text-sm">
                            {ord.order_number}
                          </span>
                          <p className="text-text-muted">
                            Placed on {formatDate(ord.created_at)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              ord.status === "delivered"
                                ? "bg-emerald-100 text-emerald-800"
                                : ord.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-brand-secondary-subtle text-brand-secondary"
                            }`}
                          >
                            {ord.status}
                          </span>
                          <Link
                            href={`/orders/${ord.order_number}`}
                            className="text-brand-primary font-semibold hover:underline flex items-center gap-1"
                          >
                            Details &rarr;
                          </Link>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="divide-y divide-border text-xs">
                        {ord.order_items.map((it: any) => (
                          <div
                            key={it.id}
                            className="py-2.5 flex justify-between items-center"
                          >
                            <div>
                              <p className="font-semibold text-text-heading">
                                {it.product_name}
                              </p>
                              <p className="text-text-muted">
                                Age: {it.size_age} • Qty: {it.quantity}
                              </p>
                            </div>
                            <span className="font-bold text-text-heading">
                              {formatPrice(it.price * it.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-border text-xs sm:text-sm">
                        <span className="text-text-muted">Total Paid</span>
                        <span className="font-serif font-bold text-base text-brand-primary">
                          {formatPrice(ord.total_amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: ADDRESSES */}
          {activeTab === "addresses" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-bold text-text-heading">
                  Saved Delivery Addresses
                </h2>
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(!isAddingAddress)}
                  className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-semibold hover:bg-brand-primary-hover transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isAddingAddress ? "Cancel" : "Add Address"}
                </button>
              </div>

              {/* Add Address Form */}
              {isAddingAddress && (
                <form
                  onSubmit={handleSaveNewAddress}
                  className="p-5 bg-surface border border-brand-primary-border rounded-2xl space-y-3"
                >
                  <h3 className="text-sm font-bold text-text-heading">
                    Add New Delivery Address
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={newAddr.name}
                        onChange={(e) =>
                          setNewAddr({ ...newAddr, name: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-border bg-canvas"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">
                        10-Digit Mobile Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={newAddr.phone}
                        onChange={(e) =>
                          setNewAddr({
                            ...newAddr,
                            phone: e.target.value.replace(/\D/g, ""),
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-border bg-canvas font-mono"
                      />
                    </div>
                  </div>

                  <div className="text-xs">
                    <label className="block font-semibold mb-1">
                      Street Address / House No. *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddr.address_line1}
                      onChange={(e) =>
                        setNewAddr({ ...newAddr, address_line1: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border border-border bg-canvas"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold mb-1">PIN Code *</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={newAddr.postal_code}
                        onChange={(e) =>
                          setNewAddr({
                            ...newAddr,
                            postal_code: e.target.value.replace(/\D/g, ""),
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-border bg-canvas font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={newAddr.city}
                        onChange={(e) =>
                          setNewAddr({ ...newAddr, city: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-border bg-canvas"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">State *</label>
                      <input
                        type="text"
                        required
                        value={newAddr.state}
                        onChange={(e) =>
                          setNewAddr({ ...newAddr, state: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-border bg-canvas"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2.5 bg-brand-primary text-white rounded-lg text-xs font-semibold hover:bg-brand-primary-hover"
                  >
                    Save Address
                  </button>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-5 bg-surface border border-border rounded-2xl shadow-warm-sm space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-text-heading">
                        {addr.name}
                      </span>
                      {addr.is_default && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-text-body">
                      {addr.address_line1}, {addr.city}, {addr.state} - {addr.postal_code}
                    </p>
                    <p className="text-text-muted font-mono pt-1">📱 {addr.phone}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: WISHLIST */}
          {activeTab === "wishlist" && (
            <div className="space-y-4">
              <h2 className="font-serif text-xl font-bold text-text-heading">
                Saved Favourites ({wishlist.length})
              </h2>

              {wishlist.length === 0 ? (
                <div className="p-8 bg-surface border border-border rounded-2xl text-center space-y-3">
                  <Heart className="w-10 h-10 text-text-muted mx-auto" />
                  <p className="text-text-muted text-sm">
                    You haven't saved any favorite dresses yet.
                  </p>
                  <Link
                    href="/collections"
                    className="inline-block px-5 py-2.5 bg-brand-primary text-white text-xs font-semibold rounded-xl"
                  >
                    Explore Dresses
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wishlist.map((item) => {
                    const prod = item.products;
                    const primaryImg =
                      prod.product_images?.[0]?.image_url ||
                      "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=600&q=80";
                    const minPrice = prod.product_variants?.[0]?.price || 0;

                    return (
                      <div
                        key={item.id}
                        className="bg-surface border border-border rounded-2xl overflow-hidden shadow-warm-sm flex flex-col justify-between"
                      >
                        <div className="relative aspect-[3/4] w-full">
                          <Image
                            src={primaryImg}
                            alt={prod.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-4 space-y-2">
                          <h3 className="font-serif font-bold text-sm text-text-heading line-clamp-1">
                            {prod.name}
                          </h3>
                          <p className="text-xs text-brand-primary font-bold">
                            {formatPrice(minPrice)}
                          </p>
                          <p className="text-[11px] text-emerald-800 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-700" />
                            <span>{prod.lining}</span>
                          </p>
                          <button
                            type="button"
                            onClick={() => handleMoveToCart(item)}
                            className="w-full py-2 bg-brand-primary text-white rounded-lg text-xs font-semibold hover:bg-brand-primary-hover transition-colors"
                          >
                            Move to Bag
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-20 text-center text-text-muted">
          Loading parent account...
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}

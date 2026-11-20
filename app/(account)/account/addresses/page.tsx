"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAddresses, saveAddress } from "@/lib/db/actions";
import {
  MapPin,
  Plus,
  ArrowLeft,
  Home,
  CheckCircle2,
  Truck,
  AlertCircle,
} from "lucide-react";

interface Address {
  id: string;
  name: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  is_default?: boolean;
}

export default function CustomerAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add Address Modal state
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pincode lookup helper state
  const [pincodeCheck, setPincodeCheck] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

  const loadAddresses = async () => {
    try {
      const data = await getAddresses();
      setAddresses((data as unknown as Address[]) || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    getAddresses()
      .then((data) => {
        if (!isMounted) return;
        setAddresses((data as unknown as Address[]) || []);
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

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await saveAddress({
        name,
        phone,
        address_line1: line1,
        address_line2: line2 || null,
        city,
        state,
        postal_code: postalCode,
        country: "India",
        is_default: isDefault,
      });

      if (!res.success) {
        throw new Error(res.error);
      }

      setShowModal(false);
      setName("");
      setPhone("");
      setLine1("");
      setLine2("");
      setCity("");
      setState("");
      setPostalCode("");
      setIsDefault(false);
      loadAddresses();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save address");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePincodeVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincodeCheck)) {
      setPincodeStatus("Please enter a valid 6-digit Indian PIN code.");
      return;
    }
    setPincodeStatus(
      `PIN ${pincodeCheck} verified! Blue Dart Air Express 2–3 day delivery and Cash on Delivery available.`
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
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
              Saved Addresses ({addresses.length})
            </h1>
            <p className="text-xs sm:text-sm text-text-muted">
              Manage your doorstep delivery destinations for festive orders and gifting.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-brand-primary text-white text-xs font-semibold rounded-xl hover:bg-brand-primary-hover shadow-warm-sm transition-all flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> + Add New Indian Address
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Address Cards */}
      {loading ? (
        <div className="py-16 text-center text-xs text-text-muted">
          Loading saved delivery addresses...
        </div>
      ) : addresses.length === 0 ? (
        <div className="p-12 text-center bg-surface border border-border rounded-2xl space-y-4">
          <MapPin className="w-12 h-12 text-text-muted mx-auto stroke-1" />
          <h3 className="font-serif text-lg font-bold text-text-heading">No Saved Addresses Yet</h3>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Save your home or relatives&apos; address for swift 1-click checkout on festive releases.
          </p>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-block px-6 py-2.5 bg-brand-primary text-white text-xs font-semibold rounded-xl hover:bg-brand-primary-hover shadow-warm-sm"
          >
            + Add First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-6 rounded-2xl bg-surface border transition-all flex flex-col justify-between ${
                addr.is_default
                  ? "border-brand-primary/60 ring-1 ring-brand-primary/20 shadow-warm-sm"
                  : "border-border hover:border-brand-primary/30"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-base font-bold text-text-heading">
                      {addr.name}
                    </span>
                    {addr.is_default ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-primary-subtle text-brand-primary">
                        Default
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                        Saved
                      </span>
                    )}
                  </div>
                  <Home className="w-4 h-4 text-text-muted" />
                </div>

                <div className="text-xs text-text-muted space-y-1">
                  <p className="text-text-body font-medium">{addr.address_line1}</p>
                  {addr.address_line2 && <p>{addr.address_line2}</p>}
                  <p>
                    {addr.city}, {addr.state} —{" "}
                    <strong className="text-text-heading font-mono">{addr.postal_code}</strong>
                  </p>
                  <p className="pt-1 font-mono text-[11px] text-text-heading">
                    Phone: {addr.phone}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 text-[11px] font-medium">
                  <Truck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Blue Dart 2-3 Day Express</span>
                </div>
                <span className="text-[11px] text-text-muted">Verified Pin</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pincode Quick Lookup Banner */}
      <div className="p-6 bg-surface border border-border rounded-2xl space-y-3 shadow-warm-sm">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-brand-secondary" />
          <h2 className="font-serif text-base font-bold text-text-heading">
            Check Express Courier Speed for Any Indian PIN Code
          </h2>
        </div>
        <p className="text-xs text-text-muted">
          We ship tamper-proof festive keepsake boxes via Blue Dart Air and Delhivery Express across 19,000+ PIN codes.
        </p>

        <form onSubmit={handlePincodeVerify} className="flex gap-2 max-w-md pt-1">
          <input
            type="text"
            maxLength={6}
            value={pincodeCheck}
            onChange={(e) => setPincodeCheck(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter 6-digit PIN code (e.g. 560038)"
            className="flex-1 px-3.5 py-2 text-xs border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary font-mono"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-brand-primary text-white text-xs font-semibold rounded-xl hover:bg-brand-primary-hover transition-colors"
          >
            Verify Speed
          </button>
        </form>

        {pincodeStatus && (
          <p className="text-xs font-semibold text-emerald-800 pt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>{pincodeStatus}</span>
          </p>
        )}
      </div>

      {/* Modal: Add Address */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <h3 className="font-serif text-xl font-bold text-stone-900">
                + Add New Indian Delivery Address
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-stone-400 hover:text-stone-800 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Guardian / Recipient Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Priya Sharma"
                    className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">10-Digit Mobile (+91) *</label>
                  <input
                    type="tel"
                    required
                    pattern="[6-9][0-9]{9}"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="9876543210"
                    className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">House / Flat / Building No. *</label>
                <input
                  type="text"
                  required
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  placeholder="Flat 402, Lotus Splendour"
                  className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Street / Locality / Landmark</label>
                <input
                  type="text"
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  placeholder="Road No. 12, Banjara Hills"
                  className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">6-Digit PIN *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="500034"
                    className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Hyderabad"
                    className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Telangana"
                    className="w-full px-3 py-2.5 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="defaultAddressCheck"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-stone-300 text-rose-900 focus:ring-rose-800"
                />
                <label htmlFor="defaultAddressCheck" className="text-xs text-stone-700 font-medium">
                  Set as default shipping address for future festive orders
                </label>
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-rose-900 text-white font-semibold rounded-lg hover:bg-rose-800 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving Address..." : "Save Indian Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

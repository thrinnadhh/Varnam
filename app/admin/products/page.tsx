"use client";

import { useState, useEffect, useTransition } from "react";
import { getAdminProducts, createAdminProduct } from "@/app/admin/actions";
import { getCategories } from "@/lib/db/actions";
import { formatPrice } from "@/lib/utils";
import {
  WOMEN_SIZES,
  TEEN_SIZES,
  KIDS_AGE_SIZES,
  type Segment,
  type SizeGroup,
} from "@/lib/schemas";
import { Plus, ShoppingBag, ShieldCheck, Check, AlertCircle, Sparkles } from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  // New Product Form State
  const [segment, setSegment] = useState<Segment>("women");
  const [sizeGroup, setSizeGroup] = useState<SizeGroup>("women");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [fabric, setFabric] = useState("Pure Chanderi Silk");
  const [lining, setLining] = useState("100% Breathable Malmal Cotton"); // Mandatory explicit!
  const [careInstructions, setCareInstructions] = useState("Dry clean only recommended for festive zari border.");
  const [modelHeight, setModelHeight] = useState("5'8\" (173 cm)");
  const [modelSizeWorn, setModelSizeWorn] = useState("Size S");
  const [isFeatured, setIsFeatured] = useState(false);

  // Pricing & Stock Defaults
  const [priceRupees, setPriceRupees] = useState("2499");
  const [mrpRupees, setMrpRupees] = useState("3499");
  const [defaultStock, setDefaultStock] = useState("12");

  // Image URL
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=1000&q=80");

  const loadData = async () => {
    try {
      const [prods, cats] = await Promise.all([
        getAdminProducts(),
        getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
      if (cats.length > 0) {
        setCategoryId(cats[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When segment changes, adjust sizeGroup and model defaults
  const handleSegmentChange = (newSegment: Segment) => {
    setSegment(newSegment);
    if (newSegment === "women") {
      setSizeGroup("women");
      setModelHeight("5'8\" (173 cm)");
      setModelSizeWorn("Size S");
      setPriceRupees("3499");
      setMrpRupees("4999");
    } else if (newSegment === "teens") {
      setSizeGroup("teen");
      setModelHeight("5'2\" (157 cm)");
      setModelSizeWorn("XS (13-14Y)");
      setPriceRupees("2499");
      setMrpRupees("3299");
    } else {
      setSizeGroup("kids");
      setModelHeight("4'2\" (127 cm)");
      setModelSizeWorn("Age 6-7Y");
      setPriceRupees("1899");
      setMrpRupees("2499");
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    );
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // Validate lining is declared
    if (!lining.trim()) {
      setFeedback("Error: Garment transparency rule: Inner lining declaration is mandatory.");
      return;
    }

    startTransition(async () => {
      const pricePaise = Math.round(Number(priceRupees) * 100);
      const mrpPaise = Math.round(Number(mrpRupees) * 100);
      const stock = Number(defaultStock);

      let variants: any[] = [];

      if (segment === "women") {
        const womenMeasurements: Record<string, { bust: number; waist: number; hip: number; length: number }> = {
          XS: { bust: 32, waist: 26, hip: 36, length: 54 },
          S: { bust: 34, waist: 28, hip: 38, length: 54 },
          M: { bust: 36, waist: 30, hip: 40, length: 55 },
          L: { bust: 38, waist: 32, hip: 42, length: 55 },
          XL: { bust: 40, waist: 34, hip: 44, length: 56 },
          XXL: { bust: 42, waist: 36, hip: 46, length: 56 },
        };

        variants = ["XS", "S", "M", "L", "XL", "XXL"].map((size) => {
          const m = womenMeasurements[size];
          return {
            size_group: "women" as const,
            size_name: size,
            size_age: size,
            bust_inches: m.bust,
            bust_cm: Math.round(m.bust * 2.54),
            waist_inches: m.waist,
            waist_cm: Math.round(m.waist * 2.54),
            hip_inches: m.hip,
            hip_cm: Math.round(m.hip * 2.54),
            length_inches: m.length,
            length_cm: Math.round(m.length * 2.54),
            color_name: "Original",
            color_hex: "#881337",
            sku: `${slug.toUpperCase()}-${size}`,
            price: pricePaise,
            mrp: mrpPaise,
            stock,
            is_active: true,
          };
        });
      } else if (segment === "teens") {
        const teenMeasurements: Record<string, { bust: number; waist: number; hip: number; length: number }> = {
          "11-12Y": { bust: 28, waist: 24, hip: 30, length: 44 },
          "13-14Y": { bust: 30, waist: 25, hip: 32, length: 46 },
          "15-16Y": { bust: 32, waist: 26, hip: 34, length: 48 },
          XS: { bust: 31, waist: 25, hip: 33, length: 47 },
          S: { bust: 33, waist: 27, hip: 35, length: 48 },
          M: { bust: 35, waist: 29, hip: 37, length: 49 },
        };

        variants = ["11-12Y", "13-14Y", "15-16Y", "XS", "S", "M"].map((size) => {
          const m = teenMeasurements[size];
          return {
            size_group: "teen" as const,
            size_name: size,
            size_age: size,
            bust_inches: m.bust,
            bust_cm: Math.round(m.bust * 2.54),
            waist_inches: m.waist,
            waist_cm: Math.round(m.waist * 2.54),
            hip_inches: m.hip,
            hip_cm: Math.round(m.hip * 2.54),
            length_inches: m.length,
            length_cm: Math.round(m.length * 2.54),
            color_name: "Original",
            color_hex: "#10b981",
            sku: `${slug.toUpperCase()}-${size}`,
            price: pricePaise,
            mrp: mrpPaise,
            stock,
            is_active: true,
          };
        });
      } else {
        const kidsMeasurements: Record<string, { bust: number; waist: number; length: number }> = {
          "2-3Y": { bust: 21, waist: 20, length: 22 },
          "4-5Y": { bust: 23, waist: 22, length: 26 },
          "6-7Y": { bust: 25, waist: 24, length: 30 },
          "8-9Y": { bust: 27, waist: 25, length: 34 },
          "10-11Y": { bust: 29, waist: 26, length: 38 },
          "12-14Y": { bust: 31, waist: 28, length: 42 },
        };

        variants = KIDS_AGE_SIZES.map((size) => {
          const m = kidsMeasurements[size];
          return {
            size_group: "kids" as const,
            size_name: size,
            size_age: size,
            bust_inches: m.bust,
            bust_cm: Math.round(m.bust * 2.54),
            waist_inches: m.waist,
            waist_cm: Math.round(m.waist * 2.54),
            length_inches: m.length,
            length_cm: Math.round(m.length * 2.54),
            color_name: "Original",
            color_hex: "#881337",
            sku: `${slug.toUpperCase()}-${size}`,
            price: pricePaise,
            mrp: mrpPaise,
            stock,
            is_active: true,
          };
        });
      }

      const res = await createAdminProduct({
        category_id: categoryId,
        segment,
        name,
        slug,
        description,
        fabric,
        lining, // Mandatory explicit declaration!
        care_instructions: careInstructions,
        model_height: modelHeight,
        model_size_worn: modelSizeWorn,
        is_active: true,
        is_featured: isFeatured,
        variants,
        images: [
          {
            image_url: imageUrl,
            alt_text: name,
            display_order: 0,
            is_primary: true,
          },
        ],
      });

      if (res.success) {
        setFeedback("Couture dress and multi-segment variants created successfully!");
        setIsAddingProduct(false);
        loadData();
        setName("");
        setSlug("");
      } else {
        setFeedback(res.error || "Failed to create product.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
            Catalog & Inventory Management
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Multi-segment couture (Women, Teens, Girls), mandatory lining specs, and size group stocks.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingProduct(!isAddingProduct)}
          className="px-4 py-2 bg-rose-900 text-white rounded-lg text-xs font-semibold hover:bg-rose-800 transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          {isAddingProduct ? "Cancel Form" : "Add New Dress"}
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-stone-100 border border-stone-300 rounded-lg text-xs font-medium text-stone-800">
          {feedback}
        </div>
      )}

      {/* Add Dress Form */}
      {isAddingProduct && (
        <form
          onSubmit={handleCreateProduct}
          className="p-6 bg-white border border-stone-200 rounded-2xl shadow-sm space-y-4 text-xs"
        >
          <h2 className="text-base font-bold text-stone-900 font-serif border-b border-stone-200 pb-2">
            Create Handcrafted Couture Dress
          </h2>

          {/* Demographic Segment & Category Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200">
            <div>
              <label className="block font-bold text-stone-900 mb-1">
                Demographic Segment *
              </label>
              <select
                value={segment}
                onChange={(e) => handleSegmentChange(e.target.value as Segment)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white font-semibold"
              >
                <option value="women">Women (Sizes XS–XXL / Numeric 28–38)</option>
                <option value="teens">Teens (Ages 12–18Y / Youth Sizing)</option>
                <option value="girls">Girls (Ages 2–14Y / Milestone Sizing)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Category / Occasion *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Size Group *
              </label>
              <select
                value={sizeGroup}
                onChange={(e) => setSizeGroup(e.target.value as SizeGroup)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
              >
                <option value="women">Women Sizes (Bust, Waist, Hip, Length)</option>
                <option value="teen">Teen Sizes (Youth Silhouette)</option>
                <option value="kids">Kids Sizes (Chest, Waist, Length)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Dress Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Aashna Royal Crimson Silk Anarkali"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="aashna-royal-crimson-anarkali"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50 font-mono"
              />
            </div>
          </div>

          {/* Model Fit Disclosures */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-purple-50/50 border border-purple-100">
            <div>
              <label className="block font-semibold text-purple-950 mb-1">
                Model Height (Segment Specific) *
              </label>
              <input
                type="text"
                required
                value={modelHeight}
                onChange={(e) => setModelHeight(e.target.value)}
                placeholder={'e.g. 5\'8" (173 cm) or 4\'2" (127 cm)'}
                className="w-full px-3 py-2 border border-purple-200 rounded-lg bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-purple-950 mb-1">
                Model Size Worn *
              </label>
              <input
                type="text"
                required
                value={modelSizeWorn}
                onChange={(e) => setModelSizeWorn(e.target.value)}
                placeholder="e.g. Size S or Age 6-7Y"
                className="w-full px-3 py-2 border border-purple-200 rounded-lg bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Primary Image URL *
            </label>
            <input
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Description *
            </label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Exquisite handcrafted dress with shimmering border and comfortable silhouette."
              className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50"
            />
          </div>

          {/* Garment Transparency Disclosures */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-amber-50/60 border border-amber-200">
            <div>
              <label className="block font-semibold text-amber-950 mb-1">
                Outer Fabric *
              </label>
              <input
                type="text"
                required
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                placeholder="e.g. Pure Chanderi Silk"
                className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white"
              />
            </div>

            <div>
              <label className="block font-bold text-amber-950 mb-1">
                Mandatory Inner Lining Specification * (No Defaults!)
              </label>
              <input
                type="text"
                required
                value={lining}
                onChange={(e) => setLining(e.target.value)}
                placeholder="e.g. 100% Breathable Malmal Cotton"
                className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                required
                value={priceRupees}
                onChange={(e) => setPriceRupees(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                MRP (₹) *
              </label>
              <input
                type="number"
                required
                value={mrpRupees}
                onChange={(e) => setMrpRupees(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Stock Per Generated Variant *
              </label>
              <input
                type="number"
                required
                value={defaultStock}
                onChange={(e) => setDefaultStock(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFeatured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="accent-rose-900"
            />
            <label htmlFor="isFeatured" className="font-semibold text-stone-700">
              Feature on Storefront Homepage
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
            <button
              type="button"
              onClick={() => setIsAddingProduct(false)}
              className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 bg-rose-900 text-white rounded-lg hover:bg-rose-800 disabled:opacity-50"
            >
              {isPending ? "Creating..." : "Save Product & Variants"}
            </button>
          </div>
        </form>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-600 uppercase font-semibold border-b border-stone-200">
              <tr>
                <th className="py-3 px-3">Dress & Slug</th>
                <th className="py-3 px-3">Segment</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Fabric & Inner Lining</th>
                <th className="py-3 px-3">Variants & Sizing</th>
                <th className="py-3 px-3">Price Range</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((p) => {
                const minPrice = Math.min(...(p.product_variants || []).map((v: any) => v.price));
                const totalStock = (p.product_variants || []).reduce((acc: number, v: any) => acc + v.stock, 0);

                const segmentBadgeClass =
                  p.segment === "women"
                    ? "bg-purple-100 text-purple-800 border-purple-200"
                    : p.segment === "teens"
                    ? "bg-amber-100 text-amber-800 border-amber-200"
                    : "bg-emerald-100 text-emerald-800 border-emerald-200";

                return (
                  <tr key={p.id} className="hover:bg-stone-50/50">
                    <td className="py-3 px-3">
                      <p className="font-bold text-stone-900 font-serif text-sm">
                        {p.name}
                      </p>
                      <p className="text-stone-400 font-mono text-[11px]">
                        /{p.slug}
                      </p>
                      {p.model_height && (
                        <p className="text-stone-500 text-[10px] mt-0.5">
                          Model: {p.model_height} ({p.model_size_worn})
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${segmentBadgeClass}`}>
                        {p.segment}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-stone-600">
                      {p.categories?.name}
                    </td>
                    <td className="py-3 px-3">
                      <p className="text-stone-800 font-medium">{p.fabric}</p>
                      <p className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        {p.lining}
                      </p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-semibold">{p.product_variants?.length} sizes</span>
                      <span className="block text-[11px] text-stone-500 font-mono">
                        {totalStock} total units
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-stone-900">
                      From {formatPrice(minPrice)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

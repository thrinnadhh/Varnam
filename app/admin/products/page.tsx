"use client";

import { useState, useEffect, useTransition } from "react";
import { getAdminProducts, createAdminProduct } from "@/app/admin/actions";
import { getCategories } from "@/lib/db/actions";
import { formatPrice } from "@/lib/utils";
import {
  KIDS_AGE_SIZES,
  type Segment,
  type SizeGroup,
  type MeasurementType,
} from "@/lib/schemas";
import { Plus, ShieldCheck, Ruler } from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface AdminProductVariant {
  id: string;
  size_name?: string;
  price: number;
  stock: number;
}

interface AdminProductItem {
  id: string;
  name: string;
  slug: string;
  segment?: string;
  fabric?: string;
  lining?: string;
  model_height?: string | null;
  model_size_worn?: string | null;
  categories?: { name: string } | null;
  product_variants?: AdminProductVariant[];
}

interface DraftVariant {
  size_name: string;
  size_group: SizeGroup;
  bust_inches: number;
  waist_inches: number;
  hip_inches: number;
  length_inches: number;
  stock: number;
  price_rupees: string;
  mrp_rupees: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  // New Product Form State
  const [segment, setSegment] = useState<Segment>("women");
  const [measurementType, setMeasurementType] = useState<MeasurementType>("garment");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [fabric, setFabric] = useState("Pure Chanderi Silk");
  const [lining, setLining] = useState("100% Breathable Malmal Cotton"); // Mandatory explicit!
  const [careInstructions, setCareInstructions] = useState("Dry clean only recommended for festive zari border.");

  // NO arbitrary defaults on model fit disclosures (Admin must explicitly provide or leave empty)
  const [modelHeight, setModelHeight] = useState("");
  const [modelSizeWorn, setModelSizeWorn] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  // Draft measurement table & Admin Confirmation
  const [draftVariants, setDraftVariants] = useState<DraftVariant[]>([]);
  const [isDraftConfirmed, setIsDraftConfirmed] = useState(false);

  // Image URL
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=1000&q=80");

  const loadData = () => {
    Promise.all([getAdminProducts(), getCategories()])
      .then(([prods, cats]) => {
        setProducts(prods as unknown as AdminProductItem[]);
        setCategories(cats as unknown as CategoryOption[]);
        if (cats.length > 0) {
          setCategoryId(cats[0].id);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Generate initial draft measurements based on segment
  const generateDraftVariants = (targetSegment: Segment) => {
    setIsDraftConfirmed(false);
    if (targetSegment === "women") {
      const womenDefaults: Record<string, { bust: number; waist: number; hip: number; length: number }> = {
        XS: { bust: 32, waist: 26, hip: 36, length: 54 },
        S: { bust: 34, waist: 28, hip: 38, length: 54 },
        M: { bust: 36, waist: 30, hip: 40, length: 55 },
        L: { bust: 38, waist: 32, hip: 42, length: 55 },
        XL: { bust: 40, waist: 34, hip: 44, length: 56 },
        XXL: { bust: 42, waist: 36, hip: 46, length: 56 },
      };
      const drafts: DraftVariant[] = ["XS", "S", "M", "L", "XL", "XXL"].map((sz) => ({
        size_name: sz,
        size_group: "women",
        bust_inches: womenDefaults[sz].bust,
        waist_inches: womenDefaults[sz].waist,
        hip_inches: womenDefaults[sz].hip,
        length_inches: womenDefaults[sz].length,
        stock: 12,
        price_rupees: "3499",
        mrp_rupees: "4999",
      }));
      setDraftVariants(drafts);
    } else if (targetSegment === "teens") {
      // Non-overlapping Teens: 13-18Y + Alphas
      const teenDefaults: Record<string, { bust: number; waist: number; hip: number; length: number }> = {
        "13-14Y": { bust: 31, waist: 26, hip: 34, length: 46 },
        "15-16Y": { bust: 33, waist: 27, hip: 36, length: 48 },
        "17-18Y": { bust: 35, waist: 28, hip: 38, length: 50 },
        XS: { bust: 31, waist: 26, hip: 34, length: 47 },
        S: { bust: 33, waist: 27, hip: 36, length: 48 },
        M: { bust: 35, waist: 29, hip: 38, length: 49 },
      };
      const drafts: DraftVariant[] = ["13-14Y", "15-16Y", "17-18Y", "XS", "S", "M"].map((sz) => ({
        size_name: sz,
        size_group: "teen",
        bust_inches: teenDefaults[sz].bust,
        waist_inches: teenDefaults[sz].waist,
        hip_inches: teenDefaults[sz].hip,
        length_inches: teenDefaults[sz].length,
        stock: 10,
        price_rupees: "2499",
        mrp_rupees: "3499",
      }));
      setDraftVariants(drafts);
    } else {
      // Non-overlapping Girls: 2-12Y
      const kidsDefaults: Record<string, { bust: number; waist: number; hip: number; length: number }> = {
        "2-3Y": { bust: 21, waist: 20, hip: 22, length: 22 },
        "4-5Y": { bust: 23, waist: 22, hip: 24, length: 26 },
        "6-7Y": { bust: 25, waist: 24, hip: 26, length: 30 },
        "8-9Y": { bust: 27, waist: 26, hip: 28, length: 34 },
        "10-11Y": { bust: 29, waist: 28, hip: 30, length: 38 },
        "12Y": { bust: 31, waist: 29, hip: 32, length: 41 },
      };
      const drafts: DraftVariant[] = KIDS_AGE_SIZES.map((sz) => ({
        size_name: sz,
        size_group: "kids",
        bust_inches: kidsDefaults[sz].bust,
        waist_inches: kidsDefaults[sz].waist,
        hip_inches: kidsDefaults[sz].hip,
        length_inches: kidsDefaults[sz].length,
        stock: 15,
        price_rupees: "1899",
        mrp_rupees: "2499",
      }));
      setDraftVariants(drafts);
    }
  };

  // When segment changes, re-generate draft
  const handleSegmentChange = (newSegment: Segment) => {
    setSegment(newSegment);
    generateDraftVariants(newSegment);
  };

  const handleOpenForm = () => {
    setIsAddingProduct(true);
    generateDraftVariants(segment);
    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
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

  const handleUpdateDraft = (index: number, field: keyof DraftVariant, value: string | number) => {
    const updated = [...draftVariants];
    updated[index] = { ...updated[index], [field]: value } as DraftVariant;
    setDraftVariants(updated);
    setIsDraftConfirmed(false); // Reset confirmation if measurements are touched
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // Validate lining is declared
    if (!lining.trim()) {
      setFeedback("Error: Garment transparency rule: Inner lining declaration is mandatory.");
      return;
    }

    if (!isDraftConfirmed) {
      setFeedback("Error: Please review and confirm the draft sizing measurements below.");
      return;
    }

    startTransition(async () => {
      const variants = draftVariants.map((v) => ({
        size_group: v.size_group,
        size_name: v.size_name,
        size_age: v.size_name,
        bust_inches: Number(v.bust_inches),
        bust_cm: Math.round(Number(v.bust_inches) * 2.54),
        waist_inches: Number(v.waist_inches),
        waist_cm: Math.round(Number(v.waist_inches) * 2.54),
        hip_inches: Number(v.hip_inches),
        hip_cm: Math.round(Number(v.hip_inches) * 2.54),
        length_inches: Number(v.length_inches),
        length_cm: Math.round(Number(v.length_inches) * 2.54),
        color_name: "Original",
        color_hex: "#881337",
        sku: `${slug.toUpperCase()}-${v.size_name}`,
        price: Math.round(Number(v.price_rupees) * 100),
        mrp: Math.round(Number(v.mrp_rupees) * 100),
        stock: Number(v.stock),
        is_active: true,
      }));

      const sizeChart = draftVariants.map((v) => ({
        size: v.size_name,
        bust_in: Number(v.bust_inches),
        bust_cm: Math.round(Number(v.bust_inches) * 2.54),
        waist_in: Number(v.waist_inches),
        waist_cm: Math.round(Number(v.waist_inches) * 2.54),
        hip_in: Number(v.hip_inches),
        hip_cm: Math.round(Number(v.hip_inches) * 2.54),
        length_in: Number(v.length_inches),
        length_cm: Math.round(Number(v.length_inches) * 2.54),
        measurement_type: measurementType,
      }));

      const targetCatId = categoryId || (categories.length > 0 ? categories[0].id : "");
      if (!targetCatId) {
        setFeedback("Error: Please select a category for this dress.");
        return;
      }

      const res = await createAdminProduct({
        category_id: targetCatId,
        segment,
        name,
        slug,
        description,
        fabric,
        lining, // Mandatory explicit declaration!
        care_instructions: careInstructions,
        measurement_type: measurementType,
        model_height: modelHeight.trim() ? modelHeight.trim() : null,
        model_size_worn: modelSizeWorn.trim() ? modelSizeWorn.trim() : null,
        size_chart: sizeChart,
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
        setFeedback("Couture dress and confirmed variant measurements created successfully!");
        setIsAddingProduct(false);
        loadData();
        setName("");
        setSlug("");
        setModelHeight("");
        setModelSizeWorn("");
        setIsDraftConfirmed(false);
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
            Multi-segment couture (Women, Teens 13–18Y, Girls 2–12Y), mandatory lining specs, and verified sizing drafts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => (isAddingProduct ? setIsAddingProduct(false) : handleOpenForm())}
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
                <option value="teens">Teens (Ages 13–18Y / Youth Sizing)</option>
                <option value="girls">Girls (Ages 2–12Y / Milestone Sizing)</option>
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
                Chart Measurement Basis *
              </label>
              <select
                value={measurementType}
                onChange={(e) => setMeasurementType(e.target.value as MeasurementType)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white font-semibold"
              >
                <option value="garment">Garment Dimensions (Laid Flat with +2&quot; Ease)</option>
                <option value="body">Body Measurements (Natural Body Fit)</option>
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

          {/* Model Fit Disclosures (NO defaults - optional/explicit) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-purple-50/50 border border-purple-100">
            <div>
              <label className="block font-semibold text-purple-950 mb-1">
                Model Height (Optional / Segment-Specific)
              </label>
              <input
                type="text"
                value={modelHeight}
                onChange={(e) => setModelHeight(e.target.value)}
                placeholder={
                  segment === "women"
                    ? "e.g. 5'8\" (173 cm)"
                    : segment === "teens"
                    ? "e.g. 5'3\" (160 cm)"
                    : "e.g. 4'2\" (127 cm)"
                }
                className="w-full px-3 py-2 border border-purple-200 rounded-lg bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-purple-950 mb-1">
                Model Size Worn (Optional)
              </label>
              <input
                type="text"
                value={modelSizeWorn}
                onChange={(e) => setModelSizeWorn(e.target.value)}
                placeholder={
                  segment === "women"
                    ? "e.g. Size S"
                    : segment === "teens"
                    ? "e.g. Size XS (13-14Y)"
                    : "e.g. Age 6-7Y"
                }
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

            <div className="sm:col-span-2">
              <label className="block font-semibold text-amber-950 mb-1">
                Care Instructions
              </label>
              <input
                type="text"
                value={careInstructions}
                onChange={(e) => setCareInstructions(e.target.value)}
                placeholder="e.g. Dry clean first wash; gentle hand wash cold."
                className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white font-medium"
              />
            </div>
          </div>

          {/* Admin Draft Measurements Review & Confirmation */}
          <div className="space-y-3 p-4 rounded-xl border border-stone-300 bg-stone-50/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-2">
              <div>
                <h3 className="font-bold text-stone-900 font-serif flex items-center gap-1.5 text-sm">
                  <Ruler className="w-4 h-4 text-rose-900" />
                  Auto-Generated Measurements Draft ({measurementType.toUpperCase()} Dimensions)
                </h3>
                <p className="text-[11px] text-stone-600">
                  Review and customize measurements for each variant before confirming.
                </p>
              </div>

              <button
                type="button"
                onClick={() => generateDraftVariants(segment)}
                className="text-[11px] font-semibold text-rose-900 hover:underline self-start sm:self-auto"
              >
                Reset to Standard Archetype
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs bg-white rounded-lg border border-stone-200 overflow-hidden">
                <thead className="bg-stone-100 text-stone-700 font-semibold border-b border-stone-200 uppercase text-[10px]">
                  <tr>
                    <th className="py-2 px-2.5">Size</th>
                    <th className="py-2 px-2.5">Bust/Chest (in)</th>
                    <th className="py-2 px-2.5">Waist (in)</th>
                    <th className="py-2 px-2.5">Hip (in)</th>
                    <th className="py-2 px-2.5">Length (in)</th>
                    <th className="py-2 px-2.5">Stock</th>
                    <th className="py-2 px-2.5">Price (₹)</th>
                    <th className="py-2 px-2.5">MRP (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {draftVariants.map((v, idx) => (
                    <tr key={v.size_name}>
                      <td className="py-1.5 px-2.5 font-bold font-mono text-stone-900">
                        {v.size_name}
                      </td>
                      <td className="py-1.5 px-2.5">
                        <input
                          type="number"
                          step="0.5"
                          value={v.bust_inches}
                          onChange={(e) => handleUpdateDraft(idx, "bust_inches", Number(e.target.value))}
                          className="w-16 px-1.5 py-1 border border-stone-300 rounded font-mono text-xs"
                        />
                      </td>
                      <td className="py-1.5 px-2.5">
                        <input
                          type="number"
                          step="0.5"
                          value={v.waist_inches}
                          onChange={(e) => handleUpdateDraft(idx, "waist_inches", Number(e.target.value))}
                          className="w-16 px-1.5 py-1 border border-stone-300 rounded font-mono text-xs"
                        />
                      </td>
                      <td className="py-1.5 px-2.5">
                        <input
                          type="number"
                          step="0.5"
                          value={v.hip_inches}
                          onChange={(e) => handleUpdateDraft(idx, "hip_inches", Number(e.target.value))}
                          className="w-16 px-1.5 py-1 border border-stone-300 rounded font-mono text-xs"
                        />
                      </td>
                      <td className="py-1.5 px-2.5">
                        <input
                          type="number"
                          step="0.5"
                          value={v.length_inches}
                          onChange={(e) => handleUpdateDraft(idx, "length_inches", Number(e.target.value))}
                          className="w-16 px-1.5 py-1 border border-stone-300 rounded font-mono text-xs"
                        />
                      </td>
                      <td className="py-1.5 px-2.5">
                        <input
                          type="number"
                          value={v.stock}
                          onChange={(e) => handleUpdateDraft(idx, "stock", Number(e.target.value))}
                          className="w-16 px-1.5 py-1 border border-stone-300 rounded font-mono text-xs"
                        />
                      </td>
                      <td className="py-1.5 px-2.5">
                        <input
                          type="number"
                          value={v.price_rupees}
                          onChange={(e) => handleUpdateDraft(idx, "price_rupees", e.target.value)}
                          className="w-20 px-1.5 py-1 border border-stone-300 rounded font-mono text-xs"
                        />
                      </td>
                      <td className="py-1.5 px-2.5">
                        <input
                          type="number"
                          value={v.mrp_rupees}
                          onChange={(e) => handleUpdateDraft(idx, "mrp_rupees", e.target.value)}
                          className="w-20 px-1.5 py-1 border border-stone-300 rounded font-mono text-xs"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Confirmation Checkbox */}
            <div className="pt-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="confirmDraft"
                checked={isDraftConfirmed}
                onChange={(e) => setIsDraftConfirmed(e.target.checked)}
                className="w-4 h-4 accent-rose-900 rounded"
              />
              <label htmlFor="confirmDraft" className="font-semibold text-stone-800 text-xs">
                I have reviewed and confirmed that these {draftVariants.length} variant measurements and stock levels are accurate.
              </label>
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
              disabled={isPending || !isDraftConfirmed}
              className="px-5 py-2 bg-rose-900 text-white rounded-lg hover:bg-rose-800 disabled:opacity-50 font-semibold"
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
                const variants = p.product_variants || [];
                const minPrice = variants.length > 0 ? Math.min(...variants.map((v) => v.price)) : 0;
                const totalStock = variants.reduce((acc, v) => acc + v.stock, 0);

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

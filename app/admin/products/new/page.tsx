"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createAdminProduct } from "@/app/admin/actions";
import {
  KIDS_AGE_SIZES,
  TEEN_SIZES,
  WOMEN_SIZES,
  type Segment,
  type SizeGroup,
} from "@/lib/schemas";
import {
  Sparkles,
  ArrowLeft,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface VariantRow {
  size_group: SizeGroup;
  size_name: string;
  size_age: string;
  bust_inches: number;
  bust_cm: number;
  waist_inches: number;
  waist_cm: number;
  length_inches: number;
  length_cm: number;
  color_name: string;
  color_hex: string;
  sku: string;
  price_rupees: number;
  mrp_rupees: number;
  stock: number;
}

export default function NewProductPage() {
  const router = useRouter();

  // Basic Details
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [segment, setSegment] = useState<Segment>("girls");
  const [categoryId, setCategoryId] = useState("11111111-1111-1111-1111-111111111111"); // Festive & Wedding default
  const [description, setDescription] = useState("");

  // Authentic Craft Specifications
  const [fabric, setFabric] = useState("Pure Kanchipuram Silk & Velvet");
  const [lining, setLining] = useState("100% Breathable Soft Cotton Mul Lining");
  const [craftWork, setCraftWork] = useState("Handwoven Zari Border & Gota Patti");
  const [setIncludes, setSetIncludes] = useState("Blouse + Pavadai Skirt + Potli");
  const [washCare, setWashCare] = useState("Dry Clean Only");
  const [careInstructions, setCareInstructions] = useState(
    "Dry clean recommended to preserve zari luster. Store wrapped in pure cotton muslin."
  );

  // Model Fit Info
  const [modelHeight, setModelHeight] = useState("4'2\" (127 cm)");
  const [modelSizeWorn, setModelSizeWorn] = useState("Ages 6-7Y");

  // Media Gallery
  const [imageUrl, setImageUrl] = useState(
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80"
  );
  const [imageAlt, setImageAlt] = useState("");

  // Variant Matrix
  const [colorName, setColorName] = useState("Kumkum Red");
  const [colorHex, setColorHex] = useState("#881337");
  const [basePrice, setBasePrice] = useState(3850);
  const [baseMrp, setBaseMrp] = useState(5200);
  const defaultStock = 15;

  const [variants, setVariants] = useState<VariantRow[]>([
    {
      size_group: "kids",
      size_name: "2-3Y",
      size_age: "2-3Y",
      bust_inches: 21,
      bust_cm: 53.3,
      waist_inches: 20,
      waist_cm: 50.8,
      length_inches: 22,
      length_cm: 55.9,
      color_name: "Kumkum Red",
      color_hex: "#881337",
      sku: "VRN-RUBY-23Y",
      price_rupees: 3850,
      mrp_rupees: 5200,
      stock: 12,
    },
    {
      size_group: "kids",
      size_name: "4-5Y",
      size_age: "4-5Y",
      bust_inches: 23,
      bust_cm: 58.4,
      waist_inches: 22,
      waist_cm: 55.9,
      length_inches: 26,
      length_cm: 66.0,
      color_name: "Kumkum Red",
      color_hex: "#881337",
      sku: "VRN-RUBY-45Y",
      price_rupees: 3850,
      mrp_rupees: 5200,
      stock: 15,
    },
    {
      size_group: "kids",
      size_name: "6-7Y",
      size_age: "6-7Y",
      bust_inches: 25,
      bust_cm: 63.5,
      waist_inches: 24,
      waist_cm: 61.0,
      length_inches: 30,
      length_cm: 76.2,
      color_name: "Kumkum Red",
      color_hex: "#881337",
      sku: "VRN-RUBY-67Y",
      price_rupees: 3850,
      mrp_rupees: 5200,
      stock: 18,
    },
    {
      size_group: "kids",
      size_name: "8-9Y",
      size_age: "8-9Y",
      bust_inches: 27,
      bust_cm: 68.6,
      waist_inches: 26,
      waist_cm: 66.0,
      length_inches: 34,
      length_cm: 86.4,
      color_name: "Kumkum Red",
      color_hex: "#881337",
      sku: "VRN-RUBY-89Y",
      price_rupees: 3850,
      mrp_rupees: 5200,
      stock: 10,
    },
    {
      size_group: "kids",
      size_name: "10-11Y",
      size_age: "10-11Y",
      bust_inches: 29,
      bust_cm: 73.7,
      waist_inches: 28,
      waist_cm: 71.1,
      length_inches: 38,
      length_cm: 96.5,
      color_name: "Kumkum Red",
      color_hex: "#881337",
      sku: "VRN-RUBY-1011Y",
      price_rupees: 3850,
      mrp_rupees: 5200,
      stock: 8,
    },
    {
      size_group: "kids",
      size_name: "12Y",
      size_age: "12Y",
      bust_inches: 31,
      bust_cm: 78.7,
      waist_inches: 29,
      waist_cm: 73.7,
      length_inches: 41,
      length_cm: 104.1,
      color_name: "Kumkum Red",
      color_hex: "#881337",
      sku: "VRN-RUBY-12Y",
      price_rupees: 3850,
      mrp_rupees: 5200,
      stock: 6,
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Auto-generate slug from name
  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    );
  };

  const handleGenerateMatrix = () => {
    let sizesToGenerate: readonly string[] = KIDS_AGE_SIZES;
    let sizeGroup: SizeGroup = "kids";

    if (segment === "teens") {
      sizesToGenerate = TEEN_SIZES;
      sizeGroup = "teen";
    } else if (segment === "women") {
      sizesToGenerate = WOMEN_SIZES;
      sizeGroup = "women";
    }

    const cleanBaseSku = (slug || "DRESS").toUpperCase().slice(0, 10);

    const generated: VariantRow[] = sizesToGenerate.map((sz, idx) => ({
      size_group: sizeGroup,
      size_name: sz,
      size_age: sz,
      bust_inches: 22 + idx * 2,
      bust_cm: Math.round((22 + idx * 2) * 2.54 * 10) / 10,
      waist_inches: 20 + idx * 2,
      waist_cm: Math.round((20 + idx * 2) * 2.54 * 10) / 10,
      length_inches: 24 + idx * 4,
      length_cm: Math.round((24 + idx * 4) * 2.54 * 10) / 10,
      color_name: colorName,
      color_hex: colorHex,
      sku: `VRN-${cleanBaseSku}-${sz.replace(/[^A-Z0-9]/gi, "")}`,
      price_rupees: basePrice,
      mrp_rupees: baseMrp,
      stock: defaultStock,
    }));

    setVariants(generated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        category_id: categoryId,
        segment,
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: description || `Handcrafted ${name} tailored with 100% breathable cotton lining.`,
        fabric,
        lining,
        craft_work: craftWork,
        set_includes: setIncludes,
        wash_care: washCare,
        care_instructions: careInstructions,
        measurement_type: "garment" as const,
        model_height: modelHeight,
        model_size_worn: modelSizeWorn,
        is_active: true,
        is_featured: true,
        variants: variants.map((v) => ({
          size_group: v.size_group,
          size_name: v.size_name,
          size_age: v.size_age,
          bust_inches: v.bust_inches,
          bust_cm: v.bust_cm,
          waist_inches: v.waist_inches,
          waist_cm: v.waist_cm,
          length_inches: v.length_inches,
          length_cm: v.length_cm,
          color_name: v.color_name,
          color_hex: v.color_hex,
          sku: v.sku,
          price: Math.round(v.price_rupees * 100), // Convert ₹ to paise
          mrp: Math.round(v.mrp_rupees * 100),
          stock: v.stock,
          is_active: true,
        })),
        images: [
          {
            image_url: imageUrl,
            alt_text: imageAlt || name,
            display_order: 0,
            is_primary: true,
          },
        ],
      };

      const result = await createAdminProduct(payload);
      if (!result.success) {
        throw new Error(result.error);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/products");
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to publish product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/products"
              className="text-stone-500 hover:text-stone-800 text-xs font-semibold flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            Add Handcrafted Dress & Build Variant Matrix
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Define authentic Indian craft specs, age sizing brackets, and generate instant SKU inventory rows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !name}
            className="px-5 py-2.5 bg-rose-900 text-white text-xs font-semibold rounded-lg hover:bg-rose-800 shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isSubmitting ? "Publishing to Atelier..." : "Publish Dress to Storefront"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Ensemble successfully published to storefront! Redirecting to catalog...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: General Information */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="border-b border-stone-200 pb-3">
            <h2 className="text-lg font-bold font-serif text-stone-900">
              1. General Information & Demographic
            </h2>
            <p className="text-xs text-stone-500">
              Dress title, URL slug, category, and target age demographic segment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Dress Name / Title *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Royal Ruby Kanchipuram Pattu Pavadai"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">URL Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. royal-ruby-kanchipuram-pattu-pavadai"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-rose-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Segment *</label>
              <select
                value={segment}
                onChange={(e) => setSegment(e.target.value as Segment)}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white"
              >
                <option value="girls">Girls (Ages 2–12Y)</option>
                <option value="teens">Teens (Ages 13–18Y &amp; Youth Alphas)</option>
                <option value="women">Women (Adult Alphas XS–XXL &amp; Free Size)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Occasion Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-800 bg-white"
              >
                <option value="11111111-1111-1111-1111-111111111111">Festive &amp; Wedding</option>
                <option value="22222222-2222-2222-2222-222222222222">Party &amp; Evening Gowns</option>
                <option value="33333333-3333-3333-3333-333333333333">Cotton Twirl Frocks &amp; Day Dresses</option>
                <option value="44444444-4444-4444-4444-444444444444">Casuals &amp; Co-ords</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Artisan Narrative / Description *</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the silhouette, weave, embroidery details, and comfort features for parents..."
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-800"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Authentic Indian Craft & Comfort Specifications */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="border-b border-stone-200 pb-3">
            <h2 className="text-lg font-bold font-serif text-stone-900">
              2. Authentic Indian Craft, Weave &amp; Comfort Disclosures
            </h2>
            <p className="text-xs text-stone-500">
              First-class craft fields displayed prominently on the product detail page and size guide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Fabric &amp; Weave *</label>
              <input
                type="text"
                required
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                placeholder="e.g. Pure Kanchipuram Silk / Banarasi Brocade"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 flex items-center justify-between">
                <span>Inner Lining &amp; Comfort * (Mandatory Transparency)</span>
                <span className="text-[10px] text-emerald-700 font-semibold">Tantrum-Free Fit</span>
              </label>
              <input
                type="text"
                required
                value={lining}
                onChange={(e) => setLining(e.target.value)}
                placeholder="e.g. 100% Breathable Soft Cotton Mul Lining"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Craft / Work Details</label>
              <input
                type="text"
                value={craftWork}
                onChange={(e) => setCraftWork(e.target.value)}
                placeholder="e.g. Handwoven Zari Border &amp; Gota Patti"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Set Includes</label>
              <input
                type="text"
                value={setIncludes}
                onChange={(e) => setSetIncludes(e.target.value)}
                placeholder="e.g. Blouse + Pavadai Skirt + Matching Potli"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Wash &amp; Care</label>
              <input
                type="text"
                value={washCare}
                onChange={(e) => setWashCare(e.target.value)}
                placeholder="e.g. Dry Clean Only / Gentle Hand Wash"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Care Instructions Detail</label>
              <input
                type="text"
                value={careInstructions}
                onChange={(e) => setCareInstructions(e.target.value)}
                placeholder="Storage in muslin cloth, iron temperature..."
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Model Height</label>
              <input
                type="text"
                value={modelHeight}
                onChange={(e) => setModelHeight(e.target.value)}
                placeholder="e.g. 4'2&quot; (127 cm)"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Model Size Worn</label>
              <input
                type="text"
                value={modelSizeWorn}
                onChange={(e) => setModelSizeWorn(e.target.value)}
                placeholder="e.g. Ages 6-7Y"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-800"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Variant Matrix & Pricing Generator */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
            <div>
              <h2 className="text-lg font-bold font-serif text-stone-900">
                3. Age/Size Variant Matrix &amp; Stock Generator
              </h2>
              <p className="text-xs text-stone-500">
                Configure color and default price/stock to auto-populate the Indian demographic size matrix.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-stone-600 font-medium">Color:</label>
                <input
                  type="text"
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-stone-300 rounded-md w-28"
                  placeholder="Kumkum Red"
                />
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="w-7 h-7 rounded border border-stone-300 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <label className="text-xs text-stone-600 font-medium">Price (₹):</label>
                <input
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="px-2.5 py-1 text-xs border border-stone-300 rounded-md w-20 font-mono"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <label className="text-xs text-stone-600 font-medium">MRP (₹):</label>
                <input
                  type="number"
                  value={baseMrp}
                  onChange={(e) => setBaseMrp(Number(e.target.value))}
                  className="px-2.5 py-1 text-xs border border-stone-300 rounded-md w-20 font-mono"
                />
              </div>

              <button
                type="button"
                onClick={handleGenerateMatrix}
                className="px-3.5 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors"
              >
                Regenerate Matrix
              </button>
            </div>
          </div>

          {/* Interactive Matrix Table */}
          <div className="overflow-x-auto border border-stone-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3">Size / Age</th>
                  <th className="py-3 px-3">Chest (in)</th>
                  <th className="py-3 px-3">Waist (in)</th>
                  <th className="py-3 px-3">Length (in)</th>
                  <th className="py-3 px-3">Color</th>
                  <th className="py-3 px-3">SKU</th>
                  <th className="py-3 px-3">Price (₹)</th>
                  <th className="py-3 px-3">MRP (₹)</th>
                  <th className="py-3 px-3">Stock (Units)</th>
                  <th className="py-3 px-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-800">
                {variants.map((v, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-semibold font-mono">{v.size_name}</td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        step="0.5"
                        value={v.bust_inches}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          const updated = [...variants];
                          updated[idx].bust_inches = val;
                          updated[idx].bust_cm = Math.round(val * 2.54 * 10) / 10;
                          setVariants(updated);
                        }}
                        className="w-16 px-1.5 py-1 border border-stone-300 rounded text-xs font-mono"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        step="0.5"
                        value={v.waist_inches}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          const updated = [...variants];
                          updated[idx].waist_inches = val;
                          updated[idx].waist_cm = Math.round(val * 2.54 * 10) / 10;
                          setVariants(updated);
                        }}
                        className="w-16 px-1.5 py-1 border border-stone-300 rounded text-xs font-mono"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        step="0.5"
                        value={v.length_inches}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          const updated = [...variants];
                          updated[idx].length_inches = val;
                          updated[idx].length_cm = Math.round(val * 2.54 * 10) / 10;
                          setVariants(updated);
                        }}
                        className="w-16 px-1.5 py-1 border border-stone-300 rounded text-xs font-mono"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-stone-400"
                          style={{ backgroundColor: v.color_hex }}
                        />
                        <span className="truncate max-w-[90px]">{v.color_name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-stone-600">
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => {
                          const updated = [...variants];
                          updated[idx].sku = e.target.value;
                          setVariants(updated);
                        }}
                        className="w-28 px-1.5 py-1 border border-stone-300 rounded font-mono text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      <input
                        type="number"
                        value={v.price_rupees}
                        onChange={(e) => {
                          const updated = [...variants];
                          updated[idx].price_rupees = Number(e.target.value);
                          setVariants(updated);
                        }}
                        className="w-20 px-1.5 py-1 border border-stone-300 rounded font-mono text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-3 font-mono text-stone-500">
                      <input
                        type="number"
                        value={v.mrp_rupees}
                        onChange={(e) => {
                          const updated = [...variants];
                          updated[idx].mrp_rupees = Number(e.target.value);
                          setVariants(updated);
                        }}
                        className="w-20 px-1.5 py-1 border border-stone-300 rounded font-mono text-xs"
                      />
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      <input
                        type="number"
                        value={v.stock}
                        onChange={(e) => {
                          const updated = [...variants];
                          updated[idx].stock = Number(e.target.value);
                          setVariants(updated);
                        }}
                        className="w-16 px-1.5 py-1 border border-stone-300 rounded font-mono text-xs font-bold"
                      />
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => setVariants(variants.filter((_, i) => i !== idx))}
                        className="p-1 text-stone-400 hover:text-red-700 transition-colors"
                        aria-label="Remove variant"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Media Gallery */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="border-b border-stone-200 pb-3">
            <h2 className="text-lg font-bold font-serif text-stone-900">
              4. Media &amp; High-Resolution Photos
            </h2>
            <p className="text-xs text-stone-500">
              Add primary catalog photography and detail shots of the zari border and lining.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Primary Product Image URL *</label>
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-rose-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Alt Text (Accessibility) *</label>
              <input
                type="text"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="e.g. Royal Ruby Kanchipuram Pattu Pavadai front view"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-800"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/admin/products"
            className="px-5 py-2.5 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || !name}
            className="px-6 py-3 bg-rose-900 text-white text-sm font-semibold rounded-xl hover:bg-rose-800 shadow-warm-md transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {isSubmitting ? "Publishing Dress to Storefront..." : "Publish Dress to Storefront"}
          </button>
        </div>
      </form>
    </div>
  );
}

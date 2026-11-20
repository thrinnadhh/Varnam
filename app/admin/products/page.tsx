"use client";

import { useState, useEffect, useTransition } from "react";
import { getAdminProducts, createAdminProduct } from "@/app/admin/actions";
import { getCategories } from "@/lib/db/actions";
import { formatPrice } from "@/lib/utils";
import { AGE_SIZES } from "@/lib/schemas";
import { Plus, ShoppingBag, ShieldCheck, Check, AlertCircle } from "lucide-react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  // New Product Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [fabric, setFabric] = useState("Pure Chanderi Silk");
  const [lining, setLining] = useState("100% Breathable Malmal Cotton"); // Mandatory explicit!
  const [careInstructions, setCareInstructions] = useState("Dry clean only recommended for festive zari border.");
  const [isFeatured, setIsFeatured] = useState(false);

  // Standard Age Variants (2-14Y)
  const [priceRupees, setPriceRupees] = useState("1899");
  const [mrpRupees, setMrpRupees] = useState("2499");
  const [defaultStock, setDefaultStock] = useState("15");

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

      const variants = AGE_SIZES.map((size) => ({
        size_age: size,
        color_name: "Original",
        color_hex: "#881337",
        sku: `${slug.toUpperCase()}-${size}`,
        price: pricePaise,
        mrp: mrpPaise,
        stock,
        is_active: true,
      }));

      const res = await createAdminProduct({
        category_id: categoryId,
        name,
        slug,
        description,
        fabric,
        lining, // Mandatory explicit declaration!
        care_instructions: careInstructions,
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
        setFeedback("Dress and age variants created successfully!");
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
            Maintain dress styles, mandatory child-safe cotton lining specs, and age size stocks.
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
            Create Handcrafted Dress
          </h2>

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
                placeholder="e.g. Aadhya Rose Zari Lehenga"
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
                placeholder="aadhya-rose-zari-lehenga"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-stone-50"
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
                Stock Per Age Milestone *
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
                <th className="py-3 px-3">Dress</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Fabric & Inner Lining</th>
                <th className="py-3 px-3">Age Variants</th>
                <th className="py-3 px-3">Price Range</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((p) => {
                const minPrice = Math.min(...(p.product_variants || []).map((v: any) => v.price));
                const totalStock = (p.product_variants || []).reduce((acc: number, v: any) => acc + v.stock, 0);

                return (
                  <tr key={p.id} className="hover:bg-stone-50/50">
                    <td className="py-3 px-3">
                      <p className="font-bold text-stone-900 font-serif text-sm">
                        {p.name}
                      </p>
                      <p className="text-stone-400 font-mono text-[11px]">
                        /{p.slug}
                      </p>
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
                      <span className="font-mono">{p.product_variants?.length} ages</span>
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

"use client";

import { useState, useMemo } from "react";
import { ProductCard } from "@/components/product-card";
import {
  KIDS_AGE_SIZES,
  TEEN_SIZES,
  WOMEN_SIZES,
} from "@/lib/schemas";
import { ArrowUpDown, Sparkles, RefreshCw } from "lucide-react";

interface CatalogVariant {
  id: string;
  size_name?: string;
  size_age?: string | null;
  price: number;
  mrp: number;
  stock: number;
  color_name: string;
  color_hex?: string;
}

interface CatalogCategory {
  id: string;
  name: string;
  slug: string;
}

interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  segment?: string;
  fabric: string;
  lining: string;
  created_at: string;
  categories?: { name: string; slug: string } | null;
  product_variants: CatalogVariant[];
  product_images?: { image_url: string; is_primary?: boolean }[];
}

interface CatalogBrowserProps {
  initialProducts: CatalogProduct[];
  categories: CatalogCategory[];
  currentCategorySlug?: string;
  initialSegment?: string;
  initialSize?: string;
  initialAge?: string;
}

export function CatalogBrowser({
  initialProducts,
  categories,
  currentCategorySlug,
  initialSegment,
  initialSize,
  initialAge,
}: CatalogBrowserProps) {
  const [selectedSegment, setSelectedSegment] = useState<string>(
    initialSegment || "all"
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    currentCategorySlug || "all"
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    initialSize || initialAge || "all"
  );
  const [sortBy, setSortBy] = useState<string>("featured");

  const sizeOptions = useMemo(() => {
    if (selectedSegment === "women") {
      return WOMEN_SIZES;
    }
    if (selectedSegment === "teens") {
      return TEEN_SIZES;
    }
    if (selectedSegment === "girls") {
      return KIDS_AGE_SIZES;
    }
    return ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y", "12Y", "13-14Y", "15-16Y", "XS", "S", "M", "L", "XL"];
  }, [selectedSegment]);

  const filteredProducts = useMemo(() => {
    let list = [...initialProducts];

    if (selectedSegment !== "all") {
      list = list.filter((p) => p.segment === selectedSegment);
    }

    if (selectedCategory !== "all") {
      list = list.filter((p) => p.categories?.slug === selectedCategory);
    }

    if (selectedSize !== "all") {
      list = list.filter((p) =>
        p.product_variants.some(
          (v) => (v.size_name === selectedSize || v.size_age === selectedSize) && v.stock > 0
        )
      );
    }

    if (sortBy === "price_asc") {
      list.sort((a, b) => {
        const minA = Math.min(...a.product_variants.map((v) => v.price));
        const minB = Math.min(...b.product_variants.map((v) => v.price));
        return minA - minB;
      });
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => {
        const maxA = Math.max(...a.product_variants.map((v) => v.price));
        const maxB = Math.max(...b.product_variants.map((v) => v.price));
        return maxB - maxA;
      });
    } else if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return list;
  }, [initialProducts, selectedSegment, selectedCategory, selectedSize, sortBy]);

  const resetFilters = () => {
    setSelectedSegment("all");
    setSelectedCategory("all");
    setSelectedSize("all");
    setSortBy("featured");
  };

  const hasActiveFilters =
    selectedSegment !== "all" || selectedCategory !== "all" || selectedSize !== "all";

  return (
    <div className="space-y-6">
      {/* Kraft Filter & Control Bar */}
      <div className="rounded-2xl bg-[#FAF5EB] border border-[#D8C7AE] p-4 sm:p-5 shadow-[0_8px_24px_-6px_rgba(59,40,30,0.12)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Demographic Segment Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#EFE6D5] border border-[#D8C7AE]/60">
            <button
              type="button"
              onClick={() => setSelectedSegment("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedSegment === "all"
                  ? "bg-[#8B1E3F] text-[#FAF5EB] shadow-sm"
                  : "text-[#3B281E] hover:text-[#8B1E3F]"
              }`}
            >
              All Couture
            </button>
            <button
              type="button"
              onClick={() => setSelectedSegment("girls")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedSegment === "girls"
                  ? "bg-[#8B1E3F] text-[#FAF5EB] shadow-sm"
                  : "text-[#3B281E] hover:text-[#8B1E3F]"
              }`}
            >
              Girls (2–12Y)
            </button>
            <button
              type="button"
              onClick={() => setSelectedSegment("teens")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedSegment === "teens"
                  ? "bg-[#8B1E3F] text-[#FAF5EB] shadow-sm"
                  : "text-[#3B281E] hover:text-[#8B1E3F]"
              }`}
            >
              Teens (13–18Y)
            </button>
            <button
              type="button"
              onClick={() => setSelectedSegment("women")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedSegment === "women"
                  ? "bg-[#8B1E3F] text-[#FAF5EB] shadow-sm"
                  : "text-[#3B281E] hover:text-[#8B1E3F]"
              }`}
            >
              Women (XS–XXL)
            </button>
          </div>

          {/* Right Controls: Category filter & Sort by */}
          <div className="flex flex-wrap items-center gap-3">
            {categories.length > 0 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#FAF5EB] text-xs font-semibold text-[#261C17] border border-[#D8C7AE] focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]"
                aria-label="Filter by collection"
              >
                <option value="all">All Occasions &amp; Weaves</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}

            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-4 h-4 text-[#C69214]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#FAF5EB] text-xs font-semibold text-[#261C17] border border-[#D8C7AE] focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]"
                aria-label="Sort dresses"
              >
                <option value="featured">Featured Curations</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest Festive Arrivals</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#EFE6D5] text-xs font-bold text-[#8B1E3F] hover:bg-[#D8C7AE] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Daughter's Age / Size Filter Bar */}
        <div className="mt-4 pt-3 border-t border-[#D8C7AE]/60 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-[#6B574B] uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#C69214]" /> Quick Size:
          </span>

          <button
            type="button"
            onClick={() => setSelectedSize("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
              selectedSize === "all"
                ? "bg-[#3B281E] text-[#FAF5EB]"
                : "bg-[#EFE6D5] text-[#3B281E] hover:bg-[#D8C7AE]"
            }`}
          >
            All Sizes
          </button>

          {sizeOptions.map((sz) => (
            <button
              key={sz}
              type="button"
              onClick={() => setSelectedSize(sz)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 border ${
                selectedSize === sz
                  ? "bg-[#8B1E3F] text-[#FAF5EB] border-[#8B1E3F] shadow-sm"
                  : "bg-[#FAF5EB] text-[#3B281E] border-[#D8C7AE] hover:border-[#8B1E3F]"
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-[#6B574B] px-1">
        <span>
          Showing <strong>{filteredProducts.length}</strong> handcrafted dresses
        </span>
        <span className="text-[#145349] font-semibold">
          1-Inch Growth Seam Allowance on All Dresses
        </span>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-[#FAF5EB] border border-[#D8C7AE] p-12 text-center space-y-4">
          <p className="font-serif text-xl font-bold text-[#261C17]">
            No dresses found for the selected filter combination
          </p>
          <p className="text-xs text-[#6B574B] max-w-md mx-auto">
            Try adjusting your age or occasion filters to explore our complete celebratory wardrobe.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-5 py-2.5 rounded-xl bg-[#8B1E3F] text-[#FAF5EB] text-xs font-bold hover:bg-[#721531] transition-all"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}

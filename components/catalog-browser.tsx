"use client";

import { useState, useMemo } from "react";
import { ProductCard } from "@/components/product-card";
import {
  KIDS_AGE_SIZES,
  TEEN_SIZES,
  WOMEN_SIZES,
} from "@/lib/schemas";
import { Filter, ArrowUpDown, Sparkles, X } from "lucide-react";

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

  // Determine available size chips based on selected segment
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
    // If "all", combine distinct prominent sizes
    return ["XS", "S", "M", "L", "XL", "13-14Y", "6-7Y", "8-9Y", "2-3Y"];
  }, [selectedSegment]);

  // Client-side instant filter for snappy mobile experience
  const filteredProducts = useMemo(() => {
    let list = [...initialProducts];

    // 1. Segment filter
    if (selectedSegment !== "all") {
      list = list.filter((p) => p.segment === selectedSegment);
    }

    // 2. Category filter
    if (selectedCategory !== "all") {
      list = list.filter((p) => p.categories?.slug === selectedCategory);
    }

    // 3. Size filter
    if (selectedSize !== "all") {
      list = list.filter((p) =>
        p.product_variants?.some(
          (v) =>
            v.size_name === selectedSize || v.size_age === selectedSize
        )
      );
    }

    // 4. Sort
    if (sortBy === "price_asc") {
      list.sort((a, b) => {
        const minA = Math.min(...(a.product_variants || []).map((v) => v.price));
        const minB = Math.min(...(b.product_variants || []).map((v) => v.price));
        return minA - minB;
      });
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => {
        const minA = Math.min(...(a.product_variants || []).map((v) => v.price));
        const minB = Math.min(...(b.product_variants || []).map((v) => v.price));
        return minB - minA;
      });
    } else if (sortBy === "newest") {
      list.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    return list;
  }, [initialProducts, selectedSegment, selectedCategory, selectedSize, sortBy]);

  const handleResetFilters = () => {
    setSelectedSegment("all");
    setSelectedCategory("all");
    setSelectedSize("all");
  };

  const hasActiveFilters =
    selectedSegment !== "all" ||
    selectedCategory !== "all" ||
    selectedSize !== "all";

  return (
    <div className="space-y-6">
      {/* Filter and Sort Toolbar */}
      <div className="bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-warm-sm space-y-4">
        {/* Row 1: Segment Switcher Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-text-muted mr-1 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-primary" /> Segment:
          </span>
          <button
            type="button"
            onClick={() => {
              setSelectedSegment("all");
              setSelectedSize("all");
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
              selectedSegment === "all"
                ? "bg-brand-primary text-white shadow-sm"
                : "bg-canvas text-text-body hover:bg-border"
            }`}
          >
            All Segments
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedSegment("women");
              setSelectedSize("all");
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
              selectedSegment === "women"
                ? "bg-brand-primary text-white shadow-sm"
                : "bg-canvas text-text-body hover:bg-border"
            }`}
          >
            Women (XS–XXL)
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedSegment("teens");
              setSelectedSize("all");
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
              selectedSegment === "teens"
                ? "bg-brand-primary text-white shadow-sm"
                : "bg-canvas text-text-body hover:bg-border"
            }`}
          >
            Teens (13–18Y)
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedSegment("girls");
              setSelectedSize("all");
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
              selectedSegment === "girls"
                ? "bg-brand-primary text-white shadow-sm"
                : "bg-canvas text-text-body hover:bg-border"
            }`}
          >
            Girls (2–12Y)
          </button>
        </div>

        {/* Row 2: Occasion Category Pills */}
        <div className="pt-2 border-t border-border-subtle flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-text-muted mr-1 shrink-0">
            Occasion:
          </span>
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all ${
              selectedCategory === "all"
                ? "bg-stone-800 text-white shadow-sm"
                : "bg-canvas text-text-body hover:bg-border"
            }`}
          >
            All Occasions
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                selectedCategory === cat.slug
                  ? "bg-stone-800 text-white shadow-sm"
                  : "bg-canvas text-text-body hover:bg-border"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Row 3: Sizing Pills & Sort Bar */}
        <div className="pt-2 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-semibold text-text-muted mr-1 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              {selectedSegment === "girls"
                ? "Age:"
                : selectedSegment === "women"
                ? "Size:"
                : "Size/Age:"}
            </span>
            <button
              type="button"
              onClick={() => setSelectedSize("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                selectedSize === "all"
                  ? "bg-brand-secondary text-white"
                  : "bg-canvas text-text-muted hover:text-text-heading"
              }`}
            >
              All Sizes
            </button>
            {sizeOptions.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  selectedSize === size
                    ? "bg-brand-secondary text-white shadow-sm"
                    : "bg-canvas text-text-muted hover:text-text-heading"
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-text-muted" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs bg-canvas border border-border rounded-lg px-2.5 py-1.5 text-text-heading font-medium focus:outline-none focus:ring-1 focus:ring-brand-primary"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest Additions</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-text-muted px-1">
        <span>
          Showing <strong className="text-text-heading">{filteredProducts.length}</strong> styles
          {selectedSegment !== "all" && (
            <> in <span className="capitalize font-semibold text-brand-primary">{selectedSegment}</span></>
          )}
          {selectedCategory !== "all" && (
            <> • {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}</>
          )}
          {selectedSize !== "all" && (
            <> • Size <strong className="text-brand-secondary">{selectedSize}</strong></>
          )}
        </span>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-brand-primary hover:underline font-semibold flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" /> Clear All Filters
          </button>
        )}
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-surface rounded-2xl border border-border">
          <p className="font-serif text-lg font-bold text-text-heading">
            No styles found for selected filters
          </p>
          <p className="text-xs text-text-muted mt-1">
            Try switching demographic segments or resetting your size and occasion filters.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 bg-brand-primary text-white text-xs font-semibold rounded-xl hover:bg-brand-primary-hover transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

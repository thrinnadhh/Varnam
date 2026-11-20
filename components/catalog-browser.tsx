"use client";

import { useState, useMemo } from "react";
import { ProductCard } from "@/components/product-card";
import { AGE_SIZES } from "@/lib/schemas";
import { Filter, SlidersHorizontal, ArrowUpDown } from "lucide-react";

interface CatalogBrowserProps {
  initialProducts: any[];
  categories: any[];
  currentCategorySlug?: string;
  initialAge?: string;
}

export function CatalogBrowser({
  initialProducts,
  categories,
  currentCategorySlug,
  initialAge,
}: CatalogBrowserProps) {
  const [selectedAge, setSelectedAge] = useState<string>(initialAge || "all");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    currentCategorySlug || "all"
  );
  const [sortBy, setSortBy] = useState<string>("featured");

  // Client-side instant filter for snappy mobile experience
  const filteredProducts = useMemo(() => {
    let list = [...initialProducts];

    if (selectedCategory !== "all") {
      list = list.filter((p) => p.categories?.slug === selectedCategory);
    }

    if (selectedAge !== "all") {
      list = list.filter((p) =>
        p.product_variants?.some((v: any) => v.size_age === selectedAge)
      );
    }

    if (sortBy === "price_asc") {
      list.sort((a, b) => {
        const minA = Math.min(...a.product_variants.map((v: any) => v.price));
        const minB = Math.min(...b.product_variants.map((v: any) => v.price));
        return minA - minB;
      });
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => {
        const minA = Math.min(...a.product_variants.map((v: any) => v.price));
        const minB = Math.min(...b.product_variants.map((v: any) => v.price));
        return minB - minA;
      });
    } else if (sortBy === "newest") {
      list.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    return list;
  }, [initialProducts, selectedCategory, selectedAge, sortBy]);

  return (
    <div className="space-y-6">
      {/* Filter and Sort Toolbar */}
      <div className="bg-surface rounded-2xl border border-border p-4 shadow-warm-sm space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
              selectedCategory === "all"
                ? "bg-brand-primary text-white shadow-sm"
                : "bg-canvas text-text-body hover:bg-border"
            }`}
          >
            All Styles
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                selectedCategory === cat.slug
                  ? "bg-brand-primary text-white shadow-sm"
                  : "bg-canvas text-text-body hover:bg-border"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Age Milestones Pills */}
        <div className="pt-2 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-semibold text-text-muted mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Age:
            </span>
            <button
              type="button"
              onClick={() => setSelectedAge("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedAge === "all"
                  ? "bg-brand-secondary text-white"
                  : "bg-canvas text-text-muted hover:text-text-heading"
              }`}
            >
              All Ages
            </button>
            {AGE_SIZES.map((age) => (
              <button
                key={age}
                type="button"
                onClick={() => setSelectedAge(age)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedAge === age
                    ? "bg-brand-secondary text-white shadow-sm"
                    : "bg-canvas text-text-muted hover:text-text-heading"
                }`}
              >
                {age}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
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
        <span>Showing {filteredProducts.length} dresses</span>
        {(selectedAge !== "all" || selectedCategory !== "all") && (
          <button
            type="button"
            onClick={() => {
              setSelectedAge("all");
              setSelectedCategory("all");
            }}
            className="text-brand-primary hover:underline font-semibold"
          >
            Clear Filters
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
            No dresses found for selected filters
          </p>
          <p className="text-xs text-text-muted mt-1">
            Try clearing the age or category filters to view other celebratory collections.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedAge("all");
              setSelectedCategory("all");
            }}
            className="mt-4 px-4 py-2 bg-brand-primary text-white text-xs font-semibold rounded-xl hover:bg-brand-primary-hover"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

import { notFound } from "next/navigation";
import { getCategories, getProducts } from "@/lib/db/actions";
import { CatalogBrowser } from "@/components/catalog-browser";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ segment?: "girls" | "teens" | "women"; age?: string; size?: string }>;
}) {
  const { category: categorySlug } = await params;
  const { segment, age, size } = await searchParams;

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  const currentCategory = categories.find((c) => c.slug === categorySlug);
  if (!currentCategory) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-6">
        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-secondary">
          {currentCategory.segment === "all"
            ? "Women • Teens • Girls Collection"
            : `${currentCategory.segment} Collection`}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-heading mt-0.5">
          {currentCategory.name}
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1">
          {currentCategory.description}
        </p>
      </div>

      <CatalogBrowser
        initialProducts={products}
        categories={categories}
        currentCategorySlug={categorySlug}
        initialSegment={segment}
        initialSize={size}
        initialAge={age}
      />
    </div>
  );
}

import { notFound } from "next/navigation";
import { getCategories, getProducts } from "@/lib/db/actions";
import { CatalogBrowser } from "@/components/catalog-browser";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ segment?: "girls" | "teens" | "women"; age?: string; size?: string; ageSize?: string }>;
}) {
  const { category: categorySlug } = await params;
  const { segment, age, size, ageSize } = await searchParams;
  const targetAgeSize = ageSize || age || size;

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({
      categorySlug,
      segment,
      sizeName: targetAgeSize,
    }),
  ]);

  const currentCategory = categories.find((c) => c.slug === categorySlug);
  if (!currentCategory) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-[#FAF5EB] border border-[#D8C7AE] p-6 sm:p-8 shadow-[0_8px_24px_-6px_rgba(59,40,30,0.12)]">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#8B1E3F]">
          {currentCategory.segment === "all"
            ? "Indian Festive Couture Collection"
            : `${currentCategory.segment} Celebratory Collection`}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#261C17] mt-1">
          {currentCategory.name}
        </h1>
        {currentCategory.description && (
          <p className="text-xs sm:text-sm text-[#6B574B] mt-2 max-w-2xl leading-relaxed">
            {currentCategory.description}
          </p>
        )}
      </div>

      <CatalogBrowser
        initialProducts={products}
        categories={categories}
        currentCategorySlug={categorySlug}
        initialSegment={segment}
        initialSize={targetAgeSize}
        initialAge={targetAgeSize}
      />
    </div>
  );
}

import { getCategories, getProducts } from "@/lib/db/actions";
import { CatalogBrowser } from "@/components/catalog-browser";

export const dynamic = "force-dynamic";

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ age?: string }>;
}) {
  const { age } = await searchParams;
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-6">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-heading">
          All Girls' Apparel & Dresses
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1">
          Explore handcrafted lehengas, party frocks, and pure cotton dresses for ages 2–14Y
        </p>
      </div>

      <CatalogBrowser
        initialProducts={products}
        categories={categories}
        initialAge={age}
      />
    </div>
  );
}

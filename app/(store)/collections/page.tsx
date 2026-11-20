import { getCategories, getProducts } from "@/lib/db/actions";
import { CatalogBrowser } from "@/components/catalog-browser";
import { SmoothScroll } from "@/components/smooth-scroll";

export const dynamic = "force-dynamic";

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ segment?: "girls" | "teens" | "women"; age?: string; size?: string }>;
}) {
  const { segment, age, size } = await searchParams;
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  const segmentTitle =
    segment === "women"
      ? "Women's Couture & Celebratory Dresses"
      : segment === "teens"
      ? "Teens Couture & Partywear (13–18Y)"
      : segment === "girls"
      ? "Girls' Apparel & Dresses (2–12Y)"
      : "All Couture & Dresses — Women, Teens & Girls";

  const segmentSubtitle =
    segment === "women"
      ? "Handcrafted raw silk anarkalis, bridal party wear, and organza gowns in sizes XS–XXL with complete bust/hip measurements."
      : segment === "teens"
      ? "Contemporary festive co-ord sets, tiered gowns, and fusion partywear tailored for teenagers."
      : segment === "girls"
      ? "Handcrafted zari lehengas, pure cotton twirl frocks, and child-safe festive wear with guaranteed cotton linings."
      : "Explore handcrafted lehengas, royal anarkalis, tiered party frocks, and breathable cotton dresses.";

  return (
    <SmoothScroll>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-6">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-text-heading">
          {segmentTitle}
        </h1>
        <p className="text-xs sm:text-sm text-text-muted mt-1">
          {segmentSubtitle}
        </p>
      </div>

      <CatalogBrowser
        initialProducts={products}
        categories={categories}
        initialSegment={segment}
        initialSize={size}
        initialAge={age}
      />
    </div>
    </SmoothScroll>
  );
}

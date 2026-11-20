import { getCategories, getProducts, getHeroBanners, getStoreSettings } from "@/lib/db/actions";
import { CatalogBrowser } from "@/components/catalog-browser";
import { BannerCarousel } from "@/components/banner-carousel";

export const dynamic = "force-dynamic";

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ segment?: "girls" | "teens" | "women"; age?: string; size?: string; ageSize?: string }>;
}) {
  const { segment, age, size, ageSize } = await searchParams;
  const targetAgeSize = ageSize || age || size;

  const [categories, products, heroBanners, storeSettings] = await Promise.all([
    getCategories(),
    getProducts({
      segment,
      sizeName: targetAgeSize,
    }),
    getHeroBanners(),
    getStoreSettings(),
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
      : "Explore handcrafted lehengas, royal anarkalis, tiered party frocks, and breathable cotton dresses with 1-inch inner growth seam allowance.";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-[#FAF5EB] border border-[#D8C7AE] p-6 shadow-[0_8px_24px_-6px_rgba(59,40,30,0.12)]">
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#261C17]">
          {segmentTitle}
        </h1>
        <p className="text-xs sm:text-sm text-[#6B574B] mt-2 max-w-3xl leading-relaxed">
          {segmentSubtitle}
        </p>
      </div>

      {heroBanners.length > 0 && (
        <div className="w-full">
          <BannerCarousel
            banners={heroBanners}
            durationSec={storeSettings?.hero_banner_duration_sec || 3}
          />
        </div>
      )}

      <CatalogBrowser
        initialProducts={products}
        categories={categories}
        initialSegment={segment}
        initialSize={targetAgeSize}
        initialAge={targetAgeSize}
      />
    </div>
  );
}

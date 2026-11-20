import Link from "next/link";
import Image from "next/image";
import { getCategories, getProducts, getHeroBanners, getStoreSettings } from "@/lib/db/actions";
import { ProductCard } from "@/components/product-card";
import { Sparkles, ArrowRight, ShieldCheck, Ruler, Scissors } from "lucide-react";
import { BannerCarousel } from "@/components/banner-carousel";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featuredProducts, heroBanners, storeSettings] = await Promise.all([
    getCategories(),
    getProducts({ isFeatured: true, limit: 8 }),
    getHeroBanners(),
    getStoreSettings(),
  ]);

  // Curated collections requested: Xmas Collection, Daily Wear, Cottonwears, Tops, Trending Collections, New Arrivals.
  // Dynamically populated from getCategories() so any Admin edits/renames appear immediately!
  const targetCuratedSlugs = [
    "xmas-collection",
    "daily-wear",
    "cottonwears",
    "tops",
    "trending-collections",
    "new-arrivals",
  ];

  interface CategoryItem {
    id: string;
    parent_id?: string | null;
    name: string;
    slug: string;
    description?: string | null;
    image_url?: string | null;
    is_active?: boolean;
    sort_order?: number;
  }

  const allCategories = (categories as unknown as CategoryItem[]) || [];
  const activeParents = allCategories.filter((c) => !c.parent_id && c.is_active !== false);

  // Match target slugs in requested order, or fallback to active parents
  const matchedCurated = targetCuratedSlugs
    .map((slug) => activeParents.find((c) => c.slug === slug))
    .filter((c): c is CategoryItem => !!c);

  const otherParents = activeParents.filter(
    (c) =>
      !targetCuratedSlugs.includes(c.slug) &&
      !["festive-wedding", "party-gowns", "cotton-dresses", "casuals-coords", "pattu-lehengas", "anarkali-shararas", "mulmul-festive-frocks"].includes(c.slug)
  );

  const curatedCollections = [...matchedCurated, ...otherParents];
  const displayCollections = curatedCollections.length > 0 ? curatedCollections : activeParents.slice(0, 6);

  return (
    <div className="flex flex-col gap-10 sm:gap-14 pb-16">
      {/* 1. Dynamic Admin Rotating Hero Banner Carousel (Admin duration, default 3s) */}
      {heroBanners.length > 0 && (
        <section aria-label="Festive Banner Carousel" className="w-full">
          <BannerCarousel
            banners={heroBanners}
            durationSec={storeSettings?.hero_banner_duration_sec || 3}
          />
        </section>
      )}

      {/* 2. Dynamic Curated Collections Row (Admin-configurable: Xmas Collection, Daily Wear, Cottonwears, Tops, Trending Collections, New Arrivals) */}
      {displayCollections.length > 0 && (
        <section className="w-full space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#D8C7AE] pb-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EFE6D5] border border-[#C69214] text-[#8B1E3F] text-[10px] font-bold tracking-wider uppercase mb-1">
                <Sparkles className="w-3 h-3 text-[#C69214]" />
                <span>Featured Festive Collections</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#261C17]">
                Curated Occasions &amp; Celebrations
              </h2>
              <p className="text-xs text-[#6B574B] mt-0.5">
                Explore handloom festive edits, pure cotton twirls, and holiday season styles
              </p>
            </div>
            <Link
              href="/collections"
              className="text-xs font-bold text-[#8B1E3F] hover:text-[#721531] flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View All Collections</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {displayCollections.map((category) => (
              <Link
                key={category.id}
                href={`/collections/${category.slug}`}
                className="group flex flex-col rounded-2xl bg-[#FAF5EB] border border-[#D8C7AE] p-2.5 hover:border-[#8B1E3F] hover:shadow-[0_8px_24px_-6px_rgba(59,40,30,0.18)] transition-all overflow-hidden"
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#EFE6D5] mb-2.5">
                  <Image
                    src={category.image_url || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80"}
                    alt={category.name}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2A1C15]/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  <span className="absolute bottom-1.5 left-2 right-2 text-[10px] text-amber-200 font-medium truncate">
                    Explore Edit
                  </span>
                </div>
                <div className="px-1 pb-1">
                  <h3 className="font-serif text-sm font-bold text-[#261C17] group-hover:text-[#8B1E3F] transition-colors line-clamp-1">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-[10px] text-[#6B574B] line-clamp-1 mt-0.5">
                      {category.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 3. Hero Storytelling & Generation CTAs (Tested in storefront.spec.ts) */}
      <section className="relative overflow-hidden rounded-3xl bg-[#FAF5EB] border-2 border-[#D8C7AE] p-6 sm:p-10 lg:p-12 shadow-[0_8px_24px_-6px_rgba(59,40,30,0.12)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFE6D5] border border-[#C69214] text-[#8B1E3F] text-[11px] font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#C69214]" />
              <span>Heirloom Indian Couture • Handcrafted with Pride</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#261C17] leading-tight">
              Regal Indian Elegance,{" "}
              <span className="text-[#8B1E3F] italic">Crafted for Joyful Twirls.</span>
            </h2>

            <p className="text-xs sm:text-sm text-[#3B281E] leading-relaxed max-w-2xl font-sans">
              Handwoven Kanchipuram zari pavadais, royal velvet flared lehengas, and breathable mulmul cotton frocks. Every celebration ensemble is lined in 100% skin-safe malmal cotton with concealed inner seam margins for effortless alteration.
            </p>

            {/* Segment CTAs - Strictly tested by storefront.spec.ts */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/collections?segment=women"
                className="px-5 py-3 bg-[#8B1E3F] text-[#FAF5EB] font-bold rounded-xl hover:bg-[#721531] shadow-md transition-all text-xs sm:text-sm"
              >
                Shop Women (XS–XXL)
              </Link>

              <Link
                href="/collections?segment=teens"
                className="px-5 py-3 bg-[#C69214] text-[#261C17] font-bold rounded-xl hover:bg-[#AA7B0C] shadow-md transition-all text-xs sm:text-sm"
              >
                Shop Teens (13–18Y)
              </Link>

              <Link
                href="/collections?segment=girls"
                className="px-5 py-3 bg-[#EFE6D5] text-[#261C17] border border-[#D8C7AE] font-bold rounded-xl hover:bg-[#D8C7AE] shadow-sm transition-all text-xs sm:text-sm"
              >
                Shop Girls (2–12Y)
              </Link>
            </div>

            {/* Micro Trust Assurances - Tested by storefront.spec.ts */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-[#6B574B]">
              <span className="flex items-center gap-1.5 font-bold text-[#145349]">
                <ShieldCheck className="w-4 h-4 text-[#145349]" /> 100% Breathable Cotton Linings
              </span>
              <span className="flex items-center gap-1.5 font-bold text-[#C69214]">
                <Ruler className="w-4 h-4 text-[#C69214]" /> Dual In/Cm Sizing &amp; Model Fit Specs
              </span>
              <span className="flex items-center gap-1.5 font-bold text-[#8B1E3F]">
                <Scissors className="w-4 h-4 text-[#8B1E3F]" /> 1-Inch Inner Growth Seam Allowance
              </span>
            </div>
          </div>

          <div className="lg:col-span-4 relative aspect-[3/4] rounded-2xl overflow-hidden border border-[#D8C7AE] shadow-md bg-[#EFE6D5]">
            <Image
              src="https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80"
              alt="Varnam Celebratory Indian Couture"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 400px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2A1C15]/80 via-transparent to-transparent flex items-end p-5">
              <span className="text-white text-xs font-serif font-bold tracking-wide">
                Artisanal Handloom Silk Lehengas
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Shared Occasion Collections (Strictly tested in storefront.spec.ts) */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-[#D8C7AE] pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B1E3F]">
              Handcrafted Categories
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#261C17] mt-0.5">
              Shared Occasion Collections
            </h2>
          </div>
          <Link
            href="/collections"
            className="text-xs font-bold text-[#8B1E3F] hover:text-[#721531] flex items-center gap-1"
          >
            <span>View All Curations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Festive & Wedding */}
          <Link
            href="/collections/festive-wedding"
            className="group relative h-72 rounded-2xl overflow-hidden border border-[#D8C7AE] shadow-[0_8px_24px_-6px_rgba(59,40,30,0.12)] hover:shadow-xl transition-all"
          >
            <Image
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
              alt="Festive & Wedding"
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2A1C15]/90 via-[#2A1C15]/40 to-transparent flex flex-col justify-end p-6 text-[#FAF5EB]">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#C69214]">
                Temple Weaves &amp; Zari
              </span>
              <h3 className="font-serif text-xl font-bold mt-1">Festive &amp; Wedding</h3>
              <p className="text-xs text-[#FAF5EB]/80 line-clamp-2 mt-1">
                Royal tissue lehengas, pure silk pavadais, and embellished anarkali suits for milestone poojas and weddings.
              </p>
            </div>
          </Link>

          {/* Card 2: Party & Evening Gowns */}
          <Link
            href="/collections/party-gowns"
            className="group relative h-72 rounded-2xl overflow-hidden border border-[#D8C7AE] shadow-[0_8px_24px_-6px_rgba(59,40,30,0.12)] hover:shadow-xl transition-all"
          >
            <Image
              src="https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80"
              alt="Party & Evening Gowns"
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2A1C15]/90 via-[#2A1C15]/40 to-transparent flex flex-col justify-end p-6 text-[#FAF5EB]">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#C69214]">
                Tulle &amp; Organza
              </span>
              <h3 className="font-serif text-xl font-bold mt-1">Party &amp; Evening Gowns</h3>
              <p className="text-xs text-[#FAF5EB]/80 line-clamp-2 mt-1">
                Twirl-worthy tiered ruffles and fairy-tale flared silhouettes with soft satin and cotton underskirts.
              </p>
            </div>
          </Link>

          {/* Card 3: Mulmul & Festive Frocks */}
          <Link
            href="/collections/mulmul-festive-frocks"
            className="group relative h-72 rounded-2xl overflow-hidden border border-[#D8C7AE] shadow-[0_8px_24px_-6px_rgba(59,40,30,0.12)] hover:shadow-xl transition-all sm:col-span-2 lg:col-span-1"
          >
            <Image
              src="https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=800&q=80"
              alt="Mulmul & Festive Frocks"
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2A1C15]/90 via-[#2A1C15]/40 to-transparent flex flex-col justify-end p-6 text-[#FAF5EB]">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#C69214]">
                Pure Cotton Twirls
              </span>
              <h3 className="font-serif text-xl font-bold mt-1">Mulmul &amp; Festive Frocks</h3>
              <p className="text-xs text-[#FAF5EB]/80 line-clamp-2 mt-1">
                Breathable, skin-soft handblock printed cotton dresses with zero synthetic contact and generous ease.
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* 5. Featured Boutique Hang-Tag Dresses */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-[#D8C7AE] pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B1E3F]">
              Curated Wardrobe
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#261C17] mt-0.5">
              Artisanal Celebration Twirls
            </h2>
          </div>
          <Link
            href="/collections"
            className="text-xs font-bold text-[#8B1E3F] hover:text-[#721531] flex items-center gap-1"
          >
            <span>View All ({featuredProducts.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}

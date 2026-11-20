import Link from "next/link";
import Image from "next/image";
import { getCategories, getProducts } from "@/lib/db/actions";
import { ProductCard } from "@/components/product-card";
import { Sparkles, ArrowRight, ShieldCheck, HeartHandshake, Ruler, Users } from "lucide-react";
import { HomeHeroMotion } from "@/components/home-hero-motion";
import { SmoothScroll } from "@/components/smooth-scroll";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featuredProducts] = await Promise.all([
    getCategories(),
    getProducts({ isFeatured: true, limit: 8 }),
  ]);

  return (
    <SmoothScroll>
      <div className="flex flex-col gap-12 sm:gap-16 pb-16">
      {/* Hero Section with GSAP Storytelling Animation */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-primary-subtle/70 via-canvas to-canvas pt-8 pb-12 sm:pt-12 sm:pb-20 border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-secondary-subtle border border-brand-secondary-border text-brand-secondary text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Heirloom Festive Couture • Women • Teens • Girls</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-text-heading tracking-tight leading-[1.15]">
                Regal Indian Elegance,{" "}
                <span className="text-brand-primary italic">Across Generations.</span>
              </h1>

              <p className="text-sm sm:text-base text-text-body max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Handcrafted zari anarkalis for women, contemporary festive co-ord sets for teens, and whimsical cotton twirl frocks for girls. Every garment features breathable, 100% natural cotton inner linings and precision fit.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  href="/collections?segment=women"
                  className="px-5 py-3 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-primary-hover shadow-warm-md hover:shadow-warm-lg transition-all text-xs sm:text-sm"
                >
                  Shop Women (XS–XXL)
                </Link>

                <Link
                  href="/collections?segment=teens"
                  className="px-5 py-3 bg-brand-secondary text-white font-semibold rounded-xl hover:bg-brand-secondary-hover shadow-warm-sm transition-all text-xs sm:text-sm"
                >
                  Shop Teens (13–18Y)
                </Link>

                <Link
                  href="/collections?segment=girls"
                  className="px-5 py-3 bg-surface text-text-heading border border-border font-semibold rounded-xl hover:bg-canvas shadow-warm-sm transition-all text-xs sm:text-sm"
                >
                  Shop Girls (2–12Y)
                </Link>
              </div>

              {/* Micro-assurances */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-text-muted">
                <span className="flex items-center gap-1.5 font-medium text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" /> 100% Breathable Cotton Linings
                </span>
                <span className="flex items-center gap-1.5 font-medium text-brand-secondary">
                  <Ruler className="w-4 h-4" /> Dual In/Cm Sizing & Model Fit Specs
                </span>
                <span className="flex items-center gap-1.5 font-medium text-amber-800">
                  <Users className="w-4 h-4 text-amber-700" /> Mom & Daughter Twinning Edits
                </span>
              </div>
            </div>

            {/* Right Hero Image Showcase with GSAP Scoped Motion */}
            <div className="lg:col-span-5 relative">
              <HomeHeroMotion />
            </div>
          </div>
        </div>
      </section>

      {/* 3-Segment Demographic Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-secondary">
            Tailored For Every Stage
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-heading mt-1">
            Choose Your Silhouette
          </h2>
          <p className="text-xs sm:text-sm text-text-muted mt-1.5">
            Distinctive design languages, specific size charts, and model fit disclosures crafted for each demographic.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Women */}
          <Link
            href="/collections?segment=women"
            className="group relative rounded-2xl overflow-hidden border border-border bg-surface p-6 shadow-warm-sm hover:shadow-warm-md hover:border-brand-primary/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-rose-50 text-brand-primary text-[11px] font-bold mb-3 border border-rose-100">
                Sizes XS–XXL • Numeric 28–38
              </div>
              <h3 className="font-serif text-xl font-bold text-text-heading group-hover:text-brand-primary transition-colors">
                Women's Couture
              </h3>
              <p className="text-xs text-text-body mt-2 leading-relaxed">
                Royal Raw Silk Anarkalis, Hand-Painted Organza Gowns, and structured wedding ensembles. Model height and size disclosures with bust and hip measurements.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between text-xs font-semibold text-brand-primary">
              <span>Browse Women's Edits</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Teens */}
          <Link
            href="/collections?segment=teens"
            className="group relative rounded-2xl overflow-hidden border border-border bg-surface p-6 shadow-warm-sm hover:shadow-warm-md hover:border-brand-primary/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-[11px] font-bold mb-3 border border-amber-200">
                Ages 13–18Y • Youth XS–M
              </div>
              <h3 className="font-serif text-xl font-bold text-text-heading group-hover:text-brand-primary transition-colors">
                Teens Couture
              </h3>
              <p className="text-xs text-text-body mt-2 leading-relaxed">
                Mint & Gold Tissue Co-ord Sets, Lavender Ombré Tiered Gowns, and Indo-Western edits tailored specifically for growing teenage silhouettes.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between text-xs font-semibold text-brand-primary">
              <span>Browse Teen Edits</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Girls */}
          <Link
            href="/collections?segment=girls"
            className="group relative rounded-2xl overflow-hidden border border-border bg-surface p-6 shadow-warm-sm hover:shadow-warm-md hover:border-brand-primary/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold mb-3 border border-emerald-100">
                Ages 2–12Y • True-to-Age Fit
              </div>
              <h3 className="font-serif text-xl font-bold text-text-heading group-hover:text-brand-primary transition-colors">
                Girls' Apparel & Dresses
              </h3>
              <p className="text-xs text-text-body mt-2 leading-relaxed">
                Handcrafted Zari Lehengas and Pure Cotton Twirl Frocks with guaranteed itch-free cotton inner linings and +2 inch growth room margins.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between text-xs font-semibold text-brand-primary">
              <span>Browse Girls' Edits</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* Curated Occasion Collections Carousel / Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-heading">
              Shared Occasion Collections
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              Coordinated family edits, sangeet party wear, and festive celebrations
            </p>
          </div>
          <Link
            href="/collections"
            className="text-xs sm:text-sm font-semibold text-brand-primary hover:text-brand-primary-hover flex items-center gap-1"
          >
            All Collections <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/collections/${cat.slug}`}
              className="group relative h-80 rounded-2xl overflow-hidden border border-border shadow-warm-sm hover:shadow-warm-md transition-all duration-300"
            >
              <Image
                src={
                  cat.image_url ||
                  "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80"
                }
                alt={cat.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  {cat.segment === "all" ? "Women • Teens • Girls" : cat.segment}
                </span>
                <h3 className="font-serif text-lg font-bold mt-1 group-hover:text-amber-200 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-white/80 line-clamp-1 mt-0.5">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Styles Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-heading">
              Featured Handcrafted Styles
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              Curated masterworks across Women, Teens, and Girls collections
            </p>
          </div>
          <Link
            href="/collections"
            className="text-xs sm:text-sm font-semibold text-brand-primary hover:text-brand-primary-hover flex items-center gap-1"
          >
            Explore Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
    </SmoothScroll>
  );
}

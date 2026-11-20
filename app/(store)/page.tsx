import Link from "next/link";
import Image from "next/image";
import { getCategories, getProducts } from "@/lib/db/actions";
import { ProductCard } from "@/components/product-card";
import { AGE_SIZES } from "@/lib/schemas";
import { Sparkles, ArrowRight, ShieldCheck, HeartHandshake, RefreshCw, Ruler } from "lucide-react";
import { HomeHeroMotion } from "@/components/home-hero-motion";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featuredProducts] = await Promise.all([
    getCategories(),
    getProducts({ isFeatured: true, limit: 8 }),
  ]);

  return (
    <div className="flex flex-col gap-12 sm:gap-16 pb-16">
      {/* Hero Section with GSAP Storytelling Animation */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-primary-subtle/70 via-canvas to-canvas pt-8 pb-12 sm:pt-12 sm:pb-20 border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-secondary-subtle border border-brand-secondary-border text-brand-secondary text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>The Grand Festive & Wedding Edits • Ages 2–14Y</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-text-heading tracking-tight leading-[1.15]">
                Regal Indian Elegance,{" "}
                <span className="text-brand-primary italic">Child-Safe Comfort.</span>
              </h1>

              <p className="text-sm sm:text-base text-text-body max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Handcrafted zari lehengas, whimsical tiered tulle party gowns, and pure cotton twirl frocks. Every dress is tailored with breathable, 100% cotton inner linings and hidden growth room.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/collections/festive-ethnic"
                  className="px-6 py-3.5 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-primary-hover shadow-warm-md hover:shadow-warm-lg transition-all flex items-center gap-2 text-sm"
                >
                  Explore Festive Collection <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/collections"
                  className="px-6 py-3.5 bg-surface text-text-heading border border-border font-semibold rounded-xl hover:bg-canvas shadow-warm-sm transition-all text-sm"
                >
                  Browse All 42 Styles
                </Link>
              </div>

              {/* Micro-assurances for parents */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-text-muted">
                <span className="flex items-center gap-1.5 font-medium text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" /> 100% Breathable Cotton Linings
                </span>
                <span className="flex items-center gap-1.5 font-medium text-brand-secondary">
                  <Ruler className="w-4 h-4" /> +2 Inch Growth Margins
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

      {/* Quick Age Milestone Sizing Selector */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-warm-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
            <div>
              <h2 className="font-serif font-bold text-lg text-text-heading">
                Shop Directly by Your Girl's Age
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Precision sizing for toddlers, schoolgirls, and pre-teens
              </p>
            </div>
            <span className="text-xs font-semibold text-brand-secondary bg-brand-secondary-subtle px-3 py-1 rounded-full self-start sm:self-auto">
              💡 Tip: Sizing is true-to-fit with grow room
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-4">
            {AGE_SIZES.map((age) => (
              <Link
                key={age}
                href={`/collections?age=${encodeURIComponent(age)}`}
                className="group flex flex-col items-center justify-center p-3.5 rounded-xl border border-border hover:border-brand-primary bg-canvas hover:bg-brand-primary-subtle transition-all text-center"
              >
                <span className="text-base font-bold text-text-heading group-hover:text-brand-primary transition-colors">
                  {age}
                </span>
                <span className="text-[10px] text-text-muted group-hover:text-brand-primary/80 transition-colors mt-0.5">
                  View Dresses →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Curated Categories Carousel / Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-heading">
              Curated Occasion Collections
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              From joyful festive twirls to soft daily playtime essentials
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
                  Girls 2–14Y
                </span>
                <h3 className="font-serif font-bold text-xl mt-0.5 group-hover:translate-x-1 transition-transform">
                  {cat.name}
                </h3>
                <p className="text-xs text-stone-200 mt-1 line-clamp-1">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Dresses Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-brand-secondary font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Featured Celebrations
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-heading mt-1">
              Loved by Girls & Verified by Moms
            </h2>
          </div>
          <Link
            href="/collections"
            className="text-xs sm:text-sm font-semibold text-brand-primary hover:text-brand-primary-hover flex items-center gap-1"
          >
            View All Dresses <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </section>
    </div>
  );
}

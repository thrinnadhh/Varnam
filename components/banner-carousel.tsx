"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";

export interface BannerItem {
  id: string;
  title: string;
  subtitle?: string | null;
  cta_label: string;
  cta_link: string;
  image_url: string;
  is_active?: boolean;
  sort_order?: number;
}

interface BannerCarouselProps {
  banners: BannerItem[];
  className?: string;
}

export function BannerCarousel({ banners, className = "" }: BannerCarouselProps) {
  const activeBanners = banners.filter((b) => b.is_active !== false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

  if (!activeBanners.length) return null;

  const current = activeBanners[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-border shadow-warm-md bg-stone-900 ${className}`}>
      {/* Banner Slide Container */}
      <div className="relative aspect-[16/7] sm:aspect-[21/8] min-h-[260px] sm:min-h-[320px] w-full">
        <Image
          key={current.id}
          src={current.image_url}
          alt={current.title}
          fill
          priority
          className="object-cover object-center brightness-75 transition-all duration-700 ease-out"
          sizes="(max-width: 768px) 100vw, 1200px"
        />

        {/* Gradient Scrim for high-contrast luxury text */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-stone-950/30" />

        {/* Banner Content */}
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 lg:px-16 max-w-2xl text-white space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-[11px] font-bold tracking-wider uppercase w-fit backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Festive Showcase 2026</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            {current.title}
          </h2>

          {current.subtitle && (
            <p className="text-xs sm:text-sm text-stone-200 line-clamp-2 max-w-lg leading-relaxed">
              {current.subtitle}
            </p>
          )}

          <div className="pt-2">
            <Link
              href={current.cta_link}
              className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-brand-primary text-white font-semibold text-xs sm:text-sm hover:bg-brand-primary-hover shadow-warm-md transition-all group"
            >
              <span>{current.cta_label}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Navigation arrows (if > 1 banner) */}
        {activeBanners.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-stone-950/40 hover:bg-stone-950/70 text-white backdrop-blur-sm border border-white/10 transition-colors"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-stone-950/40 hover:bg-stone-950/70 text-white backdrop-blur-sm border border-white/10 transition-colors"
              aria-label="Next banner"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {activeBanners.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentIndex
                      ? "w-6 bg-amber-400"
                      : "w-2 bg-white/50 hover:bg-white"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

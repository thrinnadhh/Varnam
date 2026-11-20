"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Pause, Play } from "lucide-react";

export interface BannerItem {
  id: string;
  eyebrow_text?: string | null;
  title: string;
  subtitle?: string | null;
  cta_label: string;
  cta_link?: string;
  cta_href?: string;
  image_url?: string;
  desktop_image_url?: string;
  mobile_image_url?: string | null;
  is_active?: boolean;
  sort_order?: number;
}

interface BannerCarouselProps {
  banners: BannerItem[];
  durationSec?: number;
  className?: string;
}

export function BannerCarousel({
  banners,
  durationSec = 3,
  className = "",
}: BannerCarouselProps) {
  const activeBanners = banners.filter((b) => b.is_active !== false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance carousel using admin-configured duration (default 3s)
  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = Math.max(1, Math.min(30, durationSec)) * 1000;
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeBanners.length, durationSec, isPaused]);

  if (!activeBanners.length) return null;

  const current = activeBanners[currentIndex];
  const imageSrc = current.desktop_image_url || current.image_url || "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1600&q=80";
  const ctaLink = current.cta_href || current.cta_link || "/collections";

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-[#D8C7AE] shadow-xl bg-[#2A1C15] group/carousel ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="Festive Collection Hero Banners"
    >
      {/* Decorative Gold Inset Border - Subhamasthu Festive Framing */}
      <div className="absolute inset-2 sm:inset-3 border border-[#C69214]/40 rounded-xl sm:rounded-2xl pointer-events-none z-20" />

      {/* Banner Slide Container */}
      <div className="relative aspect-[16/9] sm:aspect-[21/9] min-h-[340px] sm:min-h-[420px] lg:min-h-[460px] w-full">
        <Image
          key={current.id}
          src={imageSrc}
          alt={current.title}
          fill
          priority
          className="object-cover object-center brightness-[0.75] transition-all duration-700 ease-out"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
        />

        {/* Rich Roasted Chestnut & Kraft Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2A1C15]/95 via-[#2A1C15]/70 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2A1C15]/90 via-transparent to-[#2A1C15]/30 z-10" />

        {/* Slide Content */}
        <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 sm:px-12 lg:px-16 max-w-2xl text-[#FAF5EB] space-y-3 sm:space-y-4">
          {/* Eyebrow Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF5EB]/15 border border-[#C69214]/60 text-[#FAF5EB] text-[11px] font-bold tracking-widest uppercase w-fit backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#C69214]" />
            <span>{current.eyebrow_text || "Subhamasthu • Festive Indian Luxury"}</span>
          </div>

          {/* Main Title - Editorial Serif (NO cursive/script) */}
          <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#FAF5EB] leading-[1.15]">
            {current.title}
          </h2>

          {/* Subtitle */}
          {current.subtitle && (
            <p className="text-xs sm:text-sm text-[#FAF5EB]/85 line-clamp-2 max-w-lg leading-relaxed font-sans">
              {current.subtitle}
            </p>
          )}

          {/* Primary CTA Button (Kumkum Crimson) */}
          <div className="pt-2 flex items-center gap-4">
            <Link
              href={ctaLink}
              className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-7 sm:py-3.5 rounded-xl bg-[#8B1E3F] text-[#FAF5EB] font-bold text-xs sm:text-sm hover:bg-[#721531] shadow-lg hover:shadow-xl transition-all group"
            >
              <span>{current.cta_label}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Rotation speed indicator */}
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] text-[#C69214] font-medium tracking-wide">
              {isPaused ? (
                <>
                  <Pause className="w-3 h-3" /> Paused on hover
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" /> Auto-rotates ({durationSec}s)
                </>
              )}
            </span>
          </div>
        </div>

        {/* Previous & Next Navigation Buttons */}
        {activeBanners.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-[#2A1C15]/70 hover:bg-[#2A1C15] text-[#FAF5EB] backdrop-blur-md border border-[#D8C7AE]/30 transition-all opacity-80 group-hover/carousel:opacity-100 shadow-md focus:outline-none focus:ring-2 focus:ring-[#C69214]"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-[#2A1C15]/70 hover:bg-[#2A1C15] text-[#FAF5EB] backdrop-blur-md border border-[#D8C7AE]/30 transition-all opacity-80 group-hover/carousel:opacity-100 shadow-md focus:outline-none focus:ring-2 focus:ring-[#C69214]"
              aria-label="Next banner"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Slide Pagination Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2A1C15]/80 backdrop-blur-md border border-[#D8C7AE]/30">
              {activeBanners.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? "w-6 bg-[#C69214]"
                      : "w-2 bg-[#FAF5EB]/40 hover:bg-[#FAF5EB]/70"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                  aria-current={idx === currentIndex ? "true" : undefined}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

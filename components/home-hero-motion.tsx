"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Sparkles, Heart } from "lucide-react";

export function HomeHeroMotion() {
  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const heartRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Respect prefers-reduced-motion
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      // Gentle floating animation on decorative trust badges (does not delay LCP image)
      if (badgeRef.current) {
        gsap.to(badgeRef.current, {
          y: -6,
          duration: 2.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      if (heartRef.current) {
        gsap.to(heartRef.current, {
          scale: 1.08,
          duration: 1.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="relative mx-auto max-w-sm sm:max-w-md">
      {/* Glow Backdrop */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-brand-primary/20 via-brand-secondary/20 to-amber-200/30 rounded-3xl blur-2xl -z-10" />

      {/* Main Hero Card - Note: LCP Image has priority={true} and is never animated or hidden */}
      <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border-2 border-border/80 shadow-warm-lg bg-surface">
        <Image
          src="https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?auto=format&fit=crop&w=1000&q=80"
          alt="Little girl wearing Indian Embroidered Zari Festive Gown"
          fill
          priority
          sizes="(max-width: 640px) 90vw, 450px"
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent" />

        <div className="absolute bottom-4 left-4 right-4 text-white">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-stone-900/80 px-2 py-0.5 rounded-full backdrop-blur-sm">
            Trending Festive Edit
          </span>
          <h3 className="font-serif font-bold text-lg mt-1">
            Blush Peony Tiered Tulle Gown
          </h3>
          <p className="text-xs text-stone-200 mt-0.5">
            Ages 2–12Y • 100% Breathable Malmal Cotton
          </p>
        </div>
      </div>

      {/* Floating Interactive Badge (GSAP floated) */}
      <div
        ref={badgeRef}
        className="absolute -top-3 -right-3 bg-surface/95 backdrop-blur-md border border-border p-3 rounded-2xl shadow-warm-md flex items-center gap-2.5 z-20"
      >
        <div className="p-2 bg-brand-primary-subtle text-brand-primary rounded-xl">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand-secondary">
            Parent Approved
          </p>
          <p className="text-xs font-serif font-bold text-text-heading">
            Zero-Scratch Lining
          </p>
        </div>
      </div>

      {/* Floating Heart Accent */}
      <div
        ref={heartRef}
        className="absolute bottom-8 -left-3 bg-surface/95 backdrop-blur-md border border-border p-2.5 rounded-xl shadow-warm-md flex items-center gap-2 z-20"
      >
        <Heart className="w-4 h-4 fill-brand-primary text-brand-primary" />
        <span className="text-xs font-bold text-text-heading">4.9 ★ Rating</span>
      </div>
    </div>
  );
}

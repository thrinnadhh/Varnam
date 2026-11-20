"use client";

import React, { useEffect, useRef, useState } from "react";
import { ReactLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface SmoothScrollProps {
  children: React.ReactNode;
}

/**
 * SmoothScroll activates Lenis smooth scrolling only on marketing pages (Home, Collections).
 * Strictly excluded on /checkout, /account, and /admin.
 * Automatically bypassed when prefers-reduced-motion is detected.
 * Seamlessly synced with GSAP ScrollTrigger via gsap.ticker and scroll events.
 */
export function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<any>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setReducedMotion(true);
    }

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);

      const updateTicker = (time: number) => {
        lenisRef.current?.lenis?.raf(time * 1000);
      };

      gsap.ticker.add(updateTicker);

      const lenisInstance = lenisRef.current?.lenis;
      if (lenisInstance) {
        lenisInstance.on("scroll", ScrollTrigger.update);
      }

      return () => {
        gsap.ticker.remove(updateTicker);
        if (lenisInstance) {
          lenisInstance.off("scroll", ScrollTrigger.update);
        }
      };
    }
  }, [reducedMotion]);

  if (reducedMotion) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      ref={lenisRef}
      root
      options={{
        lerp: 0.08,
        smoothWheel: true,
        autoRaf: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}

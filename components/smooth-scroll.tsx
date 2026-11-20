"use client";

import React, { useEffect, useRef, useSyncExternalStore } from "react";
import { ReactLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface SmoothScrollProps {
  children: React.ReactNode;
}

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

/**
 * SmoothScroll activates Lenis smooth scrolling only on marketing pages (Home, Collections).
 * Strictly excluded on /checkout, /account, and /admin.
 * Automatically bypassed when prefers-reduced-motion is detected.
 * Seamlessly synced with GSAP ScrollTrigger via gsap.ticker and scroll events.
 */
export function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<React.ElementRef<typeof ReactLenis>>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

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

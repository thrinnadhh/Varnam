"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SliderRowProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  scrollAmount?: number;
  showArrowsAlways?: boolean;
}

/**
 * Reusable horizontal slider row with left and right navigation arrows at the ends.
 * Supports smooth touch scrolling, drag-to-scroll, and tactile button controls.
 */
export function SliderRow({
  children,
  className = "",
  contentClassName = "",
  scrollAmount,
}: SliderRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;

    const resizeObserver = new ResizeObserver(() => checkScroll());
    resizeObserver.observe(el);

    return () => resizeObserver.disconnect();
  }, [checkScroll, children]);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const step = scrollAmount || Math.max(260, Math.floor(el.clientWidth * 0.75));
    el.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth",
    });
  };

  return (
    <div className={`relative group/slider ${className}`}>
      {/* Left Navigation Arrow Button */}
      <button
        type="button"
        onClick={() => handleScroll("left")}
        disabled={!canScrollLeft}
        aria-label="Previous items"
        className={`absolute -left-2 sm:-left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#FAF5EB] border-2 border-[#D8C7AE] text-[#261C17] shadow-[0_4px_16px_rgba(59,40,30,0.18)] flex items-center justify-center transition-all duration-200 ${
          canScrollLeft
            ? "hover:bg-[#8B1E3F] hover:text-[#FAF5EB] hover:border-[#8B1E3F] hover:scale-110 active:scale-95 cursor-pointer opacity-90 sm:opacity-95"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Horizontal Scrollable Track */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className={`flex overflow-x-auto scroll-smooth scrollbar-none snap-x snap-mandatory gap-4 sm:gap-6 py-2 px-1 focus:outline-none ${contentClassName}`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        tabIndex={0}
      >
        {children}
      </div>

      {/* Right Navigation Arrow Button */}
      <button
        type="button"
        onClick={() => handleScroll("right")}
        disabled={!canScrollRight}
        aria-label="Next items"
        className={`absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#FAF5EB] border-2 border-[#D8C7AE] text-[#261C17] shadow-[0_4px_16px_rgba(59,40,30,0.18)] flex items-center justify-center transition-all duration-200 ${
          canScrollRight
            ? "hover:bg-[#8B1E3F] hover:text-[#FAF5EB] hover:border-[#8B1E3F] hover:scale-110 active:scale-95 cursor-pointer opacity-90 sm:opacity-95"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );
}

"use client";

import React from "react";
import { MotionConfig } from "motion/react";

interface MotionProviderProps {
  children: React.ReactNode;
}

/**
 * MotionProvider wraps the storefront in MotionConfig with reducedMotion="user".
 * This automatically respects the user's OS prefers-reduced-motion setting
 * across all motion/react animations.
 */
export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  );
}

"use client";

import { useState } from "react";
import { X, Ruler, Sparkles, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface SizeChartItem {
  size?: string;
  age?: string;
  bust_in?: number;
  bust_cm?: number;
  waist_in?: number;
  waist_cm?: number;
  hip_in?: number;
  hip_cm?: number;
  length_in?: number;
  length_cm?: number;
  measurement_type?: "garment" | "body";
  chest?: string;
  waist?: string;
  length?: string;
}

interface SizeGuideModalProps {
  segment?: "girls" | "teens" | "women" | string;
  sizeChart?: SizeChartItem[] | null;
  measurementType?: "garment" | "body";
}

export function SizeGuideModal({
  segment = "girls",
  sizeChart,
  measurementType = "garment",
}: SizeGuideModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unit, setUnit] = useState<"in" | "cm">("in");

  // Aligned, non-overlapping default charts per demographic segment
  const defaultWomenRows: SizeChartItem[] = [
    { size: "XS", bust_in: 32, bust_cm: 81.3, waist_in: 26, waist_cm: 66.0, hip_in: 36, hip_cm: 91.4, length_in: 52, length_cm: 132.1 },
    { size: "S", bust_in: 34, bust_cm: 86.4, waist_in: 28, waist_cm: 71.1, hip_in: 38, hip_cm: 96.5, length_in: 52, length_cm: 132.1 },
    { size: "M", bust_in: 36, bust_cm: 91.4, waist_in: 30, waist_cm: 76.2, hip_in: 40, hip_cm: 101.6, length_in: 53, length_cm: 134.6 },
    { size: "L", bust_in: 38, bust_cm: 96.5, waist_in: 32, waist_cm: 81.3, hip_in: 42, hip_cm: 106.7, length_in: 54, length_cm: 137.2 },
    { size: "XL", bust_in: 40, bust_cm: 101.6, waist_in: 34, waist_cm: 86.4, hip_in: 44, hip_cm: 111.8, length_in: 54, length_cm: 137.2 },
    { size: "XXL", bust_in: 42, bust_cm: 106.7, waist_in: 36, waist_cm: 91.4, hip_in: 46, hip_cm: 116.8, length_in: 55, length_cm: 139.7 },
  ];

  // Teens: 13–18Y & Youth Sizes (Zero overlap with Girls)
  const defaultTeensRows: SizeChartItem[] = [
    { size: "13-14Y", bust_in: 31, bust_cm: 78.7, waist_in: 26, waist_cm: 66.0, hip_in: 34, hip_cm: 86.4, length_in: 40, length_cm: 101.6 },
    { size: "15-16Y", bust_in: 33, bust_cm: 83.8, waist_in: 27, waist_cm: 68.6, hip_in: 36, hip_cm: 91.4, length_in: 42, length_cm: 106.7 },
    { size: "17-18Y", bust_in: 35, bust_cm: 88.9, waist_in: 28, waist_cm: 71.1, hip_in: 38, hip_cm: 96.5, length_in: 44, length_cm: 111.8 },
    { size: "XS", bust_in: 31, bust_cm: 78.7, waist_in: 26, waist_cm: 66.0, hip_in: 34, hip_cm: 86.4, length_in: 40, length_cm: 101.6 },
    { size: "S", bust_in: 33, bust_cm: 83.8, waist_in: 27, waist_cm: 68.6, hip_in: 36, hip_cm: 91.4, length_in: 42, length_cm: 106.7 },
    { size: "M", bust_in: 35, bust_cm: 88.9, waist_in: 29, waist_cm: 73.7, hip_in: 38, hip_cm: 96.5, length_in: 44, length_cm: 111.8 },
  ];

  // Girls: 2–12Y (Zero overlap with Teens)
  const defaultGirlsRows: SizeChartItem[] = [
    { size: "2-3Y", bust_in: 21, bust_cm: 53.3, waist_in: 20, waist_cm: 50.8, hip_in: 22, hip_cm: 55.9, length_in: 22, length_cm: 55.9 },
    { size: "4-5Y", bust_in: 23, bust_cm: 58.4, waist_in: 22, waist_cm: 55.9, hip_in: 24, hip_cm: 61.0, length_in: 26, length_cm: 66.0 },
    { size: "6-7Y", bust_in: 25, bust_cm: 63.5, waist_in: 24, waist_cm: 61.0, hip_in: 26, hip_cm: 66.0, length_in: 30, length_cm: 76.2 },
    { size: "8-9Y", bust_in: 27, bust_cm: 68.6, waist_in: 26, waist_cm: 66.0, hip_in: 28, hip_cm: 71.1, length_in: 34, length_cm: 86.4 },
    { size: "10-11Y", bust_in: 29, bust_cm: 73.7, waist_in: 28, waist_cm: 71.1, hip_in: 30, hip_cm: 76.2, length_in: 38, length_cm: 96.5 },
    { size: "12Y", bust_in: 31, bust_cm: 78.7, waist_in: 29, waist_cm: 73.7, hip_in: 32, hip_cm: 81.3, length_in: 41, length_cm: 104.1 },
  ];

  const getFallbackRows = () => {
    if (segment === "women") return defaultWomenRows;
    if (segment === "teens") return defaultTeensRows;
    return defaultGirlsRows;
  };

  const rows: SizeChartItem[] = sizeChart && sizeChart.length > 0 ? sizeChart : getFallbackRows();

  const activeMeasurementType =
    (sizeChart && sizeChart[0]?.measurement_type) || measurementType || "garment";

  const formatMeasure = (inVal?: number, cmVal?: number, fallbackStr?: string) => {
    if (unit === "in" && inVal !== undefined) return `${inVal}"`;
    if (unit === "cm" && cmVal !== undefined) return `${cmVal} cm`;
    if (fallbackStr) return fallbackStr;
    if (inVal !== undefined) return `${inVal}"`;
    return "—";
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:text-brand-primary-hover underline underline-offset-2 transition-colors"
      >
        <Ruler className="w-3.5 h-3.5" />
        <span>
          {segment === "women"
            ? "Women's Size & Measurements Guide"
            : segment === "teens"
            ? "Teens Size & Fit Guide (13–18Y)"
            : "Girls' Age & Size Guide (2–12Y)"}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="size-guide-title"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-xl bg-surface rounded-2xl border border-border shadow-warm-lg p-6 max-h-[90vh] overflow-y-auto space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-brand-primary-subtle text-brand-primary rounded-xl">
                    <Ruler className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 id="size-guide-title" className="font-serif text-lg font-bold text-text-heading">
                    {segment === "women"
                      ? "Women's Couture Size Chart"
                      : segment === "teens"
                      ? "Teens Couture Size Chart (13–18Y)"
                      : "Girls' Milestone Sizing Chart (2–12Y)"}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-200">
                      Chart Type: {activeMeasurementType === "garment" ? "Garment Dimensions (Laid Flat)" : "Body Measurements"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 text-text-muted hover:text-text-heading rounded-lg hover:bg-canvas transition-colors"
                aria-label="Close size guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Measurement Type & Transparency Note */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1 text-amber-950">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-brand-primary" />
                <span>
                  {activeMeasurementType === "garment"
                    ? "Garment Dimension Transparency"
                    : "Body Fit Guidance"}
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-900">
                {activeMeasurementType === "garment"
                  ? "All numbers in this chart reflect the exact stitched measurements of the garment laid flat. Our dresses feature +2 inches of inner seam growth margin for effortless alterations."
                  : "These measurements represent actual body measurements. Each dress is tailored with 2 inches of comfortable movement ease."}
              </p>
            </div>

            {/* In / Cm Unit Switcher */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted">
                Display Units:
              </span>
              <div className="flex bg-canvas p-1 rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => setUnit("in")}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    unit === "in"
                      ? "bg-brand-primary text-white shadow-sm"
                      : "text-text-muted hover:text-text-heading"
                  }`}
                >
                  Inches (in)
                </button>
                <button
                  type="button"
                  onClick={() => setUnit("cm")}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    unit === "cm"
                      ? "bg-brand-primary text-white shadow-sm"
                      : "text-text-muted hover:text-text-heading"
                  }`}
                >
                  Centimeters (cm)
                </button>
              </div>
            </div>

            {/* Size Table */}
            <div className="border border-border rounded-xl overflow-hidden shadow-warm-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-canvas border-b border-border text-text-heading uppercase font-bold">
                  <tr>
                    <th className="py-2.5 px-3">
                      {segment === "girls" ? "Age Milestone" : "Size"}
                    </th>
                    <th className="py-2.5 px-3">
                      {segment === "girls" ? "Chest" : "Bust"}
                    </th>
                    <th className="py-2.5 px-3">Waist</th>
                    <th className="py-2.5 px-3">Hip</th>
                    <th className="py-2.5 px-3 text-right">Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle bg-surface">
                  {rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-canvas/50">
                      <td className="py-2.5 px-3 font-bold text-text-heading">
                        {row.size || row.age}
                      </td>
                      <td className="py-2.5 px-3 text-text-body font-mono">
                        {formatMeasure(row.bust_in, row.bust_cm, row.chest)}
                      </td>
                      <td className="py-2.5 px-3 text-text-body font-mono">
                        {formatMeasure(row.waist_in, row.waist_cm, row.waist)}
                      </td>
                      <td className="py-2.5 px-3 text-text-body font-mono">
                        {formatMeasure(row.hip_in, row.hip_cm)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-text-body font-mono">
                        {formatMeasure(row.length_in, row.length_cm, row.length)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer tips */}
            <div className="pt-2 text-[11px] text-text-muted space-y-1">
              <p className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-brand-secondary" />
                <strong>Need custom tailoring?</strong> Contact our Atelier for personalized waist/length adjustments.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  </>
);
}

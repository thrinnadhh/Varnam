"use client";

import { useState } from "react";
import { X, Ruler, Sparkles, Check, HelpCircle } from "lucide-react";

interface SizeChartItem {
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
  chest?: string;
  waist?: string;
  length?: string;
}

interface SizeGuideModalProps {
  segment?: "girls" | "teens" | "women";
  sizeChart?: SizeChartItem[] | null;
}

export function SizeGuideModal({ segment = "girls", sizeChart }: SizeGuideModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unit, setUnit] = useState<"in" | "cm">("in");

  // Default fallback charts per segment
  const defaultWomenRows: SizeChartItem[] = [
    { size: "XS", bust_in: 32, bust_cm: 81.3, waist_in: 26, waist_cm: 66.0, hip_in: 36, hip_cm: 91.4, length_in: 52, length_cm: 132.1 },
    { size: "S", bust_in: 34, bust_cm: 86.4, waist_in: 28, waist_cm: 71.1, hip_in: 38, hip_cm: 96.5, length_in: 52, length_cm: 132.1 },
    { size: "M", bust_in: 36, bust_cm: 91.4, waist_in: 30, waist_cm: 76.2, hip_in: 40, hip_cm: 101.6, length_in: 53, length_cm: 134.6 },
    { size: "L", bust_in: 38, bust_cm: 96.5, waist_in: 32, waist_cm: 81.3, hip_in: 42, hip_cm: 106.7, length_in: 54, length_cm: 137.2 },
    { size: "XL", bust_in: 40, bust_cm: 101.6, waist_in: 34, waist_cm: 86.4, hip_in: 44, hip_cm: 111.8, length_in: 54, length_cm: 137.2 },
    { size: "XXL", bust_in: 42, bust_cm: 106.7, waist_in: 36, waist_cm: 91.4, hip_in: 46, hip_cm: 116.8, length_in: 55, length_cm: 139.7 },
  ];

  const defaultTeensRows: SizeChartItem[] = [
    { size: "11-12Y", bust_in: 29, bust_cm: 73.7, waist_in: 25, waist_cm: 63.5, hip_in: 32, hip_cm: 81.3, length_in: 38, length_cm: 96.5 },
    { size: "13-14Y", bust_in: 31, bust_cm: 78.7, waist_in: 26, waist_cm: 66.0, hip_in: 34, hip_cm: 86.4, length_in: 40, length_cm: 101.6 },
    { size: "15-16Y", bust_in: 33, bust_cm: 83.8, waist_in: 27, waist_cm: 68.6, hip_in: 36, hip_cm: 91.4, length_in: 42, length_cm: 106.7 },
    { size: "XS", bust_in: 31, bust_cm: 78.7, waist_in: 26, waist_cm: 66.0, hip_in: 34, hip_cm: 86.4, length_in: 40, length_cm: 101.6 },
    { size: "S", bust_in: 33, bust_cm: 83.8, waist_in: 27, waist_cm: 68.6, hip_in: 36, hip_cm: 91.4, length_in: 42, length_cm: 106.7 },
  ];

  const defaultGirlsRows: SizeChartItem[] = [
    { size: "2-3Y", bust_in: 21, bust_cm: 53.3, waist_in: 20, waist_cm: 50.8, hip_in: 22, hip_cm: 55.9, length_in: 22, length_cm: 55.9 },
    { size: "4-5Y", bust_in: 23, bust_cm: 58.4, waist_in: 22, waist_cm: 55.9, hip_in: 24, hip_cm: 61.0, length_in: 26, length_cm: 66.0 },
    { size: "6-7Y", bust_in: 25, bust_cm: 63.5, waist_in: 24, waist_cm: 61.0, hip_in: 26, hip_cm: 66.0, length_in: 30, length_cm: 76.2 },
    { size: "8-9Y", bust_in: 27, bust_cm: 68.6, waist_in: 26, waist_cm: 66.0, hip_in: 28, hip_cm: 71.1, length_in: 34, length_cm: 86.4 },
    { size: "10-11Y", bust_in: 29, bust_cm: 73.7, waist_in: 28, waist_cm: 71.1, hip_in: 30, hip_cm: 76.2, length_in: 38, length_cm: 96.5 },
    { size: "12-14Y", bust_in: 31, bust_cm: 78.7, waist_in: 30, waist_cm: 76.2, hip_in: 32, hip_cm: 81.3, length_in: 42, length_cm: 106.7 },
  ];

  const getFallbackRows = () => {
    if (segment === "women") return defaultWomenRows;
    if (segment === "teens") return defaultTeensRows;
    return defaultGirlsRows;
  };

  const rows: SizeChartItem[] = sizeChart && sizeChart.length > 0 ? sizeChart : getFallbackRows();

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
            ? "Teens Size & Fit Guide"
            : "Girls' Age & Size Guide"}
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-surface rounded-2xl border border-border shadow-warm-lg p-6 max-h-[90vh] overflow-y-auto space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-primary-subtle text-brand-primary rounded-xl">
                  <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-text-heading capitalize">
                    {segment} Couture Fit & Size Guide
                  </h3>
                  <p className="text-xs text-text-muted">
                    Precision measurements for {segment === "women" ? "women" : segment === "teens" ? "growing teens (12–18Y)" : "girls (2–14Y)"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Unit Switcher */}
                <div className="flex items-center bg-surface-raised p-1 rounded-lg border border-border text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setUnit("in")}
                    className={`px-2 py-1 rounded transition-colors ${
                      unit === "in"
                        ? "bg-brand-primary text-white"
                        : "text-text-muted hover:text-text-heading"
                    }`}
                  >
                    IN
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnit("cm")}
                    className={`px-2 py-1 rounded transition-colors ${
                      unit === "cm"
                        ? "bg-brand-primary text-white"
                        : "text-text-muted hover:text-text-heading"
                    }`}
                  >
                    CM
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-text-muted hover:text-text-heading rounded-lg hover:bg-canvas"
                  aria-label="Close size guide"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Custom Seam Growth Note */}
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/60 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-brand-secondary shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Concealed Alteration Margins:</strong> All Varnam garments are tailored with generous 2-to-3 inch internal seam allowances and 100% breathable pure cotton linings. Easily taken in or let out for a bespoke contour.
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-border rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-canvas text-text-heading uppercase font-semibold text-[10px] tracking-wider border-b border-border">
                  <tr>
                    <th className="py-2.5 px-3">
                      {segment === "women" ? "Size (Alpha)" : segment === "teens" ? "Youth Size" : "Age Size"}
                    </th>
                    <th className="py-2.5 px-3">
                      {segment === "girls" ? "Chest" : "Bust"}
                    </th>
                    <th className="py-2.5 px-3">Waist</th>
                    <th className="py-2.5 px-3">Hip</th>
                    <th className="py-2.5 px-3">Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {rows.map((row, idx) => (
                    <tr key={row.size || row.age || idx} className="hover:bg-canvas/50">
                      <td className="py-2.5 px-3 font-bold text-brand-primary">
                        {row.size || row.age}
                      </td>
                      <td className="py-2.5 px-3 text-text-body">
                        {formatMeasure(row.bust_in, row.bust_cm, row.chest)}
                      </td>
                      <td className="py-2.5 px-3 text-text-body">
                        {formatMeasure(row.waist_in, row.waist_cm, row.waist)}
                      </td>
                      <td className="py-2.5 px-3 text-text-body">
                        {formatMeasure(row.hip_in, row.hip_cm, "—")}
                      </td>
                      <td className="py-2.5 px-3 text-text-body">
                        {formatMeasure(row.length_in, row.length_cm, row.length)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Measurement Instructions */}
            <div className="bg-surface-raised p-4 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-text-heading flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-brand-primary" />
                <span>How to Measure Accurately</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-text-muted pl-1 text-[11px] leading-relaxed">
                <li>
                  <strong className="text-text-heading">{segment === "girls" ? "Chest" : "Bust"}:</strong> Measure across the fullest part of the bust/chest, keeping the tape level and comfortably snug.
                </li>
                <li>
                  <strong className="text-text-heading">Waist:</strong> Measure around the natural waistline just above the navel.
                </li>
                <li>
                  <strong className="text-text-heading">Hip:</strong> Measure around the fullest point of the hips while standing with feet together.
                </li>
                <li>
                  <strong className="text-text-heading">Length:</strong> Measure vertically from the highest shoulder point to the hemline.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

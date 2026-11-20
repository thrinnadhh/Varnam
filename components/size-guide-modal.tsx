"use client";

import { useState } from "react";
import { X, Ruler, Scissors } from "lucide-react";

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

  const defaultTeensRows: SizeChartItem[] = [
    { size: "13-14Y", bust_in: 31, bust_cm: 78.7, waist_in: 26, waist_cm: 66.0, hip_in: 34, hip_cm: 86.4, length_in: 40, length_cm: 101.6 },
    { size: "15-16Y", bust_in: 33, bust_cm: 83.8, waist_in: 27, waist_cm: 68.6, hip_in: 36, hip_cm: 91.4, length_in: 42, length_cm: 106.7 },
    { size: "17-18Y", bust_in: 35, bust_cm: 88.9, waist_in: 28, waist_cm: 71.1, hip_in: 38, hip_cm: 96.5, length_in: 44, length_cm: 111.8 },
    { size: "XS", bust_in: 31, bust_cm: 78.7, waist_in: 26, waist_cm: 66.0, hip_in: 34, hip_cm: 86.4, length_in: 40, length_cm: 101.6 },
    { size: "S", bust_in: 33, bust_cm: 83.8, waist_in: 27, waist_cm: 68.6, hip_in: 36, hip_cm: 91.4, length_in: 42, length_cm: 106.7 },
    { size: "M", bust_in: 35, bust_cm: 88.9, waist_in: 29, waist_cm: 73.7, hip_in: 38, hip_cm: 96.5, length_in: 44, length_cm: 111.8 },
  ];

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
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B1E3F] hover:text-[#721531] underline underline-offset-2 transition-colors"
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

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl bg-[#FAF5EB] border-2 border-[#D8C7AE] shadow-2xl p-6 text-[#261C17] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#D8C7AE]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#EFE6D5] text-[#8B1E3F]">
                  <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#261C17]">
                    Couture Size Chart
                  </h3>
                  <p className="text-xs text-[#6B574B]">
                    Garment Dimensions ({activeMeasurementType === "body" ? "Body Fit" : "Laid Flat"}) &amp; Alteration Guidance
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full text-[#6B574B] hover:text-[#261C17] hover:bg-[#EFE6D5] transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Growth Allowance Transparency Callout */}
            <div className="mt-4 p-3.5 rounded-xl bg-[#EFE6D5] border border-[#D8C7AE] space-y-1.5 text-xs text-[#3B281E]">
              <div className="flex items-center gap-2 font-bold text-[#8B1E3F]">
                <Scissors className="w-4 h-4 text-[#C69214]" />
                <span>1-Inch Inner Growth Seam Allowance Included</span>
              </div>
              <p className="text-[11px] text-[#6B574B] leading-relaxed">
                All measurements reflect exact Garment Dimensions laid flat. Every Varnam couture dress includes +1 inch of concealed inner seam margins on both sides, ensuring your growing daughter enjoys multiple celebration seasons.
              </p>
            </div>

            {/* In / Cm Unit Switcher */}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs font-bold text-[#6B574B] uppercase tracking-wider">
                Display Measurement Units:
              </span>
              <div className="flex bg-[#EFE6D5] p-1 rounded-lg border border-[#D8C7AE]">
                <button
                  type="button"
                  onClick={() => setUnit("in")}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    unit === "in"
                      ? "bg-brand-primary text-white shadow-sm"
                      : "text-[#6B574B] hover:text-[#261C17]"
                  }`}
                >
                  Inches
                </button>
                <button
                  type="button"
                  onClick={() => setUnit("cm")}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    unit === "cm"
                      ? "bg-brand-primary text-white shadow-sm"
                      : "text-[#6B574B] hover:text-[#261C17]"
                  }`}
                >
                  Centimeters
                </button>
              </div>
            </div>

            {/* Measurements Table */}
            <div className="mt-4 overflow-x-auto rounded-xl border border-[#D8C7AE] bg-[#FAF5EB]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#EFE6D5] border-b border-[#D8C7AE] text-[#3B281E] font-bold">
                    <th className="p-3">Size / Age</th>
                    <th className="p-3">Bust / Chest</th>
                    <th className="p-3">Waist</th>
                    <th className="p-3">Hip</th>
                    <th className="p-3">Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8C7AE]/60 text-[#261C17]">
                  {rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#EFE6D5]/50 transition-colors">
                      <td className="p-3 font-bold text-[#8B1E3F]">
                        {row.size || row.age || "Standard"}
                      </td>
                      <td className="p-3 price-tabular">
                        {formatMeasure(row.bust_in, row.bust_cm, row.chest)}
                      </td>
                      <td className="p-3 price-tabular">
                        {formatMeasure(row.waist_in, row.waist_cm, row.waist)}
                      </td>
                      <td className="p-3 price-tabular">
                        {formatMeasure(row.hip_in, row.hip_cm)}
                      </td>
                      <td className="p-3 price-tabular">
                        {formatMeasure(row.length_in, row.length_cm, row.length)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-[#D8C7AE] flex items-center justify-between text-[11px] text-[#6B574B]">
              <span>Handcrafted in India • Non-Scratch 100% Breathable Malmal Linings</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="font-bold text-[#8B1E3F] hover:underline"
              >
                Close Window ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

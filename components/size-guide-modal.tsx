"use client";

import { useState } from "react";
import { X, Ruler, Sparkles, Check } from "lucide-react";

interface SizeGuideModalProps {
  sizeChart?: Array<{
    age: string;
    chest: string;
    length: string;
    waist: string;
  }> | null;
}

export function SizeGuideModal({ sizeChart }: SizeGuideModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const defaultRows = [
    { age: "2-3Y", chest: "21 in / 53 cm", waist: "20 in / 51 cm", length: "22 in / 56 cm" },
    { age: "4-5Y", chest: "23 in / 58 cm", waist: "22 in / 56 cm", length: "26 in / 66 cm" },
    { age: "6-7Y", chest: "25 in / 63 cm", waist: "24 in / 61 cm", length: "30 in / 76 cm" },
    { age: "8-9Y", chest: "27 in / 68 cm", waist: "26 in / 66 cm", length: "34 in / 86 cm" },
    { age: "10-11Y", chest: "29 in / 73 cm", waist: "28 in / 71 cm", length: "38 in / 96 cm" },
    { age: "12-14Y", chest: "31 in / 78 cm", waist: "30 in / 76 cm", length: "42 in / 106 cm" },
  ];

  const rows = sizeChart && sizeChart.length > 0 ? sizeChart : defaultRows;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:text-brand-primary-hover underline underline-offset-2 transition-colors"
      >
        <Ruler className="w-3.5 h-3.5" />
        <span>Size & Age Measurements Guide</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-surface rounded-2xl border border-border shadow-warm-lg p-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-primary-subtle text-brand-primary rounded-xl">
                  <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-text-heading">
                    Garment Size & Age Guide
                  </h3>
                  <p className="text-xs text-text-muted">Exact measurements for growing girls</p>
                </div>
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

            {/* Parent Growth Tip Box */}
            <div className="my-4 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/60 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-brand-secondary shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Mom Advice for Festive Wear:</strong> If your daughter is between sizes or the event is 2+ months away, we recommend sizing up. All Varnam dresses include tucked-in +2 inch inner seam margins so they can be easily let out.
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-border rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-canvas text-text-heading uppercase font-semibold text-[10px] tracking-wider border-b border-border">
                  <tr>
                    <th className="py-2.5 px-3">Age Group</th>
                    <th className="py-2.5 px-3">Chest</th>
                    <th className="py-2.5 px-3">Waist</th>
                    <th className="py-2.5 px-3">Dress Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {rows.map((row) => (
                    <tr key={row.age} className="hover:bg-canvas/50">
                      <td className="py-2.5 px-3 font-bold text-brand-primary">{row.age}</td>
                      <td className="py-2.5 px-3 text-text-body">{row.chest}</td>
                      <td className="py-2.5 px-3 text-text-body">{row.waist}</td>
                      <td className="py-2.5 px-3 text-text-body">{row.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Fabric Lining Reassurance */}
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                <Check className="w-4 h-4 text-emerald-600" /> 100% Breathable Cotton Linings
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-primary-hover"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

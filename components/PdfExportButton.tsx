"use client";

import { useEffect, useState } from "react";

import { usePlan } from "./PlanContext";
import { exportPlanAsPdf } from "@/lib/pdf/export";

type PrintSize = {
  code: "A6" | "A7";
  label: string;
};

const sizes: PrintSize[] = [
  { code: "A6", label: "A6 · 105 x 148 mm" },
  { code: "A7", label: "A7 · 74 x 105 mm" },
];

export default function PdfExportButton() {
  const { plan, input } = usePlan();
  const [isOpen, setIsOpen] = useState(false);
  const [printSize, setPrintSize] = useState<PrintSize | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!printSize) return;
    if (typeof window === "undefined") return;

    setIsGenerating(true);
    exportPlanAsPdf({ plan, input, size: printSize.code });

    const finishHandle = setTimeout(() => {
      setIsGenerating(false);
      setPrintSize(null);
    }, 600);

    return () => clearTimeout(finishHandle);
  }, [input, plan, printSize]);

  return (
    <div className="relative inline-block">
      <button
        className="ink-button inline-flex items-center gap-2"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span role="img" aria-label="pdf">
          🗎
        </span>
        {isGenerating ? "Preparing PDF" : "Export PDF"}
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-2 min-w-[240px] rounded-lg border-2 border-ink bg-paper shadow-[8px_10px_0_rgba(27,26,20,0.14)]">
          <div className="border-b-2 border-ink/40 px-4 py-2 text-xs font-mono uppercase tracking-[0.2em] text-olive">
            Print-ready
          </div>
          <ul className="divide-y-2 divide-ink/10" role="listbox">
            {sizes.map((size) => (
              <li key={size.code}>
                <button
                  className="flex w-full items-start gap-2 px-4 py-3 text-left transition-colors hover:bg-[rgba(27,26,20,0.05)]"
                  onClick={() => {
                    setPrintSize(size);
                    setIsOpen(false);
                  }}
                >
                  <div className="mt-0.5 h-3 w-3 rounded-sm border-2 border-ink bg-[rgba(27,26,20,0.08)]" />
                  <div>
                    <p className="font-semibold leading-tight">{size.label}</p>
                    <p className="text-xs text-ink/70">Una página por escenario con guía de ruta + cortes</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

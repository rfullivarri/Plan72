"use client";

import { useEffect, useState } from "react";

const sizes = [
  { code: "A6", label: "A6 · 105 x 148 mm", margin: "6mm" },
  { code: "A7", label: "A7 · 74 x 105 mm", margin: "5mm" },
] as const;

export default function PdfExportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [printSize, setPrintSize] = useState<(typeof sizes)[number] | null>(null);

  useEffect(() => {
    const handleAfterPrint = () => setPrintSize(null);
    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, []);

  useEffect(() => {
    if (!printSize) return;

    document.body.setAttribute("data-print-size", printSize.code);
    const timer = setTimeout(() => {
      window.print();
    }, 200);

    return () => {
      clearTimeout(timer);
      document.body.removeAttribute("data-print-size");
    };
  }, [printSize]);

  return (
    <div className="relative inline-block">
      {printSize && (
        <style>{`
          @media print {
            @page {
              size: ${printSize.code};
              margin: ${printSize.margin};
            }
          }
        `}</style>
      )}

      <button
        className="ink-button inline-flex items-center gap-2"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span role="img" aria-label="pdf">
          🗎
        </span>
        Export PDF
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
                    <p className="text-xs text-ink/70">Márgenes y guías de corte activadas</p>
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

"use client";

import { forwardRef, useImperativeHandle } from "react";

export type Globe3DHandle = {
  focusCountry: (countryCode: string) => void;
  focusCity: (lat: number, lng: number) => void;
};

type Globe3DProps = {
  selectedCountry?: string;
  selectedCity?: { name?: string; lat: number; lng: number };
};

const Globe3D = forwardRef<Globe3DHandle, Globe3DProps>(({ selectedCountry, selectedCity }, ref) => {
  useImperativeHandle(
    ref,
    () => ({
      focusCountry: () => undefined,
      focusCity: () => undefined,
    }),
    []
  );

  const title = selectedCountry ?? selectedCity?.name ?? "Globe3D";
  const location = selectedCity ? `${selectedCity.lat.toFixed(2)}, ${selectedCity.lng.toFixed(2)}` : "—";

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-xl border-2 border-ink bg-[radial-gradient(circle_at_top,_rgba(179,90,42,0.2),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(74,90,58,0.3),_transparent_60%)]">
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-ink/80">
        <div className="text-lg font-semibold text-ink">{title}</div>
        <div className="text-xs uppercase tracking-[0.2em] text-olive">3D globe preview</div>
        <div className="font-mono text-[11px] text-ink/60">Selected city: {location}</div>
      </div>
      <div className="pointer-events-none absolute left-4 top-4 rounded-full border-2 border-ink/60 bg-[rgba(255,255,255,0.8)] px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-olive">
        Globe3D
      </div>
    </div>
  );
});

Globe3D.displayName = "Globe3D";

export default Globe3D;

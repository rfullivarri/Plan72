"use client";

import { usePlan } from "./PlanContext";

interface MascotPanelProps {
  floating?: boolean;
}

export default function MascotPanel({ floating }: MascotPanelProps) {
  const { plan, isRegenerating } = usePlan();

  const tip = isRegenerating
    ? "Procesando inputs…"
    : `Modo ${plan.mode}. ${plan.stages[0]?.actions.do[0] ?? "Listo"}`;

  return (
    <div
      className={`card-frame max-w-sm p-4 sm:p-5 text-center ${
        floating ? "lg:fixed lg:bottom-10 lg:right-10 lg:w-72" : ""
      }`}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="relative h-28 w-28 animate-[float_4s_ease-in-out_infinite]">
          <div className="mascot-orb relative h-full w-full rounded-full">
            <div className="absolute inset-2 flex items-center justify-center gap-3">
              <div className="mascot-eye">
                <div className="mascot-eyelid" />
              </div>
              <div className="mascot-eye">
                <div className="mascot-eyelid" />
              </div>
            </div>
            <div className="absolute -bottom-3 left-1/2 h-10 w-16 -translate-x-1/2 rounded-b-full border-4 border-ink bg-[var(--paper-shadow)]" />
          </div>
        </div>
        <div>
          <div className="font-display text-2xl">Atlas the Guide</div>
          <p className="text-sm text-ink/80">{tip}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-olive">
          <span className="rounded-md border-2 border-ink px-2 py-1 bg-[rgba(255,255,255,0.7)]">
            {isRegenerating ? "Debounce" : "Synced"}
          </span>
          <span className="rounded-md border-2 border-ink px-2 py-1 bg-[rgba(179,90,42,0.1)]">Clock Synced</span>
        </div>
      </div>
    </div>
  );
}

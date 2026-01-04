"use client";

import { usePlan } from "./PlanContext";

export default function StageTimeline() {
  const { plan } = usePlan();

  return (
    <div className="card-frame p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-olive">Ruta</p>
          <div className="font-display text-2xl">Stages</div>
        </div>
        <div className="rounded-lg border-2 border-ink bg-[rgba(255,255,255,0.6)] px-3 py-1 text-xs font-mono">PRINT · A6</div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 timeline-rail">
        {plan.stages.map((stagePlan) => (
          <div
            key={stagePlan.stage}
            className="relative rounded-xl border-2 border-ink bg-[rgba(255,255,255,0.65)] p-4 pl-5 shadow-[8px_10px_0_rgba(27,26,20,0.14)]"
          >
            <div className="absolute -left-3 top-5 h-6 w-6 rounded-full border-3 border-ink bg-paper text-center font-mono text-[10px]">
              ·
            </div>
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-mono text-xs text-olive">{stagePlan.stage}</p>
                <p className="font-semibold">{stagePlan.actions.do[0] ?? "Stage focus"}</p>
              </div>
              <span className="rounded-md border border-ink bg-[rgba(179,90,42,0.08)] px-2 py-1 text-[11px] font-mono">
                {stagePlan.actions.do.length} actions
              </span>
            </div>
            <p className="mt-2 text-sm text-ink/75">
              {stagePlan.actions.do.slice(0, 2).join(" · ") || "Stage ready"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

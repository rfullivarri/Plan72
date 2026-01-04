"use client";

import { useMemo } from "react";

import { usePlan } from "./PlanContext";

export default function StageTimeline() {
  const { plan, isRegenerating } = usePlan();

  const stampLabel = useMemo(() => {
    const base = plan.mode === "MOVE" ? "Advance" : "Shelter";
    return isRegenerating ? `${base} · recalculando` : `${base} · sync`;
  }, [isRegenerating, plan.mode]);

  return (
    <div className="card-frame p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-olive">Ruta</p>
          <div className="font-display text-2xl">Stages</div>
        </div>
        <div className="rounded-lg border-2 border-ink bg-[rgba(255,255,255,0.6)] px-3 py-1 text-xs font-mono">PRINT · A6</div>
      </div>

      <div className="tva-meter" aria-hidden>
        {plan.stages.map((stagePlan, idx) => {
          const left = plan.stages.length === 1 ? 0 : (idx / (plan.stages.length - 1)) * 100;
          return (
            <span
              key={`${stagePlan.stage}-tick`}
              className="tva-meter__tick"
              style={{ left: `${left}%` }}
              aria-hidden
            />
          );
        })}
        <div className="tva-meter__stamp" data-active={isRegenerating}>
          <span>{stampLabel}</span>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 timeline-rail">
        {plan.stages.map((stagePlan) => (
          <div
            key={stagePlan.stage}
            className="stage-card relative rounded-xl border-2 border-ink bg-[rgba(255,255,255,0.65)] p-4 pl-5 shadow-[8px_10px_0_rgba(27,26,20,0.14)]"
            data-stage={stagePlan.stage}
          >
            <div className="stage-card__pin" aria-hidden>
              <span className="stage-card__pin-dot" />
              <span className="stage-card__pin-mark" />
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
            <div className="stage-card__stamp" data-highlight={stagePlan.stage === plan.stages[0]?.stage}>
              NEXT · {stagePlan.nextCard ?? "chain"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { scenarioMockContent, stageWindows } from "@/lib/scenarioMockContent";
import { ScenarioCode, StageKey } from "@/lib/schema";
import { usePlan } from "./PlanContext";

const stageOrder: StageKey[] = ["STG0", "STG1", "STG2", "STG3"];

export default function ProtocolCard({ scenario }: { scenario: ScenarioCode }) {
  const { input, plan } = usePlan();
  const content = scenarioMockContent[scenario];
  const routeSummary =
    plan.scenarioPlans.find((item) => item.scenario === scenario)?.card.routeSummary ??
    plan.routes.base.corridor.map((point) => point.label ?? "").filter(Boolean).join(" → ") ??
    "Start → DP1 → DP2 → DP3 → Destination";

  return (
    <article className="space-y-3 rounded-2xl border-2 border-ink bg-[rgba(255,255,255,0.9)] p-4 shadow-[8px_10px_0_rgba(27,26,20,0.18)]">
      <header className="space-y-1">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-olive">Tarjeta de protocolo</p>
        <h3 className="font-display text-xl leading-tight">
          {input.city} – {content.title} – {input.moment}
        </h3>
        <p className="text-sm text-ink/80">{content.blurb}</p>
      </header>

      <div className="flex flex-wrap gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-ink">
        <span className="rounded-full border border-ink/60 px-2 py-1 bg-[rgba(179,90,42,0.08)]">SCN {scenario}</span>
        <span className="rounded-full border border-ink/60 px-2 py-1 bg-[rgba(74,90,58,0.08)]">MOM {input.moment}</span>
        {stageOrder.map((stage) => (
          <span key={stage} className="rounded-full border border-ink/50 px-2 py-1 bg-[rgba(0,0,0,0.04)]">
            {stage}
          </span>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {stageOrder.map((stage) => (
          <div key={stage} className="rounded-xl border border-ink/20 bg-[rgba(245,232,204,0.6)] p-3">
            <div className="flex items-center justify-between">
              <div className="font-mono text-xs text-olive">{stage}</div>
              <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-ink/80">{stageWindows[stage]}</div>
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-ink/80">
              {content.stages[stage]?.slice(0, 3).map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2 rounded-xl border border-ink/30 bg-[rgba(74,90,58,0.08)] p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-olive">Do</p>
          <ul className="list-disc space-y-1 pl-4 text-sm text-ink/80">
            {content.do.slice(0, 3).map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-2 rounded-xl border border-ink/30 bg-[rgba(179,90,42,0.08)] p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-olive">Don&apos;t</p>
          <ul className="list-disc space-y-1 pl-4 text-sm text-ink/80">
            {content.dont.slice(0, 3).map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-xs font-mono uppercase tracking-[0.2em] text-ink/80">
        Route summary: {routeSummary}
      </p>
    </article>
  );
}

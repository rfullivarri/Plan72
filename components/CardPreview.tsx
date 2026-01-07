"use client";

import { humanizeLevel, humanizeScenario, usePlan } from "./PlanContext";
import { ScenarioCode } from "@/lib/schema";

export default function CardPreview({ scenario }: { scenario?: ScenarioCode }) {
  const { input, plan } = usePlan();
  const selectedScenario = scenario ?? input.scenarios[0];
  const primaryCard =
    plan.scenarioPlans.find((item) => item.scenario === selectedScenario)?.card ?? plan.scenarioPlans[0]?.card;
  const corridor = plan.routes.base.corridor;
  const corridorText = primaryCard?.routeSummary ?? corridor.map((point) => point.label ?? "").join(" → ");

  const firstStage = primaryCard?.stages[0];
  const objective = primaryCard?.label ?? "Live objective";
  const actionWindow = firstStage?.window ?? "00:00";
  const doList = primaryCard?.do ?? [];
  const nodePriorities = primaryCard?.resourcePriority;
  const scenarioLabel = selectedScenario ? humanizeScenario(selectedScenario) : humanizeScenario("UNK");

  return (
    <div className="relative mx-auto max-w-md">
      <div className="absolute -inset-4 border-4 border-ink rounded-3xl rotate-1 opacity-60"></div>
      <div className="card-frame relative aspect-[3/4] overflow-hidden rounded-3xl bg-paper p-6">
        <div className="absolute left-0 top-0 h-16 w-16 bg-gradient-to-br from-[var(--rust)]/80 to-[var(--olive)]/60 blur-3xl opacity-40" />
        <div className="absolute right-4 top-4 ribbon-tag">A6 PROTOCOL</div>
        <div className="hero-grid" aria-hidden />
        <header className="space-y-1">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-olive">Protocol draft</p>
          <h3 className="font-display text-4xl leading-tight">
            {input.city} – {scenarioLabel} – {input.moment}
          </h3>
          <p className="text-sm text-ink/80">Nivel {humanizeLevel(input.level)} · {primaryCard?.mode ?? "MOVE"} focus</p>
        </header>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-xl border-2 border-ink/60 bg-[rgba(255,255,255,0.6)] px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-ink px-3 py-1 text-xs font-mono text-paper">{firstStage?.stage ?? "STG"}</span>
              <div>
                <p className="text-xs font-mono text-olive">{primaryCard?.mode ?? "MOVE"}</p>
                <p className="text-sm font-semibold">{objective}</p>
              </div>
            </div>
            <span className="text-xs font-mono text-ink/70">{actionWindow}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-2 rounded-xl border-2 border-ink/50 bg-[rgba(245,232,204,0.7)] p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-olive">Do</p>
              <ul className="list-disc space-y-1 pl-4 text-ink/80">
                {(doList.length > 0 ? doList : ["Esperando inputs…"]).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-2 rounded-xl border-2 border-ink/50 bg-[rgba(255,255,255,0.7)] p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-olive">Corridor</p>
              <div className="space-y-1 text-ink/80">
                <p>{corridorText}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border-2 border-ink/60 bg-[rgba(255,255,255,0.5)] px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-olive">
            <span>Nodes: {nodePriorities?.join(" · ") ?? "Pending"}</span>
            <span className="text-ink">{firstStage?.mode ?? "S"}</span>
          </div>
        </div>

        <div className="absolute -left-10 top-16 h-16 w-16 rotate-45 border-4 border-ink bg-[var(--paper-shadow)] opacity-70" aria-hidden></div>
        <div className="absolute -right-8 bottom-10 h-12 w-32 -rotate-3 border-4 border-ink bg-[var(--olive)]/80" aria-hidden></div>
      </div>
    </div>
  );
}

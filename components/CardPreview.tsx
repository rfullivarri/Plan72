"use client";

import { humanizeLevel, humanizeScenario, usePlan } from "./PlanContext";

export default function CardPreview() {
  const { input, plan } = usePlan();
  const actionCard = plan.cards.find((card) => card.id.includes("ACT") && card.stage === plan.stages[0]?.stage);
  const statusCard = plan.cards.find((card) => card.id.includes("STS"));
  const corridor = plan.routes.base.corridor;

  const objective = typeof actionCard?.front["objective"] === "string" ? actionCard.front["objective"] : "Live objective";
  const actionWindow = typeof actionCard?.front["window"] === "string" ? actionCard.front["window"] : "00:00";
  const nextStage = typeof actionCard?.front["next"] === "string" ? actionCard.front["next"] : "Stage linked";
  const doList = Array.isArray(actionCard?.front["do"]) ? (actionCard.front["do"] as unknown[]).map(String) : undefined;
  const nodePriorities = Array.isArray(statusCard?.front["priority"])
    ? (statusCard.front["priority"] as unknown[]).map(String)
    : undefined;

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
            {input.city} – {input.scenario} – {input.moment}
          </h3>
          <p className="text-sm text-ink/80">Nivel {humanizeLevel(input.level)} · {humanizeScenario(input.scenario)} focus</p>
        </header>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-xl border-2 border-ink/60 bg-[rgba(255,255,255,0.6)] px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-ink px-3 py-1 text-xs font-mono text-paper">{actionCard?.stage ?? "STG"}</span>
              <div>
                <p className="text-xs font-mono text-olive">{plan.mode}</p>
                <p className="text-sm font-semibold">{objective}</p>
              </div>
            </div>
            <span className="text-xs font-mono text-ink/70">{actionWindow}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-2 rounded-xl border-2 border-ink/50 bg-[rgba(245,232,204,0.7)] p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-olive">Do</p>
              <ul className="list-disc space-y-1 pl-4 text-ink/80">
                {(doList ?? ["Esperando inputs…"]).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-2 rounded-xl border-2 border-ink/50 bg-[rgba(255,255,255,0.7)] p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-olive">Corridor</p>
              <div className="space-y-1 text-ink/80">
                {corridor.slice(0, 3).map((point, idx) => (
                  <p key={point.label ?? idx}>
                    {String(idx + 1).padStart(2, "0")} · {point.label} ({point.lat.toFixed(2)}, {point.lng.toFixed(2)})
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border-2 border-ink/60 bg-[rgba(255,255,255,0.5)] px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-olive">
            <span>Nodes: {nodePriorities?.join(" · ") ?? "Pending"}</span>
            <span className="text-ink">{nextStage}</span>
          </div>
        </div>

        <div className="absolute -left-10 top-16 h-16 w-16 rotate-45 border-4 border-ink bg-[var(--paper-shadow)] opacity-70" aria-hidden></div>
        <div className="absolute -right-8 bottom-10 h-12 w-32 -rotate-3 border-4 border-ink bg-[var(--olive)]/80" aria-hidden></div>
      </div>
    </div>
  );
}

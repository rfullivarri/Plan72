"use client";

import { usePlan } from "./PlanContext";

export default function CardStack() {
  const { plan } = usePlan();
  const scenarioCards = plan.scenarioCards;

  return (
    <div className="space-y-2">
      <h4 className="font-display text-2xl">Protocol Cards</h4>
      <div className="space-y-3">
        {scenarioCards.map((card, idx) => (
          <details key={card.id} className="card-frame p-4" open={idx === 0}>
            <summary className="flex cursor-pointer items-center justify-between gap-3 text-left">
              <div>
                <p className="font-mono text-xs text-olive">{card.scenario}</p>
                <p className="font-semibold">{card.label}</p>
              </div>
              <div className="text-right text-sm font-mono">
                <div>{card.mode}</div>
                <div className="text-ink/70">{card.routeSummary}</div>
              </div>
            </summary>

            <div className="mt-3 grid gap-3 sm:grid-cols-2 text-sm text-ink/80">
              <div className="space-y-2">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-olive">Stages</p>
                <ul className="space-y-1">
                  {card.stages.map((stage) => (
                    <li key={stage.stage} className="flex items-center justify-between rounded-lg border-2 border-ink/20 px-3 py-2">
                      <span className="font-semibold">{stage.stage}</span>
                      <span className="text-xs font-mono text-olive">{stage.window}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-olive">Do / Don&apos;t</p>
                <div className="grid grid-cols-2 gap-2">
                  <ul className="list-disc space-y-1 pl-4">
                    {card.do.map((item, actionIdx) => (
                      <li key={actionIdx}>{item}</li>
                    ))}
                  </ul>
                  <ul className="list-disc space-y-1 pl-4">
                    {card.dont.map((item, actionIdx) => (
                      <li key={actionIdx}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-md border border-dashed border-ink/40 px-2 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-olive">
                  Route: {card.routeId} · Nodes: {card.nodeSummary}
                </div>
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

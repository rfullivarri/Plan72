"use client";

import { humanizeLevel, humanizeScenarioList, usePlan } from "./PlanContext";

export default function PrintDeck() {
  const { input, plan } = usePlan();
  const primaryCard = plan.scenarioPlans[0]?.card;
  const scenarioLabel = humanizeScenarioList(input.scenarios);

  return (
    <div className="print-deck" aria-hidden>
      <div className="print-sheet">
        <div className="print-crop print-crop--tl" />
        <div className="print-crop print-crop--tr" />
        <div className="print-crop print-crop--bl" />
        <div className="print-crop print-crop--br" />

        <header className="print-sheet__header">
          <div>
            <p className="print-kicker">plan72 · protocol</p>
            <h2 className="print-title">
              {input.city} / {scenarioLabel} / {input.moment}
            </h2>
            <p className="print-subtitle">
              Nivel {humanizeLevel(input.level)} · {primaryCard?.mode ?? "MOVE"} corridor
            </p>
          </div>
          <div className="print-badge">
            <span>retro stack</span>
            <strong>A6/A7 ready</strong>
          </div>
        </header>

        <div className="print-grid">
          {plan.scenarioPlans.map(({ card }) => (
            <article key={card.id} className="print-card">
              <div className="print-card__chrome">
                <span className="print-card__stage">{card.scenario}</span>
                <span className="print-card__code">{card.mode}</span>
              </div>
              <h3 className="print-card__title">{card.routeSummary}</h3>

              <div className="print-card__columns">
                <div className="print-card__block">
                  <p className="print-label">STG0..3</p>
                  <ul>
                    {card.stages.map((stage) => (
                      <li key={stage.stage}>
                        {stage.stage}: {stage.actions.slice(0, 3).join(" · ")}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="print-card__block">
                  <p className="print-label">Do / Don&apos;t</p>
                  <ul>
                    {card.do.map((item, idx) => (
                      <li key={`do-${idx}`}>{item}</li>
                    ))}
                    {card.dont.map((item, idx) => (
                      <li key={`dont-${idx}`}>× {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="print-meta">
                <span className="print-chip">MODE · {card.mode}</span>
                <span className="print-chip">Nodes · {card.resourcePriority.join(" · ")}</span>
                <span className="print-chip">Resource Nodes · {card.resourceNodes.length}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

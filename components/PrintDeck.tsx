"use client";

import { humanizeLevel, humanizeScenario, usePlan } from "./PlanContext";

type CardFace = Record<string, unknown>;

function listFrom(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") return [value];
  return [];
}

export default function PrintDeck() {
  const { input, plan } = usePlan();

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
              {input.city} / {humanizeScenario(input.scenario)} / {input.moment}
            </h2>
            <p className="print-subtitle">
              Nivel {humanizeLevel(input.level)} · {plan.mode} corridor
            </p>
          </div>
          <div className="print-badge">
            <span>retro stack</span>
            <strong>A6/A7 ready</strong>
          </div>
        </header>

        <div className="print-grid">
          {plan.cards.map((card) => {
            const doList = listFrom((card.front as CardFace)["do"]);
            const checkList = listFrom((card.front as CardFace)["check"]);
            const priorities = listFrom((card.front as CardFace)["priority"]);

            return (
              <article key={`${card.id}-${card.stage}`} className="print-card">
                <div className="print-card__chrome">
                  <span className="print-card__stage">Stage {card.stage}</span>
                  <span className="print-card__code">{card.id}</span>
                </div>
                <h3 className="print-card__title">{String((card.front as CardFace)["objective"] ?? "Pending objective")}</h3>

                <div className="print-card__columns">
                  <div className="print-card__block">
                    <p className="print-label">Do</p>
                    <ul>
                      {doList.length > 0 ? (
                        doList.map((item, idx) => <li key={idx}>{item}</li>)
                      ) : (
                        <li>Esperando inputs…</li>
                      )}
                    </ul>
                  </div>

                  <div className="print-card__block">
                    <p className="print-label">Check</p>
                    <ul>
                      {checkList.length > 0 ? (
                        checkList.map((item, idx) => <li key={idx}>{item}</li>)
                      ) : (
                        <li>Enlazar sensores</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="print-meta">
                  <span className="print-chip">T+ {String((card.front as CardFace)["window"] ?? "00:00")}</span>
                  <span className="print-chip">Next · {String((card.front as CardFace)["next"] ?? "chain")}</span>
                  <span className="print-chip">Nodes · {priorities.join(" · ") || "pending"}</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

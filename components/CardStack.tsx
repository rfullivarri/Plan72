"use client";

import { usePlan } from "./PlanContext";

export default function CardStack() {
  const { plan } = usePlan();

  return (
    <div className="space-y-2">
      <h4 className="font-display text-2xl">Protocol Cards</h4>
      <ul className="space-y-2">
        {plan.cards.map((card) => (
          <li key={`${card.id}-${card.stage}`} className="card-frame p-4 flex items-center justify-between">
            <div>
              <p className="font-mono text-xs text-olive">{card.id}</p>
              <p className="font-semibold">Stage {card.stage}</p>
            </div>
            <span className="text-sm font-mono">
              {typeof card.front["objective"] === "string" ? card.front["objective"] : "A6/A7"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

import assert from "assert";

import { generatePlan } from "../lib/planEngine";
import { PlanInput } from "../lib/schema";

const sampleInput: PlanInput = {
  city: "BCN",
  start: { lat: 41.41, lng: 2.22, label: "Forum" },
  peopleCount: 2,
  scenario: "NUK",
  moment: "POST",
  level: "STANDARD",
  preferences: {
    avoidAvenues: true,
    avoidUnderground: true,
    avoidTourist: true,
    avoidCriticalInfra: true,
  },
  resourceNodes: [
    { id: "N0", label: "Home", lat: 41.39, lng: 2.16, types: ["A", "C", "E"] },
    { id: "N1", label: "Clinic", lat: 41.4, lng: 2.18, types: ["D", "A"] },
  ],
};

const plan = generatePlan(sampleInput);

// Meta
assert.strictEqual(plan.meta.id, "BCN-NUK-POST-STANDARD");
assert.ok(plan.meta.generatedAt.length > 0);

// Stage coverage
assert.strictEqual(plan.stages.length, 4);
assert.deepStrictEqual(plan.stages.map((s) => s.stage), ["STG0", "STG1", "STG2", "STG3"]);

// Mode rules for NUK–POST
assert.strictEqual(plan.mode, "SHELTER");
const stg0Card = plan.cards.find((card) => card.stage === "STG0" && card.id.includes("ACT"));
assert.ok(stg0Card);
assert.strictEqual(stg0Card?.front["mode"], "SHELTER");
const stg2Card = plan.cards.find((card) => card.stage === "STG2" && card.id.includes("ACT"));
assert.strictEqual(stg2Card?.front["mode"], "MOVE");

// Resource priorities
const statusCard = plan.cards.find((card) => card.id.includes("STS"));
assert.ok(statusCard);
assert.deepStrictEqual(statusCard?.front["priority"], ["A", "C", "E", "B"]);

// Route scaffold
assert.strictEqual(plan.routes.base.corridor.length, 5);
assert.strictEqual(plan.routes.base.decisionPoints.length, 3);
assert.strictEqual(plan.routes.base.corridor[0]?.label, "Forum");
assert.strictEqual(
  plan.routes.base.corridor[plan.routes.base.corridor.length - 1]?.label,
  "Collserola (green high ground)",
);
assert.strictEqual(plan.routes.base.alts.length, 2);

// Card mix
const cardTypes = ["RTE", "ACT", "STS", "CHK"];
cardTypes.forEach((type) => {
  assert.ok(plan.cards.some((card) => card.id.includes(type)), `Expected card type ${type}`);
});

console.log("planEngine tests passed");

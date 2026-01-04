import { PlanInput, PlanOutput } from "./schema";

export function generatePlan(input: PlanInput): PlanOutput {
  return {
    meta: {
      id: `${input.city}-${input.scenario}-${input.moment}-${input.level}`,
      generatedAt: new Date().toISOString(),
    },
    mode: "SHELTER",
    stages: [],
    routes: {
      base: {
        corridor: [],
        decisionPoints: [],
        alts: [],
      },
    },
    cards: [],
  };
}

import BCN_TEMPLATE from "./BCN.json";
import { PlanInput } from "../schema";

type PlanStart = PlanInput["start"];

type AvoidRuleKey = "avoidCriticalInfra" | "avoidTouristClusters" | "avoidUnderground" | "avoidAvenues";

export type CityTemplate = {
  city: string;
  label: string;
  defaults: {
    start: PlanStart;
    level: PlanInput["level"];
    peopleCount: number;
  };
  objectives: {
    primary: PlanStart;
    secondary?: PlanStart;
  };
  decisionPoints: Array<PlanStart & { id: string }>;
  corridor: {
    intent: string;
    alts: Array<{ id: string; label: string }>;
  };
  avoidRules?: Partial<Record<AvoidRuleKey, boolean>>;
};

const BCN = BCN_TEMPLATE as CityTemplate;

export const cityTemplates: Record<string, CityTemplate> = {
  [BCN.city]: BCN,
};

export function buildPlanInputFromTemplate(city: string, overrides: Partial<PlanInput> = {}): PlanInput {
  const template = cityTemplates[city];

  const basePreferences = {
    avoidAvenues: template?.avoidRules?.avoidAvenues ?? true,
    avoidUnderground: template?.avoidRules?.avoidUnderground ?? true,
    avoidTourist: template?.avoidRules?.avoidTouristClusters ?? true,
    avoidCriticalInfra: template?.avoidRules?.avoidCriticalInfra ?? true,
  } satisfies PlanInput["preferences"];

  if (template) {
    const base: PlanInput = {
      city: template.city,
      start: template.defaults.start,
      peopleCount: template.defaults.peopleCount,
      scenarios: ["NUK"],
      moment: "POST",
      level: template.defaults.level,
      preferences: basePreferences,
      resourceNodes: [],
    };

    return {
      ...base,
      ...overrides,
      start: overrides.start ?? base.start,
      preferences: { ...base.preferences, ...overrides.preferences },
      resourceNodes: overrides.resourceNodes ?? base.resourceNodes,
      scenarios: overrides.scenarios ?? base.scenarios,
    };
  }

  const fallback: PlanInput = {
    city,
    start: overrides.start ?? { lat: 0, lng: 0, label: "Start" },
    peopleCount: overrides.peopleCount ?? 1,
    scenarios: overrides.scenarios ?? ["UNK"],
    moment: overrides.moment ?? "PRE",
    level: overrides.level ?? "BASIC",
    preferences: { ...basePreferences, ...overrides.preferences },
    resourceNodes: overrides.resourceNodes ?? [],
  };

  return fallback;
}

export const defaultCityTemplate = buildPlanInputFromTemplate("BCN");

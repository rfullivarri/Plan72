import BCN_TEMPLATE from "./cityTemplates/BCN.json";
import { PlanInput } from "./schema";

export type CityTemplate = {
  city: string;
  label: string;
  defaults: {
    start: PlanInput["start"];
    level: PlanInput["level"];
    peopleCount: number;
  };
  objectives: {
    primary: PlanInput["start"];
    secondary?: PlanInput["start"];
  };
  decisionPoints: Array<PlanInput["start"] & { id: string }>;
  corridor: {
    intent: string;
    alts: Array<{ id: string; label: string }>;
  };
  avoidRules?: {
    avoidCriticalInfra?: boolean;
    avoidTouristClusters?: boolean;
    avoidUnderground?: boolean;
    avoidAvenues?: boolean;
  };
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
      scenario: "NUK",
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
    };
  }

  const fallback: PlanInput = {
    city,
    start: overrides.start ?? { lat: 0, lng: 0, label: "Start" },
    peopleCount: overrides.peopleCount ?? 1,
    scenario: overrides.scenario ?? "UNK",
    moment: overrides.moment ?? "PRE",
    level: overrides.level ?? "BASIC",
    preferences: { ...basePreferences, ...overrides.preferences },
    resourceNodes: overrides.resourceNodes ?? [],
  };

  return fallback;
}

export const defaultCityTemplate = buildPlanInputFromTemplate("BCN");

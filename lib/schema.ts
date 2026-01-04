export type ScenarioCode = "AIR" | "NUK" | "CIV" | "EQK" | "UNK";
export type MomentCode = "PRE" | "POST";
export type PlanLevel = "BASIC" | "STANDARD" | "ADVANCED";
export type StageKey = "STG0" | "STG1" | "STG2" | "STG3";

export interface Coordinate {
  lat: number;
  lng: number;
  label?: string;
}

export interface RouteAlternative {
  id: string;
  label: string;
  note?: string;
  path?: Coordinate[];
}

export interface ResourceNode {
  id: string;
  label: string;
  lat: number;
  lng: number;
  types: Array<"A" | "B" | "C" | "D" | "E" | "F">;
}

export interface PlanInput {
  city: string;
  start: Coordinate;
  peopleCount: number;
  scenarios: ScenarioCode[];
  moment: MomentCode;
  level: PlanLevel;
  preferences: {
    avoidAvenues?: boolean;
    avoidUnderground?: boolean;
    avoidTourist?: boolean;
    avoidCriticalInfra?: boolean;
  };
  resourceNodes: ResourceNode[];
}

export interface StagePlan {
  stage: StageKey;
  window: string;
  mode: "MOVE" | "SHELTER";
  actions: string[];
}

export interface ScenarioCard {
  id: string;
  scenario: ScenarioCode;
  label: string;
  mode: "MOVE" | "SHELTER";
  routeSummary: string;
  map: {
    corridor: Coordinate[];
    decisionPoints: Coordinate[];
    alts: RouteAlternative[];
    intent: string;
    objective: string;
  };
  stages: StagePlan[];
  do: string[];
  dont: string[];
  resourcePriority: Array<"A" | "B" | "C" | "D" | "E" | "F">;
  resourceNodes: ResourceNode[];
}

export interface PlanOutput {
  meta: {
    id: string;
    generatedAt: string;
  };
  routes: {
    base: {
      corridor: Coordinate[];
      decisionPoints: Coordinate[];
      alts: RouteAlternative[];
      intent: string;
    };
  };
  scenarioPlans: Array<{
    scenario: ScenarioCode;
    card: ScenarioCard;
  }>;
}

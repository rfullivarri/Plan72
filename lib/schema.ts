export type ScenarioCode = "AIR" | "NUK" | "CIV" | "EQK" | "UNK";
export type MomentCode = "PRE" | "POST";
export type PlanLevel = "BASIC" | "STANDARD" | "ADVANCED";

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
  scenario: ScenarioCode;
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

export interface PlanOutput {
  meta: {
    id: string;
    generatedAt: string;
  };
  mode: "MOVE" | "SHELTER";
  stages: Array<{
    stage: string;
    actions: {
      do: string[];
      dont: string[];
    };
    nextCard?: string;
  }>;
  routes: {
    base: {
      corridor: Coordinate[];
      decisionPoints: Coordinate[];
      alts: RouteAlternative[];
    };
  };
  cards: Array<{
    id: string;
    stage: string;
    front: Record<string, unknown>;
    back: Record<string, unknown>;
  }>;
}

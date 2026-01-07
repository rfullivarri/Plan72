import { cityTemplates } from "./cityTemplates";
import { scenarioText, stageWindows } from "./scenarioText";
import { Coordinate, PlanInput, PlanOutput, ResourceType, RouteAlternative, ScenarioCode, StageKey } from "./schema";

const CARD_ID_SEPARATOR = "–";

type ResourceCode = ResourceType;

const resourcePriority = {
  AIR: {
    PRE: ["D", "A", "C", "B"],
    POST: ["D", "A", "C", "B"],
  },
  NUK: {
    PRE: ["C", "A", "E", "A", "C", "E", "B"],
    POST: ["A", "C", "E", "B"],
  },
  CIV: {
    PRE: ["A", "B", "D", "E"],
    POST: ["A", "B", "D", "E"],
  },
  EQK: {
    PRE: ["D", "A", "C"],
    POST: ["D", "A", "C"],
  },
  UNK: {
    PRE: ["A", "C", "E"],
    POST: ["A", "C", "E"],
  },
} satisfies Record<ScenarioCode, Record<"PRE" | "POST", ResourceCode[]>>;

const resourceLegendLabels: Record<ResourceCode, string> = {
  A: "Water",
  B: "Power",
  C: "Medical",
  D: "Shelter",
  E: "Comms",
  F: "Transit",
};

function determineMode(scenario: ScenarioCode, moment: "PRE" | "POST", stage: StageKey) {
  if (scenario === "NUK") {
    if (stage === "STG0" || stage === "STG1") {
      return "SHELTER" as const;
    }
    return "MOVE" as const;
  }

  if (scenario === "AIR") {
    return "MOVE" as const;
  }

  if (scenario === "CIV") {
    return "MOVE" as const;
  }

  if (scenario === "EQK") {
    return stage === "STG0" ? (moment === "PRE" ? "SHELTER" : "MOVE") : "MOVE";
  }

  return stage === "STG0" || stage === "STG1" ? "SHELTER" : "MOVE";
}

function getStageActions(scenario: ScenarioCode, stage: StageKey) {
  return scenarioText[scenario]?.stages[stage] ?? [];
}

function buildBaseCorridor(start: Coordinate): Coordinate[] {
  return [
    { ...start, label: start.label ?? "Start" },
    { lat: start.lat + 0.02, lng: start.lng - 0.02, label: "DP1" },
    { lat: start.lat + 0.05, lng: start.lng - 0.03, label: "DP2" },
    { lat: start.lat + 0.08, lng: start.lng - 0.04, label: "DP3" },
  ];
}

function buildBCNCorridor(input: PlanInput): {
  corridor: Coordinate[];
  decisionPoints: Coordinate[];
  alts: RouteAlternative[];
  intent: string;
} {
  const template = cityTemplates["BCN"];
  const start = {
    ...template.defaults.start,
    ...input.start,
    label: input.start.label || template.defaults.start.label,
  };

  const decisionPoints = template.decisionPoints.map((dp) => ({
    lat: dp.lat,
    lng: dp.lng,
    label: dp.label,
  }));

  const primaryObjective = {
    lat: template.objectives.primary.lat,
    lng: template.objectives.primary.lng,
    label: template.objectives.primary.label,
  } satisfies Coordinate;

  return {
    corridor: [start, ...decisionPoints, primaryObjective],
    decisionPoints,
    alts: template.corridor.alts.map((alt) => ({ id: alt.id, label: alt.label })),
    intent: template.corridor.intent,
  };
}

export function generatePlan(input: PlanInput): PlanOutput {
  const scenarios = input.scenarios.length > 0 ? input.scenarios : (["UNK"] as ScenarioCode[]);
  const stages: StageKey[] = ["STG0", "STG1", "STG2", "STG3"];

  const bcnRoute = input.city === "BCN" ? buildBCNCorridor(input) : null;
  const fallbackCorridor = buildBaseCorridor(input.start);

  const corridor = bcnRoute?.corridor ?? fallbackCorridor;
  const decisionPoints = bcnRoute?.decisionPoints ?? fallbackCorridor.slice(1, 4);
  const altRoutes = bcnRoute?.alts ?? [];
  const routeIntent = bcnRoute?.intent ?? "Base heuristic corridor";
  const objectiveLabel = corridor[corridor.length - 1]?.label ?? "Objective";
  const corridorSummary =
    input.city === "BCN"
      ? "Start → DP1 → DP2 → DP3 → Destination"
      : corridor.map((point) => point.label ?? "").join(" → ");
  const routeId = `${input.city}-${input.moment}-R1`;
  const nodeSetId = `${input.city}-${input.moment}-N1`;
  const availableResourceTypes = Array.from(
    new Set(input.resourceNodes.flatMap((node) => node.types)),
  ) as ResourceCode[];
  const legendTypes =
    availableResourceTypes.length > 0 ? availableResourceTypes : (["A", "B", "C", "D", "E", "F"] as ResourceCode[]);

  const scenarioCards = scenarios.map((scenario) => {
    const stagePlans = stages.map((stage) => {
      const stageMode = determineMode(scenario, input.moment, stage);
      const stageActions = getStageActions(scenario, stage);
      return {
        stage,
        window: stageWindows[stage],
        mode: stageMode,
        actions: stageActions.slice(0, 3),
      } as const;
    });

    const baseMode = determineMode(scenario, input.moment, "STG0");
    const actionSet = scenarioText[scenario];
    const priorityOrder = resourcePriority[scenario][input.moment];
    const nodeSummary =
      input.resourceNodes.length > 0
        ? `${input.resourceNodes.length} nodes · Priority ${priorityOrder.join(" · ")}`
        : `No nodes · Priority ${priorityOrder.join(" · ")}`;

    const card = {
      id: `${input.city}${CARD_ID_SEPARATOR}SCN${CARD_ID_SEPARATOR}${scenario}${CARD_ID_SEPARATOR}${input.moment}`,
      scenario,
      label: `${scenario} protocol`,
      mode: baseMode,
      routeId,
      routeSummary: corridorSummary,
      nodeSetId,
      nodeSummary,
      stages: stagePlans,
      do: actionSet.do.slice(0, 3),
      dont: actionSet.dont.slice(0, 3),
      resourcePriority: priorityOrder,
    };

    return card as const;
  });

  return {
    meta: {
      id: `${input.city}-${scenarios.join("+")}-${input.moment}-${input.level}`,
      generatedAt: new Date().toISOString(),
    },
    mapCard: {
      id: `${input.city}${CARD_ID_SEPARATOR}MAP${CARD_ID_SEPARATOR}${input.moment}`,
      routeId,
      nodeSetId,
      routeSummary: corridorSummary,
      map: {
        corridor,
        decisionPoints,
        alts: altRoutes,
        intent: routeIntent,
        objective: objectiveLabel,
      },
      decisionPoints,
      resourceNodes: input.resourceNodes,
      resourceLegend: legendTypes.map((type) => ({ type, label: resourceLegendLabels[type] })),
    },
    scenarioCards,
  };
}

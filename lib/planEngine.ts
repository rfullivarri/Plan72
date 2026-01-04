import { Coordinate, PlanInput, PlanOutput, ScenarioCode } from "./schema";

type StageKey = "STG0" | "STG1" | "STG2" | "STG3";

const CARD_ID_SEPARATOR = "–";

const stageWindows: Record<StageKey, string> = {
  STG0: "0–60 min",
  STG1: "1–6 h",
  STG2: "6–24 h",
  STG3: "24–72 h",
};

const resourcePriority: Record<ScenarioCode, Record<"PRE" | "POST", string[]>> = {
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

function buildActions(
  scenario: ScenarioCode,
  moment: "PRE" | "POST",
  stage: StageKey,
  mode: "MOVE" | "SHELTER",
) {
  const actions: Record<ScenarioCode, { do: string[]; dont: string[] }> = {
    AIR: {
      do: ["Check cover", "Watch sky cues", "Stay off bridges"],
      dont: ["Cluster under glass", "Ignore sirens", "Block corridors"],
    },
    NUK: {
      do: ["Seal interior", "Track official guidance", "Prep filtered water"],
      dont: ["Peek outside", "Rely on lifts", "Rush crowds"],
    },
    CIV: {
      do: ["Pack low-profile", "Use side streets", "Keep comms brief"],
      dont: ["Display gear", "Join crowds", "Argue at checkpoints"],
    },
    EQK: {
      do: ["Check structure", "Open exits", "Carry sturdy shoes"],
      dont: ["Use elevators", "Stay near glass", "Ignore aftershocks"],
    },
    UNK: {
      do: ["Limit signals", "Observe quietly", "Map Resource Nodes"],
      dont: ["Advertise plans", "Travel loud routes", "Stay under billboards"],
    },
  };

  const adjustments: Partial<Record<StageKey, { do?: string[]; dont?: string[] }>> = {
    STG0: {
      do: [mode === "SHELTER" ? "Secure shelter" : "Start corridor move", "Confirm headcount", "Stage kits"],
      dont: ["Delay first step", "Overpack", "Split without plan"],
    },
    STG1: {
      do: ["Log Decision Points", "Rotate lookout", "Stay hydrated"],
      dont: ["Overstay risky spots", "Skip check-ins", "Ignore fatigue"],
    },
    STG2: {
      do: ["Collect priority resources", "Check maps offline", "Plan rest slots"],
      dont: ["Hug main avenues", "Share exact route", "Drain batteries"],
    },
    STG3: {
      do: ["Stagger movement", "Mark safe nodes", "Review fallback"],
      dont: ["Camp in open", "Signal from peaks", "Leave gear unsecured"],
    },
  };

  const base = actions[scenario];
  const stageAdj = adjustments[stage] ?? { do: [], dont: [] };
  const stageDo = stageAdj.do ?? [];
  const stageDont = stageAdj.dont ?? [];
  return {
    do: [...stageDo, ...base.do].slice(0, 3),
    dont: [...stageDont, ...base.dont].slice(0, 3),
  };
}

function buildBaseCorridor(start: Coordinate): Coordinate[] {
  return [
    { ...start, label: start.label ?? "Start" },
    { lat: start.lat + 0.02, lng: start.lng - 0.02, label: "DP1" },
    { lat: start.lat + 0.05, lng: start.lng - 0.03, label: "DP2" },
    { lat: start.lat + 0.08, lng: start.lng - 0.04, label: "DP3" },
  ];
}

export function generatePlan(input: PlanInput): PlanOutput {
  const stages: StageKey[] = ["STG0", "STG1", "STG2", "STG3"];
  const stagePlans = stages.map((stage, index) => {
    const mode = determineMode(input.scenario, input.moment, stage);
    const actions = buildActions(input.scenario, input.moment, stage, mode);
    const nextCard = index < stages.length - 1 ? `${input.city}${CARD_ID_SEPARATOR}ACT${CARD_ID_SEPARATOR}${input.scenario}${CARD_ID_SEPARATOR}${input.moment}#${stages[index + 1]}` : undefined;
    return {
      stage,
      actions,
      nextCard,
    } as const;
  });

  const baseMode = determineMode(input.scenario, input.moment, "STG0");
  const corridor = buildBaseCorridor(input.start);
  const decisionPoints = corridor.slice(1, 4);

  const routeCardId = `${input.city}${CARD_ID_SEPARATOR}RTE${CARD_ID_SEPARATOR}BASE`;
  const actionCardId = `${input.city}${CARD_ID_SEPARATOR}ACT${CARD_ID_SEPARATOR}${input.scenario}${CARD_ID_SEPARATOR}${input.moment}`;
  const statusCardId = `${input.city}${CARD_ID_SEPARATOR}STS${CARD_ID_SEPARATOR}${input.scenario}${CARD_ID_SEPARATOR}${input.moment}`;
  const checklistCardId = `${input.city}${CARD_ID_SEPARATOR}CHK`;

  const priorityOrder = resourcePriority[input.scenario][input.moment];

  return {
    meta: {
      id: `${input.city}-${input.scenario}-${input.moment}-${input.level}`,
      generatedAt: new Date().toISOString(),
    },
    mode: baseMode,
    stages: stagePlans,
    routes: {
      base: {
        corridor,
        decisionPoints,
        alts: [],
      },
    },
    cards: [
      ...stagePlans.map((stagePlan) => ({
        id: actionCardId,
        stage: stagePlan.stage,
        front: {
          id: actionCardId,
          stage: stagePlan.stage,
          mode: determineMode(input.scenario, input.moment, stagePlan.stage),
          objective: `${stagePlan.stage} protocol for ${input.scenario}`,
          trigger: `${input.moment} cues acknowledged`,
          do: stagePlan.actions.do,
          dont: stagePlan.actions.dont,
          next: stagePlan.nextCard,
          window: stageWindows[stagePlan.stage],
        },
        back: {
          stage: stagePlan.stage,
          mode: determineMode(input.scenario, input.moment, stagePlan.stage),
          checkpoints: decisionPoints.map((dp) => dp.label),
          fallback: ["Keep corridor options", "Use permitted Resource Nodes"],
        },
      })),
      {
        id: routeCardId,
        stage: "STG1",
        front: {
          id: routeCardId,
          mode: baseMode,
          corridor: corridor.map((point) => point.label ?? ""),
          decisionPoints: decisionPoints.map((point, idx) => `${idx + 1}. ${point.label}`),
          objective: "Base corridor with Decision Points",
          window: stageWindows["STG1"],
        },
        back: {
          route: corridor,
          alts: [],
        },
      },
      {
        id: statusCardId,
        stage: "STG0",
        front: {
          id: statusCardId,
          priority: priorityOrder,
          label: "Resource Node priorities",
          nodes: input.resourceNodes,
        },
        back: {
          reminder: "Use only permitted Resource Nodes",
          resourceOrder: priorityOrder.join(" → "),
          nodes: input.resourceNodes,
        },
      },
      {
        id: checklistCardId,
        stage: "STG0",
        front: {
          id: checklistCardId,
          checks: ["Water", "Warmth", "Rest", "Comms"],
          objective: "Quick checklist",
        },
        back: {
          fallback: ["If unsure, pause and reassess", "Keep Resource Nodes visible to team"],
        },
      },
    ],
  };
}

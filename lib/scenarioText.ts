import { ScenarioCode, StageKey } from "./schema";

export const stageWindows: Record<StageKey, string> = {
  STG0: "0–60 min",
  STG1: "1–6 h",
  STG2: "6–24 h",
  STG3: "24–72 h",
};

export const scenarioText: Record<ScenarioCode, { label: string; do: string[]; dont: string[]; stages: Record<StageKey, string[]>; }> = {
  AIR: {
    label: "Airborne hazard",
    do: ["Carry mask and eye seal", "Scan overhead hazards", "Use covered corridors"],
    dont: ["Block emergency lanes", "Stand under signage", "Ignore shelter notices"],
    stages: {
      STG0: ["Shelter inside solid core", "Check ventilation controls", "Review exit corridors"],
      STG1: ["Move along covered routes", "Keep distance from facades", "Track wind direction"],
      STG2: ["Rotate rest under cover", "Verify bridge conditions", "Monitor air advisories"],
      STG3: ["Plan moves during low wind", "Inspect filters and seals", "Document exposure symptoms"],
    },
  },
  NUK: {
    label: "Radiological release",
    do: ["Keep windows sealed", "Store water covered", "Document exposure minutes"],
    dont: ["Open doors repeatedly", "Travel without covering", "Rely on rumors"],
    stages: {
      STG0: ["Seal interior seams fast", "Move two walls deep", "Track official broadcast"],
      STG1: ["Limit exposure near openings", "Ration filtered water", "Log radiation time"],
      STG2: ["Plan short outdoor transfers", "Cover skin and hair", "Use shadowed routes"],
      STG3: ["Rotate shelter to reduce dose", "Check contamination before entry", "Bag waste separately"],
    },
  },
  CIV: {
    label: "Civil disruption",
    do: ["Keep comms brief", "Carry cash and ID", "Use neutral clothing"],
    dont: ["Film confrontations", "Argue with officials", "Join large groups"],
    stages: {
      STG0: ["Remove visible affiliations", "Choose quiet exit path", "Stage ID and essentials"],
      STG1: ["Use side streets with cover", "Keep voice low", "Pair up at crossings"],
      STG2: ["Avoid choke points", "Check curfew times", "Rest inside locked rooms"],
      STG3: ["Rotate watchers discreetly", "Change patterns daily", "Confirm contact windows"],
    },
  },
  EQK: {
    label: "Earthquake response",
    do: ["Wear sturdy footwear", "Carry basic first aid", "Secure heavy items"],
    dont: ["Use elevators", "Stand near windows", "Reenter without checks"],
    stages: {
      STG0: ["Drop beside sturdy interior", "Protect head and neck", "Stay clear of glass lines"],
      STG1: ["Check exits for blockage", "Shut utilities if safe", "Move to open assembly"],
      STG2: ["Inspect structure before reentry", "Avoid damaged overpasses", "Log aftershocks and cracks"],
      STG3: ["Plan detours around debris", "Share quake status updates", "Rest away from facades"],
    },
  },
  UNK: {
    label: "Unspecified hazard",
    do: ["Stay inconspicuous", "Preserve batteries", "Mark Resource Nodes (owned/consented)"],
    dont: ["Share exact plans", "Travel noisy routes", "Ignore local cues"],
    stages: {
      STG0: ["Calmly assess surroundings", "Verify headcount and condition", "Identify Resource Nodes (owned/consented)"],
      STG1: ["Set comms check interval", "Choose covered observation point", "Record notable changes"],
      STG2: ["Test alternate routes quietly", "Limit light and noise", "Keep exit plan ready"],
      STG3: ["Refresh map notes", "Rotate rest shifts", "Review trigger thresholds"],
    },
  },
};

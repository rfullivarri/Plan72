import { PlanInput } from "./schema";

export const defaultCityTemplate: PlanInput = {
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
  ],
};

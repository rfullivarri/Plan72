import { Coordinate, ResourceNode } from "./schema";

const NODE_TYPES: Array<{ code: ResourceNode["types"][number]; label: string }> = [
  { code: "A", label: "Hidratación" },
  { code: "B", label: "Calorías" },
  { code: "C", label: "Abrigo / calor" },
  { code: "D", label: "Médico" },
];

function offsetCoordinate(base: Coordinate, idx: number): Coordinate {
  const offset = 0.0035 + idx * 0.0006;
  const lat = base.lat + Math.sin(idx + 1) * offset;
  const lng = base.lng + Math.cos(idx + 1) * offset;
  return { ...base, lat, lng };
}

export function buildMockNodesForRoute(polyline: Coordinate[]): ResourceNode[] {
  if (!polyline || polyline.length === 0) return [];

  const anchors = [
    polyline[0],
    polyline[Math.max(1, Math.floor(polyline.length / 3))] ?? polyline[0],
    polyline[Math.max(1, Math.floor((polyline.length * 2) / 3))] ?? polyline[polyline.length - 1],
    polyline[polyline.length - 1],
  ];

  return anchors.map((point, idx) => {
    const type = NODE_TYPES[idx % NODE_TYPES.length];
    const offsetPoint = offsetCoordinate(point, idx);
    return {
      id: `RN-${type.code}-${idx}`,
      label: `${type.code} · ${type.label}`,
      lat: Number(offsetPoint.lat.toFixed(6)),
      lng: Number(offsetPoint.lng.toFixed(6)),
      types: [type.code],
    } satisfies ResourceNode;
  });
}

export const RESOURCE_NODE_LEGEND: Record<ResourceNode["types"][number], { icon: string; title: string; description: string }> = {
  A: { icon: "💧", title: "A", description: "Hidratación" },
  B: { icon: "🍚", title: "B", description: "Calorías" },
  C: { icon: "🧥", title: "C", description: "Abrigo / calor" },
  D: { icon: "⛑️", title: "D", description: "Médico" },
  E: { icon: "", title: "E", description: "" },
  F: { icon: "", title: "F", description: "" },
};

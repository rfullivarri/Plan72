import { Coordinate } from "./schema";

export type MockRouteResult = {
  polyline: Coordinate[];
  decisionPoints: Coordinate[];
  destination: Coordinate;
  summary: string;
  distanceKm: number;
  distanceLabel: string;
  etaLabel: string;
};

const BCN_DESTINATION: Coordinate = {
  lat: 41.418,
  lng: 2.107,
  label: "Collserola (alto verde)",
};

function haversineDistanceKm(a: Coordinate, b: Coordinate) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);

  const h = sinLat * sinLat + sinLng * sinLng * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

function interpolatePoint(start: Coordinate, end: Coordinate, fraction: number, label: string): Coordinate {
  return {
    lat: start.lat + (end.lat - start.lat) * fraction,
    lng: start.lng + (end.lng - start.lng) * fraction,
    label,
  };
}

function formatEta(hours: number) {
  const totalMinutes = Math.max(20, Math.round(hours * 60));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h <= 0) return `~${m}m a pie`;
  return `~${h}h ${m.toString().padStart(2, "0")}m a pie`;
}

export function generateMockRoute(start: Coordinate, city?: string): MockRouteResult {
  const destination: Coordinate =
    city === "BCN"
      ? BCN_DESTINATION
      : {
          lat: start.lat + 0.12,
          lng: start.lng + 0.08,
          label: "Punto alto seguro",
        };

  const labels = ["DP1", "DP2", "DP3"];
  const fractions = [0.25, 0.5, 0.75];
  const decisionPoints = fractions.map((fraction, idx) => interpolatePoint(start, destination, fraction, labels[idx]));

  const polyline = [
    { ...start, label: start.label || "Inicio" },
    ...decisionPoints,
    destination,
  ];

  const distanceKm = polyline.reduce((sum, point, idx) => {
    if (idx === 0) return 0;
    return sum + haversineDistanceKm(polyline[idx - 1], point);
  }, 0);

  const walkingSpeedKmh = 4.5;
  const etaHours = distanceKm / walkingSpeedKmh;
  const distanceLabel = `~${distanceKm.toFixed(1)} km`;
  const etaLabel = formatEta(etaHours);
  const summary = `${polyline[0].label ?? "Inicio"} → DP1 → DP2 → DP3 → ${destination.label ?? "Destino"}`;

  return { polyline, decisionPoints, destination, summary, distanceKm, distanceLabel, etaLabel };
}

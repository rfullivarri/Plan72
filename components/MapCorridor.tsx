"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

type CorridorLeg = {
  label: string;
  coordinates: L.LatLngExpression[];
  color: string;
  dashArray?: string;
};

type MarkerPin = {
  label: string;
  position: L.LatLngExpression;
};

const startPoint: MarkerPin = {
  label: "Start",
  position: [41.3874, 2.1686],
};

const targetPoint: MarkerPin = {
  label: "Collserola high ground",
  position: [41.4416, 2.103],
};

const decisionPoints: MarkerPin[] = [
  { label: "DP1 - Arc",
    position: [41.3949, 2.1566],
  },
  { label: "DP2 - Sant Gervasi",
    position: [41.4078, 2.1375],
  },
  { label: "DP3 - Peu del Funicular",
    position: [41.4223, 2.1202],
  },
];

const baseCorridor: CorridorLeg = {
  label: "Base corridor",
  color: "#1f4b99",
  coordinates: [
    startPoint.position,
    [41.3973, 2.1478],
    [41.4141, 2.1304],
    [41.4307, 2.1182],
    targetPoint.position,
  ],
};

const alternativeCorridors: CorridorLeg[] = [
  {
    label: "ALT1 - Diagonal ridge",
    color: "#d9480f",
    dashArray: "10 6",
    coordinates: [
      startPoint.position,
      [41.4023, 2.1764],
      [41.4187, 2.1522],
      [41.4396, 2.1234],
      targetPoint.position,
    ],
  },
  {
    label: "ALT2 - Sarrià shield",
    color: "#117a65",
    dashArray: "6 6",
    coordinates: [
      startPoint.position,
      [41.3834, 2.1502],
      [41.4081, 2.1129],
      [41.4347, 2.0954],
      targetPoint.position,
    ],
  },
];

export default function MapCorridor() {
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [visibleAlternatives, setVisibleAlternatives] = useState<Record<string, boolean>>({
    [alternativeCorridors[0].label]: true,
    [alternativeCorridors[1].label]: false,
  });

  const bounds = useMemo(() => {
    const points: L.LatLngExpression[] = [startPoint.position, targetPoint.position, ...baseCorridor.coordinates];

    alternativeCorridors.forEach((corridor) => {
      if (visibleAlternatives[corridor.label]) {
        points.push(...corridor.coordinates);
      }
    });

    return L.latLngBounds(points);
  }, [visibleAlternatives]);

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);
    setMapReady(true);
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !layerRef.current) return;

    const layer = layerRef.current;
    layer.clearLayers();

    const addMarker = (pin: MarkerPin, variant?: "target") => {
      const marker = L.marker(pin.position).addTo(layer);
      const label = variant === "target" ? `${pin.label} (Objective)` : pin.label;
      marker.bindPopup(label).bindTooltip(label, { permanent: false, direction: "top" });
      if (variant === "target") {
        L.circle(pin.position, {
          radius: 700,
          color: "#3e4c59",
          weight: 1,
          fillColor: "#cdd5df",
          fillOpacity: 0.25,
        }).addTo(layer);
      }
    };

    addMarker(startPoint);
    addMarker(targetPoint, "target");
    decisionPoints.forEach((dp) => addMarker(dp));

    L.polyline(baseCorridor.coordinates, {
      color: baseCorridor.color,
      weight: 5,
      opacity: 0.9,
    })
      .addTo(layer)
      .bindTooltip(baseCorridor.label, { sticky: true });

    alternativeCorridors.forEach((corridor) => {
      if (!visibleAlternatives[corridor.label]) return;

      L.polyline(corridor.coordinates, {
        color: corridor.color,
        weight: 3.5,
        dashArray: corridor.dashArray,
        opacity: 0.9,
      })
        .addTo(layer)
        .bindTooltip(corridor.label, { sticky: true });
    });

    mapRef.current.fitBounds(bounds, { padding: [12, 12] });
  }, [bounds, mapReady, visibleAlternatives]);

  const toggleAlternative = (label: string) => {
    setVisibleAlternatives((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <div className="card-frame p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.25em] text-olive">Corridor</div>
          <div className="font-display text-xl">BCN &rarr; Collserola</div>
          <p className="text-xs text-ink/70">MVP with OSM tiles, markers for decision points and optional alternatives.</p>
        </div>
        <div className="rounded-md border-2 border-ink bg-[rgba(255,255,255,0.65)] px-3 py-2 text-xs font-semibold">
          Live map
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="h-2 w-2 rounded-full bg-[var(--rust)]" aria-hidden />
            Decision points
          </div>
          <ul className="text-xs text-ink/80">
            {decisionPoints.map((dp) => (
              <li key={dp.label} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-ink" aria-hidden />
                {dp.label}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-semibold">Alternatives</div>
          <div className="flex flex-wrap gap-2">
            {alternativeCorridors.map((alt) => (
              <label key={alt.label} className="flex items-center gap-2 rounded-md border-2 border-ink bg-[rgba(255,255,255,0.7)] px-2 py-1 text-xs font-semibold shadow-[6px_8px_0_rgba(27,26,20,0.1)]">
                <input
                  type="checkbox"
                  checked={Boolean(visibleAlternatives[alt.label])}
                  onChange={() => toggleAlternative(alt.label)}
                  className="accent-[var(--rust)]"
                />
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-4 rounded-sm" style={{ backgroundColor: alt.color }} aria-hidden />
                  {alt.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={mapContainerRef}
        className="mt-2 h-80 w-full overflow-hidden rounded-lg border-2 border-ink shadow-[10px_12px_0_rgba(27,26,20,0.12)]"
        aria-label="Map corridor visualization"
      />
    </div>
  );
}

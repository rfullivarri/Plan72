"use client";

import { useEffect, useMemo, useState } from "react";
import type { Geometry, Position } from "geojson";

type CityMapProps = {
  city: string;
  center: { lat: number; lng: number };
  boundingBox?: [number, number, number, number];
  boundary?: Geometry;
  address?: { label: string; lat: number; lng: number } | null;
  destination?: { label: string; lat: number; lng: number } | null;
  mode?: "alternatives" | "confirmed";
};

const WIDTH = 1200;
const HEIGHT = 760;
const TILE = 256;
const ROUTE_DELAYS = [0, 0.35, 0.8, 1.3, 0.18, 0.62, 1.05, 1.55];
const ROUTE_DURATIONS = [6.4, 7.15, 6.75, 7.8, 7.35, 6.6, 8.1, 7.55];

function project(lng: number, lat: number, zoom: number) {
  const scale = TILE * 2 ** zoom;
  const safeLat = Math.max(-85.0511, Math.min(85.0511, lat));
  const sin = Math.sin((safeLat * Math.PI) / 180);
  return {
    x: ((lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  };
}

function chooseZoom(center: CityMapProps["center"], box?: CityMapProps["boundingBox"]) {
  if (!box) return 12;
  for (let zoom = 15; zoom >= 8; zoom -= 1) {
    const northWest = project(box[2], box[1], zoom);
    const southEast = project(box[3], box[0], zoom);
    if (Math.abs(southEast.x - northWest.x) < WIDTH * 0.72 && Math.abs(southEast.y - northWest.y) < HEIGHT * 0.68) return zoom;
  }
  return center.lat > 60 ? 9 : 10;
}

function chooseRouteZoom(start: { lat: number; lng: number }, end: { lat: number; lng: number }) {
  for (let zoom = 16; zoom >= 10; zoom -= 1) {
    const startPx = project(start.lng, start.lat, zoom);
    const endPx = project(end.lng, end.lat, zoom);
    if (Math.abs(endPx.x - startPx.x) < WIDTH * 0.62 && Math.abs(endPx.y - startPx.y) < HEIGHT * 0.58) return zoom;
  }
  return 10;
}

function geometryRings(geometry?: Geometry): Position[][] {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return geometry.coordinates;
  if (geometry.type === "MultiPolygon") return geometry.coordinates.flat();
  return [];
}

export default function CityMap({ city, center, boundingBox, boundary, address, destination = null, mode = "alternatives" }: CityMapProps) {
  const [streetRoutes, setStreetRoutes] = useState<Position[][]>([]);
  const [confirmedRoute, setConfirmedRoute] = useState<Position[]>([]);

  useEffect(() => {
    if (!address) {
      setStreetRoutes([]);
      setConfirmedRoute([]);
      return;
    }
    const controller = new AbortController();
    const latScale = Math.max(0.45, Math.cos((address.lat * Math.PI) / 180));
    const radius = 0.012;
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0], [.72, .72], [-.72, .72], [.72, -.72], [-.72, -.72]];
    Promise.all(directions.map(async ([dx, dy]) => {
      const destinationLng = address.lng + (dx * radius) / latScale;
      const destinationLat = address.lat + dy * radius;
      const url = `https://router.project-osrm.org/route/v1/driving/${address.lng},${address.lat};${destinationLng},${destinationLat}?overview=full&geometries=geojson`;
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) return null;
      const payload = await response.json() as { routes?: Array<{ geometry?: { coordinates?: Position[] } }> };
      return payload.routes?.[0]?.geometry?.coordinates ?? null;
    })).then((routes) => setStreetRoutes(routes.filter((route): route is Position[] => Boolean(route?.length))))
      .catch(() => setStreetRoutes([]));

    if (destination) {
      const routeUrl = `https://router.project-osrm.org/route/v1/driving/${address.lng},${address.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
      fetch(routeUrl, { signal: controller.signal })
        .then((response) => response.ok ? response.json() : null)
        .then((payload: { routes?: Array<{ geometry?: { coordinates?: Position[] } }> } | null) => setConfirmedRoute(payload?.routes?.[0]?.geometry?.coordinates ?? []))
        .catch(() => setConfirmedRoute([]));
    } else {
      setConfirmedRoute([]);
    }
    return () => controller.abort();
  }, [address, destination]);

  const scene = useMemo(() => {
    const isConfirmedView = Boolean(address && destination && mode === "confirmed");
    const zoom = isConfirmedView && address && destination ? chooseRouteZoom(address, destination) : address ? 15 : chooseZoom(center, boundingBox);
    const focus = isConfirmedView && address && destination
      ? { lng: (address.lng + destination.lng) / 2, lat: (address.lat + destination.lat) / 2 }
      : address ? { lng: address.lng, lat: address.lat } : center;
    const focusPx = project(focus.lng, focus.lat, zoom);
    const origin = { x: focusPx.x - WIDTH / 2, y: focusPx.y - HEIGHT / 2 };
    const minTileX = Math.floor(origin.x / TILE);
    const maxTileX = Math.floor((origin.x + WIDTH) / TILE);
    const minTileY = Math.floor(origin.y / TILE);
    const maxTileY = Math.floor((origin.y + HEIGHT) / TILE);
    const tiles = [];
    for (let y = minTileY; y <= maxTileY; y += 1) {
      for (let x = minTileX; x <= maxTileX; x += 1) {
        tiles.push({ x, y, left: x * TILE - origin.x, top: y * TILE - origin.y });
      }
    }
    const toLocal = ([lng, lat]: Position) => {
      const point = project(lng, lat, zoom);
      return { x: point.x - origin.x, y: point.y - origin.y };
    };
    const rings = geometryRings(boundary);
    const perimeterPath = rings.map((ring) => ring.map((position, index) => {
      const point = toLocal(position);
      return `${index ? "L" : "M"}${point.x.toFixed(1)},${point.y.toFixed(1)}`;
    }).join(" ") + " Z").join(" ");
    const fallbackBox = boundingBox
      ? [[boundingBox[2], boundingBox[0]], [boundingBox[3], boundingBox[0]], [boundingBox[3], boundingBox[1]], [boundingBox[2], boundingBox[1]], [boundingBox[2], boundingBox[0]]] as Position[]
      : [];
    const fallbackPath = fallbackBox.map((position, index) => {
      const point = toLocal(position);
      return `${index ? "L" : "M"}${point.x.toFixed(1)},${point.y.toFixed(1)}`;
    }).join(" ") + (fallbackBox.length ? " Z" : "");
    const addressPoint = address ? toLocal([address.lng, address.lat]) : null;
    const destinationPoint = destination ? toLocal([destination.lng, destination.lat]) : null;
    return { zoom, origin, tiles, perimeterPath: perimeterPath || fallbackPath, addressPoint, destinationPoint };
  }, [center, boundingBox, boundary, address, destination, mode]);

  const routePaths = useMemo(() => streetRoutes.map((route) => route.map(([lng, lat], index) => {
    const point = project(lng, lat, scene.zoom);
    return `${index ? "L" : "M"}${(point.x - scene.origin.x).toFixed(1)},${(point.y - scene.origin.y).toFixed(1)}`;
  }).join(" ")), [scene.origin.x, scene.origin.y, scene.zoom, streetRoutes]);

  const confirmedPath = useMemo(() => confirmedRoute.map(([lng, lat], index) => {
    const point = project(lng, lat, scene.zoom);
    return `${index ? "L" : "M"}${(point.x - scene.origin.x).toFixed(1)},${(point.y - scene.origin.y).toFixed(1)}`;
  }).join(" "), [confirmedRoute, scene.origin.x, scene.origin.y, scene.zoom]);

  const showAlternatives = mode === "alternatives" && Boolean(scene.addressPoint && routePaths.length);
  const showConfirmed = mode === "confirmed" && Boolean(scene.addressPoint && scene.destinationPoint && confirmedPath);

  return (
    <div className={`p72-city-map-wrap ${address ? "is-address-view" : ""}`}>
      <svg className="p72-raster-map" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid slice" role="img" aria-label={`Mapa urbano de ${city}`}>
        <rect width={WIDTH} height={HEIGHT} fill="#e7ebe5" />
        {scene.tiles.map((tile) => (
          <image key={`${tile.x}-${tile.y}`} href={`https://a.basemaps.cartocdn.com/light_all/${scene.zoom}/${tile.x}/${tile.y}.png`} x={tile.left} y={tile.top} width={TILE + 1} height={TILE + 1} preserveAspectRatio="none" />
        ))}
        {!address && <path className="p72-city-boundary" d={scene.perimeterPath} fillRule="evenodd" />}
        {showAlternatives && <g className="p72-route-wave">
          {routePaths.map((route, index) => <path
            key={index}
            className="p72-route-preview"
            d={route}
            pathLength="1"
            style={{
              animationDelay: `${ROUTE_DELAYS[index % ROUTE_DELAYS.length]}s`,
              animationDuration: `${ROUTE_DURATIONS[index % ROUTE_DURATIONS.length]}s`,
            }}
          />)}
        </g>}
        {showConfirmed && <>
          <path className="p72-confirmed-route-shadow" d={confirmedPath} pathLength="1" />
          <path className="p72-confirmed-route" d={confirmedPath} pathLength="1" />
        </>}
        {scene.addressPoint && (
          <g className="p72-address-marker" transform={`translate(${scene.addressPoint.x} ${scene.addressPoint.y})`}>
            <circle r="23" className="p72-address-pulse" />
            <path d="M0 17C-7 8-15-1-15-11a15 15 0 1 1 30 0C15-1 7 8 0 17Z" />
            <circle cy="-10" r="5" />
          </g>
        )}
        {showConfirmed && scene.destinationPoint && (
          <g className="p72-safe-marker" transform={`translate(${scene.destinationPoint.x} ${scene.destinationPoint.y})`}>
            <circle className="p72-safe-pulse" r="25" />
            <circle className="p72-safe-core" r="17" />
            <path d="M-7 0l5 5L8-7" />
            <text y="-32" textAnchor="middle">ZONA SEGURA</text>
          </g>
        )}
      </svg>
      <div className="p72-map-topbar">
        <span className="p72-live-dot" />
        <strong>{city}</strong>
        <small>{mode === "confirmed" ? "RUTA CONFIRMADA" : address ? "RUTAS POSIBLES" : "PERÍMETRO URBANO"}</small>
      </div>
      <div className="p72-map-legend">
        <span><i className="p72-legend-area" /> Área urbana</span>
        {address && <span><i className="p72-legend-start" /> Tu dirección</span>}
        {address && <span><i className="p72-legend-route" /> {mode === "confirmed" ? "Ruta confirmada" : "Rutas posibles"}</span>}
      </div>
      <a className="p72-map-credit" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap · © CARTO</a>
    </div>
  );
}

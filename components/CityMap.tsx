"use client";

import { useEffect, useRef, useState } from "react";

type MapLibreModule = typeof import("maplibre-gl");
type MapLibreMap = InstanceType<MapLibreModule["Map"]>;
type MapLibreMarker = InstanceType<MapLibreModule["Marker"]>;

type CityMapProps = {
  city: string;
  center: { lat: number; lng: number };
  boundingBox?: [number, number, number, number];
  address?: { label: string; lat: number; lng: number } | null;
};

const STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const perimeter = (
  center: CityMapProps["center"],
  box?: CityMapProps["boundingBox"],
) => {
  const south = box?.[0] ?? center.lat - 0.055;
  const north = box?.[1] ?? center.lat + 0.055;
  const west = box?.[2] ?? center.lng - 0.08;
  const east = box?.[3] ?? center.lng + 0.08;
  return [[west, south], [east, south], [east, north], [west, north], [west, south]];
};

function markerElement(kind: "city" | "address") {
  const el = document.createElement("div");
  el.className = `p72-map-pin p72-map-pin-${kind}`;
  el.innerHTML = kind === "address" ? "<span></span>" : "<i></i>";
  return el;
}

export default function CityMap({ city, center, boundingBox, address }: CityMapProps) {
  const container = useRef<HTMLDivElement | null>(null);
  const map = useRef<MapLibreMap | null>(null);
  const markers = useRef<MapLibreMarker[]>([]);
  const [lib, setLib] = useState<MapLibreModule | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    import("maplibre-gl")
      .then((module) => setLib((module.default ?? module) as unknown as MapLibreModule))
      .catch(() => setFailed(true));
  }, []);

  useEffect(() => {
    if (!lib || !container.current || map.current || failed) return;
    const instance = new lib.Map({
      container: container.current,
      style: STYLE,
      center: [center.lng, center.lat],
      zoom: 11.8,
      attributionControl: false,
    });
    instance.addControl(new lib.NavigationControl({ showCompass: false }), "bottom-right");
    instance.on("load", () => {
      instance.addSource("city-perimeter", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: { type: "Polygon", coordinates: [perimeter({ lat: center.lat, lng: center.lng }, boundingBox)] },
          properties: {},
        },
      });
      instance.addLayer({
        id: "city-fill",
        type: "fill",
        source: "city-perimeter",
        paint: { "fill-color": "#b8d86b", "fill-opacity": 0.11 },
      });
      instance.addLayer({
        id: "city-outline",
        type: "line",
        source: "city-perimeter",
        paint: { "line-color": "#63813d", "line-width": 2, "line-dasharray": [2, 2] },
      });
      instance.addSource("preview-route", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      instance.addLayer({
        id: "preview-route-line",
        type: "line",
        source: "preview-route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#123426", "line-width": 5, "line-opacity": 0.9 },
      });
      setReady(true);
    });
    map.current = instance;
    return () => {
      markers.current.forEach((marker) => marker.remove());
      markers.current = [];
      instance.remove();
      map.current = null;
    };
  }, [lib, failed, center.lat, center.lng, boundingBox]);

  useEffect(() => {
    if (!lib || !map.current || !ready) return;
    const instance = map.current;
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    const cityMarker = new lib.Marker({ element: markerElement("city") })
      .setLngLat([center.lng, center.lat])
      .addTo(instance);
    markers.current.push(cityMarker);

    const routeSource = instance.getSource("preview-route");
    if (address) {
      const addressMarker = new lib.Marker({ element: markerElement("address"), anchor: "bottom" })
        .setLngLat([address.lng, address.lat])
        .addTo(instance);
      markers.current.push(addressMarker);
      routeSource?.setData({
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [address.lng, address.lat],
            [address.lng + 0.022, address.lat + 0.012],
            [address.lng + 0.045, address.lat + 0.028],
          ],
        },
        properties: {},
      });
      instance.flyTo({ center: [address.lng, address.lat], zoom: 13.6, duration: 900 });
    } else {
      routeSource?.setData({ type: "FeatureCollection", features: [] });
      instance.flyTo({ center: [center.lng, center.lat], zoom: 11.8, duration: 900 });
    }
  }, [lib, ready, center.lat, center.lng, address]);

  if (failed) {
    return <div className="p72-map-fallback">No pudimos cargar el mapa urbano.</div>;
  }

  return (
    <div className="p72-city-map-wrap">
      <div ref={container} className="p72-city-map" aria-label={`Mapa urbano de ${city}`} />
      <div className="p72-map-topbar">
        <span className="p72-live-dot" />
        <strong>{city}</strong>
        <small>{address ? "PUNTO DE PARTIDA LISTO" : "PERÍMETRO URBANO"}</small>
      </div>
      <div className="p72-map-legend">
        <span><i className="p72-legend-area" /> Área urbana</span>
        <span><i className="p72-legend-start" /> Tu punto</span>
        <span><i className="p72-legend-route" /> Ruta preliminar</span>
      </div>
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Feature, Geometry } from "geojson";
import { feature } from "topojson-client";
import type { GlobeMethods, GlobeProps } from "react-globe.gl";
import * as THREE from "three";

import countriesData from "world-atlas/countries-110m.json";
import { getCountryOptions, normalizeCountryInput } from "@/lib/countryData";

const Globe = dynamic(async () => {
  const { default: GlobeComponent } = await import("react-globe.gl");
  const GlobeWithRef = forwardRef<GlobeMethods, GlobeProps>((props, ref) => {
    const localRef = useRef<GlobeMethods | undefined>(undefined);

    useImperativeHandle(ref, () => localRef.current as GlobeMethods, []);

    return <GlobeComponent ref={localRef} {...props} />;
  });
  GlobeWithRef.displayName = "GlobeWithRef";
  return GlobeWithRef;
}, { ssr: false });

export type Globe3DHandle = {
  focusCountry: (countryName: string) => void;
  focusCity: (lat: number, lng: number) => void;
  resetIdle: () => void;
};

type Globe3DProps = {
  selectedCountry?: string;
  selectedCity?: { name?: string; lat: number; lng: number };
  locked?: boolean;
  lowMotion?: boolean;
  showDebugCenter?: boolean;
};

type CountryFeature = Feature<Geometry, { name?: string }>;

type PointOfView = {
  lat: number;
  lng: number;
  altitude?: number;
};

type GlobePoint = {
  lat: number;
  lng: number;
  name?: string;
  type?: "city" | "debug-center";
};

type TopologyLike = {
  type: "Topology";
  objects: Record<string, unknown>;
};

const GLOBE_COLOR = "#f0e6cf";
const BORDER_COLOR = "#1b1a14";
const HIGHLIGHT_COLOR = "#b35a2a";
const IDLE_ROTATION_SPEED = 0.35;
const DEFAULT_VIEW: PointOfView = { lat: 10, lng: -10, altitude: 1.6 };
const CITY_VIEW_ALTITUDE = 0.9;

const FALLBACK_REGION_CODES = ["US", "ES", "FR", "CN", "NL"];

const getRegionCodes = () => {
  const supportedValuesOf = (Intl as typeof Intl & { supportedValuesOf?: (key: string) => string[] })
    .supportedValuesOf;
  if (typeof supportedValuesOf !== "function") {
    return FALLBACK_REGION_CODES;
  }
  try {
    return supportedValuesOf("region");
  } catch {
    return FALLBACK_REGION_CODES;
  }
};

const buildCountryNameIndex = () => {
  const regionCodes = getRegionCodes();
  const displayEn = new Intl.DisplayNames(["en"], { type: "region" });
  const displayEs = new Intl.DisplayNames(["es"], { type: "region" });
  const nameToIso = new Map<string, string>();

  for (const code of regionCodes) {
    const englishName = displayEn.of(code);
    const spanishName = displayEs.of(code);
    if (englishName) nameToIso.set(normalizeCountryInput(englishName), code);
    if (spanishName) nameToIso.set(normalizeCountryInput(spanishName), code);
  }
  return {
    nameToIso,
    displayEn,
    displayEs,
  };
};

const ISO_ALIASES: Record<string, string[]> = {
  US: ["USA", "U.S.A.", "United States", "United States of America", "Estados Unidos", "EE.UU.", "EE UU"],
  NL: ["Netherlands", "Holanda", "Países Bajos", "Paises Bajos"],
  ES: ["Spain", "España", "Espana"],
  FR: ["France", "Francia"],
  CN: ["China"],
};

const aliasToIso = new Map(
  Object.entries(ISO_ALIASES).flatMap(([iso, aliases]) =>
    aliases.map((alias) => [normalizeCountryInput(alias), iso])
  )
);

const resolveIsoCode = (input: string, nameIndex: Map<string, string>) => {
  const normalized = normalizeCountryInput(input);
  if (!normalized) return null;
  const aliasMatch = aliasToIso.get(normalized);
  if (aliasMatch) return aliasMatch;
  return nameIndex.get(normalized) ?? null;
};

const levenshteinDistance = (a: string, b: string) => {
  const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
};

const getFeatureCoordinates = (geometry: Geometry): number[][] => {
  if (geometry.type === "Polygon") return geometry.coordinates.flat();
  if (geometry.type === "MultiPolygon") return geometry.coordinates.flat(2);
  return [];
};

const getRingCentroid = (ring: number[][]): { lat: number; lng: number; area: number } | null => {
  if (ring.length < 3) return null;

  let areaAccumulator = 0;
  let centroidX = 0;
  let centroidY = 0;
  const lastIndex = ring.length - 1;
  const ringPoints =
    ring[0][0] === ring[lastIndex][0] && ring[0][1] === ring[lastIndex][1]
      ? ring.slice(0, -1)
      : ring;

  if (ringPoints.length < 3) return null;

  for (let i = 0; i < ringPoints.length; i += 1) {
    const [x0, y0] = ringPoints[i];
    const [x1, y1] = ringPoints[(i + 1) % ringPoints.length];
    const cross = x0 * y1 - x1 * y0;
    areaAccumulator += cross;
    centroidX += (x0 + x1) * cross;
    centroidY += (y0 + y1) * cross;
  }

  if (!Number.isFinite(areaAccumulator) || areaAccumulator === 0) return null;
  const area = areaAccumulator / 2;
  const factor = 1 / (6 * area);
  const lng = centroidX * factor;
  const lat = centroidY * factor;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng, area: Math.abs(area) };
};

const getFeatureCentroid = (
  featureItem: CountryFeature
): { lat: number; lng: number } | null => {
  const geometry = featureItem.geometry;
  let bestCentroid: { lat: number; lng: number; area: number } | null = null;

  if (geometry.type === "Polygon") {
    const ringCentroid = getRingCentroid(geometry.coordinates[0] ?? []);
    if (ringCentroid) bestCentroid = ringCentroid;
  } else if (geometry.type === "MultiPolygon") {
    for (const polygon of geometry.coordinates) {
      const ringCentroid = getRingCentroid(polygon[0] ?? []);
      if (!ringCentroid) continue;
      if (!bestCentroid || ringCentroid.area > bestCentroid.area) {
        bestCentroid = ringCentroid;
      }
    }
  }

  if (!bestCentroid) return null;
  return { lat: bestCentroid.lat, lng: bestCentroid.lng };
};

const getFeatureBoundsCenter = (
  geometry: Geometry
): { lat: number; lng: number } | null => {
  const coords = getFeatureCoordinates(geometry);
  if (!coords.length) return null;

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const [lngValue, latValue] of coords) {
    minLat = Math.min(minLat, latValue);
    maxLat = Math.max(maxLat, latValue);
    minLng = Math.min(minLng, lngValue);
    maxLng = Math.max(maxLng, lngValue);
  }

  if (![minLat, maxLat, minLng, maxLng].every(Number.isFinite)) return null;

  return { lat: (minLat + maxLat) / 2, lng: (minLng + maxLng) / 2 };
};

const getFeatureCenter = (featureItem: CountryFeature): { lat: number; lng: number } | null => {
  return getFeatureCentroid(featureItem) ?? getFeatureBoundsCenter(featureItem.geometry);
};

const Globe3D = forwardRef<Globe3DHandle, Globe3DProps>(
  (
    {
      selectedCountry,
      selectedCity,
      locked = false,
      lowMotion = false,
      showDebugCenter = false,
    },
    ref
  ) => {
    const globeRef = useRef<GlobeMethods | undefined>(undefined);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lockedRef = useRef(locked);
    const reducedMotionRef = useRef(lowMotion);
    const isGlobeReadyRef = useRef(false);
    const [highlightedCountry, setHighlightedCountry] = useState<string | null>(
      null
    );
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const [isWebGlAvailable, setIsWebGlAvailable] = useState(true);
    const [isGlobeReady, setIsGlobeReady] = useState(false);
    const [globeSize, setGlobeSize] = useState({ width: 0, height: 0 });
    const globeSizeRef = useRef({ width: 0, height: 0 });
    const pendingCountryRef = useRef<string | null>(null);
    const pendingCityRef = useRef<{ lat: number; lng: number } | null>(null);

    // Material for a clean monochrome sphere (no earth texture)
    const globeMaterial = useMemo(() => {
      const mat = new THREE.MeshPhongMaterial({
        color: new THREE.Color(GLOBE_COLOR),
        shininess: 10,
      });
      return mat;
    }, []);

    // Convert TopoJSON -> GeoJSON features array (what react-globe.gl expects for polygonsData)
    const countries = useMemo<CountryFeature[]>(() => {
      const topo = countriesData as unknown as TopologyLike;
      const obj = (countriesData as unknown as { objects?: { countries?: unknown } })
        .objects?.countries;

      if (!obj) return [];

      const result = feature(topo as any, obj as any) as unknown;

      if (
        result &&
        typeof result === "object" &&
        (result as any).type === "FeatureCollection" &&
        Array.isArray((result as any).features)
      ) {
        return (result as any).features as CountryFeature[];
      }

      if (
        result &&
        typeof result === "object" &&
        (result as any).type === "Feature"
      ) {
        return [result as CountryFeature];
      }

      return [];
    }, []);

    const countryNameIndex = useMemo(() => buildCountryNameIndex(), []);

    const countryLookup = useMemo(() => {
      const lookup = new Map<string, CountryFeature>();
      for (const c of countries) {
        const key = normalizeCountryInput(c.properties?.name);
        if (key) lookup.set(key, c);
      }
      return lookup;
    }, [countries]);

    const countryEntries = useMemo(
      () =>
        countries
          .map((country) => ({
            feature: country,
            normalizedName: normalizeCountryInput(country.properties?.name),
          }))
          .filter((entry) => entry.normalizedName.length > 0),
      [countries]
    );

    const resolveCountryFeature = useCallback(
      (input: string) => {
        const normalizedInput = normalizeCountryInput(input);
        console.info("[Globe3D] resolveCountryFeature input", {
          input,
          normalizedInput,
        });
        if (!normalizedInput || normalizedInput.length < 3) return null;

        const iso = resolveIsoCode(input, countryNameIndex.nameToIso);
        console.info("[Globe3D] resolveCountryFeature iso", { input, iso });
        const candidateNames = new Set<string>();
        if (iso) {
          const isoUpper = iso.toUpperCase();
          const englishName = countryNameIndex.displayEn.of(isoUpper);
          const spanishName = countryNameIndex.displayEs.of(isoUpper);
          if (englishName) candidateNames.add(englishName);
          if (spanishName) candidateNames.add(spanishName);
          for (const alias of ISO_ALIASES[isoUpper] ?? []) {
            candidateNames.add(alias);
          }
        }
        candidateNames.add(input);
        candidateNames.add(normalizedInput);

        for (const name of candidateNames) {
          const normalized = normalizeCountryInput(name);
          const match = countryLookup.get(normalized);
          if (match) {
            console.info("[Globe3D] resolveCountryFeature countryLookup match", {
              normalized,
              source: "candidate",
            });
            return match;
          }
        }

        const directMatch = countryLookup.get(normalizedInput);
        if (directMatch) {
          console.info("[Globe3D] resolveCountryFeature countryLookup match", {
            normalized: normalizedInput,
            source: "direct",
          });
          return directMatch;
        }

        let bestMatch: { feature: CountryFeature; distance: number } | null = null;
        for (const entry of countryEntries) {
          if (
            entry.normalizedName.includes(normalizedInput) ||
            normalizedInput.includes(entry.normalizedName)
          ) {
            return entry.feature;
          }

          const distance = levenshteinDistance(normalizedInput, entry.normalizedName);
          if (!bestMatch || distance < bestMatch.distance) {
            bestMatch = { feature: entry.feature, distance };
          }
        }

        if (!bestMatch) return null;
        const threshold = Math.max(2, Math.round(normalizedInput.length * 0.3));
        if (bestMatch.distance <= threshold) return bestMatch.feature;
        return null;
      },
      [countryEntries, countryLookup, countryNameIndex]
    );

    const countryCenterLookup = useMemo(() => {
      const lookup = new Map<string, { lat: number; lng: number }>();
      for (const option of getCountryOptions()) {
        lookup.set(option.normalizedName, { lat: option.lat, lng: option.lng });
      }
      return lookup;
    }, []);

    const resolveCountryCenter = useCallback(
      (input: string, feature?: CountryFeature | null) => {
        if (feature) {
          const featureCenter = getFeatureCenter(feature);
          if (featureCenter) return featureCenter;
        }

        const normalizedInput = normalizeCountryInput(input);
        if (!normalizedInput) return null;

        const directMatch = countryCenterLookup.get(normalizedInput);
        if (directMatch) return directMatch;

        for (const [key, center] of countryCenterLookup) {
          if (key.includes(normalizedInput) || normalizedInput.includes(key)) {
            return center;
          }
        }

        return null;
      },
      [countryCenterLookup]
    );

    const debugCenter = useMemo(() => {
      if (!showDebugCenter || !selectedCountry) return null;
      const match = resolveCountryFeature(selectedCountry);
      return resolveCountryCenter(selectedCountry, match);
    }, [resolveCountryCenter, resolveCountryFeature, selectedCountry, showDebugCenter]);

    const updateAutoRotate = useCallback((enabled: boolean) => {
      const controls = globeRef.current?.controls();
      if (!controls) return;
      controls.autoRotate = enabled && !reducedMotionRef.current;
      controls.autoRotateSpeed = IDLE_ROTATION_SPEED;
    }, []);

    const animateToPoint = useCallback((point: PointOfView, duration = 1400) => {
      const nextDuration = reducedMotionRef.current ? 0 : duration;
      const beforePov = globeRef.current?.pointOfView();
      console.info("[Globe3D] POV before/target", {
        before: beforePov,
        target: point,
        duration: nextDuration,
      });
      globeRef.current?.pointOfView(point, nextDuration);
      setTimeout(() => {
        const afterPov = globeRef.current?.pointOfView();
        console.info("[Globe3D] POV after (50ms)", { after: afterPov });
      }, 50);
    }, []);

    const scheduleIdleReset = useCallback((delayMs = 1500) => {
      if (lockedRef.current || reducedMotionRef.current) return;
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => updateAutoRotate(true), delayMs);
    }, [updateAutoRotate]);

    const focusCountryByInput = useCallback(
      (countryName: string) => {
        console.info("[Globe3D] Calling globe.focusCountry =>", {
          raw: countryName,
          normalized: normalizeCountryInput(countryName),
        });
        console.info(
          "[Globe3D] globeRef.current at focusCountry call =>",
          Boolean(globeRef.current)
        );
        if (!isGlobeReadyRef.current) {
          pendingCountryRef.current = countryName;
          return;
        }

        const match = resolveCountryFeature(countryName);
        if (!match) {
          pendingCountryRef.current = null;
          setHighlightedCountry(null);
        }

        const center = resolveCountryCenter(countryName, match);
        if (!center) {
          pendingCountryRef.current = null;
          return;
        }

        pendingCountryRef.current = null;
        updateAutoRotate(false);
        setHighlightedCountry(match ? normalizeCountryInput(match.properties?.name) : null);
        animateToPoint({ lat: center.lat, lng: center.lng, altitude: 1.3 }, 1500);
        scheduleIdleReset(1500);
      },
      [
        animateToPoint,
        resolveCountryCenter,
        resolveCountryFeature,
        scheduleIdleReset,
        updateAutoRotate,
      ]
    );

    const focusCountry = useCallback(
      (countryName: string) => {
        focusCountryByInput(countryName);
      },
      [focusCountryByInput]
    );

    const focusCity = useCallback(
      (lat: number, lng: number) => {
        console.info("[Globe3D] Calling globe.focusCity =>", { lat, lng });
        if (!isGlobeReadyRef.current) {
          pendingCityRef.current = { lat, lng };
          return;
        }

        pendingCityRef.current = null;
        updateAutoRotate(false);
        animateToPoint({ lat, lng, altitude: CITY_VIEW_ALTITUDE }, 1400);
        scheduleIdleReset(1500);
      },
      [animateToPoint, scheduleIdleReset, updateAutoRotate]
    );

    const resetIdle = useCallback(() => {
      setHighlightedCountry(null);
      animateToPoint(DEFAULT_VIEW, 1200);
      if (!lockedRef.current && !reducedMotionRef.current) {
        updateAutoRotate(true);
      }
    }, [animateToPoint, updateAutoRotate]);

    useImperativeHandle(
      ref,
      () => ({ focusCountry, focusCity, resetIdle }),
      [focusCountry, focusCity, resetIdle]
    );

    useEffect(() => {
      updateAutoRotate(true);
    }, [updateAutoRotate]);

    useEffect(() => {
      isGlobeReadyRef.current = isGlobeReady;
    }, [isGlobeReady]);

    useEffect(() => {
      lockedRef.current = locked;
      if (locked) {
        if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
        updateAutoRotate(false);
      } else {
        updateAutoRotate(true);
      }
    }, [locked, updateAutoRotate]);

    useEffect(() => {
      const reducedMotion = lowMotion || prefersReducedMotion;
      reducedMotionRef.current = reducedMotion;
      if (reducedMotion) {
        if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
        updateAutoRotate(false);
        return;
      }
      if (!lockedRef.current) {
        updateAutoRotate(true);
      }
    }, [lowMotion, prefersReducedMotion, updateAutoRotate]);

    useEffect(() => {
      if (!selectedCountry) {
        setHighlightedCountry(null);
        return;
      }
      focusCountry(selectedCountry);
    }, [focusCountry, selectedCountry]);

    useEffect(() => {
      if (selectedCity) focusCity(selectedCity.lat, selectedCity.lng);
    }, [focusCity, selectedCity]);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
      updatePreference();
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", updatePreference);
      } else {
        mediaQuery.addListener(updatePreference);
      }
      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener("change", updatePreference);
        } else {
          mediaQuery.removeListener(updatePreference);
        }
      };
    }, []);

    useEffect(() => {
      if (typeof window === "undefined") return;
      try {
        const canvas = document.createElement("canvas");
        const context =
          canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        setIsWebGlAvailable(Boolean(context));
      } catch (error) {
        setIsWebGlAvailable(false);
      }
    }, []);

    useEffect(() => {
      const node = containerRef.current;
      if (!node) return;

      const updateSize = (entry?: ResizeObserverEntry) => {
        const rect = entry?.contentRect ?? node.getBoundingClientRect();
        const width = Math.max(0, Math.round(rect.width));
        const height = Math.max(0, Math.round(rect.height));
        const current = globeSizeRef.current;
        if (current.width === width && current.height === height) return;
        globeSizeRef.current = { width, height };
        setGlobeSize({ width, height });
      };

      updateSize();
      const observer = new ResizeObserver((entries) => updateSize(entries[0]));
      observer.observe(node);

      return () => observer.disconnect();
    }, []);

    useEffect(() => {
      return () => {
        if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      };
    }, []);

    const pointsData = useMemo<GlobePoint[]>(() => {
      const points: GlobePoint[] = [];
      if (selectedCity) {
        points.push({
          lat: selectedCity.lat,
          lng: selectedCity.lng,
          name: selectedCity.name,
          type: "city",
        });
      }
      if (debugCenter) {
        points.push({
          lat: debugCenter.lat,
          lng: debugCenter.lng,
          name: "debug-center",
          type: "debug-center",
        });
      }
      return points;
    }, [debugCenter, selectedCity]);

    const showFallback = !isWebGlAvailable;

    return (
      <div
        ref={containerRef}
        className="relative h-full w-full overflow-hidden rounded-xl border-2 border-ink bg-[rgba(255,255,255,0.6)]"
      >
        {showFallback ? (
          <div className="flex h-full w-full items-center justify-center bg-[rgba(240,230,207,0.35)]">
            <svg
              width="180"
              height="180"
              viewBox="0 0 180 180"
              fill="none"
              role="img"
              aria-label="Retro globe placeholder"
            >
              <circle cx="90" cy="90" r="68" fill="#f0e6cf" stroke="#1b1a14" strokeWidth="3" />
              <path
                d="M90 22C104 34 112 60 112 90C112 120 104 146 90 158C76 146 68 120 68 90C68 60 76 34 90 22Z"
                stroke="#1b1a14"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M22 90C34 104 60 112 90 112C120 112 146 104 158 90C146 76 120 68 90 68C60 68 34 76 22 90Z"
                stroke="#1b1a14"
                strokeWidth="2"
                fill="none"
              />
              <path d="M90 22V158" stroke="#1b1a14" strokeWidth="2" />
              <path d="M22 90H158" stroke="#1b1a14" strokeWidth="2" />
              <circle cx="124" cy="84" r="6" fill="#b35a2a" />
            </svg>
          </div>
        ) : globeSize.width > 0 && globeSize.height > 0 ? (
          <Globe
            ref={globeRef}
            backgroundColor="rgba(0,0,0,0)"
            width={globeSize.width}
            height={globeSize.height}
            globeMaterial={globeMaterial}
            // Polygons (country outlines)
            polygonsData={countries}
            polygonCapColor={() => "rgba(0,0,0,0)"}
            polygonSideColor={() => "rgba(0,0,0,0)"}
            polygonStrokeColor={(d) => {
              const name = normalizeCountryInput((d as CountryFeature).properties?.name);
              return name && name === highlightedCountry ? HIGHLIGHT_COLOR : BORDER_COLOR;
            }}
            polygonAltitude={0.005}
            // City point
            pointsData={pointsData}
            pointColor={(d) =>
              (d as GlobePoint).type === "debug-center" ? "#ff2bd1" : HIGHLIGHT_COLOR
            }
            pointAltitude={0.02}
            pointRadius={(d) => ((d as GlobePoint).type === "debug-center" ? 0.08 : 0.18)}
            // Controls init
            onGlobeReady={() => {
              const controls = globeRef.current?.controls();
              if (controls) {
                controls.enablePan = false;
              }
              setIsGlobeReady(true);
              isGlobeReadyRef.current = true;
              const pendingCity = pendingCityRef.current;
              const pendingCountry = pendingCountryRef.current;
              const hasPending = Boolean(pendingCity || pendingCountry);
              if (hasPending) {
                console.info("onGlobeReady -> focus pending -> (no reset)");
              }
              if (pendingCity) {
                pendingCityRef.current = null;
                focusCity(pendingCity.lat, pendingCity.lng);
              }
              if (pendingCountry) {
                pendingCountryRef.current = null;
                focusCountryByInput(pendingCountry);
              }
              if (!hasPending) {
                updateAutoRotate(true);
                animateToPoint(DEFAULT_VIEW, 0);
              }
            }}
          />
        ) : null}
      </div>
    );
  }
);

Globe3D.displayName = "Globe3D";

export default Globe3D;

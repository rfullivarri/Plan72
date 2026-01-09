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
import type { GlobeMethods } from "react-globe.gl";
import * as THREE from "three";

import countriesData from "world-atlas/countries-110m.json";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

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
};

type CountryFeature = Feature<Geometry, { name?: string }>;

type PointOfView = {
  lat: number;
  lng: number;
  altitude?: number;
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

const normalizeCountryName = (value?: string) => {
  if (!value) return "";
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

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
    if (englishName) nameToIso.set(normalizeCountryName(englishName), code);
    if (spanishName) nameToIso.set(normalizeCountryName(spanishName), code);
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
    aliases.map((alias) => [normalizeCountryName(alias), iso])
  )
);

const resolveIsoCode = (input: string, nameIndex: Map<string, string>) => {
  const normalized = normalizeCountryName(input);
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

const getFeatureCenter = (
  featureItem: CountryFeature
): { lat: number; lng: number } | null => {
  const coords = getFeatureCoordinates(featureItem.geometry);
  if (!coords.length) return null;

  const sum = coords.reduce(
    (acc, [lngValue, latValue]) => ({
      lat: acc.lat + latValue,
      lng: acc.lng + lngValue,
    }),
    { lat: 0, lng: 0 }
  );

  return { lat: sum.lat / coords.length, lng: sum.lng / coords.length };
};

const Globe3D = forwardRef<Globe3DHandle, Globe3DProps>(
  ({ selectedCountry, selectedCity, locked = false, lowMotion = false }, ref) => {
    const globeRef = useRef<GlobeMethods | undefined>(undefined);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lockedRef = useRef(locked);
    const reducedMotionRef = useRef(lowMotion);
    const [highlightedCountry, setHighlightedCountry] = useState<string | null>(
      null
    );
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
    const [isWebGlAvailable, setIsWebGlAvailable] = useState(true);
    const [globeSize, setGlobeSize] = useState({ width: 0, height: 0 });
    const globeSizeRef = useRef({ width: 0, height: 0 });

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
        const key = normalizeCountryName(c.properties?.name);
        if (key) lookup.set(key, c);
      }
      return lookup;
    }, [countries]);

    const countryEntries = useMemo(
      () =>
        countries
          .map((country) => ({
            feature: country,
            normalizedName: normalizeCountryName(country.properties?.name),
          }))
          .filter((entry) => entry.normalizedName.length > 0),
      [countries]
    );

    const resolveCountryFeature = useCallback(
      (input: string) => {
        const normalizedInput = normalizeCountryName(input);
        if (!normalizedInput || normalizedInput.length < 3) return null;

        const iso = resolveIsoCode(input, countryNameIndex.nameToIso);
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
          const normalized = normalizeCountryName(name);
          const match = countryLookup.get(normalized);
          if (match) return match;
        }

        const directMatch = countryLookup.get(normalizedInput);
        if (directMatch) return directMatch;

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

    const updateAutoRotate = useCallback((enabled: boolean) => {
      const controls = globeRef.current?.controls();
      if (!controls) return;
      controls.autoRotate = enabled && !reducedMotionRef.current;
      controls.autoRotateSpeed = IDLE_ROTATION_SPEED;
    }, []);

    const animateToPoint = useCallback((point: PointOfView, duration = 1400) => {
      const nextDuration = reducedMotionRef.current ? 0 : duration;
      globeRef.current?.pointOfView(point, nextDuration);
    }, []);

    const scheduleIdleReset = useCallback((delayMs = 1500) => {
      if (lockedRef.current || reducedMotionRef.current) return;
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => updateAutoRotate(true), delayMs);
    }, [updateAutoRotate]);

    const focusCountryByInput = useCallback(
      (countryName: string) => {
        const match = resolveCountryFeature(countryName);
        if (!match) {
          setHighlightedCountry(null);
          return;
        }

        const center = getFeatureCenter(match);
        if (!center) return;

        updateAutoRotate(false);
        setHighlightedCountry(normalizeCountryName(match.properties?.name));
        animateToPoint({ lat: center.lat, lng: center.lng, altitude: 1.3 }, 1500);
        scheduleIdleReset(1500);
      },
      [animateToPoint, resolveCountryFeature, scheduleIdleReset, updateAutoRotate]
    );

    const focusCountry = useCallback(
      (countryName: string) => {
        focusCountryByInput(countryName);
      },
      [focusCountryByInput]
    );

    const focusCity = useCallback(
      (lat: number, lng: number) => {
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

    const pointsData = useMemo(() => {
      if (!selectedCity) return [];
      return [{ lat: selectedCity.lat, lng: selectedCity.lng, name: selectedCity.name }];
    }, [selectedCity]);

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
              const name = normalizeCountryName((d as CountryFeature).properties?.name);
              return name && name === highlightedCountry ? HIGHLIGHT_COLOR : BORDER_COLOR;
            }}
            polygonAltitude={0.005}
            // City point
            pointsData={pointsData}
            pointColor={() => HIGHLIGHT_COLOR}
            pointAltitude={0.02}
            pointRadius={0.18}
            // Controls init
            onGlobeReady={() => {
              const controls = globeRef.current?.controls();
              if (controls) {
                controls.enablePan = false;
              }
              updateAutoRotate(true);
              animateToPoint(DEFAULT_VIEW, 0);
            }}
          />
        ) : null}
      </div>
    );
  }
);

Globe3D.displayName = "Globe3D";

export default Globe3D;

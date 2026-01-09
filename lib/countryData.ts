import type { Feature, Geometry } from "geojson";
import { feature } from "topojson-client";

import countriesData from "world-atlas/countries-110m.json";

type TopologyLike = {
  type: "Topology";
  objects: Record<string, unknown>;
};

type CountryFeature = Feature<Geometry, { name?: string }>;

export type CountryOption = {
  name: string;
  normalizedName: string;
  lat: number;
  lng: number;
  isoCode?: string | null;
};

const FALLBACK_REGION_CODES = ["US", "ES", "FR", "CN", "NL"];

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

const getFeatureCoordinates = (geometry: Geometry): number[][] => {
  if (geometry.type === "Polygon") return geometry.coordinates.flat();
  if (geometry.type === "MultiPolygon") return geometry.coordinates.flat(2);
  return [];
};

const getFeatureCenter = (featureItem: CountryFeature): { lat: number; lng: number } | null => {
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

const buildCountryOptions = (): CountryOption[] => {
  const topo = countriesData as unknown as TopologyLike;
  const obj = (countriesData as unknown as { objects?: { countries?: unknown } })
    .objects?.countries;
  if (!obj) return [];

  const result = feature(topo as any, obj as any) as unknown;
  const features =
    result &&
    typeof result === "object" &&
    (result as any).type === "FeatureCollection" &&
    Array.isArray((result as any).features)
      ? ((result as any).features as CountryFeature[])
      : [];

  const nameIndex = buildCountryNameIndex();

  return features.reduce<CountryOption[]>((acc, item) => {
    const name = item.properties?.name?.trim() ?? "";
    const normalizedName = normalizeCountryName(name);
    const center = getFeatureCenter(item);
    if (!name || !normalizedName || !center) return acc;
    acc.push({
      name,
      normalizedName,
      lat: center.lat,
      lng: center.lng,
      isoCode: resolveIsoCode(name, nameIndex.nameToIso),
    });
    return acc;
  }, []);
};

const COUNTRY_OPTIONS: CountryOption[] = buildCountryOptions();

export const getCountryOptions = (): CountryOption[] => COUNTRY_OPTIONS;

export const resolveCountryIsoCode = (input: string) => {
  const nameIndex = buildCountryNameIndex();
  return resolveIsoCode(input, nameIndex.nameToIso);
};

export const normalizeCountryInput = normalizeCountryName;

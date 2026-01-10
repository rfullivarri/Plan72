export type GeocodeResult = {
  lat: number;
  lng: number;
  displayName: string;
  boundingBox?: [number, number, number, number];
  type?: string;
  addresstype?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
};

type GeocodeQueryOptions = {
  limit?: number;
  countryCodes?: string;
};

const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search";
let lastRequestAt = 0;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function geocodeAddress(
  query: string,
  options: GeocodeQueryOptions = {}
): Promise<GeocodeResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const limit = options.limit ?? 5;

  const now = Date.now();
  const elapsed = now - lastRequestAt;
  if (elapsed < 1100) {
    await sleep(1100 - elapsed);
  }

  const params = new URLSearchParams({
    q: trimmed,
    format: "json",
    addressdetails: "1",
    limit: limit.toString(),
  });
  if (options.countryCodes) {
    params.set("countrycodes", options.countryCodes);
  }

  const response = await fetch(`${NOMINATIM_ENDPOINT}?${params.toString()}`, {
    headers: {
      "Accept-Language": "en",
      "User-Agent": "Plan72 geocoder (export static demo)",
    },
  });

  if (response.status === 429) {
    throw new Error("RATE_LIMIT");
  }

  if (!response.ok) {
    throw new Error("GEOCODE_FAILED");
  }

  const payload = (await response.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
    boundingbox?: [string, string, string, string];
    type?: string;
    addresstype?: string;
    address?: GeocodeResult["address"];
  }>;

  lastRequestAt = Date.now();

  return payload.map((hit) => {
    const boundingBox: GeocodeResult["boundingBox"] =
      hit.boundingbox?.length === 4
        ? ([
            parseFloat(hit.boundingbox[0]),
            parseFloat(hit.boundingbox[1]),
            parseFloat(hit.boundingbox[2]),
            parseFloat(hit.boundingbox[3]),
          ] as const)
        : undefined;

    return {
      lat: parseFloat(hit.lat),
      lng: parseFloat(hit.lon),
      displayName: hit.display_name,
      boundingBox,
      type: hit.type,
      addresstype: hit.addresstype,
      address: hit.address,
    } satisfies GeocodeResult;
  });
}

const CITY_TYPES = new Set(["city", "town", "village", "municipality", "hamlet"]);

export async function geocodeCitySuggestions(
  query: string,
  options: GeocodeQueryOptions = {}
): Promise<GeocodeResult[]> {
  const results = await geocodeAddress(query, { ...options, limit: options.limit ?? 8 });
  return results.filter((result) => {
    if (!result.addresstype && !result.type) return true;
    if (result.addresstype && CITY_TYPES.has(result.addresstype)) return true;
    if (result.type && CITY_TYPES.has(result.type)) return true;
    return false;
  });
}

export async function geocodePlace(query: string): Promise<GeocodeResult | null> {
  const results = await geocodeAddress(query);
  if (results.length === 0) return null;
  return results[0];
}

export type GeocodeResult = {
  lat: number;
  lng: number;
  displayName: string;
};

const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search";
let lastRequestAt = 0;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function geocodeAddress(query: string): Promise<GeocodeResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const now = Date.now();
  const elapsed = now - lastRequestAt;
  if (elapsed < 1100) {
    await sleep(1100 - elapsed);
  }

  const params = new URLSearchParams({
    q: trimmed,
    format: "json",
    addressdetails: "1",
    limit: "5",
  });

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
  }>;

  lastRequestAt = Date.now();

  return payload.map((hit) => ({
    lat: parseFloat(hit.lat),
    lng: parseFloat(hit.lon),
    displayName: hit.display_name,
  }));
}

import type { MapLibreModule } from "@/lib/maplibre";

declare global {
  interface Window {
    maplibregl?: MapLibreModule;
  }
}

export {};

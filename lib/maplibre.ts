export type MapLibreMap = {
  on: (event: string, callback: () => void) => void;
  remove: () => void;
  resize: () => void;
  flyTo: (options: { center: [number, number]; zoom?: number; speed?: number; curve?: number; essential?: boolean }) => void;
  jumpTo: (options: { center: [number, number]; zoom?: number }) => void;
  setFog?: (options: Record<string, unknown>) => void;
};

export type MapLibreMarker = {
  setLngLat: (coord: [number, number]) => MapLibreMarker;
  addTo: (map: MapLibreMap) => MapLibreMarker;
  remove: () => void;
};

export type MapLibreModule = {
  __isStub?: boolean;
  Map: new (options: {
    container: HTMLElement;
    style: string;
    center: [number, number];
    zoom: number;
    projection?: string;
    attributionControl?: boolean;
  }) => MapLibreMap;
  Marker: new (options?: { element?: HTMLElement }) => MapLibreMarker;
};

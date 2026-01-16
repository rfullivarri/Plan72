type LngLatLike = [number, number];

declare class Map {
  constructor(options: {
    container: HTMLElement;
    style: string;
    center: LngLatLike;
    zoom: number;
    attributionControl?: boolean;
  });
  on(event: string, callback: () => void): void;
  once(event: string, callback: () => void): void;
  remove(): void;
  addControl(control: unknown, position?: string): void;
  addSource(id: string, source: { type: "geojson"; data: unknown }): void;
  addLayer(layer: {
    id: string;
    type: string;
    source: string;
    layout?: Record<string, unknown>;
    paint?: Record<string, unknown>;
  }): void;
  getSource(id: string): { setData: (data: unknown) => void } | undefined;
  fitBounds(bounds: LngLatBounds, options?: { padding?: number | [number, number]; duration?: number }): void;
  jumpTo(options: { center: LngLatLike; zoom?: number }): void;
  flyTo(options: { center: LngLatLike; zoom?: number; duration?: number }): void;
  resize(): void;
  isStyleLoaded(): boolean;
}

declare class Marker {
  constructor(options?: { element?: HTMLElement; anchor?: string });
  setLngLat(coord: LngLatLike): this;
  setPopup(popup: Popup): this;
  addTo(map: Map): this;
  remove(): void;
}

declare class Popup {
  constructor(options?: { offset?: number });
  setText(text: string): this;
}

declare class NavigationControl {
  constructor(options?: { showCompass?: boolean });
}

declare class LngLatBounds {
  constructor(sw: LngLatLike, ne: LngLatLike);
  extend(coord: LngLatLike): this;
}

declare const maplibre: {
  __isStub: boolean;
  Map: typeof Map;
  Marker: typeof Marker;
  Popup: typeof Popup;
  NavigationControl: typeof NavigationControl;
  LngLatBounds: typeof LngLatBounds;
};

export = maplibre;

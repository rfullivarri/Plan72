class StubMap {
  constructor() {
    throw new Error("MapLibre stub loaded.");
  }
}

class StubMarker {
  setLngLat() {
    return this;
  }

  setPopup() {
    return this;
  }

  addTo() {
    return this;
  }

  remove() {}
}

class StubPopup {
  setText() {
    return this;
  }
}

class StubLngLatBounds {
  extend() {
    return this;
  }
}

class StubNavigationControl {}

const maplibre = {
  __isStub: true,
  Map: StubMap,
  Marker: StubMarker,
  Popup: StubPopup,
  NavigationControl: StubNavigationControl,
  LngLatBounds: StubLngLatBounds,
};

module.exports = maplibre;
module.exports.default = maplibre;

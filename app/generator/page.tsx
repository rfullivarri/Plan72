"use client";

export const dynamic = "force-static";

import ScenarioSelector from "@/components/ScenarioSelector";
import { usePlan } from "@/components/PlanContext";
import Globe3D from "@/components/Globe3D";
import type { Globe3DHandle } from "@/components/Globe3D";
import { MOMENT_CODES, PLAN_LEVELS } from "@/lib/constants";
import { cityTemplates } from "@/lib/cityTemplates";
import {
  getCountryOptions,
  normalizeCountryInput,
  resolveCountryIsoCode,
  type CountryOption,
} from "@/lib/countryData";
import { geocodeAddress, geocodeCitySuggestions, type GeocodeResult } from "@/lib/geocode";
import { PlanInput } from "@/lib/schema";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";

export default function GeneratorPage() {
  const { input, updateInput, loadCityPreset } = usePlan();
  const [newNode, setNewNode] = useState({ label: "", lat: "", lng: "", types: "A" });
  const [addressQuery, setAddressQuery] = useState("");
  const [geocodeResults, setGeocodeResults] = useState<GeocodeResult[]>([]);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [latInput, setLatInput] = useState(input.start.lat.toString());
  const [lngInput, setLngInput] = useState(input.start.lng.toString());
  const [labelInput, setLabelInput] = useState(input.start.label ?? "");
  const [hasResolvedLocation, setHasResolvedLocation] = useState(false);
  const [resolvedCenter, setResolvedCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [citySuggestions, setCitySuggestions] = useState<GeocodeResult[]>([]);
  const [cityStatus, setCityStatus] = useState<string | null>(null);
  // Wizard state machine for Step 1: country -> city -> address -> confirmed.
  const [stage, setStage] = useState<"country" | "city" | "address" | "confirmed">("country");
  const globeRef = useRef<Globe3DHandle | null>(null);
  const countryDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cityDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cityRequestRef = useRef(0);
  const countryOptions = useMemo(() => getCountryOptions(), []);

  useEffect(() => {
    setLatInput(input.start.lat.toString());
    setLngInput(input.start.lng.toString());
    setLabelInput(input.start.label ?? "");
  }, [input.start.lat, input.start.lng, input.start.label]);

  const resetResolvedLocation = () => {
    setHasResolvedLocation(false);
    setResolvedCenter(null);
  };

  const resetAddress = () => {
    setAddressQuery("");
    setGeocodeResults([]);
    setLocationStatus(null);
    resetResolvedLocation();
  };

  const resetCityAndAddress = () => {
    updateInput("city", "");
    resetAddress();
  };

  const handleCityChange = (value: string) => {
    const nextCity = value || "BCN";
    resetResolvedLocation();
    setCitySuggestions([]);
    setCityStatus(null);

    if (cityTemplates[nextCity]) {
      loadCityPreset(nextCity, {
        scenarios: input.scenarios,
        moment: input.moment,
        level: input.level,
        resourceNodes: input.resourceNodes,
        peopleCount: input.peopleCount,
      });
      return;
    }

    updateInput("city", nextCity);
  };

  const handleBCNPreset = () => {
    resetResolvedLocation();
    const sampleNodes: PlanInput["resourceNodes"] = [
      { id: "N0", label: "Home", lat: 41.39, lng: 2.16, types: ["A", "C", "E"] },
      { id: "N1", label: "Clinic", lat: 41.4, lng: 2.18, types: ["D", "A"] },
    ];

    loadCityPreset("BCN", { scenarios: ["NUK"], moment: "POST", level: "STANDARD", resourceNodes: sampleNodes });
  };

  const handleCountryChange = (value: string) => {
    console.info("[Generator] Country input changed (typing) =>", value);
    console.info(
      "[Generator] Country normalized (typing) =>",
      normalizeCountryInput(value)
    );
    resetResolvedLocation();
    updateInput("country", value);
    resetCityAndAddress();
  };

  const handleConfirmCountry = () => {
    setStage("city");
    console.info("[Generator] Country input confirmed =>", input.country);
    console.info(
      "[Generator] Country normalized (confirm) =>",
      normalizeCountryInput(input.country)
    );
    if (input.country.trim()) {
      globeRef.current?.focusCountry(input.country);
    }
  };

  const handleConfirmCity = () => {
    setStage("address");
  };

  const handleConfirmAddress = () => {
    setStage("confirmed");
  };

  const handleEditCountry = () => {
    setStage("country");
    resetCityAndAddress();
  };

  const handleEditCity = () => {
    setStage("city");
    resetAddress();
  };

  const handleStageBack = () => {
    if (stage === "confirmed") {
      setStage("address");
      return;
    }
    if (stage === "address") {
      handleEditCity();
      return;
    }
    if (stage === "city") {
      handleEditCountry();
    }
  };

  const handleStageKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    onConfirm: () => void
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onConfirm();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      handleStageBack();
    }
  };

  const handleApplyLocation = (result?: GeocodeResult) => {
    const selected = result ?? geocodeResults[0];
    if (!selected) {
      setLocationStatus("Selecciona una ubicación válida.");
      return;
    }

    const label = selected.displayName.split(",")[0] ?? "Start";
    updateInput("start", { lat: selected.lat, lng: selected.lng, label });
    updateInput("city", label);
    setLatInput(selected.lat.toString());
    setLngInput(selected.lng.toString());
    setLabelInput(label);
    setResolvedCenter({ lat: selected.lat, lng: selected.lng });
    setHasResolvedLocation(true);
    setLocationStatus("Ubicación aplicada.");
  };

  const handleSearchLocation = async () => {
    if (!addressQuery.trim()) {
      setLocationStatus("Introduce una dirección o punto de interés.");
      return;
    }
    setLocationStatus("Buscando ubicación…");
    try {
      const results = await geocodeAddress(addressQuery);
      setGeocodeResults(results);
      if (results.length === 0) {
        setLocationStatus("No encontramos resultados. Ajusta la consulta.");
        return;
      }
      handleApplyLocation(results[0]);
    } catch (error) {
      if (error instanceof Error && error.message === "RATE_LIMIT") {
        setLocationStatus("Espera un segundo antes de volver a buscar.");
        return;
      }
      setLocationStatus("No se pudo geocodificar la ubicación.");
    }
  };

  const handleApplyCoordinates = () => {
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setLocationStatus("Usa coordenadas en formato decimal.");
      return;
    }
    const label = labelInput.trim() || input.start.label || "Start";
    updateInput("start", { lat, lng, label });
    updateInput("city", label);
    setResolvedCenter({ lat, lng });
    setHasResolvedLocation(true);
    setLocationStatus("Coordenadas aplicadas.");
  };

  const handleSelectCountry = (option: CountryOption) => {
    updateInput("country", option.name);
    resetCityAndAddress();
    globeRef.current?.focusCountry(option.name);
  };

  const handleSelectCitySuggestion = (result: GeocodeResult) => {
    const label = result.displayName.split(",")[0]?.trim() || input.city || "City";
    updateInput("city", label);
    updateInput("start", { lat: result.lat, lng: result.lng, label });
    setLatInput(result.lat.toString());
    setLngInput(result.lng.toString());
    setLabelInput(label);
    setResolvedCenter({ lat: result.lat, lng: result.lng });
    setHasResolvedLocation(true);
    setCitySuggestions([]);
    setCityStatus("Ciudad seleccionada.");
  };

  const cityPreset = cityTemplates[input.city];
  const cityFocus = useMemo(() => {
    if (resolvedCenter) return resolvedCenter;
    if (cityPreset?.defaults?.start) {
      return { lat: cityPreset.defaults.start.lat, lng: cityPreset.defaults.start.lng };
    }
    return null;
  }, [cityPreset, resolvedCenter]);

  const countrySuggestions = useMemo(() => {
    if (stage !== "country") return [];
    const normalizedQuery = normalizeCountryInput(input.country);
    if (!normalizedQuery) return [];

    // Filtra null/undefined antes de usar option.normalizedName
    const matches = countryOptions
      .filter((option): option is NonNullable<typeof option> => option != null)
      .filter((option) => option.normalizedName.includes(normalizedQuery));

    matches.sort((a, b) => {
      const aStarts = a.normalizedName.startsWith(normalizedQuery);
      const bStarts = b.normalizedName.startsWith(normalizedQuery);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.normalizedName.localeCompare(b.normalizedName);
    });
    return matches.slice(0, 6);
  }, [countryOptions, input.country, stage]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    if (stage === "country") {
      if (!input.country.trim()) {
        globe.resetIdle();
      }
      return;
    }
    if (hasResolvedLocation && resolvedCenter) {
      globe.focusCity(resolvedCenter.lat, resolvedCenter.lng);
      return;
    }
    if (cityFocus) {
      globe.focusCity(cityFocus.lat, cityFocus.lng);
      return;
    }
    if (input.country.trim()) {
      globe.focusCountry(input.country);
      return;
    }
    globe.resetIdle();
  }, [cityFocus, hasResolvedLocation, input.country, resolvedCenter, stage]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    if (stage !== "country") return;
    const value = input.country.trim();
    if (value.length < 3) return;

    if (countryDebounceRef.current) {
      clearTimeout(countryDebounceRef.current);
    }
    countryDebounceRef.current = setTimeout(() => {
      globe.focusCountry(value);
    }, 320);

    return () => {
      if (countryDebounceRef.current) {
        clearTimeout(countryDebounceRef.current);
      }
    };
  }, [input.country, stage]);

  useEffect(() => {
    if (stage !== "city") {
      setCitySuggestions([]);
      setCityStatus(null);
      return;
    }
    const query = input.city.trim();
    if (!query || query.length < 2 || !input.country.trim()) {
      setCitySuggestions([]);
      setCityStatus(null);
      return;
    }

    if (cityDebounceRef.current) {
      clearTimeout(cityDebounceRef.current);
    }

    const requestId = ++cityRequestRef.current;
    cityDebounceRef.current = setTimeout(async () => {
      setCityStatus("Buscando ciudades…");
      try {
        const isoCode = resolveCountryIsoCode(input.country)?.toLowerCase();
        const results = await geocodeCitySuggestions(`${query}, ${input.country}`, {
          countryCodes: isoCode,
          limit: 6,
        });
        if (requestId !== cityRequestRef.current) return;
        setCitySuggestions(results);
        setCityStatus(results.length ? null : "No se encontraron ciudades.");
      } catch {
        if (requestId !== cityRequestRef.current) return;
        setCityStatus("No se pudieron cargar sugerencias.");
        setCitySuggestions([]);
      }
    }, 350);

    return () => {
      if (cityDebounceRef.current) {
        clearTimeout(cityDebounceRef.current);
      }
    };
  }, [input.city, input.country, stage]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
      <header id="how" className="manual-surface relative overflow-hidden px-6 py-8 sm:px-8">
        <div className="absolute left-0 top-0 h-20 w-20 bg-[var(--rust)]/30 blur-3xl" aria-hidden />
        <div className="absolute bottom-0 right-0 h-24 w-24 bg-[var(--olive)]/30 blur-3xl" aria-hidden />
        <div className="hero-grid" aria-hidden />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs text-olive tracking-[0.25em]">WIZARD</p>
            <h1 className="font-display text-4xl">Protocol Generator</h1>
            <p className="text-sm text-ink/80">
              Define una ubicación, selecciona escenarios y genera una carta imprimible por cada uno. La previsualización siempre
              refleja tus ajustes actuales.
            </p>
          </div>
          <div className="rounded-full border-4 border-ink bg-[rgba(255,255,255,0.7)] px-4 py-2 text-sm font-mono uppercase tracking-[0.2em]">
            Atlas on duty
          </div>
        </div>
      </header>

      <section className="space-y-6">
        <div className="card-frame p-5 space-y-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-olive">Step 1</p>
            <h2 className="font-display text-2xl">Location onboarding</h2>
            <p className="text-sm text-ink/70">Define país, ciudad y una dirección/pin para anclar el plan.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 items-stretch">
            <div className="space-y-5">
              <label className="space-y-1 text-sm font-semibold">
                Country
                <input
                  className="w-full rounded-lg border-2 border-ink bg-[rgba(255,255,255,0.7)] px-3 py-2 font-mono text-sm shadow-[6px_8px_0_rgba(27,26,20,0.14)]"
                  placeholder="Spain"
                  value={input.country}
                  readOnly={stage !== "country"}
                  aria-readonly={stage !== "country"}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  onKeyDown={(event) => handleStageKeyDown(event, handleConfirmCountry)}
                />
              </label>
              {stage === "country" && countrySuggestions.length > 0 && (
                <div className="rounded-lg border-2 border-dashed border-ink/60 bg-[rgba(240,245,238,0.7)] p-3 text-sm">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-olive">Suggestions</p>
                  <ul className="mt-2 space-y-2">
                    {countrySuggestions.map((option) => (
                      <li
                        key={option.name}
                        className="flex items-center justify-between gap-2"
                      >
                        <div>
                          <p className="font-semibold">{option.name}</p>
                          <p className="text-xs text-ink/70">
                            {option.lat.toFixed(2)}, {option.lng.toFixed(2)}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="ink-button"
                          onClick={() => handleSelectCountry(option)}
                        >
                          Use country
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {stage === "country" ? (
                  <button type="button" className="ink-button" onClick={handleConfirmCountry}>
                    Next
                  </button>
                ) : (
                  <button type="button" className="ink-button" onClick={handleEditCountry}>
                    Edit country
                  </button>
                )}
              </div>
              <div
                className={`grid gap-5 transition-all duration-300 ${
                  stage === "city" || stage === "address" || stage === "confirmed"
                    ? "opacity-100 translate-y-0 max-h-[500px]"
                    : "opacity-0 -translate-y-2 max-h-0 pointer-events-none overflow-hidden"
                }`}
                aria-hidden={stage === "country"}
              >
                <label className="space-y-1 text-sm font-semibold">
                  City name
                  <input
                    className="w-full rounded-lg border-2 border-ink bg-[rgba(255,255,255,0.7)] px-3 py-2 font-mono text-sm shadow-[6px_8px_0_rgba(27,26,20,0.14)]"
                    value={input.city}
                    readOnly={stage !== "city"}
                    aria-readonly={stage !== "city"}
                    onChange={(e) => handleCityChange(e.target.value)}
                    onKeyDown={(event) => handleStageKeyDown(event, handleConfirmCity)}
                  />
                </label>
                {stage === "city" && citySuggestions.length > 0 && (
                  <div className="rounded-lg border-2 border-dashed border-ink/60 bg-[rgba(240,245,238,0.7)] p-3 text-sm">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-olive">Cities</p>
                    <ul className="mt-2 space-y-2">
                      {citySuggestions.map((result) => (
                        <li
                          key={`${result.displayName}-${result.lat}-${result.lng}`}
                          className="flex items-center justify-between gap-2"
                        >
                          <div>
                            <p className="font-semibold">{result.displayName}</p>
                            <p className="text-xs text-ink/70">
                              {result.lat.toFixed(4)}, {result.lng.toFixed(4)}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="ink-button"
                            onClick={() => handleSelectCitySuggestion(result)}
                          >
                            Use city
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {stage === "city" && cityStatus && (
                  <p className="text-xs text-olive font-mono">{cityStatus}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {stage === "city" ? (
                    <button type="button" className="ink-button" onClick={handleConfirmCity}>
                      Continue
                    </button>
                  ) : (
                    <button type="button" className="ink-button" onClick={handleEditCity}>
                      Edit city
                    </button>
                  )}
                </div>
                <div
                  className={`grid gap-3 transition-all duration-300 ${
                    stage === "address" || stage === "confirmed"
                      ? "opacity-100 translate-y-0 max-h-[700px]"
                      : "opacity-0 -translate-y-2 max-h-0 pointer-events-none overflow-hidden"
                  }`}
                  aria-hidden={stage === "country" || stage === "city"}
                >
                  <label className="space-y-1 text-sm font-semibold">
                    Address / POI
                    <input
                      className="w-full rounded-lg border-2 border-ink bg-[rgba(255,255,255,0.7)] px-3 py-2 font-mono text-sm shadow-[6px_8px_0_rgba(27,26,20,0.14)]"
                      placeholder="Carrer Aragó 200, BCN"
                      value={addressQuery}
                      readOnly={stage !== "address"}
                      aria-readonly={stage !== "address"}
                      onChange={(e) => {
                        resetResolvedLocation();
                        setAddressQuery(e.target.value);
                      }}
                      onKeyDown={(event) => handleStageKeyDown(event, handleConfirmAddress)}
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {stage === "address" && (
                      <button type="button" className="ink-button" onClick={handleConfirmAddress}>
                        Continue
                      </button>
                    )}
                    <button
                      type="button"
                      className="ink-button"
                      onClick={handleSearchLocation}
                      disabled={stage !== "confirmed"}
                    >
                      Use this location
                    </button>
                    <button type="button" className="ink-button" onClick={handleBCNPreset}>
                      Load preset
                    </button>
                  </div>
                  {locationStatus && <p className="text-xs text-olive font-mono">{locationStatus}</p>}
                  {geocodeResults.length > 0 && (
                    <div className="rounded-lg border-2 border-dashed border-ink/60 bg-[rgba(240,245,238,0.7)] p-3 text-sm">
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-olive">Suggestions</p>
                      <ul className="mt-2 space-y-2">
                        {geocodeResults.map((result) => (
                          <li
                            key={`${result.displayName}-${result.lat}-${result.lng}`}
                            className="flex items-center justify-between gap-2"
                          >
                            <div>
                              <p className="font-semibold">{result.displayName}</p>
                              <p className="text-xs text-ink/70">
                                {result.lat.toFixed(4)}, {result.lng.toFixed(4)}
                              </p>
                            </div>
                            <button
                              type="button"
                              className="ink-button"
                              onClick={() => handleApplyLocation(result)}
                              disabled={stage !== "confirmed"}
                            >
                              Use this location
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <details className="rounded-xl border-2 border-dashed border-ink/40 p-3">
                <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.2em] text-olive">
                  Pin / coordinates
                </summary>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1 text-sm font-semibold">
                    Label
                    <input
                      className="w-full rounded-lg border-2 border-ink bg-[rgba(255,255,255,0.7)] px-3 py-2 font-mono text-sm"
                      value={labelInput}
                      onChange={(e) => setLabelInput(e.target.value)}
                    />
                  </label>
                  <label className="space-y-1 text-sm font-semibold">
                    City name
                    <input
                      className="w-full rounded-lg border-2 border-ink bg-[rgba(255,255,255,0.7)] px-3 py-2 font-mono text-sm"
                      value={input.city}
                      onChange={(e) => handleCityChange(e.target.value)}
                    />
                  </label>
                  <label className="space-y-1 text-sm font-semibold">
                    Lat
                    <input
                      type="number"
                      className="w-full rounded-lg border-2 border-ink bg-[rgba(255,255,255,0.7)] px-3 py-2 font-mono text-sm"
                      value={latInput}
                      onChange={(e) => setLatInput(e.target.value)}
                    />
                  </label>
                  <label className="space-y-1 text-sm font-semibold">
                    Lng
                    <input
                      type="number"
                      className="w-full rounded-lg border-2 border-ink bg-[rgba(255,255,255,0.7)] px-3 py-2 font-mono text-sm"
                      value={lngInput}
                      onChange={(e) => setLngInput(e.target.value)}
                    />
                  </label>
                </div>
                <button type="button" className="ink-button mt-3" onClick={handleApplyCoordinates}>
                  Use coordinates
                </button>
              </details>
            </div>
            <div className="flex h-full flex-col">
              <div className="flex-1 min-h-[320px] md:min-h-[420px]">
                <Globe3D ref={globeRef} locked={hasResolvedLocation} />
              </div>
            </div>
          </div>
        </div>

        <div className="card-frame p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-olive">Step 2</p>
              <h2 className="font-display text-2xl">Catastrophes</h2>
              <p className="text-sm text-ink/70">Multi-select de escenarios activos.</p>
            </div>
            <span className="rounded-full border-2 border-ink px-3 py-1 text-xs font-mono bg-[rgba(179,90,42,0.1)]">
              TVA CLOCK 72:00
            </span>
          </div>
          <ScenarioSelector showHeader={false} />
        </div>

        <div className="card-frame p-5 space-y-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-olive">Step 3</p>
            <h2 className="font-display text-2xl">Level · Moment · Team size</h2>
            <p className="text-sm text-ink/70">Compacta el set operativo.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="space-y-1 text-sm font-semibold">
              Level
              <select
                className="w-full rounded-lg border-2 border-ink bg-[rgba(245,232,204,0.8)] px-3 py-2 font-mono text-sm shadow-[6px_8px_0_rgba(27,26,20,0.14)]"
                value={input.level}
                onChange={(e) => updateInput("level", e.target.value as (typeof PLAN_LEVELS)[number])}
              >
                {PLAN_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm font-semibold">
              Moment
              <select
                className="w-full rounded-lg border-2 border-ink bg-[rgba(255,255,255,0.7)] px-3 py-2 font-mono text-sm shadow-[6px_8px_0_rgba(27,26,20,0.14)]"
                value={input.moment}
                onChange={(e) => updateInput("moment", e.target.value as (typeof MOMENT_CODES)[number])}
              >
                {MOMENT_CODES.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm font-semibold">
              Team size
              <input
                type="number"
                min={1}
                className="w-full rounded-lg border-2 border-ink bg-[rgba(255,255,255,0.7)] px-3 py-2 font-mono text-sm shadow-[6px_8px_0_rgba(27,26,20,0.14)]"
                value={input.peopleCount}
                onChange={(e) => updateInput("peopleCount", parseInt(e.target.value, 10) || 0)}
              />
            </label>
          </div>
        </div>

        <ResourceNodeEditor newNode={newNode} setNewNode={setNewNode} resourceNodes={input.resourceNodes} />
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/results" className="ink-button" aria-label="Generate protocol and go to results">
          Generate
        </Link>
      </section>
    </main>
  );
}

function ResourceNodeEditor({
  newNode,
  setNewNode,
  resourceNodes,
}: {
  newNode: { label: string; lat: string; lng: string; types: string };
  setNewNode: (node: { label: string; lat: string; lng: string; types: string }) => void;
  resourceNodes: PlanInput["resourceNodes"];
}) {
  const { addResourceNode, updateResourceNode, removeResourceNode } = usePlan();

  const handleAdd = () => {
    if (!newNode.label || !newNode.lat || !newNode.lng) return;
    const parsedTypes = newNode.types
      .split(",")
      .map((t) => t.trim().toUpperCase())
      .filter(Boolean) as PlanInput["resourceNodes"][number]["types"];
    addResourceNode({
      label: newNode.label,
      lat: parseFloat(newNode.lat),
      lng: parseFloat(newNode.lng),
      types: parsedTypes,
    });
    setNewNode({ label: "", lat: "", lng: "", types: "A" });
  };

  return (
    <details className="card-frame p-5 space-y-3">
      <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.25em] text-olive">
        Step 4 · Advanced (resource nodes optional)
      </summary>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-2xl">Resource nodes</h3>
            <p className="text-sm text-ink/70">Añade puntos de recursos para priorizar tipos A..F.</p>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <input
            className="rounded-lg border-2 border-ink bg-[rgba(255,255,255,0.7)] px-3 py-2 font-mono text-sm"
            placeholder="Label"
            value={newNode.label}
            onChange={(e) => setNewNode({ ...newNode, label: e.target.value })}
          />
          <input
            type="number"
            className="rounded-lg border-2 border-ink bg-[rgba(255,255,255,0.7)] px-3 py-2 font-mono text-sm"
            placeholder="Lat"
            value={newNode.lat}
            onChange={(e) => setNewNode({ ...newNode, lat: e.target.value })}
          />
          <input
            type="number"
            className="rounded-lg border-2 border-ink bg-[rgba(255,255,255,0.7)] px-3 py-2 font-mono text-sm"
            placeholder="Lng"
            value={newNode.lng}
            onChange={(e) => setNewNode({ ...newNode, lng: e.target.value })}
          />
          <input
            className="sm:col-span-2 rounded-lg border-2 border-ink bg-[rgba(255,255,255,0.7)] px-3 py-2 font-mono text-sm"
            placeholder="Types (A,B,C)"
            value={newNode.types}
            onChange={(e) => setNewNode({ ...newNode, types: e.target.value })}
          />
          <button className="ink-button" onClick={handleAdd}>
            Add node
          </button>
        </div>

        <ul className="space-y-2">
          {resourceNodes.map((node) => (
            <li
              key={node.id}
              className="rounded-lg border-2 border-ink bg-[rgba(255,255,255,0.75)] p-3 shadow-[6px_8px_0_rgba(27,26,20,0.14)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-mono text-xs text-olive">{node.id}</div>
                <div className="flex gap-2">
                  <button
                    className="text-xs font-semibold text-rust underline"
                    onClick={() => removeResourceNode(node.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-4">
                <input
                  className="rounded border-2 border-ink bg-white/80 px-2 py-1 text-sm font-mono"
                  value={node.label}
                  onChange={(e) => updateResourceNode(node.id, { label: e.target.value })}
                />
                <input
                  type="number"
                  className="rounded border-2 border-ink bg-white/80 px-2 py-1 text-sm font-mono"
                  value={node.lat}
                  onChange={(e) => updateResourceNode(node.id, { lat: parseFloat(e.target.value) })}
                />
                <input
                  type="number"
                  className="rounded border-2 border-ink bg-white/80 px-2 py-1 text-sm font-mono"
                  value={node.lng}
                  onChange={(e) => updateResourceNode(node.id, { lng: parseFloat(e.target.value) })}
                />
                <input
                  className="rounded border-2 border-ink bg-white/80 px-2 py-1 text-sm font-mono"
                  value={node.types.join(",")}
                  onChange={(e) =>
                    updateResourceNode(node.id, {
                      types: e.target.value
                        .split(",")
                        .map((t) => t.trim().toUpperCase())
                        .filter(Boolean) as PlanInput["resourceNodes"][number]["types"],
                    })
                  }
                />
              </div>
              <p className="mt-1 text-xs text-ink/70">Coord input · tipos A..F</p>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

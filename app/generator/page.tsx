"use client";

import CardPreview from "@/components/CardPreview";
import MapCorridor from "@/components/MapCorridor";
import MascotPanel from "@/components/MascotPanel";
import PdfExportButton from "@/components/PdfExportButton";
import ScenarioSelector from "@/components/ScenarioSelector";
import { usePlan } from "@/components/PlanContext";
import { MOMENT_CODES, PLAN_LEVELS } from "@/lib/constants";
import { cityTemplates } from "@/lib/cityTemplates";
import { geocodeAddress, type GeocodeResult } from "@/lib/geocode";
import { PlanInput } from "@/lib/schema";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function GeneratorPage() {
  const { input, updateInput, persistProfile, lastSavedAt, loadCityPreset } = usePlan();
  const [newNode, setNewNode] = useState({ label: "", lat: "", lng: "", types: "A" });
  const [previewScenario, setPreviewScenario] = useState(input.scenarios[0] ?? "UNK");
  const [addressQuery, setAddressQuery] = useState("");
  const [geocodeResults, setGeocodeResults] = useState<GeocodeResult[]>([]);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [latInput, setLatInput] = useState(input.start.lat.toString());
  const [lngInput, setLngInput] = useState(input.start.lng.toString());
  const [labelInput, setLabelInput] = useState(input.start.label ?? "");

  const savedLabel = useMemo(() => {
    if (!lastSavedAt) return "Auto-save pendiente";
    return new Date(lastSavedAt).toLocaleString();
  }, [lastSavedAt]);

  useEffect(() => {
    if (!input.scenarios.includes(previewScenario)) {
      setPreviewScenario(input.scenarios[0] ?? "UNK");
    }
  }, [input.scenarios, previewScenario]);

  useEffect(() => {
    setLatInput(input.start.lat.toString());
    setLngInput(input.start.lng.toString());
    setLabelInput(input.start.label ?? "");
  }, [input.start.lat, input.start.lng, input.start.label]);

  const handleCityChange = (value: string) => {
    const nextCity = value || "BCN";

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
    const sampleNodes: PlanInput["resourceNodes"] = [
      { id: "N0", label: "Home", lat: 41.39, lng: 2.16, types: ["A", "C", "E"] },
      { id: "N1", label: "Clinic", lat: 41.4, lng: 2.18, types: ["D", "A"] },
    ];

    loadCityPreset("BCN", { scenarios: ["NUK"], moment: "POST", level: "STANDARD", resourceNodes: sampleNodes });
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
    setLocationStatus("Coordenadas aplicadas.");
  };

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

      <section className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
        <div className="space-y-5">
          <div className="card-frame p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-olive">Location</p>
                <h2 className="font-display text-2xl">Set your location</h2>
                <p className="text-sm text-ink/70">Usa dirección/POI o coordenadas. Se aplica al origen de la ruta.</p>
              </div>
            </div>
            <div className="grid gap-3">
              <label className="space-y-1 text-sm font-semibold">
                Address / POI
                <input
                  className="w-full rounded-lg border-2 border-ink bg-[rgba(255,255,255,0.7)] px-3 py-2 font-mono text-sm shadow-[6px_8px_0_rgba(27,26,20,0.14)]"
                  placeholder="Carrer Aragó 200, BCN"
                  value={addressQuery}
                  onChange={(e) => setAddressQuery(e.target.value)}
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="ink-button" onClick={handleSearchLocation}>
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
                      <li key={`${result.displayName}-${result.lat}-${result.lng}`} className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold">{result.displayName}</p>
                          <p className="text-xs text-ink/70">
                            {result.lat.toFixed(4)}, {result.lng.toFixed(4)}
                          </p>
                        </div>
                        <button type="button" className="ink-button" onClick={() => handleApplyLocation(result)}>
                          Use this location
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <details className="rounded-xl border-2 border-dashed border-ink/40 p-3">
              <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.2em] text-olive">
                Use coordinates
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

          <ScenarioSelector />

          <div className="card-frame p-5 space-y-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-olive">Setup</p>
              <h2 className="font-display text-2xl">Moment & team</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
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
            </div>
          </div>

          <ResourceNodeEditor newNode={newNode} setNewNode={setNewNode} resourceNodes={input.resourceNodes} />
        </div>

        <div className="relative space-y-4 lg:pl-6">
          <div className="card-frame p-4 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-olive">Preview</p>
                <h2 className="font-display text-2xl">A6 card</h2>
              </div>
              {input.scenarios.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {input.scenarios.map((scenario) => (
                    <button
                      key={scenario}
                      type="button"
                      onClick={() => setPreviewScenario(scenario)}
                      className={`rounded-full border-2 border-ink px-3 py-1 text-xs font-mono ${
                        previewScenario === scenario ? "bg-[rgba(179,90,42,0.18)]" : "bg-[rgba(255,255,255,0.7)]"
                      }`}
                    >
                      {scenario}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {input.scenarios.length > 1 && (
              <p className="text-xs text-ink/70">Preview scenario</p>
            )}
            <CardPreview scenario={previewScenario} />
          </div>
          <MapCorridor />
          <MascotPanel />
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <Link href="/results" className="ink-button" aria-label="Generate protocol and go to results">
            Generate → Results
          </Link>
          <PdfExportButton />
          <button className="ink-button" onClick={persistProfile}>
            Save profile
          </button>
        </div>
        <span className="rounded-lg border-2 border-dashed border-ink px-3 py-1 text-xs font-mono text-olive bg-[rgba(255,255,255,0.65)]">
          Perfil guardado: {savedLabel}
        </span>
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
        Resource nodes (optional)
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

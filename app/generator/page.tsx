"use client";

import CardPreview from "@/components/CardPreview";
import MascotPanel from "@/components/MascotPanel";
import ScenarioSelector from "@/components/ScenarioSelector";
import StageTimeline from "@/components/StageTimeline";
import { usePlan } from "@/components/PlanContext";
import { MOMENT_CODES, PLAN_LEVELS, SCENARIO_CODES } from "@/lib/constants";
import { PlanInput } from "@/lib/schema";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function GeneratorPage() {
  const router = useRouter();
  const { input, updateInput, updatePreference, lowInkMode, toggleLowInkMode, lastSavedAt } = usePlan();
  const [newNode, setNewNode] = useState({ label: "", lat: "", lng: "", types: "A" });

  const savedLabel = useMemo(() => {
    if (!lastSavedAt) return "Auto-save pendiente";
    return new Date(lastSavedAt).toLocaleString();
  }, [lastSavedAt]);

  const handleGenerate = () => {
    router.push("/results");
  };

  const preferenceToggles = useMemo(
    () => [
      { key: "avoidAvenues", label: "Evitar avenidas" },
      { key: "avoidUnderground", label: "Evitar underground" },
      { key: "avoidTourist", label: "Evitar zonas turísticas" },
      { key: "avoidCriticalInfra", label: "Evitar infra crítica" },
    ],
    [],
  );

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
            <p className="text-sm text-ink/80">Texturas de papel, reloj TVA y carta A6 en vivo mientras ajustas entradas.</p>
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
                <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-olive">Input stack</p>
                <h2 className="font-display text-2xl">Location & readiness</h2>
              </div>
              <button
                onClick={handleGenerate}
                className="ink-button flex items-center gap-2"
                aria-label="Generate protocol and go to results"
              >
                Generate → Results
              </button>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-mono text-olive">
              <button
                type="button"
                onClick={toggleLowInkMode}
                className={`rounded-lg border-2 border-ink px-3 py-1 transition ${lowInkMode ? "bg-[rgba(74,90,58,0.14)]" : "bg-[rgba(255,255,255,0.7)]"}`}
              >
                Low Ink: {lowInkMode ? "ON" : "OFF"}
              </button>
              <span className="rounded-lg border-2 border-dashed border-ink px-3 py-1 bg-[rgba(255,255,255,0.65)]">
                Perfil guardado: {savedLabel}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-sm font-semibold">
                City / Sector
                <input
                  className="w-full rounded-lg border-2 border-ink bg-[rgba(255,255,255,0.7)] px-3 py-2 font-mono text-sm shadow-[6px_8px_0_rgba(27,26,20,0.14)]"
                  placeholder="BCN-Arc-12"
                  value={input.city}
                  onChange={(e) => updateInput("city", e.target.value || "BCN")}
                />
              </label>
              <label className="space-y-1 text-sm font-semibold">
                Nivel
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
                Scenario
                <select
                  className="w-full rounded-lg border-2 border-ink bg-[rgba(255,255,255,0.7)] px-3 py-2 font-mono text-sm shadow-[6px_8px_0_rgba(27,26,20,0.14)]"
                  value={input.scenario}
                  onChange={(e) => updateInput("scenario", e.target.value as (typeof SCENARIO_CODES)[number])}
                >
                  {SCENARIO_CODES.map((code) => (
                    <option key={code} value={code}>
                      {code}
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
                Start label
                <input
                  className="w-full rounded-lg border-2 border-ink bg-[rgba(255,255,255,0.7)] px-3 py-2 font-mono text-sm shadow-[6px_8px_0_rgba(27,26,20,0.14)]"
                  placeholder="Forum"
                  value={input.start.label ?? ""}
                  onChange={(e) => updateInput("start", { ...input.start, label: e.target.value })}
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="space-y-1 text-sm font-semibold">
                  Lat
                  <input
                    type="number"
                    className="w-full rounded-lg border-2 border-ink bg-[rgba(255,255,255,0.7)] px-3 py-2 font-mono text-sm shadow-[6px_8px_0_rgba(27,26,20,0.14)]"
                    value={input.start.lat}
                    onChange={(e) => updateInput("start", { ...input.start, lat: parseFloat(e.target.value) || 0 })}
                  />
                </label>
                <label className="space-y-1 text-sm font-semibold">
                  Lng
                  <input
                    type="number"
                    className="w-full rounded-lg border-2 border-ink bg-[rgba(255,255,255,0.7)] px-3 py-2 font-mono text-sm shadow-[6px_8px_0_rgba(27,26,20,0.14)]"
                    value={input.start.lng}
                    onChange={(e) => updateInput("start", { ...input.start, lng: parseFloat(e.target.value) || 0 })}
                  />
                </label>
              </div>
            </div>
            <div className="rounded-xl border-2 border-dashed border-ink/40 p-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-olive">Preferences</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {preferenceToggles.map((pref) => (
                  <label key={pref.key} className="flex items-center gap-2 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={Boolean(input.preferences[pref.key as keyof typeof input.preferences])}
                      onChange={(e) => updatePreference(pref.key as keyof typeof input.preferences, e.target.checked)}
                    />
                    {pref.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <ScenarioSelector />
          <StageTimeline />

          <ResourceNodeEditor newNode={newNode} setNewNode={setNewNode} resourceNodes={input.resourceNodes} />
        </div>

        <div className="relative space-y-4 lg:pl-6">
          <CardPreview />
          <MascotPanel floating />
        </div>
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
    <div className="card-frame p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-olive">Resource Nodes</p>
          <h3 className="font-display text-2xl">Pins & supply</h3>
        </div>
        <span className="rounded-full border-2 border-ink bg-[rgba(255,255,255,0.7)] px-3 py-1 text-xs font-mono">Mock pin</span>
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
            <p className="mt-1 text-xs text-ink/70">Pin mock · coord input</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

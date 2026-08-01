"use client";

import { ScenarioCode } from "@/lib/schema";

import { usePlan } from "./PlanContext";

const scenarios: { code: ScenarioCode; label: string; detail: string }[] = [
  { code: "CIV", label: "Inundación", detail: "Evita cauces, túneles y zonas bajas." },
  { code: "AIR", label: "Incendio forestal", detail: "Reduce exposición a humo, vegetación y frentes de fuego." },
  { code: "EQK", label: "Terremoto", detail: "Prioriza espacios abiertos y evita infraestructura dañada." },
  { code: "UNK", label: "Tsunami", detail: "Busca altura y distancia respecto de la costa." },
  { code: "NUK", label: "Conflicto o bombardeo", detail: "Reduce exposición y evita infraestructura crítica." },
];

export default function ScenarioSelector({ showHeader = true }: { showHeader?: boolean }) {
  const { input, updateInput } = usePlan();
  const selectedScenario = input.scenarios[0] ?? scenarios[0].code;

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-olive">Emergencia</p>
            <h3 className="font-display text-3xl leading-tight">¿Qué está pasando?</h3>
            <p className="text-sm text-ink/70">
              Elegí una emergencia. En el MVP, PLAN72 prepara una vista previa específica para ese escenario.
            </p>
          </div>
          <span className="rounded-full border-2 border-ink px-3 py-1 text-xs font-mono bg-[rgba(179,90,42,0.1)]">
            72 HORAS
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {scenarios.map((scenario) => {
          const isActive = selectedScenario === scenario.code;

          return (
            <button
              key={scenario.code}
              type="button"
              onClick={() => updateInput("scenarios", [scenario.code])}
              aria-pressed={isActive}
              className={`card-frame group p-4 text-left transition hover:-translate-y-1 ${
                isActive ? "border-ink bg-[rgba(179,90,42,0.16)]" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-olive">Ruta específica</span>
                <span className={`h-3 w-3 rounded-full border-2 border-ink ${isActive ? "bg-ink" : "bg-transparent"}`} />
              </div>
              <h4 className="mt-3 font-display text-xl leading-tight">{scenario.label}</h4>
              <p className="mt-2 text-sm text-ink/75">{scenario.detail}</p>
              {isActive && <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-olive">Seleccionada</p>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

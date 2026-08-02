"use client";

import { ScenarioCode } from "@/lib/schema";

import { usePlan } from "./PlanContext";

const scenarios: {
  code: ScenarioCode;
  label: string;
  detail: string;
  icon: string;
  accent: string;
  glow: string;
  tag: string;
  signal: string;
  intensity: number;
}[] = [
  {
    code: "CIV",
    label: "Inundación",
    detail: "Evita cauces, túneles y zonas bajas.",
    icon: "🌊",
    accent: "from-sky-100/90 to-cyan-50/40",
    glow: "bg-sky-300/40",
    tag: "Agua",
    signal: "Cota",
    intensity: 74,
  },
  {
    code: "AIR",
    label: "Incendio forestal",
    detail: "Reduce exposición a humo, vegetación y frentes de fuego.",
    icon: "🔥",
    accent: "from-orange-100/90 to-amber-50/40",
    glow: "bg-orange-300/40",
    tag: "Fuego",
    signal: "Humo",
    intensity: 82,
  },
  {
    code: "EQK",
    label: "Terremoto",
    detail: "Prioriza espacios abiertos y evita infraestructura dañada.",
    icon: "🪨",
    accent: "from-emerald-100/90 to-lime-50/40",
    glow: "bg-emerald-300/40",
    tag: "Geo",
    signal: "Ondas",
    intensity: 68,
  },
  {
    code: "UNK",
    label: "Tsunami",
    detail: "Busca altura y distancia respecto de la costa.",
    icon: "🌊",
    accent: "from-blue-100/90 to-indigo-50/40",
    glow: "bg-blue-300/40",
    tag: "Costa",
    signal: "Altura",
    intensity: 88,
  },
  {
    code: "NUK",
    label: "Conflicto o bombardeo",
    detail: "Reduce exposición y evita infraestructura crítica.",
    icon: "🛡️",
    accent: "from-rose-100/90 to-stone-50/40",
    glow: "bg-rose-300/40",
    tag: "Civil",
    signal: "Cobertura",
    intensity: 80,
  },
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
              Elegí una emergencia. PLAN72 prepara una vista previa de ruta específica para ese escenario.
            </p>
          </div>
          <span className="rounded-full border-2 border-ink bg-[rgba(179,90,42,0.1)] px-3 py-1 text-xs font-mono">
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
              className={`card-frame group relative overflow-hidden p-4 text-left transition duration-200 hover:-translate-y-1 ${
                isActive
                  ? "border-ink bg-[rgba(179,90,42,0.12)] shadow-[8px_10px_0_rgba(27,26,20,0.18)]"
                  : "bg-[rgba(255,255,255,0.7)] shadow-[6px_8px_0_rgba(27,26,20,0.12)]"
              }`}
            >
              <div
                className={`absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl opacity-60 transition ${
                  scenario.glow
                } ${isActive ? "scale-110" : "scale-100 group-hover:scale-110"}`}
                aria-hidden
              />

              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-gradient-to-br text-lg shadow-[3px_4px_0_rgba(27,26,20,0.16)] ${scenario.accent}`}
                  >
                    {scenario.icon}
                  </span>
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-olive">Ruta específica</div>
                    <div className="text-base font-semibold text-ink">{scenario.label}</div>
                  </div>
                </div>
                <span
                  className={`rounded-full border-2 border-ink px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                    isActive ? "bg-ink text-paper" : "bg-[rgba(255,255,255,0.75)] text-ink"
                  }`}
                >
                  {isActive ? "Seleccionada" : scenario.tag}
                </span>
              </div>

              <div className="mt-3 text-sm text-ink/80">{scenario.detail}</div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-olive">
                <span className="rounded-md border-2 border-ink/60 bg-[rgba(245,232,204,0.6)] px-2 py-0.5">
                  Señal {scenario.signal}
                </span>
                <span className="rounded-md border-2 border-ink/60 bg-[rgba(255,255,255,0.6)] px-2 py-0.5">
                  Prioridad {scenario.intensity}%
                </span>
              </div>
              <div className="mt-4 h-2 w-full rounded-full bg-ink/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--olive)] to-[var(--rust)] transition-all duration-300"
                  style={{ width: `${isActive ? 100 : scenario.intensity}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

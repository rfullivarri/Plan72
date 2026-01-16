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
    code: "AIR",
    label: "Air",
    detail: "Particulado + gas",
    icon: "🌫️",
    accent: "from-sky-100/90 to-sky-50/40",
    glow: "bg-sky-300/40",
    tag: "Atm",
    signal: "Viento",
    intensity: 68,
  },
  {
    code: "NUK",
    label: "Nuclear",
    detail: "Fallout / EMP",
    icon: "☢️",
    accent: "from-amber-100/90 to-amber-50/40",
    glow: "bg-amber-300/40",
    tag: "Rad",
    signal: "Pulso",
    intensity: 82,
  },
  {
    code: "CIV",
    label: "Civil",
    detail: "Disturbios",
    icon: "🛡️",
    accent: "from-rose-100/90 to-rose-50/40",
    glow: "bg-rose-300/40",
    tag: "Riot",
    signal: "Flujo",
    intensity: 62,
  },
  {
    code: "EQK",
    label: "Quake",
    detail: "Infra dañada",
    icon: "🪨",
    accent: "from-emerald-100/90 to-emerald-50/40",
    glow: "bg-emerald-300/40",
    tag: "Geo",
    signal: "Ondas",
    intensity: 58,
  },
  {
    code: "UNK",
    label: "Unknown",
    detail: "Señal gris",
    icon: "❓",
    accent: "from-stone-100/90 to-stone-50/40",
    glow: "bg-stone-300/40",
    tag: "Gray",
    signal: "Ruido",
    intensity: 50,
  },
  {
    code: "MEM",
    label: "Meme",
    detail: "Zombies / invasión alienígena",
    icon: "🧟‍♂️",
    accent: "from-violet-100/90 to-lime-100/50",
    glow: "bg-violet-300/40",
    tag: "LOL",
    signal: "Anomalía",
    intensity: 76,
  },
];

export default function ScenarioSelector({ showHeader = true }: { showHeader?: boolean }) {
  const { input, updateInput } = usePlan();

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-olive">Scan</p>
            <h3 className="font-display text-3xl leading-tight">Scenario intake</h3>
            <p className="text-sm text-ink/70">Selecciona uno o varios; cada uno genera una carta A6.</p>
          </div>
          <span className="rounded-full border-2 border-ink px-3 py-1 text-xs font-mono bg-[rgba(179,90,42,0.1)]">
            TVA CLOCK 72:00
          </span>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {scenarios.map((scenario) => {
          const isActive = input.scenarios.includes(scenario.code);
          const handleToggle = () => {
            if (isActive) {
              const remaining = input.scenarios.filter((code) => code !== scenario.code);
              updateInput("scenarios", remaining.length > 0 ? remaining : [scenario.code]);
              return;
            }

            updateInput("scenarios", [...input.scenarios, scenario.code]);
          };
          return (
            <button
              key={scenario.code}
              onClick={handleToggle}
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
                    <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-olive">{scenario.code}</div>
                    <div className="text-base font-semibold text-ink">{scenario.label}</div>
                  </div>
                </div>
                <span
                  className={`rounded-full border-2 border-ink px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                    isActive ? "bg-ink text-paper" : "bg-[rgba(255,255,255,0.75)] text-ink"
                  }`}
                >
                  {isActive ? "Selected" : scenario.tag}
                </span>
              </div>
              <div className="mt-3 text-sm text-ink/80">{scenario.detail}</div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-olive">
                <span className="rounded-md border-2 border-ink/60 bg-[rgba(245,232,204,0.6)] px-2 py-0.5">
                  Signal {scenario.signal}
                </span>
                <span className="rounded-md border-2 border-ink/60 bg-[rgba(255,255,255,0.6)] px-2 py-0.5">
                  Impact {scenario.intensity}%
                </span>
              </div>
              <div className="mt-4 h-2 w-full rounded-full bg-ink/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--olive)] to-[var(--rust)] transition-all duration-300"
                  style={{ width: `${isActive ? 100 : scenario.intensity}%` }}
                />
              </div>
              {isActive && <div className="mt-3 text-xs font-mono uppercase tracking-[0.2em] text-olive">Activo</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

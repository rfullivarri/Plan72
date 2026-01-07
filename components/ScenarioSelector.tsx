"use client";

import { ScenarioCode } from "@/lib/schema";

import { usePlan } from "./PlanContext";

const scenarios: { code: ScenarioCode; label: string; detail: string }[] = [
  { code: "AIR", label: "Air", detail: "Particulado + gas" },
  { code: "NUK", label: "Nuclear", detail: "Fallout / EMP" },
  { code: "CIV", label: "Civil", detail: "Disturbios" },
  { code: "EQK", label: "Quake", detail: "Infra dañada" },
  { code: "UNK", label: "Unknown", detail: "Señal gris" },
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
              className={`card-frame group p-4 text-left transition hover:-translate-y-1 ${
                isActive ? "border-ink bg-[rgba(179,90,42,0.12)]" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-mono text-xs text-olive">{scenario.code}</div>
                <span
                  className={`rounded-full border-2 border-ink px-2 py-0.5 text-[10px] font-semibold ${
                    isActive ? "bg-[rgba(27,26,20,0.05)]" : ""
                  }`}
                >
                  {scenario.label}
                </span>
              </div>
              <div className="mt-2 text-sm text-ink/80">{scenario.detail}</div>
              <div className="mt-3 h-1.5 w-full bg-ink/10">
                <div
                  className={`h-full bg-gradient-to-r from-[var(--olive)] to-[var(--rust)] transition-all ${
                    isActive ? "w-full" : "w-2/3 group-hover:w-full"
                  }`}
                />
              </div>
              {isActive && <div className="mt-3 text-xs font-mono text-olive">Selected</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

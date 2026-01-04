const stages = [
  { code: "STG0", label: "Immediate", detail: "00:00 → 03:00" },
  { code: "STG1", label: "Stabilize", detail: "03:00 → 08:00" },
  { code: "STG2", label: "Move", detail: "08:00 → 24:00" },
  { code: "STG3", label: "Sustain", detail: "24:00 → 72:00" },
];

export default function StageTimeline() {
  return (
    <div className="card-frame p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-olive">Ruta</p>
          <div className="font-display text-2xl">Stages</div>
        </div>
        <div className="rounded-lg border-2 border-ink bg-[rgba(255,255,255,0.6)] px-3 py-1 text-xs font-mono">PRINT · A6</div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 timeline-rail">
        {stages.map((stage) => (
          <div
            key={stage.code}
            className="relative rounded-xl border-2 border-ink bg-[rgba(255,255,255,0.65)] p-4 pl-5 shadow-[8px_10px_0_rgba(27,26,20,0.14)]"
          >
            <div className="absolute -left-3 top-5 h-6 w-6 rounded-full border-3 border-ink bg-paper text-center font-mono text-[10px]">
              ·
            </div>
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-mono text-xs text-olive">{stage.code}</p>
                <p className="font-semibold">{stage.label}</p>
              </div>
              <span className="rounded-md border border-ink bg-[rgba(179,90,42,0.08)] px-2 py-1 text-[11px] font-mono">
                {stage.detail}
              </span>
            </div>
            <p className="mt-2 text-sm text-ink/75">
              Checklist placeholder: seal, scan, move. TVA clock keeps these aligned to the corridor map.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const stages = [
  { code: "STG0", label: "Immediate" },
  { code: "STG1", label: "Stabilize" },
  { code: "STG2", label: "Move" },
  { code: "STG3", label: "Sustain" },
];

export default function StageTimeline() {
  return (
    <div className="card-frame p-4">
      <div className="font-display text-xl mb-3">Stages</div>
      <div className="grid grid-cols-4 gap-3">
        {stages.map((stage) => (
          <div key={stage.code} className="flex flex-col items-center gap-1">
            <span className="font-mono text-sm bg-ink text-paper rounded-full w-14 h-14 flex items-center justify-center">
              {stage.code}
            </span>
            <span className="text-xs text-center">{stage.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

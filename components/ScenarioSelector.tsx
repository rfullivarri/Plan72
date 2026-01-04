const scenarios = [
  { code: "AIR", label: "Air" },
  { code: "NUK", label: "Nuclear" },
  { code: "CIV", label: "Civil" },
  { code: "EQK", label: "Quake" },
  { code: "UNK", label: "Unknown" },
];

export default function ScenarioSelector() {
  return (
    <div className="space-y-3">
      <div className="font-display text-xl">Scenario</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {scenarios.map((scenario) => (
          <button key={scenario.code} className="card-frame p-3 ink-button">
            <div className="font-mono text-xs text-olive">{scenario.code}</div>
            <div className="font-semibold">{scenario.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

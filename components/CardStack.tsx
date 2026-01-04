const mockCards = [
  { id: "BCN–ACT–NUK–POST", label: "Action | NUK POST" },
  { id: "BCN–RTE–BASE", label: "Route | Base Corridor" },
  { id: "BCN–STS–NUK", label: "Resource Nodes" },
];

export default function CardStack() {
  return (
    <div className="space-y-2">
      <h4 className="font-display text-2xl">Protocol Cards</h4>
      <ul className="space-y-2">
        {mockCards.map((card) => (
          <li key={card.id} className="card-frame p-4 flex items-center justify-between">
            <div>
              <p className="font-mono text-xs text-olive">{card.id}</p>
              <p className="font-semibold">{card.label}</p>
            </div>
            <span className="text-sm font-mono">A6/A7</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

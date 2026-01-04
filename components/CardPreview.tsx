export default function CardPreview() {
  return (
    <div className="card-frame p-6 space-y-3">
      <div className="text-sm uppercase tracking-[0.2em] text-olive font-mono">Sample Card</div>
      <h3 className="font-display text-3xl">BCN–ACT–NUK–POST</h3>
      <p className="text-sm text-ink/80">
        Placeholder card preview showing the retro printed-manual frame. Future versions will render
        dynamic stages and resource nodes.
      </p>
      <div className="flex gap-2 text-xs font-mono">
        <span className="px-3 py-1 bg-olive text-paper rounded">STG0</span>
        <span className="px-3 py-1 border border-ink rounded">SHELTER</span>
      </div>
    </div>
  );
}

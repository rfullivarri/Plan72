export default function MascotPanel() {
  return (
    <div className="card-frame p-4 flex flex-col items-center gap-2 text-center">
      <div className="w-24 h-24 rounded-full border-4 border-ink bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent_40%),var(--paper-shadow)]"></div>
      <div className="font-display text-xl">Atlas the Guide</div>
      <p className="text-sm text-ink/80">I’ll keep an eye on your scenario and prompt key moves.</p>
    </div>
  );
}

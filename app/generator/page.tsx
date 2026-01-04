import CardPreview from "@/components/CardPreview";
import MascotPanel from "@/components/MascotPanel";
import ScenarioSelector from "@/components/ScenarioSelector";
import StageTimeline from "@/components/StageTimeline";

export default function GeneratorPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
      <header className="manual-surface relative overflow-hidden px-6 py-8 sm:px-8">
        <div className="absolute left-0 top-0 h-20 w-20 bg-[var(--rust)]/30 blur-3xl" aria-hidden />
        <div className="absolute bottom-0 right-0 h-24 w-24 bg-[var(--olive)]/30 blur-3xl" aria-hidden />
        <div className="hero-grid" aria-hidden />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs text-olive tracking-[0.25em]">WIZARD</p>
            <h1 className="font-display text-4xl">Protocol Generator</h1>
            <p className="text-sm text-ink/80">Texturas de papel, reloj TVA y carta A6 en vivo mientras ajustas entradas.</p>
          </div>
          <div className="rounded-full border-4 border-ink bg-[rgba(255,255,255,0.7)] px-4 py-2 text-sm font-mono uppercase tracking-[0.2em]">
            Atlas on duty
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr]">
        <div className="space-y-5">
          <div className="card-frame p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-olive">Input stack</p>
                <h2 className="font-display text-2xl">Location & readiness</h2>
              </div>
              <span className="rounded-md border-2 border-ink bg-[rgba(255,255,255,0.65)] px-3 py-1 text-xs font-mono">
                A6 Preview live
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-sm font-semibold">
                City / Sector
                <input
                  className="w-full rounded-lg border-2 border-ink bg-[rgba(255,255,255,0.7)] px-3 py-2 font-mono text-sm shadow-[6px_8px_0_rgba(27,26,20,0.14)]"
                  placeholder="BCN-Arc-12"
                />
              </label>
              <label className="space-y-1 text-sm font-semibold">
                Readiness level
                <select className="w-full rounded-lg border-2 border-ink bg-[rgba(245,232,204,0.8)] px-3 py-2 font-mono text-sm shadow-[6px_8px_0_rgba(27,26,20,0.14)]">
                  <option>Drill</option>
                  <option>Standby</option>
                  <option>Immediate</option>
                </select>
              </label>
              <label className="space-y-1 text-sm font-semibold">
                Moment
                <input
                  className="w-full rounded-lg border-2 border-ink bg-[rgba(255,255,255,0.7)] px-3 py-2 font-mono text-sm shadow-[6px_8px_0_rgba(27,26,20,0.14)]"
                  placeholder="T+00:12"
                />
              </label>
              <label className="space-y-1 text-sm font-semibold">
                Corridor
                <input
                  className="w-full rounded-lg border-2 border-ink bg-[rgba(255,255,255,0.7)] px-3 py-2 font-mono text-sm shadow-[6px_8px_0_rgba(27,26,20,0.14)]"
                  placeholder="Metro L2 / Arc N"
                />
              </label>
            </div>
          </div>

          <ScenarioSelector />
          <StageTimeline />
        </div>

        <div className="relative space-y-4 lg:pl-6">
          <CardPreview />
          <MascotPanel floating />
        </div>
      </section>
    </main>
  );
}

import Link from "next/link";
import CardPreview from "@/components/CardPreview";
import MascotPanel from "@/components/MascotPanel";

export default function Home() {
  return (
    <main className="px-6 py-12">
      <section className="manual-surface relative mx-auto max-w-6xl overflow-hidden px-6 py-12 sm:px-10 sm:py-14">
        <div className="absolute -left-10 top-10 h-32 w-32 rotate-6 bg-[var(--rust)]/30 blur-3xl" aria-hidden />
        <div className="absolute bottom-0 right-0 h-40 w-40 -rotate-6 bg-[var(--olive)]/30 blur-3xl" aria-hidden />
        <div className="hero-grid" aria-hidden />
        <div className="grid items-start gap-10 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-6">
            <p className="ribbon-tag inline-flex">72H PROTOCOL</p>
            <h1 className="font-display text-5xl leading-tight sm:text-6xl">Retro Fallout field manual</h1>
            <p className="max-w-2xl text-lg text-ink/80">
              UI/UX inspirado en manuales de emergencia y el reloj TVA. Diseña cartas A6 listas para imprimir con
              capas de papel, marcos de tinta gruesa y nuestro pequeño guardián Atlas vigilando el tiempo.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link className="ink-button" href="/generator">
                Start Generator
              </Link>
              <Link className="ink-button" href="#how">
                How it works
              </Link>
            </div>
            <div className="grid gap-3 rounded-xl border-2 border-ink bg-[rgba(255,255,255,0.6)] p-4 sm:grid-cols-3">
              {["Radiación", "Corridor map", "A6/A7 export"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm font-semibold">
                  <span className="h-2 w-2 rounded-full bg-ink"></span>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <CardPreview />
            <MascotPanel />
          </div>
        </div>
      </section>

      <section
        id="how"
        className="mx-auto mt-12 max-w-6xl rounded-3xl border-4 border-ink bg-[rgba(255,255,255,0.7)] p-6 shadow-[14px_18px_0_rgba(27,26,20,0.18)]"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {["Set location + level", "Pick scenario + moment", "Review + export PDF"].map((step, index) => (
            <div key={step} className="card-frame p-4 space-y-3">
              <div className="font-mono text-xs text-olive">STEP {index + 1}</div>
              <h3 className="font-display text-2xl">{step}</h3>
              <p className="text-sm text-ink/80">
                Paneles con textura de papel y rejillas TVA. Navega por el wizard y mira cómo la carta A6 se actualiza al
                momento.
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

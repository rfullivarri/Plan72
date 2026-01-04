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
            <h1 className="font-display text-5xl leading-tight sm:text-6xl">Accionable en 72h, listo para imprimir</h1>
            <p className="max-w-2xl text-lg text-ink/80">
              Generador web que entrega una sola carta imprimible (A6 por defecto, A7 opcional) por cada escenario
              catastrófico que selecciones. Cada carta consolida la ruta de escape, acciones por fases STG0..STG3,
              listas do/don&apos;t y un mapa simple con puntos clave: origen, DP1..DP3 y destino.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link className="ink-button" href="/generator">
                Start Generator
              </Link>
              <Link className="ink-button" href="/how-it-works">
                How it works
              </Link>
            </div>
            <div className="grid gap-3 rounded-xl border-2 border-ink bg-[rgba(255,255,255,0.6)] p-4 sm:grid-cols-3">
              {["Ruta + mapa mínimo", "STG0..STG3 bullets", "Export A6/A7"].map((item) => (
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
          {[
            "Set location + level",
            "Pick scenario + moment",
            "Asignar DP1..DP3 y export",
          ].map((step, index) => (
            <div key={step} className="card-frame p-4 space-y-3">
              <div className="font-mono text-xs text-olive">STEP {index + 1}</div>
              <h3 className="font-display text-2xl">{step}</h3>
              <p className="text-sm text-ink/80">
                La carta refleja en vivo tu ruta de escape, los bullets por fase y el mapa mínimo con origen, decision points y
                destino. Todo queda listo para imprimir y repartir.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-6xl rounded-3xl border-4 border-ink bg-[rgba(255,255,255,0.8)] p-6 shadow-[12px_16px_0_rgba(27,26,20,0.14)]">
        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr] items-start">
          <div className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-olive">CORE OUTPUT</p>
            <h2 className="font-display text-3xl">Qué trae cada carta</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-ink/80">
              <li>Resumen de ruta con inicio, DP1..DP3 y destino, listo para seguir sin GPS.</li>
              <li>Acciones por fase STG0..STG3 en formato bullet, sincronizadas con el reloj.</li>
              <li>Lista do/don&apos;t para evitar errores comunes en cada escenario.</li>
              <li>Mapa simple integrado en la carta para validar la secuencia visualmente.</li>
            </ul>
          </div>
          <div className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-olive">SURVIVAL BRAND</p>
            <h2 className="font-display text-3xl">Kit y servicio</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-ink/80">
              <li>Emergency go-bag con radio, agua, luz, kit médico y copias de las cartas.</li>
              <li>Stash kits A/B/C/D para caches en casa, coche, oficina y refugio.</li>
              <li>Mantenimiento: reimpresión y laminado de cartas, revisión de rutas y stocks.</li>
            </ul>
            <p className="text-sm text-ink/70">
              Todo gira alrededor del generador: diseña tu carta, expórtala y complementa con los kits físicos.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

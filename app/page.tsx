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
        <div className="grid items-start gap-12 lg:grid-cols-[1.15fr,0.85fr]">
          <div className="space-y-6">
            <p className="ribbon-tag inline-flex">SURVIVAL / 72H</p>
            <h1 className="font-display text-5xl leading-tight sm:text-6xl">Protocolo accionable en menos de 30 segundos</h1>
            <p className="max-w-2xl text-lg text-ink/80">
              No es un juego ni un manual infinito. Es un generador que arma un protocolo de acción de 72 horas según tu
              ubicación y las catástrofes que selecciones. Todo queda listo para imprimir y repartir.
            </p>
            <div className="grid gap-3 rounded-xl border-2 border-ink bg-[rgba(255,255,255,0.6)] p-4 sm:grid-cols-3">
              {["Genera según tu ubicación", "Ruta + mapa real con DP1..DP3", "Export rápido en A6/A7"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm font-semibold">
                  <span className="h-2 w-2 rounded-full bg-ink"></span>
                  {item}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link className="ink-button" href="/generator">
                Generar mi protocolo
              </Link>
              <Link className="ink-button" href="#ejemplo">
                Ver ejemplo
              </Link>
            </div>
          </div>
          <div className="space-y-4" id="ejemplo">
            <CardPreview />
            <MascotPanel />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-6xl rounded-3xl border-4 border-ink bg-[rgba(255,255,255,0.78)] p-6 shadow-[14px_18px_0_rgba(27,26,20,0.18)]">
        <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr] items-start">
          <div className="space-y-4">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-olive">QUÉ HACE</p>
            <h2 className="font-display text-3xl">Genera un protocolo de emergencia de 72 horas</h2>
            <p className="text-base text-ink/80">
              Usa tu ubicación real y las amenazas que elijas para dibujar una ruta de escape, definir decisiones DP1..DP3 y
              sincronizar acciones por etapas STG0..STG3. La salida es concreta y utilizable sin conexión.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {["Mapa y ruta accionable", "Checklists STG0..STG3", "Tarjetas listas para imprimir"].map((item) => (
                <div key={item} className="card-frame p-3 text-sm font-semibold text-ink">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-olive">QUÉ RECIBES</p>
            <h2 className="font-display text-3xl">Salida inmediata y lista para el kit</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-ink/85">
              <li>Un mapa simple con ruta de escape real, puntos clave y destino.</li>
              <li>Una tarjeta imprimible por catástrofe (A6 por defecto, A7 opcional).</li>
              <li>Acciones por etapa hasta las 72 horas (STG0..STG3) y do/don&apos;t críticos.</li>
            </ul>
          </div>
        </div>
      </section>

      <section
        id="how"
        className="mx-auto mt-10 max-w-6xl rounded-3xl border-4 border-ink bg-[rgba(255,255,255,0.7)] p-6 shadow-[12px_16px_0_rgba(27,26,20,0.14)]"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: "Ubicación", text: "Ingresa ubicación y nivel; el mapa se ajusta a tu entorno real." },
            { title: "Ruta", text: "Define origen, DP1..DP3 y destino; el trazado se valida en el mapa." },
            { title: "Cartas/PDF", text: "Exporta en A6/A7 con STG0..STG3 y distribuye a tu equipo." },
          ].map((step, index) => (
            <div key={step.title} className="card-frame space-y-3 p-4">
              <div className="font-mono text-xs text-olive">PASO {index + 1}</div>
              <h3 className="font-display text-2xl">{step.title}</h3>
              <p className="text-sm text-ink/80">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-6xl rounded-3xl border-4 border-ink bg-[rgba(255,255,255,0.82)] p-6 shadow-[12px_16px_0_rgba(27,26,20,0.14)]">
        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr] items-start">
          <div className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-olive">QUÉ CONTIENE CADA PROTOCOLO</p>
            <h2 className="font-display text-3xl">Listo para operar sin manuales</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-ink/80">
              <li>Resumen de ruta con inicio, DP1..DP3 y destino, pensado para seguir sin GPS.</li>
              <li>Acciones por fase STG0..STG3 en formato bullet, sincronizadas con el reloj.</li>
              <li>Lista do/don&apos;t para evitar errores comunes en cada escenario.</li>
              <li>Mapa integrado en la carta para validar la secuencia visualmente.</li>
            </ul>
          </div>
          <div className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-olive">VISIÓN DE NEGOCIO</p>
            <h2 className="font-display text-3xl">La marca de supervivencia se extiende</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-ink/80">
              <li>Vendemos emergency go-bags listos para salir en minutos.</li>
              <li>Kits A/B/C/D para stash en casa, coche, oficina y refugio.</li>
              <li>Servicio de mantenimiento: reimpresión, laminado y reposición de stocks.</li>
            </ul>
            <p className="text-sm text-ink/70">
              El protocolo digital es el núcleo; los kits físicos lo acompañan y se entregan listos para usar.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

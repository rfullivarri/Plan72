import Link from "next/link";

const steps = [
  {
    title: "Define location",
    body: "Selecciona la ciudad o sector y ajusta el nivel de preparación para que las recomendaciones encajen con tu contexto.",
  },
  {
    title: "Elige escenario y momento",
    body: "Combina el código de escenario (NUK, FLO, etc.) con el momento temporal (PRE/POST) para ajustar rutas y advertencias.",
  },
  {
    title: "Añade nodos y personas",
    body: "Agrega puntos de recursos, coordenadas de inicio y el número de personas que necesitan el plan de evacuación.",
  },
  {
    title: "Prefiere rutas seguras",
    body: "Activa preferencias como evitar avenidas, infra críticas o zonas turísticas para priorizar itinerarios más seguros.",
  },
  {
    title: "Revisa la carta A6",
    body: "El panel de vista previa genera la carta en vivo con rejillas TVA, referencias de nodos y detalles de nivel.",
  },
  {
    title: "Exporta y comparte",
    body: "Pulsa \"Generate → Results\" para guardar cambios y descargar el PDF listo para imprimir o compartir.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="px-6 py-12">
      <section className="manual-surface relative mx-auto max-w-5xl overflow-hidden px-6 py-10 sm:px-10 sm:py-12 space-y-8">
        <div className="absolute -left-8 top-6 h-28 w-28 rotate-6 bg-[var(--rust)]/30 blur-3xl" aria-hidden />
        <div className="absolute bottom-0 right-0 h-32 w-32 -rotate-6 bg-[var(--olive)]/30 blur-3xl" aria-hidden />
        <div className="hero-grid" aria-hidden />

        <div className="space-y-3">
          <p className="ribbon-tag inline-flex">72H PROTOCOL</p>
          <h1 className="font-display text-5xl leading-tight sm:text-6xl">How it works</h1>
          <p className="max-w-3xl text-lg text-ink/80">
            Un recorrido rápido por el generador: cómo configuramos el escenario, ajustamos la seguridad y producimos la carta
            A6 lista para tu equipo.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link className="ink-button" href="/generator">
              Ir al generador
            </Link>
            <Link className="ink-button" href="/">
              Volver al manual
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {steps.map((step, index) => (
            <div key={step.title} className="card-frame p-5 space-y-3">
              <div className="font-mono text-xs text-olive">Paso {index + 1}</div>
              <h2 className="font-display text-2xl">{step.title}</h2>
              <p className="text-sm text-ink/80">{step.body}</p>
            </div>
          ))}
        </div>

        <div className="card-frame p-5 space-y-3">
          <h3 className="font-display text-2xl">¿Qué ocurre al generar?</h3>
          <p className="text-sm text-ink/80">
            Guardamos tus entradas, aplicamos las preferencias de seguridad y renderizamos la carta con la cuadrícula A6,
            nodos etiquetados y el reloj TVA para sincronizar equipos. En la pantalla de resultados puedes exportar el PDF,
            compartirlo o ajustar detalles finales sin perder los datos previos.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link className="ink-button" href="/generator">
              Probar el flujo
            </Link>
            <Link className="ink-button" href="/results">
              Ver resultados de muestra
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

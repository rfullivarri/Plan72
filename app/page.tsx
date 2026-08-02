import Link from "next/link";

const backpacks = [
  {
    name: "Esencial",
    description: "La base mínima para que dos adultos puedan salir a pie y mantenerse operativos durante 72 horas.",
    features: ["Agua y potabilización", "Refugio básico", "Primeros auxilios", "Luz y señalización"],
  },
  {
    name: "Preparada",
    description: "Más autonomía, redundancia y comodidad para rutas más exigentes o escenarios inciertos.",
    features: ["Sistemas de respaldo", "Mayor capacidad de agua", "Mejor refugio", "Más energía y reparación"],
  },
  {
    name: "Avanzada",
    description: "La configuración más completa para usuarios que necesitan mayor protección y capacidad operativa.",
    features: ["Máxima redundancia", "Protección ampliada", "Autonomía reforzada", "Personalización avanzada"],
  },
];

const emergencies = ["Inundación", "Incendio forestal", "Terremoto", "Tsunami", "Conflicto o bombardeo"];

export default function Home() {
  return (
    <main className="px-6 py-12">
      <section className="manual-surface relative mx-auto max-w-6xl overflow-hidden px-6 py-12 sm:px-10 sm:py-14">
        <div className="absolute -left-10 top-10 h-32 w-32 rotate-6 bg-[var(--rust)]/30 blur-3xl" aria-hidden />
        <div className="absolute bottom-0 right-0 h-40 w-40 -rotate-6 bg-[var(--olive)]/30 blur-3xl" aria-hidden />
        <div className="hero-grid" aria-hidden />

        <div className="grid items-start gap-12 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-6">
            <p className="ribbon-tag inline-flex">PLAN72 · EVACUACIÓN A PIE</p>
            <h1 className="font-display text-5xl leading-tight sm:text-6xl">Tu ruta de escape para las próximas 72 horas.</h1>
            <p className="max-w-2xl text-lg text-ink/80">
              Indicá una zona aproximada, elegí la emergencia y obtené una vista previa de la ruta de menor exposición hacia un
              spot seguro. Completá el plan con una mochila preparada para dos adultos.
            </p>

            <div className="grid gap-3 rounded-xl border-2 border-ink bg-[rgba(255,255,255,0.6)] p-4 sm:grid-cols-3">
              {["Una mochila para dos adultos", "Ruta a pie según la emergencia", "Información útil sin depender de internet"].map(
                (item) => (
                  <div key={item} className="flex items-center gap-2 text-sm font-semibold">
                    <span className="h-2 w-2 rounded-full bg-ink" />
                    {item}
                  </div>
                ),
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link className="ink-button" href="/generator">
                Calcular mi ruta
              </Link>
              <Link className="ink-button" href="#mochilas">
                Ver mochilas
              </Link>
            </div>

            <p className="max-w-xl text-sm text-ink/65">
              Podés probarlo sin registrarte. La ubicación no se guarda. Para desbloquear y conservar el plan completo vas a
              necesitar una cuenta.
            </p>
          </div>

          <div className="card-frame space-y-5 p-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-olive">VISTA PREVIA DEL PLAN</p>
              <h2 className="font-display text-3xl">Qué vas a recibir</h2>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                ["Emergencia", "La que elijas"],
                ["Origen", "Zona aproximada"],
                ["Destino", "Spot MVP"],
                ["Recorrido", "A pie"],
                ["Duración", "Tiempo estimado"],
                ["Equipo", "Mochila recomendada"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border-2 border-ink/60 bg-[rgba(255,255,255,0.62)] p-3">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-olive">{label}</dt>
                  <dd className="mt-1 font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="rounded-xl border-2 border-dashed border-ink p-4">
              <p className="font-semibold">Vista parcial sin registro</p>
              <p className="mt-1 text-sm text-ink/70">
                Mostramos el inicio del recorrido, distancia, tiempo y destino. El plan completo se desbloquea al crear una cuenta.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-6xl rounded-3xl border-4 border-ink bg-[rgba(255,255,255,0.78)] p-6 shadow-[14px_18px_0_rgba(27,26,20,0.18)]">
        <div className="space-y-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-olive">EMERGENCIAS DEL MVP</p>
            <h2 className="font-display text-4xl">Una ruta específica para cada escenario.</h2>
            <p className="mt-2 max-w-3xl text-ink/75">
              En esta primera versión todas las rutas pueden terminar en el mismo spot. Lo que cambia es el criterio para llegar de
              la forma más segura posible según la emergencia seleccionada.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {emergencies.map((emergency) => (
              <div key={emergency} className="card-frame p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-olive">Ruta específica</p>
                <h3 className="mt-3 font-display text-xl leading-tight">{emergency}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="how"
        className="mx-auto mt-10 max-w-6xl rounded-3xl border-4 border-ink bg-[rgba(255,255,255,0.7)] p-6 shadow-[12px_16px_0_rgba(27,26,20,0.14)]"
      >
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { title: "Ubicá tu zona", text: "Escribí una dirección, barrio o referencia y ajustá el punto en el mapa." },
            { title: "Elegí la emergencia", text: "Seleccioná uno de los cinco escenarios incluidos en el MVP." },
            { title: "Mirá la preview", text: "Visualizá el primer tramo, distancia, tiempo, destino y mochila recomendada." },
            { title: "Desbloqueá el plan", text: "Registrate para guardar la ubicación y acceder al recorrido completo." },
          ].map((step, index) => (
            <div key={step.title} className="card-frame space-y-3 p-4">
              <div className="font-mono text-xs text-olive">PASO {index + 1}</div>
              <h3 className="font-display text-2xl">{step.title}</h3>
              <p className="text-sm text-ink/80">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="mochilas"
        className="mx-auto mt-10 max-w-6xl rounded-3xl border-4 border-ink bg-[rgba(255,255,255,0.82)] p-6 shadow-[12px_16px_0_rgba(27,26,20,0.14)]"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-olive">MOCHILAS BASE</p>
            <h2 className="font-display text-4xl">Elegí cómo querés llegar preparado.</h2>
            <p className="mt-2 max-w-3xl text-ink/75">
              Las tres configuraciones son funcionales desde la base. Después vas a poder sumar módulos según tu ruta, clima o
              situación personal.
            </p>
          </div>
          <Link className="ink-button" href="/generator">
            Primero quiero ver mi ruta
          </Link>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {backpacks.map((backpack) => (
            <article key={backpack.name} className="card-frame flex h-full flex-col p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-olive">PLAN72</p>
              <h3 className="mt-2 font-display text-3xl">{backpack.name}</h3>
              <p className="mt-3 text-sm text-ink/75">{backpack.description}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {backpack.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-ink" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-6 border-t-2 border-dashed border-ink/40 pt-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-olive">Precio base</p>
                <p className="mt-1 text-sm font-semibold">A definir durante la validación del MVP</p>
              </div>
              <Link className="ink-button mt-5" href="/generator">
                Seleccionar {backpack.name}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-6xl rounded-3xl border-4 border-ink bg-ink p-8 text-[var(--paper)] shadow-[12px_16px_0_rgba(27,26,20,0.14)]">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--paper)]/70">PLAN72 MVP</p>
            <h2 className="mt-2 font-display text-4xl">Primero la ruta. Después, el plan completo.</h2>
          </div>
          <Link className="rounded-xl border-2 border-[var(--paper)] px-5 py-3 font-semibold" href="/generator">
            Empezar simulación
          </Link>
        </div>
      </section>
    </main>
  );
}

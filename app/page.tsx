"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import LandingSimulator from "@/components/LandingSimulator";

const packs = [
  { name: "Esencial", price: 239, note: "Lo imprescindible, bien resuelto.", items: ["Agua y potabilización", "Refugio y abrigo", "Primeros auxilios", "Luz y señalización"] },
  { name: "Preparada", price: 389, note: "Más autonomía y redundancia.", items: ["Todo lo esencial", "Energía de respaldo", "Cocina compacta", "Herramientas de reparación"], featured: true },
  { name: "Avanzada", price: 549, note: "Cobertura para escenarios exigentes.", items: ["Todo lo anterior", "Protección ampliada", "Comunicaciones", "Módulos personalizables"] },
];

function RouteIcon() {
  return <svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="18" cy="59" r="7"/><circle cx="62" cy="20" r="7"/><path d="M22 54c8-15 17-4 23-15 4-7 3-14 11-16"/><path d="M27 61h30" className="thin"/></svg>;
}
function DecisionIcon() {
  return <svg viewBox="0 0 80 80" aria-hidden="true"><path d="M18 66V36c0-12 9-21 21-21h22"/><path d="m51 6 10 9-10 9"/><path d="M39 36h22"/><path d="m51 27 10 9-10 9"/><circle cx="18" cy="67" r="6"/></svg>;
}
function PackIcon() {
  return <svg viewBox="0 0 80 80" aria-hidden="true"><path d="M28 24v-5c0-8 5-12 12-12s12 4 12 12v5"/><rect x="18" y="22" width="44" height="51" rx="12"/><path d="M28 44h24M31 44v15h18V44M18 37H9v22h9M62 37h9v22h-9"/></svg>;
}

export default function Home() {
  const [pack, setPack] = useState(1);
  const [people, setPeople] = useState(2);
  const total = useMemo(() => packs[pack].price * Math.ceil(people / 2), [pack, people]);
  return (
    <main className="p72">
      <header className="p72-nav">
        <Link href="#inicio" className="p72-brand"><span>72</span>PLAN72</Link>
        <nav aria-label="Navegación principal"><a href="#sistema">Cómo funciona</a><a href="#simulador">Simulador</a><a href="#mochilas">Mochilas</a></nav>
        <Link href="/generator" className="p72-btn p72-btn-dark">Crear mi plan <span>↗</span></Link>
      </header>

      <section className="p72-hero" id="inicio">
        <div className="p72-hero-copy">
          <p className="p72-kicker">Preparación personal para emergencias reales</p>
          <h1>Una mochila no te dice a dónde ir.</h1>
          <p className="p72-lead">Plan72 empieza por tu ubicación: define una salida posible y recién después arma el equipo para sostenerla durante las primeras 72 horas.</p>
          <div className="p72-actions"><a href="#simulador" className="p72-btn p72-btn-dark">Probar mi ruta <span>↓</span></a><a href="#sistema" className="p72-btn p72-btn-light">Ver cómo funciona</a></div>
          <ul className="p72-proof"><li>Para cualquier país y ciudad</li><li>Plan para dos personas</li><li>Sin improvisar</li></ul>
        </div>
        <div className="p72-hero-art" aria-label="Equipo Plan72 preparado para una salida de 72 horas">
          <span className="p72-art-label">Ruta + protocolo + equipo</span>
          <Image src="/Plan72/plan72-kit-transparent-v2.webp" alt="Mochila y equipo esencial Plan72, recortados sobre fondo transparente" width={1254} height={1254} priority unoptimized />
          <div className="p72-art-card"><span>72</span><p><small>PLAN PERSONAL</small>Todo listo para salir.</p></div>
        </div>
      </section>

      <section className="p72-system" id="sistema">
        <div className="p72-section-head"><div><p className="p72-kicker">No se trata de acumular cosas</p><h2>Primero entendé la salida.<br/>Después decidí qué llevar.</h2></div><p>Plan72 conecta tres decisiones que una lista genérica nunca puede resolver por vos.</p></div>
        <div className="p72-system-grid">
          <article><div className="p72-icon"><RouteIcon/></div><span>01</span><h3>Tu punto de partida</h3><p>El plan comienza donde estás, no en una ciudad abstracta.</p></article>
          <article><div className="p72-icon"><DecisionIcon/></div><span>02</span><h3>Una ruta que se adapta</h3><p>Salida inicial, alternativas y momentos claros para volver a decidir.</p></article>
          <article><div className="p72-icon"><PackIcon/></div><span>03</span><h3>Equipo que responde al plan</h3><p>Una mochila dimensionada para la ruta, el contexto y las personas.</p></article>
        </div>
      </section>

      <LandingSimulator />

      <section className="p72-outcome">
        <div className="p72-outcome-copy"><p className="p72-kicker">Cuando terminás la simulación</p><h2>No recibís una línea. Recibís un plan que podés leer de un vistazo.</h2><p>Origen, ruta, puntos para reevaluar y el equipo que sostiene cada decisión. Todo conectado en una sola vista.</p><Link href="/generator" className="p72-text-link">Ver el plan completo <span>↗</span></Link></div>
        <div className="p72-outcome-art"><Image src="/Plan72/plan72-route-kit-v2.webp" alt="Mapa de ruta con puntos de decisión y tarjetas visuales de agua, primeros auxilios y refugio" width={1536} height={1024} unoptimized/></div>
      </section>

      <section className="p72-packs" id="mochilas">
        <div className="p72-section-head"><div><p className="p72-kicker">La mochila viene después</p><h2>Elegí el nivel de autonomía.</h2></div><p>Todas las configuraciones parten de una base funcional. Ajustá la cobertura según tu realidad.</p></div>
        <div className="p72-pack-grid">
          {packs.map((item, index) => <button key={item.name} onClick={() => setPack(index)} className={pack === index ? "selected" : ""}><div className="p72-pack-radio"><i/>{item.featured && <em>Recomendada</em>}</div><h3>{item.name}</h3><p>{item.note}</p><strong>€{item.price}</strong><small>por kit / hasta 2 personas</small><ul>{item.items.map(x => <li key={x}>{x}</li>)}</ul></button>)}
        </div>
        <div className="p72-config"><div><p className="p72-kicker">Tu configuración</p><h3>{packs[pack].name} · {people} {people === 1 ? "persona" : "personas"}</h3></div><div className="p72-stepper"><button aria-label="Quitar una persona" onClick={() => setPeople(Math.max(1, people - 1))}>−</button><span>{people}</span><button aria-label="Agregar una persona" onClick={() => setPeople(Math.min(8, people + 1))}>+</button></div><div className="p72-total"><small>Estimación</small><strong>€{total}</strong></div><Link href="/generator" className="p72-btn p72-btn-dark">Crear este plan ↗</Link></div>
      </section>

      <section className="p72-final"><p className="p72-kicker">Tu primera decisión puede ser ahora</p><h2>En una emergencia, el plan no debería empezar con una compra.</h2><p>Debería empezar sabiendo desde dónde salís.</p><Link href="/generator" className="p72-btn p72-btn-cream">Ubicarme y empezar ↗</Link></section>
      <footer><Link href="#inicio" className="p72-brand"><span>72</span>PLAN72</Link><p>Preparación clara para las primeras 72 horas.</p><small>© 2026 Plan72</small></footer>
    </main>
  );
}

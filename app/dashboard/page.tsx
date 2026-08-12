"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./dashboard.module.css";

const STORAGE_KEY = "plan72:workspace-v2";
const disasterOptions = ["Incendio forestal", "Inundación", "Terremoto", "Tsunami", "Conflicto o bombardeo"];
const tiers = [
  { id: "esencial", name: "Esencial", price: 239, autonomy: "Base 72 h", items: ["Agua y potabilización", "Abrigo", "Primeros auxilios", "Luz"] },
  { id: "preparada", name: "Preparada", price: 389, autonomy: "72 h + respaldo", items: ["Todo lo esencial", "Energía", "Cocina compacta", "Reparación"] },
  { id: "avanzada", name: "Avanzada", price: 549, autonomy: "Máxima cobertura", items: ["Todo lo anterior", "Protección ampliada", "Comunicaciones", "Módulos extra"] },
];
const addOns = [
  { id: "water", name: "Módulo de agua extra", price: 34, note: "+6 litros de capacidad" },
  { id: "power", name: "Batería de respaldo", price: 59, note: "20.000 mAh" },
  { id: "radio", name: "Radio de emergencia", price: 44, note: "FM, linterna y manivela" },
  { id: "warmth", name: "Módulo de abrigo", price: 48, note: "2 mantas y capas térmicas" },
];

type Point = { label: string; lat: number; lng: number };
type Workspace = {
  user: { email: string; name: string };
  location: { country: string; city: string; address: string; lat: number; lng: number };
  savedAddresses?: string[];
  route: Point[];
  disasters: string[];
  backpack: { id: string; name: string; basePrice: number; extras: string[] };
  people?: number;
  updatedAt: string;
};

const demo: Workspace = {
  user: { email: "ramiro@plan72.demo", name: "Ramiro" },
  location: { country: "España", city: "Barcelona", address: "Eixample, Barcelona", lat: 41.387, lng: 2.17 },
  savedAddresses: ["Eixample, Barcelona"],
  route: [
    { label: "Punto de partida", lat: 41.387, lng: 2.17 },
    { label: "Punto de decisión 1", lat: 41.399, lng: 2.192 },
    { label: "Zona segura preliminar", lat: 41.415, lng: 2.215 },
  ],
  disasters: ["Incendio forestal", "Inundación"],
  backpack: { id: "preparada", name: "Preparada", basePrice: 389, extras: [] }, people: 2,
  updatedAt: new Date().toISOString(),
};

export default function DashboardPage() {
  const [workspace, setWorkspace] = useState<Workspace>(demo);
  const [hydrated, setHydrated] = useState(false);
  const [section, setSection] = useState("overview");
  const [newAddress, setNewAddress] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Workspace;
        setWorkspace({ ...parsed, savedAddresses: parsed.savedAddresses?.length ? parsed.savedAddresses : [parsed.location.address] });
      } catch { setWorkspace(demo); }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...workspace, updatedAt: new Date().toISOString() }));
  }, [workspace, hydrated]);

  const total = useMemo(() => workspace.backpack.basePrice + addOns.filter((item) => workspace.backpack.extras.includes(item.id)).reduce((sum, item) => sum + item.price, 0), [workspace.backpack]);

  function toggleDisaster(name: string) {
    setWorkspace((current) => ({ ...current, disasters: current.disasters.includes(name) ? current.disasters.filter((item) => item !== name) : [...current.disasters, name] }));
  }
  function chooseTier(id: string) {
    const tier = tiers.find((item) => item.id === id)!;
    setWorkspace((current) => ({ ...current, backpack: { ...current.backpack, id: tier.id, name: tier.name, basePrice: tier.price } }));
  }
  function toggleExtra(id: string) {
    setWorkspace((current) => ({ ...current, backpack: { ...current.backpack, extras: current.backpack.extras.includes(id) ? current.backpack.extras.filter((item) => item !== id) : [...current.backpack.extras, id] } }));
  }
  function addAddress() {
    const value = newAddress.trim();
    if (!value) return;
    setWorkspace((current) => ({ ...current, savedAddresses: [...(current.savedAddresses ?? []), value] }));
    setNewAddress("");
  }

  const initial = workspace.user.name.charAt(0).toUpperCase();
  return <main className={styles.shell}>
    <aside className={styles.sidebar}>
      <Link href="/" className={styles.brand}><span>72</span>PLAN72</Link>
      <nav>
        <button className={section === "overview" ? styles.active : ""} onClick={() => setSection("overview")}><i>⌂</i> Resumen</button>
        <button className={section === "route" ? styles.active : ""} onClick={() => setSection("route")}><i>↗</i> Ruta de escape</button>
        <button className={section === "risks" ? styles.active : ""} onClick={() => setSection("risks")}><i>◎</i> Escenarios</button>
        <button className={section === "pack" ? styles.active : ""} onClick={() => setSection("pack")}><i>▣</i> Mi mochila</button>
      </nav>
      <div className={styles.sideStatus}><span/><div><small>PLAN GUARDADO</small><strong>Sincronizado en este dispositivo</strong></div></div>
      <Link href="/" className={styles.back}>← Volver a la landing</Link>
    </aside>

    <div className={styles.content}>
      <header className={styles.topbar}><div><span className={styles.breadcrumb}>MI PLAN / {workspace.location.city.toUpperCase()}</span><h1>Hola, {workspace.user.name}.</h1></div><div className={styles.user}><div><small>PLAN PERSONAL</small><strong>{workspace.location.city}, {workspace.location.country}</strong></div><span>{initial}</span></div></header>

      {section === "overview" && <section className={styles.page}>
        <div className={styles.heroPanel}><div><span className={styles.eyebrow}>PLAN ACTIVO · 72 HORAS</span><h2>Tu salida empieza en<br/><em>{workspace.location.address}.</em></h2><p>La ruta preliminar está lista. Completá los escenarios y el equipo para cerrar tu primera versión del plan.</p><button onClick={() => setSection("route")}>Revisar mi ruta <span>→</span></button></div><RouteVisual city={workspace.location.city} /></div>
        <div className={styles.metrics}><article><small>PUNTO DE PARTIDA</small><strong>{workspace.location.address}</strong><span>{workspace.location.city}, {workspace.location.country}</span></article><article><small>ESCENARIOS ACTIVOS</small><strong>{workspace.disasters.length}</strong><span>{workspace.disasters.slice(0, 2).join(" · ")}</span></article><article><small>MOCHILA SELECCIONADA</small><strong>{workspace.backpack.name}</strong><span>Configuración actual · €{total}</span></article></div>
        <div className={styles.overviewGrid}><article className={styles.next}><span>PRÓXIMO PASO RECOMENDADO</span><h3>Revisá el punto seguro y agregá una ruta alternativa.</h3><p>Un buen plan no depende de una sola salida.</p><button onClick={() => setSection("route")}>Abrir ruta →</button></article><article className={styles.readiness}><span>ESTADO DEL PLAN</span><div className={styles.ring}><strong>72%</strong></div><ul><li className={styles.done}>Ubicación definida</li><li className={styles.done}>Ruta preliminar</li><li>Ruta alternativa</li><li>Confirmar mochila</li></ul></article></div>
      </section>}

      {section === "route" && <section className={styles.page}>
        <div className={styles.titleRow}><div><span>RUTA DE ESCAPE</span><h2>Desde dónde salís y hacia dónde vas.</h2></div><button className={styles.primary}>Recalcular ruta</button></div>
        <div className={styles.routeGrid}><article className={styles.mapCard}><RouteVisual city={workspace.location.city} large /><div className={styles.mapOverlay}><span>RUTA PRELIMINAR</span><strong>6,8 km · 1 h 24 min a pie</strong></div></article><article className={styles.timeline}><span>ITINERARIO</span>{workspace.route.map((point, index) => <div key={point.label}><i>{index + 1}</i><p><strong>{point.label}</strong><small>{index === 0 ? workspace.location.address : index === workspace.route.length - 1 ? "Destino a confirmar" : "Reevaluar condiciones"}</small></p></div>)}</article></div>
        <article className={styles.addresses}><div><span>DIRECCIONES GUARDADAS</span><h3>Puntos que forman parte de tu plan.</h3></div><div className={styles.addressList}>{workspace.savedAddresses?.map((item, index) => <div key={`${item}-${index}`}><b>{index === 0 ? "Casa" : `Punto ${index + 1}`}</b><span>{item}</span><em>{index === 0 ? "ORIGEN" : "GUARDADO"}</em></div>)}</div><div className={styles.addAddress}><input value={newAddress} onChange={(event) => setNewAddress(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addAddress()} placeholder="Agregar otro punto de encuentro"/><button onClick={addAddress}>Agregar <span>↵</span></button></div></article>
      </section>}

      {section === "risks" && <section className={styles.page}>
        <div className={styles.titleRow}><div><span>ESCENARIOS</span><h2>¿Para qué necesitás estar preparado?</h2><p>Elegí todos los escenarios que deben modificar tu ruta y tu equipo.</p></div><strong className={styles.counter}>{workspace.disasters.length} activos</strong></div>
        <div className={styles.disasterGrid}>{disasterOptions.map((name, index) => { const selected = workspace.disasters.includes(name); return <button key={name} className={selected ? styles.selectedRisk : ""} onClick={() => toggleDisaster(name)}><span>{["♨","≈","⌁","≋","◉"][index]}</span><div><strong>{name}</strong><small>{["Humo, viento y salidas bloqueadas","Zonas bajas y cortes de movilidad","Daño estructural y réplicas","Evacuación vertical y costa","Refugio y rutas de baja exposición"][index]}</small></div><i>{selected ? "✓" : "+"}</i></button>})}</div>
      </section>}

      {section === "pack" && <section className={styles.page}>
        <div className={styles.titleRow}><div><span>MI MOCHILA</span><h2>Equipo que responde a tu plan.</h2><p>Partí de una versión funcional y sumá sólo lo que tu realidad necesita.</p></div><div className={styles.total}><small>TOTAL ACTUAL</small><strong>€{total}</strong></div></div>
        <div className={styles.packLayout}><div><div className={styles.tiers}>{tiers.map((tier) => <button key={tier.id} className={workspace.backpack.id === tier.id ? styles.selectedTier : ""} onClick={() => chooseTier(tier.id)}><span>{workspace.backpack.id === tier.id ? "✓" : ""}</span><div><small>{tier.autonomy}</small><strong>{tier.name}</strong><p>{tier.items.join(" · ")}</p></div><b>€{tier.price}</b></button>)}</div><h3 className={styles.customTitle}>Personalizá tu configuración</h3><div className={styles.addons}>{addOns.map((item) => { const selected = workspace.backpack.extras.includes(item.id); return <button key={item.id} className={selected ? styles.extraSelected : ""} onClick={() => toggleExtra(item.id)}><i>{selected ? "✓" : "+"}</i><div><strong>{item.name}</strong><small>{item.note}</small></div><b>+€{item.price}</b></button>})}</div></div><aside className={styles.packPreview}><span>CONFIGURACIÓN ACTUAL</span><Image src="/Plan72/plan72-kit-transparent-v2.webp" alt="Mochila Plan72 configurada" width={700} height={700} unoptimized/><h3>Plan72 {workspace.backpack.name}</h3><p>Para {workspace.people ?? 2} {(workspace.people ?? 2) === 1 ? "persona" : "personas"} · {workspace.disasters.length} escenarios activos</p><ul><li>Base {workspace.backpack.name}</li>{workspace.backpack.extras.map((id) => <li key={id}>{addOns.find((item) => item.id === id)?.name}</li>)}</ul><div><span>Total estimado</span><strong>€{total}</strong></div></aside></div>
      </section>}
    </div>
  </main>;
}

function RouteVisual({ city, large = false }: { city: string; large?: boolean }) {
  return <div className={`${styles.routeVisual} ${large ? styles.routeLarge : ""}`}><div className={styles.mapGrid}/><svg viewBox="0 0 620 360" aria-hidden="true"><path className={styles.road} d="M-30 300 C100 245 105 110 240 140 S390 310 680 75"/><path className={styles.routeLine} d="M70 278 C145 235 137 150 242 156 S370 277 545 112"/><circle cx="70" cy="278" r="12"/><circle cx="242" cy="156" r="8"/><circle cx="545" cy="112" r="12"/></svg><span className={styles.mapCity}>{city.toUpperCase()}</span><span className={styles.startLabel}>SALIDA</span><span className={styles.safeLabel}>ZONA SEGURA</span></div>;
}

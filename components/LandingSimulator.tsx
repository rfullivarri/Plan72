"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Globe3D from "@/components/Globe3D";
import { getCountryOptions, resolveCountryIsoCode } from "@/lib/countryData";
import { geocodeCitySuggestions, type GeocodeResult } from "@/lib/geocode";

const display = new Intl.DisplayNames(["es"], { type: "region" });

export default function LandingSimulator() {
  const countries = useMemo(() => getCountryOptions().map(c => ({...c, label: c.isoCode ? display.of(c.isoCode) || c.name : c.name})).sort((a,b) => a.label.localeCompare(b.label)), []);
  const [stage, setStage] = useState<1|2|3>(1);
  const [country, setCountry] = useState("España");
  const [countryName, setCountryName] = useState("España");
  const [city, setCity] = useState("");
  const [selectedCity, setSelectedCity] = useState<GeocodeResult | null>(null);
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function confirmCountry() {
    const match = countries.find(c => c.label.toLocaleLowerCase() === country.toLocaleLowerCase() || c.name.toLocaleLowerCase() === country.toLocaleLowerCase());
    if (!match) { setError("Elegí un país de la lista."); return; }
    setCountryName(match.label); setCountry(match.label); setStage(2); setError(""); setCity(""); setSelectedCity(null); setResults([]);
  }
  async function searchCity(value: string) {
    setCity(value); setSelectedCity(null); setError("");
    if (value.trim().length < 2) { setResults([]); return; }
    setBusy(true);
    try {
      const iso = resolveCountryIsoCode(countryName);
      setResults(await geocodeCitySuggestions(`${value}, ${countryName}`, { countryCodes: iso?.toLowerCase(), limit: 6 }));
    } catch { setError("No pudimos buscar ahora. Probá de nuevo en unos segundos."); }
    finally { setBusy(false); }
  }
  function chooseCity(hit: GeocodeResult) {
    const name = hit.address?.city || hit.address?.town || hit.address?.village || hit.displayName.split(",")[0];
    setCity(name); setSelectedCity(hit); setResults([]); setStage(3);
  }

  return <section className="p72-simulator" id="simulador">
    <div className="p72-sim-head"><p className="p72-kicker">Simulación de ruta</p><h2>Empezá por donde estás.</h2><p>Elegí cualquier país y ciudad del mundo. El globo usa la misma lógica del simulador original.</p></div>
    <div className="p72-sim-shell">
      <div className="p72-sim-panel">
        <div className="p72-progress"><span>PASO {stage} DE 3</span><i className={stage >= 1 ? "on" : ""}/><i className={stage >= 2 ? "on" : ""}/><i className={stage >= 3 ? "on" : ""}/></div>
        {stage === 1 && <><p className="p72-kicker">01 · País</p><h3>¿Desde qué país salís?</h3><p>Elegilo para ubicar el contexto de tu ruta.</p><label>País<input list="p72-countries" value={country} onChange={e => setCountry(e.target.value)} onKeyDown={e => e.key === "Enter" && confirmCountry()}/><datalist id="p72-countries">{countries.map(c => <option key={`${c.name}-${c.isoCode}`} value={c.label}/>)}</datalist></label><button onClick={confirmCountry} className="p72-btn p72-btn-cream">Confirmar país</button></>}
        {stage === 2 && <><p className="p72-kicker">02 · Ciudad</p><h3>Ahora encontrá tu ciudad.</h3><p>Buscala dentro de {countryName}. Seleccioná el resultado correcto para acercarnos.</p><label>Ciudad<input autoFocus value={city} onChange={e => searchCity(e.target.value)} placeholder="Escribí al menos 2 letras"/></label>{busy && <small>Buscando…</small>}<div className="p72-suggestions">{results.map(hit => <button key={`${hit.lat}-${hit.lng}`} onClick={() => chooseCity(hit)}><strong>{hit.displayName.split(",")[0]}</strong><small>{hit.displayName}</small></button>)}</div><button className="p72-back" onClick={() => setStage(1)}>← Cambiar país</button></>}
        {stage === 3 && selectedCity && <><p className="p72-kicker">03 · Punto de partida</p><h3>{city} ya está en el mapa.</h3><p>En el simulador completo vas a precisar la dirección y elegir el escenario de emergencia.</p><div className="p72-selected"><span>✓</span><p><small>Ubicación encontrada</small>{city}, {countryName}</p></div><Link href="/generator" className="p72-btn p72-btn-cream">Continuar mi ruta ↗</Link><button className="p72-back" onClick={() => setStage(2)}>← Cambiar ciudad</button></>}
        {error && <p className="p72-error" role="alert">{error}</p>}
      </div>
      <div className="p72-globe"><Globe3D selectedCountry={countryName} selectedCity={selectedCity ? {name: city, lat: selectedCity.lat, lng: selectedCity.lng} : undefined}/><div className="p72-globe-label"><strong>{selectedCity ? city : countryName}</strong><span>{selectedCity ? "CIUDAD LOCALIZADA" : "PAÍS SELECCIONADO"} · ARRASTRÁ PARA ROTAR</span></div></div>
    </div>
  </section>;
}

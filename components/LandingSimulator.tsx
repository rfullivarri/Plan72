"use client";

import { FormEvent, KeyboardEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Globe3D from "@/components/Globe3D";
import CityMap from "@/components/CityMap";
import { getCountryOptions, resolveCountryIsoCode } from "@/lib/countryData";
import { geocodeAddress, geocodeCitySuggestions, type GeocodeResult } from "@/lib/geocode";

const display = new Intl.DisplayNames(["es"], { type: "region" });
const STORAGE_KEY = "plan72:workspace-v2";
type Stage = 1 | 2 | 3 | 4;

export default function LandingSimulator({ backpack, people }: { backpack: { id: string; name: string; basePrice: number }; people: number }) {
  const router = useRouter();
  const countries = useMemo(() => getCountryOptions().map((item) => ({ ...item, label: item.isoCode ? display.of(item.isoCode) || item.name : item.name })).sort((a, b) => a.label.localeCompare(b.label)), []);
  const [stage, setStage] = useState<Stage>(1);
  const [country, setCountry] = useState("España");
  const [countryName, setCountryName] = useState("España");
  const [city, setCity] = useState("");
  const [selectedCity, setSelectedCity] = useState<GeocodeResult | null>(null);
  const [cityResults, setCityResults] = useState<GeocodeResult[]>([]);
  const [address, setAddress] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<GeocodeResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);

  function confirmCountry() {
    const normalized = country.toLocaleLowerCase();
    const match = countries.find((item) => item.label.toLocaleLowerCase() === normalized || item.name.toLocaleLowerCase() === normalized);
    if (!match) return setError("Elegí un país de la lista para continuar.");
    setCountryName(match.label); setCountry(match.label); setStage(2); setCity(""); setSelectedCity(null); setCityResults([]); setError("");
  }

  async function searchCity(value: string) {
    setCity(value); setSelectedCity(null); setError("");
    if (value.trim().length < 2) return setCityResults([]);
    setBusy(true);
    try {
      const iso = resolveCountryIsoCode(countryName);
      setCityResults(await geocodeCitySuggestions(`${value}, ${countryName}`, { countryCodes: iso?.toLowerCase(), limit: 6 }));
    } catch { setError("No pudimos buscar ahora. Probá de nuevo en unos segundos."); }
    finally { setBusy(false); }
  }

  function chooseCity(hit: GeocodeResult) {
    const name = hit.address?.city || hit.address?.town || hit.address?.village || hit.displayName.split(",")[0];
    setCity(name); setSelectedCity(hit); setCityResults([]); setAddress(""); setSelectedAddress(null); setStage(3); setError("");
  }

  async function resolveAddress() {
    if (!selectedCity || address.trim().length < 3) return setError("Escribí una dirección aproximada para ubicar tu punto de partida.");
    setBusy(true); setError("");
    try {
      const iso = resolveCountryIsoCode(countryName);
      const results = await geocodeAddress(`${address}, ${city}, ${countryName}`, { countryCodes: iso?.toLowerCase(), limit: 1 });
      setSelectedAddress(results[0] ?? { ...selectedCity, displayName: `${address}, ${city}, ${countryName}` });
      setStage(4);
    } catch {
      setSelectedAddress({ ...selectedCity, displayName: `${address}, ${city}, ${countryName}` }); setStage(4);
    } finally { setBusy(false); }
  }

  function handleCityEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (cityResults[0]) chooseCity(cityResults[0]);
    else if (selectedCity) setStage(3);
  }

  function saveWorkspace(email: string) {
    if (!selectedCity || !selectedAddress) return;
    const route = [
      { label: "Punto de partida", lat: selectedAddress.lat, lng: selectedAddress.lng },
      { label: "Punto de decisión 1", lat: selectedAddress.lat + 0.012, lng: selectedAddress.lng + 0.022 },
      { label: "Zona segura preliminar", lat: selectedAddress.lat + 0.028, lng: selectedAddress.lng + 0.045 },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      user: { email, name: email.split("@")[0] || "Ramiro" },
      location: { country: countryName, city, address, lat: selectedAddress.lat, lng: selectedAddress.lng },
      route, disasters: ["Incendio forestal", "Inundación"],
      backpack: { ...backpack, extras: [] }, people,
      updatedAt: new Date().toISOString(),
    }));
    router.push("/dashboard");
  }

  return <section className="p72-simulator" id="simulador">
    <div className="p72-sim-head"><div><p className="p72-kicker">Simulación de ruta</p><h2>Tu plan empieza en un punto real.</h2></div><p>Ubicá tu ciudad, marcá una dirección aproximada y construí una primera salida sin abandonar esta página.</p></div>
    <div className="p72-sim-shell">
      <div className="p72-sim-panel">
        <div className="p72-progress"><span>PASO {stage} DE 4</span>{[1, 2, 3, 4].map((step) => <i key={step} className={stage >= step ? "on" : ""} />)}</div>
        {stage === 1 && <><p className="p72-kicker">01 · País</p><h3>¿Desde qué país salís?</h3><p>Esto define el contexto inicial del plan.</p><label>País<input autoFocus list="p72-countries" value={country} onChange={(event) => setCountry(event.target.value)} onKeyDown={(event) => event.key === "Enter" && confirmCountry()} /><datalist id="p72-countries">{countries.map((item) => <option key={`${item.name}-${item.isoCode}`} value={item.label} />)}</datalist></label><button onClick={confirmCountry} className="p72-btn p72-btn-cream">Confirmar país <span>↵</span></button></>}
        {stage === 2 && <><p className="p72-kicker">02 · Ciudad</p><h3>Encontrá tu ciudad.</h3><p>Al seleccionarla, el globo se convierte en un mapa urbano.</p><label>Ciudad<input autoFocus value={city} onChange={(event) => searchCity(event.target.value)} onKeyDown={handleCityEnter} placeholder="Ej. Barcelona" autoComplete="off" /></label>{busy && <small className="p72-searching">Buscando ciudad…</small>}<div className="p72-suggestions">{cityResults.map((hit) => <button key={`${hit.lat}-${hit.lng}`} onClick={() => chooseCity(hit)}><strong>{hit.displayName.split(",")[0]}</strong><small>{hit.displayName}</small></button>)}</div><button className="p72-back" onClick={() => setStage(1)}>← Cambiar país</button></>}
        {stage === 3 && selectedCity && <><p className="p72-kicker">03 · Punto de partida</p><h3>¿Desde dónde saldrías?</h3><p>No hace falta que sea exacta. Usamos la dirección para anclar la simulación.</p><label>Dirección aproximada<input autoFocus value={address} onChange={(event) => setAddress(event.target.value)} onKeyDown={(event) => event.key === "Enter" && resolveAddress()} placeholder="Calle y número aproximado" /></label><button onClick={resolveAddress} disabled={busy} className="p72-btn p72-btn-cream">{busy ? "Ubicando…" : "Confirmar dirección"} <span>↵</span></button><button className="p72-back" onClick={() => setStage(2)}>← Cambiar ciudad</button></>}
        {stage === 4 && selectedAddress && <><p className="p72-kicker">04 · Vista preliminar</p><h3>Tu punto ya está conectado.</h3><p>Calcularemos alternativas y puntos de decisión dentro de tu panel.</p><div className="p72-selected"><span>✓</span><p><small>Punto de partida</small>{address}, {city}</p></div><button onClick={() => setLoginOpen(true)} className="p72-btn p72-btn-lime">Calcular mi ruta <span>→</span></button><button className="p72-back" onClick={() => setStage(3)}>← Ajustar dirección</button></>}
        {error && <p className="p72-error" role="alert">{error}</p>}
        <p className="p72-enter-hint"><kbd>Enter ↵</kbd> también avanza</p>
      </div>
      <div className="p72-map-stage">{selectedCity && stage >= 3 ? <CityMap city={city} center={{ lat: selectedCity.lat, lng: selectedCity.lng }} boundingBox={selectedCity.boundingBox} address={selectedAddress ? { label: address, lat: selectedAddress.lat, lng: selectedAddress.lng } : null} /> : <div className="p72-globe"><Globe3D selectedCountry={countryName} selectedCity={selectedCity ? { name: city, lat: selectedCity.lat, lng: selectedCity.lng } : undefined} /><div className="p72-globe-label"><strong>{selectedCity ? city : countryName}</strong><span>{selectedCity ? "CIUDAD LOCALIZADA" : "EXPLORÁ EL MAPA"}</span></div></div>}</div>
    </div>
    {loginOpen && <MockLogin onClose={() => setLoginOpen(false)} onContinue={saveWorkspace} />}
  </section>;
}

function MockLogin({ onClose, onContinue }: { onClose: () => void; onContinue: (email: string) => void }) {
  const [email, setEmail] = useState("ramiro@plan72.demo");
  function submit(event: FormEvent) { event.preventDefault(); onContinue(email); }
  return <div className="p72-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="p72-login" role="dialog" aria-modal="true" aria-labelledby="p72-login-title"><button className="p72-login-close" onClick={onClose} aria-label="Cerrar">×</button><span className="p72-login-mark">72</span><p className="p72-kicker">Guardá tu progreso</p><h3 id="p72-login-title">Entrá para calcular tu ruta.</h3><p>Esta pantalla es una demostración. No se crea ninguna cuenta real.</p><form onSubmit={submit}><label>Email<input autoFocus type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><button className="p72-btn p72-btn-dark" type="submit">Continuar al panel <span>→</span></button></form><button className="p72-google" onClick={() => onContinue("demo.google@plan72.app")}><b>G</b> Continuar con Google <em>Demo</em></button></div></div>;
}

"use client";

import CardStack from "@/components/CardStack";
import Globe3D from "@/components/Globe3D";
import MascotPanel from "@/components/MascotPanel";
import PdfExportButton from "@/components/PdfExportButton";
import PrintDeck from "@/components/PrintDeck";
import { usePlan } from "@/components/PlanContext";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

const MapCorridor = dynamic(() => import("@/components/MapCorridor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 w-full items-center justify-center rounded-xl border-2 border-ink bg-[rgba(255,255,255,0.6)] text-xs font-mono text-olive">
      Loading map…
    </div>
  ),
});

export default function ResultsPage() {
  const { persistProfile, lastSavedAt, lowInkMode, toggleLowInkMode, input, plan } = usePlan();
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const savedLabel = useMemo(() => {
    if (!lastSavedAt) return "Auto-save pendiente";
    return new Date(lastSavedAt).toLocaleString();
  }, [lastSavedAt]);

  const handleSave = () => {
    persistProfile();
    setSaveMessage(`Perfil guardado · ${new Date().toLocaleTimeString()}`);
  };

  return (
    <>
      <main className="screen-only mx-auto max-w-6xl px-6 py-10 space-y-8">
        <header className="flex flex-col gap-2">
          <p className="font-mono text-xs text-olive tracking-[0.25em]">RESULTS</p>
          <h1 className="font-display text-4xl">Generated Protocol</h1>
          <p className="text-sm text-ink/80">
            Una carta de mapa centralizada con rutas y nodos, más una tarjeta por escenario con bullets STG0..STG3 y bloque do/don&apos;t.
            Exporta en A6 o A7 para imprimir y laminar.
          </p>
        </header>

        <div className="flex flex-wrap gap-3">
          <PdfExportButton />
          <button className="ink-button">Copy Codex JSON</button>
          <button className="ink-button" onClick={handleSave}>
            Save Profile
          </button>
          <button
            className={`ink-button ${lowInkMode ? "bg-[rgba(74,90,58,0.12)]" : ""}`}
            onClick={toggleLowInkMode}
            aria-pressed={lowInkMode}
          >
            Low Ink: {lowInkMode ? "ON" : "OFF"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-mono text-olive">
          <span className="rounded-lg border-2 border-dashed border-ink px-3 py-1 bg-[rgba(255,255,255,0.65)]">{savedLabel}</span>
          {saveMessage && (
            <span className="rounded-lg border-2 border-ink px-3 py-1 bg-[rgba(179,90,42,0.12)]">{saveMessage}</span>
          )}
        </div>

        <section className="grid lg:grid-cols-[1.3fr,0.7fr] gap-6 items-start">
          <CardStack />
          <div className="space-y-4">
            <div className="card-frame p-4 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="font-display text-xl">Map overview</div>
                  <p className="text-sm text-ink/80">Variantes 2D y 3D apiladas en una sola carta.</p>
                </div>
                <span className="rounded-full border-2 border-ink px-3 py-1 text-xs font-mono uppercase text-olive">
                  {plan.mapCard.map.intent}
                </span>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-olive">2D corridor</p>
                  <MapCorridor embedded showHeader={false} showResourceNodes />
                </div>
                <div className="space-y-2">
                  <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-olive">Globe3D</p>
                  <Globe3D
                    selectedCountry={input.country}
                    selectedCity={{ name: input.city, lat: input.start.lat, lng: input.start.lng }}
                  />
                </div>
              </div>
            </div>
            <MascotPanel />
          </div>
        </section>
      </main>
      <PrintDeck />
    </>
  );
}

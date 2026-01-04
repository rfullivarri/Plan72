"use client";

import CardStack from "@/components/CardStack";
import MapCorridor from "@/components/MapCorridor";
import MascotPanel from "@/components/MascotPanel";
import PdfExportButton from "@/components/PdfExportButton";
import PrintDeck from "@/components/PrintDeck";
import { usePlan } from "@/components/PlanContext";
import { useMemo, useState } from "react";

export default function ResultsPage() {
  const { persistProfile, lastSavedAt, lowInkMode, toggleLowInkMode } = usePlan();
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
            Una carta por escenario con ruta de escape, mapa mínimo, bullets STG0..STG3 y bloque do/don&apos;t. Exporta en A6 o A7
            para imprimir y laminar.
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
            <MapCorridor />
            <MascotPanel />
          </div>
        </section>
      </main>
      <PrintDeck />
    </>
  );
}

import CardStack from "@/components/CardStack";
import MapCorridor from "@/components/MapCorridor";
import MascotPanel from "@/components/MascotPanel";
import PdfExportButton from "@/components/PdfExportButton";

export default function ResultsPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
      <header className="flex flex-col gap-2">
        <p className="font-mono text-xs text-olive tracking-[0.25em]">RESULTS</p>
        <h1 className="font-display text-4xl">Generated Protocol</h1>
        <p className="text-sm text-ink/80">Printable stacks and export actions.</p>
      </header>

      <div className="flex flex-wrap gap-3">
        <PdfExportButton />
        <button className="ink-button">Copy Codex JSON</button>
        <button className="ink-button">Save Profile</button>
      </div>

      <section className="grid lg:grid-cols-[1.3fr,0.7fr] gap-6 items-start">
        <CardStack />
        <div className="space-y-4">
          <MapCorridor />
          <MascotPanel />
        </div>
      </section>
    </main>
  );
}

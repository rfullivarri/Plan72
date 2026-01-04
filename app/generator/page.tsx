import CardPreview from "@/components/CardPreview";
import MascotPanel from "@/components/MascotPanel";
import ScenarioSelector from "@/components/ScenarioSelector";
import StageTimeline from "@/components/StageTimeline";

export default function GeneratorPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
      <header className="flex flex-col gap-2">
        <p className="font-mono text-xs text-olive tracking-[0.25em]">WIZARD</p>
        <h1 className="font-display text-4xl">Protocol Generator</h1>
        <p className="text-sm text-ink/80">5-step flow with manual tab navigation will live here.</p>
      </header>

      <section className="grid lg:grid-cols-[1.3fr,0.7fr] gap-6">
        <div className="space-y-4">
          <ScenarioSelector />
          <StageTimeline />
        </div>
        <div className="space-y-4">
          <CardPreview />
          <MascotPanel />
        </div>
      </section>
    </main>
  );
}

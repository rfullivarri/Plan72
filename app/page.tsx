import Link from "next/link";
import CardPreview from "@/components/CardPreview";
import MascotPanel from "@/components/MascotPanel";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12 space-y-12">
      <section className="grid lg:grid-cols-[2fr,1fr] gap-8 items-start">
        <div className="space-y-6">
          <p className="text-sm font-mono tracking-[0.3em] text-olive">72H PROTOCOL</p>
          <h1 className="font-display text-5xl leading-tight">Generate a 72h Protocol</h1>
          <p className="text-lg text-ink/80 max-w-2xl">
            Plan72 helps you prepare staged actions, routes, and resource nodes with a retro civil defense
            aesthetic. Build printable A6/A7 cards for quick recall.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link className="ink-button" href="/generator">
              Start Generator
            </Link>
            <Link className="ink-button" href="#how">
              How it works
            </Link>
          </div>
        </div>
        <div className="space-y-4">
          <CardPreview />
          <MascotPanel />
        </div>
      </section>

      <section id="how" className="grid md:grid-cols-3 gap-4">
        {["Set location + level", "Pick scenario + moment", "Review + export PDF"].map((step, index) => (
          <div key={step} className="card-frame p-4 space-y-2">
            <div className="font-mono text-xs text-olive">STEP {index + 1}</div>
            <h3 className="font-display text-2xl">{step}</h3>
            <p className="text-sm text-ink/80">
              Scaffold for the upcoming wizard flow following the TVA-style tab navigation.
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import "./landing.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { PlanProvider } from "@/components/PlanContext";

export const metadata: Metadata = {
  title: "Plan72 | Tu ruta y mochila para las primeras 72 horas",
  description: "Planificá una salida clara y el equipo necesario para sostenerla durante las primeras 72 horas.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-paper text-ink">
        <PlanProvider>
          <div className="min-h-screen bg-paper text-ink">{children}</div>
        </PlanProvider>
      </body>
    </html>
  );
}

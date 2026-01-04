import type { Metadata } from "next";
import "./globals.css";
import { PlanProvider } from "@/components/PlanContext";

export const metadata: Metadata = {
  title: "Plan72 | 72h Protocol Generator",
  description: "Retro civil protocol planner for 72-hour readiness.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-paper text-ink">
        <PlanProvider>
          <div className="min-h-screen bg-paper text-ink">{children}</div>
        </PlanProvider>
      </body>
    </html>
  );
}

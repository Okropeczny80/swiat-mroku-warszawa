import type { Metadata } from "next";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Świat Mroku — Warszawa 1997",
  description: "Archiwum kroniki Warszawy 1997",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pl"><body>{children}</body></html>;
}

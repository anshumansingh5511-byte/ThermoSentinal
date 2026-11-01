import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ThermoSentinel - AI Thermal Source Detection",
  description:
    "AI Detection & Classification of Industrial Fires / Thermal Sources from NASA FIRMS satellite data.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="bg-[#080c14] text-slate-100 antialiased selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}


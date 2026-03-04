import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Visa Maps — See Where Your Passport Takes You",
  description:
    "Interactive world map showing visa requirements for your passport. Color-coded visa-free, eVisa, visa-on-arrival, and visa-required countries with direct flight and visa links.",
  openGraph: {
    title: "Visa Maps — See Where Your Passport Takes You",
    description:
      "Interactive world map showing visa requirements for your passport.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Visa Maps — See Where Your Passport Takes You",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://unpkg.com/maplibre-gl@4/dist/maplibre-gl.css"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

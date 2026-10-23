import type { Metadata } from "next";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

const origin = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://visa-maps.vercel.app");
const title = "Visa Maps | Passport entry rules with official sources";
const description = "Explore source-checked passport entry rules on a world map. Read conditions, official sources and checked dates. Destinations without reviewed rules show No data.";
export const metadata: Metadata = {
  metadataBase: origin,
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description, type: "website", url: "/", siteName: "Visa Maps", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Visa Maps, passport entry rules with official sources" }] },
  twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}

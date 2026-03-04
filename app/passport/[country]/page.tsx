import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PassportHero } from "@/components/seo/passport-hero";
import { VisaSummaryTable } from "@/components/seo/visa-summary-table";
import type { Passport, VisaRulesMap, VisaCategory } from "@/lib/constants";
import { VISA_CATEGORIES } from "@/lib/constants";
import Link from "next/link";
import fs from "fs";
import path from "path";

function getPassports(): Passport[] {
  const filePath = path.join(process.cwd(), "public/data/passports.json");
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function getRules(): VisaRulesMap {
  const filePath = path.join(process.cwd(), "public/data/visa-rules.json");
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function generateStaticParams() {
  const passports = getPassports();
  return passports.map((p) => ({ country: p.code.toLowerCase() }));
}

export function generateMetadata({
  params,
}: {
  params: { country: string };
}): Metadata {
  const passports = getPassports();
  const passport = passports.find(
    (p) => p.code.toLowerCase() === params.country.toLowerCase()
  );
  if (!passport) return {};

  const rules = getRules();
  const destinations = rules[passport.code] ?? {};
  const visaFreeCount = Object.values(destinations).filter(
    (r) => r.category === "visa_free"
  ).length;

  const title = `${passport.name} Passport Visa Map — ${visaFreeCount} Visa-Free Countries`;
  const description = `See where a ${passport.name} passport can take you. ${visaFreeCount} visa-free countries, eVisa options, and visa-on-arrival destinations on an interactive map.`;

  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function PassportPage({
  params,
}: {
  params: { country: string };
}) {
  const passports = getPassports();
  const passport = passports.find(
    (p) => p.code.toLowerCase() === params.country.toLowerCase()
  );
  if (!passport) notFound();

  const rules = getRules();
  const destinations = rules[passport.code] ?? {};

  const counts: Record<VisaCategory, number> = {
    visa_free: 0,
    evisa: 0,
    visa_on_arrival: 0,
    visa_required: 0,
  };
  for (const r of Object.values(destinations)) {
    counts[r.category]++;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-bold text-lg">
            Visa Maps
          </Link>
          <Link
            href={`/?p=${passport.code}`}
            className="text-sm text-blue-600 hover:underline"
          >
            Open Interactive Map
          </Link>
        </div>
      </nav>

      <PassportHero passport={passport} counts={counts} />

      <div className="max-w-3xl mx-auto px-4 pb-16">
        {VISA_CATEGORIES.map((cat) => (
          <VisaSummaryTable key={cat} rules={destinations} category={cat} />
        ))}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Visa Maps",
                  item: "/",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: `${passport.name} Passport`,
                  item: `/passport/${passport.code.toLowerCase()}`,
                },
              ],
            }),
          }}
        />
      </div>
    </div>
  );
}

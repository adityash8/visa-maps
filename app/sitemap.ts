import type { MetadataRoute } from "next";
import passports from "@/public/data/passports.json";
import rules from "@/public/data/visa-rules.json";
import { isReviewedVisaRule } from "@/lib/visa-data";
import type { VisaRulesMap } from "@/lib/constants";
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://visa-maps.vercel.app";
  const reviewed = rules as VisaRulesMap;
  return [{ url: new URL("/", origin).href }, ...passports.filter(({ code }) => Object.values(reviewed[code] ?? {}).some(isReviewedVisaRule)).map(({ code }) => ({ url: new URL(`/passport/${code.toLowerCase()}`, origin).href }))];
}

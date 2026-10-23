import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { PassportHero } from "@/components/seo/passport-hero";
import { VisaSummaryTable } from "@/components/seo/visa-summary-table";
import { VISA_CATEGORIES, type VisaRulesMap } from "@/lib/constants";
import { getVisaRule, countByCategory, isReviewedVisaRule } from "@/lib/visa-data";
import { destinations } from "@/lib/destinations";
import passports from "@/public/data/passports.json";
import sourceReview from "@/public/data/source-review.json";
import rawRules from "@/public/data/visa-rules.json";
const rules = rawRules as VisaRulesMap;
export function generateStaticParams() { return passports.map(({ code }) => ({ country: code.toLowerCase() })); }
export async function generateMetadata({ params }: { params: Promise<{ country: string }> }): Promise<Metadata> {
  const { country } = await params;
  const passport = passports.find(({ code }) => code.toLowerCase() === country.toLowerCase());
  if (!passport) return { title: "Passport not found", robots: { index: false } };
  const title = `${passport.name} passport entry rules | Visa Maps`;
  const description = `Source-checked entry rules for ${passport.name} ordinary passports, with conditions, official sources and checked dates. Unknown destinations are marked No data.`;
  const hasRules = Object.values(rules[passport.code] ?? {}).some(isReviewedVisaRule);
  return { title, description, alternates: { canonical: `/passport/${passport.code.toLowerCase()}` }, robots: { index: hasRules, follow: true }, openGraph: { title, description, url: `/passport/${passport.code.toLowerCase()}` }, twitter: { card: "summary_large_image", title, description } };
}
export default async function PassportPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const passport = passports.find(({ code }) => code.toLowerCase() === country.toLowerCase());
  if (!passport) notFound();
  const reviewed = Object.fromEntries(Object.entries(rules[passport.code] ?? {}).filter(([code, rule]) => code !== passport.code && isReviewedVisaRule(rule)));
  const unknown = destinations.filter(({ code }) => code !== passport.code && !getVisaRule(rules, passport.code, code));
  return <main className="seo-page"><nav className="seo-nav" aria-label="Passport guide"><Link href="/">Visa Maps</Link><Link className="button button-primary" href={`/?p=${passport.code}`}>Open Interactive Map</Link></nav><PassportHero passport={passport} counts={countByCategory(rules, passport.code)} />{VISA_CATEGORIES.map((category) => <VisaSummaryTable key={category} rules={reviewed} category={category} passportCode={passport.code} />)}<section className="summary-section"><h2>No data ({unknown.length})</h2><p>These destinations do not yet have a source-checked record for this passport.</p>{sourceReview.excludedPairs.filter((pair) => pair.passport === passport.code).map((pair) => <p key={pair.destination} className="stale-label">{pair.reason} <a href={pair.sourceUrl} target="_blank" rel="noopener noreferrer">Official entry restriction</a></p>)}<ul className="unknown-destinations">{unknown.map(({ code, name }) => <li key={code}><Link href={`/?p=${passport.code}&destination=${code}`}>{name}</Link></li>)}</ul></section><p className="travel-disclaimer">Check official sources before travel. Entry is not guaranteed.</p></main>;
}

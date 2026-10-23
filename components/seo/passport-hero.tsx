import type { Passport, VisaCategory } from "@/lib/constants";
import { VISA_CATEGORIES, VISA_LABELS } from "@/lib/constants";
interface PassportHeroProps { passport: Passport; counts: Record<VisaCategory, number>; }
export function PassportHero({ passport, counts }: PassportHeroProps) {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  return <header className="passport-intro"><h1>{passport.name} passport entry rules</h1><p>Browse source-checked information for ordinary passport holders. {total} destinations have reviewed records; the rest are marked No data. Purpose, residence, passport type and travel history can change the requirements.</p><dl className="passport-counts">{VISA_CATEGORIES.map((category) => <div key={category}><dt>{VISA_LABELS[category]}</dt><dd>{counts[category]}</dd></div>)}</dl><p className="travel-disclaimer">Check official sources before travel. Entry is not guaranteed.</p></header>;
}

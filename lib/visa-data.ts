import type { Passport, VisaRule, VisaRulesMap, VisaCategory } from "./constants";

let passportsCache: Passport[] | null = null;
let rulesCache: VisaRulesMap | null = null;

export async function loadPassports(): Promise<Passport[]> {
  if (passportsCache) return passportsCache;
  const res = await fetch("/data/passports.json");
  passportsCache = await res.json();
  return passportsCache!;
}

export async function loadRules(): Promise<VisaRulesMap> {
  if (rulesCache) return rulesCache;
  const res = await fetch("/data/visa-rules.json");
  rulesCache = await res.json();
  return rulesCache!;
}

export function getVisaRule(
  rules: VisaRulesMap,
  passportCode: string,
  destinationCode: string
): VisaRule | null {
  return rules[passportCode]?.[destinationCode] ?? null;
}

const CATEGORY_RANK: Record<VisaCategory, number> = {
  visa_free: 0,
  visa_on_arrival: 1,
  evisa: 2,
  visa_required: 3,
};

export function getDualVisaRule(
  rules: VisaRulesMap,
  passport1: string,
  passport2: string,
  destinationCode: string
): VisaRule | null {
  const r1 = getVisaRule(rules, passport1, destinationCode);
  const r2 = getVisaRule(rules, passport2, destinationCode);
  if (!r1) return r2;
  if (!r2) return r1;
  return CATEGORY_RANK[r1.category] <= CATEGORY_RANK[r2.category] ? r1 : r2;
}

export function countByCategory(
  rules: VisaRulesMap,
  passportCode: string,
  passport2?: string | null
): Record<VisaCategory, number> {
  const counts: Record<VisaCategory, number> = {
    visa_free: 0,
    evisa: 0,
    visa_on_arrival: 0,
    visa_required: 0,
  };

  const destinations = rules[passportCode];
  if (!destinations) return counts;

  for (const dest of Object.keys(destinations)) {
    const rule = passport2
      ? getDualVisaRule(rules, passportCode, passport2, dest)
      : destinations[dest];
    if (rule) counts[rule.category]++;
  }

  return counts;
}

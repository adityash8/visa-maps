import { VISA_CATEGORIES, type Passport, type VisaRule, type ReviewedVisaRule, type VisaRulesMap, type VisaCategory } from "./constants";

let passportsCache: Passport[] | null = null;
let rulesCache: VisaRulesMap | null = null;

export async function loadPassports(): Promise<Passport[]> {
  if (passportsCache) return passportsCache;
  const res = await fetch("/data/passports.json");
  if (!res.ok) throw new Error("Passport data could not be loaded");
  passportsCache = await res.json();
  return passportsCache!;
}

export async function loadRules(): Promise<VisaRulesMap> {
  if (rulesCache) return rulesCache;
  const res = await fetch("/data/visa-rules.json");
  if (!res.ok) throw new Error("Visa data could not be loaded");
  rulesCache = await res.json();
  return rulesCache!;
}

export function getVisaRule(
  rules: VisaRulesMap,
  passportCode: string,
  destinationCode: string
): ReviewedVisaRule | null {
  const rule = rules[passportCode]?.[destinationCode];
  return rule && isReviewedVisaRule(rule) ? rule : null;
}

export function isReviewedVisaRule(rule: VisaRule): rule is ReviewedVisaRule {
  if (!VISA_CATEGORIES.includes(rule.category) || typeof rule.notes !== "string" || !rule.notes.trim()) return false;
  if (typeof rule.approvedBy !== "string" || !rule.approvedBy.trim()) return false;
  if (rule.duration !== undefined && (!Number.isFinite(rule.duration) || rule.duration <= 0)) return false;
  if (!rule.sourceUrl || !rule.checkedAt) return false;
  const checkedAt = Date.parse(rule.checkedAt);
  if (!Number.isFinite(checkedAt) || new Date(checkedAt).toISOString() !== rule.checkedAt || checkedAt > Date.now()) return false;
  try {
    const source = new URL(rule.sourceUrl);
    return source.protocol === "https:" && !source.username && !source.password;
  } catch {
    return false;
  }
}

const CATEGORY_RANK: Record<VisaCategory, number> = {
  visa_free: 0,
  visa_on_arrival: 1,
  evisa: 2,
  visa_required: 3,
};

export function getBestVisaRule(
  rules: VisaRulesMap,
  passport1: string,
  passport2: string | null,
  destinationCode: string
): { rule: ReviewedVisaRule; passportCode: string } | null {
  const r1 = getVisaRule(rules, passport1, destinationCode);
  const r2 = passport2 ? getVisaRule(rules, passport2, destinationCode) : null;
  if (r1 && (!r2 || CATEGORY_RANK[r1.category] <= CATEGORY_RANK[r2.category])) {
    return { rule: r1, passportCode: passport1 };
  }
  return r2 && passport2 ? { rule: r2, passportCode: passport2 } : null;
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

  const destinations = new Set([
    ...Object.keys(rules[passportCode] ?? {}),
    ...Object.keys(passport2 ? rules[passport2] ?? {} : {}),
  ]);
  for (const dest of Array.from(destinations)) {
    if (dest === passportCode || dest === passport2) continue;
    const selection = getBestVisaRule(rules, passportCode, passport2 ?? null, dest);
    if (selection) counts[selection.rule.category]++;
  }

  return counts;
}

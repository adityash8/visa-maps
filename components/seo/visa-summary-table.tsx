import Link from "next/link";
import { StaleNotice } from "@/components/provenance-stale-notice";
import { VISA_LABELS, type VisaCategory, type VisaRule } from "@/lib/constants";
import { isReviewedVisaRule } from "@/lib/visa-data";
import { destinationName } from "@/lib/destinations";
interface VisaSummaryTableProps { rules: Record<string, VisaRule>; category: VisaCategory; passportCode: string; }
export function VisaSummaryTable({ rules, category, passportCode }: VisaSummaryTableProps) {
  const entries = Object.entries(rules).filter(([, rule]) => isReviewedVisaRule(rule) && rule.category === category).sort(([a], [b]) => destinationName(a).localeCompare(destinationName(b), "en"));
  if (!entries.length) return null;
  return <section className="summary-section"><h2>{VISA_LABELS[category]} ({entries.length})</h2><table className="rule-table"><thead><tr><th>Destination</th><th>Conditions and maximum stay</th><th>Source and checked date</th></tr></thead><tbody>{entries.map(([code, rule]) => <tr key={code}><td><Link href={`/?p=${passportCode}&destination=${code}`}>{destinationName(code)}</Link></td><td>{rule.duration && <p>Up to {rule.duration} days</p>}<p>{rule.notes}</p></td><td><p><a href={rule.sourceUrl} target="_blank" rel="noopener noreferrer">{rule.sourceUrl}</a></p><p>Source checked <time dateTime={rule.checkedAt}>{new Date(rule.checkedAt!).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</time></p><StaleNotice checkedAt={rule.checkedAt!} /></td></tr>)}</tbody></table></section>;
}

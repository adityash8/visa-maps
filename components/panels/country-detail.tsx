"use client";
import { StaleNotice } from "@/components/provenance-stale-notice";
import type { VisaRule } from "@/lib/constants";
import { VISA_LABELS } from "@/lib/constants";
import sourceReview from "@/public/data/source-review.json";
import { destinationName } from "@/lib/destinations";
import { FlightCTA } from "@/components/affiliate/flight-cta";
import { VisaCTA } from "@/components/affiliate/visa-cta";
import { InsuranceCTA } from "@/components/affiliate/insurance-cta";
interface CountryDetailProps { countryCode: string; countryName: string; passportCode: string; rule: VisaRule | null; }
export function CountryDetail({ countryCode, countryName, passportCode, rule }: CountryDetailProps) {
  const restriction = !rule ? sourceReview.excludedPairs.find((pair) => pair.passport === passportCode && pair.destination === countryCode) : undefined;
  return <div className="country-detail">
    <div><h2>{countryName}</h2><p className="detail-passport">Using your {destinationName(passportCode)} passport</p></div>
    {rule ? <>
      <p className="visa-status"><span className={`legend-swatch category-${rule.category}`} aria-hidden="true" />{VISA_LABELS[rule.category]}</p>
      {rule.duration && <p>Maximum stay: {rule.duration} days</p>}
      <section className="detail-section"><h3>Conditions</h3><p>{rule.notes}</p></section>
      <section className="detail-section provenance"><h3>Official source</h3><a href={rule.sourceUrl} target="_blank" rel="noopener noreferrer">{rule.sourceUrl}</a><p>Source checked <time dateTime={rule.checkedAt}>{new Date(rule.checkedAt!).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</time></p>{rule.checkedAt && <StaleNotice checkedAt={rule.checkedAt} />}</section>
    </> : <section className="detail-section"><h3>No data</h3>{restriction ? <div className="restriction-notice"><p>{restriction.reason}</p><a href={restriction.sourceUrl} target="_blank" rel="noopener noreferrer">Official entry restriction</a><p>Source checked <time dateTime={restriction.checkedAt}>{new Date(restriction.checkedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</time></p></div> : <p>We have no source-checked rule for this passport and destination. Check the destination’s immigration authority before planning.</p>}</section>}
    <div className="detail-actions"><FlightCTA destinationCode={countryCode} originCode={passportCode} />{rule?.category === "evisa" && <VisaCTA destinationCode={countryCode} passportCode={passportCode} />}<InsuranceCTA destinationCode={countryCode} /></div>
    <p className="travel-disclaimer">Check official sources before travel. Entry is not guaranteed.</p>
  </div>;
}

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Globe2, Search, ArrowUpRight } from "lucide-react";
import type { Passport, VisaCategory, VisaRulesMap } from "@/lib/constants";
import { VISA_LABELS } from "@/lib/constants";
import { loadPassports, loadRules, getBestVisaRule, countByCategory } from "@/lib/visa-data";
import { destinations } from "@/lib/destinations";
import { useLocalPassport } from "@/lib/use-local-passport";
import { useMapColors } from "@/components/map/use-map-colors";
import { VisaMap } from "@/components/map/visa-map";
import { MapLegend } from "@/components/map/map-legend";
import { PassportSelector } from "@/components/controls/passport-selector";
import { DualPassportToggle } from "@/components/controls/dual-passport-toggle";
import { FilterBar } from "@/components/controls/filter-bar";
import { ShareButton } from "@/components/controls/share-button";
import { CountryPanel } from "@/components/panels/country-panel";
import { CountryBottomSheet } from "@/components/panels/country-bottom-sheet";
import { WaitlistForm } from "@/components/waitlist/waitlist-form";
import { trackPassportSelected, trackCountryClicked, trackDualPassportToggled } from "@/lib/analytics";

export default function Home() {
  const { passport, passport2, setPassport, setPassport2, loaded } = useLocalPassport();
  const [passports, setPassports] = useState<Passport[]>([]);
  const [rules, setRules] = useState<VisaRulesMap | null>(null);
  const [filter, setFilter] = useState<VisaCategory | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<{ code: string; name: string } | null>(null);
  const [query, setQuery] = useState("");
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadPassports(), loadRules()]).then(([nextPassports, nextRules]) => {
      if (cancelled) return;
      setPassports(nextPassports); setRules(nextRules); setLoadState("ready");
      const requested = new URLSearchParams(window.location.search).get("destination")?.toUpperCase();
      const destination = destinations.find(({ code }) => code === requested);
      if (destination) setSelectedCountry(destination);
    }).catch(() => { if (!cancelled) setLoadState("error"); });
    return () => { cancelled = true; };
  }, [retry]);

  const colorExpression = useMapColors(rules, passport, passport2, filter);
  const counts = rules ? countByCategory(rules, passport, passport2) : { visa_free: 0, evisa: 0, visa_on_arrival: 0, visa_required: 0 };
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const catalogue = destinations.filter(({ code }) => code !== passport && code !== passport2);
  const visibleDestinations = catalogue.filter(({ code, name }) => {
    if (!`${name} ${code}`.toLowerCase().includes(query.toLowerCase())) return false;
    return !filter || (rules && getBestVisaRule(rules, passport, passport2, code)?.rule.category === filter);
  });
  const handleCountryClick = useCallback((code: string, name: string) => { setSelectedCountry({ code, name }); trackCountryClicked(code); }, []);
  const handlePassportChange = useCallback((code: string) => { setPassport(code); trackPassportSelected(code); }, [setPassport]);
  const handlePassport2Change = useCallback((code: string | null) => { setPassport2(code); trackDualPassportToggled(code); }, [setPassport2]);
  const selectedVisa = selectedCountry && rules ? getBestVisaRule(rules, passport, passport2, selectedCountry.code) : null;

  return (
    <main className="atlas-app">
      <a className="skip-link" href="#destinations">Skip to destinations</a>
      <header className="app-header"><div className="brand"><Globe2 size={24} aria-hidden="true" /><h1>Visa Maps</h1></div><p>Plan with the source in sight.</p><ShareButton passport={passport} passport2={passport2} /></header>
      <section className="atlas-toolbar" aria-label="Passport and visa filters">
        <div className="passport-row"><span className="toolbar-label">Your passport</span><PassportSelector passports={passports} value={passport} onChange={handlePassportChange} /><DualPassportToggle passports={passports.filter(({ code }) => code !== passport)} passport2={passport2} onChange={handlePassport2Change} /><Link className="passport-guide" href={`/passport/${passport.toLowerCase()}`}>Passport guide <ArrowUpRight size={14} aria-hidden="true" /></Link></div>
        <FilterBar active={filter} onChange={setFilter} counts={counts} />
      </section>
      {loadState === "error" && <div className="load-error" role="alert"><p>Visa data couldn’t load. You can still browse destinations.</p><button className="button button-outline" onClick={() => { setLoadState("loading"); setRetry((value) => value + 1); }}>Retry data</button></div>}
      <div className="workspace">
        <section className="destination-index" id="destinations" aria-labelledby="destinations-heading">
          <div className="index-heading"><h2 id="destinations-heading">Destinations</h2><span>{catalogue.length}</span></div>
          <label className="search-field"><Search size={18} aria-hidden="true" /><span className="visually-hidden">Search destinations</span><input type="search" placeholder="Find a country…" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <p className="coverage" role="status">{!loaded || loadState === "loading" ? "Loading source-checked rules…" : `${total} of ${catalogue.length} destinations source checked. Grey means No data.`}</p>
          <details className="data-scope"><summary>About this data</summary><p>Ordinary-passport short tourist visits only. Source checks are tool assisted and await human launch review. Check every condition with the official authority.</p></details>
          <div className="destination-list" aria-label="Destination results">
            {visibleDestinations.map(({ code, name }) => {
              const category = rules ? getBestVisaRule(rules, passport, passport2, code)?.rule.category : null;
              return <button key={code} className="destination-row" aria-pressed={selectedCountry?.code === code} onClick={() => handleCountryClick(code, name)}><span className={`legend-swatch category-${category ?? "unknown"}`} aria-hidden="true" /><span className="destination-name">{name}</span><span className="destination-category">{category ? VISA_LABELS[category] : "No data"}</span></button>;
            })}
            {visibleDestinations.length === 0 && <div className="empty-message"><p>No destinations match.</p><button className="button button-outline" onClick={() => { setQuery(""); setFilter(null); }}>Clear search and filters</button></div>}
          </div>
          <details className="waitlist-disclosure"><summary>Future visa-change alerts</summary><p>Join the product waitlist. Alerts and email delivery are not active yet.</p><WaitlistForm /></details>
        </section>
        <section className="map-region" aria-label="Interactive visa map">
          <VisaMap colorExpression={colorExpression} onCountryClick={handleCountryClick} />
          <MapLegend />
          <CountryPanel open={!!selectedCountry} onClose={() => setSelectedCountry(null)} countryCode={selectedCountry?.code ?? ""} countryName={selectedCountry?.name ?? ""} passportCode={selectedVisa?.passportCode ?? passport} rule={selectedVisa?.rule ?? null} />
        </section>
      </div>
      <CountryBottomSheet open={!!selectedCountry} onClose={() => setSelectedCountry(null)} countryCode={selectedCountry?.code ?? ""} countryName={selectedCountry?.name ?? ""} passportCode={selectedVisa?.passportCode ?? passport} rule={selectedVisa?.rule ?? null} />
      <noscript><p>Enable JavaScript for the interactive map, or <Link href="/passport/us">browse passport guides</Link>.</p></noscript>
    </main>
  );
}

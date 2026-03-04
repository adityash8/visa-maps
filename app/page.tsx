"use client";

import { useState, useEffect, useCallback } from "react";
import type { Passport, VisaCategory, VisaRulesMap } from "@/lib/constants";
import { loadPassports, loadRules, getVisaRule, getDualVisaRule, countByCategory } from "@/lib/visa-data";
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

  useEffect(() => {
    Promise.all([loadPassports(), loadRules()]).then(([p, r]) => {
      setPassports(p);
      setRules(r);
    });
  }, []);

  const colorExpression = useMapColors(rules, passport, passport2, filter);

  const counts = rules
    ? countByCategory(rules, passport, passport2)
    : { visa_free: 0, evisa: 0, visa_on_arrival: 0, visa_required: 0 };

  const handleCountryClick = useCallback((code: string, name: string) => {
    setSelectedCountry({ code, name });
    trackCountryClicked(code);
  }, []);

  const handlePassportChange = useCallback(
    (code: string) => {
      setPassport(code);
      trackPassportSelected(code);
    },
    [setPassport]
  );

  const handlePassport2Change = useCallback(
    (code: string | null) => {
      setPassport2(code);
      trackDualPassportToggled(code);
    },
    [setPassport2]
  );

  const selectedRule = selectedCountry && rules
    ? passport2
      ? getDualVisaRule(rules, passport, passport2, selectedCountry.code)
      : getVisaRule(rules, passport, selectedCountry.code)
    : null;

  if (!loaded) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-400">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Map */}
      <VisaMap
        colorExpression={colorExpression}
        onCountryClick={handleCountryClick}
      />

      {/* Top controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <PassportSelector
            passports={passports}
            value={passport}
            onChange={handlePassportChange}
          />
          <DualPassportToggle
            passports={passports}
            passport2={passport2}
            onChange={handlePassport2Change}
          />
          <ShareButton passport={passport} passport2={passport2} />
        </div>
        <FilterBar active={filter} onChange={setFilter} counts={counts} />
      </div>

      {/* Waitlist - bottom left on desktop */}
      <div className="hidden md:block absolute bottom-6 right-4 z-10 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-xs">
        <p className="text-xs font-medium text-gray-700 mb-2">
          Get notified when we add real-time visa updates
        </p>
        <WaitlistForm />
      </div>

      {/* Legend */}
      <MapLegend />

      {/* Desktop panel */}
      <CountryPanel
        open={!!selectedCountry}
        onClose={() => setSelectedCountry(null)}
        countryCode={selectedCountry?.code ?? ""}
        countryName={selectedCountry?.name ?? ""}
        passportCode={passport}
        rule={selectedRule}
      />

      {/* Mobile bottom sheet */}
      <CountryBottomSheet
        open={!!selectedCountry}
        onClose={() => setSelectedCountry(null)}
        countryCode={selectedCountry?.code ?? ""}
        countryName={selectedCountry?.name ?? ""}
        passportCode={passport}
        rule={selectedRule}
      />
    </div>
  );
}

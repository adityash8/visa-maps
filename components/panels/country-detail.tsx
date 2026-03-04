"use client";

import type { VisaRule } from "@/lib/constants";
import { VISA_COLORS, VISA_LABELS } from "@/lib/constants";
import { FlightCTA } from "@/components/affiliate/flight-cta";
import { VisaCTA } from "@/components/affiliate/visa-cta";
import { InsuranceCTA } from "@/components/affiliate/insurance-cta";

interface CountryDetailProps {
  countryCode: string;
  countryName: string;
  passportCode: string;
  rule: VisaRule | null;
}

export function CountryDetail({
  countryCode,
  countryName,
  passportCode,
  rule,
}: CountryDetailProps) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h2 className="text-lg font-semibold">{countryName}</h2>
        <p className="text-sm text-gray-500">{countryCode}</p>
      </div>

      {rule ? (
        <>
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-4 w-4 rounded-full"
              style={{ backgroundColor: VISA_COLORS[rule.category] }}
            />
            <span className="font-medium">{VISA_LABELS[rule.category]}</span>
            {rule.duration && (
              <span className="text-sm text-gray-500">
                — up to {rule.duration} days
              </span>
            )}
          </div>
          {rule.notes && (
            <p className="text-sm text-gray-600">{rule.notes}</p>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-500">
          No visa data available for this combination.
        </p>
      )}

      <div className="flex flex-col gap-2 pt-2 border-t">
        <FlightCTA destinationCode={countryCode} originCode={passportCode} />
        {rule && rule.category !== "visa_free" && (
          <VisaCTA destinationCode={countryCode} passportCode={passportCode} />
        )}
        <InsuranceCTA destinationCode={countryCode} />
      </div>
    </div>
  );
}

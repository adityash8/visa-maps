import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CountryDetail } from "@/components/panels/country-detail";
import type { VisaRule } from "@/lib/constants";

vi.mock("@/components/affiliate/flight-cta", () => ({
  FlightCTA: ({ originCode }: { originCode: string }) => <span>flight-origin:{originCode}</span>,
}));
vi.mock("@/components/affiliate/visa-cta", () => ({
  VisaCTA: ({ passportCode }: { passportCode: string }) => <span>visa-passport:{passportCode}</span>,
}));
vi.mock("@/components/affiliate/insurance-cta", () => ({ InsuranceCTA: () => <span>insurance</span> }));

function render(category: VisaRule["category"] | null) {
  return renderToStaticMarkup(<CountryDetail countryCode="FR" countryName="France" passportCode="GB"
    rule={category ? { category } : null} />);
}

describe("country detail actions", () => {
  it("uses the passport that supplied the selected eVisa rule", () => {
    expect(render("evisa")).toContain("visa-passport:GB");
  });

  it.each(["visa_free", "visa_required", "visa_on_arrival", null] as const)("does not offer an eVisa application for %s", (category) => {
    expect(render(category)).not.toContain("visa-passport:");
    expect(render(category)).toContain("flight-origin:GB");
  });
});

import { describe, expect, it } from "vitest";
import { countByCategory, getBestVisaRule, getVisaRule } from "@/lib/visa-data";
import type { VisaRule, VisaRulesMap } from "@/lib/constants";

const reviewed = {
  category: "evisa", notes: "Tourism only; conditions apply.",
  sourceUrl: "https://www.gov.uk/foreign-travel-advice", checkedAt: "2026-10-23T12:00:00.000Z", approvedBy: "source-review",
} as const;

describe("reviewed visa rules", () => {
  it("does not activate legacy categories that lack provenance", () => {
    expect(getVisaRule({ US: { FR: { category: "visa_free" } } }, "US", "FR")).toBeNull();
  });

  it.each([
    { sourceUrl: undefined }, { checkedAt: undefined }, { approvedBy: undefined }, { notes: "" },
    { sourceUrl: "http://www.gov.uk/" }, { sourceUrl: "javascript:alert(1)" },
    { sourceUrl: "https://user:password@www.gov.uk/" }, { checkedAt: "not-a-date" },
    { checkedAt: "2026-10-23" }, { checkedAt: "2026-10-23T12:00:00Z" },
    { duration: 0 }, { duration: -1 }, { duration: Infinity },
    { checkedAt: "2999-01-01T00:00:00.000Z" },
  ])("rejects incomplete or unsafe provenance %j", (change) => {
    const rule = { ...reviewed, ...change } as VisaRule;
    expect(getVisaRule({ US: { FR: rule } }, "US", "FR")).toBeNull();
  });

  it("returns a reviewed rule unchanged", () => {
    expect(getVisaRule({ US: { FR: reviewed } }, "US", "FR")).toBe(reviewed);
  });

  it("returns the secondary passport with its better rule for a matching visa CTA", () => {
    const secondary = { ...reviewed, category: "visa_on_arrival" } as const;
    expect(getBestVisaRule({ US: { FR: reviewed }, GB: { FR: secondary } }, "US", "GB", "FR"))
      .toEqual({ rule: secondary, passportCode: "GB" });
  });

  it("prefers the primary passport on an equal category", () => {
    const secondary = { ...reviewed, duration: 90 };
    expect(getBestVisaRule({ US: { FR: reviewed }, GB: { FR: secondary } }, "US", "GB", "FR"))
      .toEqual({ rule: reviewed, passportCode: "US" });
  });

  it("uses a secondary reviewed rule when the primary pair is unknown", () => {
    expect(getBestVisaRule({ US: {}, GB: { FR: reviewed } }, "US", "GB", "FR"))
      .toEqual({ rule: reviewed, passportCode: "GB" });
  });

  it("counts reviewed destinations from both passports without counting home countries or legacy rules", () => {
    const rules: VisaRulesMap = {
      US: { FR: reviewed, DE: { category: "visa_free" }, GB: reviewed },
      GB: { JP: { ...reviewed, category: "visa_free" }, US: reviewed },
    };
    expect(countByCategory(rules, "US", "GB")).toEqual({ visa_free: 1, evisa: 1, visa_on_arrival: 0, visa_required: 0 });
  });
});

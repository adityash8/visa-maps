import { describe, expect, it, vi } from "vitest";
import { createExpression } from "@maplibre/maplibre-gl-style-spec";
import passports from "../../public/data/passports.json";
import rules from "../../public/data/visa-rules.json";
import { HOME_COLOR, DEFAULT_COLOR, type VisaRulesMap } from "@/lib/constants";
import { useMapColors } from "@/components/map/use-map-colors";

vi.mock("react", () => ({ useMemo: (calculate: () => unknown) => calculate() }));

const selections: Array<[string, string | null]> = passports.flatMap((passport, index) => [
  [passport.code, null] as [string, null],
  ...passports.slice(index + 1).map((second) => [passport.code, second.code] as [string, string]),
]);

describe("MapLibre map colors", () => {
  it.each(selections)("parses %s / %s with each home country exactly once", (primary, secondary) => {
    const expression = useMapColors(rules as VisaRulesMap, primary, secondary, null);
    const parsed = createExpression(expression, "layers[0].paint.fill-color");
    expect(parsed.result, JSON.stringify(parsed.value)).toBe("success");
    expect(Array.isArray(expression)).toBe(true);
    if (!Array.isArray(expression)) return;
    const labels = expression.slice(2, -1).filter((_, index) => index % 2 === 0);
    for (const home of [primary, secondary].filter(Boolean)) {
      expect(labels.filter((label) => label === home)).toHaveLength(1);
      expect(expression[expression.indexOf(home!) + 1]).toBe(HOME_COLOR);
    }
  });

  it("handles the same passport twice without duplicate labels", () => {
    expect(createExpression(useMapColors(rules as VisaRulesMap, "US", "US", null), "layers[0].paint.fill-color").result).toBe("success");
  });

  it("keeps secondary-only destinations and dims filtered rules", () => {
    const provenance = { notes: "Tourism; conditions apply.", sourceUrl: "https://www.gov.uk/foreign-travel-advice", checkedAt: "2026-10-23T12:00:00.000Z", approvedBy: "source-review" };
    const sparse: VisaRulesMap = {
      US: { FR: { ...provenance, category: "visa_required" } },
      GB: { JP: { ...provenance, category: "visa_free" }, FR: { ...provenance, category: "evisa" } },
    };
    const expression = useMapColors(sparse, "US", "GB", "visa_free");
    expect(createExpression(expression, "layers[0].paint.fill-color").result).toBe("success");
    expect(expression).toContain("JP");
    expect(expression).toContain("#3b82f640");
    expect(expression).toContain("#22c55e");
  });

  it("returns no-data grey until rules are available", () => {
    expect(useMapColors(null, "US", null, null)).toBe(DEFAULT_COLOR);
  });
});

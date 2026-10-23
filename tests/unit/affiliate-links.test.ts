import { afterEach, describe, expect, it, vi } from "vitest";
import { getFlightsUrl, getVisaUrl } from "../../lib/affiliate-links";

afterEach(() => vi.unstubAllEnvs());
describe("destination and approved partner links", () => {
  it("presets readable destination and origin names", () => {
    expect(new URL(getFlightsUrl("SG", "IN")).searchParams.get("q")).toBe("Flights from India to Singapore");
    expect(new URL(getFlightsUrl("MT")).searchParams.get("q")).toBe("Flights to Malta");
  });
  it("does not publish an unconfigured visa referral", () => {
    vi.stubEnv("NEXT_PUBLIC_IVISA_PARTNER_URL", "");
    expect(getVisaUrl()).toBeNull();
  });
  it("preserves a provider-issued referral without modifying its tracking", () => {
    const issued = "https://www.ivisa.com/?ref=acceptance-fixture";
    vi.stubEnv("NEXT_PUBLIC_IVISA_PARTNER_URL", issued);
    expect(getVisaUrl()).toBe(issued);
  });
  it.each(["http://www.ivisa.com/?ref=fixture", "https://ivisa.com.evil.example/", "https://user:password@www.ivisa.com/", "not a URL"])("rejects unsafe or unrelated partner URL %s", (url) => {
    vi.stubEnv("NEXT_PUBLIC_IVISA_PARTNER_URL", url);
    expect(getVisaUrl()).toBeNull();
  });
});

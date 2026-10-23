import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  trackWaitlistSignup, trackPassportSelected, trackCountryClicked,
  trackFilterChanged, trackDualPassportToggled, trackAffiliateCTAClicked, trackShareClicked,
} from "@/lib/analytics";

let events: unknown[];

beforeEach(() => {
  events = [];
  const browser = new EventTarget();
  browser.addEventListener("visa-maps:event", (event) => events.push((event as CustomEvent).detail));
  vi.stubGlobal("window", browser);
});

describe("local analytics", () => {
  it("records waitlist success without email or personal data", () => {
    trackWaitlistSignup();
    expect(events).toEqual([{ name: "waitlist_signup", properties: {} }]);
  });

  it("emits only local allowlisted events without network calls", () => {
    const network = vi.fn();
    vi.stubGlobal("fetch", network);
    trackPassportSelected("IN");
    trackCountryClicked("JP");
    trackFilterChanged("evisa");
    trackDualPassportToggled("US");
    trackAffiliateCTAClicked("visa", "JP");
    trackShareClicked("copy");
    expect(events).toEqual([
      { name: "passport_selected", properties: { passport_iso: "IN" } },
      { name: "country_detail_viewed", properties: { dest_iso: "JP" } },
      { name: "filter_changed", properties: { filter: "evisa" } },
      { name: "dual_passport_toggled", properties: { passport2_iso: "US" } },
      { name: "affiliate_click", properties: { partner: "visa", dest_iso: "JP" } },
      { name: "share_clicked", properties: { method: "copy" } },
    ]);
    expect(network).not.toHaveBeenCalled();
  });

  it("rejects personal data and arbitrary strings on all string inputs", () => {
    const personal = "traveler@example.com";
    trackPassportSelected(personal);
    trackCountryClicked(personal);
    trackFilterChanged(personal);
    trackDualPassportToggled(personal);
    trackAffiliateCTAClicked(personal, "JP");
    trackAffiliateCTAClicked("visa", personal);
    trackShareClicked(personal);
    expect(events).toEqual([]);
  });

  it("is safe during server rendering", () => {
    vi.stubGlobal("window", undefined);
    expect(() => trackWaitlistSignup()).not.toThrow();
  });
});

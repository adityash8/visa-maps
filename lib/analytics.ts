import { VISA_CATEGORIES } from "@/lib/constants";

function emit(name: string, properties: Record<string, string | null> = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("visa-maps:event", { detail: { name, properties } }));
}

function isCountryCode(value: string) {
  return /^[A-Z]{2}$/.test(value);
}

export function trackPassportSelected(passportCode: string) {
  if (isCountryCode(passportCode)) emit("passport_selected", { passport_iso: passportCode });
}

export function trackCountryClicked(countryCode: string) {
  if (isCountryCode(countryCode)) emit("country_detail_viewed", { dest_iso: countryCode });
}

export function trackFilterChanged(filter: string) {
  if (filter === "all" || VISA_CATEGORIES.some((category) => category === filter)) emit("filter_changed", { filter });
}

export function trackDualPassportToggled(secondPassport: string | null) {
  if (secondPassport === null || isCountryCode(secondPassport)) emit("dual_passport_toggled", { passport2_iso: secondPassport });
}

export function trackAffiliateCTAClicked(type: string, country: string) {
  if (["flights", "visa", "insurance"].includes(type) && isCountryCode(country)) emit("affiliate_click", { partner: type, dest_iso: country });
}

export function trackShareClicked(method: string) {
  if (["copy", "twitter", "whatsapp"].includes(method)) emit("share_clicked", { method });
}

export function trackWaitlistSignup() {
  emit("waitlist_signup");
}

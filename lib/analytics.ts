import posthog from "posthog-js";

export function trackPassportSelected(passportCode: string) {
  posthog.capture("passport_selected", { passport: passportCode });
}

export function trackCountryClicked(countryCode: string) {
  posthog.capture("country_clicked", { country: countryCode });
}

export function trackFilterChanged(filter: string) {
  posthog.capture("filter_changed", { filter });
}

export function trackDualPassportToggled(secondPassport: string | null) {
  posthog.capture("dual_passport_toggled", { second_passport: secondPassport });
}

export function trackAffiliateCTAClicked(type: string, country: string) {
  posthog.capture("affiliate_cta_clicked", { type, country });
}

export function trackShareClicked(method: string) {
  posthog.capture("share_clicked", { method });
}

export function trackWaitlistSignup(email: string) {
  posthog.capture("waitlist_signup", { email });
}

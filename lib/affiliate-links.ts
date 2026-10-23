import { destinationName } from "./destinations";

export function getFlightsUrl(destinationCode: string, originCode?: string) {
  const destination = destinationName(destinationCode);
  const origin = originCode ? ` from ${destinationName(originCode)}` : "";
  return `https://www.google.com/travel/flights?${new URLSearchParams({ q: `Flights${origin} to ${destination}` })}`;
}
export function getVisaUrl(): string | null {
  const partnerUrl = process.env.NEXT_PUBLIC_IVISA_PARTNER_URL;
  if (!partnerUrl) return null;
  try {
    const url = new URL(partnerUrl);
    if (url.protocol !== "https:" || !["ivisa.com", "www.ivisa.com"].includes(url.hostname) || url.username || url.password) return null;
    return partnerUrl;
  } catch { return null; }
}
export function getInsuranceUrl() { return "https://safetywing.com/nomad-insurance"; }

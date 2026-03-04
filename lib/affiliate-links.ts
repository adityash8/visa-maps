export function getFlightsUrl(destinationCode: string, originCode?: string) {
  const origin = originCode ?? "";
  return `https://www.google.com/travel/flights?q=flights+from+${origin}+to+${destinationCode}`;
}

export function getVisaUrl(destinationCode: string, passportCode: string) {
  return `https://www.ivisa.com/apply?nationality=${passportCode}&destination=${destinationCode}`;
}

export function getInsuranceUrl() {
  return "https://safetywing.com/nomad-insurance";
}

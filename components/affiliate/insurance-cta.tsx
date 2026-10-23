"use client";
import { ShieldCheck } from "lucide-react";
import { getInsuranceUrl } from "@/lib/affiliate-links";
import { trackAffiliateCTAClicked } from "@/lib/analytics";
export function InsuranceCTA({ destinationCode }: { destinationCode: string }) {
  return <a className="button button-outline" href={getInsuranceUrl()} target="_blank" rel="noopener noreferrer" onClick={() => trackAffiliateCTAClicked("insurance", destinationCode)}><ShieldCheck size={16} aria-hidden="true" />Explore travel insurance</a>;
}

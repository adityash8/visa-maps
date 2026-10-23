"use client";
import { FileText } from "lucide-react";
import { getVisaUrl } from "@/lib/affiliate-links";
import { trackAffiliateCTAClicked } from "@/lib/analytics";
export function VisaCTA({ destinationCode }: { destinationCode: string; passportCode: string; }) {
  const url = getVisaUrl();
  if (!url) return <div className="partner-unavailable"><button className="button button-outline whitespace-nowrap" disabled><FileText size={16} aria-hidden="true" />Apply for Visa unavailable</button><p>The visa partner is not configured. Use the official source above.</p></div>;
  return <div><a className="button button-outline" href={url} target="_blank" rel="sponsored noopener noreferrer" onClick={() => trackAffiliateCTAClicked("visa", destinationCode)}><FileText size={16} aria-hidden="true" />Apply for Visa</a><p className="affiliate-disclosure">Affiliate link. We may earn a commission if you apply.</p></div>;
}

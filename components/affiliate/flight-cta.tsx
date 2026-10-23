"use client";
import { Plane } from "lucide-react";
import { getFlightsUrl } from "@/lib/affiliate-links";
import { trackAffiliateCTAClicked } from "@/lib/analytics";
export function FlightCTA({ destinationCode, originCode }: { destinationCode: string; originCode?: string; }) {
  return <a className="button button-primary" href={getFlightsUrl(destinationCode, originCode)} target="_blank" rel="noopener noreferrer" onClick={() => trackAffiliateCTAClicked("flights", destinationCode)}><Plane size={16} aria-hidden="true" />Search Flights</a>;
}

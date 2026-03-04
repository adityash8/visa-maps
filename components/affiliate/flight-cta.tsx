"use client";

import { Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFlightsUrl } from "@/lib/affiliate-links";
import { trackAffiliateCTAClicked } from "@/lib/analytics";

export function FlightCTA({
  destinationCode,
  originCode,
}: {
  destinationCode: string;
  originCode?: string;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full justify-start gap-2"
      onClick={() => {
        trackAffiliateCTAClicked("flights", destinationCode);
        window.open(getFlightsUrl(destinationCode, originCode), "_blank");
      }}
    >
      <Plane className="h-4 w-4" />
      Search Flights
    </Button>
  );
}

"use client";

import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInsuranceUrl } from "@/lib/affiliate-links";
import { trackAffiliateCTAClicked } from "@/lib/analytics";

export function InsuranceCTA({ destinationCode }: { destinationCode: string }) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full justify-start gap-2"
      onClick={() => {
        trackAffiliateCTAClicked("insurance", destinationCode);
        window.open(getInsuranceUrl(), "_blank");
      }}
    >
      <Shield className="h-4 w-4" />
      Travel Insurance
    </Button>
  );
}

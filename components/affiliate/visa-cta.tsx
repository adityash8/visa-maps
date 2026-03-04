"use client";

import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getVisaUrl } from "@/lib/affiliate-links";
import { trackAffiliateCTAClicked } from "@/lib/analytics";

export function VisaCTA({
  destinationCode,
  passportCode,
}: {
  destinationCode: string;
  passportCode: string;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full justify-start gap-2"
      onClick={() => {
        trackAffiliateCTAClicked("visa", destinationCode);
        window.open(getVisaUrl(destinationCode, passportCode), "_blank");
      }}
    >
      <FileText className="h-4 w-4" />
      Apply for Visa
    </Button>
  );
}

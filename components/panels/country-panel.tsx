"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CountryDetail } from "./country-detail";
import type { VisaRule } from "@/lib/constants";

interface CountryPanelProps {
  open: boolean;
  onClose: () => void;
  countryCode: string;
  countryName: string;
  passportCode: string;
  rule: VisaRule | null;
}

export function CountryPanel({
  open,
  onClose,
  countryCode,
  countryName,
  passportCode,
  rule,
}: CountryPanelProps) {
  if (!open) return null;

  return (
    <div className="hidden md:block absolute top-0 right-0 z-20 h-full w-80 bg-white shadow-xl border-l overflow-y-auto">
      <div className="flex justify-end p-2">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <CountryDetail
        countryCode={countryCode}
        countryName={countryName}
        passportCode={passportCode}
        rule={rule}
      />
    </div>
  );
}

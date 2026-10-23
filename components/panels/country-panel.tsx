"use client";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CountryDetail } from "./country-detail";
import type { VisaRule } from "@/lib/constants";
interface CountryPanelProps { open: boolean; onClose: () => void; countryCode: string; countryName: string; passportCode: string; rule: VisaRule | null; }
export function CountryPanel({ open, onClose, ...details }: CountryPanelProps) {
  if (!open) return null;
  return <aside className="country-panel" aria-label={`${details.countryName} entry details`}>
    <div className="panel-toolbar"><span>Entry details</span><Button variant="ghost" size="icon" aria-label="Close entry details" onClick={onClose}><X size={18} aria-hidden="true" /></Button></div>
    <CountryDetail {...details} />
  </aside>;
}

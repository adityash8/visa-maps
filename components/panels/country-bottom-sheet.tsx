"use client";
import { useRef, useSyncExternalStore } from "react";
import { Drawer } from "vaul";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CountryDetail } from "./country-detail";
import type { VisaRule } from "@/lib/constants";
interface CountryBottomSheetProps { open: boolean; onClose: () => void; countryCode: string; countryName: string; passportCode: string; rule: VisaRule | null; }
function subscribe(callback: () => void) { const query = window.matchMedia("(max-width: 767px)"); query.addEventListener("change", callback); return () => query.removeEventListener("change", callback); }
export function CountryBottomSheet({ open, onClose, ...details }: CountryBottomSheetProps) {
  const returnFocus = useRef<HTMLElement | null>(null);
  const mobile = useSyncExternalStore(subscribe, () => window.matchMedia("(max-width: 767px)").matches, () => false);
  return <Drawer.Root autoFocus open={open && mobile} onOpenChange={(isOpen) => !isOpen && onClose()}>
    <Drawer.Portal><Drawer.Overlay className="drawer-overlay" /><Drawer.Content className="country-drawer" aria-describedby={undefined} onOpenAutoFocus={() => { returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; }} onCloseAutoFocus={(event) => { event.preventDefault(); returnFocus.current?.focus(); }}>
      <div className="panel-toolbar"><Drawer.Title>Entry details</Drawer.Title><Button variant="ghost" size="icon" aria-label="Close entry details" onClick={onClose}><X size={18} aria-hidden="true" /></Button></div>
      <div className="drawer-scroll"><CountryDetail {...details} /></div>
    </Drawer.Content></Drawer.Portal>
  </Drawer.Root>;
}

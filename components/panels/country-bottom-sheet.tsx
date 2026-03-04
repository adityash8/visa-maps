"use client";

import { Drawer } from "vaul";
import { CountryDetail } from "./country-detail";
import type { VisaRule } from "@/lib/constants";

interface CountryBottomSheetProps {
  open: boolean;
  onClose: () => void;
  countryCode: string;
  countryName: string;
  passportCode: string;
  rule: VisaRule | null;
}

export function CountryBottomSheet({
  open,
  onClose,
  countryCode,
  countryName,
  passportCode,
  rule,
}: CountryBottomSheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-30 md:hidden" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white rounded-t-2xl max-h-[70vh]">
          <div className="mx-auto w-12 h-1.5 rounded-full bg-gray-300 mt-3 mb-1" />
          <div className="overflow-y-auto max-h-[calc(70vh-2rem)]">
            <CountryDetail
              countryCode={countryCode}
              countryName={countryName}
              passportCode={passportCode}
              rule={rule}
            />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

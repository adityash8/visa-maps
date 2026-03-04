"use client";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PassportSelector } from "./passport-selector";
import type { Passport } from "@/lib/constants";

interface DualPassportToggleProps {
  passports: Passport[];
  passport2: string | null;
  onChange: (code: string | null) => void;
}

export function DualPassportToggle({
  passports,
  passport2,
  onChange,
}: DualPassportToggleProps) {
  if (!passport2) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => onChange(passports[0]?.code ?? "US")}
      >
        <Plus className="h-3.5 w-3.5" />
        2nd Passport
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-gray-500">+</span>
      <PassportSelector
        passports={passports}
        value={passport2}
        onChange={(code) => onChange(code)}
        label="2nd Passport"
      />
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => onChange(null)}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

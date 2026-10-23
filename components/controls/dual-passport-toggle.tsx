"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PassportSelector } from "./passport-selector";
import type { Passport } from "@/lib/constants";

interface DualPassportToggleProps {
  passports: Passport[];
  passport2: string | null;
  onChange: (code: string | null) => void;
}
export function DualPassportToggle({ passports, passport2, onChange }: DualPassportToggleProps) {
  const [choosing, setChoosing] = useState(false);
  if (!passport2 && !choosing) return (
    <Button variant="outline" size="sm" onClick={() => setChoosing(true)}><Plus size={16} aria-hidden="true" />2nd Passport</Button>
  );
  return (
    <div className="dual-control">
      <PassportSelector passports={passports} value={passport2 ?? ""} onChange={(code) => { onChange(code); setChoosing(false); }} label="2nd Passport" />
      <Button variant="ghost" size="icon" aria-label="Remove second passport" onClick={() => { onChange(null); setChoosing(false); }}><X size={16} aria-hidden="true" /></Button>
    </div>
  );
}

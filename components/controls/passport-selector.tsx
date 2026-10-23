"use client";

import { useId, useRef, useState, useEffect } from "react";
import { Command } from "cmdk";
import { ChevronDown, Check } from "lucide-react";
import type { Passport } from "@/lib/constants";

interface PassportSelectorProps {
  passports: Passport[];
  value: string;
  onChange: (code: string) => void;
  label?: string;
}
export function PassportSelector({ passports, value, onChange, label = "Passport" }: PassportSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const selected = passports.find((passport) => passport.code === value);
  useEffect(() => {
    if (!open) return;
    function dismiss(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);
  return (
    <div className="passport-control" ref={root} onKeyDown={(event) => {
      if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); }
    }}>
      <button ref={trigger} className="button button-outline passport-trigger" aria-label={`${label}: ${selected?.name ?? "Choose a passport"}`} aria-expanded={open} aria-haspopup="listbox" aria-controls={id} onClick={() => setOpen(!open)}>
        <span className="country-code" aria-hidden="true">{value}</span>
        <span>{selected?.name ?? label}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      {open && (
        <div className="passport-popover">
          <Command label={label} shouldFilter>
            <Command.Input autoFocus value={search} onValueChange={setSearch} placeholder="Search passports…" aria-label={`Search ${label.toLowerCase()}s`} className="passport-search" />
            <Command.List id={id} className="passport-options">
              <Command.Empty className="empty-message">No passport found. Try a country name.</Command.Empty>
              {passports.map((passport) => (
                <Command.Item key={passport.code} value={`${passport.name} ${passport.code}`} onSelect={() => { onChange(passport.code); setOpen(false); setSearch(""); trigger.current?.focus(); }} className="passport-option">
                  <span className="country-code" aria-hidden="true">{passport.code}</span>
                  <span>{passport.name}</span>
                  {passport.code === value && <Check size={16} aria-hidden="true" />}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </div>
      )}
    </div>
  );
}

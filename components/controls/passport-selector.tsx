"use client";

import { useState } from "react";
import { Command } from "cmdk";
import type { Passport } from "@/lib/constants";

interface PassportSelectorProps {
  passports: Passport[];
  value: string;
  onChange: (code: string) => void;
  label?: string;
}

export function PassportSelector({
  passports,
  value,
  onChange,
  label = "Passport",
}: PassportSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = passports.find((p) => p.code === value);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50 text-sm min-w-[180px]"
      >
        {selected ? (
          <>
            <span>{selected.flag}</span>
            <span className="font-medium">{selected.name}</span>
          </>
        ) : (
          <span className="text-gray-400">{label}</span>
        )}
        <svg
          className="ml-auto h-4 w-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 w-64 bg-white border rounded-lg shadow-xl overflow-hidden">
          <Command shouldFilter={true}>
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search passports..."
              className="w-full px-3 py-2 text-sm border-b outline-none"
            />
            <Command.List className="max-h-60 overflow-y-auto p-1">
              <Command.Empty className="px-3 py-2 text-sm text-gray-500">
                No passport found.
              </Command.Empty>
              {passports.map((p) => (
                <Command.Item
                  key={p.code}
                  value={`${p.name} ${p.code}`}
                  onSelect={() => {
                    onChange(p.code);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md cursor-pointer hover:bg-gray-100 data-[selected=true]:bg-gray-100"
                >
                  <span>{p.flag}</span>
                  <span>{p.name}</span>
                  {p.code === value && (
                    <svg className="ml-auto h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </div>
      )}
    </div>
  );
}

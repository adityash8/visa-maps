"use client";

import { cn } from "@/lib/utils";
import {
  VISA_CATEGORIES,
  VISA_LABELS,
  VISA_COLORS,
  type VisaCategory,
} from "@/lib/constants";
import { trackFilterChanged } from "@/lib/analytics";

interface FilterBarProps {
  active: VisaCategory | null;
  onChange: (filter: VisaCategory | null) => void;
  counts: Record<VisaCategory, number>;
}

export function FilterBar({ active, onChange, counts }: FilterBarProps) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        onClick={() => {
          onChange(null);
          trackFilterChanged("all");
        }}
        className={cn(
          "px-3 py-1 rounded-full text-xs font-medium transition-colors border",
          active === null
            ? "bg-gray-900 text-white border-gray-900"
            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
        )}
      >
        All ({total})
      </button>
      {VISA_CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => {
            const next = active === cat ? null : cat;
            onChange(next);
            trackFilterChanged(next ?? "all");
          }}
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium transition-colors border",
            active === cat
              ? "text-white border-transparent"
              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          )}
          style={
            active === cat
              ? { backgroundColor: VISA_COLORS[cat] }
              : undefined
          }
        >
          {VISA_LABELS[cat]} ({counts[cat]})
        </button>
      ))}
    </div>
  );
}

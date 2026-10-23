"use client";

import { VISA_CATEGORIES, VISA_LABELS, type VisaCategory } from "@/lib/constants";
import { trackFilterChanged } from "@/lib/analytics";
interface FilterBarProps { active: VisaCategory | null; onChange: (filter: VisaCategory | null) => void; counts: Record<VisaCategory, number>; }
export function FilterBar({ active, onChange, counts }: FilterBarProps) {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  return (
    <div className="filter-bar" role="group" aria-label="Filter reviewed visa rules">
      <button className="filter-button" aria-pressed={active === null} onClick={() => { onChange(null); trackFilterChanged("all"); }}>All <span>{total}</span></button>
      {VISA_CATEGORIES.map((category) => (
        <button key={category} className="filter-button" aria-pressed={active === category} onClick={() => { const next = active === category ? null : category; onChange(next); trackFilterChanged(next ?? "all"); }}>
          <span className={`legend-swatch category-${category}`} aria-hidden="true" />{VISA_LABELS[category]} <span>{counts[category]}</span>
        </button>
      ))}
    </div>
  );
}

"use client";
import { VISA_CATEGORIES, VISA_LABELS } from "@/lib/constants";
export function MapLegend() {
  return <div className="map-legend" aria-label="Map legend">
    <span><span className="legend-swatch category-home" aria-hidden="true" />Passport country</span>
    {VISA_CATEGORIES.map((category) => <span key={category}><span className={`legend-swatch category-${category}`} aria-hidden="true" />{VISA_LABELS[category]}</span>)}
    <span><span className="legend-swatch category-unknown" aria-hidden="true" />No data</span>
  </div>;
}

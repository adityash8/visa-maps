"use client";

import { VISA_COLORS, VISA_LABELS, HOME_COLOR } from "@/lib/constants";

export function MapLegend() {
  return (
    <div className="absolute bottom-6 left-4 z-10 rounded-lg bg-white/95 backdrop-blur-sm px-3 py-2.5 shadow-lg text-xs">
      <div className="flex flex-wrap gap-x-3 gap-y-1.5">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-sm"
            style={{ backgroundColor: HOME_COLOR }}
          />
          Home
        </span>
        {(Object.keys(VISA_COLORS) as Array<keyof typeof VISA_COLORS>).map(
          (cat) => (
            <span key={cat} className="flex items-center gap-1.5">
              <span
                className="inline-block h-3 w-3 rounded-sm"
                style={{ backgroundColor: VISA_COLORS[cat] }}
              />
              {VISA_LABELS[cat]}
            </span>
          )
        )}
      </div>
    </div>
  );
}

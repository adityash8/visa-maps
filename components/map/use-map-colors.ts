"use client";

import { useMemo } from "react";
import type { VisaRulesMap, VisaCategory } from "@/lib/constants";
import { VISA_COLORS, DEFAULT_COLOR, HOME_COLOR } from "@/lib/constants";
import { getVisaRule, getDualVisaRule } from "@/lib/visa-data";

type MapExpression = ["match", ["get", string], ...Array<string | string[]>];

export function useMapColors(
  rules: VisaRulesMap | null,
  passport: string,
  passport2: string | null,
  filter: VisaCategory | null
): MapExpression | string {
  return useMemo(() => {
    if (!rules || !rules[passport]) return DEFAULT_COLOR;

    const destinations = rules[passport];
    const entries: string[] = [];

    for (const [dest, rule] of Object.entries(destinations)) {
      const effectiveRule = passport2
        ? getDualVisaRule(rules, passport, passport2, dest)
        : rule;

      if (!effectiveRule) continue;

      const color = VISA_COLORS[effectiveRule.category];

      if (filter && effectiveRule.category !== filter) {
        // Dimmed: use a low-opacity version (just lighter color)
        entries.push(dest, `${color}40`);
      } else {
        entries.push(dest, color);
      }
    }

    // Add home country color
    entries.push(passport, HOME_COLOR);
    if (passport2) {
      entries.push(passport2, HOME_COLOR);
    }

    return ["match", ["get", "ISO_A2_EH"], ...entries, DEFAULT_COLOR] as MapExpression;
  }, [rules, passport, passport2, filter]);
}

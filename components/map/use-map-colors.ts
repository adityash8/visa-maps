"use client";

import { useMemo } from "react";
import type { VisaRulesMap, VisaCategory } from "@/lib/constants";
import { VISA_COLORS, DEFAULT_COLOR, HOME_COLOR } from "@/lib/constants";
import { getBestVisaRule } from "@/lib/visa-data";

export type MapExpression = ["match", ["get", string], string, string, ...string[], string];

export function useMapColors(
  rules: VisaRulesMap | null,
  passport: string,
  passport2: string | null,
  filter: VisaCategory | null
): MapExpression | string {
  return useMemo(() => {
    if (!rules) return DEFAULT_COLOR;

    const destinations = new Set([
      ...Object.keys(rules[passport] ?? {}),
      ...Object.keys(passport2 ? rules[passport2] ?? {} : {}),
    ]);
    const entries: string[] = [];

    for (const dest of Array.from(destinations)) {
      if (dest === passport || dest === passport2) continue;
      const selection = getBestVisaRule(rules, passport, passport2, dest);
      if (!selection) continue;
      const effectiveRule = selection.rule;

      const color = VISA_COLORS[effectiveRule.category];

      if (filter && effectiveRule.category !== filter) {
        // Dimmed: use a low-opacity version (just lighter color)
        entries.push(dest, `${color}40`);
      } else {
        entries.push(dest, color);
      }
    }

    // Add home country color
    if (passport2 && passport2 !== passport) {
      entries.push(passport2, HOME_COLOR);
    }

    return ["match", ["get", "ISO_A2_EH"], passport, HOME_COLOR, ...entries, DEFAULT_COLOR] as MapExpression;
  }, [rules, passport, passport2, filter]);
}

export const VISA_CATEGORIES = [
  "visa_free",
  "evisa",
  "visa_on_arrival",
  "visa_required",
] as const;

export type VisaCategory = (typeof VISA_CATEGORIES)[number];

export const VISA_COLORS: Record<VisaCategory, string> = {
  visa_free: "#22c55e",
  evisa: "#3b82f6",
  visa_on_arrival: "#f59e0b",
  visa_required: "#ef4444",
};

export const VISA_LABELS: Record<VisaCategory, string> = {
  visa_free: "Visa Free",
  evisa: "eVisa",
  visa_on_arrival: "Visa on Arrival",
  visa_required: "Visa Required",
};

export const DEFAULT_COLOR = "#d1d5db";
export const HOME_COLOR = "#8b5cf6";

export type VisaRule = {
  category: VisaCategory;
  duration?: number;
  notes?: string;
};

export type VisaRulesMap = Record<string, Record<string, VisaRule>>;

export type Passport = {
  code: string;
  name: string;
  flag: string;
  rank: number;
};

// Free CartoDB Positron basemap (no token needed)
export const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

export const INITIAL_VIEW = {
  center: [20, 20] as [number, number],
  zoom: 1.8,
};

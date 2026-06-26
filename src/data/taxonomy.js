// Single source of truth for the tag system described in the site schematic:
// Context | Water stress | Water outcome | Scale | Cost | Evidence.
// Browse Options' sidebar, the Guided Explorer's questions, and the
// Adaptation Packet's recommendation matching all read from this file so
// the same key always means the same thing everywhere in the app.

export const CONTEXTS = [
  { key: "irrigated", label: "Irrigated fields / orchards" },
  { key: "groundwater", label: "Groundwater-dependent agriculture" },
  { key: "livestock", label: "Livestock operations" },
  { key: "rangeland", label: "Rangeland" },
  { key: "canals", label: "Canals & ditches" },
  { key: "riparian", label: "Riparian areas" },
  { key: "retired", label: "Retired farmland" },
  { key: "regional", label: "Regional / watershed planning" },
];

export const WATER_STRESSES = [
  { key: "drought", label: "Drought" },
  { key: "groundwater-decline", label: "Groundwater decline" },
  { key: "surface-shortage", label: "Surface-water shortage" },
  { key: "salinity", label: "Salinity / water quality" },
  { key: "heat-stress", label: "Heat stress" },
  { key: "pumping-costs", label: "High pumping costs" },
  { key: "soil-moisture-deficit", label: "Soil moisture deficit" },
  { key: "allocation-limits", label: "Allocation limits" },
];

export const WATER_OUTCOMES = [
  { key: "reduce-demand", label: "Reduce water demand" },
  { key: "improve-timing", label: "Improve timing / precision" },
  { key: "recharge", label: "Capture / reuse / recharge" },
  { key: "soil-storage", label: "Increase soil water storage" },
  { key: "flexibility", label: "Increase flexibility under shortage" },
  { key: "water-quality", label: "Protect water quality" },
];

export const PRIORITIES = [
  { key: "producer-scale", label: "Producer-scale action" },
  { key: "low-cost", label: "Low up-front cost" },
  { key: "funding-eligible", label: "Funding eligibility" },
  { key: "evidence-base", label: "Strong evidence base" },
  { key: "low-labor", label: "Low labor / maintenance" },
  { key: "arid-suitable", label: "Arid-region suitability" },
];

export const SCALES = [
  { key: "on-farm", label: "On-farm" },
  { key: "district", label: "District / regional" },
];

export const COSTS = [
  { key: "low", label: "Low cost" },
  { key: "medium", label: "Medium cost" },
  { key: "high", label: "High cost" },
];

export const EVIDENCE_LEVELS = [
  { key: "emerging", label: "Emerging" },
  { key: "moderate", label: "Moderate" },
  { key: "strong", label: "Strong / peer-reviewed" },
];

export function labelFor(list, key) {
  return list.find((item) => item.key === key)?.label ?? key;
}

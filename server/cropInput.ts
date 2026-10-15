// Validation and prompt text for crop-recommendation soil inputs.
export const SEASONS = ["Spring", "Summer", "Autumn", "Winter"];

// Plausibility bounds for values typed from a soil test report (kg/ha for N, P, K). These only
// catch typos and unit mix-ups; they are not agronomic ratings.
export const SOIL_BOUNDS = {
  n: { min: 0, max: 2000, label: "Nitrogen (N), kg/ha" },
  p: { min: 0, max: 1000, label: "Phosphorus (P), kg/ha" },
  k: { min: 0, max: 3000, label: "Potassium (K), kg/ha" },
  ph: { min: 3, max: 10, label: "Soil pH" },
} as const;
type SoilKey = keyof typeof SOIL_BOUNDS;

export const cleanText = (v: unknown, max = 120) =>
  typeof v === "string" ? v.replace(/[\r\n`]/g, " ").trim().slice(0, max) : "";

function isValidAreaSummary(s: any) {
  return (
    s &&
    typeof s.dominant === "string" &&
    Number.isFinite(s.total) &&
    s.total > 0 &&
    s.counts &&
    typeof s.counts === "object" &&
    Object.values(s.counts).every((v) => Number.isFinite(v as number) && (v as number) >= 0)
  );
}

// Each soil parameter may be a measured number (farmer's own soil test report), an area-level
// soil-test summary, or absent. Absent values are stated as unknown in the prompt rather than
// guessed. Returns validation errors (bad numbers only) and prompt lines.
export function buildSoilDescription(soilData: any): { errors: string[]; lines: string[] } {
  const errors: string[] = [];
  const lines: string[] = [];
  const soil = soilData?.soil ?? {};
  const ctx = soilData?.soilContext ?? {};

  for (const key of Object.keys(SOIL_BOUNDS) as SoilKey[]) {
    const bounds = SOIL_BOUNDS[key];
    const param = soil[key] ?? {};
    const value = param.value;
    if (value !== null && value !== undefined && value !== "") {
      const num = Number(value);
      if (!Number.isFinite(num) || num < bounds.min || num > bounds.max) {
        errors.push(`${bounds.label} must be between ${bounds.min} and ${bounds.max}`);
      } else {
        lines.push(`${bounds.label}: ${num} (farmer-entered value from their own soil test)`);
      }
    } else if (isValidAreaSummary(param.area)) {
      const a = param.area;
      const dist = Object.entries(a.counts)
        .map(([cls, count]) => `${cleanText(cls, 20)} ${Math.round(((count as number) / a.total) * 100)}%`)
        .join(", ");
      lines.push(
        `${bounds.label.replace(", kg/ha", "")}: farm value unknown. Government Soil Health Card tests for the surrounding ` +
          `${cleanText(ctx.level, 20) || "area"} (${cleanText(ctx.areaName) || "unknown area"}, cycle ${cleanText(ctx.cycle, 20) || "unknown"}) ` +
          `rated ${a.total} samples as ${dist}; most common rating "${cleanText(a.dominant, 20)}".`,
      );
    } else {
      lines.push(
        `${bounds.label.replace(", kg/ha", "")}: unknown (no soil test data available for this location). Do not assume a value.`,
      );
    }
  }
  return { errors, lines };
}

/**
 * Convert Z-score to percentile using the standard normal cumulative distribution function.
 * Uses the Abramowitz and Stegun approximation (formula 7.1.26).
 */
export function zScoreToPercentile(zScore: number): number {
  const absZ = Math.abs(zScore);
  const t = 1.0 / (1.0 + 0.2316419 * absZ);
  const d = 0.3989423 * Math.exp((-absZ * absZ) / 2.0);
  const prob =
    d * t * ((((1.330274 * t - 1.821256) * t + 1.781478) * t - 0.3565638) * t + 0.3193815);

  const cumulative = zScore > 0 ? 1.0 - prob : prob;
  return Math.round(cumulative * 1000) / 10;
}

/**
 * Map Z-score to WHO status color classification.
 * Green: >= -2 SD (normal)
 * Yellow: -3 to -2 SD (moderate malnutrition / at risk)
 * Red: < -3 SD (severe malnutrition)
 */
export function zScoreToStatusColor(zScore: number): "green" | "yellow" | "red" {
  if (zScore >= -2) return "green";
  if (zScore > -3) return "yellow";
  return "red";
}

import { describe, expect, it } from "bun:test";
import { calculateAgeMonths, calculateCorrectedAge } from "../src/utils/age";

describe("calculateCorrectedAge", () => {
  it("returns chronological age for term infant (40 weeks)", () => {
    const dob = new Date("2026-01-15");
    const measureDate = new Date("2026-04-15");
    const result = calculateCorrectedAge(dob, measureDate, 40);
    expect(result.useCorrectedAge).toBe(false);
    expect(result.correctedAgeDays).toBeGreaterThan(85);
    expect(result.correctedAgeDays).toBeLessThan(95);
  });

  it("applies prematurity correction for 32-week preemie at 3 months", () => {
    const dob = new Date("2026-01-15");
    const measureDate = new Date("2026-04-15");
    const result = calculateCorrectedAge(dob, measureDate, 32);
    expect(result.useCorrectedAge).toBe(true);
    expect(result.correctedAgeDays).toBeLessThan(50);
  });

  it("does not correct after 24 months chronological age", () => {
    const dob = new Date("2024-01-15");
    const measureDate = new Date("2026-04-15");
    const result = calculateCorrectedAge(dob, measureDate, 32);
    expect(result.useCorrectedAge).toBe(false);
  });

  it("handles null gestational age (unknown)", () => {
    const dob = new Date("2026-01-15");
    const measureDate = new Date("2026-04-15");
    const result = calculateCorrectedAge(dob, measureDate, null);
    expect(result.useCorrectedAge).toBe(false);
  });
});

describe("calculateAgeMonths", () => {
  it("returns 0 for same day", () => {
    const dob = new Date("2026-01-15");
    expect(calculateAgeMonths(dob, new Date("2026-01-15"))).toBe(0);
  });

  it("returns approximately 6 months", () => {
    const dob = new Date("2026-01-15");
    const age = calculateAgeMonths(dob, new Date("2026-07-15"));
    expect(age).toBeGreaterThanOrEqual(5.9);
    expect(age).toBeLessThanOrEqual(6.1);
  });
});

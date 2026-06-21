import { describe, expect, it } from "bun:test";
import { zScoreToPercentile, zScoreToStatusColor } from "../src/utils/percentile";

describe("zScoreToPercentile", () => {
  it("returns 50th percentile for z-score of 0", () => {
    expect(zScoreToPercentile(0)).toBe(50);
  });

  it("returns approximately 15.9 for z-score of -1", () => {
    const p = zScoreToPercentile(-1);
    expect(p).toBeGreaterThanOrEqual(15);
    expect(p).toBeLessThanOrEqual(17);
  });

  it("returns approximately 2.3 for z-score of -2", () => {
    const p = zScoreToPercentile(-2);
    expect(p).toBeGreaterThanOrEqual(2);
    expect(p).toBeLessThanOrEqual(3);
  });

  it("returns approximately 97.7 for z-score of 2", () => {
    const p = zScoreToPercentile(2);
    expect(p).toBeGreaterThanOrEqual(97);
    expect(p).toBeLessThanOrEqual(98);
  });
});

describe("zScoreToStatusColor", () => {
  it("returns green for z-score >= -2", () => {
    expect(zScoreToStatusColor(0)).toBe("green");
    expect(zScoreToStatusColor(-1)).toBe("green");
    expect(zScoreToStatusColor(-2)).toBe("green");
  });

  it("returns yellow for z-score between -3 and -2", () => {
    expect(zScoreToStatusColor(-2.1)).toBe("yellow");
    expect(zScoreToStatusColor(-2.9)).toBe("yellow");
  });

  it("returns red for z-score < -3", () => {
    expect(zScoreToStatusColor(-3.0)).toBe("red");
    expect(zScoreToStatusColor(-4.0)).toBe("red");
  });
});

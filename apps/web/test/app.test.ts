import { describe, expect, it } from "bun:test";

describe("health check", () => {
  it("should pass a basic assertion", () => {
    expect(1 + 1).toBe(2);
  });
});

import { describe, expect, it } from "bun:test";
import { hashPassword, verifyPassword } from "../src/lib/hash";

describe("hashPassword (bcrypt)", () => {
  it("generates a hash different from the password", async () => {
    const hash = await hashPassword("test-password");
    expect(hash).not.toBe("test-password");
    expect(hash.length).toBeGreaterThan(20);
  });

  it("verifies correct password", async () => {
    const hash = await hashPassword("correct-password");
    const result = await verifyPassword("correct-password", hash);
    expect(result).toBe(true);
  });

  it("rejects incorrect password", async () => {
    const hash = await hashPassword("correct-password");
    const result = await verifyPassword("wrong-password", hash);
    expect(result).toBe(false);
  });

  it("generates different hashes for same password", async () => {
    const h1 = await hashPassword("test-password");
    const h2 = await hashPassword("test-password");
    expect(h1).not.toBe(h2);
  });
});

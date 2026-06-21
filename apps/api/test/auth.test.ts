import { describe, expect, it } from "bun:test";
import { constants, publicEncrypt } from "node:crypto";
import { loadEnv } from "../src/env";
import { createDb } from "../src/lib/db";
import { setDecryptionKey } from "../src/lib/decryption";
import { getPrivateKeyPem, getPublicKeyPem, initJwt } from "../src/lib/jwt";
import { login, register } from "../src/modules/auth/auth.service";

const env = loadEnv();
createDb(env);
await initJwt(env);
setDecryptionKey(getPrivateKeyPem());

function encryptCredential(plaintext: string): string {
  const pem = getPublicKeyPem();
  const encrypted = publicEncrypt(
    { key: pem, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256" },
    Buffer.from(plaintext),
  );
  return encrypted.toString("base64");
}

describe("auth service", () => {
  const testEmail = `auth-test-${Date.now()}@test.local`;
  const testPassword = "testpass123";
  const testName = "Test User";

  it("registers a parent user", async () => {
    const result = await register({
      email: testEmail,
      credential: encryptCredential(testPassword),
      fullName: testName,
      languagePreference: "en",
      countryCode: "ID",
    });

    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(testEmail);
    expect(result.user.role).toBe("parent");
    expect(result.user.id).toBeDefined();
  });

  it("rejects duplicate email", async () => {
    try {
      await register({
        email: testEmail,
        credential: encryptCredential(testPassword),
        fullName: testName,
        languagePreference: "en",
        countryCode: "ID",
      });
      expect(false).toBe(true);
    } catch (err) {
      const e = err as { code?: string };
      expect(e.code).toBe("CONFLICT");
    }
  });

  it("logs in with correct credentials", async () => {
    const result = await login({
      email: testEmail,
      credential: encryptCredential(testPassword),
    });

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user.email).toBe(testEmail);
  });

  it("rejects incorrect password", async () => {
    try {
      await login({
        email: testEmail,
        credential: encryptCredential("wrongpassword"),
      });
      expect(false).toBe(true);
    } catch (err) {
      const e = err as { code?: string };
      expect(e.code).toBe("UNAUTHORIZED");
    }
  });

  it("rejects short password", async () => {
    try {
      await register({
        email: `short-${Date.now()}@test.local`,
        credential: encryptCredential("short"),
        fullName: testName,
        languagePreference: "en",
        countryCode: "ID",
      });
      expect(false).toBe(true);
    } catch (err) {
      const e = err as { code?: string };
      expect(e.code).toBe("UNAUTHORIZED");
    }
  });

  it("rejects non-encrypted credential on login", async () => {
    try {
      await login({
        email: testEmail,
        credential: "plain-text-password",
      });
      expect(false).toBe(true);
    } catch (err) {
      const e = err as { code?: string };
      expect(e.code).toBe("UNAUTHORIZED");
    }
  });
});

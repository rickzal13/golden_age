import { describe, expect, it } from "bun:test";
import { eq } from "drizzle-orm";
import { loadEnv } from "../src/env";
import { createDb, getDb } from "../src/lib/db";
import { users } from "../src/lib/db/schema";
import { setDecryptionKey } from "../src/lib/decryption";
import { hashPassword } from "../src/lib/hash";
import { getPrivateKeyPem, initJwt } from "../src/lib/jwt";
import {
  archiveChild,
  createChild,
  getChild,
  listChildren,
  updateChild,
} from "../src/modules/children/children.service";

const env = loadEnv();
createDb(env);
const db = getDb();
await initJwt(env);
setDecryptionKey(getPrivateKeyPem());

const testParentId = crypto.randomUUID();
const otherParentId = crypto.randomUUID();

await db.insert(users).values([
  {
    id: testParentId,
    email: `child-test-${Date.now()}@test.local`,
    fullName: "Test Parent",
    role: "parent",
    passwordHash: await hashPassword("testpass123"),
  },
  {
    id: otherParentId,
    email: `child-test-other-${Date.now()}@test.local`,
    fullName: "Other Parent",
    role: "parent",
    passwordHash: await hashPassword("testpass123"),
  },
]);

describe("children service", () => {
  let childId: string;

  it("creates a child", async () => {
    const child = await createChild(testParentId, {
      name: "Budi Santoso",
      dateOfBirth: "2026-01-15",
      gender: "male",
    });

    expect(child.id).toBeDefined();
    expect(child.name).toBe("Budi Santoso");
    expect(child.gender).toBe("male");
    expect(child.status).toBe("active");
    childId = child.id;
  });

  it("creates a child with optional fields", async () => {
    const child = await createChild(testParentId, {
      name: "Siti Rahayu",
      dateOfBirth: "2025-06-01",
      gender: "female",
      birthWeightG: 3200,
      birthLengthCm: 50,
      birthBloodType: "O+",
      birthNotes: "Healthy delivery",
    });

    expect(child.birthWeightG).toBe(3200);
    expect(child.birthBloodType).toBe("O+");
  });

  it("lists children for a parent", async () => {
    const result = await listChildren(testParentId);
    expect(result.length).toBeGreaterThanOrEqual(2);
  });

  it("gets a specific child", async () => {
    const child = await getChild(childId, testParentId);
    expect(child.name).toBe("Budi Santoso");
  });

  it("rejects access from another parent", async () => {
    try {
      await getChild(childId, otherParentId);
      expect(false).toBe(true);
    } catch (err) {
      const e = err as { code?: string };
      expect(e.code).toBe("FORBIDDEN");
    }
  });

  it("updates a child", async () => {
    const updated = await updateChild(childId, testParentId, {
      name: "Budi Santoso Updated",
    });
    expect(updated).toBeDefined();
    if (updated) expect(updated.name).toBe("Budi Santoso Updated");
  });

  it("archives a child", async () => {
    await archiveChild(childId, testParentId);
    try {
      await getChild(childId, testParentId);
      expect(false).toBe(true);
    } catch (err) {
      const e = err as { code?: string };
      expect(e.code).toBe("NOT_FOUND");
    }
  });

  it("creates a minimal child", async () => {
    const child = await createChild(testParentId, {
      name: "Minimal Child",
      dateOfBirth: "2026-03-01",
      gender: "male",
    });
    expect(child.id).toBeDefined();
  });

  it("cleanup", async () => {
    await db.delete(users).where(eq(users.id, testParentId));
    await db.delete(users).where(eq(users.id, otherParentId));
  });
});

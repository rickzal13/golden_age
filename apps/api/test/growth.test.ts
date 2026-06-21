import { describe, expect, it } from "bun:test";
import { eq } from "drizzle-orm";
import { loadEnv } from "../src/env";
import { createDb, getDb } from "../src/lib/db";
import { children, users } from "../src/lib/db/schema";
import { setDecryptionKey } from "../src/lib/decryption";
import { hashPassword } from "../src/lib/hash";
import { getPrivateKeyPem, initJwt } from "../src/lib/jwt";
import {
  createGrowthRecord,
  deleteGrowthRecord,
  getGrowthSummary,
  listGrowthRecords,
} from "../src/modules/growth/growth.service";

const env = loadEnv();
createDb(env);
const db = getDb();
await initJwt(env);
setDecryptionKey(getPrivateKeyPem());

const parentId = crypto.randomUUID();
const childId = crypto.randomUUID();

await db.insert(users).values({
  id: parentId,
  email: `growth-test-${Date.now()}@test.local`,
  fullName: "Growth Test Parent",
  role: "parent",
  passwordHash: await hashPassword("testpass123"),
});

await db.insert(children).values({
  id: childId,
  parentId,
  name: "Growth Child",
  dateOfBirth: "2026-01-15",
  gender: "male",
});

describe("growth service", () => {
  let recordId: string;

  it("creates a weight record with z-score computation", async () => {
    const record = await createGrowthRecord(parentId, {
      childId,
      type: "weight",
      value: 7.5,
      unit: "kg",
      measurementDate: "2026-06-20",
    });

    expect(record.id).toBeDefined();
    expect(record.type).toBe("weight");
    expect(Number(record.value)).toBe(7.5);
    expect(record.zScore).not.toBeNull();
    expect(record.percentile).not.toBeNull();
    expect(record.statusColor).not.toBeNull();
    recordId = record.id;
  });

  it("creates a height record", async () => {
    const record = await createGrowthRecord(parentId, {
      childId,
      type: "height",
      value: 66,
      unit: "cm",
      measurementDate: "2026-06-20",
    });
    expect(record.type).toBe("height");
  });

  it("creates a record with optional notes", async () => {
    const record = await createGrowthRecord(parentId, {
      childId,
      type: "weight",
      value: 8.0,
      unit: "kg",
      measurementDate: "2026-07-20",
      notes: "After breakfast",
    });
    expect(record.notes).toBe("After breakfast");
  });

  it("creates a record without notes (null)", async () => {
    const record = await createGrowthRecord(parentId, {
      childId,
      type: "weight",
      value: 8.5,
      unit: "kg",
      measurementDate: "2026-08-20",
    });
    expect(record.notes).toBeNull();
  });

  it("lists growth records", async () => {
    const records = await listGrowthRecords(childId, parentId);
    expect(records.length).toBeGreaterThanOrEqual(4);
  });

  it("returns growth summary", async () => {
    const summary = await getGrowthSummary(childId, parentId);
    expect(summary.latestWeight).not.toBeNull();
    expect(summary.latestHeight).not.toBeNull();
    expect(summary.totalRecords).toBeGreaterThanOrEqual(4);
  });

  it("summary returns null for child with no records", async () => {
    const emptyChildId = crypto.randomUUID();
    await db.insert(children).values({
      id: emptyChildId,
      parentId,
      name: "Empty Child",
      dateOfBirth: "2026-01-01",
      gender: "female",
    });

    const summary = await getGrowthSummary(emptyChildId, parentId);
    expect(summary.latestWeight).toBeNull();
    expect(summary.latestHeight).toBeNull();
    expect(summary.totalRecords).toBe(0);
  });

  it("rejects access from wrong parent", async () => {
    try {
      await listGrowthRecords(childId, crypto.randomUUID());
      expect(false).toBe(true);
    } catch (err) {
      const e = err as { code?: string };
      expect(e.code).toBe("FORBIDDEN");
    }
  });

  it("deletes a growth record", async () => {
    // Create a temporary record to delete
    const temp = await createGrowthRecord(parentId, {
      childId,
      type: "weight",
      value: 9.0,
      unit: "kg",
      measurementDate: "2026-09-01",
    });
    expect(temp.id).toBeDefined();

    await deleteGrowthRecord(temp.id, childId, parentId);

    // Verify it's gone
    const records = await listGrowthRecords(childId, parentId);
    expect(records.find((r) => r.id === temp.id)).toBeUndefined();
  });

  it("cleanup", async () => {
    await db.delete(children).where(eq(children.id, childId));
    await db.delete(users).where(eq(users.id, parentId));
  });
});

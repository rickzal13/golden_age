import { and, eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";
import { getDb } from "../../lib/db";
import { children } from "../../lib/db/schema";
import { ForbiddenError, NotFoundError } from "../../lib/errors";
import type { CreateChildInput, UpdateChildInput } from "./children.schema";

type ChildInsert = InferInsertModel<typeof children>;

export async function listChildren(parentId: string) {
  const db = getDb();
  return db
    .select()
    .from(children)
    .where(and(eq(children.parentId, parentId), eq(children.status, "active")))
    .orderBy(children.createdAt);
}

export async function getChild(childId: string, parentId: string) {
  const db = getDb();
  const [child] = await db
    .select()
    .from(children)
    .where(and(eq(children.id, childId), eq(children.status, "active")))
    .limit(1);

  if (!child) throw new NotFoundError("Child not found");
  if (child.parentId !== parentId) throw new ForbiddenError("Access denied");

  return child;
}

export async function createChild(parentId: string, input: CreateChildInput) {
  const db = getDb();
  const values: ChildInsert = {
    parentId,
    name: input.name,
    dateOfBirth: input.dateOfBirth,
    gender: input.gender,
  };
  if (input.photoUrl) values.photoUrl = input.photoUrl;
  if (input.birthWeightG != null) values.birthWeightG = input.birthWeightG;
  if (input.birthLengthCm != null) values.birthLengthCm = input.birthLengthCm.toString();
  if (input.birthBloodType) values.birthBloodType = input.birthBloodType;
  if (input.birthNotes) values.birthNotes = input.birthNotes;

  const [child] = await db.insert(children).values(values).returning();

  if (!child) throw new Error("Failed to create child");
  return child;
}

export async function updateChild(childId: string, parentId: string, input: UpdateChildInput) {
  const db = getDb();

  const [existing] = await db
    .select({ id: children.id, parentId: children.parentId })
    .from(children)
    .where(and(eq(children.id, childId), eq(children.status, "active")))
    .limit(1);

  if (!existing) throw new NotFoundError("Child not found");
  if (existing.parentId !== parentId) throw new ForbiddenError("Access denied");

  const set: Partial<ChildInsert> = { updatedAt: new Date() };
  if (input.name !== undefined) set.name = input.name;
  if (input.dateOfBirth !== undefined) set.dateOfBirth = input.dateOfBirth;
  if (input.gender !== undefined) set.gender = input.gender;
  if (input.photoUrl !== undefined) set.photoUrl = input.photoUrl;
  if (input.birthWeightG !== undefined) set.birthWeightG = input.birthWeightG;
  if (input.birthLengthCm !== undefined)
    set.birthLengthCm = input.birthLengthCm?.toString() ?? null;
  if (input.birthBloodType !== undefined) set.birthBloodType = input.birthBloodType;
  if (input.birthNotes !== undefined) set.birthNotes = input.birthNotes;

  const [updated] = await db.update(children).set(set).where(eq(children.id, childId)).returning();

  return updated;
}

export async function archiveChild(childId: string, parentId: string) {
  const db = getDb();

  const [existing] = await db
    .select({ id: children.id, parentId: children.parentId })
    .from(children)
    .where(and(eq(children.id, childId), eq(children.status, "active")))
    .limit(1);

  if (!existing) throw new NotFoundError("Child not found");
  if (existing.parentId !== parentId) throw new ForbiddenError("Access denied");

  await db
    .update(children)
    .set({ status: "archived", updatedAt: new Date() })
    .where(eq(children.id, childId));
}

import { zScoreToPercentile, zScoreToStatusColor } from "@golden-age/shared/utils";
import { and, eq } from "drizzle-orm";
import { getDb } from "../../lib/db";
import { children, growthRecords } from "../../lib/db/schema";
import { ForbiddenError, NotFoundError } from "../../lib/errors";
import { computeZscore, getLmsAtAge, getWhoData } from "./growth.calculator";
import type { CreateGrowthInput, UpdateGrowthInput } from "./growth.schema";

export async function listGrowthRecords(childId: string, parentId: string) {
  await verifyOwnership(childId, parentId);
  const db = getDb();
  return db
    .select()
    .from(growthRecords)
    .where(eq(growthRecords.childId, childId))
    .orderBy(growthRecords.measurementDate);
}

export async function createGrowthRecord(parentId: string, input: CreateGrowthInput) {
  await verifyOwnership(input.childId, parentId);
  const db = getDb();

  const [child] = await db
    .select({
      gender: children.gender,
      dateOfBirth: children.dateOfBirth,
    })
    .from(children)
    .where(eq(children.id, input.childId))
    .limit(1);
  if (!child) throw new NotFoundError("Child not found");

  const measureDate = new Date(input.measurementDate);
  const ageMonths = Math.floor(
    (measureDate.getTime() - new Date(child.dateOfBirth).getTime()) /
      (1000 * 60 * 60 * 24 * 30.4375),
  );

  const chartType = input.type === "weight" ? "wfa" : input.type === "height" ? "hfa" : "hcfa";
  const whoData = await getWhoData(chartType, child.gender as "male" | "female");
  let zScore: number | null = null;
  let percentile: number | null = null;
  let statusColor: "green" | "yellow" | "red" | null = null;

  if (whoData && ageMonths >= 0 && ageMonths <= 60) {
    const lms = getLmsAtAge(whoData, ageMonths);
    zScore = Math.round(computeZscore(input.value, lms) * 1000) / 1000;
    percentile = zScoreToPercentile(zScore);
    statusColor = zScoreToStatusColor(zScore);
  }

  const [record] = await db
    .insert(growthRecords)
    .values({
      childId: input.childId,
      type: input.type,
      value: input.value.toString(),
      unit: input.unit,
      measurementDate: input.measurementDate,
      correctedAgeDays: ageMonths * 30,
      correctedAgeMonths: ageMonths,
      zScore: zScore?.toString(),
      percentile: percentile?.toString(),
      statusColor,
      notes: input.notes,
      createdBy: parentId,
    })
    .returning();

  if (!record) throw new Error("Failed to create record");
  return record;
}

export async function updateGrowthRecord(
  recordId: string,
  parentId: string,
  childId: string,
  input: UpdateGrowthInput,
) {
  await verifyOwnership(childId, parentId);
  const db = getDb();

  const [existing] = await db
    .select()
    .from(growthRecords)
    .where(eq(growthRecords.id, recordId))
    .limit(1);
  if (!existing) throw new NotFoundError("Record not found");
  if (existing.childId !== childId) throw new ForbiddenError("Access denied");

  const set: Record<string, unknown> = { updatedAt: new Date() };
  if (input.value !== undefined) set.value = input.value.toString();
  if (input.measurementDate !== undefined) set.measurementDate = input.measurementDate;
  if (input.notes !== undefined) set.notes = input.notes;

  // Recompute z-score if value changed
  if (input.value !== undefined) {
    const [child] = await db
      .select({ gender: children.gender, dateOfBirth: children.dateOfBirth })
      .from(children)
      .where(eq(children.id, childId))
      .limit(1);
    if (child) {
      const measureDate = input.measurementDate
        ? new Date(input.measurementDate)
        : new Date(existing.measurementDate);
      const ageMonths = Math.floor(
        (measureDate.getTime() - new Date(child.dateOfBirth).getTime()) /
          (1000 * 60 * 60 * 24 * 30.4375),
      );
      const chartType =
        existing.type === "weight" ? "wfa" : existing.type === "height" ? "hfa" : "hcfa";
      const whoData = await getWhoData(chartType, child.gender as "male" | "female");
      if (whoData && ageMonths >= 0 && ageMonths <= 60) {
        const lms = getLmsAtAge(whoData, ageMonths);
        const z = computeZscore(input.value, lms);
        set.zScore = Math.round(z * 1000) / 1000;
        set.percentile = zScoreToPercentile(z);
        set.statusColor = zScoreToStatusColor(z);
      }
    }
  }

  const [updated] = await db
    .update(growthRecords)
    .set(set)
    .where(eq(growthRecords.id, recordId))
    .returning();
  return updated;
}

export async function getChartData(childId: string, parentId: string, chartType: string) {
  await verifyOwnership(childId, parentId);
  const db = getDb();

  const [child] = await db
    .select({ gender: children.gender })
    .from(children)
    .where(eq(children.id, childId))
    .limit(1);
  if (!child) throw new NotFoundError("Child not found");

  const measurementType =
    chartType === "wfa" ? "weight" : chartType === "hfa" ? "height" : "head_circumference";

  const records = await db
    .select({
      value: growthRecords.value,
      measurementDate: growthRecords.measurementDate,
      correctedAgeMonths: growthRecords.correctedAgeMonths,
      percentile: growthRecords.percentile,
      statusColor: growthRecords.statusColor,
      type: growthRecords.type,
    })
    .from(growthRecords)
    .where(and(eq(growthRecords.childId, childId), eq(growthRecords.type, measurementType)))
    .orderBy(growthRecords.measurementDate);

  const whoData = await getWhoData(chartType, child.gender as "male" | "female");
  const percentileCurves: Array<{
    percentile: number;
    points: Array<{ age_months: number; value: number }>;
  }> = [];

  if (whoData) {
    for (const pct of [3, 15, 50, 85, 97] as const) {
      const zForPct = { 3: -1.881, 15: -1.036, 50: 0, 85: 1.036, 97: 1.881 }[pct];
      percentileCurves.push({
        percentile: pct,
        points: whoData.map((row) => {
          const value = row.M * Math.pow(1 + row.L * row.S * zForPct, 1 / row.L);
          return { age_months: row.age_months, value: Math.round(value * 10) / 10 };
        }),
      });
    }
  }

  const points = records.map((r) => ({
    date: r.measurementDate,
    ageMonths: r.correctedAgeMonths,
    value: Number(r.value),
    percentile: r.percentile ? Number(r.percentile) : null,
    statusColor: r.statusColor,
  }));

  return { points, percentileCurves, childName: "" };
}

async function verifyOwnership(childId: string, parentId: string) {
  const db = getDb();
  const [child] = await db
    .select({ parentId: children.parentId })
    .from(children)
    .where(eq(children.id, childId))
    .limit(1);
  if (!child) throw new NotFoundError("Child not found");
  if (child.parentId !== parentId) throw new ForbiddenError("Access denied");
}

export async function getGrowthSummary(childId: string, parentId: string) {
  await verifyOwnership(childId, parentId);
  const db = getDb();

  const records = await db
    .select({
      type: growthRecords.type,
      value: growthRecords.value,
      measurementDate: growthRecords.measurementDate,
      statusColor: growthRecords.statusColor,
    })
    .from(growthRecords)
    .where(eq(growthRecords.childId, childId))
    .orderBy(growthRecords.measurementDate);

  const weightRecords = records.filter((r) => r.type === "weight");
  const heightRecords = records.filter((r) => r.type === "height");

  return {
    latestWeight:
      weightRecords.length > 0
        ? {
            value: Number(weightRecords[weightRecords.length - 1]!.value),
            date: weightRecords[weightRecords.length - 1]!.measurementDate,
            statusColor: weightRecords[weightRecords.length - 1]!.statusColor,
          }
        : null,
    latestHeight:
      heightRecords.length > 0
        ? {
            value: Number(heightRecords[heightRecords.length - 1]!.value),
            date: heightRecords[heightRecords.length - 1]!.measurementDate,
            statusColor: heightRecords[heightRecords.length - 1]!.statusColor,
          }
        : null,
    lastMeasurementDate: records.length > 0 ? records[records.length - 1]!.measurementDate : null,
    totalRecords: records.length,
  };
}

export async function deleteGrowthRecord(recordId: string, childId: string, parentId: string) {
  await verifyOwnership(childId, parentId);
  const db = getDb();

  const [existing] = await db
    .select({ id: growthRecords.id, childId: growthRecords.childId })
    .from(growthRecords)
    .where(eq(growthRecords.id, recordId))
    .limit(1);

  if (!existing) throw new NotFoundError("Record not found");
  if (existing.childId !== childId) throw new ForbiddenError("Access denied");

  await db.delete(growthRecords).where(eq(growthRecords.id, recordId));
}

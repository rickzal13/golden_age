import { z } from "zod";

export const createGrowthSchema = z.object({
  childId: z.string().uuid(),
  type: z.enum(["weight", "height", "head_circumference"]),
  value: z.number(),
  unit: z.string(),
  measurementDate: z.string(),
  notes: z.string().max(500).optional().nullable(),
});

export const updateGrowthSchema = z.object({
  value: z.number().optional(),
  measurementDate: z.string().optional(),
  notes: z.string().max(500).optional().nullable(),
});

export type CreateGrowthInput = z.infer<typeof createGrowthSchema>;
export type UpdateGrowthInput = z.infer<typeof updateGrowthSchema>;

import { z } from "zod";

export const createChildSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  gender: z.enum(["male", "female"]),
  dateOfBirth: z.string().refine((val) => !Number.isNaN(Date.parse(val)), "Invalid date of birth"),
  photoUrl: z.string().optional(),
  birthWeightG: z.number().min(500).max(8000).optional().nullable(),
  birthLengthCm: z.number().min(20).max(70).optional().nullable(),
  birthBloodType: z.string().max(5).optional().nullable(),
  birthNotes: z.string().max(1000).optional().nullable(),
});

export const updateChildSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  gender: z.enum(["male", "female"]).optional(),
  dateOfBirth: z
    .string()
    .refine((val) => !Number.isNaN(Date.parse(val)), "Invalid date of birth")
    .optional(),
  photoUrl: z.string().optional().nullable(),
  birthWeightG: z.number().min(500).max(8000).optional().nullable(),
  birthLengthCm: z.number().min(20).max(70).optional().nullable(),
  birthBloodType: z.string().max(5).optional().nullable(),
  birthNotes: z.string().max(1000).optional().nullable(),
});

export type CreateChildInput = z.infer<typeof createChildSchema>;
export type UpdateChildInput = z.infer<typeof updateChildSchema>;

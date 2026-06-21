import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  credential: z.string().min(1, "Credential is required"),
  fullName: z.string().min(1, "Name is required").max(255),
  languagePreference: z.enum(["en", "id"]).default("en"),
  countryCode: z.string().length(2).default("ID"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  credential: z.string().min(1, "Credential is required"),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(1).max(255).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  languagePreference: z.enum(["en", "id"]).optional(),
  countryCode: z.string().length(2).optional(),
  timezone: z.string().max(50).optional(),
  notificationPreferences: z.record(z.unknown()).optional(),
});

export const changePasswordSchema = z.object({
  currentCredential: z.string().min(1, "Current password is required"),
  newCredential: z.string().min(1, "New password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

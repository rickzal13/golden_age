import type { SubscriptionTier, UserRole } from "../types";

export const ROLES: Record<UserRole, UserRole> = {
  parent: "parent",
  doctor: "doctor",
  midwife: "midwife",
  clinic_admin: "clinic_admin",
  system_admin: "system_admin",
} as const;

export const ROLE_LABELS: Record<UserRole, string> = {
  parent: "Parent",
  doctor: "Doctor",
  midwife: "Midwife",
  clinic_admin: "Clinic Admin",
  system_admin: "System Admin",
} as const;

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, SubscriptionTier> = {
  free: "free",
  premium: "premium",
  enterprise: "enterprise",
} as const;

export const PARENT_ROLES = ["parent"] as const;

export const CLINICIAN_ROLES = ["doctor", "midwife"] as const;

export const ADMIN_ROLES = ["clinic_admin", "system_admin"] as const;

export const ALL_ROLES = Object.keys(ROLES) as UserRole[];

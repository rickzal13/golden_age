export type UserRole = "parent" | "doctor" | "midwife" | "clinic_admin" | "system_admin";

export type SubscriptionTier = "free" | "premium" | "enterprise";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl: string | null;
  languagePreference: string;
  countryCode: string;
  timezone: string;
  subscriptionTier: SubscriptionTier;
  createdAt: string;
}

export type Gender = "male" | "female";

export type ChildStatus = "active" | "archived";

export interface Child {
  id: string;
  parentAdminId: string;
  name: string;
  dateOfBirth: string;
  gender: Gender;
  photoUrl: string | null;
  birthWeightG: number | null;
  birthLengthCm: number | null;
  birthHeadCircumferenceCm: number | null;
  gestationalAgeWeeks: number | null;
  birthBloodType: string | null;
  birthNotes: string | null;
  countryCode: string;
  status: ChildStatus;
  createdAt: string;
}

export type MeasurementType = "weight" | "height" | "head_circumference";

export type MeasurementSource = "parent_app" | "clinic_app" | "midwife_app" | "import";

export type StatusColor = "green" | "yellow" | "red";

export interface Measurement {
  id: string;
  childId: string;
  type: MeasurementType;
  value: number;
  unit: string;
  measurementDate: string;
  correctedAgeDays: number;
  correctedAgeMonths: number;
  zScore: number | null;
  percentile: number | null;
  statusColor: StatusColor | null;
  isSuspicious: boolean;
  source: MeasurementSource;
  notes: string | null;
  createdBy: string;
  createdAt: string;
}

export type VaccineStatus = "pending" | "completed" | "missed" | "contraindicated";

export interface VaccinationRecord {
  id: string;
  childId: string;
  vaccineScheduleId: string;
  vaccineName: string;
  doseNumber: number;
  status: VaccineStatus;
  administeredDate: string | null;
  recommendedAgeDays: number;
  progressPercent: number;
}

export type MilestoneCategory =
  | "motor_gross"
  | "motor_fine"
  | "language"
  | "cognitive"
  | "social_emotional";

export interface Milestone {
  id: string;
  categoryId: string;
  categoryName: string;
  title: string;
  description: string;
  expectedAgeMinMonths: number;
  expectedAgeMaxMonths: number;
  redFlag: boolean;
  achieved: boolean;
  achievedDate: string | null;
}

export type FamilyRole = "admin" | "editor" | "viewer";

export type FamilyStatus = "pending" | "active" | "revoked" | "expired";

export interface FamilyMember {
  id: string;
  userId: string;
  fullName: string;
  role: FamilyRole;
  status: FamilyStatus;
  invitedAt: string;
}

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export interface ApiError {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: Array<{ field: string; message: string }>;
    requestId: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    cursor: string | null;
    hasMore: boolean;
    total?: number;
  };
}

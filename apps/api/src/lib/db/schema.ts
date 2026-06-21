import {
  date,
  decimal,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ── Enums ──

export const userRoleEnum = pgEnum("user_role", [
  "parent",
  "doctor",
  "midwife",
  "clinic_admin",
  "system_admin",
]);

export const subscriptionTierEnum = pgEnum("subscription_tier", ["free", "premium", "enterprise"]);

export const genderEnum = pgEnum("gender", ["male", "female"]);

export const childStatusEnum = pgEnum("child_status", ["active", "archived"]);

// ── Users ──

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }).unique(),
  passwordHash: text("password_hash"),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull().default("parent"),
  avatarUrl: text("avatar_url"),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  phoneVerifiedAt: timestamp("phone_verified_at", { withTimezone: true }),
  languagePreference: varchar("language_preference", { length: 10 }).notNull().default("en"),
  countryCode: varchar("country_code", { length: 2 }).notNull().default("ID"),
  timezone: varchar("timezone", { length: 50 }).notNull().default("Asia/Jakarta"),
  notificationPreferences: jsonb("notification_preferences").default({}),
  subscriptionTier: subscriptionTierEnum("subscription_tier").notNull().default("free"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

// ── Refresh Tokens ──

export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: varchar("token_hash", { length: 255 }).notNull().unique(),
  deviceInfo: jsonb("device_info").default({}),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  revokedBy: varchar("revoked_by", { length: 50 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Children ──

export const children = pgTable("children", {
  id: uuid("id").defaultRandom().primaryKey(),
  parentId: uuid("parent_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  gender: genderEnum("gender").notNull(),
  photoUrl: text("photo_url"),
  birthWeightG: integer("birth_weight_g"),
  birthLengthCm: numeric("birth_length_cm", { precision: 5, scale: 2 }),
  birthBloodType: varchar("birth_blood_type", { length: 5 }),
  birthNotes: text("birth_notes"),
  countryCode: varchar("country_code", { length: 2 }).notNull().default("ID"),
  status: childStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── Growth Records ──

export const measurementTypeEnum = pgEnum("measurement_type", [
  "weight",
  "height",
  "head_circumference",
]);

export const statusColorEnum = pgEnum("status_color", ["green", "yellow", "red"]);

export const growthRecords = pgTable("growth_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  childId: uuid("child_id")
    .notNull()
    .references(() => children.id, { onDelete: "cascade" }),
  type: measurementTypeEnum("type").notNull(),
  value: decimal("value", { precision: 8, scale: 3 }).notNull(),
  unit: varchar("unit", { length: 10 }).notNull(),
  measurementDate: date("measurement_date").notNull(),
  correctedAgeDays: integer("corrected_age_days").notNull(),
  correctedAgeMonths: integer("corrected_age_months").notNull(),
  zScore: decimal("z_score", { precision: 6, scale: 3 }),
  percentile: decimal("percentile", { precision: 6, scale: 3 }),
  statusColor: statusColorEnum("status_color"),
  notes: text("notes"),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ── WHO Measurement Reference ──

export const measurementReference = pgTable("measurement_reference", {
  id: uuid("id").defaultRandom().primaryKey(),
  chartType: varchar("chart_type", { length: 10 }).notNull(),
  gender: genderEnum("gender").notNull(),
  ageMonths: integer("age_months").notNull(),
  L: decimal("L", { precision: 10, scale: 6 }).notNull(),
  M: decimal("M", { precision: 10, scale: 6 }).notNull(),
  S: decimal("S", { precision: 10, scale: 6 }).notNull(),
});

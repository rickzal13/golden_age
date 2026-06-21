CREATE TYPE "public"."measurement_type" AS ENUM('weight', 'height', 'head_circumference');--> statement-breakpoint
CREATE TYPE "public"."status_color" AS ENUM('green', 'yellow', 'red');--> statement-breakpoint
CREATE TABLE "growth_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"child_id" uuid NOT NULL,
	"type" "measurement_type" NOT NULL,
	"value" numeric(8, 3) NOT NULL,
	"unit" varchar(10) NOT NULL,
	"measurement_date" date NOT NULL,
	"corrected_age_days" integer NOT NULL,
	"corrected_age_months" integer NOT NULL,
	"z_score" numeric(6, 3),
	"percentile" numeric(6, 3),
	"status_color" "status_color",
	"notes" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "measurement_reference" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chart_type" varchar(10) NOT NULL,
	"gender" "gender" NOT NULL,
	"age_months" integer NOT NULL,
	"L" numeric(10, 6) NOT NULL,
	"M" numeric(10, 6) NOT NULL,
	"S" numeric(10, 6) NOT NULL
);--> statement-breakpoint
ALTER TABLE "growth_records" ADD CONSTRAINT "growth_records_child_id_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."children"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "growth_records" ADD CONSTRAINT "growth_records_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
import type { MeasurementType } from "../types";

export const MEASUREMENT_TYPES: Record<MeasurementType, MeasurementType> = {
  weight: "weight",
  height: "height",
  head_circumference: "head_circumference",
} as const;

export const MEASUREMENT_LABELS: Record<MeasurementType, string> = {
  weight: "Weight",
  height: "Height / Length",
  head_circumference: "Head Circumference",
} as const;

export const MEASUREMENT_UNITS: Record<MeasurementType, string> = {
  weight: "kg",
  height: "cm",
  head_circumference: "cm",
} as const;

export const VALID_WEIGHT_RANGE_KG = { min: 0.5, max: 30.0 } as const;

export const VALID_HEIGHT_RANGE_CM = { min: 15.0, max: 130.0 } as const;

export const VALID_HC_RANGE_CM = { min: 20.0, max: 60.0 } as const;

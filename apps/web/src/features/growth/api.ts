import { apiClient } from "../../lib/api-client";
import type { GrowthSummary } from "./hooks/useGrowthSummary";

interface GrowthRecord {
  id: string;
  childId: string;
  type: string;
  value: string;
  unit: string;
  measurementDate: string;
  notes: string | null;
  correctedAgeDays: number;
  correctedAgeMonths: number;
  zScore: string | null;
  percentile: string | null;
  statusColor: string | null;
  createdAt: string;
}

interface ChartData {
  points: Array<{
    date: string;
    ageMonths: number;
    value: number;
    percentile: number | null;
    statusColor: string | null;
  }>;
  percentileCurves: Array<{
    percentile: number;
    points: Array<{ age_months: number; value: number }>;
  }>;
}

export async function getGrowthRecordsApi(childId: string): Promise<{ data: GrowthRecord[] }> {
  return apiClient.get(`api/v1/children/${childId}/growth`).json();
}

export async function createGrowthRecordApi(
  childId: string,
  input: {
    type: string;
    value: number;
    unit: string;
    measurementDate: string;
    notes?: string | null;
  },
): Promise<{ data: GrowthRecord }> {
  return apiClient
    .post(`api/v1/children/${childId}/growth`, { json: { ...input, childId } })
    .json();
}

export async function updateGrowthRecordApi(
  childId: string,
  recordId: string,
  input: { value?: number; measurementDate?: string; notes?: string | null },
): Promise<{ data: GrowthRecord }> {
  return apiClient.patch(`api/v1/children/${childId}/growth/${recordId}`, { json: input }).json();
}

export async function getChartDataApi(
  childId: string,
  chartType: string,
): Promise<{ data: ChartData }> {
  return apiClient.get(`api/v1/children/${childId}/growth/chart/${chartType}`).json();
}

export async function getGrowthSummaryApi(childId: string): Promise<{ data: GrowthSummary }> {
  return apiClient.get(`api/v1/children/${childId}/growth-summary`).json();
}

export async function deleteGrowthRecordApi(childId: string, recordId: string): Promise<void> {
  await apiClient.delete(`api/v1/children/${childId}/growth/${recordId}`);
}

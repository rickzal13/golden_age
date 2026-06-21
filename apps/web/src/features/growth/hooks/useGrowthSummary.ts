import { useCallback, useEffect, useState } from "react";
import { getGrowthSummaryApi } from "../api";

export interface GrowthSummary {
  latestWeight: { value: number; date: string; statusColor: string | null } | null;
  latestHeight: { value: number; date: string; statusColor: string | null } | null;
  lastMeasurementDate: string | null;
  totalRecords: number;
}

const emptySummary: GrowthSummary = {
  latestWeight: null,
  latestHeight: null,
  lastMeasurementDate: null,
  totalRecords: 0,
};

export function useGrowthSummary(childId: string | undefined) {
  const [summary, setSummary] = useState<GrowthSummary>(emptySummary);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(() => {
    if (!childId) return;
    setLoading(true);
    getGrowthSummaryApi(childId)
      .then((res) => setSummary(res.data))
      .catch(() => setSummary(emptySummary))
      .finally(() => setLoading(false));
  }, [childId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, refetch: fetchSummary };
}

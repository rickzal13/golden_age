interface GrowthSummaryCardProps {
  latestWeight: { value: number; statusColor: string | null } | null;
  latestHeight: { value: number; statusColor: string | null } | null;
  lastMeasurementDate: string | null;
  totalRecords: number;
}

export function GrowthSummaryCard({
  latestWeight,
  latestHeight,
  lastMeasurementDate,
  totalRecords,
}: GrowthSummaryCardProps) {
  if (!latestWeight && !latestHeight) return null;

  const statusDot = (color: string | null) => {
    if (!color) return null;
    const bg =
      color === "green" ? "bg-emerald-500" : color === "yellow" ? "bg-amber-500" : "bg-red-500";
    return <span className={`ml-1 inline-block h-2 w-2 rounded-full ${bg}`} />;
  };

  const statusLabel = (color: string | null) => {
    if (!color) return "Unknown";
    if (color === "green") return "Healthy Range";
    if (color === "yellow") return "Needs Attention";
    return "Below Range";
  };

  const worstColor = [latestWeight?.statusColor, latestHeight?.statusColor]
    .filter(Boolean)
    .reduce<string | null>((worst, c) => {
      if (!c) return worst;
      if (!worst || c === "red" || (c === "yellow" && worst === "green")) return c;
      return worst;
    }, null);

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <h3 className="text-sm font-semibold text-gray-900">Growth Summary</h3>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {latestWeight && (
          <div>
            <p className="text-xs text-gray-400">Weight</p>
            <p className="mt-0.5 flex items-center gap-1 text-sm font-medium text-gray-900">
              {latestWeight.value} kg {statusDot(latestWeight.statusColor)}
            </p>
          </div>
        )}
        {latestHeight && (
          <div>
            <p className="text-xs text-gray-400">Height</p>
            <p className="mt-0.5 flex items-center gap-1 text-sm font-medium text-gray-900">
              {latestHeight.value} cm {statusDot(latestHeight.statusColor)}
            </p>
          </div>
        )}
        <div>
          <p className="text-xs text-gray-400">Total Records</p>
          <p className="mt-0.5 text-sm font-medium text-gray-900">{totalRecords}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Status</p>
          <p className="mt-0.5 text-sm font-medium text-gray-900">{statusLabel(worstColor)}</p>
        </div>
      </div>
      {lastMeasurementDate && (
        <p className="mt-3 text-xs text-gray-400">
          Last measurement: {new Date(lastMeasurementDate).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

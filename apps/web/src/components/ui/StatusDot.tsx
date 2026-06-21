interface StatusDotProps {
  color: "green" | "yellow" | "red" | null;
  className?: string;
}

const colorMap: Record<string, string> = {
  green: "bg-emerald-500",
  yellow: "bg-amber-500",
  red: "bg-red-500",
};

export function StatusDot({ color, className = "" }: StatusDotProps) {
  if (!color) return null;
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${colorMap[color]} ${className}`}
      aria-label={`Status: ${color}`}
    />
  );
}

export function StatusDotLabel({
  color,
  label,
}: { color: "green" | "yellow" | "red" | null; label: string }) {
  if (!color) return <span className="text-xs text-gray-400">{label}</span>;
  const textColor =
    color === "green" ? "text-emerald-600" : color === "yellow" ? "text-amber-600" : "text-red-600";
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${textColor}`}>
      <StatusDot color={color} />
      {label}
    </span>
  );
}

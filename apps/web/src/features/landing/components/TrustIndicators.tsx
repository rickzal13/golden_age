interface TrustItem { label: string; }

export function TrustIndicators({ items }: { items: TrustItem[] }) {
  return (
    <div className="mx-auto mt-10 max-w-2xl">
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-400">
        {items.map((item) => (
          <span key={item.label} className="inline-flex items-center gap-1.5">
            <span className="text-teal-500">✓</span>
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

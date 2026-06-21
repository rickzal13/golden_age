export function IllustrationPanel() {
  return (
    <div className="relative flex items-center justify-center">
      <div className="relative w-64 sm:w-72 lg:w-80">
        <div className="absolute -left-2 top-0 z-10 rounded-xl border border-gray-100 bg-white p-3 shadow-md">
          <div className="mb-2 h-1 w-16 rounded-full bg-teal-100" />
          <div className="mb-1.5 h-0.5 w-24 rounded-full bg-gray-100" />
          <div className="mb-1.5 h-0.5 w-20 rounded-full bg-gray-100" />
          <div className="h-16 w-full rounded-lg bg-teal-50/60">
            <svg viewBox="0 0 96 64" className="h-full w-full" aria-hidden="true">
              <polyline points="4,52 12,48 20,44 28,36 36,28 44,22 52,18 60,12 68,8 76,4 84,2 92,1" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="92" cy="1" r="3" fill="#0d9488" />
            </svg>
          </div>
        </div>
        <div className="absolute right-0 top-16 z-20 rounded-lg border border-gray-100 bg-white p-2.5 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs">✓</div>
            <div><div className="h-1.5 w-16 rounded-full bg-gray-100" /><div className="mt-1 h-1 w-10 rounded-full bg-gray-100" /></div>
          </div>
        </div>
        <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-full border-2 border-teal-100 bg-teal-50/40 sm:h-64 sm:w-64 lg:h-72 lg:w-72">
          <div className="text-center"><div className="text-4xl sm:text-5xl">👶</div><p className="mt-2 text-xs font-medium text-teal-700">0–5 years</p></div>
        </div>
        <div className="absolute -bottom-1 left-10 h-2.5 w-2.5 rounded-full bg-amber-200" />
        <div className="absolute bottom-6 right-6 h-1.5 w-1.5 rounded-full bg-teal-300" />
        <div className="absolute left-20 top-6 h-1.5 w-1.5 rounded-full bg-rose-200" />
      </div>
    </div>
  );
}

interface FeatureCard { icon: string; title: string; description: string; }

export function FeatureSection({ id, title, subtitle, cards, columns = 3 }: { id?: string; title: string; subtitle?: string; cards: FeatureCard[]; columns?: 2 | 3 }) {
  const gridCols = columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";
  return (
    <section id={id} className="px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-3 text-base text-gray-500">{subtitle}</p>}
        </div>
        <div className={`mt-12 grid gap-6 ${gridCols}`}>
          {cards.map((card) => (
            <div key={card.title} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-lg">{card.icon}</div>
              <h3 className="text-base font-semibold text-gray-900">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

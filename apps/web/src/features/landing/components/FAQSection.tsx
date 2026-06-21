import { useState } from "react";

interface FAQItem { question: string; answer: string; }

function FAQAccordion({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-4 py-4 text-left text-sm font-medium text-gray-900 hover:bg-gray-50">
        {item.question}
        <span className={`ml-4 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
      </button>
      {open && <div className="px-4 pb-4 text-sm leading-relaxed text-gray-500">{item.answer}</div>}
    </div>
  );
}

export function FAQSection({ items, id }: { items: FAQItem[]; id?: string }) {
  return (
    <section id={id} className="bg-gray-50 px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">Frequently Asked Questions</h2>
        <div className="mt-10 divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white shadow-sm">
          {items.map((item) => <FAQAccordion key={item.question} item={item} />)}
        </div>
      </div>
    </section>
  );
}

import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router";

const navItems = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "features", label: "Features" },
  { id: "benefits", label: "Benefits" },
  { id: "workflow", label: "How It Works" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
] as const;

export function LandingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { for (const e of entries) { if (e.isIntersecting) { setActiveSection(e.target.id); break; } } },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );
    for (const n of navItems) { const el = document.getElementById(n.id); if (el) observer.observe(el); }
    return () => observer.disconnect();
  }, []);

  const scrollTo = useCallback((id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) { el.scrollIntoView({ behavior: "smooth" }); window.history.replaceState(null, "", `#${id}`); }
  }, []);

  return (
    <header className={`sticky top-0 z-50 border-b transition-shadow ${scrolled ? "border-gray-100 bg-white/95 shadow-sm backdrop-blur-sm" : "border-transparent bg-white"}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <button type="button" onClick={() => scrollTo("home")} className="flex shrink-0 items-center gap-2 text-left">
          <span className="text-lg font-bold text-teal-700">Golden Age</span>
        </button>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {navItems.map((item) => (
            <button key={item.id} type="button" onClick={() => scrollTo(item.id)} className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${activeSection === item.id ? "bg-teal-50 text-teal-700" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"}`}>{item.label}</button>
          ))}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900">Sign In</Link>
          <Link to="/signup" className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700">Register</Link>
        </div>
        <button type="button" onClick={() => setMobileOpen(!mobileOpen)} className="flex items-center rounded-lg p-2 text-gray-500 hover:bg-gray-50 lg:hidden" aria-expanded={mobileOpen} aria-label="Toggle navigation menu">
          {mobileOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>
      {mobileOpen && (
        <div className="border-t border-gray-100 bg-white px-6 pb-6 pt-2 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <button key={item.id} type="button" onClick={() => scrollTo(item.id)} className={`rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${activeSection === item.id ? "bg-teal-50 text-teal-700" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"}`}>{item.label}</button>
            ))}
          </nav>
          <div className="mt-4 flex gap-3">
            <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-center text-sm font-medium text-gray-600 hover:bg-gray-50">Sign In</Link>
            <Link to="/signup" onClick={() => setMobileOpen(false)} className="flex-1 rounded-lg bg-teal-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-teal-700">Register</Link>
          </div>
        </div>
      )}
    </header>
  );
}

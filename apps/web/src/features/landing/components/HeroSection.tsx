import { Link } from "react-router";
import { IllustrationPanel } from "./IllustrationPanel";
import { TrustIndicators } from "./TrustIndicators";

const trustItems = [
  { label: "Growth Tracking" },
  { label: "Development Milestones" },
  { label: "Vaccination Records" },
  { label: "Nutrition Monitoring" },
];

export function HeroSection({ id }: { id?: string }) {
  return (
    <section id={id} className="bg-white px-6 pb-12 pt-16 sm:pb-16 sm:pt-24">
      <div className="mx-auto max-w-6xl">
        <div className="items-center gap-12 lg:flex lg:gap-16">
          <div className="lg:w-7/12">
            <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
              Every child&apos;s journey<span className="block text-teal-600">deserves a guiding hand.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-gray-500 sm:text-lg">Golden Age helps you track your child&apos;s growth, milestones, vaccinations, and nutrition — so you always know how they&apos;re doing and what comes next.</p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-gray-400">You&apos;re not alone on this journey. Share progress with family members and healthcare providers. Together, give your child the healthiest start in life.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/signup" className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 sm:w-auto">Start Your Journey</Link>
              <Link to="/login" className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-8 py-3.5 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50 sm:w-auto">Sign In</Link>
            </div>
            <p className="mt-5 text-sm"><a href="#about" className="text-gray-400 underline underline-offset-4 transition-colors hover:text-teal-600">Learn more about the Golden Age</a></p>
          </div>
          <div className="mt-12 flex justify-center lg:mt-0 lg:w-5/12"><IllustrationPanel /></div>
        </div>
        <TrustIndicators items={trustItems} />
      </div>
    </section>
  );
}

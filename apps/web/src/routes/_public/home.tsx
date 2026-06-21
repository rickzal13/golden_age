import { FAQSection } from "../../features/landing/components/FAQSection";
import { FeatureSection } from "../../features/landing/components/FeatureSection";
import { HeroSection } from "../../features/landing/components/HeroSection";
import { LandingHeader } from "../../features/landing/components/LandingHeader";

const whyParentsCards = [
  {
    icon: "📈",
    title: "Growth Monitoring",
    description:
      "Track weight, height, and head circumference using WHO standards. See your child's growth chart at a glance with color-coded indicators.",
  },
  {
    icon: "🧠",
    title: "Development Milestones",
    description:
      "Know what to expect at every age. Track motor, language, cognitive, and social-emotional skills with age-appropriate checklists.",
  },
  {
    icon: "💉",
    title: "Vaccination Tracking",
    description:
      "Never miss a vaccine. Follow your country's immunization schedule with automatic reminders for upcoming and missed doses.",
  },
  {
    icon: "🥗",
    title: "Nutrition Records",
    description:
      "Log meals, track breastfeeding sessions, and monitor complementary feeding — ensuring your child gets the right nutrition.",
  },
  {
    icon: "🔔",
    title: "Smart Reminders",
    description:
      "Get timely push and email notifications for vaccines, check-ups, milestones, and custom reminders you set yourself.",
  },
  {
    icon: "👨‍👩‍👧‍👦",
    title: "Family Collaboration",
    description:
      "Share your child's progress with grandparents, partners, and healthcare providers. Everyone stays connected and informed.",
  },
];

const featureCards = [
  {
    icon: "👶",
    title: "Child Profiles",
    description:
      "Create profiles for each child with birth metrics. Track prematurity-adjusted growth from day one.",
  },
  {
    icon: "📊",
    title: "Growth Charts",
    description:
      "Interactive WHO growth charts with percentile curves. Understand your child's growth trajectory instantly.",
  },
  {
    icon: "✅",
    title: "Milestone Tracking",
    description:
      "Age-based developmental checklists. Get alerts if a milestone is missed — early detection matters.",
  },
  {
    icon: "📅",
    title: "Vaccination Schedule",
    description:
      "Country-specific immunization schedules. Digital vaccination record with completion progress.",
  },
  {
    icon: "🍎",
    title: "Nutrition Monitoring",
    description:
      "Daily meal logging, breastfeeding timer, and complementary feeding guidance for every stage.",
  },
  {
    icon: "📋",
    title: "Medical Records",
    description:
      "Keep clinic visits, diagnoses, medications, and lab results organized in one place.",
  },
];

const steps = [
  {
    number: "1",
    title: "Create an account",
    description: "Sign up as a parent in under a minute.",
  },
  {
    number: "2",
    title: "Add your child",
    description: "Enter name, date of birth, and birth measurements.",
  },
  {
    number: "3",
    title: "Record growth & activities",
    description: "Log weight, height, milestones, meals, and vaccines regularly.",
  },
  {
    number: "4",
    title: "Track progress & get reminders",
    description: "View growth charts, receive alerts, and share with family and doctors.",
  },
];

const faqItems = [
  {
    question: "What is the Golden Age?",
    answer:
      "The Golden Age refers to the first 1,000 days of a child's life — from conception to age 2 — a critical window for brain development, physical growth, and emotional well-being. Proper nutrition, healthcare, and stimulation during this period shape lifelong health outcomes.",
  },
  {
    question: "Who can use this app?",
    answer:
      "Golden Age is designed for parents, grandparents, pediatricians, midwives, and community health workers. Anyone involved in a child's care can use it — with role-based access to protect privacy.",
  },
  {
    question: "Is my child's data secure?",
    answer:
      "Yes. All data is encrypted in transit and at rest. We use industry-standard security practices including JWT authentication, role-based access control, and never share your data without explicit consent. You control who can see your child's information.",
  },
  {
    question: "Can multiple family members participate?",
    answer:
      "Absolutely. The family sharing feature lets you invite grandparents, your partner, and other caregivers. You can set different permission levels — view-only, editor, or full admin access — for each family member.",
  },
  {
    question: "Does this replace doctor visits?",
    answer:
      "No. Golden Age is a monitoring and record-keeping tool — it does not diagnose or replace professional medical care. It helps you stay informed and prepared for conversations with your pediatrician by keeping all your child's health data organized in one place.",
  },
  {
    question: "Is Golden Age free?",
    answer:
      "Yes, the core features — growth tracking, milestone checklists, vaccination schedule, and family sharing — are free for parents. We offer premium plans for clinics and healthcare providers with advanced analytics and patient management tools.",
  },
];

export default function HomePage() {
  return (
    <div className="bg-gray-50">
      <LandingHeader />

      <HeroSection id="home" />

      {/* What is the Golden Age */}
      <section id="about" className="bg-white px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">What is the Golden Age?</h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-gray-500">
            <p>
              The first years of life are critical. From birth to age 5, a child&apos;s brain
              develops faster than at any other time — forming over 1 million neural connections
              every second.
            </p>
            <p>
              During this <strong className="font-medium text-gray-700">Golden Age</strong>, proper
              nutrition, healthcare, stimulation, and emotional support shape lifelong health,
              learning ability, and well-being. Regular monitoring helps detect issues early — when
              intervention is most effective.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-5">
                <h3 className="text-sm font-semibold text-amber-800">Brain Development</h3>
                <p className="mt-2 text-sm text-amber-700">
                  90% of brain growth happens before age 5. Early experiences build the foundation
                  for all future learning and behavior.
                </p>
              </div>
              <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-5">
                <h3 className="text-sm font-semibold text-teal-800">Physical Growth</h3>
                <p className="mt-2 text-sm text-teal-700">
                  Children triple their birth weight by 12 months. Tracking growth against WHO
                  standards ensures they stay on a healthy path.
                </p>
              </div>
              <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-5">
                <h3 className="text-sm font-semibold text-rose-800">Emotional Health</h3>
                <p className="mt-2 text-sm text-rose-700">
                  Loving, responsive relationships in early childhood create secure attachment —
                  critical for mental health throughout life.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Parents Need This App */}
      <FeatureSection
        title="Why Parents Need Golden Age"
        subtitle="Everything you need to monitor your child's health — all in one place"
        cards={whyParentsCards}
        columns={3}
      />

      {/* Key Features */}
      <section id="features" className="bg-white px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Key Features</h2>
            <p className="mt-3 text-base text-gray-500">
              Designed with parents and pediatricians for complete child health monitoring
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featureCards.map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-gray-100 bg-gray-50 p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-lg shadow-sm">
                  {card.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Early Detection Matters */}
      <section id="benefits" className="bg-gradient-to-b from-teal-50 to-white px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Why Early Detection Matters
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-gray-500">
            <p>
              Regular monitoring is not about anxiety — it&apos;s about awareness. When you track
              your child&apos;s growth consistently, you notice patterns. Small changes that might
              otherwise go unnoticed become visible on a growth chart.
            </p>
            <div className="border-l-4 border-teal-500 bg-white py-3 pl-4 pr-6">
              <p className="text-sm font-medium text-teal-700">
                Early intervention is the most powerful tool in child health. The sooner a delay or
                deficiency is identified, the easier it is to address — often with simple changes to
                nutrition or routine.
              </p>
            </div>
            <p>
              Golden Age doesn&apos;t replace your pediatrician. It makes every visit more
              productive by giving you organized data to share — growth trends, milestone timelines,
              and vaccination history — all at your fingertips.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="workflow" className="bg-white px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">How It Works</h2>
          <p className="mt-3 text-base text-gray-500">
            Get started in minutes — no medical knowledge required
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-4">
            {steps.map((step) => (
              <div key={step.number} className="group">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-600 text-base font-bold text-white shadow-sm transition-transform group-hover:scale-110">
                  {step.number}
                </div>
                <h3 className="mt-4 text-sm font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection id="faq" items={faqItems} />
    </div>
  );
}

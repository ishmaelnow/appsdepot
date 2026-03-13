import { Link } from 'react-router-dom'
import {
  Eye, CheckCircle, Hammer, ArrowRight, MessageSquare,
  Clock, Code2, Rocket, Shield, Users, Star,
  FileText, CreditCard, Package, ChevronDown, ChevronUp,
  Zap, Repeat
} from 'lucide-react'
import { useState } from 'react'

// ─── FAQ data ────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: 'Do I have to pay anything to submit a request?',
    a: 'No. Submitting a build request is completely free. You describe what you need, we review it and send a detailed quote. Payment only happens after you review and approve the quote — no surprises.',
  },
  {
    q: 'How accurate is the "starting from" price on each listing?',
    a: 'The starting price reflects a baseline build with the core feature set shown in the sample. Your final quote may be higher or lower depending on your custom requirements, integrations, and complexity. We always agree on a fixed price before starting.',
  },
  {
    q: 'Who owns the code after delivery?',
    a: 'You do — 100%. We hand over the full source code, deployment configs, and documentation. You are never locked in to us for hosting, maintenance, or future changes.',
  },
  {
    q: 'What if I need changes after delivery?',
    a: 'Every project includes a 30-day revision period after delivery. We fix any bugs and make reasonable adjustments to match the agreed scope. Larger feature additions can be scoped as a follow-on project.',
  },
  {
    q: 'Can I choose my own tech stack?',
    a: 'Yes. Each listing shows our default stack, but we can build with your preferred languages and frameworks. Just mention it in the requirements field when submitting your request.',
  },
  {
    q: 'How long does a typical build take?',
    a: 'Build times are shown on every listing and range from 1 week (simple brochure sites) to 12 weeks (complex SaaS platforms). Once your quote is approved we give you an exact delivery date and stick to it.',
  },
  {
    q: 'What if I need multiple apps built together?',
    a: 'Add all the apps you want to your Build Tray and submit them in a single request. We\'ll scope and quote them together, and can often coordinate delivery so the pieces integrate cleanly.',
  },
  {
    q: 'Can I try the sample app before requesting?',
    a: 'Every listing has a live, interactive sample demo. Click "Try Sample App" on any listing to open it. The sample shows exactly the features and UX you\'d get — your custom build just adds your branding, data, and any extra requirements.',
  },
]

// ─── Process steps ────────────────────────────────────────────────────────────
const STEPS = [
  {
    number: '01',
    icon: <Eye size={32} />,
    title: 'Browse & Try the Sample',
    subtitle: 'See it before you commit',
    color: '#3B82F6',
    description:
      'Every app in our catalog comes with a fully functional live demo. Browse by category (we call them aisles), find an app that fits your use case, and click "Try Sample App" to interact with it directly — no sign-up required.',
    details: [
      'Live interactive demos — not screenshots',
      'Full feature walkthrough before requesting',
      'Filter by category, complexity, and tech stack',
      '85+ sample apps across 8 categories',
    ],
    cta: { label: 'Browse Apps', href: '/store' },
  },
  {
    number: '02',
    icon: <CheckCircle size={32} />,
    title: 'Add to Build Tray & Submit a Request',
    subtitle: 'Tell us what you need — free, no payment',
    color: '#F97316',
    description:
      'When you find an app you want built, click "Request Build" to add it to your Build Tray. You can add multiple apps in one session. When ready, submit your request with a description of your requirements, budget range, and timeline. No payment at this stage.',
    details: [
      'Add multiple apps in one request',
      'Describe your specific requirements and integrations',
      'Pick a budget range and timeline',
      'Mention your preferred tech stack if you have one',
    ],
    cta: { label: 'See a Sample Listing', href: '/app/launchpad' },
  },
  {
    number: '03',
    icon: <MessageSquare size={32} />,
    title: 'Receive a Custom Quote',
    subtitle: 'Within 24 hours — fixed price, no surprises',
    color: '#8B5CF6',
    description:
      'Our team reviews your requirements and responds within 24 hours with a detailed quote. This includes an exact price, a project scope document, a delivery date, and a payment schedule. Nothing starts until you say yes.',
    details: [
      'Response within 24 business hours',
      'Itemised scope of work document',
      'Fixed price — no hidden costs',
      'Milestone-based payment schedule',
    ],
    cta: null,
  },
  {
    number: '04',
    icon: <Hammer size={32} />,
    title: 'We Build Your App',
    subtitle: 'Daily updates, staging previews, total transparency',
    color: '#10B981',
    description:
      'Once you approve the quote and make the first milestone payment, our team kicks off your build. You get daily progress updates, access to a staging environment to review as it\'s being built, and a direct line to your assigned developer.',
    details: [
      'Dedicated developer assigned to your project',
      'Staging environment from day one',
      'Daily build updates in your dashboard',
      'Direct messaging channel with the team',
    ],
    cta: null,
  },
  {
    number: '05',
    icon: <Rocket size={32} />,
    title: 'Delivery & Handoff',
    subtitle: 'Live, documented, and fully yours',
    color: '#EF4444',
    description:
      'When your app is ready, we deploy it to your infrastructure (or help you set it up), hand over the full source code, write the technical documentation, and walk you through the codebase on a video call. You own everything.',
    details: [
      'Deployed to your cloud account (AWS / GCP / Vercel / etc.)',
      'Full source code — yours to keep forever',
      'Technical documentation and README',
      'Handoff call with your developer',
    ],
    cta: { label: 'Start a Request', href: '/store' },
  },
]

// ─── What you get ─────────────────────────────────────────────────────────────
const INCLUSIONS = [
  { icon: <Code2 size={20} />, title: '100% Source Code Ownership', desc: 'Every line of code is yours. No vendor lock-in, no recurring license fees just to run your own app.' },
  { icon: <Shield size={20} />, title: '30-Day Revision Policy', desc: 'After delivery, we fix bugs and adjust features at no extra cost for 30 days.' },
  { icon: <FileText size={20} />, title: 'Full Documentation', desc: 'README, API docs, deployment guide, and an architecture overview so any developer can maintain it.' },
  { icon: <Rocket size={20} />, title: 'Deployment Included', desc: 'We deploy the app to your preferred cloud. No extra charge for the initial production setup.' },
  { icon: <CreditCard size={20} />, title: 'Milestone Payments', desc: 'You never pay everything upfront. Payments are tied to delivery milestones you approve.' },
  { icon: <Repeat size={20} />, title: 'Free Follow-On Scoping', desc: 'Want to add features after delivery? We scope follow-on work free of charge with no commitment.' },
]

// ─── Timeline comparison ──────────────────────────────────────────────────────
const TIMELINES = [
  { complexity: 'Starter', examples: 'Portfolio site, booking system, landing page', time: '1–2 weeks', price: 'From $1,200' },
  { complexity: 'Standard', examples: 'Admin dashboard, SaaS MVP, e-commerce store', time: '3–6 weeks', price: 'From $2,000' },
  { complexity: 'Enterprise', examples: 'Auth platform, analytics suite, self-hosted SaaS', time: '6–12 weeks', price: 'From $4,000' },
]

// ─── FAQ item ─────────────────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between w-full px-5 py-4 text-left bg-white hover:bg-stone-50 transition-colors"
      >
        <span className="font-semibold text-depot-black pr-4">{q}</span>
        {open ? <ChevronUp size={18} className="text-stone-400 flex-shrink-0" /> : <ChevronDown size={18} className="text-stone-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 pt-0 bg-white">
          <p className="text-stone-600 text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function HowItWorksPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-depot-black text-white relative overflow-hidden">
        <div className="h-1 bg-depot-orange" />
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, #F97316 39px, #F97316 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, #F97316 39px, #F97316 40px)',
          }}
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative text-center">
          <div className="inline-flex items-center gap-2 bg-depot-orange/20 border border-depot-orange/30 text-depot-orange rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
            <Hammer size={14} /> No code required on your end
          </div>
          <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-5">
            How Apps Depot Works
          </h1>
          <p className="text-stone-300 text-xl leading-relaxed max-w-2xl mx-auto mb-8">
            You browse sample apps, tell us what you need, and we build a custom version for you. Here's every step — from demo to delivered.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-stone-400">
            {[
              { icon: <Clock size={15} />, label: 'Quote in 24 hours' },
              { icon: <Shield size={15} />, label: 'No payment until you approve' },
              { icon: <Users size={15} />, label: '1,200+ projects delivered' },
              { icon: <Star size={15} />, label: '4.8 avg client rating' },
            ].map(({ icon, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-stone-300">
                <span className="text-depot-orange">{icon}</span> {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Step-by-step */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-depot-black">The Process, Step by Step</h2>
            <p className="text-stone-500 mt-2">Every project follows the same clear path — so you always know where things stand</p>
          </div>

          <div className="space-y-10">
            {STEPS.map((step, i) => (
              <div
                key={step.number}
                className={`flex flex-col md:flex-row gap-8 items-start ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
              >
                {/* Visual */}
                <div className="md:w-64 flex-shrink-0">
                  <div
                    className="rounded-2xl p-8 flex flex-col items-center text-center text-white"
                    style={{ backgroundColor: step.color }}
                  >
                    <div className="text-5xl font-black opacity-20 mb-2">{step.number}</div>
                    <div className="mb-3">{step.icon}</div>
                    <p className="font-bold text-base leading-tight">{step.title}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 bg-white border border-stone-200 rounded-2xl p-6">
                  <div
                    className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-3 text-white"
                    style={{ backgroundColor: step.color }}
                  >
                    Step {step.number}
                  </div>
                  <h3 className="text-xl font-black text-depot-black mb-1">{step.title}</h3>
                  <p className="text-depot-orange font-semibold text-sm mb-3">{step.subtitle}</p>
                  <p className="text-stone-600 text-sm leading-relaxed mb-4">{step.description}</p>
                  <ul className="space-y-1.5 mb-4">
                    {step.details.map(d => (
                      <li key={d} className="flex items-center gap-2 text-sm text-stone-700">
                        <CheckCircle size={14} style={{ color: step.color }} className="flex-shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                  {step.cta && (
                    <Link
                      to={step.cta.href}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-depot-orange hover:underline"
                    >
                      {step.cta.label} <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's always included */}
      <section className="py-16 bg-white border-y border-stone-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-depot-black">What's Always Included</h2>
            <p className="text-stone-500 mt-2">Every build — regardless of size — comes with all of this</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {INCLUSIONS.map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 bg-stone-50 border border-stone-100 rounded-xl p-5">
                <div className="w-10 h-10 bg-depot-orange/10 rounded-xl flex items-center justify-center text-depot-orange flex-shrink-0">
                  {icon}
                </div>
                <div>
                  <h3 className="font-bold text-depot-black text-sm mb-1">{title}</h3>
                  <p className="text-stone-500 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline & pricing overview */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-depot-black">Build Times & Pricing Ranges</h2>
            <p className="text-stone-500 mt-2">Actual quotes depend on your requirements — these are typical ranges</p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-depot-black text-white">
                  <th className="text-left px-5 py-4 font-semibold rounded-tl-2xl">Complexity</th>
                  <th className="text-left px-5 py-4 font-semibold">Typical Examples</th>
                  <th className="text-left px-5 py-4 font-semibold">Build Time</th>
                  <th className="text-left px-5 py-4 font-semibold rounded-tr-2xl">Starting Price</th>
                </tr>
              </thead>
              <tbody>
                {TIMELINES.map((row, i) => (
                  <tr key={row.complexity} className={i % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                    <td className="px-5 py-4 font-bold text-depot-black">{row.complexity}</td>
                    <td className="px-5 py-4 text-stone-500">{row.examples}</td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-stone-700 font-medium">
                        <Clock size={13} className="text-depot-orange" /> {row.time}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-depot-orange">{row.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-xs text-stone-400 mt-3">
            All prices in USD. Final quote is fixed price — no hourly billing, no overages.
          </p>
        </div>
      </section>

      {/* Payment schedule visual */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-depot-black">How Payments Work</h2>
            <p className="text-stone-500 mt-2">Split into milestones — you only pay when we deliver</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                milestone: 'Milestone 1', pct: '40%', label: 'Project Kickoff',
                desc: 'After you approve the quote. We begin design and architecture.',
                icon: <FileText size={20} />, color: '#3B82F6',
              },
              {
                milestone: 'Milestone 2', pct: '40%', label: 'Staging Delivery',
                desc: 'When the staging app is ready for your review and feedback.',
                icon: <Package size={20} />, color: '#F97316',
              },
              {
                milestone: 'Milestone 3', pct: '20%', label: 'Final Delivery',
                desc: 'When the app is live, code is handed over, and docs are written.',
                icon: <Zap size={20} />, color: '#10B981',
              },
            ].map(({ milestone, pct, label, desc, icon, color }) => (
              <div key={milestone} className="relative bg-stone-50 border border-stone-200 rounded-2xl p-5 text-center">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white mx-auto mb-3"
                  style={{ backgroundColor: color }}
                >
                  {icon}
                </div>
                <div className="text-3xl font-black mb-1" style={{ color }}>{pct}</div>
                <p className="font-bold text-depot-black text-sm mb-1">{label}</p>
                <p className="text-xs text-stone-500 leading-relaxed">{desc}</p>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-depot-black text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {milestone}
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-stone-400 mt-4">
            Payments via Stripe. Invoices issued at each milestone. Net-7 payment terms available for enterprise clients.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-stone-50 border-t border-stone-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-depot-black">Frequently Asked Questions</h2>
            <p className="text-stone-500 mt-2">Everything you want to know before submitting a request</p>
          </div>
          <div className="space-y-3">
            {FAQS.map(faq => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-depot-orange py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <Hammer size={48} className="mx-auto mb-4 opacity-80" />
          <h2 className="text-4xl font-black mb-3">Ready to get started?</h2>
          <p className="text-white/80 text-lg mb-8">
            Browse the samples, pick what you want built, and submit a request — free, in under 5 minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/store"
              className="bg-white text-depot-orange hover:bg-stone-100 px-8 py-4 rounded-xl font-bold text-lg transition-colors"
            >
              Browse App Templates
            </Link>
            <Link
              to="/auth"
              className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-xl font-bold text-lg transition-colors"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

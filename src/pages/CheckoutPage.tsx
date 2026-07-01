import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Hammer, Clock, MessageSquare } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { getInitials, formatStartingPrice } from '../lib/utils'
import { supabase } from '../lib/supabase'

const BUDGET_RANGES = [
  'Under $2,000',
  '$2,000 – $5,000',
  '$5,000 – $10,000',
  '$10,000 – $25,000',
  '$25,000+',
  'Not sure — need a quote',
]

const TIMELINES = [
  'ASAP (within 2 weeks)',
  '1 month',
  '2–3 months',
  'No rush — quality over speed',
  'Not sure yet',
]

type CheckoutRequest = ReturnType<typeof useCart>['requests']

async function saveBuildRequestToSupabase({
  form,
  requests,
  userId,
}: {
  form: {
    name: string
    email: string
    phone: string
    company: string
    requirements: string
    budgetRange: string
    timeline: string
    preferredStack: string
  }
  requests: CheckoutRequest
  userId?: string
}) {
  if (!supabase) {
    throw new Error('Supabase is not configured. Restart the dev server after checking your environment variables.')
  }

  const { data: savedRequest, error: requestError } = await supabase
    .from('build_requests')
    .insert({
      customer_user_id: userId ?? null,
      customer_name: form.name.trim(),
      customer_email: form.email.trim().toLowerCase(),
      customer_phone: form.phone.trim() || null,
      company: form.company.trim() || null,
      requirements: form.requirements.trim(),
      budget_range: form.budgetRange,
      timeline: form.timeline,
      preferred_stack: form.preferredStack.trim() || null,
      source: 'website-direct',
    })
    .select('id, request_number')
    .single()

  if (requestError || !savedRequest) {
    throw new Error(requestError?.message || 'Failed to save build request')
  }

  const { error: appsError } = await supabase
    .from('build_request_apps')
    .insert(requests.map(({ app }) => ({
      build_request_id: savedRequest.id,
      app_slug: app.slug,
      app_name: app.name,
      category: app.category.name,
      starting_price: formatStartingPrice(app),
      build_time: app.buildTime,
    })))

  if (appsError) {
    throw new Error(appsError.message || 'Failed to save requested apps')
  }

  return savedRequest.request_number as string
}

export function CheckoutPage() {
  const { requests, clearTray } = useCart()
  const { user } = useAuth()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [requestNumber, setRequestNumber] = useState('')
  const [submittedApps, setSubmittedApps] = useState<typeof requests>([])

  const [form, setForm] = useState({
    name: user?.fullName ?? '',
    email: user?.email ?? '',
    phone: '',
    company: '',
    requirements: '',
    budgetRange: '',
    timeline: '',
    preferredStack: '',
    hearAbout: '',
  })

  if (requests.length === 0 && !submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">📋</p>
        <h1 className="text-2xl font-bold text-depot-black">Nothing to request yet</h1>
        <Link to="/store" className="text-depot-orange hover:underline mt-4 inline-block">Browse Apps →</Link>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-emerald-600" />
        </div>
        <h1 className="text-3xl font-black text-depot-black mb-3">Request Submitted!</h1>
        <p className="text-stone-600 mb-2">
          Thanks, <strong>{form.name.split(' ')[0]}</strong>. We've received your build request.
        </p>
        <p className="text-stone-400 text-sm mb-8">
          Our team will review your requirements and send a detailed quote to <strong>{form.email}</strong> within 24 hours.
        </p>
        {requestNumber && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-6">
            <p className="text-xs text-orange-700 font-semibold uppercase tracking-wide">Request Number</p>
            <p className="text-lg font-black text-depot-black">{requestNumber}</p>
          </div>
        )}

        {submittedApps.length > 0 && (
          <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-6 text-left">
            <h3 className="font-bold text-depot-black text-sm mb-3">Apps submitted</h3>
            <div className="space-y-3">
              {submittedApps.map(({ app }) => (
                <div key={app.id} className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                    style={{ backgroundColor: app.category.color }}
                  >
                    {getInitials(app.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-depot-black truncate">{app.name}</p>
                    <p className="text-xs text-stone-400">{app.category.name} · {app.buildTime}</p>
                  </div>
                  <span className="text-xs font-semibold text-stone-600 flex-shrink-0">{formatStartingPrice(app)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* What happens next */}
        <div className="bg-stone-50 rounded-2xl p-5 mb-8 text-left space-y-4">
          <h3 className="font-bold text-depot-black text-sm">What happens next</h3>
          {[
            { icon: <MessageSquare size={16} />, title: 'We review your request', desc: 'Within 24 hours, our team reads your requirements and prepares a detailed quote.' },
            { icon: <Clock size={16} />, title: 'You receive a custom quote', desc: 'Exact pricing, timeline, and scope — no surprises. You approve before any work starts.' },
            { icon: <Hammer size={16} />, title: 'We build it', desc: 'Your project kicks off with daily updates and a staging environment for review.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-depot-orange/10 rounded-lg flex items-center justify-center text-depot-orange flex-shrink-0">
                {icon}
              </div>
              <div>
                <p className="font-semibold text-sm text-depot-black">{title}</p>
                <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 bg-depot-orange text-white px-8 py-3 rounded-xl font-bold hover:bg-depot-orange-dark transition-colors"
          >
            Track My Project
          </Link>
          <Link to="/store" className="text-stone-400 hover:text-depot-black text-sm transition-colors">
            Browse more apps
          </Link>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError('')
    setLoading(true)
    try {
      const session = supabase ? (await supabase.auth.getSession()).data.session : null
      let savedRequestNumber = ''

      try {
        const res = await fetch('/.netlify/functions/send-build-request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.phone,
            company: form.company,
            requirements: form.requirements,
            budgetRange: form.budgetRange,
            timeline: form.timeline,
            preferredStack: form.preferredStack,
            apps: requests.map(r => ({
              slug: r.app.slug,
              name: r.app.name,
              category: r.app.category.name,
              startingPrice: formatStartingPrice(r.app),
              buildTime: r.app.buildTime,
            })),
          }),
        })
        const payload = await res.json().catch(() => ({}))
        if (!res.ok) {
          const details = payload.error || `Request failed with status ${res.status}`
          throw new Error(details)
        }
        savedRequestNumber = payload.requestNumber ?? ''
      } catch (functionError) {
        console.warn('Netlify build request function failed; falling back to direct Supabase insert.', functionError)
        savedRequestNumber = await saveBuildRequestToSupabase({
          form,
          requests,
          userId: user?.id,
        })
      }

      setRequestNumber(savedRequestNumber)
      setSubmittedApps(requests)
      clearTray()
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong sending your request. Please email us directly at coachishmael@gmail.com or call (469) 835-7520')
    } finally {
      setLoading(false)
    }
  }

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/cart" className="inline-flex items-center gap-1 text-stone-500 hover:text-depot-black text-sm mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to Build Tray
      </Link>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Form */}
        <div className="md:col-span-3">
          <h1 className="text-2xl font-black text-depot-black mb-1">Submit Build Request</h1>
          <p className="text-stone-500 text-sm mb-6">No payment now — we'll quote you first. Work begins only after you approve.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Contact */}
            <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4">
              <h2 className="font-bold text-depot-black">Your Contact Info</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Full Name *</label>
                  <input
                    type="text" required value={form.name}
                    onChange={e => set('name', e.target.value)}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depot-orange"
                    placeholder="Jane Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Email *</label>
                  <input
                    type="email" required value={form.email}
                    onChange={e => set('email', e.target.value)}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depot-orange"
                    placeholder="jane@company.com"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Phone Number</label>
                  <input
                    type="tel" value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depot-orange"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Company / Project Name</label>
                  <input
                    type="text" value={form.company}
                    onChange={e => set('company', e.target.value)}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depot-orange"
                    placeholder="Acme Inc."
                  />
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4">
              <h2 className="font-bold text-depot-black">Your Requirements</h2>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Describe what you need *
                </label>
                <textarea
                  required value={form.requirements}
                  onChange={e => set('requirements', e.target.value)}
                  rows={5}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depot-orange resize-none"
                  placeholder="Tell us about your project. Who are the users? What problem does it solve? Any specific features or integrations you need? The more detail, the more accurate our quote."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Preferred Tech Stack (optional)</label>
                <input
                  type="text" value={form.preferredStack}
                  onChange={e => set('preferredStack', e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depot-orange"
                  placeholder="e.g. React, Django, MySQL — or leave blank to use our defaults"
                />
              </div>
            </div>

            {/* Budget & Timeline */}
            <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4">
              <h2 className="font-bold text-depot-black">Budget & Timeline</h2>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Budget range *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BUDGET_RANGES.map(b => (
                    <button
                      key={b} type="button"
                      onClick={() => set('budgetRange', b)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all text-left ${
                        form.budgetRange === b
                          ? 'border-depot-orange bg-orange-50 text-depot-orange'
                          : 'border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">When do you need this? *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TIMELINES.map(t => (
                    <button
                      key={t} type="button"
                      onClick={() => set('timeline', t)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all text-left ${
                        form.timeline === t
                          ? 'border-depot-orange bg-orange-50 text-depot-orange'
                          : 'border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {submitError && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {submitError}
              </div>
            )}
            <Button
              type="submit"
              size="xl"
              loading={loading}
              disabled={!form.budgetRange || !form.timeline}
              className="w-full"
            >
              <Hammer size={18} />
              {loading ? 'Submitting...' : 'Submit Build Request'}
            </Button>

            <p className="text-xs text-center text-stone-400">
              No payment required. We'll send a quote within 24 hours. Work begins only after you approve the quote and pricing.
            </p>
          </form>
        </div>

        {/* Summary */}
        <div className="md:col-span-2">
          <div className="bg-white border border-stone-200 rounded-2xl p-5 sticky top-24">
            <h2 className="font-bold text-depot-black mb-4">Apps Requested</h2>
            <div className="space-y-3 pb-4 border-b border-stone-100">
              {requests.map(({ app }) => (
                <div key={app.id} className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                    style={{ backgroundColor: app.category.color }}
                  >
                    {getInitials(app.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-depot-black truncate">{app.name}</p>
                    <p className="text-xs text-stone-400">{app.buildTime}</p>
                  </div>
                  <span className="text-xs text-stone-500 flex-shrink-0">{formatStartingPrice(app)}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 space-y-2 text-xs text-stone-500">
              <div className="flex items-start gap-2">
                <CheckCircle size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                No payment until you approve the quote
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                Detailed scope document before work begins
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                30-day revision policy post-delivery
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                You own 100% of the source code
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

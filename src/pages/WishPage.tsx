import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles, CheckCircle, Plus, Trash2, ArrowRight,
  Lightbulb, Users, Clock, Code2, MessageSquare
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { CATEGORIES } from '../data/mockData'
import { supabase } from '../lib/supabase'

interface RecentWish {
  id: string
  title: string
  category_name: string | null
  name: string
  description: string
  status: keyof typeof STATUS_CONFIG
}

const STATUS_CONFIG = {
  new:          { label: 'New Wish',      color: 'bg-stone-100 text-stone-600' },
  under_review: { label: 'Under Review',  color: 'bg-blue-100 text-blue-700' },
  in_progress:  { label: 'Being Built',   color: 'bg-orange-100 text-depot-orange' },
  delivered:    { label: 'Delivered',     color: 'bg-emerald-100 text-emerald-700' },
}

const BUDGET_RANGES = [
  'Under $2,000', '$2,000 – $5,000', '$5,000 – $10,000',
  '$10,000 – $25,000', '$25,000+', 'Not sure — need a quote',
]

const TIMELINES = [
  'ASAP', '1 month', '2–3 months', 'No rush', 'Not sure yet',
]

// ─── Page ─────────────────────────────────────────────────────────────────────
export function WishPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [wishNumber, setWishNumber] = useState('')
  const [features, setFeatures] = useState(['', '', ''])
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set())
  const [recentWishes, setRecentWishes] = useState<RecentWish[]>([])
  const [wishesLoading, setWishesLoading] = useState(false)

  const [form, setForm] = useState({
    title: '',
    categoryId: '',
    description: '',
    targetUsers: '',
    inspiration: '',
    budgetRange: '',
    timeline: '',
    name: '',
    email: '',
    company: '',
  })

  useEffect(() => {
    if (!supabase) return

    let cancelled = false

    async function loadWishes() {
      setWishesLoading(true)
      const { data } = await supabase!
        .from('app_wishes')
        .select('id, title, category_name, name, description, status')
        .order('created_at', { ascending: false })
        .limit(6)

      if (!cancelled) {
        setRecentWishes((data ?? []) as RecentWish[])
        setWishesLoading(false)
      }
    }

    loadWishes()

    return () => {
      cancelled = true
    }
  }, [submitted])

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function setFeature(i: number, value: string) {
    setFeatures(prev => prev.map((f, idx) => idx === i ? value : f))
  }

  function addFeature() {
    if (features.length < 8) setFeatures(prev => [...prev, ''])
  }

  function removeFeature(i: number) {
    setFeatures(prev => prev.filter((_, idx) => idx !== i))
  }

  function toggleVote(id: string) {
    setVotedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError('')
    setLoading(true)
    try {
      const categoryName = CATEGORIES.find(c => c.id === form.categoryId)?.name
      const session = supabase ? (await supabase.auth.getSession()).data.session : null
      const res = await fetch('/.netlify/functions/send-wish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          title: form.title,
          categoryName,
          description: form.description,
          targetUsers: form.targetUsers,
          features,
          inspiration: form.inspiration,
          budgetRange: form.budgetRange,
          timeline: form.timeline,
          name: form.name,
          email: form.email,
          company: form.company,
        }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(payload.error || 'Server error')
      setWishNumber(payload.wishNumber ?? '')
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please email us directly at ishmael@appsdepot.app or call (469) 835-7520')
    } finally {
      setLoading(false)
    }
  }

  // ─── Success state ───────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-depot-yellow/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles size={40} className="text-depot-yellow" />
        </div>
        <h1 className="text-3xl font-black text-depot-black mb-3">Wish Submitted! ✨</h1>
        <p className="text-stone-600 mb-2">
          Thanks, <strong>{form.name.split(' ')[0]}</strong>. Your app idea is now in the wishlist.
        </p>
        <p className="text-stone-400 text-sm mb-8">
          Our team reviews every wish. We'll reach out to <strong>{form.email}</strong> if we decide to build it — or if we need more details.
        </p>
        {wishNumber && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-6">
            <p className="text-xs text-yellow-700 font-semibold uppercase tracking-wide">Wish Number</p>
            <p className="text-lg font-black text-depot-black">{wishNumber}</p>
          </div>
        )}

        <div className="bg-stone-50 rounded-2xl p-5 mb-8 text-left space-y-3">
          <h3 className="font-bold text-depot-black text-sm">Your wish:</h3>
          <p className="font-semibold text-depot-black">"{form.title}"</p>
          {form.description && <p className="text-sm text-stone-500">{form.description}</p>}
        </div>

        <div className="flex flex-col gap-3">
          <Link
            to="/wish"
            onClick={() => setSubmitted(false)}
            className="inline-flex items-center justify-center gap-2 bg-depot-orange text-white px-8 py-3 rounded-xl font-bold hover:bg-depot-orange-dark transition-colors"
          >
            <Sparkles size={16} /> View All Wishes
          </Link>
          <Link to="/store" className="text-stone-400 hover:text-depot-black text-sm transition-colors">
            Browse existing samples
          </Link>
        </div>
      </div>
    )
  }

  // ─── Main page ───────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Hero */}
      <section className="bg-depot-black text-white relative overflow-hidden">
        <div className="h-1 bg-depot-yellow" />
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, #EAB308 39px, #EAB308 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, #EAB308 39px, #EAB308 40px)',
          }}
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative text-center">
          <div className="inline-flex items-center gap-2 bg-depot-yellow/20 border border-depot-yellow/30 text-depot-yellow rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
            <Sparkles size={14} /> Community Wishlist
          </div>
          <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-5">
            Don't see what<br />you need? <span className="text-depot-yellow">Wish it.</span>
          </h1>
          <p className="text-stone-300 text-xl leading-relaxed max-w-2xl mx-auto">
            If the app you need isn't in our catalog, describe it here. Our team reviews every wish — popular ones get built.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-5 gap-10">

        {/* ── Form ─────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-3">
          <h2 className="text-2xl font-black text-depot-black mb-1">Submit Your App Wish</h2>
          <p className="text-stone-500 text-sm mb-6">Be as detailed or as vague as you like — we'll follow up if we need more.</p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* App concept */}
            <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-depot-black flex items-center gap-2">
                <Lightbulb size={16} className="text-depot-yellow" /> The App Idea
              </h3>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  What would you call this app? *
                </label>
                <input
                  type="text" required value={form.title}
                  onChange={e => set('title', e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depot-orange"
                  placeholder="e.g. AI-powered meeting notes tracker"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Category (closest fit)</label>
                <select
                  value={form.categoryId}
                  onChange={e => set('categoryId', e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depot-orange"
                >
                  <option value="">Not sure</option>
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} Aisle {c.aisle} — {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Describe what it does *
                </label>
                <textarea
                  required value={form.description}
                  onChange={e => set('description', e.target.value)}
                  rows={4}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depot-orange resize-none"
                  placeholder="What problem does it solve? Who uses it? What does a typical workflow look like? The more detail the better."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Who are the users?</label>
                <input
                  type="text" value={form.targetUsers}
                  onChange={e => set('targetUsers', e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depot-orange"
                  placeholder="e.g. freelancers, small clinic admins, e-commerce store owners..."
                />
              </div>
            </div>

            {/* Key features */}
            <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-3">
              <h3 className="font-bold text-depot-black flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-500" /> Key Features (optional)
              </h3>
              <p className="text-xs text-stone-400">List the features that matter most to you.</p>
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-stone-300 text-sm w-5 text-right flex-shrink-0">{i + 1}.</span>
                  <input
                    type="text" value={f}
                    onChange={e => setFeature(i, e.target.value)}
                    className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depot-orange"
                    placeholder={`Feature ${i + 1}`}
                  />
                  {features.length > 1 && (
                    <button type="button" onClick={() => removeFeature(i)} className="text-stone-300 hover:text-red-400 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
              {features.length < 8 && (
                <button
                  type="button" onClick={addFeature}
                  className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-depot-orange transition-colors"
                >
                  <Plus size={14} /> Add another feature
                </button>
              )}
            </div>

            {/* Inspiration */}
            <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-depot-black flex items-center gap-2">
                <Code2 size={16} className="text-purple-500" /> Inspiration & Tech
              </h3>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Any apps that inspired this? (optional)
                </label>
                <input
                  type="text" value={form.inspiration}
                  onChange={e => set('inspiration', e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depot-orange"
                  placeholder="e.g. 'like Notion but for law firms' or 'similar to Calendly but with intake forms'"
                />
              </div>
            </div>

            {/* Budget & timeline */}
            <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-depot-black flex items-center gap-2">
                <Clock size={16} className="text-blue-500" /> Budget & Timeline
              </h3>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Budget range</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BUDGET_RANGES.map(b => (
                    <button key={b} type="button" onClick={() => set('budgetRange', b)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all text-left ${
                        form.budgetRange === b
                          ? 'border-depot-orange bg-orange-50 text-depot-orange'
                          : 'border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >{b}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">When do you need it?</label>
                <div className="flex flex-wrap gap-2">
                  {TIMELINES.map(t => (
                    <button key={t} type="button" onClick={() => set('timeline', t)}
                      className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition-all ${
                        form.timeline === t
                          ? 'border-depot-orange bg-orange-50 text-depot-orange'
                          : 'border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >{t}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-depot-black flex items-center gap-2">
                <Users size={16} className="text-stone-400" /> Your Contact Info
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Name *</label>
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
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Company (optional)</label>
                <input
                  type="text" value={form.company}
                  onChange={e => set('company', e.target.value)}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-depot-orange"
                  placeholder="Acme Inc."
                />
              </div>
            </div>

            {submitError && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {submitError}
              </div>
            )}
            <Button type="submit" size="xl" loading={loading} className="w-full">
              <Sparkles size={18} />
              {loading ? 'Submitting your wish...' : 'Submit App Wish'}
            </Button>

            <p className="text-xs text-center text-stone-400">
              We review every wish. If we decide to build it, you'll be first to know and get a discounted build rate.
            </p>
          </form>
        </div>

        {/* ── Sidebar: recent wishes ────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">
          <div>
            <h3 className="text-lg font-black text-depot-black mb-1">Recent Community Wishes</h3>
            <p className="text-stone-400 text-sm">Ideas submitted through the live backend.</p>
          </div>

          {wishesLoading && (
            <div className="bg-white border border-stone-200 rounded-xl p-4 text-sm text-stone-500">
              Loading recent wishes...
            </div>
          )}

          {!wishesLoading && recentWishes.length === 0 && (
            <div className="bg-white border border-stone-200 rounded-xl p-4">
              <p className="font-bold text-depot-black text-sm">No wishes submitted yet</p>
              <p className="text-xs text-stone-500 mt-1">The first submitted app wish will appear here after it is saved to Supabase.</p>
            </div>
          )}

          {recentWishes.map(wish => {
            const statusCfg = STATUS_CONFIG[wish.status] ?? STATUS_CONFIG.new
            const voted = votedIds.has(wish.id)
            return (
              <div key={wish.id} className="bg-white border border-stone-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-bold text-depot-black text-sm leading-tight">{wish.title}</h4>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${statusCfg.color}`}>
                    {statusCfg.label}
                  </span>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed mb-3">{wish.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <span className="bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">{wish.category_name ?? 'Uncategorized'}</span>
                    <span>by {wish.name}</span>
                  </div>
                  <button
                    onClick={() => toggleVote(wish.id)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                      voted
                        ? 'bg-depot-orange text-white border-depot-orange'
                        : 'border-stone-200 text-stone-500 hover:border-depot-orange hover:text-depot-orange'
                    }`}
                  >
                    ▲ {voted ? 1 : 0}
                  </button>
                </div>
              </div>
            )
          })}

          {/* Tip box */}
          <div className="bg-depot-yellow/10 border border-depot-yellow/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <MessageSquare size={18} className="text-depot-yellow flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-depot-black text-sm mb-1">How wishes get built</p>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Wishes with the most upvotes get reviewed first. If your idea is chosen, you'll get a discounted build rate and be involved in shaping the final product.
                </p>
                <Link to="/how-it-works" className="text-xs text-depot-orange font-semibold hover:underline mt-2 inline-flex items-center gap-1">
                  How the full process works <ArrowRight size={11} />
                </Link>
              </div>
            </div>
          </div>

          {/* Already have something in mind? */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
            <p className="font-bold text-depot-black text-sm mb-1">Something closer to a known template?</p>
            <p className="text-xs text-stone-500 mb-3">We might already have a sample app that matches what you need.</p>
            <Link
              to="/store"
              className="flex items-center gap-1.5 text-sm font-semibold text-depot-orange hover:underline"
            >
              Browse 85+ samples <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

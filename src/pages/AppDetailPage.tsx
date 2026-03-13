import { useParams, Link } from 'react-router-dom'
import {
  Plus, Check, Eye, Clock, Users, Star,
  ChevronDown, ChevronUp, Code2, Rocket, Shield
} from 'lucide-react'
import { useState } from 'react'
import { APPS, REVIEWS } from '../data/mockData'
import { useCart } from '../contexts/CartContext'
import { StarRating } from '../components/ui/StarRating'
import { Badge } from '../components/ui/Badge'
import { formatStartingPrice, formatNumber, getInitials, COMPLEXITY_LABELS, DEPLOYMENT_LABELS } from '../lib/utils'

export function AppDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const app = APPS.find(a => a.slug === slug)
  const { addRequest, removeRequest, hasRequest } = useCart()
  const [reviewsOpen, setReviewsOpen] = useState(true)

  if (!app) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">📦</p>
        <h1 className="text-2xl font-bold">App not found</h1>
        <Link to="/store" className="text-depot-orange hover:underline mt-4 inline-block">← Back to store</Link>
      </div>
    )
  }

  const inTray = hasRequest(app!.id)
  const reviews = REVIEWS[app!.id] ?? []
  const relatedApps = APPS.filter(a => a.categoryId === app!.categoryId && a.id !== app!.id).slice(0, 3)
  const complexity = COMPLEXITY_LABELS[app!.complexity]

  function handleTrayAction() {
    inTray ? removeRequest(app!.id) : addRequest(app!)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-stone-400 mb-6">
        <Link to="/store" className="hover:text-depot-black transition-colors">Store</Link>
        <span>/</span>
        <Link to={`/category/${app.category.slug}`} className="hover:text-depot-black transition-colors">
          {app.category.name}
        </Link>
        <span>/</span>
        <span className="text-depot-black font-medium">{app.name}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* App header */}
          <div>
            <div className="flex items-start gap-5">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-md flex-shrink-0"
                style={{ backgroundColor: app.category.color }}
              >
                {getInitials(app.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-3xl font-black text-depot-black">{app.name}</h1>
                  {app.featured && <Badge variant="orange">Featured</Badge>}
                  {app.newArrival && <Badge variant="green">New</Badge>}
                </div>
                <p className="text-lg text-stone-600 mb-3">{app.tagline}</p>
                <div className="flex items-center gap-4 flex-wrap text-sm">
                  <StarRating rating={app.rating} reviewCount={app.reviewCount} size="md" />
                  <span className="flex items-center gap-1 text-stone-400">
                    <Users size={14} /> {formatNumber(app.deliveredCount)} projects delivered
                  </span>
                </div>
              </div>
            </div>

            {/* Quick stats row */}
            <div className="flex gap-3 mt-5 flex-wrap">
              <span className={`border rounded-full px-3 py-1 text-xs font-semibold ${complexity.color}`}>
                {complexity.label}
              </span>
              <span className="flex items-center gap-1 border border-stone-200 rounded-full px-3 py-1 text-xs text-stone-600">
                <Clock size={11} /> {app.buildTime}
              </span>
              <span className="flex items-center gap-1 border border-stone-200 rounded-full px-3 py-1 text-xs text-stone-600">
                {DEPLOYMENT_LABELS[app.deploymentType]}
              </span>
              {app.tags.map(tag => (
                <span key={tag} className="bg-stone-100 text-stone-500 text-xs px-3 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Sample preview banner */}
          <div
            className="rounded-2xl overflow-hidden border-2 border-dashed flex items-center justify-center h-64 relative"
            style={{ borderColor: app.category.color + '40', backgroundColor: app.category.color + '08' }}
          >
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white mx-auto mb-3"
                style={{ backgroundColor: app.category.color }}
              >
                {getInitials(app.name)}
              </div>
              <p className="font-bold text-depot-black mb-1">Interactive Sample Demo</p>
              <p className="text-stone-400 text-sm mb-4">See exactly what you'll get before requesting a build</p>
              <a
                href={app.sampleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-depot-black text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-stone-800 transition-colors"
              >
                <Eye size={15} /> Open Sample App
              </a>
            </div>
          </div>

          {/* About */}
          <div>
            <h2 className="text-xl font-bold text-depot-black mb-3">About This App</h2>
            <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">{app.description}</p>
          </div>

          {/* What's included */}
          <div>
            <h2 className="text-xl font-bold text-depot-black mb-4">What's Included in Your Custom Build</h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {app.features.map(f => (
                <div key={f} className="flex items-start gap-2.5 text-sm text-stone-700">
                  <Check size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Tech stack */}
          <div>
            <h2 className="text-xl font-bold text-depot-black mb-3 flex items-center gap-2">
              <Code2 size={18} className="text-depot-orange" /> Default Tech Stack
            </h2>
            <p className="text-sm text-stone-500 mb-3">We use modern, well-supported technologies. Your build can use your preferred stack if different.</p>
            <div className="flex gap-2 flex-wrap">
              {app.techStack.map(t => (
                <span key={t} className="bg-stone-900 text-stone-100 text-xs font-mono px-3 py-1.5 rounded-lg">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div>
            <button
              onClick={() => setReviewsOpen(v => !v)}
              className="flex items-center justify-between w-full text-left mb-4"
            >
              <h2 className="text-xl font-bold text-depot-black">
                Client Reviews ({reviews.length})
              </h2>
              {reviewsOpen ? <ChevronUp size={18} className="text-stone-400" /> : <ChevronDown size={18} className="text-stone-400" />}
            </button>

            {reviewsOpen && (
              reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div key={review.id} className="bg-white border border-stone-200 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold text-stone-600">
                              {review.userName[0]}
                            </div>
                            <span className="font-semibold text-depot-black text-sm">{review.userName}</span>
                            {review.verified && (
                              <span className="text-emerald-600 text-xs flex items-center gap-0.5">
                                <Check size={11} /> Verified client
                              </span>
                            )}
                          </div>
                          <div className="mt-1">
                            <StarRating rating={review.rating} showCount={false} size="sm" />
                          </div>
                        </div>
                        <span className="text-xs text-stone-400 flex-shrink-0">{review.createdAt}</span>
                      </div>
                      <h4 className="font-semibold text-sm text-depot-black mb-1">{review.title}</h4>
                      <p className="text-sm text-stone-600 leading-relaxed">{review.body}</p>
                      <div className="flex items-center gap-1 mt-3 text-xs text-stone-400">
                        <Star size={11} /> {review.helpfulCount} found this helpful
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-stone-400 bg-stone-50 rounded-xl">
                  <Star size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No reviews yet for this app template.</p>
                </div>
              )
            )}
          </div>

          {/* Related */}
          {relatedApps.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-depot-black mb-4">More from {app.category.name}</h2>
              <div className="grid gap-3">
                {relatedApps.map(related => (
                  <Link
                    key={related.id}
                    to={`/app/${related.slug}`}
                    className="flex items-center gap-4 bg-white border border-stone-200 rounded-xl p-4 hover:border-stone-300 hover:shadow-sm transition-all"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: related.category.color }}
                    >
                      {getInitials(related.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-depot-black">{related.name}</p>
                      <p className="text-xs text-stone-400 truncate">{related.tagline}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-depot-black">{formatStartingPrice(related)}</p>
                      <p className="text-xs text-stone-400">{related.buildTime}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Request card */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm sticky top-24">
            <div className="mb-4">
              <p className="text-2xl font-black text-depot-black">{formatStartingPrice(app)}</p>
              {app.startingPrice && (
                <p className="text-xs text-stone-400 mt-0.5">Final price depends on your requirements</p>
              )}
            </div>

            <div className="space-y-2 mb-5">
              <button
                onClick={handleTrayAction}
                className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-base transition-all ${
                  inTray
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-red-50 hover:text-red-600'
                    : 'bg-depot-orange text-white hover:bg-depot-orange-dark'
                }`}
              >
                {inTray ? (
                  <><Check size={18} /> Added — Click to Remove</>
                ) : (
                  <><Plus size={18} /> Add to Build Tray</>
                )}
              </button>

              <a
                href={app.sampleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 border-2 border-stone-200 rounded-xl text-stone-600 hover:border-stone-300 font-semibold text-sm transition-colors"
              >
                <Eye size={16} /> Try Sample App
              </a>
            </div>

            {/* Build details */}
            <div className="space-y-3 border-t border-stone-100 pt-4">
              {[
                { icon: <Clock size={14} />, label: 'Build Time', value: app.buildTime },
                { icon: <Rocket size={14} />, label: 'Type', value: DEPLOYMENT_LABELS[app.deploymentType] },
                { icon: <Users size={14} />, label: 'Delivered', value: `${app.deliveredCount}× for clients` },
                { icon: <Shield size={14} />, label: 'Guarantee', value: '30-day revision policy' },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-stone-400">
                    <span className="text-depot-orange">{icon}</span> {label}
                  </span>
                  <span className="font-medium text-depot-black text-right">{value}</span>
                </div>
              ))}
            </div>

            <Link
              to="/cart"
              className="block text-center text-xs text-depot-orange hover:underline mt-4"
            >
              View Build Tray & Submit Request →
            </Link>
          </div>

          {/* Vendor */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5">
            <h3 className="font-bold text-depot-black text-sm mb-3">Built by</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-depot-orange flex items-center justify-center text-white font-bold flex-shrink-0">
                {app.vendor.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm text-depot-black">{app.vendor.name}</span>
                  {app.vendor.verified && <span className="text-blue-600 text-xs">✓ Verified</span>}
                </div>
                <div className="flex items-center gap-1 text-xs text-stone-400">
                  <Star size={10} className="fill-depot-yellow text-depot-yellow" />
                  {app.vendor.rating} · {app.vendor.deliveredProjects} projects
                </div>
              </div>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">{app.vendor.description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

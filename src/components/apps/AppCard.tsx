import { Eye, Plus, Check, Clock, Layers } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import type { App } from '../../types'
import { useCart } from '../../contexts/CartContext'
import { StarRating } from '../ui/StarRating'
import { Badge } from '../ui/Badge'
import { formatStartingPrice, formatNumber, getInitials, COMPLEXITY_LABELS } from '../../lib/utils'

interface AppCardProps {
  app: App
  compact?: boolean
}

export function AppCard({ app, compact = false }: AppCardProps) {
  const { addRequest, hasRequest } = useCart()
  const navigate = useNavigate()
  const inTray = hasRequest(app.id)
  const complexity = COMPLEXITY_LABELS[app.complexity]

  function handleTrayClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (inTray) {
      navigate('/cart')
      return
    }

    addRequest(app)
    navigate('/cart')
  }

  function handleDemoClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    navigate(app.sampleUrl)
  }

  return (
    <Link to={`/app/${app.slug}`} className="group block">
      <div className="bg-white rounded-xl border border-stone-200 hover:border-stone-300 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col h-full">
        {/* Top color bar */}
        <div className="h-1" style={{ backgroundColor: app.category.color }} />

        {/* Header */}
        <div className="p-4 flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0 shadow-sm"
            style={{ backgroundColor: app.category.color }}
          >
            {getInitials(app.name)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-depot-black text-sm group-hover:text-depot-orange transition-colors truncate">
                {app.name}
              </h3>
              {app.newArrival && <Badge variant="green">New</Badge>}
              {app.featured && <Badge variant="orange">Featured</Badge>}
            </div>
            <p className="text-xs text-stone-400 mt-0.5">{app.vendor.name}</p>
          </div>
        </div>

        {/* Tagline */}
        <div className="px-4 pb-3">
          <p className={`text-stone-600 text-sm leading-snug ${compact ? 'line-clamp-1' : 'line-clamp-2'}`}>
            {app.tagline}
          </p>
          {!compact && (
            <p className="text-xs text-stone-400 mt-2 line-clamp-1">
              For {app.targetCustomer}
            </p>
          )}
        </div>

        {/* Metadata */}
        {!compact && (
          <div className="px-4 pb-3 flex items-center gap-3 flex-wrap text-xs text-stone-400">
            <span className={`border rounded-full px-2 py-0.5 font-medium ${complexity.color}`}>
              {complexity.label}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={10} /> {app.buildTime}
            </span>
            <span className="flex items-center gap-1">
              <Layers size={10} /> {app.deploymentType.replace('_', ' ')}
            </span>
          </div>
        )}

        <div className="flex-1" />

        {/* Footer */}
        <div className="px-4 py-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <div>
            <p className="font-bold text-sm text-depot-black">{formatStartingPrice(app)}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <StarRating rating={app.rating} size="sm" showCount={false} />
              <span className="text-xs text-stone-400">{formatNumber(app.deliveredCount)} built</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleDemoClick}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-stone-200 text-stone-500 hover:border-stone-300 hover:bg-stone-50 transition-all"
            >
              <Eye size={11} /> Demo
            </button>
            <button
              onClick={handleTrayClick}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                inTray
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-depot-orange text-white hover:bg-depot-orange-dark'
              }`}
            >
              {inTray ? <><Check size={11} /> View Tray</> : <><Plus size={11} /> Add to Tray</>}
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}

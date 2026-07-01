import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import {
  Package, Zap, ExternalLink, Clock, CheckCircle, Hammer,
  FolderOpen, MessageSquare, AlertCircle, RotateCcw, Search
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { APPS } from '../data/mockData'
import { getInitials } from '../lib/utils'
import type { ProjectStatus } from '../types'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

interface DashboardRequestApp {
  app_slug: string | null
  app_name: string
  category: string | null
  starting_price: string | null
  build_time: string | null
}

interface DashboardRequest {
  id: string
  request_number: string
  customer_name: string
  customer_email: string
  company: string | null
  requirements: string
  budget_range: string
  timeline: string
  status: ProjectStatus
  quoted_price: number | null
  estimated_delivery: string | null
  delivered_url: string | null
  internal_notes: string | null
  created_at: string
  build_request_apps: DashboardRequestApp[]
}

const STATUS_STEPS: ProjectStatus[] = [
  'submitted', 'reviewing', 'quoted', 'approved', 'building', 'testing', 'delivered',
]

const STATUS_CONFIG: Record<ProjectStatus, {
  label: string
  icon: React.ReactNode
  color: string
  bg: string
  border: string
  description: string
}> = {
  submitted:  { label: 'Submitted',   icon: <FolderOpen size={16} />,    color: 'text-stone-600',   bg: 'bg-stone-100',   border: 'border-stone-200', description: 'Request received' },
  reviewing:  { label: 'Reviewing',   icon: <Search size={16} />,         color: 'text-blue-600',    bg: 'bg-blue-50',     border: 'border-blue-200',  description: 'Team is reviewing your requirements' },
  quoted:     { label: 'Quoted',      icon: <MessageSquare size={16} />,  color: 'text-purple-600',  bg: 'bg-purple-50',   border: 'border-purple-200', description: 'Quote sent — awaiting your approval' },
  approved:   { label: 'Approved',    icon: <CheckCircle size={16} />,    color: 'text-emerald-600', bg: 'bg-emerald-50',  border: 'border-emerald-200', description: 'Quote approved, kicking off build' },
  building:   { label: 'Building',    icon: <Hammer size={16} />,         color: 'text-orange-600',  bg: 'bg-orange-50',   border: 'border-orange-200', description: 'In active development' },
  testing:    { label: 'Testing',     icon: <RotateCcw size={16} />,      color: 'text-yellow-600',  bg: 'bg-yellow-50',   border: 'border-yellow-200', description: 'QA and final review' },
  delivered:  { label: 'Delivered',   icon: <Zap size={16} />,            color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-300', description: 'Live and delivered!' },
  cancelled:  { label: 'Cancelled',   icon: <AlertCircle size={16} />,    color: 'text-red-600',     bg: 'bg-red-50',      border: 'border-red-200',   description: 'Project cancelled' },
}

const FALLBACK_STATUS_CONFIG = STATUS_CONFIG.submitted

function getStatusConfig(status: ProjectStatus) {
  return STATUS_CONFIG[status] ?? FALLBACK_STATUS_CONFIG
}

function normalizeRequestApps(apps: DashboardRequest['build_request_apps'] | null | undefined) {
  return Array.isArray(apps) ? apps : []
}

function ProgressBar({ status }: { status: ProjectStatus }) {
  const idx = STATUS_STEPS.indexOf(status)
  const pct = idx < 0 ? 0 : Math.round(((idx + 1) / STATUS_STEPS.length) * 100)

  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs text-stone-400 mb-1">
        <span>Progress</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            backgroundColor: status === 'delivered' ? '#10B981' : status === 'cancelled' ? '#EF4444' : '#F97316',
          }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-stone-400">Submitted</span>
        <span className="text-xs text-stone-400">Delivered</span>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<DashboardRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (!user || !isSupabaseConfigured || !supabase) return

    let cancelled = false

    async function loadRequests() {
      setLoading(true)
      setLoadError('')
      const { data, error } = await supabase!
        .from('build_requests')
        .select(`
          id,
          request_number,
          customer_name,
          customer_email,
          company,
          requirements,
          budget_range,
          timeline,
          status,
          quoted_price,
          estimated_delivery,
          delivered_url,
          internal_notes,
          created_at,
          build_request_apps (
            app_slug,
            app_name,
            category,
            starting_price,
            build_time
          )
        `)
        .order('created_at', { ascending: false })

      if (!cancelled) {
        if (error) {
          setLoadError(error.message)
          setRequests([])
        } else {
          setRequests((data ?? []) as DashboardRequest[])
        }
        setLoading(false)
      }
    }

    loadRequests()

    return () => {
      cancelled = true
    }
  }, [user])

  const delivered = requests.filter(p => p.status === 'delivered').length
  const inProgress = requests.filter(p => !['delivered', 'cancelled', 'submitted'].includes(p.status)).length
  const totalQuoted = requests.reduce((sum, request) => sum + (request.quoted_price ?? 0), 0)

  const requestCards = useMemo(() => requests.map(request => {
    const requestApps = normalizeRequestApps(request.build_request_apps)
    const firstRequestedApp = requestApps[0]
    const app = APPS.find(a => a.slug === firstRequestedApp?.app_slug)
      ?? APPS.find(a => a.name === firstRequestedApp?.app_name)

    return {
      request,
      app,
      appName: firstRequestedApp?.app_name ?? 'Custom App Build',
      appTagline: app?.tagline ?? request.requirements ?? 'Custom app request',
      appSlug: app?.slug,
      categoryColor: app?.category.color ?? '#F97316',
      vendorName: app?.vendor.name ?? 'App Depot Studio',
    }
  }), [requests])

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <Package size={64} className="mx-auto mb-4 text-stone-300" />
        <h1 className="text-2xl font-bold text-depot-black mb-2">Sign in to view your projects</h1>
        <p className="text-stone-500 mb-6">Track your custom build requests and project status.</p>
        <Link to="/auth" className="bg-depot-orange text-white px-8 py-3 rounded-xl font-bold hover:bg-depot-orange-dark transition-colors">
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-depot-black">My Projects</h1>
          <p className="text-stone-500 mt-1">Welcome back, {user.fullName ?? user.email.split('@')[0]}</p>
        </div>
        <Link
          to="/store"
          className="flex items-center gap-2 bg-depot-orange text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-depot-orange-dark transition-colors"
        >
          <Package size={16} /> Request New App
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Projects', value: requests.length, icon: <FolderOpen size={20} />, color: 'text-depot-orange' },
          { label: 'Delivered', value: delivered, icon: <CheckCircle size={20} />, color: 'text-emerald-600' },
          { label: 'In Progress', value: inProgress, icon: <Hammer size={20} />, color: 'text-blue-600' },
          { label: 'Quoted Total', value: `$${totalQuoted.toLocaleString()}`, icon: <Zap size={20} />, color: 'text-purple-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-stone-200 rounded-xl p-4">
            <div className={`${stat.color} mb-2`}>{stat.icon}</div>
            <div className="text-2xl font-black text-depot-black">{stat.value}</div>
            <div className="text-xs text-stone-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center text-stone-500">
          Loading your real project requests...
        </div>
      )}

      {loadError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-sm text-red-700">
          Could not load project requests: {loadError}
        </div>
      )}

      {!loading && !loadError && requests.length === 0 && (
        <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center mb-8">
          <FolderOpen size={44} className="mx-auto mb-3 text-stone-300" />
          <h2 className="font-bold text-depot-black text-lg">No build requests yet</h2>
          <p className="text-stone-500 text-sm mt-1 mb-5">Submit a quote request from the Build Tray and it will appear here.</p>
          <Link to="/store" className="inline-flex items-center gap-2 bg-depot-orange text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-depot-orange-dark transition-colors">
            Browse Apps
          </Link>
        </div>
      )}

      {/* Projects */}
      <div className="space-y-4">
        {requestCards.map(({ request, appName, appTagline, appSlug, categoryColor, vendorName }) => {
          const cfg = getStatusConfig(request.status)
          return (
            <div key={request.id} className="bg-white border border-stone-200 rounded-2xl p-6">
              <div className="flex items-start gap-5">
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-sm flex-shrink-0"
                  style={{ backgroundColor: categoryColor }}
                >
                  {getInitials(appName)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="font-bold text-depot-black text-lg">{appName}</h3>
                      <p className="text-sm text-stone-500 mt-0.5 line-clamp-2">{appTagline}</p>
                      <p className="text-xs text-stone-400 mt-1">{request.request_number}</p>
                    </div>

                    {/* Status badge */}
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                      {cfg.icon} {cfg.label}
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 mt-2 text-xs text-stone-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> Submitted {new Date(request.created_at).toLocaleDateString()}
                    </span>
                    {request.quoted_price && (
                      <span className="font-semibold text-depot-black">${request.quoted_price.toLocaleString()}</span>
                    )}
                    {request.estimated_delivery && (
                      <span>Est. delivery: {request.estimated_delivery}</span>
                    )}
                    <span>{vendorName}</span>
                  </div>

                  {/* Progress bar */}
                  <ProgressBar status={request.status} />

                  {/* Notes */}
                  {(request.internal_notes || request.requirements) && (
                    <div className="mt-3 text-xs text-stone-500 bg-stone-50 rounded-lg p-3 leading-relaxed">
                      {request.internal_notes ?? request.requirements}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4">
                    {request.status === 'delivered' && request.delivered_url && (
                      <a
                        href={request.delivered_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-colors"
                      >
                        <Zap size={14} /> Open Live App
                      </a>
                    )}
                    {request.status === 'quoted' && (
                      <button className="flex items-center gap-1.5 bg-depot-orange text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-depot-orange-dark transition-colors">
                        <CheckCircle size={14} /> Approve Quote
                      </button>
                    )}
                    <button className="flex items-center gap-1.5 border border-stone-200 text-stone-500 px-4 py-2 rounded-lg text-sm hover:bg-stone-50 transition-colors">
                      <MessageSquare size={14} /> Message Team
                    </button>
                    {appSlug && (
                      <Link
                        to={`/app/${appSlug}`}
                        className="flex items-center gap-1 text-stone-400 hover:text-stone-600 p-2 rounded-lg hover:bg-stone-50 transition-colors"
                      >
                        <ExternalLink size={14} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* CTA */}
      <div className="mt-8 bg-gradient-to-r from-depot-orange/10 to-orange-50 border border-depot-orange/20 rounded-2xl p-6 flex items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-depot-black">Need something else built?</h3>
          <p className="text-sm text-stone-500 mt-0.5">Browse 85+ sample apps across 8 categories. Try the demo, then request your custom build.</p>
        </div>
        <Link
          to="/store"
          className="flex items-center gap-2 bg-depot-orange text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-depot-orange-dark transition-colors whitespace-nowrap flex-shrink-0"
        >
          Browse Apps <ExternalLink size={14} />
        </Link>
      </div>
    </div>
  )
}

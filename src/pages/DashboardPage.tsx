import { Link } from 'react-router-dom'
import {
  Package, Zap, ExternalLink, Clock, CheckCircle, Hammer,
  FolderOpen, MessageSquare, AlertCircle, RotateCcw, Search
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { DEMO_PROJECTS } from '../data/mockData'
import { getInitials } from '../lib/utils'
import type { ProjectStatus } from '../types'

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

  const delivered = DEMO_PROJECTS.filter(p => p.status === 'delivered').length
  const inProgress = DEMO_PROJECTS.filter(p => !['delivered', 'cancelled', 'submitted'].includes(p.status)).length

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
          { label: 'Total Projects', value: DEMO_PROJECTS.length, icon: <FolderOpen size={20} />, color: 'text-depot-orange' },
          { label: 'Delivered', value: delivered, icon: <CheckCircle size={20} />, color: 'text-emerald-600' },
          { label: 'In Progress', value: inProgress, icon: <Hammer size={20} />, color: 'text-blue-600' },
          { label: 'Total Invested', value: `$${DEMO_PROJECTS.filter(p => p.quotedPrice).reduce((s, p) => s + (p.quotedPrice ?? 0), 0).toLocaleString()}`, icon: <Zap size={20} />, color: 'text-purple-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white border border-stone-200 rounded-xl p-4">
            <div className={`${stat.color} mb-2`}>{stat.icon}</div>
            <div className="text-2xl font-black text-depot-black">{stat.value}</div>
            <div className="text-xs text-stone-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Projects */}
      <div className="space-y-4">
        {DEMO_PROJECTS.map(project => {
          const cfg = STATUS_CONFIG[project.status]
          return (
            <div key={project.id} className="bg-white border border-stone-200 rounded-2xl p-6">
              <div className="flex items-start gap-5">
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-sm flex-shrink-0"
                  style={{ backgroundColor: project.app.category.color }}
                >
                  {getInitials(project.app.name)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="font-bold text-depot-black text-lg">{project.app.name}</h3>
                      <p className="text-sm text-stone-500 mt-0.5">{project.app.tagline}</p>
                    </div>

                    {/* Status badge */}
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                      {cfg.icon} {cfg.label}
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 mt-2 text-xs text-stone-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> Submitted {project.submittedAt}
                    </span>
                    {project.quotedPrice && (
                      <span className="font-semibold text-depot-black">${project.quotedPrice.toLocaleString()}</span>
                    )}
                    {project.estimatedDelivery && (
                      <span>Est. delivery: {project.estimatedDelivery}</span>
                    )}
                    <span>{project.app.vendor.name}</span>
                  </div>

                  {/* Progress bar */}
                  <ProgressBar status={project.status} />

                  {/* Notes */}
                  {project.notes && (
                    <div className="mt-3 text-xs text-stone-500 bg-stone-50 rounded-lg p-3 leading-relaxed">
                      {project.notes}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4">
                    {project.status === 'delivered' && project.deliveredUrl && (
                      <a
                        href={project.deliveredUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-colors"
                      >
                        <Zap size={14} /> Open Live App
                      </a>
                    )}
                    {project.status === 'quoted' && (
                      <button className="flex items-center gap-1.5 bg-depot-orange text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-depot-orange-dark transition-colors">
                        <CheckCircle size={14} /> Approve Quote
                      </button>
                    )}
                    <button className="flex items-center gap-1.5 border border-stone-200 text-stone-500 px-4 py-2 rounded-lg text-sm hover:bg-stone-50 transition-colors">
                      <MessageSquare size={14} /> Message Team
                    </button>
                    <Link
                      to={`/app/${project.app.slug}`}
                      className="flex items-center gap-1 text-stone-400 hover:text-stone-600 p-2 rounded-lg hover:bg-stone-50 transition-colors"
                    >
                      <ExternalLink size={14} />
                    </Link>
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

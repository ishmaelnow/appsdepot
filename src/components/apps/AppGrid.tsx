import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import type { App } from '../../types'
import { AppCard } from './AppCard'

interface AppGridProps {
  apps: App[]
  compact?: boolean
  columns?: 2 | 3 | 4
}

const colClasses = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}

export function AppGrid({ apps, compact = false, columns = 3 }: AppGridProps) {
  if (!apps.length) {
    return (
      <div className="py-20 text-center text-stone-400">
        <p className="text-5xl mb-4">🏪</p>
        <p className="text-lg font-semibold text-depot-black">No apps found</p>
        <p className="text-sm mt-1 mb-6">Try adjusting your filters, or suggest something new.</p>
        <Link
          to="/wish"
          className="inline-flex items-center gap-2 bg-depot-yellow/10 border border-depot-yellow/40 text-depot-black px-6 py-3 rounded-xl font-bold hover:bg-depot-yellow/20 transition-colors"
        >
          <Sparkles size={16} className="text-depot-yellow" /> Wish an App Instead
        </Link>
      </div>
    )
  }

  return (
    <div className={`grid gap-4 ${colClasses[columns]}`}>
      {apps.map(app => (
        <AppCard key={app.id} app={app} compact={compact} />
      ))}
    </div>
  )
}

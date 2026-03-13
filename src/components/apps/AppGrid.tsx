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
        <p className="text-lg font-semibold">No apps found</p>
        <p className="text-sm mt-1">Try adjusting your filters</p>
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

import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { App } from '../../types'
import { AppGrid } from '../apps/AppGrid'

interface FeaturedAppsProps {
  title: string
  subtitle?: string
  apps: App[]
  viewAllHref?: string
}

export function FeaturedApps({ title, subtitle, apps, viewAllHref }: FeaturedAppsProps) {
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-depot-black">{title}</h2>
            {subtitle && <p className="text-stone-500 text-sm mt-0.5">{subtitle}</p>}
          </div>
          {viewAllHref && (
            <Link to={viewAllHref} className="flex items-center gap-1 text-depot-orange font-semibold text-sm hover:underline">
              View All <ArrowRight size={14} />
            </Link>
          )}
        </div>
        <AppGrid apps={apps} columns={4} compact />
      </div>
    </section>
  )
}

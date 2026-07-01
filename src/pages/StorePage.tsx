import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { APPS, CATEGORIES } from '../data/mockData'
import { AppGrid } from '../components/apps/AppGrid'
import { AppFilters, type FilterState } from '../components/apps/AppFilters'

export function StorePage() {
  const [searchParams] = useSearchParams()

  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('q') ?? '',
    categoryId: '',
    complexity: '',
    sortBy: 'featured',
  })

  useEffect(() => {
    const q = searchParams.get('q')
    const sort = searchParams.get('sort')
    if (q) setFilters(f => ({ ...f, search: q }))
    if (sort) setFilters(f => ({ ...f, sortBy: sort }))
  }, [searchParams])

  const filtered = useMemo(() => {
    let apps = [...APPS]
    const filter = searchParams.get('filter')

    if (filter === 'featured') {
      apps = apps.filter(a => a.featured)
    }

    if (filter === 'new') {
      apps = apps.filter(a => a.newArrival)
    }

    if (filters.search) {
      const q = filters.search.toLowerCase()
      apps = apps.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.tagline.toLowerCase().includes(q) ||
        a.targetCustomer.toLowerCase().includes(q) ||
        a.tags.some(t => t.includes(q)) ||
        a.vendor.name.toLowerCase().includes(q) ||
        a.techStack.some(t => t.toLowerCase().includes(q))
      )
    }

    if (filters.categoryId) {
      apps = apps.filter(a => a.categoryId === filters.categoryId)
    }

    if (filters.complexity) {
      apps = apps.filter(a => a.complexity === filters.complexity)
    }

    switch (filters.sortBy) {
      case 'rating':
        apps.sort((a, b) => b.rating - a.rating)
        break
      case 'delivered':
        apps.sort((a, b) => b.deliveredCount - a.deliveredCount)
        break
      case 'newest':
        apps.sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0))
        break
      case 'price_asc':
        apps.sort((a, b) => (a.startingPrice ?? 0) - (b.startingPrice ?? 0))
        break
      default:
        apps.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    }

    return apps
  }, [filters, searchParams])

  const activeCategory = CATEGORIES.find(c => c.id === filters.categoryId)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-depot-black">
          {activeCategory ? (
            <span className="flex items-center gap-2">
              <span>{activeCategory.icon}</span>
              <span>{activeCategory.name}</span>
              <span className="text-stone-400 font-normal text-2xl">— Aisle {activeCategory.aisle}</span>
            </span>
          ) : searchParams.get('filter') === 'new' ? 'Recently Added Apps' : searchParams.get('filter') === 'featured' ? 'Featured App Templates' : 'All App Templates'}
        </h1>
        <p className="text-stone-500 mt-1">
          {activeCategory?.description ?? 'Browse app templates, preview the workflow, and request a custom build or quote.'}
        </p>
      </div>

      <div className="mb-6">
        <AppFilters filters={filters} categories={CATEGORIES} onChange={setFilters} total={filtered.length} />
      </div>

      <AppGrid apps={filtered} columns={3} />
    </div>
  )
}

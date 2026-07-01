import { Search, SlidersHorizontal } from 'lucide-react'
import type { Category } from '../../types'

export interface FilterState {
  search: string
  categoryId: string
  complexity: string
  sortBy: string
}

interface AppFiltersProps {
  filters: FilterState
  categories: Category[]
  onChange: (filters: FilterState) => void
  total: number
}

export function AppFilters({ filters, categories, onChange, total }: AppFiltersProps) {
  function update(partial: Partial<FilterState>) {
    onChange({ ...filters, ...partial })
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-4">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          placeholder="Search apps..."
          value={filters.search}
          onChange={e => update({ search: e.target.value })}
          className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-depot-orange focus:border-transparent"
        />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <SlidersHorizontal size={16} className="text-stone-400 flex-shrink-0" />

        <select
          value={filters.categoryId}
          onChange={e => update({ categoryId: e.target.value })}
          className="flex-1 min-w-32 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depot-orange"
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>Aisle {c.aisle} — {c.name}</option>
          ))}
        </select>

        <select
          value={filters.complexity}
          onChange={e => update({ complexity: e.target.value })}
          className="flex-1 min-w-32 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depot-orange"
        >
          <option value="">All Sizes</option>
          <option value="starter">Starter</option>
          <option value="standard">Standard</option>
          <option value="enterprise">Enterprise</option>
        </select>

        <select
          value={filters.sortBy}
          onChange={e => update({ sortBy: e.target.value })}
          className="flex-1 min-w-32 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-depot-orange"
        >
          <option value="featured">Featured</option>
          <option value="rating">Top Rated</option>
          <option value="delivered">Most Delivered</option>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
        </select>

        <span className="text-sm text-stone-400 ml-auto whitespace-nowrap">
          {total} app{total !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}

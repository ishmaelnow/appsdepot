import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { Category } from '../../types'

interface CategoryGridProps {
  categories: Category[]
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-depot-black">Shop by Aisle</h2>
            <p className="text-stone-500 text-sm mt-0.5">Every aisle stocked with the best apps in the category</p>
          </div>
          <Link to="/store" className="flex items-center gap-1 text-depot-orange font-semibold text-sm hover:underline">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.map(cat => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="group relative bg-white border border-stone-200 rounded-xl p-4 hover:border-stone-300 hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {/* Color accent */}
              <div
                className="absolute top-0 left-0 w-full h-1 opacity-80"
                style={{ backgroundColor: cat.color }}
              />

              {/* Aisle badge */}
              <div
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold mb-3 text-white"
                style={{ backgroundColor: cat.color }}
              >
                Aisle {cat.aisle}
              </div>

              <div className="flex items-start gap-3">
                <span className="text-3xl">{cat.icon}</span>
                <div>
                  <h3 className="font-bold text-depot-black text-sm group-hover:text-depot-orange transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">{cat.appCount} apps</p>
                </div>
              </div>

              <p className="text-xs text-stone-500 mt-2 line-clamp-2 leading-relaxed">
                {cat.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

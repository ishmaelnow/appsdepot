import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { APPS, CATEGORIES } from '../data/mockData'
import { AppGrid } from '../components/apps/AppGrid'

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const category = CATEGORIES.find(c => c.slug === slug)

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">🏗️</p>
        <h1 className="text-2xl font-bold text-depot-black">Aisle not found</h1>
        <Link to="/store" className="text-depot-orange hover:underline mt-4 inline-block">← Back to store</Link>
      </div>
    )
  }

  const apps = APPS.filter(a => a.categoryId === category.id)

  return (
    <div>
      {/* Category header */}
      <div className="relative overflow-hidden" style={{ backgroundColor: category.color + '15' }}>
        <div className="h-1" style={{ backgroundColor: category.color }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link to="/store" className="inline-flex items-center gap-1 text-stone-500 hover:text-depot-black text-sm mb-4 transition-colors">
            <ArrowLeft size={14} /> All Apps
          </Link>
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-sm"
              style={{ backgroundColor: category.color + '25' }}
            >
              {category.icon}
            </div>
            <div>
              <div
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white mb-2"
                style={{ backgroundColor: category.color }}
              >
                Aisle {category.aisle}
              </div>
              <h1 className="text-3xl font-black text-depot-black">{category.name}</h1>
              <p className="text-stone-500 mt-1">{category.description}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm text-stone-500">
            <span className="font-semibold" style={{ color: category.color }}>{apps.length} apps</span>
            <span>in this aisle</span>
          </div>
        </div>
      </div>

      {/* Apps grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AppGrid apps={apps} columns={3} />
      </div>
    </div>
  )
}

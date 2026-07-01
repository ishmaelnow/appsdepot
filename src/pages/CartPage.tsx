import { Link } from 'react-router-dom'
import { FolderOpen, Trash2, ArrowRight, Package, Eye, Clock } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { formatStartingPrice, getInitials, COMPLEXITY_LABELS } from '../lib/utils'

export function CartPage() {
  const { requests, removeRequest, count } = useCart()

  if (count === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <FolderOpen size={64} className="mx-auto mb-4 text-stone-300" />
        <h1 className="text-3xl font-black text-depot-black mb-2">Your build tray is empty</h1>
        <p className="text-stone-500 mb-8">Browse sample apps, find what you need, and add it to your tray to request a custom build.</p>
        <Link
          to="/store"
          className="inline-flex items-center gap-2 bg-depot-orange text-white px-8 py-3 rounded-xl font-bold hover:bg-depot-orange-dark transition-colors"
        >
          <Package size={18} /> Browse Apps
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-depot-black">
          Build Tray <span className="text-stone-400 font-normal text-xl">({count} app{count !== 1 ? 's' : ''})</span>
        </h1>
        <p className="text-stone-500 mt-1">These are the apps you want built. Submit a request and we'll reach out with a quote.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Items */}
        <div className="md:col-span-2 space-y-3">
          {requests.map(({ app }) => {
            const complexity = COMPLEXITY_LABELS[app.complexity]
            return (
              <div key={app.id} className="bg-white border border-stone-200 rounded-xl p-4">
                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: app.category.color }}
                  >
                    {getInitials(app.name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link to={`/app/${app.slug}`} className="font-bold text-depot-black hover:text-depot-orange transition-colors">
                          {app.name}
                        </Link>
                        <p className="text-sm text-stone-500 mt-0.5">{app.vendor.name}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-depot-black">{formatStartingPrice(app)}</p>
                        <p className="text-xs text-stone-400">starting price</p>
                      </div>
                    </div>

                    <p className="text-sm text-stone-500 mt-1.5 line-clamp-1">{app.tagline}</p>

                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className={`border rounded-full px-2 py-0.5 text-xs font-semibold ${complexity.color}`}>
                        {complexity.label}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-stone-400">
                        <Clock size={11} /> {app.buildTime}
                      </span>
                      <div className="flex gap-1 flex-wrap">
                        {app.techStack.slice(0, 3).map(t => (
                          <span key={t} className="bg-stone-100 text-stone-500 text-xs px-2 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-stone-100">
                  <Link
                    to={app.sampleUrl}
                    className="flex items-center gap-1 text-sm text-stone-500 hover:text-depot-black transition-colors"
                  >
                    <Eye size={13} /> Try Sample
                  </Link>
                  <Link to={`/app/${app.slug}`} className="flex items-center gap-1 text-sm text-stone-500 hover:text-depot-black transition-colors">
                    View Details
                  </Link>
                  <button
                    onClick={() => removeRequest(app.id)}
                    className="ml-auto flex items-center gap-1 text-sm text-stone-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            )
          })}

          <Link to="/store" className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-stone-200 rounded-xl text-stone-400 hover:border-depot-orange hover:text-depot-orange transition-colors text-sm font-medium">
            + Add another app
          </Link>
        </div>

        {/* Summary */}
        <div className="md:col-span-1">
          <div className="bg-white border border-stone-200 rounded-2xl p-5 sticky top-24">
            <h2 className="font-bold text-depot-black text-lg mb-4">Your Request</h2>

            <div className="space-y-2 pb-4 border-b border-stone-100">
              {requests.map(({ app }) => (
                <div key={app.id} className="flex justify-between text-sm">
                  <span className="text-stone-600 truncate mr-2">{app.name}</span>
                  <span className="font-semibold text-depot-black flex-shrink-0 text-xs">
                    {formatStartingPrice(app)}
                  </span>
                </div>
              ))}
            </div>

            <div className="py-4 space-y-1 text-xs text-stone-400">
              <p>• You'll receive a detailed quote within 24 hours</p>
              <p>• No payment required to submit a request</p>
              <p>• Final price is agreed before any work begins</p>
            </div>

            <Link
              to="/checkout"
              className="flex items-center justify-center gap-2 w-full bg-depot-orange hover:bg-depot-orange-dark text-white py-4 rounded-xl font-bold text-base transition-colors"
            >
              Submit Build Request <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

import { X, FolderOpen, Trash2, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { formatStartingPrice, getInitials } from '../../lib/utils'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { requests, removeRequest, count } = useCart()

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <FolderOpen size={20} className="text-depot-orange" />
            <h2 className="font-bold text-depot-black">Build Tray ({count})</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-stone-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {requests.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <FolderOpen size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">Your build tray is empty</p>
              <p className="text-sm mt-1">Browse apps and add what you want built</p>
            </div>
          ) : (
            requests.map(({ app }) => (
              <div key={app.id} className="flex items-center gap-3 bg-stone-50 rounded-xl p-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: app.category.color }}
                >
                  {getInitials(app.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-depot-black truncate">{app.name}</p>
                  <p className="text-xs text-stone-400">{app.buildTime}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-sm text-depot-black">{formatStartingPrice(app)}</p>
                  <button
                    onClick={() => removeRequest(app.id)}
                    className="text-red-400 hover:text-red-600 transition-colors mt-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {requests.length > 0 && (
          <div className="border-t border-stone-100 p-4 space-y-3">
            <p className="text-xs text-stone-400 text-center">No payment required — we'll quote you first</p>
            <Link
              to="/checkout"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full bg-depot-orange hover:bg-depot-orange-dark text-white py-3 rounded-xl font-bold transition-colors"
            >
              Submit Build Request <ArrowRight size={16} />
            </Link>
            <Link
              to="/cart"
              onClick={onClose}
              className="flex items-center justify-center w-full border-2 border-stone-200 text-stone-600 py-2.5 rounded-xl font-semibold text-sm hover:border-stone-300 transition-colors"
            >
              View Build Tray
            </Link>
          </div>
        )}
      </div>
    </>
  )
}

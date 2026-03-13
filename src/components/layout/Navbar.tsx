import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FolderOpen, User, Package, LogOut, ChevronDown, Warehouse, Menu, X, Plus } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { CATEGORIES } from '../../data/mockData'

export function Navbar() {
  const { user, signOut } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [aisleOpen, setAisleOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    setUserOpen(false)
    navigate('/')
  }

  return (
    <header className="bg-depot-black text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="bg-depot-orange w-9 h-9 rounded-lg flex items-center justify-center">
              <Warehouse size={20} className="text-white" />
            </div>
            <div>
              <div className="font-black text-lg leading-none text-white">APPS</div>
              <div className="font-black text-lg leading-none text-depot-orange">DEPOT</div>
            </div>
          </Link>

          {/* Aisles dropdown */}
          <div className="relative hidden md:block">
            <button
              onMouseEnter={() => setAisleOpen(true)}
              onMouseLeave={() => setAisleOpen(false)}
              onClick={() => setAisleOpen(v => !v)}
              className="flex items-center gap-1.5 bg-depot-orange hover:bg-depot-orange-dark px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
            >
              Browse Aisles <ChevronDown size={14} />
            </button>

            {aisleOpen && (
              <div
                className="absolute top-full left-0 mt-1 w-72 bg-white text-depot-black rounded-xl shadow-2xl border border-stone-100 overflow-hidden z-50"
                onMouseEnter={() => setAisleOpen(true)}
                onMouseLeave={() => setAisleOpen(false)}
              >
                {CATEGORIES.map(cat => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.slug}`}
                    onClick={() => setAisleOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors"
                  >
                    <span className="text-xl w-8 text-center">{cat.icon}</span>
                    <div>
                      <div className="font-semibold text-sm">{cat.name}</div>
                      <div className="text-xs text-stone-400">Aisle {cat.aisle} · {cat.appCount} samples</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            <Link to="/store" className="px-3 py-2 rounded-lg text-sm text-stone-300 hover:text-white hover:bg-white/10 transition-colors font-medium">
              All Apps
            </Link>
            <Link to="/store?filter=new" className="px-3 py-2 rounded-lg text-sm text-stone-300 hover:text-white hover:bg-white/10 transition-colors font-medium">
              New
            </Link>
            <Link to="/how-it-works" className="px-3 py-2 rounded-lg text-sm text-stone-300 hover:text-white hover:bg-white/10 transition-colors font-medium">
              How It Works
            </Link>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Build Tray */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium"
            >
              <FolderOpen size={20} />
              <span className="hidden sm:inline">Build Tray</span>
              {count > 0 && (
                <span className="bg-depot-orange text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserOpen(v => !v)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium"
                >
                  <div className="w-7 h-7 bg-depot-orange rounded-full flex items-center justify-center text-xs font-bold">
                    {(user.fullName ?? user.email)[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:inline">{user.fullName ?? user.email.split('@')[0]}</span>
                  <ChevronDown size={14} />
                </button>
                {userOpen && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white text-depot-black rounded-xl shadow-2xl border border-stone-100 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-stone-100">
                      <p className="font-semibold text-sm truncate">{user.fullName ?? 'Account'}</p>
                      <p className="text-xs text-stone-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setUserOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-stone-50 transition-colors"
                    >
                      <Package size={15} /> My Projects
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-2 px-4 py-2 bg-white text-depot-black rounded-lg text-sm font-semibold hover:bg-stone-100 transition-colors"
              >
                <User size={15} /> Sign In
              </Link>
            )}

            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setMobileOpen(v => !v)}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-stone-900 border-t border-stone-700 px-4 py-4 space-y-1">
          <Link to="/store" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-stone-200 hover:bg-white/10">All Apps</Link>
          <Link to="/cart" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-200 hover:bg-white/10">
            <Plus size={14} /> Build Tray {count > 0 && `(${count})`}
          </Link>
          <div className="border-t border-stone-700 pt-2 mt-2">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-stone-300 hover:bg-white/10"
              >
                <span>{cat.icon}</span> Aisle {cat.aisle}: {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}

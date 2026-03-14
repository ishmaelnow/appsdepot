import { Link } from 'react-router-dom'
import { Warehouse } from 'lucide-react'
import { CATEGORIES } from '../../data/mockData'

export function Footer() {
  return (
    <footer className="bg-depot-black text-stone-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-depot-orange w-8 h-8 rounded-lg flex items-center justify-center">
                <Warehouse size={18} className="text-white" />
              </div>
              <div>
                <div className="font-black text-base leading-none text-white">APPS</div>
                <div className="font-black text-base leading-none text-depot-orange">DEPOT</div>
              </div>
            </Link>
            <p className="text-sm leading-relaxed">
              The digital warehouse for software. Browse, buy, and deploy apps — instantly.
            </p>
          </div>

          {/* Aisles */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Shop by Aisle</h4>
            <ul className="space-y-2">
              {CATEGORIES.slice(0, 4).map(cat => (
                <li key={cat.id}>
                  <Link to={`/category/${cat.slug}`} className="text-sm hover:text-depot-orange transition-colors">
                    {cat.icon} {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* More Aisles */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">&nbsp;</h4>
            <ul className="space-y-2">
              {CATEGORIES.slice(4).map(cat => (
                <li key={cat.id}>
                  <Link to={`/category/${cat.slug}`} className="text-sm hover:text-depot-orange transition-colors">
                    {cat.icon} {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/store" className="text-sm hover:text-depot-orange transition-colors">Browse All Apps</Link></li>
              <li><Link to="/wish" className="text-sm hover:text-depot-yellow transition-colors flex items-center gap-1">✨ Wish an App</Link></li>
              <li><a href="#" className="text-sm hover:text-depot-orange transition-colors">Become a Vendor</a></li>
              <li><a href="#" className="text-sm hover:text-depot-orange transition-colors">Developer API</a></li>
              <li><a href="#" className="text-sm hover:text-depot-orange transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm hover:text-depot-orange transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <p>© {new Date().getFullYear()} Apps Depot. All rights reserved.</p>
          <p>Helping teams ship better software, one deployment at a time.</p>
        </div>
      </div>
    </footer>
  )
}

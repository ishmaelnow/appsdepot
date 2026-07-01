import { Search, Hammer, Eye, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function Hero() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/store?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <section className="bg-depot-black text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, #F97316 39px, #F97316 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, #F97316 39px, #F97316 40px)',
        }}
      />

      <div className="h-1 bg-depot-orange w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-depot-orange/20 border border-depot-orange/30 text-depot-orange rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
            <Hammer size={14} /> Custom-built software, delivered fast
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-none mb-4">
            Try the sample.<br />
            <span className="text-depot-orange">We build</span> the real thing.
          </h1>

          <p className="text-stone-300 text-lg sm:text-xl leading-relaxed mb-8 max-w-xl">
            Browse our app depot, preview business-ready templates, and request a custom-built version tailored to your exact workflow.
          </p>

          {/* How it works — inline */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {[
              { icon: <Eye size={18} />, step: '1', label: 'Try the sample app' },
              { icon: <CheckCircle size={18} />, step: '2', label: 'Request a custom build' },
              { icon: <Hammer size={18} />, step: '3', label: 'We build & deliver it' },
            ].map(({ icon, step, label }) => (
              <div key={step} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-depot-orange flex items-center justify-center flex-shrink-0 text-sm font-black">
                  {step}
                </div>
                <span className="flex items-center gap-1.5 text-stone-300 text-sm">
                  <span className="text-depot-orange">{icon}</span> {label}
                </span>
              </div>
            ))}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search apps (e.g. barber booking, delivery, restaurant...)"
                className="w-full pl-11 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-depot-orange focus:border-transparent text-base"
              />
            </div>
            <button
              type="submit"
              className="bg-depot-orange hover:bg-depot-orange-dark text-white px-6 py-4 rounded-xl font-bold text-base transition-colors whitespace-nowrap"
            >
              Search
            </button>
          </form>

          {/* Stats */}
          <div className="flex items-center gap-8 mt-10 flex-wrap">
            {[
              { label: 'Business App Templates' },
              { label: 'Quote Before Payment' },
              { label: '2-10 Week Build Time' },
            ].map(({ label }) => (
              <div key={label} className="flex items-center gap-2 text-stone-300 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-depot-orange" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

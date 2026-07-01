import { Link } from 'react-router-dom'
import { ArrowRight, Hammer, Eye, CheckCircle, Star, Users } from 'lucide-react'
import { Hero } from '../components/home/Hero'
import { CategoryGrid } from '../components/home/CategoryGrid'
import { FeaturedApps } from '../components/home/FeaturedApps'
import { APPS, CATEGORIES, VENDORS } from '../data/mockData'
import { formatStartingPrice } from '../lib/utils'

export function HomePage() {
  const featured = APPS.filter(a => a.featured)
  const newArrivals = APPS.filter(a => a.newArrival)
  const topRated = [...APPS].sort((a, b) => b.rating - a.rating).slice(0, 4)
  const popularBuild = APPS.find(a => a.slug === 'restaurant-ordering-app') ?? featured[0]

  return (
    <div>
      <Hero />

      {/* How It Works */}
      <section className="py-14 bg-white border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-depot-black">How Apps Depot Works</h2>
            <p className="text-stone-500 mt-2">From browsing to deployed — in three steps</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: '01', icon: <Eye size={28} />, title: 'Try the Sample',
                desc: 'Every app listing includes a live, interactive demo. Click around, test the features, and see exactly what you\'re getting before committing.',
              },
              {
                step: '02', icon: <CheckCircle size={28} />, title: 'Request a Custom Build',
                desc: 'Add apps to your Build Tray and submit a request with your requirements, budget range, and timeline. No payment yet.',
              },
              {
                step: '03', icon: <Hammer size={28} />, title: 'We Build It For You',
                desc: 'Our team sends a detailed quote within 24 hours. Once you approve, we build your custom version and deliver it to your infrastructure.',
              },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-16 h-16 bg-depot-orange/10 rounded-2xl flex items-center justify-center text-depot-orange mx-auto">
                    {icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-depot-orange text-white rounded-full text-xs font-black flex items-center justify-center">
                    {step.slice(1)}
                  </div>
                </div>
                <h3 className="font-bold text-depot-black text-lg mb-2">{title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/store" className="inline-flex items-center gap-2 bg-depot-orange text-white px-8 py-3 rounded-xl font-bold hover:bg-depot-orange-dark transition-colors">
              Browse Sample Apps <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <CategoryGrid categories={CATEGORIES} />

      {/* Orange banner */}
      <div className="bg-depot-orange py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8 overflow-x-auto scrollbar-hide">
            {['No payment until you approve the quote', 'You own 100% of the source code', '30-day revision policy', 'Quote within 24 hours', '1,200+ projects delivered'].map(item => (
              <span key={item} className="text-white font-semibold text-sm whitespace-nowrap flex items-center gap-2">
                <span className="text-white/50">•</span> {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Featured */}
      <FeaturedApps
        title="Featured App Templates"
        subtitle="Handpicked by our team — most popular builds this month"
        apps={featured}
        viewAllHref="/store?filter=featured"
      />

      {/* Promo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="bg-gradient-to-r from-depot-black to-stone-800 rounded-2xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-depot-orange font-bold text-sm mb-2">Most Popular Build</div>
            <h3 className="text-2xl font-black">{popularBuild.name} - launch ordering without marketplace fees</h3>
            <p className="text-stone-400 text-sm mt-1">
              Menu, checkout, kitchen flow, and reporting customized to your business. {formatStartingPrice(popularBuild)} · {popularBuild.buildTime}
            </p>
          </div>
          <Link
            to={`/app/${popularBuild.slug}`}
            className="flex items-center gap-2 bg-depot-orange hover:bg-depot-orange-dark text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors whitespace-nowrap flex-shrink-0"
          >
            Try the Sample <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <FeaturedApps
          title="🆕 Recently Added"
          subtitle="New app templates in the warehouse"
          apps={newArrivals}
          viewAllHref="/store?filter=new"
        />
      )}

      {/* Top Rated */}
      <FeaturedApps
        title="⭐ Top Rated by Clients"
        subtitle="Highest-reviewed builds across all categories"
        apps={topRated}
        viewAllHref="/store?sort=rating"
      />

      {/* Vendors */}
      <section className="py-12 bg-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-depot-black">Meet Our Build Teams</h2>
            <p className="text-stone-500 text-sm mt-1">Every vendor is vetted, verified, and has a track record of delivered projects</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {VENDORS.map(v => (
              <div key={v.id} className="bg-white rounded-xl border border-stone-200 p-5 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-depot-orange flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                  {v.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-depot-black text-sm">{v.name}</h3>
                    {v.verified && <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">✓ Verified</span>}
                  </div>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">{v.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-stone-400">
                    <span className="flex items-center gap-1"><Star size={10} className="fill-depot-yellow text-depot-yellow" /> {v.rating}</span>
                    <span className="flex items-center gap-1"><Users size={10} /> {v.deliveredProjects} projects</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-depot-orange py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <Hammer size={48} className="mx-auto mb-4 opacity-80" />
          <h2 className="text-4xl font-black mb-3">Ready to get something built?</h2>
          <p className="text-white/80 text-lg mb-8">Try a sample, submit a request, get a quote in 24 hours. No payment until you say go.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/store" className="bg-white text-depot-orange hover:bg-stone-100 px-8 py-4 rounded-xl font-bold text-lg transition-colors">
              Browse the Warehouse
            </Link>
            <Link to="/auth" className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-xl font-bold text-lg transition-colors">
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

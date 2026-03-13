import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Warehouse, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'

export function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = mode === 'signin'
      ? await signIn(email, password)
      : await signUp(email, password, fullName)

    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2">
            <div className="bg-depot-black w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg">
              <Warehouse size={28} className="text-depot-orange" />
            </div>
            <div>
              <div className="font-black text-2xl leading-none text-depot-black">APPS <span className="text-depot-orange">DEPOT</span></div>
            </div>
          </Link>
          <h1 className="text-xl font-bold text-depot-black mt-4">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            {mode === 'signin'
              ? 'Sign in to access your apps and deployments'
              : 'Join 50,000+ teams using Apps Depot'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
          {/* Tab toggle */}
          <div className="flex bg-stone-100 rounded-xl p-1 mb-6">
            {(['signin', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  mode === m
                    ? 'bg-white text-depot-black shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text" required value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-depot-orange focus:border-transparent"
                    placeholder="Jane Smith"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-depot-orange focus:border-transparent"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="password" required value={password} minLength={6}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-depot-orange focus:border-transparent"
                  placeholder={mode === 'signup' ? 'Min. 6 characters' : '••••••••'}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertCircle size={14} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" size="lg" loading={loading} className="w-full">
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
              <ArrowRight size={16} />
            </Button>
          </form>

          {/* Demo note */}
          <div className="mt-4 p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-500">
            <strong>Demo mode:</strong> Supabase not configured — any credentials will work.
          </div>

          {mode === 'signin' && (
            <p className="text-center text-xs text-stone-400 mt-4">
              <a href="#" className="hover:text-depot-orange">Forgot your password?</a>
            </p>
          )}
        </div>

        <p className="text-center text-xs text-stone-400 mt-4">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="text-depot-orange hover:underline font-medium">
            {mode === 'signin' ? 'Sign up free' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}

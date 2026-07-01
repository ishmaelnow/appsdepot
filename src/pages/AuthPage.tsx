import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Warehouse, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendingConfirmation, setResendingConfirmation] = useState(false)
  const [canResendConfirmation, setCanResendConfirmation] = useState(false)
  const [confirmingEmail, setConfirmingEmail] = useState(false)
  const { signIn, signUp, resendConfirmation, user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true })
    }
  }, [authLoading, navigate, user])

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return
    const supabaseClient = supabase

    const url = new URL(window.location.href)
    const searchParams = url.searchParams
    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''))
    const authError = searchParams.get('error_description') || hashParams.get('error_description')
    const authErrorCode = searchParams.get('error_code') || hashParams.get('error_code')
    const code = searchParams.get('code')
    const hasSessionHash = hashParams.has('access_token') && hashParams.has('refresh_token')
    const hasAuthCallback = Boolean(code || hasSessionHash || authError)

    if (!hasAuthCallback) return

    let cancelled = false

    async function completeEmailConfirmation() {
      setConfirmingEmail(true)
      setError('')
      setNotice('Confirming your email...')

      if (authError) {
        setError(authErrorCode === 'otp_expired'
          ? 'That confirmation link is invalid or expired. Enter your email below and request a fresh confirmation email.'
          : authError)
        setNotice('')
        setMode('signin')
        setCanResendConfirmation(true)
        setConfirmingEmail(false)
        window.history.replaceState({}, document.title, '/auth')
        return
      }

      const result = code
        ? await supabaseClient.auth.exchangeCodeForSession(code)
        : await supabaseClient.auth.getSession()

      if (cancelled) return

      if (result.error) {
        setError(result.error.message)
        setNotice('')
        setConfirmingEmail(false)
        return
      }

      window.history.replaceState({}, document.title, '/auth')
      setMode('signin')
      setConfirmingEmail(false)

      if (result.data.session) {
        navigate('/dashboard', { replace: true })
      } else {
        setNotice('Email confirmed. Sign in to open your client dashboard.')
      }
    }

    completeEmailConfirmation()

    return () => {
      cancelled = true
    }
  }, [navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setNotice('')
    setCanResendConfirmation(false)
    setLoading(true)

    const result = mode === 'signin'
      ? await signIn(email, password)
      : await signUp(email, password, fullName)

    setLoading(false)
    if (result.error) {
      setError(result.error)
    } else if (mode === 'signup' && result.accountAlreadyExists) {
      setMode('signin')
      setNotice(`An account already exists for ${email}. Sign in with your password to continue.`)
    } else if (mode === 'signup' && result.needsEmailConfirmation) {
      setNotice(`Account created for ${email}. Check that inbox and confirm your email before signing in.`)
    } else {
      navigate('/dashboard')
    }
  }

  async function handleResendConfirmation() {
    if (!email) {
      setError('Enter the email address you used to create the account.')
      return
    }

    setError('')
    setNotice('')
    setResendingConfirmation(true)

    const result = await resendConfirmation(email)

    setResendingConfirmation(false)
    if (result.error) {
      setError(result.error)
    } else {
      setNotice(`Supabase accepted the confirmation request for ${email}. Check the newest email, including spam or promotions.`)
      setCanResendConfirmation(false)
    }
  }

  function switchMode(nextMode: 'signin' | 'signup') {
    setMode(nextMode)
    setError('')
    setNotice('')
    setCanResendConfirmation(false)
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
              ? 'Sign in to access your client project dashboard'
              : 'Create a client account for quotes, project updates, and delivered builds'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
          {/* Tab toggle */}
          <div className="flex bg-stone-100 rounded-xl p-1 mb-6">
            {(['signin', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
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

            {notice && (
              <div className="flex items-start gap-2 text-emerald-700 text-sm bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                <CheckCircle size={15} className="flex-shrink-0 mt-0.5" />
                <span>{notice}</span>
              </div>
            )}

            {canResendConfirmation && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                loading={resendingConfirmation}
                onClick={handleResendConfirmation}
                className="w-full"
              >
                Resend Confirmation Email
              </Button>
            )}

            <Button type="submit" size="lg" loading={loading || confirmingEmail} disabled={confirmingEmail} className="w-full">
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
              <ArrowRight size={16} />
            </Button>
          </form>

          {mode === 'signin' && (
            <p className="text-center text-xs text-stone-400 mt-4">
              <a href="#" className="hover:text-depot-orange">Forgot your password?</a>
            </p>
          )}
        </div>

        <p className="text-center text-xs text-stone-400 mt-4">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')} className="text-depot-orange hover:underline font-medium">
            {mode === 'signin' ? 'Sign up free' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}

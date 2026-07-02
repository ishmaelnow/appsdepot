import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '../types'
import { supabase, isSupabaseConfigured, getAuthRedirectUrl } from '../lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface AuthResult {
  error: string | null
  accountAlreadyExists?: boolean
  needsEmailConfirmation?: boolean
}

interface AuthState {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string, fullName: string) => Promise<AuthResult>
  resendConfirmation: (email: string) => Promise<AuthResult>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

async function getProfileUser(authUser: SupabaseUser): Promise<User> {
  const fallback: User = {
    id: authUser.id,
    email: authUser.email ?? '',
    fullName: authUser.user_metadata?.full_name,
    role: authUser.user_metadata?.role ?? 'customer',
  }

  if (!supabase) return fallback

  const { data } = await supabase
    .from('profiles')
    .select('email, full_name, avatar_url, role')
    .eq('id', authUser.id)
    .maybeSingle()

  if (!data) return fallback

  return {
    id: authUser.id,
    email: data.email || fallback.email,
    fullName: data.full_name || fallback.fullName,
    avatarUrl: data.avatar_url || undefined,
    role: data.role ?? fallback.role,
  }
}

async function syncOwnProfile(authUser: SupabaseUser, fullName?: string) {
  if (!supabase) return

  await supabase
    .from('profiles')
    .upsert({
      id: authUser.id,
      email: authUser.email ?? '',
      full_name: fullName || authUser.user_metadata?.full_name || null,
      role: 'customer',
    }, { onConflict: 'id' })
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await syncOwnProfile(session.user)
        setUser(await getProfileUser(session.user))
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        getProfileUser(session.user).then(setUser)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string) {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Unable to connect to the server. Please try again later' }
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error && data.user) {
      await syncOwnProfile(data.user)
      setUser(await getProfileUser(data.user))
    }
    return { error: error?.message ?? null }
  }

  async function signUp(email: string, password: string, fullName: string) {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Unable to connect to the server. Please try again later' }
    }
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { full_name: fullName, role: 'customer' },
        emailRedirectTo: getAuthRedirectUrl('/auth'),
      },
    })
    if (!error && data.user && data.session) {
      await syncOwnProfile(data.user, fullName)
      setUser(await getProfileUser(data.user))
    }
    const accountAlreadyExists = Boolean(!error && data.user && data.user.identities?.length === 0)

    return {
      error: error?.message ?? null,
      accountAlreadyExists,
      needsEmailConfirmation: Boolean(!error && data.user && !data.session && !accountAlreadyExists),
    }
  }

  async function resendConfirmation(email: string) {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Unable to connect to the server. Please try again later' }
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: getAuthRedirectUrl('/auth'),
      },
    })

    return { error: error?.message ?? null }
  }

  async function signOut() {
    if (!isSupabaseConfigured || !supabase) {
      setUser(null)
      return
    }
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, resendConfirmation, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

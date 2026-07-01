import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''
const appUrl = import.meta.env.VITE_APP_URL ?? ''

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    })
  : null

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export function getAuthRedirectUrl(path = '/auth') {
  const baseUrl = appUrl || window.location.origin
  return `${baseUrl.replace(/\/$/, '')}${path}`
}

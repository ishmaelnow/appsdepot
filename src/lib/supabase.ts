import { createClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const meta = import.meta as any
const supabaseUrl: string = meta.env?.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey: string = meta.env?.VITE_SUPABASE_ANON_KEY ?? ''

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

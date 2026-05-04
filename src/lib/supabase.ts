import { createClient } from '@supabase/supabase-js'
import type { Database } from '@generated/database.types'

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'https://example.supabase.co'
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const isSupabaseConfigured =
  Boolean(import.meta.env.PUBLIC_SUPABASE_URL) &&
  Boolean(import.meta.env.PUBLIC_SUPABASE_ANON_KEY) &&
  !import.meta.env.PUBLIC_SUPABASE_URL.includes('example.supabase.co')

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

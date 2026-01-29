import { createClient } from '@supabase/supabase-js'

// Supabase client for server-side operations
// Uses service role key for admin operations, anon key for public operations
export function createSupabaseClient(useServiceRole = false) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = useServiceRole 
    ? process.env.SUPABASE_SERVICE_ROLE_KEY 
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false, // Server-side doesn't need session persistence
    },
  })
}

// Default client (uses anon key)
export const supabase = createSupabaseClient()

// Admin client (uses service role key for admin operations)
export const supabaseAdmin = createSupabaseClient(true)

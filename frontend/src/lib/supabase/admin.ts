import { createClient, SupabaseClient } from '@supabase/supabase-js'

let cachedAdminClient: SupabaseClient | null = null
let cachedAdminKey: string | null = null

export function getAdminSupabase(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const apiKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'placeholder-key'

  if (cachedAdminClient && cachedAdminKey === `${supabaseUrl}:${apiKey}`) {
    return cachedAdminClient
  }

  cachedAdminKey = `${supabaseUrl}:${apiKey}`
  cachedAdminClient = createClient(supabaseUrl, apiKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  return cachedAdminClient
}

export const adminSupabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getAdminSupabase()
    const value = (client as unknown as Record<string | symbol, unknown>)[prop]
    if (typeof value === 'function') {
      return (value as (...args: unknown[]) => unknown).bind(client)
    }
    return value
  },
})

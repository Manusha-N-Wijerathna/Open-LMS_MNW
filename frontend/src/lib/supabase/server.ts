import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { adminSupabase } from './admin'

export async function createServerSupabaseClient(req?: Request | NextRequest) {
  const cookieStore = await cookies()
  const authHeader = req?.headers.get('Authorization')

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Can be ignored if called from Server Component or static render
          }
        },
      },
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    }
  )
}

export async function getDbClient(req?: Request | NextRequest) {
  const hasServiceRoleKey = Boolean(
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY !== process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  if (hasServiceRoleKey) {
    return adminSupabase
  }

  if (req) {
    return await createServerSupabaseClient(req)
  }

  return adminSupabase
}

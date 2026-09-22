import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'

export interface UserProfile {
  id: string
  full_name: string | null
  role: string
  is_verified: boolean
  created_at: string
  email?: string
}

const ADMIN_EMAILS = ['manushaugcnuwan@gmail.com']

export function jsonError(detail: string, status: number = 400) {
  return NextResponse.json({ detail, error: detail }, { status })
}

export async function getCurrentUser(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

    let user = null
    let authError = null

    // 1. Try verifying Bearer token directly with adminSupabase (fast, robust, bypasses SSR cookie issues)
    if (token) {
      try {
        const { data, error } = await adminSupabase.auth.getUser(token)
        if (data?.user) {
          user = data.user
        } else if (error) {
          authError = error
        }
      } catch (tokenErr) {
        console.warn('adminSupabase.auth.getUser error:', tokenErr)
      }
    }

    // 2. If no user from token, try cookie-based or SSR client auth
    if (!user) {
      try {
        const supabase = await createServerSupabaseClient(request)
        const { data, error } = token
          ? await supabase.auth.getUser(token)
          : await supabase.auth.getUser()

        if (data?.user) {
          user = data.user
        } else if (error && !authError) {
          authError = error
        }
      } catch (cookieErr) {
        console.warn('createServerSupabaseClient auth error:', cookieErr)
      }
    }

    if (!user) {
      if (authError) console.warn('Auth getUser error:', authError.message)
      return null
    }

    const isAdminEmail = user.email ? ADMIN_EMAILS.includes(user.email.toLowerCase()) : false
    const fallbackName = (user.user_metadata?.full_name as string) || (user.email ? user.email.split('@')[0] : 'User')
    const fallbackProfile: UserProfile = {
      id: user.id,
      full_name: fallbackName,
      role: isAdminEmail ? 'admin' : 'student',
      is_verified: isAdminEmail ? true : false,
      created_at: user.created_at || new Date().toISOString(),
      email: user.email,
    }

    // Try looking up profile in DB
    try {
      const { data: profile, error: profileError } = await adminSupabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (profile) {
        // If designated admin account has student role in DB, update to admin
        if (isAdminEmail && profile.role !== 'admin') {
          const { data: updatedProfile } = await adminSupabase
            .from('profiles')
            .update({ role: 'admin', is_verified: true })
            .eq('id', user.id)
            .select()
            .maybeSingle()

          if (updatedProfile) {
            return { user, profile: { ...(updatedProfile as UserProfile), email: user.email } }
          }
        }
        return { user, profile: { ...(profile as UserProfile), email: user.email } }
      }

      if (profileError) {
        console.warn('Profile select error:', profileError.message)
      }

      // If no profile found, create it
      const { data: createdProfile, error: insertError } = await adminSupabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fallbackName,
          role: isAdminEmail ? 'admin' : 'student',
          is_verified: isAdminEmail ? true : false,
        })
        .select()
        .maybeSingle()

      if (createdProfile) {
        return { user, profile: { ...(createdProfile as UserProfile), email: user.email } }
      }

      if (insertError) {
        console.warn('Profile upsert error:', insertError.message)
      }
    } catch (dbErr) {
      console.warn('Database access exception in getCurrentUser:', dbErr)
    }

    // Return the authenticated fallback profile so valid users are never locked out
    return { user, profile: fallbackProfile }
  } catch (err) {
    console.error('Error in getCurrentUser:', err)
    return null
  }
}

export async function requireUser(request: Request) {
  const result = await getCurrentUser(request)
  if (!result || !result.user) {
    return { errorResponse: jsonError('Invalid or expired token', 401) }
  }
  if (!result.profile) {
    return { errorResponse: jsonError('Profile not found. Access denied.', 404) }
  }
  return { user: result.user, profile: result.profile }
}

export async function requireAdmin(request: Request) {
  const result = await getCurrentUser(request)
  if (!result || !result.user) {
    return { errorResponse: jsonError('Invalid or expired token', 401) }
  }
  if (!result.profile) {
    return { errorResponse: jsonError('Profile not found. Access denied.', 403) }
  }
  if (result.profile.role !== 'admin') {
    return { errorResponse: jsonError('Admin access required. You do not have permission.', 403) }
  }
  return { user: result.user, profile: result.profile }
}

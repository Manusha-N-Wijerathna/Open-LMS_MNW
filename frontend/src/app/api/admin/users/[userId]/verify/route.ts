import { NextRequest, NextResponse } from 'next/server'
import { getDbClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { requireAdmin, jsonError } from '@/lib/auth/authorization'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const auth = await requireAdmin(request)
  if ('errorResponse' in auth) {
    return auth.errorResponse
  }

  try {
    const resolvedParams = await params
    const userId = resolvedParams?.userId

    if (!userId) {
      return jsonError('User ID is required', 400)
    }

    // Try updating using adminSupabase first (uses service role key if configured)
    let { data: profile, error } = await adminSupabase
      .from('profiles')
      .update({ is_verified: true })
      .eq('id', userId)
      .select()
      .maybeSingle()

    // If adminSupabase returned null/error, try with getDbClient
    if (!profile) {
      const db = await getDbClient(request)
      const res = await db
        .from('profiles')
        .update({ is_verified: true })
        .eq('id', userId)
        .select()
        .maybeSingle()
      
      if (res.data) {
        profile = res.data
        error = null
      } else if (res.error) {
        error = res.error
      }
    }

    // Also attempt email confirmation in Supabase auth.users
    try {
      await adminSupabase.auth.admin.updateUserById(userId, {
        email_confirm: true,
      })
    } catch (authErr) {
      console.warn('Note: Could not confirm auth.users email:', authErr)
    }

    if (error) {
      console.error('Error verifying user profile:', error)
      return jsonError(error.message || 'Failed to verify user in database. Ensure RLS policies or Service Role Key are configured.', 500)
    }

    if (!profile) {
      // Check if profile exists
      const { data: existing } = await adminSupabase.from('profiles').select('id, full_name').eq('id', userId).maybeSingle()
      if (!existing) {
        return jsonError('User profile not found in database', 404)
      }
      return jsonError('Failed to update verification status in database. Supabase Row Level Security (RLS) blocked the update. Please run the provided SQL policy in Supabase or set SUPABASE_SERVICE_ROLE_KEY in .env.local.', 403)
    }

    return NextResponse.json({ message: `${profile.full_name || 'User'} verified`, profile })
  } catch (err) {
    console.error('Unexpected error verifying user:', err)
    return jsonError('Internal server error', 500)
  }
}

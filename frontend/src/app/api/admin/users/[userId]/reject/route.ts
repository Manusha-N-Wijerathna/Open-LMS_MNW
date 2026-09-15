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

    // 1. Update user metadata in auth.admin if available
    try {
      const { data: authUserData } = await adminSupabase.auth.admin.getUserById(userId)
      if (authUserData?.user) {
        await adminSupabase.auth.admin.updateUserById(userId, {
          user_metadata: { ...(authUserData.user.user_metadata || {}), is_verified: false },
          app_metadata: { ...(authUserData.user.app_metadata || {}), is_verified: false }
        })
      }
    } catch (authErr) {
      console.warn('Note: Could not update auth.users metadata:', authErr)
    }

    // 2. Update profiles table
    let { data: profile, error } = await adminSupabase
      .from('profiles')
      .update({ is_verified: false })
      .eq('id', userId)
      .select()
      .maybeSingle()

    if (!profile && error) {
      const db = await getDbClient(request)
      const res = await db
        .from('profiles')
        .update({ is_verified: false })
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

    if (error) {
      console.error('Error rejecting user:', error)
      return jsonError(error.message || 'Failed to reject user', 500)
    }

    return NextResponse.json({ message: `${profile?.full_name || 'User'} verification revoked`, profile })
  } catch (err) {
    console.error('Unexpected error rejecting user:', err)
    return jsonError('Internal server error', 500)
  }
}

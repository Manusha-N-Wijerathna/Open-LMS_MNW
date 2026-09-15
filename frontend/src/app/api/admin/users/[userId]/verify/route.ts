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

    // 1. Fetch user info from auth.admin if available to ensure we have name and confirm email
    let userName = 'Student'
    try {
      const { data: authUserData } = await adminSupabase.auth.admin.getUserById(userId)
      if (authUserData?.user) {
        userName = (authUserData.user.user_metadata?.full_name as string) || authUserData.user.email?.split('@')[0] || 'Student'
        await adminSupabase.auth.admin.updateUserById(userId, {
          email_confirm: true,
          user_metadata: { ...(authUserData.user.user_metadata || {}), is_verified: true },
          app_metadata: { ...(authUserData.user.app_metadata || {}), is_verified: true }
        })
      }
    } catch (authErr) {
      console.warn('Note: Could not update auth.users metadata:', authErr)
    }

    // 2. Update existing profile or upsert if missing
    let { data: profile, error } = await adminSupabase
      .from('profiles')
      .update({ is_verified: true })
      .eq('id', userId)
      .select()
      .maybeSingle()

    if (!profile && !error) {
      // If row did not exist, upsert it
      const upsertRes = await adminSupabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: userName,
          role: 'student',
          is_verified: true,
        }, { onConflict: 'id' })
        .select()
        .maybeSingle()

      profile = upsertRes.data
      error = upsertRes.error
    }

    // 3. Fallback to getDbClient with request credentials if adminSupabase errored
    if (!profile && error) {
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

    if (error) {
      console.error('Error verifying user profile:', error)
      return jsonError(error.message || 'Failed to verify user in database. Ensure RLS policies or Service Role Key are configured.', 500)
    }

    if (!profile) {
      return jsonError('User profile could not be updated in database.', 400)
    }

    return NextResponse.json({ message: `${profile.full_name || 'User'} verified successfully`, profile })
  } catch (err) {
    console.error('Unexpected error verifying user:', err)
    return jsonError('Internal server error', 500)
  }
}

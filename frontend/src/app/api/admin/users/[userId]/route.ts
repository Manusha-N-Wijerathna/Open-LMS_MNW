import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { requireAdmin, jsonError } from '@/lib/auth/authorization'

const ADMIN_EMAILS = ['manushaugcnuwan@gmail.com']

export async function DELETE(
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

    // 1. Prevent deleting self
    if (auth.user.id === userId) {
      return jsonError('Cannot delete your own administrator account', 400)
    }

    // 2. Fetch user to ensure target is not a protected administrator
    try {
      const { data: targetAuthUser } = await adminSupabase.auth.admin.getUserById(userId)
      if (targetAuthUser?.user?.email) {
        const cleanEmail = targetAuthUser.user.email.toLowerCase()
        if (ADMIN_EMAILS.includes(cleanEmail)) {
          return jsonError('Cannot delete a designated administrator account', 403)
        }
      }
    } catch {
      // Continue if auth user retrieval fails
    }

    // 3. Delete from public.profiles table
    const { error: profileDeleteError } = await adminSupabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileDeleteError) {
      console.warn('Profile deletion note:', profileDeleteError.message)
    }

    // 4. Delete user from Supabase Auth
    try {
      const { error: authDeleteError } = await adminSupabase.auth.admin.deleteUser(userId)
      if (authDeleteError) {
        console.warn('Auth admin deleteUser note:', authDeleteError.message)
      }
    } catch (authErr) {
      console.warn('Auth admin exception on deleteUser:', authErr)
    }

    return NextResponse.json({
      message: 'Student account has been permanently deleted',
      deletedUserId: userId,
    })
  } catch (err) {
    console.error('Unexpected error deleting user:', err)
    return jsonError('Internal server error while deleting user', 500)
  }
}

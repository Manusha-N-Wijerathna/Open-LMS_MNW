import { NextRequest, NextResponse } from 'next/server'
import { requireUser, jsonError } from '@/lib/auth/authorization'
import { adminSupabase } from '@/lib/supabase/admin'

export async function PUT(request: NextRequest) {
  const auth = await requireUser(request)
  if ('errorResponse' in auth) {
    return auth.errorResponse
  }

  try {
    const body = await request.json()
    const { fullName } = body

    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return jsonError('Full name is required and cannot be empty', 400)
    }

    const cleanName = fullName.trim()

    if (cleanName.length > 100) {
      return jsonError('Full name cannot exceed 100 characters', 400)
    }

    // 1. Update profiles table
    const { error: dbError } = await adminSupabase
      .from('profiles')
      .update({ full_name: cleanName })
      .eq('id', auth.user.id)

    if (dbError) {
      console.warn('Profile DB update note:', dbError.message)
    }

    // 2. Update Supabase Auth user metadata
    try {
      await adminSupabase.auth.admin.updateUserById(auth.user.id, {
        user_metadata: {
          ...(auth.user.user_metadata || {}),
          full_name: cleanName,
        },
      })
    } catch (metaErr) {
      console.warn('User metadata update note:', metaErr)
    }

    const updatedProfile = {
      ...auth.profile,
      full_name: cleanName,
      email: auth.user.email,
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: updatedProfile,
    })
  } catch (err) {
    console.error('Error updating profile:', err)
    return jsonError('Internal server error while updating profile', 500)
  }
}

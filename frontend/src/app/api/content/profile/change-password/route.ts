import { NextRequest, NextResponse } from 'next/server'
import { requireUser, jsonError } from '@/lib/auth/authorization'
import { adminSupabase } from '@/lib/supabase/admin'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const auth = await requireUser(request)
  if ('errorResponse' in auth) {
    return auth.errorResponse
  }

  try {
    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || typeof currentPassword !== 'string') {
      return jsonError('Current password is required', 400)
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return jsonError('New password must be at least 6 characters long', 400)
    }

    if (currentPassword === newPassword) {
      return jsonError('New password must be different from current password', 400)
    }

    const userEmail = auth.user.email
    if (!userEmail) {
      return jsonError('User email not found', 400)
    }

    // 1. Verify current password by attempting an authentication check
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
    const verificationClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    })

    const { error: verifyError } = await verificationClient.auth.signInWithPassword({
      email: userEmail,
      password: currentPassword,
    })

    if (verifyError) {
      return jsonError('Incorrect current password. Please verify and try again.', 400)
    }

    // 2. Update to new password via admin client
    const { error: updateError } = await adminSupabase.auth.admin.updateUserById(
      auth.user.id,
      { password: newPassword }
    )

    if (updateError) {
      console.error('Password update error:', updateError)
      return jsonError(updateError.message || 'Failed to update password', 400)
    }

    return NextResponse.json({
      message: 'Password has been updated successfully!',
    })
  } catch (err) {
    console.error('Error changing password:', err)
    return jsonError('Internal server error while changing password', 500)
  }
}

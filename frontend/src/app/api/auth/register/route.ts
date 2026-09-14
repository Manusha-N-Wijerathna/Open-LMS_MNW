import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { jsonError } from '@/lib/auth/authorization'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, email, password } = body

    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return jsonError('Full name is required', 400)
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return jsonError('Email is required', 400)
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return jsonError('Password must be at least 6 characters', 400)
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanName = fullName.trim()

    let userId: string | null = null

    // 1. Attempt user creation via admin API first (pre-confirms email if service key is active)
    try {
      const { data: adminUser, error: adminErr } = await adminSupabase.auth.admin.createUser({
        email: cleanEmail,
        password,
        email_confirm: true,
        user_metadata: { full_name: cleanName },
      })

      if (adminUser?.user) {
        userId = adminUser.user.id
      } else if (adminErr && !adminErr.message.includes('not allowed')) {
        console.warn('admin.createUser error:', adminErr.message)
      }
    } catch (e) {
      // Fallback if admin.createUser is unauthorized
    }

    // 2. Fallback to standard signUp
    if (!userId) {
      const { data: signUpData, error: signUpErr } = await adminSupabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { full_name: cleanName }
        }
      })

      if (signUpErr) {
        if (signUpErr.message.toLowerCase().includes('rate limit')) {
          return jsonError('Supabase email rate limit reached. Please disable "Confirm email" in Supabase Dashboard (Authentication -> Providers -> Email) or add SUPABASE_SERVICE_ROLE_KEY to .env.local for unlimited instant registrations.', 429)
        }
        return jsonError(signUpErr.message, 400)
      }

      userId = signUpData?.user?.id || null
    }

    if (!userId) {
      return jsonError('Failed to register user account', 500)
    }

    const isAdminEmail = cleanEmail === 'manushaugcnuwan@gmail.com'

    // 3. Insert or upsert student record in profiles table
    const { error: profileError } = await adminSupabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: cleanName,
        role: isAdminEmail ? 'admin' : 'student',
        is_verified: isAdminEmail ? true : false,
      }, { onConflict: 'id' })

    if (profileError) {
      console.warn('Profile insertion note:', profileError.message)
    }

    return NextResponse.json({
      message: 'Registration successful! Your profile has been registered.',
      userId,
    })
  } catch (err) {
    console.error('Registration server error:', err)
    return jsonError('Internal server error during registration', 500)
  }
}

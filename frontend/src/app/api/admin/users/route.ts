import { NextRequest, NextResponse } from 'next/server'
import { getDbClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { requireAdmin, jsonError } from '@/lib/auth/authorization'

const ADMIN_EMAILS = ['manushaugcnuwan@gmail.com']

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('errorResponse' in auth) {
    return auth.errorResponse
  }

  try {
    // 1. If service role key is active, sync any auth.users missing in profiles
    try {
      const { data: authData } = await adminSupabase.auth.admin.listUsers({ perPage: 100 })
      if (authData?.users && authData.users.length > 0) {
        for (const u of authData.users) {
          const isAdmin = u.email ? ADMIN_EMAILS.includes(u.email.toLowerCase()) : false
          await adminSupabase.from('profiles').upsert({
            id: u.id,
            full_name: (u.user_metadata?.full_name as string) || (u.email ? u.email.split('@')[0] : 'User'),
            role: isAdmin ? 'admin' : 'student',
            is_verified: isAdmin ? true : false,
          }, { onConflict: 'id', ignoreDuplicates: true })
        }
      }
    } catch {}

    // 2. Fetch all profiles
    let users = null
    let { data: adminUsers, error } = await adminSupabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (adminUsers && adminUsers.length > 0) {
      users = adminUsers
    } else {
      const db = await getDbClient(request)
      const res = await db
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      users = res.data || []
      error = res.error
    }

    if (error && !users) {
      console.error('Error listing users:', error)
      return jsonError(error.message || 'Failed to retrieve users', 500)
    }

    return NextResponse.json(users || [])
  } catch (err) {
    console.error('Unexpected error listing users:', err)
    return jsonError('Internal server error', 500)
  }
}

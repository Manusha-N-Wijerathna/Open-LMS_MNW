import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { jsonError } from '@/lib/auth/authorization'

export async function GET() {
  try {
    const { data: grades, error } = await adminSupabase
      .from('grades')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching grades:', error)
      return jsonError('Failed to fetch grades', 500)
    }

    return NextResponse.json(grades || [])
  } catch (err) {
    console.error('Unexpected error fetching grades:', err)
    return jsonError('Internal server error', 500)
  }
}

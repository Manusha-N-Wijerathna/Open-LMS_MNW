import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { getCurrentUser, getAssignedGradeIds, jsonError } from '@/lib/auth/authorization'

export async function GET(request: NextRequest) {
  try {
    const auth = await getCurrentUser(request)

    // If an administrator is requesting, return all published grades
    if (auth?.profile?.role === 'admin') {
      const { data: grades, error } = await adminSupabase
        .from('grades')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) {
        console.error('Error fetching grades for admin:', error)
        return jsonError('Failed to fetch grades', 500)
      }

      return NextResponse.json(grades || [])
    }

    // For students: return ALL grades assigned to them
    if (auth?.profile) {
      const assignedGradeIds = getAssignedGradeIds(auth.profile)

      if (assignedGradeIds.length === 0) {
        // Student has not been assigned to any grade by the admin yet
        return NextResponse.json([])
      }

      const { data: grades, error } = await adminSupabase
        .from('grades')
        .select('*')
        .in('id', assignedGradeIds)
        .order('display_order', { ascending: true })

      if (error) {
        console.error('Error fetching student assigned grades:', error)
        return jsonError('Failed to fetch assigned grades', 500)
      }

      return NextResponse.json(grades || [])
    }

    // Unauthenticated requests: return empty list
    return NextResponse.json([])
  } catch (err) {
    console.error('Unexpected error fetching grades:', err)
    return jsonError('Internal server error', 500)
  }
}

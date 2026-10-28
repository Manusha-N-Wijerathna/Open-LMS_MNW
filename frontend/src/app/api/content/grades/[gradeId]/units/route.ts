import { NextRequest, NextResponse } from 'next/server'
import { getDbClient } from '@/lib/supabase/server'
import { getCurrentUser, getAssignedGradeIds, jsonError } from '@/lib/auth/authorization'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gradeId: string }> }
) {
  try {
    const resolvedParams = await params
    const gradeId = resolvedParams?.gradeId
    const parsedGradeId = parseInt(gradeId, 10)

    if (isNaN(parsedGradeId)) {
      return jsonError('Invalid grade ID', 400)
    }

    const auth = await getCurrentUser(request)

    // Security check: if not admin, ensure the student is assigned to this specific grade
    if (auth?.profile && auth.profile.role !== 'admin') {
      const assignedGradeIds = getAssignedGradeIds(auth.profile)
      if (!assignedGradeIds.includes(parsedGradeId)) {
        return jsonError('Access restricted: You are not assigned to this grade curriculum', 403)
      }
    }

    const db = await getDbClient(request)

    const { data: units, error } = await db
      .from('units')
      .select('*, lessons(count)')
      .eq('grade_id', parsedGradeId)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching units:', error)
      return jsonError(error.message || 'Failed to fetch units', 500)
    }

    return NextResponse.json(units || [])
  } catch (err) {
    console.error('Unexpected error fetching units:', err)
    return jsonError('Internal server error', 500)
  }
}

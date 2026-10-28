import { NextRequest, NextResponse } from 'next/server'
import { getDbClient } from '@/lib/supabase/server'
import { getCurrentUser, getAssignedGradeIds, jsonError } from '@/lib/auth/authorization'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ unitId: string }> }
) {
  try {
    const resolvedParams = await params
    const unitId = resolvedParams?.unitId
    const parsedUnitId = parseInt(unitId, 10)

    if (isNaN(parsedUnitId)) {
      return jsonError('Invalid unit ID', 400)
    }

    const db = await getDbClient(request)

    // Security check: if student, verify that the unit belongs to their assigned grades
    const auth = await getCurrentUser(request)
    if (auth?.profile && auth.profile.role !== 'admin') {
      const { data: unitData } = await db
        .from('units')
        .select('grade_id')
        .eq('id', parsedUnitId)
        .maybeSingle()

      const assignedGradeIds = getAssignedGradeIds(auth.profile)
      if (unitData && !assignedGradeIds.includes(unitData.grade_id)) {
        return jsonError('Access restricted: You do not have access to lessons in this grade', 403)
      }
    }

    const { data: lessons, error } = await db
      .from('lessons')
      .select('*')
      .eq('unit_id', parsedUnitId)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching lessons:', error)
      return jsonError(error.message || 'Failed to fetch lessons', 500)
    }

    return NextResponse.json(lessons || [])
  } catch (err) {
    console.error('Unexpected error fetching lessons:', err)
    return jsonError('Internal server error', 500)
  }
}

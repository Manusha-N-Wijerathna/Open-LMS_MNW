import { NextRequest, NextResponse } from 'next/server'
import { getDbClient } from '@/lib/supabase/server'
import { requireAdmin, jsonError } from '@/lib/auth/authorization'

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('errorResponse' in auth) {
    return auth.errorResponse
  }

  try {
    const body = await request.json()
    const { name, grade_id, display_order } = body

    if (!name || typeof name !== 'string' || !name.trim()) {
      return jsonError('Unit name is required', 400)
    }

    const parsedGradeId = typeof grade_id === 'number' ? grade_id : parseInt(grade_id, 10)
    if (isNaN(parsedGradeId)) {
      return jsonError('Valid grade_id is required', 400)
    }

    const parsedOrder = typeof display_order === 'number' ? display_order : parseInt(display_order, 10) || 0

    const db = await getDbClient(request)

    // Verify parent grade exists
    const { data: grade, error: gradeError } = await db
      .from('grades')
      .select('id')
      .eq('id', parsedGradeId)
      .maybeSingle()

    if (gradeError) {
      console.error('Error checking grade:', gradeError)
    }

    if (!grade && !gradeError) {
      return jsonError('Grade not found', 404)
    }

    const insertPayload = {
      name: name.trim(),
      grade_id: parsedGradeId,
      display_order: parsedOrder,
    }

    const { data: unit, error } = await db
      .from('units')
      .insert(insertPayload)
      .select()
      .maybeSingle()

    if (error) {
      console.error('Error creating unit in Supabase:', error)
      return jsonError(error.message || 'Failed to create unit', 500)
    }

    return NextResponse.json(unit || insertPayload, { status: 200 })
  } catch (err) {
    console.error('Unexpected error creating unit:', err)
    return jsonError('Invalid request body or server error', 400)
  }
}

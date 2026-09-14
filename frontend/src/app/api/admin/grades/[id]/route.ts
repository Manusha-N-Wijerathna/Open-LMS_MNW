import { NextRequest, NextResponse } from 'next/server'
import { getDbClient } from '@/lib/supabase/server'
import { requireAdmin, jsonError } from '@/lib/auth/authorization'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if ('errorResponse' in auth) {
    return auth.errorResponse
  }

  try {
    const resolvedParams = await params
    const id = resolvedParams?.id
    const gradeId = parseInt(id, 10)

    if (isNaN(gradeId)) {
      return jsonError('Invalid grade ID', 400)
    }

    const db = await getDbClient(request)

    // Check if grade exists
    const { data: grade, error: gradeError } = await db
      .from('grades')
      .select('*')
      .eq('id', gradeId)
      .maybeSingle()

    if (gradeError || !grade) {
      return jsonError('Grade not found', 404)
    }

    // Check for child units
    const { count, error: countError } = await db
      .from('units')
      .select('*', { count: 'exact', head: true })
      .eq('grade_id', gradeId)

    if (countError) {
      console.error('Error checking child units:', countError)
      return jsonError('Failed to verify grade dependencies', 500)
    }

    if (count !== null && count > 0) {
      return jsonError('Cannot delete grade with existing units. Remove units first.', 400)
    }

    const { error: deleteError } = await db
      .from('grades')
      .delete()
      .eq('id', gradeId)

    if (deleteError) {
      console.error('Error deleting grade:', deleteError)
      return jsonError(deleteError.message || 'Failed to delete grade', 500)
    }

    return NextResponse.json({ message: 'Grade deleted' })
  } catch (err) {
    console.error('Unexpected error deleting grade:', err)
    return jsonError('Internal server error', 500)
  }
}

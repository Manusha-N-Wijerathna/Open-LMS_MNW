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
    const unitId = parseInt(id, 10)

    if (isNaN(unitId)) {
      return jsonError('Invalid unit ID', 400)
    }

    const db = await getDbClient(request)

    // Check if unit exists
    const { data: unit, error: unitError } = await db
      .from('units')
      .select('*')
      .eq('id', unitId)
      .maybeSingle()

    if (unitError || !unit) {
      return jsonError('Unit not found', 404)
    }

    // Check for child lessons
    const { count, error: countError } = await db
      .from('lessons')
      .select('*', { count: 'exact', head: true })
      .eq('unit_id', unitId)

    if (countError) {
      console.error('Error checking child lessons:', countError)
      return jsonError('Failed to verify unit dependencies', 500)
    }

    if (count !== null && count > 0) {
      return jsonError('Cannot delete unit with existing lessons. Remove lessons first.', 400)
    }

    const { error: deleteError } = await db
      .from('units')
      .delete()
      .eq('id', unitId)

    if (deleteError) {
      console.error('Error deleting unit:', deleteError)
      return jsonError(deleteError.message || 'Failed to delete unit', 500)
    }

    return NextResponse.json({ message: 'Unit deleted' })
  } catch (err) {
    console.error('Unexpected error deleting unit:', err)
    return jsonError('Internal server error', 500)
  }
}

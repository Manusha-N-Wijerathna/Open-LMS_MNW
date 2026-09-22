import { NextRequest, NextResponse } from 'next/server'
import { getDbClient } from '@/lib/supabase/server'
import { requireAdmin, jsonError } from '@/lib/auth/authorization'

export async function PUT(
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
    const { data: existingUnit, error: findError } = await db
      .from('units')
      .select('*')
      .eq('id', unitId)
      .maybeSingle()

    if (findError || !existingUnit) {
      return jsonError('Unit not found', 404)
    }

    const body = await request.json()
    const updateData: { name?: string; display_order?: number; grade_id?: number } = {}

    if (body.name !== undefined) {
      const name = typeof body.name === 'string' ? body.name.trim() : ''
      if (!name) {
        return jsonError('Unit name cannot be empty', 400)
      }
      updateData.name = name
    }

    if (body.display_order !== undefined) {
      updateData.display_order = typeof body.display_order === 'number' 
        ? body.display_order 
        : parseInt(body.display_order, 10) || 0
    }

    if (body.grade_id !== undefined) {
      const gid = parseInt(body.grade_id, 10)
      if (!isNaN(gid)) {
        updateData.grade_id = gid
      }
    }

    const { data: updatedUnit, error: updateError } = await db
      .from('units')
      .update(updateData)
      .eq('id', unitId)
      .select()
      .maybeSingle()

    if (updateError) {
      console.error('Error updating unit:', updateError)
      return jsonError(updateError.message || 'Failed to update unit', 500)
    }

    return NextResponse.json(updatedUnit || { ...existingUnit, ...updateData })
  } catch (err) {
    console.error('Unexpected error updating unit:', err)
    return jsonError('Internal server error', 500)
  }
}

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

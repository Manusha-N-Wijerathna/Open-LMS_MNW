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
    const { title, description, thumbnail_url, drive_url, unit_id, display_order } = body

    if (!title || typeof title !== 'string' || !title.trim()) {
      return jsonError('Lesson title is required', 400)
    }

    if (!drive_url || typeof drive_url !== 'string' || !drive_url.trim()) {
      return jsonError('Drive URL is required', 400)
    }

    const parsedUnitId = typeof unit_id === 'number' ? unit_id : parseInt(unit_id, 10)
    if (isNaN(parsedUnitId)) {
      return jsonError('Valid unit_id is required', 400)
    }

    const parsedOrder = typeof display_order === 'number' ? display_order : parseInt(display_order, 10) || 0

    const db = await getDbClient(request)

    // Verify parent unit exists
    const { data: unit, error: unitError } = await db
      .from('units')
      .select('id')
      .eq('id', parsedUnitId)
      .maybeSingle()

    if (unitError) {
      console.error('Error verifying unit:', unitError)
    }

    if (!unit && !unitError) {
      return jsonError('Unit not found', 404)
    }

    const insertPayload = {
      title: title.trim(),
      description: description || null,
      thumbnail_url: thumbnail_url || null,
      drive_url: drive_url.trim(),
      unit_id: parsedUnitId,
      display_order: parsedOrder,
      created_at: new Date().toISOString(),
    }

    const { data: lesson, error } = await db
      .from('lessons')
      .insert(insertPayload)
      .select()
      .maybeSingle()

    if (error) {
      console.error('Error creating lesson in Supabase:', error)
      return jsonError(error.message || 'Failed to create lesson in database', 500)
    }

    return NextResponse.json(lesson || insertPayload, { status: 200 })
  } catch (err) {
    console.error('Unexpected error creating lesson:', err)
    return jsonError('Invalid request body or server error', 400)
  }
}

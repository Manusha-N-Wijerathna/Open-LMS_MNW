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
    const { unit_id, lessons } = body

    const parsedUnitId = typeof unit_id === 'number' ? unit_id : parseInt(unit_id, 10)
    if (isNaN(parsedUnitId) || parsedUnitId <= 0) {
      return jsonError('Valid unit_id is required', 400)
    }

    if (!Array.isArray(lessons) || lessons.length === 0) {
      return jsonError('A non-empty list of lessons is required', 400)
    }

    const db = await getDbClient(request)

    // Verify parent unit exists
    const { data: unit, error: unitError } = await db
      .from('units')
      .select('id, name')
      .eq('id', parsedUnitId)
      .maybeSingle()

    if (unitError || !unit) {
      return jsonError('Target Unit not found', 404)
    }

    // Get current maximum display_order in this unit to auto-assign sequential orders if needed
    const { data: existingLessons } = await db
      .from('lessons')
      .select('display_order')
      .eq('unit_id', parsedUnitId)
      .order('display_order', { ascending: false })
      .limit(1)

    let currentMaxOrder = (existingLessons && existingLessons.length > 0 && typeof existingLessons[0].display_order === 'number')
      ? existingLessons[0].display_order
      : -1

    const nowIso = new Date().toISOString()
    const validPayloads: Array<{
      title: string
      description: string | null
      thumbnail_url: string | null
      drive_url: string
      unit_id: number
      display_order: number
      created_at: string
    }> = []

    const errors: Array<{ index: number; reason: string }> = []

    lessons.forEach((item, idx) => {
      const title = (item.title || item.name || '').trim()
      const driveUrl = (item.drive_url || item.url || item.link || '').trim()
      const description = (item.description || item.desc || '').trim()
      const thumbnailUrl = (item.thumbnail_url || item.thumbnail || '').trim()

      if (!title) {
        errors.push({ index: idx + 1, reason: 'Title is empty' })
        return
      }
      if (!driveUrl) {
        errors.push({ index: idx + 1, reason: `Lesson "${title}" is missing Drive URL` })
        return
      }

      let order: number
      if (item.display_order !== undefined && item.display_order !== null && item.display_order !== '') {
        const parsed = parseInt(String(item.display_order), 10)
        order = isNaN(parsed) ? ++currentMaxOrder : parsed
      } else {
        order = ++currentMaxOrder
      }

      validPayloads.push({
        title,
        description: description || null,
        thumbnail_url: thumbnailUrl || null,
        drive_url: driveUrl,
        unit_id: parsedUnitId,
        display_order: order,
        created_at: nowIso,
      })
    })

    if (validPayloads.length === 0) {
      return jsonError(
        errors.length > 0
          ? `No valid lessons found: ${errors.map(e => `Row ${e.index}: ${e.reason}`).join('; ')}`
          : 'No valid lessons provided in CSV',
        400
      )
    }

    // Batch insert into Supabase
    const { data: insertedLessons, error: insertError } = await db
      .from('lessons')
      .insert(validPayloads)
      .select()

    if (insertError) {
      console.error('Error in bulk lesson insert:', insertError)
      return jsonError(insertError.message || 'Failed to bulk insert lessons', 500)
    }

    return NextResponse.json({
      success: true,
      count: insertedLessons ? insertedLessons.length : validPayloads.length,
      unit_id: parsedUnitId,
      unit_name: unit.name,
      skipped: errors,
      lessons: insertedLessons || validPayloads,
    }, { status: 201 })
  } catch (err) {
    console.error('Unexpected error in bulk lessons API:', err)
    return jsonError('Internal server error during bulk upload', 500)
  }
}

